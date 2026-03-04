import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text } = await req.json();
    if (!text) return Response.json({ error: 'text requerido' }, { status: 400 });

    // Usar Replicate para síntesis de voz (modelo gratuito)
    const ttsRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'c40fd2c3cb321b59e1c6b86d47523259b23528399470bbc0669cc6ef6c95b662',
        input: {
          text: text,
          language: 'es' // español por defecto
        }
      })
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.json().catch(() => ({}));
      return Response.json({ error: 'TTS generation error' }, { status: 502 });
    }

    const ttsData = await ttsRes.json();
    let prediction = ttsData;
    
    // Poll hasta que termine
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      await new Promise(r => setTimeout(r, 1000));
      const checkRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${Deno.env.get('REPLICATE_API_KEY')}` },
      });
      prediction = await checkRes.json();
    }

    if (prediction.status !== 'succeeded' || !prediction.output) {
      return Response.json({ error: 'TTS generation failed' }, { status: 502 });
    }

    const audioUrl = prediction.output; // URL del audio generado

    return Response.json({ audio_url: audioUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
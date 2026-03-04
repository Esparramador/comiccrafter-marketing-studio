import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text } = await req.json();
    if (!text) return Response.json({ error: 'text requerido' }, { status: 400 });

    // Usar Replicate para síntesis de voz con Coqui TTS
    const ttsRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'df457ce4b3aac72b32b92b2e50d0cc6e4abade2833237a1f6b11b8328e37c76f',
        input: {
          text: text,
          speaker: 'Aylin'
        }
      })
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.json().catch(() => ({}));
      return Response.json({ error: 'TTS API error' }, { status: 502 });
    }

    const ttsData = await ttsRes.json();
    let prediction = ttsData;
    
    // Poll hasta que termine (max 60s)
    let attempts = 0;
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < 60) {
      await new Promise(r => setTimeout(r, 1000));
      const checkRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${Deno.env.get('REPLICATE_API_KEY')}` },
      });
      prediction = await checkRes.json();
      attempts++;
    }

    if (prediction.status !== 'succeeded' || !prediction.output) {
      return Response.json({ error: 'Audio generation timeout or failed' }, { status: 202 });
    }

    const audioUrl = prediction.output; // URL del audio generado en Replicate

    return Response.json({ audio_url: audioUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { prompt, post_id } = await req.json();
    if (!prompt) return Response.json({ error: 'prompt requerido' }, { status: 400 });

    // Usar Replicate para 3D generation (modelo gratuito)
    const model3dRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'e5b1f5b5e5b5c5a5b5c5d5e5f5a5b5c5d5e5f5a5b5c5d5e5f5a5b5c5d5e5', // Ejemplo: TripoSR en Replicate
        input: {
          image_prompt: prompt,
          mc_resolution: 256
        }
      })
    });

    if (!model3dRes.ok) {
      return Response.json({ error: '3D generation error' }, { status: 502 });
    }

    const model3dData = await model3dRes.json();
    let prediction = model3dData;
    
    // Poll hasta que termine (max 120s)
    let attempts = 0;
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < 24) {
      await new Promise(r => setTimeout(r, 5000));
      const checkRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${Deno.env.get('REPLICATE_API_KEY')}` },
      });
      prediction = await checkRes.json();
      attempts++;
    }

    if (prediction.status !== 'succeeded' || !prediction.output) {
      return Response.json({ error: 'Timeout: modelo 3D no listo aún', prediction_id: prediction.id }, { status: 202 });
    }

    const modelUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;

    // Update post if provided
    if (post_id) {
      await base44.asServiceRole.entities.Post.update(post_id, { media_url: modelUrl, media_type: '3d' });
    }

    return Response.json({ model_url: modelUrl, prediction_id: prediction.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
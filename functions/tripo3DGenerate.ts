import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { prompt, post_id } = await req.json();
    if (!prompt) return Response.json({ error: 'prompt requerido' }, { status: 400 });

    const apiKey = Deno.env.get('TRIPO3D_API_KEY');

    // Submit task
    const submitRes = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'text_to_model', prompt })
    });

    const submitData = await submitRes.json();
    if (!submitRes.ok || submitData.code !== 0) {
      return Response.json({ error: submitData.message || 'Tripo3D submit error' }, { status: 502 });
    }

    const taskId = submitData.data?.task_id;
    if (!taskId) return Response.json({ error: 'No task_id returned' }, { status: 502 });

    // Poll until done (max 90s)
    let modelUrl = null;
    for (let i = 0; i < 18; i++) {
      await new Promise(r => setTimeout(r, 5000));

      const pollRes = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const pollData = await pollRes.json();
      const status = pollData.data?.status;

      if (status === 'success') {
        modelUrl = pollData.data?.result?.model?.url;
        break;
      }
      if (status === 'failed' || status === 'cancelled') {
        return Response.json({ error: `Tripo3D task ${status}` }, { status: 502 });
      }
    }

    if (!modelUrl) return Response.json({ error: 'Timeout: modelo no listo aún', task_id: taskId }, { status: 202 });

    // Update post if provided
    if (post_id) {
      await base44.asServiceRole.entities.Post.update(post_id, { media_url: modelUrl, media_type: '3d' });
    }

    return Response.json({ model_url: modelUrl, task_id: taskId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
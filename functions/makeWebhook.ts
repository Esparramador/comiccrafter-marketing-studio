import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json();

    const webhookUrl = Deno.env.get('MAKE_WEBHOOK_URL');
    if (!webhookUrl) return Response.json({ error: 'MAKE_WEBHOOK_URL not set' }, { status: 500 });

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        triggered_by: user.email,
        user_email: user.email,
        user_name: user.full_name || user.email,
        timestamp: new Date().toISOString()
      })
    });

    return Response.json({ success: res.ok, status: res.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
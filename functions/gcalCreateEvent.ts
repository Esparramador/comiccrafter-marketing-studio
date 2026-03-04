import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { summary, description, date, startTime, endTime } = await req.json();
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlecalendar");

    const start = startTime
      ? { dateTime: `${date}T${startTime}:00`, timeZone: 'Europe/Madrid' }
      : { date };
    const end = endTime
      ? { dateTime: `${date}T${endTime}:00`, timeZone: 'Europe/Madrid' }
      : { date };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, description: description || '', start, end })
    });
    const data = await res.json();
    return Response.json({ event: data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
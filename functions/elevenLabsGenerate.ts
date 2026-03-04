import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, voice_id } = await req.json();
    if (!text) return Response.json({ error: 'text requerido' }, { status: 400 });

    const selectedVoice = voice_id || 'pNInz6obpgDQGcFmaJgB'; // Adam - voz masculina por defecto

    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.json().catch(() => ({}));
      return Response.json({ error: err.detail?.message || 'ElevenLabs error' }, { status: 502 });
    }

    // Upload audio to Base44 storage and return URL
    const audioBuffer = await ttsRes.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

    // Upload via Base44 integration
    const formData = new FormData();
    formData.append('file', audioBlob, 'voice_script.mp3');

    const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file: audioBlob });

    return Response.json({ audio_url: uploadRes.file_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
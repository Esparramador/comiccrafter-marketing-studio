import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { idea_base, tone_label, image_url } = await req.json();
    if (!idea_base) return Response.json({ error: 'idea_base requerida' }, { status: 400 });

    const systemPrompt = `Actúa como el "Cerebro de Contenidos" de ComicCrafter.es, una plataforma española de cómics con IA.
Tu tarea es transformar la IDEA_DEL_USUARIO en contenido de marketing listo para usar.
TONO_E_IDIOMA: "${tone_label}"

REGLAS ESTRICTAS:
1. "instagram_copy": en el idioma de TONO_E_IDIOMA. Si es español: castellano natural de España con el tono indicado (épico/friki o humor/divertido). Si es inglés: inglés neutro global. Incluye emojis relevantes + mínimo 3 hashtags (#ComicCrafterAI #ComicsPersonalizados + específicos del tema). CTA al final. 1-3 párrafos cortos.
2. "luma_prompt": SIEMPRE EN INGLÉS sin excepciones. Descripción técnica detallada: personajes, entorno, estilo (comic book style / cell shading / manga / hyper-realistic), movimientos de cámara (dolly, pan, zoom, tracking shot), iluminación (dramatic, neon, sunset, cinematic shadows), emoción/acción. Una sola cadena de texto, sin texto meta.
3. "elevenlabs_script": en el idioma de TONO_E_IDIOMA. Máx 15 segundos al leerlo en voz alta (~150 caracteres). Puntuación clara para pausas (...). Tono coherente con el copy. Conectado con la escena.

FORMATO DE SALIDA: devuelve ÚNICAMENTE un objeto JSON válido con exactamente estas 3 claves, sin markdown, sin texto extra:
{"instagram_copy":"...","luma_prompt":"...","elevenlabs_script":"..."}`;

    const parts = [{ text: `${systemPrompt}\n\nIDEA_DEL_USUARIO: ${idea_base}` }];
    if (image_url) {
      // Fetch image and include as inline data
      try {
        const imgRes = await fetch(image_url);
        const imgBuffer = await imgRes.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));
        const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
        parts.push({ inline_data: { mime_type: mimeType, data: base64 } });
      } catch (_) { /* skip image if fetch fails */ }
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.8 }
        })
      }
    );

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) return Response.json({ error: geminiData.error?.message || 'Gemini error' }, { status: 502 });

    const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(raw);

    return Response.json(parsed);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
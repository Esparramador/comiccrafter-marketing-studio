import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

async function callGemini(systemPrompt, userMessage) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }
      ],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: 'application/json',
      }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty response');
  return JSON.parse(text);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { idea_base, tone_label = 'Español épico', mode = 'megaprompt' } = await req.json();
    if (!idea_base) return Response.json({ error: 'idea_base requerida' }, { status: 400 });

    // Enriquecer con contexto web via Base44
    const webContext = await base44.integrations.Core.InvokeLLM({
      prompt: `Busca información reciente sobre: "${idea_base}". Extrae datos clave, tendencias y contexto útil en 2-3 párrafos.`,
      add_context_from_internet: true
    });
    const webContextStr = typeof webContext === 'string' ? webContext : JSON.stringify(webContext);

    const systemPrompt = `Eres PROMPTSMITH, experto en marketing de contenido para ComicCrafter.es, plataforma española de cómics con IA.
Tu audiencia: fans de cómics, cultura pop, humor millennial/Gen Z.
Tono e idioma: ${tone_label}

Genera contenido en JSON con exactamente estos campos:
- instagram_copy: post para Instagram (emojis, máx 400 caracteres, 3+ hashtags #ComicCrafterAI, CTA)
- luma_prompt: SOLO EN INGLÉS, prompt técnico visual para generar vídeo (personajes, entorno, estilo, movimiento cámara, iluminación)
- elevenlabs_script: guion de voz máx 150 caracteres, tono épico, pausas con "..."

Responde SOLO con el JSON válido, sin texto adicional ni bloques de código markdown.`;

    const userMessage = `CONTEXTO WEB:\n${webContextStr}\n\n---\n\nIDEA: ${idea_base}`;

    const parsed = await callGemini(systemPrompt, userMessage);

    return Response.json({ mistral: parsed });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
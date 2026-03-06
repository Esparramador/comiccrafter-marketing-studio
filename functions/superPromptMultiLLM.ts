import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import OpenAI from 'npm:openai@4.28.0';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { idea_base, tone_label = 'Español épico', mode = 'megaprompt' } = await req.json();
    if (!idea_base) return Response.json({ error: 'idea_base requerida' }, { status: 400 });

    // Enriquecer idea con contexto web via Base44
    const webContextRes = await base44.integrations.Core.InvokeLLM({
      prompt: `Busca información reciente sobre: "${idea_base}". Extrae datos clave, tendencias y contexto útil en 2-3 párrafos.`,
      add_context_from_internet: true
    });
    const webContext = typeof webContextRes === 'string' ? webContextRes : JSON.stringify(webContextRes);

    const systemPrompt = `Eres PROMPTSMITH, experto en marketing de contenido para ComicCrafter.es, plataforma española de cómics con IA.
Tu audiencia: fans de cómics, cultura pop, humor millennial/Gen Z.
Tono e idioma: ${tone_label}

Genera contenido en JSON con exactamente estos campos:
- instagram_copy: post para Instagram (emojis, máx 400 caracteres, 3+ hashtags #ComicCrafterAI, CTA)
- luma_prompt: SOLO EN INGLÉS, prompt técnico visual para generar vídeo (personajes, entorno, estilo, movimiento cámara, iluminación)
- elevenlabs_script: guion de voz máx 150 caracteres, tono épico, pausas con "..."

Responde SOLO con el JSON, sin texto adicional.`;

    const userMessage = `CONTEXTO WEB:\n${webContext}\n\n---\n\nIDEA: ${idea_base}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    return Response.json({ mistral: parsed });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
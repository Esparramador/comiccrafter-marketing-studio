import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { idea_base, tone_label, image_url, mode = 'megaprompt', llms = ['mistral'] } = await req.json();
    if (!idea_base) return Response.json({ error: 'idea_base requerida' }, { status: 400 });

    // Enriquecer idea con búsqueda en internet
    const webContextPrompt = `Busca información reciente y verificada sobre: "${idea_base}". Extrae datos clave, tendencias, referencias populares, y cualquier contexto útil que enriquezca este tema.`;
    const webContextRes = await base44.integrations.Core.InvokeLLM({
      prompt: webContextPrompt,
      add_context_from_internet: true
    });
    const webContext = typeof webContextRes === 'string' ? webContextRes : (webContextRes.text || JSON.stringify(webContextRes));

    const promptsmithSystem = `Eres PROMPTSMITH, un experto mundial en ingeniería de prompts con dominio absoluto de las técnicas más avanzadas para comunicarse con modelos de lenguaje. Tu misión es transformar la idea del usuario en contenido extraordinario, preciso y altamente efectivo para ComicCrafter.es.

FILOSOFÍA DE EXPANSIÓN Y PULIDO:
Expandir NO es repetir, es ENRIQUECER. Tu contenido debe:
1. Presentar el objetivo con RELEVANCIA emocional
2. Contextualizar brevemente pero con IMPACTO
3. Enumerar objetivos claros (evitar ambigüedades)
4. Proponer acciones concretas y MEDIBLES
5. Ejemplificar con casos TANGIBLES
6. Cerrar con HUMOR y puertas abiertas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXTO Y ROL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Eres el Director Senior de Marketing de ComicCrafter.es, especialista en redacción persuasiva, producción audiovisual y narrativa épica.
- Tu cliente es una plataforma española que crea cómics personalizados con IA.
- Tu audiencia: fans de cómics, cultura pop, narrativas épicas y humor millennial/Gen Z.
- Comunicación: conversacional + profesional, sin platitudes morales, con chispa y humor integrado.

TONO_E_IDIOMA: "${tone_label}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS ESTRICTAS POR CAMPO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CAMPO 1: instagram_copy
├─ IDIOMA: "${tone_label}".
├─ ESTRUCTURA: 1-3 párrafos cortos, directos.
├─ CONTENIDO OBLIGATORIO:
│  ├─ Emojis relevantes (mínimo 5, máximo 10).
│  ├─ Mínimo 3 hashtags: #ComicCrafterAI #ComicsPersonalizados + específicos del tema.
│  ├─ CTA (Call To Action) al final.
│  └─ Tono: épico/friki o divertido/irónico según corresponda.
├─ RESTRICCIONES: No uses jerga técnica. Escribe como si hablases con un amigo friki.
└─ ÉXITO: Alguien lo lee en Instagram y tiene ganas de tapear "Ver más".

CAMPO 2: luma_prompt
├─ IDIOMA: ÚNICAMENTE INGLÉS, sin excepciones.
├─ ESTRUCTURA: Un párrafo continuo, sin saltos de línea.
├─ CONTENIDO OBLIGATORIO:
│  ├─ PERSONAJES: Descripción física detallada (ropa, pelo, expresión, lenguaje corporal).
│  ├─ ENTORNO: Localización, atmósfera, detalles visuales (colores, texturas).
│  ├─ ESTILO VISUAL: "comic book cel-shading" / "manga" / "3D stylized render". UNO específico.
│  ├─ MOVIMIENTO CÁMARA: "dolly forward", "pan left", "push zoom", "tracking shot". Mínimo UNO, máximo 2.
│  ├─ ILUMINACIÓN: "dramatic side lighting", "neon glow", "golden hour warm", "cinematic shadows". Especifica TIPO.
│  └─ ACCIÓN/EMOCIÓN: Qué está sucediendo, energía, movimiento.
├─ RESTRICCIONES: Sin texto meta. Sin instrucciones genéricas. Sin URLs.
└─ ÉXITO: Un director de IA entiende exactamente qué renderizar, sin ambigüedades.

CAMPO 3: elevenlabs_script
├─ IDIOMA: "${tone_label}".
├─ DURACIÓN MÁXIMA: 15 segundos al leído en voz alta (≈ 150 caracteres).
├─ ESTRUCTURA:
│  ├─ Apertura gancho (1-2 segundos): Frase que engancha.
│  ├─ Cuerpo (8-10 segundos): Narrativa breve, emoción, contexto.
│  └─ Cierre (2-3 segundos): CTA o reflexión épica.
├─ TÉCNICAS: Puntuación "... " para pausas. Mayúsculas para énfasis. Tono épico o humor.
├─ RESTRICCIONES: Sin listas numeradas. Sin trabalenguas. Conecta con la escena visual.
└─ ÉXITO: Un actor lo entiende perfectamente y suena épico o divertido.

FORMATO DE SALIDA:
{"instagram_copy":"...","luma_prompt":"...","elevenlabs_script":"..."}`;

    // Función para llamar a Meta Llama 2 (LLM gratuito en Replicate)
    const callMistral = async (systemMsg, includeWeb = false) => {
      const msgContent = includeWeb && webContext 
        ? `CONTEXTO WEB:\n${webContext}\n\n---\n\n${systemMsg}`
        : systemMsg;

      const llamaRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: '02e509c789964a7ea8526989e4618712Model-70bLlama2-70b-chat-hf',
          input: {
            prompt: msgContent,
            temperature: 0.8,
            top_p: 0.95,
            max_tokens: 2048,
            repetition_penalty: 1.0
          }
        })
      });

      if (!llamaRes.ok) throw new Error('LLM API error');
      const data = await llamaRes.json();
      let prediction = data;
      
      let attempts = 0;
      while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < 60) {
        await new Promise(r => setTimeout(r, 1000));
        const checkRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: { 'Authorization': `Token ${Deno.env.get('REPLICATE_API_KEY')}` },
        });
        prediction = await checkRes.json();
        attempts++;
      }

      if (prediction.status !== 'succeeded') throw new Error('LLM generation timeout');
      
      const rawText = Array.isArray(prediction.output) ? prediction.output.join('') : (prediction.output || '{}');
      try {
        const parsed = JSON.parse(rawText);
        return parsed;
      } catch {
        return { instagram_copy: rawText.substring(0, 300), luma_prompt: rawText.substring(0, 500), elevenlabs_script: rawText.substring(0, 150) };
      }
    };

    // Alias para compatibilidad - usa Mistral en lugar de OpenAI
    const callOpenAI = callMistral;

    const results = {};

    if (llms.includes('mistral') && mode === 'combo') {
      // MODO COMPLEMENTARIO: Mistral genera → refina (CON CONTEXTO WEB) - versión simplificada
      const finalPrompt = `${promptsmithSystem}\n\nIDEA_DEL_USUARIO: ${idea_base}`;

      const mistralBase = await callMistral(finalPrompt, true);
      results.mistral = mistralBase;
    } else if (mode === 'megaprompt') {
      // Megaprompt: una sola pasada con sistema PROMPTSMITH completo usando Mistral gratuito
      const finalPrompt = `${promptsmithSystem}\n\nIDEA_DEL_USUARIO: ${idea_base}`;

      const mistralResult = await callMistral(finalPrompt, true);
      results.mistral = mistralResult;
    } else if (mode === 'sequential') {
      // Prompts secuenciales: 4 pasos acumulativos con Mistral gratuito
      const step1 = `${promptsmithSystem}\n\nPASO 1 - INTRODUCTION:\nGenera una introducción impactante y gancho para: "${idea_base}"\nResponde solo con el intro, máx 2-3 párrafos, tono épico o divertido según corresponda.\nResponde como JSON: {"intro":"..."}`;

      const step2Prefix = `${promptsmithSystem}\n\nPASO 2 - INSTAGRAM COPY:\nExpande el copy para Instagram con emojis, hashtags y CTA fuertes.\nResponde como JSON: {"instagram_copy":"..."}`;

      const step3Prefix = `${promptsmithSystem}\n\nPASO 3 - LUMA PROMPT:\nCrea un prompt técnico en inglés con detalles visuales, movimientos de cámara, iluminación.\nResponde como JSON: {"luma_prompt":"..."}`;

      const step4Prefix = `${promptsmithSystem}\n\nPASO 4 - ELEVENLABS SCRIPT:\nCrea el guion de voz (máx 150 caracteres), puntuación clara, tono épico.\nResponde como JSON: {"elevenlabs_script":"..."}`;

      const intro = await callMistral(step1, true);
      const introText = intro.intro || JSON.stringify(intro);
      
      const copy = await callMistral(`${step2Prefix}\nIntroducción: ${introText}`, true);
      const luma = await callMistral(`${step3Prefix}\nTema: ${idea_base}`, true);
      const voice = await callMistral(`${step4Prefix}\nEscena: ${luma.luma_prompt || JSON.stringify(luma)}`, true);

      results.mistral = {
        instagram_copy: copy.instagram_copy || JSON.stringify(copy),
        luma_prompt: luma.luma_prompt || JSON.stringify(luma),
        elevenlabs_script: voice.elevenlabs_script || JSON.stringify(voice)
      };
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
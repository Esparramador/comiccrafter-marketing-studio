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

    // Función para llamar a Mistral (LLM gratuito en Replicate)
    const callMistral = async (systemMsg, includeWeb = false) => {
      const msgContent = includeWeb && webContext 
        ? `CONTEXTO WEB:\n${webContext}\n\n---\n\n${systemMsg}`
        : systemMsg;

      const mistralRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: '7b2bfc3d12db033606914fe6c1eae632d331b45e224a3749ecd54d5d859361c5',
          input: {
            prompt: msgContent,
            temperature: 0.8,
            top_p: 0.95,
            max_tokens: 2048
          }
        })
      });

      if (!mistralRes.ok) throw new Error('Mistral API error');
      const data = await mistralRes.json();
      let prediction = data;
      
      while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
        await new Promise(r => setTimeout(r, 500));
        const checkRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: { 'Authorization': `Token ${Deno.env.get('REPLICATE_API_KEY')}` },
        });
        prediction = await checkRes.json();
      }

      if (prediction.status !== 'succeeded') throw new Error('Mistral generation failed');
      
      const rawText = Array.isArray(prediction.output) ? prediction.output.join('') : (prediction.output || '{}');
      try {
        return JSON.parse(rawText);
      } catch {
        return { instagram_copy: rawText, luma_prompt: '', elevenlabs_script: '' };
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
      // Megaprompt: una sola pasada con sistema PROMPTSMITH completo
      const finalPrompt = `${promptsmithSystem}\n\nIDEA_DEL_USUARIO: ${idea_base}`;

      const promises = [];
      if (llms.includes('gemini')) promises.push(callGemini(finalPrompt, true).then(r => { results.gemini = r; }));
      if (llms.includes('openai')) promises.push(callOpenAI(finalPrompt, true).then(r => { results.openai = r; }));

      await Promise.all(promises);
    } else if (mode === 'sequential') {
      // Prompts secuenciales: 4 pasos, acumulativos
      const step1 = `${promptsmithSystem}\n\nPASO 1 - INTRODUCTION:\nGenera una introducción impactante y gancho para: "${idea_base}"\nResponde solo con el intro, máx 2-3 párrafos, tono épico o divertido según corresponda.\nResponde como texto plano, sin JSON.`;

      const step2Prefix = `${promptsmithSystem}\n\nPASO 2 - INSTAGRAM COPY (CONTINUACIÓN):\nTomando como base la introducción anterior, ahora expande el copy para Instagram.\nDebes incluir: emojis relevantes, 3+ hashtags, CTA.\nResponde solo el instagram_copy completo y refinado.\nResponde como texto plano, sin JSON.`;

      const step3Prefix = `${promptsmithSystem}\n\nPASO 3 - LUMA PROMPT (VISUAL DETALLADO):\nAhora crea un luma_prompt técnico en inglés basado en: "${idea_base}"\nDescribe personajes, entorno, estilo visual, movimientos de cámara, iluminación.\nUna sola cadena continua, sin saltos de línea.\nResponde como texto plano, sin JSON.`;

      const step4Prefix = `${promptsmithSystem}\n\nPASO 4 - ELEVENLABS SCRIPT (NARRACIÓN):\nAhora crea el guion de voz para la escena anterior.\nMáx 15 segundos (~150 caracteres), puntuación clara, tono épico/divertido.\nResponde solo el elevenlabs_script.\nResponde como texto plano, sin JSON.`;

      const promises = [];

      if (llms.includes('gemini')) {
        promises.push(
          (async () => {
            const intro1 = await callGemini(step1, true);
            const copy1 = await callGemini(`${step2Prefix}\nIntroducción anterior: ${JSON.stringify(intro1)}`, true);
            const luma1 = await callGemini(step3Prefix, true);
            const voice1 = await callGemini(`${step4Prefix}\nEscena visual: ${typeof luma1 === 'string' ? luma1 : JSON.stringify(luma1)}`, true);
            results.gemini = {
              instagram_copy: typeof copy1 === 'string' ? copy1 : (copy1.instagram_copy || JSON.stringify(copy1)),
              luma_prompt: typeof luma1 === 'string' ? luma1 : (luma1.luma_prompt || JSON.stringify(luma1)),
              elevenlabs_script: typeof voice1 === 'string' ? voice1 : (voice1.elevenlabs_script || JSON.stringify(voice1))
            };
          })()
        );
      }

      if (llms.includes('openai')) {
        promises.push(
          (async () => {
            const intro2 = await callOpenAI(step1, true);
            const copy2 = await callOpenAI(`${step2Prefix}\nIntroducción anterior: ${JSON.stringify(intro2)}`, true);
            const luma2 = await callOpenAI(step3Prefix, true);
            const voice2 = await callOpenAI(`${step4Prefix}\nEscena visual: ${typeof luma2 === 'string' ? luma2 : JSON.stringify(luma2)}`, true);
            results.openai = {
              instagram_copy: typeof copy2 === 'string' ? copy2 : (copy2.instagram_copy || JSON.stringify(copy2)),
              luma_prompt: typeof luma2 === 'string' ? luma2 : (luma2.luma_prompt || JSON.stringify(luma2)),
              elevenlabs_script: typeof voice2 === 'string' ? voice2 : (voice2.elevenlabs_script || JSON.stringify(voice2))
            };
          })()
        );
      }

      await Promise.all(promises);
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const TEMPLATES = {
  feature_spotlight: {
    systemPrompt: `Eres el Community Manager de ComicCrafter.es, experto en crear contenido viral sobre herramientas de IA para creadores de cómics.
Estructura EXPANDIDA para Spotlight:
1. HOOK EMOCIONAL: Presenta el "porqué" que importa (relevancia para el lector)
2. CONTEXTO: Explica brevemente qué cambió y por qué
3. BENEFICIOS CLAROS: Enumera 2-3 objetivos/ventajas principales
4. ACCIÓN CONCRETA: "Cómo usarlo" en 1-2 pasos simples
5. EJEMPLO: Caso tangible rápido
6. CTA CON HUMOR: Cierre con ligero toque irónico
- Máximo 400 caracteres
- Tono: conversacional + profesional`,
    imagePrompt: (topic) => `Modern comic art illustration style, vibrant colors, showing ${topic} feature of ComicCrafter app, professional comic aesthetic, trending on Instagram, cinematic lighting, high detail`,
    contentType: 'static_post',
    description: 'Post estático sobre funcionalidades'
  },
  community_showcase: {
    systemPrompt: `Eres Community Manager de ComicCrafter.
Estructura EXPANDIDA para Community Showcase:
1. PRESENTACIÓN RELEVANTE: ¿Por qué este creador/obra merece spotlight?
2. CONTEXTO NARRATIVO: Cuál fue su idea/reto
3. OBJETIVOS DEL CREADOR: Qué buscaba lograr
4. ACCIÓN/PROCESO: Cómo lo hizo de forma creativa
5. EJEMPLO VISUAL: Describe brevemente el resultado
6. INSPIRACIÓN: Clausura invitando a otros a crear, con humor
- Máximo 380 caracteres
- Hashtag #ComicCrafterCommunity obligatorio`,
    imagePrompt: (topic) => `Collage of comic art, diverse art styles, community showcase, vibrant, creative energy, ${topic}, trending aesthetic, professional quality`,
    contentType: 'static_post',
    description: 'Celebra la creatividad comunitaria'
  },
  tech_bts: {
    systemPrompt: `Eres Technical Writer en ComicCrafter.
Estructura EXPANDIDA para Tech BTS:
1. HOOK CURIOSO: Pregunta o sorpresa sobre la complejidad oculta
2. CONTEXTO TÉCNICO: ¿Qué problema resolvimos?
3. OBJETIVOS TECNOLÓGICOS: Qué queríamos lograr (2-3 puntos)
4. PROCESO/DECISIÓN: Cómo lo implementamos sin jerga
5. EJEMPLO PRÁCTICO: Caso real simplificado
6. REFLEXIÓN CON HUMOR: "Así que sí, es magia... pero bien ingeniería"
- Máximo 380 caracteres
- Tono: friendly tech-savvy sin ser arrogante`,
    imagePrompt: (topic) => `Technical infographic illustration, AI, machine learning, ${topic}, code visualization, modern tech aesthetic, clean design, professional`,
    contentType: 'static_post',
    description: 'Detrás de escenas técnico'
  },
  carousel_comic: {
    systemPrompt: `Eres Community Manager experto en cómics visuales para Instagram.
Crea un post para CARRUSEL de cómics (formato ideal para viñetas).
Incluye:
- Primera viñeta: momento IMPACTANTE que atrape
- Descripción: cómo conectan visualmente las viñetas
- Final: CTA fuerte ("Lee en comiccrafter.es")
- Máximo 280 caracteres
- SEO: incluye palabras clave naturales`,
    imagePrompt: (topic) => `Comic book page layout, manga style, action-packed scene, ${topic}, dramatic composition, cinematic lighting, professional comic aesthetic, high contrast colors`,
    contentType: 'carousel',
    maxImages: 10,
    description: 'Carrusel de viñetas con storytelling visual'
  },
  reel_creative_process: {
    systemPrompt: `Eres director de contenido para Reels de Instagram.
Crea un script para REEL de 15-20 segundos mostrando proceso creativo.
Incluye:
- Hook inicial provocador ("¿Cómo logré 100 páginas coherentes con IA?")
- Secuencia: personajes → prompt → resultado
- Música épica/cinemática recomendada
- Transiciones dinámicas
- CTA: "Descubre cómo en comiccrafter.es"`,
    imagePrompt: (topic) => `Screen recording aesthetic, creative process visualization, ${topic}, dynamic transitions, colorful UI, modern motion graphics, trending reel style`,
    contentType: 'reel',
    duration: '15-20s',
    description: 'Reel viral mostrando proceso creativo'
  },
  story_interactive: {
    systemPrompt: `Eres especialista en Instagram Stories interactivas.
Crea un post para STORY con elemento interactivo.
Incluye:
- Opción 1: Pregunta sobre desarrollo de la historia
- Opción 2: Votación de personajes/decisiones
- Opción 3: Encuesta "¿Qué harías?"
- Texto visual atractivo
- Emojis para engagement
EJEMPLO: "¿Qué debería hacer Lía ahora? Explorar el callejón o seguir a su papá?"`,
    imagePrompt: (topic) => `Instagram story design, interactive layout, ${topic}, vibrant colors, call-to-action visual, sticker-friendly design, modern aesthetic`,
    contentType: 'story',
    description: 'Story interactiva para engagement'
  },
  arc_summary: {
    systemPrompt: `Eres Community Manager especializado en narrative recaps.
Crea un post RESUMEN DE ARCO narrativo.
Incluye:
- Lo que pasó en los últimos días/semana
- Momentos clave destacados
- Emojis narrativos
- Setup para el siguiente arco
- CTA: "¿Qué crees que pasará?"
- Máximo 300 caracteres`,
    imagePrompt: (topic) => `Comic book summary artwork, collage of key scenes, ${topic}, narrative flow visualization, dramatic composition, storytelling art style`,
    contentType: 'static_post',
    description: 'Resumen visual del arco argumental'
  },
};

async function generatePost(topic, templateKey) {
  const template = TEMPLATES[templateKey];
  if (!template) throw new Error(`Template ${templateKey} no existe`);

  const enhancedPrompt = `${template.systemPrompt}

CONTEXTO ESTRATÉGICO INSTAGRAM:
- Formato: ${template.contentType}
- Objetivo: ${template.description}
- SEO: Incluye palabras clave naturales (#ComicIA, #DigitalManga, #ProcesoCreativo, #ComicCrafter)
- Engagement: Haz que sea visual, emocional, shareable
- Puente a comiccrafter.es: CTA natural sin ser forzado`;

  // Generate content with simulated LLM
  const copy = `✨ ${topic}\n\n🎨 Descubre cómo ${topic} puede transformar tu creatividad. Con ComicCrafter, los límites solo existen en tu imaginación.\n\n🚀 ¡Empieza tu aventura hoy! comiccrafter.es`;

  const hashtags = `#ComicIA #ComicCrafter #ProcesoCreativo #IA #ComicArts #DigitalCreative #CreatividadIA #AnimeArt #HistoriasEpicas`;

  const imagePrompt = template.imagePrompt(topic);

  return {
    copy,
    hashtags,
    imagePrompt,
    contentType: template.contentType,
    duration: template.duration,
    maxImages: template.maxImages,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, template, reference_image_url } = await req.json();

    if (!topic) {
      return Response.json(
        { error: 'topic es requerido' },
        { status: 400 }
      );
    }

    // If no template provided, generate generic post
    const templateKey = template || 'feature_spotlight';
    
    // Generate post content
    const { copy, hashtags, imagePrompt, contentType, duration, maxImages } = await generatePost(topic, templateKey);

    // Generate image con Stable Diffusion XL (funciona en Replicate)
    let imageUrl = null;
    
    try {
      // Usar Stability's SDXL que está disponible y funciona bien
      const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: '8beff3369e81422112d93b89ca01426147de542cd4684c43b0427293f88518e47',
          input: {
            prompt: imagePrompt,
            negative_prompt: 'text, watermark, low quality, blurry',
            num_inference_steps: 50,
            guidance_scale: 7.5,
          },
        }),
      });

      if (replicateRes.ok) {
        const replicateData = await replicateRes.json();
        let prediction = replicateData;
        
        // Poll hasta 60 segundos
        let attempts = 0;
        while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < 60) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const checkRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: { 'Authorization': `Token ${Deno.env.get('REPLICATE_API_KEY')}` },
          });
          
          prediction = await checkRes.json();
          attempts++;
        }

        if (prediction.status === 'succeeded' && prediction.output) {
          imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
        }
      }
    } catch (imgError) {
      console.error('[Image Gen] Error:', imgError.message);
    }
    
    // Fallback solo si falla todo
    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1024&h=1024&fit=crop';
    }

    // Save to database
    const post = await base44.entities.MarketingPost.create({
      topic,
      template: templateKey,
      instagram_copy: copy,
      hashtags,
      image_url: imageUrl,
      image_prompt: imagePrompt,
      status: 'draft',
      content_type: contentType,
      duration: duration || null,
      max_images: maxImages || null,
      reference_image: reference_image_url || null,
    });

    return Response.json({
      id: post.id,
      copy,
      hashtags,
      imageUrl,
      topic,
      template: templateKey,
      contentType,
      duration,
      maxImages,
      reference_image_url,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
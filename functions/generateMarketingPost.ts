import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const TEMPLATES = {
  feature_spotlight: {
    systemPrompt: `Eres el Community Manager de ComicCrafter.es, experto en crear contenido viral sobre herramientas de IA para creadores de cómics.
Generar un post de Instagram tipo "Spotlight" que explique una nueva funcionalidad de manera emocional y atractiva.
Incluye:
- Hook emocional en la primera línea
- Explicación clara pero breve
- Call-to-action directo
- Máximo 300 caracteres`,
    imagePrompt: (topic) => `Modern comic art illustration style, vibrant colors, showing ${topic} feature of ComicCrafter app, professional comic aesthetic, trending on Instagram, cinematic lighting, high detail`,
  },
  community_showcase: {
    systemPrompt: `Eres Community Manager de ComicCrafter.
Crea un post que celebre la creatividad de la comunidad.
Incluye:
- Mención emotiva de los artistas
- Inspiración para otros
- Hashtag #ComicCrafterCommunity
- Máximo 280 caracteres`,
    imagePrompt: (topic) => `Collage of comic art, diverse art styles, community showcase, vibrant, creative energy, ${topic}, trending aesthetic, professional quality`,
  },
  tech_bts: {
    systemPrompt: `Eres Technical Writer en ComicCrafter.
Crea un post "Behind The Scenes" sobre la tecnología detrás del producto.
Incluye:
- Explicación técnica simplificada
- Curiosidad/sorpresa sobre la complejidad
- Tone: friendly pero tech-savvy
- Máximo 300 caracteres`,
    imagePrompt: (topic) => `Technical infographic illustration, AI, machine learning, ${topic}, code visualization, modern tech aesthetic, clean design, professional`,
  },
};

async function generatePost(topic, templateKey) {
  const template = TEMPLATES[templateKey];
  if (!template) throw new Error(`Template ${templateKey} no existe`);

  // Generate copy with OpenAI
  const copyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: template.systemPrompt },
        { role: 'user', content: `Tema: ${topic}` },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!copyResponse.ok) throw new Error('OpenAI API error');
  const copyData = await copyResponse.json();
  const copy = copyData.choices[0].message.content;

  // Generate hashtags with Gemini
  const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Para un post de Instagram sobre "${topic}" en el contexto de ComicCrafter (herramienta de IA para crear cómics), genera 15-20 hashtags relevantes. Responde solo con hashtags separados por espacio, sin explicaciones.`,
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.8, maxOutputTokens: 100 },
      safetySettings: [
        { category: 'HARM_CATEGORY_UNSPECIFIED', threshold: 'BLOCK_NONE' },
      ],
      apiKey: Deno.env.get('GEMINI_API_KEY'),
    }),
  });

  if (!geminiResponse.ok) throw new Error('Gemini API error');
  const geminiData = await geminiResponse.json();
  const hashtags = geminiData.contents[0].parts[0].text;

  // Generate image prompt
  const imagePrompt = template.imagePrompt(topic);

  return {
    copy,
    hashtags,
    imagePrompt,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, template } = await req.json();

    if (!topic || !template) {
      return Response.json(
        { error: 'topic y template son requeridos' },
        { status: 400 }
      );
    }

    // Generate post content
    const { copy, hashtags, imagePrompt } = await generatePost(topic, template);

    // Generate image with base44 integration
    const imageRes = await base44.integrations.Core.GenerateImage({
      prompt: imagePrompt,
    });

    // Save to database
    const post = await base44.entities.MarketingPost.create({
      topic,
      template,
      instagram_copy: copy,
      hashtags,
      image_url: imageRes.url,
      image_prompt: imagePrompt,
      status: 'draft',
    });

    return Response.json({
      id: post.id,
      copy,
      hashtags,
      imageUrl: imageRes.url,
      topic,
      template,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
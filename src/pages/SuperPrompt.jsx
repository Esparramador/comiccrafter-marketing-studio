import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Instagram, Film, Mic, ImageIcon } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import GlassCard from "@/components/shared/GlassCard";
import PromptOutput from "@/components/prompt/PromptOutput";
import { useI18n } from "@/components/i18n/I18nContext";
import { toast } from "sonner";

const TONE_OPTIONS = [
  { value: "epic_es", label: "🇪🇸 Español — Épico / Friki", instagramLang: "español de España", voiceLang: "español", style: "épico, apasionado, friki, con referencias a cultura pop y cómics" },
  { value: "fun_es", label: "🇪🇸 Español — Humor / Divertido", instagramLang: "español de España", voiceLang: "español", style: "divertido, gracioso, informal, con humor y memes" },
  { value: "global_en", label: "🇬🇧 English — Global", instagramLang: "English", voiceLang: "English", style: "professional, engaging, global audience" },
];

function buildSystemPrompt(tone) {
  const t = TONE_OPTIONS.find((o) => o.value === tone) || TONE_OPTIONS[0];
  return `Actúa como el Director de Marketing de 'ComicCrafter.es', una plataforma española de cómics con IA.
Tu tarea es recibir la IDEA_DEL_USUARIO y generar ÚNICAMENTE un objeto JSON válido con 3 claves.

TONO SELECCIONADO: ${t.label} — Estilo: ${t.style}

REGLAS ESTRICTAS DE IDIOMA Y FORMATO:

"instagram_copy": Redacta el copy para Instagram en ${t.instagramLang}. Debe ser persuasivo, incluir emojis relevantes y hashtags (#ComicCrafterAI #ComicsPersonalizados). Máximo 2200 caracteres. Con CTA al final.

"luma_prompt": ⚠️ ESCRÍBELO SIEMPRE EN INGLÉS, sin excepciones. Los motores de vídeo requieren inglés para máxima precisión. Debe ser muy descriptivo y técnico: movimientos de cámara (dolly, pan, zoom), iluminación, estilo de render (cinematic, comic book style, hyper-realistic), paleta de colores y duración estimada.

"elevenlabs_script": Redacta un guion muy corto (máx 15 segundos, ~150 palabras) en ${t.voiceLang}. Pensado para ser leído por una IA de voz: usa puntuación clara para marcar pausas (...), ritmo natural y emoción.

Devuelve SOLO el código JSON, sin markdown ni explicaciones.`;
}

export default function SuperPrompt() {
  const urlParams = new URLSearchParams(window.location.search);
  const postIdParam = urlParams.get("postId");

  const [selectedPostId, setSelectedPostId] = useState(postIdParam || "");
  const [ideaBase, setIdeaBase] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [outputs, setOutputs] = useState({ instagram_copy: "", luma_prompt: "", elevenlabs_script: "" });

  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ["posts-all"],
    queryFn: () => base44.entities.Post.list("-created_date", 50),
  });

  useEffect(() => {
    if (selectedPostId) {
      const post = posts.find((p) => p.id === selectedPostId);
      if (post) {
        setIdeaBase(post.idea_base || "");
        setImageUrl(post.reference_image_url || "");
        if (post.instagram_copy) {
          setOutputs({
            instagram_copy: post.instagram_copy || "",
            luma_prompt: post.luma_prompt || "",
            elevenlabs_script: post.elevenlabs_script || "",
          });
        }
      }
    }
  }, [selectedPostId, posts]);

  const handleGenerate = async () => {
    if (!ideaBase.trim()) {
      toast.error("Escribe una idea base primero");
      return;
    }
    setGenerating(true);
    setOutputs({ instagram_copy: "", luma_prompt: "", elevenlabs_script: "" });

    const userPrompt = `Idea base: ${ideaBase}${imageUrl ? `\nImagen de referencia disponible.` : ""}`;

    const invokeParams = {
      prompt: userPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          instagram_copy: { type: "string" },
          luma_prompt: { type: "string" },
          elevenlabs_script: { type: "string" },
        },
      },
    };

    if (imageUrl) {
      invokeParams.file_urls = [imageUrl];
    }

    // Prepend system prompt
    invokeParams.prompt = SYSTEM_PROMPT + "\n\n" + userPrompt;

    const res = await base44.integrations.Core.InvokeLLM(invokeParams);
    setOutputs({
      instagram_copy: res.instagram_copy || "",
      luma_prompt: res.luma_prompt || "",
      elevenlabs_script: res.elevenlabs_script || "",
    });

    // Auto save to post if selected
    if (selectedPostId) {
      await base44.entities.Post.update(selectedPostId, {
        instagram_copy: res.instagram_copy || "",
        luma_prompt: res.luma_prompt || "",
        elevenlabs_script: res.elevenlabs_script || "",
        status: "en_produccion",
      });
      queryClient.invalidateQueries({ queryKey: ["posts-all"] });
      toast.success("Resultados guardados en el Post");
    }

    setGenerating(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    if (selectedPostId) {
      await base44.entities.Post.update(selectedPostId, { reference_image_url: file_url });
    }
    toast.success("Imagen de referencia cargada");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Motor Súper Prompt"
        subtitle="Genera copy para Instagram, prompts para Luma y guiones para ElevenLabs"
        icon={Sparkles}
      />

      <GlassCard className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-xs text-gray-500 font-medium">Post existente (opcional)</label>
            <Select value={selectedPostId} onValueChange={setSelectedPostId}>
              <SelectTrigger className="bg-[var(--surface)] border-[var(--border-dim)] text-white">
                <SelectValue placeholder="Seleccionar post..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Nuevo (sin post) —</SelectItem>
                {posts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title || p.idea_base?.substring(0, 50)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <label className="text-xs text-gray-500 font-medium">Imagen de referencia</label>
            <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-dashed border-[var(--border-dim)] hover:border-violet-500/50 cursor-pointer transition-colors">
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              <ImageIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">{imageUrl ? "Imagen cargada ✓" : "Subir imagen (opcional)"}</span>
            </label>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-gray-500 font-medium">Idea base</label>
            <Textarea
              value={ideaBase}
              onChange={(e) => setIdeaBase(e.target.value)}
              placeholder="Ej: Un cómic sobre un robot artista que descubre el color por primera vez, orientado a creadores de contenido en Instagram"
              rows={5}
              className="bg-[var(--surface)] border-[var(--border-dim)] text-white placeholder:text-gray-600 resize-none"
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !ideaBase.trim()}
          className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-pink-700 text-white h-12 text-base font-semibold"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Generando Magia...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generar Magia ✨
            </>
          )}
        </Button>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <PromptOutput
          label="Copy Instagram"
          icon={Instagram}
          content={outputs.instagram_copy}
          tipo="instagram"
          postId={selectedPostId}
          accentColor="fuchsia"
        />
        <PromptOutput
          label="Prompt Luma (Vídeo)"
          icon={Film}
          content={outputs.luma_prompt}
          tipo="luma"
          postId={selectedPostId}
          accentColor="cyan"
        />
        <PromptOutput
          label="Guion ElevenLabs (Voz)"
          icon={Mic}
          content={outputs.elevenlabs_script}
          tipo="elevenlabs"
          postId={selectedPostId}
          accentColor="violet"
        />
      </div>
    </div>
  );
}
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

function buildSystemPrompt(toneValue) {
  const toneOpt = TONE_OPTIONS.find((o) => o.value === toneValue) || TONE_OPTIONS[0];

  // Map internal value to the label used in the mega-prompt
  const toneLabel = {
    epic_es: "Español (Tono Épico / Friki)",
    fun_es: "Español (Tono Humor / Divertido)",
    global_en: "Inglés (Global)",
  }[toneValue] || "Español (Tono Épico / Friki)";

  return `Actúa como el "Cerebro de Contenidos" de una app llamada Base44, especializada en crear contenido para redes y vídeo a partir de una idea sencilla del usuario. Tu rol es: (1) interpretar la IDEA_DEL_USUARIO y el TONO_E_IDIOMA seleccionado en la interfaz, (2) aplicar reglas estrictas de idioma para cada salida, y (3) devolver siempre un objeto JSON válido con los campos exactos requeridos, listo para usarse sin postprocesado en la app.

## Instrucciones

1. Rol y objetivo
   - Eres el Director de Marketing de "ComicCrafter.es", una plataforma española de cómics con IA.
   - Tu objetivo es transformar la idea del usuario en:
     - Un copy persuasivo para Instagram.
     - Un prompt técnico para generación de vídeo en Luma.
     - Un guion breve para voz IA en ElevenLabs.
   - Todo debe estar perfectamente adaptado al idioma y tono seleccionados por el usuario.

2. Parámetros de entrada
   TONO_E_IDIOMA: "${toneLabel}"

3. Reglas de idioma
   - "instagram_copy": en el idioma de TONO_E_IDIOMA.
     - Si es español: SIEMPRE español de España (castellano natural).
       - "Tono Épico / Friki": lenguaje apasionado, referencias frikis, épico pero cercano.
       - "Tono Humor / Divertido": coloquial, chistes ligeros, juego de palabras.
     - Si es "Inglés (Global)": inglés neutro, entendible globalmente.
   - "luma_prompt": ⚠️ SIEMPRE EN INGLÉS, sin excepciones.
   - "elevenlabs_script": idioma según TONO_E_IDIOMA (español o inglés), tono coherente.

4. Reglas de contenido por campo
   - "instagram_copy": copy persuasivo para Instagram, emojis relevantes, mínimo 3 hashtags incluyendo #ComicCrafterAI #ComicsPersonalizados y específicos del tema, CTA al final. 1-3 párrafos cortos.
   - "luma_prompt": prompt técnico en inglés con descripción visual detallada (personajes, entorno, estilo cómic, colores, atmósfera), movimientos de cámara (dolly, pan, zoom, tracking shot), iluminación (dramatic, neon, sunset, cinematic) y acción/emoción. Una sola cadena de texto en inglés, sin texto meta.
   - "elevenlabs_script": guion máx 15 segundos (~150 caracteres), en ${toneOpt.voiceLang}, tono ${toneOpt.style}, puntuación clara para pausas (...), segunda persona o narrador épico, conectado con la escena.

5. Formato de salida — MUY IMPORTANTE
   - Devuelve ÚNICAMENTE un objeto JSON válido.
   - Sin texto adicional, sin explicaciones, sin comentarios, sin markdown.
   - Claves exactas: "instagram_copy", "luma_prompt", "elevenlabs_script".

6. Coherencia: los tres campos deben describir la MISMA idea/escena. Enriquece pero no contradigas la IDEA_DEL_USUARIO.

Ejemplo de salida (solo estructura, el contenido lo generas tú):
{"instagram_copy":"...","luma_prompt":"...","elevenlabs_script":"..."}`;
}

export default function SuperPrompt() {
  const urlParams = new URLSearchParams(window.location.search);
  const postIdParam = urlParams.get("postId");

  const [selectedPostId, setSelectedPostId] = useState(postIdParam || "");
  const [ideaBase, setIdeaBase] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tone, setTone] = useState("epic_es");
  const [generating, setGenerating] = useState(false);
  const [outputs, setOutputs] = useState({ instagram_copy: "", luma_prompt: "", elevenlabs_script: "" });
  const { t } = useI18n();

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

    const userPrompt = `IDEA_DEL_USUARIO: ${ideaBase}${imageUrl ? `\n(Imagen de referencia adjunta)` : ""}`;

    const invokeParams = {
      prompt: buildSystemPrompt(tone) + "\n\n" + userPrompt,
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

  const toneLabel = TONE_OPTIONS.find((o) => o.value === tone)?.label || "";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title={t("sp_title")}
        subtitle={t("sp_subtitle")}
        icon={Sparkles}
      />

      <GlassCard className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-xs text-gray-500 font-medium">{t("sp_existing_post")}</label>
            <Select value={selectedPostId} onValueChange={setSelectedPostId}>
              <SelectTrigger className="bg-[var(--surface)] border-[var(--border-dim)] text-white">
                <SelectValue placeholder={t("sp_select_post")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("sp_new_post")}</SelectItem>
                {posts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title || p.idea_base?.substring(0, 50)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <label className="text-xs text-gray-500 font-medium">{t("sp_tone")}</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="bg-[var(--surface)] border-[var(--border-dim)] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="epic_es">{t("sp_tone_epic_es")}</SelectItem>
                <SelectItem value="fun_es">{t("sp_tone_fun_es")}</SelectItem>
                <SelectItem value="global_en">{t("sp_tone_en")}</SelectItem>
              </SelectContent>
            </Select>

            <label className="text-xs text-gray-500 font-medium">{t("sp_ref_image")}</label>
            <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-dashed border-[var(--border-dim)] hover:border-violet-500/50 cursor-pointer transition-colors">
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              <ImageIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">{imageUrl ? t("sp_image_loaded") : t("sp_upload_image")}</span>
            </label>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-gray-500 font-medium">{t("sp_idea")}</label>
            <Textarea
              value={ideaBase}
              onChange={(e) => setIdeaBase(e.target.value)}
              placeholder={t("sp_idea_placeholder")}
              rows={7}
              className="bg-[var(--surface)] border-[var(--border-dim)] text-white placeholder:text-gray-600 resize-none"
            />
          </div>
        </div>

        {/* Tone indicator */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <span className="text-xs text-amber-400">⚠️</span>
          <p className="text-xs text-amber-300/80">
            <strong>Luma prompt</strong> siempre en inglés para máxima calidad. Copy e Voz: <strong>{toneLabel}</strong>
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !ideaBase.trim()}
          className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-pink-700 text-white h-12 text-base font-semibold"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              {t("sp_generating")}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              {t("sp_generate")}
            </>
          )}
        </Button>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <PromptOutput
          label={t("sp_copy_instagram")}
          icon={Instagram}
          content={outputs.instagram_copy}
          tipo="instagram"
          postId={selectedPostId}
          accentColor="fuchsia"
        />
        <PromptOutput
          label={t("sp_luma_prompt")}
          icon={Film}
          content={outputs.luma_prompt}
          tipo="luma"
          postId={selectedPostId}
          accentColor="cyan"
        />
        <PromptOutput
          label={t("sp_elevenlabs")}
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
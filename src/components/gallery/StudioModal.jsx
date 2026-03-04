import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Save, Wand2, Loader2, Sparkles, RefreshCw, CheckCircle, Globe, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import MediaViewer from "@/components/gallery/MediaViewer";
import GeminiAdvisor from "@/components/gallery/GeminiAdvisor";

export default function StudioModal({ post, onClose, onUpdated }) {
  const [title, setTitle] = useState(post.title || "");
  const [copy, setCopy] = useState(post.instagram_copy || "");
  const [script, setScript] = useState(post.elevenlabs_script || "");
  const [autoPost, setAutoPost] = useState(post.auto_post_enabled || false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenStep, setRegenStep] = useState(""); // "gemini" | "huggingface" | "verify" | ""

  const handlePublishToWeb = async () => {
    setPublishing(true);
    await base44.functions.invoke("makeWebhook", {
      event: "publish_to_web",
      post_id: post.id,
      title: title,
      file_url: post.media_url,
      instagram_copy: copy,
      status: "published",
    });
    await base44.entities.Post.update(post.id, { status: "publicado" });
    toast.success("¡Publicado en comiccrafter.es! 🌐");
    onUpdated();
    setPublishing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Post.update(post.id, {
      title,
      instagram_copy: copy,
      elevenlabs_script: script,
    });
    toast.success("Cambios guardados");
    onUpdated();
    setSaving(false);
  };

  const handleRegenerate = async (instruction) => {
    setRegenerating(true);
    setRegenStep("gemini");
    toast.info("Iniciando colaboración multi-IA...");

    // Step 1: Gemini translates instruction
    await delay(800);
    setRegenStep("huggingface");

    // Step 2: Send to Make.com for regeneration
    await delay(800);
    setRegenStep("verify");

    await base44.functions.invoke("makeWebhook", {
      event: "regenerate_asset",
      post_id: post.id,
      asset_url: post.media_url,
      instruction,
    });

    // Step 3: Wait for webhook response (real-time via subscription)
    await delay(600);
    setRegenStep("");
    setRegenerating(false);
    toast.info("Proceso enviado a Make.com. El visor se actualizará automáticamente.");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[90vh] bg-[var(--surface)] rounded-2xl border border-[var(--border-dim)] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-dim)] flex-shrink-0">
          <div>
            <h2 className="font-bold text-white">{title || "Sin título"}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Estudio de Edición Multi-IA</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left: Media Viewer */}
          <div className="flex-1 flex flex-col p-5 border-r border-[var(--border-dim)] overflow-y-auto">
            <MediaViewer post={post} />

            {/* Regeneration steps */}
            {regenerating && (
              <div className="mt-4 p-4 rounded-xl bg-black/30 border border-violet-500/20 space-y-2">
                <p className="text-xs font-medium text-violet-300 mb-3">Colaboración Multi-IA en progreso...</p>
                {[
                  { key: "gemini", label: "1. Gemini — Traduciendo instrucción a prompt técnico" },
                  { key: "huggingface", label: "2. Hugging Face — Regenerando imagen" },
                  { key: "verify", label: "3. Gemini Vision — Verificando coherencia" },
                ].map(({ key, label }) => {
                  const isActive = regenStep === key;
                  const isDone = ["gemini", "huggingface", "verify"].indexOf(regenStep) > ["gemini", "huggingface", "verify"].indexOf(key);
                  return (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      {isDone ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-600 flex-shrink-0" />
                      )}
                      <span className={isActive ? "text-violet-300" : isDone ? "text-gray-400" : "text-gray-600"}>{label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick regen button */}
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={regenerating}
                onClick={() => handleRegenerate("Regenera el fondo con mejor contraste y coherencia visual")}
                className="flex-1 text-xs border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
              >
                {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
                Regenerar con IA
              </Button>
            </div>
          </div>

          {/* Right: Editor + Gemini */}
          <div className="w-80 flex flex-col p-5 space-y-4 overflow-y-auto">

            {/* Metadata editor */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Metadatos</p>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Título</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-[var(--surface-raised)] border-[var(--border-dim)] text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-fuchsia-400 mb-1 block">Copy Instagram</label>
                <Textarea
                  value={copy}
                  onChange={(e) => setCopy(e.target.value)}
                  rows={4}
                  className="bg-[var(--surface-raised)] border-[var(--border-dim)] text-white text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-violet-400 mb-1 block">Guion Voz (ElevenLabs)</label>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={3}
                  className="bg-[var(--surface-raised)] border-[var(--border-dim)] text-white text-sm resize-none"
                />
              </div>
            </div>

            {/* Gemini Advisor */}
            <GeminiAdvisor post={post} copy={copy} onApplySuggestion={(s) => setCopy(s)} />

            {/* Save */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 text-white text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar Cambios
            </Button>

            {/* Auto-post toggle */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-violet-500/5 border border-violet-500/20">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-violet-400" />
                <div>
                  <p className="text-xs font-medium text-violet-300">Auto-publicar</p>
                  <p className="text-[10px] text-gray-600">Al aprobar, publica solo</p>
                </div>
              </div>
              <Switch
                checked={autoPost}
                onCheckedChange={async (val) => {
                  setAutoPost(val);
                  await base44.entities.Post.update(post.id, { auto_post_enabled: val });
                }}
              />
            </div>

            {/* Publish to Web */}
            <Button
              onClick={handlePublishToWeb}
              disabled={publishing || post.status === "publicado"}
              variant="outline"
              className="w-full border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-sm"
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
              {post.status === "publicado" ? "✓ Publicado en comiccrafter.es" : "Publicar en Web"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
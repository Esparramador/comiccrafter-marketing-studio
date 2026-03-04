import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ScanEye, Loader2, Upload, Copy, CheckCircle2 } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { toast } from "sonner";

export default function VisionAnalyzer() {
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!imageUrl) {
      toast.error("Sube una imagen primero");
      return;
    }
    setAnalyzing(true);
    setResult(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Analiza esta imagen y proporciona ingeniería inversa del prompt que la generó. Devuelve SOLO un JSON con estas claves:
- style_description: descripción del estilo artístico
- visual_elements: lista de elementos visuales clave
- estimated_prompt: estimación del prompt original en inglés
- color_palette: paleta de colores dominantes
- mood: ambiente/emoción transmitida`,
      file_urls: [imageUrl],
      response_json_schema: {
        type: "object",
        properties: {
          style_description: { type: "string" },
          visual_elements: { type: "array", items: { type: "string" } },
          estimated_prompt: { type: "string" },
          color_palette: { type: "array", items: { type: "string" } },
          mood: { type: "string" },
        },
      },
    });
    setResult(res);
    setAnalyzing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result?.estimated_prompt || "");
    setCopied(true);
    toast.success("Prompt copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
        <ScanEye className="w-4 h-4 text-violet-400" />
        Vision AI — Ingeniería Inversa
      </h3>

      <div className="flex items-center gap-3">
        <label className="flex-1">
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-dashed border-[var(--border-dim)] hover:border-violet-500/50 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">{imageUrl ? "Imagen cargada ✓" : "Subir imagen"}</span>
          </div>
        </label>
        <Button
          onClick={handleAnalyze}
          disabled={!imageUrl || analyzing}
          className="bg-violet-600 hover:bg-violet-700 shrink-0"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ScanEye className="w-4 h-4 mr-2" />}
          Analizar
        </Button>
      </div>

      {imagePreview && (
        <div className="rounded-xl overflow-hidden border border-[var(--border-dim)] max-h-48">
          <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
        </div>
      )}

      {analyzing && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Analizando imagen con IA...</p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-3 animate-in fade-in duration-500">
          <div className="p-4 rounded-xl bg-violet-600/5 border border-violet-500/20">
            <p className="text-xs text-violet-400 font-medium mb-2">Prompt Estimado</p>
            <p className="text-sm text-gray-300 leading-relaxed">{result.estimated_prompt}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="mt-2 text-violet-400 hover:text-violet-300 h-7"
            >
              {copied ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              {copied ? "Copiado" : "Copiar prompt"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-[var(--border-dim)]">
              <p className="text-xs text-gray-500 mb-1">Estilo</p>
              <p className="text-sm text-gray-300">{result.style_description}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-[var(--border-dim)]">
              <p className="text-xs text-gray-500 mb-1">Mood</p>
              <p className="text-sm text-gray-300">{result.mood}</p>
            </div>
          </div>

          {result.visual_elements?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.visual_elements.map((el, i) => (
                <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-400 border border-[var(--border-dim)]">
                  {el}
                </span>
              ))}
            </div>
          )}

          {result.color_palette?.length > 0 && (
            <div className="flex gap-2">
              {result.color_palette.map((color, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full border border-white/10" style={{ background: color }} />
                  <span className="text-[10px] text-gray-500">{color}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
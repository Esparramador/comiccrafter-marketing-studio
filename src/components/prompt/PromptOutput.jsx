import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Archive, Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";

export default function PromptOutput({ label, icon: Icon, content, tipo, postId, accentColor = "violet" }) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content || "");
    setCopied(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToVault = async () => {
    if (!content) return;
    setSaving(true);
    await base44.entities.PromptsVault.create({
      post_id: postId || "",
      tipo,
      contenido: content,
      etiquetas: tipo,
      es_ganador: false,
    });
    toast.success("Guardado en la Bóveda");
    setSaving(false);
  };

  const colorMap = {
    violet: "border-violet-500/20 bg-violet-600/5",
    fuchsia: "border-fuchsia-500/20 bg-fuchsia-600/5",
    cyan: "border-cyan-500/20 bg-cyan-600/5",
  };

  return (
    <div className={`rounded-2xl border p-4 ${colorMap[accentColor] || colorMap.violet} space-y-3`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </h4>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!content}
            className="h-7 text-xs text-gray-400 hover:text-white"
          >
            {copied ? <CheckCircle2 className="w-3 h-3 mr-1 text-green-400" /> : <Copy className="w-3 h-3 mr-1" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveToVault}
            disabled={!content || saving}
            className="h-7 text-xs text-gray-400 hover:text-white"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Archive className="w-3 h-3 mr-1" />}
            Bóveda
          </Button>
        </div>
      </div>
      <div className="min-h-[120px] p-3 rounded-xl bg-black/20 border border-white/5">
        {content ? (
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : (
          <p className="text-sm text-gray-600 italic">Genera contenido para ver el resultado aquí...</p>
        )}
      </div>
    </div>
  );
}
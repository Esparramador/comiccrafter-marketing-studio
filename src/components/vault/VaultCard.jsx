import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Copy, Star, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

const TYPE_COLORS = {
  instagram: "border-fuchsia-500/20 bg-fuchsia-600/5",
  luma: "border-cyan-500/20 bg-cyan-600/5",
  elevenlabs: "border-violet-500/20 bg-violet-600/5",
  vision: "border-amber-500/20 bg-amber-600/5",
  tendencia: "border-emerald-500/20 bg-emerald-600/5",
};

export default function VaultCard({ prompt, onRefresh }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.contenido);
    setCopied(true);
    toast.success("Copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleWinner = async () => {
    await base44.entities.PromptsVault.update(prompt.id, { es_ganador: !prompt.es_ganador });
    onRefresh();
  };

  const handleDelete = async () => {
    setDeleting(true);
    await base44.entities.PromptsVault.delete(prompt.id);
    onRefresh();
    toast.success("Prompt eliminado");
  };

  return (
    <div className={`rounded-xl border p-4 ${TYPE_COLORS[prompt.tipo] || "border-[var(--border-dim)]"} transition-all hover:shadow-lg hover:shadow-violet-500/5`}>
      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wide bg-white/5 text-gray-400">
          {prompt.tipo}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleWinner}>
            <Star className={`w-3.5 h-3.5 ${prompt.es_ganador ? "text-amber-400 fill-amber-400" : "text-gray-600"}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-600" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-600" /> : <Trash2 className="w-3.5 h-3.5 text-gray-600 hover:text-red-400" />}
          </Button>
        </div>
      </div>
      <p className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-4 leading-relaxed">{prompt.contenido}</p>
      <div className="flex items-center gap-2 mt-3">
        {prompt.etiquetas && (
          <div className="flex flex-wrap gap-1">
            {prompt.etiquetas.split(",").map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-gray-500">{tag.trim()}</span>
            ))}
          </div>
        )}
        <span className="text-[10px] text-gray-600 ml-auto">{moment(prompt.created_date).fromNow()}</span>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function GeminiAdvisor({ post, copy, onApplySuggestion }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setSuggestion(null);
    const context = `
Post: "${post.title || post.idea_base}"
Copy de Instagram actual: "${copy}"
Tipo de media: ${post.media_type}
Estado: ${post.status}
    `.trim();

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Eres un director creativo experto en marketing de redes sociales. Analiza este post y da UNA sugerencia concisa y accionable (máx 2 frases) para mejorar el copy o la coherencia visual. Si el copy es bueno, dilo brevemente y sugiere algo de valor. Contexto: ${context}`,
      response_json_schema: {
        type: "object",
        properties: {
          suggestion: { type: "string" },
          improved_copy: { type: "string" },
          applies_to_copy: { type: "boolean" },
        },
      },
    });

    setSuggestion(res);
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-violet-400" />
        <p className="text-xs font-semibold text-violet-300">Asistente Gemini</p>
      </div>

      {suggestion ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-300 leading-relaxed">{suggestion.suggestion}</p>
          {suggestion.applies_to_copy && suggestion.improved_copy && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onApplySuggestion(suggestion.improved_copy);
                toast.success("Sugerencia aplicada al copy");
              }}
              className="w-full text-xs border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Aplicar sugerencia al copy
            </Button>
          )}
          <button onClick={() => setSuggestion(null)} className="text-[10px] text-gray-600 hover:text-gray-400">
            Volver a analizar
          </button>
        </div>
      ) : (
        <div>
          <p className="text-xs text-gray-600 mb-3">
            Gemini analizará tu post y sugerirá mejoras proactivas de copy y coherencia visual.
          </p>
          <Button
            size="sm"
            onClick={analyze}
            disabled={loading}
            className="w-full text-xs bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
            {loading ? "Analizando..." : "Analizar con Gemini"}
          </Button>
        </div>
      )}
    </div>
  );
}
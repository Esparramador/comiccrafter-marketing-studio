import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw, Loader2, Lightbulb, ExternalLink } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { toast } from "sonner";

export default function TrendRadar() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: trends = [], isLoading } = useQuery({
    queryKey: ["trends"],
    queryFn: () => base44.entities.Trend.list("-created_date", 10),
  });

  const fetchTrends = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Busca las tendencias actuales en redes sociales, arte digital, cómics y contenido creativo. 
Devuelve un JSON con un array "trends" de exactamente 5 tendencias, cada una con:
- title: título corto de la tendencia
- category: categoría (arte_digital, comics, marketing, tecnologia, cultura_pop)
- suggestion: idea de cómic/contenido basada en esta tendencia
- relevance_score: puntuación de relevancia del 1 al 10`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          trends: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                category: { type: "string" },
                suggestion: { type: "string" },
                relevance_score: { type: "number" },
              },
            },
          },
        },
      },
    });

    if (res?.trends) {
      for (const t of res.trends) {
        await base44.entities.Trend.create({
          title: t.title,
          category: t.category,
          suggestion: t.suggestion,
          relevance_score: t.relevance_score,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["trends"] });
      toast.success(`${res.trends.length} tendencias encontradas`);
    }
    setLoading(false);
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-fuchsia-400" />
          Radar de Tendencias
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchTrends}
          disabled={loading}
          className="text-fuchsia-400 hover:text-fuchsia-300 h-7"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
          Actualizar
        </Button>
      </div>

      {(isLoading || loading) && trends.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-fuchsia-400 animate-spin" />
        </div>
      ) : trends.length === 0 ? (
        <div className="text-center py-6">
          <TrendingUp className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Pulsa "Actualizar" para buscar tendencias</p>
        </div>
      ) : (
        <div className="space-y-2">
          {trends.map((trend) => (
            <div key={trend.id} className="p-3 rounded-xl bg-white/[0.02] border border-[var(--border-dim)] hover:border-fuchsia-500/20 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-200">{trend.title}</p>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                      {trend.relevance_score}/10
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide">{trend.category?.replace(/_/g, " ")}</span>
                </div>
              </div>
              {trend.suggestion && (
                <div className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <Lightbulb className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-300/80">{trend.suggestion}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
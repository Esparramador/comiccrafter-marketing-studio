import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/shared/SectionHeader";
import VaultFilters from "@/components/vault/VaultFilters";
import VaultCard from "@/components/vault/VaultCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Vault() {
  const [filter, setFilter] = useState("all");
  const [showFavOnly, setShowFavOnly] = useState(false);
  const queryClient = useQueryClient();

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ["vault-prompts"],
    queryFn: () => base44.entities.PromptsVault.list("-created_date", 100),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["vault-prompts"] });

  const filtered = prompts.filter((p) => {
    if (filter !== "all" && p.tipo !== filter) return false;
    if (showFavOnly && !p.es_ganador) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Bóveda de Prompts"
        subtitle="Tu colección de prompts guardados y ganadores"
        icon={Archive}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFavOnly(!showFavOnly)}
            className={cn("h-8 text-xs", showFavOnly ? "text-amber-400" : "text-gray-500")}
          >
            <Star className={cn("w-3.5 h-3.5 mr-1", showFavOnly && "fill-amber-400")} />
            Solo favoritos
          </Button>
        }
      />

      <VaultFilters activeFilter={filter} onFilterChange={setFilter} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-40 rounded-xl bg-white/5" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Archive className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No hay prompts {filter !== "all" ? `de tipo "${filter}"` : ""} {showFavOnly ? "favoritos" : ""}</p>
          <p className="text-xs text-gray-600 mt-1">Genera prompts desde el Motor Súper Prompt y guárdalos aquí</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((prompt) => (
            <VaultCard key={prompt.id} prompt={prompt} onRefresh={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}
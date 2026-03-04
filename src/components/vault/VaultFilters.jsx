import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TYPES = [
  { value: "all", label: "Todos" },
  { value: "instagram", label: "Instagram" },
  { value: "luma", label: "Luma" },
  { value: "elevenlabs", label: "ElevenLabs" },
  { value: "vision", label: "Vision" },
  { value: "tendencia", label: "Tendencia" },
];

export default function VaultFilters({ activeFilter, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TYPES.map((t) => (
        <Button
          key={t.value}
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange(t.value)}
          className={cn(
            "h-8 text-xs rounded-lg border",
            activeFilter === t.value
              ? "bg-violet-600/15 text-violet-400 border-violet-500/30"
              : "text-gray-500 border-transparent hover:border-[var(--border-dim)] hover:text-gray-300"
          )}
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}
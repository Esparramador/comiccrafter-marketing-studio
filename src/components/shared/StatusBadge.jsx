import React from "react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  idea: { label: "Idea", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  en_produccion: { label: "En Producción", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  en_revision: { label: "En Revisión", color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
  programado: { label: "Programado", color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20" },
  publicado: { label: "Publicado", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idea;
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border", config.color)}>
      {config.label}
    </span>
  );
}
import React from "react";
import { cn } from "@/lib/utils";
import KanbanCard from "./KanbanCard";

const COLUMN_CONFIG = {
  idea: { label: "Ideas", color: "border-blue-500/30", accent: "bg-blue-500" },
  en_produccion: { label: "En Producción", color: "border-amber-500/30", accent: "bg-amber-500" },
  en_revision: { label: "En Revisión", color: "border-purple-500/30", accent: "bg-purple-500" },
  programado: { label: "Programado", color: "border-cyan-500/30", accent: "bg-cyan-500" },
  publicado: { label: "Publicado", color: "border-emerald-500/30", accent: "bg-emerald-500" },
};

export default function KanbanColumn({ status, posts, onMovePost, onPublish }) {
  const config = COLUMN_CONFIG[status] || COLUMN_CONFIG.idea;

  return (
    <div className={cn("bg-[var(--surface-raised)] border rounded-2xl flex flex-col min-h-[400px]", config.color)}>
      <div className="p-4 border-b border-[var(--border-dim)] flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", config.accent)} />
        <h3 className="text-sm font-semibold text-gray-300">{config.label}</h3>
        <span className="ml-auto text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{posts.length}</span>
      </div>
      <div className="p-3 space-y-2 flex-1 overflow-y-auto scrollbar-thin">
        {posts.map((post) => (
          <KanbanCard key={post.id} post={post} status={status} onMove={onMovePost} onPublish={onPublish} />
        ))}
        {posts.length === 0 && (
          <div className="flex items-center justify-center h-24">
            <p className="text-xs text-gray-600">Sin posts</p>
          </div>
        )}
      </div>
    </div>
  );
}
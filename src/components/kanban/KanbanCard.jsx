import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowRight, Send, Sparkles, ExternalLink } from "lucide-react";
import moment from "moment";

const NEXT_STATUS = {
  idea: "en_produccion",
  en_produccion: "en_revision",
  en_revision: "programado",
  programado: "publicado",
};

const NEXT_LABEL = {
  idea: "Mover a Producción",
  en_produccion: "Mover a Revisión",
  en_revision: "Programar",
  programado: "Marcar Publicado",
};

export default function KanbanCard({ post, status, onMove, onPublish }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-[var(--border-dim)] hover:border-violet-500/20 transition-all group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-200 truncate">{post.title || "Sin título"}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{post.idea_base?.substring(0, 60)}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={createPageUrl("SuperPrompt") + `?postId=${post.id}`} className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Generar Prompts
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={createPageUrl("Viewer") + `?postId=${post.id}`} className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" /> Ver en Visor
              </Link>
            </DropdownMenuItem>
            {NEXT_STATUS[status] && (
              <DropdownMenuItem onClick={() => onMove(post.id, NEXT_STATUS[status])} className="flex items-center gap-2">
                <ArrowRight className="w-3.5 h-3.5" /> {NEXT_LABEL[status]}
              </DropdownMenuItem>
            )}
            {status === "programado" && (
              <DropdownMenuItem onClick={() => onPublish(post)} className="flex items-center gap-2 text-emerald-400">
                <Send className="w-3.5 h-3.5" /> Publicar ahora
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-2 mt-2">
        {post.platform && (
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20">
            {post.platform}
          </span>
        )}
        <span className="text-[10px] text-gray-600 ml-auto">{moment(post.created_date).fromNow()}</span>
      </div>
    </div>
  );
}
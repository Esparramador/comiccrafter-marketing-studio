import React from "react";
import { Cpu, Eye, Paintbrush, Send, CheckCircle2, Clock } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

const AGENTS = [
  {
    icon: Cpu,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    label: "IA Creativa",
    desc: "Procesando guiones y narrativa",
  },
  {
    icon: Paintbrush,
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
    label: "IA Visual",
    desc: "Generando el activo multimedia",
  },
  {
    icon: Eye,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    label: "IA Crítica",
    desc: "Analizando coherencia visual vs. copy",
  },
  {
    icon: Send,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "Sincronizador",
    desc: "Empujando contenido a Instagram y Web",
  },
];

export default function SystemActivityLog({ posts = [] }) {
  const published = posts.filter((p) => p.status === "publicado").length;
  const inProduction = posts.filter((p) => p.status === "en_produccion").length;
  const autoPost = posts.filter((p) => p.auto_post_enabled).length;

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <h3 className="text-sm font-semibold text-gray-300">Sistema Activo</h3>
        <span className="ml-auto text-[10px] text-gray-600 font-mono">ComicCrafter Engine v1.0</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {AGENTS.map(({ icon: Icon, color, bg, label, desc }) => (
          <div key={label} className={`flex items-start gap-2.5 p-3 rounded-xl ${bg} border border-white/5`}>
            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
            <div>
              <p className={`text-xs font-semibold ${color}`}>{label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-1 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{published} publicados</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5 text-yellow-400" />
          <span>{inProduction} en producción</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Send className="w-3.5 h-3.5 text-violet-400" />
          <span>{autoPost} auto-post</span>
        </div>
      </div>
    </GlassCard>
  );
}
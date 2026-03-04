import React from "react";
import { FileText, Archive, ImageIcon, TrendingUp } from "lucide-react";

const STATS = [
  { key: "posts", label: "Posts", icon: FileText, color: "from-violet-600 to-indigo-600" },
  { key: "prompts", label: "Prompts Guardados", icon: Archive, color: "from-fuchsia-600 to-pink-600" },
  { key: "assets", label: "Assets", icon: ImageIcon, color: "from-cyan-600 to-blue-600" },
  { key: "published", label: "Publicados", icon: TrendingUp, color: "from-emerald-600 to-teal-600" },
];

export default function StatsOverview({ counts }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATS.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className="relative overflow-hidden bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl p-4"
        >
          <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${color} opacity-10 blur-xl`} />
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-bold text-white">{counts[key] ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}
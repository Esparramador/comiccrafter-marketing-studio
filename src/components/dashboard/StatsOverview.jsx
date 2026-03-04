import React from "react";
import { FileText, Archive, ImageIcon, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const STATS = [
  { key: "posts", label: "Posts", icon: FileText, color: "from-violet-600 to-indigo-600" },
  { key: "prompts", label: "Prompts Guardados", icon: Archive, color: "from-fuchsia-600 to-pink-600" },
  { key: "assets", label: "Assets", icon: ImageIcon, color: "from-cyan-600 to-blue-600" },
  { key: "published", label: "Publicados", icon: TrendingUp, color: "from-emerald-600 to-teal-600" },
];

export default function StatsOverview({ counts }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATS.map(({ key, label, icon: Icon, color }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className="relative overflow-hidden bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl p-4 hover:scale-[1.03] transition-transform duration-200 cursor-default"
        >
          <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-20 blur-2xl`} />
          <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r ${color} opacity-60`} />
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
            <Icon className="w-4.5 h-4.5 text-white" />
          </div>
          <p className="text-3xl font-black text-white">{counts[key] ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">{label}</p>
        </motion.div>
      ))}
    </div>
  );
}
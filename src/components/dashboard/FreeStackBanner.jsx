import React, { useState } from "react";
import { X } from "lucide-react";

const STACK = [
  { emoji: "🐙", name: "Make.com", desc: "1.000 automatizaciones/mes + webhooks + Instagram", badge: "Gratis" },
  { emoji: "🧠", name: "Gemini API", desc: "Decenas de peticiones/min en Google AI Studio", badge: "Gratis" },
  { emoji: "🎙️", name: "ElevenLabs", desc: "10.000 chars/mes ≈ 60 guiones de Reels", badge: "Gratis" },
  { emoji: "🎬", name: "Luma / HuggingFace", desc: "Créditos de prueba Luma · Modelos abiertos en HF", badge: "Gratis*" },
  { emoji: "💻", name: "GitHub API", desc: "API completamente gratuita", badge: "Gratis" },
];

export default function FreeStackBanner() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("free_stack_dismissed") === "1");

  if (dismissed) return null;

  const dismiss = () => {
    localStorage.setItem("free_stack_dismissed", "1");
    setDismissed(true);
  };

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-emerald-400">🏴‍☠️ Tu Stack Gratuito — €0/mes</h3>
          <p className="text-xs text-gray-500 mt-0.5">Valida el sistema gratis. Cuando escale, añades saldo.</p>
        </div>
        <button onClick={dismiss} className="p-1 rounded-lg hover:bg-white/5 text-gray-600 hover:text-gray-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {STACK.map((item) => (
          <div key={item.name} className="flex flex-col gap-1 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-base">{item.emoji}</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{item.badge}</span>
            </div>
            <p className="text-xs font-semibold text-white">{item.name}</p>
            <p className="text-[11px] text-gray-500 leading-snug">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
import React from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, Users, Zap, BookOpen, Film, MessageCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  {
    id: "feature_spotlight",
    label: "Feature Spotlight",
    icon: Sparkles,
    description: "Destaca una nueva funcionalidad",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "community_showcase",
    label: "Community Showcase",
    icon: Users,
    description: "Celebra creaciones de usuarios",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "tech_bts",
    label: "Tech Behind-the-Scenes",
    icon: Zap,
    description: "Explica la tecnología",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "carousel_comic",
    label: "Carrusel de Cómics",
    icon: BookOpen,
    description: "Storytelling visual con viñetas",
    color: "from-orange-500 to-red-600",
  },
  {
    id: "reel_creative_process",
    label: "Reel Proceso Creativo",
    icon: Film,
    description: "Video viral 15-20s",
    color: "from-red-500 to-pink-600",
  },
  {
    id: "story_interactive",
    label: "Story Interactiva",
    icon: MessageCircle,
    description: "Engagement con polls y preguntas",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "arc_summary",
    label: "Resumen de Arco",
    icon: TrendingUp,
    description: "Recap narrativo con momentum",
    color: "from-amber-500 to-orange-600",
  },
];

export default function TemplateSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {TEMPLATES.map((template) => {
        const Icon = template.icon;
        const isSelected = selected === template.id;

        return (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={cn(
              "p-4 rounded-xl transition-all duration-200 border-2",
              isSelected
                ? `border-violet-500 bg-[var(--surface-raised)] shadow-lg shadow-violet-500/20`
                : "border-[var(--border-dim)] bg-[var(--surface)] hover:border-violet-500/50"
            )}
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-white text-sm">{template.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{template.description}</p>
          </button>
        );
      })}
    </div>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { toast } from "sonner";

export default function IdeaInput({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [ideaBase, setIdeaBase] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!ideaBase.trim()) {
      toast.error("Escribe una idea base primero");
      return;
    }
    setSaving(true);
    const post = await base44.entities.Post.create({
      title: title.trim() || "Sin título",
      idea_base: ideaBase.trim(),
      status: "idea",
      platform: "instagram",
    });
    toast.success("Idea guardada como nuevo Post");
    setTitle("");
    setIdeaBase("");
    setSaving(false);
    onPostCreated?.(post);
  };

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-violet-400" />
        Nueva Idea
      </h3>
      <div className="space-y-3">
        <Input
          placeholder="Título (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-[var(--surface)] border-[var(--border-dim)] text-white placeholder:text-gray-600"
        />
        <Textarea
          placeholder="Escribe tu idea base... Ej: Un cómic sobre un robot artista que descubre el color por primera vez"
          value={ideaBase}
          onChange={(e) => setIdeaBase(e.target.value)}
          rows={4}
          className="bg-[var(--surface)] border-[var(--border-dim)] text-white placeholder:text-gray-600 resize-none"
        />
        <Button
          onClick={handleCreate}
          disabled={saving}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Guardar Idea
        </Button>
      </div>
    </GlassCard>
  );
}
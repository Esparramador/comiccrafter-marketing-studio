import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Columns } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import MonthlyGrid from "@/components/calendar/MonthlyGrid";
import { toast } from "sonner";

const STATUSES = ["idea", "en_produccion", "en_revision", "programado", "publicado"];

export default function Kanban() {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts-kanban"],
    queryFn: () => base44.entities.Post.list("-created_date", 100),
  });

  const handleMovePost = async (postId, newStatus) => {
    const updateData = { status: newStatus };
    if (newStatus === "publicado") {
      updateData.published_at = new Date().toISOString();
    }
    await base44.entities.Post.update(postId, updateData);
    queryClient.invalidateQueries({ queryKey: ["posts-kanban"] });
    toast.success(`Post movido a ${newStatus.replace(/_/g, " ")}`);

    // Webhook Make.com
    const post = posts.find((p) => p.id === postId);
    base44.functions.invoke("makeWebhook", {
      event: "post_status_changed",
      post_id: postId,
      new_status: newStatus,
      title: post?.title || post?.idea_base?.substring(0, 60) || "",
    });
  };

  const handlePublish = async (post) => {
    await base44.entities.Post.update(post.id, {
      status: "publicado",
      published_at: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ["posts-kanban"] });
    toast.success("Post publicado");

    // Webhook Make.com con datos completos
    base44.functions.invoke("makeWebhook", {
      event: "post_published",
      post_id: post.id,
      title: post.title || post.idea_base?.substring(0, 60) || "",
      instagram_copy: post.instagram_copy || "",
      luma_prompt: post.luma_prompt || "",
      elevenlabs_script: post.elevenlabs_script || "",
      media_url: post.media_url || "",
      media_type: post.media_type || "none",
      tags: post.tags || "",
      platform: post.platform || "instagram",
    });
  };

  const [view, setView] = useState("kanban");

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Calendario Editorial"
          subtitle="Gestiona el flujo de tus posts desde la idea hasta la publicación"
          icon={Calendar}
        />
        <div className="flex gap-2 bg-[#1a1a24] rounded-xl p-1 border border-[#1f1f2e]">
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === "kanban" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            <Columns className="w-3.5 h-3.5" /> Kanban
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === "calendar" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            <Calendar className="w-3.5 h-3.5" /> Calendario
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              posts={posts.filter((p) => p.status === status)}
              onMovePost={handleMovePost}
              onPublish={handlePublish}
            />
          ))}
        </div>
      ) : (
        <MonthlyGrid />
      )}
    </div>
  );
}
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import KanbanColumn from "@/components/kanban/KanbanColumn";
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
  };

  const handlePublish = async (post) => {
    // This would trigger a webhook to Zapier/Make
    toast.info("Publicación enviada a automatización (Zapier/Make)");
    await base44.entities.Post.update(post.id, {
      status: "publicado",
      published_at: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ["posts-kanban"] });
  };

  return (
    <div className="max-w-full mx-auto space-y-6">
      <SectionHeader
        title="Calendario Editorial"
        subtitle="Gestiona el flujo de tus posts desde la idea hasta la publicación"
        icon={Calendar}
      />

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
    </div>
  );
}
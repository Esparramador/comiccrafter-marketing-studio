import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2, LayoutGrid, Columns, Calendar } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import EventModal from "@/components/calendar/EventModal";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUSES = ["idea", "en_produccion", "en_revision", "programado", "publicado"];

export default function Kanban() {
  const queryClient = useQueryClient();
  const [view, setView] = useState("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  // Google Calendar events
  const { data: gcalData, isLoading: gcalLoading, refetch: refetchGcal } = useQuery({
    queryKey: ["gcal-events", currentDate.getFullYear(), currentDate.getMonth() + 1],
    queryFn: async () => {
      const res = await base44.functions.invoke("gcalGetEvents", {
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
      });
      return res.data.events || [];
    },
    staleTime: 60000,
  });

  // Posts (for kanban view)
  const { data: posts = [] } = useQuery({
    queryKey: ["posts-kanban"],
    queryFn: () => base44.entities.Post.list("-created_date", 100),
  });

  const handleMovePost = async (postId, newStatus) => {
    const updateData = { status: newStatus };
    if (newStatus === "publicado") updateData.published_at = new Date().toISOString();
    await base44.entities.Post.update(postId, updateData);
    queryClient.invalidateQueries({ queryKey: ["posts-kanban"] });
    toast.success(`Post movido a ${newStatus.replace(/_/g, " ")}`);
    const post = posts.find((p) => p.id === postId);
    base44.functions.invoke("makeWebhook", {
      event: "post_status_changed", post_id: postId, new_status: newStatus,
      title: post?.title || post?.idea_base?.substring(0, 60) || "",
    });
  };

  const handlePublish = async (post) => {
    await base44.entities.Post.update(post.id, { status: "publicado", published_at: new Date().toISOString() });
    queryClient.invalidateQueries({ queryKey: ["posts-kanban"] });
    toast.success("Post publicado");
    base44.functions.invoke("makeWebhook", {
      event: "post_published", post_id: post.id,
      title: post.title || post.idea_base?.substring(0, 60) || "",
      instagram_copy: post.instagram_copy || "", luma_prompt: post.luma_prompt || "",
      elevenlabs_script: post.elevenlabs_script || "", media_url: post.media_url || "",
      media_type: post.media_type || "none", tags: post.tags || "", platform: post.platform || "instagram",
    });
  };

  const handleDayClick = useCallback((day, evs) => {
    setSelectedDay(day);
    setSelectedEvents(evs);
  }, []);

  return (
    <div className="max-w-full mx-auto space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Calendario Editorial"
          subtitle="Gestiona el flujo de tus posts"
          icon={Calendar}
        />
        <div className="flex items-center gap-1 bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-xl p-1">
          <button onClick={() => setView("calendar")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              view === "calendar" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white")}>
            <LayoutGrid className="w-3.5 h-3.5" /> Calendario
          </button>
          <button onClick={() => setView("kanban")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              view === "kanban" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white")}>
            <Columns className="w-3.5 h-3.5" /> Kanban
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex items-center justify-between bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl px-5 py-3">
            <button onClick={() => setCurrentDate((d) => subMonths(d, 1))}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <h2 className="text-white font-bold capitalize text-base">
                {format(currentDate, "MMMM yyyy", { locale: es })}
              </h2>
              {gcalLoading
                ? <p className="text-xs text-gray-500 flex items-center gap-1 justify-center mt-0.5"><Loader2 className="w-3 h-3 animate-spin" />Cargando...</p>
                : <p className="text-xs text-gray-500 mt-0.5">{gcalData?.length || 0} eventos</p>
              }
            </div>
            <button onClick={() => setCurrentDate((d) => addMonths(d, 1))}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <CalendarGrid
            currentDate={currentDate}
            events={gcalData || []}
            onDayClick={handleDayClick}
          />
        </div>
      ) : (
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
      )}

      {selectedDay && (
        <EventModal
          date={selectedDay}
          events={selectedEvents}
          onClose={() => setSelectedDay(null)}
          onRefresh={() => refetchGcal()}
        />
      )}
    </div>
  );
}
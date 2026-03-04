import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";

export default function RecentPosts({ posts, isLoading }) {
  if (isLoading) {
    return (
      <GlassCard className="col-span-full">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Posts Recientes</h3>
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />)}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="col-span-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300">Posts Recientes</h3>
        <Link to={createPageUrl("Kanban")} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
          Ver todos <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-8">No hay posts creados aún.</p>
      ) : (
        <div className="space-y-2">
          {posts.slice(0, 5).map((post) => (
            <Link
              key={post.id}
              to={createPageUrl("SuperPrompt") + `?postId=${post.id}`}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-[var(--border-dim)] transition-all group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{post.title || "Sin título"}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{post.idea_base}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <StatusBadge status={post.status} />
                <span className="text-[10px] text-gray-600">{moment(post.created_date).fromNow()}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-violet-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
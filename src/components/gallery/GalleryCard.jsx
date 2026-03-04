import React from "react";
import { Image, Video, Box, FileText, ExternalLink } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  image: Image,
  video: Video,
  "3d": Box,
  none: FileText,
};

const TYPE_COLORS = {
  image: "text-fuchsia-400",
  video: "text-cyan-400",
  "3d": "text-violet-400",
  none: "text-gray-500",
};

export default function GalleryCard({ post, onOpen }) {
  const Icon = TYPE_ICONS[post.media_type] || FileText;
  const iconColor = TYPE_COLORS[post.media_type] || "text-gray-500";
  const hasMedia = post.media_url && post.media_type !== "none";

  return (
    <div
      onClick={onOpen}
      className="group relative aspect-square rounded-2xl overflow-hidden bg-[var(--surface-raised)] border border-[var(--border-dim)] cursor-pointer hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-200"
    >
      {/* Thumbnail */}
      {post.media_type === "image" && post.media_url ? (
        <img src={post.media_url} alt={post.title} className="w-full h-full object-cover" />
      ) : post.media_type === "video" && post.media_url ? (
        <video src={post.media_url} className="w-full h-full object-cover" muted />
      ) : post.reference_image_url ? (
        <img src={post.reference_image_url} alt={post.title} className="w-full h-full object-cover opacity-60" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Icon className={cn("w-10 h-10 opacity-30", iconColor)} />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
        <p className="text-xs font-medium text-white truncate">{post.title || post.idea_base?.substring(0, 40)}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Abrir Estudio →</p>
      </div>

      {/* Always-visible badges */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5">
        <div className={cn("w-6 h-6 rounded-lg bg-black/60 flex items-center justify-center", iconColor)}>
          <Icon className="w-3 h-3" />
        </div>
      </div>
      <div className="absolute top-2 right-2">
        <StatusBadge status={post.status} />
      </div>
    </div>
  );
}
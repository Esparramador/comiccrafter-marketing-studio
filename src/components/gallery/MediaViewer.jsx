import React from "react";
import { Image, Video, Box, FileText } from "lucide-react";

export default function MediaViewer({ post }) {
  const { media_url, media_type, reference_image_url } = post;

  if (media_type === "video" && media_url) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-black border border-[var(--border-dim)]">
        <video src={media_url} controls autoPlay loop className="w-full h-full object-contain" />
      </div>
    );
  }

  if (media_type === "image" && media_url) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-black border border-[var(--border-dim)] flex items-center justify-center">
        <img src={media_url} alt="Media" className="w-full h-full object-contain" />
      </div>
    );
  }

  if (media_type === "3d" && media_url) {
    return (
      <div className="aspect-video rounded-xl bg-black/40 border border-[var(--border-dim)] flex flex-col items-center justify-center gap-3">
        <Box className="w-10 h-10 text-violet-400" />
        <a
          href={media_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-violet-400 underline"
        >
          Abrir modelo 3D en visor externo →
        </a>
      </div>
    );
  }

  if (reference_image_url) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-black border border-[var(--border-dim)] flex items-center justify-center relative">
        <img src={reference_image_url} alt="Referencia" className="w-full h-full object-contain opacity-60" />
        <div className="absolute bottom-3 left-3 bg-black/60 rounded-lg px-2 py-1 text-xs text-gray-400">
          Imagen de referencia — sin media generada aún
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl bg-[var(--surface-raised)] border border-[var(--border-dim)] flex flex-col items-center justify-center gap-2">
      <FileText className="w-10 h-10 text-gray-700" />
      <p className="text-xs text-gray-600">Sin media generada todavía</p>
    </div>
  );
}
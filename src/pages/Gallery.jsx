import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Grid, Image, Video, Box, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import SectionHeader from "@/components/shared/SectionHeader";
import GalleryCard from "@/components/gallery/GalleryCard";
import StudioModal from "@/components/gallery/StudioModal";

export default function Gallery() {
  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((u) => setUserEmail(u?.email || null));
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts-gallery", userEmail],
    enabled: userEmail !== null,
    queryFn: () =>
      userEmail
        ? base44.entities.Post.filter({ created_by: userEmail }, "-updated_date", 100)
        : [],
  });

  const filtered = posts.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (p.title || "").toLowerCase().includes(q) ||
      (p.idea_base || "").toLowerCase().includes(q)
    );
  });

  const handleUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["posts-gallery"] });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SectionHeader
        title="Galería & Estudio"
        subtitle="Repositorio visual de todos tus activos generados"
        icon={Grid}
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar posts..."
          className="pl-9 bg-[var(--surface)] border-[var(--border-dim)] text-white placeholder:text-gray-600"
        />
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><Image className="w-3.5 h-3.5" />{posts.filter(p => p.media_type === "image").length} imágenes</span>
        <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" />{posts.filter(p => p.media_type === "video").length} vídeos</span>
        <span className="flex items-center gap-1.5"><Box className="w-3.5 h-3.5" />{posts.filter(p => p.media_type === "3d").length} modelos 3D</span>
        <span className="ml-auto">{filtered.length} resultados</span>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-[var(--surface-raised)] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <Grid className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No hay posts todavía. Empieza generando contenido en Super Prompt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((post) => (
            <GalleryCard key={post.id} post={post} onOpen={() => setSelectedPost(post)} />
          ))}
        </div>
      )}

      {/* Studio Modal */}
      {selectedPost && (
        <StudioModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
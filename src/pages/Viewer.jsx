import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Film, Box, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/shared/SectionHeader";
import GlassCard from "@/components/shared/GlassCard";
import StatusBadge from "@/components/shared/StatusBadge";

export default function Viewer() {
  const [selectedPostId, setSelectedPostId] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("none");
  const [loading, setLoading] = useState(false);

  const { data: posts = [] } = useQuery({
    queryKey: ["posts-viewer"],
    queryFn: () => base44.entities.Post.list("-created_date", 50),
  });

  useEffect(() => {
    if (selectedPostId && selectedPostId !== "none") {
      const post = posts.find((p) => p.id === selectedPostId);
      if (post) {
        setMediaUrl(post.media_url || "");
        setMediaType(post.media_type || "none");
      }
    }
  }, [selectedPostId, posts]);

  // Subscribe to Post updates for real-time media changes
  useEffect(() => {
    const unsubscribe = base44.entities.Post.subscribe((event) => {
      if (event.type === "update" && event.data?.id === selectedPostId) {
        if (event.data.media_url) {
          setMediaUrl(event.data.media_url);
          setMediaType(event.data.media_type || "video");
          setLoading(false);
        }
      }
    });
    return unsubscribe;
  }, [selectedPostId]);

  const selectedPost = posts.find((p) => p.id === selectedPostId);

  const handleGenerate3D = async () => {
    if (!selectedPost?.luma_prompt) return;
    setLoading(true);
    toast.info("Generando modelo 3D con Tripo3D... puede tardar ~90s");
    const res = await base44.functions.invoke("tripo3DGenerate", {
      prompt: selectedPost.luma_prompt,
      post_id: selectedPostId,
    });
    if (res.data?.model_url) {
      setMediaUrl(res.data.model_url);
      setMediaType("3d");
      toast.success("Modelo 3D generado");
    } else if (res.data?.error) {
      toast.error(res.data.error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Visor 3D / Vídeo"
        subtitle="Previsualiza modelos 3D y vídeos generados en tiempo real"
        icon={Eye}
      />

      <GlassCard>
        <div className="flex items-center gap-4 mb-6">
          <Select value={selectedPostId} onValueChange={setSelectedPostId}>
            <SelectTrigger className="bg-[var(--surface)] border-[var(--border-dim)] text-white max-w-sm">
              <SelectValue placeholder="Seleccionar post..." />
            </SelectTrigger>
            <SelectContent>
              {posts.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title || p.idea_base?.substring(0, 50)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPost && <StatusBadge status={selectedPost.status} />}
          {selectedPost?.luma_prompt && (
            <Button
              onClick={handleGenerate3D}
              disabled={loading}
              size="sm"
              className="ml-auto bg-gradient-to-r from-cyan-600 to-violet-600 hover:opacity-90 text-white text-xs"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Wand2 className="w-3.5 h-3.5 mr-1.5" />}
              Generar 3D con Tripo
            </Button>
          )}
        </div>

        {/* Media Viewer */}
        <div className="aspect-video rounded-2xl bg-black/40 border border-[var(--border-dim)] overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">Esperando contenido...</p>
                <p className="text-xs text-gray-600 mt-1">Se actualizará automáticamente via webhook</p>
              </div>
            </div>
          )}

          {!mediaUrl && !loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Eye className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Selecciona un post con media</p>
                <p className="text-xs text-gray-600 mt-1">o espera a que llegue via webhook</p>
              </div>
            </div>
          ) : mediaType === "video" && mediaUrl ? (
            <video
              key={mediaUrl}
              src={mediaUrl}
              controls
              autoPlay
              loop
              className="w-full h-full object-contain"
            />
          ) : mediaType === "3d" && mediaUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Box className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Modelo 3D disponible</p>
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-violet-400 hover:underline mt-1 inline-block"
                >
                  Abrir en visor externo →
                </a>
              </div>
            </div>
          ) : mediaType === "image" && mediaUrl ? (
            <img src={mediaUrl} alt="Preview" className="w-full h-full object-contain" />
          ) : null}
        </div>
      </GlassCard>

      {/* Post Details */}
      {selectedPost && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedPost.instagram_copy && (
            <GlassCard>
              <p className="text-xs text-fuchsia-400 font-medium mb-2">Copy Instagram</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{selectedPost.instagram_copy}</p>
            </GlassCard>
          )}
          {selectedPost.luma_prompt && (
            <GlassCard>
              <p className="text-xs text-cyan-400 font-medium mb-2">Prompt Luma</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{selectedPost.luma_prompt}</p>
            </GlassCard>
          )}
          {selectedPost.elevenlabs_script && (
            <GlassCard>
              <p className="text-xs text-violet-400 font-medium mb-2">Guion Voz</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{selectedPost.elevenlabs_script}</p>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
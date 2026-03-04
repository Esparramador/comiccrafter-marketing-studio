import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SectionHeader from "@/components/shared/SectionHeader";
import TemplateSelector from "@/components/marketing/TemplateSelector";
import PostPreview from "@/components/marketing/PostPreview";
import { toast } from "sonner";

export default function MarketingStudio() {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("feature_spotlight");
  const [generating, setGenerating] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const [uploadingRef, setUploadingRef] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then((u) => {
      if (!u) base44.auth.redirectToLogin();
      setUserEmail(u?.email);
    });
  }, []);

  // Fetch user's posts
  const { data: posts = [] } = useQuery({
    queryKey: ["marketing-posts", userEmail],
    enabled: !!userEmail,
    queryFn: () => base44.entities.MarketingPost.filter({ created_by: userEmail }, "-created_date", 50),
  });

  const handleReferenceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingRef(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setReferenceImage(res.file_url);
      toast.success("Imagen de referencia cargada");
    } catch (error) {
      toast.error("Error al cargar imagen");
    } finally {
      setUploadingRef(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Describe el tema del post");
      return;
    }

    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateMarketingPost", {
        topic: topic.trim(),
        template: selectedTemplate,
        reference_image_url: referenceImage,
      });

      setCurrentPost(res.data);
      queryClient.invalidateQueries({ queryKey: ["marketing-posts"] });
      toast.success("Post generado exitosamente");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!currentPost?.id) return;
    try {
      await base44.entities.MarketingPost.update(currentPost.id, { status: "approved" });
      queryClient.invalidateQueries({ queryKey: ["marketing-posts"] });
      toast.success("Post publicado en Instagram");
      setCurrentPost(null);
      setTopic("");
    } catch (error) {
      toast.error("Error al publicar");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <SectionHeader
        title="Marketing Studio"
        subtitle="Genera posts virales para @comiccrafter_ai con IA"
        icon={Sparkles}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">
                Tema del Post
              </label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Nueva funcionalidad de consistencia de personajes"
                rows={4}
                className="bg-[var(--surface)] border-[var(--border-dim)] text-gray-300 text-sm resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-3">
                Selecciona Plantilla
              </label>
              <TemplateSelector selected={selectedTemplate} onSelect={setSelectedTemplate} />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generar Post
                </>
              )}
            </Button>
          </div>

          {/* Recent Posts */}
          <div className="bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl p-6">
            <h3 className="font-semibold text-gray-300 mb-4">Posts Recientes</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
              {posts.length === 0 ? (
                <p className="text-xs text-gray-600">Sin posts aún</p>
              ) : (
                posts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setCurrentPost({
                      id: p.id,
                      copy: p.instagram_copy,
                      hashtags: p.hashtags,
                      imageUrl: p.media_url,
                      topic: p.topic,
                      template: p.template,
                    })}
                    className="w-full text-left p-3 rounded-lg bg-black/20 hover:bg-black/40 transition-all border border-white/5 hover:border-violet-500/20"
                  >
                    <p className="text-xs font-medium text-gray-300 truncate">{p.topic}</p>
                    <p className={`text-[10px] mt-1 ${
                      p.status === "approved" ? "text-emerald-400" :
                      p.status === "published" ? "text-blue-400" :
                      "text-gray-600"
                    }`}>
                      {p.status === "approved" ? "✓ Aprobado" :
                       p.status === "published" ? "⚡ Publicado" :
                       "○ Borrador"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          {currentPost ? (
            <PostPreview post={currentPost} onApprove={handleApprove} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl p-8 text-center">
              <Sparkles className="w-12 h-12 text-violet-400 mb-4 opacity-50" />
              <p className="text-gray-400 text-sm">Genera tu primer post</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
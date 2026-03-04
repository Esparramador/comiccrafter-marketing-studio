import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Instagram, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function PostPublishDialog({ post, isOpen, onClose, onPublished }) {
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);

  const handlePublish = async () => {
    setPublishing(true);
    setError(null);

    try {
      const res = await base44.functions.invoke("publishInstagramPost", {
        post_id: post.id,
        image_url: post.image_url,
        copy: post.copy,
        hashtags: post.hashtags,
      });

      if (res.data.success) {
        toast.success("¡Publicado en Instagram!");
        onPublished();
        onClose();
      } else {
        throw new Error(res.data.error || "Error al publicar");
      }
    } catch (err) {
      const errorMsg = err.message || "Error desconocido";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setPublishing(false);
    }
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--surface-raised)] border-[var(--border-dim)]">
        <DialogHeader>
          <DialogTitle className="text-white">Publicar en Instagram</DialogTitle>
          <DialogDescription className="text-gray-400">
            Revisa los detalles antes de publicar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview */}
          <div className="bg-[var(--surface)] rounded-xl p-4 space-y-3">
            {post.image_url && (
              <img
                src={post.image_url}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div>
              <p className="text-sm text-gray-300 line-clamp-3">{post.copy}</p>
              {post.hashtags && (
                <p className="text-xs text-violet-400 mt-2">{post.hashtags}</p>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3">
            <p className="text-xs text-violet-300">
              Asegúrate de tener tu Instagram Business ID y Access Token configurados en Configuración.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={publishing}>
            Cancelar
          </Button>
          <Button
            onClick={handlePublish}
            disabled={publishing}
            className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white"
          >
            {publishing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Instagram className="w-4 h-4 mr-2" />
                Publicar en Instagram
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
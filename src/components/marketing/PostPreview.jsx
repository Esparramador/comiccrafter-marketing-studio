import React from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check, Instagram, Loader2 } from "lucide-react";
import PostPublishDialog from "./PostPublishDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PostPreview({ post, onApprove, approving }) {
  const [copied, setCopied] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [showPublishDialog, setShowPublishDialog] = React.useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copiado al portapapeles");
  };

  if (!post) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Image Preview */}
      <div className="rounded-2xl overflow-hidden bg-[var(--surface-raised)] border border-[var(--border-dim)]">
        <img
          src={post.imageUrl}
          alt="Generated post"
          className="w-full h-auto aspect-square object-cover"
        />
      </div>

      {/* Text Content */}
      <div className="space-y-4 flex flex-col justify-between">
        {/* Copy */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-300">Texto del Post</h3>
            <button
              onClick={() => copyToClipboard(post.copy)}
              className="p-2 rounded-lg hover:bg-white/10 transition-all text-gray-400 hover:text-white"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">{post.copy}</p>
          <p className="text-xs text-gray-600">
            {post.copy.length}/280 caracteres
          </p>
        </div>

        {/* Hashtags */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-300">Hashtags</h3>
            <button
              onClick={() => copyToClipboard(post.hashtags)}
              className="p-2 rounded-lg hover:bg-white/10 transition-all text-gray-400 hover:text-white"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.hashtags.split(" ").map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-violet-600/15 text-violet-300 rounded-full text-xs border border-violet-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <Button
            onClick={() => {
              const element = document.createElement("a");
              element.href = post.imageUrl;
              element.download = `comiccrafter-post-${Date.now()}.png`;
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
              toast.success("Imagen descargada");
            }}
            variant="outline"
            className="flex-1 border-[var(--border-dim)] text-gray-400 hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
          <Button
            onClick={onApprove}
            disabled={approving}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
          >
            {approving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Aprobar
          </Button>
        </div>

        {/* Publish to Instagram Button */}
        {post.id && (
          <>
            <Button
              onClick={() => setShowPublishDialog(true)}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 hover:opacity-90 text-white"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Publicar en Instagram
            </Button>
            <PostPublishDialog
              post={{ ...post, image_url: post.imageUrl }}
              isOpen={showPublishDialog}
              onClose={() => setShowPublishDialog(false)}
              onPublished={() => {
                setShowPublishDialog(false);
                onApprove();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
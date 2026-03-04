import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { toast } from "sonner";

export default function AssetUploader({ onAssetUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error(`Formato no soportado: ${file.name}. Usa PNG, JPG, WebP o GIF.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} supera 10MB.`);
        continue;
      }
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Asset.create({
        file_url,
        file_name: file.name,
        tipo: "imagen",
        source: "upload",
      });
      toast.success(`${file.name} subido correctamente`);
    }
    setUploading(false);
    onAssetUploaded?.();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleInputChange = (e) => {
    handleFiles(Array.from(e.target.files));
  };

  return (
    <GlassCard
      className={`transition-all duration-300 ${dragOver ? "border-violet-500 bg-violet-500/5" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center py-8 text-center">
        {uploading ? (
          <Loader2 className="w-10 h-10 text-violet-400 animate-spin mb-3" />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-violet-600/10 flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-violet-400" />
          </div>
        )}
        <p className="text-sm font-medium text-gray-300 mb-1">
          {uploading ? "Subiendo assets..." : "Arrastra imágenes aquí"}
        </p>
        <p className="text-xs text-gray-500 mb-4">PNG, JPG, WebP, GIF — Máx 10MB</p>
        {!uploading && (
          <label>
            <input
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              onChange={handleInputChange}
            />
            <Button variant="outline" size="sm" className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10" asChild>
              <span>Seleccionar archivos</span>
            </Button>
          </label>
        )}
      </div>
    </GlassCard>
  );
}
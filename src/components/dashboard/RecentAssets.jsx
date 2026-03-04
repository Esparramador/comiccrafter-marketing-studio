import React from "react";
import { ImageIcon, Film, Box } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_ICONS = { imagen: ImageIcon, video: Film, "3d": Box, nota: ImageIcon };

export default function RecentAssets({ assets, isLoading }) {
  if (isLoading) {
    return (
      <GlassCard>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Assets Recientes</h3>
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-square rounded-xl bg-white/5" />)}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Assets Recientes</h3>
      {assets.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-6">No hay assets aún. Sube tu primer archivo.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {assets.slice(0, 9).map((asset) => (
            <div
              key={asset.id}
              className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-[var(--border-dim)] relative group cursor-pointer"
            >
              {asset.tipo === "imagen" && asset.file_url ? (
                <img src={asset.file_url} alt={asset.file_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {React.createElement(TYPE_ICONS[asset.tipo] || ImageIcon, { className: "w-6 h-6 text-gray-500" })}
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <p className="text-[10px] text-gray-300 truncate w-full">{asset.file_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
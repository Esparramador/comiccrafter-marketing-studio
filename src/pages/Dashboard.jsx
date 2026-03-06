import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import AssetUploader from "@/components/dashboard/AssetUploader";
import IdeaInput from "@/components/dashboard/IdeaInput";
import RecentAssets from "@/components/dashboard/RecentAssets";
import RecentPosts from "@/components/dashboard/RecentPosts";
import FreeStackBanner from "@/components/dashboard/FreeStackBanner";
import SystemActivityLog from "@/components/dashboard/SystemActivityLog";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=1600&q=80", // comic pop art
  "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1600&q=80", // vibrant colors art
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1600&q=80", // colorful abstract
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80", // neon art
];

export default function Dashboard() {
  const [isAuthed, setIsAuthed] = React.useState(null);

  const queryClient = useQueryClient();
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then((user) => {
        if (user) {
          setIsAuthed(true);
          setUserEmail(user.email);
        } else {
          setIsAuthed(false);
        }
      })
      .catch(() => {
        setIsAuthed(false);
      });
  }, []);

  const [bgIndex, setBgIndex] = React.useState(0);
  const [fadeIn, setFadeIn] = React.useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setBgIndex((i) => (i + 1) % BG_IMAGES.length);
        setFadeIn(true);
      }, 800);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["posts", userEmail],
    enabled: !!userEmail,
    queryFn: () => base44.entities.Post.filter({ created_by: userEmail }, "-created_date", 10),
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["assets", userEmail],
    enabled: !!userEmail,
    queryFn: () => base44.entities.Asset.filter({ created_by: userEmail }, "-created_date", 20),
  });

  const { data: prompts = [] } = useQuery({
    queryKey: ["prompts-count", userEmail],
    enabled: !!userEmail,
    queryFn: () => base44.entities.PromptsVault.filter({ created_by: userEmail }, "-created_date", 100),
  });

  const counts = {
    posts: posts.length,
    prompts: prompts.length,
    assets: assets.length,
    published: posts.filter((p) => p.status === "publicado").length,
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["assets"] });
    queryClient.invalidateQueries({ queryKey: ["prompts-count"] });
  };

  if (isAuthed === null) return <div className="min-h-screen bg-[#0a0a0f]" />;
  
  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${BG_IMAGES[bgIndex]})`, transition: "opacity 800ms" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-[#0a0a0f] to-fuchsia-900/30" />
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Card */}
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl shadow-violet-900/30 text-center space-y-8">
            {/* Logo */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/40">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">ComicCrafter</h1>
                <p className="text-xs text-violet-400 uppercase tracking-widest font-semibold mt-1">Marketing Studio</p>
              </div>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Bienvenido de vuelta</h2>
              <p className="text-sm text-gray-400">Tu fábrica de contenido con IA te espera</p>
            </div>

            {/* Features pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {["✨ Posts con IA", "🎨 Generación de imágenes", "🚀 Auto-publicación"].map(f => (
                <span key={f} className="px-3 py-1 text-xs bg-violet-600/20 border border-violet-500/20 text-violet-300 rounded-full">{f}</span>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => base44.auth.redirectToLogin("/")}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02]"
            >
              Iniciar Sesión →
            </button>

            <p className="text-xs text-gray-600">comiccrafter.es · Marketing con IA</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Animated hero banner */}
      <div className="relative overflow-hidden rounded-3xl h-48 md:h-64 shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity"
          style={{
            backgroundImage: `url(${BG_IMAGES[bgIndex]})`,
            opacity: fadeIn ? 1 : 0,
            transitionDuration: "800ms",
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {BG_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFadeIn(false); setTimeout(() => { setBgIndex(i); setFadeIn(true); }, 400); }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === bgIndex ? "bg-white w-4" : "bg-white/40"}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow">Dashboard</h1>
              <p className="text-sm text-white/70">Centro de mando de tu fábrica de contenido</p>
            </div>
          </div>
        </div>
      </div>
      <StatsOverview counts={counts} />
      <SystemActivityLog posts={posts} />
      <FreeStackBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          <IdeaInput onPostCreated={refresh} />
          <AssetUploader onAssetUploaded={refresh} />
        </div>
        <div className="lg:col-span-2 space-y-5">
          <RecentAssets assets={assets} isLoading={assetsLoading} />
          <RecentPosts posts={posts} isLoading={postsLoading} />
        </div>
      </div>
    </div>
  );
}
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
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 10),
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: () => base44.entities.Asset.list("-created_date", 20),
  });

  const { data: prompts = [] } = useQuery({
    queryKey: ["prompts-count"],
    queryFn: () => base44.entities.PromptsVault.list("-created_date", 100),
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SectionHeader
        title="Dashboard"
        subtitle="Centro de mando de tu fábrica de contenido"
        icon={LayoutDashboard}
      />
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
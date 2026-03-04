import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import AssetUploader from "@/components/dashboard/AssetUploader";
import IdeaInput from "@/components/dashboard/IdeaInput";
import RecentAssets from "@/components/dashboard/RecentAssets";
import RecentPosts from "@/components/dashboard/RecentPosts";

export default function Dashboard() {
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
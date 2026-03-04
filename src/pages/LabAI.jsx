import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FlaskConical } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import VisionAnalyzer from "@/components/lab/VisionAnalyzer";
import TrendRadar from "@/components/lab/TrendRadar";

export default function LabAI() {
  useEffect(() => {
    base44.auth.me()
      .then((u) => { if (!u) base44.auth.redirectToLogin(); })
      .catch(() => base44.auth.redirectToLogin());
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SectionHeader
        title="Laboratorio IA"
        subtitle="Ingeniería inversa de imágenes y radar de tendencias"
        icon={FlaskConical}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <VisionAnalyzer />
        <TrendRadar />
      </div>
    </div>
  );
}
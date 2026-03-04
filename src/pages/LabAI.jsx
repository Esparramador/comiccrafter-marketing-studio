import React from "react";
import { FlaskConical } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import VisionAnalyzer from "@/components/lab/VisionAnalyzer";
import TrendRadar from "@/components/lab/TrendRadar";

export default function LabAI() {
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
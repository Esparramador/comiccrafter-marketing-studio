import React from "react";
import { cn } from "@/lib/utils";

export default function GlassCard({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
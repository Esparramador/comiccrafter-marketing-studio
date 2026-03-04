import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  FlaskConical,
  Sparkles,
  Eye,
  Calendar,
  Archive,
  Menu,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { I18nProvider, useI18n } from "@/components/i18n/I18nContext";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";

const NAV_KEYS = [
  { key: "nav_dashboard", page: "Dashboard", icon: LayoutDashboard },
  { key: "nav_lab", page: "LabAI", icon: FlaskConical },
  { key: "nav_superprompt", page: "SuperPrompt", icon: Sparkles },
  { key: "nav_viewer", page: "Viewer", icon: Eye },
  { key: "nav_kanban", page: "Kanban", icon: Calendar },
  { key: "nav_vault", page: "Vault", icon: Archive },
];

export default function Layout({ children, currentPageName }) {
  return (
    <I18nProvider>
      <LayoutInner currentPageName={currentPageName}>{children}</LayoutInner>
    </I18nProvider>
  );
}

function LayoutInner({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <style>{`
        :root {
          --accent: #7c3aed;
          --accent-light: #a78bfa;
          --surface: #111118;
          --surface-raised: #1a1a24;
          --border-dim: #1f1f2e;
          --text-muted: #6b7280;
        }
        body { background: #0a0a0f; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #2d2d3f; border-radius: 999px; }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[var(--surface)] border-r border-[var(--border-dim)] flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-[var(--border-dim)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">ComicCrafter</h1>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Marketing Studio</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          {NAV_KEYS.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-violet-600/15 text-violet-400 shadow-sm shadow-violet-500/10"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-4.5 h-4.5", isActive && "text-violet-400")} />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border-dim)] space-y-3">
          <LanguageSwitcher />
          <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 border border-violet-500/20">
            <p className="text-[11px] text-violet-300 font-medium">ComicCrafter AI</p>
            <p className="text-[10px] text-gray-500 mt-0.5">v1.0 — Marketing Studio</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border-dim)] px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/5">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">ComicCrafter</span>
          </div>
          <LanguageSwitcher />
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
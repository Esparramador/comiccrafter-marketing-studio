import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { I18nProvider, useI18n } from "@/components/i18n/I18nContext";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import {
  LayoutDashboard,
  FlaskConical,
  Sparkles,
  Eye,
  Calendar,
  Archive,
  Menu,
  Zap,
  Shield,
  GalleryHorizontalEnd,
  Globe,
  Wand2,
  User,
  Settings as SettingsIcon,
  LogOut
} from "lucide-react";

const NAV_KEYS = [
  { key: "nav_dashboard", page: "Dashboard", icon: LayoutDashboard },
  { key: "nav_lab", page: "LabAI", icon: FlaskConical },
  { key: "nav_superprompt", page: "SuperPrompt", icon: Sparkles },
  { key: "nav_gallery", page: "Gallery", icon: GalleryHorizontalEnd },
  { key: "nav_viewer", page: "Viewer", icon: Eye },
  { key: "nav_kanban", page: "Kanban", icon: Calendar },
  { key: "nav_vault", page: "Vault", icon: Archive },
  { key: "nav_cc_marketing", page: "MarketingStudio", icon: Wand2 },
  { key: "nav_cc_redactor", page: "TextEnhancer", icon: Sparkles },
  { key: "nav_admin", page: "Admin", icon: Shield },
];

function Layout({ children, currentPageName }) {
  return (
    <I18nProvider>
      <LayoutInner currentPageName={currentPageName}>{children}</LayoutInner>
    </I18nProvider>
  );
}

const ADMIN_EMAIL = "sadiagiljoan@gmail.com";

function LayoutInner({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const { t } = useI18n();

  React.useEffect(() => {
    base44.auth.me().then((u) => setUserEmail(u?.email || "")).catch(() => setUserEmail(""));
  }, []);

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
            if (item.page === "Admin" && userEmail !== ADMIN_EMAIL) return null;
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
          <Link
            to={createPageUrl("Profile")}
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all"
          >
            <User className="w-3.5 h-3.5" />
            Mi Perfil
          </Link>
          <Link
            to={createPageUrl("Settings")}
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            Configuración
          </Link>

          <div className="border-t border-[var(--border-dim)] pt-3 mt-3 space-y-2">
            <a
              href="https://comiccrafter.es"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              comiccrafter.es ↗
            </a>
            <a
              href="https://comic-crafter.myshopify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all"
            >
              <span className="text-[#96BF48] text-xs font-bold leading-none">S</span>
              Shopify Store ↗
            </a>
            <a
              href="https://www.instagram.com/comiccrafter_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all"
            >
              <span className="text-[10px] font-bold bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">IG</span>
              @comiccrafter_ai ↗
            </a>
            <LanguageSwitcher />
          </div>

          <button
            onClick={() => base44.auth.logout("/")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-red-500/20 hover:border-red-500/40 mt-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar sesión
          </button>
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

export default Layout;
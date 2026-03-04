import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Shield, Activity, FileText, Settings, AlertTriangle, CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SectionHeader from "@/components/shared/SectionHeader";
import GlassCard from "@/components/shared/GlassCard";
import { toast } from "sonner";

const API_CHECKS = [
  { key: "gemini", label: "Gemini AI", fn: "superPromptGemini", payload: { idea_base: "test", tone_label: "test" } },
  { key: "elevenlabs", label: "ElevenLabs", fn: "elevenLabsGenerate", payload: { text: "test" } },
  { key: "tripo3d", label: "Tripo3D", fn: "tripo3DGenerate", payload: { prompt: "test cube" } },
  { key: "make", label: "Make Webhook", fn: "makeWebhook", payload: { idea_base: "ping", tono_idioma: "test", datos_github: "" } },
];

const SYSTEM_PROMPTS_KEY = "admin_system_prompts";
const DESTINATIONS_KEY = "admin_destinations";

function ApiMonitor() {
  const [statuses, setStatuses] = useState({});
  const [checking, setChecking] = useState(false);

  const checkAll = async () => {
    setChecking(true);
    const results = {};
    await Promise.all(
      API_CHECKS.map(async (api) => {
        const start = Date.now();
        try {
          const res = await base44.functions.invoke(api.fn, api.payload);
          results[api.key] = {
            ok: !res.data?.error,
            latency: Date.now() - start,
            detail: res.data?.error || "OK",
          };
        } catch (e) {
          results[api.key] = { ok: false, latency: Date.now() - start, detail: e.message };
        }
      })
    );
    setStatuses(results);
    setChecking(false);
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">Estado de APIs</h3>
        <Button size="sm" variant="outline" onClick={checkAll} disabled={checking} className="h-7 text-xs border-[var(--border-dim)] text-gray-400">
          {checking ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
          Verificar todas
        </Button>
      </div>
      <div className="space-y-2">
        {API_CHECKS.map((api) => {
          const s = statuses[api.key];
          return (
            <div key={api.key} className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-2">
                {s ? (
                  s.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gray-700" />
                )}
                <span className="text-sm text-gray-300">{api.label}</span>
              </div>
              <div className="text-right">
                {s && (
                  <>
                    <span className={`text-xs font-mono ${s.ok ? "text-emerald-400" : "text-red-400"}`}>{s.ok ? "OK" : "ERROR"}</span>
                    <span className="text-xs text-gray-600 ml-2">{s.latency}ms</span>
                    {!s.ok && <p className="text-[10px] text-red-400 mt-0.5 max-w-[200px] truncate">{s.detail}</p>}
                  </>
                )}
                {!s && <span className="text-xs text-gray-600">—</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <h4 className="text-xs text-gray-500 font-medium mb-2">Últimos Posts (actividad reciente)</h4>
        <PostStats />
      </div>
    </GlassCard>
  );
}

function PostStats() {
  const { data: posts = [] } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 20),
  });
  const { data: prompts = [] } = useQuery({
    queryKey: ["admin-prompts"],
    queryFn: () => base44.entities.PromptsVault.list("-created_date", 5),
  });

  const stats = {
    total: posts.length,
    publicado: posts.filter((p) => p.status === "publicado").length,
    en_produccion: posts.filter((p) => p.status === "en_produccion").length,
    prompts_vault: prompts.length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {Object.entries(stats).map(([k, v]) => (
        <div key={k} className="px-3 py-2 rounded-xl bg-violet-600/5 border border-violet-500/10 text-center">
          <p className="text-lg font-bold text-violet-300">{v}</p>
          <p className="text-[10px] text-gray-500 capitalize">{k.replace(/_/g, " ")}</p>
        </div>
      ))}
    </div>
  );
}

function SystemPromptsEditor() {
  const [prompts, setPrompts] = useState({
    instagram: "Eres el Director de Marketing de ComicCrafter.es. Tu objetivo es crear copies persuasivos para Instagram con emojis, hashtags y CTA.",
    luma: "Genera un prompt técnico en inglés para Luma Dream Machine. Incluye descripción visual, cámara, iluminación y atmósfera.",
    elevenlabs: "Crea un guion de voz máx 15 segundos. Usa puntuación para pausas (...) y tono épico/apasionado.",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SYSTEM_PROMPTS_KEY);
    if (saved) setPrompts(JSON.parse(saved));
  }, []);

  const save = () => {
    setSaving(true);
    localStorage.setItem(SYSTEM_PROMPTS_KEY, JSON.stringify(prompts));
    setTimeout(() => { setSaving(false); toast.success("System prompts guardados"); }, 500);
  };

  return (
    <GlassCard className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-300">Editar System Prompts de la IA</h3>
      <p className="text-xs text-gray-500">Modifica la personalidad y estilo de cada módulo de IA sin tocar el código.</p>
      {Object.entries(prompts).map(([key, val]) => (
        <div key={key} className="space-y-1.5">
          <label className="text-xs text-gray-500 font-medium capitalize">{key} Prompt</label>
          <Textarea
            value={val}
            onChange={(e) => setPrompts((p) => ({ ...p, [key]: e.target.value }))}
            rows={4}
            className="bg-[var(--surface)] border-[var(--border-dim)] text-gray-300 text-xs font-mono resize-none"
          />
        </div>
      ))}
      <Button onClick={save} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white text-sm">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        Guardar Prompts
      </Button>
    </GlassCard>
  );
}

function DestinationsConfig() {
  const [config, setConfig] = useState({
    instagram_account: "@comiccrafter.es",
    make_webhook_url: "",
    default_platform: "instagram",
    schedule_time: "18:00",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(DESTINATIONS_KEY);
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  const save = () => {
    setSaving(true);
    localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(config));
    setTimeout(() => { setSaving(false); toast.success("Configuración guardada"); }, 500);
  };

  const fields = [
    { key: "instagram_account", label: "Cuenta de Instagram" },
    { key: "make_webhook_url", label: "URL Webhook Make.com" },
    { key: "default_platform", label: "Plataforma por defecto" },
    { key: "schedule_time", label: "Hora de publicación por defecto (HH:MM)" },
  ];

  return (
    <GlassCard className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-300">Configuración de Destinos</h3>
      <p className="text-xs text-gray-500">Cambia las cuentas de destino y webhooks sin modificar el código.</p>
      {fields.map(({ key, label }) => (
        <div key={key} className="space-y-1.5">
          <label className="text-xs text-gray-500 font-medium">{label}</label>
          <Input
            value={config[key]}
            onChange={(e) => setConfig((c) => ({ ...c, [key]: e.target.value }))}
            className="bg-[var(--surface)] border-[var(--border-dim)] text-gray-300 text-sm"
          />
        </div>
      ))}
      <Button onClick={save} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white text-sm">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        Guardar Configuración
      </Button>
    </GlassCard>
  );
}

export default function Admin() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => { setUser(u); setAuthChecked(true); }).catch(() => setAuthChecked(true));
  }, []);

  if (!authChecked) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
    </div>
  );

  const ADMIN_EMAIL = "sadiagiljoan@gmail.com";
  const isAdmin = user && (user.role === "admin" || user.email === ADMIN_EMAIL);

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Shield className="w-12 h-12 text-red-400" />
      <p className="text-gray-400 text-sm font-medium">Acceso denegado</p>
      <p className="text-gray-600 text-xs">Esta sección es exclusiva para administradores.</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SectionHeader
        title="Panel de Administración"
        subtitle={`Bienvenido, ${user.full_name || user.email} · Acceso total al sistema`}
        icon={Shield}
      />

      <Tabs defaultValue="monitor" className="space-y-4">
        <TabsList className="bg-[var(--surface-raised)] border border-[var(--border-dim)] p-1 rounded-xl">
          <TabsTrigger value="monitor" className="text-xs data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-300">
            <Activity className="w-3.5 h-3.5 mr-1.5" /> Monitorización
          </TabsTrigger>
          <TabsTrigger value="prompts" className="text-xs data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-300">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> System Prompts
          </TabsTrigger>
          <TabsTrigger value="destinations" className="text-xs data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-300">
            <Settings className="w-3.5 h-3.5 mr-1.5" /> Destinos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor"><ApiMonitor /></TabsContent>
        <TabsContent value="prompts"><SystemPromptsEditor /></TabsContent>
        <TabsContent value="destinations"><DestinationsConfig /></TabsContent>
      </Tabs>
    </div>
  );
}
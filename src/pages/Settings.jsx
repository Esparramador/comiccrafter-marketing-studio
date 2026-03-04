import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon, Key, Instagram, Save, Loader2, Eye, EyeOff, Bell } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import { toast } from "sonner";

export default function Settings() {
  useEffect(() => {
    base44.auth.me()
      .then((u) => { if (!u) base44.auth.redirectToLogin(); })
      .catch(() => base44.auth.redirectToLogin());
  }, []);

  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [formData, setFormData] = useState({
    instagram_business_id: "",
    instagram_token: "",
    auto_publish_enabled: false,
    publish_schedule_enabled: false,
    notification_email: true,
  });

  useEffect(() => {
    base44.auth.me().then((u) => setCurrentUser(u));
  }, []);

  const { data: userProfile } = useQuery({
    queryKey: ["user-settings", currentUser?.email],
    enabled: !!currentUser?.email,
    queryFn: () =>
      base44.entities.UserProfile.filter({ user_email: currentUser?.email }, "-created_date", 1)
        .then((results) => {
          if (results[0]) {
            setFormData((prev) => ({
              ...prev,
              instagram_business_id: results[0].instagram_business_id || "",
              auto_publish_enabled: results[0].auto_publish_enabled || false,
              publish_schedule_enabled: results[0].publish_schedule_enabled || false,
              notification_email: results[0].notification_email !== false,
            }));
            return results[0];
          }
          return null;
        }),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.functions.invoke("saveUserSettings", {
        user_email: currentUser.email,
        instagram_business_id: data.instagram_business_id,
        instagram_token: data.instagram_token,
        auto_publish_enabled: data.auto_publish_enabled,
        publish_schedule_enabled: data.publish_schedule_enabled,
        notification_email: data.notification_email,
        profile_id: userProfile?.id,
      });
      return result.data;
    },
    onSuccess: () => {
      toast.success("Configuración guardada");
      setFormData((prev) => ({ ...prev, instagram_token: "" }));
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    },
    onError: (error) => {
      toast.error(error.message || "Error al guardar configuración");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.instagram_business_id || !formData.instagram_token) {
      toast.error("Instagram Business ID y Token son requeridos");
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SectionHeader
        title="Configuración"
        subtitle="Gestiona tu cuenta y preferencias"
        icon={SettingsIcon}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Instagram Credentials Section */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-dim)]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Instagram API</h3>
          </div>

          {/* Business ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-3">
              Instagram Business Account ID
            </label>
            <input
              type="text"
              value={formData.instagram_business_id}
              onChange={(e) => setFormData({ ...formData, instagram_business_id: e.target.value })}
              placeholder="Tu ID de cuenta de negocio (ej: 12345678901234)"
              className="w-full bg-[var(--surface)] border border-[var(--border-dim)] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-2">
              Obtén tu ID en Meta Business Suite → Instagram → Configuración
            </p>
          </div>

          {/* Access Token */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-3">
              <Key className="w-4 h-4 inline mr-2" />
              Access Token (Long-Lived)
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={formData.instagram_token}
                onChange={(e) => setFormData({ ...formData, instagram_token: e.target.value })}
                placeholder="Tu token de acceso largo plazo"
                className="w-full bg-[var(--surface)] border border-[var(--border-dim)] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Genera un token en Meta App Dashboard. Usa tipo "Long-lived" (60 días) para mayor estabilidad.
            </p>
          </div>
        </div>

        {/* Publishing Options */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Instagram className="w-5 h-5 text-violet-400" />
            Opciones de Publicación
          </h3>

          <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={formData.auto_publish_enabled}
              onChange={(e) => setFormData({ ...formData, auto_publish_enabled: e.target.checked })}
              className="w-5 h-5 rounded accent-violet-500"
            />
            <div>
              <p className="text-white font-medium">Publicación Automática</p>
              <p className="text-xs text-gray-500">Publica automáticamente en Instagram al aprobar</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={formData.publish_schedule_enabled}
              onChange={(e) => setFormData({ ...formData, publish_schedule_enabled: e.target.checked })}
              className="w-5 h-5 rounded accent-violet-500"
            />
            <div>
              <p className="text-white font-medium">Programar Publicaciones</p>
              <p className="text-xs text-gray-500">Programa posts para publicar en fechas específicas</p>
            </div>
          </label>
        </div>

        {/* Notifications */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-violet-400" />
            Notificaciones
          </h3>

          <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={formData.notification_email}
              onChange={(e) => setFormData({ ...formData, notification_email: e.target.checked })}
              className="w-5 h-5 rounded accent-violet-500"
            />
            <div>
              <p className="text-white font-medium">Notificaciones por Email</p>
              <p className="text-xs text-gray-500">Recibe alertas de publicaciones y errores</p>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saveMutation.isPending ? "Guardando..." : "Guardar Configuración"}
        </button>
      </form>
    </div>
  );
}
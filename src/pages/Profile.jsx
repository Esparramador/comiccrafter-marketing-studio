import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, FileText, Save, Loader2 } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import { toast } from "sonner";

export default function Profile() {
  useEffect(() => {
    base44.auth.me()
      .then((u) => { if (!u) base44.auth.redirectToLogin(); })
      .catch(() => base44.auth.redirectToLogin());
  }, []);

  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
  });

  useEffect(() => {
    base44.auth.me().then((u) => {
      setCurrentUser(u);
      setFormData({ full_name: u?.full_name || "", bio: u?.bio || "" });
    });
  }, []);

  const { data: userProfile } = useQuery({
    queryKey: ["user-profile", currentUser?.email],
    enabled: !!currentUser?.email,
    queryFn: () =>
      base44.entities.UserProfile.filter({ user_email: currentUser.email }, "-created_date", 1)
        .then((results) => results[0] || null),
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe({ full_name: data.full_name, bio: data.bio });
      
      // Actualizar o crear UserProfile
      if (userProfile) {
        await base44.entities.UserProfile.update(userProfile.id, {
          full_name: data.full_name,
          bio: data.bio,
        });
      } else {
        await base44.entities.UserProfile.create({
          user_email: currentUser.email,
          full_name: data.full_name,
          bio: data.bio,
        });
      }
    },
    onSuccess: () => {
      toast.success("Perfil actualizado");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar perfil");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SectionHeader
        title="Mi Perfil"
        subtitle="Gestiona tu información personal"
        icon={User}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email - Read only */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl p-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-3">
            <Mail className="w-4 h-4" />
            Email
          </label>
          <input
            type="email"
            value={currentUser?.email || ""}
            disabled
            className="w-full bg-[var(--surface)] border border-[var(--border-dim)] rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-2">Tu email no puede modificarse</p>
        </div>

        {/* Full Name */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl p-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-3">
            <User className="w-4 h-4" />
            Nombre Completo
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Tu nombre"
            className="w-full bg-[var(--surface)] border border-[var(--border-dim)] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Bio */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-2xl p-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-3">
            <FileText className="w-4 h-4" />
            Biografía
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Cuéntanos sobre ti..."
            rows="4"
            className="w-full bg-[var(--surface)] border border-[var(--border-dim)] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
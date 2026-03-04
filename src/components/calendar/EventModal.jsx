import React, { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { X, Plus, Pencil, Trash2, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function EventModal({ date, events: initialEvents, onClose, onRefresh }) {
  const [events, setEvents] = useState(initialEvents);
  const [editing, setEditing] = useState(null); // eventId or "new"
  const [form, setForm] = useState({ summary: "", description: "", startTime: "", endTime: "" });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const dateStr = format(date, "yyyy-MM-dd");

  const startEdit = (ev) => {
    setEditing(ev.id);
    const startT = ev.start?.dateTime?.split("T")[1]?.slice(0, 5) || "";
    const endT = ev.end?.dateTime?.split("T")[1]?.slice(0, 5) || "";
    setForm({ summary: ev.summary || "", description: ev.description || "", startTime: startT, endTime: endT });
  };

  const startNew = () => {
    setEditing("new");
    setForm({ summary: "", description: "", startTime: "", endTime: "" });
  };

  const handleSave = async () => {
    if (!form.summary.trim()) { toast.error("El título es obligatorio"); return; }
    setLoading(true);
    try {
      if (editing === "new") {
        const res = await base44.functions.invoke("gcalCreateEvent", { ...form, date: dateStr });
        const newEv = res.data.event;
        setEvents((prev) => [...prev, newEv]);
        toast.success("Evento creado");
      } else {
        const res = await base44.functions.invoke("gcalUpdateEvent", { eventId: editing, ...form, date: dateStr });
        const updated = res.data.event;
        setEvents((prev) => prev.map((e) => (e.id === editing ? updated : e)));
        toast.success("Evento actualizado");
      }
      setEditing(null);
      onRefresh();
    } catch (e) {
      toast.error("Error al guardar");
    }
    setLoading(false);
  };

  const handleDelete = async (eventId) => {
    if (!confirm("¿Eliminar este evento de Google Calendar?")) return;
    setDeleting(eventId);
    try {
      await base44.functions.invoke("gcalDeleteEvent", { eventId });
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success("Evento eliminado");
      onRefresh();
    } catch (e) {
      toast.error("Error al eliminar");
    }
    setDeleting(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[var(--surface)] border border-[var(--border-dim)] rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-dim)]">
          <div>
            <h3 className="text-white font-bold text-base">
              {format(date, "EEEE d MMMM", { locale: es })}
            </h3>
            <p className="text-xs text-gray-500">{events.length} evento{events.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Events list */}
        <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
          {events.length === 0 && editing !== "new" && (
            <p className="text-sm text-gray-500 text-center py-4">No hay eventos este día</p>
          )}
          {events.map((ev) => (
            <div key={ev.id}>
              {editing === ev.id ? (
                <EventForm form={form} setForm={setForm} loading={loading} onSave={handleSave} onCancel={() => setEditing(null)} />
              ) : (
                <div className="flex items-start justify-between gap-2 bg-[var(--surface-raised)] rounded-xl px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{ev.summary || "(Sin título)"}</p>
                    {ev.start?.dateTime && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {ev.start.dateTime.split("T")[1]?.slice(0, 5)} – {ev.end?.dateTime?.split("T")[1]?.slice(0, 5)}
                      </p>
                    )}
                    {ev.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{ev.description}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEdit(ev)} className="p-1.5 rounded-lg hover:bg-violet-600/20 text-gray-400 hover:text-violet-400">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(ev.id)} disabled={deleting === ev.id} className="p-1.5 rounded-lg hover:bg-red-600/20 text-gray-400 hover:text-red-400">
                      {deleting === ev.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {editing === "new" && (
            <EventForm form={form} setForm={setForm} loading={loading} onSave={handleSave} onCancel={() => setEditing(null)} />
          )}
        </div>

        {/* Footer */}
        {editing === null && (
          <div className="px-4 pb-4">
            <button
              onClick={startNew}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-violet-600/40 text-violet-400 hover:bg-violet-600/10 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Nuevo evento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EventForm({ form, setForm, loading, onSave, onCancel }) {
  return (
    <div className="bg-[var(--surface-raised)] rounded-xl p-3 space-y-2 border border-violet-600/20">
      <input
        value={form.summary}
        onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
        placeholder="Título del evento *"
        className="w-full bg-black/30 border border-[var(--border-dim)] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
      />
      <input
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        placeholder="Descripción (opcional)"
        className="w-full bg-black/30 border border-[var(--border-dim)] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
      />
      <div className="flex gap-2">
        <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
          className="flex-1 bg-black/30 border border-[var(--border-dim)] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500" />
        <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
          className="flex-1 bg-black/30 border border-[var(--border-dim)] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500" />
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Guardar
        </button>
        <button onClick={onCancel} className="px-4 py-1.5 rounded-lg text-gray-400 hover:bg-white/5 text-sm">Cancelar</button>
      </div>
    </div>
  );
}
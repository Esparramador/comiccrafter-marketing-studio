import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, X, Check, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function EventForm({ date, event, onSave, onCancel }) {
  const [summary, setSummary] = useState(event?.summary || "");
  const [description, setDescription] = useState(event?.description || "");
  const [startTime, setStartTime] = useState(
    event?.start?.dateTime ? event.start.dateTime.slice(11, 16) : ""
  );
  const [endTime, setEndTime] = useState(
    event?.end?.dateTime ? event.end.dateTime.slice(11, 16) : ""
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!summary.trim()) return toast.error("El título es obligatorio");
    setSaving(true);
    await onSave({ summary, description, startTime, endTime });
    setSaving(false);
  };

  return (
    <div className="space-y-3 bg-[#0d0d18] border border-violet-500/20 rounded-xl p-4">
      <Input
        placeholder="Título del evento"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="bg-[#1a1a24] border-[#2a2a3f] text-white"
      />
      <Textarea
        placeholder="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="bg-[#1a1a24] border-[#2a2a3f] text-white h-16 resize-none"
      />
      <div className="flex gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-[#1a1a24] border-[#2a2a3f] text-white text-xs"
          />
        </div>
        <span className="text-gray-500 self-center">→</span>
        <Input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="bg-[#1a1a24] border-[#2a2a3f] text-white text-xs flex-1"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-400">
          <X className="w-3.5 h-3.5 mr-1" /> Cancelar
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
          <Check className="w-3.5 h-3.5 mr-1" /> {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

export default function EventModal({ date, events, onClose, onRefresh }) {
  const [editingId, setEditingId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
  const displayDate = date ? format(date, "EEEE d 'de' MMMM yyyy", { locale: es }) : "";

  const handleCreate = async ({ summary, description, startTime, endTime }) => {
    await base44.functions.invoke("gcalCreateEvent", { summary, description, date: dateStr, startTime, endTime });
    toast.success("Evento creado");
    setShowNew(false);
    onRefresh();
  };

  const handleUpdate = async (event, { summary, description, startTime, endTime }) => {
    const eventDate = (event.start?.dateTime || event.start?.date || "").slice(0, 10);
    await base44.functions.invoke("gcalUpdateEvent", { eventId: event.id, summary, description, date: eventDate || dateStr, startTime, endTime });
    toast.success("Evento actualizado");
    setEditingId(null);
    onRefresh();
  };

  const handleDelete = async (eventId) => {
    setDeletingId(eventId);
    await base44.functions.invoke("gcalDeleteEvent", { eventId });
    toast.success("Evento eliminado");
    setDeletingId(null);
    onRefresh();
  };

  const getEventTime = (event) => {
    if (event.start?.dateTime) return event.start.dateTime.slice(11, 16);
    return "Todo el día";
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#111118] border-[#1f1f2e] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize text-white">{displayDate}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {events.length === 0 && !showNew && (
            <p className="text-gray-500 text-sm text-center py-4">Sin eventos este día</p>
          )}

          {events.map((ev) => (
            <div key={ev.id}>
              {editingId === ev.id ? (
                <EventForm
                  date={date}
                  event={ev}
                  onSave={(data) => handleUpdate(ev, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-start justify-between gap-2 bg-[#1a1a24] rounded-xl px-3 py-2.5 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                      <p className="text-sm font-medium text-white truncate">{ev.summary}</p>
                    </div>
                    <p className="text-xs text-gray-500 ml-4 mt-0.5">{getEventTime(ev)}</p>
                    {ev.description && (
                      <p className="text-xs text-gray-400 ml-4 mt-0.5 line-clamp-2">{ev.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-violet-400" onClick={() => setEditingId(ev.id)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-red-400" disabled={deletingId === ev.id} onClick={() => handleDelete(ev.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showNew && (
            <EventForm date={date} onSave={handleCreate} onCancel={() => setShowNew(false)} />
          )}
        </div>

        {!showNew && (
          <Button onClick={() => setShowNew(true)} variant="outline" className="w-full border-violet-500/30 text-violet-400 hover:bg-violet-600/10">
            <Plus className="w-4 h-4 mr-2" /> Nuevo evento
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
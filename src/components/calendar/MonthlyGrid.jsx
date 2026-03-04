import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import EventModal from "./EventModal";
import { cn } from "@/lib/utils";

const DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const EVENT_COLORS = [
  "bg-violet-500", "bg-fuchsia-500", "bg-cyan-500",
  "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-sky-500"
];

function getColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length];
}

export default function MonthlyGrid() {
  const [current, setCurrent] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const queryClient = useQueryClient();

  const year = current.getFullYear();
  const month = current.getMonth() + 1;

  const { data, isLoading } = useQuery({
    queryKey: ["gcal-events", year, month],
    queryFn: async () => {
      const res = await base44.functions.invoke("gcalGetEvents", { year, month });
      return res.data.events || [];
    },
  });

  const events = data || [];

  const eventsMap = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const dateKey = (ev.start?.dateTime || ev.start?.date || "").slice(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(ev);
    });
    return map;
  }, [events]);

  // Build calendar grid (Mon-Sun weeks)
  const gridStart = startOfWeek(startOfMonth(current), { weekStartsOn: 1 });
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedEvents = selectedDateStr ? (eventsMap[selectedDateStr] || []) : [];

  const prevMonth = () => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["gcal-events", year, month] });
  };

  return (
    <div className="bg-[#111118] rounded-2xl border border-[#1f1f2e] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f2e]">
        <h2 className="text-base font-bold text-white capitalize">
          {format(current, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-[#1f1f2e]">
        {DOW.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-gray-500 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsMap[key] || [];
          const inMonth = isSameMonth(day, current);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "relative min-h-[72px] p-1.5 text-left border-b border-r border-[#1f1f2e] transition-colors",
                "hover:bg-violet-600/10",
                !inMonth && "opacity-30",
                isSelected && "bg-violet-600/15 ring-1 ring-inset ring-violet-500/40",
                idx % 7 === 6 && "border-r-0"
              )}
            >
              <span
                className={cn(
                  "text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full mb-1",
                  today ? "bg-violet-600 text-white" : "text-gray-300"
                )}
              >
                {format(day, "d")}
              </span>

              <div className="flex flex-wrap gap-1">
                {dayEvents.slice(0, 3).map((ev) => (
                  <span
                    key={ev.id}
                    className={cn("w-2 h-2 rounded-full", getColor(ev.summary || ev.id))}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[9px] text-gray-500">+{dayEvents.length - 3}</span>
                )}
              </div>

              {dayEvents.slice(0, 2).map((ev) => (
                <div
                  key={ev.id}
                  className={cn(
                    "hidden sm:block text-[10px] leading-tight rounded px-1 py-0.5 text-white truncate mb-0.5",
                    getColor(ev.summary || ev.id), "bg-opacity-30"
                  )}
                  style={{ backgroundColor: undefined }}
                >
                  <span className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle", getColor(ev.summary || ev.id))} />
                  {ev.summary}
                </div>
              ))}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <EventModal
          date={selectedDate}
          events={selectedEvents}
          onClose={() => setSelectedDate(null)}
          onRefresh={() => { setSelectedDate(null); handleRefresh(); }}
        />
      )}
    </div>
  );
}
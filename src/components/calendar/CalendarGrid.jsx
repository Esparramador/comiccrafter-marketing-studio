import React from "react";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday } from "date-fns";
import { es } from "date-fns/locale";

const EVENT_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500",
  "bg-pink-500", "bg-cyan-500", "bg-orange-500", "bg-rose-500"
];

function getEventColor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length];
}

export default function CalendarGrid({ currentDate, events, onDayClick }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const getEventsForDay = (d) => {
    const dateStr = format(d, "yyyy-MM-dd");
    return events.filter((e) => {
      const start = e.start?.date || e.start?.dateTime?.split("T")[0];
      return start === dateStr;
    });
  };

  return (
    <div className="flex-1 overflow-hidden">
      {/* Week headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((wd) => (
          <div key={wd} className="text-center text-xs font-semibold text-gray-500 py-2 uppercase tracking-widest">
            {wd}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-px bg-[var(--border-dim)] rounded-xl overflow-hidden">
        {days.map((d, i) => {
          const dayEvents = getEventsForDay(d);
          const isCurrentMonth = isSameMonth(d, currentDate);
          const todayDay = isToday(d);

          return (
            <button
              key={i}
              onClick={() => onDayClick(d, dayEvents)}
              className={cn(
                "min-h-[80px] p-2 text-left transition-colors relative group",
                isCurrentMonth
                  ? "bg-[var(--surface-raised)] hover:bg-violet-600/10"
                  : "bg-[#0d0d14] hover:bg-white/5",
              )}
            >
              <span className={cn(
                "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                todayDay
                  ? "bg-violet-600 text-white"
                  : isCurrentMonth ? "text-gray-300" : "text-gray-600"
              )}>
                {format(d, "d")}
              </span>

              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className={cn("w-full h-1.5 rounded-full", getEventColor(ev.id))}
                    title={ev.summary}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[9px] text-gray-500">+{dayEvents.length - 3} más</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
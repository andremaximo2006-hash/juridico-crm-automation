"use client";

import { Header } from "@/components/layout/Header";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin } from "lucide-react";

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function AgendaPage() {
  const [now] = useState(() => new Date());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [currentMonth, currentYear]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/agenda?year=${currentYear}&month=${currentMonth}`
      );
      if (!res.ok) throw new Error("Erro ao buscar agenda");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month, 0).getDate();

  const getFirstDayOfMonth = (month: number, year: number) =>
    new Date(year, month - 1, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const getEventsForDay = (day: number) =>
    events.filter((event) => {
      const eventDate =
        event.start.dateTime || event.start.date;
      const eventDay = parseInt(
        eventDate?.substring(8, 10) || "0"
      );
      return eventDay === day;
    });

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Agenda"
        subtitle={`${MONTHS[currentMonth - 1]} de ${currentYear}`}
      />

      {/* Calendar Header */}
      <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold">
            {MONTHS[currentMonth - 1]} {currentYear}
          </h2>
          <button
            onClick={handleNextMonth}
            className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto bg-slate-50 p-4 dark:bg-slate-800">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin mb-2">📅</div>
              <p className="text-slate-600 dark:text-slate-400">
                Carregando agenda...
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-900">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-slate-600 dark:text-slate-400 text-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                const dayEvents = day ? getEventsForDay(day as number) : [];
                return (
                  <div
                    key={idx}
                    className={`min-h-24 p-2 rounded border ${
                      !day
                        ? "bg-slate-50 dark:bg-slate-800"
                        : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {day && (
                      <>
                        <div className="text-sm font-semibold mb-1">
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 p-1 rounded truncate cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
                              title={event.summary}
                            >
                              {event.summary}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              +{dayEvents.length - 2} mais
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Events list */}
      {events.length > 0 && (
        <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 max-h-60 overflow-y-auto">
          <h3 className="font-semibold mb-3">Eventos do mês</h3>
          <div className="space-y-2">
            {events.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-2 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Clock size={16} className="mt-1 flex-shrink-0 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {event.summary}
                  </p>
                  {event.location && (
                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                      <MapPin size={12} />
                      {event.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

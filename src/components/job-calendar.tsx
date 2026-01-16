"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  User,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  time: string | null;
  duration: string | null;
  location: string;
  payAmount: number;
  worker: {
    id: string;
    displayName: string;
    avatarId: string | null;
  } | null;
}

const categoryEmojis: Record<string, string> = {
  BABYSITTING: "👶",
  DOG_WALKING: "🐕",
  SNOW_CLEARING: "❄️",
  CLEANING: "🧹",
  DIY_HELP: "🔧",
  TECH_HELP: "💻",
  ERRANDS: "🏃",
  OTHER: "✨",
};

const statusColors: Record<string, string> = {
  POSTED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  ASSIGNED: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  IN_PROGRESS: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const avatarOptions: Record<string, string> = {
  avatar1: "😊",
  avatar2: "😎",
  avatar3: "🤓",
  avatar4: "😄",
  avatar5: "🙂",
  avatar6: "🌟",
  avatar7: "💪",
  avatar8: "🎯",
};

export function JobCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["calendar-events", format(monthStart, "yyyy-MM")],
    queryFn: async () => {
      const response = await fetch(
        `/api/employer/calendar?start=${monthStart.toISOString()}&end=${monthEnd.toISOString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.date), date));
  };

  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentMonth(new Date());
                  setSelectedDate(new Date());
                }}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[80px] p-1 rounded-lg border transition-colors text-left",
                    isCurrentMonth
                      ? "bg-background hover:bg-muted/50"
                      : "bg-muted/30 text-muted-foreground",
                    isSelected && "ring-2 ring-primary",
                    isToday(day) && "border-primary"
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-medium mb-1",
                      isToday(day) && "text-primary"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs px-1 py-0.5 rounded truncate",
                          statusColors[event.status]
                        )}
                      >
                        {categoryEmojis[event.category]} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day events */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No jobs scheduled for this day
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedEvents.map((event) => (
                      <Link
                        key={event.id}
                        href={`/jobs/${event.id}`}
                        className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">
                                {categoryEmojis[event.category] || "✨"}
                              </span>
                              <span className="font-medium">{event.title}</span>
                              <Badge
                                variant="secondary"
                                className={cn("text-xs", statusColors[event.status])}
                              >
                                {event.status}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              {event.time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {event.time}
                                  {event.duration && ` (${event.duration})`}
                                </span>
                              )}
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {event.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5" />
                                {formatCurrency(event.payAmount)}
                              </span>
                            </div>

                            {event.worker && (
                              <div className="flex items-center gap-2 mt-2 text-sm">
                                {event.worker.avatarId ? (
                                  <span className="text-base">
                                    {avatarOptions[event.worker.avatarId] || "😊"}
                                  </span>
                                ) : (
                                  <User className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="font-medium">
                                  {event.worker.displayName}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

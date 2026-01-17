"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  Video,
  Building2,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  type: "jobfair" | "webinar" | "meetup" | "workshop";
  industry: string[];
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  organizer: string;
  description: string;
  registrationUrl: string;
  spots?: number;
}

const events: Event[] = [
  {
    id: "1",
    title: "NAV Jobbmesse Oslo 2025",
    type: "jobfair",
    industry: ["all"],
    date: "2025-02-15",
    time: "10:00 - 16:00",
    location: "Oslo Spektrum",
    isOnline: false,
    organizer: "NAV",
    description: "Norges største jobbmesse med over 100 arbeidsgivere. Gratis inngang for arbeidssøkere.",
    registrationUrl: "https://www.nav.no",
    spots: 5000,
  },
  {
    id: "2",
    title: "Tech Karriere Webinar: Kom i gang med koding",
    type: "webinar",
    industry: ["tech"],
    date: "2025-02-08",
    time: "18:00 - 19:30",
    location: "Online (Zoom)",
    isOnline: true,
    organizer: "Kode24",
    description: "Lær hvordan du kan starte en karriere i tech uten formell utdanning. Tips til selvlæring og bootcamps.",
    registrationUrl: "https://www.kode24.no",
  },
  {
    id: "3",
    title: "Bergen Tech Meetup",
    type: "meetup",
    industry: ["tech"],
    date: "2025-02-20",
    time: "18:00 - 21:00",
    location: "Media City Bergen",
    isOnline: false,
    organizer: "Bergen Tech Community",
    description: "Nettverkskveld for tech-interesserte i Bergen. Presentasjoner og mingling.",
    registrationUrl: "https://www.meetup.com",
    spots: 100,
  },
  {
    id: "4",
    title: "Lærling i energibransjen - Informasjonsmøte",
    type: "webinar",
    industry: ["green"],
    date: "2025-02-12",
    time: "14:00 - 15:00",
    location: "Online (Teams)",
    isOnline: true,
    organizer: "Energi Norge",
    description: "Alt du trenger å vite om lærlingplasser i energibransjen. Q&A med nåværende lærlinger.",
    registrationUrl: "https://www.energinorge.no",
  },
  {
    id: "5",
    title: "Healthcare Karrieredag Trondheim",
    type: "jobfair",
    industry: ["health"],
    date: "2025-03-01",
    time: "09:00 - 15:00",
    location: "St. Olavs Hospital",
    isOnline: false,
    organizer: "Helse Midt-Norge",
    description: "Møt arbeidsgivere i helsesektoren. Lær om utdanningsveier og jobbmuligheter.",
    registrationUrl: "https://www.helse-midt.no",
    spots: 300,
  },
  {
    id: "6",
    title: "Kreativ Bransje Workshop: Bygg din portefølje",
    type: "workshop",
    industry: ["creative"],
    date: "2025-02-25",
    time: "17:00 - 20:00",
    location: "Kulturhuset, Oslo",
    isOnline: false,
    organizer: "Grafill",
    description: "Praktisk workshop om hvordan du bygger en portefølje som skiller seg ut.",
    registrationUrl: "https://www.grafill.no",
    spots: 30,
  },
];

const typeConfig = {
  jobfair: { label: "Jobbmesse", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400", icon: Building2 },
  webinar: { label: "Webinar", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400", icon: Video },
  meetup: { label: "Meetup", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400", icon: Users },
  workshop: { label: "Workshop", color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400", icon: Clock },
};

const industryFilters = [
  { id: "all", label: "Alle" },
  { id: "tech", label: "Tech" },
  { id: "green", label: "Grønn Energi" },
  { id: "health", label: "Helse" },
  { id: "creative", label: "Kreativ" },
];

export function EventsCalendar() {
  const [filter, setFilter] = useState<string>("all");

  const filteredEvents = filter === "all"
    ? events
    : events.filter((e) => e.industry.includes(filter) || e.industry.includes("all"));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("nb-NO", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const isUpcoming = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    return eventDate >= today;
  };

  const sortedEvents = filteredEvents
    .filter((e) => isUpcoming(e.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="border-2 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-orange-500 to-red-500" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Events & Job Fairs
        </CardTitle>
        <CardDescription>Upcoming career events, webinars, and networking opportunities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {industryFilters.map((ind) => (
            <button
              key={ind.id}
              onClick={() => setFilter(ind.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === ind.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {ind.label}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => {
              const TypeIcon = typeConfig[event.type].icon;
              return (
                <div
                  key={event.id}
                  className="p-4 rounded-xl border-2 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Box */}
                    <div className="flex-shrink-0 w-16 text-center p-2 rounded-lg bg-primary/10">
                      <div className="text-xs text-muted-foreground uppercase">
                        {new Date(event.date).toLocaleDateString("nb-NO", { month: "short" })}
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {new Date(event.date).getDate()}
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={typeConfig[event.type].color}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {typeConfig[event.type].label}
                        </Badge>
                        {event.isOnline && (
                          <Badge variant="outline" className="text-[10px]">
                            <Video className="h-3 w-3 mr-1" />
                            Online
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold text-sm mb-1">{event.title}</h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                        {event.spots && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.spots} plasser
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mb-3">
                        {event.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Arrangør: {event.organizer}
                        </span>
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={event.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Registrer deg
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Ingen kommende arrangementer i denne kategorien</p>
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          💡 <span className="font-semibold">Tips:</span> Jobbmesser er en flott måte å møte
          arbeidsgivere ansikt til ansikt. Ta med CV og vær forberedt på å presentere deg selv!
        </div>
      </CardContent>
    </Card>
  );
}

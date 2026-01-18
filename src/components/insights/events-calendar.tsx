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
    title: "Web Summit 2025",
    type: "jobfair",
    industry: ["tech"],
    date: "2025-11-10",
    time: "09:00 - 18:00",
    location: "Lisbon, Portugal",
    isOnline: false,
    organizer: "Web Summit",
    description: "Europe's largest tech conference with career opportunities and networking with top companies.",
    registrationUrl: "https://websummit.com",
    spots: 70000,
  },
  {
    id: "2",
    title: "Tech Career Webinar: Getting Started in Coding",
    type: "webinar",
    industry: ["tech"],
    date: "2025-02-15",
    time: "18:00 - 19:30",
    location: "Online (Zoom)",
    isOnline: true,
    organizer: "FreeCodeCamp",
    description: "Learn how to start a career in tech without formal education. Tips for self-learning and bootcamps.",
    registrationUrl: "https://www.freecodecamp.org",
  },
  {
    id: "3",
    title: "Berlin Tech Meetup",
    type: "meetup",
    industry: ["tech"],
    date: "2025-03-20",
    time: "18:00 - 21:00",
    location: "Berlin, Germany",
    isOnline: false,
    organizer: "Berlin Tech Community",
    description: "Networking evening for tech enthusiasts in Berlin. Presentations and mingling.",
    registrationUrl: "https://www.meetup.com",
    spots: 150,
  },
  {
    id: "4",
    title: "European Green Energy Summit",
    type: "jobfair",
    industry: ["green"],
    date: "2025-04-12",
    time: "09:00 - 17:00",
    location: "Amsterdam, Netherlands",
    isOnline: false,
    organizer: "EU Energy Council",
    description: "Connect with leading renewable energy companies. Learn about career paths in the green sector.",
    registrationUrl: "https://www.euenergycouncil.com",
    spots: 2000,
  },
  {
    id: "5",
    title: "Healthcare Innovation Conference",
    type: "workshop",
    industry: ["health"],
    date: "2025-05-01",
    time: "10:00 - 16:00",
    location: "Copenhagen, Denmark",
    isOnline: false,
    organizer: "EU Healthcare Alliance",
    description: "Meet healthcare employers and learn about education pathways and job opportunities.",
    registrationUrl: "https://www.healthcarealliance.eu",
    spots: 500,
  },
  {
    id: "6",
    title: "Creative Portfolio Workshop",
    type: "workshop",
    industry: ["creative"],
    date: "2025-02-25",
    time: "17:00 - 20:00",
    location: "Online (Zoom)",
    isOnline: true,
    organizer: "Behance",
    description: "Practical workshop on how to build a portfolio that stands out to employers.",
    registrationUrl: "https://www.behance.net",
    spots: 100,
  },
];

const typeConfig = {
  jobfair: { label: "Job Fair", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400", icon: Building2 },
  webinar: { label: "Webinar", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400", icon: Video },
  meetup: { label: "Meetup", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400", icon: Users },
  workshop: { label: "Workshop", color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400", icon: Clock },
};

const industryFilters = [
  { id: "all", label: "All" },
  { id: "tech", label: "Tech" },
  { id: "green", label: "Green Energy" },
  { id: "health", label: "Healthcare" },
  { id: "creative", label: "Creative" },
];

export function EventsCalendar() {
  const [filter, setFilter] = useState<string>("all");

  const filteredEvents = filter === "all"
    ? events
    : events.filter((e) => e.industry.includes(filter) || e.industry.includes("all"));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
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
        <CardDescription>Upcoming career events, webinars, and networking opportunities across Europe</CardDescription>
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
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
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
                            {event.spots.toLocaleString()} spots
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mb-3">
                        {event.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Organizer: {event.organizer}
                        </span>
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={event.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Register
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
              <p>No upcoming events in this category</p>
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <span className="font-semibold">Tip:</span> Job fairs are a great way to meet
          employers face to face. Bring your CV and be prepared to introduce yourself!
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

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
  // Tech events
  {
    id: "1",
    title: "Web Summit 2026",
    type: "jobfair",
    industry: ["tech"],
    date: "2026-11-10",
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
    date: "2026-02-20",
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
    date: "2026-03-15",
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
    title: "AWS Summit London",
    type: "jobfair",
    industry: ["tech"],
    date: "2026-04-23",
    time: "09:00 - 17:00",
    location: "London, UK",
    isOnline: false,
    organizer: "Amazon Web Services",
    description: "Cloud computing conference with hands-on labs, certifications, and career opportunities.",
    registrationUrl: "https://aws.amazon.com/events/summits",
    spots: 10000,
  },
  {
    id: "5",
    title: "React Europe Conference",
    type: "meetup",
    industry: ["tech"],
    date: "2026-05-14",
    time: "09:00 - 18:00",
    location: "Paris, France",
    isOnline: false,
    organizer: "React Europe",
    description: "The premier React.js conference in Europe. Learn from industry experts and network with developers.",
    registrationUrl: "https://www.react-europe.org",
    spots: 1500,
  },
  // Green energy events
  {
    id: "6",
    title: "European Green Energy Summit",
    type: "jobfair",
    industry: ["green"],
    date: "2026-04-12",
    time: "09:00 - 17:00",
    location: "Amsterdam, Netherlands",
    isOnline: false,
    organizer: "EU Energy Council",
    description: "Connect with leading renewable energy companies. Learn about career paths in the green sector.",
    registrationUrl: "https://www.euenergycouncil.com",
    spots: 2000,
  },
  {
    id: "7",
    title: "Wind Energy Career Day",
    type: "jobfair",
    industry: ["green"],
    date: "2026-03-08",
    time: "10:00 - 16:00",
    location: "Copenhagen, Denmark",
    isOnline: false,
    organizer: "WindEurope",
    description: "Meet employers like Vestas and Ørsted. Learn about wind turbine technician careers.",
    registrationUrl: "https://windeurope.org",
    spots: 500,
  },
  {
    id: "8",
    title: "Solar Power International Europe",
    type: "workshop",
    industry: ["green"],
    date: "2026-06-20",
    time: "09:00 - 17:00",
    location: "Munich, Germany",
    isOnline: false,
    organizer: "Solar Energy Industries Association",
    description: "Hands-on workshops on solar installation and maintenance. Career pathways in solar energy.",
    registrationUrl: "https://www.solarpowerinternational.com",
    spots: 3000,
  },
  {
    id: "9",
    title: "Green Jobs Webinar Series",
    type: "webinar",
    industry: ["green"],
    date: "2026-02-25",
    time: "17:00 - 18:30",
    location: "Online (Teams)",
    isOnline: true,
    organizer: "European Climate Foundation",
    description: "Monthly webinar on careers in sustainability, renewable energy, and environmental services.",
    registrationUrl: "https://europeanclimate.org",
  },
  // Healthcare events
  {
    id: "10",
    title: "NHS Careers Fair",
    type: "jobfair",
    industry: ["health"],
    date: "2026-03-22",
    time: "10:00 - 16:00",
    location: "London, UK",
    isOnline: false,
    organizer: "NHS England",
    description: "Meet NHS recruiters and learn about nursing, allied health, and support roles across the UK.",
    registrationUrl: "https://www.healthcareers.nhs.uk",
    spots: 5000,
  },
  {
    id: "11",
    title: "European Nursing Conference",
    type: "workshop",
    industry: ["health"],
    date: "2026-05-10",
    time: "09:00 - 17:00",
    location: "Barcelona, Spain",
    isOnline: false,
    organizer: "European Federation of Nurses",
    description: "Professional development, networking, and job opportunities for nurses across Europe.",
    registrationUrl: "https://www.efn.eu",
    spots: 2000,
  },
  {
    id: "12",
    title: "Healthcare Career Webinar: Paths into Nursing",
    type: "webinar",
    industry: ["health"],
    date: "2026-02-08",
    time: "18:00 - 19:30",
    location: "Online (Zoom)",
    isOnline: true,
    organizer: "Royal College of Nursing",
    description: "Learn about different routes into nursing, from apprenticeships to university degrees.",
    registrationUrl: "https://www.rcn.org.uk",
  },
  {
    id: "13",
    title: "Hospital Job Fair - Mayo Clinic",
    type: "jobfair",
    industry: ["health"],
    date: "2026-04-05",
    time: "09:00 - 15:00",
    location: "Rochester, MN, USA",
    isOnline: false,
    organizer: "Mayo Clinic",
    description: "On-site interviews for nursing, patient care, and allied health positions at Mayo Clinic.",
    registrationUrl: "https://jobs.mayoclinic.org",
    spots: 1000,
  },
  {
    id: "14",
    title: "Mental Health Careers Workshop",
    type: "workshop",
    industry: ["health"],
    date: "2026-03-15",
    time: "14:00 - 17:00",
    location: "Online (Teams)",
    isOnline: true,
    organizer: "Mind UK",
    description: "Explore careers in mental health support, counseling, and psychiatric nursing.",
    registrationUrl: "https://www.mind.org.uk",
    spots: 200,
  },
  // Creative events
  {
    id: "15",
    title: "Creative Portfolio Workshop",
    type: "workshop",
    industry: ["creative"],
    date: "2026-02-28",
    time: "17:00 - 20:00",
    location: "Online (Zoom)",
    isOnline: true,
    organizer: "Behance",
    description: "Practical workshop on how to build a portfolio that stands out to employers.",
    registrationUrl: "https://www.behance.net",
    spots: 100,
  },
  {
    id: "16",
    title: "Adobe MAX Europe",
    type: "jobfair",
    industry: ["creative"],
    date: "2026-10-15",
    time: "09:00 - 18:00",
    location: "London, UK",
    isOnline: false,
    organizer: "Adobe",
    description: "The creativity conference. Workshops, networking, and career opportunities in design and media.",
    registrationUrl: "https://max.adobe.com",
    spots: 5000,
  },
  {
    id: "17",
    title: "Social Media Marketing Bootcamp",
    type: "webinar",
    industry: ["creative"],
    date: "2026-03-10",
    time: "10:00 - 16:00",
    location: "Online (Zoom)",
    isOnline: true,
    organizer: "HubSpot Academy",
    description: "Free intensive course on social media marketing, content creation, and brand building.",
    registrationUrl: "https://academy.hubspot.com",
  },
  {
    id: "18",
    title: "UX Design Career Day",
    type: "meetup",
    industry: ["creative", "tech"],
    date: "2026-04-18",
    time: "14:00 - 19:00",
    location: "Stockholm, Sweden",
    isOnline: false,
    organizer: "Interaction Design Foundation",
    description: "Meet UX teams from Spotify, Klarna, and more. Portfolio reviews and networking.",
    registrationUrl: "https://www.interaction-design.org",
    spots: 300,
  },
];

const typeConfig = {
  jobfair: { label: "Job Fair", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400", icon: Building2 },
  webinar: { label: "Webinar", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400", icon: Video },
  meetup: { label: "Meetup", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400", icon: Users },
  workshop: { label: "Workshop", color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400", icon: Clock },
};

interface EventsCalendarProps {
  industryTypes?: string[];
}

export function EventsCalendar({ industryTypes = [] }: EventsCalendarProps) {
  // Filter events based on user's career goal industry types
  const filteredEvents = industryTypes.length > 0
    ? events.filter((e) => e.industry.some(ind => industryTypes.includes(ind)))
    : events;

  // Get industry labels for display
  const industryLabels: Record<string, string> = {
    tech: "Tech & AI",
    green: "Green Energy",
    health: "Healthcare",
    creative: "Creative",
  };

  const activeIndustries = industryTypes.length > 0
    ? industryTypes.map(t => industryLabels[t] || t).join(", ")
    : "all industries";

  const isUpcoming = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    return eventDate >= today;
  };

  const sortedEvents = filteredEvents
    .filter((e) => isUpcoming(e.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Show only first 6 events for compact view
  const displayEvents = sortedEvents.slice(0, 6);

  return (
    <Card className="border-2 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-orange-500 to-red-500" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Events & Job Fairs
        </CardTitle>
        <CardDescription>
          {industryTypes.length > 0
            ? `Upcoming events in ${activeIndustries}`
            : "Upcoming career events and networking opportunities"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Compact Table View */}
        {displayEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Event</th>
                  <th className="text-left py-2 font-medium hidden sm:table-cell">Type</th>
                  <th className="text-left py-2 font-medium hidden md:table-cell">Location</th>
                  <th className="text-right py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {displayEvents.map((event) => {
                  const TypeIcon = typeConfig[event.type].icon;
                  return (
                    <tr key={event.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2 pr-3 whitespace-nowrap">
                        <div className="text-xs font-medium">
                          {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="font-medium text-xs truncate max-w-[180px]" title={event.title}>
                          {event.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground sm:hidden">
                          {event.isOnline ? "Online" : event.location.split(",")[0]}
                        </div>
                      </td>
                      <td className="py-2 pr-3 hidden sm:table-cell">
                        <Badge className={`${typeConfig[event.type].color} text-[10px] px-1.5 py-0`}>
                          <TypeIcon className="h-2.5 w-2.5 mr-0.5" />
                          {typeConfig[event.type].label}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {event.isOnline ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                          <span className="truncate max-w-[120px]">
                            {event.isOnline ? "Online" : event.location.split(",")[0]}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 text-right">
                        <a
                          href={event.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-primary hover:underline"
                        >
                          Register
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No upcoming events in this category
          </div>
        )}
      </CardContent>
    </Card>
  );
}

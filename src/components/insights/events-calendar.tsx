"use client";

import { useState, useEffect } from "react";
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
  Globe,
  Star,
  Loader2,
  Settings,
  ChevronDown,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationChangeModal } from "./location-change-modal";
import { CareerEventType, LocationMode } from "@prisma/client";

interface CareerEvent {
  id: string;
  title: string;
  type: CareerEventType;
  description: string;
  organizer: string;
  startDate: string;
  endDate?: string | null;
  time: string;
  locationMode: LocationMode;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  venue?: string | null;
  onlineUrl?: string | null;
  registrationUrl: string;
  spots?: number | null;
  isYouthFocused: boolean;
  industryTypes: string[];
  distanceKm?: number;
}

interface CityOption {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

interface EventsResponse {
  localEvents: CareerEvent[];
  onlineEvents: CareerEvent[];
  userHasLocation: boolean;
  locationInfo: {
    city?: string | null;
    region?: string | null;
    country?: string | null;
  };
  availableCities: CityOption[];
  appliedFilters: {
    city: string | null;
    country: string | null;
    includeOnline: boolean;
  };
}

const typeConfig: Record<
  CareerEventType,
  { label: string; color: string; icon: typeof Building2 }
> = {
  JOBFAIR: {
    label: "Job Fair",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    icon: Building2,
  },
  WEBINAR: {
    label: "Webinar",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
    icon: Video,
  },
  MEETUP: {
    label: "Meetup",
    color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    icon: Users,
  },
  WORKSHOP: {
    label: "Workshop",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
    icon: Clock,
  },
  CONFERENCE: {
    label: "Conference",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
    icon: Globe,
  },
};

interface EventsCalendarProps {
  industryTypes?: string[];
}

export function EventsCalendar({ industryTypes = [] }: EventsCalendarProps) {
  const [data, setData] = useState<EventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>(""); // Empty = user's location or all

  const fetchEvents = async (cityFilter?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (cityFilter) {
        params.set("city", cityFilter);
      }
      const url = `/api/career-events${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch events");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError("Unable to load events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(selectedCity || undefined);
  }, [selectedCity]);

  const handleCityChange = (value: string) => {
    setSelectedCity(value === "my-location" ? "" : value);
  };

  // Group cities by country for the dropdown
  const citiesByCountry = data?.availableCities?.reduce((acc, city) => {
    if (!acc[city.country]) acc[city.country] = [];
    acc[city.country].push(city);
    return acc;
  }, {} as Record<string, CityOption[]>) || {};

  const handleLocationSave = async (location: {
    city: string;
    region: string;
    country: string;
  }) => {
    const response = await fetch("/api/profile/location", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(location),
    });

    if (!response.ok) {
      throw new Error("Failed to save location");
    }

    // Refresh events with new location
    await fetchEvents();
  };

  // Filter events by industry if specified
  const filterByIndustry = (events: CareerEvent[]) => {
    if (industryTypes.length === 0) return events;
    return events.filter((e) =>
      e.industryTypes.some((ind) => industryTypes.includes(ind))
    );
  };

  // API returns max 10 events per section, already verified and sorted
  const localEvents = data ? filterByIndustry(data.localEvents) : [];
  const onlineEvents = data ? filterByIndustry(data.onlineEvents) : [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatLocation = (event: CareerEvent) => {
    if (event.locationMode === "ONLINE") return "Online";
    if (event.venue) return event.venue;
    const parts = [event.city, event.country].filter(Boolean);
    return parts.join(", ") || "Location TBA";
  };

  const renderEventRow = (event: CareerEvent, showDistance = false) => {
    const TypeIcon = typeConfig[event.type]?.icon || Building2;
    const typeStyle = typeConfig[event.type] || typeConfig.JOBFAIR;

    return (
      <tr key={event.id} className="border-b last:border-0 hover:bg-muted/30">
        <td className="py-2.5 pr-3 whitespace-nowrap">
          <div className="text-xs font-medium">{formatDate(event.startDate)}</div>
          {showDistance && event.distanceKm !== undefined && (
            <div className="text-[10px] text-muted-foreground">
              {Math.round(event.distanceKm)} km
            </div>
          )}
        </td>
        <td className="py-2.5 pr-3">
          <div className="flex items-start gap-1.5">
            {event.isYouthFocused && (
              <Star className="h-3 w-3 text-yellow-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div
                className="font-medium text-xs truncate max-w-[180px]"
                title={event.title}
              >
                {event.title}
              </div>
              <div className="text-[10px] text-muted-foreground sm:hidden">
                {formatLocation(event)}
              </div>
            </div>
          </div>
        </td>
        <td className="py-2.5 pr-3 hidden sm:table-cell">
          <Badge className={`${typeStyle.color} text-[10px] px-1.5 py-0`}>
            <TypeIcon className="h-2.5 w-2.5 mr-0.5" />
            {typeStyle.label}
          </Badge>
        </td>
        <td className="py-2.5 pr-3 hidden md:table-cell">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {event.locationMode === "ONLINE" ? (
              <Video className="h-3 w-3" />
            ) : (
              <MapPin className="h-3 w-3" />
            )}
            <span className="truncate max-w-[120px]">{formatLocation(event)}</span>
          </div>
        </td>
        <td className="py-2.5 text-right">
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
  };

  const renderEmptyState = (isLocal: boolean) => (
    <div className="text-center py-6 text-muted-foreground text-sm">
      {isLocal ? (
        <>
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No upcoming events near your location</p>
          <p className="text-xs mt-1">
            Check online events below or update your location
          </p>
        </>
      ) : (
        <>
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No upcoming online or Europe-wide events</p>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card className="border-2 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange-500 to-red-500" />
        <CardContent className="py-12">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading events...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange-500 to-red-500" />
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => fetchEvents()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* City Filter */}
      <Card className="border-2 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-primary" />
              Filter by Location
            </CardTitle>
          </div>
          <CardDescription>
            Browse career events across Europe or filter by a specific city
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Select value={selectedCity || "my-location"} onValueChange={handleCityChange}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Select a city..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="my-location">
                <span className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {data?.userHasLocation ? "My Location" : "All Events"}
                </span>
              </SelectItem>
              {/* Norway first */}
              {citiesByCountry["Norway"] && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                    🇳🇴 Norway
                  </div>
                  {citiesByCountry["Norway"].map((city) => (
                    <SelectItem key={city.city} value={city.city}>
                      {city.city}
                    </SelectItem>
                  ))}
                </>
              )}
              {/* Other Nordic countries */}
              {["Sweden", "Denmark", "Finland", "Iceland"].map((country) =>
                citiesByCountry[country] ? (
                  <div key={country}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                      {country === "Sweden" && "🇸🇪"}
                      {country === "Denmark" && "🇩🇰"}
                      {country === "Finland" && "🇫🇮"}
                      {country === "Iceland" && "🇮🇸"} {country}
                    </div>
                    {citiesByCountry[country].map((city) => (
                      <SelectItem key={city.city} value={city.city}>
                        {city.city}
                      </SelectItem>
                    ))}
                  </div>
                ) : null
              )}
              {/* Rest of Europe */}
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                🇪🇺 Europe
              </div>
              {Object.entries(citiesByCountry)
                .filter(([country]) => !["Norway", "Sweden", "Denmark", "Finland", "Iceland"].includes(country))
                .flatMap(([, cities]) => cities)
                .map((city) => (
                  <SelectItem key={city.city} value={city.city}>
                    {city.city}, {city.country}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Section 1: Career Events Near You */}
      <Card className="border-2 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange-500 to-red-500" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              {selectedCity ? `Events in ${selectedCity}` : "Career Events Near You"}
            </CardTitle>
            {!selectedCity && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocationModalOpen(true)}
                className="text-xs gap-1"
              >
                <Settings className="h-3 w-3" />
                {data?.userHasLocation ? "Change Location" : "Set Location"}
              </Button>
            )}
          </div>
          <CardDescription>
            {selectedCity
              ? `Showing events in ${selectedCity} and surrounding area`
              : data?.locationInfo?.city
              ? `Events within 50km of ${data.locationInfo.city}${
                  data.locationInfo.region ? `, ${data.locationInfo.region}` : ""
                }`
              : "Set your location to see nearby events"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!data?.userHasLocation ? (
            <div className="text-center py-6">
              <MapPin className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-3">
                Set your location to see career events near you
              </p>
              <Button onClick={() => setLocationModalOpen(true)}>
                Set My Location
              </Button>
            </div>
          ) : localEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Event</th>
                    <th className="text-left py-2 font-medium hidden sm:table-cell">
                      Type
                    </th>
                    <th className="text-left py-2 font-medium hidden md:table-cell">
                      Location
                    </th>
                    <th className="text-right py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>{localEvents.map((e) => renderEventRow(e, true))}</tbody>
              </table>
            </div>
          ) : (
            renderEmptyState(true)
          )}
        </CardContent>
      </Card>

      {/* Section 2: Online & Europe-wide Events */}
      <Card className="border-2 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-purple-500 to-blue-500" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Online & Europe-wide Events
          </CardTitle>
          <CardDescription>
            Virtual events and major conferences you can attend from anywhere
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onlineEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Event</th>
                    <th className="text-left py-2 font-medium hidden sm:table-cell">
                      Type
                    </th>
                    <th className="text-left py-2 font-medium hidden md:table-cell">
                      Location
                    </th>
                    <th className="text-right py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>{onlineEvents.map((e) => renderEventRow(e, false))}</tbody>
              </table>
            </div>
          ) : (
            renderEmptyState(false)
          )}
        </CardContent>
      </Card>

      {/* Youth-focused legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
        <Star className="h-3 w-3 text-yellow-500" />
        <span>Events marked with a star are specifically designed for ages 15-20</span>
      </div>

      {/* Location Change Modal */}
      <LocationChangeModal
        open={locationModalOpen}
        onOpenChange={setLocationModalOpen}
        currentLocation={data?.locationInfo || {}}
        onSave={handleLocationSave}
      />
    </div>
  );
}

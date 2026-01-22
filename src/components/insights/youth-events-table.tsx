/**
 * YOUTH EVENTS TABLE
 *
 * A comprehensive, filterable, paginated table of verified career events
 * from Norwegian and European sources.
 *
 * Features:
 * - Server-side data fetching from /api/events/youth
 * - Filtering by city, category, format, search query
 * - Pagination with configurable page size
 * - Responsive design (table on desktop, cards on mobile)
 * - Verified badge for confirmed events
 * - Direct registration links
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  ExternalLink,
  Video,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  Briefcase,
  Globe,
  Building2,
  Loader2,
  AlertCircle,
  GraduationCap,
  School,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  EventItem,
  EventCategory,
  EventFormat,
  EventProvider,
  YouthEventsResponse,
} from "@/lib/events/types";
import { PROVIDER_DISPLAY_NAMES } from "@/lib/events/types";

// ============================================
// TYPES
// ============================================

interface YouthEventsTableProps {
  className?: string;
  defaultPageSize?: number;
}

interface Filters {
  query: string;
  city: string;
  category: string;
  format: string;
  provider: string;
  months: number;
}

// ============================================
// PROVIDER BADGE STYLES
// ============================================

const PROVIDER_BADGE_STYLES: Record<EventProvider, string> = {
  tautdanning: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  oslomet: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
  "bi-karrieredagene": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  eures: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800",
};

// ============================================
// HELPERS
// ============================================

function formatDate(dateISO: string): string {
  const date = new Date(dateISO);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(dateISO: string): string {
  const date = new Date(dateISO);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function getRelativeTime(dateISO: string): string {
  const date = new Date(dateISO);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Past";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  return `In ${Math.ceil(diffDays / 30)} months`;
}

function getFormatIcon(format: EventFormat) {
  switch (format) {
    case "Online":
      return Video;
    case "In-person":
      return MapPin;
    case "Hybrid":
      return Users;
    default:
      return Globe;
  }
}

function getCategoryIcon(category: EventCategory) {
  switch (category) {
    case "Job Fair":
      return Briefcase;
    case "Conference":
      return Building2;
    case "Workshop":
    case "Webinar/Seminar":
    case "Meetup":
    default:
      return Calendar;
  }
}

// ============================================
// EVENT ROW COMPONENT
// ============================================

function EventRow({ event }: { event: EventItem }) {
  const FormatIcon = getFormatIcon(event.format);
  const CategoryIcon = getCategoryIcon(event.category);
  const relativeTime = getRelativeTime(event.startDateISO);
  const isUpcoming = relativeTime === "Today" || relativeTime === "Tomorrow";

  return (
    <tr className="border-b last:border-0 hover:bg-muted/50 transition-colors">
      {/* Date */}
      <td className="py-3 px-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {formatShortDate(event.startDateISO)}
          </span>
          <span
            className={`text-xs ${isUpcoming ? "text-amber-600 font-medium" : "text-muted-foreground"}`}
          >
            {relativeTime}
          </span>
        </div>
      </td>

      {/* Event */}
      <td className="py-3 px-4">
        <div className="flex items-start gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate max-w-[250px]">
                {event.title}
              </span>
              {event.verified && (
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0"
                >
                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {event.organizerName && (
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {event.organizerName}
                </span>
              )}
              <Badge
                variant="outline"
                className={`text-[9px] px-1 py-0 ${PROVIDER_BADGE_STYLES[event.provider]}`}
              >
                {PROVIDER_DISPLAY_NAMES[event.provider]}
              </Badge>
            </div>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="py-3 px-4 hidden md:table-cell">
        <div className="flex items-center gap-1.5">
          <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs">{event.category}</span>
        </div>
      </td>

      {/* Location */}
      <td className="py-3 px-4 hidden lg:table-cell">
        <div className="flex items-center gap-1.5">
          <FormatIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs">{event.locationLabel}</span>
        </div>
      </td>

      {/* Audience */}
      <td className="py-3 px-4 hidden xl:table-cell">
        <Badge variant="outline" className="text-[10px]">
          {event.audienceFit}
        </Badge>
      </td>

      {/* Action */}
      <td className="py-3 px-4">
        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" variant="outline" className="text-xs h-7 px-2">
            Register
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </a>
      </td>
    </tr>
  );
}

// ============================================
// EVENT CARD COMPONENT (MOBILE)
// ============================================

function EventCard({ event }: { event: EventItem }) {
  const FormatIcon = getFormatIcon(event.format);
  const relativeTime = getRelativeTime(event.startDateISO);
  const isUpcoming = relativeTime === "Today" || relativeTime === "Tomorrow";

  return (
    <div className="p-3 rounded-lg border bg-gradient-to-br from-background to-amber-50/20 dark:to-amber-950/10 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title and badges */}
          <div className="flex items-start gap-2 mb-1.5">
            <h4 className="font-medium text-sm leading-tight truncate">
              {event.title}
            </h4>
            {event.verified && (
              <Badge
                variant="secondary"
                className="text-[9px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0"
              >
                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                Verified
              </Badge>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
            <span
              className={`flex items-center gap-1 ${isUpcoming ? "text-amber-600 font-medium" : ""}`}
            >
              <Calendar className="h-3 w-3" />
              {formatShortDate(event.startDateISO)} ({relativeTime})
            </span>
            <span className="flex items-center gap-1">
              <FormatIcon className="h-3 w-3" />
              {event.locationLabel}
            </span>
            <span className="text-muted-foreground/60">{event.category}</span>
          </div>

          {/* Provider badge */}
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge
              variant="outline"
              className={`text-[9px] px-1.5 py-0 ${PROVIDER_BADGE_STYLES[event.provider]}`}
            >
              {PROVIDER_DISPLAY_NAMES[event.provider]}
            </Badge>
            {event.tags && event.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[9px] px-1.5 py-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Register button */}
        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
          <Button size="sm" variant="outline" className="text-xs h-8">
            Register
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </a>
      </div>
    </div>
  );
}

// ============================================
// FILTER BAR COMPONENT
// ============================================

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availableCities: string[];
  availableProviders: EventProvider[];
  isLoading: boolean;
}

function FilterBar({
  filters,
  onFiltersChange,
  availableCities,
  availableProviders,
  isLoading,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters =
    filters.query || filters.city || filters.category || filters.format || filters.provider;

  const handleClear = () => {
    onFiltersChange({ query: "", city: "", category: "", format: "", provider: "", months: filters.months });
  };

  return (
    <div className="space-y-3">
      {/* Search and toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={filters.query}
            onChange={(e) =>
              onFiltersChange({ ...filters, query: e.target.value })
            }
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-9"
        >
          <Filter className="h-4 w-4 mr-1" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1.5 h-4 w-4 p-0 text-[10px]">
              !
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-3 w-3 ml-1" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-1" />
          )}
        </Button>
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/30">
          <Select
            value={filters.city}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, city: value === "all" ? "" : value })
            }
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                category: value === "all" ? "" : value,
              })
            }
          >
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="Job Fair">Job Fair</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
              <SelectItem value="Webinar/Seminar">Webinar/Seminar</SelectItem>
              <SelectItem value="Meetup">Meetup</SelectItem>
              <SelectItem value="Conference">Conference</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.format}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                format: value === "all" ? "" : value,
              })
            }
          >
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="All formats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All formats</SelectItem>
              <SelectItem value="In-person">In-person</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>

          {availableProviders.length > 1 && (
            <Select
              value={filters.provider}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  provider: value === "all" ? "" : value,
                })
              }
            >
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {availableProviders.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {PROVIDER_DISPLAY_NAMES[provider]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Months toggle */}
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant={filters.months === 6 ? "default" : "ghost"}
              size="sm"
              onClick={() => onFiltersChange({ ...filters, months: 6 })}
              className="h-8 px-3 text-xs rounded-r-none"
            >
              6 mo
            </Button>
            <Button
              variant={filters.months === 12 ? "default" : "ghost"}
              size="sm"
              onClick={() => onFiltersChange({ ...filters, months: 12 })}
              className="h-8 px-3 text-xs rounded-l-none"
            >
              12 mo
            </Button>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// PAGINATION COMPONENT
// ============================================

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <span className="text-xs text-muted-foreground">
        Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}{" "}
        of {total} events
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs px-2">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function YouthEventsTable({
  className,
  defaultPageSize = 10,
}: YouthEventsTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(defaultPageSize);
  const [filters, setFilters] = useState<Filters>({
    query: "",
    city: "",
    category: "",
    format: "",
    provider: "",
    months: 12,
  });

  // Build query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    params.set("months", String(filters.months));
    if (filters.query) params.set("query", filters.query);
    if (filters.city) params.set("city", filters.city);
    if (filters.category) params.set("category", filters.category);
    if (filters.format) params.set("format", filters.format);
    if (filters.provider) params.set("provider", filters.provider);
    return params.toString();
  }, [page, pageSize, filters]);

  // Fetch events
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<YouthEventsResponse>({
    queryKey: ["youth-events", queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/events/youth?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Reset page when filters change
  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  // Empty state
  if (!isLoading && data?.items.length === 0) {
    const hasFilters = filters.query || filters.city || filters.category || filters.format || filters.provider;

    return (
      <Card className={`border-2 overflow-hidden ${className}`}>
        <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            Youth Career Events
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Powered by trusted Norwegian student fair and university sources, plus EURES European Job Days. Verified links only.
          </p>
        </CardHeader>
        <CardContent>
          <FilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableCities={data?.filters.cities || []}
            availableProviders={data?.filters.providers || []}
            isLoading={isLoading}
          />
          <div className="text-center py-8 mt-4">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mb-1">
              {hasFilters ? "No events match your filters" : "No verified events available"}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {hasFilters
                ? "Try adjusting your search or filters"
                : "Check back soon for upcoming career events"}
            </p>
            {hasFilters && (
              <Button
                variant="link"
                size="sm"
                onClick={() => handleFiltersChange({ query: "", city: "", category: "", format: "", provider: "", months: filters.months })}
                className="mt-2 text-xs"
              >
                Clear all filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className={`border-2 overflow-hidden ${className}`}>
        <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            Youth Career Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500 opacity-70" />
            <p className="text-sm text-muted-foreground mb-1">
              Unable to load events
            </p>
            <p className="text-xs text-muted-foreground/70">
              {(error as Error)?.message || "Please try again later"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 overflow-hidden ${className}`}>
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          Youth Career Events
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Powered by trusted Norwegian student fair and university sources, plus EURES European Job Days. Verified links only.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <FilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableCities={data?.filters.cities || []}
          availableProviders={data?.filters.providers || []}
          isLoading={isLoading}
        />

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Table (desktop) */}
        {!isLoading && data && (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="py-2 px-4 text-left text-xs font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-muted-foreground">
                      Event
                    </th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                      Type
                    </th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">
                      Location
                    </th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-muted-foreground hidden xl:table-cell">
                      Audience
                    </th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards (mobile) */}
            <div className="sm:hidden space-y-3">
              {data.items.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              page={page}
              pageSize={pageSize}
              total={data.total}
              onPageChange={setPage}
            />
          </>
        )}

        {/* Footer note */}
        <p className="text-[10px] text-muted-foreground/60 text-center pt-2 border-t">
          Sources: Ta Utdanning, OsloMet, BI Karrieredagene, EURES. Verified registration links only.
          {data?.lastRefreshISO && (
            <span className="ml-1">
              Last updated: {new Date(data.lastRefreshISO).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

export default YouthEventsTable;

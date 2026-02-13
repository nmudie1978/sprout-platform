/**
 * YOUTH EVENTS TABLE — Compact List View
 *
 * Filterable, paginated list of verified career events.
 * Flex-based rows with progressive disclosure (expand on click).
 * Handles stale-data empty state when dataFresh === false.
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  ExternalLink,
  Video,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
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

function formatDay(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString("en-GB", { day: "numeric" });
}

function formatMonth(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
}

function formatShortDate(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getRelativeTime(dateISO: string): string {
  const diffMs = new Date(dateISO).getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Past";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `${diffDays}d`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}w`;
  return `${Math.ceil(diffDays / 30)}mo`;
}

// ============================================
// EVENT LIST ITEM
// ============================================

function EventListItem({ event }: { event: EventItem }) {
  const [expanded, setExpanded] = useState(false);
  const relative = getRelativeTime(event.startDateISO);
  const isUrgent = relative === "Today" || relative === "Tomorrow";
  const isNorway = event.country === "Norway";

  return (
    <div
      className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Collapsed row */}
      <div className="flex items-center gap-2 py-1.5 px-2.5">
        {/* Date chip */}
        <div
          className={`flex flex-col items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 ${
            isUrgent
              ? "bg-amber-100 dark:bg-amber-900/30"
              : "bg-muted/50"
          }`}
        >
          <span className="text-xs font-semibold leading-none">
            {formatDay(event.startDateISO)}
          </span>
          <span className="text-[8px] text-muted-foreground leading-tight mt-0.5">
            {formatMonth(event.startDateISO)}
          </span>
        </div>

        {/* Title + location */}
        <div className="md:flex-[3] flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{event.title}</p>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            {event.format === "Online" ? (
              <Video className="h-2.5 w-2.5 flex-shrink-0" />
            ) : (
              <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
            )}
            <span className="truncate">{event.locationLabel}</span>
            <span className="md:hidden text-muted-foreground/50">·</span>
            <span className="md:hidden flex-shrink-0">{event.category}</span>
            <span className="md:hidden text-muted-foreground/50">·</span>
            <span className="md:hidden flex-shrink-0">{event.format}</span>
            <span className="md:hidden text-muted-foreground/50">·</span>
            <span className="md:hidden flex-shrink-0">{PROVIDER_DISPLAY_NAMES[event.provider]}</span>
            {isUrgent && (
              <span className="text-amber-600 dark:text-amber-400 font-medium ml-1">
                {relative}
              </span>
            )}
          </div>
        </div>

        {/* Category column */}
        <span className="hidden md:flex md:flex-1 text-[11px] text-muted-foreground justify-center truncate">
          {event.category}
        </span>

        {/* Format column */}
        <span className="hidden md:flex md:flex-1 text-[11px] justify-center">
          {event.format === "Online" ? (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
              Online
            </Badge>
          ) : event.format === "Hybrid" ? (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
              Hybrid
            </Badge>
          ) : (
            <span className="text-muted-foreground">In-person</span>
          )}
        </span>

        {/* Source column */}
        <span className="hidden md:flex md:flex-1 justify-center">
          <Badge
            variant="outline"
            className={`text-[9px] px-1.5 py-0 ${PROVIDER_BADGE_STYLES[event.provider]}`}
          >
            {PROVIDER_DISPLAY_NAMES[event.provider]}
          </Badge>
        </span>

        {/* Country indicator */}
        <span className="text-xs flex-shrink-0" title={event.country}>
          {isNorway ? "🇳🇴" : "🌐"}
        </span>

        {/* Register button */}
        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
        >
          <Button size="sm" variant="outline" className="text-[11px] h-6 px-2">
            Register
            <ExternalLink className="h-2.5 w-2.5 ml-1" />
          </Button>
        </a>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-2.5 pb-2.5 pt-0 ml-11 space-y-1.5">
          {event.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
              {event.category}
            </Badge>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
              {event.format}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[9px] px-1.5 py-0 ${PROVIDER_BADGE_STYLES[event.provider]}`}
            >
              {PROVIDER_DISPLAY_NAMES[event.provider]}
            </Badge>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
              {event.audienceFit}
            </Badge>
            {event.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>

          {event.verified && (
            <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
              Verified
              {(event.lastCheckedAtISO || event.verifiedAtISO) && (
                <span>
                  &middot; Last checked{" "}
                  {formatShortDate(event.lastCheckedAtISO || event.verifiedAtISO!)}
                </span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// FILTER BAR
// ============================================

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availableCities: string[];
  availableProviders: EventProvider[];
}

function FilterBar({ filters, onFiltersChange, availableCities, availableProviders }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = filters.query || filters.city || filters.category || filters.format || filters.provider;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={filters.query}
            onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
            className="pl-9 h-8 text-sm"
          />
        </div>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8"
        >
          <Filter className="h-3.5 w-3.5 mr-1" />
          Filters
          {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="flex flex-wrap gap-2 p-2.5 rounded-lg border bg-muted/30">
          <Select
            value={filters.city}
            onValueChange={(v) => onFiltersChange({ ...filters, city: v === "all" ? "" : v })}
          >
            <SelectTrigger className="w-[130px] h-7 text-xs">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {availableCities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(v) => onFiltersChange({ ...filters, category: v === "all" ? "" : v })}
          >
            <SelectTrigger className="w-[140px] h-7 text-xs">
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
            onValueChange={(v) => onFiltersChange({ ...filters, format: v === "all" ? "" : v })}
          >
            <SelectTrigger className="w-[120px] h-7 text-xs">
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
              onValueChange={(v) => onFiltersChange({ ...filters, provider: v === "all" ? "" : v })}
            >
              <SelectTrigger className="w-[140px] h-7 text-xs">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {availableProviders.map((p) => (
                  <SelectItem key={p} value={p}>{PROVIDER_DISPLAY_NAMES[p]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant={filters.months === 6 ? "default" : "ghost"}
              size="sm"
              onClick={() => onFiltersChange({ ...filters, months: 6 })}
              className="h-7 px-2.5 text-xs rounded-r-none"
            >
              6 mo
            </Button>
            <Button
              variant={filters.months === 12 ? "default" : "ghost"}
              size="sm"
              onClick={() => onFiltersChange({ ...filters, months: 12 })}
              className="h-7 px-2.5 text-xs rounded-l-none"
            >
              12 mo
            </Button>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange({ query: "", city: "", category: "", format: "", provider: "", months: filters.months })}
              className="h-7 text-xs"
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
// PAGINATION
// ============================================

function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-3 border-t">
      <span className="text-xs text-muted-foreground">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="h-7 w-7 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs px-2">{page}/{totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="h-7 w-7 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function YouthEventsTable({ className, defaultPageSize = 5 }: YouthEventsTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(defaultPageSize);
  const [filters, setFilters] = useState<Filters>({
    query: "", city: "", category: "", format: "", provider: "", months: 12,
  });

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

  const { data, isLoading, isError, error } = useQuery<YouthEventsResponse>({
    queryKey: ["youth-events", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/events/youth?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  // Stale-data empty state — only when stale AND no events at all
  if (!isLoading && data && data.dataFresh === false && data.items.length === 0 && data.total === 0) {
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
          <div className="text-center py-10">
            <RefreshCw className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50 animate-spin" style={{ animationDuration: "3s" }} />
            <p className="text-sm text-muted-foreground mb-1">
              Events are being refreshed
            </p>
            <p className="text-xs text-muted-foreground/70">
              We&apos;re verifying the latest career events. Check back in a few minutes.
            </p>
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
            <AlertCircle className="h-8 w-8 mx-auto mb-3 text-red-500 opacity-70" />
            <p className="text-sm text-muted-foreground mb-1">Unable to load events</p>
            <p className="text-xs text-muted-foreground/70">
              {(error as Error)?.message || "Please try again later"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state (no events match filters)
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
        </CardHeader>
        <CardContent>
          <FilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableCities={data?.filters.cities || []}
            availableProviders={data?.filters.providers || []}
          />
          <div className="text-center py-8 mt-4">
            <Calendar className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mb-1">
              {hasFilters ? "No events match your filters" : "No verified events available"}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {hasFilters ? "Try adjusting your search or filters" : "Check back soon for upcoming career events"}
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

  return (
    <Card className={`border-2 overflow-hidden ${className}`}>
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />

      <CardHeader className="pb-1.5 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          Youth Career Events
        </CardTitle>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Verified events from Norwegian and European career sources. Tap an event for details.
        </p>
      </CardHeader>

      <CardContent className="space-y-2 px-4 pb-4">
        <FilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableCities={data?.filters.cities || []}
          availableProviders={data?.filters.providers || []}
        />

        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && data && (
          <>
            {/* Column headers (desktop only) */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
              <div className="w-9 flex-shrink-0" />
              <div className="flex-[3] min-w-0">Event</div>
              <div className="flex-1 text-center">Category</div>
              <div className="flex-1 text-center">Format</div>
              <div className="flex-1 text-center">Source</div>
              <div className="w-[18px] flex-shrink-0" />
              <div className="w-[72px] flex-shrink-0" />
            </div>

            <div className="rounded-lg border overflow-hidden">
              {data.items.map((event) => (
                <EventListItem key={event.id} event={event} />
              ))}
            </div>

            <Pagination page={page} pageSize={pageSize} total={data.total} onPageChange={setPage} />
          </>
        )}

        {/* Footer */}
        <p className="text-[10px] text-muted-foreground/60 text-center pt-2 flex items-center justify-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
          Verified links &middot; refreshed daily
          {data?.lastRefreshISO && (
            <span className="ml-1">
              &middot; Updated {new Date(data.lastRefreshISO).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

export default YouthEventsTable;

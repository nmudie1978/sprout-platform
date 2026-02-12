/**
 * YOUTH EVENTS API ROUTE
 *
 * GET /api/events/youth
 *
 * Returns verified career events from Norwegian and European sources.
 * Supports filtering, pagination, and sorting.
 *
 * Query Parameters:
 * - months: Number of months to look ahead (6 or 12, default: 12)
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 10, max: 50)
 * - query: Search query (searches title, description, organizer)
 * - city: Filter by city
 * - category: Filter by event category
 * - format: Filter by event format (Online, In-person, Hybrid)
 * - provider: Filter by provider (tautdanning, oslomet, bi-karrieredagene, eures)
 * - sort: Sort order (startDate, -startDate, title)
 * - includeUnverified: Include unverified events (default: false, dev only)
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type {
  EventItem,
  EventCategory,
  EventFormat,
  EventProvider,
  YouthEventsResponse,
  RefreshMetadata,
} from "@/lib/events/types";
import { PROVIDER_PRIORITY, type AudienceFit } from "@/lib/events/types";
import { isWithinDateRange } from "@/lib/events/date-range";

// ============================================
// YOUTH-RELEVANCE FILTER (ages 15-21)
// ============================================

/** Audience values that indicate youth relevance */
const YOUTH_AUDIENCES: AudienceFit[] = ["16–21", "Students"];

/** Keywords in title/description that indicate youth relevance */
const YOUTH_KEYWORDS = [
  "student", "youth", "young", "teen", "junior",
  "apprentice", "intern", "trainee", "beginner",
  "entry-level", "entry level", "first job", "career start",
  "summer job", "seasonal", "graduate", "school",
  "studenter", "ungdom", "lærling",
];

/**
 * Determines if an event is relevant for the 15-21 age range.
 * Applied as a persistent filter so only youth-relevant events
 * are served regardless of the data source.
 */
function isYouthRelevantEvent(event: EventItem): boolean {
  // Direct audience match
  if (YOUTH_AUDIENCES.includes(event.audienceFit)) return true;

  // Youth-friendly tag
  if (event.tags?.includes("youth-friendly")) return true;

  // Keyword match in title or description
  const searchText = `${event.title} ${event.description ?? ""}`.toLowerCase();
  return YOUTH_KEYWORDS.some((kw) => searchText.includes(kw));
}

// ============================================
// DATA FILE PATHS
// ============================================

const DATA_DIR = path.join(process.cwd(), "data", "career-events");
const VERIFIED_EVENTS_FILE = path.join(DATA_DIR, "verified-events.json");
const METADATA_FILE = path.join(DATA_DIR, "refresh-metadata.json");

// ============================================
// HELPERS
// ============================================

function parseNumber(value: string | null, defaultValue: number, max?: number): number {
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1) return defaultValue;
  if (max && num > max) return max;
  return num;
}

function parseBoolean(value: string | null, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value === "true" || value === "1";
}

async function loadEvents(): Promise<EventItem[]> {
  try {
    const data = await fs.readFile(VERIFIED_EVENTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function loadMetadata(): Promise<RefreshMetadata | null> {
  try {
    const data = await fs.readFile(METADATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function matchesSearch(event: EventItem, query: string): boolean {
  const searchStr = query.toLowerCase();
  return (
    event.title.toLowerCase().includes(searchStr) ||
    (event.description?.toLowerCase().includes(searchStr) ?? false) ||
    (event.organizerName?.toLowerCase().includes(searchStr) ?? false) ||
    (event.tags?.some((t) => t.toLowerCase().includes(searchStr)) ?? false)
  );
}

// ============================================
// GET HANDLER
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const months = parseNumber(searchParams.get("months"), 12);
    const page = parseNumber(searchParams.get("page"), 1);
    const pageSize = parseNumber(searchParams.get("pageSize"), 10, 50);
    const query = searchParams.get("query")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const categoryParam = searchParams.get("category") || "";
    const formatParam = searchParams.get("format") || "";
    const providerParam = searchParams.get("provider") || "";
    const sort = searchParams.get("sort") || "startDate";
    const includeUnverified = parseBoolean(searchParams.get("includeUnverified"), false);

    // Load events from file
    let events = await loadEvents();
    const metadata = await loadMetadata();

    // If no events, return helpful message
    if (events.length === 0) {
      return NextResponse.json({
        items: [],
        total: 0,
        page: 1,
        pageSize,
        lastRefreshISO: metadata?.lastRefreshISO || new Date().toISOString(),
        filters: {
          cities: [],
          categories: ["Job Fair", "Workshop", "Webinar/Seminar", "Meetup", "Conference", "Other"] as EventCategory[],
          formats: ["In-person", "Online", "Hybrid"] as EventFormat[],
          providers: PROVIDER_PRIORITY,
        },
        message: "No events found. Run 'npm run events:refresh' to fetch events from providers.",
      });
    }

    // Filter: verified only (unless dev mode with includeUnverified)
    if (!includeUnverified || process.env.NODE_ENV === "production") {
      events = events.filter((e) => e.verified);
    }

    // Filter: youth-relevant only (ages 15-21)
    events = events.filter(isYouthRelevantEvent);

    // Filter: date range (today → today + N months)
    events = events.filter((e) => isWithinDateRange(e.startDateISO, months));

    // Filter: search query
    if (query) {
      events = events.filter((e) => matchesSearch(e, query));
    }

    // Filter: city
    if (city) {
      events = events.filter((e) => e.city?.toLowerCase() === city.toLowerCase());
    }

    // Filter: category
    if (categoryParam) {
      events = events.filter((e) => e.category === categoryParam);
    }

    // Filter: format
    if (formatParam) {
      events = events.filter((e) => e.format === formatParam);
    }

    // Filter: provider
    if (providerParam && PROVIDER_PRIORITY.includes(providerParam as EventProvider)) {
      events = events.filter((e) => e.provider === providerParam);
    }

    // Sort
    events = [...events].sort((a, b) => {
      switch (sort) {
        case "-startDate":
          return new Date(b.startDateISO).getTime() - new Date(a.startDateISO).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "startDate":
        default:
          return new Date(a.startDateISO).getTime() - new Date(b.startDateISO).getTime();
      }
    });

    // Calculate totals before pagination
    const total = events.length;

    // Paginate
    const startIndex = (page - 1) * pageSize;
    const paginatedEvents = events.slice(startIndex, startIndex + pageSize);

    // Build filter options from all youth-relevant events (not just current page)
    const allEvents = await loadEvents();
    const filteredForOptions = allEvents.filter((e) =>
      e.verified && isYouthRelevantEvent(e) && isWithinDateRange(e.startDateISO, months)
    );

    const cities = [...new Set(filteredForOptions.map((e) => e.city).filter(Boolean))] as string[];
    const providers = [...new Set(filteredForOptions.map((e) => e.provider))] as EventProvider[];

    // Build response
    const response: YouthEventsResponse = {
      items: paginatedEvents,
      total,
      page,
      pageSize,
      lastRefreshISO: metadata?.lastRefreshISO || new Date().toISOString(),
      filters: {
        cities: cities.sort(),
        categories: ["Job Fair", "Workshop", "Webinar/Seminar", "Meetup", "Conference", "Other"] as EventCategory[],
        formats: ["In-person", "Online", "Hybrid"] as EventFormat[],
        providers: providers.length > 0 ? providers : PROVIDER_PRIORITY,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch youth events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

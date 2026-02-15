/**
 * YOUTH EVENTS API ROUTE
 *
 * GET /api/events/youth
 *
 * Returns verified career events from the database (CareerEvent table).
 * Supports filtering, pagination, and sorting.
 * Youth-focused events are prioritised; non-youth events are included
 * when they match youth-relevance keywords.
 *
 * Query Parameters:
 * - months: Number of months to look ahead (6 or 12, default: 12)
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 10, max: 50)
 * - query: Search query (searches title, description, organizer)
 * - city: Filter by city
 * - category: Filter by event category
 * - format: Filter by event format (Online, In-person, Hybrid)
 * - sort: Sort order (startDate, -startDate, title)
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type {
  EventItem,
  EventCategory,
  EventFormat,
  EventProvider,
  YouthEventsResponse,
} from "@/lib/events/types";
import {
  mapEventType,
  mapLocationMode,
  buildLocationLabel,
  inferAudienceFit,
  isYouthFriendly,
} from "@/lib/events/types";

// ============================================
// YOUTH-RELEVANCE FILTER (ages 15-23)
// ============================================

const YOUTH_KEYWORDS = [
  "student", "youth", "young", "teen", "junior",
  "apprentice", "intern", "trainee", "beginner",
  "entry-level", "entry level", "first job", "career start",
  "summer job", "seasonal", "graduate", "school",
  "studenter", "ungdom", "lærling",
];

const YOUTH_EXCLUDE_KEYWORDS = [
  "transport services", "logistics fair", "oil and gas",
  "petroleum", "shipping conference", "maritime industry",
  "executive leadership", "senior management", "c-suite",
  "40+", "experienced professionals only",
  "bransjedagene", "fagmesse", "tungbil",
];

function isYouthRelevantDbEvent(event: DbEvent): boolean {
  const searchText = `${event.title} ${event.description ?? ""}`.toLowerCase();
  if (YOUTH_EXCLUDE_KEYWORDS.some((kw) => searchText.includes(kw))) return false;
  if (event.isYouthFocused) return true;
  return YOUTH_KEYWORDS.some((kw) => searchText.includes(kw));
}

// ============================================
// DB → EventItem MAPPER
// ============================================

/** Selected fields from CareerEvent (matches the select clause in GET) */
type DbEvent = {
  id: string;
  title: string;
  type: string;
  description: string;
  organizer: string;
  startDate: Date;
  endDate: Date | null;
  locationMode: string;
  city: string | null;
  country: string | null;
  registrationUrl: string;
  isYouthFocused: boolean;
  industryTypes: string[];
  isVerified: boolean;
  verifiedAt: Date | null;
};

/** Derive provider from organizer name */
const ORGANIZER_TO_PROVIDER: Array<[RegExp, EventProvider]> = [
  [/oslomet/i, "oslomet"],
  [/bi\b|karrieredagene/i, "bi-karrieredagene"],
  [/eures/i, "eures"],
];

function inferProvider(organizer: string): EventProvider {
  for (const [pattern, provider] of ORGANIZER_TO_PROVIDER) {
    if (pattern.test(organizer)) return provider;
  }
  return "tautdanning";
}

function toEventItem(event: DbEvent): EventItem {
  const format = mapLocationMode(event.locationMode);
  const category = mapEventType(event.type);
  const searchText = `${event.title} ${event.description ?? ""}`;
  const audienceFit = event.isYouthFocused ? "15–23" as const : inferAudienceFit(searchText);
  const tags: string[] = [...event.industryTypes];
  if (isYouthFriendly(audienceFit, searchText)) {
    tags.push("youth-friendly");
  }
  const provider = inferProvider(event.organizer);

  return {
    id: event.id,
    provider,
    providerEventId: event.id,
    title: event.title,
    description: event.description || undefined,
    startDateISO: event.startDate.toISOString(),
    endDateISO: event.endDate?.toISOString(),
    locationLabel: buildLocationLabel(event.city ?? undefined, event.country ?? undefined, format),
    city: event.city ?? undefined,
    country: event.country === "Norway" ? "Norway" : "Europe",
    format,
    category,
    audienceFit,
    registrationUrl: event.registrationUrl,
    sourceUrl: event.registrationUrl,
    organizerName: event.organizer,
    verified: event.isVerified,
    verifiedAtISO: event.verifiedAt?.toISOString(),
    tags,
  };
}

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

    const months = parseNumber(searchParams.get("months"), 12);
    const page = parseNumber(searchParams.get("page"), 1);
    const pageSize = parseNumber(searchParams.get("pageSize"), 10, 50);
    const query = searchParams.get("query")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const categoryParam = searchParams.get("category") || "";
    const formatParam = searchParams.get("format") || "";
    const sort = searchParams.get("sort") || "startDate";

    // Date range: now → now + N months
    const now = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + months);

    // Build DB-level where clause — push filters to Prisma
    const where: Parameters<typeof prisma.careerEvent.findMany>[0]["where"] = {
      isActive: true,
      isVerified: true,
      startDate: { gte: now, lte: maxDate },
    };
    if (city) {
      where.city = { equals: city, mode: "insensitive" };
    }
    if (formatParam) {
      const modeMap: Record<string, string> = { "In-person": "IN_PERSON", "Online": "ONLINE", "Hybrid": "HYBRID" };
      if (modeMap[formatParam]) where.locationMode = modeMap[formatParam] as never;
    }
    if (categoryParam) {
      const typeMap: Record<string, string> = { "Job Fair": "JOBFAIR", "Workshop": "WORKSHOP", "Webinar/Seminar": "WEBINAR", "Meetup": "MEETUP", "Conference": "CONFERENCE" };
      if (typeMap[categoryParam]) where.type = typeMap[categoryParam] as never;
    }

    const dbEvents = await prisma.careerEvent.findMany({
      where,
      orderBy: [
        { isYouthFocused: "desc" },
        { startDate: "asc" },
      ],
      select: {
        id: true,
        title: true,
        type: true,
        description: true,
        organizer: true,
        startDate: true,
        endDate: true,
        locationMode: true,
        city: true,
        country: true,
        registrationUrl: true,
        isYouthFocused: true,
        industryTypes: true,
        isVerified: true,
        verifiedAt: true,
      },
    });

    // Map to EventItem and apply youth-relevance filter
    let events = dbEvents
      .filter(isYouthRelevantDbEvent)
      .map(toEventItem);

    // Apply text search filter (can't push keyword search to DB easily)
    if (query) {
      events = events.filter((e) => matchesSearch(e, query));
    }

    // Sort
    events = [...events].sort((a, b) => {
      switch (sort) {
        case "-startDate":
          return new Date(b.startDateISO).getTime() - new Date(a.startDateISO).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "startDate":
        default: {
          const countryOrder = (e: EventItem) => (e.country === "Norway" ? 0 : 1);
          const diff = countryOrder(a) - countryOrder(b);
          if (diff !== 0) return diff;
          return new Date(a.startDateISO).getTime() - new Date(b.startDateISO).getTime();
        }
      }
    });

    const total = events.length;

    // Paginate
    const startIndex = (page - 1) * pageSize;
    const paginatedEvents = events.slice(startIndex, startIndex + pageSize);

    // Build filter options from all matched events (not just current page)
    const cities = [...new Set(events.map((e) => e.city).filter(Boolean))] as string[];
    const providers = [...new Set(events.map((e) => e.provider))] as EventProvider[];

    const response: YouthEventsResponse = {
      items: paginatedEvents,
      total,
      page,
      pageSize,
      lastRefreshISO: new Date().toISOString(),
      dataFresh: true,
      filters: {
        cities: cities.sort(),
        categories: ["Job Fair", "Workshop", "Webinar/Seminar", "Meetup", "Conference", "Other"] as EventCategory[],
        formats: ["In-person", "Online", "Hybrid"] as EventFormat[],
        providers,
      },
    };

    const jsonResponse = NextResponse.json(response);
    // Events data changes infrequently, cache for 15 min
    jsonResponse.headers.set('Cache-Control', 'public, max-age=900, stale-while-revalidate=300');
    return jsonResponse;
  } catch (error) {
    console.error("Failed to fetch youth events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

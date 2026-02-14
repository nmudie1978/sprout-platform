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
import type { CareerEvent } from "@prisma/client";
import type {
  EventItem,
  EventCategory,
  EventFormat,
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

function isYouthRelevantDbEvent(event: CareerEvent): boolean {
  const searchText = `${event.title} ${event.description ?? ""}`.toLowerCase();
  if (YOUTH_EXCLUDE_KEYWORDS.some((kw) => searchText.includes(kw))) return false;
  if (event.isYouthFocused) return true;
  return YOUTH_KEYWORDS.some((kw) => searchText.includes(kw));
}

// ============================================
// DB → EventItem MAPPER
// ============================================

function toEventItem(event: CareerEvent): EventItem {
  const format = mapLocationMode(event.locationMode);
  const category = mapEventType(event.type);
  const searchText = `${event.title} ${event.description ?? ""}`;
  const audienceFit = event.isYouthFocused ? "15–23" as const : inferAudienceFit(searchText);
  const tags: string[] = [...event.industryTypes];
  if (isYouthFriendly(audienceFit, searchText)) {
    tags.push("youth-friendly");
  }

  return {
    id: event.id,
    provider: "tautdanning",
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

    // Query verified, active events within the date window
    const dbEvents = await prisma.careerEvent.findMany({
      where: {
        isActive: true,
        isVerified: true,
        startDate: { gte: now, lte: maxDate },
      },
      orderBy: [
        { isYouthFocused: "desc" },
        { startDate: "asc" },
      ],
    });

    // Map to EventItem and apply youth-relevance filter
    let events = dbEvents
      .filter(isYouthRelevantDbEvent)
      .map(toEventItem);

    // Apply client filters
    if (query) {
      events = events.filter((e) => matchesSearch(e, query));
    }
    if (city) {
      events = events.filter((e) => e.city?.toLowerCase() === city.toLowerCase());
    }
    if (categoryParam) {
      events = events.filter((e) => e.category === categoryParam);
    }
    if (formatParam) {
      events = events.filter((e) => e.format === formatParam);
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
        providers: ["tautdanning"],
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

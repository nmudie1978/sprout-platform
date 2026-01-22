/**
 * EURES PROVIDER
 *
 * Scrapes European Job Days events from EURES.
 * Source: https://europeanjobdays.eu/en/events
 */

import type { EventsProvider, ScrapeProviderParams, EventItem, EventCategory } from "../types";
import { generateEventId, inferCategory, inferAudienceFit, isYouthFriendly } from "../types";
import { getProviderConfig, getThrottleDelay } from "../config";
import {
  fetchHtml,
  sleep,
  stripHtml,
  extractLinks,
  parseEnglishDate,
  toISODateString,
  slugify,
} from "../scrape-utils";

// ============================================
// CONSTANTS
// ============================================

const PROVIDER_ID = "eures" as const;
const BASE_URL = "https://europeanjobdays.eu";
const EVENTS_URL = `${BASE_URL}/en/events`;

// Keywords indicating job/career relevance
const JOB_KEYWORDS = [
  "job day",
  "job days",
  "recruitment",
  "career",
  "hiring",
  "employer",
  "employment",
  "work",
  "job fair",
  "job seeker",
];

// ============================================
// TYPES
// ============================================

interface RawEventData {
  title: string;
  dateStr: string;
  url: string;
  summary?: string;
  isOnline?: boolean;
  country?: string;
}

interface EventDetailData {
  description?: string;
  venue?: string;
  registrationUrl?: string;
  isOnline?: boolean;
  countries?: string[];
}

// ============================================
// PARSING HELPERS
// ============================================

/**
 * Check if event is job/career related
 */
function isJobRelated(title: string, summary?: string): boolean {
  const searchText = `${title} ${summary || ""}`.toLowerCase();
  return JOB_KEYWORDS.some((keyword) => searchText.includes(keyword));
}

/**
 * Check if event mentions Norway
 */
function mentionsNorway(text: string): boolean {
  const lowerText = text.toLowerCase();
  return lowerText.includes("norway") || lowerText.includes("norge") || lowerText.includes("norwegian");
}

/**
 * Parse events listing from EURES
 */
function parseEventsListing(html: string): RawEventData[] {
  const events: RawEventData[] = [];

  // EURES typically shows events in cards or list items
  const patterns = [
    /<div[^>]*class="[^"]*(?:event|card)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<li[^>]*class="[^"]*event[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const content = match[1];
      const title = extractTitle(content);
      const dateStr = extractDate(content);
      const url = extractEventUrl(content);
      const summary = extractSummary(content);
      const isOnline = checkOnline(content);
      const country = extractCountry(content);

      if (title && url) {
        events.push({
          title,
          dateStr: dateStr || "",
          url,
          summary,
          isOnline,
          country,
        });
      }
    }
  }

  // If structured parsing fails, try link-based extraction
  if (events.length === 0) {
    const links = extractLinks(html, BASE_URL);
    for (const link of links) {
      if (link.href.includes("/event/") || link.href.includes("/events/")) {
        const title = link.text.trim();
        if (title && title.length > 5 && !title.toLowerCase().includes("all events")) {
          events.push({
            title,
            dateStr: "",
            url: link.href,
          });
        }
      }
    }
  }

  return events;
}

/**
 * Extract title from event content
 */
function extractTitle(content: string): string | null {
  // Try headings
  const headingMatch = content.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
  if (headingMatch) {
    return stripHtml(headingMatch[1]).trim();
  }

  // Try title class
  const titleMatch = content.match(/<[^>]+class="[^"]*(?:title|heading)[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i);
  if (titleMatch) {
    return stripHtml(titleMatch[1]).trim();
  }

  // Try link text
  const linkMatch = content.match(/<a[^>]+href="[^"]*event[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
  if (linkMatch) {
    return stripHtml(linkMatch[1]).trim();
  }

  return null;
}

/**
 * Extract date from content
 */
function extractDate(content: string): string | null {
  const text = stripHtml(content);

  // Try various date patterns
  const patterns = [
    /(\d{1,2}\s+[A-Za-z]+\s+\d{4})/,
    /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/,
    /(\d{4}-\d{2}-\d{2})/,
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(\d{1,2}\s+[A-Za-z]+)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract event URL from content
 */
function extractEventUrl(content: string): string | null {
  const linkMatch = content.match(/<a[^>]+href="([^"]+)"[^>]*>/i);
  if (linkMatch) {
    const href = linkMatch[1];
    if (href.startsWith("http")) {
      return href;
    }
    return `${BASE_URL}${href.startsWith("/") ? "" : "/"}${href}`;
  }
  return null;
}

/**
 * Extract summary from content
 */
function extractSummary(content: string): string | null {
  const summaryMatch = content.match(/<(?:p|div)[^>]*class="[^"]*(?:summary|description|intro)[^"]*"[^>]*>([\s\S]*?)<\/(?:p|div)>/i);
  if (summaryMatch) {
    return stripHtml(summaryMatch[1]).trim().slice(0, 300);
  }

  const pMatch = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (pMatch) {
    const text = stripHtml(pMatch[1]).trim();
    if (text.length > 20) {
      return text.slice(0, 300);
    }
  }

  return null;
}

/**
 * Check if event is online
 */
function checkOnline(content: string): boolean {
  const text = stripHtml(content).toLowerCase();
  return text.includes("online") ||
    text.includes("virtual") ||
    text.includes("digital") ||
    text.includes("remote");
}

/**
 * Extract country from content
 */
function extractCountry(content: string): string | null {
  const text = stripHtml(content);

  // Common European countries
  const countries = [
    "Norway", "Sweden", "Denmark", "Finland", "Germany", "France",
    "Netherlands", "Belgium", "Spain", "Italy", "Poland", "Ireland",
    "Portugal", "Austria", "Switzerland", "Czech Republic", "Greece",
  ];

  for (const country of countries) {
    if (text.includes(country)) {
      return country;
    }
  }

  return null;
}

/**
 * Fetch and parse event detail page
 */
async function fetchEventDetail(
  url: string,
  config: ReturnType<typeof getProviderConfig>
): Promise<EventDetailData> {
  try {
    const html = await fetchHtml(url, {
      timeoutMs: config.timeoutMs,
      userAgent: config.userAgent,
      cacheTtlHours: config.cacheTtlHours,
    });

    const result: EventDetailData = {};

    // Extract description
    const descMatch = html.match(/<div[^>]*class="[^"]*(?:body|content|description)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (descMatch) {
      result.description = stripHtml(descMatch[1]).trim().slice(0, 500);
    }

    // Check if online
    result.isOnline = checkOnline(html);

    // Extract venue/location if not online
    if (!result.isOnline) {
      const venuePatterns = [
        /(?:venue|location|place|where):\s*([^\n<]+)/i,
        /<[^>]+class="[^"]*(?:venue|location)[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i,
      ];
      for (const pattern of venuePatterns) {
        const match = html.match(pattern);
        if (match) {
          result.venue = stripHtml(match[1]).trim();
          break;
        }
      }
    }

    // Extract registration link
    const regPatterns = [
      /<a[^>]+href="([^"]+)"[^>]*>[^<]*(?:register|sign up|join|apply)[^<]*<\/a>/i,
      /<a[^>]+class="[^"]*(?:register|signup|cta|button)[^"]*"[^>]+href="([^"]+)"/i,
    ];
    for (const pattern of regPatterns) {
      const match = html.match(pattern);
      if (match) {
        result.registrationUrl = match[1].startsWith("http") ? match[1] : `${BASE_URL}${match[1]}`;
        break;
      }
    }

    // Extract participating countries
    const countriesMatch = html.match(/(?:participating\s+countries|countries?):\s*([^<\n]+)/i);
    if (countriesMatch) {
      result.countries = countriesMatch[1].split(/[,;]/).map((c) => c.trim()).filter(Boolean);
    }

    return result;
  } catch (error) {
    console.warn(`[${PROVIDER_ID}] Error fetching detail for ${url}:`, error);
    return {};
  }
}

/**
 * Determine category from title and description
 */
function determineCategory(title: string, description?: string): EventCategory {
  const text = `${title} ${description || ""}`.toLowerCase();

  if (text.includes("job day") || text.includes("job fair") || text.includes("recruitment")) {
    return "Job Fair";
  }
  if (text.includes("webinar") || text.includes("online session")) {
    return "Webinar/Seminar";
  }
  if (text.includes("workshop")) {
    return "Workshop";
  }

  return inferCategory(text);
}

/**
 * Map raw event data to EventItem
 */
function mapToEventItem(
  raw: RawEventData,
  detail: EventDetailData
): Omit<EventItem, "verified" | "verifiedAtISO"> | null {
  let date = parseEnglishDate(raw.dateStr);

  if (!date) {
    return null;
  }

  const providerEventId = slugify(raw.title);
  const searchText = `${raw.title} ${raw.summary || ""} ${detail.description || ""}`;
  const audienceFit = inferAudienceFit(searchText);
  const tags: string[] = ["european-job-days"];

  if (isYouthFriendly(audienceFit, searchText)) {
    tags.push("youth-friendly");
  }

  // Prefer Norway if mentioned, otherwise Europe
  const mentionsNO = mentionsNorway(searchText);
  if (mentionsNO) {
    tags.push("norway-focus");
  }

  // Determine format
  const isOnline = raw.isOnline || detail.isOnline || false;
  const hasVenue = !!detail.venue;
  const format = isOnline && hasVenue ? "Hybrid" : isOnline ? "Online" : "In-person";

  // For EURES, online events are Europe-wide
  const country = format === "Online" ? "Europe" : (raw.country === "Norway" ? "Norway" : "Europe");
  const city = format === "Online" ? undefined : (detail.venue?.split(",")[0] || undefined);

  // Use registration URL if available, otherwise event page
  const registrationUrl = detail.registrationUrl || raw.url;
  const httpsUrl = registrationUrl.startsWith("https://")
    ? registrationUrl
    : registrationUrl.replace("http://", "https://");

  return {
    id: generateEventId(PROVIDER_ID, providerEventId),
    provider: PROVIDER_ID,
    providerEventId,
    title: raw.title,
    description: detail.description || raw.summary,
    startDateISO: toISODateString(date),
    locationLabel: format === "Online" ? "Online" : detail.venue || "Europe",
    city,
    country,
    format,
    category: determineCategory(raw.title, detail.description),
    audienceFit: audienceFit === "Unknown" ? "General" : audienceFit,
    registrationUrl: httpsUrl,
    sourceUrl: raw.url.startsWith("https://") ? raw.url : raw.url.replace("http://", "https://"),
    organizerName: "EURES - European Employment Services",
    tags,
  };
}

// ============================================
// PROVIDER IMPLEMENTATION
// ============================================

async function fetchEvents(
  params: ScrapeProviderParams
): Promise<Omit<EventItem, "verified" | "verifiedAtISO">[]> {
  const config = getProviderConfig(PROVIDER_ID);
  if (!config.enabled) {
    console.log(`[${PROVIDER_ID}] Provider disabled`);
    return [];
  }

  // Skip EURES if only Norway scope
  if (params.countryScope === "Norway") {
    console.log(`[${PROVIDER_ID}] Skipped - Norway-only scope`);
    return [];
  }

  const events: Omit<EventItem, "verified" | "verifiedAtISO">[] = [];

  try {
    console.log(`[${PROVIDER_ID}] Fetching events listing...`);

    // Fetch events listing page
    const listingHtml = await fetchHtml(EVENTS_URL, {
      timeoutMs: config.timeoutMs,
      userAgent: config.userAgent,
      cacheTtlHours: config.cacheTtlHours,
    });

    // Parse events from listing
    const rawEvents = parseEventsListing(listingHtml);
    console.log(`[${PROVIDER_ID}] Found ${rawEvents.length} events in listing`);

    // Filter to job-related events
    const jobEvents = rawEvents.filter((e) => isJobRelated(e.title, e.summary));
    console.log(`[${PROVIDER_ID}] ${jobEvents.length} job-related events after filtering`);

    // Fetch details for each event (limit to avoid too many requests)
    const maxEvents = 20;
    const eventsToProcess = jobEvents.slice(0, maxEvents);

    for (const raw of eventsToProcess) {
      await sleep(getThrottleDelay(PROVIDER_ID));

      try {
        console.log(`[${PROVIDER_ID}] Fetching detail for: ${raw.title}`);
        const detail = await fetchEventDetail(raw.url, config);
        const event = mapToEventItem(raw, detail);

        if (event) {
          events.push(event);
        }
      } catch (error) {
        console.warn(`[${PROVIDER_ID}] Error processing event ${raw.title}:`, error);
      }
    }

    // Filter by date range
    const now = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + params.months);

    const filteredEvents = events.filter((event) => {
      const eventDate = new Date(event.startDateISO);
      return eventDate >= now && eventDate <= maxDate;
    });

    console.log(`[${PROVIDER_ID}] Found ${filteredEvents.length} events within date range`);
    return filteredEvents;
  } catch (error) {
    console.error(`[${PROVIDER_ID}] Fetch error:`, error);
    throw error;
  }
}

// ============================================
// EXPORT
// ============================================

export const euresProvider: EventsProvider = {
  id: PROVIDER_ID,
  displayName: "EURES Job Days",
  type: "scrape",
  fetchEvents,
};

export default euresProvider;

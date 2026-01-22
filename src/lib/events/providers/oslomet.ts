/**
 * OSLOMET PROVIDER
 *
 * Scrapes career-related events from OsloMet's upcoming events page.
 * Source: https://www.oslomet.no/en/about/events/upcoming-events
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
  parseNorwegianDate,
  toISODateString,
  slugify,
} from "../scrape-utils";

// ============================================
// CONSTANTS
// ============================================

const PROVIDER_ID = "oslomet" as const;
const BASE_URL = "https://www.oslomet.no";
const EVENTS_URL = `${BASE_URL}/en/about/events/upcoming-events`;

// Career-relevant keywords for filtering
const CAREER_KEYWORDS = [
  "career",
  "job",
  "workshop",
  "seminar",
  "employer",
  "industry",
  "intern",
  "student",
  "skills",
  "network",
  "professional",
  "recruitment",
  "cv",
  "interview",
  "karriere",
  "jobb",
];

// ============================================
// TYPES
// ============================================

interface RawEventData {
  title: string;
  dateStr: string;
  url: string;
  summary?: string;
}

interface EventDetailData {
  description?: string;
  venue?: string;
  registrationUrl?: string;
  time?: string;
}

// ============================================
// PARSING HELPERS
// ============================================

/**
 * Check if event title/summary contains career-relevant keywords
 */
function isCareerRelevant(title: string, summary?: string): boolean {
  const searchText = `${title} ${summary || ""}`.toLowerCase();
  return CAREER_KEYWORDS.some((keyword) => searchText.includes(keyword));
}

/**
 * Extract event listings from the events page
 */
function parseEventsListing(html: string): RawEventData[] {
  const events: RawEventData[] = [];

  // Look for event cards/items in the listing
  // OsloMet typically uses article elements or divs with event class
  const patterns = [
    /<article[^>]*class="[^"]*event[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
    /<div[^>]*class="[^"]*event-card[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<li[^>]*class="[^"]*event[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
    /<div[^>]*class="[^"]*list-item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const content = match[1];
      const title = extractTitle(content);
      const dateStr = extractDate(content);
      const url = extractEventUrl(content);
      const summary = extractSummary(content);

      if (title && url) {
        events.push({
          title,
          dateStr: dateStr || "",
          url,
          summary,
        });
      }
    }
  }

  // If structured parsing fails, try link-based extraction
  if (events.length === 0) {
    const links = extractLinks(html, BASE_URL);
    for (const link of links) {
      // Look for event links
      if (link.href.includes("/events/") || link.href.includes("/arrangement/")) {
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
 * Extract date from event content
 */
function extractDate(content: string): string | null {
  const text = stripHtml(content);

  // Try various date patterns
  const patterns = [
    /(\d{1,2}\s+[A-Za-z]+\s+\d{4})/,
    /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/,
    /(\d{1,2}\.\s*[A-Za-z]+\s*\d{4})/,
    /(\d{4}-\d{2}-\d{2})/,
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(\d{1,2}\s+[A-Za-zæøå]+)/,
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
  // Try description/summary elements
  const summaryMatch = content.match(/<(?:p|div)[^>]*class="[^"]*(?:summary|description|intro|lead)[^"]*"[^>]*>([\s\S]*?)<\/(?:p|div)>/i);
  if (summaryMatch) {
    return stripHtml(summaryMatch[1]).trim().slice(0, 300);
  }

  // Try first paragraph
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
 * Fetch and parse event detail page
 */
async function fetchEventDetail(url: string, config: ReturnType<typeof getProviderConfig>): Promise<EventDetailData> {
  try {
    const html = await fetchHtml(url, {
      timeoutMs: config.timeoutMs,
      userAgent: config.userAgent,
      cacheTtlHours: config.cacheTtlHours,
    });

    const result: EventDetailData = {};

    // Extract description
    const descMatch = html.match(/<div[^>]*class="[^"]*(?:body|content|article)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (descMatch) {
      result.description = stripHtml(descMatch[1]).trim().slice(0, 500);
    }

    // Extract venue/location
    const venuePatterns = [
      /(?:venue|location|place|sted):\s*([^\n<]+)/i,
      /<[^>]+class="[^"]*(?:venue|location)[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i,
    ];
    for (const pattern of venuePatterns) {
      const match = html.match(pattern);
      if (match) {
        result.venue = stripHtml(match[1]).trim();
        break;
      }
    }

    // Extract registration link
    const regPatterns = [
      /<a[^>]+href="([^"]+)"[^>]*>[^<]*(?:register|sign up|påmelding|meld deg)[^<]*<\/a>/i,
      /<a[^>]+class="[^"]*(?:register|signup|cta)[^"]*"[^>]+href="([^"]+)"/i,
    ];
    for (const pattern of regPatterns) {
      const match = html.match(pattern);
      if (match) {
        result.registrationUrl = match[1].startsWith("http") ? match[1] : `${BASE_URL}${match[1]}`;
        break;
      }
    }

    // Extract time
    const timeMatch = html.match(/(\d{1,2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}))?/);
    if (timeMatch) {
      result.time = timeMatch[0];
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
  const text = `${title} ${description || ""}`;
  return inferCategory(text);
}

/**
 * Map raw event data to EventItem
 */
function mapToEventItem(
  raw: RawEventData,
  detail: EventDetailData
): Omit<EventItem, "verified" | "verifiedAtISO"> | null {
  let date = parseEnglishDate(raw.dateStr) || parseNorwegianDate(raw.dateStr);

  // If no date found, skip this event
  if (!date) {
    return null;
  }

  const providerEventId = slugify(raw.title);
  const searchText = `${raw.title} ${raw.summary || ""} ${detail.description || ""}`;
  const audienceFit = inferAudienceFit(searchText);
  const tags: string[] = [];

  if (isYouthFriendly(audienceFit, searchText)) {
    tags.push("youth-friendly");
  }

  // Determine format
  const isOnline = searchText.toLowerCase().includes("online") ||
    searchText.toLowerCase().includes("digital") ||
    searchText.toLowerCase().includes("webinar");
  const hasVenue = !!detail.venue;
  const format = isOnline && hasVenue ? "Hybrid" : isOnline ? "Online" : "In-person";

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
    locationLabel: format === "Online" ? "Online" : detail.venue || "Oslo, Norway",
    city: format === "Online" ? undefined : "Oslo",
    country: "Norway",
    format,
    category: determineCategory(raw.title, detail.description),
    audienceFit,
    registrationUrl: httpsUrl,
    sourceUrl: raw.url.startsWith("https://") ? raw.url : raw.url.replace("http://", "https://"),
    organizerName: "OsloMet",
    tags: tags.length > 0 ? tags : undefined,
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

    // Filter to career-relevant events
    const careerEvents = rawEvents.filter((e) => isCareerRelevant(e.title, e.summary));
    console.log(`[${PROVIDER_ID}] ${careerEvents.length} career-relevant events after filtering`);

    // Fetch details for each event
    for (const raw of careerEvents) {
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
        // Continue with other events
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

export const oslometProvider: EventsProvider = {
  id: PROVIDER_ID,
  displayName: "OsloMet",
  type: "scrape",
  fetchEvents,
};

export default oslometProvider;

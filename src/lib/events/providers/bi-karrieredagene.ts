/**
 * BI KARRIEREDAGENE PROVIDER
 *
 * Scrapes career fair events from karrieredagene.no and BI career pages.
 * Sources:
 * - https://www.karrieredagene.no/program
 * - https://www.bi.no/en/study-at-bi/resources-and-opportunities/guidance/karrieredagene/
 */

import type { EventsProvider, ScrapeProviderParams, EventItem, EventCategory } from "../types";
import { generateEventId, inferCategory, isYouthFriendly } from "../types";
import { getProviderConfig, getThrottleDelay } from "../config";
import {
  fetchHtml,
  sleep,
  stripHtml,
  extractLinks,
  parseNorwegianDate,
  parseEnglishDate,
  toISODateString,
  slugify,
} from "../scrape-utils";

// ============================================
// CONSTANTS
// ============================================

const PROVIDER_ID = "bi-karrieredagene" as const;
const KARRIEREDAGENE_URL = "https://www.karrieredagene.no";
const PROGRAM_URL = `${KARRIEREDAGENE_URL}/program`;
const BI_CAREER_URL = "https://www.bi.no/en/study-at-bi/resources-and-opportunities/guidance/karrieredagene/";

// ============================================
// TYPES
// ============================================

interface RawProgramEntry {
  title: string;
  dateStr: string;
  time?: string;
  venue?: string;
  url: string;
  description?: string;
}

// ============================================
// PARSING HELPERS
// ============================================

/**
 * Parse program entries from karrieredagene.no/program
 */
function parseProgramPage(html: string): RawProgramEntry[] {
  const entries: RawProgramEntry[] = [];

  // Look for program items - typically in a schedule/timeline format
  const patterns = [
    /<div[^>]*class="[^"]*(?:program|schedule|event|session)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<tr[^>]*>([\s\S]*?)<\/tr>/gi,
    /<li[^>]*class="[^"]*(?:program|event)[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const content = match[1];
      const title = extractProgramTitle(content);
      const dateStr = extractProgramDate(content);
      const time = extractTime(content);
      const venue = extractVenue(content);
      const url = extractProgramUrl(content) || PROGRAM_URL;
      const description = extractDescription(content);

      if (title && title.length > 3) {
        entries.push({
          title,
          dateStr: dateStr || "",
          time,
          venue,
          url,
          description,
        });
      }
    }
  }

  // If structured parsing fails, try to find any career day mentions
  if (entries.length === 0) {
    const text = stripHtml(html);

    // Look for "Karrieredagene 2025" or similar
    const yearMatch = text.match(/karrieredagene\s+(\d{4})/i);
    const dateMatch = text.match(/(\d{1,2}\.\s*[a-zæøå]+(?:\s+\d{4})?)/i) ||
      text.match(/(\d{1,2}\s+[a-zæøå]+(?:\s+\d{4})?)/i);

    if (dateMatch) {
      entries.push({
        title: yearMatch ? `Karrieredagene ${yearMatch[1]}` : "BI Karrieredagene",
        dateStr: dateMatch[1],
        url: PROGRAM_URL,
        description: "Career days at BI Norwegian Business School",
      });
    }
  }

  return entries;
}

/**
 * Parse BI career page for additional info
 */
function parseBICareerPage(html: string): RawProgramEntry[] {
  const entries: RawProgramEntry[] = [];
  const text = stripHtml(html);

  // Look for date information
  const datePatterns = [
    /(\d{1,2}(?:\.\s*|\s+)[a-zæøå]+(?:\s+\d{4})?)/gi,
    /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/gi,
  ];

  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const dateStr = match[1];
      // Check if this is related to karrieredagene
      const context = text.slice(Math.max(0, match.index - 100), match.index + 100);
      if (context.toLowerCase().includes("karrieredag") || context.toLowerCase().includes("career")) {
        entries.push({
          title: "BI Karrieredagene",
          dateStr,
          url: BI_CAREER_URL,
          venue: "BI Oslo",
          description: "Annual career fair at BI Norwegian Business School",
        });
        break; // Usually only one main date
      }
    }
  }

  return entries;
}

/**
 * Extract program title from content
 */
function extractProgramTitle(content: string): string | null {
  // Try headings
  const headingMatch = content.match(/<h[2-5][^>]*>([\s\S]*?)<\/h[2-5]>/i);
  if (headingMatch) {
    return stripHtml(headingMatch[1]).trim();
  }

  // Try title class
  const titleMatch = content.match(/<[^>]+class="[^"]*(?:title|name|heading)[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i);
  if (titleMatch) {
    return stripHtml(titleMatch[1]).trim();
  }

  // Try strong/bold text
  const strongMatch = content.match(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/i);
  if (strongMatch) {
    const text = stripHtml(strongMatch[1]).trim();
    if (text.length > 3 && text.length < 100) {
      return text;
    }
  }

  return null;
}

/**
 * Extract date from program content
 */
function extractProgramDate(content: string): string | null {
  const text = stripHtml(content);

  // Try various patterns
  const patterns = [
    /(\d{1,2}\.\s*[a-zæøå]+\s*\d{4})/i,
    /(\d{1,2}\s+[a-zæøå]+\s+\d{4})/i,
    /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /(\d{1,2}\.\s*[a-zæøå]+)/i,
    /(\d{1,2}\s+[a-zæøå]+)/i,
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
 * Extract time from content
 */
function extractTime(content: string): string | null {
  const text = stripHtml(content);
  const timeMatch = text.match(/(\d{1,2}[:.]\d{2})(?:\s*[-–]\s*(\d{1,2}[:.]\d{2}))?/);
  return timeMatch ? timeMatch[0] : null;
}

/**
 * Extract venue from content
 */
function extractVenue(content: string): string | null {
  const text = stripHtml(content);

  const venuePatterns = [
    /(?:sted|venue|lokasjon|location|where):\s*([^\n,]+)/i,
    /(?:at|på|i)\s+(BI\s+[A-Za-z]+)/i,
    /(BI\s+(?:Oslo|Bergen|Trondheim|Stavanger))/i,
  ];

  for (const pattern of venuePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Extract URL from content
 */
function extractProgramUrl(content: string): string | null {
  const linkMatch = content.match(/<a[^>]+href="([^"]+)"[^>]*>/i);
  if (linkMatch) {
    const href = linkMatch[1];
    if (href.startsWith("http")) {
      return href;
    }
    if (href.startsWith("/")) {
      return `${KARRIEREDAGENE_URL}${href}`;
    }
  }
  return null;
}

/**
 * Extract description from content
 */
function extractDescription(content: string): string | null {
  // Try description/summary elements
  const descMatch = content.match(/<(?:p|div)[^>]*class="[^"]*(?:desc|summary|intro)[^"]*"[^>]*>([\s\S]*?)<\/(?:p|div)>/i);
  if (descMatch) {
    return stripHtml(descMatch[1]).trim().slice(0, 300);
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
 * Determine category from title
 */
function determineCategory(title: string, description?: string): EventCategory {
  const text = `${title} ${description || ""}`.toLowerCase();

  if (text.includes("karrieredag") || text.includes("career fair") || text.includes("jobbmesse")) {
    return "Job Fair";
  }
  if (text.includes("workshop")) {
    return "Workshop";
  }
  if (text.includes("seminar") || text.includes("foredrag")) {
    return "Webinar/Seminar";
  }
  if (text.includes("conference") || text.includes("konferanse")) {
    return "Conference";
  }

  return inferCategory(text);
}

/**
 * Map raw entry to EventItem
 */
function mapToEventItem(
  raw: RawProgramEntry
): Omit<EventItem, "verified" | "verifiedAtISO"> | null {
  let date = parseNorwegianDate(raw.dateStr) || parseEnglishDate(raw.dateStr);

  if (!date) {
    return null;
  }

  const providerEventId = slugify(`${raw.title}-${raw.dateStr}`);
  const searchText = `${raw.title} ${raw.description || ""} student career`;
  const audienceFit = "Students" as const;
  const tags: string[] = ["career-fair"];

  if (isYouthFriendly(audienceFit, searchText)) {
    tags.push("youth-friendly");
  }

  // Determine city from venue
  let city = "Oslo"; // Default for BI
  if (raw.venue) {
    const venueLC = raw.venue.toLowerCase();
    if (venueLC.includes("bergen")) city = "Bergen";
    else if (venueLC.includes("trondheim")) city = "Trondheim";
    else if (venueLC.includes("stavanger")) city = "Stavanger";
  }

  const httpsUrl = raw.url.startsWith("https://")
    ? raw.url
    : raw.url.replace("http://", "https://");

  return {
    id: generateEventId(PROVIDER_ID, providerEventId),
    provider: PROVIDER_ID,
    providerEventId,
    title: raw.title,
    description: raw.description,
    startDateISO: toISODateString(date),
    locationLabel: raw.venue || `${city}, Norway`,
    city,
    country: "Norway",
    format: "In-person",
    category: determineCategory(raw.title, raw.description),
    audienceFit,
    registrationUrl: httpsUrl,
    sourceUrl: httpsUrl,
    organizerName: "BI Norwegian Business School",
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

  const entries: RawProgramEntry[] = [];
  const seenTitles = new Set<string>();

  try {
    // Fetch karrieredagene.no program page
    console.log(`[${PROVIDER_ID}] Fetching karrieredagene.no program...`);
    try {
      const programHtml = await fetchHtml(PROGRAM_URL, {
        timeoutMs: config.timeoutMs,
        userAgent: config.userAgent,
        cacheTtlHours: config.cacheTtlHours,
      });

      const programEntries = parseProgramPage(programHtml);
      for (const entry of programEntries) {
        const key = entry.title.toLowerCase();
        if (!seenTitles.has(key)) {
          seenTitles.add(key);
          entries.push(entry);
        }
      }
      console.log(`[${PROVIDER_ID}] Found ${programEntries.length} entries from program page`);
    } catch (error) {
      console.warn(`[${PROVIDER_ID}] Error fetching program page:`, error);
    }

    await sleep(getThrottleDelay(PROVIDER_ID));

    // Fetch BI career page for additional info
    console.log(`[${PROVIDER_ID}] Fetching BI career page...`);
    try {
      const biHtml = await fetchHtml(BI_CAREER_URL, {
        timeoutMs: config.timeoutMs,
        userAgent: config.userAgent,
        cacheTtlHours: config.cacheTtlHours,
      });

      const biEntries = parseBICareerPage(biHtml);
      for (const entry of biEntries) {
        const key = entry.title.toLowerCase();
        if (!seenTitles.has(key)) {
          seenTitles.add(key);
          entries.push(entry);
        }
      }
      console.log(`[${PROVIDER_ID}] Found ${biEntries.length} entries from BI page`);
    } catch (error) {
      console.warn(`[${PROVIDER_ID}] Error fetching BI career page:`, error);
    }

    // Map to EventItems
    const events: Omit<EventItem, "verified" | "verifiedAtISO">[] = [];
    for (const entry of entries) {
      const event = mapToEventItem(entry);
      if (event) {
        events.push(event);
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

export const biKarrieredageneProvider: EventsProvider = {
  id: PROVIDER_ID,
  displayName: "BI Karrieredagene",
  type: "scrape",
  fetchEvents,
};

export default biKarrieredageneProvider;

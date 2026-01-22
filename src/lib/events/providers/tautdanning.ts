/**
 * TAUTDANNING PROVIDER
 *
 * Scrapes student fairs from tautdanning.no
 * Source: https://www.tautdanning.no/studentfairs/
 */

import type { EventsProvider, ScrapeProviderParams, EventItem } from "../types";
import { generateEventId, inferFormat, isYouthFriendly } from "../types";
import { getProviderConfig, getThrottleDelay } from "../config";
import {
  fetchHtml,
  sleep,
  stripHtml,
  extractLinks,
  parseNorwegianDate,
  toISODateString,
  slugify,
} from "../scrape-utils";

// ============================================
// CONSTANTS
// ============================================

const PROVIDER_ID = "tautdanning" as const;
const BASE_URL = "https://www.tautdanning.no";
const STUDENTFAIRS_URL = `${BASE_URL}/studentfairs/`;

// ============================================
// TYPES
// ============================================

interface RawFairData {
  title: string;
  city: string;
  dates: string;
  venue?: string;
  url: string;
}

// ============================================
// PARSING HELPERS
// ============================================

/**
 * Extract city pages from the main studentfairs index
 */
function extractCityPages(html: string): { city: string; url: string }[] {
  const cities: { city: string; url: string }[] = [];

  // Look for links to city pages like /studentfairs/oslo/
  const links = extractLinks(html, BASE_URL);

  for (const link of links) {
    const match = link.href.match(/\/studentfairs\/([a-z-]+)\/?$/i);
    if (match && match[1] !== "studentfairs") {
      const city = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      // Avoid duplicates
      if (!cities.some((c) => c.city.toLowerCase() === city.toLowerCase())) {
        cities.push({ city, url: link.href });
      }
    }
  }

  // Also check for common Norwegian cities mentioned
  const commonCities = ["oslo", "bergen", "trondheim", "stavanger", "kristiansand", "tromso", "drammen"];
  for (const citySlug of commonCities) {
    const cityUrl = `${STUDENTFAIRS_URL}${citySlug}/`;
    const cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1);
    if (!cities.some((c) => c.city.toLowerCase() === cityName.toLowerCase())) {
      cities.push({ city: cityName, url: cityUrl });
    }
  }

  return cities;
}

/**
 * Parse fair data from a city page
 */
function parseCityPage(html: string, city: string, pageUrl: string): RawFairData[] {
  const fairs: RawFairData[] = [];

  // Look for fair entries - typically contain date and venue info
  // Pattern varies, try multiple approaches

  // Approach 1: Look for structured content with dates
  const datePatterns = [
    /(\d{1,2}\.\s*[a-zæøå]+(?:\s+\d{4})?)/gi,
    /(\d{1,2}\s+[a-zæøå]+(?:\s+\d{4})?)/gi,
  ];

  // Look for article/card elements containing fair info
  const articlePattern = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  const cardPattern = /<div[^>]*class="[^"]*(?:card|event|fair)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;

  let match;
  const patterns = [articlePattern, cardPattern];

  for (const pattern of patterns) {
    while ((match = pattern.exec(html)) !== null) {
      const content = match[1];
      const title = extractFairTitle(content);
      const dates = extractDates(content);
      const venue = extractVenue(content);
      const detailLink = extractDetailLink(content, pageUrl);

      if (title && dates) {
        fairs.push({
          title: title.includes(city) ? title : `${title} ${city}`,
          city,
          dates,
          venue,
          url: detailLink || pageUrl,
        });
      }
    }
  }

  // If no structured content found, try to parse the whole page
  if (fairs.length === 0) {
    const pageTitle = extractPageTitle(html);
    const pageDates = extractDates(html);
    const pageVenue = extractVenue(html);

    if (pageDates) {
      fairs.push({
        title: pageTitle || `Student Fair ${city}`,
        city,
        dates: pageDates,
        venue: pageVenue,
        url: pageUrl,
      });
    }
  }

  return fairs;
}

/**
 * Extract fair title from content
 */
function extractFairTitle(content: string): string | null {
  // Try h1, h2, h3 headings
  const headingPattern = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i;
  const match = content.match(headingPattern);
  if (match) {
    return stripHtml(match[1]).trim();
  }

  // Try title class
  const titlePattern = /<[^>]+class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i;
  const titleMatch = content.match(titlePattern);
  if (titleMatch) {
    return stripHtml(titleMatch[1]).trim();
  }

  return null;
}

/**
 * Extract page title from HTML
 */
function extractPageTitle(html: string): string | null {
  const titlePattern = /<title[^>]*>([\s\S]*?)<\/title>/i;
  const match = html.match(titlePattern);
  if (match) {
    return stripHtml(match[1]).split("|")[0].trim();
  }
  return null;
}

/**
 * Extract dates from content
 */
function extractDates(content: string): string | null {
  // Look for date patterns in Norwegian
  const patterns = [
    /(\d{1,2}\.\s*[a-zæøå]+\s*\d{4})/i,
    /(\d{1,2}\s+[a-zæøå]+\s+\d{4})/i,
    /(\d{1,2}\.\s*[a-zæøå]+)/i,
    /(\d{1,2}\s+[a-zæøå]+)/i,
    /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/,
  ];

  const text = stripHtml(content);

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract venue from content
 */
function extractVenue(content: string): string | null {
  const text = stripHtml(content);

  // Look for venue indicators
  const venuePatterns = [
    /(?:sted|venue|lokasjon|location):\s*([^\n,]+)/i,
    /(?:på|at|i)\s+([A-Z][a-zæøå]+(?:\s+[A-Z][a-zæøå]+)*)/,
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
 * Extract detail link from content
 */
function extractDetailLink(content: string, baseUrl: string): string | null {
  const links = extractLinks(content, baseUrl);

  // Look for "read more", "les mer", or registration links
  for (const link of links) {
    const text = link.text.toLowerCase();
    if (
      text.includes("les mer") ||
      text.includes("read more") ||
      text.includes("mer info") ||
      text.includes("påmelding") ||
      text.includes("register")
    ) {
      return link.href;
    }
  }

  // Return first link if available
  return links.length > 0 ? links[0].href : null;
}

/**
 * Map raw fair data to EventItem
 */
function mapToEventItem(raw: RawFairData): Omit<EventItem, "verified" | "verifiedAtISO"> | null {
  const date = parseNorwegianDate(raw.dates);
  if (!date) return null;

  const providerEventId = slugify(`${raw.city}-${raw.dates}`);
  const searchText = `${raw.title} ${raw.city} student fair`;
  const audienceFit = "Students" as const;
  const tags: string[] = ["student-fair"];

  if (isYouthFriendly(audienceFit, searchText)) {
    tags.push("youth-friendly");
  }

  return {
    id: generateEventId(PROVIDER_ID, providerEventId),
    provider: PROVIDER_ID,
    providerEventId,
    title: raw.title,
    description: raw.venue ? `Venue: ${raw.venue}` : undefined,
    startDateISO: toISODateString(date),
    locationLabel: `${raw.city}, Norway`,
    city: raw.city,
    country: "Norway",
    format: "In-person",
    category: "Job Fair",
    audienceFit,
    registrationUrl: raw.url.startsWith("https://") ? raw.url : raw.url.replace("http://", "https://"),
    sourceUrl: raw.url.startsWith("https://") ? raw.url : raw.url.replace("http://", "https://"),
    organizerName: "Ta Utdanning",
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

  const events: Omit<EventItem, "verified" | "verifiedAtISO">[] = [];
  const seenIds = new Set<string>();

  try {
    console.log(`[${PROVIDER_ID}] Fetching main index...`);

    // Fetch main studentfairs page
    const indexHtml = await fetchHtml(STUDENTFAIRS_URL, {
      timeoutMs: config.timeoutMs,
      userAgent: config.userAgent,
      cacheTtlHours: config.cacheTtlHours,
    });

    // Extract city pages
    const cityPages = extractCityPages(indexHtml);
    console.log(`[${PROVIDER_ID}] Found ${cityPages.length} city pages`);

    // Also parse fairs from the main index page
    const indexFairs = parseCityPage(indexHtml, "Norway", STUDENTFAIRS_URL);
    for (const fair of indexFairs) {
      const event = mapToEventItem(fair);
      if (event && !seenIds.has(event.id)) {
        seenIds.add(event.id);
        events.push(event);
      }
    }

    // Fetch each city page
    for (const { city, url } of cityPages) {
      await sleep(getThrottleDelay(PROVIDER_ID));

      try {
        console.log(`[${PROVIDER_ID}] Fetching ${city}...`);
        const cityHtml = await fetchHtml(url, {
          timeoutMs: config.timeoutMs,
          userAgent: config.userAgent,
          cacheTtlHours: config.cacheTtlHours,
        });

        const fairs = parseCityPage(cityHtml, city, url);
        for (const fair of fairs) {
          const event = mapToEventItem(fair);
          if (event && !seenIds.has(event.id)) {
            seenIds.add(event.id);
            events.push(event);
          }
        }
      } catch (error) {
        console.warn(`[${PROVIDER_ID}] Error fetching ${city}:`, error);
        // Continue with other cities
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

export const tautdanningProvider: EventsProvider = {
  id: PROVIDER_ID,
  displayName: "Ta Utdanning",
  type: "scrape",
  fetchEvents,
};

export default tautdanningProvider;

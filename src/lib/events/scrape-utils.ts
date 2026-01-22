/**
 * SCRAPE UTILITIES
 *
 * Shared utilities for web scraping providers.
 * Includes caching, throttling, and HTML parsing helpers.
 */

import * as fs from "fs";
import * as path from "path";
import { SCRAPE_USER_AGENT } from "./config";

// ============================================
// TYPES
// ============================================

export interface HtmlCacheEntry {
  url: string;
  html: string;
  fetchedAtISO: string;
  expiresAtISO: string;
}

export interface HtmlCache {
  [url: string]: HtmlCacheEntry;
}

// ============================================
// CACHE MANAGEMENT
// ============================================

const CACHE_DIR = path.join(process.cwd(), "data", "cache");
const HTML_CACHE_FILE = path.join(CACHE_DIR, "html-cache.json");

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function loadHtmlCache(): HtmlCache {
  ensureCacheDir();
  try {
    if (fs.existsSync(HTML_CACHE_FILE)) {
      const data = fs.readFileSync(HTML_CACHE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("Error loading HTML cache:", error);
  }
  return {};
}

function saveHtmlCache(cache: HtmlCache): void {
  ensureCacheDir();
  try {
    fs.writeFileSync(HTML_CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.warn("Error saving HTML cache:", error);
  }
}

/**
 * Get cached HTML if available and not expired
 */
export function getCachedHtml(url: string): string | null {
  const cache = loadHtmlCache();
  const entry = cache[url];

  if (!entry) return null;

  const now = new Date();
  const expires = new Date(entry.expiresAtISO);

  if (now > expires) {
    // Expired - remove from cache
    delete cache[url];
    saveHtmlCache(cache);
    return null;
  }

  return entry.html;
}

/**
 * Cache HTML response
 */
export function cacheHtml(url: string, html: string, ttlHours: number): void {
  const cache = loadHtmlCache();
  const now = new Date();
  const expires = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

  cache[url] = {
    url,
    html,
    fetchedAtISO: now.toISOString(),
    expiresAtISO: expires.toISOString(),
  };

  saveHtmlCache(cache);
}

/**
 * Clean expired cache entries
 */
export function cleanExpiredHtmlCache(): number {
  const cache = loadHtmlCache();
  const now = new Date();
  let removed = 0;

  for (const [url, entry] of Object.entries(cache)) {
    if (new Date(entry.expiresAtISO) < now) {
      delete cache[url];
      removed++;
    }
  }

  if (removed > 0) {
    saveHtmlCache(cache);
  }

  return removed;
}

// ============================================
// HTTP FETCHING
// ============================================

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch HTML with timeout and user-agent
 */
export async function fetchHtml(
  url: string,
  options: {
    timeoutMs?: number;
    userAgent?: string;
    cacheTtlHours?: number;
    useCache?: boolean;
  } = {}
): Promise<string> {
  const {
    timeoutMs = 8000,
    userAgent = SCRAPE_USER_AGENT,
    cacheTtlHours = 6,
    useCache = true,
  } = options;

  // Check cache first
  if (useCache) {
    const cached = getCachedHtml(url);
    if (cached) {
      return cached;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,nb;q=0.8,no;q=0.7",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Cache the result
    if (useCache && cacheTtlHours > 0) {
      cacheHtml(url, html, cacheTtlHours);
    }

    return html;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================
// HTML PARSING HELPERS
// ============================================

/**
 * Extract text content from HTML, removing tags
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract attribute value from a tag
 */
export function extractAttribute(tag: string, attr: string): string | null {
  const regex = new RegExp(`${attr}=["']([^"']+)["']`, "i");
  const match = tag.match(regex);
  return match ? match[1] : null;
}

/**
 * Find all matches of a regex pattern in HTML
 */
export function findAllMatches(html: string, pattern: RegExp): RegExpMatchArray[] {
  const matches: RegExpMatchArray[] = [];
  let match;
  const globalPattern = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");

  while ((match = globalPattern.exec(html)) !== null) {
    matches.push(match);
  }

  return matches;
}

/**
 * Extract content between two markers (inclusive of the markers)
 */
export function extractBetween(html: string, startMarker: string, endMarker: string): string | null {
  const startIndex = html.indexOf(startMarker);
  if (startIndex === -1) return null;

  const endIndex = html.indexOf(endMarker, startIndex);
  if (endIndex === -1) return null;

  return html.slice(startIndex, endIndex + endMarker.length);
}

/**
 * Extract all links from HTML
 */
export function extractLinks(html: string, baseUrl: string): { href: string; text: string }[] {
  const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const links: { href: string; text: string }[] = [];

  let match;
  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1];
    const text = stripHtml(match[2]);

    // Resolve relative URLs
    let fullUrl: string;
    try {
      fullUrl = new URL(href, baseUrl).toString();
    } catch {
      continue; // Skip invalid URLs
    }

    links.push({ href: fullUrl, text });
  }

  return links;
}

// ============================================
// DATE PARSING HELPERS
// ============================================

const NORWEGIAN_MONTHS: Record<string, number> = {
  januar: 0, jan: 0,
  februar: 1, feb: 1,
  mars: 2, mar: 2,
  april: 3, apr: 3,
  mai: 4,
  juni: 5, jun: 5,
  juli: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  oktober: 9, okt: 9,
  november: 10, nov: 10,
  desember: 11, des: 11,
};

const ENGLISH_MONTHS: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

/**
 * Parse a Norwegian date string like "15. mars 2025" or "15 mars 2025"
 */
export function parseNorwegianDate(dateStr: string): Date | null {
  const cleaned = dateStr.toLowerCase().replace(/\./g, "").trim();

  // Try patterns like "15 mars 2025" or "15 mars"
  const pattern = /(\d{1,2})\s+([a-zæøå]+)(?:\s+(\d{4}))?/i;
  const match = cleaned.match(pattern);

  if (!match) return null;

  const day = parseInt(match[1], 10);
  const monthName = match[2].toLowerCase();
  const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();

  const month = NORWEGIAN_MONTHS[monthName] ?? ENGLISH_MONTHS[monthName];
  if (month === undefined) return null;

  const date = new Date(year, month, day);

  // If no year provided and date is in past, assume next year
  if (!match[3] && date < new Date()) {
    date.setFullYear(date.getFullYear() + 1);
  }

  return date;
}

/**
 * Parse an English date string like "March 15, 2025" or "15 March 2025"
 */
export function parseEnglishDate(dateStr: string): Date | null {
  const cleaned = dateStr.toLowerCase().replace(/,/g, "").trim();

  // Try "March 15 2025" format
  let pattern = /([a-z]+)\s+(\d{1,2})(?:\s+(\d{4}))?/i;
  let match = cleaned.match(pattern);

  if (match) {
    const monthName = match[1].toLowerCase();
    const day = parseInt(match[2], 10);
    const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();

    const month = ENGLISH_MONTHS[monthName];
    if (month === undefined) return null;

    const date = new Date(year, month, day);
    if (!match[3] && date < new Date()) {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date;
  }

  // Try "15 March 2025" format
  pattern = /(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?/i;
  match = cleaned.match(pattern);

  if (match) {
    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase();
    const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();

    const month = ENGLISH_MONTHS[monthName];
    if (month === undefined) return null;

    const date = new Date(year, month, day);
    if (!match[3] && date < new Date()) {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date;
  }

  return null;
}

/**
 * Parse date from various formats
 */
export function parseDate(dateStr: string): Date | null {
  // Try Norwegian first
  let date = parseNorwegianDate(dateStr);
  if (date) return date;

  // Try English
  date = parseEnglishDate(dateStr);
  if (date) return date;

  // Try ISO format
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
  }

  // Try DD/MM/YYYY or DD.MM.YYYY
  const euroMatch = dateStr.match(/(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/);
  if (euroMatch) {
    return new Date(parseInt(euroMatch[3], 10), parseInt(euroMatch[2], 10) - 1, parseInt(euroMatch[1], 10));
  }

  return null;
}

/**
 * Format date to ISO date string (date only, no time)
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Generate a slug from title for use as ID
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[æ]/g, "ae")
    .replace(/[ø]/g, "o")
    .replace(/[å]/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

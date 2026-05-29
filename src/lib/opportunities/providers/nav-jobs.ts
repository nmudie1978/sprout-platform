/**
 * NAV JOBS PROVIDER (pam-stilling-feed)
 *
 * Fetches job ads from NAV's public stilling-feed — the official
 * Norwegian public employment service's JSON Feed. Covers the majority
 * of publicly advertised vacancies in Norway (excludes finn.no).
 *
 * Endpoint: https://pam-stilling-feed.nav.no/api/v1/feed
 * Auth:     Bearer token (required)
 * Format:   JSON Feed v1.0 with `_feed_entry` extension
 * Paging:   Forward via `next_url` on each page
 * Fresh:    `If-Modified-Since` header caps lookback
 *
 * TOKEN HANDLING
 *   - In CI / production:  NAV_PAM_PUBLIC_TOKEN env var (from a
 *     registered consumer — email nav.team.arbeidsplassen@nav.no).
 *   - In dev (no env var):  falls back to the public rotating token
 *     at /api/publicToken, with a loud warning. Do not ship this
 *     fallback to prod — the public token rate-limits aggressively.
 *
 * FLOW
 *   1. Fetch feed pages from If-Modified-Since = (now − sinceDays)
 *   2. Collect items where _feed_entry.status === "ACTIVE"
 *   3. Dedupe by uuid (the feed can repeat the same ad on updates)
 *   4. For each ACTIVE uuid, GET /api/v1/feedentry/{uuid} for full
 *      ad_content (deadline, applicationUrl, city, extent, employer)
 *   5. Normalise into OpportunityItem shape
 */

import type {
  FetchProviderParams,
  OpportunitiesProvider,
  OpportunityItem,
  EmploymentType,
  WorkMode,
  AudienceFit,
} from "../types";
import {
  generateOpportunityId,
  buildLocationLabel,
  computeExpiresAtISO,
  inferAudienceFit,
  inferEmploymentType,
  inferWorkMode,
} from "../types";
import {
  getProviderConfig,
  getThrottleDelay,
  NAV_JOBS_FEED_URL,
  NAV_JOBS_PUBLIC_TOKEN_URL,
} from "../config";

// ============================================
// CONSTANTS
// ============================================

const PROVIDER_ID = "nav-jobs" as const;
const FEED_BASE_ORIGIN = "https://pam-stilling-feed.nav.no";

// ============================================
// FEED RESPONSE TYPES
// ============================================

interface FeedItemEntry {
  uuid: string;
  status: "ACTIVE" | "INACTIVE";
  title: string;
  businessName: string;
  municipal: string;
  sistEndret: string;
}

interface FeedItem {
  id: string;
  url: string;
  title: string;
  content_text: string;
  date_modified: string;
  _feed_entry: FeedItemEntry;
}

interface FeedResponse {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  description: string;
  next_url?: string;
  next_id?: string;
  id: string;
  items: FeedItem[];
}

interface WorkLocation {
  country?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  county?: string | null;
  municipal?: string | null;
}

interface AdContent {
  uuid: string;
  published: string;
  expires?: string;
  updated: string;
  workLocations?: WorkLocation[];
  title: string;
  description?: string;
  sourceurl?: string;
  source?: string;
  applicationUrl?: string;
  applicationDue?: string;
  occupationCategories?: { level1?: string; level2?: string }[];
  jobtitle?: string;
  link?: string;
  employer?: { name?: string };
  engagementtype?: string;
  extent?: string;
  sector?: string;
}

interface FeedEntryDetail {
  uuid: string;
  sistEndret: string;
  status: "ACTIVE" | "INACTIVE";
  ad_content?: AdContent;
}

// ============================================
// TOKEN RESOLUTION
// ============================================

let _cachedPublicToken: { token: string; fetchedAt: number } | null = null;
const PUBLIC_TOKEN_TTL_MS = 30 * 60 * 1000;

async function resolveBearerToken(): Promise<string> {
  const envToken = getProviderConfig(PROVIDER_ID).bearerToken;
  if (envToken && envToken.trim()) return envToken.trim();

  if (_cachedPublicToken && Date.now() - _cachedPublicToken.fetchedAt < PUBLIC_TOKEN_TTL_MS) {
    return _cachedPublicToken.token;
  }

  console.warn(
    "[nav-jobs] NAV_PAM_PUBLIC_TOKEN env var not set — falling back to /api/publicToken (development only, rate-limited).",
  );

  const res = await fetch(NAV_JOBS_PUBLIC_TOKEN_URL);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch NAV public token: HTTP ${res.status}. Set NAV_PAM_PUBLIC_TOKEN for production.`,
    );
  }
  const text = await res.text();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const token = lines[lines.length - 1];
  if (!token || !token.includes(".")) {
    throw new Error("Could not parse NAV public token response");
  }
  _cachedPublicToken = { token, fetchedAt: Date.now() };
  return token;
}

// ============================================
// HTTP HELPERS
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson<T>(
  url: string,
  token: string,
  headers: Record<string, string> = {},
): Promise<T> {
  const cfg = getProviderConfig(PROVIDER_ID);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), cfg.timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": cfg.userAgent,
        ...headers,
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching ${url}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * NAV feed response URLs are returned as site-relative paths
 * ("/api/v1/feed/<uuid>") — resolve against the pam-stilling-feed
 * origin rather than our own.
 */
function absoluteFeedUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${FEED_BASE_ORIGIN}${pathOrUrl}`;
}

/**
 * Format a Date as RFC 7231 "Wed, 21 Oct 2015 07:28:00 GMT" for
 * If-Modified-Since.
 */
function toHttpDate(d: Date): string {
  return d.toUTCString();
}

// ============================================
// NORMALISATION
// ============================================

function toCityTitleCase(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  return raw
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function pickApplicationUrl(ad: AdContent): string | undefined {
  const candidates = [ad.applicationUrl, ad.sourceurl, ad.link];
  for (const url of candidates) {
    if (url && url.startsWith("https://")) return url;
  }
  return undefined;
}

function pickSourceUrl(ad: AdContent, uuid: string): string {
  if (ad.link && ad.link.startsWith("https://")) return ad.link;
  return `https://arbeidsplassen.nav.no/stillinger/stilling/${uuid}`;
}

function isApprenticeshipAd(ad: AdContent): boolean {
  const hay = `${ad.engagementtype ?? ""} ${ad.title ?? ""} ${ad.jobtitle ?? ""}`.toLowerCase();
  return hay.includes("lærling") || hay.includes("apprentice");
}

function normalizeAd(detail: FeedEntryDetail): OpportunityItem | null {
  const ad = detail.ad_content;
  if (!ad) return null;

  const applicationUrl = pickApplicationUrl(ad);
  if (!applicationUrl) return null; // no way to apply → drop

  const loc = (ad.workLocations ?? [])[0] ?? {};
  const city = toCityTitleCase(loc.city ?? loc.municipal);
  const municipality = toCityTitleCase(loc.municipal);

  const employmentType: EmploymentType = inferEmploymentType(ad.extent);
  const kind = isApprenticeshipAd(ad) ? "apprenticeship" : "job";
  const workMode: WorkMode = inferWorkMode({
    text: `${ad.title ?? ""} ${ad.description ?? ""}`,
  });

  const descriptionText = stripHtml(ad.description ?? "").slice(0, 1500);
  const audienceFit: AudienceFit = inferAudienceFit(
    `${ad.title ?? ""} ${descriptionText}`,
  );

  const published = ad.published || ad.updated || detail.sistEndret;
  const applicationDeadlineISO = normalizeApplicationDue(ad.applicationDue);

  return {
    id: generateOpportunityId(PROVIDER_ID, detail.uuid),
    provider: PROVIDER_ID,
    providerOpportunityId: detail.uuid,
    kind,
    title: ad.jobtitle || ad.title,
    description: descriptionText || undefined,
    employerName: ad.employer?.name || undefined,
    locationLabel: buildLocationLabel(city, "Norway", workMode),
    city,
    municipality,
    country: "Norway",
    workMode,
    employmentType,
    publishedISO: new Date(published).toISOString(),
    applicationDeadlineISO,
    expiresAtISO: computeExpiresAtISO(
      kind,
      new Date(published).toISOString(),
      applicationDeadlineISO,
    ),
    applicationUrl,
    sourceUrl: pickSourceUrl(ad, detail.uuid),
    careerTags: undefined,
    audienceFit,
    verified: false,
    tags: buildTags(ad),
  };
}

function normalizeApplicationDue(due: string | undefined): string | undefined {
  if (!due) return undefined;
  // NAV returns ISO dates like "2026-05-06" or "2026-05-06T00:00:00+02:00"
  const parsed = new Date(due);
  if (isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function buildTags(ad: AdContent): string[] {
  const tags: string[] = [];
  if (ad.sector) tags.push(`sector:${ad.sector.toLowerCase()}`);
  if (ad.extent) tags.push(`extent:${ad.extent.toLowerCase()}`);
  const cat = ad.occupationCategories?.[0];
  if (cat?.level1) tags.push(`occupation-l1:${cat.level1.toLowerCase()}`);
  return tags;
}

// ============================================
// PAGING + FETCH
// ============================================

async function fetchFeedPages(
  token: string,
  params: FetchProviderParams,
): Promise<FeedItem[]> {
  const cfg = getProviderConfig(PROVIDER_ID);
  const since = new Date(
    Date.now() - params.sincePublishedDays * 24 * 60 * 60 * 1000,
  );

  const collected: FeedItem[] = [];
  const seenUuids = new Set<string>();
  let pageUrl: string | null = NAV_JOBS_FEED_URL;
  const headers: Record<string, string> = {
    "If-Modified-Since": toHttpDate(since),
  };

  let pagesFetched = 0;
  const MAX_PAGES = 200; // safety net

  while (pageUrl && collected.length < params.maxItems && pagesFetched < MAX_PAGES) {
    pagesFetched += 1;
    const page: FeedResponse = await fetchJson<FeedResponse>(
      pageUrl,
      token,
      headers,
    );

    if (!page.items || page.items.length === 0) break;

    for (const item of page.items) {
      if (item._feed_entry.status !== "ACTIVE") continue;
      if (seenUuids.has(item._feed_entry.uuid)) continue;
      seenUuids.add(item._feed_entry.uuid);
      collected.push(item);
      if (collected.length >= params.maxItems) break;
    }

    pageUrl = page.next_url ? absoluteFeedUrl(page.next_url) : null;
    if (pageUrl) await sleep(getThrottleDelay(PROVIDER_ID));
  }

  return collected;
}

async function fetchDetailForUuid(
  uuid: string,
  token: string,
): Promise<FeedEntryDetail | null> {
  try {
    const url = `${FEED_BASE_ORIGIN}/api/v1/feedentry/${uuid}`;
    return await fetchJson<FeedEntryDetail>(url, token);
  } catch (err) {
    console.warn(`[nav-jobs] detail fetch failed for ${uuid}:`, err);
    return null;
  }
}

// ============================================
// PROVIDER ENTRY POINT
// ============================================

async function fetchItems(
  params: FetchProviderParams,
): Promise<Omit<OpportunityItem, "verified" | "verifiedAtISO">[]> {
  const token = await resolveBearerToken();
  const feedItems = await fetchFeedPages(token, params);

  const out: Omit<OpportunityItem, "verified" | "verifiedAtISO">[] = [];

  for (const feedItem of feedItems) {
    const uuid = feedItem._feed_entry.uuid;
    const detail = await fetchDetailForUuid(uuid, token);
    if (!detail || detail.status !== "ACTIVE") continue;
    const normalized = normalizeAd(detail);
    if (!normalized) continue;
    const { verified, verifiedAtISO, ...rest } = normalized;
    void verified;
    void verifiedAtISO;
    out.push(rest);
    await sleep(getThrottleDelay(PROVIDER_ID));
  }

  return out;
}

export const navJobsProvider: OpportunitiesProvider = {
  id: PROVIDER_ID,
  displayName: "NAV Arbeidsplassen",
  cadence: "daily",
  fetchItems,
};

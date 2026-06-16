/**
 * RSS / Atom ingest for the Industry Insights pool.
 *
 * Pure, dependency-free helpers used by `scripts/ingest-insights-rss.ts` to pull
 * RECENT articles from tier-1 source feeds, keep only youth-career-relevant ones
 * published within the recency window, and turn them into SeedCandidates that the
 * existing verification pipeline (`refresh-insights-pool.ts`) then promotes into
 * the pool.
 *
 * Why hand-rolled parsing (no XML dep): this runs only in CI/scripts over a small
 * set of standard RSS 2.0 / Atom feeds, and a feed that doesn't parse simply
 * yields no items (graceful) — every item still passes through URL verification
 * and a human-reviewed PR before it can reach users.
 */

import { canonicalizeUrl } from "./canonicalize";
import type { PoolContentType, SeedCandidate } from "./pool-types";

// ---------------------------------------------------------------------------
// Config types
// ---------------------------------------------------------------------------

export interface FeedConfig {
  feedUrl: string;
  sourceName: string;
  contentType: PoolContentType;
  /** Tags applied to every item from this feed (plus keyword-derived ones). */
  defaultTags: string[];
}

export interface RawFeedItem {
  title: string;
  link: string;
  description: string;
  /** Raw date string from the feed (RFC-822 or ISO-8601). */
  date: string;
}

/** Recency window — kept in sync with MAX_AGE_MONTHS in pool-service.ts. */
export const INGEST_MAX_AGE_MONTHS = 12;

/**
 * A genuine work/career signal — word-boundary matched so incidental substrings
 * ("network", "framework", academic "learning") don't qualify. An item must hit
 * at least one of these to be considered relevant. AI/automation/education alone
 * are intentionally NOT here: research about AI ≠ career content, so those only
 * help via tag derivation once a work signal is already present.
 */
const WORK_SIGNAL =
  /\b(careers?|jobs?|employ(?:ment|er|ee|able|ability)?|workforce|workplace|world of work|future of work|hiring|recruit(?:ing|ment)?|apprenticeship?s?|internships?|labou?r market|wages?|salar(?:y|ies)|professions?|vocational|re-?skill(?:ing)?|up-?skill(?:ing)?|skills? gap|in-demand skills?|gig economy|workers?|occupations?)\b/i;

/**
 * Institutional / health-news noise that slips past WORK_SIGNAL (e.g. "named
 * head of the Department of Labour Studies", "health workers" in an outbreak
 * notice). If the title matches, drop it regardless.
 */
const NOISE_PATTERN =
  /\b(named|appoint(?:ed|ment)|obituary|dies|died|passes away|emeritus|tenure|outbreak|ebola|cholera|measles|pandemic|epidemic|vaccin|disease|hantavirus|in memoriam|elected|to lead the|new (?:head|director|dean|president|chair|provost)|message by|looking for an?\b|join our team|join us as|now hiring|apply now|job opening|vacancy|award for)/i;

/** Optional keyword → tag derivations, layered on top of a feed's defaultTags. */
const KEYWORD_TAGS: Array<{ match: RegExp; tag: string }> = [
  { match: /\b(ai|artificial intelligence|machine learning)\b/i, tag: "ai" },
  { match: /\bautomation\b/i, tag: "automation" },
  { match: /\bskill/i, tag: "skills" },
  { match: /\beducation|learning|training\b/i, tag: "education" },
  { match: /\bgreen|climate|renewable|sustainab/i, tag: "sustainability" },
  { match: /\b(gen z|young people|youth)\b/i, tag: "youth-employment" },
  { match: /\bcareer/i, tag: "career-planning" },
  { match: /\bjob/i, tag: "jobs" },
];

// ---------------------------------------------------------------------------
// Text utilities
// ---------------------------------------------------------------------------

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&#8217;": "’",
  "&#8216;": "‘",
  "&#8220;": "“",
  "&#8221;": "”",
  "&#8211;": "–",
  "&#8212;": "—",
};

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&[a-zA-Z#0-9]+;/g, (m) => ENTITIES[m] ?? m);
}

const MAX_SUMMARY = 280;

/** Strip HTML, decode entities, collapse whitespace, and cap to a summary length. */
export function cleanText(s: string): string {
  let t = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  t = t.replace(/<[^>]+>/g, " ");
  t = decodeEntities(t);
  t = t.replace(/\s+/g, " ").trim();
  if (t.length > MAX_SUMMARY) {
    t = t.slice(0, MAX_SUMMARY).replace(/\s+\S*$/, "").trim() + "…";
  }
  return t;
}

// ---------------------------------------------------------------------------
// Feed parsing (RSS 2.0 + Atom)
// ---------------------------------------------------------------------------

function tagContent(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = re.exec(block);
  if (!m) return null;
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

/** Atom links use <link href="..."/>; prefer rel="alternate" or the first href. */
function atomLink(block: string): string | null {
  const links = [...block.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  if (links.length === 0) return null;
  const alt = links.find((l) => /rel=["']alternate["']/i.test(l)) ?? links.find((l) => !/rel=/i.test(l)) ?? links[0];
  const href = /href=["']([^"']+)["']/i.exec(alt);
  return href ? href[1].trim() : null;
}

/**
 * Parse an RSS 2.0 or Atom feed into raw items. Returns [] on anything it can't
 * parse rather than throwing.
 */
export function parseFeed(xml: string): RawFeedItem[] {
  if (!xml || typeof xml !== "string") return [];
  const items: RawFeedItem[] = [];

  // RSS <item> ... </item>
  const blocks = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((m) => m[0]);
  for (const block of blocks) {
    const title = tagContent(block, "title");
    const link = tagContent(block, "link");
    if (!title || !link) continue;
    items.push({
      title: decodeEntities(title).trim(),
      link: link.trim(),
      description: tagContent(block, "description") ?? tagContent(block, "content:encoded") ?? "",
      date: tagContent(block, "pubDate") ?? tagContent(block, "dc:date") ?? "",
    });
  }

  // Atom <entry> ... </entry>
  const entries = [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map((m) => m[0]);
  for (const block of entries) {
    const title = tagContent(block, "title");
    const link = atomLink(block);
    if (!title || !link) continue;
    items.push({
      title: decodeEntities(title).trim(),
      link: link.trim(),
      description: tagContent(block, "summary") ?? tagContent(block, "content") ?? "",
      date: tagContent(block, "published") ?? tagContent(block, "updated") ?? "",
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// Relevance + mapping
// ---------------------------------------------------------------------------

export function isRelevant(title: string, description: string): boolean {
  // Title-only noise check: announcements/health notices are off-topic even when
  // a work term appears incidentally ("health workers", "Labour Studies").
  if (NOISE_PATTERN.test(title)) return false;
  const hay = `${title} ${description}`;
  return WORK_SIGNAL.test(hay);
}

function deriveTags(defaultTags: string[], text: string): string[] {
  const tags = new Set(defaultTags);
  for (const { match, tag } of KEYWORD_TAGS) {
    if (tags.size >= 3) break;
    if (match.test(text)) tags.add(tag);
  }
  return [...tags].slice(0, 3);
}

/** Convert a raw feed item to a SeedCandidate, or null if it can't be dated. */
export function feedItemToCandidate(raw: RawFeedItem, feed: FeedConfig): SeedCandidate | null {
  const ms = Date.parse(raw.date);
  if (Number.isNaN(ms)) return null;
  const publishDate = new Date(ms).toISOString().slice(0, 10);

  const title = cleanText(raw.title);
  const summary = cleanText(raw.description) || title;
  if (!title) return null;

  return {
    title,
    summary,
    sourceName: feed.sourceName,
    sourceUrl: raw.link,
    contentType: feed.contentType,
    tags: deriveTags(feed.defaultTags, `${raw.title} ${raw.description}`),
    publishDate,
  };
}

// ---------------------------------------------------------------------------
// Selection (recency + dedup + cap)
// ---------------------------------------------------------------------------

function withinMonths(dateISO: string, months: number, now: number): boolean {
  const t = Date.parse(dateISO);
  if (Number.isNaN(t)) return false;
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - months);
  return t >= cutoff.getTime();
}

export interface SelectArgs {
  incoming: SeedCandidate[];
  /** Existing seed candidates (used only for their URLs here). */
  existing: SeedCandidate[];
  /** Canonicalizable URLs already present in seeds or the verified pool. */
  existingUrls: string[];
  now: number;
  max: number;
  /** Cap per sourceName so one high-volume feed can't dominate a run. */
  maxPerSource?: number;
}

/**
 * From freshly-parsed incoming candidates, keep only those that are:
 *  - within the recency window,
 *  - not already in seeds/pool (canonical-URL dedup),
 *  - not duplicated among the incoming set, and
 *  - within the per-source cap (diversity),
 * capped to `max` newest-first.
 */
export function selectFreshCandidates(args: SelectArgs): SeedCandidate[] {
  const { incoming, existingUrls, now, max, maxPerSource } = args;
  const seen = new Set(existingUrls.map(canonicalizeUrl));
  const perSource = new Map<string, number>();
  const out: SeedCandidate[] = [];

  const sorted = [...incoming].sort(
    (a, b) => Date.parse(b.publishDate ?? "") - Date.parse(a.publishDate ?? ""),
  );

  for (const c of sorted) {
    if (out.length >= max) break;
    if (!c.publishDate || !withinMonths(c.publishDate, INGEST_MAX_AGE_MONTHS, now)) continue;
    const key = canonicalizeUrl(c.sourceUrl);
    if (seen.has(key)) continue;
    if (maxPerSource !== undefined) {
      const used = perSource.get(c.sourceName) ?? 0;
      if (used >= maxPerSource) continue;
      perSource.set(c.sourceName, used + 1);
    }
    seen.add(key);
    out.push(c);
  }

  return out;
}

/** Drop seed candidates that have fallen out of the recency window. */
export function pruneStaleSeeds(seeds: SeedCandidate[], now: number): SeedCandidate[] {
  return seeds.filter((s) => s.publishDate && withinMonths(s.publishDate, INGEST_MAX_AGE_MONTHS, now));
}

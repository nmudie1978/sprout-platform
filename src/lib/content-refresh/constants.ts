/**
 * Content Refresh Constants
 *
 * Centralised tags, schedules, and metadata for the content revalidation system.
 * All content sections use these shared constants so refresh logic is consistent.
 */

// ── Cache Tags ──────────────────────────────────────────────────────
// Used with revalidateTag() to bust specific content caches.

export const CONTENT_TAGS = {
  /** Job market statistics carousel (100+ stat cards) */
  STATS: "content-stats",
  /** Insights pool (articles, videos, stat reports from verified-pool.json) */
  INSIGHTS_POOL: "content-insights-pool",
  /** Video pool (curated educational videos) */
  VIDEOS: "content-videos",
  /** Podcast data (CFYE episodes + goal-linked podcasts) */
  PODCASTS: "content-podcasts",
  /** World Lens articles (curated Tier-1 articles) */
  ARTICLES: "content-articles",
  /** Beyond Borders content (international career resources) */
  BEYOND_BORDERS: "content-beyond-borders",
  /** Research evidence / Did You Know facts */
  FACTS: "content-facts",
  /** Catch-all tag for full content refresh */
  ALL: "content-all",
} as const;

export type ContentTag = (typeof CONTENT_TAGS)[keyof typeof CONTENT_TAGS];

/** All individual content tags (excludes ALL) */
export const ALL_CONTENT_TAGS: ContentTag[] = [
  CONTENT_TAGS.STATS,
  CONTENT_TAGS.INSIGHTS_POOL,
  CONTENT_TAGS.VIDEOS,
  CONTENT_TAGS.PODCASTS,
  CONTENT_TAGS.ARTICLES,
  CONTENT_TAGS.BEYOND_BORDERS,
  CONTENT_TAGS.FACTS,
];

// ── Revalidation Intervals ──────────────────────────────────────────
// Default TTLs in seconds for ISR / route-level caching.

export const REVALIDATE_INTERVALS = {
  /** Stats / reference data: 1 hour */
  STATS: 60 * 60,
  /** Insights pool: 5 minutes (lightweight, file-based) */
  INSIGHTS_POOL: 5 * 60,
  /** Videos / podcasts / articles: 24 hours (static, curated quarterly) */
  CURATED_CONTENT: 60 * 60 * 24,
  /** Default fallback for content routes: 14 days */
  DEFAULT: 60 * 60 * 24 * 14,
} as const;

// ── Supported Refresh Targets ───────────────────────────────────────
// Used by the revalidation API endpoint to map target names to tags.

export const REFRESH_TARGETS = {
  "content-stats": [CONTENT_TAGS.STATS],
  "content-videos": [CONTENT_TAGS.VIDEOS],
  "content-podcasts": [CONTENT_TAGS.PODCASTS],
  "content-articles": [CONTENT_TAGS.ARTICLES],
  "content-beyond-borders": [CONTENT_TAGS.BEYOND_BORDERS],
  "content-insights-pool": [CONTENT_TAGS.INSIGHTS_POOL],
  "content-facts": [CONTENT_TAGS.FACTS],
  "content-all": ALL_CONTENT_TAGS,
} as const;

export type RefreshTarget = keyof typeof REFRESH_TARGETS;

/**
 * Weekly RSS ingest — pure pipeline.
 *
 * Fetches are done by the cron route; everything here is pure and unit-tested:
 * parse feed XML → filter (recency + relevance) → dedupe (canonical hash) →
 * safety-screen → map to a PoolItem. No LLM, no fabricated text/URLs — every
 * field comes from the feed itself.
 */

import { canonicalizeUrl, hashUrl } from "./canonicalize";
import type { PoolItem, PoolContentType } from "./pool-types";

export interface RawFeedItem {
  title: string;
  url: string;
  summary: string;
  publishDate?: string;
}

export interface FeedConfig {
  source: string;
  feedUrl?: string;
  contentType: PoolContentType;
  defaultTags: string[];
}

export interface HashedItem extends RawFeedItem {
  urlHash: string;
}

const KEYWORDS = [
  "career",
  "careers",
  "job",
  "jobs",
  "skill",
  "skills",
  "work",
  "future of work",
  "employment",
  "youth",
  "apprentice",
  "graduate",
  "wage",
  "salary",
  "industry",
  "ai",
];

const UNSAFE = ["porn", "gambling", "casino", "nsfw", "escort", "betting"];

const MAX_AGE_DAYS = 90;

/** Strip CDATA + inner tags and trim. */
function stripTag(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!m) return "";
  return m[1]
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function linkOf(block: string): string {
  const cdata = stripTag(block, "link");
  if (cdata) return cdata;
  const href = block.match(/<link[^>]*href="([^"]+)"/i);
  return href ? href[1] : "";
}

/** Minimal, dependency-free RSS/Atom item extraction. */
export function parseFeed(xml: string): RawFeedItem[] {
  const items: RawFeedItem[] = [];
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/(item|entry)>/gi) ?? [];
  for (const b of blocks) {
    const title = stripTag(b, "title");
    const url = linkOf(b);
    const summary =
      stripTag(b, "description") ||
      stripTag(b, "summary") ||
      stripTag(b, "content");
    const rawDate =
      stripTag(b, "pubDate") ||
      stripTag(b, "updated") ||
      stripTag(b, "published");
    let publishDate: string | undefined;
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) publishDate = d.toISOString();
    }
    if (title && url) items.push({ title, url, summary, publishDate });
  }
  return items;
}

/** Keep items that are recent (≤ 90 days) and match a career/work keyword. */
export function filterRelevant(
  items: RawFeedItem[],
  now: Date = new Date()
): RawFeedItem[] {
  const cutoff = now.getTime() - MAX_AGE_DAYS * 86400000;
  return items.filter((i) => {
    if (i.publishDate && new Date(i.publishDate).getTime() < cutoff)
      return false;
    const hay = `${i.title} ${i.summary}`.toLowerCase();
    return KEYWORDS.some((k) => hay.includes(k));
  });
}

/** Drop items whose canonical-URL hash is already known or repeated in-batch. */
export function dedupe(items: RawFeedItem[], known: Set<string>): HashedItem[] {
  const out: HashedItem[] = [];
  const local = new Set(known);
  for (const i of items) {
    const urlHash = hashUrl(canonicalizeUrl(i.url));
    if (local.has(urlHash)) continue;
    local.add(urlHash);
    out.push({ ...i, urlHash });
  }
  return out;
}

/** Reject obviously unsafe titles/summaries (content goes live unreviewed). */
export function screenSafe(i: { title: string; summary: string }): boolean {
  const hay = `${i.title} ${i.summary}`.toLowerCase();
  return !UNSAFE.some((w) => hay.includes(w));
}

/** Map a verified feed item to a PoolItem. */
export function toPoolItem(i: HashedItem, cfg: FeedConfig): PoolItem {
  const now = new Date().toISOString();
  let domain = cfg.source;
  try {
    domain = new URL(i.url).hostname.replace(/^www\./, "");
  } catch {
    /* keep source as fallback */
  }
  return {
    id: `ingest-${i.urlHash.slice(0, 16)}`,
    title: i.title,
    summary: i.summary.slice(0, 280),
    sourceName: cfg.source,
    sourceUrl: i.url,
    contentType: cfg.contentType as PoolContentType,
    tags: cfg.defaultTags,
    domain,
    publishDate: i.publishDate,
    addedAt: now,
    lastVerifiedAt: now,
    verificationStatus: "verified",
    canonicalUrlHash: i.urlHash,
  };
}

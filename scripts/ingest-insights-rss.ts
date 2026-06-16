#!/usr/bin/env tsx
/**
 * INSIGHTS RSS INGEST SCRIPT
 *
 * Usage:
 *   npx tsx scripts/ingest-insights-rss.ts
 *   npx tsx scripts/ingest-insights-rss.ts --dry-run
 *   npx tsx scripts/ingest-insights-rss.ts --verbose
 *
 * Pulls RECENT items from a curated set of tier-1 RSS/Atom feeds, keeps only
 * youth-career-relevant items published within the recency window, dedupes them
 * against the existing seed list and verified pool, and APPENDS the new ones to
 * data/insights/seed-candidates.json (also pruning seeds that have aged out).
 *
 * It does NOT touch the verified pool directly — `refresh-insights-pool.ts` runs
 * next (same CI job) and promotes any seed that verifies. Everything still lands
 * in a human-reviewed PR before it can reach users.
 *
 * Feed notes: only feeds that are (a) actually fetchable from CI (many tier-1
 * sites WAF-block datacenter IPs) and (b) link to allow-listed domains are
 * useful here. WEF / OECD / World Bank / Visual Capitalist feeds are bot-blocked
 * and stay manually curated. Tune FEEDS over time — a dead/blocked feed simply
 * yields nothing.
 */

import { promises as fs } from "fs";
import path from "path";
import type { SeedCandidate } from "../src/lib/insights/pool-types";
import { extractDomain } from "../src/lib/insights/canonicalize";
import { isAllowedDomain } from "../src/lib/insights/domain-allowlist";
import { readPoolRaw } from "../src/lib/insights/pool-service";
import {
  parseFeed,
  feedItemToCandidate,
  isRelevant,
  selectFreshCandidates,
  pruneStaleSeeds,
  type FeedConfig,
} from "../src/lib/insights/rss-ingest";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const VERBOSE = args.includes("--verbose");

const SEED_FILE = path.join(process.cwd(), "data", "insights", "seed-candidates.json");
const MAX_NEW_PER_RUN = 12;
const MAX_NEW_PER_SOURCE = 3;
const FETCH_TIMEOUT_MS = 15000;
const USER_AGENT = "Mozilla/5.0 (compatible; EndeavrlyInsightsBot/1.0; +https://endeavrly.com)";

// ---------------------------------------------------------------------------
// Curated feeds — fetchable + link to allow-listed domains. See header note.
// ---------------------------------------------------------------------------
const FEEDS: FeedConfig[] = [
  {
    feedUrl: "https://ourworldindata.org/atom.xml",
    sourceName: "Our World in Data",
    contentType: "article",
    defaultTags: ["data-viz", "global-trends"],
  },
  {
    feedUrl: "https://news.mit.edu/rss/topic/jobs",
    sourceName: "MIT News",
    contentType: "article",
    defaultTags: ["jobs", "future-of-work"],
  },
  {
    feedUrl: "https://news.mit.edu/rss/topic/artificial-intelligence2",
    sourceName: "MIT News",
    contentType: "article",
    defaultTags: ["ai", "technology"],
  },
  {
    feedUrl: "https://news.mit.edu/rss/research",
    sourceName: "MIT News",
    contentType: "article",
    defaultTags: ["innovation", "technology"],
  },
  {
    feedUrl: "https://feeds.feedburner.com/tedtalks_video",
    sourceName: "TED",
    contentType: "video",
    defaultTags: ["future-of-work", "career-planning"],
  },
];

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------
function log(msg: string): void {
  console.log(msg);
}
function verbose(msg: string): void {
  if (VERBOSE) console.log(`  ${msg}`);
}

// ---------------------------------------------------------------------------
// Fetch one feed, resiliently. Returns "" on any failure.
// ---------------------------------------------------------------------------
async function fetchFeed(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
      signal: controller.signal,
    });
    if (!res.ok) {
      verbose(`  feed ${url} → HTTP ${res.status}`);
      return "";
    }
    return await res.text();
  } catch (e) {
    verbose(`  feed ${url} → ${(e as Error).message}`);
    return "";
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  log("\n📡 Insights RSS Ingest");
  if (DRY_RUN) log("  (dry run — no files written)");
  log("");

  // Existing seeds + pool URLs (for dedup) ----------------------------------
  let existingSeeds: SeedCandidate[] = [];
  try {
    existingSeeds = JSON.parse(await fs.readFile(SEED_FILE, "utf-8"));
  } catch {
    log("  Could not read seed-candidates.json — starting from empty");
  }
  const pool = await readPoolRaw();
  const existingUrls = [
    ...existingSeeds.map((s) => s.sourceUrl),
    ...pool.map((p) => p.sourceUrl),
  ];

  // Fetch + parse every feed -------------------------------------------------
  const incoming: SeedCandidate[] = [];
  for (const feed of FEEDS) {
    const xml = await fetchFeed(feed.feedUrl);
    if (!xml) {
      log(`  ✗ ${feed.sourceName} — feed unavailable (${feed.feedUrl})`);
      continue;
    }
    const items = parseFeed(xml);
    let kept = 0;
    for (const raw of items) {
      if (!isRelevant(raw.title, raw.description)) continue;
      const candidate = feedItemToCandidate(raw, feed);
      if (!candidate) continue;
      // Only ingest items that link to an allow-listed domain — the verifier
      // would reject anything else anyway.
      if (!isAllowedDomain(extractDomain(candidate.sourceUrl))) continue;
      incoming.push(candidate);
      kept++;
    }
    log(`  ✓ ${feed.sourceName} — ${items.length} items, ${kept} relevant`);
  }

  // Select fresh, non-duplicate, in-window items ----------------------------
  const now = Date.now();
  const selected = selectFreshCandidates({
    incoming,
    existing: existingSeeds,
    existingUrls,
    now,
    max: MAX_NEW_PER_RUN,
    maxPerSource: MAX_NEW_PER_SOURCE,
  });

  // Rolling window: drop seeds that have aged out of the recency window.
  const prunedExisting = pruneStaleSeeds(existingSeeds, now);
  const droppedStale = existingSeeds.length - prunedExisting.length;

  const merged = [...selected, ...prunedExisting];

  log("");
  log("— Results —");
  log(`  Feeds checked:     ${FEEDS.length}`);
  log(`  Candidates found:  ${incoming.length}`);
  log(`  New (fresh+unique): ${selected.length}`);
  log(`  Stale seeds pruned: ${droppedStale}`);
  log(`  Seed total:        ${existingSeeds.length} → ${merged.length}`);
  for (const c of selected) verbose(`+ [${c.publishDate}] ${c.sourceName}: ${c.title}`);

  if (DRY_RUN) {
    log("\n  (dry run — seed-candidates.json not written)");
    return;
  }

  if (selected.length === 0 && droppedStale === 0) {
    log("\n  Nothing to write — seed list unchanged.");
    return;
  }

  await fs.writeFile(SEED_FILE, JSON.stringify(merged, null, 2) + "\n", "utf-8");
  log(`\n  ✓ Wrote ${merged.length} seed candidates to ${path.relative(process.cwd(), SEED_FILE)}`);
}

main().catch((e) => {
  console.error("Ingest failed:", e);
  process.exit(1);
});

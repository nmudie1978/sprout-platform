/**
 * Insights Pool Service
 *
 * Server-side pool management: reads from JSON files, applies rotation rules,
 * and serves diverse batches with anti-repeat logic.
 */

import { promises as fs } from "fs";
import path from "path";
import type {
  PoolItem,
  PoolMetadata,
  PoolBatchRequest,
  PoolBatchResponse,
  PoolContentType,
} from "./pool-types";
import { canonicalizeUrl, hashUrl } from "./canonicalize";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data", "insights");
const POOL_FILE = path.join(DATA_DIR, "verified-pool.json");
const META_FILE = path.join(DATA_DIR, "pool-metadata.json");

// ---------------------------------------------------------------------------
// Pool I/O
// ---------------------------------------------------------------------------

async function ensureDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // exists
  }
}

/** Read the pool, returning only verified items */
export async function readPool(): Promise<PoolItem[]> {
  try {
    const raw = await fs.readFile(POOL_FILE, "utf-8");
    const items: PoolItem[] = JSON.parse(raw);
    return items.filter((i) => i.verificationStatus === "verified");
  } catch {
    return [];
  }
}

/** Read all items including non-verified (for refresh script) */
export async function readPoolRaw(): Promise<PoolItem[]> {
  try {
    const raw = await fs.readFile(POOL_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function readMetadata(): Promise<PoolMetadata | null> {
  try {
    const raw = await fs.readFile(META_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function writePool(items: PoolItem[]): Promise<void> {
  await ensureDir();
  await fs.writeFile(POOL_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function writeMetadata(meta: PoolMetadata): Promise<void> {
  await ensureDir();
  await fs.writeFile(META_FILE, JSON.stringify(meta, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// Deduplication
// ---------------------------------------------------------------------------

export function isDuplicate(url: string, existingPool: PoolItem[]): boolean {
  const hash = hashUrl(url);
  return existingPool.some((item) => item.canonicalUrlHash === hash);
}

// ---------------------------------------------------------------------------
// Batch rotation algorithm
// ---------------------------------------------------------------------------

/** Max items from the same domain in a single batch */
const MAX_PER_DOMAIN = 2;
/** Max items sharing the same primary tag in a single batch */
const MAX_PER_TAG = 2;

export function getNextBatch(
  pool: PoolItem[],
  request: PoolBatchRequest,
): PoolBatchResponse {
  const batchSize = Math.min(request.batchSize ?? 5, 10);

  // 1. Start with verified-only
  let candidates = pool.filter((i) => i.verificationStatus === "verified");

  // 2. Remove excluded IDs
  if (request.excludeIds && request.excludeIds.length > 0) {
    const excludeSet = new Set(request.excludeIds);
    candidates = candidates.filter((i) => !excludeSet.has(i.id));
  }

  // 3. Type preference filter
  if (request.preferTypes && request.preferTypes.length > 0) {
    const typeSet = new Set(request.preferTypes);
    const preferred = candidates.filter((i) => typeSet.has(i.contentType));
    // Only apply if we'd still have enough items
    if (preferred.length >= batchSize) {
      candidates = preferred;
    }
  }

  // 4. Score candidates
  const scored = candidates.map((item) => {
    let score = 0;

    // Tag relevance boost
    if (request.tags && request.tags.length > 0) {
      const matchCount = item.tags.filter((t) => request.tags!.includes(t)).length;
      score += matchCount * 10;
    }

    // Freshness: newer items get a small boost
    if (item.publishDate) {
      const age = Date.now() - new Date(item.publishDate).getTime();
      const daysOld = age / (1000 * 60 * 60 * 24);
      score += Math.max(0, 5 - daysOld / 90); // Up to +5 for items < 90 days old
    }

    // Small random factor to vary batches
    score += Math.random() * 3;

    return { item, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // 5. Pick items with diversity constraints
  const selected: PoolItem[] = [];
  const domainCount: Record<string, number> = {};
  const tagCount: Record<string, number> = {};
  let relaxed: string[] = [];

  for (const { item } of scored) {
    if (selected.length >= batchSize) break;

    // Domain diversity
    const dc = domainCount[item.domain] ?? 0;
    if (dc >= MAX_PER_DOMAIN) continue;

    // Tag diversity (primary tag = first tag)
    const primaryTag = item.tags[0];
    if (primaryTag) {
      const tc = tagCount[primaryTag] ?? 0;
      if (tc >= MAX_PER_TAG) continue;
    }

    selected.push(item);
    domainCount[item.domain] = dc + 1;
    if (primaryTag) {
      tagCount[primaryTag] = (tagCount[primaryTag] ?? 0) + 1;
    }
  }

  // 6. If not enough items, relax constraints
  if (selected.length < batchSize) {
    relaxed.push("tag-diversity");
    for (const { item } of scored) {
      if (selected.length >= batchSize) break;
      if (selected.some((s) => s.id === item.id)) continue;

      const dc = domainCount[item.domain] ?? 0;
      if (dc >= MAX_PER_DOMAIN + 1) continue; // Slightly relaxed domain limit

      selected.push(item);
      domainCount[item.domain] = dc + 1;
    }
  }

  if (selected.length < batchSize) {
    relaxed.push("domain-diversity");
    for (const { item } of scored) {
      if (selected.length >= batchSize) break;
      if (selected.some((s) => s.id === item.id)) continue;
      selected.push(item);
    }
  }

  return {
    items: selected,
    totalPoolSize: pool.filter((i) => i.verificationStatus === "verified").length,
    hasMore: candidates.length > selected.length,
  };
}

// ---------------------------------------------------------------------------
// Pool stats
// ---------------------------------------------------------------------------

export function getPoolStats(pool: PoolItem[]): {
  total: number;
  byType: Record<string, number>;
  byDomain: Record<string, number>;
  verified: number;
  failed: number;
} {
  const byType: Record<string, number> = {};
  const byDomain: Record<string, number> = {};
  let verified = 0;
  let failed = 0;

  for (const item of pool) {
    byType[item.contentType] = (byType[item.contentType] ?? 0) + 1;
    byDomain[item.domain] = (byDomain[item.domain] ?? 0) + 1;
    if (item.verificationStatus === "verified") verified++;
    if (item.verificationStatus === "failed") failed++;
  }

  return { total: pool.length, byType, byDomain, verified, failed };
}

#!/usr/bin/env tsx
/**
 * INSIGHTS POOL REFRESH SCRIPT
 *
 * Usage:
 *   npx tsx scripts/refresh-insights-pool.ts
 *   npx tsx scripts/refresh-insights-pool.ts --dry-run
 *   npx tsx scripts/refresh-insights-pool.ts --verify-only
 *   npx tsx scripts/refresh-insights-pool.ts --verbose
 *
 * 1. Reads seed candidates from data/insights/seed-candidates.json
 * 2. Checks domain allowlist + deduplication
 * 3. Verifies URLs (HEAD/GET)
 * 4. Re-verifies stale pool items (>7 days old)
 * 5. Writes updated pool + metadata
 */

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type {
  SeedCandidate,
  PoolItem,
  PoolMetadata,
  PoolContentType,
  VerificationHealthEntry,
} from "../src/lib/insights/pool-types";
import { canonicalizeUrl, hashUrl, extractDomain } from "../src/lib/insights/canonicalize";
import { isAllowedDomain } from "../src/lib/insights/domain-allowlist";
import { verifyPoolItem } from "../src/lib/insights/verify-pool";
import {
  readPoolRaw,
  writePool,
  writeMetadata,
  isDuplicate,
} from "../src/lib/insights/pool-service";
import { logVerificationResult, getPoolHealthSummary } from "../src/lib/insights/pool-metrics";

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const VERIFY_ONLY = args.includes("--verify-only");
const VERBOSE = args.includes("--verbose");

const STALE_DAYS = 7;
const SEED_FILE = path.join(process.cwd(), "data", "insights", "seed-candidates.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg: string): void {
  console.log(msg);
}

function verbose(msg: string): void {
  if (VERBOSE) console.log(`  [verbose] ${msg}`);
}

function green(s: string): string {
  return `\x1b[32m${s}\x1b[0m`;
}
function red(s: string): string {
  return `\x1b[31m${s}\x1b[0m`;
}
function yellow(s: string): string {
  return `\x1b[33m${s}\x1b[0m`;
}
function bold(s: string): string {
  return `\x1b[1m${s}\x1b[0m`;
}

function isStale(item: PoolItem): boolean {
  const verified = new Date(item.lastVerifiedAt);
  const age = Date.now() - verified.getTime();
  return age > STALE_DAYS * 24 * 60 * 60 * 1000;
}

function candidateToPoolItem(candidate: SeedCandidate): PoolItem {
  const domain = extractDomain(candidate.sourceUrl);
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: candidate.title,
    summary: candidate.summary,
    sourceName: candidate.sourceName,
    sourceUrl: candidate.sourceUrl,
    contentType: candidate.contentType,
    tags: candidate.tags,
    domain,
    publishDate: candidate.publishDate,
    addedAt: now,
    lastVerifiedAt: now,
    verificationStatus: "pending",
    canonicalUrlHash: hashUrl(candidate.sourceUrl),
    thumbnailUrl: candidate.thumbnailUrl,
    duration: candidate.duration,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  log(bold("\n🔄 Insights Pool Refresh"));
  if (DRY_RUN) log(yellow("  (dry run — no files will be written)"));
  if (VERIFY_ONLY) log(yellow("  (verify-only — no new candidates)"));
  log("");

  // Load existing pool
  const existingPool = await readPoolRaw();
  log(`Existing pool: ${existingPool.length} items`);

  let pool = [...existingPool];
  let duplicatesRejected = 0;
  let newAdded = 0;
  let newFailed = 0;

  // -----------------------------------------------------------------------
  // Phase 1: Process seed candidates (unless --verify-only)
  // -----------------------------------------------------------------------
  if (!VERIFY_ONLY) {
    log(bold("\n— Phase 1: Seed Candidates —"));

    let candidates: SeedCandidate[] = [];
    try {
      const raw = await fs.readFile(SEED_FILE, "utf-8");
      candidates = JSON.parse(raw);
    } catch {
      log(red("  Could not read seed-candidates.json"));
      candidates = [];
    }

    log(`  Found ${candidates.length} candidates`);

    for (const candidate of candidates) {
      const domain = extractDomain(candidate.sourceUrl);

      // Domain check
      if (!isAllowedDomain(domain)) {
        verbose(`Skipped (domain not allowed): ${domain}`);
        continue;
      }

      // Dedupe check
      if (isDuplicate(candidate.sourceUrl, pool)) {
        verbose(`Skipped (duplicate): ${candidate.title}`);
        duplicatesRejected++;
        continue;
      }

      // Convert to pool item and verify
      const item = candidateToPoolItem(candidate);
      log(`  Verifying: ${candidate.title}`);

      if (DRY_RUN) {
        logVerificationResult(domain, true);
        pool.push({ ...item, verificationStatus: "verified" });
        newAdded++;
        continue;
      }

      const result = await verifyPoolItem(item);
      const passed = result.verificationStatus === "verified";
      logVerificationResult(domain, passed, passed ? undefined : "failed");

      if (passed) {
        pool.push(result);
        newAdded++;
      } else {
        pool.push(result); // Keep with "failed" status for tracking
        newFailed++;
      }
    }
  }

  // -----------------------------------------------------------------------
  // Phase 2: Re-verify stale items
  // -----------------------------------------------------------------------
  log(bold("\n— Phase 2: Re-verify Stale Items —"));

  const staleItems = pool.filter(
    (item) => item.verificationStatus === "verified" && isStale(item),
  );
  log(`  ${staleItems.length} items need re-verification (>${STALE_DAYS} days old)`);

  let reVerified = 0;
  let reFailed = 0;

  for (const item of staleItems) {
    verbose(`Re-verifying: ${item.title}`);

    if (DRY_RUN) {
      reVerified++;
      continue;
    }

    const result = await verifyPoolItem(item);
    const idx = pool.findIndex((p) => p.id === item.id);
    if (idx !== -1) {
      pool[idx] = result;
    }

    if (result.verificationStatus === "verified") {
      reVerified++;
      logVerificationResult(item.domain, true);
    } else {
      reFailed++;
      logVerificationResult(item.domain, false, "re-verify failed");
    }
  }

  // -----------------------------------------------------------------------
  // Phase 3: Write results
  // -----------------------------------------------------------------------
  log(bold("\n— Results —"));

  const verified = pool.filter((i) => i.verificationStatus === "verified");
  const failed = pool.filter((i) => i.verificationStatus === "failed");
  const pending = pool.filter((i) => i.verificationStatus === "pending");

  // Build metadata
  const byType: Record<PoolContentType, number> = {
    article: 0,
    video: 0,
    stat_report: 0,
    pdf: 0,
  };
  const byDomain: Record<string, number> = {};
  const healthMap = new Map<string, VerificationHealthEntry>();

  for (const item of pool) {
    byType[item.contentType] = (byType[item.contentType] ?? 0) + 1;
    byDomain[item.domain] = (byDomain[item.domain] ?? 0) + 1;

    const existing = healthMap.get(item.domain) ?? {
      domain: item.domain,
      checked: 0,
      passed: 0,
      failed: 0,
      lastCheckedAt: item.lastVerifiedAt,
    };
    existing.checked++;
    if (item.verificationStatus === "verified") existing.passed++;
    if (item.verificationStatus === "failed") existing.failed++;
    if (item.lastVerifiedAt > existing.lastCheckedAt) {
      existing.lastCheckedAt = item.lastVerifiedAt;
    }
    healthMap.set(item.domain, existing);
  }

  const metadata: PoolMetadata = {
    lastRefreshISO: new Date().toISOString(),
    totalItems: pool.length,
    totalVerified: verified.length,
    totalFailed: failed.length,
    totalPending: pending.length,
    duplicatesRejected,
    byType,
    byDomain,
    verificationHealth: Array.from(healthMap.values()),
  };

  log(`  Total pool:    ${pool.length}`);
  log(`  ${green(`Verified:      ${verified.length}`)}`);
  log(`  ${red(`Failed:        ${failed.length}`)}`);
  log(`  ${yellow(`Pending:       ${pending.length}`)}`);
  log(`  New added:     ${newAdded}`);
  log(`  New failed:    ${newFailed}`);
  log(`  Dupes skipped: ${duplicatesRejected}`);
  log(`  Re-verified:   ${reVerified}`);
  log(`  Re-failed:     ${reFailed}`);

  if (VERBOSE) {
    log(`\n${getPoolHealthSummary(metadata)}`);
  }

  if (!DRY_RUN) {
    await writePool(pool);
    await writeMetadata(metadata);
    log(green("\n  ✓ Pool and metadata written to data/insights/"));
  } else {
    log(yellow("\n  (dry run — no files written)"));
  }

  log("");
}

main().catch((err) => {
  console.error(red(`\nError: ${err instanceof Error ? err.message : err}`));
  process.exit(1);
});

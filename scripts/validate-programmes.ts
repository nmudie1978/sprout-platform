#!/usr/bin/env tsx
/**
 * PROGRAMME URL VALIDATION SCRIPT
 *
 * Usage:
 *   npx tsx scripts/validate-programmes.ts
 *   npx tsx scripts/validate-programmes.ts --dry-run
 *   npx tsx scripts/validate-programmes.ts --verbose
 *   npx tsx scripts/validate-programmes.ts --only=no-uio-medisin
 *
 * Runs the programme URL validator against every programme in
 * `src/lib/education/data/programmes.json` and writes the results to
 * `src/lib/education/data/programme-validation.json`. The output file
 * is static JSON consumed by `getProgrammesForCareer` at module-load
 * time — there is no runtime network validation.
 *
 * Runs weekly in CI via a scheduled GitHub Action (see .github/
 * workflows/validate-programmes.yml), and can be run manually locally
 * to verify a batch of new programmes before committing.
 *
 * Safety:
 *   - Dry-run mode prints results without writing
 *   - If >50% of programmes come back as broken, abort and print a
 *     warning — almost certainly a network problem, not real data rot
 *   - Results are cumulative: existing validation entries for URLs
 *     we didn't re-check this run are preserved
 */

import { promises as fs } from 'fs';
import path from 'path';
import {
  validateProgrammeUrls,
  type ValidationResult,
} from '../src/lib/education/validate-programme-url';

// ── CLI args ────────────────────────────────────────────────────────

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const VERBOSE = args.has('--verbose');
const ONLY_FLAG = process.argv.find((a) => a.startsWith('--only='));
const ONLY_ID = ONLY_FLAG?.split('=')[1] ?? null;

// ── File paths ──────────────────────────────────────────────────────

const ROOT = path.join(process.cwd(), 'src/lib/education/data');
const PROGRAMMES_PATH = path.join(ROOT, 'programmes.json');
const VALIDATION_PATH = path.join(ROOT, 'programme-validation.json');

// ── Shapes ──────────────────────────────────────────────────────────

interface Programme {
  id: string;
  url: string;
  englishName?: string;
}

interface ValidationFile {
  meta: {
    lastCheckedAt: string;
    totalProgrammes: number;
    validationStats: Record<string, number>;
  };
  results: Record<string, ValidationResult>;
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  // ── Load programmes ──────────────────────────────────────────────
  const raw = await fs.readFile(PROGRAMMES_PATH, 'utf8');
  const parsed = JSON.parse(raw) as { programmes: Programme[] };
  let programmes = parsed.programmes.filter((p) => typeof p.url === 'string' && p.url.length > 0);

  if (ONLY_ID) {
    programmes = programmes.filter((p) => p.id === ONLY_ID);
    if (programmes.length === 0) {
      console.error(`No programme matched --only=${ONLY_ID}`);
      process.exit(1);
    }
  }

  console.log(
    `[validate-programmes] ${DRY_RUN ? '[DRY RUN] ' : ''}Validating ${programmes.length} programme URL${programmes.length !== 1 ? 's' : ''}…`,
  );

  // ── Load existing validation file (for cumulative results) ──────
  let existing: ValidationFile | null = null;
  try {
    const existingRaw = await fs.readFile(VALIDATION_PATH, 'utf8');
    existing = JSON.parse(existingRaw) as ValidationFile;
  } catch {
    // First run — no existing file
    existing = null;
  }

  // ── Run validator ───────────────────────────────────────────────
  const urls = programmes.map((p) => p.url);
  const results = await validateProgrammeUrls(urls, { concurrency: 5 });

  // ── Tally and print ─────────────────────────────────────────────
  const stats: Record<string, number> = {};
  const freshResults: Record<string, ValidationResult> = {};
  for (let i = 0; i < programmes.length; i++) {
    const programme = programmes[i];
    const result = results[i];
    freshResults[programme.id] = result;
    stats[result.status] = (stats[result.status] ?? 0) + 1;
    if (VERBOSE || result.status === 'CLIENT_ERROR' || result.status === 'DNS') {
      const icon =
        result.status === 'LIVE'
          ? '✓'
          : result.status === 'REDIRECT'
            ? '→'
            : result.status === 'CLIENT_ERROR'
              ? '✗'
              : '!';
      console.log(
        `${icon} ${result.status.padEnd(13)} [${programme.id}] ${programme.englishName ?? ''} ${result.httpCode ? `(${result.httpCode})` : ''}`,
      );
    }
  }

  console.log('\n── Summary ──');
  for (const [status, count] of Object.entries(stats)) {
    console.log(`  ${status.padEnd(13)} ${count}`);
  }

  // ── Safety: abort if an implausibly high fraction failed ────────
  const broken = (stats.CLIENT_ERROR ?? 0) + (stats.DNS ?? 0);
  const brokenPct = programmes.length > 0 ? broken / programmes.length : 0;
  if (brokenPct > 0.5) {
    console.error(
      `\n❌ Aborting: ${Math.round(brokenPct * 100)}% of programmes classified as broken. Likely a network issue, not real data rot. Re-run when your connection is healthy.`,
    );
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('\n[DRY RUN] Not writing programme-validation.json');
    return;
  }

  // ── Merge with existing (preserve entries we didn't re-check) ──
  const mergedResults: Record<string, ValidationResult> = {
    ...(existing?.results ?? {}),
    ...freshResults,
  };

  // Recompute stats over the full merged set for the meta block
  const mergedStats: Record<string, number> = {};
  for (const r of Object.values(mergedResults)) {
    mergedStats[r.status] = (mergedStats[r.status] ?? 0) + 1;
  }

  const output: ValidationFile = {
    meta: {
      lastCheckedAt: new Date().toISOString(),
      totalProgrammes: Object.keys(mergedResults).length,
      validationStats: mergedStats,
    },
    results: mergedResults,
  };

  // Pretty-print so git diffs are readable
  await fs.writeFile(VALIDATION_PATH, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`\n✓ Wrote ${VALIDATION_PATH}`);
}

main().catch((err) => {
  console.error('[validate-programmes] Fatal:', err);
  process.exit(1);
});

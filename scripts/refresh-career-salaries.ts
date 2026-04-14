/**
 * scripts/refresh-career-salaries.ts
 *
 * Quarterly salary drift report for the career catalogue. Pulls
 * Norwegian wage statistics from SSB (Statistics Norway), joins each
 * row to a Career.id via the SSB_OCCUPATION_MAP, and writes a JSON
 * diff report. Output is **report-only by design** — a human reviews
 * the diff and decides whether to update the catalogue.
 *
 * Why report-only?
 *   1. SSB occupation codes don't always map cleanly to a single
 *      Career.id (e.g. multiple surgical sub-specialties roll up to
 *      one STYRK code) — silently overwriting the catalogue would
 *      flatten useful detail.
 *   2. Mid-career averages from SSB don't capture entry vs. senior
 *      ranges; the catalogue's "300k–700k" string communicates that
 *      better than a single mean.
 *   3. The audit (Apr 2026) called catalogue salary accuracy the
 *      highest single trust risk — any automated mutation of those
 *      figures has to clear human review.
 *
 * Usage:
 *   npx tsx scripts/refresh-career-salaries.ts
 *   npx tsx scripts/refresh-career-salaries.ts --verbose
 *
 * Output: data/salary-drift-report.json
 *
 * NOTE: This first version does not yet hit SSB live. It generates
 * the diff structure with a placeholder fetcher so the pipeline,
 * mapping table, and report shape are all ready. Wire the real SSB
 * StatBank table 11418 fetch when the engineering team is ready —
 * see TODO inline.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import {
  getAllCareers,
  type Career,
} from "../src/lib/career-pathways";
import {
  findStyrkForCareer,
  SSB_OCCUPATION_MAP,
} from "../src/lib/career-data/ssb-salary-mapping";

interface DriftRow {
  careerId: string;
  careerTitle: string;
  styrkCode: string;
  styrkLabel: string;
  catalogueSalary: string;
  /** Average annual gross from SSB (NOK). null = SSB returned nothing. */
  ssbAnnualMean: number | null;
  /** % drift between SSB midpoint and catalogue midpoint. null if either side missing. */
  driftPct: number | null;
  /** Recommendation key for the human reviewer. */
  recommendation: "ok" | "review" | "missing-ssb" | "out-of-scope";
}

interface DriftReport {
  generatedAt: string;
  totalCatalogueCareers: number;
  totalMapped: number;
  totalUnmapped: number;
  rows: DriftRow[];
}

/**
 * SSB StatBank live fetch — table 11418 (Monthly earnings by occupation).
 *
 * Queries the latest year for the average monthly gross earnings of
 * full-time employees in NOK across all sectors and both sexes for
 * a single STYRK-08 occupation code. Returns the annualised figure
 * (monthly × 12) or null on any failure.
 *
 * Endpoint: POST https://data.ssb.no/api/v0/en/table/11418
 * Response: JSON-stat2; `value[0]` is the requested cell.
 *
 * Cached per process so the script's ~50 sequential calls only hit
 * SSB once each. A 250ms delay between calls keeps us well below
 * SSB's rate limit (30 req/min).
 */
const SSB_TABLE = "https://data.ssb.no/api/v0/en/table/11418";
const ssbCache = new Map<string, number | null>();

function buildSsbQuery(styrkCode: string) {
  return {
    query: [
      { code: "MaaleMetode", selection: { filter: "item", values: ["02"] } }, // Average
      { code: "Yrke", selection: { filter: "item", values: [styrkCode] } },
      { code: "Sektor", selection: { filter: "item", values: ["ALLE"] } }, // All sectors
      { code: "Kjonn", selection: { filter: "item", values: ["0"] } }, // Both sexes
      { code: "AvtaltVanlig", selection: { filter: "item", values: ["5"] } }, // Full-time
      { code: "ContentsCode", selection: { filter: "item", values: ["Manedslonn"] } }, // Monthly NOK
      { code: "Tid", selection: { filter: "top", values: ["1"] } }, // Latest year only
    ],
    response: { format: "json-stat2" },
  };
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchSsbAnnualMean(styrkCode: string): Promise<number | null> {
  if (ssbCache.has(styrkCode)) return ssbCache.get(styrkCode)!;

  let annual: number | null = null;
  try {
    const res = await fetch(SSB_TABLE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (compatible; EndeavrlySsbSalaryRefresh/1.0; +https://endeavrly.no)",
      },
      body: JSON.stringify(buildSsbQuery(styrkCode)),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      // Most non-200s mean SSB has no data for this STYRK in the
      // selected slice (small occupations get suppressed for privacy).
      ssbCache.set(styrkCode, null);
      return null;
    }
    const json = (await res.json()) as { value?: (number | null)[] };
    const monthly = Array.isArray(json.value) ? json.value[0] : null;
    if (typeof monthly === "number" && monthly > 0) {
      annual = Math.round(monthly * 12);
    }
  } catch {
    annual = null;
  }
  ssbCache.set(styrkCode, annual);
  // Polite delay so the script never runs over 30 req/min.
  await sleep(250);
  return annual;
}

/** Parse a "300,000–700,000 kr/year" style salary string into a midpoint. */
function catalogueMidpoint(salary: string): number | null {
  const matches = salary.match(/[\d,]+/g);
  if (!matches || matches.length === 0) return null;
  const nums = matches
    .map((m) => parseInt(m.replace(/,/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return null;
  if (nums.length === 1) return nums[0];
  return (Math.min(...nums) + Math.max(...nums)) / 2;
}

function classify(
  ssb: number | null,
  midpoint: number | null,
): { drift: number | null; recommendation: DriftRow["recommendation"] } {
  if (ssb === null) return { drift: null, recommendation: "missing-ssb" };
  if (midpoint === null) return { drift: null, recommendation: "review" };
  const drift = Number((((ssb - midpoint) / midpoint) * 100).toFixed(1));
  return {
    drift,
    recommendation: Math.abs(drift) >= 15 ? "review" : "ok",
  };
}

async function main() {
  const verbose = process.argv.includes("--verbose");

  const all: Career[] = getAllCareers();
  const rows: DriftRow[] = [];

  for (const c of all) {
    const styrk = findStyrkForCareer(c.id);
    if (!styrk) {
      rows.push({
        careerId: c.id,
        careerTitle: c.title,
        styrkCode: "",
        styrkLabel: "",
        catalogueSalary: c.avgSalary,
        ssbAnnualMean: null,
        driftPct: null,
        recommendation: "out-of-scope",
      });
      continue;
    }

    const ssb = await fetchSsbAnnualMean(styrk.styrkCode);
    const midpoint = catalogueMidpoint(c.avgSalary);
    const { drift, recommendation } = classify(ssb, midpoint);

    if (verbose) {
      console.log(
        `${c.id.padEnd(28)} ${styrk.styrkCode}  catalogue≈${midpoint ?? "—"}  ssb=${ssb ?? "—"}  drift=${drift ?? "—"}%  ${recommendation}`,
      );
    }

    rows.push({
      careerId: c.id,
      careerTitle: c.title,
      styrkCode: styrk.styrkCode,
      styrkLabel: styrk.styrkLabel,
      catalogueSalary: c.avgSalary,
      ssbAnnualMean: ssb,
      driftPct: drift,
      recommendation,
    });
  }

  const report: DriftReport = {
    generatedAt: new Date().toISOString(),
    totalCatalogueCareers: all.length,
    totalMapped: SSB_OCCUPATION_MAP.length,
    totalUnmapped: all.length - SSB_OCCUPATION_MAP.length,
    rows,
  };

  const dataDir = path.join(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });
  const outPath = path.join(dataDir, "salary-drift-report.json");
  await fs.writeFile(outPath, JSON.stringify(report, null, 2) + "\n", "utf8");

  const reviewable = rows.filter((r) => r.recommendation === "review").length;
  const ok = rows.filter((r) => r.recommendation === "ok").length;
  const missing = rows.filter((r) => r.recommendation === "missing-ssb").length;

  console.log("");
  console.log(
    `Wrote drift report → ${path.relative(process.cwd(), outPath)}`,
  );
  console.log(`  total careers       : ${all.length}`);
  console.log(`  mapped to STYRK     : ${SSB_OCCUPATION_MAP.length}`);
  console.log(`  out of scope        : ${all.length - SSB_OCCUPATION_MAP.length}`);
  console.log(`  ok (≤15% drift)     : ${ok}`);
  console.log(`  needs review (>15%) : ${reviewable}`);
  console.log(`  missing SSB data    : ${missing}`);
  console.log("");
  console.log(
    `SSB cache hits: ${ssbCache.size} unique STYRK codes queried this run.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * scripts/apply-salary-drift-patch.ts
 *
 * Reads `data/salary-drift-report.json` and applies the SSB-derived
 * salary updates back into `src/lib/career-pathways.ts` for every
 * career flagged `recommendation === "review"` with a non-null
 * ssbAnnualMean.
 *
 * For each affected career it:
 *   1. Recomputes the salary range, preserving the catalogue's
 *      original lower/upper SPREAD (as a fraction of the midpoint),
 *      then re-centring on the SSB mean. So a catalogue range of
 *      "400,000 - 800,000" (mean 600k, ±33%) becomes "X - Y" where
 *      mean = SSB and ± fraction stays at 33%. If the catalogue had
 *      a single-value salary, we apply a default ±20% spread around
 *      the SSB mean.
 *   2. Replaces the `avgSalary: "..."` line in place.
 *   3. Stamps `lastVerifiedAt: "<today ISO date>"` and
 *      `sourceUrl: "https://www.ssb.no/en/statbank/table/11418"` on
 *      the same career object — adding the fields if missing,
 *      replacing them if already present.
 *
 * Run:
 *   npx tsx scripts/apply-salary-drift-patch.ts
 *   npx tsx scripts/apply-salary-drift-patch.ts --dry-run
 *   npx tsx scripts/apply-salary-drift-patch.ts --verbose
 *
 * Re-run after `npm run salaries:refresh-report` whenever you want
 * to pull in the latest SSB figures. Outputs are deterministic so
 * the diff in git review tells you exactly what changed.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

interface DriftRow {
  careerId: string;
  careerTitle: string;
  catalogueSalary: string;
  ssbAnnualMean: number | null;
  recommendation: "ok" | "review" | "missing-ssb" | "out-of-scope";
}

interface DriftReport {
  generatedAt: string;
  rows: DriftRow[];
}

const REPORT_PATH = path.join(process.cwd(), "data", "salary-drift-report.json");
const CATALOGUE_PATH = path.join(process.cwd(), "src", "lib", "career-pathways.ts");
const SSB_SOURCE_URL = "https://www.ssb.no/en/statbank/table/11418";
const TODAY = new Date().toISOString().slice(0, 10);
const DEFAULT_SPREAD = 0.2; // ±20% around SSB if catalogue had a single value

function fmtThousands(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/** Round to nearest 5,000 NOK to keep the displayed range readable. */
function roundNice(n: number): number {
  return Math.max(0, Math.round(n / 5_000) * 5_000);
}

/** Parse "300,000 - 700,000 kr/year" → { low, high }. Single value → null spread. */
function parseSalary(s: string): { low: number; high: number } | null {
  const matches = s.match(/[\d,]+/g);
  if (!matches || matches.length === 0) return null;
  const nums = matches
    .map((m) => parseInt(m.replace(/,/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return null;
  if (nums.length === 1) return { low: nums[0], high: nums[0] };
  return { low: Math.min(...nums), high: Math.max(...nums) };
}

function buildNewSalary(catalogue: string, ssb: number): string {
  const parsed = parseSalary(catalogue);
  let spreadFrac = DEFAULT_SPREAD;
  if (parsed && parsed.high > parsed.low) {
    const mid = (parsed.low + parsed.high) / 2;
    spreadFrac = mid > 0 ? (parsed.high - parsed.low) / (2 * mid) : DEFAULT_SPREAD;
  }
  const low = roundNice(ssb * (1 - spreadFrac));
  const high = roundNice(ssb * (1 + spreadFrac));
  return `${fmtThousands(low)} - ${fmtThousands(high)} kr/year`;
}

interface PatchPlan {
  careerId: string;
  oldSalary: string;
  /** When `null`, the catalogue salary is left unchanged — only the
   *  lastVerifiedAt + sourceUrl stamps are applied. Used for "ok"
   *  rows whose figures matched SSB within the threshold. */
  newSalary: string | null;
  ssb: number;
}

/**
 * Mutate the catalogue text in place. Walks line by line tracking
 * brace depth so we can locate the bounds of each Career object,
 * then within an object whose `id` matches a planned patch we:
 *   - replace `avgSalary: "..."`
 *   - upsert `lastVerifiedAt: "..."`
 *   - upsert `sourceUrl: "..."`
 *
 * Returns the new text + a list of careerIds that we couldn't locate.
 */
function applyPatches(
  src: string,
  plans: Map<string, PatchPlan>,
): { text: string; missing: string[]; updated: string[] } {
  const lines = src.split("\n");
  const out: string[] = [];

  // Track current career object: depth, the patch plan if matched,
  // and whether we've already seen lastVerifiedAt/sourceUrl in this
  // object so we know to replace vs append.
  let inObject = false;
  let braceDepth = 0;
  let currentPlan: PatchPlan | null = null;
  let currentBuffer: string[] = []; // accumulated lines for the current object
  let sawLastVerifiedAt = false;
  let sawSourceUrl = false;
  let missing: string[] = [];
  const updated: string[] = [];
  const idMatcher = /^\s*id:\s*"([^"]+)"\s*,?\s*$/;
  const salaryMatcher = /^(\s*)avgSalary:\s*"([^"]*)"\s*,?\s*$/;
  const lastVerifiedMatcher = /^(\s*)lastVerifiedAt:\s*"([^"]*)"\s*,?\s*$/;
  const sourceUrlMatcher = /^(\s*)sourceUrl:\s*"([^"]*)"\s*,?\s*$/;

  function flushBuffer() {
    if (!currentPlan) {
      out.push(...currentBuffer);
      return;
    }
    // Append missing lastVerifiedAt / sourceUrl before the closing
    // brace line. The closing brace is the LAST line of the buffer
    // (matched by `},` or `}`).
    const lastIdx = currentBuffer.length - 1;
    const closer = currentBuffer[lastIdx];
    const closerIndent = (closer.match(/^(\s*)/) || ["", ""])[1];
    const fieldIndent = closerIndent + "  ";
    const additions: string[] = [];
    if (!sawLastVerifiedAt) {
      additions.push(`${fieldIndent}lastVerifiedAt: "${TODAY}",`);
    }
    if (!sawSourceUrl) {
      additions.push(`${fieldIndent}sourceUrl: "${SSB_SOURCE_URL}",`);
    }
    const mutated = [
      ...currentBuffer.slice(0, lastIdx),
      ...additions,
      currentBuffer[lastIdx],
    ];
    out.push(...mutated);
    updated.push(currentPlan.careerId);
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inObject) {
      const trimmed = line.trim();

      // Single-line career object: `{ id: "X", ..., growthOutlook: "..." },`.
      // Detect via `{ id:` and rewrite in place if it matches a plan.
      const singleLineIdMatch = line.match(/^\s*\{\s*id:\s*"([^"]+)"/);
      if (singleLineIdMatch && /\}\s*,?\s*$/.test(line)) {
        const id = singleLineIdMatch[1];
        const plan = plans.get(id);
        if (plan) {
          let mutated = line;
          if (plan.newSalary !== null) {
            // Replace avgSalary value
            mutated = mutated.replace(
              /avgSalary:\s*"[^"]*"/,
              `avgSalary: "${plan.newSalary}"`,
            );
          }
          // Replace or insert lastVerifiedAt
          if (/lastVerifiedAt:\s*"[^"]*"/.test(mutated)) {
            mutated = mutated.replace(
              /lastVerifiedAt:\s*"[^"]*"/,
              `lastVerifiedAt: "${TODAY}"`,
            );
          } else {
            mutated = mutated.replace(
              /\}(\s*,?\s*)$/,
              `, lastVerifiedAt: "${TODAY}" }$1`,
            );
          }
          // Replace or insert sourceUrl
          if (/sourceUrl:\s*"[^"]*"/.test(mutated)) {
            mutated = mutated.replace(
              /sourceUrl:\s*"[^"]*"/,
              `sourceUrl: "${SSB_SOURCE_URL}"`,
            );
          } else {
            mutated = mutated.replace(
              /\}(\s*,?\s*)$/,
              `, sourceUrl: "${SSB_SOURCE_URL}" }$1`,
            );
          }
          out.push(mutated);
          updated.push(id);
          continue;
        }
        out.push(line);
        continue;
      }

      // Multi-line career object opener: a line that's just `{`
      if (trimmed === "{") {
        inObject = true;
        braceDepth = 1;
        currentPlan = null;
        currentBuffer = [line];
        sawLastVerifiedAt = false;
        sawSourceUrl = false;
        continue;
      }
      out.push(line);
      continue;
    }

    // Inside an object — track depth so we know when it closes.
    const opens = (line.match(/{/g) || []).length;
    const closes = (line.match(/}/g) || []).length;
    braceDepth += opens - closes;

    // Did we just hit the id line?
    const idMatch = line.match(idMatcher);
    if (idMatch && !currentPlan) {
      const id = idMatch[1];
      const plan = plans.get(id);
      if (plan) currentPlan = plan;
    }

    // Salary line — replace if this object is targeted (and the plan
    // actually wants a salary change; "ok" rows pass null and are
    // stamp-only).
    if (currentPlan) {
      const salaryMatch = line.match(salaryMatcher);
      if (salaryMatch) {
        const [, indent] = salaryMatch;
        if (currentPlan.newSalary !== null) {
          currentBuffer.push(`${indent}avgSalary: "${currentPlan.newSalary}",`);
        } else {
          currentBuffer.push(line);
        }
        if (braceDepth === 0) {
          inObject = false;
          flushBuffer();
        }
        continue;
      }

      // Pre-existing lastVerifiedAt — replace value, mark as seen.
      const lvMatch = line.match(lastVerifiedMatcher);
      if (lvMatch) {
        const [, indent] = lvMatch;
        currentBuffer.push(`${indent}lastVerifiedAt: "${TODAY}",`);
        sawLastVerifiedAt = true;
        if (braceDepth === 0) {
          inObject = false;
          flushBuffer();
        }
        continue;
      }

      // Pre-existing sourceUrl — replace value, mark as seen.
      const suMatch = line.match(sourceUrlMatcher);
      if (suMatch) {
        const [, indent] = suMatch;
        currentBuffer.push(`${indent}sourceUrl: "${SSB_SOURCE_URL}",`);
        sawSourceUrl = true;
        if (braceDepth === 0) {
          inObject = false;
          flushBuffer();
        }
        continue;
      }
    }

    currentBuffer.push(line);
    if (braceDepth === 0) {
      inObject = false;
      flushBuffer();
    }
  }

  // Any plans that never matched a career id in the file:
  for (const id of plans.keys()) {
    if (!updated.includes(id)) missing.push(id);
  }

  return { text: out.join("\n"), missing, updated };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const verbose = process.argv.includes("--verbose");

  const reportRaw = await fs.readFile(REPORT_PATH, "utf8");
  const report: DriftReport = JSON.parse(reportRaw);

  const plans = new Map<string, PatchPlan>();
  for (const row of report.rows) {
    if (typeof row.ssbAnnualMean !== "number") continue;
    if (row.recommendation === "review") {
      plans.set(row.careerId, {
        careerId: row.careerId,
        oldSalary: row.catalogueSalary,
        newSalary: buildNewSalary(row.catalogueSalary, row.ssbAnnualMean),
        ssb: row.ssbAnnualMean,
      });
    } else if (row.recommendation === "ok") {
      // Catalogue figure matches SSB within 15% — leave salary alone
      // but stamp lastVerifiedAt + sourceUrl so the UI shows the
      // green ✓ Verified pill for this career.
      plans.set(row.careerId, {
        careerId: row.careerId,
        oldSalary: row.catalogueSalary,
        newSalary: null,
        ssb: row.ssbAnnualMean,
      });
    }
  }

  const reviewCount = [...plans.values()].filter((p) => p.newSalary !== null).length;
  const stampOnlyCount = plans.size - reviewCount;
  console.log(
    `Drift report — ${reviewCount} careers will get a new salary string, ${stampOnlyCount} will be stamped Verified only.`,
  );
  if (verbose) {
    for (const p of plans.values()) {
      const arrow = p.newSalary ?? "(stamp only — already matches SSB)";
      console.log(`  ${p.careerId.padEnd(28)}  ${p.oldSalary}  →  ${arrow}`);
    }
  }

  const src = await fs.readFile(CATALOGUE_PATH, "utf8");
  const { text, missing, updated } = applyPatches(src, plans);

  if (missing.length > 0) {
    console.log("");
    console.log(
      `Could not locate ${missing.length} career id(s) in the catalogue:`,
    );
    for (const id of missing) console.log(`  - ${id}`);
  }

  if (dryRun) {
    console.log("");
    console.log(`[dry-run] ${updated.length} career(s) would be patched.`);
    return;
  }

  await fs.writeFile(CATALOGUE_PATH, text, "utf8");
  console.log("");
  console.log(`Patched ${updated.length} careers in src/lib/career-pathways.ts`);
  console.log(
    `Each affected career now carries lastVerifiedAt="${TODAY}" + sourceUrl=${SSB_SOURCE_URL}`,
  );
  console.log(`Run \`git diff src/lib/career-pathways.ts\` to review.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

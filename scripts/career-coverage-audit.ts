/**
 * Career data-coverage audit.
 *
 * Walks every career in the catalogue and asks the SAME functions the UI asks,
 * so the report reflects what a young person actually sees rather than what
 * happens to be present in a JSON file.
 *
 * Where a lookup falls back to generic, category-level content (employers,
 * typical day), the audit records the SPECIFIC signal, not the fallback —
 * a chief-executive career showing "you'd work at a consultancy" because its
 * whole category does is a gap, even though the section renders.
 *
 * Run:
 *   npx tsx scripts/career-coverage-audit.ts
 *   npx tsx scripts/career-coverage-audit.ts --json > report.json
 *   npx tsx scripts/career-coverage-audit.ts --career=chief-ai-officer
 */

import {
  getAllCareers,
  getCategoryForCareer,
  type Career,
} from "../src/lib/career-pathways";
import {
  getCareerRequirements,
  getCertificationPath,
  getProgrammesForCareer,
  getRoutesForCareer,
} from "../src/lib/education";
import { hasDetailedContent } from "../src/lib/career-typical-days";
import { DNA_TRAIT_OVERRIDES } from "../src/lib/career-dna-overrides.generated";
import { getTopEmployers, getCareerEmployers } from "../src/lib/career-employers";
import { getCareerProgression } from "../src/lib/career-progressions";
import { hasSpecialisms } from "../src/lib/career-specialisms";

type Weight = "critical" | "important" | "nice";

interface Dimension {
  key: string;
  label: string;
  /**
   * critical  — the Understand / Clarity tab is visibly thin or broken
   * important — a section renders generic rather than about THIS job
   * nice      — depth, not correctness
   */
  weight: Weight;
  has: (career: Career, category: string) => boolean;
}

function safe<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

function nonEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "object") return Object.keys(value as object).length > 0;
  return Boolean(value);
}

const DIMENSIONS: Dimension[] = [
  {
    key: "studyPath",
    label: "Study path — named programmes at real institutions",
    weight: "critical",
    has: (c) => nonEmpty(safe(() => getProgrammesForCareer(c.id))),
  },
  {
    key: "requirements",
    label: "Entry requirements — subjects, grades, entry route",
    weight: "critical",
    has: (c) => nonEmpty(safe(() => getCareerRequirements(c.id))),
  },
  {
    key: "typicalDay",
    label: "Typical day / reality check — career-specific",
    weight: "critical",
    has: (c) => safe(() => hasDetailedContent(c.id)) === true,
  },
  {
    key: "progression",
    label: "Career progression ladder",
    weight: "important",
    has: (c) => nonEmpty(safe(() => getCareerProgression(c.id))),
  },
  {
    key: "employersSpecific",
    label: "Employers — named for THIS career (not category fallback)",
    weight: "important",
    has: (c) =>
      nonEmpty(safe(() => getTopEmployers(c.id))) ||
      // The realism overrides (AI roles, safety services, consulting) resolve
      // inside getCareerEmployers before the category fallback. Detect them by
      // asking with no category: a hit means the answer was career-specific.
      nonEmpty(safe(() => getCareerEmployers(c.id, null, "NO"))),
  },
  {
    key: "dnaVerified",
    label: "Career DNA — AI-verified traits (not derived defaults)",
    weight: "important",
    has: (c) => Boolean(DNA_TRAIT_OVERRIDES[c.id]),
  },
  {
    key: "routes",
    label: "Alternative routes — multi-stage pathway",
    weight: "nice",
    has: (c) => nonEmpty(safe(() => getRoutesForCareer(c.id))),
  },
  {
    key: "certifications",
    label: "Certification ladder",
    weight: "nice",
    has: (c) => nonEmpty(safe(() => getCertificationPath(c.id, c.title))),
  },
  {
    key: "specialisms",
    label: "Where this can lead — specialism branches",
    weight: "nice",
    has: (c) => safe(() => hasSpecialisms(c.id)) === true,
  },
  // ── Fields carried on the career record itself ──────────────────────
  {
    key: "educationPath",
    label: "Education path — free text on the record",
    weight: "important",
    has: (c) => nonEmpty(c.educationPath),
  },
  {
    key: "salary",
    label: "Salary range",
    weight: "important",
    has: (c) => nonEmpty(c.avgSalary),
  },
  {
    key: "skills",
    label: "Key skills",
    weight: "important",
    has: (c) => nonEmpty(c.keySkills),
  },
  {
    key: "dailyTasks",
    label: "Daily tasks",
    weight: "important",
    has: (c) => nonEmpty(c.dailyTasks),
  },
];

const WEIGHT_POINTS: Record<Weight, number> = { critical: 3, important: 2, nice: 1 };
const MAX_POINTS = DIMENSIONS.reduce((n, d) => n + WEIGHT_POINTS[d.weight], 0);

const KEYS_BY_WEIGHT = (w: Weight) =>
  DIMENSIONS.filter((d) => d.weight === w).map((d) => d.key);

export interface Row {
  id: string;
  title: string;
  category: string;
  entryLevel: boolean;
  educationRoute: string;
  growthOutlook: string;
  present: Record<string, boolean>;
  missingCritical: string[];
  missingImportant: string[];
  score: number;
}

export function audit(): Row[] {
  return getAllCareers().map((career) => {
    const category = getCategoryForCareer(career.id) ?? "unknown";
    const present: Record<string, boolean> = {};
    for (const dimension of DIMENSIONS) {
      present[dimension.key] = dimension.has(career, category);
    }
    const got = DIMENSIONS.reduce(
      (n, d) => n + (present[d.key] ? WEIGHT_POINTS[d.weight] : 0),
      0
    );
    return {
      id: career.id,
      title: career.title,
      category,
      entryLevel: Boolean(career.entryLevel),
      educationRoute: String(career.educationRoute ?? "unknown"),
      growthOutlook: String(career.growthOutlook ?? "unknown"),
      present,
      missingCritical: KEYS_BY_WEIGHT("critical").filter((k) => !present[k]),
      missingImportant: KEYS_BY_WEIGHT("important").filter((k) => !present[k]),
      score: Math.round((got / MAX_POINTS) * 100),
    };
  });
}

function bar(pct: number): string {
  return "█".repeat(Math.round(pct / 4)).padEnd(25, "·");
}

function main() {
  const args = process.argv.slice(2);
  const rows = audit();

  const single = args.find((a) => a.startsWith("--career="))?.split("=")[1];
  if (single) {
    const row = rows.find((r) => r.id === single);
    console.log(JSON.stringify(row ?? { error: `not found: ${single}` }, null, 2));
    return;
  }

  if (args.includes("--json")) {
    console.log(JSON.stringify({ total: rows.length, dimensions: DIMENSIONS.map(d => ({ key: d.key, label: d.label, weight: d.weight })), rows }, null, 2));
    return;
  }

  console.log(`Careers audited: ${rows.length}\n`);

  console.log("── Coverage by dimension ──");
  for (const dimension of DIMENSIONS) {
    const have = rows.filter((r) => r.present[dimension.key]).length;
    const pct = (have / rows.length) * 100;
    console.log(
      `${bar(pct)} ${pct.toFixed(1).padStart(5)}%  ${String(have).padStart(4)}/${rows.length}  ` +
        `[${dimension.weight[0].toUpperCase()}] ${dimension.label}`
    );
  }

  console.log("\n── Careers by number of missing CRITICAL dimensions (of 3) ──");
  const byCritical = new Map<number, number>();
  for (const row of rows) {
    byCritical.set(
      row.missingCritical.length,
      (byCritical.get(row.missingCritical.length) ?? 0) + 1
    );
  }
  for (const [n, count] of [...byCritical.entries()].sort((a, b) => b[0] - a[0])) {
    const pct = ((count / rows.length) * 100).toFixed(1);
    console.log(`  ${n} missing → ${String(count).padStart(4)} careers (${pct}%)`);
  }

  console.log("\n── Fully-hollow careers (all 3 critical dimensions missing) ──");
  const hollow = rows.filter((r) => r.missingCritical.length === 3);
  console.log(`  ${hollow.length} careers\n`);
  for (const row of hollow.slice(0, 30)) {
    console.log(`  ${String(row.score).padStart(3)}%  ${row.title.padEnd(44)} ${row.category}`);
  }
  if (hollow.length > 30) console.log(`  … and ${hollow.length - 30} more`);

  console.log("\n── Mean score by category ──");
  const byCategory = new Map<string, number[]>();
  for (const row of rows) {
    const list = byCategory.get(row.category) ?? [];
    list.push(row.score);
    byCategory.set(row.category, list);
  }
  const catRows = [...byCategory.entries()]
    .map(([cat, scores]) => ({
      cat,
      n: scores.length,
      mean: scores.reduce((a, b) => a + b, 0) / scores.length,
      hollow: rows.filter((r) => r.category === cat && r.missingCritical.length === 3).length,
    }))
    .sort((a, b) => a.mean - b.mean);
  for (const c of catRows) {
    console.log(
      `  ${c.mean.toFixed(1).padStart(5)}%  ${c.cat.padEnd(24)} ${String(c.n).padStart(4)} careers, ${String(c.hollow).padStart(3)} hollow`
    );
  }

  console.log("\n── Mean score by seniority ──");
  for (const [label, filter] of [
    ["entry-level", (r: Row) => r.entryLevel],
    ["not entry-level", (r: Row) => !r.entryLevel],
  ] as const) {
    const subset = rows.filter(filter);
    const mean = subset.reduce((n, r) => n + r.score, 0) / subset.length;
    const hollow = subset.filter((r) => r.missingCritical.length === 3).length;
    console.log(
      `  ${mean.toFixed(1).padStart(5)}%  ${label.padEnd(18)} ${subset.length} careers, ${hollow} hollow (${((hollow / subset.length) * 100).toFixed(1)}%)`
    );
  }
}

main();

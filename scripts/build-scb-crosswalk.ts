#!/usr/bin/env tsx
/**
 * Derives careerId → SSYK 2012 from the existing careerId → STYRK-08 map.
 *
 * WHY THIS IS NOT A CODE COPY
 * ---------------------------
 * Both classifications descend from ISCO-08, so it is tempting to reuse the
 * STYRK code directly. That is unsafe: SSYK 2012 renumbers substantially, and
 * the renumbering creates COLLISIONS where the same four digits mean different
 * occupations in each system. Measured on this dataset, 30 of 154 shared codes
 * disagree, and the worst affects 50 careers:
 *
 *   STYRK 2212 "Specialist medical practitioners"
 *   SSYK  2212 "Resident physicians"          ← doctors still in training
 *
 *   STYRK 1412 "Restaurant managers"
 *   SSYK  1412 "Headmasters, level 2"         ← unrelated occupation
 *
 * A code-identity crosswalk would have stamped a trainee's salary as a
 * VERIFIED specialist salary. So a match is accepted only when the code
 * matches AND the two labels agree. Everything else goes to a review file for
 * a human, with candidates suggested but never auto-applied.
 *
 *   npx tsx scripts/build-scb-crosswalk.ts           # report + write review file
 *   npx tsx scripts/build-scb-crosswalk.ts --emit    # emit the mapping module
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { SSB_OCCUPATION_MAP } from "../src/lib/career-data/ssb-salary-mapping";
import occupations from "../src/lib/career-data/scb-occupations.generated.json";
import { MANUAL_SSYK_OVERRIDES } from "../src/lib/career-data/scb-manual-overrides";

const VALID = new Map(occupations.occupations.map((o) => [o.code, o.label]));
const emit = process.argv.includes("--emit");

const STOP = new Set([
  "and", "the", "not", "elsewhere", "classified", "other", "related",
  "professionals", "workers", "level", "associate", "etc",
]);

/**
 * Words that describe a job's TIER, not the job. Two labels sharing only one
 * of these are not the same occupation: "Hotel managers" and "School managers"
 * share "managers" and are unrelated. Measured, this rule caught five wrong
 * auto-matches (HR→Finance, Mining→Logistics, Manufacturing→Logistics,
 * Hotel→Schools, Environmental→Electrical engineering).
 */
const GENERIC = new Set([
  "technician", "technicians", "engineer", "engineers", "engineering",
  "manager", "managers", "specialist", "specialists", "operator", "operators",
  "assistant", "assistants", "clerk", "clerks", "officer", "officers",
]);

function words(s: string): Set<string> {
  return new Set(
    s.toLowerCase().replace(/[^a-z]+/g, " ").split(" ")
      .filter((w) => w.length > 3 && !STOP.has(w)),
  );
}

/** Do two occupation labels describe the same job? Conservative by design. */
function labelsAgree(a: string, b: string): boolean {
  const wa = words(a);
  const wb = words(b);
  if (!wa.size || !wb.size) return false;
  const shared: string[] = [];
  for (const w of wa) {
    // Match on stem so "firefighter"/"fire-fighters", "nurse"/"nurses" agree.
    for (const v of wb) {
      if (w === v || w.startsWith(v.slice(0, 5)) || v.startsWith(w.slice(0, 5))) {
        shared.push(w);
        break;
      }
    }
  }
  if (!shared.length) return false;
  // Sharing only a tier word ("managers", "engineers") is not agreement.
  if (shared.every((w) => GENERIC.has(w))) return false;
  return shared.length / Math.min(wa.size, wb.size) >= 0.5;
}

function candidatesFor(label: string): { code: string; label: string }[] {
  return [...VALID.entries()]
    .filter(([, l]) => labelsAgree(label, l))
    .map(([code, l]) => ({ code, label: l }))
    .slice(0, 4);
}

type Row = { careerId: string; ssykCode: string; ssykLabel: string };

const accepted: Row[] = [];
const needsReview = new Map<
  string,
  { styrkLabel: string; careers: string[]; reason: string; collidesWith?: string; candidates: { code: string; label: string }[] }
>();

for (const entry of SSB_OCCUPATION_MAP) {
  const manual = MANUAL_SSYK_OVERRIDES[entry.styrkCode];
  if (manual) {
    if (manual.ssykCode) {
      accepted.push({
        careerId: entry.careerId,
        ssykCode: manual.ssykCode,
        ssykLabel: VALID.get(manual.ssykCode) ?? "",
      });
    }
    // A null ssykCode means "reviewed, SCB has no equivalent" — drop it.
    continue;
  }

  const ssykLabel = VALID.get(entry.styrkCode);
  if (ssykLabel && labelsAgree(entry.styrkLabel, ssykLabel)) {
    accepted.push({ careerId: entry.careerId, ssykCode: entry.styrkCode, ssykLabel });
    continue;
  }

  const g = needsReview.get(entry.styrkCode) ?? {
    styrkLabel: entry.styrkLabel,
    careers: [],
    reason: ssykLabel ? "code collision — labels disagree" : "no such SSYK code",
    collidesWith: ssykLabel,
    candidates: candidatesFor(entry.styrkLabel),
  };
  g.careers.push(entry.careerId);
  needsReview.set(entry.styrkCode, g);
}

if (emit) {
  const lines = accepted
    .map(
      (m) =>
        `  { careerId: ${JSON.stringify(m.careerId)}, ssykCode: ${JSON.stringify(
          m.ssykCode,
        )}, ssykLabel: ${JSON.stringify(m.ssykLabel)} },`,
    )
    .join("\n");
  const acceptedIds = new Set(accepted.map((a) => a.careerId));
  const unmapped = [...new Set(SSB_OCCUPATION_MAP.map((e) => e.careerId))]
    .filter((id) => !acceptedIds.has(id))
    .sort()
    .map((id) => `  ${JSON.stringify(id)},`)
    .join("\n");

  console.log(`/**
 * careerId → SSYK 2012 occupation code, for SCB salary lookups.
 *
 * GENERATED by scripts/build-scb-crosswalk.ts. Do not hand-edit; add
 * corrections to scb-manual-overrides.ts and regenerate.
 *
 * A mapping is present only where the STYRK and SSYK labels agree, or where a
 * human resolved it in the overrides file. SSYK 2012 renumbers ISCO-08 and the
 * renumbering collides — STYRK 2212 is "Specialist medical practitioners" but
 * SSYK 2212 is "Resident physicians" — so codes are never copied on trust.
 *
 * SCB publishes 431 occupations against 1,615 careers, so careers legitimately
 * share codes. Generated salary text must not imply a precision SCB lacks.
 */
export interface ScbSalaryMapping {
  careerId: string;
  ssykCode: string;
  ssykLabel: string;
}

export const SCB_SALARY_MAPPING: ScbSalaryMapping[] = [
${lines}
];

/**
 * Careers with no SSYK equivalent — either SCB has no comparable occupation,
 * or the code collided and no human has resolved it yet. Listed explicitly so
 * the gap is visible and testable. These show no Swedish salary, which is
 * correct: better blank than a figure from the wrong occupation.
 */
export const SCB_UNMAPPED_CAREERS: string[] = [
${unmapped}
];
`);
  process.exit(0);
}

const reviewPath = join(__dirname, "..", "src", "lib", "career-data", "scb-crosswalk-review.json");
const review = [...needsReview.entries()]
  .map(([styrkCode, g]) => ({ styrkCode, ...g, careerCount: g.careers.length }))
  .sort((a, b) => b.careerCount - a.careerCount);
writeFileSync(reviewPath, JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), review }, null, 2) + "\n");

const reviewedCareers = review.reduce((n, r) => n + r.careerCount, 0);
console.log(`accepted        ${accepted.length} careers across ${new Set(accepted.map((a) => a.ssykCode)).size} codes`);
console.log(`needs review    ${reviewedCareers} careers across ${review.length} codes`);
console.log(`manual overrides applied: ${Object.keys(MANUAL_SSYK_OVERRIDES).length}\n`);
console.log(`top unresolved codes (see ${reviewPath}):`);
for (const r of review.slice(0, 12)) {
  console.log(`  ${r.styrkCode}  n=${String(r.careerCount).padStart(3)}  ${r.reason}`);
  console.log(`        STYRK: ${r.styrkLabel}`);
  if (r.collidesWith) console.log(`        SSYK : ${r.collidesWith}`);
  for (const c of r.candidates) console.log(`        → candidate ${c.code}  ${c.label}`);
}

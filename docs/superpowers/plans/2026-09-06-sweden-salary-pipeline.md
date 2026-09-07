# Sweden Salary Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate verified Swedish salary figures for as much of the 1,615-career catalog as SCB's occupation register supports, written into `country-packs/sv/pack.generated.json` with real provenance.

**Architecture:** A `careerId → SSYK 2012` crosswalk derived from the existing `careerId → STYRK-08` map (both code systems are ISCO-08 derived, so most codes carry over unchanged — the job is finding the ones that don't). A fetch script pulls median/P10/P90 per occupation from SCB's PxWeb API in a handful of batched requests, formats them as `kr/mån` display strings matching the existing curated style, and merges them into the Swedish pack as `tier: "verified"`.

**Tech Stack:** TypeScript, `tsx` scripts, vitest, SCB PxWeb API (open, unauthenticated).

**Prerequisite (already done):** `src/lib/country-packs/` framework, `getPack`/`getPackCareer`, `Provenanced<T>`, `pack-integrity.test.ts`.

**Reference:** `docs/superpowers/specs/2026-09-06-country-packs-sweden-design.md` §4.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/career-data/scb-occupations.generated.json` | Create. The 432 valid SSYK 2012 codes + English labels, cached from SCB so tests and the crosswalk work offline. |
| `src/lib/career-data/scb-salary-mapping.ts` | Create. `careerId → SSYK 2012`, plus the explicit list of careers SCB cannot represent. |
| `scripts/fetch-scb-occupations.ts` | Create. Refreshes the occupation cache. Run rarely. |
| `scripts/build-scb-crosswalk.ts` | Create. Derives the SSYK mapping from the STYRK mapping and prints a gap report. Run once, output reviewed by hand. |
| `scripts/refresh-sweden-salaries.ts` | Create. Fetches salaries and merges them into the Swedish pack. The recurring job. |
| `src/lib/career-data/__tests__/scb-salary-mapping.test.ts` | Create. Offline integrity of the crosswalk. |
| `src/lib/country-packs/sv/pack.generated.json` | Modify. Gains salary fields. |

Deliberately **not** touching `ssb-salary-mapping.ts` — Norway's map is the input to the crosswalk and stays untouched, so a mistake here cannot regress Norwegian data.

---

### Task 1: Cache the SSYK occupation list

Everything downstream needs to know which occupation codes actually exist. Fetch once, commit the result, so the crosswalk and its tests run offline.

**Files:**
- Create: `scripts/fetch-scb-occupations.ts`
- Create: `src/lib/career-data/scb-occupations.generated.json`

- [ ] **Step 1: Write the fetch script**

```ts
#!/usr/bin/env tsx
/**
 * Caches the SSYK 2012 occupation codes SCB actually publishes salaries for.
 *
 * Committed to the repo so the crosswalk and its tests are offline and
 * deterministic. Re-run only when SCB revises the occupation list (rare —
 * SSYK 2012 is a stable classification).
 *
 *   npx tsx scripts/fetch-scb-occupations.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const TABLE =
  "https://api.scb.se/OV0104/v1/doris/en/ssd/AM/AM0110/AM0110A/LoneSpridSektYrk4AN";

interface PxVariable {
  code: string;
  text: string;
  values: string[];
  valueTexts: string[];
}

async function main() {
  const res = await fetch(TABLE);
  if (!res.ok) throw new Error(`SCB metadata ${res.status}`);
  const meta = (await res.json()) as { variables: PxVariable[] };

  const occ = meta.variables.find((v) => v.code === "Yrke2012");
  if (!occ) throw new Error("Yrke2012 dimension missing — SCB changed the table");

  // "0000" is the all-occupations aggregate, not an occupation.
  const occupations = occ.values
    .map((code, i) => ({ code, label: occ.valueTexts[i] }))
    .filter((o) => o.code !== "0000");

  const years = meta.variables.find((v) => v.code === "Tid");

  const out = {
    source: TABLE,
    fetchedAt: new Date().toISOString().slice(0, 10),
    latestYear: years?.values.at(-1) ?? null,
    occupations,
  };

  writeFileSync(
    join(__dirname, "..", "src", "lib", "career-data", "scb-occupations.generated.json"),
    JSON.stringify(out, null, 2) + "\n",
    "utf8",
  );
  console.log(`${occupations.length} SSYK 2012 occupations, latest year ${out.latestYear}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
```

- [ ] **Step 2: Run it**

Run: `npx tsx scripts/fetch-scb-occupations.ts`
Expected: `431 SSYK 2012 occupations, latest year 2025`
(432 dimension values minus the `0000` aggregate. If the count differs materially, SCB revised the table — stop and check before continuing.)

- [ ] **Step 3: Commit**

```bash
git add scripts/fetch-scb-occupations.ts src/lib/career-data/scb-occupations.generated.json
git commit -m "feat(sweden): cache the SSYK 2012 occupation list from SCB"
```

---

### Task 2: Derive the crosswalk and find the gaps

`ssb-salary-mapping.ts` maps ~900 careers to STYRK-08 codes. STYRK-08 and SSYK 2012 are both ISCO-08 derived, so most codes are valid in both — but "most" is not "all", and the exceptions must be found, not assumed.

**Files:**
- Create: `scripts/build-scb-crosswalk.ts`
- Create: `src/lib/career-data/scb-salary-mapping.ts`

- [ ] **Step 1: Write the crosswalk builder**

```ts
#!/usr/bin/env tsx
/**
 * Derives careerId → SSYK 2012 from the existing careerId → STYRK-08 map.
 *
 * Both classifications are ISCO-08 derived, so a STYRK code is usually a
 * valid SSYK code. This script does NOT assume that: it checks every code
 * against the cached SCB occupation list and reports the ones that do not
 * exist, which then need a human decision.
 *
 *   npx tsx scripts/build-scb-crosswalk.ts
 */
import { SSB_SALARY_MAPPING } from "../src/lib/career-data/ssb-salary-mapping";
import occupations from "../src/lib/career-data/scb-occupations.generated.json";

const VALID = new Map(occupations.occupations.map((o) => [o.code, o.label]));

const matched: { careerId: string; ssyk: string; label: string }[] = [];
const unmatched: { careerId: string; styrk: string; styrkLabel: string }[] = [];

for (const entry of SSB_SALARY_MAPPING) {
  const label = VALID.get(entry.styrkCode);
  if (label) {
    matched.push({ careerId: entry.careerId, ssyk: entry.styrkCode, label });
  } else {
    unmatched.push({
      careerId: entry.careerId,
      styrk: entry.styrkCode,
      styrkLabel: entry.styrkLabel,
    });
  }
}

console.log(`matched   ${matched.length}`);
console.log(`unmatched ${unmatched.length}\n`);

// Group the misses by code — one bad code usually blocks many careers, so
// fixing the highest-frequency codes first recovers the most coverage.
const byCode = new Map<string, { label: string; careers: string[] }>();
for (const u of unmatched) {
  const g = byCode.get(u.styrk) ?? { label: u.styrkLabel, careers: [] };
  g.careers.push(u.careerId);
  byCode.set(u.styrk, g);
}

console.log("STYRK codes with no SSYK equivalent, most-blocking first:");
for (const [code, g] of [...byCode.entries()].sort(
  (a, b) => b[1].careers.length - a[1].careers.length,
)) {
  console.log(`  ${code}  ${g.careers.length.toString().padStart(3)} careers  ${g.label}`);
}

console.log(`\n// paste into scb-salary-mapping.ts`);
console.log(
  JSON.stringify(
    matched.map((m) => ({ careerId: m.careerId, ssykCode: m.ssyk, ssykLabel: m.label })),
    null,
    2,
  ),
);
```

- [ ] **Step 2: Run it and read the gap report**

Run: `npx tsx scripts/build-scb-crosswalk.ts | head -40`
Expected: a `matched` count in the high hundreds and a short list of blocking codes.

**This is a decision point, not an automated step.** For each unmatched code, either find the correct SSYK equivalent by searching `scb-occupations.generated.json` for the occupation label, or accept that SCB does not cover it and leave those careers without a Swedish salary. Do not guess a nearby code — a wrong occupation produces a confidently wrong salary, which is worse than a blank.

- [ ] **Step 3: Write the mapping module**

Redirect the script's JSON output into the file below, then hand-add any codes recovered in Step 2.

```ts
/**
 * careerId → SSYK 2012 occupation code, for SCB salary lookups.
 *
 * Derived from ssb-salary-mapping.ts (careerId → STYRK-08) by
 * scripts/build-scb-crosswalk.ts. Both classifications derive from ISCO-08,
 * so most codes carry over unchanged; the exceptions were resolved by hand
 * against scb-occupations.generated.json.
 *
 * SCB publishes 431 occupations against our 1,615 careers, so many careers
 * legitimately share a code. That is a property of the source, not an error:
 * the register does not distinguish a paleobiologist from a palaeontologist.
 * Generated salary text must not imply a precision SCB does not have.
 */
export interface ScbSalaryMapping {
  careerId: string;
  ssykCode: string;
  ssykLabel: string;
}

export const SCB_SALARY_MAPPING: ScbSalaryMapping[] = [
  { careerId: "software-developer", ssykCode: "2512", ssykLabel: "Software and system developers etc." },
  // ...generated entries...
];

/** Careers deliberately left unmapped — SCB has no comparable occupation. */
export const SCB_UNMAPPED_CAREERS: string[] = [
  // ...filled in from the Step 2 gap report...
];
```

- [ ] **Step 4: Commit**

```bash
git add scripts/build-scb-crosswalk.ts src/lib/career-data/scb-salary-mapping.ts
git commit -m "feat(sweden): careerId to SSYK 2012 crosswalk with an explicit unmapped list"
```

---

### Task 3: Guard the crosswalk with offline tests

**Files:**
- Create: `src/lib/career-data/__tests__/scb-salary-mapping.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { SCB_SALARY_MAPPING, SCB_UNMAPPED_CAREERS } from "../scb-salary-mapping";
import occupations from "../scb-occupations.generated.json";
import { CAREER_PATHWAYS } from "@/lib/career-pathways";

const VALID_SSYK = new Set(occupations.occupations.map((o) => o.code));
const ALL_CAREER_IDS = new Set(
  Object.values(CAREER_PATHWAYS).flat().map((c) => c.id),
);

describe("SCB salary mapping", () => {
  it("maps every entry to an SSYK code SCB actually publishes", () => {
    for (const m of SCB_SALARY_MAPPING) {
      expect(VALID_SSYK.has(m.ssykCode), `${m.careerId} → unknown SSYK ${m.ssykCode}`).toBe(true);
    }
  });

  it("references only careers that exist in the catalog", () => {
    for (const m of SCB_SALARY_MAPPING) {
      expect(ALL_CAREER_IDS.has(m.careerId), `unknown careerId ${m.careerId}`).toBe(true);
    }
    for (const id of SCB_UNMAPPED_CAREERS) {
      expect(ALL_CAREER_IDS.has(id), `unknown unmapped careerId ${id}`).toBe(true);
    }
  });

  it("maps each career at most once", () => {
    const seen = new Set<string>();
    for (const m of SCB_SALARY_MAPPING) {
      expect(seen.has(m.careerId), `duplicate mapping for ${m.careerId}`).toBe(false);
      seen.add(m.careerId);
    }
  });

  it("never both maps and unmaps the same career", () => {
    const mapped = new Set(SCB_SALARY_MAPPING.map((m) => m.careerId));
    for (const id of SCB_UNMAPPED_CAREERS) {
      expect(mapped.has(id), `${id} is both mapped and listed unmapped`).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run src/lib/career-data/__tests__/scb-salary-mapping.test.ts`
Expected: PASS. If "unknown SSYK" fails, Task 2 Step 2 was not finished — a code was guessed rather than resolved.

- [ ] **Step 3: Commit**

```bash
git add src/lib/career-data/__tests__/scb-salary-mapping.test.ts
git commit -m "test(sweden): pin the SCB crosswalk against the published occupation list"
```

---

### Task 4: Format a salary range the way the curated strings read

Generated figures must be indistinguishable in style from the hand-written ones, or the catalog reads as two different kinds of claim. Target format, matching the existing Swedish entries exactly:

`38 800–72 500 kr/mån (median ca 52 500 kr/mån)`

Note: non-breaking-space thousands separators, en-dash range, Swedish "ca".

**Files:**
- Create: `src/lib/career-data/format-sek-salary.ts`
- Create: `src/lib/career-data/__tests__/format-sek-salary.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { formatSekMonthlyRange } from "../format-sek-salary";

describe("formatSekMonthlyRange", () => {
  it("matches the style of the hand-curated Swedish strings", () => {
    // SCB 2025, SSYK 2512 (software and system developers).
    expect(formatSekMonthlyRange({ p10: 39600, p90: 72600, median: 53500 })).toBe(
      "39 600–72 600 kr/mån (median ca 53 500 kr/mån)",
    );
  });

  it("omits the median clause when the median is absent", () => {
    expect(formatSekMonthlyRange({ p10: 29300, p90: 39000 })).toBe(
      "29 300–39 000 kr/mån",
    );
  });

  it("throws rather than emit a reversed range", () => {
    expect(() => formatSekMonthlyRange({ p10: 50000, p90: 40000 })).toThrow();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/career-data/__tests__/format-sek-salary.test.ts`
Expected: FAIL — `Failed to resolve import "../format-sek-salary"`

- [ ] **Step 3: Write the implementation**

```ts
/**
 * Formats SCB percentile figures as a Swedish monthly salary string.
 *
 * Style deliberately matches the hand-curated entries so generated and
 * curated figures read identically — a user should not be able to tell which
 * is which from the prose, only from the provenance label.
 *
 * Swedish convention: non-breaking space as the thousands separator, en-dash
 * for the range, monthly ("kr/mån") not annual.
 */
export interface SekPercentiles {
  p10: number;
  p90: number;
  median?: number;
}

const NBSP = " ";

function sv(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

export function formatSekMonthlyRange({ p10, p90, median }: SekPercentiles): string {
  if (!(p10 > 0) || !(p90 > 0)) throw new Error(`non-positive salary: ${p10}–${p90}`);
  if (p10 > p90) throw new Error(`reversed salary range: ${p10} > ${p90}`);
  const range = `${sv(p10)}–${sv(p90)} kr/mån`;
  return median ? `${range} (median ca ${sv(median)} kr/mån)` : range;
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/lib/career-data/__tests__/format-sek-salary.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/career-data/format-sek-salary.ts src/lib/career-data/__tests__/format-sek-salary.test.ts
git commit -m "feat(sweden): format SCB percentiles in the curated salary style"
```

---

### Task 5: Fetch salaries and merge them into the Swedish pack

**Files:**
- Create: `scripts/refresh-sweden-salaries.ts`
- Modify: `src/lib/country-packs/sv/pack.generated.json`

- [ ] **Step 1: Write the refresh script**

```ts
#!/usr/bin/env tsx
/**
 * Fetches Swedish salaries from SCB and merges them into the Swedish pack.
 *
 *   npx tsx scripts/refresh-sweden-salaries.ts            # write
 *   npx tsx scripts/refresh-sweden-salaries.ts --dry-run  # report only
 *
 * Only fills salary fields. Education paths, descriptions and every
 * hand-curated field are left untouched — and a curated salary is NEVER
 * overwritten by a generated one, because a human checked it against a
 * specific source and this script has not.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SCB_SALARY_MAPPING } from "../src/lib/career-data/scb-salary-mapping";
import { formatSekMonthlyRange } from "../src/lib/career-data/format-sek-salary";
import occupations from "../src/lib/career-data/scb-occupations.generated.json";
import type { CountryPack } from "../src/lib/country-packs/types";

const TABLE =
  "https://api.scb.se/OV0104/v1/doris/en/ssd/AM/AM0110/AM0110A/LoneSpridSektYrk4AN";
const MEDIAN = "000007CE";
const P10 = "000007CF";
const P90 = "000007CI";
const BATCH = 60; // keep each POST comfortably inside SCB's response cap

const dryRun = process.argv.includes("--dry-run");
const year = occupations.latestYear!;
const packPath = join(__dirname, "..", "src", "lib", "country-packs", "sv", "pack.generated.json");

interface Row { key: string[]; values: string[] }

async function fetchBatch(codes: string[]): Promise<Map<string, number[]>> {
  const res = await fetch(TABLE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: [
        { code: "Sektor", selection: { filter: "item", values: ["0"] } },
        { code: "Yrke2012", selection: { filter: "item", values: codes } },
        { code: "Kon", selection: { filter: "item", values: ["1+2"] } },
        { code: "ContentsCode", selection: { filter: "item", values: [MEDIAN, P10, P90] } },
        { code: "Tid", selection: { filter: "item", values: [year] } },
      ],
      response: { format: "json" },
    }),
  });
  if (!res.ok) throw new Error(`SCB ${res.status}: ${await res.text()}`);
  const body = (await res.json()) as { data: Row[] };

  const out = new Map<string, number[]>();
  for (const row of body.data) {
    const ssyk = row.key[1]; // sector, occupation, sex, year
    const nums = row.values.map((v) => Number(v));
    if (nums.every((n) => Number.isFinite(n) && n > 0)) out.set(ssyk, nums);
  }
  return out;
}

async function main() {
  const codes = [...new Set(SCB_SALARY_MAPPING.map((m) => m.ssykCode))];
  const figures = new Map<string, number[]>();

  for (let i = 0; i < codes.length; i += BATCH) {
    const batch = codes.slice(i, i + BATCH);
    const got = await fetchBatch(batch);
    for (const [k, v] of got) figures.set(k, v);
    console.log(`  ${Math.min(i + BATCH, codes.length)}/${codes.length} occupations`);
  }

  const pack = JSON.parse(readFileSync(packPath, "utf8")) as CountryPack;
  const today = new Date().toISOString().slice(0, 10);
  let added = 0;
  let keptCurated = 0;
  let skipped = 0;

  for (const m of SCB_SALARY_MAPPING) {
    const nums = figures.get(m.ssykCode);
    if (!nums) { skipped += 1; continue; }
    // Column order follows the ContentsCode order requested above.
    const [median, p10, p90] = nums;

    const existing = pack.careers[m.careerId];
    if (existing?.salary) { keptCurated += 1; continue; }

    let text: string;
    try {
      text = formatSekMonthlyRange({ p10, p90, median });
    } catch (e) {
      console.warn(`  skipping ${m.careerId}: ${(e as Error).message}`);
      skipped += 1;
      continue;
    }

    pack.careers[m.careerId] = {
      ...(existing ?? { careerId: m.careerId }),
      careerId: m.careerId,
      salary: { value: text, tier: "verified", source: TABLE, verifiedAt: today },
    };
    added += 1;
  }

  const all = Object.values(pack.careers);
  pack.meta.generatedAt = new Date().toISOString();
  pack.meta.coverage = {
    careers: all.length,
    verified: all.filter((c) => c.salary?.tier === "verified" || c.educationPath?.tier === "verified").length,
    estimated: all.filter((c) => c.salary?.tier === "estimated" || c.educationPath?.tier === "estimated").length,
  };
  if (!pack.meta.sources.includes(TABLE)) pack.meta.sources.push(TABLE);

  console.log(
    `\nadded ${added} salaries, kept ${keptCurated} curated, skipped ${skipped}` +
      `\npack now ${pack.meta.coverage.careers} careers`,
  );

  if (dryRun) { console.log("dry run — nothing written"); return; }
  writeFileSync(packPath, JSON.stringify(pack, null, 2) + "\n", "utf8");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
```

- [ ] **Step 2: Dry run first**

Run: `npx tsx scripts/refresh-sweden-salaries.ts --dry-run`
Expected: batch progress lines, then a summary. `kept curated` should be roughly 50 — the existing hand-checked Swedish salaries must not be overwritten. If it reports 0 kept, the guard is broken; stop and fix it before writing.

- [ ] **Step 3: Write for real**

Run: `npx tsx scripts/refresh-sweden-salaries.ts`

- [ ] **Step 4: Verify the pack still passes integrity checks**

Run: `npx vitest run src/lib/country-packs`
Expected: PASS. `meta coverage counts match the actual records` catches a miscounted merge.

- [ ] **Step 5: Verify the sources resolve**

Run: `npx tsx scripts/validate-country-packs.ts --country=Sweden`
Expected: the two known Indeed 403s and nothing new. Every generated salary cites the same SCB table URL, deduplicated to one request.

- [ ] **Step 6: Spot-check three careers by hand**

Open `src/lib/country-packs/sv/pack.generated.json` and confirm `nurse`, `electrician` and `lawyer` carry plausible monthly figures in `kr/mån`. A figure near 500,000 means annual NOK leaked in; a figure near 300 means a unit error.

- [ ] **Step 7: Commit**

```bash
git add scripts/refresh-sweden-salaries.ts src/lib/country-packs/sv/pack.generated.json
git commit -m "feat(sweden): verified SCB salaries across the catalog"
```

---

### Task 6: Assert coverage so a shortfall fails CI

**Files:**
- Modify: `src/lib/country-packs/__tests__/pack-integrity.test.ts`

- [ ] **Step 1: Add the coverage-floor test**

Append to the file:

```ts
// A launch-blocking assertion: Sweden is marketed as covered, so a
// regression that silently empties the pack must fail CI rather than ship.
describe("Sweden launch coverage", () => {
  const sweden = getPack("Sweden")!;

  it("carries salary for a substantial share of the catalog", () => {
    const withSalary = Object.values(sweden.careers).filter((c) => c.salary).length;
    expect(withSalary).toBeGreaterThanOrEqual(700);
  });

  it("keeps every hand-curated salary that predated the SCB import", () => {
    // Curated entries cite a source other than the SCB table.
    const curated = Object.values(sweden.careers).filter(
      (c) => c.salary && !c.salary.source.includes("api.scb.se"),
    );
    expect(curated.length).toBeGreaterThanOrEqual(45);
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run src/lib/country-packs`
Expected: PASS. If the coverage floor fails, lower it to the real number *only* after confirming Task 2's gap report explains the shortfall — do not lower it to make CI green.

- [ ] **Step 3: Run the whole suite**

Run: `npx vitest run`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/country-packs/__tests__/pack-integrity.test.ts
git commit -m "test(sweden): fail CI if Swedish salary coverage regresses"
```

---

## Follow-on plans still needed

This plan covers salary only. Each of these is a separate plan against the same spec:

1. **Grade/scoring abstraction** (spec §3) — the scale adapters, `grade-match.ts` normalisation, the profile clamp, the quiz input. Blocked on verifying the Swedish meritvärde figures against UHR.
2. **Education paths and programmes** (spec §5) — the largest remaining item and the largest accuracy risk.
3. **Legal jurisdiction parameterisation** (spec §6) — blocked on counsel, not on engineering.
4. **CSN funding pack** (spec §6) — small.

# Universities per Career → 80% Coverage (local + Europe) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every career in the Understand → Study Path tab shows 1–2 named universities for the user's local country **and** 1–2 named alternatives elsewhere in Europe, reaching ≥80% catalogue coverage on both.

**Architecture:** Today, named universities come from per-career `programmes.json` (≈45 directly curated; 485 more inherit a base career via `advancedCareerMap`) scoped to Nordic+ES (`getProgrammesForCareer`). Local Norway coverage ≈39%; true broad-Europe coverage ≈0%. Rather than hand-curate 1,359 careers, we add a **discipline-bucket layer**: ~50 discipline buckets each carry verified local universities (per country) **and** European universities; every career is mapped to a bucket by an agent classification sweep. A new resolver returns bucket-based **alternatives** that fill gaps behind the existing precise programmes, and a new "Elsewhere in Europe" row (plus a local fallback) renders them — always shown, not gated by `hasEducationData`. A coverage-guard test encodes the 80% target and drives the data work.

**Tech Stack:** Next.js 14 / TypeScript (strict), JSON data modules under `src/lib/education/data/`, Vitest, the existing `validate-programme-url` pipeline, agent-orchestrated data generation (Workflow / parallel agents).

---

## Coverage definitions (precise)

- **Universe:** the 1,359 unique career ids in `src/lib/career-pathways.ts` (extract: `grep -oE 'id: "[a-z0-9][a-z0-9-]*"' | sort -u`).
- **Has local:** career resolves to ≥1 named university in the user's country — via existing precise programmes **or** its bucket's `local[country]`.
- **Has Europe:** career resolves to ≥1 named **non-local, European** university via its bucket's `europe` list.
- **80% target:** ≥1,087 careers have **both** local (for NO, the default/primary market) **and** Europe.

## File structure

- **Create** `src/lib/education/data/discipline-buckets.json` — ~50 buckets; verified local + Europe universities. *(data)*
- **Create** `src/lib/education/data/career-discipline-map.json` — `{ "<careerId>": "<bucketId>" }` for all 1,359 careers. *(data, agent-generated)*
- **Create** `src/lib/education/alternatives.ts` — bucket loader + `getDisciplineForCareer`, `getLocalAlternatives`, `getEuropeanAlternatives`. *(code)*
- **Create** `src/lib/education/__tests__/alternatives.test.ts` — unit tests for the resolver. *(test)*
- **Create** `src/lib/education/__tests__/alternatives-coverage.test.ts` — the 80% coverage guard. *(test)*
- **Create** `scripts/education/classify-disciplines.ts` — the classification-sweep driver. *(tooling)*
- **Create** `scripts/education/verify-bucket-urls.ts` — URL verifier for bucket data. *(tooling)*
- **Modify** `src/components/education-browser/education-browser.tsx` — add the "Elsewhere in Europe" row + local fallback. *(code)*
- **Reuse unchanged:** `src/components/education-browser/institution-card.tsx`, `src/lib/education/index.ts` (precise programmes), the Understand tab (`src/app/(dashboard)/my-journey/page.tsx` already renders `<EducationBrowser>`).

## Data schemas (locked)

```ts
// in src/lib/education/alternatives.ts
export type EuropeCountry =
  | 'NO' | 'SE' | 'DK' | 'FI' | 'IS'   // Nordic (local-capable today)
  | 'NL' | 'BE' | 'CH' | 'DE' | 'FR' | 'IT' | 'ES' | 'IE' | 'AT' | 'DK'; // broader Europe

export interface AltUniversity {
  name: string;          // "Delft University of Technology"
  country: EuropeCountry; // "NL"
  city: string;          // "Delft"
  url: string;           // durable institution/faculty landing — must pass URL verification
  note?: string;         // e.g. "Strong in aerospace & robotics"
}

export interface DisciplineBucket {
  id: string;            // "mechanical-engineering"
  label: string;         // "Mechanical & Aerospace Engineering"
  local: Partial<Record<'NO'|'SE'|'DK'|'FI'|'IS', AltUniversity[]>>; // 1–2 per country (NO required)
  europe: AltUniversity[]; // 1–2 broad-Europe (non-Nordic preferred)
}
```

`discipline-buckets.json` shape: `{ "meta": { "source": "...", "lastUpdated": "YYYY-MM-DD" }, "buckets": DisciplineBucket[] }`.
`career-discipline-map.json` shape: `{ "meta": {...}, "map": { "<careerId>": "<bucketId>" } }`.

### Anchor example bucket (URLs verified 200 on 2026-06-18 — copy this exact format)

```json
{
  "id": "mechanical-engineering",
  "label": "Mechanical & Aerospace Engineering",
  "local": {
    "NO": [
      { "name": "NTNU", "country": "NO", "city": "Trondheim", "url": "https://www.ntnu.no/studier/mtprod" },
      { "name": "Universitetet i Oslo", "country": "NO", "city": "Oslo", "url": "https://www.uio.no/studier/" }
    ]
  },
  "europe": [
    { "name": "Delft University of Technology", "country": "NL", "city": "Delft", "url": "https://www.tudelft.nl", "note": "Top-ranked European engineering school" },
    { "name": "ETH Zürich", "country": "CH", "city": "Zürich", "url": "https://ethz.ch", "note": "Mechanical & process engineering" }
  ]
}
```

---

### Task 1: Resolver scaffold + loader (empty data, graceful)

**Files:**
- Create: `src/lib/education/data/discipline-buckets.json` (start: `{ "meta": { "source": "hand-curated + verified", "lastUpdated": "2026-06-18" }, "buckets": [] }`)
- Create: `src/lib/education/data/career-discipline-map.json` (start: `{ "meta": { "source": "agent classification sweep", "lastUpdated": "2026-06-18" }, "map": {} }`)
- Create: `src/lib/education/alternatives.ts`
- Test: `src/lib/education/__tests__/alternatives.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/education/__tests__/alternatives.test.ts
import { describe, it, expect } from "vitest";
import {
  getDisciplineForCareer,
  getLocalAlternatives,
  getEuropeanAlternatives,
} from "../alternatives";

describe("education alternatives resolver", () => {
  it("returns null/empty for an unmapped career", () => {
    expect(getDisciplineForCareer("totally-made-up-career")).toBeNull();
    expect(getEuropeanAlternatives("totally-made-up-career")).toEqual([]);
    expect(getLocalAlternatives("totally-made-up-career", "NO")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node_modules/.bin/vitest run src/lib/education/__tests__/alternatives.test.ts`
Expected: FAIL — "Cannot find module '../alternatives'".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/education/alternatives.ts
import bucketsData from "./data/discipline-buckets.json";
import mapData from "./data/career-discipline-map.json";
import { resolveCareer } from "./index";

export type EuropeCountry =
  | "NO" | "SE" | "DK" | "FI" | "IS"
  | "NL" | "BE" | "CH" | "DE" | "FR" | "IT" | "ES" | "IE" | "AT";

export interface AltUniversity {
  name: string;
  country: EuropeCountry;
  city: string;
  url: string;
  note?: string;
}

export interface DisciplineBucket {
  id: string;
  label: string;
  local: Partial<Record<"NO" | "SE" | "DK" | "FI" | "IS", AltUniversity[]>>;
  europe: AltUniversity[];
}

const buckets: DisciplineBucket[] = (bucketsData as { buckets: DisciplineBucket[] }).buckets;
const bucketById = new Map(buckets.map((b) => [b.id, b]));
const careerMap: Record<string, string> = (mapData as { map: Record<string, string> }).map;

/** careerId (or specialised id, resolved to its base) → bucket id, or null. */
export function getDisciplineForCareer(careerIdOrTitle: string): string | null {
  const direct = careerMap[careerIdOrTitle];
  if (direct) return direct;
  const base = resolveCareer(careerIdOrTitle);
  return (base && careerMap[base]) ?? null;
}

function bucketFor(careerIdOrTitle: string): DisciplineBucket | null {
  const id = getDisciplineForCareer(careerIdOrTitle);
  return id ? bucketById.get(id) ?? null : null;
}

/** 1–2 named universities in `country` for this career's discipline. */
export function getLocalAlternatives(
  careerIdOrTitle: string,
  country: "NO" | "SE" | "DK" | "FI" | "IS",
): AltUniversity[] {
  return bucketFor(careerIdOrTitle)?.local[country] ?? [];
}

/** 1–2 named broad-Europe universities for this career's discipline. */
export function getEuropeanAlternatives(careerIdOrTitle: string): AltUniversity[] {
  return bucketFor(careerIdOrTitle)?.europe ?? [];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node_modules/.bin/vitest run src/lib/education/__tests__/alternatives.test.ts`
Expected: PASS (3 assertions).

- [ ] **Step 5: Commit**

```bash
git add src/lib/education/alternatives.ts src/lib/education/data/discipline-buckets.json src/lib/education/data/career-discipline-map.json src/lib/education/__tests__/alternatives.test.ts
git commit -m "feat(education): discipline-bucket alternatives resolver scaffold"
```

---

### Task 2: Coverage-guard test (the 80% gate, starts RED)

**Files:**
- Test: `src/lib/education/__tests__/alternatives-coverage.test.ts`

- [ ] **Step 1: Write the coverage guard**

```ts
// src/lib/education/__tests__/alternatives-coverage.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { getLocalAlternatives, getEuropeanAlternatives } from "../alternatives";
import { getProgrammesForCareer } from "../index";

// Universe: unique career ids from the catalogue source.
const src = readFileSync("src/lib/career-pathways.ts", "utf8");
const careerIds = Array.from(
  new Set(Array.from(src.matchAll(/id: "([a-z0-9][a-z0-9-]*)"/g), (m) => m[1])),
);

const hasLocal = (id: string) =>
  getLocalAlternatives(id, "NO").length > 0 ||
  getProgrammesForCareer(id, { country: "NO" }).length > 0;
const hasEurope = (id: string) => getEuropeanAlternatives(id).length > 0;

describe("universities coverage (Norway primary market)", () => {
  it("≥80% of careers have a local (NO) named university", () => {
    const pct = careerIds.filter(hasLocal).length / careerIds.length;
    expect(pct).toBeGreaterThanOrEqual(0.8);
  });

  it("≥80% of careers have a European alternative", () => {
    const pct = careerIds.filter(hasEurope).length / careerIds.length;
    expect(pct).toBeGreaterThanOrEqual(0.8);
  });
});
```

- [ ] **Step 2: Run it — confirm it FAILS now (data not yet generated)**

Run: `node_modules/.bin/vitest run src/lib/education/__tests__/alternatives-coverage.test.ts`
Expected: FAIL (≈0% Europe, ≈39% local). This is the target the data tasks must turn green.

- [ ] **Step 3: Commit (red guard is intentional — mark skip until data lands)**

Add `.skip` to the two `it` blocks with a `// TODO(unskip in Task 6 once data lands)` comment so CI stays green during data work, then:

```bash
git add src/lib/education/__tests__/alternatives-coverage.test.ts
git commit -m "test(education): add (skipped) 80% universities coverage guard"
```

---

### Task 3: Discipline taxonomy + classification sweep → `career-discipline-map.json`

**Files:**
- Create: `scripts/education/classify-disciplines.ts`
- Modify: `src/lib/education/data/career-discipline-map.json`

**Taxonomy (≈50 buckets):** derive from the 18 `CareerCategory` values, split where a category spans distinct degrees. Seed list (extend as needed): `medicine`, `nursing-allied-health`, `dentistry`, `pharmacy`, `veterinary`, `psychology`, `mechanical-engineering`, `electrical-engineering`, `civil-engineering`, `chemical-process-engineering`, `computer-science-software`, `data-science-ai`, `cybersecurity`, `telecom-network`, `mathematics-physics`, `biology-life-sciences`, `chemistry`, `environmental-earth-science`, `architecture`, `law`, `business-management`, `economics-finance`, `accounting`, `marketing-communications`, `education-teaching`, `social-work`, `humanities-languages`, `history-philosophy`, `political-science-ir`, `journalism-media`, `creative-arts-design`, `music-performing-arts`, `film-animation`, `architecture-urban-planning`, `agriculture-food`, `maritime`, `aviation`, `sport-science`, `tourism-hospitality`, `public-admin`, `criminology-policing`, `military-defence`, `logistics-supplychain`, `geosciences-energy`, `vocational-trades`, `beauty-wellness`, `culinary`, `other-applied`.

- [ ] **Step 1: Write the classification driver**

`scripts/education/classify-disciplines.ts` reads all career ids + their `{title, description, category, educationPath}` from the catalogue, then dispatches a **Workflow** that pipelines batches of ~40 careers to agents, each returning `{ careerId, bucketId }` against the fixed taxonomy (schema-validated; bucket must be one of the seed list). Priors to include in the prompt: the career's `CareerCategory` and, if present, its `advancedCareerMap[id].baseCareerId`. Output merged → `career-discipline-map.json`.

```ts
// scripts/education/classify-disciplines.ts — orchestration shape (run via Workflow)
// 1. const careers = loadCatalogue();                  // id,title,description,category
// 2. const TAXONOMY = [...];                            // the ~50 ids above
// 3. pipeline(chunk(careers,40), batch =>
//      agent(`Classify each career into exactly one bucket from ${TAXONOMY}. ...`,
//            { schema: { type:'array', items:{ careerId:'string', bucketId:'enum(TAXONOMY)' } } }))
// 4. write { meta, map } to career-discipline-map.json
```

- [ ] **Step 2: Run the sweep; assert every career mapped**

Add an assertion to the coverage test file (temporary) or a one-off check: `careerIds.every(id => map[id])` must be true. Re-run until 100% of careers have a bucket (unmapped → `other-applied`).

- [ ] **Step 3: Commit**

```bash
git add scripts/education/classify-disciplines.ts src/lib/education/data/career-discipline-map.json
git commit -m "feat(education): classify all 1,359 careers into discipline buckets"
```

---

### Task 4: Curate + verify `discipline-buckets.json` (the universities)

**Files:**
- Create: `scripts/education/verify-bucket-urls.ts`
- Modify: `src/lib/education/data/discipline-buckets.json`

- [ ] **Step 1: Curate each bucket** — for every bucket id used in the map, add 1–2 **NO** universities (and optionally SE/DK/FI/IS) under `local`, and 1–2 **non-Nordic European** universities under `europe`, following the anchor example format. Source from official institution sites; prefer **durable landing URLs** (institution or faculty root, not deep programme slugs that rot). Reuse existing `programmes.json` institutions for the NO entries where they already exist.

- [ ] **Step 2: Write the URL verifier**

```ts
// scripts/education/verify-bucket-urls.ts
// For every AltUniversity.url in discipline-buckets.json:
//   GET with redirect-follow + 12s timeout; require final status 200..399.
//   Print a table of any non-OK url. Exit non-zero if any fail.
```

- [ ] **Step 3: Run the verifier — all URLs must pass**

Run: `node scripts/education/verify-bucket-urls.ts` (use the node-strip/loader workaround from `reference_node_tooling_exit194_workaround` if tsx exits 194).
Expected: every url 200–399. Fix or replace any failures. **Do not ship unverified URLs** (this repo has a real link-rot history — see `project_insights_fabricated_links`).

- [ ] **Step 4: Commit**

```bash
git add scripts/education/verify-bucket-urls.ts src/lib/education/data/discipline-buckets.json
git commit -m "feat(education): curate + URL-verify local + Europe universities per discipline"
```

---

### Task 5: Render "Elsewhere in Europe" + local fallback in EducationBrowser

**Files:**
- Modify: `src/components/education-browser/education-browser.tsx`
- Reuse: `src/components/education-browser/institution-card.tsx` (no change)

- [ ] **Step 1: Add the alternatives rows below the existing programme list.** After the precise-programme institution cards render, add (always, regardless of `hasEducationData` for the Europe row):

```tsx
// near the top of EducationBrowser:
import { getEuropeanAlternatives, getLocalAlternatives } from "@/lib/education/alternatives";
// ...
const europeAlts = getEuropeanAlternatives(resolvedId ?? careerId ?? "");
const localAlts =
  domesticProgrammes.length === 0 && educationCountry
    ? getLocalAlternatives(resolvedId ?? careerId ?? "", educationCountry as any)
    : [];
```

```tsx
{/* Local fallback — only when there are no precise domestic programmes */}
{localAlts.length > 0 && (
  <AltRow heading="Universities in your country" items={localAlts} />
)}
{/* Broad-Europe alternatives — always shown when present */}
{europeAlts.length > 0 && (
  <AltRow heading="Elsewhere in Europe" items={europeAlts} />
)}
```

Add a small presentational `AltRow` (or inline) that maps `AltUniversity[]` to compact cards reusing the InstitutionCard visual language (name + country flag + city + external link to `url`). Keep it calm and consistent with the existing cards.

- [ ] **Step 2: Verify rendering** via a dev page `src/app/dev/study-paths/page.tsx` that renders `<EducationBrowser careerId="mechanical-engineer" country="NO" />`, then headless-screenshot (`reference_headless_chrome_ui_verify`). Confirm both rows appear with verified universities.

- [ ] **Step 3: Commit**

```bash
git add src/components/education-browser/education-browser.tsx src/app/dev/study-paths/page.tsx
git commit -m "feat(education): show local fallback + 'Elsewhere in Europe' universities"
```

---

### Task 6: Flip the coverage guard green + full verification

**Files:**
- Modify: `src/lib/education/__tests__/alternatives-coverage.test.ts`

- [ ] **Step 1: Remove `.skip`** from both coverage `it` blocks.

- [ ] **Step 2: Run the guard** — must pass ≥80% on both local and Europe.

Run: `node_modules/.bin/vitest run src/lib/education/__tests__/alternatives-coverage.test.ts`
Expected: PASS. If short, return to Task 3 (map more careers off `other-applied`) / Task 4 (add unis to thin buckets) until green.

- [ ] **Step 3: Full gate**

Run: `node_modules/.bin/tsc --noEmit -p tsconfig.json` (expect 0), `node_modules/.bin/vitest run src/lib/education/` (expect pass), `node_modules/.bin/eslint src/lib/education/alternatives.ts src/components/education-browser/education-browser.tsx` (expect 0 errors).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "test(education): enforce 80% local + Europe universities coverage"
```

---

## Self-review notes
- **Coverage def matches goal:** Task 2 guard encodes "≥80% both local + Europe" exactly. ✓
- **No fabrication:** Task 4 requires URL verification before commit; anchor URLs verified 2026-06-18. ✓
- **Country-aware preserved:** local fallback uses `educationCountry`; precise Nordic+ES programmes still take precedence; Europe row is additive. ✓
- **Type consistency:** `AltUniversity` / `DisciplineBucket` defined in Task 1 used unchanged in Tasks 4–5. ✓
- **Scope:** single subsystem (education alternatives) — one plan. ✓

## Effort
~2–4 days: Task 3 sweep (agent Workflow over 1,359 careers) + Task 4 curation/verification (~50 buckets × ~4 universities, all URL-checked) are the bulk; code Tasks 1–2, 5–6 are ~half a day.

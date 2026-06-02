# Spain substrate + supported-careers localization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the silent-Norway fallback (gate the country picker to launched countries + a neutral international fallback), and add a country-aware career-localization layer that fully localizes ~30 Spanish careers while honestly marking + de-Norway-ifying the rest for Spanish users.

**Architecture:** Approach A — an additive override layer (`src/lib/career-localization/`) read by a pure `localizeCareer(career, country)` getter, slotted into the two render points. The `Career` type and the 638-entry `CAREER_PATHWAYS` catalog are untouched. Filtering/sorting/matching keep operating on the original (English/NOK) career objects; only the rendered card/detail receive the localized view.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, next-intl, vitest. Run tests with the project binary: `node_modules/.bin/vitest run <file>` (the worktree's `node_modules` is a symlink; `npx vitest` resolves the wrong vite).

**Data integrity rule (non-negotiable):** Spanish salary + programme figures must come from a real, citable source. Every `salary`/`educationPath` override carries a `source`. Anything unverifiable is **omitted** (English fallback / suppressed), never invented.

**Verification note:** local `tsc` + the GH gate are BLIND to Prisma enum drift; the **v0-youth-platform** Vercel build is the real gate. This plan has no Prisma changes, but still confirm v0 green before considering it shippable. **Do NOT auto-merge/deploy — stop at an open PR for owner review of the Spanish data.**

---

### Task 1: Launched-countries gate

**Files:**
- Modify: `src/lib/countries.ts`
- Modify: `src/app/auth/signup/page.tsx` (country `<Select>`, ~line 418 — `SUPPORTED_COUNTRIES.map`)
- Test: `src/lib/__tests__/countries.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/__tests__/countries.test.ts
import { describe, it, expect } from "vitest";
import { LAUNCHED_COUNTRIES, SUPPORTED_COUNTRIES, isLaunchedCountry } from "@/lib/countries";

describe("launched countries", () => {
  it("launches exactly Norway and Spain", () => {
    expect(LAUNCHED_COUNTRIES.map((c) => c.name)).toEqual(["Norway", "Spain"]);
  });
  it("is a subset of SUPPORTED_COUNTRIES", () => {
    const supported = new Set(SUPPORTED_COUNTRIES.map((c) => c.name));
    for (const c of LAUNCHED_COUNTRIES) expect(supported.has(c.name)).toBe(true);
  });
  it("isLaunchedCountry only true for launched", () => {
    expect(isLaunchedCountry("Spain")).toBe(true);
    expect(isLaunchedCountry("Italy")).toBe(false);
    expect(isLaunchedCountry(null)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `node_modules/.bin/vitest run src/lib/__tests__/countries.test.ts`
Expected: FAIL — `LAUNCHED_COUNTRIES`/`isLaunchedCountry` not exported.

- [ ] **Step 3: Add to `src/lib/countries.ts`** (after `SUPPORTED_COUNTRIES`)

```ts
/**
 * Countries we have actually localised end-to-end (education routes,
 * salaries, programmes, crisis info). Only these are offered in the
 * signup/profile picker — capturing an unlocalised country would silently
 * serve Norwegian content. Re-add a country here once its data lands.
 */
export const LAUNCHED_COUNTRIES: Country[] = SUPPORTED_COUNTRIES.filter((c) =>
  c.name === "Norway" || c.name === "Spain",
);

export function isLaunchedCountry(name?: string | null): boolean {
  return !!name && LAUNCHED_COUNTRIES.some((c) => c.name === name);
}
```

- [ ] **Step 4: Point the signup picker at launched countries**

In `src/app/auth/signup/page.tsx`: change the import to include `LAUNCHED_COUNTRIES` and replace `SUPPORTED_COUNTRIES.map(...)` in the country `<Select>` with `LAUNCHED_COUNTRIES.map(...)`. Leave the help text; it is now truthful.

- [ ] **Step 5: Run tests + typecheck**

Run: `node_modules/.bin/vitest run src/lib/__tests__/countries.test.ts` → PASS
Run: `npx tsc --noEmit` → 0 errors

- [ ] **Step 6: Commit**

```bash
git add src/lib/countries.ts src/lib/__tests__/countries.test.ts "src/app/auth/signup/page.tsx"
git commit -m "feat(countries): gate signup picker to launched countries (NO + ES)"
```

---

### Task 2: Neutral international context (kill silent-Norway)

**Files:**
- Create: `src/lib/country-context/international.ts`
- Modify: `src/lib/country-context/index.ts` (fallback at line 44-46)
- Test: `src/lib/country-context/__tests__/get-country-context.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/country-context/__tests__/get-country-context.test.ts
import { describe, it, expect } from "vitest";
import { getCountryContext } from "@/lib/country-context";

describe("getCountryContext", () => {
  it("resolves launched countries", () => {
    expect(getCountryContext("Norway").code).toBe("NO");
    expect(getCountryContext("Spain").code).toBe("ES");
  });
  it("never silently returns Norway for an unknown country", () => {
    const ctx = getCountryContext("Italy");
    expect(ctx.code).not.toBe("NO");
    expect(ctx.currency).not.toBe("NOK");
    expect(ctx.crisisLine).not.toMatch(/116 111/); // not the NO helpline
  });
  it("falls back to international for null/undefined", () => {
    expect(getCountryContext(null).code).toBe("INT");
    expect(getCountryContext(undefined).code).toBe("INT");
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `node_modules/.bin/vitest run src/lib/country-context/__tests__/get-country-context.test.ts`
Expected: FAIL — currently returns `norwayContext` for unknown/null.

- [ ] **Step 3: Create `src/lib/country-context/international.ts`**

```ts
import type { CountryContext } from "./index";

/**
 * Neutral, country-agnostic context. Used for any country we have NOT
 * localised, so we never silently serve Norwegian salaries or — critically —
 * a wrong-country crisis number. Safety-first: a generic emergency message,
 * no NOK, no Norway-specific education system.
 */
export const internationalContext: CountryContext = {
  code: "INT",
  name: "International",
  currency: "",
  language: "English",
  crisisLine:
    "If you are in danger or need urgent help, call your local emergency number (112 across the EU) or a local helpline.",
  condensedAiContext: () =>
    "The user's country is not yet localised. Do NOT assume a specific country's education system, salaries, or services. Keep guidance general and, where a number matters, tell them to check their own country's official sources.",
};
```

- [ ] **Step 4: Update the fallback in `src/lib/country-context/index.ts`**

Add `import { internationalContext } from "./international";` and change `getCountryContext`:

```ts
export function getCountryContext(country?: string | null): CountryContext {
  return (country && REGISTRY[country]) || internationalContext;
}
```

Update the doc comment above it from "Falls back to Norway" → "Falls back to a neutral international context (never silently Norway) for unknown/missing countries — never throws."

- [ ] **Step 5: Run tests + typecheck**

Run the test → PASS. Run `npx tsc --noEmit` → 0 errors.

> NOTE: `normaliseCountry()` in countries.ts still defaults *input* to Norway — that is correct for the genuine no-country/home case (the picker only offers NO/ES). This task only changes the AI-context resolver.

- [ ] **Step 6: Commit**

```bash
git add src/lib/country-context/international.ts src/lib/country-context/index.ts src/lib/country-context/__tests__/get-country-context.test.ts
git commit -m "fix(country-context): neutral international fallback, never silent Norway"
```

---

### Task 3: Career localization layer (types + getter)

**Files:**
- Create: `src/lib/career-localization/types.ts`
- Create: `src/lib/career-localization/index.ts`
- Test: `src/lib/career-localization/__tests__/localize-career.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/career-localization/__tests__/localize-career.test.ts
import { describe, it, expect } from "vitest";
import type { Career } from "@/lib/career-pathways";
import { localizeCareer } from "@/lib/career-localization";

const base: Career = {
  id: "doctor", title: "Doctor", emoji: "🩺",
  description: "Diagnose and treat illness.",
  avgSalary: "700,000 - 1,400,000 kr/year",
  educationPath: "Medical degree (6 yrs) via Samordna opptak",
  keySkills: ["empathy"], dailyTasks: ["see patients"], growthOutlook: "high",
};

describe("localizeCareer", () => {
  it("Norway/default → unchanged + isLocalized true", () => {
    const v = localizeCareer(base, "Norway");
    expect(v.avgSalary).toBe(base.avgSalary);
    expect(v.isLocalized).toBe(true);
  });
  it("Spain + localized career → ES overrides, EUR salary", () => {
    const v = localizeCareer(base, "Spain"); // doctor is in es.ts
    expect(v.isLocalized).toBe(true);
    expect(v.avgSalary).toMatch(/€|EUR/);
    expect(v.avgSalary).not.toMatch(/kr/);
  });
  it("Spain + NON-localized career → suppress salary+path, isLocalized false", () => {
    const v = localizeCareer({ ...base, id: "zzz-not-localized" }, "Spain");
    expect(v.isLocalized).toBe(false);
    expect(v.avgSalary).toBe("");
    expect(v.educationPath).toBe("");
    expect(v.description).toBe(base.description); // universal text kept
  });
  it("logged-out/undefined country → unchanged", () => {
    expect(localizeCareer(base, undefined).avgSalary).toBe(base.avgSalary);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `node_modules/.bin/vitest run src/lib/career-localization/__tests__/localize-career.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/lib/career-localization/types.ts`**

```ts
import type { Career } from "@/lib/career-pathways";

/** A localised value that MUST carry a citation. Omit the whole field if unverified. */
export interface Cited<T> {
  value: T;
  /** URL or precise citation backing this figure. Required, non-empty. */
  source: string;
}

/** Partial per-career overrides for one country. Only fields that differ. */
export interface CareerLocalizationEntry {
  description?: string;
  dailyTasks?: string[];
  keySkills?: string[];
  /** EUR range, verified. */
  salary?: Cited<string>;
  /** Local education path, verified. */
  educationPath?: Cited<string>;
}

export interface LocalizedCareerView extends Career {
  /** false → render a "not yet tailored to <country>" marker; salary/path suppressed. */
  isLocalized: boolean;
}
```

- [ ] **Step 4: Create `src/lib/career-localization/index.ts`**

```ts
import type { Career } from "@/lib/career-pathways";
import type { CareerLocalizationEntry, LocalizedCareerView } from "./types";
import { ES_CAREER_LOCALIZATION } from "./es";

/** Map of country name → (careerId → overrides). Extend per launched country. */
const LOCALIZATION: Record<string, Record<string, CareerLocalizationEntry>> = {
  Spain: ES_CAREER_LOCALIZATION,
};

/**
 * Return a render view of a career for a given user country.
 * Pure + total. Apply ONLY at render — filtering/sorting use the raw Career.
 *
 * - No country / Norway / default / not-a-localized-country → unchanged, isLocalized true.
 * - Localized country + career has overrides → apply overrides (per-field English fallback).
 * - Localized country + career has NO overrides → keep universal text, SUPPRESS the
 *   Norway-specific salary + educationPath, isLocalized false (drives the honest marker).
 */
export function localizeCareer(career: Career, country?: string | null): LocalizedCareerView {
  const table = country ? LOCALIZATION[country] : undefined;
  if (!table) return { ...career, isLocalized: true };

  const entry = table[career.id];
  if (!entry) {
    return { ...career, avgSalary: "", educationPath: "", isLocalized: false };
  }
  return {
    ...career,
    description: entry.description ?? career.description,
    dailyTasks: entry.dailyTasks ?? career.dailyTasks,
    keySkills: entry.keySkills ?? career.keySkills,
    avgSalary: entry.salary?.value ?? "", // suppress NOK if no verified EUR figure
    educationPath: entry.educationPath?.value ?? "",
    isLocalized: true,
  };
}
```

- [ ] **Step 5: Create a minimal `src/lib/career-localization/es.ts` stub so the test compiles** (Task 4 fills it with real data)

```ts
import type { CareerLocalizationEntry } from "./types";

/** Spanish per-career overrides. Real, cited data added in Task 4. */
export const ES_CAREER_LOCALIZATION: Record<string, CareerLocalizationEntry> = {
  doctor: {
    description: "Diagnostica y trata enfermedades, y acompaña a los pacientes.",
    salary: {
      value: "35.000 - 80.000 €/año (según especialidad y región)",
      source: "PLACEHOLDER — replace with verified source in Task 4",
    },
    educationPath: {
      value: "Grado en Medicina (6 años) + examen MIR para la residencia",
      source: "PLACEHOLDER — replace with verified source in Task 4",
    },
  },
};
```

- [ ] **Step 6: Run tests + typecheck**

Run the localize test → PASS (doctor present; EUR salary; suppression for unknown id). `npx tsc --noEmit` → 0 errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/career-localization
git commit -m "feat(career-localization): pure localizeCareer getter + types (Approach A)"
```

---

### Task 4: Real Spanish data for the 11 verified careers (research-gated)

**Files:**
- Modify: `src/lib/career-localization/es.ts`

Careers (already have programme data): doctor, lawyer, psychologist, primary-teacher, dentist, nurse, physiotherapist, software-developer, architect, electrician, plumber.

- [ ] **Step 1: For EACH career, research a real Spanish salary range + education path.** Use authoritative sources (e.g. official university pages already in `es-supplement.json` for the path; INE / Michael Page / Hays / InfoJobs / Glassdoor-ES salary studies for pay). Record the URL in `source`. If a credible figure cannot be found, **omit `salary`** (the card will simply show no salary for that career under Spain) — do not guess.

- [ ] **Step 2: Write the entries** in `ES_CAREER_LOCALIZATION` — for each: `description` (Spanish, warm, age-appropriate), `salary: {value: "X - Y €/año", source}`, `educationPath: {value: <Spanish system path>, source}`. `dailyTasks`/`keySkills` optional (translate if quick; otherwise leave English fallback). Replace the Task-3 placeholder `doctor` entry with verified data.

- [ ] **Step 3: Verify integrity** (anticipates Task 7): run `npx tsc --noEmit` (0 errors) and a quick grep that no `source` still says `PLACEHOLDER`.

Run: `grep -n "PLACEHOLDER" src/lib/career-localization/es.ts` → expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/lib/career-localization/es.ts
git commit -m "feat(career-localization): cited Spanish data for the 11 programme-backed careers"
```

---

### Task 5: Wire localization into the careers UI + honesty marker

**Files:**
- Modify: `src/app/(dashboard)/careers/page.tsx` (CareerCardV2 at ~L406, list CardV2 at ~L514, CareerDetailSheet at ~L527)
- Modify: `src/components/career-card-v2.tsx` (salary at L89/L181, path at L92, add marker)
- Modify: `src/components/career-detail-sheet.tsx` (salary/path render, add marker)
- Modify: `messages/en-GB.json`, `messages/nb-NO.json`, `messages/es.json` (new `careers.notTailored` key)
- Test: covered by Task 3 (getter) + manual render check

- [ ] **Step 1: Derive country + localize at each render site in `careers/page.tsx`**

Near the top of the component: `const userCountry = session?.user?.youthProfile?.country ?? null;`
At each render site, wrap the career: `career={localizeCareer(career, userCountry)}` for both `CareerCardV2` usages and `CareerDetailSheet` (`career={selectedCareer ? localizeCareer(selectedCareer, userCountry) : selectedCareer}`). Import `localizeCareer` and the `LocalizedCareerView` type. **Do not** change the arrays used for filtering/sorting — only the rendered props.

- [ ] **Step 2: Guard empty salary/path + add marker in `career-card-v2.tsx`**

Where it computes `const salaryShort = career.avgSalary.split(" ")[0];` guard: `const salaryShort = career.avgSalary ? career.avgSalary.split(" ")[0] : "";` and only render the salary chip when `salaryShort` is non-empty. Same for `const path = career.educationPath ? shortPath(career.educationPath) : "";` — render the path chip only when non-empty. When `(career as LocalizedCareerView).isLocalized === false`, render a quiet badge using the i18n key `t("careers.notTailored")` (muted theme tokens, e.g. `text-[10px] text-muted-foreground border border-border rounded-pill px-2 py-0.5`).

- [ ] **Step 3: Same guards + marker in `career-detail-sheet.tsx`** (salary badge, education-path section): only render when non-empty; show the `careers.notTailored` badge near the title when `isLocalized === false`.

- [ ] **Step 4: Add i18n key** to all three message files under `careers`:
  - en-GB: `"notTailored": "Not yet tailored to your country"`
  - nb-NO: `"notTailored": "Ikke tilpasset landet ditt ennå"`
  - es: `"notTailored": "Aún no adaptado a tu país"`

- [ ] **Step 5: Typecheck + tests**

Run: `npx tsc --noEmit` → 0 errors. Run: `node_modules/.bin/vitest run src/lib/career-localization src/lib/__tests__/countries.test.ts src/lib/country-context` → PASS.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(dashboard)/careers/page.tsx" src/components/career-card-v2.tsx src/components/career-detail-sheet.tsx messages/en-GB.json messages/nb-NO.json messages/es.json
git commit -m "feat(careers): country-aware localization + honest 'not tailored' marker"
```

---

### Task 6: ~19 additional Spanish careers (research-gated, optional within this PR)

**Files:**
- Modify: `src/lib/career-localization/es.ts`
- Modify: `src/lib/education/data/es-supplement.json` (add programmes for the additions)

- [ ] **Step 1: Map ~19 common Spanish youth paths to real `careerId`s in CAREER_PATHWAYS.** Confirm each id exists: `grep -E 'id:\s*"<id>"' src/lib/career-pathways.ts`. Candidate ids to verify: chef, hairdresser, car-mechanic, accountant, marketing-specialist, childcare-worker, police-officer, journalist, graphic-designer, civil-engineer, pharmacist, veterinarian, social-worker, real-estate-agent, personal-trainer, paramedic, web-developer, hotel-manager. Drop any that don't exist; substitute nearest real id.

- [ ] **Step 2: For each confirmed career, research real Spanish salary + path + (where possible) one programme**, with citations. Add to `ES_CAREER_LOCALIZATION` and, where a real programme is found, append an institution/programme to `es-supplement.json` (it is auto-merged by `education/index.ts`). Omit any figure that can't be verified.

- [ ] **Step 3: Typecheck + integrity grep** (no PLACEHOLDER) + commit.

```bash
git add src/lib/career-localization/es.ts src/lib/education/data/es-supplement.json
git commit -m "feat(career-localization): cited Spanish data for ~19 additional careers"
```

> If time-boxed: this task may ship partially. Every entry present must be fully cited; it is fine to land fewer than 19 as long as each is real. Record the final count in the PR description.

---

### Task 7: Integrity tests + full verification

**Files:**
- Test: `src/lib/career-localization/__tests__/es-data-integrity.test.ts`

- [ ] **Step 1: Write integrity test**

```ts
// src/lib/career-localization/__tests__/es-data-integrity.test.ts
import { describe, it, expect } from "vitest";
import { ES_CAREER_LOCALIZATION } from "@/lib/career-localization/es";
import { CAREER_PATHWAYS } from "@/lib/career-pathways";

const ALL_IDS = new Set(Object.values(CAREER_PATHWAYS).flat().map((c) => c.id));

describe("ES localization data integrity", () => {
  it("every localized careerId exists in the catalog", () => {
    for (const id of Object.keys(ES_CAREER_LOCALIZATION)) {
      expect(ALL_IDS.has(id)).toBe(true);
    }
  });
  it("every salary/educationPath override carries a real (non-placeholder) source", () => {
    for (const [id, e] of Object.entries(ES_CAREER_LOCALIZATION)) {
      for (const f of [e.salary, e.educationPath]) {
        if (f) {
          expect(f.source, `${id} source`).toBeTruthy();
          expect(f.source).not.toMatch(/PLACEHOLDER/i);
        }
      }
    }
  });
});
```

- [ ] **Step 2: Run the full suite of new tests** → PASS

Run: `node_modules/.bin/vitest run src/lib/career-localization src/lib/__tests__/countries.test.ts src/lib/country-context`

- [ ] **Step 3: Typecheck whole project**

Run: `npx tsc --noEmit` → 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/career-localization/__tests__/es-data-integrity.test.ts
git commit -m "test(career-localization): ES data integrity (ids exist, sources cited)"
```

---

### Final: PR (NO auto-merge)

- [ ] Push branch `feat/spain-substrate-localization`, open a PR to `main` summarizing: launched-gate, international fallback, localization layer, the exact list + count of localized careers, and which data figures are cited vs held back.
- [ ] Confirm the GH "Lint + Typecheck + Test" gate passes.
- [ ] **Stop. Do not merge.** The PR is for owner review of the Spanish data before it ships.

## Self-review (against spec)

- Spec §2 (launched gate) → Task 1. §2 (international fallback) → Task 2. §3 (layer/types/getter) → Task 3. §3 (~30 set + data) → Tasks 4+6. §4 (data flow) → Task 5 step 1. §5 (honesty UX) → Task 5 steps 2-4. §7 (testing) → Tasks 3,7 + countries/context tests. ✅ All covered.
- Placeholder scan: the only "PLACEHOLDER" is the deliberate Task-3 stub, explicitly replaced in Task 4 and asserted absent by Task 7. ✅
- Type consistency: `localizeCareer`, `LocalizedCareerView`, `CareerLocalizationEntry`, `Cited<T>`, `ES_CAREER_LOCALIZATION`, `LAUNCHED_COUNTRIES`, `isLaunchedCountry`, `internationalContext` used consistently across tasks. ✅

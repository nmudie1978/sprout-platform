# Localization Correctness Pass (phase 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.

**Goal:** Stop leaking Norway-specific salary/education/pay-progression to non-Norway users at the two highest-impact authenticated surfaces (My Journey Discover tab + dashboard career snapshot), via reusable pure helpers.

**Architecture:** Pure display helpers (`src/lib/career-localization/display.ts`) over the existing `localizeCareer(career, country)`. Both target sites already have the user's `country` in scope, so we call `localizeCareer` + the helpers directly (the session hook is deferred to phase-2 — nothing in phase-1 needs it).

**Tech Stack:** Next.js, TypeScript strict, Vitest, next-intl (`careers.notTailored` key already exists).

---

## File Structure
- **Create** `src/lib/career-localization/display.ts` — `displaySalary`, `displayEducation`, `showsSalaryProgression` (pure).
- **Create** `src/lib/career-localization/__tests__/display.test.ts`
- **Modify** `src/app/(dashboard)/my-journey/page.tsx` — localize the active career for the salary StatCard + education timeline; gate the NOK progression; de-assert "Norway" in tooltips for non-NO users.
- **Modify** `src/app/(dashboard)/dashboard/page.tsx` — localize `goalCareer` for the Career-snapshot salary stat.

Reused: `localizeCareer` + `LocalizedCareerView` (`src/lib/career-localization`); country from `country`/`countryData?.country` (my-journey) and `profileData?.country` (dashboard).

---

### Task 1: Pure display helpers

**Files:** Create `src/lib/career-localization/display.ts` + test `src/lib/career-localization/__tests__/display.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/career-localization/__tests__/display.test.ts
import { describe, it, expect } from "vitest";
import { displaySalary, displayEducation, showsSalaryProgression } from "../display";
import type { LocalizedCareerView } from "../types";

function lc(over: Partial<LocalizedCareerView>): LocalizedCareerView {
  return { id: "x", title: "X", emoji: "", description: "", avgSalary: "700,000 - 1,400,000 kr/year",
    educationPath: "Medical Degree", keySkills: [], dailyTasks: [], growthOutlook: "high",
    isLocalized: true, ...over } as LocalizedCareerView;
}

describe("displaySalary", () => {
  it("returns the salary when localized and non-empty", () => {
    expect(displaySalary(lc({}))).toBe("700,000 - 1,400,000 kr/year");
  });
  it("returns null when not localized", () => {
    expect(displaySalary(lc({ isLocalized: false, avgSalary: "" }))).toBeNull();
  });
  it("returns null when localized but salary suppressed/empty", () => {
    expect(displaySalary(lc({ isLocalized: true, avgSalary: "" }))).toBeNull();
  });
});

describe("displayEducation", () => {
  it("returns the path when localized and non-empty", () => {
    expect(displayEducation(lc({ educationPath: "Grado en Medicina" }))).toBe("Grado en Medicina");
  });
  it("returns null when not localized or empty", () => {
    expect(displayEducation(lc({ isLocalized: false, educationPath: "" }))).toBeNull();
    expect(displayEducation(lc({ educationPath: "  " }))).toBeNull();
  });
});

describe("showsSalaryProgression", () => {
  it("shows for Norway / no country (NOK progression is Norway-only)", () => {
    expect(showsSalaryProgression(null)).toBe(true);
    expect(showsSalaryProgression(undefined)).toBe(true);
    expect(showsSalaryProgression("Norway")).toBe(true);
  });
  it("hides for any other launched country", () => {
    expect(showsSalaryProgression("Spain")).toBe(false);
  });
});
```

- [ ] **Step 2: Run → fails** (`npx vitest run src/lib/career-localization/__tests__/display.test.ts`) — module not found.

- [ ] **Step 3: Implement**

```ts
// src/lib/career-localization/display.ts
import type { LocalizedCareerView } from "./types";

/** The salary to display, or null when the "not tailored for your country" marker should show.
 *  (localizeCareer suppresses avgSalary to "" for a localized country lacking an override.) */
export function displaySalary(lc: LocalizedCareerView): string | null {
  if (!lc.isLocalized) return null;
  return lc.avgSalary?.trim() ? lc.avgSalary : null;
}

/** The education path to display, or null for the marker. */
export function displayEducation(lc: LocalizedCareerView): string | null {
  if (!lc.isLocalized) return null;
  return lc.educationPath?.trim() ? lc.educationPath : null;
}

/** The salary-progression chart is Norway/NOK-only. Show it only for Norway or no country. */
export function showsSalaryProgression(country: string | null | undefined): boolean {
  return !country || country === "Norway";
}
```

- [ ] **Step 4: Run → passes.**

- [ ] **Step 5: Commit**

```bash
git add src/lib/career-localization/display.ts src/lib/career-localization/__tests__/display.test.ts
git commit -m "feat(localization): pure display helpers (salary/education suppression + progression gate)"
```

---

### Task 2: My Journey Discover tab — localize salary, education, progression, tooltips

**Files:** Modify `src/app/(dashboard)/my-journey/page.tsx`

Context: `country` is already in scope (`const country = countryQuery.data?.country ?? null;` ~line 165). `import { localizeCareer } from "@/lib/career-localization"` and `import { displaySalary, displayEducation, showsSalaryProgression } from "@/lib/career-localization/display"`. The component renders an active `career`. The "not tailored" copy: reuse `t("careers.notTailored")` if a `useTranslations` `t` is already in scope in this component; if not, use the literal `"Not tailored for your country yet"`.

- [ ] **Step 1: Add imports** (near other `@/lib/career-localization` / career imports):

```ts
import { localizeCareer } from "@/lib/career-localization";
import { displaySalary, displayEducation, showsSalaryProgression } from "@/lib/career-localization/display";
```

- [ ] **Step 2: Compute a localized view of the active career.** In the component body where `career` and `country` are both in scope (before the JSX that renders the StatCards), add:

```ts
  const lcCareer = career ? localizeCareer(career, country) : null;
  const lcSalary = lcCareer ? displaySalary(lcCareer) : null;
  const lcEducation = lcCareer ? displayEducation(lcCareer) : null;
  const notTailored = "Not tailored for your country yet";
```

(If a `useTranslations()` `t` exists in scope, set `const notTailored = t("careers.notTailored");` instead.)

- [ ] **Step 3: Salary StatCard (~line 759).** Replace the salary StatCard so it shows the localized salary or the marker, and only asserts "Norway" when not localized-away. Find:

```tsx
                      <button type="button" onClick={() => setShowSalaryPopup(true)} className="w-full text-left">
                        <StatCard label="Annual Salary" value={formatSalaryShort(career.avgSalary)} icon={DollarSign} accent="text-success" tooltip={`Typical annual gross salary in Norway: ${career.avgSalary.replace('/year', '')}. Tap to see full progression.`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSalaryPopup(true)}
                        className="text-xs text-warning/70 hover:text-warning font-medium mt-1.5 flex items-center gap-0.5 transition-colors w-full justify-center"
                      >
                        See full progression →
                      </button>
```

Replace with:

```tsx
                      {lcSalary ? (
                        <>
                          <button type="button" onClick={() => setShowSalaryPopup(true)} className="w-full text-left">
                            <StatCard label="Annual Salary" value={formatSalaryShort(lcSalary)} icon={DollarSign} accent="text-success" tooltip={showsSalaryProgression(country) ? `Typical annual gross salary in Norway: ${lcSalary.replace('/year', '')}. Tap to see full progression.` : `Typical annual gross salary: ${lcSalary.replace('/year', '')}.`} />
                          </button>
                          {showsSalaryProgression(country) && (
                            <button
                              type="button"
                              onClick={() => setShowSalaryPopup(true)}
                              className="text-xs text-warning/70 hover:text-warning font-medium mt-1.5 flex items-center gap-0.5 transition-colors w-full justify-center"
                            >
                              See full progression →
                            </button>
                          )}
                        </>
                      ) : (
                        <StatCard label="Annual Salary" value={notTailored} icon={DollarSign} accent="text-muted-foreground/60" />
                      )}
```

- [ ] **Step 4: Sector tooltip (~line 775).** It hard-asserts "in Norway". Make it country-aware. Find `tooltip={`Most ${career.title} roles in Norway are in the ${sector} sector.`}` and replace `in Norway ` with a conditional — change that one tooltip to:

```tsx
                    tooltip={showsSalaryProgression(country) ? `Most ${career.title} roles in Norway are in the ${sector} sector.` : `Most ${career.title} roles are in the ${sector} sector.`}
```

- [ ] **Step 5: Education timeline fallback (~line 819).** The block parses `career.educationPath` for a year count; the fallback renders raw `career.educationPath`. Use the localized education for both. Replace `career.educationPath` in the `yearMatch` regex lines (~794) with `(lcEducation ?? career.educationPath)` AND replace the fallback `<p ...>{career.educationPath}</p>` (~819) with:

```tsx
                <p className="text-xs text-foreground/70 leading-relaxed">{lcEducation ?? notTailored}</p>
```

(The timeline year-parse: change `const yearMatch = career.educationPath.match(...)` to `const eduForTimeline = lcEducation ?? ""; const yearMatch = eduForTimeline.match(/(\d+)\s*[–\-+]\s*(\d+)?\s*years?/i) || eduForTimeline.match(/(\d+)\s*years?/i);` — when education is suppressed, no year match → timeline falls back to the marker line.)

- [ ] **Step 6: Gate the NOK progression chart (~line 885).** Find `<SalaryProgressionChart careerId={career?.id ?? null} />` and wrap it:

```tsx
            {showsSalaryProgression(country) && <SalaryProgressionChart careerId={career?.id ?? null} />}
```

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit 2>&1 | grep "my-journey/page" || echo "my-journey typechecks"` → expect `my-journey typechecks`.
Run: `npx vitest run src/lib/career-localization` → expect PASS.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(dashboard)/my-journey/page.tsx"
git commit -m "fix(localization): localize My Journey salary/education + hide NOK progression for non-NO users"
```

---

### Task 3: Dashboard career snapshot — localize the salary stat

**Files:** Modify `src/app/(dashboard)/dashboard/page.tsx`

Context: `profileData?.country` is in scope (used for the flag at ~line 925). `goalCareer` is the user's goal career. The Career-snapshot IIFE (~line 1183) parses `goalCareer.avgSalary` (NOK) into `salary` and renders a `CompactStat label="Salary" value={`${salary} kr`}`.

- [ ] **Step 1: Add imports**

```ts
import { localizeCareer } from "@/lib/career-localization";
import { displaySalary, showsSalaryProgression } from "@/lib/career-localization/display";
```

- [ ] **Step 2: Localize inside the snapshot IIFE.** At the top of the `{goalCareer && (() => { ... })()}` IIFE (~line 1183), after `const sector = ...`, add:

```ts
              const lc = localizeCareer(goalCareer, profileData?.country ?? null);
              const lcSalary = displaySalary(lc);
              const isNok = showsSalaryProgression(profileData?.country ?? null);
```

Then change the NOK-abbreviation block to only run when showing NOK, and the salary CompactStat to show the localized value or marker. Replace the existing `const salary = goalCareer.avgSalary.replace(...) { ... });` block with a guarded version that operates on `lcSalary` and only NOK-abbreviates when `isNok`:

```ts
              const salaryDisplay = lcSalary == null
                ? "Not tailored yet"
                : isNok
                  ? lcSalary.replace(/\s*kr\/year.*/i, '').trim().replace(/[\d,]+/g, (m) => {
                      const n = parseInt(m.replace(/,/g, ''), 10);
                      if (isNaN(n)) return m;
                      if (n >= 1_000_000) { const v = n / 1_000_000; return v % 1 === 0 ? `${v}M` : `${v.toFixed(1).replace(/\.0$/, '')}M`; }
                      if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
                      return String(n);
                    }) + " kr"
                  : lcSalary;
```

- [ ] **Step 3: Use it in the CompactStat.** Change the salary `CompactStat` `value={`${salary} kr`}` to `value={salaryDisplay}` (note: the ` kr` suffix is now folded into `salaryDisplay` for the NOK path). Leave the Growth/Sector/Pension stats unchanged.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit 2>&1 | grep "dashboard/page" || echo "dashboard typechecks"` → expect `dashboard typechecks`.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(dashboard)/dashboard/page.tsx"
git commit -m "fix(localization): localize dashboard career-snapshot salary for non-NO users"
```

---

### Task 4: Full verification

- [ ] **Step 1:** `npx vitest run src/lib/career-localization` → PASS.
- [ ] **Step 2:** `npx eslint src/lib/career-localization "src/app/(dashboard)/my-journey/page.tsx" "src/app/(dashboard)/dashboard/page.tsx"` → 0 errors (warnings ok).
- [ ] **Step 3:** `npx tsc --noEmit 2>&1 | grep -E "career-localization|my-journey/page|dashboard/page" | grep -v "__tests__" || echo "no new errors in touched source files"`.

---

## Self-Review
- **Spec coverage:** display helpers (T1) ✓; My Journey salary/education/progression/tooltips (T2) ✓; dashboard snapshot salary (T3) ✓; no NOK leaks to non-NO at these surfaces ✓; session hook + radar/insights/compare/cards/demos/APIs explicitly deferred to phase-2 ✓.
- **Placeholders:** none.
- **Type consistency:** `displaySalary`/`displayEducation`/`showsSalaryProgression`/`LocalizedCareerView`/`localizeCareer` used identically across tasks.
- **Risk notes:** (a) the `notTailored` copy — use `t("careers.notTailored")` if `t` is in scope, else the literal (each task notes this). (b) hot files (my-journey/dashboard) — edits are surgical at named anchors; handle any merge conflict at PR time. (c) Norway/no-country users see byte-for-byte unchanged behaviour (every gate defaults to the NOK/Norway path when `showsSalaryProgression` is true and salary isn't suppressed).

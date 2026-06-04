# Localization Correctness Pass — phase 1 (Workstream #5, slice 1)

**Date:** 2026-06-04
**Branch:** `feat/localization-correctness`
**Author:** Claude (autonomous; owner away — decisions flagged for audit)

## Context

Only **Norway + Spain** are launched markets. `localizeCareer(career, country)`
(`src/lib/career-localization/index.ts`) returns a `LocalizedCareerView`: for a launched country
*without* per-career overrides it sets `avgSalary: ""`, `educationPath: ""`, `isLocalized: false`
(drives a "not tailored yet" marker). **Only the `/careers` page calls it.** An audit found ~95% of
career-data renders read `career.avgSalary` / `career.educationPath` raw, so a Spanish user sees **NOK
salary + Norwegian education** across the dashboard, My Journey, Radar, recommendations, compare, etc.
Where `isLocalized:false`, fields currently render **blank** (empty string) — confusing, not honest.

The NOK **salary progression** (`salaryRange` all in `kr`) renders in `My Journey`
(`src/components/journey/salary-progression.tsx`) and shows Norwegian pay bands to every user. (#143 just
removed it from the detail-sheet card; it now lives only in My Journey.)

User country is in the NextAuth session: `session?.user?.youthProfile?.country` (a country *name*, e.g.
`"Norway"`, `"Spain"`).

## Goal

Stop leaking Norway-specific salary/education to non-Norway users, with a **reusable mechanism** so the
long tail is trivial follow-up. Phase 1 covers the two highest-impact authenticated surfaces + the NOK
progression; the rest is a documented phase-2.

## Architecture (chosen: centralized hook + pure display helpers)

### 1. `src/lib/career-localization/use-localized-career.ts` (client hooks)
- `useUserCountry(): string | null` — reads `useSession()` → `session?.user?.youthProfile?.country ?? null`.
- `useLocalizedCareer(career: Career | null): LocalizedCareerView | null` — memoised `localizeCareer(career, country)`.
- `useLocalizedCareers(careers: Career[]): LocalizedCareerView[]`.

### 2. `src/lib/career-localization/display.ts` (pure, unit-tested)
- `displaySalary(lc: LocalizedCareerView): string | null` — returns the salary string to show, or `null`
  when it should show the "not tailored" marker (i.e. `!lc.isLocalized` OR empty `avgSalary`).
- `displayEducation(lc): string | null` — same for `educationPath`.
- `showsSalaryProgression(country: string | null | undefined): boolean` — `true` only for
  no-country / `"Norway"`; `false` for any other launched country (the progression is NOK/Norway-only).

### 3. Apply phase 1
- **Dashboard career snapshot** (`src/app/(dashboard)/dashboard/page.tsx`, the goal-career salary stat):
  localize `goalCareer` via the hook; render `displaySalary(...)` or the not-tailored marker.
- **My Journey Discover tab** (`src/app/(dashboard)/my-journey/page.tsx`): localize the active `career`
  for the salary StatCard + the `educationPath` paragraph; render via `displaySalary`/`displayEducation`
  or the marker.
- **Salary progression** (`src/components/journey/salary-progression.tsx` and its My-Journey call site):
  render only when `showsSalaryProgression(country)`; otherwise hide the block.
- The "not tailored" marker reuses the existing i18n key `careers.notTailored` (already used by the
  cards), so copy stays consistent.

### 4. Tests
- `display.test.ts`: `displaySalary`/`displayEducation` (localized→value, localized-empty→null,
  not-localized→null) + `showsSalaryProgression` (null/Norway→true, Spain→false).
- `use-localized-career.test.tsx`: mock `next-auth/react` `useSession` with a Spain profile → assert
  `useLocalizedCareer` returns a suppressed/`isLocalized:false` view for a non-overridden career, and an
  unchanged view for Norway.

## Decisions (autonomous — audit these)

1. **Centralized hook, not data-layer localization** (Approach 1). Smallest blast radius; the long tail
   becomes one-line follow-ups. (API/server-side localization deferred.)
2. **Suppress, don't fake.** Where there's no localized value, show the "not tailored for your country
   yet" marker — never a NOK figure to a non-NO user, never an invented local figure.
3. **NOK salary progression hidden for non-NO users** rather than shown with a "Norway" label — showing
   Norwegian pay bands to a Spanish student is misleading even when labelled.
4. **Phase 1 = dashboard snapshot + My Journey Discover + progression.** Deferred to a documented
   phase-2 (same hook): Career Radar, career-insights, compare/share/export, `career-card`(v1/v2),
   `career-score-card`, the explorer demos, and server-side localization in
   `/api/discover/recommendations` + `/api/reports/my-journey`.
5. **No DB migration, no new data, no fabricated figures** — purely client hooks + pure helpers +
   wiring at three surfaces.

## Out of scope / non-goals

- Sourcing any per-country salary/education data (owner work).
- Localizing filtering/sorting/matching (those intentionally keep raw NOK/English for consistency).
- The phase-2 surfaces above (separate PR).

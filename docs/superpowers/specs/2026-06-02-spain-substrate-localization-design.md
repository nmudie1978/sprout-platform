# Spain substrate + supported-careers localization — Design

**Date:** 2026-06-02
**Status:** Approved (brainstorming) — pending spec review
**Author:** Claude (with owner)

## Problem

Endeavrly is positioned as multi-country (signup captures one of 7 countries) but is effectively **Norway-only underneath**: salaries in NOK, `utdanning.no`/SSB sources, Norwegian education paths, and Norwegian emergency/crisis numbers. A Spanish (or Italian/Serbian/etc.) teen silently gets Norwegian content — including **safety-critical** crisis info via `getCountryContext()`'s silent fallback to Norway. Capturing a country ≠ tailoring to it, and the gap is invisible to the user, which erodes trust.

There are **no "careers in Norwegian"** either — Norwegian users see the same English career catalog; only UI chrome is translated.

This effort delivers two things (recommendation points 1 & 2):
1. **Country-driven substrate + honesty:** stop the silent-Norway fallback and only offer countries we actually support.
2. **A Spanish "supported careers" set** (~30) that is fully localized (Spanish text + EUR salaries + Spanish education paths), with the rest of the catalog kept visible but honestly marked and de-Norway-ified for Spanish users.

## Goals

- A Spanish teen never silently sees Norwegian salaries, education sources, or crisis numbers.
- ~30 careers are end-to-end real in Spanish (text + verified EUR salary + Spanish programmes).
- The change is additive and low-risk: the `Career` type and the 638-entry catalog are untouched.

## Non-goals (explicit follow-ups, NOT in this effort)

- Translating all 638 careers.
- De-Norway-ifying the Insights pages, legal/safety docs, and the ~4,000 hard-coded `kr` strings globally.
- Localizing any country beyond Spain (Italy/Serbia/Sweden/Denmark/Finland stay roadmap-only).
- Any DB migration.

## Key facts (verified in code)

- Explore Careers reads `CAREER_PATHWAYS` from `src/lib/career-pathways.ts` (~638 careers). `Career` fields are read **directly** (`career.title`, `.description`, `.avgSalary`, `.educationPath`, `.keySkills`, `.dailyTasks`) in `career-card-v2.tsx` and `career-detail-sheet.tsx` — only two render points.
- `avgSalary` and `educationPath` are hard-coded Norwegian **strings** per career (e.g. `"700,000 - 1,400,000 kr/year"`). So "Spanish careers" is per-career **data curation**, not just word-translation.
- `getCountryContext(country)` (`src/lib/country-context/index.ts`) silently returns `norwayContext` for any country not in `{Norway, Spain}` — including the **crisis line**. `CountryContext` = `{ code, name, currency, language, crisisLine, condensedAiContext() }`.
- The signup country picker (`src/app/auth/signup/page.tsx`) lists all 7 `SUPPORTED_COUNTRIES` and promises "the right education routes and pathways for your country" — undelivered for 5 of them.
- The user's country is available client-side as `session.user.youthProfile?.country` (auth.ts session callback). The careers page already uses `useSession()`.
- 11 careerIds already have Spanish programme data in `src/lib/education/data/es-supplement.json`: doctor, lawyer, psychologist, primary-teacher, dentist, nurse, physiotherapist, software-developer, architect, electrician, plumber.

## Design

### Component A — Launched-countries gate (point 1)

1. **`LAUNCHED_COUNTRIES`** — new single source of truth in `src/lib/countries.ts`: `["Norway", "Spain"]`. `SUPPORTED_COUNTRIES` (7) stays as the roadmap list. The signup/profile country picker renders **only `LAUNCHED_COUNTRIES`**.
2. **`internationalContext`** — new neutral `CountryContext` (`country-context/international.ts`): no NOK; `crisisLine` = a generic, safe message (e.g. "Call your local emergency number (112 in the EU) or a local helpline"); generic education language; neutral `condensedAiContext()`.
3. **Harden `getCountryContext`**: resolve exact launched match → else `internationalContext`. **Never silently Norway.** Norway remains the home default only for the genuine no-country/default path (`normaliseCountry` → Norway). This fixes wrong-country crisis info for any legacy `IT/RS/SE/DK/FI` profiles.

### Component B — Career localization layer (point 2, Approach A)

New module `src/lib/career-localization/`:

- **`types.ts`** — `CareerLocalizationEntry` = partial, citation-bearing overrides:
  ```ts
  interface Cited<T> { value: T; source: string }            // source = URL/citation; omitted field = not verified
  interface CareerLocalizationEntry {
    description?: string;
    dailyTasks?: string[];
    keySkills?: string[];
    salary?: Cited<string>;          // EUR range, verified
    educationPath?: Cited<string>;   // Spanish system, verified
  }
  interface LocalizedCareerView extends Career { isLocalized: boolean }
  ```
- **`es.ts`** — `Record<careerId, CareerLocalizationEntry>` for the ~30 set. Any field we cannot verify is **omitted** (English/suppressed wins) — nothing is invented. Salary/path carry a `source` citation.
- **`index.ts`** — `localizeCareer(career: Career, country?: string): LocalizedCareerView`. Pure + total (never throws):
  - **country = Spain, career in ES set:** apply overrides, per-field English fallback; EUR salary + Spanish path; `isLocalized: true`.
  - **country = Spain, career NOT in set:** keep universal `title/description/keySkills` (English); **suppress** `avgSalary` and `educationPath` (set to `""`/undefined so rows don't render); `isLocalized: false`.
  - **country = Norway / default / undefined / logged-out:** return `career` unchanged + `isLocalized: true` (today's behavior; no marker).

### The ~30 career set

The 11 with existing programme data + ~19 common Spanish youth paths, each mapped to a real `careerId` in `CAREER_PATHWAYS` during planning, e.g.: chef, hairdresser, car-mechanic, accountant, marketing-specialist, childcare-worker, police-officer, journalist, graphic-designer, civil-engineer, pharmacist, veterinarian, social-worker, real-estate-agent, personal-trainer, paramedic, web-developer, hotel-manager, chef-de-partie (final list confirmed in the plan). For each: Spanish text + **verified** EUR salary (cited) + Spanish education path (cited) + programmes added to `es-supplement.json`. **Unverifiable salary/programme figures are held back, not guessed.**

### Data flow

`careers/page.tsx`: `const country = session?.user?.youthProfile?.country` → pass `country` to `CareerCardV2` and `CareerDetailSheet` → each calls `localizeCareer(career, country)` and renders the view + marker. Two render points change; catalog + `Career` type untouched.

### Honesty UX

- Spain only, non-localized careers: a quiet **"Not yet tailored to Spain"** badge (muted, theme tokens, calm — DS-aligned), and the salary + education-path rows simply don't render (no NOK leakage). No scary page-level banner.
- New i18n keys (`careers.notLocalizedForCountry` etc.) in `en-GB.json`, `nb-NO.json`, `es.json`.

### Error handling & back-compat

- `localizeCareer` and `getCountryContext` are pure/total with English-or-neutral fallback; never throw. Logged-out/no-country → unchanged catalog.
- No DB migration. Legacy non-launched profiles keep their stored country but resolve to `internationalContext` (safe), and see Spain-style suppression only if their country is literally "Spain".

### Testing

Pure-function unit tests (vitest):
- `localizeCareer`: localized override + per-field fallback; non-localized-Spain suppression (`avgSalary`/`educationPath` blanked, `isLocalized=false`); Norway/default passthrough; logged-out passthrough.
- `getCountryContext`: Spain→spain, Norway→norway, unknown/legacy→international (asserts **never Norway** for unknown), null→default.
- `LAUNCHED_COUNTRIES` ⊂ `SUPPORTED_COUNTRIES`; picker renders only launched (component or pure-list assertion).
- `es.ts` integrity: every keyed `careerId` exists in `CAREER_PATHWAYS`; every `salary`/`educationPath` override has a non-empty `source`.

No e2e required.

## Rollout / verification

- Ship behind no flag (additive; Norway behavior identical). Verify the **v0-youth-platform** Vercel production build is green post-merge (it regenerates Prisma — the only place enum/schema drift surfaces).
- **This effort stops at an open PR for owner review** (the Spanish salary/programme data must be reviewed before it ships, per the data-sourcing decision). Do not auto-merge/deploy unattended.

## Open items for the owner (async)

1. Final ~19-career list (I'll propose concrete `careerId`s in the plan).
2. Confirm the `internationalContext` crisis wording.
3. Review/approve the cited Spanish salary + programme data before merge.

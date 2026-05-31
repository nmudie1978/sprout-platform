# Spain Localization (Pilot) — Implementation Plan

> **For agentic workers:** This is a phased, multi-subsystem plan. Each phase ships independently and is individually testable. Steps use checkbox (`- [ ]`) syntax. Use `superpowers:executing-plans` or `subagent-driven-development` to implement phase-by-phase. **Line numbers in this doc are indicative** (the repo moves under a parallel agent) — locate by symbol/function name, not line.

**Goal:** Make Endeavrly usable and accurate for a young person in **Spain** — Spanish UI language, Spain-default AI guidance, Spanish education routes, and EUR salaries — without breaking the live Norwegian product.

**Architecture:** Country is already captured at signup (`YouthProfile.country`, PR #24) but never read. We thread it through as a first-class personalization key. We **reuse the existing (currently unwired) `Route`/`Stage` model** (`src/lib/education/route-types.ts`) with `countryCode: "ES"` for Spanish pathways — so the pilot needs **single-country** routes only, not the full cross-country data-model reshape (deferred). Norway stays the default; Spain is opt-in by the user's stored country.

**Tech Stack:** Next.js 14 (App Router), next-intl (locales via cookie `NEXT_LOCALE`), Prisma/Postgres, TypeScript strict. AI prompts in `src/lib/ai-guardrails.ts` (Advisor) and `src/lib/career-twin/prompt.ts` (Twin).

**Scope discipline:** Pilot ONE country (Spain) end-to-end. Do NOT start Italy/Serbia. Within Spain, pilot a **small set of ~10 careers** end-to-end before bulk data entry — prove the pipeline, then scale data.

---

## Key facts established by codebase review

- **i18n:** `src/i18n/config.ts` → `locales = ["en-GB","nb-NO"]`, default `en-GB`; `src/i18n/request.ts` loads `/messages/{locale}.json`; switch via `PATCH /api/locale` (validates allowlist, persists `UserPreferences.preferredLocale`). UI toggle `src/components/language-toggle.tsx` is a **binary** en-GB↔nb-NO toggle (`src/hooks/use-locale-switch.ts`).
- **Country is stored, never read:** `grep "profile.country"` → 0 hits. `YouthProfile.country` defaults `"Norway"`.
- **Existing route model (unwired):** `src/lib/education/route-types.ts` defines `Route { countryCode: string|null, stages: Stage[] }` and `Stage { kind, programmeIds[], ... }`. `routes.json` has ~5 demo routes. Comment says "nothing here is wired into the user-facing app yet." (See memory: `project_roadmap_alternatives`.)
- **Programmes** (`src/lib/education/index.ts`): `Programme` → `Institution.country` typed `NordicCountry = 'NO'|'SE'|'DK'|'FI'|'IS'`. `getProgrammesForCareer(careerId, {country})` already supports a country filter — but the UI calls it without one.
- **AI is Norway-default:** `src/lib/ai-guardrails.ts` injects `getCondensedNorwegianContext()` (from `src/lib/norwegian-context.ts`) and has a "GEOGRAPHY: default to Norway" rule. Career Twin prompt already conditionally injects `profile.country`/`preferredLanguage` but hardcodes "reply only in English".
- **Salary:** `src/lib/salary-progression.ts` is NOK, `NATIONAL_MEDIAN_K = 570`; `ssb-salary-mapping.ts` maps to Statistics Norway codes.
- **Norway-specific modules:** `norwegian-context.ts`, `compliance.ts` (jobs-only — and jobs is deprecated, so SKIP), `application-deadlines.ts`, `career-employers.ts`, `education/school-domains.ts`.

---

## Phase 0 — Decisions to lock before coding

- [ ] **Confirm pilot career set (~10).** Pick high-interest, structurally-varied careers so the data model is stress-tested: e.g. Doctor (long university + MIR), Nurse, Software Developer, Electrician (FP/dual vocational), Chef, Teacher, Psychologist, Graphic Designer, Plumber, Police Officer. Record the list in `src/lib/education/data/es/PILOT_CAREERS.md`.
- [ ] **Confirm Spanish education taxonomy** to model: ESO → Bachillerato → Universidad (Grado→Máster); ESO → FP Grado Medio → FP Grado Superior → (Universidad | work); plus regulated-profession exams (e.g. MIR for doctors). This is the structure `Route`/`Stage` must express for ES.
- [ ] **Confirm `es` default behaviour:** a user with `country = "Spain"` should default to the `es` locale on first load (but still be able to switch). Agreed: yes.
- [ ] **Out of scope for pilot (write down):** cross-country stages (a route spanning ES+DE), Spanish labour-law/`compliance.ts` (jobs feature is deprecated), Italy/Serbia.

---

## Phase 1 — Spanish UI language (`es` locale)

**Outcome:** Every static UI string renders in Spanish when locale = `es`. Shippable alone; no data needed.

**Files:**
- Modify: `src/i18n/config.ts`
- Modify: `src/app/api/locale/route.ts` (allowlist)
- Create: `messages/es.json`
- Modify: `src/components/language-toggle.tsx`, `src/hooks/use-locale-switch.ts`

- [ ] **Step 1: Add `es` to the locale config.**
```ts
// src/i18n/config.ts
export const locales = ["en-GB", "nb-NO", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en-GB";
```
- [ ] **Step 2: Allow `es` in the locale API.** In `src/app/api/locale/route.ts`, ensure the validation allowlist is derived from `locales` (import from config) rather than a hardcoded `["en-GB","nb-NO"]`. If hardcoded, replace with `locales.includes(locale)`.
- [ ] **Step 3: Create `messages/es.json`** by copying `messages/en-GB.json` (same keys, 398+ lines) and translating values to Spanish (es-ES). Keep keys identical. This needs a Spanish translator/native review — machine translation as a first pass is acceptable but flag for review. Verify key parity:
```bash
node -e "const a=require('./messages/en-GB.json'),b=require('./messages/es.json');const ka=new Set(Object.keys(JSON.stringify(a).match(/\"[^\"]+\":/g)||[]));const flat=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'&&v?flat(v,p+k+'.'):[p+k]);const A=new Set(flat(a)),B=new Set(flat(b));console.log('missing in es:',[...A].filter(x=>!B.has(x)));console.log('extra in es:',[...B].filter(x=>!A.has(x)))"
```
Expected: both arrays empty.
- [ ] **Step 4: Make the language switcher 3-way.** Refactor `use-locale-switch.ts` from a binary `toggleLocale()` to `setLocale(locale: Locale)`; refactor `language-toggle.tsx` to a dropdown listing all `locales` (🇬🇧 English, 🇳🇴 Norsk, 🇪🇸 Español). Keep calling `PATCH /api/locale`.
- [ ] **Step 5: Verify.** Run the app, set locale to `es` (toggle or `document.cookie="NEXT_LOCALE=es"`), confirm nav/dashboard/journey render Spanish. `npx tsc --noEmit` clean; `npx vitest run` green.
- [ ] **Step 6: Commit** `feat(i18n): add Spanish (es) locale + 3-way language switcher`.

---

## Phase 2 — Country-aware AI (Advisor + Career Twin)

**Outcome:** When the user's country is Spain, the AI defaults to Spanish context (education system, EUR, Spanish institutions) and replies in Spanish.

**Files:**
- Create: `src/lib/country-context/index.ts` (registry), `src/lib/country-context/spain.ts`
- Modify: `src/lib/norwegian-context.ts` (move behind the registry, or keep + register)
- Modify: `src/lib/ai-guardrails.ts` (parameterize by country/locale)
- Modify: `src/lib/career-twin/prompt.ts` (language + country)

- [ ] **Step 1: Define a country-context interface.**
```ts
// src/lib/country-context/index.ts
export interface CountryContext {
  code: string;            // "NO" | "ES"
  name: string;            // "Norway" | "Spain"
  currency: string;        // "NOK" | "EUR"
  language: string;        // "Norwegian" | "Spanish"
  /** Condensed system-prompt block: education system, job market, pay norms, key sites. */
  condensedAiContext(): string;
}
import { norwayContext } from "./norway";
import { spainContext } from "./spain";
const REGISTRY: Record<string, CountryContext> = { Norway: norwayContext, Spain: spainContext };
export function getCountryContext(country?: string | null): CountryContext {
  return (country && REGISTRY[country]) || norwayContext; // Norway = safe default
}
```
- [ ] **Step 2: Wrap existing Norway context.** Create `src/lib/country-context/norway.ts` exporting `norwayContext` whose `condensedAiContext()` returns the existing `getCondensedNorwegianContext()` output (re-export; do not rewrite the Norwegian data).
- [ ] **Step 3: Author `spain.ts`.** Spanish equivalent of `norwegian-context.ts`: education system (ESO/Bachillerato/FP/Universidad/MIR), job sites (InfoJobs, SEPE), youth pay norms in EUR, key terms. This is research-backed prose, ~150 lines. Source from official .gob.es / educacion.gob.es.
- [ ] **Step 4: Parameterize the Advisor prompt.** In `ai-guardrails.ts`, replace the hardcoded `getCondensedNorwegianContext()` injection and "default to Norway" rule with `getCountryContext(userCountry).condensedAiContext()` and a dynamic geography rule ("Default to {country} ({currency})…"). Thread `userCountry` (and locale) into `getSystemPrompt(...)` from the calling route (`/api/career-advisor`), reading `session.user.youthProfile.country`.
- [ ] **Step 5: Parameterize the Twin prompt.** In `career-twin/prompt.ts`, change the hardcoded "reply only in English" to reply in the user's `preferredLanguage`/locale, and inject `getCountryContext(profile.country)` facts. The Twin route already loads the profile.
- [ ] **Step 6: Tests.** Unit-test `getCountryContext`: `getCountryContext("Spain").currency === "EUR"`; `getCountryContext(null) === norwayContext`; `getCountryContext("Atlantis") === norwayContext`. Create `src/lib/country-context/__tests__/registry.test.ts`.
- [ ] **Step 7: Verify + commit** `feat(ai): country-aware Advisor + Twin context (Spain)`. Manually check: Spanish-country test account → Advisor answers in EUR/Spanish education terms.

---

## Phase 3 — Thread `profile.country` through the app

**Outcome:** The stored country actually drives behaviour: ES users default to `es` locale, and country-scoped data calls pass the country.

**Files:**
- Modify: `src/i18n/request.ts` (or a server util) — default locale from user country on first visit
- Modify: `src/app/api/auth/complete-profile/route.ts` (Vipps path) — persist country if available (currently defaults Norway)
- Modify: programme-consuming surfaces (e.g. `src/components/education-browser/education-browser.tsx`) to pass `{ country }`
- Create: `src/lib/country.ts` — `countryToCode("Spain") => "ES"` mapping (reuse `SUPPORTED_COUNTRIES`)

- [ ] **Step 1: Country→ISO code helper.** Add `countryToCode(name)` to `src/lib/countries.ts` (or new `country.ts`) mapping names to `NO/ES/IT/RS/SE/DK/FI`.
- [ ] **Step 2: Default locale for Spain users.** When a logged-in user has `country = "Spain"` and no explicit `NEXT_LOCALE` cookie and no `preferredLocale`, resolve locale to `es` in `src/i18n/request.ts`. Keep the cookie authoritative once set (user can override).
- [ ] **Step 3: Pass country to programme queries.** In `education-browser.tsx` (and any other `getProgrammesForCareer(id)` caller that should be country-scoped), read the user's country code and pass `getProgrammesForCareer(id, { country: code })`. Default (no/unknown country) keeps current all-Nordic behaviour.
- [ ] **Step 4: Test** `countryToCode`: `countryToCode("Spain")==="ES"`, `countryToCode("Norway")==="NO"`, `countryToCode(undefined)===null`. `src/lib/__tests__/country.test.ts`.
- [ ] **Step 5: Verify + commit** `feat(country): thread profile.country into locale + programme filtering`.

---

## Phase 4 — Spanish education routes & programmes (the core data build)

**Outcome:** For the pilot careers, a Spanish user sees Spanish education routes (ESO→Bachillerato→Grado, or FP tracks) and real Spanish institutions/programmes. **This is the dominant cost and is data work, not just code.**

**Architectural decision:** Use the existing `Route`/`Stage` model with `countryCode: "ES"`. Extend `NordicCountry` → a broader `CountryCode` that includes `"ES"` (rename the type; it's not really Nordic-only anymore).

**Files:**
- Modify: `src/lib/education/index.ts` (widen `NordicCountry` to `CountryCode` incl. `"ES"`; keep alias for compat)
- Modify: `src/lib/education/route-types.ts` (no shape change needed for single-country pilot)
- Create: `src/lib/education/data/es/institutions.json`, `src/lib/education/data/es/programmes.json`, `src/lib/education/data/es/routes.json`
- Modify: route-selection/consuming code to load ES routes when country = Spain (wire the previously-unwired Route model — see `project_roadmap_alternatives`)

- [ ] **Step 1: Widen the country type.** In `education/index.ts`, add `export type CountryCode = NordicCountry | "ES";` (or rename `NordicCountry`→`CountryCode` and `export type NordicCountry = CountryCode` alias to avoid churn). Ensure `Institution.country` accepts `"ES"`.
- [ ] **Step 2: Author Spanish institutions** (`data/es/institutions.json`): ~15–25 real institutions covering the pilot careers — universities (UCM, UB, UAM…), FP centres, with `country: "ES"`, city, url, `applicationVia` (e.g. regional "preinscripción"), and `careerIds`.
- [ ] **Step 3: Author Spanish programmes** (`data/es/programmes.json`): for each pilot career, 2–4 real programmes (Grado en Medicina, FP Grado Superior en…, etc.) with `englishName`, `type`, `duration`, `languageOfInstruction: "Spanish"`, `entryRequirements` (selectividad/EvAU, nota de corte), `careerOutcome`. Reuse the existing `Programme` schema.
- [ ] **Step 4: Author Spanish routes** (`data/es/routes.json`) using `Route`/`Stage`: e.g. Doctor = [Stage: Bachillerato (Ciencias), Stage: Grado en Medicina (6y), Stage: MIR exam + residencia]. Electrician = [Stage: FP Grado Medio Electricidad, Stage: dual apprenticeship, Stage: work]. Set `countryCode: "ES"`.
- [ ] **Step 5: Loader + selection.** Make the education/programme loader country-aware: when country = Spain, read the `data/es/*` files; else current Nordic data. Wire the Route model into the Clarity/roadmap surface for ES (this is the first real consumer of `Route`/`Stage`). Keep Norway on its current generator.
- [ ] **Step 6: Localize roadmap term-matching.** `roadmap-rules.ts` `HIGHER_EDUCATION_RE` hardcodes Norwegian terms (`universitet|høgskole|fagskole|…`). Add Spanish terms (`universidad|grado|máster|formación profesional|FP`) so age/sequence rules apply correctly for ES routes.
- [ ] **Step 7: Tests.** Validate ES data integrity (mirror existing `programme-validation-filter`/`validate-programme-url` tests): every ES programme has a valid institution, country `"ES"`, non-empty url; every pilot career has ≥1 ES route. `src/lib/education/__tests__/es-data.test.ts`.
- [ ] **Step 8: Verify + commit** per career batch (commit after each few careers to keep diffs reviewable): `feat(education): Spanish routes + programmes for <careers>`.

---

## Phase 5 — Salaries in EUR

**Outcome:** Spanish users see salary figures in EUR with a Spanish median for context.

**Files:**
- Modify: `src/lib/salary-progression.ts` (parameterize currency + national median by country)
- Create: `src/lib/career-data/es-salaries.ts` (pilot-career EUR ranges; source INE)
- Modify: salary display component(s) for currency formatting

- [ ] **Step 1: Parameterize salary by country.** Refactor `SALARY_PROGRESSIONS` lookups to accept a country/currency; add `NATIONAL_MEDIAN` per country (Norway: 570k NOK; Spain: research INE median, EUR). Keep Norway exactly as-is.
- [ ] **Step 2: Author ES salary data** for the pilot careers in EUR (INE — Encuesta de Estructura Salarial). Same step shape (junior→senior).
- [ ] **Step 3: Currency formatting.** In the salary chart component, format with the country's currency/locale (`Intl.NumberFormat(locale, { style:"currency", currency })`) instead of a hardcoded "NOK"/"kr".
- [ ] **Step 4: Test** the formatter + that `getSalaryProgression(career, "ES")` returns EUR and the Norwegian path is unchanged. `npx vitest run`.
- [ ] **Step 5: Verify + commit** `feat(salary): EUR salaries + Spanish median for pilot careers`.

---

## Phase 6 — Lower-priority Norway-specific surfaces (defer/triage)

These only matter once the core is proven. Triage:
- **`application-deadlines.ts`** (Samordna opptak, Lånekassen) — create Spanish equivalents (preinscripción universitaria, becas MEC) only if the deadline-awareness UI is shown to ES users. Otherwise hide for non-Norway.
- **`career-employers.ts`** ("Top employers") — add Spanish employers per pilot career, or hide the section when country ≠ Norway.
- **`education/school-domains.ts`** (teacher signup gating) — add Spanish school domains only if teacher signup is offered in Spain.
- **`compliance.ts`** — **SKIP.** It's job-posting validation for the deprecated jobs marketplace (see CLAUDE.md `<removed_features_strict>`). Do not port.

- [ ] For each: either localize behind `getCountryContext`/country branch, or gate the UI to Norway-only. Decide per surface; commit individually.

---

## Deferred (NOT in this plan) — true cross-country data model

The current `Route.countryCode` is a single country and `Stage` has no country field, so a path that **spans** countries (school in ES, university in DE) can't be expressed. The Spain pilot does **not** need this (Spain-only routes). When a second country (Italy/Serbia) or genuine study-abroad paths are required, reshape: add `Stage.countryCode` and allow `Route` to reference stages across countries. See memory `project_pathway_data_model`. Track as a separate spec.

---

## Suggested sequencing & shippability

1. **Phase 1 (language)** — ship first; visible, low risk, no data.
2. **Phases 2 + 3 (country-aware AI + plumbing)** — high value, moderate; makes Spain "feel" localized even before full route data, because the AI is genuinely country-accurate.
3. **Phase 4 (routes/programmes)** — the big one; pilot ~10 careers, commit in batches.
4. **Phase 5 (salaries)** — alongside/after Phase 4.
5. **Phase 6** — triage last.

Each phase is its own PR. Phases 1–3 are mostly code (days). Phase 4–5 are mostly **research + data entry** (the real cost; needs a Spanish-education-literate contributor) and benefit from a native-Spanish reviewer.

---

## Self-review notes
- Spec coverage: language ✓ (P1), AI ✓ (P2), country plumbing ✓ (P3), education routes + data-model reuse ✓ (P4), salary/EUR ✓ (P5), Norway-specific triage ✓ (P6), cross-country gap acknowledged ✓ (Deferred).
- No destructive prod migrations in this plan. Widening `NordicCountry`→`CountryCode` is a type change, not a DB migration (programmes/institutions are JSON, not DB tables). The only DB field involved (`YouthProfile.country`) already exists.
- Norway behaviour is the default everywhere (`getCountryContext` falls back to Norway), so the live product is unaffected until a user's country is Spain.

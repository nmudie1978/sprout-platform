# Sweden & Denmark localization — launch foundation

**Date:** 2026-06-16
**Status:** Foundation shipped. Data-population is the follow-on (see below).

Adds Sweden and Denmark to the platform, reusing the existing per-country
framework (Norway + Spain precedent). Built safe-by-construction: correct
crisis numbers, English stays the default for everyone else, and the career
layer **suppresses salary/education** (shows a "not yet tailored" marker)
rather than ever displaying Norwegian NOK figures or Norwegian study routes.

## What landed (this PR)

Maps to the agreed step list (1–6, 8, 9; step 7 legal is owner/counsel work):

1–2. **Country context + school grading** — `src/lib/country-context/sweden.ts`,
   `denmark.ts`, registered in `index.ts`. Each carries `code`, `currency`
   (SEK / DKK), `language`, the **crisis line** (SE: 112 + Mind Självmordslinjen
   90101; DK: 112 + Livslinien 70 201 201), and a condensed education + grading +
   job-market + pay block injected into the AI prompt (SE: gymnasium A–F,
   meritvärde, Högskoleprovet, högskola/YH, CSN, kollektivavtal; DK: 7-trins-skala,
   STX/HHX/HTX/HF + EUD, universitet/professionshøjskole, optagelse.dk kvote 1/2,
   SU, overenskomst).

5. **Career localization layer (wired, graceful)** —
   `src/lib/career-localization/sv.ts`, `da.ts`, registered in `index.ts`.
   Currently EMPTY maps by design → every SE/DK career renders
   `isLocalized: false` (universal title/skills shown; NOK salary + Norwegian
   education path SUPPRESSED). No wrong figures are ever shown.

6. **UI translations** — `messages/sv.json`, `messages/da.json` (full,
   key-parity with en-GB). Locales `sv`/`da` registered in `src/i18n/config.ts`
   (+ flags). `defaultLocaleForCountry`: Sweden→`sv`, Denmark→`da` (Norway still
   en-GB). AI reply language extended (`localeToLanguage`): `sv`→Swedish,
   `da`→Danish — consistent with Spain.

9. **Sign-up gate** — `LAUNCHED_COUNTRIES` now includes Sweden + Denmark, so they
   appear in the signup/profile country picker. Safe because crisis context is
   correct and the career layer degrades gracefully.

Tests updated/added: `countries.test.ts`, `country-context/registry.test.ts`,
`ai-guardrails.test.ts`. Verified end-to-end on a dev server (signup + landing
render; `sv`/`da` locales render Swedish/Danish).

## Follow-on data work (NOT in this PR)

These degrade gracefully today; populating them is ongoing, citation-required
data work — intentionally not faked:

- **Step 5 data** — per-career VERIFIED salary (SEK from SCB; DKK from Danmarks
  Statistik) + Swedish/Danish education paths, added to `sv.ts`/`da.ts` keyed by
  `career.id`, each with a real `source` (see `es.ts` for the shape).
- **Step 4** — country employer/realism lists (currently fall back to
  sector/international).
- **Step 3** — country-specific universities, programmes, and Youth Events.
- **Step 8** — localised insights pool + Swedish/Danish RSS ingest sources
  (respecting the ≤12-month recency rule). The ingest plumbing exists; the
  source list needs curated SE/DK feeds.
- **Step 7 (owner/legal)** — privacy/lawful-basis review per country; confirm the
  15–30 floor vs each country's digital-consent age (DK/SE = 13); DPIA touch-up.

## Notes
- AI chat output language now follows the user's UI locale (sv/da → Swedish/
  Danish), matching the existing Spanish behaviour.
- Translation quality is AI-generated (Sonnet) and should get a native review
  before heavy marketing in-region.

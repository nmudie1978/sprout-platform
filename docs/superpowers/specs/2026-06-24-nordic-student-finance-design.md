# Nordic student finance — country-aware funding

**Date:** 2026-06-24
**Surface:** My Journey → Understand → Education Pathway → Funding & Scholarships.

## Problem
The funding section was Norway-only: every entry was `country: "NO"` (Lånekassen)
and `getFundingForCareer` didn't filter by country — so Swedish/Danish/Finnish/
Icelandic users saw Norway's Lånekassen instead of their own national scheme.

## Fix
1. **Add the four missing Nordic national schemes** to `UNIVERSAL_FUNDING`:
   - **SE — CSN** (Centrala studiestödsnämnden): Studiemedel (grant+loan),
     Studiebidrag (gymnasium), Studying Abroad.
   - **DK — SU** (Statens Uddannelsesstøtte): SU grant+loan, Ungdomsuddannelse,
     Studying Abroad.
   - **FI — Kela** (opintotuki): study grant + state-guaranteed loan, Abroad.
   - **IS — Menntasjóður námsmanna**: needs-based loan + 30% completion grant,
     Abroad.
2. **Country-aware lookup:** `getFundingForCareer(careerId, country = "NO")`
   filters both universal funding and career-specific scholarships to the
   viewer's country. Countries with no curated funding (e.g. ES) return empty
   lists, so the section hides itself rather than showing the wrong scheme.
3. **Thread country through the UI:** `FundingSection` gains a `country` prop,
   passed `educationCountry` from the My Journey page.

## Data conventions
Approximate amounts in each country's currency (matches the existing "~" style
of the Norway entries), official agency URLs, `country` as ISO-2. Not a live
API pull — same hand-curated static pattern as before.

## Out of scope / deferred
- Live API integration with each agency.
- Non-Nordic funding (ES and other selectable countries) — they correctly show
  nothing until curated.
- Career-specific scholarships for non-NO countries (none added yet; the NO
  ones are now correctly hidden from non-NO users).

## Tests
`funding.test.ts`: per-country filtering (NO→Lånekassen, SE→CSN, DK→SU,
FI→Kela, IS→Menntasjóður), ES→empty, career-specific filtered by country,
default-NO backwards-compat, and data-integrity (required fields, ISO-2
country, https URL, all five Nordics covered).

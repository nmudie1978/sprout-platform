# Country Packs — Sweden to Norwegian Parity

**Date:** 2026-09-06
**Target:** launch Norway + Sweden at comparable coverage by 30 September 2026
**Status:** design approved (approach B); §2–§7 written without live review — flagged items need sign-off

---

## 1. Goal and scope

Bring Sweden to coverage comparable with Norway so both countries can be
launched and marketed on 30 September 2026. Denmark and Spain stay live in
`LAUNCHED_COUNTRIES` at their current thin coverage; launch messaging does not
claim them. Finland and the UK are out of scope for this cycle.

### The gap being closed

| Surface | Norway today | Sweden today | Target |
|---|---|---|---|
| Career records (salary + education path) | 1,615 native | 52 | 1,615 |
| Verified salary provenance | 900 (SSB) | 0 | ≥900 (SCB) |
| Programmes | 162 | 19 | ~160 |
| Local universities (discipline buckets) | 89 | 0 | ~89 |
| Grade scale in matching | 1–6, integrated | none | meritvärde + Högskoleprovet |
| Funding | Lånekassen | 0 | CSN |
| Legal jurisdiction | complete | none | Swedish terms/privacy |
| Employers | ~520 | 0 | **out of scope — see below** |

### Explicit non-goals

- **Swedish employers.** ~520 hand-curated company records with no official
  source to generate from — the most expensive item on the list and the least
  automatable. `journey-companies-tray.tsx` already suppresses the tab for
  non-Norway users, so Sweden degrades cleanly without it. **Needs
  confirmation.**
- **Insights and events for Sweden.** Per-country scraping infrastructure.
- **Live job feed for Sweden** (Platsbanken/Arbetsförmedlingen). NAV stays
  Norway-only.
- **Migrating Norway into a pack.** 1,615 records of churn for no user-visible
  September gain. Deferred to the database follow-on.
- **Deadlines.** `application-deadlines.ts` and `deadline-awareness.tsx` are
  currently unreferenced dead code. Left as-is.

### Provenance bar

Two tiers, enforced by the type system and a build gate:

- **verified** — anchored to an official source with a resolving URL. Salary
  from SCB via the SSYK crosswalk.
- **estimated** — generated against official sources, validated by rule, and
  labelled "estimated" in the UI. Education paths and remaining figures.

Unverified guidance is never presented as fact. This reuses the existing
`estimated` flag on `salary-progression.ts` and the staleness disclaimer in
`career-data-recency.ts`.

---

## 2. Pack schema and registry

### Layout

```
src/lib/country-packs/
  types.ts       CountryPack, PackCareer, Provenanced<T>, GradeScale
  index.ts       registry: getPack(country) → CountryPack | null
  scales.ts      per-country grade scale adapters
  se/
    careers.generated.json      SCB salary pipeline + education-path generation
    programmes.generated.json   antagning.se / UHR sync
    institutions.json           ~40 Swedish universities, hand-listed once
    funding.json                CSN
    meta.json                   sources, generatedAt, coverage counts
  es/, da/                      migrated from existing override tables
```

Norway stays native in `career-pathways.ts`.

### The record

`PackCareer` carries only what varies by country. Title, description, skills,
daily tasks and radar tags stay universal in the catalog — which is already how
`localizeCareer()` treats them.

```ts
interface Provenanced<T> {
  value: T;
  tier: "verified" | "estimated";
  source: string;       // required; must resolve for tier "verified"
  verifiedAt?: string;  // ISO date
}

interface PackCareer {
  careerId: string;
  salary?: Provenanced<SalaryFigure>;
  educationPath?: Provenanced<string>;
  entryRoute?: EntryRoute;
  gradeBand?: PackGradeBand;
  programmeIds?: string[];
}

interface SalaryFigure {
  min: number;
  max: number;
  currency: "NOK" | "SEK" | "DKK" | "EUR" | "GBP";
  period: "month" | "year";   // Sweden quotes månadslön; Norway quotes annual
}
```

`Provenanced<T>` generalises the existing `Cited<T>`, which required a source
and had no tier concept. A one-line migration makes every current `Cited` field
`tier: "verified"` — nothing regresses.

`SalaryFigure` replaces the current freeform `avgSalary` string
(`"550,000 - 850,000 kr/year"`) for pack countries. Norway keeps its strings
until the follow-on migration; the display helper handles both.

### The contract that must not change

`localizeCareer(career, country)` keeps its exact signature and suppression
semantics, reading the pack instead of the hardcoded `LOCALIZATION` table.
Consumers need no edits:

- `src/app/(dashboard)/careers/page.tsx`
- `src/app/(dashboard)/my-journey/page.tsx`
- `src/components/careers/career-shelf.tsx`
- `src/components/careers/top-matches-section.tsx`

`es.ts`, `sv.ts` and `da.ts` are converted to packs by a one-time script so the
~130 records already curated carry over.

### Validation

`scripts/validate-country-packs.ts`, wired into `npm run build` beside the
existing `validate-programmes.ts`:

1. Every `verified` record has a resolving `https` source.
2. Every `careerId` exists in the catalog.
3. No duplicate ids within a pack.
4. `meta.json` coverage counts match reality.
5. Every `institutionId` referenced by a programme exists in `institutions.json`.

A pack that fails does not ship. This is what makes the accuracy bar a build
gate rather than an intention.

---

## 3. Grade and scoring abstraction

### The problem

The scoring system is hardcoded to the Norwegian VGS 1–6 scale in five places:

| File | Coupling |
|---|---|
| `career-pathways.ts` (`GradeBand`) | `floor`/`ceiling` documented as 1–6 |
| `career-pathways/grade-match.ts` | gap of 1 = "stretch", 2+ = "reach" — integer steps on a 1–6 scale |
| `education/parse-grade-requirement.ts` | rejects anything outside 1–6 |
| `api/profile/route.ts:236-249` | clamps `gradeRange` to 1–6 |
| `components/discovery/discovery-quiz-dialog.tsx` | grade input UI |

Sweden's system is structurally different: gymnasium betygspoäng (A=20, B=17.5,
C=15, D=12.5, E=10, F=0) averaged into a *meritvärde* of 0–20, plus up to 2.5
*meritpoäng* for advanced courses, giving a 0–22.5 range. There is also a
parallel admission route via Högskoleprovet, scaled 0.00–2.00, and programmes
publish *antagningspoäng* per quota group (BI, BII, HP).

> **Verify before implementation.** The betygspoäng values, the 22.5 ceiling and
> the quota group names must be checked against UHR/antagning.se rather than
> taken from this document.

### Design: scale adapters over a normalised axis

```ts
interface GradeScale {
  id: "no-vgs-1-6" | "se-meritvarde" | "se-hogskoleprovet";
  min: number;
  max: number;
  step: number;                      // one "grade up" for coaching hints
  inputLabel: string;                // label for the self-report control
  format(value: number): string;     // 17.5 → "17,5 meritvärde"
  normalize(value: number): number;  // native → 0..1
  denormalize(t: number): number;    // 0..1 → native
}
```

`grade-match.ts` operates on the normalised 0–1 axis. The existing Norwegian
thresholds map exactly: a gap of 1 on a 1–6 scale is 0.2 normalised, a gap of 2
is 0.4. Setting the thresholds at 0.2/0.4 preserves current Norwegian behaviour
bit-for-bit — which the regression tests assert.

`PackGradeBand` stores `floor`/`ceiling` in **native units** plus a `scale` id,
never normalised. Normalisation happens at comparison time. Storing native
avoids lossy round-trips and survives a user changing country.

`gradeRange` on the profile gains an optional `scale` field. Absent means
`no-vgs-1-6`, so existing rows keep working. The clamp in
`api/profile/route.ts` reads bounds from the scale instead of the literal 1–6.

`parse-grade-requirement.ts` becomes scale-aware. Its Norwegian sentence-template
regex stays the default parser; Sweden supplies structured antagningspoäng from
the pack, so no Swedish text parser is needed.

### Vocational vocabulary

The 39 files hardcoding `fagbrev` are the same problem in a different costume.
The *semantics* of the entry routes are shared across the Nordics — vocational
upper-secondary certificate, short tertiary vocational college, long
professional degree — only the names differ.

So `EntryRoute` keeps its stable keys, and each pack supplies
`routeLabels: Record<EntryRoute, string>`:

| `EntryRoute` key | Norway | Sweden |
|---|---|---|
| `fagbrev` | fagbrev | yrkesexamen |
| `fagskole` | fagskole | yrkeshögskola (YH) |
| `profesjonsstudium` | profesjonsstudium | lång yrkesexamen |
| `bachelor` | bachelor | kandidatexamen |
| `master` | master | masterexamen / civilingenjör |

One enum, country-specific display. This closes the "vocational vocabulary" row
without forking the matching logic.

---

## 4. Salary pipeline

Replicate the existing SSB pattern (`scripts/refresh-career-salaries.ts`,
`lib/career-data/ssb-salary-mapping.ts`, `ssb-verified-salaries.ts`) against
Statistics Sweden.

- **Source:** SCB lönestrukturstatistik by SSYK 2012, via SCB's PxWeb API.
- **Crosswalk:** `careerId → SSYK 2012`. STYRK-08 (Norway) and SSYK 2012
  (Sweden) are both ISCO-08 derived, so the existing 900-entry
  `ssb-salary-mapping.ts` transfers via a STYRK→ISCO→SSYK crosswalk rather than
  being rebuilt by hand. Divergences at the 4-digit level need manual review.
- **Output:** `se/careers.generated.json` salary fields, `tier: "verified"`,
  source set to the SCB table URL, `verifiedAt` stamped.
- **Period:** SEK **monthly** — Swedish salaries are quoted as månadslön, as
  `country-context/sweden.ts` already documents. The `SalaryFigure.period`
  field carries this; display must not silently annualise.

**Spike this on day 1.** The SCB API shape and access terms are the largest
unknown in the plan, and every downstream estimate depends on it. Thirty
minutes of verification on day 1 is worth more than a week of assumption.

---

## 5. Education paths and programmes

- **Programmes:** clone `scripts/sync-norway-programmes.ts` as
  `sync-sweden-programmes.ts` against UHR/antagning.se. Target ~160 records,
  matching Norway's 162, carrying antagningspoäng per quota group.
- **Institutions:** ~40 Swedish universities and högskolor, listed once by
  hand into `se/institutions.json`. Finite and stable.
- **Discipline-bucket universities:** populate the `SE` key in
  `education/data/discipline-buckets.json` — 50 buckets × ~2 institutions.
  Currently only `NO` is populated (89 entries); the `SE`, `DK`, `FI`, `IS`
  keys exist in the type with no data.
- **Education path strings** for 1,615 careers: generated, `tier: "estimated"`,
  validated by rule — the named institution must exist in `institutions.json`,
  the programme name must resolve, the URL must return 200. This is the
  **largest accuracy risk in the plan** and needs a sampled human review before
  launch, even though full human review is out of budget.

---

## 6. Legal, crisis and funding

### Crisis fallback — bug, fix immediately

`src/lib/ai-guardrails.ts:458` — `getFallbackResponse(intent)` hardcodes
`**116 111** (Mental Helse helpline in Norway)` with no country parameter.
`getSystemPrompt()` at line 241 correctly resolves
`getCountryContext(country).crisisLine`; the fallback path was missed.

Reachable from 8 call sites in `src/app/api/chat/route.ts` and
`src/app/api/career-twin/experience/route.ts`, and it fires precisely when the
AI is unavailable or guardrails trip — the crisis path. A Swedish or Danish
user in distress currently receives a Norwegian number.

Fix: thread `country` through and resolve from `getCountryContext`. Small,
unambiguous, ships before anything else.

### Legal jurisdiction

`src/app/legal/{terms,privacy,disclaimer,cookies}` hardcode Norwegian law,
Oslo courts, Datatilsynet and "Endeavrly AS, Oslo" as controller. Extract a
`src/lib/legal/jurisdictions.ts` carrying governing law, courts, supervisory
authority, consumer complaint body, controller entity and emergency numbers.

Sweden: Swedish law, IMY (Integritetsskyddsmyndigheten) as supervisory
authority, ARN (Allmänna reklamationsnämnden) as consumer body.

> **External dependency — start day 1.** Swedish legal copy needs counsel
> sign-off, and that lead time is the single most likely cause of a missed
> launch date. It is not engineering-bound.

### Funding

`se/funding.json` — CSN studiemedel (bidrag + lån) as the universal layer,
mirroring Lånekassen's role in `education/funding.ts`. One source, high value,
cheap.

---

## 7. Testing

- **Regression:** Norwegian grade-match behaviour must be bit-for-bit unchanged
  after the scale abstraction. Assert against the existing
  `career-pathways/__tests__` fixtures.
- **Contract:** `localizeCareer()` suppression semantics unchanged — a pack
  country lacking an override still blanks salary and education path and
  returns `isLocalized: false`.
- **Scale adapters:** `normalize`/`denormalize` round-trip within tolerance for
  every scale; out-of-range values clamp rather than throw.
- **Swedish data:** clone `education/__tests__/spain-study-path.test.ts` as
  `sweden-study-path.test.ts` — every SE programme resolves to a Swedish
  institution, valid https URLs, no duplicate ids.
- **Coverage gate:** a test asserts `se/meta.json` coverage meets the launch
  target, so shortfall fails CI rather than being discovered on launch day.

---

## 8. Sequencing — 18 working days

**Week 1 (Sept 7–11) — foundations**
- D1: SCB API spike; engage legal counsel; crisis-fallback fix; pack types + registry
- D2: migrate es/sv/da tables to packs; validation script into build; tests green
- D3–4: grade scale abstraction, SE meritvärde adapter, grade-match normalisation, regression tests
- D5: `se/institutions.json` (~40), `se/funding.json` (CSN), `routeLabels`

**Week 2 (Sept 14–18) — salary**
- D6–7: STYRK→ISCO→SSYK crosswalk; SCB pipeline script
- D8: run pipeline, validate, review sample
- D9–10: antagning.se programme sync → ~160 SE programmes

**Week 3 (Sept 21–25) — education paths**
- D11–13: education path generation for 1,615 careers + rule validation
- D14: SE discipline-bucket universities (~89)
- D15: legal jurisdiction parameterisation (pending counsel)

**Week 4 (Sept 28–30) — hardening**
- D16: UI — grade input in Swedish units, vocational vocabulary from pack
- D17: full QA pass, coverage assertions, link validation
- D18: buffer and launch checks

### Risks

| Risk | Mitigation |
|---|---|
| SCB API shape/access unknown | Spike on D1, before anything depends on it |
| Legal counsel lead time | Engage D1; it is not engineering-bound |
| Education-path generation quality | Rule validation + sampled human review; `estimated` labelling means the failure mode is visible, not silent |
| Scale abstraction regresses Norway | Regression tests written before the refactor |
| 18 days has no slack | Employers already cut; insights/events/jobs cut. Next cut if needed: reduce programme target from ~160 to ~80 highest-traffic careers |

---

## 9. Follow-on (approach C)

Once Sweden is live: move country packs into Postgres via Prisma with an
`/admin` editor, so non-engineers can correct a Swedish salary without a
deploy. The packs are already normalised records, so this is an import rather
than a redesign. Norway migrates into the same shape at that point.

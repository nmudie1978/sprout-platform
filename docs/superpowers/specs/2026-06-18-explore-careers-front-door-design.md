# Explore Careers "Front Door" — Design Spec

Date: 2026-06-18
Branch: `feat/explore-careers-front-door`
Status: Approved for implementation (owner away; build + PR autonomously)

## Problem

The `/careers` ("Explore Careers") page renders all 1,359 careers as a flat,
alphabetical data table. The two columns that would make it feel alive —
**MATCH** and the **"Personalised"** badge — are inert for most users
(match scores only exist once a user has set Career Radar / discovery
preferences). The result *promises* personalisation and *delivers* a
spreadsheet sorted A→Z. For a 15–23 exploration audience this is the least
motivating possible framing.

## Goal

Make the top of the page a calm, finite **"front door"** that adapts to the
user's personalisation state, without removing the table for people who want
to drill and filter. Three composed ideas (owner-selected):

1. **Real personalisation** — surface actual matches; stop implying
   personalisation when there is none.
2. **Curated front door** — a small, finite set of themed shelves.
3. **Serendipity** — a calm "Surprise me" action.

Explicitly **out of scope**: smarter per-row badges (deferred), and anything
that violates platform rules (leaderboards, streaks, view counts, popularity).

## Layout

The front door is a new zone rendered **above the results** in
`src/app/(dashboard)/careers/page.tsx`. It shows **only when the user has not
engaged the table** — i.e. no active filters, no search query, on page 1.
Once they search/filter, it hides and the page is pure table (so the front
door never competes with an active query).

```
[ filter bar ]            (existing, unchanged)
┌─ Front door (new, shown only when no filters/search) ─┐
│  ① Personalisation strip   (matches OR invite)        │
│  ② Themed shelves          (~5 horizontal rows)        │
│  ③ "Surprise me"           (single calm action)        │
└────────────────────────────────────────────────────────┘
[ "Showing X careers" + Personalised badge ]  (existing)
[ Full A–Z table ]                            (existing, unchanged)
```

## ① Personalisation strip

Driven by the **existing** `recommendationMap` (`Map<careerId, score>`) that
the page already builds from `/api/career-insights`.

- **Has matches** (`recommendationMap.size >= 3`): render **"Your top matches"**
  — up to 4 existing `CareerScoreCard`s, sorted by score desc, each opening
  the existing `CareerDetailSheet`. This finally makes MATCH/"Personalised"
  honest and visible.
- **Thin / no matches**: render a single calm invite card —
  *"Answer a few quick questions and we'll rank these by what fits you"* →
  links to `/careers/radar`. No fake "Personalised" claim in this state.

## ② Themed shelves (hybrid: auto-rule ∪ pinned − hidden)

Config-driven, mirroring the existing `PRESET_*` pattern in `career-radar.tsx`.
Each shelf resolves to a finite, capped (≤12) list. Auto-rules use only
**bundle-safe** inputs: required `Career` fields (`growthOutlook`,
`avgSalary`, `educationRoute`, `entryLevel`, `educationPath`) and the
catalog-free resolvers in `src/lib/matching/lookups.ts`
(`workSettingFor`, `peopleIntensityFor`) keyed by the catalog's category index.
**No import of the `career-pathways` god-module into the client bundle.**

Initial shelves:

| id | Title | Auto rule |
|----|-------|-----------|
| `high-growth` | Fast-growing fields 🚀 | `growthOutlook === 'high'` |
| `no-degree` | Big careers, no degree required 🔧 | non-university route (see below) |
| `surprising-salaries` | Surprising salaries 💰 | salary max ≥ 900k **and** non-university |
| `hands-on` | Hands-on & outdoors 🛠️ | `workSettingFor ∈ {hands-on, outdoors}` |
| `helping-people` | Careers that help people 🤝 | `peopleIntensityFor === 'high'` |

"Non-university route" predicate: `educationRoute ∈ {vocational, certification,
on-the-job}` **or** `entryLevel === true` **or** (no explicit route and
`educationPath` matches `/vocational|fagbrev|apprentic|no formal|certificate|on[- ]the[- ]job/i`).

Each shelf carries optional `pinnedIds` (editor adds, lead the list) and
`hiddenIds` (editor removes) — empty by default, ready for curation. A shelf
with fewer than 3 results after building is not rendered.

Shelf cards are compact (emoji, title, one-line salary·growth meta), open the
detail sheet on click, and live in a horizontal scroll-snap row. No "see all"
deep-links in v1 (URL filter plumbing only supports `?category=` today —
noted as a follow-up).

## ③ Surprise me

A single calm button. `pickSurprise(careers, recentIds, rng?)` (pure; `rng`
defaults to `Math.random`, injected in tests) returns a random career not in
the recent set, or null if the catalogue is empty. The front door keeps a
small recent-id list (cap 10) so consecutive presses don't repeat. Result
opens the detail sheet.

## Files

New:
- `src/lib/careers/shelves.ts` — `ShelfDef`, `SHELVES`, `buildShelf()` (pure)
- `src/lib/careers/surprise.ts` — `pickSurprise()` (pure)
- `src/lib/careers/__tests__/shelves.test.ts`
- `src/lib/careers/__tests__/surprise.test.ts`
- `src/components/careers/career-shelf.tsx` — one horizontal shelf row
- `src/components/careers/career-front-door.tsx` — the zone (strip + shelves + surprise)

Changed:
- `src/app/(dashboard)/careers/page.tsx` — render `<CareerFrontDoor>` above the
  results, gated on no active filters/search and page 1.

Reused (no change): `useCareerCatalog`, `recommendationMap`, `CareerScoreCard`,
`CareerDetailSheet`, `setSelectedCareer`, `?open=` deep-link, `localizeCareer`,
`parseSalaryRange`, `workSettingFor`/`peopleIntensityFor`/category index.

No new API routes. No schema change. No payment/jobs/safeguarding surface touched.

## Testing

- `shelves.test.ts`: auto-rule selection per shelf, pin ordering, hide removal,
  cap, and the "<3 → drop" behaviour, against small fixtures.
- `surprise.test.ts`: excludes recent ids, falls back to full pool when all
  excluded, deterministic pick with a stub rng, null on empty.
- Components verified via the existing headless-Chrome dev-page pattern after
  `tsc` + `vitest` + `eslint` are green.

## Platform-rule check

Calm, finite, no gamification; no comparison/popularity metrics; privacy
unchanged (uses data already fetched); no payments; no jobs marketplace;
Journey-aligned (it routes into Discover/Clarity surfaces). ✓

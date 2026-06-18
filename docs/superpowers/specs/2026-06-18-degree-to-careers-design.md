# "Start from your degree" → careers — Design Spec

Date: 2026-06-18
Branch: `feat/degree-to-careers`
Status: Approved to proceed to implementation (owner away 2h; explicitly asked to continue without them). Design decisions below were made by the assistant with sensible defaults and are documented for owner review on return.

## Problem / goal

The platform is forward-only: explore careers → see study paths. Career-changers and graduates (an audience CLAUDE.md explicitly welcomes) often start from the other end: *"I have a degree in X — what can I do with it?"* Add a reverse entry: pick your field of study → see a calm, ranked, capped set of careers associated with it, deep-linking into the existing Discover flow.

## Decisions (owner-selected + assistant defaults)

- **Placement (owner): Career Radar input mode.** Implemented as a **self-contained section on the Radar page** (`/careers/radar`), NOT woven into the complex radar-visualisation component — keeps risk isolated.
- **Input (owner): curated field type-ahead.** User types; suggestions filter a curated list of ~49 fields (with common-degree aliases); selecting yields a `disciplineId`. No fuzzy classifier / no "no-match" dead-end.
- **Data substrate (assistant): reuse PR #429.** `career-discipline-map.json` (careerId → discipline) inverts to discipline → careers. Field labels come from `discipline-buckets.json` `label`s.
- **Ranking (assistant): calm, non-spammy.** Within the chosen field, rank careers by `growthOutlook` (high→medium→stable) then demand, then title; **cap at 12** with a "+N more in Explore" link. Avoids the "you can do anything" dump (CLAUDE.md: no recommendation spam).
- **Scope (assistant, YAGNI):** v1 = single field → ranked careers. No "adjacent fields", no combining with preference sliders, no free-text classifier. (Noted as possible v2.)
- **Safety/privacy:** field-of-study is low-risk; not persisted server-side in v1 (ephemeral UI state). No new PII storage.

## Architecture

```
Radar page  ──renders──>  <DegreeToCareers onOpen={setSelectedCareer} />
                                  │
   user types ──> searchFields(query): FieldOption[]   (field-options.ts: label + aliases)
   selects field ──> disciplineId
                                  │
   getCareersForDiscipline(disciplineId): string[]      (degree-to-careers.ts: inverted map)
                                  │
   useCareerCatalog().getCareerById ──> Career[]
   rankDisciplineCareers(careers).slice(0,12)           (pure)
                                  │
   render compact cards ──click──> onOpen(career) ──> existing CareerDetailSheet on the page
```

## Components / files

- **Create** `src/lib/discover/degree-to-careers.ts` — pure:
  - `getCareersForDiscipline(disciplineId: string): string[]` — inverted index built once from `career-discipline-map.json`.
  - `rankDisciplineCareers(careers: Career[]): Career[]` — growthOutlook → title sort.
- **Create** `src/lib/discover/field-options.ts` — pure:
  - `interface FieldOption { id: string; label: string; aliases: string[] }`
  - `FIELD_OPTIONS: FieldOption[]` — one per used discipline; `label` from discipline-buckets.json, `aliases` curated common-degree synonyms (e.g. medicine → ["medicine","medical","mbbs","md"]; computer-science-software → ["computer science","cs","software","informatics","it"]).
  - `searchFields(query: string): FieldOption[]` — case-insensitive match on label+aliases; empty query → all (alphabetical by label).
- **Create** `src/components/discovery/degree-to-careers.tsx` — `"use client"`:
  - Props: `{ onOpen: (career: Career) => void }`.
  - A calm collapsible entry ("Already studying something? See where it leads") → reveals a type-ahead field input (filters `searchFields`), then on select renders the ranked, capped career cards. Reuses the catalog hook + compact card styling already in the app. "Show all in Explore →" links to `/careers?category=…` or `/careers` when capped.
- **Modify** `src/app/(dashboard)/careers/radar/page.tsx` — render `<DegreeToCareers onOpen={setSelectedCareer} />` near the top of the radar content (above the radar viz), wired to the page's existing `setSelectedCareer` (which already opens `CareerDetailSheet`).

Reuse unchanged: `useCareerCatalog`, `CareerDetailSheet`, `career-discipline-map.json`, `discipline-buckets.json`, `disciplines.ts`.

## Data flow / error handling

- Empty query → show the full field list (alphabetical). No dead-ends.
- Field with few careers → show what exists (no minimum).
- Catalog still loading → show a small loading state (gate on `useCareerCatalog().isLoading`).
- A `disciplineId` with no mapped careers (shouldn't happen — every bucket is used) → empty list + gentle "browse all careers" link.

## Testing

- `degree-to-careers.test.ts`: inversion returns careerIds for a known discipline; empty for unknown; every discipline in the map is invertible; ranking orders high-growth first and is stable.
- `field-options.test.ts`: `searchFields("med")` returns medicine; alias match (e.g. "cs" → computer-science-software); empty query returns all; case-insensitive.
- Component verified via `/dev/degree-to-careers` dev page + headless screenshot (type a field → ranked cards render; click → detail sheet).

## Platform-rule check
Calm, finite (capped 12), no spam, no comparison/popularity metrics, no new PII, Journey-aligned (routes into Discover). Serves the welcomed career-changer audience without disturbing the youth-first core. ✓

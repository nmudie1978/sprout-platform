# Career Depth Snapshot — surface existing day-in-life + pay progression in the detail sheet (Workstream #4, slice 2)

**Date:** 2026-06-04
**Branch:** `feat/career-depth-snapshot`

## Context

Workstream #4 = "make the top 100 careers fully deep." Slice 1 (Real Voices) shipped (PR #133). This
slice makes the **career detail sheet** itself feel deep by surfacing depth that ALREADY exists but is
only shown deeper in the journey:
- **Day-in-the-life** is curated for **396 careers** (`career-typical-days.ts` → `CareerDetails`:
  `typicalDay`, `whatYouActuallyDo`, `whoThisIsGoodFor`, `topSkills`, `entryPaths`, `realityCheck`).
- **Salary progression** entry→mid→senior→lead exists for **~799 careers**
  (`career-progressions.ts` → `CareerProgression.levels[]` = `{level, title, yearsExperience, salaryRange}`).

Both are already returned by `GET /api/career-details/[id]` → `{ career, category, details, progression,
hasDetails }`. The detail sheet currently shows only salary/growth/skills (+ Real Voices from slice 1), so
exploring a career there feels shallow.

## Goal

Show a compact *taste* of the existing depth — a day-in-the-life snapshot + a pay-progression mini-view —
in the career detail sheet, so any explored career feels deep immediately. No new data, no new endpoint,
no migration. The full depth stays in the Understand tab (this is a preview, not a duplicate).

## Architecture

### 1. `src/lib/career-depth/snapshot.ts` (pure, unit-tested)
- `daySnapshot(details: CareerDetails, hasDetails: boolean): { realityCheck: string | null; doing: string[] } | null`
  — returns a snapshot ONLY when `hasDetails` is true (curated). For generated/default content it returns
  `null` (we don't surface generic filler in the premium modal). `doing` = first 3 `whatYouActuallyDo`;
  `realityCheck` = `details.realityCheck ?? null`. Returns `null` if there's nothing meaningful (no
  realityCheck and no `whatYouActuallyDo`).
- `salaryLevels(progression: CareerProgression | null): CareerLevel[]` — returns `progression?.levels ?? []`.

### 2. `src/components/career-depth/career-depth.tsx` (client)
- Fetches `/api/career-details/${career.id}` (the existing endpoint; reuse, no new route).
- Computes `daySnapshot` + `salaryLevels`; renders:
  - **"A day in the life"** (when `daySnapshot` is non-null): the `realityCheck` line + up to 3
    `doing` bullets.
  - **"How your pay grows"** (when `salaryLevels` is non-empty): a compact list of the levels — label
    (Entry/Mid/Senior/Lead) + `salaryRange` (+ `yearsExperience` muted).
  - A subtle caption: *"Full day-in-the-life & roadmap in My Journey"* (no separate CTA — the sheet
    already has a "set as your career goal to explore it properly" nudge above).
- If BOTH are empty → render `null` (nothing).
- Degrades to nothing on fetch error (never blocks the modal). Calm, compact, mobile-first.

### 3. Wire-in (`src/components/career-detail-sheet.tsx`)
- Insert `<CareerDepth career={career} />` in the `p-4 space-y-5` content container, **between the existing
  journey-nudge block and the Actions block**. Resulting order: header (salary/skills) → journey nudge →
  **Career Depth** → Actions → Real Voices.

## Data flow

sheet opens for career X → `<CareerDepth>` fetches `/api/career-details/X` → renders the day + pay
snapshot, or nothing. All failures degrade to nothing.

## Decisions (autonomous — audit these)

1. **Reuse `/api/career-details/[id]`** — it already returns `details` + `progression` + `hasDetails`. No
   new endpoint.
2. **Day-in-life shown only for curated entries (`hasDetails`)** — surfacing the generic AI/default
   template in the premium modal would cheapen it. Progression is shown whenever it exists (it's
   structured + useful even when generated).
3. **A taste, not a duplicate** — compact (realityCheck + 3 bullets; the 4 pay levels). Full content stays
   on the Understand tab; a one-line caption points there. No separate CTA (avoids duplicating the
   existing journey nudge).
4. **Placement between the journey nudge and Actions** — info → "explore this" → what it's really like +
   pay → set-as-goal → real voices.
5. **No migration, no new data, no content fabrication** — purely additive UI over existing data.

## Testing

- Unit: `daySnapshot` (returns null when `!hasDetails`; returns realityCheck + ≤3 bullets when curated;
  null when curated-but-empty) and `salaryLevels` (levels passthrough, null/empty → []).
- Component: `<CareerDepth>` with mocked fetch — renders the pay levels + day snapshot when present;
  renders nothing when the API returns empty/generated-only.

## Out of scope

- The other #4 slices (top-100 ranking, factual-field backfill, regional salary).
- Any change to the Understand tab or the underlying career-details data.

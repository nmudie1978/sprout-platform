# Career Radar — "Show more matches" — Design

**Date:** 2026-06-12
**Status:** Approved (design)
**Component:** `src/components/discovery/career-radar.tsx`

## Problem

The Career Radar fetches up to 50 ranked matches, then `dynamicLimit()`
trims the displayed set to **25 or 50** depending on how spread-out the
results are. The matching engine also interleaves across categories. The
net effect: within any single category (Creative, Tech, …) the user only
ever sees a handful of careers, even though the catalog holds 1000+
careers and dozens per category. Users exploring a focused area feel
artificially capped — "only a handful of creative roles."

Key technical finding: the engine's per-category concentration cap
(`applyDiversity`, `src/lib/matching/engine.ts`) only constrains the
**top band**; beyond `topBandSize` careers are ordered by pure match
score. So the ranked list genuinely contains many more in-category
careers — the radar simply stops drawing them. "Load more" is therefore
achievable by drawing the *list* from a deeper slice than the *radar*.

## Goal

Let users progressively reveal more matched careers without cluttering
the radar, which the codebase deliberately keeps calm. Extra careers
appear as a clean expandable list below the existing Matches Report.

## Non-goals

- No change to the radar visualization or its dot cap (`dynamicLimit`).
- No change to the existing Strong/Good band carousel.
- No new per-category click interaction (that was Approach C, rejected).
- No pagination rewrite of the report (Approach B, rejected).

## Decisions (from brainstorm)

1. **Where extra careers show:** an expandable list below the Matches
   Report. Radar stays capped/calm.
2. **Filter behaviour:** "Show more" **respects active filters**. If a
   preset and/or sector filter is on, revealed careers also match that
   filter. With no filter, it reveals the overall next-best matches.

## Design

### New state & derived data (in `CareerRadar`)

- `const DEEP_LIMIT = 200;` and `const MORE_CHUNK = 12;` (module consts).
- `const [revealed, setRevealed] = useState(0);` — how many extra
  careers are currently shown beyond the radar/report set.
- **Reset rule:** `revealed` resets to `0` whenever `preferences`,
  `presetFilter`, or `sectorFilter` changes (via `useEffect` keyed on
  those three).
- `deepPool` memo:
  `getCareersFromDiscovery(preferences, DEEP_LIMIT)`, memoized on
  `preferences`. Nearly free — the engine scores all careers regardless
  of limit; only the final slice grows.
- `morePool` memo — the ordered list of careers eligible to be revealed:
  1. Start from `deepPool` (already in rank order).
  2. Keep only those matching the active `sectorFilter`
     (reuse `getSectorForCareer`, same rule as `visibleDots`: keep when
     sector matches or is `"mixed"`).
  3. Keep only those matching the active `presetFilter`
     (reuse `matchesPreset`) when a preset is set.
  4. Remove any career whose id is already shown on the
     radar/report — i.e. present in `visibleDots`.
  Result: deduped, filtered, rank-ordered "long tail".
  - Note: when a preset is active, `matched` already injects the preset's
    full curated set, so `morePool` is typically empty and the button
    won't render. This is correct and consistent — no dead button.
- `moreShown` = `morePool.slice(0, revealed)`.
- `moreRemaining` = `morePool.length - revealed`.

### Extracted row helper

The band table currently inlines ~75 lines of `<tr>` JSX (career-radar
lines ~1975–2051). Extract it into a single render helper used by both
the band carousel and the new "More matches" table:

```
function renderMatchRow(career: Career, opts: { topMatch?: boolean }): JSX.Element
```

It depends only on `career`, `opts.topMatch`, and closures already in
scope (`compareShortlist`, the `open-career-detail` dispatch,
`formatSalaryShort`, `GradeStatusBadge`). Both call sites pass the same
markup so row click (opens career sheet) and the **+ Add** compare action
behave identically for revealed extras. `topMatch` is always `false` for
extras.

This is a focused refactor of code we're already touching — it removes
duplication rather than adding it, and shrinks an oversized file.

### New "More matches" section (Matches Report card)

Rendered below the band carousel, inside the same card, only when
`morePool.length > 0`:

- A quiet section label: `More matches` (muted, uppercase micro-label,
  same style as the band sub-header — no card, no color fill).
- A table in the identical style to the band tables, listing
  `moreShown` via `renderMatchRow(career, { topMatch: false })`, wrapped
  in the same `max-h-[200px] overflow-y-auto` scroll container so the
  page stays compact.
- A text-only footer button when `moreRemaining > 0`:
  `Show {Math.min(MORE_CHUNK, moreRemaining)} more matches →`
  Muted foreground, chevron icon, no background fill. `onClick`:
  `setRevealed((r) => r + MORE_CHUNK)`.
- When `revealed > 0 && moreRemaining <= 0`, no button (optionally a
  muted `That's all {morePool.length} more` line — implementer's call,
  keep it quiet).

### Matches Report header count

Leave the existing `Showing {visibleDots.length} of {dots.length}` line
for the radar set. The "More matches" section carries its own implicit
count via the rows + button label, so no change needed to the header.

## Data flow summary

```
preferences ─┬─> matched (radar set, capped 25/50, +preset extras)
             │      └─> dots ─> visibleDots ─> radar + band carousel
             └─> deepPool (DEEP_LIMIT=200)
                    └─> morePool = deepPool
                          ∩ sectorFilter ∩ presetFilter
                          − visibleDots ids
                          └─> moreShown = morePool.slice(0, revealed)
                                 └─> "More matches" table + Show-more button
```

## Testing

- Unit-test a pure helper that derives `morePool` from
  `(deepPool, visibleIds, sectorFilter, presetFilter)`: verifies
  dedupe against shown ids, sector filter, preset filter, and preserved
  rank order. Extract this as a pure function (e.g. `buildMorePool`) so
  it is testable without rendering.
- Unit-test the chunk/reset behaviour at the helper level where
  practical (revealed count never exceeds pool length; reset to 0 on
  filter change).
- No radar-render changes, so no visual regression surface there.

## Risks / edge cases

- **Empty morePool with preset active:** expected; button hides.
- **Sector filter + no preset:** main use case (e.g. focused-Creative
  preferences); morePool surfaces the in-category long tail.
- **Performance:** `DEEP_LIMIT=200` does not increase scoring work; the
  engine already scores the full catalog. Only the slice size changes.
- **`active goal` dot:** already forced visible in `visibleDots`; its id
  is therefore excluded from `morePool` automatically.

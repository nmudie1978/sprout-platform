# My Journey PDF — "Winding Road" roadmap visual

**Date:** 2026-06-16
**Status:** Approved (owner approved design; build authorised)

## Problem

The "Your personal roadmap" page of the downloadable My Journey PDF
(`src/lib/reports/journey/`) renders the roadmap as a plain **vertical list**
of timeline rows (`TimelineItem` — stage dot + connector rail + text). The
owner wants this page to instead show the **Clarity tab's roadmap visual** —
the "Winding Road" graphic — redrawn to match the clean/light report styling,
and it **must fit on a single page without being chopped or shrunk to
illegibility**.

## Decisions (from brainstorming)

1. **Redraw natively**, not a screenshot. The on-screen visual is dark-themed,
   interactive DOM/SVG; we re-draw the same *layout* in `@react-pdf` vector
   primitives styled to match the report (vs. embedding an html2canvas PNG).
2. **Winding Road layout** (the default/signature on-screen style), not
   Stepping Stones. The server can't read the user's per-device style choice,
   so Winding Road is the single canonical PDF layout.
3. **Serpentine wrap to fit one page.** Nodes run left→right, then wrap to the
   next row right→left (a true "winding road"), so any step count fits the page
   width — never chopped. Uniform downscale only as a safety net for unusually
   long roadmaps.

## Design

### Units & boundaries

- **`winding-road-layout.ts`** (pure, no `@react-pdf` import — independently
  testable): `layoutWindingRoad(count, opts)` → `{ width, height, scale,
  colWidth, nodes[], path }`. All geometry/serpentine/fit-to-height math lives
  here. Also exports a `truncate()` label helper.
- **`winding-road.tsx`**: `WindingRoad({ data })` component. Consumes the layout
  + the existing `RoadmapSection` (`items: RoadmapStep[]`, `birthYear`) and
  renders an `<Svg>` (road `<Path>` + stage-coloured node `<Circle>`s) with
  absolutely-positioned `<Text>` labels (title + age/year) under each node.
  Reuses `stageColors`, `palette`, `type` from `theme.ts`.
- **`pages.tsx` → `RoadmapPages()`**: swap the `slice.map(TimelineItem)` block
  for `<WindingRoad data={data} />`. Keep the section header, the stage legend,
  and the "Learning track" (school) section. Drop the now-dead pagination loop
  (the page was already planned as one page — `roadmapPageCount = 1`).

### Layout algorithm (pure)

- `rows = ceil(count / maxPerRow)` (maxPerRow = 4); `perRow = ceil(count / rows)`
  → balanced rows (6→2×3, 8→2×4, 5→3+2).
- `colWidth = (width − 2·turnPad) / perRow`; node `cx` per column, reversed on
  odd rows. `cy = topPad + nodeR + row·rowHeight`.
- Continuity: a full row's last node and the next row's first node share `cx`
  (same edge), so U-turns are clean vertical curves.
- `path`: `M` first node; straight `L` within a row; cubic-bezier U-turn bulging
  to the page edge between rows.
- `naturalHeight = topPad + 2·nodeR + (rows−1)·rowHeight + labelBlockH`. If a
  `maxHeight` is given and exceeded, compute `scale = maxHeight/naturalHeight`
  and uniformly scale all coords, radii, and (in the renderer) fonts. Common
  case (roadmap capped ~6 steps) renders at `scale = 1`.

### Rendering

- Width = report content width (≈491pt). Node circles in `stageColors[stage].
  accent`; milestones larger with a white centre dot; a white halo ring lifts
  each node off the road line. Road = soft slate stroke, rounded caps/joins.
- Labels: centred under each node — title (`truncate` ~48 chars, Poppins) + an
  age/year line (`Age 19–23 · 2026–2030`) reusing the existing label logic.

### Out of scope / unchanged

- No mapper/API/data-model changes. No change to the html2canvas PNG export on
  the Clarity tab. Stepping Stones not redrawn. Other report pages untouched.

## Testing

- Unit tests on `layoutWindingRoad`: node count; balanced rows for n=1,5,6,8;
  all coords within `[0,width]×[0,height]`; serpentine direction + row-to-row
  `cx` continuity; `path` starts with `M`; `maxHeight` triggers `scale<1` and
  `height ≤ maxHeight`.
- Integration: render a real PDF from a sample view model and visually confirm
  the roadmap page fits one page and reads cleanly.

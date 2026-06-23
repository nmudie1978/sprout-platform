# Entry-level routes & programmes — transition scenario + popup details

**Date:** 2026-06-23
**Surface:** My Journey → Clarity roadmap, for out-of-work (`between`) users who get a Career Transition mindmap and cycle the "Scenarios" toggle.

## Problem

Out-of-work users already get a "structured route" scenario when cycling
scenarios (derived from the mindmap's `programmes` branch), BUT:

1. It's labelled "Via a structured route" — not recognisable as the
   "Entry-level routes & programmes" the mindmap offers.
2. Its steps carry no concrete programme links, so the step popup shows
   nothing actionable.
3. `JourneyItem.suggestedResources` exists on the type but is never rendered.

## Design

### 1. Rename the scenario
In `transition-directions.ts`, the `programmes`-branch direction label
changes from "Via a structured route" → **"Entry-level routes & programmes"**.
So the Scenarios chip reads exactly that when the user lands on it.

### 2. Shared programme source (no drift)
New module `src/lib/journey/entry-level-programmes.ts`:

- `ENTRY_LEVEL_PORTAL_URLS` — the three portal URLs (utdanning.no,
  finn.no/job, LinkedIn pathways), imported by BOTH `bridge-catalogue.ts`
  (the mindmap leaves) and the helper below, so the links never drift.
- `ENTRY_LEVEL_REALITY_TIP` — the "entry-level ads list nice-to-haves" reframe.
- `getEntryLevelProgrammeResources(targetCategory?)` →
  `SuggestedResource[]`: named sector trainee/graduate programmes (when the
  category has any), then the three portals.

### 3. Attach details to the scenario step
`StepSpec` gains optional `description` + `suggestedResources`; `toItems`
passes them through. The structured direction's **"Apply to a structured
programme"** step gets:

- `description`: a one-liner + `ENTRY_LEVEL_REALITY_TIP`.
- `suggestedResources`: `getEntryLevelProgrammeResources(targetCategory)`.

### 4. Render resources in the popup
`TimelineDetailDialog` renders a step's `suggestedResources` as a calm
"Where to look" list of external links (non-foundation steps only). This
wires the dormant field, so any step with resources benefits.

## Out of scope
- Country-tailoring the portal URLs (they stay Norway-centric as today).
- Adding resources to the other directions (proof / network / training).

## Testing
- `transition-directions` unit test: structured direction label is
  "Entry-level routes & programmes"; its apply step has non-empty
  `suggestedResources` including the three portals.
- `entry-level-programmes` unit test: portals always present; named
  programmes prepended when the category has any.
- RTL test: `TimelineDetailDialog` renders `suggestedResources` as links
  with correct hrefs.

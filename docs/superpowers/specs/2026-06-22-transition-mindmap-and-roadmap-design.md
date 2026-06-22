# Career Transition Mindmap + roadmap rework — Design

**Date:** 2026-06-22
**Base:** `origin/main` (after #484 merged — CTM on roadmap + NAV-aware workplace branch)
**Branch:** `feat/transition-mindmap-roadmap` (Group A); Group B gets its own branch off the same base.

## Problem / intent

Refinements to the Career Transition experience for career-changers (the
`between` / "Not working" foundation stage). Owner-requested, six items, split
into a quick-wins group (A) and an interdependent feature rework (B).

Decisions captured during brainstorming:
- Apprenticeships/programmes branch: **both apprenticeships (lærling) and named
  trainee/graduate programmes under one branch**, shown by **sector-curated
  relevance** with a generic lærling/graduate fallback. No fabricated
  per-company claims — only a curated, verifiable set.
- Scenarios: **reshape the roadmap steps per mindmap direction** (deterministic
  templates, not AI), replacing today's university+employer scenarios for
  transition users.
- Parallel steps: **stacked at one stop** (concurrent aims share one timeline
  column), condensing the span.
- CTA: a **subtle inline link** (not a filled card/chip), worded "mindmap".

---

## Group A — Quick wins (one small PR)

### A1 · Subtle "Career Transition Mindmap" CTA on the roadmap (#1)
`src/components/journey/personal-career-timeline.tsx` (~853–875). Replace the
large indigo card with a compact, quiet inline link rendered just above the
roadmap:

- Single muted row, e.g. a small `Route` icon + `View your Career Transition
  Mindmap` + a trailing `→`; `text-xs`/`text-sm`, `text-muted-foreground`
  hover→`text-foreground`, no filled background, no ring card.
- Same gating: `bridgeModel && !readOnly && !startingPointEmpty &&
  !simState.isPlaying`.
- Wording uses **mindmap** (the overlay header/title can keep "Career
  Transition Map" or follow up later — out of scope to rename everywhere).

### A2 · Remove the CTA from the Starting Point modal (#2)
`src/components/journey/timeline/timeline-detail-dialog.tsx` (~815–859). Delete
the "Open your Career Transition Map →" button **and** its `showRoutes` portal
overlay + the now-unused `showRoutes` state and `CareerTransitionMap` import if
nothing else uses them. The mindmap is reached only from the roadmap.

### A3 · Richer starting-point label (#5)
`src/components/journey/renderers/foundation-banner.tsx` (~114). Today:
`Not working · was {previousOccupation}`. Target:
`Not working · was {previousOccupation} → transitioning to {careerTitle}`.

- `careerTitle` (the target career) is **not** currently passed to
  `useFoundationData()`. Thread it through: `foundation-banner` already receives
  the career context from its parent — add `careerTitle` to the hook input and
  the banner subtitle composition.
- Fallbacks: no `previousOccupation` → `Not working right now → transitioning
  to {careerTitle}`; no `careerTitle` → today's string unchanged.

**A tests:** unit-test the label composition (with/without previousOccupation,
with/without careerTitle). Snapshot/structure check that the modal no longer
renders the CTM button.

---

## Group B — Transition-feature rework (own spec-plan-PR; multi-day)

### B1 · "Structured ways in" mindmap branch (#6)
New deterministic branch in the bridge mindmap.

- New `BranchKind` value, e.g. `structured-entry`, with title
  **"Structured ways in"**.
- New curated dataset `src/lib/journey/trainee-programmes.ts`:
  ```ts
  interface TraineeProgramme {
    company: string;          // "Equinor"
    sectors: TraineeSector[]; // ['energy','engineering']
    url: string;              // verified careers/graduate page
    kind: 'graduate' | 'trainee';
    windowNote?: string;      // "Applications typically Aug–Nov"
  }
  ```
  Seed set (verifiable): Equinor, Statkraft, Kongsberg Gruppen, Aker Solutions
  (energy/eng); DNB, PwC Norway, Deloitte Norway (finance); Accenture Norway,
  Telenor (tech/consulting). Each links its real careers page.
- Sector relevance: map the **target career → sector(s)** (reuse the existing
  career category/sector signal, e.g. `getCareerEmployers` category or the
  career's `sector`). Show only programmes whose `sectors` intersect.
- Apprenticeships leaf: keep/move the existing `programmes`-branch apprenticeship
  (lærling → utdanning.no / NAV / FINN lærling) into this branch.
- Fallback when nothing matches sector: a single generic leaf —
  "Graduate & trainee programmes" + "Apprenticeships (lærling)" search links —
  so the branch is never empty/irrelevant.
- Pure + deterministic; unit-tested (sector match, fallback, no fabricated
  company beyond the curated set).

### B2 · Scenarios reshape the roadmap per direction (#4)
Rewire `src/lib/simulation/scenario-engine.ts` for transition users.

- A scenario becomes a **mindmap direction**, derived from the present mindmap
  branches: `Via a trainee programme` (structured-entry), `Build proof first`
  (proof), `Through people` (network), `Targeted upskilling` (training). Only
  directions whose branch is present/relevant are offered.
- Each direction maps to a **deterministic step-sequence template**,
  parameterised by target career + relevant named employers, that **replaces**
  the roadmap items (not just annotates). Example — "Via a trainee programme":
  `[prep + apply (parallel)] → [trainee role at {Equinor/DNB/…}] → [first paid
  role] → [grow]`.
- `cycleScenario` already exists; change scenario application from an annotation
  overlay to **swapping the items array** for transition users. Non-transition
  users keep today's university+employer scenarios unchanged.
- Deterministic (no AI) for reliability and trust.
- Unit-test each direction template (shape, ages monotonic, employers come from
  the curated/relevant set, parallel group present where expected).

### B3 · Parallel + condensed transition roadmap (#3)
- Data model: add optional `concurrentGroup?: string` to `JourneyItem`
  (`src/lib/journey/career-journey-types.ts`). Items sharing a `concurrentGroup`
  occupy **one timeline column**, stacked.
- `useRoadmapModel` / `shared-roadmap.ts`: group consecutive same-`concurrentGroup`
  items into one "stop"; the "you-are-here"/`next` state treats a group as a
  single position; ages shown as the group's combined range.
- Renderers: both `stepping-stones-renderer.tsx` and `winding-road-renderer.tsx`
  render a group as stacked stones/cards in the column (the approved "stacked at
  one stop" layout). Single-item groups render exactly as today (no regression).
- Default transition roadmap: make `leverage transferable skills` +
  `build a small portfolio` a concurrent group, compressing the ~4yr span
  toward ~2yr (update the fallback generator + the transition prompt guidance).
- Tests: model grouping (group → one position), renderer layout test for a
  grouped column, and the transition fallback produces the concurrent pair.

---

## Sequencing & isolation
- **Ship A first** (small, low-risk, no data-model change).
- **B** is its own spec → plan → PR. B3's renderer edits may lightly conflict
  with PR #485 (Stepping Stones tightening, still open) — rebase whichever lands
  second.

## Out of scope
- Renaming "Career Transition Map" → "Mindmap" everywhere (overlay title,
  library save labels). A1 only changes the roadmap CTA wording.
- Live apprenticeship postings (NAV provider) inside the mindmap — the curated
  set + search links only.
- Non-transition (school/university) roadmaps — unchanged.

## Verification
- `tsc` clean; full `vitest` green; `eslint` clean.
- Headless screenshot of `/dev/journey-renderers` (temp preview) for the parallel
  layout; CTA + label checked on the real roadmap (auth-gated → prod smoke).

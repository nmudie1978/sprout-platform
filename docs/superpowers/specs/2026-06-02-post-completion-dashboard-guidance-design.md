# Post-completion dashboard guidance — design

**Date:** 2026-06-02
**Status:** Approved (design); implementation pending
**Branch:** `feat/post-completion-guidance` (based on `origin/main`)

## Problem

When a youth user completes a journey for a career — reaches the Clarity stage
(3/3) — and returns to the dashboard, nothing guides them on what to do next.
The dashboard "seems lifeless": the completed journey card shows a quiet gold ⭐
"You've explored this possible future" line and then dead-ends.

**Goal:** when the active career is complete, the dashboard should (a) give a
one-time pointer to the "Change" control so the user discovers they can explore
another career, and (b) keep a calm, persistent next-step in the journey card so
completion no longer feels like a dead-end. Tone stays calm — no gamification,
no confetti, "not a checklist factory" (CLAUDE.md).

This is a **reuse-heavy** feature. No new detection logic and no new overlay
component are required.

## Completion signal (reused)

The dashboard already computes `lensProgress` via
`computeLensProgress({ careerTitle: goalTitle })` (`src/lib/journey/lens-progress.ts`).
`completedLensCount === 3` (i.e. `clarityDone`) for the active career = complete.
All guidance keys off this existing value. Progress is localStorage-backed and
per-career, so this is purely client-side.

## Part 1 — one-time spotlight on "Change"

- Add `data-spotlight="change-button"` to the existing Change `<button>` in
  `src/app/(dashboard)/dashboard/page.tsx` (the one that calls
  `setShowGoalSheet(true)`).
- Add a second `SpotlightHint` instance (`src/components/ui/spotlight-hint.tsx`,
  already used for the empty-goal case) targeting `[data-spotlight="change-button"]`.
- Gate visibility on `clarityDone && !!goalTitle`, shown **once per completed
  career** using the existing `useSubtleHint` hook
  (`src/hooks/use-subtle-hint.ts`) with a per-career key, e.g.
  `journey-complete-nudge-{slug}`. Short delay in; dismiss on click or
  auto-dismiss (the hook's existing behaviour).
- Copy (i18n): *"Now try changing to an alternative career to explore further."*

## Part 2 — persistent "Where next?" block (integrated)

- **Integrated into the My Journey card**, growing out of the existing completion
  marker (the `completedLensCount === 3` block that currently renders the gold ⭐
  + `journey.completeIndicator`). That quiet line becomes a calm block: the
  acknowledgment plus a single **"Explore another career"** action.
- The action opens the same career picker as Change (`setShowGoalSheet(true)`).
- **No dismiss button.** It is simply the completed-state of the card: visible
  whenever the active career is at 3/3, and it self-hides when the user switches
  to a new (incomplete) career (ring resets to 0/3).
- Only this one next-step is offered (Compare / Career Twin / Reflection were
  deliberately deselected by the owner).

## i18n

Add the new strings to all three catalogs (`messages/en-GB.json`,
`messages/nb-NO.json`, `messages/es.json`) — language is now switchable on every
surface, so guidance copy must be localised, not hardcoded. Proposed keys:

- `journey.completeNudge.spotlight` — "Now try changing to an alternative career to explore further."
- `journey.whereNext.exploreAnother` — "Explore another career"
- (reuse existing `journey.completeIndicator` for the acknowledgment line)

## Persistence summary

- **Spotlight:** once per completed career via `useSubtleHint` →
  `localStorage` key `hint-seen-journey-complete-nudge-{slug}`. Never repeats for
  that career.
- **Persistent block:** no persistence needed — it derives purely from the live
  completion state of the active career.

## Files touched

- `src/app/(dashboard)/dashboard/page.tsx` — `data-spotlight` attr on Change;
  second `SpotlightHint` + `useSubtleHint` gated on completion; rework the
  `completedLensCount === 3` marker into the "Where next?" block with the
  Explore-another action.
- `messages/en-GB.json`, `messages/nb-NO.json`, `messages/es.json` — new keys.

## Out of scope

- Compare / Career Twin / Reflection next-steps.
- Any gamification (streaks, confetti, points, leaderboards).
- Server-side nudge tracking — localStorage per-career is sufficient.

## Acceptance criteria

- On the first dashboard return after a career reaches 3/3, the "Change" control
  is spotlit with the alternative-career hint; it does not appear again for that
  career.
- Whenever the active career is at 3/3, the My Journey card shows the calm
  "Where next?" block with a working "Explore another career" action (opens the
  career picker).
- Switching to a new, incomplete career hides the block and the completion
  spotlight does not fire for the still-incomplete career.
- All new copy is localised in en-GB, nb-NO, and es.
- No dismiss control on the persistent block; no gamification added.

# Roadmap first-run tips card — design

**Date:** 2026-06-23
**Surface:** My Journey → Clarity → the personal career roadmap (`PersonalCareerTimeline`)

## Goal

The first time a user sees their roadmap, give calm one-time guidance explaining
two non-obvious things, then never show it again:

1. **Your Starting Point** — what it is and that it tailors the roadmap.
2. **Scenarios** — the shuffle control that cycles study/work path variations.

After dismissal (or once seen) the guidance never reappears on that device.

## Form

A single, calm, dismissible **tips card** rendered at the top of the roadmap
(above the road and the existing callouts) — NOT a modal, not anchored
coachmarks. Owner-chosen for minimal intrusion, consistent with the calm UI
principles (no over-gamification, no noisy mechanics).

Content:

- Heading: a quiet "Quick orientation" / "A couple of things" line.
- Bullet — **Your Starting Point**: "Tell us where you are today and we'll
  tailor every step of this roadmap to you." (always shown)
- Bullet — **Scenarios**: "Tap *Scenarios* to see different study and work
  paths to the same goal." (shown only when the Scenarios control exists)
- A **Got it** primary dismiss + a small ✕.

## Component

New self-contained component: `src/components/journey/roadmap-tips-card.tsx`.

- Props: `{ showScenarios: boolean }`.
- Owns its first-run state via `localStorage` (see persistence). Renders
  `null` when already seen, during SSR, or after dismissal in-session.
- Pure presentational otherwise; no business logic, no data fetching.

Keeping it in its own file keeps `personal-career-timeline.tsx` focused — that
file only gains one render line.

## Persistence

A single `localStorage` flag: `roadmap-guidance-seen` = `'1'`.

- Matches the existing `journey-show-years` flag and the celebration
  once-only guards already in this codebase.
- SSR-safe **lazy `useState` initializer** (read inside `typeof window !==
  'undefined'` try/catch) so the card never flashes on hydration and never
  throws in iOS private tabs.
- Set on dismiss (Got it or ✕). Per-device by design; no DB, no migration,
  no extra data collection (privacy-by-design).

## Visibility rules

The card renders only when ALL hold:

- `!readOnly` — only the user's own editable roadmap, never the read-only
  "explored journey" view.
- A real roadmap has rendered (the card lives inside the main return, after
  the loading/empty/error early returns).
- The flag is unset.

The Scenarios bullet is additionally gated on `scenarios.length > 0`, so we
never describe a control that isn't on screen. The Starting Point bullet is
unconditional, so the card always carries at least one tip.

## Wiring

`personal-career-timeline.tsx` renders, near the top of the main return:

```tsx
{!readOnly && <RoadmapTipsCard showScenarios={scenarios.length > 0} />}
```

This is the only change to the timeline file.

## Coexistence

A brand-new user may briefly see this tips card AND the existing teal
"Start here — add your starting point" action callout stacked. They serve
different purposes (orientation vs. next action), the tips card is light and
dismissed once, so they are allowed to coexist rather than adding
coordination logic.

## Testing

RTL test (sibling to `clarity-shift.test.tsx`):

- Starting Point bullet always present.
- Scenarios bullet present only when `showScenarios` is true.
- Clicking **Got it** removes the card and sets `roadmap-guidance-seen`.
- Renders nothing when the flag is already set on mount.

(localStorage is cleared between tests.)

## Out of scope

- Play button explanation (owner scoped to Starting Point + Scenarios only).
- Cross-device persistence / DB storage.
- Re-show / reset mechanism.

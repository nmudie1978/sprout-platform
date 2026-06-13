# Onboarding Sidebar Spotlight — Design

**Date:** 2026-06-12
**Status:** Built autonomously while owner was away (~5h). Owner to review.
**Branch:** `feat/onboarding-sidebar-spotlight` (git worktree, based on `origin/main`)

## Problem

The first-login walkthrough (`OrientationWalkthrough`) is a centred modal with 7
slides. The owner's feedback: *"it's not very engaging — just a page-by-page
walkthrough. Can we show which sidebar option each step refers to as the user
moves through it?"*

5 of the 7 steps map 1:1 to a sidebar destination, so each of those steps can
visually point at the real sidebar item it describes.

## Goal

As the user steps through the walkthrough, **spotlight the matching sidebar
item** — dim the rest of the screen (lightly, no heavy blur), punch a "hole" so
the real sidebar item stays crisp, and ring it in a calm pulsing teal — turning
"slides about features" into "here's *where* each thing lives."

Non-goal: navigating between pages per step (the modal stays put), gamification,
or changing the copy/steps themselves.

## Step → sidebar target map

| Step | Title | `data-tour-target` (sidebar href) |
|------|-------|-----------------------------------|
| 0 | Let me show you around | — (intro, plain dim) |
| 1 | Career Radar | `/careers/radar` |
| 2 | Dashboard | `/dashboard` |
| 3 | My Journey | `/my-journey` |
| 4 | Career Twin | `/career-advisor` |
| 5 | Industry Insights | `/insights` |
| 6 | Choose your first career goal | — (CTA, plain dim) |

## Key constraint (why the design is shaped this way)

The shared `DialogContent` always renders `DialogOverlay` =
`fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm`. That **blurs and dims** the
sidebar, so a highlight on the real item wouldn't read through the blur. We must
replace that dim for the walkthrough only, without touching every other dialog.

## Architecture

Three small, isolated pieces:

1. **`DialogContent` gains an optional `overlayClassName` prop** (additive,
   backward-compatible — default = current blur dim). The walkthrough passes a
   transparent, no-blur overlay so the Radix layer still traps focus and catches
   click-outside-to-close, but provides no visual dim of its own.

2. **`TourSpotlight`** (new, `src/components/onboarding/tour-spotlight.tsx`) —
   a `createPortal(..., document.body)` layer at `z-[90]` (below the Radix
   overlay z-100 and card, above the sidebar z-20), `pointer-events-none`. Given
   a `targetHref`:
   - finds `document.querySelector('[data-tour-target="<href>"]')`,
   - measures `getBoundingClientRect()`,
   - renders a positioned box over it with a **spotlight hole** via
     `box-shadow: 0 0 0 9999px rgba(0,0,0,0.45)` (dims everything *except* the
     item — no blur, so the item stays crisp) plus a teal ring + gentle pulse.
   - Recomputes on step change, `resize`, and `scroll`.
   - If `targetHref` is null **or** the element isn't found (e.g. mobile, where
     the sidebar is `hidden lg:block`), it renders a **uniform light dim** with
     no hole — so intro/CTA steps and mobile still feel like a normal modal.

3. **`sidebar-nav.tsx`**: add `data-tour-target={href}` to each nav link. Tiny,
   non-visual.

### Why this z-order works (no z-index fighting)

- sidebar `z-20` → dimmed by spotlight except the hole.
- `TourSpotlight` `z-[90]`, `pointer-events-none`, portal appended after Radix.
- Radix overlay `z-100`, made transparent/no-blur → doesn't hide the dim, still
  catches Escape / click-outside.
- Radix card `z-100`, paints above the overlay (and above the z-90 spotlight) by
  DOM order → modal stays fully readable on top.

The card is left centred; on `lg+` screens the centred `max-w-md` card and the
~224px left sidebar don't overlap, so the highlighted item stays visible.

## Accessibility / calm

- Pulse animation gated behind `prefers-reduced-motion: reduce` (static ring
  when reduced).
- Calm, slow teal pulse reusing the sidebar's existing teal accent language
  (`teal-400/500`, soft glow) — no harsh flashing (CLAUDE.md: calm, soft visual
  language, no cheap gamification).
- Radix focus-trap/Escape preserved (no a11y regression).

## Testing

- **Unit:** pure step→target map exported and asserted (all 7 entries; intro/CTA
  null; the 5 targets match real sidebar hrefs).
- **Manual/headless:** render the walkthrough over the dashboard on a `/dev/*`
  page and screenshot each step with headless Chrome (per the repo's
  `headless-chrome-ui-verify` approach) to confirm the hole lands on the right
  item.

## Risk / rollback

Self-contained and additive. Rollback = revert the 3-file change; the
`overlayClassName` prop defaults to today's behaviour so all other dialogs are
untouched. Mobile degrades to a lighter (non-blur) modal dim — no broken state.

> Note: `sidebar-nav.tsx` is also being edited by a parallel agent on another
> branch; this work is isolated in a worktree off `origin/main` and must be
> rebased (conflicts resolved by a human) before merge.

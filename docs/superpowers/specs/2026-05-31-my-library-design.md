# My Library + *Yours* Nav Reshuffle — Design

**Date:** 2026-05-31
**Status:** Approved (ready for implementation plan)

## Problem

The *Yours* sidebar section is the thinnest in the app (3 items: Dashboard, My
Journey, My Career Radar), yet it's where the most personal value lives. Things a
youth user deliberately creates or collects — saved careers, career comparisons,
written reflections — have **no single home**. Saved careers are previewed on the
dashboard but there's no "see all" destination; comparisons live only in a
localStorage tray; reflections are scattered through the Journey. AI Advisor (a
personalised surface) sits under the generic *Explore* group.

## Goal

Give the user one calm, deliberate **collection** of what they've saved and
written, surfaced as a new *My Library* page, and tidy the nav so personal
surfaces sit together under *Yours*. Keep the approved "golden" dashboard as the
*window* into this — previews on the dashboard link out to the full Library.

Non-goal: an activity feed. This is an intentional collection, **not** behavioural
tracking — consistent with the privacy-by-design / no-engagement-loop principles
in `CLAUDE.md`.

## Decisions (from brainstorming)

1. The full collection lives on a **dedicated `/library` page**, reached via both
   the sidebar and dashboard "See all →" links (not an in-place dashboard expand).
2. The Library page is **tabbed** (one section at a time), mirroring the Journey's
   tabbed pattern — calmer than a long single scroll.
3. v1 sections: **Saved · Compared · Reflections**. (Career Twin insights deferred.)
4. Nav label is **"My Library"** (matches "My Journey", "My Career Radar").
5. **AI Advisor moves from *Explore* into *Yours*.** Career Twin is unchanged — it
   stays a tab *inside* the AI Advisor page (`/career-advisor?tab=twin`); no
   separate nav item and no new route.
6. Dashboard gets a **Reflections preview** + "See all →" on the saved section.
   Compared is **Library-only** (it's device-local). Career Twin CTA unchanged.

## Architecture

### Navigation

`src/components/sidebar-nav.tsx` — within the `YOUTH` block:

```
● YOURS  (accent)               EXPLORE
  Dashboard                       Explore Careers
  My Journey                      Youth Events
  My Career Radar                 Industry Insights
  AI Advisor   ← moved in
  My Library   ← new
```

- Move the existing `AI Advisor` `<NavItem>` (`/career-advisor`, `Bot` icon) from
  the `Explore` `<NavSection>` into the `Yours` `<NavSection>`, with `personal`.
- Add a new `My Library` `<NavItem>` (`/library`) with `personal`, an icon
  (`Library` or `Bookmark` from lucide), and a tooltip
  (e.g. "Everything you've saved and written — saved careers, comparisons, and your
  reflections, in one place.").
- `isActive("/library")` is already covered by the existing `isActive` helper.

`src/components/mobile-bottom-nav.tsx` — the "more menu" groups mirror the sidebar.
Apply the same change there: move `AI Advisor` into the personal group and add
`My Library`. (The 4-slot bottom bar itself stays as-is.)

### `/library` page

New route group entry: `src/app/(dashboard)/library/page.tsx` (+ optional
`layout.tsx` if a shared header helps). Client component (it reads localStorage for
the Compared tab and benefits from client tab state).

- Tab state driven by `?tab=saved|compared|reflections` (default `saved`), so
  dashboard "See all →" links deep-link to a tab. Use `useSearchParams` +
  `router.replace` to keep the URL in sync.
- Three tabs, each with its own empty state.

| Tab | Source | Data path | Notes |
|---|---|---|---|
| **Saved** | **localStorage** | `useCuriositySaves()` hook — key `endeavrly-curiosity-saves:<userId>`. Shape `SavedCuriosity` (`src/lib/my-journey/human-features-types.ts`): `{ careerId, careerTitle, careerEmoji, savedAt, note? }` | Saved **careers** (hearted "curiosities"). Open via the existing `open-career-detail` CustomEvent (same as `SavedCareersTray`); remove via the hook. **Device-local.** |
| **Compared** | **localStorage** | `getSavedComparisons()` from `saved-comparisons-tray.tsx` (key `saved-career-comparisons`). Shape `SavedComparison`: `{ id, careers: { id, title, emoji }[] }` | Re-open a saved comparison. **Device-local.** |
| **Reflections** | **server** | `GET /api/journey/reflections` → `{ reflections, total, counts }`. Shape `ReflectionData` (`reflections-service.ts`): `{ id, contextType, contextId, prompt, response, skipped, createdAt }` | Read-only read-back of **answered** reflections only (`response != null && !skipped`). |

> **Correction from the initial draft:** "Saved careers" are the hearted
> **curiosities** in localStorage via `useCuriositySaves()` — *not* the server-side
> `SavedItem` content (articles/videos) shown in the dashboard `LibraryCard`. So
> **two of three tabs (Saved + Compared) are localStorage/device-local**; only
> Reflections is server-backed. Saved *content/resources* (`SavedItem`) stays on the
> dashboard's existing `LibraryCard` (renamed "Saved Resources") — a possible future
> 4th "Resources" tab, out of scope here.

The page is a **client component**. Both localStorage tabs need a `mounted` guard
(read storage in `useEffect`, render a skeleton/empty until mounted) to avoid a
hydration mismatch. Reuse existing hooks/functions (`useCuriositySaves`,
`getSavedComparisons`) rather than re-reading storage by hand.

### Dashboard

`src/app/(dashboard)/dashboard/page.tsx` — minimal, additive, preserving the
golden layout:

- Existing saved section (`DashboardSection` wrapping `LibraryCard`): pass a
  **"See all →"** link to `/library?tab=saved` via the section's existing `action`
  prop (the saved section already conditionally renders an `action`).
- **Add one new compact `DashboardSection`** previewing the most recent 1–2
  reflections, with an `action` "See all →" to `/library?tab=reflections`. Source:
  the same reflections service/API. Keep it visually quiet (matches existing
  section styling).
- **Compared:** no dashboard preview (device-bound) — Library-only.
- Career Twin CTA (`CareerTwinCta variant="dashboard"`): unchanged.

## Data / persistence notes

- **Reflections** are server-persisted and queryable (`reflections-service` /
  `GET /api/journey/reflections`). No schema change.
- **Saved careers** (`useCuriositySaves`) and **Compared** (`getSavedComparisons`)
  are **localStorage-only** today, keyed per user. v1 ships them as-is:
  device-local, client-rendered, not synced across devices. Both tabs must render
  gracefully when empty / on a fresh device, and behind a `mounted` guard.
- No new Prisma models or migrations in v1. No new API routes (Reflections reuses
  the existing endpoint).

## Out of scope (v1)

- Career Twin *insights* as a 4th Library tab (additive later).
- Server-persisting comparisons (would need a `SavedComparison` model + migration).
- Any activity/engagement feed, counts-as-scores, or comparison-to-others surfaces.

## Testing

- **Nav:** update/extend the existing nav tests (`src/components/__tests__/mobile-bottom-nav.test.tsx`)
  — AI Advisor now under the personal group, My Library present, AI Advisor no
  longer under Explore. Add a sidebar assertion for the new *Yours* membership.
- **Library page:** tab switching via `?tab=`; each tab's empty state; Saved list
  renders from service data; Compared reads localStorage (incl. empty/fresh
  device); Reflections renders read-only list.
- **Dashboard:** saved section renders a "See all →" to `/library?tab=saved`; new
  Reflections preview renders + links to `/library?tab=reflections`; golden layout
  otherwise unchanged.

## Risks

- **Golden dashboard regression** — the dashboard is a protected layout
  (`dashboard-v1-golden` tag). Changes are limited to one `action` link + one new
  quiet section; verify visually against the golden reference before merge.
- **Component reuse vs. fork** — prefer extending existing saved/comparison/
  reflection components with a variant prop; avoid duplicating their logic.

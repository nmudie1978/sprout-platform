# Career Twin — embed "Meet Future You" as a journey-completion reward

**Date:** 2026-06-03
**Status:** Approved (conversational), ready to implement
**Surface:** Dashboard My Journey card (`src/app/(dashboard)/dashboard/page.tsx`)

## Problem

The "Meet Future You" Career Twin entry currently renders as a standalone,
always-on banner card below the journey card (`<CareerTwinCta variant="dashboard">`,
dashboard/page.tsx:1238). It shows whenever an active career resolves, regardless
of journey progress, and reads as a loud promo strip.

We want it to feel earned: surfaced subtly **inside** the My Journey card as a
result of completing the journey (3/3, Clarity).

## Design

### Placement
Bottom of the journey card (`journeyCard`), directly under the Career Snapshot
strip, separated by the same hairline top border. Part of the card, not a
floating banner.

### Trigger
Renders only when the journey is complete: `goalCareer && completedLensCount === 3`
(Clarity done). Mid-journey users see nothing here.

### Content (chosen treatment: "Completion line")
- A check mark + "Journey complete" heading.
- Subtitle: "Meet your future self as a *{career}*".
- A quiet "Talk →" button on the right.
- Whole row is tappable.
- Restrained styling — soft teal accent, not the full gradient banner.

### Navigation (nested-link safety)
The dashboard journey card is wrapped in `<Link href="/my-journey">` whenever a
goal is set. A nested `<a>` would be invalid HTML, so the entry is a `<button>`
that navigates via `useRouter().push()` to
`/career-advisor?tab=twin&career={career.id}`, calling `preventDefault()` +
`stopPropagation()` (the same pattern the existing "Change" button uses). Fires
the existing `career_twin_opened` analytics event with `source: "journey-complete"`.

### Removal
Delete the standalone `<CareerTwinCta variant="dashboard">` at dashboard/page.tsx:1238.
Career Twin then appears on the dashboard **only** as this completion reward.
It remains always reachable from the sidebar nav.

## Implementation

Add a `variant="journeyComplete"` branch to the existing
`src/components/career-twin/career-twin-cta.tsx`:
- Reuses the existing `/api/career-twin` resolution (twin-eligibility + career
  title) and `careerTwin` translations.
- Renders the completion line as a `<button>` + `useRouter` navigation with
  `stopPropagation`.
- Not dismissible (it's inline within the card, not a promo).

The dashboard renders `{completedLensCount === 3 && <CareerTwinCta variant="journeyComplete" />}`
inside the `GlassCard`, after the Career Snapshot block.

## Scope

Dashboard journey card only. The `/my-journey` page's own Clarity tab is out of
scope (possible follow-up).

## Out of scope / non-goals

- No change to the Career Twin chat experience itself.
- No new translation namespace; reuse `careerTwin` keys (add one subtitle/label
  key only if needed).
- No change to sidebar Career Twin entry.

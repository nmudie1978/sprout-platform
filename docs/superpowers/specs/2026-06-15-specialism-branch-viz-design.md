# "Where This Can Lead" — Visual Branch Structure

**Date:** 2026-06-15
**Status:** Approved (brainstormed with user). Built on `feat/specialism-branch-viz`, NOT deployed.

## Goal

The Understand-tab "Where This Can Lead" block (career specialisms) currently
renders branches as a flat vertical list of expandable cards. The data is
already a "shared trunk → branches" model ("same foundation, then diverge"), so
show that **visually**: a shared-foundation trunk that branches into the
specialisms. Communicates "one start, many ends" at a glance.

## Constraints
- Lives in My Journey → Understand → **strong mobile UX required.** No horizontal
  scrolling on phones.
- Lightweight only: **plain SVG/CSS connectors, no graph library, no new deps**
  (consistent with the codebase's stated lightweight ethos).
- No data-model breakage: salary/skills/education stay inherited from the base
  career; branches keep only their differentiating fields.

## Design

### Data — `src/lib/career-specialisms.ts`
Add a small, **separate** foundation map + helper (kept OFF the `Specialism`
branch objects, so the "branches carry only differentiating fields" invariant
test is untouched):

```ts
const FOUNDATIONS: Record<string, string> = {
  psychologist: "Psychology degree → doctorate or specialist training → registration",
  "forensic-scientist": "Science degree → specialist lab training & accreditation",
};
export function getFoundation(careerId: string): string | null {
  return FOUNDATIONS[careerId] ?? null;
}
```
The component uses it for the trunk node; when absent it falls back to a generic
"Shared foundation, then specialise."

### Component — `src/components/journey/career-specialisms.tsx` (rewrite, presentational)
A new `BranchTree` layout, responsive via Tailwind (no JS breakpoint logic):

- **Mobile (default):** a vertical trunk rail on the left. A **trunk node** at
  the top (the foundation text), then each branch hangs off the rail with a
  short SVG/CSS elbow connector. Branch nodes keep today's content + behaviour.
- **Desktop (`md:`):** trunk node on the left, branch nodes in a column on the
  right, connected by curved SVG paths fanning from the single trunk anchor to
  each branch row. Implemented with one inline `<svg>` using `currentColor`
  /teal stroke; paths computed from a fixed row height (no measurement needed) so
  it's deterministic and SSR-safe.

**Branch node = unchanged behaviour:**
- Click → expand inline to `blurb`, day-to-day, and `specialisationStep`.
- A branch with a resolvable `linksToCareerId` renders as an **"Explore career →"**
  link to `/careers?open=<id>` instead of expanding.
- `aria-expanded`, keyboard focusable, reduced-motion safe (connectors are
  static; only the chevron rotates).

### Accessibility / fallback
The SVG connectors are decorative (`aria-hidden`); the structure reads correctly
as a list for screen readers. If a career has only one branch, the trunk/branch
visual still renders sensibly (single connector).

## Out of scope
- No change to branch content or the promotion/link-out logic.
- No new specialism data beyond the two `foundation` strings.

## Testing
- **Lib:** existing `career-specialisms` tests stay green; add a test for
  `getFoundation` (returns the seeded string for psychologist; null for unseeded).
- **Component:** renders the trunk node (foundation text) + one node per branch;
  a non-promoted branch expands its detail on click; a promoted branch renders an
  "Explore career" link; falls back to the generic trunk label when no foundation.

## Verification / rollout
Typecheck + tests green; push `feat/specialism-branch-viz` for a Vercel **preview**
build (the real build gate). **No production deploy without explicit go-ahead.**

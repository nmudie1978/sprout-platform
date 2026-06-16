# Roadmap role-evolution tail (conditional fork) — design

**Date:** 2026-06-16
**Surface:** My Journey → Clarity → "Your Roadmap" (Winding Road renderer)
**Status:** Approved, implementing

## Problem

The slimmed roadmap (PR #349) ends the journey on generic, age-anchored steps
("Accept entry-level role", "Step up to a senior role"). It conveys *time* but
not the *real roles* a career grows through. Separately, the Understand tab's
"How this role grows" card (`CareerProgressionFlow`) shows real role titles in
ENTRY → CORE → GROWS-INTO stages (and supports a fork) but has no time/years
dimension.

Owner ask: on the roadmap, show **entry-level role → core role → senior over
years**, similar to the "How this role grows" card — and the senior stage often
involves a **decision point** (e.g. *what type of psychologist*), which is **not
applicable to every career**.

## Approach (chosen: "branch the road itself")

Append a deterministic **role-evolution coda** to the Winding Road, continuing
the road past the last journey milestone into the role's own progression. It is
derived purely from existing bundled data — **no new fetch**:

- `getCareerProgression(careerId)` → `levels[{level, title, yearsExperience, salaryRange}]`
- `getCareerPathProgression(careerId)` → `{entry, core, next?, nextExpert?, nextLead?}`
- `getSpecialisms(careerId)` / `hasSpecialisms(careerId)`

### Conditional fork (owner's "not applicable to all roles")

The coda renders **only when the career has progression data** (so titles are
real). Within that, the senior stage **branches** only when the data diverges,
in priority order:

1. `hasSpecialisms(careerId)` → branch into specialisms ("what type of X"), e.g.
   Clinical / Child / Forensic Psychologist. Kind = `specialism`.
2. else `nextExpert && nextLead` → two-track fork (deepen as specialist vs move
   into lead/management). Kind = `track`.
3. else `next.length >= 2` → branch into those destinations. Kind = `next`.
4. else **no fork** — a single senior node. Kind = `single`.

Branches are capped at **3** to stay calm.

### Stages, titles, ages

The coda continues from the roadmap's final milestone (the first entry-level
role) with:

- **CORE** node — real title from `pathProgression.core[0]` (e.g. "Psychologist").
- **decision** marker at the core→senior transition (only when forked).
- **SENIOR** node(s) — 1 (linear) or 2–3 (forked) destinations with real titles.

Ages are **approximate calendar ages**, synthesized as
`entryRoleAge + lowerBound(level.yearsExperience)` using `progression.levels`
when available, else default offsets (core +3y, senior +6y). Shown as "~age N"
(consistent with the roadmap's existing "~" / "Age X–Y" framing).

`entryRoleAge` = the max age among the journey items (the roadmap's end age),
passed in from the timeline.

### Not counted in the ≤6 cap

The coda is a visually distinct continuation ("how the role grows from here"),
rendered separately from `journey.items`, so it does **not** consume the
six-step "journey to get there" budget from #349.

## Architecture

1. **`src/lib/journey/role-evolution-tail.ts`** (new, pure, unit-tested)
   - `deriveRoleEvolutionTail(careerId, entryRoleAge): RoleEvolutionTail | null`
   - Returns `null` when no progression/path data exists (renderer then keeps
     today's behaviour — nothing changes for those careers).
   - Model:
     ```ts
     interface EvolutionStage { title: string; approxAge: number; }
     interface EvolutionBranch extends EvolutionStage {
       kind: 'specialism' | 'track' | 'next' | 'single';
       trackLabel?: string; // e.g. "Specialist track" / "Lead track"
     }
     interface RoleEvolutionTail {
       core: EvolutionStage;
       forked: boolean;
       branches: EvolutionBranch[]; // length 1 when !forked, else 2–3
     }
     ```
2. **`renderers/types.ts`** — add optional `evolutionTail?: RoleEvolutionTail` to
   `RendererProps`.
3. **`PersonalCareerTimeline`** — resolve `careerId` from `primaryGoalTitle`
   (`getAllCareers().find(c => c.title.toLowerCase() === goalTitle.toLowerCase())`),
   compute `entryRoleAge` from journey items, call `deriveRoleEvolutionTail`, and
   pass `evolutionTail` to the renderer. Gated off in `readOnly` and simulation.
4. **`WindingRoadRenderer`** — when `evolutionTail` is present, extend the canvas
   to the right and draw the coda: continue the road to the CORE node, then a
   decision marker, then fan out to the branch node(s). Branch cards sit to the
   **right** of their nodes (a vertical fan) to avoid the above/below collisions
   of the main road. Stage tags (CORE / SENIOR / specialism kind) on each.
5. **`SteppingStonesRenderer`** — V1 does **not** render the coda (it simply
   ignores `evolutionTail`; no crash). The Winding Road is the default surface;
   Stepping Stones parity is a deferred follow-up.

## Visual / a11y

- Theme-aware (reuse existing slate/amber/emerald tokens).
- Reduced-motion-safe (no new animation beyond the existing dashed road).
- Mobile: coda lives in the same horizontally-scrollable canvas; branch fan
  stacks vertically.
- Coda nodes are non-interactive in V1 (no detail dialog) — they're an
  informational projection, not journey steps the user completes. (Click-through
  can come later.)

## Out of scope (YAGNI for V1)

- Stepping Stones renderer parity (Winding Road only in V1).
- Detecting/stripping any AI-generated generic "senior role" step to avoid
  overlap — the slim cap keeps the AI tail short; revisit after seeing it live.
- Salary on the coda nodes (data exists; defer to keep it calm).
- Per-branch detail dialogs / deep-links to specialisms.

## Testing

- Unit tests for `deriveRoleEvolutionTail`: specialism fork (psychologist),
  track fork (software-developer), flat-next fork (it-support), linear single,
  and `null` for a career with no progression data. Age synthesis from
  `yearsExperience` and from defaults.
- Visual verification via the headless-Chrome `/dev` render pattern before
  claiming done.

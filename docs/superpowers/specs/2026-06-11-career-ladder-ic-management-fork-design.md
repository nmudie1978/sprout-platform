# Career ladder — IC vs management fork (Understand tab)

**Date:** 2026-06-11
**Status:** Design approved; spec for review

## Problem

Young people exploring a career on the **Understand** tab can't see *what's above
an entry role* or *that a career grows in more than one direction*. A user
asked whether to show a company org chart (CEO → CFO/CIO → directors → staff).
That's the wrong vehicle: it reads as "corporate HR feel" (a design rule the
product explicitly avoids), only fits ~a third of the ~950 careers
(tech/finance/business), and shows *company structure* rather than *career
progression*.

The real, honest gap: today's career progression crams two genuinely different
directions into one undifferentiated row. For `software-developer` the `next`
roles are `["Senior Developer", "Tech Lead", "Staff Engineer", "Architect"]` —
mixing the **expert / individual-contributor (IC)** track (Staff Engineer,
Architect) with the **people-management** track (Tech Lead, Engineering Manager)
as if they were one ladder. A teenager can't tell that *you don't have to become
a manager to keep growing*. Surfacing that is exactly the Understand tab's job
("realistic expectations", "deeper truth", "where this can lead").

## Goals

- Show, for careers where it's genuinely real, that senior careers **fork into
  two directions**: deepen as an expert (IC) or lead people (management).
- Frame it honestly and calmly — neither track is "higher".
- Keep it **slim**: reuse the existing chip-based progression component; no new
  diagram library, no salary/years duplication, no org chart.
- Backward-compatible: careers without a real fork are unchanged.

## Non-goals (YAGNI)

- No company org chart (CEO/CFO/CIO boxes).
- No per-level salary or years-of-experience on the fork chips — that already
  lives in the separate Salary Progression chart (`getCareerProgression` levels).
- No new animation / interactivity beyond the existing chips.
- Not touching the non-forked curated careers or the AI-generated fallback.
- Not forking trades/nursing/teaching/etc. — their flat `next` already reflects
  how they grow (specialise vs run-your-own).

## Design

### 1. Data model (`src/lib/career-progressions.ts`)

Extend `CareerPathProgression` (the `entry / core / next` shape used by
`getCareerPathProgression`), fully backward-compatible:

```ts
export interface CareerPathProgression {
  entry: string[];
  core: string[];
  next?: string[];        // flat "grows into" — default, today's behaviour
  nextExpert?: string[];  // 🛠 deepen as an individual contributor (IC)
  nextLead?: string[];    // 👥 move into people / management
}
```

**Render rule:** a career shows the two-track fork **iff both** `nextExpert`
and `nextLead` are present. Otherwise it renders the flat `next` exactly as
today. "Senior" folds in as the first step of the expert track
(Senior → Staff → Principal), so the flow stays **three stages**, not four.

Populate the fork for the curated set (~25–30 careers, opt-in): software /
frontend / backend / mobile / data-scientist / data-engineer / ai-engineer /
security-engineer / devops / sre / cloud-engineer / qa-engineer / ux-designer,
plus finance-leaning (accountant, management-consultant, business roles),
science (lab-technician), and architect. Each: split the existing `next` roles
across the two tracks and add the missing side. Example:

```ts
"software-developer": {
  entry: ["Coding Bootcamp Grad", "Junior Developer", "Intern"],
  core:  ["Software Developer", "Full-Stack Developer"],
  nextExpert: ["Senior Developer", "Staff Engineer", "Principal Engineer", "Architect"],
  nextLead:   ["Tech Lead", "Engineering Manager", "Director of Engineering"],
},
```

Everything else keeps `next` (or the AI fallback) untouched.

### 2. Component (`src/components/careers/CareerProgressionFlow.tsx`)

Currently built but **rendered nowhere**. Update it to accept the new optional
fields:

- If `nextExpert`/`nextLead` are present, render the third stage as **two small
  labelled rows** instead of one chip row:
  - `🛠 Expert` — chips from `nextExpert`
  - `👥 Lead` — chips from `nextLead`
- Otherwise render the flat `next` row as today.
- Under a forked flow, one calm caption: *"Two ways to grow — deepen your craft
  or lead people. Neither is higher; they're different directions."*
- Reuse existing chip styling, `ChevronRight` connectors, and the
  desktop-horizontal / mobile-stacked responsive behaviour.

Target layout:

```
ENTRY          CORE             HOW THIS ROLE GROWS
Junior Dev  →  Developer    →   🛠 Expert:  Senior Dev · Staff Eng · Principal · Architect
                                👥 Lead:    Tech Lead · Eng Manager · Director
                                ⓘ Two ways to grow — neither is "higher".
```

### 3. Wiring into the Understand tab (bundle-clean)

The component needs the `{entry, core, next/nextExpert/nextLead}` shape from
`getCareerPathProgression`. **Correction from the initial sketch:** the existing
`detailsData.progression` from `/api/career-details/[id]` is the *other*
progression shape — `getCareerProgression` levels (`{level, title,
yearsExperience, salaryRange}`) — not the path shape. So:

- Extend `/api/career-details/[id]/route.ts` to also return
  `pathProgression: getCareerPathProgression(careerId)` alongside the existing
  `progression` (levels). This keeps `career-progressions.generated.json` and
  `career-progressions.ts` **server-side only** — no client bundle import added.
- In the Understand tab (`my-journey` UnderstandTab), render a small section
  titled **"How this role grows"**, near the "Where This Can Lead" specialisms,
  using `<CareerProgressionFlow progression={detailsData.pathProgression} />`.
  The component returns `null` when there's no data, so the section is simply
  absent for careers without progression data.

### 4. Copy / tone

- Section title: **"How this role grows"** (calm; avoid "Career Ladder" /
  corporate framing).
- Track labels: `🛠 Expert` and `👥 Lead` (or "Lead people").
- The anti-hierarchy caption (above) is the key honest message.

## Affected files

- `src/lib/career-progressions.ts` — add `nextExpert?`/`nextLead?` to the
  interface; populate the curated ~25–30 careers.
- `src/components/careers/CareerProgressionFlow.tsx` — conditional two-track
  render + caption.
- `src/app/api/career-details/[id]/route.ts` — also return `pathProgression`.
- `src/app/(dashboard)/my-journey/page.tsx` — render the new section in the
  Understand tab from `detailsData.pathProgression`.

## Testing

- Unit: `CareerProgressionFlow` renders two labelled rows when both fork fields
  present; renders the single `next` row otherwise; renders `null` when empty.
- Data integrity: every forked career has both `nextExpert` and `nextLead`
  non-empty (a career with only one fork field is a curation error).
- Visual: headless-Chrome screenshot of the Understand section for a forked
  career (software-developer) and a non-forked one (electrician) at desktop +
  mobile widths.

## Open questions

None blocking. (Track-label wording — "Lead" vs "Manage" vs "Lead people" — can
be finalised in implementation.)

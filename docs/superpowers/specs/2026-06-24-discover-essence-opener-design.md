# Discover tab: job-first opener

**Date:** 2026-06-24
**Status:** Approved (owner), ready to implement
**Surface:** My Journey → Discover tab, the role-overview sentence at the top.

## Problem

The opening sentence in the Discover tab describes the *type of person* who
suits the job, never the job itself. For "Construction Project Manager" it reads:

> "This role suits people who are practical, hands-on people who like seeing
> real results, enjoy physical work and problem-solving, and take pride in
> doing a job properly. Demand is high and growing."

A 15–23 year old who doesn't already know what the role *is* learns nothing
about the actual work — they get a personality result for a job they can't yet
picture. This is not a one-career bug: the opener template reads **only** the
`whoThisIsGoodFor` traits, so **every** career in the catalogue (~1,554) leads
with "who," by construction.

The "who thrives here" framing only lands *after* the reader understands the
role. Correct reading order for someone exploring:

1. **What it is** — the essence of the work (what you actually do).
2. **Who it suits** — the character/temperament that fits.
3. **Momentum** — a short demand/growth note.

## Key finding

The catalogue already has the "what" — the per-career `description` field.
A sample across 18 categories showed it is consistent, action-first, and free
of marketing fluff (avg ~17 words, 90% single-sentence, 0 missing). Examples:

- Construction Project Manager — "Run construction projects end-to-end — from
  planning and procurement to site coordination, safety, and handover. …"
- Data Scientist — "Turn messy data into clear business answers — use
  statistics, ML, and storytelling …"
- Carpenter — "Build and repair wooden structures and frameworks for buildings."

`description` is currently used in the opener **only** as a last-resort fallback
when there are no traits. We will promote it to lead the sentence.

**Consequence: no data rewrite and no generation pass are needed.** This is a
single template change.

## Design

### Scope

One change: the opener template inside `DiscoverTab()` in
`src/app/(dashboard)/my-journey/page.tsx` (~lines 611–630).

Out of scope: the `description` data itself, `dailyTasks`, the video, the
at-a-glance cards, and every other tab.

### Pure helper (testable)

Extract the sentence-assembly into a pure function, following the repo's
existing pattern of pure selectors + unit tests (e.g. `selectWelcomeBack`,
`wrapIndex`, `more-pool`). The React component calls it; the logic is tested in
isolation.

**File:** `src/lib/discover-opener.ts`
**Tests:** `src/lib/__tests__/discover-opener.test.ts`

```ts
type GrowthOutlook = 'high' | 'medium' | string | null | undefined;

interface DiscoverOpenerInput {
  description?: string | null;
  whoThisIsGoodFor?: string[] | null;
  growthOutlook?: GrowthOutlook;
}

function buildDiscoverOpener(input: DiscoverOpenerInput): string
```

The function composes up to three parts and joins them with single spaces:

1. **Essence** — the first sentence of `description`.
   - Split on the first sentence-ending period **followed by whitespace**
     (`/\.\s/`). This keeps em-dashes (`—`) and inline decimals/abbreviations
     intact, since those are not "period + space."
   - If no such break exists, use the whole (trimmed) description.
   - Guarantee a single trailing period.
   - If `description` is empty/missing, there is no essence part (see Fallbacks).

2. **Character** — built from `whoThisIsGoodFor`.
   - Reuse the existing `clean()` normaliser (strip trailing punctuation, trim,
     lowercase, strip a leading "people who are" / "those who are").
   - Take the **top 2** cleaned, non-empty traits.
   - 2 traits → `It suits {a} and {b}.`
   - 1 trait  → `It suits {a}.`
   - 0 traits → omit this part.
   - Note the phrasing changes from today's "This role suits people who are …"
     to "It suits …", because the essence has already named the role.

3. **Growth** — unchanged suffix:
   - `high`   → `Demand is high and growing.`
   - `medium` → `The field is growing steadily.`
   - else     → `This is a stable career.`

Result = `[essence] [character] [growth]` (omitted parts simply drop out).

### Fallbacks (never render worse than today)

- **No `description`** → fall back to the current trait-only sentence
  ("This role suits people who are …") + growth. This preserves today's exact
  behaviour for any career that somehow lacks a description.
- **No traits** → essence + growth (still job-first).
- **Neither** → growth only (matches the degenerate case today).

Because the catalogue has 0 missing descriptions, in practice every career gets
essence-first; the fallbacks exist purely for safety.

### Component change

Replace the inline IIFE at `my-journey/page.tsx:611–630` with a single call:

```tsx
<p className="text-sm text-foreground/70 leading-[1.8]">
  {buildDiscoverOpener({
    description: career.description,
    whoThisIsGoodFor: dDetails?.whoThisIsGoodFor,
    growthOutlook: career.growthOutlook,
  })}
</p>
```

The growth suffix moves *into* the helper (it was previously appended in JSX),
so the suffix logic is covered by the same unit tests.

## Testing

Unit tests on `buildDiscoverOpener`:

| Case | Input | Expectation |
|---|---|---|
| Normal | Construction PM description + 3 traits, high | essence first sentence only, then "It suits {a} and {b}.", then "Demand is high and growing." |
| Em-dash, no period | Data Scientist ("… answers — use … decisions.") | whole sentence kept, em-dash not treated as a break |
| Short single sentence | Carpenter ("Build and repair … buildings.") | whole description used as essence |
| Multi-sentence | Police Officer (3 sentences) | only the first sentence used as essence |
| Missing description | description undefined, 2 traits | falls back to "This role suits people who are {a} and {b}." + growth |
| Missing traits | description present, traits [] | essence + growth, no "It suits" clause |
| 1 trait | description + 1 trait | "It suits {a}." |
| Growth variants | medium / low / unknown | correct suffix |
| Trait normalisation | trait "People who are practical." | renders "practical" (leading phrase + trailing period stripped) |
| No trailing period | description without final period | period added |

## Verification

- `npm run test` (vitest) green for the new suite + no regressions.
- `npm run typecheck` clean.
- `npm run lint` clean.
- Headless-Chrome render check on a `/dev/*` preview (per repo pattern) to see
  the real opener for Construction PM and one other career before/after.

## Risks

- **Low.** Pure string assembly, single render site, comprehensive fallbacks.
- The only user-visible behaviour change is the opener wording — intended.
- A handful (<1%) of descriptions use informal "you/your" phrasing; they still
  read fine led by the first sentence. Not addressed here (data, out of scope).

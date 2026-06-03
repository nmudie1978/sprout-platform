# Career Real Voices — surface existing stories + contributed timelines (Workstream #4, slice 1)

**Date:** 2026-06-03
**Branch:** `feat/career-real-voices`

## Context

Workstream #4 = "make the top 100 careers fully deep." Owner decisions taken during brainstorming:
- **Content sourcing:** real humans only — never AI-faked testimonials. Factual fields may be AI-assisted
  + reviewed, but "voices" must be authentic.
- **First slice:** surface the real-voices data that already exists (and drive new submissions),
  because the infrastructure is built but invisible to youth.
- **Placement:** the universal **career detail sheet** (max reach — opens for any explored career).

Two moderated, real-human data models already exist in Prisma but are **not surfaced** in the youth UI:
- `CareerStory` — admin-curated video testimonials. Fields: `videoUrl`, `videoId`, `duration`, `name`,
  `jobTitle`, `company?`, `location?`, `yearsInRole?`, `careerTags[]`, `industry?`, `headline`,
  `takeaways[]`, `featured`, `published`, `uploadedBy?`.
- `CareerPathContribution` — parent/practitioner timelines via `/contribute`. Fields: `displayName`,
  `currentTitle`, `country`, `city?`, `howIGotHere`, `whatIStudied`, `firstSalary`, `hardestPart`,
  `adviceToSeventeen`, `realityOfJob`, `careerTags[]`, `videoUrl?`, `status` (PENDING/APPROVED/REJECTED),
  `reviewedAt?`, `reviewedBy?`, `submittedByEmail?`.

Both are keyed by `careerTags` (e.g. `["it-project-manager", "programme-manager"]`); the career list
uses `career.id` (e.g. `software-developer`).

## Goal

Show real practitioner voices on the career detail sheet for any career that has moderated content, with
an empty-state-first design and an always-present CTA to contribute — so the feature works today (mostly
CTA) and grows as real submissions accrue. No fabricated content; no DB migration.

## Architecture (chosen approach: dedicated API + standalone component)

### 1. `src/lib/career-voices/match.ts` (pure, unit-tested)
`matchesCareer(careerTags: string[], career: { id: string; title: string }): boolean` — normalises the
career id + title to tag form (lowercase, spaces→hyphens, strip punctuation) and returns true if any of
the item's `careerTags` overlaps. Also exports `normalizeTag(s)`.

### 2. `GET /api/careers/[id]/voices` (read-only)
- Resolve the career from `getAllCareers()` by id (404-tolerant → empty result).
- Prisma queries:
  - `careerStory.findMany({ where: { published: true, careerTags: { hasSome: tagSet } } })`
  - `careerPathContribution.findMany({ where: { status: 'APPROVED', careerTags: { hasSome: tagSet } } })`
  - `tagSet` = normalized id + title variants; refine in app with `matchesCareer` for safety.
- Map each row to a **public shape** that EXCLUDES private fields (`submittedByEmail`, `reviewedBy`,
  `uploadedBy`). A pure `toPublicStory` / `toPublicContribution` mapper (unit-tested) guarantees this.
- Order: `featured`/recent first; cap at ~6 each.
- Cache: `s-maxage` + stale-while-revalidate (like other content routes). Return `{ stories: [],
  contributions: [] }` on any error (never 500 the modal).

### 3. `src/components/career-voices/real-voices.tsx` (client)
- Fetches `/api/careers/${career.id}/voices` when the sheet opens.
- **Story card:** YouTube thumbnail (from `videoId`, links to `videoUrl`) + `name · jobTitle ·
  company?/location?` + `headline` + `takeaways`.
- **Contribution card:** `displayName · currentTitle · city?, country`; the prose prompts (How I got
  here / What I studied / First salary / Hardest part / Advice to my 17-year-old self / Reality of the
  job), collapsible to stay calm.
- **Empty-state-first:** when nothing returns, a warm "Be the first to share what this career is really
  like →" linking to `/contribute?career=<id>`.
- **Always-on CTA:** even when populated, a quiet "Know someone in this field? Share their path" → same
  link. This is the contribution flywheel.
- Calm, youth-friendly, mobile-first (matches the sheet's compact style).

### 4. Wire-in
- `<RealVoices career={career} />` inside the detail sheet's scrollable body (`career-detail-sheet.tsx`).
- `/contribute` reads `?career=<id>` and pre-adds that career to the `careerTags` picker.

## Data flow

detail sheet opens for career X → `<RealVoices>` fetches `/api/careers/X/voices` → renders stories +
contributions, or the empty-state CTA. All failures degrade to the empty-state + CTA.

## Safety / privacy (CLAUDE.md)

- Only `published` stories / `APPROVED` contributions are ever queried.
- Private fields (`submittedByEmail`, `reviewedBy`, `uploadedBy`) are stripped by the public mapper and
  never reach the client.
- No emails/phone/contact shown; `displayName` is already anonymised by design.
- Video is an external YouTube link/thumbnail (no autoplay, no tracking embed).
- No social mechanics (no likes/followers/counts) — just the content.

## Testing

- Unit: `matchesCareer` / `normalizeTag` (overlap, normalisation, no-match).
- Unit: `toPublicStory` / `toPublicContribution` — assert private fields are absent, public fields kept.
- Component: `RealVoices` empty-state (CTA present) and populated (cards render) with a mocked fetch.

## Decisions / scope guard (YAGNI)

- Deferred to later #4 slices: per-item **report** affordance (content is pre-moderated), **regional
  salary**, and the **factual-field backfill** (workSetting/sector/day-in-life) for the top 100.
- "Top 100" ranking is NOT needed for this slice — voices surface for any career that has content. The
  ranking matters for the later factual-backfill slice.
- No DB migration — both models already exist. Purely additive read API + UI + a query-param pre-fill.

## Out of scope / non-goals

- Generating or seeding any voice content (must be real humans; owner/team adds via admin or /contribute).
- Changing moderation flows (existing admin review stays as-is).

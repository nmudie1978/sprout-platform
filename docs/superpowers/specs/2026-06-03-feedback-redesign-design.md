# Feedback Section Redesign — Design Spec

**Date:** 2026-06-03
**Status:** Approved (design), pending implementation plan
**Author:** Claude (brainstormed with owner)

## Problem

The `/feedback` section is a fixed beta survey whose content no longer
matches the platform. It references removed/retired concepts:

- A "Small jobs and experience" clarity topic (the Small Jobs / jobs
  marketplace was intentionally removed — see CLAUDE.md
  `<removed_features_strict>`).
- A "Choosing a primary vs secondary goal" clarity topic and a Likert
  question framed around having a "main goal" (the secondary-goal
  concept is being retired; the product centres on one primary goal).

The nav entry promises "Share feedback, report a problem, or suggest an
idea," but the form only delivers a five-question Likert survey plus a
free-text box and a stale topic picker. The redesign closes that gap and
re-aligns feedback with current functionality.

## Decision Summary (from brainstorming)

- **Depth:** Full redesign of the experience (not a minimal copy fix).
  Accepted that this breaks comparability with old pilot Likert data —
  acceptable for a beta.
- **Core model:** Typed feedback — the user picks a *kind* and
  (optionally) an *area*, then writes freely.
- **Role question:** Kept but **optional**; the age label is corrected
  to "Teen (15–23)".
- **Data-model strategy:** Approach A — additive, non-destructive
  migration (no column drops, safe on prod).

## Current State (for reference)

- **User form:** `src/app/(dashboard)/feedback/page.tsx` — role radio,
  five Likert questions (q1–q5), free text (`confusingText`, ≤500),
  `clarityTopics` multi-select (contains the stale topics).
- **API:** `src/app/api/feedback/route.ts` — Zod validation, contact-info
  rejection + sanitisation, stores to `prisma.feedback`. Supports
  authenticated and anonymous submission, `?source=` tag.
- **Stats:** `src/lib/feedback-stats.ts` — Likert aggregation +
  `CLARITY_TOPIC_LABEL` map (holds stale labels).
- **Admin:** `src/app/(dashboard)/admin/feedback/page.tsx` — Likert
  stats, role pie, clarity-topics pie, free-text feed, CSV export.
- **Tests:** `src/lib/__tests__/feedback-stats.test.ts`.
- **Seed:** `scripts/seed-pilot-feedback.ts`.
- **Model:** `Feedback` in `prisma/schema.prisma` (lines ~1817). `role`
  and `q1`–`q5` are **NOT NULL**; `confusingText`, `clarityTopics`,
  metadata fields are nullable. `FeedbackRole { TEEN_16_20,
  PARENT_GUARDIAN, ADULT_OTHER }`.

## Target Design

### 1. Data model — `prisma/schema.prisma`

New enums:

```prisma
enum FeedbackKind {
  CONFUSED   // "Something confused me"
  PROBLEM    // "Found a problem"
  IDEA       // "I have an idea"
  PRAISE     // "Something I liked"
}

enum FeedbackArea {
  JOURNEY          // My Journey (Discover / Understand / Clarity)
  CAREER_RADAR     // My Career Radar
  EXPLORE_CAREERS  // Explore / browse careers
  LIBRARY          // My Library
  CAREER_TWIN      // Career Twin
  OTHER            // Something else / general
}
```

`Feedback` model changes:

- **Add** `kind FeedbackKind?` — required at the app layer; nullable in
  DB so legacy rows remain valid.
- **Add** `area FeedbackArea?` — optional.
- **Add** `message String? @db.VarChar(1000)` — the free-text body.
- **Relax** `role FeedbackRole?` (now optional).
- **Relax** `q1 Int?` … `q5 Int?` (legacy; no longer collected).
- **Keep** `confusingText`, `clarityTopics`, `source`, `userAgent`,
  `appVersion`, `createdByUserId`, timestamps — unchanged.
- **Add** indexes `@@index([kind])`, `@@index([area])`.

`FeedbackRole` enum is **unchanged** — keep the value `TEEN_16_20` and
re-label it "Teen (15–23)" in the UI only, to avoid a fragile
enum-value migration. (Minor internal naming wart, deliberately
accepted; documented here so it isn't "fixed" by surprise.)

**Migration:** additive columns + new enums + relaxing NOT NULL on
`role`/`q1`–`q5`. No drops, no data loss → safe to run on prod. Legacy
pilot rows keep their Likert values and simply have null `kind`/`area`/
`message`.

### 2. User form — `src/app/(dashboard)/feedback/page.tsx` (rewrite)

Calm single page in the warm/calm design system. Sections top to bottom:

1. **Header** — title + one-line subtitle; keep the "Beta" badge.
2. **Kind** (required): four soft selectable cards —
   - "Something confused me" (`CONFUSED`)
   - "Found a problem" (`PROBLEM`)
   - "I have an idea" (`IDEA`)
   - "Something I liked" (`PRAISE`)
3. **Area** (optional): selectable chips — My Journey, Career Radar,
   Explore Careers, My Library, Career Twin, Something else (`OTHER`).
4. **Message** (required, ≤1000 chars): textarea whose placeholder
   adapts to the chosen kind (e.g. confused → "What were you trying to
   do, and where did it get unclear?"). Keep the "please avoid sharing
   personal contact details" hint.
5. **You are…** (optional): Teen (15–23) / Parent–Guardian / Adult.
6. **Submit** → calm thank-you state ("Thank you — this genuinely helps
   us make Endeavrly clearer.").

Behaviour:

- Submit disabled until a `kind` is chosen and `message` is non-empty.
- Preserve anonymous + authenticated submission and the `?source=`
  query tag.
- Client-side length guard mirroring the server limit.
- No Likert grid, no clarity-topic list.

### 3. API — `src/app/api/feedback/route.ts` (rewrite)

- Zod schema:
  - `kind`: enum, **required**.
  - `area`: enum, optional.
  - `message`: string, **required**, 1–1000 chars after trim.
  - `role`: enum, optional.
  - `source`: optional, ≤50 chars (unchanged).
- Keep the existing **contact-info detection** (reject email/phone/
  "contact me" phrasing with a 400 + field error) and whitespace/length
  sanitisation, applied to `message`.
- Persist `kind`, `area`, `message`, `role`, metadata. Leave Likert /
  `clarityTopics` null on new rows.
- Keep auth-optional behaviour, `createdByUserId` set when logged in.
- Success: 201 `{ success: true, message: "Thank you for your feedback!" }`.

### 4. Stats + Admin — re-implement

`src/lib/feedback-stats.ts`:

- Remove Likert aggregation and `CLARITY_TOPIC_LABEL`.
- Add label maps for `FeedbackKind` and `FeedbackArea` (and reuse the
  role labels with the corrected teen label).
- Add aggregation helpers: counts by kind, counts by area, counts by
  role, and a `legacyCount` (rows with no `kind`, i.e. old Likert
  submissions) so they're acknowledged, not silently dropped.
- CSV export reflects the new columns (kind, area, role, message, date).

`src/app/(dashboard)/admin/feedback/page.tsx`:

- Replace Likert stat blocks + clarity pie with:
  - Summary counts by **kind** (4 buckets), by **area**, by **role**.
  - A **filterable feed** of messages: kind badge · area · role · date ·
    text. Filters by kind and area.
  - Small "N legacy responses" note linking nowhere (informational).
  - Keep the CSV export button.

### 5. Tests + seed

- `src/lib/__tests__/feedback-stats.test.ts`: rewrite around the new
  aggregation helpers and label maps (kind/area/role counts, legacy
  count). Remove `SMALL_JOBS` / `PRIMARY_VS_SECONDARY_GOAL` fixtures.
- `scripts/seed-pilot-feedback.ts`: generate records in the new shape
  (random kind, optional area, plausible messages, optional role). No
  stale topics.

## Out of Scope

- No change to the nav entry/tooltip (already fits the new model).
- No dropping of legacy columns (deferred; not needed).
- No NPS/numeric ratings (explicitly chose typed feedback over ratings).
- No multi-step wizard — single calm page.

## Risks / Notes

- **Prod migration:** additive + nullable-relax only; verify the
  generated SQL contains no `DROP` before applying. Per project history,
  build auto-runs migrations and RLS can block drops — none expected
  here.
- **Parallel WIP:** the working tree currently carries an unrelated
  parallel-agent "secondary-goal removal" refactor. Implementation must
  happen in an isolated worktree off `origin/main` and commit only the
  feedback files (same isolation pattern used for PRs #117/#118).
- **Enum naming wart:** `TEEN_16_20` value retained intentionally (see
  §1).

## Affected Files

1. `prisma/schema.prisma` (+ generated migration)
2. `src/app/(dashboard)/feedback/page.tsx` (rewrite)
3. `src/app/api/feedback/route.ts` (rewrite)
4. `src/lib/feedback-validation.ts` (new — extracted Zod schema + contact
   detection + sanitisation, so the API contract is unit-testable)
5. `src/lib/feedback-stats.ts` (re-implement aggregation/labels/CSV)
6. `src/app/(dashboard)/admin/feedback/page.tsx` (re-implement)
7. `src/components/admin/feedback-report.tsx` (**delete** — the
   Likert/recharts report is replaced by calm inline CSS-bar summaries
   on the admin page; recharts stays a dependency for other surfaces)
8. `src/lib/__tests__/feedback-stats.test.ts` (rewrite)
9. `src/lib/__tests__/feedback-validation.test.ts` (new)
10. `scripts/seed-pilot-feedback.ts` (rewrite)

`src/app/api/admin/feedback/export/route.ts` needs **no change** — it
calls `feedbackToCsv` (updated) and its optional `?role=` filter still
uses unchanged enum values.

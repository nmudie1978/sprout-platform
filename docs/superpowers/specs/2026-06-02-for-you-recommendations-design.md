# "For You" Recommendations — Design Spec

**Date:** 2026-06-02
**Status:** Approved design — ready for implementation planning
**Author:** brainstormed with owner (nickymudie)

---

## Problem

The platform captures rich interest signal — a user completes journeys and sets an
interest level (high / medium / low) per career — but does nothing *outbound* with it.
This is the root of the #1 product weakness from the executive assessment: **no
retention loop**. Worse, the interest signal lives only in the browser
(`src/hooks/use-interest-level.ts`, localStorage), so the server can't act on it at all.

The owner's scenario: once the app knows a user leans Doctor + Psychologist, it should
calmly surface *relevant things* on return — "an insightful video about becoming a
doctor", "a medicine taster weekend next month" — turning stored interest into a reason
to come back.

## Goal

A single, calm, pull-based **"For You"** row on the dashboard that surfaces personalised
**content** and **opportunities** keyed off the user's stated career interests — built on
a newly server-persisted interest signal.

## Non-Goals (explicit, YAGNI)

- **No job vacancies.** Opportunities are events / open days / tasters / webinars only.
  Surfacing live job listings would reintroduce the jobs marketplace
  (`<removed_features_strict>` in CLAUDE.md) and is age-inappropriate for 15–23 explorers.
- **No push notifications / email.** Pull-based only (youth-safety rules: no spam
  notifications). The in-app row is the entire delivery mechanism for v1.
- **No engagement-maximising ranking.** Rank by interest-relevance + recency, never by
  predicted clicks / time-on-app. The Journey "clarity, not addiction" rule applies.
- **No "adjacent careers to explore"** recommendations and **no journey-step nudges** in
  v1. (Considered and deferred — the matching engine is *not* a v1 dependency.)
- **No cron / precompute / cache table.** Everything is computed on read from
  already-persisted data.
- **No behavioural profiling.** Recommendations key off interest the user *explicitly
  set*, not inferred behaviour (privacy-by-design).

## Chosen Approach — "Deep-link recommender"

(Approaches B "precomputed feed" and C "live-fetch aggregator" were rejected: B adds cron
+ cache-invalidation infra for an unvalidated feature; C makes the dashboard slow and
fragile against YouTube rate limits.)

One server module builds a typed, capped, de-duplicated list from DB-backed signals.
Opportunities come straight from the `CareerEvent` table. **Content items deep-link into
the journey content that already renders** (`/api/career-stories`, `/api/career-reality`)
rather than re-fetching or embedding video on the dashboard. No external calls on
dashboard load, no cron, no cache. Smallest correct version.

---

## Architecture

### 1. Interest persistence (the foundation)

This is the enabling change — without it, recommendations (and any future
re-engagement) are impossible because the signal is browser-only.

**Prisma model** (`prisma/schema.prisma`, additive migration):

```prisma
/// A user's explicitly-set interest level in one career. Youth signal data —
/// always query by userId; cascade-delete; included in account export.
model CareerInterest {
  id        String   @id @default(cuid())
  userId    String
  careerId  String
  level     String   // "HIGH" | "MEDIUM" | "LOW"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, careerId])
  @@index([userId])
}
```

Add `careerInterests CareerInterest[]` to the `User` model. Migration is **additive**
(new table only) — safe to auto-apply via the build's `prisma migrate deploy`.

**Route** `src/app/api/interest/route.ts`:
- `GET` → the user's interest map `{ careerId: level }`.
- `PUT` → upsert one `{ careerId, level }` (or `DELETE`-equivalent when cleared).
- Strictly user-scoped (session-derived `userId`), rate-limited like other write routes.

**Hook migration** (`src/hooks/use-interest-level.ts`): keep localStorage as an
**optimistic cache** for instant UI, but write through to `PUT /api/interest`. On first
authenticated load after deploy, run a **one-time reconcile**: if localStorage holds
interests the DB doesn't, push them up so no existing signal is lost. localStorage remains
the offline/unauthenticated fallback.

**Privacy** (parity with the Twin-memory plan): cascade-delete with the user; include
`careerInterests` in `src/app/api/account/export/route.ts`.

### 2. Recommendation builder — `src/lib/recommendations/`

Server-only module. Reads only already-persisted data:

| Signal | Source | Use |
|---|---|---|
| Interest levels | `CareerInterest` (DB) | primary driver; HIGH weighted above MEDIUM; LOW excluded |
| Primary goal | `JourneyGoalData.goalTitle` (`isActive`) | tie-breaker / boost |
| Quiz industries | `CareerQuizResult.topIndustries` | tie-breaker; sector hints for events |
| Country | `User.country` (if set) | opportunity locality filter (see §opportunities) |

**Output** — a unified, typed list:

```ts
type Recommendation =
  | { kind: "content"; careerId: string; careerTitle: string;
      contentType: "stories" | "reality"; reason: string; href: string }
  | { kind: "opportunity"; eventId: string; title: string; eventType: string;
      startDate: string; reason: string; href: string };
```

- **Content items** deep-link (`href`) into that career's journey tab where the stories /
  reality content already renders. The dashboard does **not** fetch or embed video.
- **Opportunity items** come from `CareerEvent`, filtered to the user's interest careers
  by sector/keyword (exact `CareerEvent` tagging field to be confirmed at planning),
  **upcoming only**, ordered by `startDate`.

**Ranking & guardrails (baked into the builder, not the UI):**
- **Cap** at ~6 items total.
- **Diversify across the user's top interests** — never 6 cards for one career; spread
  across the top 2–3 interest careers.
- Rank by interest-relevance + recency (events) — **never** predicted clicks.
- Every item carries a plain-English `reason` ("Because you're exploring Doctor").
- Deterministic given the same inputs (testable).

**Opportunities & country (v1 decision):** `CareerEvent` data is currently Norway-focused
(providers in `src/lib/events/providers/`). v1 filters opportunities to the user's
`country` when set; if the user's country has no event data yet (e.g. the Spain pilot,
whose data layer isn't built), the **opportunities lane simply yields nothing** and the
row falls back to content-only — no empty/foreign events shown. No new country work in
this spec; it composes cleanly with the localization layer later.

### 3. "For You" dashboard row — `src/components/dashboard/for-you-row.tsx`

- One calm section rendered below the Career Twin CTA on
  `src/app/(dashboard)/dashboard/page.tsx`.
- Horizontal, **finite** (no infinite scroll). Each card: icon (video / event), title, the
  "Because you're exploring X" line, one CTA.
- **Per-item dismiss** persisted in localStorage (same pattern as `CareerTwinCta`).
- **Empty state:** when there's no interest signal yet, a gentle "explore a career to
  start" nudge — not a broken/blank row.
- Fed by a small `GET /api/recommendations` (thin wrapper over the builder) or a server
  component reading the builder directly (decided at planning).

---

## Data Flow

```
User sets interest (high/med/low) in a career
        │  use-interest-level.ts (optimistic localStorage)
        ▼
PUT /api/interest ──► CareerInterest (DB, user-scoped)
        ⋮  (later visit, dashboard load)
src/lib/recommendations/  reads: CareerInterest + JourneyGoalData
        │                        + CareerQuizResult + User.country
        │  builds typed, capped, diversified list
        │   • content → deep-link into existing journey content
        │   • opportunity → CareerEvent (upcoming, country-filtered)
        ▼
for-you-row.tsx  renders calm finite row, per-item dismiss, empty state
```

## Error Handling

- Builder is defensive: any single signal source failing (no quiz, no goal, no events)
  degrades gracefully to the signals that remain; never throws to the dashboard.
- No interest at all → empty-state nudge (not an error).
- `/api/interest` write failure → optimistic localStorage value stays; surfaced via the
  existing toast pattern; reconciled on next successful write.
- Events query failure → opportunities lane yields nothing; content still renders.

## Testing

Same shape as the Twin-memory plan — **pure logic unit-tested, wiring verified manually.**

- **Unit (Vitest):** ranking + diversification (no single-career flooding), the ~6 cap,
  HIGH-over-MEDIUM weighting, LOW exclusion, reason-string formatting, country fallback
  to content-only, empty-signal → empty result.
- **Manual:** set interests in the UI → reload → confirm `CareerInterest` rows persist
  (Prisma Studio) and the "For You" row reflects them; dismiss persists; account export
  includes `careerInterests`; a user whose country has no events sees content-only.

## Dependencies & Synergy

- **Self-contained.** Uses data that is already (or newly, via §1) server-side. The
  matching engine is **not** required for v1.
- **Strengthens the Career Twin memory plan for free:** once `CareerInterest` exists,
  `TwinMemory.quizLabels` can be enriched with real interest labels — *noted, not coupled*.
- Pays down the executive-assessment retention-loop debt by moving the interest signal
  server-side (cross-device, future email/nudge-ready) without building push.

## File Touch List (for planning)

| File | Change |
|---|---|
| `prisma/schema.prisma` + new migration | add `CareerInterest` model + `User` relation |
| `src/app/api/interest/route.ts` (create) | GET/PUT upsert interest, user-scoped |
| `src/hooks/use-interest-level.ts` (modify) | write-through to API + one-time reconcile |
| `src/lib/recommendations/` (create) | builder + pure ranking/diversify/reason logic |
| `src/lib/recommendations/__tests__/*.test.ts` (create) | unit tests for pure logic |
| `src/app/api/recommendations/route.ts` (create, optional) | thin builder wrapper |
| `src/components/dashboard/for-you-row.tsx` (create) | the calm finite row + dismiss + empty state |
| `src/app/(dashboard)/dashboard/page.tsx` (modify) | mount the row below Career Twin CTA |
| `src/app/api/account/export/route.ts` (modify) | include `careerInterests` in export |
```

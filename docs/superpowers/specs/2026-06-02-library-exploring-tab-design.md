# Design Spec — My Library "Exploring" Tab

**Date:** 2026-06-02
**Status:** Approved (brainstorm) — pending implementation plan
**Author:** owner + Claude

---

## Summary

Add a fourth tab, **"Exploring"**, to My Library (`/library`). It surfaces the
careers a user has explored in My Journey as a **single ranked list grouped by
career category**, ranked by the user's own **interest rating (★ 1–5)**, with a
quiet **✓ Explored** badge on careers whose journey is complete.

This is the first **server-backed** My Library tab. Saved / Compared /
Reflections remain localStorage-only and are explicitly **out of scope** for
this work. Delivering "Exploring" requires persisting two signals that are
currently localStorage-only — the interest rating and journey-completion stage —
which doubles as the long-flagged retention-loop fix (cross-device, survives
logout, enables "pick up where you left off").

## Goals

- A calm, ranked, categorised view of "the careers you're exploring".
- Persist interest rating and journey completion **server-side** as the source
  of truth.
- No behavioural tracking, no comparison/social mechanics, no gamification.
  Interest is an **explicit self-rating**; completion is an **explicit action**
  (the user worked through the journey).

## Non-goals (YAGNI)

- Not migrating Saved / Compared / Reflections to the server.
- No new interest UI — reuse the existing `InterestLevelPicker`.
- No category taxonomy changes — reuse `getCategoryForCareer()`.
- No re-engagement notifications in this work (the persistence it adds is what
  *enables* that later; we don't build it here).

---

## Current state (verified in code)

| Signal | Source today | Server-persisted? |
|---|---|---|
| Explored-journeys list | `JourneyGoalData` via `/api/journey/goal-data/list` | ✅ Yes |
| Career category | `getCategoryForCareer()` (static catalog, `src/lib/career-pathways.ts`) | ✅ Yes (static) |
| Completion stage (D/U/C) | localStorage lens flags (`src/lib/journey/lens-progress.ts`) | ❌ No — device-local |
| Interest rating (★1–5) | localStorage (`src/hooks/use-interest-level.ts`, key `endeavrly-interest-level:{userId}:{careerId}`) | ❌ No — device-local |

- My Library page: `src/app/(dashboard)/library/page.tsx` (`"use client"`).
- Tab config: `src/lib/library/tabs.ts` (`LIBRARY_TABS`, `LibraryTab` type).
- `JourneyGoalData.journeyCompletedSteps String[]` exists but is **never
  written** today (`prisma/schema.prisma` ~line 2909; abandoned by the
  roadmap-first model per comment in `api/journey/goal-data/route.ts`).
- No `CareerInterest` model or `/api/career-interest` route exists.

---

## Data model (Approach B — split)

Interest is per-career (any browsed career is ratable); completion is inherently
per-journey. They are persisted separately.

### New: `CareerInterest`

```prisma
model CareerInterest {
  id        String   @id @default(cuid())
  userId    String
  careerId  String
  level     Int      // 1–5 (validated at the API layer)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, careerId])
  @@index([userId])
}
```

- Mirrors the existing localStorage key (`userId` + `careerId`).
- Cascades on user delete (GDPR/minimal).
- Add the matching `careerInterests CareerInterest[]` back-relation on `User`.

### Reuse: `JourneyGoalData.journeyCompletedSteps`

- Write confirmed lens keys into the existing empty `String[]`:
  `["discover","understand","clarity"]`.
- **Completed ✓** = array contains `"clarity"` (matches today's
  `journeyStageLabel` logic where Clarity ⇒ "Complete").

---

## Write paths

### Interest — `PUT /api/career-interest`

- Body `{ careerId: string, level: 1|2|3|4|5 }`; auth required; validate
  `level ∈ [1,5]` and that `careerId` resolves to a known career.
- Upsert on `(userId, careerId)`.
- `useInterestLevel` (`src/hooks/use-interest-level.ts`) keeps its localStorage
  write as an **optimistic cache** and additionally fires the server upsert.
  Server is the source of truth; localStorage is the fast/offline layer.
- `InterestLevelPicker` is unchanged.

### Completion — extend `PATCH /api/journey/goal-data`

- The `lens-progress.ts` setters (`setDiscoverConfirmed`,
  `setUnderstandConfirmed`, `markClarityActive`) additionally PATCH the
  goal-data route to append the corresponding lens key to
  `journeyCompletedSteps`.
- **Integration constraint:** completion attaches to the `JourneyGoalData` row
  for that career. Any career shown in the Exploring tab has such a row (it is,
  by definition, an explored journey), so the scope is correct. Confirm during
  planning that the row exists at the moment a lens is confirmed; if a lens can
  be confirmed before a row exists, create/upsert the row first.

---

## Read path — the "Exploring" tab

### Wiring

- `src/lib/library/tabs.ts`: add `{ key: "exploring", label: "Exploring" }` to
  `LIBRARY_TABS`, add `"exploring"` to `LibraryTab` and the `KNOWN` set.
- `src/app/(dashboard)/library/page.tsx`: add `ExploringTab` to the content
  switch.

### Data

`ExploringTab` fetches:
1. Explored journeys — existing `/api/journey/goal-data/list` (gives career +
   `journeyCompletedSteps`).
2. Interest levels — new `GET /api/career-interest` (all of the user's
   ratings).

Joined by career.

### Group + rank (pure, unit-tested function)

- Group by `getCategoryForCareer(careerId)`.
- **Category order:** by the highest interest rating within each category
  (the category holding the user's top-rated career comes first).
- **Within a category:** interest desc, then career title asc as tiebreaker.
- Careers with no category → a final **"Other"** group.
- Single-item categories **still render a header**.

### Row

- Career emoji + title · `✓ Explored` badge when complete · ★ interest rating ·
  taps through to that career's journey.
- Interest can be adjusted inline via the existing picker (optional — confirm in
  plan; at minimum it is displayed).

### Empty state

> "Careers you explore will show up here, ranked by how interested you are."

---

## localStorage → server backfill (one-time)

Existing users hold interest/completion only in their browser. On first load of
the Exploring tab after deploy:

- For each career: if the server has **no** `CareerInterest` but localStorage
  does, upsert it to the server. Likewise append any locally-confirmed lens
  flags to `journeyCompletedSteps` if absent server-side.
- Idempotent; runs once per device (guard with a localStorage "synced" marker).
- Prevents silent data loss for current users.

---

## Safety / privacy / journey alignment

- **Safety:** no social, comparison, or open-communication mechanics.
- **Privacy:** interest is a low-sensitivity explicit self-rating; no behavioural
  profiling, no dwell-time/view-count tracking. Cascades on user delete.
- **Journey alignment:** reinforces Discover → Understand → Clarity by giving
  explored journeys a calm home; completion is a quiet badge, not a score or
  streak. Passes the North Star: it helps the user see what futures they're
  weighing and how far they've thought each through.

---

## Testing

- **Unit:** group-and-rank function — category ordering by top interest,
  within-category interest desc + title tiebreak, "Other" bucket, single-item
  headers, empty input.
- **API:** `career-interest` route — auth required, upsert behaviour, `level`
  validation (reject <1 / >5 / non-int), unknown `careerId` rejected.
- **Completion write:** confirming a lens appends the right key to
  `journeyCompletedSteps` and is idempotent.
- **Backfill:** runs once, is idempotent, and does not overwrite newer
  server values.

---

## Open items to confirm during planning

1. Exact `JourneyGoalData` row guarantee at lens-confirm time (create-if-absent
   vs. assume-exists).
2. Whether the Exploring tab allows inline interest editing or display-only v1.
3. Migration naming + Supabase RLS handling for the new table (RLS policies must
   be created if the project enforces them — see prior DROP/CREATE RLS gotchas).

# Dashboard Server-Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make all four dashboard content types survive a device/browser change — move Saved Careers, Reflections, Journey-stage progress, and Interest levels off browser `localStorage` onto server persistence, without losing existing users' local data.

**Architecture:** Reuse the server infra that already exists (`reflections-service` → `JourneyReflection`, `CareerInterest` + `/api/career-interest`, `JourneyGoalData.journeyCompletedSteps` + `/api/journey/completion(/sync)`); build the one genuinely-missing store (Saved Careers); then rewire each client hook to be **server-authoritative with a localStorage offline cache**, and run a **one-time per-user backfill** (push localStorage → server when the server has none) so nothing is lost on cutover.

**Tech Stack:** Next.js App Router (route handlers + server actions), Prisma/Postgres, NextAuth (session = `profileId`/`userId`), TanStack Query, Vitest.

---

## Current state (audited 2026-06-03, origin/main `b1cfdec`)

| Content | Today | Target |
|---|---|---|
| Saved resources (articles/videos) | `SavedItem` DB ✅ (already persisted) | unchanged |
| Explored-journey goals | `JourneyGoalData` DB ✅ | unchanged |
| **Saved careers (♥)** | `useCuriositySaves` → `localStorage`, **no DB** | new `SavedCareer` table + service + API |
| **Reflections** | tray + dashboard → `localStorage` | existing `/api/journey/reflections` (`JourneyReflection`) |
| **Interest levels** | read `localStorage`; best-effort write to `CareerInterest` | read from `CareerInterest` (DB authoritative) |
| **Journey stage progress** | `lens-progress` → `localStorage` | existing `JourneyGoalData.journeyCompletedSteps` + `/api/journey/completion/sync` |

**⚠️ COLLISION NOTE:** The parallel agent is actively migrating *journey-stage progress* server-side (the `/api/journey/completion/sync` backfill endpoint already exists, taking `{ completions: { [goalId]: ("discover"|"understand"|"clarity")[] } }`). **Phase D (journey stage) is therefore high-collision.** Phases A–C are independent and clean. Build A–C first; do D last and **rebase/coordinate**, building only on the existing `journeyCompletedSteps` model (do NOT invent a competing stage model).

---

## File Structure

| File | Responsibility |
|---|---|
| `prisma/schema.prisma` + new migration | `SavedCareer` model (+ `YouthProfile.savedCareers` relation) |
| `src/lib/journey/saved-careers-service.ts` (create) | DB CRUD for saved careers (mirrors `saved-items-service.ts`) |
| `src/app/api/saved-careers/route.ts` (create) | GET (list) / POST (save) / DELETE (unsave) |
| `src/hooks/use-curiosity-saves.ts` (modify) | server-authoritative + localStorage cache + one-time backfill |
| `src/hooks/use-interest-level.ts` (modify) | reads from `/api/career-interest`; localStorage = cache |
| `src/components/.../JourneyReflectionsTray` + `src/lib/library/tabs.ts` + dashboard (modify) | reflections write/read via `/api/journey/reflections` |
| `src/lib/journey/lens-progress.ts` + dashboard (modify, Phase D) | confirm → `/api/journey/completion`; read `journeyCompletedSteps` |

A reusable one-time backfill helper pattern is used in A/C/D: on first authenticated mount, if the server returns empty AND localStorage has data, POST the local data, then treat the server as source of truth.

---

### Task A1: `SavedCareer` model + migration

**Files:** `prisma/schema.prisma`; `prisma/migrations/20260603120000_add_saved_career/migration.sql`

- [ ] **Step 1: Add the model** (after `SavedItem`):

```prisma
/// A career the youth bookmarked (the ♥ on a career). One row per
/// profile+career. Mirrors the SavedCuriosity localStorage shape.
model SavedCareer {
  id          String   @id @default(cuid())
  profileId   String
  careerId    String   // slug or catalog id
  careerTitle String
  careerEmoji String?
  note        String?  @db.Text
  savedAt     DateTime @default(now())

  profile YouthProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@unique([profileId, careerId])
  @@index([profileId, savedAt])
}
```
Add `savedCareers SavedCareer[]` to `model YouthProfile`.

- [ ] **Step 2: Migration SQL** (additive):

```sql
-- CreateTable
CREATE TABLE "SavedCareer" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "careerTitle" TEXT NOT NULL,
    "careerEmoji" TEXT,
    "note" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedCareer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SavedCareer_profileId_careerId_key" ON "SavedCareer"("profileId", "careerId");
CREATE INDEX "SavedCareer_profileId_savedAt_idx" ON "SavedCareer"("profileId", "savedAt");
ALTER TABLE "SavedCareer" ADD CONSTRAINT "SavedCareer_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "YouthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```
> ⚠️ Per [[feedback_supabase_rls_blocks_drops]] this is additive (no DROP) so RLS is not a concern here.

- [ ] **Step 3:** `npx prisma generate && npx prisma validate`; `npx tsc --noEmit` count == baseline.
- [ ] **Step 4: Commit** (`prisma/schema.prisma` + migration).

### Task A2: `saved-careers-service.ts` (mirror `saved-items-service`)

- [ ] TDD a pure mapper if any; implement `saveCareer({profileId,careerId,careerTitle,careerEmoji?,note?})` (upsert on `[profileId,careerId]`), `unsaveCareer(profileId, careerId)`, `getSavedCareers(profileId)` ordered by `savedAt desc`, `bulkSaveCareers(profileId, items[])` (for backfill, idempotent via the unique constraint / `skipDuplicates`). Resolve `profileId` from `userId` exactly as `saved-items-service` does. Commit.

### Task A3: `/api/saved-careers/route.ts`

- [ ] GET → `getSavedCareers`; POST `{careerId,careerTitle,careerEmoji?,note?}` → `saveCareer`; DELETE `?careerId=` → `unsaveCareer`; PUT `{items:[...]}` → `bulkSaveCareers` (backfill). All gated on session; resolve profile. tsc baseline. Commit.

### Task A4: Rewire `use-curiosity-saves.ts` → server-authoritative + backfill

- [ ] On mount (authed): GET `/api/saved-careers`. If server empty AND localStorage has saves → `PUT` them (backfill), then use server. Keep localStorage as a write-through cache for offline/optimistic. `addCuriosity` → optimistic local + POST; `removeCuriosity` → optimistic local + DELETE. Preserve the existing `SavedCuriosity` shape + return signature so the dashboard needs no change. Manual verify: save a career → reload in a different browser → it's there. Commit.

---

### Task B1: Interest levels read from DB (`use-interest-level.ts`)

- [ ] `/api/career-interest` already has GET (findMany) + POST (upsert). Make `useAllInterestLevels`/`useInterestLevel` read from GET (TanStack Query) as source of truth; keep `localStorage` as the optimistic/offline cache (the POST write already exists). One-time: if server empty and localStorage has levels, POST them. Dashboard already consumes `useAllInterestLevels` → no dashboard change. Manual verify cross-browser. Commit.

---

### Task C1: Reflections write via API (the tray)

- [ ] Find the reflection-writing UI (`JourneyReflectionsTray`, currently writes `localStorage` per `src/lib/library/tabs.ts` comment). Change its save to POST `/api/journey/reflections` (`recordReflection`/`createReflection` input shape — read the route). Keep an optimistic local cache. Commit.

### Task C2: Reflections read from server (dashboard + library)

- [ ] Replace `readLocalJourneyReflections(...)` on the dashboard with a fetch from `GET /api/journey/reflections` (server `JourneyReflection`). One-time backfill: if server has none and localStorage has reflections, POST them. Update `/library?tab=reflections` similarly. Manual verify cross-browser. Commit.

---

### Task D1 (⚠️ HIGH-COLLISION — do last, rebase first): Journey stage progress → server

**Pre-req:** rebase onto the very latest `origin/main` and re-check whether the parallel agent has already wired the client to `completion/sync`. If they have, this task may be a no-op or a thin read-swap — adjust accordingly; do NOT duplicate their work.

- [ ] **Write path:** where `lens-progress` confirms a stage (`setDiscoverConfirmed`/`setUnderstandConfirmed`/`markClarityActive`), also persist to the server via the existing `POST /api/journey/completion` (or `completion/sync`) keyed by the active goal's `goalId`, writing to `journeyCompletedSteps`. Keep localStorage as the offline cache.
- [ ] **Read path:** the dashboard ring/bars (`computeLensProgress`) should prefer the active goal's server `journeyCompletedSteps` (from `/api/journey/goal-data`) and fall back to localStorage. Reconcile the two systems onto `journeyCompletedSteps` (union; completion is monotonic). Do NOT add a new stage model.
- [ ] One-time: call `completion/sync` with the localStorage completions on first authed load (the endpoint already unions idempotently). Manual verify cross-browser. Commit.

---

## Cutover / data-safety
Every rewired hook keeps localStorage as an offline cache and runs an idempotent one-time backfill (server-empty + local-present → push local). No destructive migrations. Ship A, B, C as independent PRs (each is self-contained + verifiable cross-browser); ship D last after rebasing onto the parallel agent's journey work.

## Self-Review
- **Coverage:** Saved careers (A), Interest (B), Reflections (C), Journey stage (D) — all four gaps. Saved resources already done.
- **Reuse:** B/C/D reuse existing services/APIs; only A is greenfield.
- **Collision:** D explicitly flagged + sequenced last + builds on `journeyCompletedSteps`/`completion/sync` (no competing model).
- **Data safety:** offline cache + idempotent backfill on every rewire; additive migration only.

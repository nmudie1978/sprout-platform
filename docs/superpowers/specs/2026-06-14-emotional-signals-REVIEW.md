# Emotional Signals — Build Summary & Review Notes

**Date:** 2026-06-14
**Branch:** `feat/emotional-signals` (branched from `feat/landing-hero-v2`)
**Built autonomously while you were away. Nothing merged — review first.**

You asked to start with features **#1 (Arrival Check-in)** and **#3 (Confidence
Shift)** from the "meaningful emotional signals" list. Both are implemented,
tested, and integrated behind clean, self-contained components.

## ⚠️ One decision I need you to confirm

I renamed **"Confidence Shift" → "Clarity Shift"**. Reason: the team
**deliberately retired the "confidence" metric** in favour of Interest Level
(`src/lib/interest-level/types.ts`: *"replaces the old 'confidence' metric"*).
Re-introducing a 1–5 "confidence" feature would clash with that decision and be
confused with the existing interest rating. "Clarity" matches core product
language ("uncertainty → clarity → momentum") and keeps the actual value you
asked for — the before/after **shift**. If you prefer the old name, it's a
namespace/label rename only; the logic is unchanged. See
`2026-06-14-clarity-shift-design.md`.

## What was built

### Feature 1 — Arrival Check-in (sensing → respond)
Optional, self-reported "How are you arriving today?" on the dashboard.
4 calm moods (lost / curious / pressured / motivated) + "Skip for now". On tap,
collapses to an in-voice acknowledgement. Once-per-day, never blocking.

- `src/lib/arrival/types.ts` (+ tests) — pure mood model & helpers
- `prisma/schema.prisma` — `ArrivalCheckIn` model
- `src/app/api/arrival-check-in/route.ts` — GET today / POST mood (zod-style validation, YOUTH-gated)
- `src/hooks/use-arrival-check-in.ts` — load/submit/skip
- `src/components/arrival/arrival-check-in.tsx` (+ tests)
- Mounted in `src/app/(dashboard)/dashboard/page.tsx`
- i18n: `arrival` namespace in all 3 locales

### Feature 3 — Clarity Shift (closed loop)
Before/after "How clear do you feel about whether this path is right for you?"
(1–5). After both, a calm, **honest** reflection (a clarity *drop* is framed as
useful information, never spun positive).

- `src/lib/clarity-shift/types.ts` (+ tests) — scale, `computeShift`, narrative keys
- `prisma/schema.prisma` — `ClarityShift` model (before/after per career)
- `src/app/api/clarity-shift/route.ts` — GET / PUT upsert (career-slug validated, YOUTH-gated)
- `src/hooks/use-clarity-shift.ts`
- `src/components/journey/clarity-shift-{prompt,reflection,section}.tsx` (+ tests)
- Mounted in `src/components/career-detail-sheet.tsx` (youth only)
- i18n: `clarityShift` namespace in all 3 locales

## Guardrails honoured (CLAUDE.md / brand-voice)
Self-reported only (no behavioural profiling) · optional & skippable · private
(no guardian/teacher visibility) · calm, non-gamified, no streaks/points ·
minimal data · in-voice copy.

## ‼️ Required before this works at runtime
The two new tables are **not yet in the database**. I did **not** run
`prisma db push` against the live Supabase DB unsupervised. Before testing the
running app:
```
npm run db:push     # or: npx prisma db push
```
(The Prisma client is already regenerated, so typecheck/build pass without it.)

## Verification status
- **Typecheck:** my code adds **0 errors**. (One pre-existing error exists in
  `scripts/census-youtube-coverage.ts` — an untracked file I never touched.)
- **Lint:** **0 errors** on all new files; 3 `setState-in-effect` *warnings*,
  matching the existing `use-interest-level.ts` hook pattern (non-blocking).
- **New tests:** 35, all green and stable (ran 3×).
- **Full suite:** 860/865 pass. The intermittent failures are **pre-existing
  flaky tests** (`feedback-page`, `journey-report`) that pass in isolation — the
  35 new tests added parallel-load that surfaces latent timing flakiness. The
  failure set changes run-to-run (5 → 3) and none are in my code. Build status
  recorded in the commit message.

## Suggested next steps (not done — deliberately)
1. Confirm the **Clarity** vs **Confidence** name.
2. Run `prisma db push` and smoke-test on the running app.
3. Deeper Clarity-Shift integration: tie *before* to entering My Journey
   **Discover** and *after* to reaching **Clarity** (deferred — `my-journey/page.tsx`
   is 3,492 lines and deserves its own reviewed change).
4. Optional: let the Arrival mood gently tune dashboard microcopy (kept out of
   v1 to stay clear of anything resembling behavioural targeting).

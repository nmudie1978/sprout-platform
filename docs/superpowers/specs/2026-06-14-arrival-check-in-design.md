# Arrival Check-in — Design

**Date:** 2026-06-14
**Status:** Draft for review (built autonomously while user was away — review before merge)

## Why

Endeavrly's users often arrive feeling *lost, pressured, unsure, unmotivated,
or overwhelmed* (see `product.md` → User States). Today the product reacts to
what users *do*, never to how they *feel*. The Arrival Check-in is the
**sensing** half of an emotional-signal loop: a calm, optional, self-reported
"how are you arriving today?" that lets the product meet the user as they are
and respond in-voice — replacing dopamine mechanics with healthy acknowledgement.

This is feature #1 of two ("Arrival Check-in" + "Clarity Shift") chosen for
"meaningful emotional signals back to the user".

## Guardrails (from CLAUDE.md / brand-voice / design-principles)

- **Self-reported only — never inferred.** No behavioural profiling. The user
  taps a mood; we store exactly that. Nothing is derived from activity.
- **Optional & skippable.** Calm card, never a blocking modal. Dismissable.
- **At most once per day.** No nagging, no streak pressure, no guilt.
- **Calm voice.** Acknowledgement copy follows brand-voice: grounded,
  supportive, never fake-motivational ("Let's keep today light." not "You've
  got this! 💪").
- **Private.** Never shown to guardians, teachers, or anyone else.
- **Privacy-minimal data.** One row: user, mood, timestamp. No free text in v1.

## Moods (v1)

A deliberately small, calm set drawn from `product.md` user states:

| key         | label (en-GB) | acknowledgement (calm, in-voice)                                  |
|-------------|---------------|-------------------------------------------------------------------|
| `lost`      | A bit lost    | "That's okay. We'll take the next step together, nice and small." |
| `curious`   | Curious       | "Love that. Let's follow what you're curious about."              |
| `pressured` | Under pressure| "No rush here. There's no wrong pace — pick one small thing."     |
| `motivated` | Motivated     | "Great — let's turn that into a bit of momentum."                 |

Plus an always-available **"Skip for now"** that dismisses without recording.

## Architecture

Follows the existing **Interest Level** pattern exactly (pure lib → API route →
client hook → UI component → i18n → tests).

### 1. Pure module — `src/lib/arrival/types.ts`
- `ArrivalMood` union + `ARRIVAL_MOODS` metadata (key, label, acknowledgement key).
- `isArrivalMood(x): x is ArrivalMood` validator (used by the API).
- `moodAcknowledgementKey(mood)` → i18n key for the response copy.
- `isSameDay(a, b)` helper for the once-per-day rule.
- No React / DOM → unit-testable in isolation.

### 2. Data — `prisma/schema.prisma`
```prisma
model ArrivalCheckIn {
  id        String   @id @default(cuid())
  userId    String
  mood      String   // validated against ArrivalMood at the API layer
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}
```
Add `arrivalCheckIns ArrivalCheckIn[]` to `User`. Apply with `prisma db push`
(dev) — additive, no data migration. **Generated client is committed via
`prisma generate`; no destructive migration.**

### 3. API — `src/app/api/arrival-check-in/route.ts`
- `GET` → `{ today: { mood, createdAt } | null }` — the current user's check-in
  for today (drives "already checked in, don't re-prompt").
- `POST { mood }` → validates with `isArrivalMood`, creates a row, returns
  `{ success, acknowledgementKey }`. Auth via `getServerSession(authOptions)`,
  `role === "YOUTH"` (mirrors `career-interest/route.ts`).

### 4. Hook — `src/hooks/use-arrival-check-in.ts`
- Returns `{ today, submit(mood), skip(), status }`.
- On mount, `GET`s today's check-in. `submit` POSTs and optimistically sets
  `today`. `skip` sets a session-local dismissal (sessionStorage) so the card
  hides for the rest of the session without recording anything.

### 5. UI — `src/components/arrival/arrival-check-in.tsx`
- Calm `Card` with the prompt + four mood buttons + "Skip for now".
- On select: collapses to a one-line acknowledgement (the tone reflection) and
  stays acknowledged for the day.
- Renders nothing if already checked in today or skipped this session.

### 6. Integration
- Mounted near the top of the dashboard (`src/app/(dashboard)/dashboard/page.tsx`)
  — the natural session-start surface — above the main content, below any header.
- Single self-contained component import + render; no edits to dashboard logic.

### 7. i18n — `arrival` namespace in `messages/{en-GB,nb-NO,es}.json`
- `prompt`, `subtitle`, the four mood labels, the four acknowledgements,
  `skip`, `acknowledgedTitle`.

## Testing

- **Lib unit tests** (`src/lib/arrival/__tests__/types.test.ts`): validator
  accepts the four moods + rejects junk; acknowledgement key mapping;
  `isSameDay`.
- **Component test** (`src/components/arrival/__tests__/arrival-check-in.test.tsx`):
  renders the prompt; selecting a mood shows the acknowledgement and calls
  submit; "Skip for now" hides the card.

## Out of scope (v1, deliberate)

- No history/trends of mood over time (would drift toward profiling).
- No cross-feature tone propagation beyond the immediate acknowledgement (a
  future iteration could let the check-in tune dashboard microcopy; kept out to
  stay YAGNI and avoid anything resembling behavioural targeting).
- No guardian/teacher visibility.

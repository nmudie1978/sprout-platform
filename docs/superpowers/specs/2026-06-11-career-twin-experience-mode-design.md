# Career Twin — "Experience The Job" mode (design)

Date: 2026-06-11

## Goal

Add a new, additive mode to Career Twin that lets a young person *experience*
realistic moments from the selected career through guided interaction with their
future self — not storytelling, not static descriptions. The user should leave
with emotional understanding ("that's what the job actually feels like",
"I could see myself doing that", "I don't think I'd enjoy that").

**Realistic career exploration, not gamification.**

## Non-goals / must remain intact

The 7 existing chat modes and everything around them are untouched: Ask Future
Me, Study & Skills, Money & Lifestyle, Hard Truths, Doubts & Risks,
Opportunities, Next Steps — plus persona, memory, history, safeguards, library
saving, journey integration. This feature is purely additive.

## Scope (agreed)

- **Focused v1**, then tune from real use. AI-steered category mix (no
  hard-coded per-category UI).
- **Ephemeral** — the run lives in the client; nothing is persisted. No DB,
  no migration.

## Architecture

The 7 chat modes stay as-is. A new tab — **Experience The Job** — is added to
the Career Twin view. Selecting it swaps the chat panel for a guided *scenario
runner*; the future-self framing, identity and reality-check disclaimer are
unchanged.

### Server — `POST /api/career-twin/experience`

Reuses the existing plumbing: `resolveCareerContext`, `loadProfileContext`,
`buildPersona`, `CAREER_TWIN_SAFETY_RULES`, the `isResponseSafe` guardrail,
per-user rate limiting, `maxDuration = 60`. A new `buildExperienceSystemPrompt`
instructs the Twin to narrate realistic work moments **as memories** ("Let me
show you what a normal Tuesday felt like…") and to return **structured JSON**
(OpenAI `response_format: json_object`) so the client gets typed fields.

Two actions (the client holds the transcript and sends it back each turn —
stateless server, matches the ephemeral decision):

- **`start`** — input `{ careerId, length }` → returns the first
  `Scenario { index, total, category, context, situation }`.
- **`respond`** — input `{ careerId, length, transcript, currentScenario, userReply }`
  → returns `{ consequence, reflection }` for that moment, then **either** the
  next `Scenario` **or**, when the day is complete, the end-of-experience
  `fitInsights`.

The server steers the **experience-type mix** via the prompt + a deterministic
category rotation (`daily_work`, `human_interaction`, `problem_solving`,
`decision_making`, `rewarding`, `hard_reality`) so a day feels varied and is
never sugar-coated (hard-reality moments are always included). **Length** sets
the scenario count: Quick (3), Typical Day (6), Challenging Day (6, weighted to
problem-solving / decision / hard-reality / difficult human interaction).

### Pure lib — `src/lib/career-twin/experience.ts`

DB-free and unit-testable:

- Types: `ExperienceLength`, `ExperienceCategory`, `Scenario`, `Reflection`,
  `FitInsights`, `ExperienceTurn`, `ExperienceTranscript`.
- `EXPERIENCE_LENGTHS` config (label, description, total, category plan).
- `categoryForIndex(length, index)` — deterministic rotation/emphasis.
- `buildExperienceSystemPrompt(input)` — persona + profile + career + length +
  safety + structured-output contract.
- zod schemas + validators for the model's JSON (scenario / respond / fit).

### Client — `src/components/career-twin/experience-runner.tsx`

- Length picker (Quick / Typical Day / Challenging Day).
- `start` → Context + Situation narrated by the Twin → **free-text** reply
  (never multiple-choice).
- `respond` → Consequence + a Reflection card (*What this part of the job is
  really like / Skills often used here / Why some people enjoy this / Why some
  people dislike this*) → Continue → next scenario … → **Career Fit insights**
  (*What you seemed to enjoy / What you seemed less interested in / Skills you
  naturally used / Skills you might want to develop / Questions worth exploring*).
- All insights are non-deterministic ("you appeared comfortable making decisions
  under pressure, which is often important in healthcare careers"), never
  "you should become X".
- Ephemeral: React state only; a "Start over" / length re-pick resets it.

### Data flow

`experience-runner` ⇄ `/api/career-twin/experience` (start | respond) ⇄
`buildExperienceSystemPrompt` + persona + OpenAI (JSON) → validated → returned.
The client accumulates completed turns into the transcript it sends back.

## Safety

All existing `CAREER_TWIN_SAFETY_RULES` apply, plus experience-specific guards
baked into the prompt: realistic not fantasy; typical real-world situations;
include hard-reality moments; never mark a response right or wrong; never
predict, guarantee outcomes, or give medical/legal/financial certainty; never
pressure educational decisions; always "one possible future version of you".
Model output runs through the same `isResponseSafe` guardrail as the chat; on a
miss, a safe fallback is returned.

## Cost / limits

One OpenAI call per step (Typical Day ≈ 6–9 calls incl. fit insights).
Rate-limited per user via the shared Redis limiter (reuse `RateLimits.AI_CHAT`).

## Testing

Unit tests for the pure lib: length → scenario count, category rotation
coverage (every plan includes a hard-reality moment), prompt building includes
the safety rules + structured-output contract, and zod validators
accept/reject representative payloads. The endpoint + UI are exercised by the
real `next build` and a manual smoke; no network test of OpenAI.

## Success criteria

Feels like "walk in the shoes of someone who does this job", not "read about a
job" — emotional understanding over information, career-specific (a doctor's day
must not read like a project manager's), honest about the hard parts.

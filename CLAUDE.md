# CLAUDE.md — Endeavrly (Youth Community Jobs & Career Platform)

<project_context>
Endeavrly is a youth-first (ages 15–23) small jobs and career development platform.
It is safety-by-design, privacy-first, and does NOT include in-app payments.
It emphasizes skill development, responsibility signals, and structured growth — not gamification.
</project_context>


<core_principles>

1. Youth Safety First
   - No direct free-text communication between minors and adults.
   - Structured messaging only.
   - Report & moderation system must always be present.

2. No In-App Payments
   - Platform does not process payments.
   - Jobs are agreed externally.
   - Do not introduce Stripe or payment logic.

3. Privacy by Design (GDPR MVP)
   - Minimal data collection.
   - No tracking ads.
   - No behavioral profiling.
   - No dark patterns.

4. Trust Signals ≠ Social Scoring
   - Responsibility Graph is internal.
   - No public rating leaderboard.
   - No popularity metrics.

5. Journey First
   - The core UX is the Journey (Discover → Understand → Act).
   - Dashboard must reinforce journey progression.
   - Jobs are part of growth, not the only focus.

</core_principles>


<project_structure>

/app (Next.js 14 App Router)
  /dashboard
  /jobs
  /journey
  /profile
  /admin

/lib
  /auth
  /db
  /policies
  /safeguarding
  /validation

/prisma
  schema.prisma

/components
  ui/
  journey/
  jobs/

</project_structure>


<architecture_constraints>

Stack:
- Next.js 14 (App Router)
- Supabase (Auth + DB)
- Prisma ORM
- TypeScript (strict mode)

Rules:
- All data access via Prisma.
- All server logic inside Server Actions or API routes.
- Use RLS (Row Level Security) via Supabase where appropriate.
- No business logic in UI components.

</architecture_constraints>


<data_model_rules>

Core Entities:
- User (youth | adult | admin)
- Guardian (optional, for minors)
- Job
- JobApplication
- JourneyState
- Skill
- ResponsibilitySignal (internal only)
- Report
- MessageThread (structured only)

Mandatory:
- UUID primary keys.
- created_at / updated_at on all tables.
- Soft delete where appropriate.
- Age validation on signup.
- Guardian flag for under-18.

Never store:
- Excessive personal details.
- Sensitive profiling categories.

</data_model_rules>


<safeguarding_rules>

1. Structured Messaging Only
   - Predefined prompts.
   - No arbitrary text exchange if youth < 18.
   - Adults must be verified before posting jobs.

2. Reporting System
   - Every job and profile must have "Report" option.
   - Reports create admin review entries.

3. Admin Moderation
   - Admin panel must allow:
     - Suspend user
     - Remove job
     - Flag inappropriate behavior

4. No Public Contact Information Displayed
   - Emails and phone numbers hidden by default.

</safeguarding_rules>


<journey_logic>

# My Journey — Tabs-as-Content, Roadmap-Driven

## Overview

My Journey has three tabs — **Discover**, **Understand**, **Grow** — but
they are content views, NOT a stage machine. The user is free to move
between them in any order. There is no gating, no "complete N actions
to unlock the next tab", no required steps, no orchestrator, no lens
completion criteria, no DB-backed journey state. Real progression
happens inside the **Grow** tab's roadmap, where the user marks
individual roadmap steps as in-progress / done.

The legacy gating engine — `JourneyOrchestrator`, `state-machine.ts`,
`/api/journey` GET/PATCH, `/api/journey/complete`, `/api/journey/skip`,
`/api/journey/advance-to-understand`, the `journeyState` /
`journeyCompletedSteps` / `journeySkippedSteps` columns on
`YouthProfile`, the `currentLens` step-completion machine — is REMOVED.
Do not reintroduce it. New code must not import from
`src/lib/journey/orchestrator.ts` or `src/lib/journey/state-machine.ts`.

## What each tab contains

### 1. Discover — Explore the career
Calm, content-first introduction. A Day in the Life video, salary,
growth outlook, key skills, role context. Passive — no required input.
Designed to spark curiosity.

### 2. Understand — Know the role
Deeper structured view. Role reality, education paths, key skills,
courses & certifications, entry requirements, industry outlook. Real
Norwegian programmes via `getNorwayProgrammes` and certifications via
`getCertificationPath`. Optional personal notes.

### 3. Grow — Build your roadmap
The action surface. Composed of:

  a. **Foundation Card** — diagnostic of the user's starting point
     (school, track, finish year, current subjects, alignment status
     with the chosen career: Aligned / Partially aligned / Needs
     attention, plus one suggested action). Editable in place.

  b. **Personal Roadmap** — age-anchored timeline from today to a
     senior role. Branches on the user's education stage (school /
     college / university / other) and finish year. Three render
     styles (Zigzag / Rail / Steps). Per-step progress
     (not_started / in_progress / done) with sequential gating
     INSIDE the roadmap (each step unlocks when the previous is
     done — this gating is local to the roadmap, NOT the old
     lens machine). "You are here" marker derived from progress.

  c. **Momentum** — suggested next moves (LinkedIn people in
     similar roles, utdanning.no university courses for the chosen
     career, with the Norwegian programme name auto-filled). The
     user's own action list with status + delete. Suggestions
     disappear once added and reappear on delete.

  d. **Reference Content** — Real Career Paths (alternative routes
     from real people), Tools of the Trade, Real Voices videos
     (career-reality API, country-filtered to remove non-Norway
     content).

## Career Radar is NOT a journey stage

Career Radar collects `discoveryPreferences` (subjects, work style,
people preference, interests). These power:
  - Match % on /careers
  - Recommended for you cards
  - Personalised sorting

`discoveryPreferences` is editable from BOTH the Radar and from
/profile (Career Preferences section). It is profile data, not
journey state. Editing in either surface invalidates
`['my-profile', 'profile-completion', 'discover-recommendations',
'career-recommendations']` so the Match column refreshes immediately.

## Hard rules

- Tabs are content views, not stages. Never gate switching between
  Discover / Understand / Grow on action completion.
- Never reintroduce `JourneyOrchestrator`, `createOrchestrator`,
  `JOURNEY_STATES`, `JOURNEY_STATE_DEFINITIONS`, `JourneyStateId`,
  `canTransition`, `calculateLensProgress`, `determineCurrentState`,
  or step-list arrays whose entries each represent a "completion gate".
- Do not write to `YouthProfile.journeyState`,
  `journeyCompletedSteps`, or `journeySkippedSteps`. These columns
  are legacy and being dropped. `journeySummary` is also legacy —
  read it only as a fallback for already-stored data, never write.
- The roadmap's per-step progress lives in `roadmap-card-data`
  (localStorage, per goal) and the sequential-unlock helper
  `isStepUnlocked` / `enforceProgressChain` in
  `src/components/journey/timeline/`. This is the only progression
  machine in the app.
- The dashboard surfaces roadmap progress for the active goal via
  `markGrowActive` / lightweight per-goal signals — not via
  `computeLensProgress` over the legacy state machine.

### Voice-Guided Roadmap Simulation

The Grow tab's roadmap has a "Play Journey" mode that narrates the
user's career path step-by-step using OpenAI TTS. When playing:

  - The roadmap enters read-only mode (no progress cycling)
  - Each step is highlighted in turn, others dimmed (opacity
    transitions over 500ms)
  - Audio narration is generated per-segment via POST
    /api/simulation/narrate
  - User controls: play/pause, skip forward/back, exit
  - Pre-fetches the next segment while the current one plays

The narration script is built client-side from Journey + Foundation
data (no extra AI call for the text). Only the TTS conversion hits
the API (~$0.001 per full playthrough). Simulation state lives
entirely in React state (no localStorage, no DB writes).

Hard rules:
  - Simulation never writes to roadmap-card-data or progress state
  - Simulation is additive — the static roadmap remains functional
  - TTS rate limit: 30 requests/hour per user
  - No autoplay — user must explicitly click "Play Journey"

### Product Philosophy

- The roadmap is a **guided simulation experience**, not a checklist
- Users understand their path in one session through narration and
  visual focus — they don't need to return for 10 years to "complete"
  steps
- The product is about **clarity and exploration**, not task execution
- Prefer guided experiences over static UI
- Prefer simulation over instruction
- Prefer storytelling over documentation
- Reduce cognitive load — avoid enterprise UX patterns

### Anti-Patterns (STRICTLY FORBIDDEN)

- Designing the roadmap primarily as a task completion system
- "Mark as done" as the primary roadmap interaction
- Roadmaps that feel like project management tools
- Static, unguided interfaces that dump data without context
- Features that don't help the user understand their future better

### Feature Standard

Every new feature must answer:
  "Does this help the user understand their future better?"
If not, it should not exist.

## Summary

Three tabs, no gating. Discover and Understand are content. Grow is
the simulation + exploration surface — the user plays through their
roadmap narration, explores real opportunities, and builds momentum
with concrete next moves. The voice-guided simulation is the primary
experience; the static roadmap supports it.

</journey_logic>


<ui_principles>

- Calm, modern, youth-friendly.
- No aggressive gamification.
- No dopamine-driven notification spam.
- Soft colors (avoid harsh neon).
- Clear safety messaging.
- English-only interface (MVP).

</ui_principles>


<standards_and_conventions>

TypeScript strict mode ON.
ESLint + Prettier required.

Branch naming:
- feat/<description>
- fix/<description>
- refactor/<description>

PR Requirements:
- Must pass lint.
- Must pass typecheck.
- Must not introduce payment logic.
- Must not introduce open chat for minors.

</standards_and_conventions>


<common_commands>

Install:
  npm install

Dev:
  npm run dev

Build:
  npm run build

Lint:
  npm run lint

Typecheck:
  npm run typecheck

Prisma migrate:
  npx prisma migrate dev

Seed:
  npm run seed

</common_commands>


<critical_notes>

1. This is NOT:
   - A gig economy clone.
   - A freelancer bidding platform.
   - A social media app.

2. Do not:
   - Add public follower counts.
   - Add likes-based ranking.
   - Add engagement metrics for youth comparison.
   - Re-introduce the "Work tips" toggle or "Saved Tips" / Life Skills
     section anywhere in /profile. These were removed and should stay
     removed — do not import LifeSkillsSettings or SavedLifeSkills into
     the profile page under any circumstances.

3. Any new feature must pass:
   - Safety check
   - Privacy check
   - Journey alignment check

4. If unsure whether something violates safeguarding — choose safety.

</critical_notes>


<examples>

Example structured message prompt:

{
  "type": "APPLICATION_CONFIRMATION",
  "options": [
    "I confirm I am available.",
    "I would like to ask about schedule."
  ]
}

Example responsibility signal (internal):

{
  "job_completed": true,
  "on_time": true,
  "communication_clear": true
}

Example Journey state:

{
  "user_id": "uuid",
  "state": "UNDERSTAND",
  "last_transition": "2026-01-10"
}

</examples>


<maintenance_guidelines>

- Update when safeguarding rules evolve.
- Keep under 300 lines.
- Prefer adding CLAUDE.md inside:
  /journey
  /jobs
  /admin

Closest CLAUDE.md overrides higher-level guidance.
</maintenance_guidelines>


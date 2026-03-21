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

The Journey system is central.

States:
- DISCOVER
- UNDERSTAND
- ACT
- REFLECT

Rules:
- A user cannot skip state transitions arbitrarily.
- Journey progression stored as state machine.
- Journey summary aggregates:
  - Jobs attempted
  - Skills developed
  - Reflections written

Dashboard must highlight Journey first, not job count.

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


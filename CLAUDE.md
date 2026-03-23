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

# MY JOURNEY FRAMEWORK (CORE PRODUCT CONTRACT)

## PURPOSE
The “My Journey” experience is the core of the Endeavrly product.

It is NOT a roadmap viewer.
It is a guided system that helps users:
1. understand themselves
2. understand the world
3. take meaningful action

All features, components, and UI decisions in this area MUST align with this framework.

---

## CORE STRUCTURE

My Journey is built around three stages:

1. DISCOVER (Know Yourself)
2. UNDERSTAND (Know the World)
3. ACT (Take Action)

These are NOT labels — they define product behavior, data flow, and UX.

---

## STAGE DEFINITIONS

### 1. DISCOVER (Know Yourself)

**Purpose**
Help the user build self-awareness and direction.

**This stage is:**
- introspective
- user-input driven
- reflective

**Must include:**
- reflection on strengths
- reflection on weaknesses / growth areas
- ambitions / motivations
- interests
- career exploration (shortlisting)
- primary and secondary goals

**IMPORTANT RULES**
- DO NOT implement a generic “Notes” feature here
- DO implement structured reflection inputs
- All capture must be contextual (e.g. tied to prompts)
- Output of this stage = “user signals”

**USER SIGNALS**
This stage produces structured signals such as:
- strengths
- interests
- preferences
- saved career paths
- motivations

These signals must be reusable across the system (especially ACT).

---

### 2. UNDERSTAND (Know the World)

**Purpose**
Help the user understand careers, industries, and reality.

**This stage is:**
- external
- insight-driven
- exploration-focused

**Must include:**
- role understanding (what the job actually involves)
- industry insights and trends
- skills required
- schooling / qualification requirements
- real-world expectations
- curated content (videos, podcasts, articles)
- saved content

**CONTENT RULES**
- Saved content belongs here (not in Discover)
- This is the home of “My Content”
- Content should support decision-making, not distract

---

### 3. ACT (Take Action)

**Purpose**
Convert clarity into real-world progress.

**This stage is:**
- execution-focused
- practical
- forward-moving

**Must include:**

1. ROADMAP
   - the career path (e.g. Doctor journey)
   - age-based progression
   - milestones
   - MUST include schooling / academic dimension

2. LEARNING GOALS
   - short-term and long-term goals
   - skill-based progression

3. REAL-WORLD ACTIONS
   - internships
   - volunteering
   - clubs
   - projects
   - shadowing

4. NEXT BEST STEP
   - system-generated guidance
   - must be visible and actionable

5. REFLECTION LOOP
   - reflect on what was learned
   - update direction
   - feed back into journey

---

## ROADMAP POSITIONING (CRITICAL)

The roadmap:
- MUST live inside ACT
- MUST NOT represent the entire journey
- MUST NOT replace DISCOVER or UNDERSTAND

It is one component of execution, not the product itself.

---

## DATA FLOW (MANDATORY LOGIC)

DISCOVER → produces signals  
UNDERSTAND → enriches context  
ACT → executes based on both  

Additionally:
ACT → reflection → feeds back into DISCOVER/ACT

This loop must be preserved.

---

## NOTES / CONTENT RULES

- Discover = structured reflection (no generic notes tab)
- Understand = saved content (videos, articles, podcasts)
- Act = action-related reflection only

Avoid:
- dump buckets
- duplicated content areas
- detached “My Content” tabs outside context

---

## UX PRINCIPLES

- Separate thinking (Discover) from doing (Act)
- Keep exploration (Understand) distinct from introspection
- Avoid mixing stages visually or conceptually
- Ensure user always knows:
  - where they are
  - what they should do next
  - why it matters

---

## HOW YOUR JOURNEY WORKS (SYSTEM MESSAGE)

The system must clearly communicate:

DISCOVER
→ understand yourself  
→ define direction  

UNDERSTAND
→ understand the path and reality  
→ validate your direction  

ACT
→ take real steps forward  
→ learn, adapt, progress  

This explanation must match the actual UI and behavior.

---

## IMPLEMENTATION RULES FOR CLAUDE

When modifying or adding features:

1. ALWAYS map the feature to one of:
   - Discover
   - Understand
   - Act

2. NEVER:
   - place roadmap logic outside ACT
   - add generic notes systems in Discover
   - mix content and reflection in the same layer
   - create new top-level tabs that break this structure

3. ALWAYS:
   - maintain separation of concerns
   - ensure data flows between stages
   - keep UI aligned with framework meaning

---

## SUCCESS CRITERIA

The system should feel like:
- a guided decision engine
- a structured personal journey

NOT:
- a static roadmap viewer
- a content dashboard
- a collection of disconnected features
 
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


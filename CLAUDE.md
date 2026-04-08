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

# My Journey Framework (Current Implementation)

## Overview

The My Journey experience is structured into three core stages:

1. Discover → Explore the career
2. Understand → Know the role in depth
3. Grow → Take initial steps toward the career

This structure represents a progression from awareness → clarity → early action.

The current implementation is intentionally lightweight and mostly informational, with limited personalization and automation.

---

## 1. Discover (Explore the Career)

### Purpose

Discover is designed to introduce the user to a career at a high level.

It helps answer:
- What is this career?
- What does it involve?
- Is this something I might be interested in?

### Content & Features

Discover typically includes:

- A Day in the Life (video-based content)
- Salary range
- Growth outlook
- Education path (high-level)
- Key skills required (e.g. communication, empathy, etc.)
- A high-level career roadmap preview

### UX Characteristics

- Passive exploration
- Content-driven (video + summary cards)
- No user input required
- Designed to spark curiosity and initial interest

### Notes

- Discover is not deep or technical
- It should feel accessible, engaging, and easy to consume
- It sets the context for deeper exploration in Understand

---

## 2. Understand (Know the Role)

### Purpose

Understand provides a deeper, more structured view of the career.

It helps answer:
- What does this job actually involve day-to-day?
- What do I need to qualify?
- What skills and knowledge are required?
- What is the reality of this role?

### Content & Features

Understand typically includes:

- Role Reality:
  - Core responsibilities (e.g. diagnose conditions, prescribe treatments)
- Education & Qualifications:
  - Degree requirements
  - Specialization paths
- Key Skills:
  - More explicit breakdown of required capabilities
- Courses & Certifications:
  - External learning platforms (e.g. Coursera, edX)
- Entry Requirements:
  - Basic eligibility and expectations
- Industry Outlook:
  - Growth level
  - Salary range
- Notes:
  - User can optionally write personal notes and reflections

### UX Characteristics

- More structured and informational than Discover
- Still largely passive consumption
- Some optional user input (notes)
- Provides clarity and realism

### Notes

- Understand bridges curiosity and informed decision-making
- It introduces more detail but does not yet drive action

---

## 3. Grow (Your Roadmap & Next Steps)

### Purpose

Grow introduces early action and direction for the user.

It helps answer:
- What should I do next if I want to pursue this career?
- What does the path forward look like?

### Content & Features

Grow currently includes:

1. Recommended Next Steps
   - Example actions:
     - Research degree programmes
     - Watch more videos
     - Talk to someone in the role
   - These are static suggestions

2. Career Roadmap
   - Visual roadmap (e.g. age 18–22 university track)
   - Timeline-based progression
   - Can be viewed in different formats (e.g. Zigzag, Rail, Steps)

### UX Characteristics

- Light action orientation
- Static and generic recommendations
- No strong personalization or intelligence
- Roadmap is a key visual element

### Notes

- Grow is currently the weakest of the three sections
- It lacks dynamic behavior and contextual guidance
- It does not yet adapt to user behavior or progress
- It introduces action but does not strongly drive momentum

---

## Design Principles (Current State)

- Minimal friction
- No mandatory user input
- Clean, card-based UI
- Focus on clarity over complexity
- Content-first approach

---

## Known Limitations

- Grow lacks intelligence and personalization
- Recommended steps are generic and static
- No concept of momentum or progression tracking
- Limited feedback loop from user behavior
- No dynamic “next best action” system

---

## Summary

The current model follows a clear progression:

Discover → “This looks interesting”
Understand → “I understand what this involves”
Grow → “Here are some initial steps”

However, Grow does not yet fully deliver on action, guidance, or personalization and is a key area for future enhancement. 
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


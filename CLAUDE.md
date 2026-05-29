# CLAUDE.md — Endeavrly (Youth Career Exploration & Direction Platform)

<project_context>
Endeavrly is a youth-first (ages 15–23) career development platform.

It helps young people explore careers, understand realistic pathways,
and build clarity about their future.

It is safety-by-design, privacy-first, calm in tone, and built to reduce
confusion — not increase it.

It is NOT a jobs marketplace, does NOT support job posters, and does NOT
include in-app payments.
</project_context>


<core_principles>

1. Youth Safety First
   - No risky social mechanics.
   - No open communication systems by default.
   - Structured interactions only where necessary.
   - Report & moderation systems remain available.

2. No In-App Payments
   - Platform does not process payments.
   - Do not introduce Stripe or payment logic.

3. Privacy by Design (GDPR MVP)
   - Minimal data collection.
   - No tracking ads.
   - No behavioral profiling.
   - No dark patterns.

4. Trust Signals ≠ Social Scoring
   - No follower metrics.
   - No popularity systems.
   - No public comparison loops.

5. Journey First
   - Core UX is My Journey (Discover → Understand → Clarity).
   - Dashboard reinforces direction and momentum.
   - Career exploration is primary focus.

</core_principles>


<project_structure>

/app
  /dashboard
  /journey
  /careers
  /profile
  /admin

/lib
  /auth
  /db
  /policies
  /validation

/prisma
  schema.prisma

/components
  ui/
  journey/
  careers/

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
- Use RLS where appropriate.
- No business logic inside UI components.

</architecture_constraints>


<data_model_rules>

Core Entities:
- User
- Guardian (optional for minors)
- JourneyState
- CareerPreference
- Reflection
- SavedCareer
- Report

Mandatory:
- UUID primary keys
- created_at / updated_at timestamps
- Soft delete where appropriate
- Age validation on signup
- Guardian flag for under-18 users if required

Never store:
- Excessive personal data
- Sensitive profiling categories
- Unnecessary behavioral tracking

</data_model_rules>


<safeguarding_rules>

1. Reporting System
   - Profiles/content should support reporting.
   - Reports create admin review entries.

2. Admin Moderation
   - Admin panel should support:
     - Suspend user
     - Remove unsafe content
     - Flag inappropriate behaviour

3. No Public Personal Contact Display
   - Hide emails / phone numbers by default.

4. No Youth Comparison Systems
   - No leaderboards
   - No public status rankings

</safeguarding_rules>


<journey_logic>

My Journey is the emotional core of Endeavrly.

Three-tab progression:

1. Discover
- What the career is
- Lifestyle / salary / overview
- Spark curiosity

2. Understand
- Education routes
- Realistic expectations
- Skills needed
- Entry paths
- Deeper truth

3. Clarity
- Personal roadmap
- Suggested next steps
- Confidence-building momentum
- Reflection and direction

Hard Rules:

- Keep Journey calm, structured, and meaningful.
- Never over-gamify progression.
- Never turn it into a checklist factory.
- Never add noisy productivity mechanics.
- Journey exists for clarity, not addiction.

North Star Question:

"Does this help the user understand their future better?"

</journey_logic>


<career_discovery_logic>

Career exploration is a major product surface.

Includes:

- Browse careers
- Search careers
- Compare careers
- Save careers
- Career Radar preference matching
- Recommended careers
- Industry insights
- Real stories / real voices

Hard Rules:

- Make exploration feel exciting but calm.
- No endless cluttered feeds.
- No low-quality recommendation spam.
- Accuracy and trust matter.

</career_discovery_logic>


<removed_features_strict>

The Small Jobs / Jobs Marketplace feature has been intentionally removed.

STRICTLY DO NOT REINTRODUCE:

- /jobs routes
- Job posters
- Job applications
- Employer accounts
- Shift listings
- Gig marketplace logic
- Worker matching systems
- Bidding systems
- Earnings dashboards
- Payment workflows
- Recruiter features
- Job chat systems
- Job responsibility signals tied to gigs

If legacy code exists, treat it as deprecated unless explicitly requested.

Endeavrly is now a career exploration and clarity platform, not a job marketplace.

</removed_features_strict>


<ui_principles>

- Calm
- Modern
- Youth-friendly
- Premium feel
- Clear hierarchy
- Soft visual language
- Strong mobile UX

Avoid:

- Harsh neon
- Busy dashboards
- Cheap gamification
- Corporate HR feel
- School admin portal feel

</ui_principles>


<standards_and_conventions>

TypeScript strict mode ON  
ESLint + Prettier required

Branch naming:

- feat/<description>
- fix/<description>
- refactor/<description>

PR Requirements:

- Must pass lint
- Must pass typecheck
- Must not introduce payment logic
- Must not reintroduce jobs marketplace features
- Must preserve Journey UX quality

</standards_and_conventions>


<critical_notes>

1. This is NOT:

- A gig economy clone
- A freelancer marketplace
- A job board
- A social media app

2. Do not add:

- Likes
- Followers
- Public rankings
- Viral loops
- Spam notifications
- Youth comparison metrics

3. Every new feature must pass:

- Safety check
- Privacy check
- Journey alignment check
- Real usefulness check

4. If unsure, choose calmness, trust, and simplicity.

</critical_notes>


<maintenance_guidelines>

- Update when product direction changes.
- Keep concise and practical.
- Prefer feature-level CLAUDE.md files inside:
  /journey
  /careers
  /admin

Closest CLAUDE.md overrides higher-level guidance.

</maintenance_guidelines>

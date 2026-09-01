# CLAUDE.md — Endeavrly (Youth Career Exploration & Direction Platform)

<project_context>
Endeavrly is a youth-first (typically 15–23) career development platform,
open to anyone aged 15 or older — including career-changers of any age.

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
- Next.js 16 (App Router)
- React 19
- **NextAuth v4** — authentication (credentials + bcrypt, JWT sessions).
  Vipps OAuth is configured but gated behind NEXT_PUBLIC_VIPPS_ENABLED.
- Supabase — **Postgres host ONLY**. Not Supabase Auth.
- Prisma ORM
- Resend — all transactional email
- TypeScript (strict mode)

AUTH: THE COMMON WRONG TURN.
This file used to say "Supabase (Auth + DB)". It is not true and it has cost
real time: there is no Supabase Auth, no supabase-js, no anon key, and
src/lib/supabase.ts was deleted. So there is no Supabase dashboard where
"email templates", "redirect URLs" or "email confirmation" can be configured
— all of it lives in code:

- sign-in / sessions        src/lib/auth.ts (authOptions)
- signup                    src/app/api/auth/signup/route.ts
- email verification        src/lib/auth/email-verification*.ts,
                            src/app/api/auth/{verify-email,resend-verification,
                            verification-status}
- password reset            src/lib/auth/password-reset.ts
- email delivery            src/lib/mail.ts (Resend)
- link origins              src/lib/auth/app-url.ts (never hard-code a URL)

Email verification is a HARD GATE: an unverified account cannot sign in.
Kill switch: NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED="false".

Rules:
- All data access via Prisma.
- All server logic inside Server Actions or API routes.
- Use RLS where appropriate. NOTE: RLS is enabled with ZERO policies on ~94
  tables (deny-by-default). The app connects as a role with BYPASSRLS, so
  policies are not the access model — do not add policies expecting them to
  be consulted.
- No business logic inside UI components.
- No hard-coded environment URLs. Use src/lib/auth/app-url.ts.

Local development:
- `.env` DATABASE_URL points at PRODUCTION. There is no staging. The test
  suite is blocked from connecting (src/lib/db-guard.ts); the dev server
  warns. See docs/local-database.md before running anything destructive.
- endeavrly.com is served by the **v0-youth-platform** Vercel project, NOT
  `youth-platform`. Env-var changes must go on v0-youth-platform.

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
- Age validation on signup (15+ floor only, no upper limit — see <age_policy>)

Never store:
- Excessive personal data
- Sensitive profiling categories
- Unnecessary behavioral tracking

</data_model_rules>


<age_policy>

Age is a PERSONALISATION SIGNAL, not an in-app gate.

What age IS used for:
1. Personalising the Clarity-tab roadmap — e.g. no university step
   before 18, professional certifications spaced to post-experience.
   (Roadmap logic reads date of birth / age + educationStage.)
2. A one-time signup ELIGIBILITY FLOOR: the platform is for anyone aged
   15 OR OLDER — there is NO upper age limit. Enforced in /api/auth/signup:
   under-15 cannot register; a sanity guard rejects implausible ages (>100).
   The "typical" audience is 15–23 (youth starting out) — that's a POSITIONING
   focus, not an eligibility gate. Career-changers of any age are welcome and
   get a transition-shaped roadmap from their current situation.
   (Owner-approved 2026-06-17 widening from the earlier 15–30 ceiling — do NOT
   re-introduce an upper age limit.)

What age is NOT used for:
- NO in-app action is blocked by age or guardian consent. Every
  signed-in user, at any age, can read AND write everywhere: set goals,
  save reflections, store quiz results, persist skills/profile, etc.
  The consent write-gate (src/lib/auth/consent-gate.ts) is intentionally
  EMPTY — do not re-populate it without an explicit product decision.
- NO guardian-consent flow. Signup does not collect a guardian email,
  does not send a consent email, and does not put under-18s into
  PENDING_VERIFICATION. All youth accounts are ACTIVE on creation.

Rationale: choosing and exploring careers is the core product action and
must be available to every young person immediately. This is a
deliberate, owner-approved reversal of the earlier guardian-consent gate
— do NOT "fix" it back.

Deprecated/inert (scheduled for follow-up cleanup, do not rely on):
the `ageBracket` enum, and legacy jobs/shadowing/messaging age gates.

</age_policy>


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


<concurrent_sessions>

Several sessions/agents often work in this repo at once, and they share ONE
checkout. When two are active, one switching branches yanks the ground out from
under the other: files change mid-edit, and commits made on the old branch stop
being reachable from HEAD.

This is not theoretical. In a single day it happened twice, once discarding a
finished, tested commit that had to be recovered from the object store by hash.

If there is any chance another session is active:

    npm run worktree -- fix/your-thing

That creates a sibling directory with its own branch and its own files, sharing
one .git — so neither session can disturb the other. It links node_modules and
copies .env for you.

Also:
- PUSH EARLY. An unpushed commit in a shared checkout is one `git checkout`
  away from being invisible. A pushed branch cannot be lost this way.
- Before assuming your work is gone, check `git reflog` and
  `git cat-file -e <sha>^{commit}` — a discarded commit is usually still
  there, just unreferenced.
- Expect the database to move under you too: it is shared and it is
  production. Row counts change between queries.

</concurrent_sessions>


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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

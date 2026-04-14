# Endeavrly

### A safer, smarter way for young people to explore careers and first jobs

*White Paper — April 2026*
*For parents, educators, school leaders, and investors*

---

## Executive Summary

Endeavrly is a career discovery and first-job platform built specifically for young people aged 15 to 23. It helps students understand who they are, explore careers that genuinely fit them, find meaningful early work, and build a realistic roadmap toward a fulfilling adult life — without exposing them to the risks of general-purpose social and freelance platforms.

The product is designed around three non-negotiable commitments: **safety by design**, **privacy by default**, and **exploration before pressure**. There are no in-app payments, no direct free-text chat between minors and adults, no behavioural advertising, and no popularity metrics or social scoring. Every screen the student sees is calibrated to reduce anxiety and encourage curiosity — not to maximise engagement for its own sake.

Under the hood, Endeavrly combines a transparent rules-based matching engine (a hybrid system, not a black-box AI), age-aware readiness modelling, and a calm, guided narrative experience that walks the student through their own future in a single session rather than demanding years of engagement to "complete" a checklist.

This paper describes the essence of the platform, the function of each major module, the safety and privacy commitments underpinning the work, and the technical foundations that make it trustworthy.

---

## 1. The Problem We're Solving

Today's 15- to 23-year-olds inherit a paradox. They have more information about careers than any generation in history — and yet youth career uncertainty, anxiety, and drift are higher than ever. The dominant tools available to them are not built for their stage of life:

- **Social platforms** optimise for engagement, not clarity, and expose minors to open messaging with strangers, public popularity signals, and algorithmic pressure.
- **Freelance and gig platforms** assume the user is an adult contractor, route money through in-app rails, and treat users as transactional suppliers.
- **Careers advice websites** are static, often outdated, and rarely tailored to a specific country, age, or academic pathway.
- **School careers guidance** is under-resourced in most countries and often reaches students too late — after subject choices have already been made.

The result is a generation that either over-commits to a single path they don't understand, or defers the decision entirely until circumstance chooses for them.

Endeavrly exists to fill this gap with a single premise: **exploration should be safe, structured, personal, and honest**. A student should be able to spend an hour on the platform and leave with a clearer sense of where they are, what paths realistically match who they are, and what a concrete next step looks like — without being sold anything, tracked for profit, or exposed to adult strangers.

---

## 2. The Endeavrly Approach — Three Core Principles

### 2.1 Safety by Design

The platform is built from the ground up for minors. Safety is not a moderation layer bolted onto a general-purpose app; it's an architectural constraint.

- **No free-text messaging between minors and adults.** All communication related to jobs uses structured, pre-defined prompts.
- **No in-app payments.** Endeavrly is not a payment processor. Where work is arranged, payment is handled externally between the young person and the adult — keeping the platform out of financial disputes and reducing regulatory surface area.
- **Verified adult accounts before posting.** Adults cannot post jobs or interact with minors until their identity is validated.
- **Every profile and job has a one-tap report option.** Reports create reviewable records for moderators.
- **Guardian consent is first-class.** Users under 18 have a guardian linked to their account, with a dashboard of their own.

### 2.2 Exploration Before Pressure

Young people do not need more gamification. They need room to think. Endeavrly deliberately avoids patterns common in consumer tech that amplify anxiety in this age group:

- **No public follower counts, likes, or leaderboards.**
- **No streaks or notification spam.**
- **No "You're falling behind" messaging.**
- **No engagement-maximising infinite scrolls.**

Instead, the product is structured as a calm, linear journey with a clear end. A student should feel that using Endeavrly for thirty minutes gives them *more clarity*, not more homework.

### 2.3 Transparent Matching, Not Black-Box AI

The matching engine that powers the Career Radar is a deterministic, rules-based scoring system — not a large language model making opaque decisions. Every match a student sees can be explained in plain English ("Matches your interest in Chemistry", "Hands-on work, which you said you enjoy"). AI is used in specific, narrow roles (narration, suggested next moves, question answering) but never as the primary engine for a life-shaping recommendation.

This matters to parents, educators, and regulators: the logic is auditable, the weights are configurable, and the platform can honestly answer the question "why was my child shown this career?"

---

## 3. Module-by-Module Walkthrough

Endeavrly is organised around nine core surfaces. Each one is a deliberate answer to a specific question a young person might ask.

### 3.1 Dashboard — *"Where am I right now?"*

The Dashboard is the student's home base. It's an information-dense but calm overview that reinforces their current position:

- **My Journey card** — a compact progress ring showing how far they've moved through the three-stage journey (Discover → Understand → Clarity) for their current career goal.
- **Career Snapshot** — four at-a-glance stats for the career they've chosen as their primary goal: salary range, growth outlook, sector, and pension context.
- **Who Am I** — a gentle self-portrait generated from their discovery preferences, with tags that summarise what they've told the platform about themselves.
- **My Explored Journeys** — a history of every career they've seriously considered, so they can switch between them without losing context.
- **Saved Careers** and **Small Jobs** panels — quick access to careers they've bookmarked and the micro-jobs they've applied for.
- **Discovery Nudge** — a sparse, gentle suggestion that appears roughly once per 20–30 minute session, quietly surfacing a career they haven't explored yet based on their preferences. Non-intrusive, dismissible, and designed to invite curiosity rather than demand attention.
- **Did You Know card** — a rotating research-backed fact about the job market or career trends.

The Dashboard never asks the student to do something urgent. It offers context.

### 3.2 Career Radar — *"What careers actually fit me?"*

The Career Radar is the most visually distinctive part of Endeavrly. It is a personalised map of careers positioned by how well they align with the student's preferences.

- **Discovery preferences ("What I like")** — a lightweight quiz that captures school subjects the student enjoys, how they like to work (hands-on, at a desk, outdoors, creative, or a mix), their preference for working with people or alone, and free-form interests (animals, drawing, coding, travel, and more). These preferences are saved to the student's profile and persist across sessions.
- **The radar visualisation** — every career is plotted as a dot. Dots closer to the centre are stronger matches. Different colours indicate match strength (top, strong, good). The student's current Primary Goal is marked with a gold ring.
- **Matches Report** — a scrollable, filterable list of matched careers with salary, growth, and sector at a glance.
- **Compare feature** — the student can select 2–3 careers and view a side-by-side comparison showing how they feel (creativity, variety, hands-on vs. analytical), reality checks, daily tasks, and the study paths they require.
- **Saved Comparisons edge tray** — a progressive-disclosure side panel that quietly stores every comparison the student has made. They can revisit "Police Officer vs Paramedic" a week later with one click, without losing their previous exploration.
- **Preference Coach Tip** — a gentle inline nudge that encourages the student to add a second or third subject when their preference profile is thin, helping them discover a wider range of matches.

The matching engine behind the radar is described in Section 4.

### 3.3 My Journey — *"What does this career actually mean for me?"*

My Journey is the deep-dive experience for a single career. Once a student sets a Primary Goal, they enter a three-stage, single-predicate confirmation flow:

**Discover (Explore the career)** — A calm, content-first introduction. The student sees a day in the life of this career, salary ranges, growth outlook, key skills, and the broader context of the role. No input is required. The goal is curiosity, not commitment. A confirmation card at the bottom ("Have you explored what this role is about?") unlocks the next stage only when the student actively says yes.

**Understand (Know the role)** — A structured deeper look. This tab covers role reality, entry requirements, real education programmes (grounded in Norwegian universities and international alternatives), courses and certifications, industry outlook, the tools professionals actually use, and interview prep pointers. Again, a confirmation card gates the next stage.

**Clarity (Build your roadmap)** — The action surface. Clarity contains:

- **Foundation Card** — A personal diagnostic: what school the student is in, what track, what year they finish, what subjects they're taking. The foundation produces an alignment status (Aligned, Partially aligned, or Needs attention) with one concrete suggested action.
- **Personal Roadmap** — An age-anchored timeline from today through to a senior role. The roadmap branches based on the student's education stage and finish year. It respects the core rule that school finishes at 18 before any university-level step begins. The roadmap can be rendered in three styles (Zigzag, Rail, or Steps) depending on what the student finds more readable.
- **Voice-Guided Journey Simulation** — The student can play their entire roadmap as a voice-narrated story. Each step is highlighted in turn, the others dim, and OpenAI text-to-speech narrates the path step by step. The narration text is built deterministically from the student's actual data (no hallucinations). A full playthrough costs less than a cent and uses strict rate limits.
- **Momentum panel** — Suggested concrete next moves: people working in similar roles on LinkedIn, university courses from utdanning.no, and a personal action list the student can add to and complete.
- **Reference content** — Real Career Paths contributed by parents and professionals via the `/contribute` page, Tools of the Trade, and Real Voices video snippets.

The three-tab confirmation gating forces the student to consider each stage before moving on. It is the *only* gate in My Journey — there is no multi-step completion ladder, no DB-backed journey state machine. This is a deliberate design choice: the product is a guided simulation, not a task-completion system.

### 3.4 AI Career Advisor — *"Can I ask a specific question?"*

A goal-aware chatbot that answers career questions based on the student's current goal and discovery preferences. It keeps conversation history so follow-ups feel natural. The Advisor is guarded by safety guardrails appropriate for minors: it will not give medical, legal, or financial advice, will not role-play as another person, and defers to human professionals for serious personal concerns.

### 3.5 Micro-Job Marketplace — *"Can I get my first work experience?"*

The marketplace is where verified adults post small, local jobs appropriate for young people: babysitting, dog walking, tech help, gardening, tutoring, cleaning, light DIY.

- Jobs are geolocated and filterable by category, schedule, and location.
- A map view helps the student see what's nearby.
- Applications go through structured messaging — predefined prompts only, no free text.
- An **Applications** page tracks status (pending, accepted, in progress, completed).
- An **Earnings** dashboard visualises completed work and confirmed payments. Payments themselves happen outside the platform.
- Every job posting has a Report button linked to the moderation pipeline.

The micro-job marketplace is not the point of Endeavrly — it exists in service of the Journey. Real-world responsibility signals (turning up on time, communicating clearly, finishing the job) feed back into the student's broader development without becoming a public scoreboard.

### 3.6 Industry Insights — *"What does the real world look like?"*

The Insights module gives the student a window into the job market, filtered for age-appropriate relevance:

- **Global Lens** — macroeconomic job market stats, featured reports, podcasts.
- **Youth Lens** — the same trends re-interpreted for the 15–23 demographic.
- **Dig Deeper** — trending roles and in-demand skills.
- **Go Further** — international context and verified events worth knowing about.

Facts are evidence-linked to their sources, with a freshness policy that flags stale data. Evergreen content (conceptual statistics) is clearly marked as such. The Insights module also surfaces weekly fact nudges — short, research-backed prompts rather than engagement-bait notifications.

### 3.7 Career Events — *"Where can I go to learn more in person or live?"*

A curated feed of verified events: conferences, webinars, workshops, campus open days. Events are filtered by the student's career interests so they don't drown in irrelevant listings. An admin pipeline keeps the feed fresh and removes expired items.

### 3.8 Parent / Guardian Dashboard — *"How is my child doing on the platform?"*

Parents and guardians have their own dashboard — a first-class surface, not an afterthought. It provides:

- Visibility of the child's career exploration activity (which careers they've looked at, which they've set as goals).
- A view of job applications and job-related interactions.
- Safety reports and alerts linked to their child's account.
- The guardian consent flow for under-18 users, including the ability to unlink or escalate concerns.
- A calm, non-surveillant tone: the dashboard is built so the parent can *support*, not *surveil*.

Parents also have a first-class contribution channel: the `/contribute` page lets professionals and parents share their own real career timelines, which are moderated and then shown back to students inside the Clarity tab as *Real Career Paths* — demonstrating that a career almost never travels in a straight line.

### 3.9 Profile & Growth — *"What have I told the platform about me, and how do I change it?"*

A single place where the student manages their display name, country, avatar, career goals, discovery preferences, and safety/privacy settings. Every signal the platform uses to personalise the experience is visible and editable here. No hidden profile, no shadow metrics.

---

## 4. How the Matching Engine Works (in plain English)

This section matters particularly for parents, educators, and investors who want to know that the platform's advice is trustworthy.

Endeavrly uses a **hybrid matching engine** that combines four layers:

1. **Career attribute model** — every career in the platform has structured attributes: which school subjects it relates to, whether it's desk-based or hands-on or outdoors or creative, how people-facing it is, how analytical, what academic pathway it needs, its typical salary band, growth outlook, and sector.

2. **User preference profile** — the student's own answers from the "What I like" quiz are mapped into the same structured dimensions. Working with people? Open to desk and outdoors? Interests in animals and coding? Each answer becomes a clear signal.

3. **Weighted scoring engine** — the student's profile is compared to every career along every dimension. Subject match weighs the most (about 42% of the total score), followed by work style (15%), people preference, creative vs. analytical alignment, variety, and academic accessibility. Each dimension is scored 0–1, then combined into a 0–100 match percentage. The weights live in a single configuration file so they can be tuned by product designers without touching the code that does the scoring.

4. **Diversity layer** — after scoring, the results are gently rebalanced so that no single category (e.g. Tech) can dominate more than 45% of the top results. A couple of "discovery" slots are reserved for careers the student probably hasn't considered but that score surprisingly high on one or two dimensions.

Every match the student sees can be explained in plain English via reasons derived from the actual scoring dimensions. A career never appears "because the AI said so."

The model is also **age-aware**. If a 17-year-old student says they finish school in 2027, the engine correctly anchors the first post-school step (e.g. "Apply for university studies") to 2027 — not their current age. No student can be shown a university step that starts before they've left school.

---

## 5. Safety & Privacy Commitments

### 5.1 Data Minimisation (GDPR-aligned)

- Endeavrly collects the minimum data needed to serve the student: age, country, discovery preferences, career goals.
- We do not collect or infer sensitive profiling categories (religion, ethnicity, health, sexual orientation).
- We do not run behavioural advertising.
- Students can export or delete their data from their profile page.

### 5.2 Messaging Safeguards

- Minors cannot send or receive free-text messages from adults on the platform.
- All job-related communication uses predefined, structured prompts ("I confirm I am available", "I'd like to ask about the schedule").
- Reports and escalations feed a moderation queue monitored by the platform team.

### 5.3 No In-App Payments

- Endeavrly is not a payment processor. Work is agreed externally between the student and the adult.
- This structurally protects the platform from being a party to financial disputes and limits the regulatory complexity usually associated with platforms involving minors and money.

### 5.4 Trust Signals Are Internal

- The platform does internally track what the UK career-services community calls *responsibility signals* — whether a student turned up, communicated clearly, finished the job.
- These signals are **never** displayed publicly, shown as a score, or used to rank students against each other.
- They exist only to help the student understand their own growth over time.

### 5.5 Age-Appropriate Defaults

- Dark mode is the default visual theme (we've found it calmer for most students). A warm, light mode is available with a one-click toggle.
- Professional certifications (heavy adult training programmes) are hidden for users under 20 who haven't explicitly asked for them.
- University-level steps never start before age 18 in any roadmap.
- Any content that references real-world statistics is tied to a published source with a freshness date.

---

## 6. Technical Foundations

Endeavrly is built on a modern, production-grade stack chosen for security, scalability, and the ability to iterate quickly:

- **Next.js 14 (App Router)** with React and TypeScript in strict mode.
- **Supabase** for authentication and Postgres database.
- **Prisma ORM** for type-safe database access.
- **Row-Level Security** policies enforced at the database layer so a youth profile's data cannot leak across accounts even if an application-layer bug is introduced.
- **Server Actions and API Routes** for all business logic. No business logic lives in UI components.
- **OpenAI** (used narrowly) for voice narration of the roadmap and for the AI Career Advisor, with strict rate limits and guardrails.
- **Vitest** test suite currently covering 464+ scenarios, including dedicated safety, age-policy, and education-alignment tests that run on every deployment.

The architecture is intentionally boring where it needs to be — authentication, data access, moderation — and interesting only where the student will feel it: the Journey, the Radar, the narrated simulation.

---

## 7. What's Next

Endeavrly is live and in active development. The near-term roadmap includes:

- Deeper integration of parent-contributed career stories ("Real Career Paths") into every Clarity tab, so students can see that the path they're looking at has been walked before in non-linear ways.
- Richer regional data (Norway first, then broader Nordics) for university programmes, grade requirements, and real local job markets.
- Continued tuning of the matching engine based on observed student behaviour, within the constraint that it remains transparent and explainable.
- A lightweight school-facing mode that lets careers advisors see anonymised, aggregated trends across their cohort — without ever identifying individual students.
- Expanded language support (currently English and Norwegian), with a strict translation-cache policy so the product stays fast.

---

## 8. A Note on What We Are Not

It is as important to be clear about what Endeavrly is *not* as what it is:

- We are **not a gig economy platform**. There is no bidding, no ratings, no public profiles for sale.
- We are **not a social network**. There are no follower counts, no feed, no likes.
- We are **not a freelance marketplace**. Adults cannot source paid labour from minors through the platform.
- We are **not an AI coach** that makes life decisions for young people. Every personalisation signal is visible and editable by the student.
- We are **not trying to maximise time-on-app**. A student who gets the clarity they came for and then closes the app is a successful student.

---

## Contact

For parents, educators, or school leaders who'd like to discuss how Endeavrly can support their community, or investors interested in the vision, please reach out through the channels on the main site.

*Thank you for taking the time to read this.*

— The Endeavrly team

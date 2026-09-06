# Free + Pro pricing — implementation assessment

**Date:** 2026-09-06
**Status:** assessment only, per §33 of the brief. No code written.

---

## 0. The blocking conflict — read this first

`CLAUDE.md`, checked into this repo, states as **core principle #2**:

> **2. No In-App Payments**
> - Platform does not process payments.
> - Do not introduce Stripe or payment logic.

and in the project context:

> It is NOT a jobs marketplace, does NOT support job posters, and **does NOT
> include in-app payments.**

`src/lib/pricing/tiers.ts` was written to that rule:

> "Endeavrly does not process payments (see CLAUDE.md). Every tier here is
> arranged directly with the team, so each CTA is an enquiry link — never a
> checkout. **Do not wire Stripe or any in-app payment flow to this.**"

And `PersonalSubscription` in the schema carries `grantedBy` / `note` with the
comment **"No payment reference by design."**

The brief asks for the opposite: a payment provider, checkout, webhooks, Vipps
and Swish. That is a legitimate change of direction — but it reverses a
standing, deliberately-enforced constraint, so it needs to be made explicitly
rather than absorbed. **CLAUDE.md must be updated in the same change**, or the
next person to read it will "fix" the payment code back out.

Everything below assumes you confirm that reversal.

---

## 1. Authentication

NextAuth, session via `getServerSession(authOptions)`, user id on
`session.user.id`. Server routes already authenticate this way
(`src/app/api/profile/route.ts`, `api/chat/route.ts`). Nothing needed.

## 2. Database

Postgres via Prisma. Relevant existing models:

| Model | Relevance |
|---|---|
| `PersonalSubscription` | tier, status, startedAt, expiresAt, cancelledAt, moduleOverrides, grantedBy. **No payment fields.** |
| `AiUsageEvent` | per-request rows with `feature` (e.g. `"career_twin"`), `status`, tokens, cost. Indexed `[userId, feature, status, createdAt]`. |
| `SavedCareer` | profileId + careerId, unique per pair. |
| `YouthProfile` | holds `country`. |
| Journey models | `JourneyNotebook`, `JourneyReflection`, `JourneyNote`, `JourneySnapshot`, `JourneyGoalData`. |

Enums: `SubscriptionTier { FREE, PREMIUM, FAMILY, FAMILY_PLUS }`,
`SubscriptionStatus { ACTIVE, TRIALING, CANCELLED, EXPIRED }`,
`EntitlementModule { CORE, CAREER_DISCOVERY, CAREER_DNA, UNDERSTAND, CLARITY,
CAREER_TWIN, AI_CAREER_GUIDANCE, CAREER_PATHWAYS, PARENT_PORTAL,
LABOUR_MARKET_INTELLIGENCE, SKILLS_ANALYSIS, OPPORTUNITIES,
INSTITUTION_ANALYTICS, ADVANCED_ANALYTICS, API_ACCESS, CUSTOM_INTEGRATIONS }`.

## 3. Existing subscription / entitlement functionality — **most of §16 is already built**

`src/lib/entitlements/` already provides, tested:

- `getUserEntitlements(userId)` — the exact function §16 asks for.
- `requireModule(module)` / `userHasModule()` — server-side guards (§17).
- `resolveEntitlements()` — a **pure**, DB-free rulebook, unit-testable.
- `MODULE_CATALOGUE`, `PLATFORM_BASELINE_MODULES`, `TIER_MODULES`,
  `ROLE_PERMITTED_MODULES`.
- Source provenance: `PLATFORM_BASELINE`, `PERSONAL_SUBSCRIPTION`,
  `ORGANISATION_LICENCE`, `ACCESS_CODE_GRANT`, `MANUAL_GRANT`.

The author anticipated this task. From `modules.ts`:

> "These are thin today because the baseline already carries the whole
> consumer product. They exist so that **when a paid tier is introduced the
> plumbing is already in place** and exercised, rather than being retrofitted
> through feature code."

**Do not build a second entitlement service.** The work is to move modules from
the baseline into a paid tier and add usage metering.

### The consequential detail

`PLATFORM_BASELINE_MODULES` currently grants **every consumer module free**,
including `CAREER_TWIN`, `AI_CAREER_GUIDANCE`, `OPPORTUNITIES`, `CLARITY`,
`CAREER_PATHWAYS`, `SKILLS_ANALYSIS`. So this project is mostly *removing*
things from free, not adding to paid. That is a live-user regression for
anyone already using them, and needs a grandfathering decision (§ Open
questions).

## 4. Career exploration — **no server-side record exists**

This is the biggest gap. There is **no per-career "explored" row**. Exploration
signals are assembled in `src/lib/discover/explored-recommendations.ts` from
journeys, saved careers and interest ratings, and the chat route notes that
saved careers "live in localStorage (`useCuriositySaves`), not in the DB".

§5 requires a persistent, server-side, per-career exploration set that is
idempotent on revisit. That needs a **new model**, e.g.:

```prisma
model CareerExploration {
  id         String   @id @default(cuid())
  profileId  String
  careerId   String
  firstAt    DateTime @default(now())
  profile    YouthProfile @relation(...)
  @@unique([profileId, careerId])   // idempotent revisits, concurrency-safe
  @@index([profileId, firstAt])
}
```

The unique constraint is what makes §18's "concurrent requests" and "retries"
requirements correct by construction rather than by careful code.

**Where it increments is a product decision, not a technical one** — see Open
questions.

## 5. Career Twin — countable today

`AiUsageEvent` already writes a row per request with `feature` and `status`, so
successful questions can be counted with an indexed query and **no new model**.
This satisfies §7's "count successful submissions only, not page views or
failures" for free, because failures carry a different `status`.

## 6. Events & Opportunities

`OPPORTUNITIES` module exists and is in the free baseline. Providers live in
`src/lib/opportunities/` (NAV only) and `src/lib/events/`. Gating is a matter
of removing it from the baseline and adding a preview branch in the route.

## 7. My Journey / 8. Personal Roadmap

`CLARITY` covers the roadmap; `UNDERSTAND` and `CORE` cover the journey. Both
in the baseline today. The roadmap generator is AI-backed and already metered
via `AiUsageEvent`.

## 9. Existing payment integrations

**None.** No Stripe, no provider SDK, no webhook routes. Greenfield.

## 10. Recommended provider

Requirement is Vipps (NO) *and* Swish (SE), recurring, NOK + SEK, webhooks.

- **Vipps MobilePay** — native recurring API, dominant in Norway. No Swish.
- **Swish** — Swedish, but **has no native recurring/subscription product**;
  recurring is normally built as merchant-initiated payments, which is
  materially more work and more compliance.
- **Stripe** — supports NOK/SEK, subscriptions, webhooks, tax, customer
  portal, Klarna, Apple/Google Pay. Swish is supported; **Vipps is not.**
- **Adyen / Nets / Svea / Billwerk+** — Nordic PSPs that do cover both, at the
  cost of heavier onboarding and worse DX than Stripe.

**Recommendation: Stripe for cards/Klarna/Apple/Google Pay as the subscription
engine of record, plus Vipps MobilePay recurring for Norway** — accepting two
integrations — **or** a Nordic PSP (Adyen/Billwerk+) if a single contract
matters more than developer experience. Swish-as-recurring should be treated as
a phase 2 with its own spike; do not assume it behaves like a card.

Given §29 (users are 15–23), see Open questions on minors.

## 11–13. Required changes

**Database**
- `CareerExploration` model (new).
- `PersonalSubscription`: add `provider`, `externalCustomerId`,
  `externalSubscriptionId`, `billingInterval`, `currency`, `country`,
  `currentPeriodEnd`. This directly reverses "No payment reference by design".
- `SubscriptionTier`: introduce `PRO`. **Do not delete `PREMIUM`, `FAMILY`,
  `FAMILY_PLUS` in the same migration** — `FAMILY_PLUS` grants `PARENT_PORTAL`
  and the family pricing page depends on it. Deprecate, then remove.

**Server**
- Extend `resolve.ts` with quantitative limits, not just boolean modules. Today
  entitlements are "has module or not"; §16 needs `careerExplorationLimit: 10`
  and `careerTwinQuestionLimit: 5`. This is the one genuine change to the
  rulebook's shape.
- Usage readers: explorations count, Twin question count.
- Enforcement in the exploration route, `api/chat`, career-twin routes,
  opportunities and roadmap routes.
- Checkout session + webhook routes.

**Frontend**
- `FeatureGate`, `UpgradePrompt`, `UsageIndicator`, `SubscriptionBadge`.
- Pricing page: currently institutional/family with enquiry CTAs. Adding a
  two-plan consumer block is additive; **decide whether the institutional
  tiers stay on the same page** (§24 says "only display two plans").
- Profile subscription section, in-session upgrade (explicitly requested).

## 14. Risks

| Risk | Note |
|---|---|
| **Reversing a documented core principle** | CLAUDE.md must change in the same PR, or this gets undone later. |
| **Regression for existing users** | Everything being gated is free today. Needs a grandfathering decision. |
| **Minors and payment contracts** | 15–17s generally cannot enter a payment contract unaided in NO/SE. §29 acknowledges this; it needs a legal answer before checkout ships, and it interacts with the counsel brief already open for Sweden. |
| **Two payment integrations** | Vipps + Stripe doubles webhook surface and reconciliation. |
| **Swish recurring** | Not a native product. Highest-uncertainty item; spike before committing. |
| **Tier enum churn** | Removing tiers the institutional layer uses would break the B2B2C product. |
| **Exploration definition** | Counting the wrong action either paywalls browsing or never triggers. |

---

## Open questions — these change the design, so they need answers before coding

1. **Confirm the payments reversal**, and that CLAUDE.md is updated with it.
2. **What is "exploring a career"?** Opening a detail sheet? Starting a
   journey? Saving? The brief says to use "the meaningful action already used
   by the application's career exploration flow" — but that flow has no single
   server-side event today. My recommendation: opening the **My Journey**
   experience for a career, not viewing a card, so browsing stays free and the
   limit lands on the deep experience.
3. **Existing users**: does someone who has already used Career Twin 40 times
   lose it at launch? Recommend grandfathering everyone active before the
   switch to PRO for a period.
4. **Do the institutional/family tiers remain?** §24 says only two plans
   display, but `FAMILY_PLUS` and the €100k institutional ladder exist and
   have a page.
5. **Under-18 purchase journey** — guardian involvement, or 18+ only for
   checkout?
6. **Free saved-career limit** — no limit exists today; §12 asks for a
   configurable default. Propose 20.

# Admin Launch-Validation Statistics — Design

**Date:** 2026-06-10
**Status:** Approved (short-spec track — implement with TDD on stats logic)

## Goal

Give the founder a single Admin Statistics dashboard that answers one
question: **"Is the product being validated?"** The launch objective is
not revenue — it is whether young people genuinely sign up, complete
career journeys, engage with Career Twin, and return.

## Decisions (locked)

- **Data source:** existing tables only + clearly-labelled smart
  approximations. No new analytics-event table, no new tracking code in
  user-facing pages.
- **Location:** *replace* the dead jobs-marketplace dashboard in place —
  `/admin/analytics` page + `/api/admin/analytics` route. Existing nav
  links keep working; the zeroed jobs/earnings/applications payload is
  removed.
- **Retention:** approximated from write-activity timestamps and clearly
  badged "Estimated".
- **No mock/demo data.** Pre-launch reality is shown via honest empty
  states.

## Architecture

Three pieces:

1. **`src/lib/admin/launch-stats.ts`** (new) — all Prisma queries +
   derivation logic as focused, testable functions, one per stat group
   (`getUserGrowth`, `getJourneyEngagement`, `getFunnel`, `getTwinUsage`,
   `getRetention`, `getSavedCareers`, `getInterestRatings`,
   `getLaunchHealth`). Pure helpers (funnel-stage counting, completion
   rate, session bucketing, day-bucketing, signal selection) are split
   out so they can be unit-tested without a DB.
2. **`src/app/api/admin/analytics/route.ts`** (rewrite) — unchanged dual
   auth gate (role === "ADMIN" OR email allowlist), then calls
   `launch-stats`, returns the new shape. 5-min cache header retained.
   BigInt from `$queryRaw` coerced to Number.
3. **`src/app/(dashboard)/admin/analytics/page.tsx`** (rewrite) — client
   page (react-query, 60s refetch) consuming the new shape. Reuses
   existing `StatCard` / `TopList` components, dark-mode card patterns,
   framer-motion. Recharts (installed) for the growth line + funnel bars.

## Data mapping

All counts exclude soft-deleted users (`deletedAt IS NULL`).

### 1. User Growth — **Real**
`User.createdAt`: total, today, this week, this month. 12-week trend via
`$queryRaw` `DATE_TRUNC('week', ...)`.

### 2. Journey Engagement — **Real**
`JourneyGoalData`: journeys started = rows with ≥1 completed step (or any
row, see note); completed = `'clarity'` ∈ `journeyCompletedSteps`;
completion rate = completed / started; avg careers explored per user =
explored rows / distinct users; most explored / most completed grouped by
`goalTitle`.
*Note:* a `JourneyGoalData` row can exist for persistence before any
checkpoint; "started" counts rows with a non-empty `journeyCompletedSteps`
OR an active goal, to avoid counting passive rows.

### 3. Funnel — **Real** (viewed = approx)
Distinct users reaching each stage:
1. Viewed career — **approx**, from `TimelineEvent` type `CAREER_EXPLORED`
   where present; labelled.
2. Started journey — has a `JourneyGoalData` row.
3. Completed Discover — `'discover'` ∈ steps.
4. Completed Understand — `'understand'` ∈ steps.
5. Completed Clarity — `'clarity'` ∈ steps.
6. Marked journey complete — same as Clarity (reaching Clarity *is*
   completion; the celebration fires there). Shown as the terminal step.

### 4. Career Twin — **Real** (sessions = approx)
`CareerTwinMessage`: total sessions ≈ distinct (userId, careerId, day)
threads (labelled approx); users who opened = distinct userId with a
`role = "user"` message; avg sessions/user = sessions / openers; most
topics = `mode` field distribution; most common careers = grouped by
`careerId`; engagement rate = openers / total users.

### 5. Retention — **Approximated** (whole section badged)
Per-user latest activity = max across `TimelineEvent.createdAt`,
`CareerTwinMessage.createdAt`, `CareerInterest.updatedAt`,
`SavedCareer.savedAt`, `YouthProfile.journeyLastUpdated`. Active 7d / 30d;
returning users = active on >1 distinct calendar day; repeat-visit rate =
returning / total; avg sessions/user ≈ distinct active days per user.
Undercounts pure browsers who never write — stated in the caption.

### 6. Saved Careers — **Real** (compared = no data)
`SavedCareer`: total, avg per user (over profiles with ≥1), most saved by
`careerTitle`, users with 3+ saved. **Compared careers** is not persisted
server-side → explicit "not recorded" empty state.

### 7. Interest Ratings — **Real**
`CareerInterest.level` (1–5): count rated, average, distribution via
`groupBy(level)`, highest / lowest average by career (grouped by
`careerId`).

### 8. Launch Health Summary — **Derived**
Top-of-page plain-English panel:
- Are people signing up? (users this week vs prior)
- Are people completing journeys? (completion rate)
- Are people using Career Twin? (engagement rate)
- Are people returning? (repeat-visit rate, estimated)
- Strongest signal so far / weakest signal so far — picked by ranking the
  four signals against simple launch thresholds.

## Labelling & empty states

- Approximated sections show a small `Badge variant="outline"` reading
  **"Estimated"** with a one-line caption explaining the basis.
- Every list/chart has a calm empty state (e.g. "No completed journeys
  yet — expected pre-launch").
- No mock data anywhere.

## Testing

TDD on `launch-stats.ts` pure helpers:
- funnel-stage counting from arbitrary `journeyCompletedSteps` arrays
- completion-rate math (incl. divide-by-zero → 0)
- twin-session bucketing by (user, career, day)
- retention day-bucketing + returning-user detection
- strongest/weakest-signal selection
UI verified via `next build` + the headless-Chrome `/dev/*` render check.

## Acceptance

- Admin-only (role or email allowlist), both API and page.
- Real data where available; approximations labelled; no unlabeled mock.
- No user-facing functionality changed (only admin route rewritten).
- Build, lint, typecheck pass.
- Dashboard answers "Is the product being validated?" at a glance.

## Out of scope

- Real event-tracking pipeline / session pings (future; would make the
  funnel's "viewed" step and retention exact).
- Server-side persistence of career comparisons.

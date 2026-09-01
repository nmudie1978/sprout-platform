# Dashboard load performance: server prefetch + hydration — Design

**Date:** 2026-06-19
**Branch:** `perf/dashboard-prefetch`

## Problem

The authenticated dashboard takes 2-3s for content to appear, with sections
popping in one-by-one. Confirmed cause: the dashboard page is a **client
component** (`"use client"`), so it renders empty, and after hydration every
section fires its **own** client `fetch`. The react-query cache is in-memory
with **no persistence**, so a full page load always starts empty → waterfall.
The explored-goals query also has `refetchOnMount: "always"`, forcing a network
round-trip even on SPA re-navigation. User reports it's slow on *every* load.

## Confirmed bottlenecks (evidence)

1. Dashboard `page.tsx` is `"use client"`; all data fetched after hydration.
2. `["explored-goals"]` query has `refetchOnMount: "always"` (page.tsx:488).
3. Four core queries fire client-side: `/api/onboarding`, `/api/goals`,
   `/api/profile`, `/api/journey/goal-data/list`.
4. Global QueryClient: `staleTime` 3 min, no persistence (providers.tsx:83).
5. 728KB career catalog fetched client-side on first load (separate concern).

## Approach

Server-prefetch the four small core queries and hydrate the react-query cache,
so the dashboard arrives **with** its data and those sections paint at first
render instead of after a client round-trip. Plus remove the redundant
always-refetch.

Deliberately NOT doing: localStorage cache persistence (caching profile/PII in
the browser violates our privacy-by-design principle — server prefetch keeps
data server-rendered per request). NOT hydrating the 728KB catalog (would bloat
the HTML payload); it stays a client fetch with `staleTime: Infinity`.

### 1. Shared loaders (single source of truth)

New `src/lib/dashboard/loaders.ts` (`import "server-only"`), one function per
endpoint returning the exact payload the route serialises today:

- `loadOnboardingStatus(userId)` → `{ needsOnboarding, completedAt,
  careerAspiration, currentPriorities, availabilityLevel, onboardingStarted }`
  or `null` if no profile.
- `loadGoals(userId)` → `{ primaryGoal }`.
- `loadProfileCompletion(userId)` → owner profile with `user` relation, with
  `guardianEmail` stripped (RLS-wrapped, identical to the route).
- `loadExploredGoals(userId)` → `{ goals }`.

The four GET routes (`/api/onboarding`, `/api/goals`, `/api/profile`,
`/api/journey/goal-data/list`) are refactored to call these loaders for their
data shape, **keeping their existing auth guards, 404/empty handling, and
headers**. This guarantees the prefetch and the live fetch can never drift.

### 2. Server page wrapper + hydration

- Rename the current client page to `dashboard-client.tsx`
  (`"use client"`, export `DashboardClient`) — unchanged behaviour.
- New server `page.tsx` (`force-dynamic`): get the session (the `(dashboard)`
  layout already guarantees an authenticated YOUTH and handles all redirects),
  build a `QueryClient`, `prefetchQuery` the four keys in parallel, then render
  `<HydrationBoundary state={dehydrate(qc)}><DashboardClient/></HydrationBoundary>`.
- Each prefetch `queryFn` JSON-normalises the loader output
  (`JSON.parse(JSON.stringify(x))`) so Dates become ISO strings, **exactly
  matching what the client `fetch().json()` returns** — no shape/serialization
  drift. If a loader returns null/throws, `prefetchQuery` swallows it and the
  key is simply not seeded (client fetches as today — safe degradation).

Query keys must match the client exactly: `["onboarding-status"]`, `["goals"]`,
`["explored-goals"]`, `["profile-completion"]`.

### 3. Remove the redundant always-refetch

Remove `refetchOnMount: "always"` from the dashboard's `["explored-goals"]`
query so it uses the seeded cache + global 3-min `staleTime`. Freshness after
edits is already preserved by existing `invalidateQueries(["explored-goals"])`
calls on goal mutations.

`use-decision-inputs.ts` is left unchanged — its always-refetch is a deliberate
freshness fix (documented stale-board bug) on different query keys.

## Why it's safe

- Client component child → the server renders no dynamic DOM, so there is **no
  DOM hydration mismatch risk**; `HydrationBoundary` only seeds the query cache.
- Shared loaders + JSON normalisation guarantee seeded shape == fetched shape.
- Failed prefetch degrades to today's behaviour (client fetch).
- Auth unchanged (layout owns it); page just reads the cached-JWT session.

## Verification

- `tsc --noEmit` (source) clean.
- Full `vitest` suite green (incl. the route/integration tests).
- `next build` — catches any RSC / server-client boundary errors (the main risk
  for this class of change).
- `eslint` clean.
- Prod smoke owed (auth-gated; can't headless easily): load the dashboard, watch
  Network — onboarding/goals/profile/explored-goals should be hydrated (not a
  post-hydration fetch), sections paint immediately, no console hydration errors.

## Out of scope (follow-ups)

- 728KB catalog slimming / route-level streaming.
- Deduplicating the two goal-data/list fetches (`["explored-goals"]` vs
  `["exploring-goals", userId]`).
- `<Suspense>` streaming of heavy child sections.

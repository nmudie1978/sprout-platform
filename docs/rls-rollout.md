# RLS rollout — phase 1 & phase 2

## Current state (phase 1 — as of 2026-04-21)

Row-Level Security **policies are defined** on the 6 highest-sensitivity
tables but **are not yet enforced** in production. This is deliberate.

### What phase 1 ships

- Migration `20260421000000_rls_phase_1` enables RLS and creates
  per-user policies on:
  - `YouthProfile`
  - `Application`
  - `Conversation`
  - `Message`
  - `CommunityReport`
  - `AuditLog`
- Three exemplar user-facing reads are wrapped in `withRLSContext`
  from `src/lib/prisma.ts`:
  - `GET /api/applications` (youth's own applications)
  - `GET /api/community-reports?my=true` (reporter's own reports)
  - `GET /api/profile` (youth self)

### Why policies don't enforce yet

Prisma connects to Supabase as the `postgres` role, which is a
PostgreSQL superuser. Superusers bypass RLS by default. So:

- Policies **exist** in the database — you can audit them, review
  them, and they are part of every new environment.
- Policies are **inert** for app traffic — every query continues to
  work exactly as before.
- The `withRLSContext` wraps **set the session context** correctly,
  so the machinery is tested end-to-end. Flipping enforcement on is
  now purely a database-side change plus completing the wrap.

### How to verify wraps locally

```bash
# Connect to your local / dev database as a non-superuser:
psql $DATABASE_URL -c "SET ROLE postgres_non_superuser_test;"
# Or temporarily force RLS on one table:
psql $DATABASE_URL -c 'ALTER TABLE "Application" FORCE ROW LEVEL SECURITY;'
# Hit the wrapped endpoint — it should still work.
# Hit an un-wrapped endpoint that queries Application — it should
# return 0 rows (context not set → policy evaluates to false).
# Revert:
psql $DATABASE_URL -c 'ALTER TABLE "Application" NO FORCE ROW LEVEL SECURITY;'
```


## Phase 2 — deferred

Phase 2 switches enforcement on. Three independent pieces:

1. **Runtime role.** Either (a) create a non-superuser app role
   (`CREATE ROLE endeavrly_app NOINHERIT;` + grant the needed DML
   privileges) and point `DATABASE_URL` at it, or (b) run
   `ALTER TABLE ... FORCE ROW LEVEL SECURITY` on each of the 6
   tables. Option (a) is Supabase-idiomatic; option (b) is simpler
   if you can't change the connection role.

2. **Admin / cron bypass.** Admin routes, cron jobs, and the audit
   export endpoint legitimately need to read across users. Add a
   companion helper `withAdminContext(fn)` that sets
   `app.bypass_rls = 'true'`, then extend each policy with
   `OR current_setting('app.bypass_rls', true) = 'true'`. The admin
   cookie session (from `src/lib/admin/auth.ts`) is the auth for
   these paths.

3. **Complete the wrap.** Audit the remaining ~185 query sites on
   the 6 tables and wrap the user-scoped ones in `withRLSContext`.
   Admin/cron sites get `withAdminContext`. Service-layer utilities
   that are called from many places get a `userId` param threaded
   through.

Estimated effort: **2–3 focused days** once phase-1 has been in prod
long enough to surface any issues with the wrap exemplars.


## Exemplar wrap pattern

```ts
// Before:
const profile = await prisma.youthProfile.findUnique({
  where: { userId: session.user.id },
});

// After:
const profile = await withRLSContext(session.user.id, (tx) =>
  tx.youthProfile.findUnique({
    where: { userId: session.user.id },
  }),
);
```

Parallel queries (Promise.all) work inside the transaction callback:

```ts
const [a, b, c] = await withRLSContext(session.user.id, (tx) =>
  Promise.all([
    tx.application.findMany(...),
    tx.application.count(...),
    tx.application.groupBy(...),
  ]),
);
```

Important: the `tx` client is bound to a single transaction — all
queries run sequentially or via the wrapped `Promise.all`. Don't
escape the callback with `tx` or return it — once the callback
resolves, the transaction closes.

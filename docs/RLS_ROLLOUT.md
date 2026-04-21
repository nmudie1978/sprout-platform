# Row-Level Security Rollout

Defense-in-depth for tenant isolation. Even if an API route forgets
to filter by `userId`, the database itself refuses to return rows
that aren't owned by the calling user.

## How it works

1. Every user-facing API route that reads user-owned data wraps its
   Prisma calls in `withRLSContext(session.user.id, async (tx) => …)`
   (see `src/lib/prisma.ts`).
2. `withRLSContext` opens a `$transaction` and sets the PostgreSQL
   session variable `app.current_user_id` with `set_config(..., true)`
   — the `true` flag is equivalent to `SET LOCAL`, scoping the value
   to that transaction.
3. RLS policies on user-owned tables read that variable via a
   `current_app_user_id()` SQL helper and reject any row whose owner
   column doesn't match.

## The catch: Prisma connects as a superuser by default

Supabase's default `postgres` role has `BYPASSRLS`. Enabling RLS on a
table while Prisma still connects as `postgres` makes the policies a
no-op.

**Therefore**: the migration at
`prisma/migrations/20260421000001_rls_policies/` writes the policies
but they are *dormant* until you change the Prisma connection role.
Until then they do nothing. No rollback risk — you can apply the
migration at any time without breaking anything.

To activate them, you need to:

1. Create a non-superuser Postgres role in Supabase (call it
   `endeavrly_app`) **without** `BYPASSRLS`.
2. Grant it the same CRUD privileges on all tables as `postgres` had.
3. Switch Prisma's `DATABASE_URL` / `DIRECT_URL` to authenticate as
   `endeavrly_app`.

Admin / cron / background jobs that legitimately need to bypass RLS
should continue to connect as `postgres` (or a dedicated
`endeavrly_admin` role with `BYPASSRLS`).

## Step-by-step activation

### 1. Apply the policies migration

Once the Prisma migration pipeline is unblocked (see the enum issue
in `20260420000001_application_message_intents`), run:

```bash
npx prisma migrate deploy
```

This applies `20260421000001_rls_policies`. At this point RLS is
enabled on seven tables but has no effect because Prisma is still
the superuser.

### 2. Create the restricted role

```sql
-- In Supabase SQL editor, as postgres:
CREATE ROLE endeavrly_app LOGIN PASSWORD 'STRONG_PASSWORD';

-- Grant the same table privileges the app currently uses
GRANT USAGE ON SCHEMA public TO endeavrly_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO endeavrly_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO endeavrly_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO endeavrly_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO endeavrly_app;

-- The helper function called by policies
GRANT EXECUTE ON FUNCTION current_app_user_id() TO endeavrly_app;
```

Crucially, do **not** grant `BYPASSRLS`:

```sql
ALTER ROLE endeavrly_app NOBYPASSRLS;
```

### 3. Flip the connection string

Update `DATABASE_URL` and `DIRECT_URL` in the production environment
to authenticate as `endeavrly_app`. Keep the old `postgres`
credentials around for migrations and emergency access.

```
DATABASE_URL=postgresql://endeavrly_app:STRONG_PASSWORD@...
```

### 4. Smoke-test

- Sign in as a youth → hit every youth API → verify 401/403 or correct
  data. No 500s.
- Sign in as a teacher → hit `/api/cohorts/*` → verify you see your
  own cohort memberships but not another teacher's cohorts.
- Sign in as an admin → verify `/admin/*` paths work. Admin code
  continues to connect as `postgres` for bypass.

### 5. Progressive rollout

If anything breaks, `ALTER TABLE X DISABLE ROW LEVEL SECURITY;` per
table — zero-downtime rollback.

## Routes already adopting withRLSContext

The following routes have been migrated as the pattern template:

- `GET /api/cohorts/join` — youth lists own cohort memberships
- `GET /api/cohorts` — teacher lists own cohorts
- `GET /api/cohorts/[id]` — teacher reads own cohort + aggregates
- `PUT /api/guardian-consent` — youth's own consent flow

When you touch a user-facing Prisma query in any other route, wrap
the query in `withRLSContext`. The pattern:

```ts
// Before:
const items = await prisma.savedItem.findMany({
  where: { profileId: someProfileId },
});

// After:
import { withRLSContext } from '@/lib/prisma';
const items = await withRLSContext(session.user.id, (tx) =>
  tx.savedItem.findMany({ where: { profileId: someProfileId } })
);
```

The query itself stays identical. The wrapper just sets the
transaction-scoped session variable that the RLS policies check.

## Phase 2 — two-hop tables (not in this migration)

Deferred because they need join-aware policies that must be tested
against real data:

- `JourneyNote`, `SavedItem`, `TraitObservation`, `JourneyReflection`
  (→ `YouthProfile.userId`)
- `Message` (→ `Conversation.participant1Id / participant2Id`)
- `Conversation` (own participants)

Template for a two-hop policy (JourneyNote → YouthProfile):

```sql
ALTER TABLE "JourneyNote" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journey_note_owner_access"
  ON "JourneyNote"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "YouthProfile" p
      WHERE p.id = "JourneyNote"."profileId"
        AND p."userId" = current_app_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "YouthProfile" p
      WHERE p.id = "JourneyNote"."profileId"
        AND p."userId" = current_app_user_id()
    )
  );
```

## FAQ

**Does this work with PgBouncer / Supabase connection pooling?**
Yes, because `withRLSContext` wraps everything in a `$transaction`
and `set_config(..., true)` is transaction-local. Every transaction
re-sets the variable, so pooled connections between transactions
don't leak context.

**What about the `setRLSContext` / `clearRLSContext` helpers?**
Those use `set_config(..., false)` (session-level) and will not
survive PgBouncer's connection recycling. Prefer `withRLSContext`.
Those helpers exist for unit tests / one-off scripts where the
connection lifecycle is predictable.

**Can a malicious user forge the context variable?**
No. `app.current_user_id` is set inside the transaction by the
Node process — there is no user input path that writes to it.
`withRLSContext` takes `session.user.id` from NextAuth, never from
the request body.

**What if we forget to wrap a query?**
The query runs without RLS context. The policy sees
`current_app_user_id() = NULL` and falls through — meaning NO rows
are returned for that user's own data. You'll notice immediately
because features break. That's the correct fail-closed behaviour.

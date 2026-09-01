# Working against a database that isn't production

## The problem

`.env` on a developer machine points `DATABASE_URL` at the live Supabase
project. There is no staging environment, so:

- running the app locally and signing up creates a **real account**;
- running a script that deletes test rows deletes them **from production**;
- `prisma migrate deploy` locally applies migrations **to production**;
- the test suite, left unguarded, would create and delete rows **in
  production** — Prisma auto-loads `.env`, so tests inherit the same URL even
  though `process.env.DATABASE_URL` looks unset to them.

This is not hypothetical. In one working session it produced four real signups,
four deletions, and seven orphaned rows of personal data.

## What is guarded automatically

`src/lib/db-guard.ts`, wired into two places:

| Situation | Behaviour |
|---|---|
| Test suite → hosted database | **Blocked.** Throws where the connection would be opened (`src/lib/prisma.ts`). |
| `next dev` → hosted database | Loud warning at boot. Not blocked — production is currently the only database that exists. |
| Anything → `localhost` | Silent. |

Tests that mock `@/lib/prisma` — nearly all of them — never reach the guard, so
it costs the suite nothing.

To override for one run, when you genuinely mean it:

```bash
ALLOW_PRODUCTION_DB=true npm test
```

Only the exact string `true` works, so a typo fails closed.

## Setting up your own database

### Option A — Supabase branch database (closest to production)

Supabase branches give you a real Postgres with the same extensions and the
same RLS behaviour, which matters here: the app relies on the connecting role
having `BYPASSRLS`, and a plain local Postgres won't reproduce that.

1. In the Supabase dashboard, create a new project (or a branch of the existing
   one) — e.g. `endeavrly-dev`.
2. Copy its connection strings into `.env`:

```bash
DATABASE_URL="postgresql://postgres:<pw>@db.<new-ref>.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:<pw>@db.<new-ref>.supabase.co:5432/postgres"
```

3. Create the schema and seed it:

```bash
npx prisma migrate deploy
npm run db:seed
```

The guard will still warn, because the host is hosted — that is correct, and it
now names a database you don't mind writing to.

### Option B — local Postgres (fastest, no network)

```bash
docker run --name endeavrly-db -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d postgres:16
```

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/endeavrly_dev"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/endeavrly_dev"
```

```bash
npx prisma migrate deploy
npm run db:seed
```

The guard goes silent on `localhost`.

Caveat: RLS behaves differently. The production hardening
(`20260901093000_supabase_rls_deny_by_default`) enables RLS with no policies
and relies on the app's role bypassing it. A default local `postgres`
superuser also bypasses RLS, so this works — but it is not a faithful test of
the Supabase permission model. Use Option A when changing anything RLS-related.

## Before you point anything at production again

- `prisma migrate deploy` is forward-only and safe to re-run. `prisma migrate
  reset` and `prisma db push` are **not** — never run them against a hosted
  database.
- Applied migrations are checksummed. Never edit the SQL of a migration that
  has already run; write a new one.
- Deleting a user does **not** remove their `LegalAcceptance` row (no
  `onDelete: Cascade`), which holds an IP address and user agent. Until that is
  fixed, delete both.

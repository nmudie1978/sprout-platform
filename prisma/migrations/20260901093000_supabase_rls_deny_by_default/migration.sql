-- ═══════════════════════════════════════════════════════════════════════════
--  Supabase hardening: deny-by-default on the PostgREST surface
-- ═══════════════════════════════════════════════════════════════════════════
--
-- WHY THIS EXISTS
--
-- Endeavrly reaches its database only through Prisma, over a direct Postgres
-- connection, as the `postgres` role. It has never used supabase-js, the anon
-- key, or PostgREST. But the database is a Supabase project, which means the
-- REST API at https://<ref>.supabase.co/rest/v1/ is live and pointed at the
-- SAME `public` schema Prisma owns.
--
-- Today that API returns "permission denied" for every table, because Prisma
-- creates tables owned by `postgres` with no grants, and this project has no
-- default privileges granting `anon` / `authenticated` anything. So there is
-- no exposure right now — but the ONLY thing standing between the anon key
-- (which is designed to be public) and every row of youth data is the absence
-- of a GRANT. One click in the Supabase dashboard, or one helpful SQL snippet
-- pasted into the SQL editor, and 90-odd tables of minors' reflections,
-- journeys and Career Twin conversations become world-readable.
--
-- This migration makes that a two-lock problem instead of a one-lock problem:
--
--   1. REVOKE — restate explicitly that the PostgREST roles hold nothing, and
--      set default privileges so future tables start the same way.
--   2. ENABLE ROW LEVEL SECURITY, with NO policies — which in Postgres means
--      "deny all rows to everyone except roles that bypass RLS".
--
-- WHY THIS IS SAFE FOR THE APP
--
-- The application connects as `postgres`, which on Supabase has
-- rolbypassrls = true (verified: rolsuper=false, rolbypassrls=true). RLS is
-- not evaluated at all for a BYPASSRLS role, so every existing Prisma query
-- behaves identically. `service_role` also bypasses RLS, so the Supabase
-- dashboard and any future server-side Supabase client keep working too.
--
-- Deliberately NOT policy-based: adding permissive policies would be writing
-- an access-control model we do not use and cannot test. Zero policies is the
-- honest expression of "nothing should reach these tables except the app".
--
-- TO REVERSE: ALTER TABLE "<name>" DISABLE ROW LEVEL SECURITY;

-- ── 1. Nothing for the PostgREST roles, now or in future ──────────────────
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

-- ── 2. RLS on, no policies, on every application table ────────────────────
-- `_prisma_migrations` is excluded: it is Prisma's own bookkeeping table and
-- carries no user data, and leaving the migration engine's table untouched
-- avoids any interaction with how `prisma migrate` reads it.
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname <> '_prisma_migrations'
      AND c.relrowsecurity = false
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.relname);
  END LOOP;
END
$$;

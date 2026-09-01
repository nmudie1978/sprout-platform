# Security review — 2026-08-31

Full-application review of Endeavrly ahead of a controlled public MVP launch:
authentication, authorisation, Supabase posture, secrets, AI endpoints, API
surface, data privacy, frontend, dependencies, production configuration and
abuse prevention.

> **Deployment status:** the code changes from this review are in the working
> tree only — they are **not in production yet**. The two database migrations
> *are* applied (see the bottom of this document). Everything below describes
> the code as it now stands in the repo.

**Verdict: conditionally ready for a controlled MVP launch.** No unauthenticated
path to user data was found, and no secret is exposed. The gaps that mattered
were the ones that only show up under an *adversary*, not under a user: nothing
throttled password guessing, suspending an account did nothing, and the sign-in
page would redirect anywhere on the internet. Those are fixed. What remains is
operational configuration and a legal sign-off, listed at the bottom.

---

## What was verified as sound

Recorded so a later reviewer doesn't re-derive it.

| Area | Finding |
| --- | --- |
| Tenant isolation (organisations) | `requireOrgAccess` re-derives membership from the DB per request and is the only way to obtain an org context. Every route passes a specific permission. No cross-tenant path found. |
| IDOR | Every user-data route scopes by the session's `userId`/`profileId`. Routes taking an id from the request (`cohorts/[id]`, `community-reports/[id]`, `insights/videos/regenerate`) re-check ownership or role. |
| Secrets in the repo | No credential in the tree or in git history. `.env` / `.env.local` are ignored. |
| Secrets in the client bundle | Built `.next/static` scanned for OpenAI keys, Supabase service-role keys, JWTs and Postgres URLs — clean. No server-only env var is referenced from a `"use client"` file. |
| SQL injection | No `$queryRaw`/`$executeRaw` with interpolation anywhere. All access via Prisma. |
| SSRF | One outbound fetch to a user-influenced URL (`youtube-search`, fixed Google host). Career-clip validation re-checks redirect hops against an allowlist. |
| XSS | One `dangerouslySetInnerHTML` (Mermaid), double-sanitised. No `eval`/`new Function`. |
| Environment validation | `validateEnv()` hard-fails the production boot on a missing or placeholder `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `CRON_SECRET` or `ADMIN_SESSION_SECRET`. |
| Logging | No password, token or secret is logged. Sentry runs with `sendDefaultPii: false`. IPs are anonymised wherever stored. |
| GDPR erasure | Every user-owned table either cascades on user delete or is deleted explicitly by the purge cron. `AiIntentLog` survives with `userId` nulled, which is deliberate anonymisation. |

### Supabase — the important nuance

The database is a Supabase project, so the PostgREST API at
`https://<ref>.supabase.co/rest/v1/` is live against the same `public` schema
Prisma owns. Measured against production:

- **84 of 92 tables have RLS disabled.**
- **`anon` and `authenticated` hold zero grants on every table** (all 92 owned by
  `postgres`, `relacl = null`), and there are no default ACLs in `public`.
- An unauthenticated request to the REST API returns `401`; with a valid anon
  key it would return `permission denied`.

So there was **no exposure** — but the only thing between the anon key (which
is designed to be published) and every row of minors' data was the *absence of a
GRANT*. One click on "enable table in API", or one snippet pasted into the SQL
editor, would have made it world-readable.

**Now fixed and verified in production:** RLS is enabled on **94 of 95** tables
(`_prisma_migrations` deliberately excluded), grants to `anon`/`authenticated`
remain at zero, and Prisma reads still succeed — confirming the app's
`BYPASSRLS` role is unaffected. See migration
`20260901093000_supabase_rls_deny_by_default`.

---

## Issues found and fixed

### Critical

**1. Suspension and banning were not enforced anywhere.**
The admin panel and the safeguarding report queue both "suspend" an account by
setting `User.isPaused` (and `accountStatus`), and then send the young person a
notification saying so. Nothing read either field back. `isAccountActive()` and
`checkPlatformAccess()` existed but had **no callers**. A user suspended for
harmful behaviour kept full read and write access to the entire product.

For a youth-safety platform this is the moderation system not working, which is
worse than not having one — the safeguarding queue reports "action taken" when
none was.

*Fix:* enforced at the single chokepoint every authenticated request already
passes through. `loadSessionFields` now loads `isPaused`; a suspended, banned or
paused account marks the JWT revoked, which blanks `session.user.id` so every
existing `!session.user.id` guard treats the request as unauthenticated. Takes
effect within the existing 60-second session-refresh window. Sign-in is blocked
separately with a clear message, checked *after* the password so it can't be
used to probe which addresses are moderated. `ONBOARDING` and
`PENDING_VERIFICATION` are deliberately not revoked — those users still need the
profile-completion flow.
Files: `src/lib/auth.ts`.

### High

**2. No brute-force protection on user sign-in.**
`/api/auth/callback/credentials` is public and verifies a bcrypt hash. Nothing
limited attempts — an attacker who knew a young person's email address could
guess passwords as fast as the network allowed, indefinitely. (The Admin Portal
had a limiter; ordinary user accounts had none.)

*Fix:* two Redis-backed buckets checked before the DB lookup and before bcrypt —
10 attempts per 15 minutes per account (can't be dodged by rotating IPs) and 50
per 15 minutes per source IP (loose enough that a school behind one NAT address
doesn't lock itself out). Both cleared on a successful sign-in, so a user who
mistypes isn't punished. Fails open on an internal error. Email and password
inputs are length-capped so an oversized password can't burn CPU in bcrypt.
Files: `src/lib/auth.ts`, `src/lib/rate-limit.ts`.

**3. Open redirect on the sign-in flow.**
The NextAuth `redirect` callback was `if (url.startsWith("http")) return url` —
so `/api/auth/signin?callbackUrl=https://evil.example` sent the user to any site
on the internet after signing in, from Endeavrly's own domain. A credible
phishing vector against exactly the audience least likely to re-check the
address bar.

*Fix:* relative paths resolve against our origin; absolute URLs are allowed only
on the same origin; everything else falls back to the base URL.
Protocol-relative (`//evil`) and backslash (`/\evil`) forms are screened first.
Files: `src/lib/auth.ts`.

**4. Admin Portal lockout was per-instance.**
The admin login limiter was an in-memory `Map`. On Vercel that means a fresh
5-attempt allowance on every cold start and every instance — in practice barely
a limit. One password protects every user record and every safeguarding report.

*Fix:* added a Redis-backed lockout on top — 10/hour per IP plus a shared
global bucket so rotating addresses doesn't help either. Checked before the body
is parsed and before bcrypt.
Files: `src/app/api/admin/login/route.ts`.

**5. A password reset did not sign out anyone else.**
Sessions are stateless 30-day JWTs. Resetting a password changed the hash but
left an attacker holding a stolen session token signed in for the rest of the
month — the exact situation a reset exists to end.

*Fix:* added `User.passwordChangedAt`, set by the reset flow. The JWT stamps a
fixed `authTime` at sign-in (unlike `iat`, which NextAuth refreshes on every
rotation); any session predating the reset is revoked.
Files: `prisma/schema.prisma`, migration `20260901090000_password_changed_at`,
`src/lib/auth.ts`, `src/app/api/auth/reset-password/route.ts`,
`src/types/next-auth.d.ts`.

**6. Access codes were generated with `Math.random`.**
An access code grants membership of a real organisation and a place in a cohort
— it is a credential. `Math.random` is a seeded PRNG whose internal state is
recoverable from a handful of observed outputs, so anyone holding one
legitimately-issued code could predict the codes issued around it.

*Fix:* default source is now `crypto.randomInt`, which is also rejection-sampled
so the 31-character alphabet stays uniform. The injectable generator is kept for
deterministic tests.
Files: `src/lib/organisations/access-codes.ts`.

### Medium

**7. Supabase RLS disabled on 84 tables — FIXED AND VERIFIED IN PRODUCTION.** Migration
`20260901093000_supabase_rls_deny_by_default` revokes everything from `anon` /
`authenticated` (including future tables via default privileges) and enables RLS
with **no policies** — which in Postgres means deny-all to any role that doesn't
bypass RLS. Safe for the app: it connects as `postgres`, verified
`rolbypassrls = true`, so RLS is never evaluated for it. Reversible with
`ALTER TABLE … DISABLE ROW LEVEL SECURITY`.

**8. `/api/health` leaked the database host.** On a DB failure it returned
`String(error)` on a public, unauthenticated endpoint — and Prisma's P1001 quotes
the host, port and user back verbatim (`db.<ref>.supabase.co:5432`). Now logs the
error server-side and returns only the stable Prisma code. The probe also now
reports when `RATE_LIMIT_ALLOW_IN_MEMORY` is on, so the single most dangerous
leftover setting can't hide in the dashboard.

**9. `/lab/*` was live and indexable in production.** ~20 internal design
galleries (roadmap variants, theme pickers) were publicly reachable — `/dev` and
`/test` were blocked, `/lab` had been missed in both the middleware gate and
`robots.txt`. Now blocked in production and disallowed for crawlers. View them
with `npm run dev`.

**10. Spoofable "trusted" request headers.** Middleware sets `x-user-id`,
`x-user-role`, `x-requires-consent` and `x-pathname` for downstream handlers, and
Next.js merges those with what the client sent. Nothing reads them today, so
this was not exploitable — but the first handler that trusted `x-user-id`
instead of the session would have been a one-header IDOR. They are now stripped
from every inbound request before being set.

**11. Unbounded public query.** `GET /api/career-paths?all=1` lifted the `take`
entirely — one unauthenticated request selected every approved contribution.
Capped at 500, tag filters capped at 50, and a per-IP limit added.

**12. Missing rate limits on public/enumerable endpoints.**
`GET /api/join/access-code` (the code preview — a free oracle for guessing codes
and mapping which organisations exist) and `GET /api/profile/[slug]` (the only
unauthenticated endpoint returning anything about a real young person) both had
none. POST on the former was already throttled; GET is the one you'd loop on.

**13. Weak signup input validation.** No email-format check, and unbounded
`password` and name fields on an endpoint reachable without an account. Added
format and length bounds (bcrypt reads only the first 72 bytes anyway).

**14. Global AI budget backstop missing on two routes.** `career-presence` and
`translate` enforced per-user monthly caps but skipped `checkGlobalAiBudget()`.
Per-user caps don't stop a flood of cheap accounts collectively running up the
bill; the shared daily ceiling does. Both now consult it and degrade to their
existing non-AI fallback.

**15. GDPR subject-access export was incomplete.** It omitted every category
added since it was written: `ArrivalCheckIn` and `ClarityShift` (self-reported
emotional signals — the most sensitive data the platform holds about a young
person), organisation memberships, access-code redemptions, personal
subscriptions and parent/child links. All now included.

**16. Dependencies.** `npm audit` went from **25 vulnerabilities (3 critical, 8
high)** to **0**, including a critical in `@auth/core` (via
`@auth/prisma-adapter`) and highs in `ws`, `sharp` and `postcss`. `nodemailer`
(2 highs, only fixable by a major bump) was **removed entirely** — it was unused;
mail goes through Resend.

One caveat worth keeping: `@sentry/nextjs` is pinned to `~10.55.0` rather than
`^10`. `npm audit fix` initially took it to 10.73.0, which pulls in
`@sentry/server-utils` with a broken bundled path
(`node_modules/node_modules/@apm-js-collab/…`) that makes Vitest fail to collect
**any** test file importing Sentry — 36 tests silently stopped running.
10.55.0 clears the same advisory with no such breakage. Do not widen this range
without re-running the full suite.

**17. CSP dropped `unsafe-eval` in production.** Only `next dev` needs it for
Fast Refresh and the error overlay. `unsafe-inline` remains pending the nonce
migration.

**18. Dead Supabase storage client deleted.** `src/lib/supabase.ts` was unused
code from the removed jobs marketplace that instantiated a browser Supabase
client and referenced a **public** `job-images` bucket.

---

## Remaining recommendations

### Must be confirmed before launch (operational — not code)

1. ~~**`REDIS_URL` is set in production and `RATE_LIMIT_ALLOW_IN_MEMORY` is NOT
   set.**~~ **VERIFIED SATISFIED (2026-09-01.)** `vercel env ls production` on
   `v0-youth-platform` shows `REDIS_URL` present for Preview + Production and no
   `RATE_LIMIT_ALLOW_IN_MEMORY` entry in any environment. `GET
   https://endeavrly.com/api/health` returns `{"status":"ok","db":"up",
   "redis":"up"}` — a real PING round-trip, so this is not a repeat of the
   2026-07-30 set-but-dead-host outage.

   Re-check this the same way after any Redis plan change or billing lapse: a
   `REDIS_URL` pointing at a dead host is indistinguishable from a healthy one
   in the dashboard, and in-memory limits are per-instance on Vercel — which
   would leave the sign-in throttle, admin lockout, signup limits and every AI
   cost cap bypassable at scale. Once this review's code is deployed,
   `/api/health` also reports the escape hatch if it is ever switched on.
2. **A hard billing cap in the OpenAI dashboard.** `AI_MONTHLY_COST_CEILING_USD`
   and `AI_GLOBAL_DAILY_CAP` are in-app early-trip backstops, not a substitute
   for the provider-side ceiling.
3. ~~**`CRON_SECRET` is set.**~~ **VERIFIED SATISFIED (2026-09-01)** — present
   in Production. Without it the purge cron never runs and soft-deleted accounts
   keep full PII indefinitely (a GDPR erasure failure); `validateEnv` also fails
   the boot if it goes missing.
4. **Under-16 lawful basis and DPIA signed off.** Product/legal, not code. The
   code matches the stated policy.

### Worth doing soon

5. ~~**No email verification at signup.**~~ Raised during this review as the
   biggest remaining account-integrity gap (accounts were `ACTIVE` with no proof
   the address belonged to the person). A parallel session shipped it while this
   review was running — `EmailVerificationToken`,
   `/api/auth/resend-verification`, `/api/auth/verify-email`, plus a
   case-insensitive email unique index. **Verify end-to-end before launch**: sign
   up, confirm the mail arrives via Resend, confirm the link sets
   `User.emailVerified`, and confirm an expired or reused token is refused.
6. **CSP still allows `unsafe-inline` on `script-src`.** Moving to nonces would
   make the CSP an actual XSS barrier rather than a partial one.
7. **`GET /api/admin/logout`** clears the admin cookie on a plain navigation, so
   it is CSRF-able. Impact is a nuisance logout only; left alone because it is a
   deliberate link target.
8. **Signup is 10/minute per IP.** Fine for humans, generous for a script. Worth
   tightening, or adding a challenge, if automated account creation appears.
9. **Legacy PII still collected**: `phoneNumber`, and lat/lng geocoding in
   `profile/location`. Neither appears to be used by a live feature — data
   minimisation says stop collecting them.
10. **Prompt injection** is present but low-impact: model output is never used to
    take an action, conversations are scoped per user, and output guardrails run
    on every chunk. The one structural note is that the rolling Career Twin
    summary is model-generated from user text and re-injected into the system
    prompt, so a user can seed instructions that persist — within their own
    thread only.
11. **`src/lib/matching/__tests__/adversarial-scenarios.test.ts` is failing**
    ("STRONG people input"). Pre-existing and unrelated to security, but it means
    the suite is not green.

---

## Applying the migrations

Two migrations ship with this review. **Both are already applied to production**
(a parallel session ran `prisma migrate deploy` during the review), and their
effect has been verified against the live database:

- `20260901090000_password_changed_at` — one nullable column. Confirmed present
  on `User`. No effect on existing sessions.
- `20260901093000_supabase_rls_deny_by_default` — REVOKEs (no-ops, as intended)
  and `ENABLE ROW LEVEL SECURITY`. Confirmed: 94/95 tables now have RLS on,
  `anon`/`authenticated` still hold zero grants, and application reads through
  Prisma still succeed.

**Do not edit either migration's SQL.** Prisma records a checksum per applied
migration; changing the file would fail the next `prisma migrate deploy` with a
checksum mismatch. To reverse the RLS one, write a new migration running
`ALTER TABLE … DISABLE ROW LEVEL SECURITY`.

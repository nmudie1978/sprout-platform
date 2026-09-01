# Systemic risks — 2026-09-01

Written after a session that shipped the email-verification flow and merged the
2026-08-31 security review. The individual bugs are recorded elsewhere
(`docs/security-review-2026-08-31.md`). This document is about the *patterns*
underneath them, because fixing those is worth more than fixing any single
finding.

The through-line: **Endeavrly is being built faster than it is being verified,
and its systems report success by default.** Individually the items below are
annoyances. Together they mean we cannot currently tell whether the product
works — and for a youth-safety platform, that is the risk that matters.

---

## 1. Work gets built but does not reach users

The delivery pipeline is broken and nothing noticed.

- `v0-youth-platform` (which serves endeavrly.com) has failed **9 consecutive
  deployments**. Last success: **31 Aug 20:02**. Every attempt since fails at
  `BUILD_FAILED: "Resource provisioning failed"` with a 0ms build — Vercel never
  provisions a build machine.
- It is project-specific, not our code: on the same day, from the same commits,
  `youth-platform` deployed 4/4 successfully while `v0-youth-platform` failed
  7/7, across both Preview and Production targets. Configs are near-identical.
- Consequence today: the security review's **critical** finding (suspension not
  enforced) is merged to `main` and still not running in production. So is the
  entire email-verification flow — `/auth/check-email` returns 404 on
  endeavrly.com.

Nine failures accumulated over three days with no alert. CI is healthy; delivery
is not; nothing distinguishes the two.

**Fix:** alerting on failed production deploys. A merged-but-undeployed `main`
should be impossible to miss.

---

## 2. Silent failure is the default mode

The most important pattern in this codebase. Failure paths return success.

| System | How it failed silently |
|---|---|
| Suspension | `isPaused` was set, the young person was told "action taken", and **nothing ever read the field**. `isAccountActive()` had zero callers. |
| Transactional email | `sendMail()` returns `{ok:true, skipped:true}` when unconfigured. Signup "succeeds", no email exists. |
| Password reset / verification | Anti-enumeration generic `200`s mean a **dead Resend key is indistinguishable from success** (cause of the 2026-06-19 incident). |
| Redis | Reported `"ok"` for eight weeks while the host was dead (2026-07-30). |
| GDPR erasure | `LegalAcceptance` has no `onDelete: Cascade`, so the nightly purge deletes `User` rows and **orphans** rows holding `ipAddress` + `userAgent`. Seven such orphans exist today against two live users. |
| Video cache | Empty results cached for 24h, poisoning the surface (#282). |

For a safeguarding platform, a moderation system that fails quietly is worse
than not having one: it reports that a young person was protected when they were
not.

**Fix:** make failure loud. See the tickets below.

---

## 3. There is no staging — production *is* the test environment

The local `.env` `DATABASE_URL` points at the live Supabase database. There is no
separate environment.

Consequences observed in one session: real user rows created and deleted in
production for testing, four migrations applied to production before the code
that used them existed anywhere, and orphaned personal data accumulating from
test signups. Every schema change is a production event.

**Fix:** a second Supabase project (or branch database) for local/preview, and a
`DATABASE_URL` in `.env` that cannot be the production one.

---

## 4. Multiple agents, one checkout, one database

During a single session the working tree's branch changed **three times**
(`fix/feeds-unblock` → `fix/onboarding-quiz-and-degree-fields` →
`fix/security-review-2026-08-31`), another session committed this session's
in-progress files, and user accounts appeared and disappeared between
consecutive queries against production.

Work survived on luck: for a period it existed only as an unpushed commit in a
checkout another process was resetting.

**Fix:** concurrent sessions get their own git worktree, and ideally their own
database. Push early rather than accumulating local commits.

---

## 5. Quality gates that do not gate

`src/lib/matching/__tests__/adversarial-scenarios.test.ts` ("STRONG people
input") has been failing for some time. The pre-commit hook runs the full suite,
so **every commit in the repo is blocked by it**, and the rational response is
`--no-verify`. That happened in this session, and there is prior precedent.

Once bypassing is routine the gate protects nothing — a permanently red suite is
worse than no suite, because it trains everyone to ignore a real failure when it
appears.

**Fix:** green the suite, or quarantine that test explicitly with a dated
`skip` + issue link. Never leave it red-and-blocking.

---

## 6. The repo does not describe reality

- `CLAUDE.md` stated the stack was "Supabase (Auth + DB)". There is **no Supabase
  Auth** — it is NextAuth (credentials + bcrypt) + Prisma, with Supabase as the
  Postgres host only. This misdirected a whole session's opening work.
- `.env.example` documented `EMAIL_SERVER_*` SMTP vars that nothing reads.
- `NEXTAUTH_URL` on production is `https://v0-youth-platform.vercel.app`, not
  `https://endeavrly.com` — it drifted back after being fixed on 2026-05-29.
  NextAuth treats it as authoritative for `baseUrl`, so sign-in can redirect
  users off the custom domain. (The *redundant* project has it set correctly.)
- Two near-identical Vercel projects build on every push, with no stated owner or
  purpose.

Operational truth lives in scattered session notes rather than in the repo, so
each new session rediscovers it — and sometimes rediscovers it wrong.

---

## Tickets: make failure loud

Ordered by value. These are the concrete form of §1 and §2.

### P0 — Deploy visibility
- [ ] Alert on failed **production** deployments (Vercel → Slack/email webhook).
      Nine silent failures over three days is the bug.
- [ ] Add a deploy-freshness probe: expose the running commit SHA at
      `/api/health` and compare against `origin/main` in a scheduled check, so
      "merged but not live" is detectable.

### P0 — Mail delivery is now load-bearing
Email verification is a **hard gate**: if mail is broken, *nobody can sign up*.
- [ ] Extend `/api/health` to report mail readiness — `RESEND_API_KEY` present
      and a real Resend API probe (a `GET /domains` call returns 401 on a dead
      key; do not send mail).
- [ ] Make `sendMail()`'s `skipped: true` path a Sentry **error**, not a warning,
      in production. Today a missing key is a log line nobody reads.
- [ ] Synthetic signup canary: create → confirm token issued → confirm mail
      accepted by Resend → delete. Run hourly against production.

### P1 — Close the silent-erasure hole
- [ ] Add `@relation(..., onDelete: Cascade)` to `LegalAcceptance.userId`.
- [ ] One-off migration to delete the existing orphans (7 at time of writing).
- [ ] Assert in the purge job that no orphan rows remain afterwards.

### P1 — Restore the gates
- [ ] Fix or explicitly quarantine `adversarial-scenarios.test.ts` so the suite
      is green and the pre-commit hook means something again.
- [ ] CI check that fails if `--no-verify` commits land (or simply keep the
      suite green so nobody needs it).

### P1 — Environment truth
- [ ] Set production `NEXTAUTH_URL` to `https://endeavrly.com`.
- [ ] Decide the fate of the `youth-platform` project: delete it, or document it
      as the deliberate failover and keep its env in sync. Right now it is the
      only project that can build, and it is missing `ADMIN_PASSWORD_HASH`,
      `ADMIN_USERNAME` and both Sentry DSNs.
- [ ] Separate database for local development.

### P2 — Verify the safeguarding claims
The suspension bug existed because nothing tested the *outcome* of moderation.
- [ ] Integration test: suspend a user → assert their session is revoked and
      sign-in is refused.
- [ ] Do the same for every safety control that tells a user it did something.

---

## What this is not

None of the above is an argument that the product is bad or that the work is
poor. The features are real and the security review was thorough. The argument
is narrower: **the systems that would tell us something is broken currently do
not**, and until they do, confidence in any given feature is unearned.

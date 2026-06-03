# Industry Insights — Link-Rot Fix (Gap #3)

**Date:** 2026-06-03
**Branch:** `fix/insights-link-rot`
**Author:** Claude (driven autonomously while owner away; decisions flagged below for audit)

## Problem

`data/insights/pool-metadata.json` reports **20 of 41 (49%) insight source URLs "failed"** verification.
Per-domain health shows the most authoritative sources failing *completely*:
`weforum.org` 0/5, `oecd.org` 0/5, `ilo.org` 0/1, `wipo.int`, `visualcapitalist.com` 0/2 — while
`youtube.com` passes 11/11. Dead/"failed" items are hidden from the pool carousel, so the **net effect
is that the most trustworthy tier-1 sources are being stripped from Industry Insights** and the surface
skews toward YouTube.

Separately, the verification job is **manual** (`npm run insights:refresh`) and last ran 2026-02-12 (~4
months stale), so the pool silently decays.

### Root cause (verified by reading the code)

`src/lib/insights/verify-pool.ts:103` treats **any** HTTP status `>= 400` as `failed`:

```ts
if (response.status < 200 || response.status >= 400) { return { ...item, verificationStatus: "failed" } }
```

Combined with a **bot User-Agent** (`"...Endeavrly-InsightsVerifier/1.0"`, line 16), large institutional
sites (WEF, OECD, ILO, WIPO) reject the verifier with **403 / 429** anti-bot responses. The current code
cannot tell **"genuinely gone" (404/410)** from **"blocked our bot / momentary 5xx"**, so it marks live
tier-1 pages dead. The login-wall heuristic (`LOGIN_SIGNALS` includes `"window.location"` and `"/auth"`)
also produces false failures on legit pages whose analytics JS contains those strings.

**The pool only ever contains allowlisted tier-1 domains** (`domain-allowlist.ts`; non-allowlisted items
are failed on entry at `verify-pool.ts:66`). So a 403/429 from a *pool* item is by construction
bot-blocking, not death.

## Goal

1. Stop false-flagging reachable tier-1 sources as dead (recover the ~18–20 false failures).
2. Never show the user a raw 404 when a source link genuinely rots (graceful archive fallback).
3. Make verification run automatically so the pool can't go 4 months stale again.

Non-goal (deferred, see below): building active dead-link detection for the 108 hard-coded stat-card
URLs and 17 world-lens article URLs (they are not in the pool). The archive fallback (Part B) covers the
user-facing harm for stat cards in the meantime.

## Design

### Part A — Accurate verification (root cause)

Extract the classification decision into a **pure, unit-testable function** and relax it for trusted
(allowlisted) domains.

New `src/lib/insights/verify-classify.ts`:

```ts
export function classifyVerification(input: {
  status: number;                 // final status after redirect:"follow"
  trusted: boolean;               // isAllowedDomain(domain)
  contentType: PoolContentType;   // expected type ("pdf" etc.)
  responseContentType?: string;   // response header (only when body fetched)
  body?: string;                  // only present on GET path
  headers?: Headers;              // for login-wall location check
}): "verified" | "failed"
```

Rules (in order):
- `404` or `410` → **failed** (genuinely gone), regardless of trust.
- other `4xx`/`5xx` (401/403/405/429/5xx…) → `trusted ? "verified" : "failed"`
  (a trusted tier-1 domain that blocks our bot or has a momentary 5xx is *reachable*, not dead).
- `2xx`/`3xx` → content sanity when a body is available:
  - expected `pdf` but response is neither pdf nor html → failed
  - `body.length < MIN_BODY_LENGTH` (1000) → failed (true soft-404)
  - `!trusted && isLoginWall(...)` → failed (login-wall heuristic is **skipped for trusted** domains —
    too noisy on legit tier-1 pages)
  - otherwise → **verified**

`verify-pool.ts` changes:
- Send a **realistic browser User-Agent** + `Accept` / `Accept-Language` headers to reduce blocks at the
  source.
- Delegate the decision to `classifyVerification` (pass `trusted = isAllowedDomain(item.domain)`).
- Add **one retry** on network error before declaring failure (kills single-blip false fails). Keep the
  outer `catch → failed` for genuine unreachability (DNS fail / refused / repeated timeout).

This is the highest-leverage change: it flips the WEF/OECD/ILO/WIPO false-failures back to verified.

### Part B — Graceful archive fallback (stat cards)

All 108 stat cards surface their source via `SourceDrawer` (`source-drawer.tsx`). Add a pure helper and a
subtle secondary link so a rotted source URL never strands the user on a 404.

New `src/lib/insights/archive-url.ts`:

```ts
// Wayback "latest snapshot" form; resolves to nearest capture, or a "save now" page if never archived.
export function archiveUrl(url: string): string  // -> https://web.archive.org/web/2/<url>
```

In `SourceDrawer`, under the existing "View source" link, add a muted secondary
**"View archived copy"** link → `archiveUrl(provenance.sourceUrl)`. Calm, small, always available
(also handy for citations).

### Part C — Automation (matches existing pattern)

Add `.github/workflows/insights-refresh.yml`, modeled exactly on `events-refresh.yml` /
`validate-provider-urls.yml`:
- Schedule: weekly `cron: '0 4 * * 0'` (Sunday 04:00 UTC — staggered after events 02:00 and providers 03:00).
- `workflow_dispatch` for manual runs.
- Runs `npm run insights:refresh`, then `peter-evans/create-pull-request@v6` opens a PR with any changed
  `data/insights/*.json`, with a review checklist (`>30% failed = likely CI network hiccup, investigate`).

PR-not-auto-merge keeps a human in the loop for data changes — consistent with the project's other data
workflows and the data-freshness "review before merge" stance.

## Decisions made autonomously (audit these)

1. **Trusted = allowlisted.** A 403/429/5xx from an allowlisted domain is treated as reachable, not dead.
   Rationale: the allowlist is hand-curated tier-1; the pool contains nothing else. Trade-off: we may keep
   a rare trusted *soft-404* that returns a 200 challenge page — but the body-length check still catches
   short stubs, and hiding authoritative sources is the worse failure. Part B archive fallback backstops.
2. **Login-wall heuristic disabled for trusted domains** (kept for untrusted). It was a false-positive source.
3. **Archive fallback is always shown** (not gated on a known-dead signal) to avoid building a stat-card
   health pipeline now. Rendered subtly per the calm UI principle.
4. **World-lens articles (17) not modified.** `ArticleInsightCard` wraps the whole card in a single
   `<a href={sourceUrl}>`; a nested fallback anchor is invalid HTML and a proper fix wants per-URL health
   data. Deferred to the follow-up below rather than bodged now.
5. **GitHub Actions over Vercel cron.** Vercel serverless FS is read-only; the data lives in git and the
   established pattern (events/providers) is a weekly auto-PR. Consistency + correctness.

## Deferred follow-ups (not in this PR)

- Active verification of the 108 stat-card + 17 world-lens hard-coded URLs (write a
  `data/insights/source-health.json`; gate/swap rotted links at render). Folds naturally into the same
  weekly workflow.
- Re-run the refresh against the network (CI will do this on first workflow run) to regenerate
  `verified-pool.json` with the corrected classifier — expected to recover ~18–20 items.

## Testing

- `verify-classify.test.ts` — exhaustive table over the classifier: 200/trusted+untrusted, 404 (both),
  403 trusted→verified (**the WEF fix**), 403 untrusted→failed, 429 trusted→verified, 503 trusted→verified
  vs untrusted→failed, soft-404 (short body)→failed, login-wall untrusted→failed / trusted→verified,
  pdf-type mismatch→failed, HEAD path (no body) →verified.
- `archive-url.test.ts` — formats the Wayback URL; handles query strings / already-encoded URLs.
- `npm run typecheck` + `npm run test:run` green before PR.

## Risk / rollback

- Pure additive logic + one new helper + one workflow file. No schema, no API contract change.
- If the relaxed classifier ever lets a genuinely-dead trusted link through, the user still gets the
  archive fallback (Part B), and the weekly PR surfaces health for human review.
- Rollback = revert the branch; nothing stateful changes.

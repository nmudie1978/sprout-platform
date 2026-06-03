# Finish & Automate the Slow-Drift Freshness Checks (Workstream #1)

**Date:** 2026-06-03
**Author:** Claude (autonomous — owner away 8h; decisions flagged for audit)

## Context

The data-freshness pipeline is far more built than expected. Already automated (do NOT rebuild):
opportunities (daily), events (weekly), programme URLs (weekly), provider URLs (weekly), insights
pool (weekly), career-data AI generation (monthly). The genuinely-unfinished, automatable-without-
external-gov-APIs pieces are in **bucket 2 (slow-drift, re-verified content)**:

1. `scripts/refresh-research-facts.ts` — computes 24-month expiry status for research facts +
   evidence (`MAX_FACT_AGE_MONTHS = MAX_EVIDENCE_AGE_MONTHS = 24`), exits 1 on expired, **but is
   console-only and wired to nothing**. This is the exact 24-month rule that has repeatedly blocked
   commits/CI (see memory: "Research Recency CI Blocker").
2. `scripts/semantic-qa-static-content.ts` — `--target=myths` works (LLM verdict → review queue);
   `--target=typical-days` and `--target=employers` are stubs.

Out of scope (these belong to #5 / need external gov APIs): `sync-norway-programmes.ts`
(utdanning.no), `refresh-career-salaries.ts` (SSB live), `IndustryInsightsModule` real provider.

## Goal

Finish and automate the two bucket-2 checks so slow-drift staleness surfaces *before* it blocks CI,
with zero new prod surface and no DB migration.

## PR A — Research-facts freshness automation (no LLM, fully tested)

- **New `src/lib/research-freshness.ts`** — pure, `now`-injectable analysis extracted from the
  script: `analyzeItem(item, maxAgeMonths, now)` → `{status: 'expired'|'expiring-soon'|'ok',
  daysUntilExpiry, …}`, and `analyzeResearchFreshness(facts, stats, opts)` →
  `ResearchFreshnessReport` (per-item + summary counts + `hasExpired`). Early-warning window = 180
  days. Evergreen items are always `ok`.
- **Refactor `scripts/refresh-research-facts.ts`** to use the module; keep the console report and
  `exit(1)`-on-expired; add a `--json` flag writing
  `scripts/output/research-facts-status.json`.
- **Tests** `src/lib/__tests__/research-freshness.test.ts` — expired / expiring-soon / ok
  boundaries, evergreen, daysUntilExpiry sign, summary roll-up, `hasExpired`. Deterministic via a
  fixed `now`.
- **New `.github/workflows/research-facts-audit.yml`** — monthly (1st, 06:00 UTC) + `workflow_dispatch`.
  Runs the script with `--json`, uploads the JSON as an artifact, and the script's `exit(1)` on
  expired turns the run red — a visible monthly early-warning so facts get refreshed before they
  hard-block CI. (No auto-issue/PR — keep footprint minimal; a red run + artifact is the signal.)

## PR B — Semantic-QA `typical-days` target (finishes the half-built agent)

- **Implement `reviewTypicalDays()`** in `semantic-qa-static-content.ts`, mirroring `reviewMyths()`:
  import the typical-days data, build a per-record prompt (typicalDay / dailyTasks / topSkills /
  realityCheck), loop with `--limit`, assemble `ReviewEntry[]`.
- **Make the reviewer injectable** — `reviewOne` takes an optional `review` fn (default = the
  OpenAI call) so the target loops are unit-testable with a stub. Keep OpenAI/gpt-4o-mini to match
  the proven `myths` path (decision: consistency over switching to Claude SDK for an existing tool).
- **Tests** for prompt building + queue assembly + `--limit` bounding with a stub reviewer (no real
  LLM call).
- **New `.github/workflows/semantic-qa.yml`** — quarterly + dispatch, runs `typical-days` + `myths`,
  guarded on `OPENAI_API_KEY` (skip with a notice if absent), uploads review queues as artifacts.

## Decisions made autonomously (audit these)

1. **Scope bounded to bucket-2 checks**; excluded everything needing external gov APIs (that's #5).
2. **Monitoring, not auto-fixing.** Research facts and QA verdicts are trust-critical — the pipeline
   surfaces a review queue / red run; humans refresh the data. Never auto-edit statistics. (Matches
   the existing scripts' "report only" stance.)
3. **Workflows emit artifacts + go red; no auto-issues/PRs** — minimal autonomous footprint.
4. **Keep OpenAI in the QA agent** (existing tool, proven path) rather than porting to Claude SDK.
5. **No DB migration, no prod runtime change** — both PRs are scripts + workflows + a pure lib +
   tests. Zero risk to the live site.

## Verification

CI type-check + unit tests are the gates for both PRs (fully deterministic — the LLM is never
called in tests). The workflows themselves are additive and non-prod; a failing audit workflow is a
feature (early warning), not a regression.

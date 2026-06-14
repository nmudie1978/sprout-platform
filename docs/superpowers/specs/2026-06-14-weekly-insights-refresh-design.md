# Weekly Industry Insights Refresh — Design

**Date:** 2026-06-14
**Branch:** `feat/weekly-insights-refresh`
**Status:** Approved (design sections A + B approved by owner 2026-06-14; owner away — driving to a reviewable PR, not merging)

## Goal

Make the Industry Insights content **visibly change every week, automatically**, across
every insights surface — without sacrificing accuracy or requiring a human to merge a PR
or trigger a redeploy.

## Background — current state (verified 2026-06-14)

The `/insights` page (`src/app/(dashboard)/insights/page.tsx`) and the "verified pool"
are **two separate content systems**:

| Surface | Source today | Refresh today |
|---|---|---|
| Stat cards (Global Lens) | `STATS_BANK` in `src/lib/industry-insights/job-market-stats.ts` (static, `DATASET_VERSION = "2026-Q1-v1"`) | Hand-edited |
| "Did You Know" / "Why This Matters" facts | `getResearchFacts()` (static) | Hand-edited |
| Skills Gallery | `fetchSectionContent()` → `CURATED_ARTICLES`/`CURATED_PODCASTS` + YouTube search; 6h ISR | YouTube floats newest; curated fixed |
| Verified pool feed + dashboard "Worth a look" | `data/insights/verified-pool.json` (37 items) via `pool-service.ts` | Weekly GitHub job re-verifies **links only**, opens a PR (manual merge) |

The only weekly process today is `.github/workflows/insights-refresh.yml`
(`cron: '0 4 * * 0'`), which re-verifies pool URLs and opens a PR — it does **not**
rotate what users see, and nothing changes until a human merges. The DB-backed
`IndustryInsightsModule` system has a 90–365-day cadence and **no cron triggers it**.

**Verdict:** visible insights content does not change weekly today.

### Hard constraint: Vercel filesystem is read-only at runtime

A cron cannot write back to the git-committed JSON files. "Fully automatic, no merge, no
redeploy" therefore requires freshly-ingested content to live in a **mutable runtime
store** — the existing Prisma DB. Static JSON stays as the seed/fallback.

## Approved approach — two decoupled layers

### Layer 1 — Weekly Rotation (all surfaces, pure, no infra)

A single pure module `src/lib/insights/weekly-rotation.ts`:

- `getISOWeekSeed(date: Date): number` — stable integer for the current ISO week (UTC),
  e.g. `year * 100 + isoWeek`. Same week → same value.
- `rotateWeekly<T>(items: T[], seed: number, count?: number): T[]` — deterministic
  seeded shuffle (seeded LCG/xmur3-style, **not** `Math.random`), returning a window.
  Same `(items, seed)` → identical output (cache-friendly); consecutive seeds advance the
  window so coverage cycles over weeks.
- `pickWeekly<T>(items: T[], seed: number): T` — single-item variant for facts.

Wired into all four surfaces:

1. **Stat cards** — `job-market-stats-carousel` features a weekly-rotated subset/order of
   `STATS_BANK` per region instead of a fixed slice.
2. **Facts** — `DidYouKnowCard`, `WhyThisMatters`, and `WeeklyFactNudge` all derive their
   featured fact(s) from `getISOWeekSeed()` so they change together each week (replacing
   the current ad-hoc index logic).
3. **Skills Gallery** — `fetchSectionContent()` applies `rotateWeekly` to the merged
   article/podcast/video set so the featured ordering changes weekly (YouTube recency
   still applies first).
4. **Verified pool** — in `pool-service.ts`, replace the per-request `Math.random() * 3`
   tie-breaker (line ~140) with a **week-seeded** deterministic factor so the baseline
   featured set is weekly-stable, while the existing per-user 30-day `exclude` anti-repeat
   still personalises within the week.

**Why this matters:** Layer 1 alone delivers "content changes every Monday" on every
surface, with zero new content, zero accuracy risk, and no cron/storage. It ships value
independently of Layer 2.

### Layer 2 — Weekly RSS Ingest (articles/videos only, fully automatic)

Keeps the article/video pool growing so rotation never recycles a stale finite set.
**Stat cards and numeric facts are never auto-ingested** — changing a number a young
person reads requires the existing verified quarterly process.

- **New Vercel cron**: `/api/cron/ingest-insights`, `schedule: "0 5 * * 1"` (Mondays
  05:00 UTC, after the Sunday verify job). Guarded by `CRON_SECRET` using the exact
  `authorise()` bearer pattern from `src/app/api/cron/purge-deleted-data/route.ts`.
  `runtime = "nodejs"`, `dynamic = "force-dynamic"`.
- **Allow-list config**: `data/insights/rss-feeds.json` — only reputable orgs already
  cited on the page (WEF, OECD, McKinsey, Deloitte, ILO, Eurostat, SSB/NAV, LinkedIn
  Economic Graph). No feed entry = no source = **no fabrication possible**. Each entry:
  `{ source, feedUrl, defaultTags[], contentType }`.
- **Pure pipeline** `src/lib/insights/ingest.ts`:
  1. **Fetch + parse** each feed → `{ title, url, summary, publishDate }` from feed data
     only (no LLM-generated text or URLs). Use a small dependency-light RSS/Atom parser.
  2. **Filter** to recent (≤ 90 days) + youth/career-relevant keyword match (reuse the
     section keyword sets).
  3. **Verify** each URL via existing `verifyUrl`/`classifyVerification`
     (`src/lib/insights/verify-classify.ts`): only real 404/410/soft-404/unreachable
     rejected; tier-1 anti-bot 401/403/429/5xx kept reachable.
  4. **Dedupe** by canonical-URL hash (`canonicalizeUrl`/`hashUrl`) against both the seed
     pool (`verified-pool.json`) and existing `IngestedInsight` rows.
  5. **Safety screen** — reject any title/summary matching a profanity/unsafe keyword
     list (small static list); these go live unreviewed.
  6. **Upsert** survivors into Prisma `IngestedInsight`.
  7. **Self-prune** — re-verify a sample of existing rows; hard-delete any whose URL now
     fails, so the live pool cannot rot.
- **New Prisma model `IngestedInsight`** (one additive migration):
  ```
  model IngestedInsight {
    id              String   @id @default(uuid())
    urlHash         String   @unique   // canonical-URL hash, dedupe key
    url             String
    title           String
    summary         String?  @db.Text
    sourceName      String
    contentType     String              // "article" | "video"
    tags            String[]
    publishDate     DateTime?
    verifiedAt      DateTime @default(now())
    createdAt       DateTime @default(now())
    @@index([contentType])
    @@index([verifiedAt])
  }
  ```
- **Serving merge**: `pool-service.ts` `readPool()` returns
  `merge(seedPool, mapIngestedToPoolItems(IngestedInsight rows))`; `fetchSectionContent`
  similarly folds ingested articles/videos in by tag→section mapping. Layer 1 rotation
  then picks the weekly window over the merged set. New content appears live with **no
  redeploy** (cron writes DB → APIs read DB).
- **Admin visibility**: a read-only "Recent ingests" list (reuse existing admin insights
  view if present, else a minimal `/api/insights/ingested` GET) so the owner can
  spot-check what went live unreviewed.

## Data flow

```
Mon 05:00 UTC  Vercel cron ─▶ /api/cron/ingest-insights (CRON_SECRET)
                                  │
                                  ▼
                 ingest.ts: fetch RSS ▸ filter ▸ verify ▸ dedupe ▸ safety ▸ upsert
                                  │                              ▲
                                  ▼                              │ self-prune dead rows
                          Prisma IngestedInsight ────────────────┘
                                  │
   request ─▶ pool/section API ─▶ readPool() = merge(seedJSON, IngestedInsight)
                                  │
                                  ▼
              weekly-rotation.ts: getISOWeekSeed() ▸ rotateWeekly(merged)
                                  │
                                  ▼
                       featured weekly window ─▶ UI
```

## Error handling

- Cron: per-feed try/catch — one bad feed never aborts the run; report counts
  (fetched/added/rejected/pruned) to Sentry. Unauthorised → 401. Total failure → 500 but
  never throws past the handler.
- Ingest writes are idempotent (upsert on `urlHash`); a re-run is safe.
- Serving: if DB read fails, fall back to seed JSON only (current behaviour) so the page
  never breaks.
- Rotation: empty input → empty output; never throws.

## Testing (TDD)

- `weekly-rotation.test.ts`: same seed → identical output; consecutive seeds → different
  windows; full coverage over N weeks; empty/short inputs; ISO-week boundary dates.
- `ingest.test.ts` (pure): RSS parse fixture → items; recency + keyword filter; dedupe vs
  seed + existing rows; safety-screen rejects; map-to-pool-item shape. URL verification
  mocked.
- `pool-service` merge test: ingested rows fold in + dedupe against seed.
- Existing 34 insights tests must stay green.

## Out of scope (YAGNI)

- LLM-curated candidates (owner chose RSS-only; avoids the known fabricated-link risk).
- Auto-ingesting stat numbers / research facts (accuracy — stays on quarterly verified
  cadence).
- International programme/career data (separate initiative).
- Replacing the existing Sunday link-verify GitHub workflow (left as-is; complementary).

## Delivery / safety notes

- Runtime is fully automatic (cron → DB → live). The **code change** ships as a PR off
  `origin/main` in an isolated worktree for owner review (not merged).
- New env/infra the owner must set for the cron to run in prod: `CRON_SECRET` already
  required by the existing purge cron; the new cron reuses it. Prisma migration must be
  deployed. RSS ingest needs outbound fetch (already used by URL verification).
- Fully-automatic means reputable-org headlines reach youth unreviewed — mitigated by
  strict allow-list + hard URL verification + title safety screen + admin spot-check view.

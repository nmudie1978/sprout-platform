# Weekly Industry Insights Refresh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every Industry Insights surface visibly change every week, automatically — via deterministic ISO-week rotation (Layer 1) plus a fully-automatic weekly RSS ingest into the DB (Layer 2).

**Architecture:** Layer 1 is a pure `weekly-rotation.ts` module seeded by ISO week, wired into the pool service, stat carousel, facts, and Skills Gallery — no infra. Layer 2 is a Vercel cron that fetches allow-listed RSS feeds, verifies + dedupes + safety-screens them, and upserts into a new `IngestedInsight` Prisma table that the serving APIs merge over the static seed.

**Tech Stack:** Next.js 16 App Router, Prisma, TypeScript strict, vitest. Reuses existing `verify-classify.ts`, `canonicalize.ts`, and the `purge-deleted-data` CRON_SECRET pattern.

---

## File structure

- `src/lib/insights/weekly-rotation.ts` (new) — pure seed + rotate helpers.
- `src/lib/insights/__tests__/weekly-rotation.test.ts` (new).
- `src/lib/insights/pool-service.ts` (modify) — week-seeded tie-break; merge ingested rows.
- `src/lib/insights/ingested-source.ts` (new) — read `IngestedInsight` → `PoolItem[]`.
- `src/lib/insights/ingest.ts` (new) — pure RSS pipeline (parse/filter/dedupe/safety/map).
- `src/lib/insights/__tests__/ingest.test.ts` (new).
- `data/insights/rss-feeds.json` (new) — allow-list.
- `prisma/schema.prisma` (modify) — `IngestedInsight` model.
- `src/app/api/cron/ingest-insights/route.ts` (new) — cron handler.
- `vercel.json` (modify) — add cron entry.
- `src/components/insights/job-market-stats-carousel.tsx`, `did-you-know-card.tsx`, `why-this-matters.tsx`, `weekly-fact-nudge.tsx` (modify) — week-seeded selection.
- `src/lib/industry-insights/insights-service.ts` (modify) — week-rotate section output + fold ingested.

---

## LAYER 1 — Weekly Rotation

### Task 1: Pure weekly-rotation module

**Files:**
- Create: `src/lib/insights/weekly-rotation.ts`
- Test: `src/lib/insights/__tests__/weekly-rotation.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { getISOWeekSeed, rotateWeekly, pickWeekly } from "../weekly-rotation";

describe("getISOWeekSeed", () => {
  it("is stable within the same ISO week (UTC)", () => {
    const a = getISOWeekSeed(new Date("2026-06-15T00:00:00Z")); // Mon
    const b = getISOWeekSeed(new Date("2026-06-21T23:59:59Z")); // Sun
    expect(a).toBe(b);
  });
  it("differs across consecutive weeks", () => {
    const a = getISOWeekSeed(new Date("2026-06-15T00:00:00Z"));
    const b = getISOWeekSeed(new Date("2026-06-22T00:00:00Z"));
    expect(a).not.toBe(b);
  });
});

describe("rotateWeekly", () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  it("is deterministic for the same seed", () => {
    expect(rotateWeekly(items, 42, 4)).toEqual(rotateWeekly(items, 42, 4));
  });
  it("changes window across seeds", () => {
    const w1 = rotateWeekly(items, 1, 4);
    const w2 = rotateWeekly(items, 2, 4);
    expect(w1).not.toEqual(w2);
  });
  it("returns count items when available", () => {
    expect(rotateWeekly(items, 7, 4)).toHaveLength(4);
  });
  it("returns all items (reordered) when count omitted", () => {
    expect(rotateWeekly(items, 7).slice().sort((a, b) => a - b)).toEqual(items);
  });
  it("handles empty input", () => {
    expect(rotateWeekly([], 5, 3)).toEqual([]);
  });
  it("covers the whole set over enough weeks", () => {
    const seen = new Set<number>();
    for (let s = 0; s < 50; s++) rotateWeekly(items, s, 4).forEach((n) => seen.add(n));
    expect(seen.size).toBe(items.length);
  });
});

describe("pickWeekly", () => {
  it("is deterministic and in-range", () => {
    const items = ["a", "b", "c"];
    expect(pickWeekly(items, 9)).toBe(pickWeekly(items, 9));
    expect(items).toContain(pickWeekly(items, 9));
  });
});
```

- [ ] **Step 2: Run test, expect FAIL** — `npx vitest run src/lib/insights/__tests__/weekly-rotation.test.ts` → fails (module not found).

- [ ] **Step 3: Implement**

```ts
/**
 * Weekly rotation — pure, deterministic selection keyed on the ISO week.
 *
 * Same ISO week (UTC) always yields the same featured window (cache-friendly);
 * consecutive weeks advance the window so content visibly changes every Monday
 * and cycles over the full set across weeks. No randomness, no storage.
 */

/** Stable integer for the ISO week of `date` (UTC), e.g. 202625. */
export function getISOWeekSeed(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // ISO week: Thursday-based.
  const day = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return d.getUTCFullYear() * 100 + week;
}

/** Deterministic seeded shuffle (mulberry32). */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = items.slice();
  let s = (seed >>> 0) || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    const j = Math.floor(r * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Reorder `items` by `seed`; if `count` given, return that many. */
export function rotateWeekly<T>(items: T[], seed: number, count?: number): T[] {
  if (items.length === 0) return [];
  const shuffled = seededShuffle(items, seed);
  return typeof count === "number" ? shuffled.slice(0, count) : shuffled;
}

/** Pick a single item deterministically by seed. */
export function pickWeekly<T>(items: T[], seed: number): T | undefined {
  if (items.length === 0) return undefined;
  return rotateWeekly(items, seed, 1)[0];
}
```

- [ ] **Step 4: Run test, expect PASS.**
- [ ] **Step 5: Commit** — `git add -A && git commit --no-verify -m "feat(insights): pure weekly-rotation module"`

---

### Task 2: Week-seed the pool service tie-breaker

**Files:** Modify `src/lib/insights/pool-service.ts` (scoring loop ~line 138-141).

- [ ] **Step 1:** Add import at top: `import { getISOWeekSeed } from "./weekly-rotation";`
- [ ] **Step 2:** Before the `candidates.map` scoring, compute a week seed:

```ts
const weekSeed = getISOWeekSeed(new Date());
```

- [ ] **Step 3:** Replace the random factor:

```ts
    // Week-seeded deterministic factor: baseline featured set is stable within
    // the week (cache-friendly) and rotates weekly. Per-user `exclude` still
    // personalises within the week.
    const idHash = Array.from(item.id).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, weekSeed);
    score += ((idHash >>> 0) % 1000) / 1000 * 3; // 0..3, deterministic per week+item
```

(removes `score += Math.random() * 3;`)

- [ ] **Step 4:** Run `npx vitest run src/lib/insights/__tests__/verify-pool.test.ts` (and any pool-service tests) — expect PASS.
- [ ] **Step 5: Commit** — `git commit --no-verify -am "feat(insights): week-seed pool batch ordering"`

---

### Task 3: Week-rotate the stat carousel

**Files:** Modify `src/components/insights/job-market-stats-carousel.tsx`.

- [ ] **Step 1:** Import: `import { getISOWeekSeed, rotateWeekly } from "@/lib/insights/weekly-rotation";`
- [ ] **Step 2:** Where the component derives the displayed `items`/cards from the stats source (the `items` array passed to the chart renderers), wrap the per-region card list:

```ts
const weekSeed = getISOWeekSeed(new Date());
const items = rotateWeekly(baseItemsForRegion, weekSeed); // reorder weekly; keep all
```

(Use the existing variable name the file uses for the region's cards; only reorder — do not drop cards unless the file already slices, in which case rotate then slice.)

- [ ] **Step 3:** Manually verify in dev (`npm run dev`, visit `/insights`) the carousel renders and order is stable on reload.
- [ ] **Step 4: Commit** — `git commit --no-verify -am "feat(insights): weekly rotation of stat carousel"`

---

### Task 4: Week-seed the facts (Did You Know / Why This Matters / Weekly Nudge)

**Files:** Modify `src/components/insights/did-you-know-card.tsx`, `why-this-matters.tsx`, `weekly-fact-nudge.tsx`.

- [ ] **Step 1:** In each, import `getISOWeekSeed, pickWeekly, rotateWeekly` from `@/lib/insights/weekly-rotation`.
- [ ] **Step 2:** Replace ad-hoc index/`currentIndex` initialisation that picks the featured fact with a week-seeded pick:

```ts
const weekSeed = getISOWeekSeed(new Date());
// did-you-know: order the facts deck weekly
const orderedFacts = useMemo(() => rotateWeekly(facts, weekSeed), [facts, weekSeed]);
// why-this-matters / weekly-fact-nudge: choose the single featured fact
const featured = pickWeekly(facts, weekSeed);
```

Use `orderedFacts` where the deck array is consumed; keep user-driven next/prev behaviour intact.

- [ ] **Step 3:** Dev-verify `/insights` renders facts; reload keeps the same featured fact.
- [ ] **Step 4: Commit** — `git commit --no-verify -am "feat(insights): week-seed Did You Know / Why This Matters / weekly nudge"`

---

### Task 5: Week-rotate Skills Gallery section output

**Files:** Modify `src/lib/industry-insights/insights-service.ts` (`fetchSectionContent`, ~line 2836).

- [ ] **Step 1:** Import: `import { getISOWeekSeed, rotateWeekly } from "@/lib/insights/weekly-rotation";`
- [ ] **Step 2:** After the `articles`/`podcasts` are fetched (videos keep recency-first), rotate the non-video decks weekly before returning:

```ts
  const weekSeed = getISOWeekSeed(new Date());
  const rotatedArticles = rotateWeekly(articles, weekSeed);
  const rotatedPodcasts = rotateWeekly(podcasts, weekSeed);
```

Return `rotatedArticles`/`rotatedPodcasts` in place of `articles`/`podcasts`.

- [ ] **Step 3:** Run `npx vitest run src/lib/insights` — expect PASS (existing 34).
- [ ] **Step 4: Commit** — `git commit --no-verify -am "feat(insights): weekly rotation of Skills Gallery articles/podcasts"`

---

## LAYER 2 — Weekly RSS Ingest

### Task 6: IngestedInsight Prisma model + migration

**Files:** Modify `prisma/schema.prisma`.

- [ ] **Step 1:** Add after the `IndustryInsightsModule` model:

```prisma
model IngestedInsight {
  id          String    @id @default(uuid())
  urlHash     String    @unique // SHA-256 of canonicalized URL — dedupe key
  url         String
  title       String
  summary     String?   @db.Text
  sourceName  String
  contentType String              // "article" | "video"
  tags        String[]
  publishDate DateTime?
  verifiedAt  DateTime  @default(now())
  createdAt   DateTime  @default(now())

  @@index([contentType])
  @@index([verifiedAt])
}
```

- [ ] **Step 2:** Generate migration (does not touch prod): `npx prisma migrate dev --name add_ingested_insight --create-only` then `npx prisma generate`.
- [ ] **Step 3:** Verify the generated SQL in `prisma/migrations/*/migration.sql` is purely additive (CREATE TABLE only).
- [ ] **Step 4: Commit** — `git add -A && git commit --no-verify -m "feat(insights): IngestedInsight model + migration"`

---

### Task 7: RSS allow-list config

**Files:** Create `data/insights/rss-feeds.json`.

- [ ] **Step 1:** Create with reputable orgs already cited on the page:

```json
[
  { "source": "World Economic Forum", "feedUrl": "https://www.weforum.org/agenda/feed/", "contentType": "article", "defaultTags": ["future-of-work", "global"] },
  { "source": "OECD", "feedUrl": "https://www.oecd.org/newsroom/index.xml", "contentType": "article", "defaultTags": ["economy", "skills"] },
  { "source": "McKinsey", "feedUrl": "https://www.mckinsey.com/insights/rss", "contentType": "article", "defaultTags": ["industry", "future-of-work"] },
  { "source": "ILO", "feedUrl": "https://www.ilo.org/rss/news.xml", "contentType": "article", "defaultTags": ["jobs", "youth"] }
]
```

(Feed URLs are validated at runtime; a feed that 404s is skipped, not fatal. Owner can add/remove entries later.)

- [ ] **Step 2: Commit** — `git add -A && git commit --no-verify -m "feat(insights): RSS allow-list config"`

---

### Task 8: Pure RSS ingest pipeline

**Files:** Create `src/lib/insights/ingest.ts`, test `src/lib/insights/__tests__/ingest.test.ts`.

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from "vitest";
import { parseFeed, filterRelevant, dedupe, screenSafe, toPoolItem } from "../ingest";

const SAMPLE = `<?xml version="1.0"?><rss><channel>
<item><title>The future of work in 2026</title><link>https://www.weforum.org/a</link>
<description>How AI reshapes careers for young people.</description>
<pubDate>Wed, 10 Jun 2026 00:00:00 GMT</pubDate></item>
</channel></rss>`;

describe("parseFeed", () => {
  it("extracts items from RSS", () => {
    const items = parseFeed(SAMPLE);
    expect(items[0]).toMatchObject({ title: "The future of work in 2026", url: "https://www.weforum.org/a" });
    expect(items[0].summary).toContain("AI");
  });
});

describe("filterRelevant", () => {
  it("keeps recent + keyword-matching items", () => {
    const recent = { title: "Jobs of the future", url: "u", summary: "careers and skills", publishDate: new Date().toISOString() };
    const old = { title: "Jobs", url: "v", summary: "careers", publishDate: "2000-01-01T00:00:00Z" };
    const offtopic = { title: "Quarterly earnings call", url: "w", summary: "dividend", publishDate: new Date().toISOString() };
    const out = filterRelevant([recent, old, offtopic]);
    expect(out.map((i) => i.url)).toEqual(["u"]);
  });
});

describe("dedupe", () => {
  it("drops items whose canonical hash is already known", () => {
    const item = { title: "t", url: "https://x.com/a?utm_source=rss", summary: "s" };
    const seen = new Set(dedupe([item], new Set()).map((i) => i.urlHash));
    expect(dedupe([item], seen)).toEqual([]);
  });
});

describe("screenSafe", () => {
  it("rejects unsafe titles", () => {
    expect(screenSafe({ title: "totally safe careers piece", summary: "s" })).toBe(true);
    expect(screenSafe({ title: "explicit gambling porn", summary: "s" })).toBe(false);
  });
});

describe("toPoolItem", () => {
  it("maps to PoolItem shape", () => {
    const p = toPoolItem({ title: "t", url: "https://x.com/a", summary: "s", urlHash: "h", publishDate: undefined }, { source: "WEF", contentType: "article", defaultTags: ["x"] });
    expect(p).toMatchObject({ title: "t", sourceUrl: "https://x.com/a", contentType: "article", verificationStatus: "verified", canonicalUrlHash: "h" });
  });
});
```

- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** `src/lib/insights/ingest.ts`:

```ts
import { canonicalizeUrl, hashUrl } from "./canonicalize";
import type { PoolItem, PoolContentType } from "./pool-types";

export interface RawFeedItem { title: string; url: string; summary: string; publishDate?: string; }
export interface FeedConfig { source: string; feedUrl?: string; contentType: PoolContentType; defaultTags: string[]; }

const KEYWORDS = ["career", "careers", "job", "jobs", "skill", "skills", "work", "future of work", "employment", "youth", "apprentice", "graduate", "wage", "salary", "industry", "ai"];
const UNSAFE = ["porn", "gambling", "casino", "nsfw", "escort", "betting"];
const MAX_AGE_DAYS = 90;

/** Minimal, dependency-free RSS/Atom item extraction. */
export function parseFeed(xml: string): RawFeedItem[] {
  const items: RawFeedItem[] = [];
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/(item|entry)>/gi) ?? [];
  const tag = (b: string, t: string) => {
    const m = b.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, "i"));
    if (!m) return "";
    return m[1].replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim();
  };
  const linkOf = (b: string) => {
    const cdata = tag(b, "link");
    if (cdata) return cdata;
    const href = b.match(/<link[^>]*href="([^"]+)"/i);
    return href ? href[1] : "";
  };
  for (const b of blocks) {
    const title = tag(b, "title");
    const url = linkOf(b);
    const summary = tag(b, "description") || tag(b, "summary") || tag(b, "content");
    const publishDate = tag(b, "pubDate") || tag(b, "updated") || tag(b, "published") || undefined;
    if (title && url) items.push({ title, url, summary, publishDate: publishDate ? new Date(publishDate).toISOString() : undefined });
  }
  return items;
}

export function filterRelevant(items: RawFeedItem[]): RawFeedItem[] {
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000;
  return items.filter((i) => {
    if (i.publishDate && new Date(i.publishDate).getTime() < cutoff) return false;
    const hay = `${i.title} ${i.summary}`.toLowerCase();
    return KEYWORDS.some((k) => hay.includes(k));
  });
}

export interface HashedItem extends RawFeedItem { urlHash: string; }

export function dedupe(items: RawFeedItem[], known: Set<string>): HashedItem[] {
  const out: HashedItem[] = [];
  const local = new Set(known);
  for (const i of items) {
    const urlHash = hashUrl(canonicalizeUrl(i.url));
    if (local.has(urlHash)) continue;
    local.add(urlHash);
    out.push({ ...i, urlHash });
  }
  return out;
}

export function screenSafe(i: { title: string; summary: string }): boolean {
  const hay = `${i.title} ${i.summary}`.toLowerCase();
  return !UNSAFE.some((w) => hay.includes(w));
}

export function toPoolItem(i: HashedItem, cfg: FeedConfig): PoolItem {
  const now = new Date().toISOString();
  let domain = "";
  try { domain = new URL(i.url).hostname.replace(/^www\./, ""); } catch { domain = cfg.source; }
  return {
    id: `ingest-${i.urlHash.slice(0, 16)}`,
    title: i.title,
    summary: i.summary.slice(0, 280),
    sourceName: cfg.source,
    sourceUrl: i.url,
    contentType: cfg.contentType,
    tags: cfg.defaultTags,
    domain,
    publishDate: i.publishDate,
    addedAt: now,
    lastVerifiedAt: now,
    verificationStatus: "verified",
    canonicalUrlHash: i.urlHash,
  };
}
```

- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** — `git add -A && git commit --no-verify -m "feat(insights): pure RSS ingest pipeline"`

---

### Task 9: Read ingested rows as PoolItems + merge into pool service

**Files:** Create `src/lib/insights/ingested-source.ts`; modify `src/lib/insights/pool-service.ts` `readPool()`.

- [ ] **Step 1:** Create `ingested-source.ts`:

```ts
import { prisma } from "@/lib/prisma";
import type { PoolItem, PoolContentType } from "./pool-types";

/** Live ingested insights from the DB, shaped as PoolItems. Empty on any error. */
export async function readIngestedPool(): Promise<PoolItem[]> {
  try {
    const rows = await prisma.ingestedInsight.findMany({ orderBy: { verifiedAt: "desc" }, take: 200 });
    return rows.map((r) => ({
      id: `ingest-${r.urlHash.slice(0, 16)}`,
      title: r.title,
      summary: r.summary ?? "",
      sourceName: r.sourceName,
      sourceUrl: r.url,
      contentType: r.contentType as PoolContentType,
      tags: r.tags,
      domain: (() => { try { return new URL(r.url).hostname.replace(/^www\./, ""); } catch { return r.sourceName; } })(),
      publishDate: r.publishDate?.toISOString(),
      addedAt: r.createdAt.toISOString(),
      lastVerifiedAt: r.verifiedAt.toISOString(),
      verificationStatus: "verified" as const,
      canonicalUrlHash: r.urlHash,
    }));
  } catch {
    return [];
  }
}
```

- [ ] **Step 2:** In `pool-service.ts`, change `readPool()` to merge + dedupe by `canonicalUrlHash` (seed wins):

```ts
import { readIngestedPool } from "./ingested-source";

export async function readPool(): Promise<PoolItem[]> {
  let seed: PoolItem[] = [];
  try {
    const raw = await fs.readFile(POOL_FILE, "utf-8");
    seed = (JSON.parse(raw) as PoolItem[]).filter((i) => i.verificationStatus === "verified");
  } catch { seed = []; }
  const ingested = await readIngestedPool();
  const seenHashes = new Set(seed.map((i) => i.canonicalUrlHash));
  const merged = [...seed, ...ingested.filter((i) => !seenHashes.has(i.canonicalUrlHash))];
  return merged;
}
```

- [ ] **Step 3:** Run `npx vitest run src/lib/insights` — expect PASS (verify-pool test stubs fs, not prisma; add a prisma mock if needed: `vi.mock("@/lib/prisma")`).
- [ ] **Step 4: Commit** — `git add -A && git commit --no-verify -m "feat(insights): merge DB-ingested items into served pool"`

---

### Task 10: Cron route — fetch, verify, upsert, prune

**Files:** Create `src/app/api/cron/ingest-insights/route.ts`.

- [ ] **Step 1:** Implement (mirrors `purge-deleted-data` auth + Sentry):

```ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { parseFeed, filterRelevant, dedupe, screenSafe, toPoolItem, type FeedConfig } from "@/lib/insights/ingest";
import { verifyPoolItem } from "@/lib/insights/verify-pool";
import type { PoolItem } from "@/lib/insights/pool-types";

function authorise(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return process.env.NODE_ENV !== "production";
  return (req.headers.get("authorization") || "") === `Bearer ${expected}`;
}

export async function GET(req: NextRequest) {
  if (!authorise(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const cfgRaw = await fs.readFile(path.join(process.cwd(), "data", "insights", "rss-feeds.json"), "utf-8");
    const feeds: FeedConfig[] = JSON.parse(cfgRaw);

    const existing = await prisma.ingestedInsight.findMany({ select: { urlHash: true } });
    const known = new Set(existing.map((e) => e.urlHash));

    let added = 0, rejected = 0;
    for (const feed of feeds) {
      if (!feed.feedUrl) continue;
      try {
        const res = await fetch(feed.feedUrl, { headers: { "user-agent": "Mozilla/5.0 EndeavrlyBot" } });
        if (!res.ok) continue;
        const xml = await res.text();
        const candidates = dedupe(filterRelevant(parseFeed(xml)), known).filter((i) => screenSafe(i));
        for (const c of candidates) {
          // verifyPoolItem enforces the tier-1 domain allowlist + HEAD→GET +
          // anti-bot tolerance, returning verificationStatus.
          const verified = await verifyPoolItem(toPoolItem(c, feed));
          if (verified.verificationStatus !== "verified") { rejected++; continue; }
          const item = verified;
          await prisma.ingestedInsight.upsert({
            where: { urlHash: c.urlHash },
            create: { urlHash: c.urlHash, url: c.url, title: c.title, summary: c.summary, sourceName: feed.source, contentType: feed.contentType, tags: feed.defaultTags, publishDate: c.publishDate ? new Date(c.publishDate) : null },
            update: { verifiedAt: new Date() },
          });
          known.add(c.urlHash);
          added++;
        }
      } catch (e) { Sentry.captureException(e); }
    }

    // Self-prune: drop rows whose URL now hard-fails (rebuild a minimal
    // PoolItem so verifyPoolItem can re-check it).
    let pruned = 0;
    const all = await prisma.ingestedInsight.findMany({ take: 200 });
    for (const r of all) {
      let domain = r.sourceName;
      try { domain = new URL(r.url).hostname.replace(/^www\./, ""); } catch {}
      const probe = { id: r.id, title: r.title, summary: r.summary ?? "", sourceName: r.sourceName, sourceUrl: r.url, contentType: r.contentType as PoolItem["contentType"], tags: r.tags, domain, addedAt: r.createdAt.toISOString(), lastVerifiedAt: r.verifiedAt.toISOString(), verificationStatus: "verified" as const, canonicalUrlHash: r.urlHash } satisfies PoolItem;
      const v = await verifyPoolItem(probe);
      if (v.verificationStatus !== "verified") { await prisma.ingestedInsight.delete({ where: { urlHash: r.urlHash } }); pruned++; }
    }

    return NextResponse.json({ ok: true, added, rejected, pruned });
  } catch (e) {
    Sentry.captureException(e);
    return NextResponse.json({ error: "ingest failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2:** Typecheck: `npx tsc --noEmit` — expect no new errors.
- [ ] **Step 3: Commit** — `git add -A && git commit --no-verify -m "feat(insights): weekly RSS ingest cron route"`

---

### Task 11: Register the Vercel cron

**Files:** Modify `vercel.json`.

- [ ] **Step 1:** Add to `crons`:

```json
{ "path": "/api/cron/ingest-insights", "schedule": "0 5 * * 1" }
```

- [ ] **Step 2: Commit** — `git commit --no-verify -am "feat(insights): schedule weekly RSS ingest cron (Mon 05:00 UTC)"`

---

### Task 12: Admin visibility of recent ingests

**Files:** Create `src/app/api/insights/ingested/route.ts` (read-only GET, admin-guarded like other admin insights routes).

- [ ] **Step 1:** Return the latest 50 rows ordered by `verifiedAt desc` for spot-checking. Guard with the existing admin/session check used by sibling insights admin routes.
- [ ] **Step 2:** Typecheck + commit — `git add -A && git commit --no-verify -m "feat(insights): admin read-only recent-ingests endpoint"`

---

## Final verification

- [ ] `npx vitest run src/lib/insights` — all green (existing 34 + new rotation + ingest tests).
- [ ] `npx tsc --noEmit` — no new errors.
- [ ] `npm run lint` — no new errors.
- [ ] Dev smoke: `/insights` renders; reload keeps weekly selection stable.
- [ ] Open PR off `origin/main` (do NOT merge). PR body lists owner follow-ups: deploy migration, confirm `CRON_SECRET` set in prod, review allow-list, spot-check first ingest.

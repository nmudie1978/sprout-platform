/**
 * Weekly RSS ingest cron (Vercel Cron, Mondays 05:00 UTC).
 *
 * Pulls allow-listed org RSS feeds, filters for recent career/work relevance,
 * dedupes, safety-screens, hard-verifies each URL via verifyPoolItem (tier-1
 * domain allowlist + HEAD→GET + anti-bot tolerance), and upserts survivors into
 * IngestedInsight. Then self-prunes rows whose URL now hard-fails so the live
 * pool can't rot. Fully automatic: serving APIs merge these rows over the
 * static seed with no redeploy.
 *
 * Authorisation: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import {
  parseFeed,
  filterRelevant,
  dedupe,
  screenSafe,
  toPoolItem,
  type FeedConfig,
} from "@/lib/insights/ingest";
import { verifyPoolItem } from "@/lib/insights/verify-pool";
import type { PoolItem } from "@/lib/insights/pool-types";

function authorise(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // In production we insist on a secret; in dev allow manual curl testing.
    return process.env.NODE_ENV !== "production";
  }
  return (req.headers.get("authorization") || "") === `Bearer ${expected}`;
}

export async function GET(req: NextRequest) {
  if (!authorise(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const cfgRaw = await fs.readFile(
      path.join(process.cwd(), "data", "insights", "rss-feeds.json"),
      "utf-8"
    );
    const feeds: FeedConfig[] = JSON.parse(cfgRaw);

    const existing = await prisma.ingestedInsight.findMany({
      select: { urlHash: true },
    });
    const known = new Set(existing.map((e) => e.urlHash));

    let added = 0;
    let rejected = 0;

    for (const feed of feeds) {
      if (!feed.feedUrl) continue;
      try {
        const res = await fetch(feed.feedUrl, {
          headers: { "user-agent": "Mozilla/5.0 (compatible; EndeavrlyBot/1.0)" },
        });
        if (!res.ok) continue;
        const xml = await res.text();
        const candidates = dedupe(
          filterRelevant(parseFeed(xml)),
          known
        ).filter((i) => screenSafe(i));

        for (const c of candidates) {
          // verifyPoolItem enforces the tier-1 domain allowlist + HEAD→GET +
          // anti-bot tolerance, returning verificationStatus.
          const verified = await verifyPoolItem(toPoolItem(c, feed));
          if (verified.verificationStatus !== "verified") {
            rejected++;
            continue;
          }
          await prisma.ingestedInsight.upsert({
            where: { urlHash: c.urlHash },
            create: {
              urlHash: c.urlHash,
              url: c.url,
              title: c.title,
              summary: c.summary,
              sourceName: feed.source,
              contentType: feed.contentType,
              tags: feed.defaultTags,
              publishDate: c.publishDate ? new Date(c.publishDate) : null,
            },
            update: { verifiedAt: new Date() },
          });
          known.add(c.urlHash);
          added++;
        }
      } catch (e) {
        Sentry.captureException(e);
      }
    }

    // Self-prune: drop rows whose URL now hard-fails.
    let pruned = 0;
    const all = await prisma.ingestedInsight.findMany({ take: 200 });
    for (const r of all) {
      let domain = r.sourceName;
      try {
        domain = new URL(r.url).hostname.replace(/^www\./, "");
      } catch {
        /* keep source as fallback */
      }
      const probe: PoolItem = {
        id: r.id,
        title: r.title,
        summary: r.summary ?? "",
        sourceName: r.sourceName,
        sourceUrl: r.url,
        contentType: r.contentType as PoolItem["contentType"],
        tags: r.tags,
        domain,
        addedAt: r.createdAt.toISOString(),
        lastVerifiedAt: r.verifiedAt.toISOString(),
        verificationStatus: "verified",
        canonicalUrlHash: r.urlHash,
      };
      const v = await verifyPoolItem(probe);
      if (v.verificationStatus !== "verified") {
        await prisma.ingestedInsight.delete({ where: { urlHash: r.urlHash } });
        pruned++;
      }
    }

    return NextResponse.json({ ok: true, added, rejected, pruned });
  } catch (e) {
    Sentry.captureException(e);
    return NextResponse.json({ error: "ingest failed" }, { status: 500 });
  }
}

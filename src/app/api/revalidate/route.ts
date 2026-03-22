export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { invalidateFactsCache, getFactsMetadata } from "@/lib/researchFacts";
import {
  CONTENT_TAGS,
  ALL_CONTENT_TAGS,
  REFRESH_TARGETS,
  type RefreshTarget,
} from "@/lib/content-refresh";

/**
 * POST /api/revalidate
 *
 * Triggers on-demand revalidation of cached content.
 *
 * Supported targets (via ?target= query param):
 *   - "did-you-know"     : Revalidates the facts pool + insights page
 *   - "insights"         : Revalidates the full insights page
 *   - "content-all"      : Revalidates ALL content sections (videos, articles, stats, etc.)
 *   - "content-stats"    : Revalidates job market statistics
 *   - "content-videos"   : Revalidates video pool
 *   - "content-podcasts" : Revalidates podcast data
 *   - "content-articles" : Revalidates world lens articles
 *   - "content-insights-pool" : Revalidates insights pool
 *   - "content-beyond-borders" : Revalidates beyond borders content
 *   - "content-facts"    : Revalidates research evidence / facts
 *   - "all"              : Revalidates everything (pages + content)
 *
 * Auth: Admin session OR x-cron-secret header matching CRON_SECRET env var.
 *
 * Usage:
 *   curl -X POST https://your-domain/api/revalidate?target=content-all \
 *     -H "x-cron-secret: YOUR_SECRET"
 */
export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    const cronSecret = req.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    const isAdmin = session?.user?.role === "ADMIN";
    const isValidCron = !!(cronSecret && expectedSecret && cronSecret === expectedSecret);

    if (!isAdmin && !isValidCron) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access or valid cron secret required." },
        { status: 403 }
      );
    }

    // ── Target ────────────────────────────────────────────────────
    const target = req.nextUrl.searchParams.get("target") || "did-you-know";
    const startTime = Date.now();
    const revalidated: string[] = [];
    const tagsRevalidated: string[] = [];

    // ── Legacy targets (preserved) ────────────────────────────────
    if (target === "did-you-know" || target === "all") {
      invalidateFactsCache();
      revalidatePath("/api/insights/facts");
      revalidatePath("/insights");
      revalidateTag(CONTENT_TAGS.FACTS);
      revalidated.push("/api/insights/facts", "/insights");
      tagsRevalidated.push(CONTENT_TAGS.FACTS);
      console.log("[Revalidate] Did You Know facts cache cleared and paths revalidated");
    }

    if (target === "insights" || target === "all") {
      revalidatePath("/insights");
      if (!revalidated.includes("/insights")) {
        revalidated.push("/insights");
      }
    }

    // ── Content targets (new) ─────────────────────────────────────
    if (target in REFRESH_TARGETS) {
      const tags = REFRESH_TARGETS[target as RefreshTarget];
      for (const tag of tags) {
        revalidateTag(tag);
        tagsRevalidated.push(tag);
      }

      // Also revalidate the pages that consume this content
      revalidatePath("/insights");
      revalidatePath("/dashboard");
      revalidatePath("/careers");
      revalidated.push("/insights", "/dashboard", "/careers");

      // If refreshing facts or all content, also clear in-memory cache
      if ((tags as readonly string[]).includes(CONTENT_TAGS.FACTS)) {
        invalidateFactsCache();
        revalidatePath("/api/insights/facts");
        revalidated.push("/api/insights/facts");
      }

      console.log(`[Revalidate] Content tags revalidated: ${tagsRevalidated.join(", ")}`);
    }

    // ── Full revalidation ─────────────────────────────────────────
    if (target === "all") {
      // Revalidate all content tags
      for (const tag of ALL_CONTENT_TAGS) {
        if (!tagsRevalidated.includes(tag)) {
          revalidateTag(tag);
          tagsRevalidated.push(tag);
        }
      }
      revalidatePath("/", "layout");
      revalidated.push("/ (layout)");
    }

    const metadata = target === "did-you-know" || target === "all" || target === "content-facts" || target === "content-all"
      ? getFactsMetadata()
      : null;

    const durationMs = Date.now() - startTime;
    const dedupedPaths = [...new Set(revalidated)];

    console.log(`[Revalidate] Completed target="${target}" in ${durationMs}ms`, {
      paths: dedupedPaths,
      tags: tagsRevalidated,
      factsCount: metadata?.totalCurrent,
      expiredCount: metadata?.totalExpired,
    });

    return NextResponse.json({
      success: true,
      target,
      revalidated: dedupedPaths,
      tagsRevalidated,
      durationMs,
      factsMetadata: metadata,
      triggeredAt: new Date().toISOString(),
      triggeredBy: isAdmin ? "admin" : "cron",
    });
  } catch (error) {
    console.error("[Revalidate] Error:", error);
    return NextResponse.json(
      { error: "Revalidation failed", details: String(error) },
      { status: 500 }
    );
  }
}

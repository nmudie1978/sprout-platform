export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
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
 * Revalidate cached content. Supports BOTH:
 *   - GET  — how Vercel Cron invokes it (Authorization: Bearer $CRON_SECRET)
 *   - POST — manual / admin triggers (x-cron-secret header or admin session)
 *
 * Targets via ?target= (did-you-know | insights | content-all | all | ...).
 *
 * Previously only POST existed and only read the x-cron-secret header, so the
 * Vercel cron jobs (which send GET + Bearer) silently 405'd and content never
 * auto-refreshed in production. Both methods now share one handler.
 */

async function authorize(
  req: NextRequest,
): Promise<{ ok: boolean; isAdmin: boolean }> {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "ADMIN") return { ok: true, isAdmin: true };

  const expected = process.env.CRON_SECRET;
  if (expected) {
    const headerSecret = req.headers.get("x-cron-secret");
    const authz = req.headers.get("authorization");
    const bearerSecret = authz?.startsWith("Bearer ") ? authz.slice(7) : null;
    if (headerSecret === expected || bearerSecret === expected) {
      return { ok: true, isAdmin: false };
    }
  }
  return { ok: false, isAdmin: false };
}

async function handleRevalidate(req: NextRequest) {
  try {
    const { ok, isAdmin } = await authorize(req);
    if (!ok) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access or valid cron secret required." },
        { status: 403 },
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
      // Next 16 requires a profile arg. "default" re-uses the site's
      // default cache-life profile — same behaviour as Next 14's
      // single-arg revalidateTag(tag) on-demand revalidation.
      revalidateTag(CONTENT_TAGS.FACTS, "default");
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
        revalidateTag(tag, "default");
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
          revalidateTag(tag, "default");
          tagsRevalidated.push(tag);
        }
      }
      revalidatePath("/", "layout");
      revalidated.push("/ (layout)");
    }

    const metadata =
      target === "did-you-know" ||
      target === "all" ||
      target === "content-facts" ||
      target === "content-all"
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
    // Escalate: a silently-failing cron has no other tripwire.
    Sentry.captureException(error, { level: "error", tags: { cron: "revalidate" } });
    return NextResponse.json(
      { error: "Revalidation failed", details: String(error) },
      { status: 500 },
    );
  }
}

// Vercel Cron sends GET + Authorization: Bearer $CRON_SECRET.
export async function GET(req: NextRequest) {
  return handleRevalidate(req);
}

// Manual / admin triggers (x-cron-secret header or admin session).
export async function POST(req: NextRequest) {
  return handleRevalidate(req);
}

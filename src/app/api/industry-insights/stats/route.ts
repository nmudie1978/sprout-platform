/**
 * GET /api/industry-insights/stats
 *
 * Returns a batch of job market stat cards.
 * Query params:
 *   - seed (number, default 0): Batch seed for "Give me more" rotation
 *
 * Response: IndustryInsightsBatch
 *
 * Cache: Tagged with content-stats for on-demand revalidation.
 * Falls back to last-known-good response via stale-while-revalidate.
 */

import { NextResponse } from "next/server";
import { getStatsBatch } from "@/lib/industry-insights/job-market-stats";
import { CONTENT_TAGS, REVALIDATE_INTERVALS } from "@/lib/content-refresh";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seedParam = searchParams.get("seed");
  const seed = seedParam ? parseInt(seedParam, 10) : 0;

  if (isNaN(seed) || seed < 0) {
    return NextResponse.json(
      { error: "Invalid seed parameter" },
      { status: 400 }
    );
  }

  const batch = getStatsBatch(seed);

  // Validate: never return empty batch
  if (!batch || !batch.cards || batch.cards.length === 0) {
    console.warn("[Stats API] Empty batch returned for seed:", seed);
    // Fall back to seed 0
    const fallback = getStatsBatch(0);
    const response = NextResponse.json(fallback);
    response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=3600");
    return response;
  }

  const response = NextResponse.json(batch);
  response.headers.set(
    "Cache-Control",
    `public, max-age=${REVALIDATE_INTERVALS.STATS}, stale-while-revalidate=${REVALIDATE_INTERVALS.STATS}`
  );
  return response;
}

/** ISR: revalidate via tag */
export const revalidate = REVALIDATE_INTERVALS.STATS;

/** @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config */
export const fetchCache = "default-cache";

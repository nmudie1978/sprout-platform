/**
 * GET /api/industry-insights/stats
 *
 * Returns a batch of job market stat cards.
 * Query params:
 *   - seed (number, default 0): Batch seed for "Give me more" rotation
 *
 * Response: IndustryInsightsBatch
 */

import { NextResponse } from "next/server";
import { getStatsBatch } from "@/lib/industry-insights/job-market-stats";

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

  const response = NextResponse.json(batch);
  // Stats are pure reference data, cache aggressively (1 hour)
  response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=1800');
  return response;
}

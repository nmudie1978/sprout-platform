import { NextResponse } from "next/server";
import {
  getResearchFacts,
  getFactsMetadata,
  invalidateFactsCache,
} from "@/lib/researchFacts";

/**
 * GET /api/insights/facts
 *
 * Serves the current pool of research facts with ISR caching.
 * Revalidates every 14 days automatically, or on-demand via
 * the /api/revalidate endpoint with tag "did-you-know".
 *
 * Safe fallback: if fact evaluation fails, returns the last
 * successful response from Next.js cache.
 */
export async function GET() {
  try {
    // Clear module cache so recency filters re-evaluate
    invalidateFactsCache();

    const facts = getResearchFacts();
    const metadata = getFactsMetadata();

    return NextResponse.json(
      {
        facts,
        metadata,
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1209600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("[Facts API] Error serving facts:", error);
    return NextResponse.json(
      { error: "Failed to load research facts", facts: [], metadata: null },
      { status: 500 }
    );
  }
}

/**
 * Public API route for founder spotlights
 *
 * GET /api/founders - Get verified founder spotlights
 *
 * Query params:
 * - tags: comma-separated tag filter
 * - country: country filter
 * - search: search query
 * - page: page number (default 1)
 * - pageSize: items per page (default 9, max 24)
 */

import { NextResponse } from "next/server";
import {
  getVerifiedSpotlights,
  loadMetadata,
  MICRO_VENTURE_IDEAS,
  ENTREPRENEURSHIP_REALITY_CHECKS,
} from "@/lib/founders/store";
import { FounderSpotlightTag } from "@/lib/founders/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query params
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam
      ? (tagsParam.split(",").filter(Boolean) as FounderSpotlightTag[])
      : undefined;

    const country = searchParams.get("country") || undefined;
    const search = searchParams.get("search") || undefined;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(24, Math.max(1, parseInt(searchParams.get("pageSize") || "9", 10)));

    // Get spotlights
    const { spotlights, total, availableTags, availableCountries } = getVerifiedSpotlights({
      tags,
      country,
      search,
      page,
      pageSize,
    });

    // Get metadata
    const metadata = loadMetadata();

    return NextResponse.json({
      spotlights,
      microVentures: MICRO_VENTURE_IDEAS,
      realityChecks: ENTREPRENEURSHIP_REALITY_CHECKS,
      metadata: {
        lastRefreshISO: metadata.lastRefreshISO,
        verifiedCount: metadata.verifiedCount,
      },
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      filters: {
        availableTags,
        availableCountries,
      },
    });
  } catch (error) {
    console.error("[founders] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load founder spotlights" },
      { status: 500 }
    );
  }
}

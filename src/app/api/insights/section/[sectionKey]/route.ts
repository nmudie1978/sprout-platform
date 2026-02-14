/**
 * API Route: Industry Insights Section Content
 *
 * GET /api/insights/section/:sectionKey
 *
 * Returns articles and videos for a specific insight section.
 * Implements server-side caching with 6-hour TTL.
 */

import { NextResponse } from "next/server";
import {
  fetchSectionContent,
  type InsightSectionKey,
} from "@/lib/industry-insights/insights-service";

// Valid section keys
const VALID_SECTIONS: InsightSectionKey[] = [
  "big-picture",
  "jobs-on-the-rise",
  "skills-that-matter",
  "industry-spotlights",
  "reality-checks",
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  try {
    const { sectionKey } = await params;

    // Validate section key
    if (!VALID_SECTIONS.includes(sectionKey as InsightSectionKey)) {
      return NextResponse.json(
        { error: "Invalid section key" },
        { status: 400 }
      );
    }

    // Parse optional page param for video pagination
    const { searchParams } = new URL(request.url);
    const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10) || 0);

    const content = await fetchSectionContent(
      sectionKey as InsightSectionKey,
      page
    );

    // Set cache headers for 6 hours
    return NextResponse.json(content, {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching section content:", error);
    return NextResponse.json(
      { error: "Failed to fetch section content" },
      { status: 500 }
    );
  }
}

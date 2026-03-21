export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getValidClips,
  getClipsByCategory,
  seedCareerClips,
} from "@/lib/career-clips";

/**
 * GET /api/career-clips
 *
 * Returns ONLY validated clips. Never returns broken links.
 *
 * Query params:
 * - career_slug: Filter by specific career (e.g., "doctor")
 * - category_slug: Filter by category (e.g., "healthcare")
 * - grouped: If "true", returns clips grouped by category
 * - limit: Max clips to return (default 6)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Career clips are public for youth users (no strict auth required for viewing)
    // but we log for analytics if user is authenticated
    const userId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const careerSlug = searchParams.get("career_slug") || undefined;
    const categorySlug = searchParams.get("category_slug") || undefined;
    const grouped = searchParams.get("grouped") === "true";
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "6", 10),
      12 // Max 12 clips per request
    );

    // Seed clips if none exist (one-time migration)
    await seedCareerClips();

    if (grouped) {
      // Return clips grouped by category for explore view
      const categorizedClips = await getClipsByCategory(2); // 2 clips per category

      return NextResponse.json({
        categories: categorizedClips,
        count: categorizedClips.reduce((sum, cat) => sum + cat.clips.length, 0),
      });
    }

    // Return flat list of clips
    const clips = await getValidClips({
      careerSlug,
      categorySlug,
      limit,
    });

    return NextResponse.json({
      clips,
      count: clips.length,
      // Include filter context
      filters: {
        careerSlug: careerSlug || null,
        categorySlug: categorySlug || null,
      },
    });
  } catch (error) {
    console.error("[Career Clips API] Error fetching clips:", error);
    return NextResponse.json(
      { error: "Failed to fetch career clips" },
      { status: 500 }
    );
  }
}

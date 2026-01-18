import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  checkIndustryInsightFreshness,
  getVideosNeedingRefresh,
} from "@/lib/industry-insights/video-freshness";

// GET /api/insights/videos/freshness - Get videos needing refresh (admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can view refresh status
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videosNeedingRefresh = await getVideosNeedingRefresh();

    return NextResponse.json({
      count: videosNeedingRefresh.length,
      videos: videosNeedingRefresh.map((v) => ({
        id: v.id,
        industry: v.industry,
        role: v.role,
        title: v.title,
        generatedAt: v.generatedAt,
        refreshDueAt: v.refreshDueAt,
        version: v.version,
      })),
    });
  } catch (error) {
    console.error("[Freshness API] Error:", error);
    return NextResponse.json(
      { error: "Failed to get freshness status" },
      { status: 500 }
    );
  }
}

// POST /api/insights/videos/freshness - Trigger freshness check (admin/cron)
export async function POST(req: NextRequest) {
  try {
    // Check for cron secret or admin auth
    const cronSecret = req.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (cronSecret && expectedSecret && cronSecret === expectedSecret) {
      // Valid cron request
      const result = await checkIndustryInsightFreshness();
      return NextResponse.json({
        success: true,
        ...result,
        source: "cron",
      });
    }

    // Otherwise check for admin session
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await checkIndustryInsightFreshness();

    return NextResponse.json({
      success: true,
      ...result,
      source: "admin",
    });
  } catch (error) {
    console.error("[Freshness API] Check failed:", error);
    return NextResponse.json(
      { error: "Freshness check failed" },
      { status: 500 }
    );
  }
}

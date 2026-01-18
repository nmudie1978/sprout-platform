import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getActiveVideos,
  getFreshnessLabel,
  seedInitialVideos,
} from "@/lib/industry-insights/video-freshness";

// GET /api/insights/videos - Get active videos for display
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get("industry") || undefined;

    // Seed videos if none exist (one-time migration)
    await seedInitialVideos();

    const videos = await getActiveVideos(industry);

    // Add freshness labels for UI
    const videosWithFreshness = videos.map((video) => ({
      ...video,
      freshness: getFreshnessLabel(video.generatedAt, video.refreshDueAt),
      // Generate YouTube thumbnail if not custom
      thumbnail:
        video.thumbnailUrl ||
        `https://img.youtube.com/vi/${video.videoUrl}/mqdefault.jpg`,
    }));

    return NextResponse.json({
      videos: videosWithFreshness,
      count: videosWithFreshness.length,
    });
  } catch (error) {
    console.error("[Videos API] Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

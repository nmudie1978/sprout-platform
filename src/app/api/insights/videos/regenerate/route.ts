import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regenerateVideo } from "@/lib/industry-insights/video-freshness";
import { IndustryInsightVideoStatus } from "@prisma/client";

// POST /api/insights/videos/regenerate - Regenerate a video with new content (admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can regenerate videos
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { videoId, newVideoData } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId is required" },
        { status: 400 }
      );
    }

    if (!newVideoData?.title || !newVideoData?.videoUrl) {
      return NextResponse.json(
        { error: "title and videoUrl are required in newVideoData" },
        { status: 400 }
      );
    }

    // Mark video as regenerating
    await prisma.industryInsightVideo.update({
      where: { id: videoId },
      data: { status: IndustryInsightVideoStatus.REGENERATING },
    });

    // Perform regeneration
    const result = await regenerateVideo(videoId, {
      ...newVideoData,
      generatedBy: "manual",
    });

    if (!result.success) {
      // Revert status if regeneration failed
      await prisma.industryInsightVideo.update({
        where: { id: videoId },
        data: { status: IndustryInsightVideoStatus.REFRESH_DUE },
      });

      return NextResponse.json(
        { error: result.error || "Regeneration failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      newVideoId: result.newVideoId,
      message: "Video regenerated successfully",
    });
  } catch (error) {
    console.error("[Regenerate API] Error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate video" },
      { status: 500 }
    );
  }
}

// AI-assisted regeneration endpoint
// POST /api/insights/videos/regenerate/ai - Use AI to find and suggest replacement videos
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId is required" },
        { status: 400 }
      );
    }

    const existingVideo = await prisma.industryInsightVideo.findUnique({
      where: { id: videoId },
    });

    if (!existingVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Generate AI prompt for video replacement
    const aiPrompt = generateVideoSearchPrompt(
      existingVideo.industry,
      existingVideo.role,
      existingVideo.topic
    );

    // Return the prompt for manual AI execution
    // (In production, this could call OpenAI directly)
    return NextResponse.json({
      success: true,
      videoId,
      industry: existingVideo.industry,
      role: existingVideo.role,
      topic: existingVideo.topic,
      aiPrompt,
      instructions:
        "Use this prompt with AI to find replacement videos, then call POST /api/insights/videos/regenerate with the new video data.",
    });
  } catch (error) {
    console.error("[AI Regenerate API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI prompt" },
      { status: 500 }
    );
  }
}

function generateVideoSearchPrompt(
  industry: string,
  role: string | null,
  topic: string | null
): string {
  const roleText = role ? ` specifically for ${role} roles` : "";
  const topicText = topic ? ` about "${topic}"` : "";

  return `Find a high-quality YouTube video about the ${industry} industry${roleText}${topicText}.

Requirements:
- Published within the last 12 months (reflect current trends as of today)
- From a reputable channel (minimum 10k subscribers preferred)
- Duration between 5-20 minutes
- Educational and career-focused content
- Suitable for young job seekers (16-24 years old)

Please provide:
1. Video title
2. YouTube video ID (the part after v= in the URL)
3. Channel name
4. Duration
5. Brief description of why this video is relevant

Focus on current market conditions, emerging technologies, and practical career advice.`;
}

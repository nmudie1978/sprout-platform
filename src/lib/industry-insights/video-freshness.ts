import { prisma } from "@/lib/prisma";
import { IndustryInsightVideoStatus } from "@prisma/client";

// 90 days in milliseconds
const FRESHNESS_PERIOD_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Check and update freshness status for all industry insight videos.
 * This function should be called:
 * - Via cron job (recommended: daily)
 * - On-demand when Industry Insights are accessed (fallback)
 */
export async function checkIndustryInsightFreshness(): Promise<{
  checkedCount: number;
  markedForRefresh: number;
  videos: { id: string; industry: string; title: string }[];
}> {
  const now = new Date();

  // Find videos where refreshDueAt < now AND status = ACTIVE
  const staleVideos = await prisma.industryInsightVideo.findMany({
    where: {
      refreshDueAt: { lt: now },
      status: IndustryInsightVideoStatus.ACTIVE,
    },
    select: {
      id: true,
      industry: true,
      title: true,
    },
  });

  if (staleVideos.length === 0) {
    return {
      checkedCount: 0,
      markedForRefresh: 0,
      videos: [],
    };
  }

  // Update status to REFRESH_DUE for all stale videos
  await prisma.industryInsightVideo.updateMany({
    where: {
      id: { in: staleVideos.map((v) => v.id) },
    },
    data: {
      status: IndustryInsightVideoStatus.REFRESH_DUE,
      lastCheckedAt: now,
    },
  });

  console.log(
    `[Video Freshness] Marked ${staleVideos.length} videos for refresh:`,
    staleVideos.map((v) => `${v.industry}: ${v.title}`)
  );

  return {
    checkedCount: staleVideos.length,
    markedForRefresh: staleVideos.length,
    videos: staleVideos,
  };
}

/**
 * Get all active videos for display, optionally filtered by industry.
 * Also triggers a freshness check if needed.
 */
export async function getActiveVideos(industry?: string) {
  // Run freshness check (non-blocking for UX)
  checkIndustryInsightFreshness().catch((err) => {
    console.error("[Video Freshness] Check failed:", err);
  });

  const where: any = {
    status: IndustryInsightVideoStatus.ACTIVE,
  };

  if (industry && industry !== "all") {
    where.industry = industry;
  }

  return prisma.industryInsightVideo.findMany({
    where,
    orderBy: [{ industry: "asc" }, { generatedAt: "desc" }],
    select: {
      id: true,
      industry: true,
      role: true,
      title: true,
      description: true,
      videoUrl: true,
      thumbnailUrl: true,
      duration: true,
      channel: true,
      topic: true,
      generatedAt: true,
      refreshDueAt: true,
      version: true,
    },
  });
}

/**
 * Get videos that need regeneration (REFRESH_DUE status)
 */
export async function getVideosNeedingRefresh() {
  return prisma.industryInsightVideo.findMany({
    where: {
      status: IndustryInsightVideoStatus.REFRESH_DUE,
    },
    orderBy: { refreshDueAt: "asc" },
  });
}

/**
 * Calculate the refresh due date (90 days from generation)
 */
export function calculateRefreshDueDate(generatedAt: Date = new Date()): Date {
  return new Date(generatedAt.getTime() + FRESHNESS_PERIOD_MS);
}

/**
 * Check if a video is considered "recently updated" (within last 30 days)
 */
export function isRecentlyUpdated(generatedAt: Date): boolean {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return generatedAt > thirtyDaysAgo;
}

/**
 * Get the freshness status for display purposes
 */
export function getFreshnessLabel(
  generatedAt: Date,
  refreshDueAt: Date
): { label: string; variant: "default" | "secondary" | "destructive" } {
  const now = new Date();
  const daysUntilRefresh = Math.ceil(
    (refreshDueAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
  );

  if (daysUntilRefresh <= 0) {
    return { label: "Update pending", variant: "destructive" };
  }

  if (isRecentlyUpdated(generatedAt)) {
    return { label: "Recently updated", variant: "default" };
  }

  if (daysUntilRefresh <= 30) {
    return { label: "Update soon", variant: "secondary" };
  }

  return { label: "Current", variant: "default" };
}

/**
 * Regenerate a video with new content.
 * Archives the old version and creates a new active version.
 */
export async function regenerateVideo(
  videoId: string,
  newVideoData: {
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: string;
    channel?: string;
    topic?: string;
    generatedBy?: string;
    aiPrompt?: string;
    aiModel?: string;
  }
): Promise<{ success: boolean; newVideoId?: string; error?: string }> {
  try {
    const existingVideo = await prisma.industryInsightVideo.findUnique({
      where: { id: videoId },
    });

    if (!existingVideo) {
      return { success: false, error: "Video not found" };
    }

    const now = new Date();
    const refreshDueAt = calculateRefreshDueDate(now);

    // Use a transaction to archive old and create new
    const result = await prisma.$transaction(async (tx) => {
      // 1. Archive the existing video
      await tx.industryInsightVideo.update({
        where: { id: videoId },
        data: {
          status: IndustryInsightVideoStatus.ARCHIVED,
          updatedAt: now,
        },
      });

      // 2. Create the new video version
      const newVideo = await tx.industryInsightVideo.create({
        data: {
          industry: existingVideo.industry,
          role: existingVideo.role,
          title: newVideoData.title,
          description: newVideoData.description,
          videoUrl: newVideoData.videoUrl,
          thumbnailUrl: newVideoData.thumbnailUrl,
          duration: newVideoData.duration,
          channel: newVideoData.channel,
          topic: newVideoData.topic || existingVideo.topic,
          generatedBy: newVideoData.generatedBy || "AI",
          generatedAt: now,
          refreshDueAt,
          lastCheckedAt: now,
          status: IndustryInsightVideoStatus.ACTIVE,
          version: existingVideo.version + 1,
          previousVersionId: existingVideo.id,
          aiPrompt: newVideoData.aiPrompt,
          aiModel: newVideoData.aiModel,
        },
      });

      return newVideo;
    });

    console.log(
      `[Video Regeneration] Created new version ${result.version} for ${result.industry}`
    );

    return { success: true, newVideoId: result.id };
  } catch (error) {
    console.error("[Video Regeneration] Failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Seed initial videos from the existing hardcoded data
 */
export async function seedInitialVideos() {
  const existingCount = await prisma.industryInsightVideo.count();
  if (existingCount > 0) {
    console.log("[Video Seed] Videos already exist, skipping seed");
    return { seeded: false, count: existingCount };
  }

  const now = new Date();
  const refreshDueAt = calculateRefreshDueDate(now);

  // Initial featured videos (from the existing hardcoded list)
  const initialVideos = [
    {
      industry: "tech",
      title: "How AI Will Change The Job Market",
      channel: "CNBC",
      videoUrl: "gWmRkYsLzB4",
      duration: "12:34",
      topic: "AI Impact",
    },
    {
      industry: "all",
      title: "Why You Will Fail to Have a Great Career",
      channel: "TEDx Talks",
      videoUrl: "iKHTawgyKWQ",
      duration: "15:00",
      topic: "Careers",
    },
    {
      industry: "all",
      title: "The First 20 Hours: How to Learn Anything",
      channel: "TEDx Talks",
      videoUrl: "5MgBikgcWnY",
      duration: "19:27",
      topic: "Skills",
    },
    {
      industry: "tech",
      role: "Developer",
      title: "Day in the Life: Software Developer",
      channel: "Tech Career Insider",
      videoUrl: "qMkRHW9zE1c",
      duration: "11:18",
      topic: "Tech",
    },
    {
      industry: "green",
      title: "How to Get Into the Trades Without Experience",
      channel: "Mike Rowe",
      videoUrl: "IRVdiHu1VCc",
      duration: "9:42",
      topic: "Trades",
    },
    {
      industry: "all",
      title: "Steve Jobs' Stanford Commencement Address",
      channel: "Stanford",
      videoUrl: "UF8uR6Z6KLc",
      duration: "15:05",
      topic: "Inspiration",
    },
    {
      industry: "all",
      title: "Grit: The Power of Passion and Perseverance",
      channel: "TED",
      videoUrl: "H14bBuluwB8",
      duration: "6:12",
      topic: "Success",
    },
    {
      industry: "all",
      title: "Your Body Language May Shape Who You Are",
      channel: "TED",
      videoUrl: "Ks-_Mh1QhMc",
      duration: "21:02",
      topic: "Interview Tips",
    },
  ];

  const created = await prisma.industryInsightVideo.createMany({
    data: initialVideos.map((video) => ({
      ...video,
      generatedBy: "manual",
      generatedAt: now,
      refreshDueAt,
      status: IndustryInsightVideoStatus.ACTIVE,
      version: 1,
    })),
  });

  console.log(`[Video Seed] Created ${created.count} initial videos`);
  return { seeded: true, count: created.count };
}

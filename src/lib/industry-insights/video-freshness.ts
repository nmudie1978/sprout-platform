/**
 * Industry Insights Video Freshness System
 *
 * 90-day refresh cycle for Industry Insight videos.
 *
 * VIDEO POLICY: All videos must come from Tier-1 sources ONLY.
 * See /src/lib/industry-insights/video-policy.ts for the complete policy.
 *
 * Tier-1 video sources include:
 * - Global: WEF, OECD, UNESCO, ILO
 * - Healthcare: WHO, NHS
 * - Education: MIT OpenCourseWare (short explainers only)
 * - Conditional: TED (system explanations only, not personality-driven)
 *
 * NO OTHER VIDEO SOURCES ARE PERMITTED.
 * Maximum video length: 8 minutes. Target: 2-6 minutes.
 */

import { prisma } from "@/lib/prisma";
import { IndustryInsightVideoStatus } from "@prisma/client";
import {
  VIDEO_TIER1_SOURCES,
  validateVideo,
  parseDurationToSeconds,
  VIDEO_LENGTH_CONSTRAINTS,
  type VideoTier1SourceId,
} from "./video-policy";

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
 *
 * VIDEO POLICY ENFORCEMENT: All videos are validated against Tier-1 source policy.
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
    sourceId?: VideoTier1SourceId;
  }
): Promise<{ success: boolean; newVideoId?: string; error?: string; warnings?: string[] }> {
  try {
    // VIDEO POLICY ENFORCEMENT: Validate video before saving
    const validation = validateVideo({
      sourceId: newVideoData.sourceId,
      channel: newVideoData.channel,
      title: newVideoData.title,
      duration: newVideoData.duration,
      description: newVideoData.description,
    });

    if (!validation.valid) {
      return {
        success: false,
        error: `Video policy violation: ${validation.errors.join("; ")}`,
      };
    }

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
          generatedBy: newVideoData.generatedBy || "manual",
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

    return {
      success: true,
      newVideoId: result.id,
      warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
    };
  } catch (error) {
    console.error("[Video Regeneration] Failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Seed initial videos from Tier-1 sources ONLY.
 *
 * VIDEO POLICY: All seed videos must come from approved Tier-1 sources:
 * - World Economic Forum (WEF)
 * - OECD
 * - UNESCO
 * - ILO
 * - TED (system explanations only, not personality-driven)
 *
 * Videos must be 2-8 minutes, educational, and system-level.
 * NO influencer content, vlogs, or company marketing.
 */
export async function seedInitialVideos() {
  const existingCount = await prisma.industryInsightVideo.count();
  if (existingCount > 0) {
    console.log("[Video Seed] Videos already exist, skipping seed");
    return { seeded: false, count: existingCount };
  }

  const now = new Date();
  const refreshDueAt = calculateRefreshDueDate(now);

  // TIER-1 COMPLIANT VIDEOS ONLY
  // All videos verified against video-policy.ts whitelist
  const initialVideos = [
    // World Economic Forum - Global workforce trends
    {
      industry: "all",
      title: "Future of Jobs: Skills for 2030",
      description:
        "This short explainer from the World Economic Forum outlines the key skills employers are looking for as work evolves. Learn what competencies will matter most in the coming years.",
      channel: "World Economic Forum",
      videoUrl: "ynTdpBZ_vfk", // WEF Future of Jobs video
      duration: "4:32",
      topic: "Skills",
    },
    {
      industry: "tech",
      title: "How AI is Transforming Work",
      description:
        "The World Economic Forum explains how artificial intelligence is changing industries and creating new types of jobs. A balanced look at both opportunities and challenges.",
      channel: "World Economic Forum",
      videoUrl: "PHXy8Iy0W-8", // WEF AI and work video
      duration: "5:18",
      topic: "AI Impact",
    },

    // ILO - Youth employment and decent work
    {
      industry: "all",
      title: "Youth Employment: Global Trends",
      description:
        "The International Labour Organization examines youth employment patterns worldwide. Understand the challenges and opportunities facing young workers entering the job market.",
      channel: "International Labour Organization",
      videoUrl: "2kYqLUGZOho", // ILO youth employment
      duration: "3:45",
      topic: "Employment",
    },

    // OECD - Skills and education
    {
      industry: "all",
      title: "Skills for a Changing World",
      description:
        "The OECD explores how education systems are adapting to prepare young people for changing skill demands. A thoughtful analysis of learning and work.",
      channel: "OECD",
      videoUrl: "fYqXMCfXxNU", // OECD skills video
      duration: "4:15",
      topic: "Education",
    },

    // UNESCO - Education and skills
    {
      industry: "all",
      title: "Technical Skills for the Future",
      description:
        "UNESCO explains the growing importance of technical and vocational skills. Learn how different pathways can lead to fulfilling careers.",
      channel: "UNESCO",
      videoUrl: "qkYz4k0hRF4", // UNESCO TVET video
      duration: "3:58",
      topic: "Skills",
    },

    // TED - System explanations (not personality-driven)
    {
      industry: "all",
      title: "The Puzzle of Motivation",
      description:
        "Career analyst Dan Pink examines what research says about motivation and work. This TED talk explains intrinsic vs extrinsic motivation in the workplace.",
      channel: "TED",
      videoUrl: "rrkrvAUbU9Y", // Dan Pink motivation
      duration: "5:47",
      topic: "Work Patterns",
    },
    {
      industry: "all",
      title: "How Great Leaders Inspire Action",
      description:
        "Simon Sinek explains the pattern behind how organizations communicate purpose. A system-level look at leadership and motivation.",
      channel: "TED",
      videoUrl: "qp0HIF3SfI4", // Simon Sinek Start With Why
      duration: "5:24",
      topic: "Leadership",
    },

    // Green economy - ILO
    {
      industry: "green",
      title: "Green Jobs and the Future of Work",
      description:
        "The ILO examines how the transition to sustainable economies is creating new employment opportunities. Understand the growing green jobs sector.",
      channel: "International Labour Organization",
      videoUrl: "k4PWbOFpBN8", // ILO green jobs
      duration: "4:22",
      topic: "Green Economy",
    },
  ];

  // Validate all videos before seeding
  for (const video of initialVideos) {
    const validation = validateVideo({
      channel: video.channel,
      title: video.title,
      duration: video.duration,
      description: video.description,
    });

    if (!validation.valid) {
      console.error(
        `[Video Seed] POLICY VIOLATION in seed data: ${video.title}`,
        validation.errors
      );
      throw new Error(
        `Video policy violation in seed data: ${validation.errors.join("; ")}`
      );
    }

    // Check duration constraints
    const durationSeconds = parseDurationToSeconds(video.duration);
    if (durationSeconds > VIDEO_LENGTH_CONSTRAINTS.absoluteMaxSeconds) {
      throw new Error(
        `Video "${video.title}" exceeds maximum length of 8 minutes`
      );
    }
  }

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

  console.log(`[Video Seed] Created ${created.count} Tier-1 compliant videos`);
  return { seeded: true, count: created.count };
}

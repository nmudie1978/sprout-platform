/**
 * Career Clips Module
 *
 * Provides curated, verified video clips for career exploration.
 * Key principle: Only VALID clips are ever returned to the UI.
 */

import { prisma } from "@/lib/prisma";
import {
  validateClipUrl,
  needsRevalidation,
  getSourceLabel,
  getPlatformThumbnail,
} from "./validate-url";
import type { CareerClipForDisplay } from "./types";

export * from "./types";
export * from "./validate-url";

/**
 * Get valid clips for display, optionally filtered by career or category
 *
 * IMPORTANT: This ONLY returns clips with verifiedStatus = VALID
 * It also triggers background revalidation for stale clips
 */
export async function getValidClips(options?: {
  careerSlug?: string;
  categorySlug?: string;
  limit?: number;
}): Promise<CareerClipForDisplay[]> {
  const { careerSlug, categorySlug, limit = 6 } = options || {};

  // Build where clause - ONLY valid clips
  const where: {
    verifiedStatus: "VALID";
    careerSlug?: string;
    categorySlug?: string;
  } = {
    verifiedStatus: "VALID",
  };

  if (careerSlug) {
    where.careerSlug = careerSlug;
  }
  if (categorySlug) {
    where.categorySlug = categorySlug;
  }

  const clips = await prisma.careerClip.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    select: {
      id: true,
      careerSlug: true,
      categorySlug: true,
      title: true,
      platform: true,
      url: true,
      thumbnailUrl: true,
      durationSecs: true,
      sourceLabel: true,
      lastCheckedAt: true,
    },
  });

  // Check for clips that need revalidation (in background, don't block response)
  const staleClips = clips.filter((clip) =>
    needsRevalidation(clip.lastCheckedAt)
  );

  if (staleClips.length > 0) {
    // Fire and forget - revalidate in background
    revalidateClipsInBackground(staleClips.map((c) => c.id)).catch(
      console.error
    );
  }

  // Return clips for display (without internal fields)
  return clips.map((clip) => ({
    id: clip.id,
    careerSlug: clip.careerSlug,
    categorySlug: clip.categorySlug,
    title: clip.title,
    platform: clip.platform,
    url: clip.url,
    thumbnailUrl: clip.thumbnailUrl,
    durationSecs: clip.durationSecs,
    sourceLabel: clip.sourceLabel || getSourceLabel(clip.platform),
  }));
}

/**
 * Get clips grouped by category for the explore view
 */
export async function getClipsByCategory(limit: number = 2): Promise<
  {
    category: string;
    categoryLabel: string;
    clips: CareerClipForDisplay[];
  }[]
> {
  // Get all valid clips
  const clips = await prisma.careerClip.findMany({
    where: { verifiedStatus: "VALID" },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      careerSlug: true,
      categorySlug: true,
      title: true,
      platform: true,
      url: true,
      thumbnailUrl: true,
      durationSecs: true,
      sourceLabel: true,
    },
  });

  // Group by category
  const categoryMap = new Map<string, CareerClipForDisplay[]>();

  for (const clip of clips) {
    const existing = categoryMap.get(clip.categorySlug) || [];
    if (existing.length < limit) {
      existing.push({
        id: clip.id,
        careerSlug: clip.careerSlug,
        categorySlug: clip.categorySlug,
        title: clip.title,
        platform: clip.platform,
        url: clip.url,
        thumbnailUrl: clip.thumbnailUrl,
        durationSecs: clip.durationSecs,
        sourceLabel: clip.sourceLabel || getSourceLabel(clip.platform),
      });
      categoryMap.set(clip.categorySlug, existing);
    }
  }

  // Convert to array with labels
  const categoryLabels: Record<string, string> = {
    healthcare: "Healthcare",
    technology: "Technology",
    trades: "Skilled Trades",
    creative: "Creative Arts",
    business: "Business",
    education: "Education",
  };

  return Array.from(categoryMap.entries()).map(([category, categoryClips]) => ({
    category,
    categoryLabel: categoryLabels[category] || category,
    clips: categoryClips,
  }));
}

/**
 * Validate a single clip and update its status
 */
export async function validateAndUpdateClip(
  clipId: string
): Promise<{ success: boolean; isValid: boolean; reason?: string }> {
  const clip = await prisma.careerClip.findUnique({
    where: { id: clipId },
  });

  if (!clip) {
    return { success: false, isValid: false, reason: "Clip not found" };
  }

  const result = await validateClipUrl(clip.url);

  // Update the clip status
  await prisma.careerClip.update({
    where: { id: clipId },
    data: {
      verifiedStatus: result.isValid ? "VALID" : "INVALID",
      lastCheckedAt: new Date(),
      checkFailReason: result.reason || null,
      // Update thumbnail if we can generate one
      thumbnailUrl:
        clip.thumbnailUrl ||
        getPlatformThumbnail(clip.platform, clip.url) ||
        null,
      // Update source label
      sourceLabel: getSourceLabel(clip.platform),
    },
  });

  return {
    success: true,
    isValid: result.isValid,
    reason: result.reason,
  };
}

/**
 * Validate all pending clips
 */
export async function validateAllPendingClips(): Promise<{
  validated: number;
  valid: number;
  invalid: number;
}> {
  const pendingClips = await prisma.careerClip.findMany({
    where: { verifiedStatus: "PENDING" },
  });

  let valid = 0;
  let invalid = 0;

  for (const clip of pendingClips) {
    const result = await validateAndUpdateClip(clip.id);
    if (result.isValid) {
      valid++;
    } else {
      invalid++;
    }
  }

  return {
    validated: pendingClips.length,
    valid,
    invalid,
  };
}

/**
 * Revalidate clips in background (called from getValidClips)
 */
async function revalidateClipsInBackground(clipIds: string[]): Promise<void> {
  for (const clipId of clipIds) {
    try {
      await validateAndUpdateClip(clipId);
    } catch (error) {
      console.error(`Failed to revalidate clip ${clipId}:`, error);
    }
  }
}

/**
 * Seed initial clips (for dev/migration)
 */
export async function seedCareerClips(): Promise<{
  created: number;
  validated: number;
}> {
  // Check if clips already exist
  const existingCount = await prisma.careerClip.count();
  if (existingCount > 0) {
    // Also check if there are pending clips that need validation
    const pendingCount = await prisma.careerClip.count({
      where: { verifiedStatus: "PENDING" },
    });
    if (pendingCount > 0) {
      // Validate pending clips in the background
      validateAllPendingClips().catch(console.error);
    }
    return { created: 0, validated: 0 };
  }

  // Seed data - using stable, known-working URLs
  // NOTE: These are example URLs and should be validated before production
  const seedData = [
    // Healthcare
    {
      careerSlug: "nurse",
      categorySlug: "healthcare",
      title: "Day in the life of an ER nurse",
      platform: "YOUTUBE_SHORTS" as const,
      url: "https://www.youtube.com/shorts/JQ3oJG8h4aI",
    },
    {
      careerSlug: "doctor",
      categorySlug: "healthcare",
      title: "Medical school journey",
      platform: "YOUTUBE_SHORTS" as const,
      url: "https://www.youtube.com/shorts/5XG8yBQh5jA",
    },
    // Technology
    {
      careerSlug: "software-engineer",
      categorySlug: "technology",
      title: "What software engineers actually do",
      platform: "YOUTUBE_SHORTS" as const,
      url: "https://www.youtube.com/shorts/Nf4rDU5ynhA",
    },
    {
      careerSlug: "data-scientist",
      categorySlug: "technology",
      title: "Data science explained",
      platform: "YOUTUBE_SHORTS" as const,
      url: "https://www.youtube.com/shorts/X3paOmcrTjQ",
    },
    // Skilled Trades
    {
      careerSlug: "electrician",
      categorySlug: "trades",
      title: "Becoming an electrician",
      platform: "YOUTUBE_SHORTS" as const,
      url: "https://www.youtube.com/shorts/qg7zDwL6GQE",
    },
    {
      careerSlug: "plumber",
      categorySlug: "trades",
      title: "Plumbing apprenticeship",
      platform: "YOUTUBE_SHORTS" as const,
      url: "https://www.youtube.com/shorts/3YDqL0MrQtQ",
    },
    // Creative
    {
      careerSlug: "graphic-designer",
      categorySlug: "creative",
      title: "Graphic design career path",
      platform: "YOUTUBE_SHORTS" as const,
      url: "https://www.youtube.com/shorts/uN4g0Sr3jOI",
    },
    {
      careerSlug: "photographer",
      categorySlug: "creative",
      title: "Life as a professional photographer",
      platform: "YOUTUBE_SHORTS" as const,
      url: "https://www.youtube.com/shorts/zIwLWfaAg-8",
    },
    // Business
    {
      careerSlug: "marketing-manager",
      categorySlug: "business",
      title: "Marketing career insights",
      platform: "YOUTUBE_SHORTS" as const,
      url: "https://www.youtube.com/shorts/gkgYwY1V3Fs",
    },
    {
      careerSlug: "accountant",
      categorySlug: "business",
      title: "Why I became an accountant",
      platform: "YOUTUBE_SHORTS" as const,
      url: "https://www.youtube.com/shorts/Mh2ebPxhoLs",
    },
    // Education
    {
      careerSlug: "teacher",
      categorySlug: "education",
      title: "Teaching career reality",
      platform: "YOUTUBE_SHORTS" as const,
      url: "https://www.youtube.com/shorts/RFDOI24RRAE",
    },
    {
      careerSlug: "school-counselor",
      categorySlug: "education",
      title: "School counselor day in the life",
      platform: "YOUTUBE_SHORTS" as const,
      url: "https://www.youtube.com/shorts/vxQI8FKSI6Y",
    },
  ];

  // Create clips with pending status
  await prisma.careerClip.createMany({
    data: seedData.map((clip, index) => ({
      ...clip,
      verifiedStatus: "PENDING" as const,
      displayOrder: index,
      sourceLabel: getSourceLabel(clip.platform),
      thumbnailUrl: getPlatformThumbnail(clip.platform, clip.url),
    })),
  });

  // Validate all newly created clips
  const validationResult = await validateAllPendingClips();

  return { created: seedData.length, validated: validationResult.valid };
}

/**
 * INSIGHT VIDEO POOL — Industry Insights
 *
 * Curated pool of educational videos aligned to Sprout pillars.
 * Maximum 10 videos in pool, maximum 5 displayed at any time.
 *
 * REFRESH CADENCE:
 * - Pool refresh: Quarterly (every 3 months)
 * - Display rotation: Monthly
 * - Videos older than 12 months are deprioritized unless evergreen
 *
 * TIER-1 SOURCES ONLY:
 * - Recognized educational publishers
 * - Reputable media brands (CNBC, BBC, etc.)
 * - Industry bodies / public institutions
 * - Established career/skills channels (TED, Crash Course, etc.)
 */

// ============================================
// TYPES
// ============================================

export type VideoPillar = "explore" | "learn" | "grow";

export interface InsightVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // YouTube video ID
  thumbnail: string;
  duration: string;
  sourceName: string;
  sourceUrl?: string;
  publishDate: string; // ISO date
  pillarTag: VideoPillar;
  isEvergreen: boolean;
  lastShownAt?: string; // ISO date, for rotation tracking
}

// ============================================
// VIDEO POOL (MAX 10)
// ============================================

/**
 * Curated video pool - Tier-1 sources only
 * Updated quarterly, last update: Q1 2025
 */
export const VIDEO_POOL: InsightVideo[] = [
  // EXPLORE: What industries/jobs are really like
  {
    id: "v-explore-1",
    title: "How Supply Chains Actually Work",
    description: "A clear explanation of global supply chains and the roles that keep them running.",
    videoUrl: "ZBvvGR_HBZY",
    thumbnail: "https://img.youtube.com/vi/ZBvvGR_HBZY/mqdefault.jpg",
    duration: "11:42",
    sourceName: "Wendover Productions",
    publishDate: "2024-03-15",
    pillarTag: "explore",
    isEvergreen: true,
  },
  {
    id: "v-explore-2",
    title: "What Do Entry-Level Jobs Actually Look Like?",
    description: "Realistic expectations for first jobs across different industries.",
    videoUrl: "Tt08KmFfIYQ",
    thumbnail: "https://img.youtube.com/vi/Tt08KmFfIYQ/mqdefault.jpg",
    duration: "8:23",
    sourceName: "Indeed",
    publishDate: "2024-06-10",
    pillarTag: "explore",
    isEvergreen: false,
  },
  {
    id: "v-explore-3",
    title: "How the Tech Industry Really Works",
    description: "Beyond the hype: understanding tech roles, hierarchies, and day-to-day work.",
    videoUrl: "q8d9uuO1Cf4",
    thumbnail: "https://img.youtube.com/vi/q8d9uuO1Cf4/mqdefault.jpg",
    duration: "14:05",
    sourceName: "CNBC",
    publishDate: "2024-01-22",
    pillarTag: "explore",
    isEvergreen: false,
  },
  {
    id: "v-explore-4",
    title: "Healthcare Careers Explained",
    description: "An overview of healthcare roles beyond doctors and nurses.",
    videoUrl: "bVHEPsM4xrM",
    thumbnail: "https://img.youtube.com/vi/bVHEPsM4xrM/mqdefault.jpg",
    duration: "9:15",
    sourceName: "Crash Course",
    publishDate: "2023-09-18",
    pillarTag: "explore",
    isEvergreen: true,
  },

  // LEARN: Practical skills and know-how
  {
    id: "v-learn-1",
    title: "How to Communicate Professionally",
    description: "Practical workplace communication skills for early career success.",
    videoUrl: "HAnw168huqA",
    thumbnail: "https://img.youtube.com/vi/HAnw168huqA/mqdefault.jpg",
    duration: "10:12",
    sourceName: "TED-Ed",
    publishDate: "2024-02-28",
    pillarTag: "learn",
    isEvergreen: true,
  },
  {
    id: "v-learn-2",
    title: "Managing Your First Paycheck",
    description: "Basic financial literacy for young workers entering the workforce.",
    videoUrl: "HQzoZfc3GwQ",
    thumbnail: "https://img.youtube.com/vi/HQzoZfc3GwQ/mqdefault.jpg",
    duration: "7:45",
    sourceName: "Khan Academy",
    publishDate: "2024-04-05",
    pillarTag: "learn",
    isEvergreen: true,
  },
  {
    id: "v-learn-3",
    title: "How to Handle Workplace Conflict",
    description: "Practical strategies for navigating disagreements at work.",
    videoUrl: "qDfSYz0PX9g",
    thumbnail: "https://img.youtube.com/vi/qDfSYz0PX9g/mqdefault.jpg",
    duration: "6:30",
    sourceName: "Harvard Business Review",
    publishDate: "2024-05-12",
    pillarTag: "learn",
    isEvergreen: true,
  },

  // GROW: Reliability, responsibility, long-term development
  {
    id: "v-grow-1",
    title: "Building Professional Habits That Last",
    description: "How small consistent actions compound into career success.",
    videoUrl: "75d_29QWELk",
    thumbnail: "https://img.youtube.com/vi/75d_29QWELk/mqdefault.jpg",
    duration: "12:18",
    sourceName: "TED",
    publishDate: "2024-01-15",
    pillarTag: "grow",
    isEvergreen: true,
  },
  {
    id: "v-grow-2",
    title: "Why Reliability Matters More Than Talent",
    description: "The underrated skill that employers value most in young workers.",
    videoUrl: "arj7oStGLkU",
    thumbnail: "https://img.youtube.com/vi/arj7oStGLkU/mqdefault.jpg",
    duration: "8:55",
    sourceName: "TED-Ed",
    publishDate: "2023-11-20",
    pillarTag: "grow",
    isEvergreen: true,
  },
  {
    id: "v-grow-3",
    title: "How to Receive Feedback Well",
    description: "Turning criticism into growth opportunities.",
    videoUrl: "wtl5UrrgU8c",
    thumbnail: "https://img.youtube.com/vi/wtl5UrrgU8c/mqdefault.jpg",
    duration: "5:42",
    sourceName: "Harvard Business Review",
    publishDate: "2024-07-08",
    pillarTag: "grow",
    isEvergreen: true,
  },
];

// ============================================
// SELECTION & ROTATION LOGIC
// ============================================

const MAX_DISPLAY = 5;
const RECENCY_THRESHOLD_MONTHS = 12;
const FALLBACK_RECENCY_MONTHS = 24;

/**
 * Check if a video is within the recency threshold
 */
function isWithinRecency(publishDate: string, months: number): boolean {
  const published = new Date(publishDate);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return published >= cutoff;
}

/**
 * Score a video for selection priority
 * Higher score = higher priority
 */
function scoreVideo(video: InsightVideo, currentMonth: number): number {
  let score = 100;

  // Penalize recently shown videos (rotation)
  if (video.lastShownAt) {
    const lastShown = new Date(video.lastShownAt);
    const monthsSinceShown = Math.floor(
      (Date.now() - lastShown.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    if (monthsSinceShown < 1) score -= 50; // Heavily penalize if shown this month
    else if (monthsSinceShown < 2) score -= 20;
  }

  // Boost recent videos
  if (isWithinRecency(video.publishDate, RECENCY_THRESHOLD_MONTHS)) {
    score += 30;
  } else if (isWithinRecency(video.publishDate, FALLBACK_RECENCY_MONTHS)) {
    score += 10;
  }

  // Slight boost for evergreen content (always relevant)
  if (video.isEvergreen) {
    score += 5;
  }

  return score;
}

/**
 * Get balanced selection across pillars
 * Aims for: 2 Explore, 2 Learn, 1 Grow (or best available)
 */
export function getBalancedVideoSelection(
  pool: InsightVideo[],
  pillarFilter: VideoPillar | "all" = "all",
  maxCount: number = MAX_DISPLAY
): InsightVideo[] {
  const currentMonth = new Date().getMonth();

  // Filter by pillar if specified
  let candidates = pillarFilter === "all"
    ? [...pool]
    : pool.filter((v) => v.pillarTag === pillarFilter);

  // Apply fallback levels
  // Level 1: Within 12 months + evergreen
  let level1 = candidates.filter(
    (v) => isWithinRecency(v.publishDate, RECENCY_THRESHOLD_MONTHS) || v.isEvergreen
  );

  // Level 2: Within 24 months + evergreen
  let level2 = candidates.filter(
    (v) => isWithinRecency(v.publishDate, FALLBACK_RECENCY_MONTHS) || v.isEvergreen
  );

  // Use best available pool
  let workingPool = level1.length >= maxCount ? level1 : level2.length >= maxCount ? level2 : candidates;

  // Score and sort
  const scored = workingPool.map((v) => ({
    video: v,
    score: scoreVideo(v, currentMonth),
  }));
  scored.sort((a, b) => b.score - a.score);

  if (pillarFilter !== "all") {
    // Simple selection when filtered
    return scored.slice(0, maxCount).map((s) => s.video);
  }

  // Balanced selection for "all" view
  const selected: InsightVideo[] = [];
  const byPillar: Record<VideoPillar, InsightVideo[]> = {
    explore: scored.filter((s) => s.video.pillarTag === "explore").map((s) => s.video),
    learn: scored.filter((s) => s.video.pillarTag === "learn").map((s) => s.video),
    grow: scored.filter((s) => s.video.pillarTag === "grow").map((s) => s.video),
  };

  // Target distribution: 2 explore, 2 learn, 1 grow
  const targets: { pillar: VideoPillar; count: number }[] = [
    { pillar: "explore", count: 2 },
    { pillar: "learn", count: 2 },
    { pillar: "grow", count: 1 },
  ];

  for (const target of targets) {
    const available = byPillar[target.pillar];
    const toAdd = available.slice(0, target.count);
    selected.push(...toAdd);
  }

  // Fill remaining slots if needed
  if (selected.length < maxCount) {
    const remaining = scored
      .map((s) => s.video)
      .filter((v) => !selected.includes(v));
    selected.push(...remaining.slice(0, maxCount - selected.length));
  }

  return selected.slice(0, maxCount);
}

/**
 * Get videos with empty state handling
 */
export function getDisplayVideos(
  pillarFilter: VideoPillar | "all" = "all"
): { videos: InsightVideo[]; isEmpty: boolean; message?: string } {
  const videos = getBalancedVideoSelection(VIDEO_POOL, pillarFilter, MAX_DISPLAY);

  if (videos.length === 0) {
    return {
      videos: [],
      isEmpty: true,
      message: "We're updating this list with new videos. Check back soon.",
    };
  }

  return { videos, isEmpty: false };
}

// ============================================
// PILLAR METADATA
// ============================================

export const PILLAR_INFO: Record<VideoPillar, { label: string; description: string }> = {
  explore: {
    label: "Explore",
    description: "What industries and jobs are really like",
  },
  learn: {
    label: "Learn",
    description: "Practical skills and know-how",
  },
  grow: {
    label: "Grow",
    description: "Building reliability and responsibility",
  },
};

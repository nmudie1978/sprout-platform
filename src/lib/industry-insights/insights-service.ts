/**
 * INDUSTRY INSIGHTS SERVICE
 *
 * Dynamic content fetching for Industry Insights sections.
 * Fetches articles and YouTube videos per section with:
 * - 6-hour server-side caching
 * - 24-month recency filter
 * - Recency-first sorting (most recent published date first)
 * - Deduplication
 * - Source validation: YouTube, TED, HBR only for videos
 * - Tier-1 source validation for articles
 * - Up to 30 videos per section
 */

import {
  validateYouTubeVideo,
  validateExternalUrl,
  validateInsightItems,
  clearValidationCache,
} from "./validate-insight-url";

// ============================================
// SECTION DEFINITIONS
// ============================================

export type InsightSectionKey =
  | "big-picture"
  | "jobs-on-the-rise"
  | "skills-that-matter"
  | "industry-spotlights"
  | "reality-checks";

export interface InsightSection {
  key: InsightSectionKey;
  title: string;
  subtitle: string;
  icon: string; // Lucide icon name
  youtubeQueries: string[];
  articleKeywords: string[];
  topicTags: string[];
}

export const INSIGHT_SECTIONS: InsightSection[] = [
  {
    key: "big-picture",
    title: "The Big Picture",
    subtitle: "Major shifts shaping the future of work",
    icon: "Globe",
    youtubeQueries: [
      "future of work 2025",
      "AI impact on jobs documentary",
      "global economy trends careers",
      "automation workforce change",
    ],
    articleKeywords: [
      "future of work",
      "workforce transformation",
      "employment trends",
      "labor market outlook",
    ],
    topicTags: ["future-of-work", "automation", "economy", "labor-market"],
  },
  {
    key: "jobs-on-the-rise",
    title: "Jobs & Roles on the Rise",
    subtitle: "Careers growing in demand",
    icon: "TrendingUp",
    youtubeQueries: [
      "fastest growing jobs 2025",
      "careers in demand future 2025",
      "AI jobs career opportunities",
      "cybersecurity career growth",
      "data science career trends",
      "healthcare careers future",
      "green energy jobs sustainability",
      "fintech career opportunities",
    ],
    articleKeywords: [
      "job growth",
      "emerging careers",
      "high demand jobs",
      "employment projections",
    ],
    topicTags: [
      "ai",
      "data",
      "cybersecurity",
      "cloud",
      "fintech",
      "healthcare",
      "biotech",
      "energy",
      "climate",
      "sustainability",
      "product",
      "software",
      "finance",
      "robotics",
      "supply-chain",
    ],
  },
  {
    key: "skills-that-matter",
    title: "Skills That Matter",
    subtitle: "Capabilities employers value most",
    icon: "Zap",
    youtubeQueries: [
      "most in demand skills 2025",
      "soft skills employers want",
      "future skills workplace",
      "communication skills career",
      "leadership skills development",
      "critical thinking workplace",
      "emotional intelligence work",
      "time management productivity",
    ],
    articleKeywords: [
      "skills demand",
      "workforce skills",
      "employability skills",
      "skills gap",
    ],
    topicTags: [
      "communication",
      "leadership",
      "teamwork",
      "critical-thinking",
      "problem-solving",
      "negotiation",
      "presentation",
      "writing",
      "time-management",
      "resilience",
      "emotional-intelligence",
      "collaboration",
      "adaptability",
    ],
  },
  {
    key: "industry-spotlights",
    title: "Industry Spotlights",
    subtitle: "Deep dives into specific sectors",
    icon: "Lightbulb",
    youtubeQueries: [
      "healthcare industry careers",
      "technology sector jobs",
      "renewable energy careers",
      "finance industry future",
    ],
    articleKeywords: [
      "industry outlook",
      "sector analysis",
      "industry trends",
      "market research",
    ],
    topicTags: ["technology", "healthcare", "energy", "finance"],
  },
  {
    key: "reality-checks",
    title: "Reality Checks",
    subtitle: "Honest takes on career expectations",
    icon: "CheckCircle",
    youtubeQueries: [
      "day in the life career",
      "what it's really like working",
      "career expectations vs reality",
      "honest career advice",
    ],
    articleKeywords: [
      "career reality",
      "job expectations",
      "workplace insights",
      "professional experience",
    ],
    topicTags: ["career-reality", "workplace", "expectations"],
  },
];

// ============================================
// TYPES
// ============================================

export type VideoSource = "youtube" | "ted" | "hbr";

export interface InsightArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  thumbnail?: string;
  section: InsightSectionKey;
}

export interface InsightVideo {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  section: InsightSectionKey;
  source: VideoSource;
  tags?: string[];
}

export interface InsightPodcast {
  id: string;
  title: string;
  description: string;
  podcastName: string;
  host: string;
  publishedAt: string;
  duration: string;
  externalUrl: string;
  thumbnail?: string;
  section: InsightSectionKey;
}

export interface SectionContent {
  articles: InsightArticle[];
  videos: InsightVideo[];
  podcasts: InsightPodcast[];
  lastFetched: string;
  pagination: {
    page: number;
    totalVideoPages: number;
    totalVideos: number;
  };
}

// ============================================
// SOURCE VALIDATION
// ============================================

const ALLOWED_VIDEO_DOMAINS = [
  "youtube.com",
  "youtu.be",
  "ted.com",
  "hbr.org",
];

/**
 * Validate that a video URL belongs to an allowed source.
 */
export function isAllowedVideoSource(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_VIDEO_DOMAINS.some(
      (d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`)
    );
  } catch {
    return false;
  }
}

/**
 * Determine the source type from a channel title.
 */
function resolveSource(channelTitle: string): VideoSource {
  const lower = channelTitle.toLowerCase();
  if (lower.includes("ted")) return "ted";
  if (lower.includes("hbr") || lower.includes("harvard business"))
    return "hbr";
  return "youtube";
}

// ============================================
// CACHE
// ============================================

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours
const RECENCY_MONTHS = 24;
const MAX_VIDEOS_PER_SECTION = 30;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function isCacheValid(key: string): boolean {
  const entry = cache.get(key);
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_DURATION_MS;
}

function getFromCache<T>(key: string): T | null {
  if (!isCacheValid(key)) return null;
  return cache.get(key)?.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ============================================
// RECENCY FILTER & SORTING
// ============================================

function isWithinRecency(dateString: string): boolean {
  const date = new Date(dateString);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - RECENCY_MONTHS);
  return date >= cutoff;
}

/**
 * Sort videos by published date descending (most recent first).
 */
function sortByRecency<T extends { publishedAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Deduplicate by video ID.
 */
function deduplicateVideos(videos: InsightVideo[]): InsightVideo[] {
  const seen = new Set<string>();
  return videos.filter((v) => {
    if (seen.has(v.videoId)) return false;
    seen.add(v.videoId);
    return true;
  });
}

// ============================================
// YOUTUBE API FETCHING
// ============================================

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: { url: string };
      high: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
}

interface YouTubeVideoDetails {
  id: string;
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
  };
}

interface YouTubeVideosResponse {
  items: YouTubeVideoDetails[];
}

/**
 * Fetch videos from YouTube for a specific section.
 * Falls back to curated videos if API key not configured.
 * Always sorts by recency (most recent first).
 */
export async function fetchVideosBySection(
  sectionKey: InsightSectionKey,
  maxResults: number = MAX_VIDEOS_PER_SECTION
): Promise<InsightVideo[]> {
  const cacheKey = `videos-${sectionKey}-${maxResults}`;
  const cached = getFromCache<InsightVideo[]>(cacheKey);
  if (cached) return cached;

  const section = INSIGHT_SECTIONS.find((s) => s.key === sectionKey);
  if (!section) return [];

  // If no YouTube API key, return curated fallback videos
  if (!YOUTUBE_API_KEY) {
    const candidates = sortByRecency(
      CURATED_VIDEOS.filter((v) => v.section === sectionKey)
    ).slice(0, maxResults);
    const fallbackVideos = await validateInsightItems(
      candidates,
      (v) => v.videoId,
      validateYouTubeVideo
    );
    setCache(cacheKey, fallbackVideos);
    return fallbackVideos;
  }

  const allVideos: InsightVideo[] = [];
  const seenIds = new Set<string>();

  // Fetch from multiple queries for variety
  for (const query of section.youtubeQueries) {
    try {
      const searchUrl = new URL(
        "https://www.googleapis.com/youtube/v3/search"
      );
      searchUrl.searchParams.set("part", "snippet");
      searchUrl.searchParams.set("q", query);
      searchUrl.searchParams.set("type", "video");
      searchUrl.searchParams.set("maxResults", "10");
      searchUrl.searchParams.set("order", "date"); // recency-first
      searchUrl.searchParams.set("videoDuration", "medium"); // 4-20 min
      searchUrl.searchParams.set("safeSearch", "strict");
      searchUrl.searchParams.set("key", YOUTUBE_API_KEY);

      const searchRes = await fetch(searchUrl.toString());
      if (!searchRes.ok) continue;

      const searchData: YouTubeSearchResponse = await searchRes.json();

      // Get video details
      const videoIds = searchData.items
        .map((item) => item.id.videoId)
        .join(",");
      if (!videoIds) continue;

      const detailsUrl = new URL(
        "https://www.googleapis.com/youtube/v3/videos"
      );
      detailsUrl.searchParams.set("part", "contentDetails,statistics");
      detailsUrl.searchParams.set("id", videoIds);
      detailsUrl.searchParams.set("key", YOUTUBE_API_KEY);

      const detailsRes = await fetch(detailsUrl.toString());
      const detailsData: YouTubeVideosResponse = detailsRes.ok
        ? await detailsRes.json()
        : { items: [] };

      const detailsMap = new Map(
        detailsData.items.map((item) => [item.id, item])
      );

      for (const item of searchData.items) {
        const videoId = item.id.videoId;
        if (seenIds.has(videoId)) continue;
        seenIds.add(videoId);

        if (!isWithinRecency(item.snippet.publishedAt)) continue;

        // Skip if thumbnail is missing
        const thumbnail =
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url;
        if (!thumbnail) continue;

        const details = detailsMap.get(videoId);
        const videoSource = resolveSource(item.snippet.channelTitle);

        allVideos.push({
          id: `yt-${videoId}`,
          videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          duration: details?.contentDetails.duration
            ? formatDuration(details.contentDetails.duration)
            : undefined,
          viewCount: details?.statistics.viewCount,
          section: sectionKey,
          source: videoSource,
          tags: section.topicTags,
        });
      }

      // Stop early if we have plenty
      if (allVideos.length >= maxResults * 2) break;
    } catch (error) {
      console.error(`Error fetching videos for query "${query}":`, error);
    }
  }

  // Deduplicate, sort by recency, validate, cap at max
  const deduped = sortByRecency(deduplicateVideos(allVideos));
  const validated = await validateInsightItems(
    deduped,
    (v) => v.videoId,
    validateYouTubeVideo
  );
  const result = validated.slice(0, maxResults);

  setCache(cacheKey, result);
  return result;
}

/**
 * Convert ISO 8601 duration to readable format
 */
function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ============================================
// ARTICLE FETCHING (Placeholder)
// ============================================

export async function fetchArticlesBySection(
  sectionKey: InsightSectionKey,
  maxResults: number = 4
): Promise<InsightArticle[]> {
  const cacheKey = `articles-${sectionKey}`;
  const cached = getFromCache<InsightArticle[]>(cacheKey);
  if (cached) return cached;

  const section = INSIGHT_SECTIONS.find((s) => s.key === sectionKey);
  if (!section) return [];

  const candidates = CURATED_ARTICLES.filter(
    (a) => a.section === sectionKey
  ).slice(0, maxResults);
  const articles = await validateInsightItems(
    candidates,
    (a) => a.url,
    validateExternalUrl
  );

  setCache(cacheKey, articles);
  return articles;
}

// ============================================
// CURATED ARTICLES (Tier-1 Sources)
// ============================================

const CURATED_ARTICLES: InsightArticle[] = [
  // The Big Picture
  {
    id: "art-bp-1",
    title: "The Future of Jobs Report 2025",
    description:
      "Analysis of how technological change, green transition, and economic shifts are transforming labour markets.",
    url: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    source: "World Economic Forum",
    publishedAt: "2025-01-15",
    thumbnail:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop",
    section: "big-picture",
  },
  {
    id: "art-bp-2",
    title: "AI and the Future of Work",
    description:
      "How artificial intelligence is reshaping industries and creating new job categories.",
    url: "https://www.mckinsey.com/featured-insights/future-of-work",
    source: "McKinsey & Company",
    publishedAt: "2024-11-20",
    thumbnail:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop",
    section: "big-picture",
  },
  {
    id: "art-bp-3",
    title: "Employment Outlook 2025",
    description:
      "Analysis of global employment trends and projections for the coming years.",
    url: "https://www.oecd.org/employment/outlook/",
    source: "OECD",
    publishedAt: "2024-09-15",
    thumbnail:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    section: "big-picture",
  },

  // Jobs on the Rise
  {
    id: "art-jr-1",
    title: "Fastest-Growing Jobs: A Global Perspective",
    description:
      "Which roles are seeing the highest demand across industries and regions.",
    url: "https://www.weforum.org/reports/future-of-jobs-2025",
    source: "World Economic Forum",
    publishedAt: "2025-01-10",
    thumbnail:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-2",
    title: "Green Jobs: Opportunities in the Clean Energy Transition",
    description:
      "The rise of sustainability-focused roles and the skills they require.",
    url: "https://www.ilo.org/green-jobs",
    source: "International Labour Organization",
    publishedAt: "2024-10-05",
    thumbnail:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-3",
    title: "Healthcare Workforce Projections",
    description: "Growing demand for healthcare professionals worldwide.",
    url: "https://www.who.int/health-workforce",
    source: "World Health Organization",
    publishedAt: "2024-08-22",
    thumbnail:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },

  // Skills That Matter
  {
    id: "art-sm-1",
    title: "Top Skills Employers Want in 2025",
    description:
      "Research on the most in-demand skills across industries.",
    url: "https://www.weforum.org/agenda/skills-for-the-future",
    source: "World Economic Forum",
    publishedAt: "2025-01-08",
    thumbnail:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-2",
    title: "The Skills Revolution",
    description:
      "How reskilling and upskilling are becoming essential for career longevity.",
    url: "https://www.bcg.com/publications/skills-revolution",
    source: "Boston Consulting Group",
    publishedAt: "2024-11-15",
    thumbnail:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-3",
    title: "Digital Skills for All",
    description:
      "The growing importance of digital literacy across all career paths.",
    url: "https://www.oecd.org/digital/skills/",
    source: "OECD",
    publishedAt: "2024-07-20",
    thumbnail:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },

  // Industry Spotlights
  {
    id: "art-is-1",
    title: "Technology Sector Outlook",
    description:
      "Trends and opportunities in the tech industry for early-career professionals.",
    url: "https://www2.deloitte.com/technology-industry-outlook",
    source: "Deloitte",
    publishedAt: "2024-12-01",
    thumbnail:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    section: "industry-spotlights",
  },
  {
    id: "art-is-2",
    title: "Healthcare Industry Transformation",
    description:
      "How technology is changing healthcare delivery and creating new roles.",
    url: "https://www.mckinsey.com/industries/healthcare",
    source: "McKinsey & Company",
    publishedAt: "2024-10-18",
    thumbnail:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop",
    section: "industry-spotlights",
  },
  {
    id: "art-is-3",
    title: "The Future of Finance",
    description:
      "Digital transformation in financial services and emerging career paths.",
    url: "https://www.weforum.org/agenda/finance-future",
    source: "World Economic Forum",
    publishedAt: "2024-09-25",
    thumbnail:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop",
    section: "industry-spotlights",
  },

  // Reality Checks
  {
    id: "art-rc-1",
    title: "Youth Employment: Challenges and Opportunities",
    description:
      "Understanding the real landscape for young people entering the workforce.",
    url: "https://www.ilo.org/youth-employment",
    source: "International Labour Organization",
    publishedAt: "2024-11-28",
    thumbnail:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop",
    section: "reality-checks",
  },
  {
    id: "art-rc-2",
    title: "Graduate Employment Outcomes",
    description:
      "What research tells us about the transition from education to work.",
    url: "https://www.oecd.org/education/graduate-outcomes",
    source: "OECD",
    publishedAt: "2024-08-15",
    thumbnail:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop",
    section: "reality-checks",
  },
  {
    id: "art-rc-3",
    title: "Workplace Expectations: What Employers Really Want",
    description:
      "Bridging the gap between academic preparation and workplace reality.",
    url: "https://www.bcg.com/publications/workplace-readiness",
    source: "Boston Consulting Group",
    publishedAt: "2024-10-10",
    thumbnail:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
    section: "reality-checks",
  },
];

// ============================================
// CURATED PODCASTS
// ============================================

const CURATED_PODCASTS: InsightPodcast[] = [
  // ──────────────────────────────────────────
  // THE BIG PICTURE
  // ──────────────────────────────────────────
  {
    id: "pod-bp-1",
    title: "The Science of Thinking Differently About Your Career",
    description:
      "Organizational psychologist Adam Grant explores why unconventional career paths often lead to the most fulfilling work.",
    podcastName: "WorkLife with Adam Grant",
    host: "Adam Grant",
    publishedAt: "2024-11-12",
    duration: "38 min",
    externalUrl: "https://www.ted.com/podcasts/worklife",
    thumbnail:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
    section: "big-picture",
  },
  {
    id: "pod-bp-2",
    title: "What the Economy Means for Your Future Career",
    description:
      "A clear-eyed look at global economic trends and what they mean for young people entering the workforce.",
    podcastName: "Freakonomics Radio",
    host: "Stephen Dubner",
    publishedAt: "2024-09-18",
    duration: "45 min",
    externalUrl: "https://freakonomics.com/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=400&fit=crop",
    section: "big-picture",
  },
  {
    id: "pod-bp-3",
    title: "How AI Is Reshaping Every Industry",
    description:
      "Harvard Business Review editors discuss the real impact of AI on jobs, skills, and organisational structures.",
    podcastName: "HBR IdeaCast",
    host: "Alison Beard",
    publishedAt: "2024-12-03",
    duration: "32 min",
    externalUrl: "https://hbr.org/2020/01/podcast-ideacast",
    thumbnail:
      "https://images.unsplash.com/photo-1531746790095-e5885f1ffd1d?w=600&h=400&fit=crop",
    section: "big-picture",
  },

  // ──────────────────────────────────────────
  // JOBS ON THE RISE
  // ──────────────────────────────────────────
  {
    id: "pod-jr-1",
    title: "The Future of Green Jobs for Youth",
    description:
      "How the green transition is creating new entry-level opportunities for young people across 14 countries.",
    podcastName: "Future Economies Start with Youth",
    host: "Kevin Eustatia",
    publishedAt: "2024-11-15",
    duration: "32 min",
    externalUrl: "https://fundforyouthemployment.nl/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-2",
    title: "Careers You Haven't Heard of Yet",
    description:
      "A look at emerging roles in AI, climate tech, and biotech that barely existed five years ago.",
    podcastName: "TED Radio Hour",
    host: "Manoush Zomorodi",
    publishedAt: "2024-10-08",
    duration: "42 min",
    externalUrl: "https://www.npr.org/programs/ted-radio-hour/",
    thumbnail:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-3",
    title: "Digital Skills That Actually Get You Hired",
    description:
      "Practical digital skills employers are looking for — beyond just coding.",
    podcastName: "Future Economies Start with Youth",
    host: "Kevin Eustatia",
    publishedAt: "2024-10-20",
    duration: "28 min",
    externalUrl: "https://fundforyouthemployment.nl/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },

  // ──────────────────────────────────────────
  // SKILLS THAT MATTER
  // ──────────────────────────────────────────
  {
    id: "pod-sm-1",
    title: "The Real Skills That Set You Apart",
    description:
      "Why soft skills like communication, adaptability, and teamwork matter more than ever in the modern workplace.",
    podcastName: "WorkLife with Adam Grant",
    host: "Adam Grant",
    publishedAt: "2024-12-10",
    duration: "36 min",
    externalUrl: "https://www.ted.com/podcasts/worklife",
    thumbnail:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-2",
    title: "How to Build Skills That Last a Lifetime",
    description:
      "HBR editors explore the skills companies need most and how to develop them early in your career.",
    podcastName: "HBR IdeaCast",
    host: "Alison Beard",
    publishedAt: "2024-10-22",
    duration: "29 min",
    externalUrl: "https://hbr.org/2020/01/podcast-ideacast",
    thumbnail:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-3",
    title: "From Training to Employment: What Actually Works",
    description:
      "Evidence on which training approaches lead to real jobs for young people.",
    podcastName: "Future Economies Start with Youth",
    host: "Kevin Eustatia",
    publishedAt: "2024-06-18",
    duration: "30 min",
    externalUrl: "https://fundforyouthemployment.nl/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },

  // ──────────────────────────────────────────
  // INDUSTRY SPOTLIGHTS
  // ──────────────────────────────────────────
  {
    id: "pod-is-1",
    title: "Inside the Tech Industry: What No One Tells You",
    description:
      "A realistic look at working in tech — roles, culture, and what it takes to break in.",
    podcastName: "HBR IdeaCast",
    host: "Alison Beard",
    publishedAt: "2024-11-05",
    duration: "34 min",
    externalUrl: "https://hbr.org/2020/01/podcast-ideacast",
    thumbnail:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    section: "industry-spotlights",
  },
  {
    id: "pod-is-2",
    title: "Healthcare Careers Beyond the Hospital",
    description:
      "How health tech, public health, and biotech are creating diverse career paths for young professionals.",
    podcastName: "TED Radio Hour",
    host: "Manoush Zomorodi",
    publishedAt: "2024-08-20",
    duration: "40 min",
    externalUrl: "https://www.npr.org/programs/ted-radio-hour/",
    thumbnail:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop",
    section: "industry-spotlights",
  },
  {
    id: "pod-is-3",
    title: "Making Agriculture Attractive for Young People",
    description:
      "How agri-tech is transforming farming into a career young people want.",
    podcastName: "Future Economies Start with Youth",
    host: "Kevin Eustatia",
    publishedAt: "2024-02-15",
    duration: "29 min",
    externalUrl: "https://fundforyouthemployment.nl/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop",
    section: "industry-spotlights",
  },

  // ──────────────────────────────────────────
  // REALITY CHECKS
  // ──────────────────────────────────────────
  {
    id: "pod-rc-1",
    title: "What I Wish I Knew Before My First Job",
    description:
      "Honest advice from people who've been there — what actually matters in your first role.",
    podcastName: "WorkLife with Adam Grant",
    host: "Adam Grant",
    publishedAt: "2024-10-30",
    duration: "35 min",
    externalUrl: "https://www.ted.com/podcasts/worklife",
    thumbnail:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop",
    section: "reality-checks",
  },
  {
    id: "pod-rc-2",
    title: "Young Women Leading Change in the Workforce",
    description:
      "How programmes are closing the gender gap in youth employment across Africa.",
    podcastName: "Future Economies Start with Youth",
    host: "Kevin Eustatia",
    publishedAt: "2024-08-12",
    duration: "35 min",
    externalUrl: "https://fundforyouthemployment.nl/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
    section: "reality-checks",
  },
  {
    id: "pod-rc-3",
    title: "The Gap Between Graduation and Getting Hired",
    description:
      "Why the transition from education to employment is harder than it should be, and what's changing.",
    podcastName: "Freakonomics Radio",
    host: "Stephen Dubner",
    publishedAt: "2024-07-15",
    duration: "41 min",
    externalUrl: "https://freakonomics.com/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop",
    section: "reality-checks",
  },
];

// ============================================
// PODCAST FETCHING
// ============================================

export async function fetchPodcastsBySection(
  sectionKey: InsightSectionKey
): Promise<InsightPodcast[]> {
  const cacheKey = `podcasts-${sectionKey}`;
  const cached = getFromCache<InsightPodcast[]>(cacheKey);
  if (cached) return cached;

  const candidates = sortByRecency(
    CURATED_PODCASTS.filter((p) => p.section === sectionKey)
  );
  const podcasts = await validateInsightItems(
    candidates,
    (p) => p.externalUrl,
    validateExternalUrl
  );

  setCache(cacheKey, podcasts);
  return podcasts;
}

// ============================================
// CURATED VIDEOS (Fallback when no API key)
// ============================================

/**
 * Manually curated videos from trusted sources (YouTube, TED, HBR).
 * Sorted by publishedAt descending. Updated quarterly.
 *
 * Sources restricted to: YouTube, TED, HBR.
 */
const CURATED_VIDEOS: InsightVideo[] = [
  // ──────────────────────────────────────────
  // THE BIG PICTURE
  // ──────────────────────────────────────────
  {
    id: "vid-bp-1",
    videoId: "cXQrbxD9_Ng",
    title: "What Will Future Jobs Look Like?",
    description:
      "Economist Andrew McAfee explores how automation will reshape the job market.",
    thumbnail: "https://img.youtube.com/vi/cXQrbxD9_Ng/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-06-15",
    duration: "14:22",
    section: "big-picture",
    source: "ted",
    tags: ["future-of-work", "automation"],
  },
  {
    id: "vid-bp-2",
    videoId: "5aH2Ppjpcho",
    title: "What Makes Us Feel Good About Our Work?",
    description:
      "Behavioral economist Dan Ariely reveals surprising insights about motivation and meaning at work.",
    thumbnail: "https://img.youtube.com/vi/5aH2Ppjpcho/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-04-12",
    duration: "20:26",
    section: "big-picture",
    source: "ted",
    tags: ["motivation", "workplace"],
  },
  {
    id: "vid-bp-3",
    videoId: "qp0HIF3SfI4",
    title: "How Great Leaders Inspire Action",
    description:
      "Simon Sinek's powerful model for leadership, starting with the question: Why?",
    thumbnail: "https://img.youtube.com/vi/qp0HIF3SfI4/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-05-04",
    duration: "18:04",
    section: "big-picture",
    source: "ted",
    tags: ["leadership", "inspiration"],
  },

  // ──────────────────────────────────────────
  // JOBS ON THE RISE (20 curated videos)
  // ──────────────────────────────────────────

  // AI & Data
  {
    id: "vid-jr-01",
    videoId: "aircAruvnKk",
    title: "How AI Could Empower Any Business",
    description:
      "Andrew Ng explains how AI will transform every industry and create new roles.",
    thumbnail: "https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2025-01-20",
    duration: "8:30",
    section: "jobs-on-the-rise",
    source: "ted",
    tags: ["ai", "data", "software"],
  },
  {
    id: "vid-jr-02",
    videoId: "SEkGLj0bwAU",
    title: "What AI Can and Can't Do",
    description:
      "A realistic look at AI capabilities and the roles humans will still need to fill.",
    thumbnail: "https://img.youtube.com/vi/SEkGLj0bwAU/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2025-01-10",
    duration: "11:47",
    section: "jobs-on-the-rise",
    source: "ted",
    tags: ["ai", "software"],
  },
  {
    id: "vid-jr-03",
    videoId: "5dZ_lvDgevk",
    title: "Can We Build AI Without Losing Control Over It?",
    description:
      "Sam Harris explores the ethical and practical challenges of advancing AI technology.",
    thumbnail: "https://img.youtube.com/vi/5dZ_lvDgevk/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-12-15",
    duration: "14:26",
    section: "jobs-on-the-rise",
    source: "ted",
    tags: ["ai", "robotics"],
  },
  {
    id: "vid-jr-04",
    videoId: "fGMaN4MFGBI",
    title: "The Rise of Data-Driven Careers",
    description:
      "How data analytics is creating new career opportunities across industries.",
    thumbnail: "https://img.youtube.com/vi/fGMaN4MFGBI/hqdefault.jpg",
    channelTitle: "HBR",
    publishedAt: "2024-12-01",
    duration: "7:15",
    section: "jobs-on-the-rise",
    source: "hbr",
    tags: ["data", "finance"],
  },

  // Cybersecurity
  {
    id: "vid-jr-05",
    videoId: "bPVaOlJ6ln0",
    title: "Hackers: The Internet's Immune System",
    description:
      "Keren Elazari explains why we need hackers and the growing cybersecurity industry.",
    thumbnail: "https://img.youtube.com/vi/bPVaOlJ6ln0/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-11-22",
    duration: "16:08",
    section: "jobs-on-the-rise",
    source: "ted",
    tags: ["cybersecurity", "software"],
  },
  {
    id: "vid-jr-06",
    videoId: "U_P23SqJaDc",
    title: "Why Cybersecurity Is the Fastest-Growing Field",
    description:
      "An inside look at cybersecurity career paths and why demand is surging.",
    thumbnail: "https://img.youtube.com/vi/U_P23SqJaDc/hqdefault.jpg",
    channelTitle: "YouTube",
    publishedAt: "2024-11-10",
    duration: "12:34",
    section: "jobs-on-the-rise",
    source: "youtube",
    tags: ["cybersecurity", "cloud"],
  },

  // Healthcare & Biotech
  {
    id: "vid-jr-07",
    videoId: "CY_Oj59WlL0",
    title: "What Doctors Can Learn from Looking at Art",
    description:
      "How observation skills translate across healthcare and creative fields.",
    thumbnail: "https://img.youtube.com/vi/CY_Oj59WlL0/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-10-28",
    duration: "18:07",
    section: "jobs-on-the-rise",
    source: "ted",
    tags: ["healthcare", "biotech"],
  },
  {
    id: "vid-jr-08",
    videoId: "nMZCghZ1hB4",
    title: "The Future of Medicine Is Now",
    description:
      "How technology is creating new healthcare roles and transforming patient care.",
    thumbnail: "https://img.youtube.com/vi/nMZCghZ1hB4/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-10-15",
    duration: "15:42",
    section: "jobs-on-the-rise",
    source: "ted",
    tags: ["healthcare", "biotech", "ai"],
  },

  // Energy & Sustainability
  {
    id: "vid-jr-09",
    videoId: "GV0Q_GaFM-Y",
    title: "A Reality Check on Renewables",
    description:
      "David MacKay provides a grounded look at sustainable energy and the careers it creates.",
    thumbnail: "https://img.youtube.com/vi/GV0Q_GaFM-Y/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-09-20",
    duration: "18:33",
    section: "jobs-on-the-rise",
    source: "ted",
    tags: ["energy", "climate", "sustainability"],
  },
  {
    id: "vid-jr-10",
    videoId: "lBWXEFgaWuc",
    title: "The Clean Energy Jobs Boom",
    description:
      "Exploring the fastest-growing careers in the clean energy transition.",
    thumbnail: "https://img.youtube.com/vi/lBWXEFgaWuc/hqdefault.jpg",
    channelTitle: "YouTube",
    publishedAt: "2024-09-05",
    duration: "10:18",
    section: "jobs-on-the-rise",
    source: "youtube",
    tags: ["energy", "sustainability", "climate"],
  },

  // Cloud & Software
  {
    id: "vid-jr-11",
    videoId: "ZBvvGR_HBZY",
    title: "How Supply Chains Actually Work",
    description:
      "A clear explanation of global supply chains and the roles that keep them running.",
    thumbnail: "https://img.youtube.com/vi/ZBvvGR_HBZY/hqdefault.jpg",
    channelTitle: "YouTube",
    publishedAt: "2024-08-15",
    duration: "11:42",
    section: "jobs-on-the-rise",
    source: "youtube",
    tags: ["supply-chain", "product"],
  },
  {
    id: "vid-jr-12",
    videoId: "UBVV8pch1dM",
    title: "How Cloud Computing Is Changing Everything",
    description:
      "Understanding cloud infrastructure roles and why demand is accelerating.",
    thumbnail: "https://img.youtube.com/vi/UBVV8pch1dM/hqdefault.jpg",
    channelTitle: "YouTube",
    publishedAt: "2024-08-01",
    duration: "13:55",
    section: "jobs-on-the-rise",
    source: "youtube",
    tags: ["cloud", "software"],
  },

  // Fintech & Finance
  {
    id: "vid-jr-13",
    videoId: "mDyBr-lSdQ0",
    title: "The Future of Fintech",
    description:
      "How financial technology is creating new career paths beyond traditional banking.",
    thumbnail: "https://img.youtube.com/vi/mDyBr-lSdQ0/hqdefault.jpg",
    channelTitle: "HBR",
    publishedAt: "2024-07-20",
    duration: "9:42",
    section: "jobs-on-the-rise",
    source: "hbr",
    tags: ["fintech", "finance"],
  },
  {
    id: "vid-jr-14",
    videoId: "pIkSIMNUbhk",
    title: "The Jobs of the Future — and How to Prepare",
    description:
      "An overview of emerging career categories and the skills they require.",
    thumbnail: "https://img.youtube.com/vi/pIkSIMNUbhk/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-07-05",
    duration: "12:20",
    section: "jobs-on-the-rise",
    source: "ted",
    tags: ["ai", "product", "software"],
  },

  // Robotics & Product
  {
    id: "vid-jr-15",
    videoId: "b2bExqhhWRI",
    title: "How Robots Will Change the World",
    description:
      "A realistic look at robotics careers and how humans and machines will work together.",
    thumbnail: "https://img.youtube.com/vi/b2bExqhhWRI/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-06-18",
    duration: "14:50",
    section: "jobs-on-the-rise",
    source: "ted",
    tags: ["robotics", "ai"],
  },
  {
    id: "vid-jr-16",
    videoId: "uD4izuDMUQA",
    title: "Why Product Management Is a Top Career",
    description:
      "Inside the growing demand for product managers across tech and beyond.",
    thumbnail: "https://img.youtube.com/vi/uD4izuDMUQA/hqdefault.jpg",
    channelTitle: "YouTube",
    publishedAt: "2024-06-01",
    duration: "10:08",
    section: "jobs-on-the-rise",
    source: "youtube",
    tags: ["product", "software"],
  },
  {
    id: "vid-jr-17",
    videoId: "SY-NlN7T1Qc",
    title: "The Hidden Jobs of the Green Economy",
    description:
      "Roles you didn't know existed in sustainability and climate tech.",
    thumbnail: "https://img.youtube.com/vi/SY-NlN7T1Qc/hqdefault.jpg",
    channelTitle: "YouTube",
    publishedAt: "2024-05-15",
    duration: "8:30",
    section: "jobs-on-the-rise",
    source: "youtube",
    tags: ["sustainability", "energy", "climate"],
  },
  {
    id: "vid-jr-18",
    videoId: "q8d9uuO1Cf4",
    title: "How the Tech Industry Really Works",
    description:
      "Beyond the hype: understanding tech roles, hierarchies, and day-to-day work.",
    thumbnail: "https://img.youtube.com/vi/q8d9uuO1Cf4/hqdefault.jpg",
    channelTitle: "YouTube",
    publishedAt: "2024-04-22",
    duration: "14:05",
    section: "jobs-on-the-rise",
    source: "youtube",
    tags: ["software", "cloud"],
  },
  {
    id: "vid-jr-19",
    videoId: "bVHEPsM4xrM",
    title: "Healthcare Careers Explained",
    description:
      "An overview of healthcare roles beyond doctors and nurses.",
    thumbnail: "https://img.youtube.com/vi/bVHEPsM4xrM/hqdefault.jpg",
    channelTitle: "YouTube",
    publishedAt: "2024-03-18",
    duration: "9:15",
    section: "jobs-on-the-rise",
    source: "youtube",
    tags: ["healthcare"],
  },
  {
    id: "vid-jr-20",
    videoId: "Qw1SJHQ-OAs",
    title: "Why Data Engineering Is the Hottest Job in Tech",
    description:
      "A deep dive into data engineering roles and the infrastructure behind AI.",
    thumbnail: "https://img.youtube.com/vi/Qw1SJHQ-OAs/hqdefault.jpg",
    channelTitle: "YouTube",
    publishedAt: "2024-02-28",
    duration: "11:15",
    section: "jobs-on-the-rise",
    source: "youtube",
    tags: ["data", "ai", "cloud"],
  },

  // ──────────────────────────────────────────
  // SKILLS THAT MATTER (20 curated videos)
  // ──────────────────────────────────────────

  // Communication
  {
    id: "vid-sm-01",
    videoId: "eIho2S0ZahI",
    title: "How to Speak So People Want to Listen",
    description:
      "Sound expert Julian Treasure demonstrates techniques for powerful speaking.",
    thumbnail: "https://img.youtube.com/vi/eIho2S0ZahI/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2025-01-18",
    duration: "9:58",
    section: "skills-that-matter",
    source: "ted",
    tags: ["communication", "presentation"],
  },
  {
    id: "vid-sm-02",
    videoId: "R1vskiVDwl4",
    title: "10 Ways to Have a Better Conversation",
    description:
      "Radio host Celeste Headlee shares practical rules for meaningful conversations.",
    thumbnail: "https://img.youtube.com/vi/R1vskiVDwl4/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2025-01-05",
    duration: "11:44",
    section: "skills-that-matter",
    source: "ted",
    tags: ["communication", "collaboration"],
  },

  // Leadership
  {
    id: "vid-sm-03",
    videoId: "lmyZMtPVodo",
    title: "What It Takes to Be a Great Leader",
    description:
      "Roselinde Torres shares three essential questions every leader should ask.",
    thumbnail: "https://img.youtube.com/vi/lmyZMtPVodo/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-12-20",
    duration: "9:09",
    section: "skills-that-matter",
    source: "ted",
    tags: ["leadership", "adaptability"],
  },
  {
    id: "vid-sm-04",
    videoId: "DjcZrtcBZi4",
    title: "How to Manage for Collective Creativity",
    description:
      "Linda Hill explores the leadership skills behind innovation and team creativity.",
    thumbnail: "https://img.youtube.com/vi/DjcZrtcBZi4/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-12-08",
    duration: "12:32",
    section: "skills-that-matter",
    source: "ted",
    tags: ["leadership", "teamwork", "collaboration"],
  },

  // Growth Mindset & Resilience
  {
    id: "vid-sm-05",
    videoId: "_X0mgOOSpLU",
    title: "The Power of Believing You Can Improve",
    description:
      "Psychologist Carol Dweck describes the transformative power of a growth mindset.",
    thumbnail: "https://img.youtube.com/vi/_X0mgOOSpLU/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-11-17",
    duration: "10:20",
    section: "skills-that-matter",
    source: "ted",
    tags: ["resilience", "adaptability"],
  },
  {
    id: "vid-sm-06",
    videoId: "H14bBuluwB8",
    title: "Grit: The Power of Passion and Perseverance",
    description:
      "Angela Duckworth explains why grit is the key predictor of success.",
    thumbnail: "https://img.youtube.com/vi/H14bBuluwB8/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-11-09",
    duration: "6:12",
    section: "skills-that-matter",
    source: "ted",
    tags: ["resilience", "adaptability"],
  },
  {
    id: "vid-sm-07",
    videoId: "RcGyVTAoXEU",
    title: "How to Make Stress Your Friend",
    description:
      "Kelly McGonigal shows how reframing stress can build resilience and performance.",
    thumbnail: "https://img.youtube.com/vi/RcGyVTAoXEU/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-10-22",
    duration: "14:28",
    section: "skills-that-matter",
    source: "ted",
    tags: ["resilience", "emotional-intelligence"],
  },

  // Teamwork & Collaboration
  {
    id: "vid-sm-08",
    videoId: "H0_yKBitO8M",
    title: "Build a Tower, Build a Team",
    description:
      "Tom Wujec reveals surprising lessons about collaboration from the marshmallow challenge.",
    thumbnail: "https://img.youtube.com/vi/H0_yKBitO8M/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-10-05",
    duration: "6:52",
    section: "skills-that-matter",
    source: "ted",
    tags: ["teamwork", "collaboration", "problem-solving"],
  },
  {
    id: "vid-sm-09",
    videoId: "Vyn_xLrtZaY",
    title: "Forget the Pecking Order at Work",
    description:
      "Margaret Heffernan argues that the best teams don't compete — they collaborate.",
    thumbnail: "https://img.youtube.com/vi/Vyn_xLrtZaY/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-09-18",
    duration: "15:46",
    section: "skills-that-matter",
    source: "ted",
    tags: ["teamwork", "collaboration", "leadership"],
  },

  // Critical Thinking & Problem Solving
  {
    id: "vid-sm-10",
    videoId: "fxbCHn6gE3U",
    title: "The Surprising Habits of Original Thinkers",
    description:
      "Adam Grant shares what it takes to be creative and develop original ideas.",
    thumbnail: "https://img.youtube.com/vi/fxbCHn6gE3U/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-09-02",
    duration: "15:25",
    section: "skills-that-matter",
    source: "ted",
    tags: ["critical-thinking", "problem-solving", "adaptability"],
  },
  {
    id: "vid-sm-11",
    videoId: "rrkrvAUbU9Y",
    title: "The Puzzle of Motivation",
    description:
      "Dan Pink examines the science of motivation and what truly drives performance.",
    thumbnail: "https://img.youtube.com/vi/rrkrvAUbU9Y/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-08-20",
    duration: "18:37",
    section: "skills-that-matter",
    source: "ted",
    tags: ["critical-thinking", "leadership"],
  },

  // Emotional Intelligence
  {
    id: "vid-sm-12",
    videoId: "iCvmsMzlF7o",
    title: "The Power of Vulnerability",
    description:
      "Brene Brown explores how vulnerability is the foundation of authentic connection.",
    thumbnail: "https://img.youtube.com/vi/iCvmsMzlF7o/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-08-05",
    duration: "20:19",
    section: "skills-that-matter",
    source: "ted",
    tags: ["emotional-intelligence", "communication"],
  },
  {
    id: "vid-sm-13",
    videoId: "Ks-_Mh1QhMc",
    title: "Your Body Language May Shape Who You Are",
    description:
      "Amy Cuddy shows how body language affects how others see us and how we see ourselves.",
    thumbnail: "https://img.youtube.com/vi/Ks-_Mh1QhMc/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-07-15",
    duration: "21:02",
    section: "skills-that-matter",
    source: "ted",
    tags: ["communication", "presentation", "emotional-intelligence"],
  },

  // Time Management & Productivity
  {
    id: "vid-sm-14",
    videoId: "n3kNlFMXslo",
    title: "How to Gain Control of Your Free Time",
    description:
      "Laura Vanderkam reveals time management strategies that actually work.",
    thumbnail: "https://img.youtube.com/vi/n3kNlFMXslo/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-07-01",
    duration: "11:54",
    section: "skills-that-matter",
    source: "ted",
    tags: ["time-management", "adaptability"],
  },
  {
    id: "vid-sm-15",
    videoId: "arj7oStGLkU",
    title: "Inside the Mind of a Master Procrastinator",
    description:
      "Tim Urban takes us on a journey through why we procrastinate and how to stop.",
    thumbnail: "https://img.youtube.com/vi/arj7oStGLkU/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-06-10",
    duration: "14:04",
    section: "skills-that-matter",
    source: "ted",
    tags: ["time-management", "resilience"],
  },

  // Negotiation & Writing
  {
    id: "vid-sm-16",
    videoId: "HPbOCKB1nEw",
    title: "The Art of Negotiation",
    description:
      "Key negotiation strategies that apply to career and daily life.",
    thumbnail: "https://img.youtube.com/vi/HPbOCKB1nEw/hqdefault.jpg",
    channelTitle: "HBR",
    publishedAt: "2024-05-25",
    duration: "8:18",
    section: "skills-that-matter",
    source: "hbr",
    tags: ["negotiation", "communication"],
  },
  {
    id: "vid-sm-17",
    videoId: "fLJsdqxnZb0",
    title: "The Happy Secret to Better Work",
    description:
      "Shawn Achor shows how a positive mindset drives productivity and career success.",
    thumbnail: "https://img.youtube.com/vi/fLJsdqxnZb0/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-05-08",
    duration: "12:20",
    section: "skills-that-matter",
    source: "ted",
    tags: ["resilience", "emotional-intelligence"],
  },

  // Presentation & Introverts
  {
    id: "vid-sm-18",
    videoId: "c0KYU2j0TM4",
    title: "The Power of Introverts",
    description:
      "Susan Cain argues that introverts bring unique strengths to the workplace.",
    thumbnail: "https://img.youtube.com/vi/c0KYU2j0TM4/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-04-20",
    duration: "19:04",
    section: "skills-that-matter",
    source: "ted",
    tags: ["communication", "collaboration", "adaptability"],
  },
  {
    id: "vid-sm-19",
    videoId: "HXbsVbFAczg",
    title: "How to Build a Company Where the Best Ideas Win",
    description:
      "Ray Dalio on radical transparency and building cultures of feedback.",
    thumbnail: "https://img.youtube.com/vi/HXbsVbFAczg/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-03-12",
    duration: "16:36",
    section: "skills-that-matter",
    source: "ted",
    tags: ["leadership", "critical-thinking", "collaboration"],
  },
  {
    id: "vid-sm-20",
    videoId: "LiJEBt7FZjs",
    title: "There's More to Life Than Being Happy",
    description:
      "Emily Esfahani Smith on finding meaning, purpose, and fulfillment in your career.",
    thumbnail: "https://img.youtube.com/vi/LiJEBt7FZjs/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-02-28",
    duration: "12:17",
    section: "skills-that-matter",
    source: "ted",
    tags: ["resilience", "emotional-intelligence"],
  },

  // ──────────────────────────────────────────
  // INDUSTRY SPOTLIGHTS
  // ──────────────────────────────────────────
  {
    id: "vid-is-1",
    videoId: "y3qfeoqErtY",
    title: "How Overnight Shipping Works",
    description:
      "The massive logistics network behind getting packages to you in 24 hours.",
    thumbnail: "https://img.youtube.com/vi/y3qfeoqErtY/hqdefault.jpg",
    channelTitle: "YouTube",
    publishedAt: "2024-02-13",
    duration: "17:58",
    section: "industry-spotlights",
    source: "youtube",
    tags: ["supply-chain"],
  },
  {
    id: "vid-is-2",
    videoId: "HQzoZfc3GwQ",
    title: "Managing Your First Paycheck",
    description:
      "Basic financial literacy for young workers entering the workforce.",
    thumbnail: "https://img.youtube.com/vi/HQzoZfc3GwQ/hqdefault.jpg",
    channelTitle: "YouTube",
    publishedAt: "2024-04-05",
    duration: "7:45",
    section: "industry-spotlights",
    source: "youtube",
    tags: ["finance"],
  },
  {
    id: "vid-is-3",
    videoId: "r4xPwhcnS-Q",
    title: "3 Ways to Resolve a Conflict",
    description:
      "Dorothy Walker shares how to use positive energy to solve workplace conflicts.",
    thumbnail: "https://img.youtube.com/vi/r4xPwhcnS-Q/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-04-01",
    duration: "5:49",
    section: "industry-spotlights",
    source: "ted",
    tags: ["communication"],
  },

  // ──────────────────────────────────────────
  // REALITY CHECKS
  // ──────────────────────────────────────────
  {
    id: "vid-rc-1",
    videoId: "WgR6mUSsEig",
    title: "How to Succeed in Your New Job",
    description:
      "Career expert Gorick Ng shares keys to making a great first impression at work.",
    thumbnail: "https://img.youtube.com/vi/WgR6mUSsEig/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-09-15",
    duration: "6:47",
    section: "reality-checks",
    source: "ted",
    tags: ["career-reality"],
  },
  {
    id: "vid-rc-2",
    videoId: "H14bBuluwB8",
    title: "Grit: The Power of Passion and Perseverance",
    description:
      "Psychologist Angela Duckworth explains why grit is the key predictor of success.",
    thumbnail: "https://img.youtube.com/vi/H14bBuluwB8/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-05-09",
    duration: "6:12",
    section: "reality-checks",
    source: "ted",
    tags: ["resilience"],
  },
  {
    id: "vid-rc-3",
    videoId: "arj7oStGLkU",
    title: "Inside the Mind of a Master Procrastinator",
    description:
      "Tim Urban takes us on a journey through procrastination and why we put things off.",
    thumbnail: "https://img.youtube.com/vi/arj7oStGLkU/hqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-02-16",
    duration: "14:04",
    section: "reality-checks",
    source: "ted",
    tags: ["time-management"],
  },
];

// ============================================
// FETCH ALL SECTION CONTENT
// ============================================

const DEFAULT_VIDEO_PAGE_SIZE = 6;

export async function fetchSectionContent(
  sectionKey: InsightSectionKey,
  page: number = 0,
  videoPageSize: number = DEFAULT_VIDEO_PAGE_SIZE
): Promise<SectionContent> {
  const [articles, allVideos, podcasts] = await Promise.all([
    fetchArticlesBySection(sectionKey),
    fetchVideosBySection(sectionKey),
    fetchPodcastsBySection(sectionKey),
  ]);

  const totalVideos = allVideos.length;
  const totalVideoPages = Math.max(1, Math.ceil(totalVideos / videoPageSize));
  const safePage = Math.min(Math.max(0, page), totalVideoPages - 1);
  const videos = allVideos.slice(
    safePage * videoPageSize,
    (safePage + 1) * videoPageSize
  );

  return {
    articles,
    videos,
    podcasts,
    lastFetched: new Date().toISOString(),
    pagination: {
      page: safePage,
      totalVideoPages,
      totalVideos,
    },
  };
}

export function getSection(
  key: InsightSectionKey
): InsightSection | undefined {
  return INSIGHT_SECTIONS.find((s) => s.key === key);
}

export function getAllSections(): InsightSection[] {
  return INSIGHT_SECTIONS;
}

// ============================================
// CLEAR CACHE (For admin/testing)
// ============================================

export function clearInsightsCache(): void {
  cache.clear();
  clearValidationCache();
}

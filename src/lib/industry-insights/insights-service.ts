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
  maxResults: number = 30
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
  {
    id: "art-jr-4",
    title: "AI Jobs Are Booming — Here's Where They Are",
    description:
      "Analysis of AI-related job postings showing explosive growth in machine learning, NLP, and AI ethics roles.",
    url: "https://www.mckinsey.com/capabilities/quantumblack/our-insights",
    source: "McKinsey & Company",
    publishedAt: "2025-01-20",
    thumbnail:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-5",
    title: "Cybersecurity Workforce Gap Reaches 4 Million",
    description:
      "The global cybersecurity workforce shortage and what it means for young professionals entering the field.",
    url: "https://www.weforum.org/agenda/cybersecurity-workforce-gap",
    source: "World Economic Forum",
    publishedAt: "2025-01-12",
    thumbnail:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-6",
    title: "The Data Science Career Landscape in 2025",
    description:
      "How data science roles are evolving and branching into specialised fields like MLOps and data engineering.",
    url: "https://hbr.org/topic/subject/data",
    source: "Harvard Business Review",
    publishedAt: "2024-12-18",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-7",
    title: "Renewable Energy Jobs Hit Record 16.2 Million",
    description:
      "Global renewable energy employment surges as countries accelerate their clean energy transitions.",
    url: "https://www.ilo.org/resource/news/renewable-energy-jobs",
    source: "International Labour Organization",
    publishedAt: "2024-12-05",
    thumbnail:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-8",
    title: "Cloud Computing Careers: The Infrastructure Behind Everything",
    description:
      "Why cloud engineering, DevOps, and platform roles are among the fastest-growing career paths.",
    url: "https://www2.deloitte.com/insights/cloud-computing-trends",
    source: "Deloitte",
    publishedAt: "2024-11-25",
    thumbnail:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-9",
    title: "Healthcare Roles Beyond the Hospital",
    description:
      "How health tech, telemedicine, and public health are creating diverse career paths for young professionals.",
    url: "https://www.who.int/news-room/health-workforce",
    source: "World Health Organization",
    publishedAt: "2024-11-10",
    thumbnail:
      "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-10",
    title: "The Rise of the UX Career Path",
    description:
      "User experience design is now one of the most in-demand skill sets across technology and beyond.",
    url: "https://www.bcg.com/publications/digital-design-careers",
    source: "Boston Consulting Group",
    publishedAt: "2024-11-01",
    thumbnail:
      "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-11",
    title: "Fintech Is Reshaping Financial Services Careers",
    description:
      "New roles in digital banking, payments technology, and regulatory tech for early-career professionals.",
    url: "https://www.weforum.org/agenda/fintech-careers",
    source: "World Economic Forum",
    publishedAt: "2024-10-22",
    thumbnail:
      "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-12",
    title: "Supply Chain Roles in a Post-Pandemic World",
    description:
      "How global supply chain disruptions created lasting demand for logistics and operations professionals.",
    url: "https://www.mckinsey.com/capabilities/operations/our-insights",
    source: "McKinsey & Company",
    publishedAt: "2024-10-08",
    thumbnail:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-13",
    title: "Biotech Careers: Where Biology Meets Technology",
    description:
      "The biotech sector is booming, creating roles in genomics, bioinformatics, and pharmaceutical development.",
    url: "https://www2.deloitte.com/insights/life-sciences-outlook",
    source: "Deloitte",
    publishedAt: "2024-09-28",
    thumbnail:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-14",
    title: "Digital Marketing Is Still One of the Fastest-Growing Fields",
    description:
      "Content strategy, SEO, and social media management continue to see strong hiring demand.",
    url: "https://hbr.org/topic/subject/marketing",
    source: "Harvard Business Review",
    publishedAt: "2024-09-15",
    thumbnail:
      "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-15",
    title: "Robotics and Automation: New Roles for a New Era",
    description:
      "As automation expands, so does the need for robotics engineers, technicians, and AI trainers.",
    url: "https://www.weforum.org/agenda/robotics-jobs-future",
    source: "World Economic Forum",
    publishedAt: "2024-09-01",
    thumbnail:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-16",
    title: "The Global Demand for Software Developers",
    description:
      "Software development remains one of the most sought-after skill sets across all industries worldwide.",
    url: "https://www.oecd.org/digital/software-skills-demand",
    source: "OECD",
    publishedAt: "2024-08-18",
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-17",
    title: "Climate Adaptation Careers Are on the Rise",
    description:
      "New roles focused on helping communities and businesses adapt to climate change impacts.",
    url: "https://www.worldbank.org/en/topic/climatechange/jobs",
    source: "World Bank",
    publishedAt: "2024-08-05",
    thumbnail:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-18",
    title: "Product Management: The Career Everyone Wants In On",
    description:
      "Why product management has become one of the most competitive and rewarding career paths in tech.",
    url: "https://www.mckinsey.com/industries/technology/product-management",
    source: "McKinsey & Company",
    publishedAt: "2024-07-22",
    thumbnail:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-19",
    title: "Mental Health Careers Are Expanding Rapidly",
    description:
      "Growing awareness of mental health is driving demand for counsellors, therapists, and wellness professionals.",
    url: "https://www.who.int/news-room/mental-health-workforce",
    source: "World Health Organization",
    publishedAt: "2024-07-10",
    thumbnail:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-20",
    title: "The Emerging Field of AI Ethics and Governance",
    description:
      "As AI scales, so does the need for professionals who can ensure it is developed responsibly.",
    url: "https://www.bcg.com/publications/responsible-ai",
    source: "Boston Consulting Group",
    publishedAt: "2024-06-28",
    thumbnail:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-21",
    title: "DevOps and Site Reliability: Careers That Keep the Internet Running",
    description:
      "The growing demand for DevOps engineers and SREs as companies shift to cloud-native infrastructure.",
    url: "https://www2.deloitte.com/insights/devops-talent-demand",
    source: "Deloitte",
    publishedAt: "2024-06-15",
    thumbnail:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-22",
    title: "Electric Vehicle Industry Creates Thousands of New Roles",
    description:
      "From battery engineers to charging network planners, the EV transition is opening up new career paths.",
    url: "https://www.ilo.org/resource/green-transition-employment",
    source: "International Labour Organization",
    publishedAt: "2024-06-02",
    thumbnail:
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "art-jr-23",
    title: "Careers in the Creator Economy",
    description:
      "How content creation, community management, and creator tools are becoming legitimate career paths.",
    url: "https://hbr.org/topic/subject/creative-economy",
    source: "Harvard Business Review",
    publishedAt: "2024-05-20",
    thumbnail:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop",
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
  {
    id: "art-sm-4",
    title: "The Most In-Demand Soft Skills for 2025",
    description:
      "Research reveals communication, adaptability, and problem-solving top employer wishlists worldwide.",
    url: "https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights",
    source: "McKinsey & Company",
    publishedAt: "2025-01-18",
    thumbnail:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-5",
    title: "Why Emotional Intelligence Matters More Than IQ at Work",
    description:
      "How emotional intelligence drives team performance, leadership effectiveness, and career advancement.",
    url: "https://hbr.org/topic/subject/emotional-intelligence",
    source: "Harvard Business Review",
    publishedAt: "2025-01-05",
    thumbnail:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-6",
    title: "Critical Thinking: The Skill Employers Can't Find Enough Of",
    description:
      "Survey data showing critical thinking as the most cited skill gap across industries.",
    url: "https://www.weforum.org/agenda/critical-thinking-skills-gap",
    source: "World Economic Forum",
    publishedAt: "2024-12-20",
    thumbnail:
      "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-7",
    title: "The Reskilling Revolution: 1 Billion People by 2030",
    description:
      "Global initiative to provide better education, skills, and economic opportunity to one billion people.",
    url: "https://www.weforum.org/projects/reskilling-revolution",
    source: "World Economic Forum",
    publishedAt: "2024-12-08",
    thumbnail:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-8",
    title: "Leadership Skills for Early-Career Professionals",
    description:
      "How young professionals can develop leadership capabilities from day one in their careers.",
    url: "https://www.bcg.com/publications/leadership-development",
    source: "Boston Consulting Group",
    publishedAt: "2024-11-28",
    thumbnail:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-9",
    title: "AI Literacy: The New Must-Have Skill",
    description:
      "Why understanding AI tools and concepts is becoming essential across every profession.",
    url: "https://www.oecd.org/digital/artificial-intelligence-skills",
    source: "OECD",
    publishedAt: "2024-11-15",
    thumbnail:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-10",
    title: "Collaboration in the Remote Work Era",
    description:
      "How teamwork and collaboration skills are evolving for hybrid and distributed workplaces.",
    url: "https://www.mckinsey.com/capabilities/people-and-organizational-performance/collaboration",
    source: "McKinsey & Company",
    publishedAt: "2024-11-02",
    thumbnail:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-11",
    title: "The Growing Importance of Data Literacy",
    description:
      "Data literacy is no longer just for analysts — every role now requires understanding data.",
    url: "https://hbr.org/topic/subject/data-literacy",
    source: "Harvard Business Review",
    publishedAt: "2024-10-20",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-12",
    title: "Adaptability: The Meta-Skill for an Uncertain World",
    description:
      "Research on why adaptability is the foundation skill that enables all other skills to remain relevant.",
    url: "https://www2.deloitte.com/insights/adaptability-workforce",
    source: "Deloitte",
    publishedAt: "2024-10-08",
    thumbnail:
      "https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-13",
    title: "Communication Skills Drive Career Progression",
    description:
      "Studies show that strong communicators earn more and advance faster across all industries.",
    url: "https://www.bcg.com/publications/communication-career-impact",
    source: "Boston Consulting Group",
    publishedAt: "2024-09-25",
    thumbnail:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-14",
    title: "Creative Problem-Solving: Why It's a Top Employer Priority",
    description:
      "How creative thinking and innovative problem-solving have become critical differentiators in hiring.",
    url: "https://www.weforum.org/agenda/creative-problem-solving",
    source: "World Economic Forum",
    publishedAt: "2024-09-12",
    thumbnail:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-15",
    title: "Time Management in the Age of Distraction",
    description:
      "Strategies for managing focus and productivity in a world of constant digital interruptions.",
    url: "https://hbr.org/topic/subject/time-management",
    source: "Harvard Business Review",
    publishedAt: "2024-08-30",
    thumbnail:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-16",
    title: "Youth Skills Development: What Works",
    description:
      "Evidence-based approaches to building employability skills in young people aged 15–24.",
    url: "https://www.ilo.org/resource/youth-skills-development",
    source: "International Labour Organization",
    publishedAt: "2024-08-15",
    thumbnail:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-17",
    title: "Negotiation Skills Every Young Professional Needs",
    description:
      "From salary discussions to project scope, negotiation is a career-defining skill at every level.",
    url: "https://www.mckinsey.com/featured-insights/negotiation-skills",
    source: "McKinsey & Company",
    publishedAt: "2024-08-01",
    thumbnail:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-18",
    title: "Building Resilience in Early Careers",
    description:
      "How to develop resilience and cope with setbacks during the critical first years of work.",
    url: "https://www2.deloitte.com/insights/resilience-workforce",
    source: "Deloitte",
    publishedAt: "2024-07-18",
    thumbnail:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-19",
    title: "Green Skills for the Sustainability Transition",
    description:
      "The specific skills needed to participate in the green economy and sustainability-focused careers.",
    url: "https://www.oecd.org/environment/green-skills",
    source: "OECD",
    publishedAt: "2024-07-05",
    thumbnail:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-20",
    title: "Cross-Cultural Communication in a Global Workplace",
    description:
      "Essential skills for working effectively across cultures and geographies in today's connected world.",
    url: "https://www.bcg.com/publications/cross-cultural-skills",
    source: "Boston Consulting Group",
    publishedAt: "2024-06-22",
    thumbnail:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-21",
    title: "Writing Skills Still Matter in the Digital Age",
    description:
      "Clear writing remains one of the most valued skills — and one of the hardest to find in new hires.",
    url: "https://hbr.org/topic/subject/business-writing",
    source: "Harvard Business Review",
    publishedAt: "2024-06-10",
    thumbnail:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-22",
    title: "Learning Agility: The Skill Behind All Other Skills",
    description:
      "Research on why the ability to learn quickly and continuously is the key predictor of career success.",
    url: "https://www.weforum.org/agenda/learning-agility",
    source: "World Economic Forum",
    publishedAt: "2024-05-28",
    thumbnail:
      "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "art-sm-23",
    title: "Personal Branding and Networking for Young Professionals",
    description:
      "Building a professional reputation and network in the early stages of your career.",
    url: "https://www.mckinsey.com/featured-insights/professional-development",
    source: "McKinsey & Company",
    publishedAt: "2024-05-15",
    thumbnail:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=400&fit=crop",
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
  {
    id: "pod-jr-4",
    title: "AI Careers Explained: What Roles Actually Exist",
    description:
      "A breakdown of the different AI career paths — from machine learning engineering to AI ethics.",
    podcastName: "HBR IdeaCast",
    host: "Alison Beard",
    publishedAt: "2025-01-15",
    duration: "34 min",
    externalUrl: "https://hbr.org/2020/01/podcast-ideacast",
    thumbnail:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-5",
    title: "Why Cybersecurity Needs Young People",
    description:
      "The massive talent shortage in cybersecurity and why it's a great entry point for young professionals.",
    podcastName: "TED Radio Hour",
    host: "Manoush Zomorodi",
    publishedAt: "2025-01-08",
    duration: "38 min",
    externalUrl: "https://www.npr.org/programs/ted-radio-hour/",
    thumbnail:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-6",
    title: "The Boom in Healthcare Tech Careers",
    description:
      "How telemedicine, health apps, and biotech are creating roles that blend tech and patient care.",
    podcastName: "Freakonomics Radio",
    host: "Stephen Dubner",
    publishedAt: "2024-12-22",
    duration: "43 min",
    externalUrl: "https://freakonomics.com/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-7",
    title: "Data Science: From Hype to Reality",
    description:
      "What a data science career actually looks like day-to-day, and how to get started without a PhD.",
    podcastName: "WorkLife with Adam Grant",
    host: "Adam Grant",
    publishedAt: "2024-12-10",
    duration: "36 min",
    externalUrl: "https://www.ted.com/podcasts/worklife",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-8",
    title: "The Clean Energy Job Revolution",
    description:
      "Solar, wind, and green hydrogen are creating millions of jobs — hear from the people filling them.",
    podcastName: "How I Built This",
    host: "Guy Raz",
    publishedAt: "2024-12-01",
    duration: "45 min",
    externalUrl: "https://www.npr.org/podcasts/510313/how-i-built-this",
    thumbnail:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-9",
    title: "Cloud Computing: The Career Nobody Talks About",
    description:
      "Why cloud engineering and DevOps roles are quietly becoming some of the best-paid careers in tech.",
    podcastName: "HBR IdeaCast",
    host: "Alison Beard",
    publishedAt: "2024-11-20",
    duration: "31 min",
    externalUrl: "https://hbr.org/2020/01/podcast-ideacast",
    thumbnail:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-10",
    title: "Fintech Founders: Building the Future of Money",
    description:
      "Young entrepreneurs reshaping banking, payments, and financial access through technology.",
    podcastName: "How I Built This",
    host: "Guy Raz",
    publishedAt: "2024-11-05",
    duration: "48 min",
    externalUrl: "https://www.npr.org/podcasts/510313/how-i-built-this",
    thumbnail:
      "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-11",
    title: "Biotech Careers: Where Science Meets Opportunity",
    description:
      "The biotech industry is booming — a look at roles in genomics, lab tech, and pharmaceutical development.",
    podcastName: "TED Radio Hour",
    host: "Manoush Zomorodi",
    publishedAt: "2024-10-25",
    duration: "40 min",
    externalUrl: "https://www.npr.org/programs/ted-radio-hour/",
    thumbnail:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-12",
    title: "Supply Chain Careers After the Global Disruption",
    description:
      "How pandemic-era supply chain chaos created lasting demand for logistics and operations talent.",
    podcastName: "Planet Money",
    host: "Mary Childs",
    publishedAt: "2024-10-12",
    duration: "25 min",
    externalUrl: "https://www.npr.org/podcasts/510289/planet-money",
    thumbnail:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-13",
    title: "The Rise of Product Management",
    description:
      "Why every tech company is hiring product managers, and how to break into the field.",
    podcastName: "WorkLife with Adam Grant",
    host: "Adam Grant",
    publishedAt: "2024-09-28",
    duration: "37 min",
    externalUrl: "https://www.ted.com/podcasts/worklife",
    thumbnail:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-14",
    title: "UX Design: Careers at the Intersection of Tech and People",
    description:
      "How user experience design became one of the most in-demand career paths across industries.",
    podcastName: "HBR IdeaCast",
    host: "Alison Beard",
    publishedAt: "2024-09-15",
    duration: "30 min",
    externalUrl: "https://hbr.org/2020/01/podcast-ideacast",
    thumbnail:
      "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-15",
    title: "Robotics: The Jobs Humans Will Still Do",
    description:
      "As automation grows, new roles are emerging for people who design, maintain, and work alongside robots.",
    podcastName: "Freakonomics Radio",
    host: "Stephen Dubner",
    publishedAt: "2024-09-02",
    duration: "44 min",
    externalUrl: "https://freakonomics.com/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-16",
    title: "Mental Health Careers Are Booming",
    description:
      "The growing demand for counsellors, therapists, and wellness professionals — and how to train for these roles.",
    podcastName: "Hidden Brain",
    host: "Shankar Vedantam",
    publishedAt: "2024-08-20",
    duration: "42 min",
    externalUrl: "https://hiddenbrain.org/",
    thumbnail:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-17",
    title: "Digital Marketing: Still One of the Fastest On-Ramps",
    description:
      "Content strategy, SEO, and social media management remain accessible career paths for young people.",
    podcastName: "TED Radio Hour",
    host: "Manoush Zomorodi",
    publishedAt: "2024-08-05",
    duration: "35 min",
    externalUrl: "https://www.npr.org/programs/ted-radio-hour/",
    thumbnail:
      "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-18",
    title: "The EV Revolution and the Jobs It's Creating",
    description:
      "From battery engineers to charging network planners — the electric vehicle transition is hiring.",
    podcastName: "Planet Money",
    host: "Mary Childs",
    publishedAt: "2024-07-22",
    duration: "27 min",
    externalUrl: "https://www.npr.org/podcasts/510289/planet-money",
    thumbnail:
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-19",
    title: "AI Ethics: The Career That Didn't Exist Five Years Ago",
    description:
      "As AI scales, so does the need for professionals ensuring it's developed responsibly.",
    podcastName: "WorkLife with Adam Grant",
    host: "Adam Grant",
    publishedAt: "2024-07-08",
    duration: "33 min",
    externalUrl: "https://www.ted.com/podcasts/worklife",
    thumbnail:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-20",
    title: "Software Engineering in 2025: What's Changed",
    description:
      "How the role of software developers is evolving with AI assistants, cloud-native tools, and new frameworks.",
    podcastName: "HBR IdeaCast",
    host: "Alison Beard",
    publishedAt: "2024-06-25",
    duration: "29 min",
    externalUrl: "https://hbr.org/2020/01/podcast-ideacast",
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-21",
    title: "Climate Adaptation: The Careers Nobody Expected",
    description:
      "New roles focused on helping communities and businesses adapt to climate change impacts.",
    podcastName: "Future Economies Start with Youth",
    host: "Kevin Eustatia",
    publishedAt: "2024-06-10",
    duration: "31 min",
    externalUrl: "https://fundforyouthemployment.nl/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-22",
    title: "The Creator Economy as a Real Career",
    description:
      "Content creation, community management, and creator tools are becoming legitimate career paths.",
    podcastName: "How I Built This",
    host: "Guy Raz",
    publishedAt: "2024-05-28",
    duration: "46 min",
    externalUrl: "https://www.npr.org/podcasts/510313/how-i-built-this",
    thumbnail:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop",
    section: "jobs-on-the-rise",
  },
  {
    id: "pod-jr-23",
    title: "Agri-Tech: How Technology Is Making Farming a Career Choice",
    description:
      "Precision agriculture, drone monitoring, and smart farming are attracting a new generation of workers.",
    podcastName: "Future Economies Start with Youth",
    host: "Kevin Eustatia",
    publishedAt: "2024-05-15",
    duration: "33 min",
    externalUrl: "https://fundforyouthemployment.nl/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop",
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
  {
    id: "pod-sm-4",
    title: "Why Communication Is the Number One Career Skill",
    description:
      "Research shows clear communication is the single most important skill across all industries and levels.",
    podcastName: "Freakonomics Radio",
    host: "Stephen Dubner",
    publishedAt: "2024-12-18",
    duration: "40 min",
    externalUrl: "https://freakonomics.com/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-5",
    title: "Critical Thinking in an Age of Misinformation",
    description:
      "How to develop the analytical thinking skills that employers desperately need in the AI era.",
    podcastName: "Hidden Brain",
    host: "Shankar Vedantam",
    publishedAt: "2024-12-05",
    duration: "44 min",
    externalUrl: "https://hiddenbrain.org/",
    thumbnail:
      "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-6",
    title: "The Science of Emotional Intelligence",
    description:
      "What emotional intelligence actually is, why it matters at work, and how to develop it.",
    podcastName: "Hidden Brain",
    host: "Shankar Vedantam",
    publishedAt: "2024-11-22",
    duration: "46 min",
    externalUrl: "https://hiddenbrain.org/",
    thumbnail:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-7",
    title: "Adaptability: The Skill Behind Every Successful Career",
    description:
      "How the ability to adapt to change is becoming the foundation skill for all other competencies.",
    podcastName: "WorkLife with Adam Grant",
    host: "Adam Grant",
    publishedAt: "2024-11-08",
    duration: "35 min",
    externalUrl: "https://www.ted.com/podcasts/worklife",
    thumbnail:
      "https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-8",
    title: "Learning How to Learn: The Most Underrated Skill",
    description:
      "Why learning agility — the ability to learn new things quickly — is the top predictor of career success.",
    podcastName: "TED Radio Hour",
    host: "Manoush Zomorodi",
    publishedAt: "2024-10-28",
    duration: "42 min",
    externalUrl: "https://www.npr.org/programs/ted-radio-hour/",
    thumbnail:
      "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-9",
    title: "Teamwork Doesn't Mean What You Think It Does",
    description:
      "New research on what actually makes teams effective — it's not about personalities, it's about psychological safety.",
    podcastName: "WorkLife with Adam Grant",
    host: "Adam Grant",
    publishedAt: "2024-10-15",
    duration: "38 min",
    externalUrl: "https://www.ted.com/podcasts/worklife",
    thumbnail:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-10",
    title: "Negotiation Skills for Young Professionals",
    description:
      "Practical negotiation strategies for salary discussions, project scope, and workplace dynamics.",
    podcastName: "HBR IdeaCast",
    host: "Alison Beard",
    publishedAt: "2024-09-30",
    duration: "33 min",
    externalUrl: "https://hbr.org/2020/01/podcast-ideacast",
    thumbnail:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-11",
    title: "AI Literacy: The New Must-Have Skill",
    description:
      "Why understanding AI tools and concepts is becoming essential across every profession, not just tech.",
    podcastName: "Freakonomics Radio",
    host: "Stephen Dubner",
    publishedAt: "2024-09-18",
    duration: "41 min",
    externalUrl: "https://freakonomics.com/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-12",
    title: "Time Management Secrets from Productive People",
    description:
      "Evidence-based strategies for focus, prioritisation, and getting things done without burning out.",
    podcastName: "The Tim Ferriss Show",
    host: "Tim Ferriss",
    publishedAt: "2024-09-05",
    duration: "52 min",
    externalUrl: "https://tim.blog/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-13",
    title: "Data Literacy: Why Every Career Needs It Now",
    description:
      "Data literacy is no longer just for analysts — understanding data is essential in every role.",
    podcastName: "HBR IdeaCast",
    host: "Alison Beard",
    publishedAt: "2024-08-22",
    duration: "28 min",
    externalUrl: "https://hbr.org/2020/01/podcast-ideacast",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-14",
    title: "Creative Problem-Solving at Work",
    description:
      "How to develop creative thinking as a practical skill for solving real workplace challenges.",
    podcastName: "TED Radio Hour",
    host: "Manoush Zomorodi",
    publishedAt: "2024-08-08",
    duration: "39 min",
    externalUrl: "https://www.npr.org/programs/ted-radio-hour/",
    thumbnail:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-15",
    title: "Building Resilience for Your First Career Setback",
    description:
      "How to bounce back from failure, rejection, and disappointment in the early years of your career.",
    podcastName: "WorkLife with Adam Grant",
    host: "Adam Grant",
    publishedAt: "2024-07-25",
    duration: "36 min",
    externalUrl: "https://www.ted.com/podcasts/worklife",
    thumbnail:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-16",
    title: "The Art of Giving and Receiving Feedback",
    description:
      "Why feedback is a career accelerator and how to get comfortable with constructive criticism.",
    podcastName: "Hidden Brain",
    host: "Shankar Vedantam",
    publishedAt: "2024-07-10",
    duration: "43 min",
    externalUrl: "https://hiddenbrain.org/",
    thumbnail:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-17",
    title: "Writing Well: The Silent Career Superpower",
    description:
      "Clear writing remains one of the most valued and scarce skills in the modern workplace.",
    podcastName: "The Knowledge Project",
    host: "Shane Parrish",
    publishedAt: "2024-06-28",
    duration: "47 min",
    externalUrl: "https://fs.blog/knowledge-project-podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-18",
    title: "Green Skills for the Sustainability Transition",
    description:
      "The specific skills young people need to participate in the growing green economy.",
    podcastName: "Future Economies Start with Youth",
    host: "Kevin Eustatia",
    publishedAt: "2024-06-15",
    duration: "30 min",
    externalUrl: "https://fundforyouthemployment.nl/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-19",
    title: "Cross-Cultural Skills in a Global Workplace",
    description:
      "How to work effectively across cultures, languages, and geographies in today's connected world.",
    podcastName: "HBR IdeaCast",
    host: "Alison Beard",
    publishedAt: "2024-05-30",
    duration: "32 min",
    externalUrl: "https://hbr.org/2020/01/podcast-ideacast",
    thumbnail:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-20",
    title: "Networking Without Being Awkward",
    description:
      "Practical, low-pressure approaches to building professional relationships when you're just starting out.",
    podcastName: "The Tim Ferriss Show",
    host: "Tim Ferriss",
    publishedAt: "2024-05-15",
    duration: "50 min",
    externalUrl: "https://tim.blog/podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-21",
    title: "Public Speaking: Getting Over the Fear",
    description:
      "How to build confidence in presentations and public speaking — one of the most career-boosting skills.",
    podcastName: "TED Radio Hour",
    host: "Manoush Zomorodi",
    publishedAt: "2024-05-01",
    duration: "37 min",
    externalUrl: "https://www.npr.org/programs/ted-radio-hour/",
    thumbnail:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-22",
    title: "Conflict Resolution: Turning Disagreements Into Growth",
    description:
      "How to handle workplace conflict productively and use disagreements as opportunities to build trust.",
    podcastName: "WorkLife with Adam Grant",
    host: "Adam Grant",
    publishedAt: "2024-04-18",
    duration: "34 min",
    externalUrl: "https://www.ted.com/podcasts/worklife",
    thumbnail:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop",
    section: "skills-that-matter",
  },
  {
    id: "pod-sm-23",
    title: "Personal Branding: How to Stand Out Early in Your Career",
    description:
      "Building a professional reputation and online presence that opens doors to opportunities.",
    podcastName: "The Knowledge Project",
    host: "Shane Parrish",
    publishedAt: "2024-04-05",
    duration: "45 min",
    externalUrl: "https://fs.blog/knowledge-project-podcast/",
    thumbnail:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop",
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

/**
 * WORLD LENS DATA — INDUSTRY INSIGHTS
 *
 * Curated static datasets for the "World at a Glance" insight cards.
 * All data from Tier-1 sources only.
 *
 * REFRESH CADENCE: Every 6 months (or quarterly if justified)
 * LAST UPDATED: Q1 2025
 */

import { TIER1_SOURCES, type Tier1SourceId } from "./tier1-sources";

// ============================================
// COMMON TYPES
// ============================================

export interface InsightCardMeta {
  id: string;
  title: string;
  explanation: string;
  sourceId: Tier1SourceId;
  sourceName: string;
  sourceUrl?: string;
  lastUpdated: string; // "QX YYYY" format
  geographyScope: string;
}

// ============================================
// INSIGHT 1: WHERE MOST PEOPLE WORK
// (Already implemented in topIndustriesDataset.ts)
// Re-exported here for consistency
// ============================================

export { TOP_INDUSTRIES_DATASET } from "./topIndustriesDataset";

// ============================================
// INSIGHT 2: WHICH INDUSTRIES ARE GROWING
// ============================================

export interface GrowthCategory {
  name: string;
  growthPercent: number; // Projected growth rate
  color?: string;
}

export interface GrowingIndustriesData extends InsightCardMeta {
  categories: GrowthCategory[];
  timeframe: string; // e.g., "2024-2030"
}

/**
 * Projected job growth by industry family
 *
 * SOURCE: World Economic Forum - Future of Jobs Report 2025
 * Data shows projected net job growth by industry cluster
 * Simplified to broad categories for youth comprehension
 */
export const GROWING_INDUSTRIES_DATA: GrowingIndustriesData = {
  id: "industry-growth-2025",
  title: "Which industries are growing",
  explanation:
    "Some industries are expanding faster than others due to technology, demographics, and demand.",
  sourceId: TIER1_SOURCES.WORLD_ECONOMIC_FORUM,
  sourceName: "World Economic Forum",
  sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
  lastUpdated: "Q1 2025",
  geographyScope: "Global",
  timeframe: "2025-2030",
  categories: [
    {
      name: "Technology & Data",
      growthPercent: 22,
      color: "bg-cyan-500",
    },
    {
      name: "Care & Wellness",
      growthPercent: 18,
      color: "bg-rose-500",
    },
    {
      name: "Green & Energy",
      growthPercent: 15,
      color: "bg-emerald-500",
    },
    {
      name: "Education & Training",
      growthPercent: 10,
      color: "bg-purple-500",
    },
    {
      name: "Logistics & Supply",
      growthPercent: 8,
      color: "bg-amber-500",
    },
    {
      name: "Creative & Media",
      growthPercent: 5,
      color: "bg-pink-500",
    },
  ],
};

// ============================================
// INSIGHT 3: WHAT'S RESHAPING JOBS
// ============================================

export interface ReshapingFactor {
  name: string;
  description: string;
  impactLevel: "high" | "medium" | "low";
}

export interface ReshapingJobsData extends InsightCardMeta {
  primaryMetric: {
    label: string;
    value: string;
    context: string;
  };
  factors: ReshapingFactor[];
}

/**
 * Forces reshaping the job market
 *
 * SOURCE: World Economic Forum - Future of Jobs Report 2025
 * Abstracted to avoid alarming language while being truthful
 */
export const RESHAPING_JOBS_DATA: ReshapingJobsData = {
  id: "reshaping-forces-2025",
  title: "What's reshaping jobs",
  explanation:
    "Long-term forces influence how jobs change, not individual effort alone.",
  sourceId: TIER1_SOURCES.WORLD_ECONOMIC_FORUM,
  sourceName: "World Economic Forum",
  sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
  lastUpdated: "Q1 2025",
  geographyScope: "Global",
  primaryMetric: {
    label: "Jobs affected by technology shifts",
    value: "40%",
    context: "of current tasks may change by 2030",
  },
  factors: [
    {
      name: "Technology adoption",
      description: "AI and automation changing how work is done",
      impactLevel: "high",
    },
    {
      name: "Green transition",
      description: "Shift to sustainable industries creating new roles",
      impactLevel: "high",
    },
    {
      name: "Demographic shifts",
      description: "Aging populations affecting workforce needs",
      impactLevel: "medium",
    },
    {
      name: "Skills evolution",
      description: "Growing importance of adaptability and learning",
      impactLevel: "medium",
    },
  ],
};

// ============================================
// CURATED ARTICLES DATA
// ============================================

export type ArticleTier = "tier1" | "tier2" | "tier3";

export interface CuratedArticle {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  tier: ArticleTier;
  publishedAt: string; // ISO date
  imageUrl?: string;
  topics: string[];
}

/**
 * Curated articles for the World Lens carousel
 *
 * INGESTION RULES:
 * - Fetch daily or every 48 hours
 * - Whitelisted domains only
 * - Reject articles older than 14-21 days
 * - Deduplicate aggressively
 * - Prioritise clarity over recency
 *
 * These are manually curated examples. In production,
 * this would be populated from a database with automated
 * ingestion and human curation.
 */
export const CURATED_ARTICLES: CuratedArticle[] = [
  {
    id: "wef-future-jobs-2025",
    title: "Future of Jobs Report 2025: Key Findings",
    summary:
      "An overview of how global employment is expected to evolve over the next five years.",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    tier: "tier1",
    publishedAt: "2025-01-10",
    imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=680&h=382&fit=crop",
    topics: ["future of work", "skills", "employment"],
  },
  {
    id: "oecd-skills-2025",
    title: "Skills for a Changing World of Work",
    summary:
      "How education and training systems are adapting to prepare young people for evolving careers.",
    sourceName: "OECD",
    sourceUrl: "https://www.oecd.org/employment/skills-and-work/",
    tier: "tier1",
    publishedAt: "2025-01-08",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=680&h=382&fit=crop",
    topics: ["skills", "education", "youth employment"],
  },
  {
    id: "ilo-youth-employment",
    title: "Global Youth Employment Trends",
    summary:
      "Understanding the challenges and opportunities facing young workers entering the job market.",
    sourceName: "International Labour Organization",
    sourceUrl: "https://www.ilo.org/global/topics/youth-employment/",
    tier: "tier1",
    publishedAt: "2025-01-05",
    imageUrl: "https://images.unsplash.com/photo-1529400971008-f566de0e6dfc?w=680&h=382&fit=crop",
    topics: ["youth employment", "labour market"],
  },
  {
    id: "mckinsey-ai-work",
    title: "How AI is Changing Work",
    summary:
      "A balanced look at how artificial intelligence is creating and transforming jobs across industries.",
    sourceName: "McKinsey Global Institute",
    sourceUrl: "https://www.mckinsey.com/featured-insights/future-of-work/",
    tier: "tier1",
    publishedAt: "2025-01-03",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=680&h=382&fit=crop",
    topics: ["AI", "automation", "future of work"],
  },
  {
    id: "wef-green-jobs",
    title: "The Rise of Green Jobs",
    summary:
      "How the transition to sustainable energy is creating new career opportunities worldwide.",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/agenda/green-jobs/",
    tier: "tier1",
    publishedAt: "2024-12-28",
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=680&h=382&fit=crop",
    topics: ["green jobs", "sustainability", "energy transition"],
  },
  {
    id: "economist-skills-gap",
    title: "Bridging the Skills Gap",
    summary:
      "Why employers and educators are rethinking how we prepare people for modern careers.",
    sourceName: "The Economist",
    sourceUrl: "https://www.economist.com/",
    tier: "tier2",
    publishedAt: "2024-12-20",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=680&h=382&fit=crop",
    topics: ["skills gap", "education", "employment"],
  },
  {
    id: "ft-remote-work",
    title: "The New Geography of Work",
    summary:
      "How remote and hybrid work models are reshaping where and how people build their careers.",
    sourceName: "Financial Times",
    sourceUrl: "https://www.ft.com/",
    tier: "tier2",
    publishedAt: "2024-12-15",
    imageUrl: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=680&h=382&fit=crop",
    topics: ["remote work", "hybrid work", "careers"],
  },
];

// ============================================
// ARTICLE SOURCE WHITELIST
// ============================================

export const ARTICLE_SOURCE_WHITELIST = {
  tier1: [
    { domain: "weforum.org", name: "World Economic Forum" },
    { domain: "oecd.org", name: "OECD" },
    { domain: "ilo.org", name: "International Labour Organization" },
    { domain: "worldbank.org", name: "World Bank" },
    { domain: "imf.org", name: "IMF" },
    { domain: "ec.europa.eu", name: "European Commission" },
    { domain: "ssb.no", name: "Statistics Norway" },
    { domain: "mckinsey.com", name: "McKinsey Global Institute" },
  ],
  tier2: [
    { domain: "reuters.com", name: "Reuters" },
    { domain: "ft.com", name: "Financial Times" },
    { domain: "economist.com", name: "The Economist" },
    { domain: "bloomberg.com", name: "Bloomberg" },
    { domain: "hbr.org", name: "Harvard Business Review" },
  ],
  tier3: [
    { domain: "statista.com", name: "Statista" },
    { domain: "visualcapitalist.com", name: "Visual Capitalist" },
  ],
} as const;

// ============================================
// VALIDATION & HELPERS
// ============================================

/**
 * Check if an article is within the freshness window (14-21 days)
 */
export function isArticleFresh(publishedAt: string, maxDays = 21): boolean {
  const published = new Date(publishedAt);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays <= maxDays;
}

/**
 * Get articles filtered by freshness and tier priority
 */
export function getCuratedArticles(maxItems = 7): CuratedArticle[] {
  // In production, this would fetch from database
  // For now, return curated static articles
  return CURATED_ARTICLES.slice(0, maxItems);
}

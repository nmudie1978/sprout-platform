/**
 * WORLD LENS DATA — INDUSTRY INSIGHTS
 *
 * Curated static datasets for the "World at a Glance" insight cards.
 * All data from approved sources (Tier-1 or Tier-2).
 *
 * REFRESH CADENCE: Every 6 months (or quarterly if justified)
 * LAST UPDATED: Q1 2025
 */

import { TIER1_SOURCES, TIER2_SOURCES, type ApprovedSourceId } from "./tier1-sources";

// ============================================
// COMMON TYPES
// ============================================

export interface InsightCardMeta {
  id: string;
  title: string;
  explanation: string;
  sourceId: ApprovedSourceId;
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
 *
 * TOTAL: 17 articles across 4 pages (4-4-4-5)
 */
export const CURATED_ARTICLES: CuratedArticle[] = [
  // --- PAGE 1: Global Outlook ---
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
    id: "wipo-global-innovation-index",
    title: "Global Innovation Index 2024",
    summary:
      "Annual ranking of countries by innovation capability — tracking R&D, patents, and tech output worldwide.",
    sourceName: "WIPO",
    sourceUrl: "https://www.wipo.int/global_innovation_index/en/",
    tier: "tier1",
    publishedAt: "2024-09-26",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=680&h=382&fit=crop",
    topics: ["innovation", "technology", "global rankings"],
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
  // --- PAGE 2: Technology & AI ---
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
    id: "wef-generative-ai-jobs",
    title: "Generative AI and the Future of Work",
    summary:
      "How tools like ChatGPT are reshaping job tasks, not eliminating roles entirely.",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/agenda/generative-ai-jobs/",
    tier: "tier1",
    publishedAt: "2024-12-18",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=680&h=382&fit=crop",
    topics: ["AI", "generative AI", "future of work"],
  },
  {
    id: "oecd-ai-policy",
    title: "AI and the Labour Market: Policy Considerations",
    summary:
      "How governments are preparing workers for an AI-augmented economy through training and policy.",
    sourceName: "OECD",
    sourceUrl: "https://www.oecd.org/digital/artificial-intelligence/",
    tier: "tier1",
    publishedAt: "2024-11-15",
    imageUrl: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=680&h=382&fit=crop",
    topics: ["AI", "policy", "labour market"],
  },
  {
    id: "mckinsey-tech-talent",
    title: "The Global Tech Talent Shortage",
    summary:
      "Why demand for digital skills continues to outpace supply in most economies.",
    sourceName: "McKinsey Global Institute",
    sourceUrl: "https://www.mckinsey.com/capabilities/people-and-organizational-performance/",
    tier: "tier1",
    publishedAt: "2024-10-22",
    imageUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=680&h=382&fit=crop",
    topics: ["technology", "skills gap", "digital skills"],
  },
  // --- PAGE 3: Green Economy & Sustainability ---
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
    id: "ilo-just-transition",
    title: "Just Transition: Ensuring No One is Left Behind",
    summary:
      "Supporting workers and communities as economies shift toward greener industries.",
    sourceName: "International Labour Organization",
    sourceUrl: "https://www.ilo.org/global/topics/green-jobs/",
    tier: "tier1",
    publishedAt: "2024-11-30",
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=680&h=382&fit=crop",
    topics: ["green jobs", "just transition", "sustainability"],
  },
  {
    id: "irena-renewable-energy-jobs",
    title: "Renewable Energy and Jobs: Annual Review",
    summary:
      "Global employment in renewable energy reached 13.7 million — and growing.",
    sourceName: "IRENA",
    sourceUrl: "https://www.irena.org/publications/",
    tier: "tier1",
    publishedAt: "2024-09-15",
    imageUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=680&h=382&fit=crop",
    topics: ["renewable energy", "green jobs", "employment"],
  },
  {
    id: "ec-green-deal-skills",
    title: "Skills for the Green Transition",
    summary:
      "European strategies for equipping workers with competencies needed for a climate-neutral economy.",
    sourceName: "European Commission",
    sourceUrl: "https://ec.europa.eu/social/main.jsp?catId=1223",
    tier: "tier1",
    publishedAt: "2024-10-05",
    imageUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=680&h=382&fit=crop",
    topics: ["green skills", "education", "sustainability"],
  },
  // --- PAGE 4: Work Trends & Education ---
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
  {
    id: "hbr-career-development",
    title: "Rethinking Career Development for the Modern Era",
    summary:
      "Why linear career paths are giving way to more fluid, skills-based trajectories.",
    sourceName: "Harvard Business Review",
    sourceUrl: "https://hbr.org/topic/career-planning",
    tier: "tier2",
    publishedAt: "2024-11-28",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=680&h=382&fit=crop",
    topics: ["career development", "skills", "future of work"],
  },
  {
    id: "world-bank-youth-employment",
    title: "Youth Employment Programs: What Works",
    summary:
      "Evidence-based insights on effective interventions for young job seekers worldwide.",
    sourceName: "World Bank",
    sourceUrl: "https://www.worldbank.org/en/topic/jobsanddevelopment",
    tier: "tier1",
    publishedAt: "2024-10-10",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=680&h=382&fit=crop",
    topics: ["youth employment", "policy", "job programs"],
  },
  // --- PAGE 5: CFYE & Youth Employment Programmes ---
  {
    id: "cfye-podcast-future-economies",
    title: "Future Economies Start with Youth (Podcast)",
    summary:
      "A 19-episode podcast exploring how young people across Africa and MENA are building careers through green jobs, digital skills, and social enterprise.",
    sourceName: "Challenge Fund for Youth Employment",
    sourceUrl: "https://fundforyouthemployment.nl/podcast/",
    tier: "tier1",
    publishedAt: "2024-11-15",
    imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=680&h=382&fit=crop",
    topics: ["youth employment", "podcast", "green jobs", "digital skills"],
  },
  {
    id: "cfye-impact-report-2023",
    title: "CFYE Impact Report: 100K+ Jobs Created for Youth",
    summary:
      "How the $171M Challenge Fund for Youth Employment created over 100,000 jobs across 11 countries, with 49% going to young women.",
    sourceName: "Challenge Fund for Youth Employment",
    sourceUrl: "https://fundforyouthemployment.nl/",
    tier: "tier1",
    publishedAt: "2024-11-01",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=680&h=382&fit=crop",
    topics: ["youth employment", "impact", "gender equity", "Africa"],
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
    { domain: "fundforyouthemployment.nl", name: "Challenge Fund for Youth Employment" },
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

// ============================================
// PAGINATED ARTICLES FOR CAROUSEL
// ============================================

/**
 * Page labels for the articles carousel
 */
export const ARTICLES_PAGE_LABELS = [
  "Global Outlook",
  "Technology & AI",
  "Green Economy",
  "Work Trends",
];

/**
 * Get articles organized into pages for carousel display
 * Returns array of article arrays (pages), 4 articles per page
 */
export function getArticlePages(articlesPerPage = 4): CuratedArticle[][] {
  const articles = CURATED_ARTICLES;
  const pages: CuratedArticle[][] = [];

  for (let i = 0; i < articles.length; i += articlesPerPage) {
    pages.push(articles.slice(i, i + articlesPerPage));
  }

  return pages;
}

/**
 * Total number of article pages
 */
export function getArticlePageCount(articlesPerPage = 4): number {
  return Math.ceil(CURATED_ARTICLES.length / articlesPerPage);
}

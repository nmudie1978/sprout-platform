/**
 * INDUSTRY INSIGHTS - GLOBAL CONTENT CONSTITUTION
 *
 * This module defines the ONLY approved sources for Industry Insights.
 *
 * CORE PRINCIPLE:
 * Industry Insights must be credible, calm, educational, long-term relevant,
 * and understandable by a 16-20 year old. Trusted by parents, schools, educators.
 *
 * Industry Insights are NOT: news feeds, blog aggregators, opinion content,
 * influencer commentary, or "latest headlines".
 *
 * RULES:
 * - Each industry may ONLY use sources from its Tier-1 whitelist
 * - If a source is not whitelisted for that industry, it MUST NOT be used
 * - All content must be summarised, rewritten in plain language
 * - No raw content, feeds, or verbatim text
 * - No hype language
 *
 * UPDATE CADENCE: Monthly or quarterly. No daily refresh.
 * Timeless relevance > freshness.
 */

// ============================================
// TIER-1 SOURCE ENUM - GLOBAL SOURCES
// ============================================

export const TIER1_SOURCES = {
  // Global research & policy bodies
  WORLD_ECONOMIC_FORUM: "world_economic_forum",
  OECD: "oecd",
  WORLD_BANK: "world_bank",
  WHO: "who",
  ILO: "ilo",
  UNESCO: "unesco",

  // Consulting & analysis firms
  MCKINSEY: "mckinsey",
  BCG: "bcg",
  DELOITTE: "deloitte",

  // Visual publishers
  VISUAL_CAPITALIST: "visual_capitalist",
} as const;

export type Tier1SourceId = (typeof TIER1_SOURCES)[keyof typeof TIER1_SOURCES];

// ============================================
// SOURCE METADATA
// ============================================

export interface Tier1SourceMeta {
  id: Tier1SourceId;
  name: string;
  shortName: string;
  url: string;
  domain: string;
  description: string;
  useCases: string[];
  category: "research" | "consulting" | "visual";
}

export const TIER1_SOURCE_METADATA: Record<Tier1SourceId, Tier1SourceMeta> = {
  // Global Research & Policy Bodies
  [TIER1_SOURCES.WORLD_ECONOMIC_FORUM]: {
    id: TIER1_SOURCES.WORLD_ECONOMIC_FORUM,
    name: "World Economic Forum",
    shortName: "WEF",
    url: "https://www.weforum.org",
    domain: "weforum.org",
    description: "Global insights on jobs, skills, and economic trends",
    useCases: [
      "Future of Jobs insights",
      "skills demand",
      "automation and AI impact",
      "global workforce trends",
      "industry transformation",
    ],
    category: "research",
  },
  [TIER1_SOURCES.OECD]: {
    id: TIER1_SOURCES.OECD,
    name: "Organisation for Economic Co-operation and Development",
    shortName: "OECD",
    url: "https://www.oecd.org",
    domain: "oecd.org",
    description: "International economic and social policy research",
    useCases: [
      "employment statistics",
      "education outcomes",
      "skills policy",
      "labour market analysis",
      "economic outlook",
    ],
    category: "research",
  },
  [TIER1_SOURCES.WORLD_BANK]: {
    id: TIER1_SOURCES.WORLD_BANK,
    name: "World Bank",
    shortName: "World Bank",
    url: "https://www.worldbank.org",
    domain: "worldbank.org",
    description: "Global development and economic research",
    useCases: [
      "global economic trends",
      "development indicators",
      "employment data",
      "skills development",
    ],
    category: "research",
  },
  [TIER1_SOURCES.WHO]: {
    id: TIER1_SOURCES.WHO,
    name: "World Health Organization",
    shortName: "WHO",
    url: "https://www.who.int",
    domain: "who.int",
    description: "Global health workforce and healthcare research",
    useCases: [
      "healthcare workforce trends",
      "health sector employment",
      "medical skills demand",
      "global health outlook",
    ],
    category: "research",
  },
  [TIER1_SOURCES.ILO]: {
    id: TIER1_SOURCES.ILO,
    name: "International Labour Organization",
    shortName: "ILO",
    url: "https://www.ilo.org",
    domain: "ilo.org",
    description: "Global labour standards and employment research",
    useCases: [
      "labour market trends",
      "decent work indicators",
      "skills development",
      "youth employment",
      "trade skills",
    ],
    category: "research",
  },
  [TIER1_SOURCES.UNESCO]: {
    id: TIER1_SOURCES.UNESCO,
    name: "United Nations Educational, Scientific and Cultural Organization",
    shortName: "UNESCO",
    url: "https://www.unesco.org",
    domain: "unesco.org",
    description: "Global education and skills development research",
    useCases: [
      "education trends",
      "skills for the future",
      "technical and vocational education",
      "lifelong learning",
    ],
    category: "research",
  },

  // Consulting & Analysis Firms
  [TIER1_SOURCES.MCKINSEY]: {
    id: TIER1_SOURCES.MCKINSEY,
    name: "McKinsey & Company",
    shortName: "McKinsey",
    url: "https://www.mckinsey.com",
    domain: "mckinsey.com",
    description: "Authoritative research on business, technology, and workforce",
    useCases: [
      "technology research",
      "AI impact analysis",
      "work and skills research",
      "long-term market analysis",
      "workforce transformation",
    ],
    category: "consulting",
  },
  [TIER1_SOURCES.BCG]: {
    id: TIER1_SOURCES.BCG,
    name: "Boston Consulting Group",
    shortName: "BCG",
    url: "https://www.bcg.com",
    domain: "bcg.com",
    description: "Strategic workforce and industry analysis",
    useCases: [
      "workforce strategy",
      "skills transformation",
      "industry trends",
      "future of work",
    ],
    category: "consulting",
  },
  [TIER1_SOURCES.DELOITTE]: {
    id: TIER1_SOURCES.DELOITTE,
    name: "Deloitte Insights",
    shortName: "Deloitte",
    url: "https://www2.deloitte.com/insights",
    domain: "deloitte.com",
    description: "Long-term workforce and skills analysis",
    useCases: [
      "workforce trends",
      "skills analysis",
      "industry outlook",
      "technology impact",
    ],
    category: "consulting",
  },

  // Visual Publishers
  [TIER1_SOURCES.VISUAL_CAPITALIST]: {
    id: TIER1_SOURCES.VISUAL_CAPITALIST,
    name: "Visual Capitalist",
    shortName: "Visual Capitalist",
    url: "https://www.visualcapitalist.com",
    domain: "visualcapitalist.com",
    description: "Data-driven visual content on global macro trends",
    useCases: [
      "macro trends",
      "rankings",
      "visual explanations",
      "job growth",
      "skills analysis",
      "industry shifts",
    ],
    category: "visual",
  },
};

// ============================================
// INDUSTRY-SPECIFIC SOURCE WHITELISTS
// ============================================

/**
 * Each industry has its own subset of approved Tier-1 sources.
 * An industry may ONLY use sources from its whitelist.
 */
export type IndustryCategory =
  | "technology"
  | "healthcare"
  | "trades"
  | "finance"
  | "education"
  | "logistics"
  | "creative"
  | "general";

export interface IndustrySourceWhitelist {
  industry: IndustryCategory;
  name: string;
  description: string;
  allowedSources: Tier1SourceId[];
  notes?: string;
}

export const INDUSTRY_SOURCE_WHITELISTS: Record<IndustryCategory, IndustrySourceWhitelist> = {
  technology: {
    industry: "technology",
    name: "Technology / IT",
    description: "Software, hardware, IT services, digital industries",
    allowedSources: [
      TIER1_SOURCES.VISUAL_CAPITALIST,
      TIER1_SOURCES.WORLD_ECONOMIC_FORUM,
      TIER1_SOURCES.MCKINSEY,
      TIER1_SOURCES.BCG,
      TIER1_SOURCES.DELOITTE,
    ],
    notes: "Focus on AI, automation, skills demand, digital transformation",
  },
  healthcare: {
    industry: "healthcare",
    name: "Healthcare / Medicine",
    description: "Medical, nursing, health services, pharmaceuticals",
    allowedSources: [
      TIER1_SOURCES.WHO,
      TIER1_SOURCES.OECD,
      TIER1_SOURCES.WORLD_ECONOMIC_FORUM,
      TIER1_SOURCES.MCKINSEY,
    ],
    notes: "WHO is primary for healthcare workforce. Use OECD for comparative data.",
  },
  trades: {
    industry: "trades",
    name: "Trades / Construction",
    description: "Skilled trades, construction, manufacturing, maintenance",
    allowedSources: [
      TIER1_SOURCES.OECD,
      TIER1_SOURCES.ILO,
      TIER1_SOURCES.WORLD_ECONOMIC_FORUM,
      TIER1_SOURCES.DELOITTE,
    ],
    notes: "ILO is primary for trade skills and labour standards",
  },
  finance: {
    industry: "finance",
    name: "Finance / Economics",
    description: "Banking, accounting, insurance, financial services",
    allowedSources: [
      TIER1_SOURCES.WORLD_BANK,
      TIER1_SOURCES.OECD,
      TIER1_SOURCES.WORLD_ECONOMIC_FORUM,
      TIER1_SOURCES.MCKINSEY,
      TIER1_SOURCES.DELOITTE,
    ],
    notes: "World Bank for macro economics, OECD for policy analysis",
  },
  education: {
    industry: "education",
    name: "Education",
    description: "Teaching, training, educational services",
    allowedSources: [
      TIER1_SOURCES.UNESCO,
      TIER1_SOURCES.OECD,
      TIER1_SOURCES.WORLD_ECONOMIC_FORUM,
    ],
    notes: "UNESCO is primary for education trends and policy",
  },
  logistics: {
    industry: "logistics",
    name: "Logistics / Supply Chain",
    description: "Transport, shipping, warehousing, supply chain",
    allowedSources: [
      TIER1_SOURCES.WORLD_ECONOMIC_FORUM,
      TIER1_SOURCES.OECD,
      TIER1_SOURCES.WORLD_BANK,
      TIER1_SOURCES.MCKINSEY,
    ],
    notes: "WEF for global supply chain insights, OECD for trade data",
  },
  creative: {
    industry: "creative",
    name: "Creative Industries",
    description: "Design, media, arts, entertainment",
    allowedSources: [
      TIER1_SOURCES.OECD,
      TIER1_SOURCES.UNESCO,
      TIER1_SOURCES.WORLD_ECONOMIC_FORUM,
      TIER1_SOURCES.VISUAL_CAPITALIST,
    ],
    notes: "UNESCO for cultural industries, OECD for creative economy data",
  },
  general: {
    industry: "general",
    name: "General / Cross-Industry",
    description: "Insights that apply across multiple industries",
    allowedSources: [
      TIER1_SOURCES.WORLD_ECONOMIC_FORUM,
      TIER1_SOURCES.OECD,
      TIER1_SOURCES.MCKINSEY,
      TIER1_SOURCES.VISUAL_CAPITALIST,
      TIER1_SOURCES.BCG,
      TIER1_SOURCES.DELOITTE,
    ],
    notes: "For cross-cutting skills, work trends, and macro insights",
  },
};

// ============================================
// EXPLICITLY DISALLOWED SOURCES
// ============================================

/**
 * These sources are NEVER permitted in Industry Insights.
 * This list is comprehensive and must be enforced.
 */
export const DISALLOWED_SOURCES = [
  // News websites
  "techcrunch",
  "wired",
  "mashable",
  "theverge",
  "cnn",
  "bbc",
  "reuters",
  "bloomberg",
  "forbes",
  "fortune",
  "businessinsider",

  // Tech/industry blogs
  "medium",
  "substack",
  "hackernews",
  "hacker news",

  // Social media
  "reddit",
  "twitter",
  "x.com",
  "facebook",
  "instagram",
  "tiktok",

  // LinkedIn (including Pulse)
  "linkedin",
  "linkedin.com/pulse",

  // YouTube and video platforms
  "youtube",
  "vimeo",

  // Online learning platforms (as sources, not resources)
  "skillshare",
  "udemy",
  "coursera",
  "edx",

  // Government statistics (too granular/regional)
  "bls.gov",
  "bureau of labor statistics",
  "eia.gov",

  // Norwegian regional sources
  "nav.no",
  "nho.no",
  "abelia",
  "ssb",
  "ssb.no",
  "virke",
  "ikt-norge",
  "kreativt forum",

  // Company blogs and marketing
  "adobe",
  "microsoft",
  "google",
  "amazon",
  "apple",

  // Podcasts as primary sources
  "podcast",
  "spotify",

  // RSS and news aggregators
  "rss",
  "feed",
  "aggregator",

  // Regional industry bodies (too specific)
  "irena",
] as const;

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Check if a source ID is a valid Tier-1 source
 */
export function isTier1Source(sourceId: string): sourceId is Tier1SourceId {
  return Object.values(TIER1_SOURCES).includes(sourceId as Tier1SourceId);
}

/**
 * Get Tier-1 source metadata by ID
 * Returns null if source is not Tier-1
 */
export function getTier1Source(sourceId: string): Tier1SourceMeta | null {
  if (!isTier1Source(sourceId)) {
    return null;
  }
  return TIER1_SOURCE_METADATA[sourceId];
}

/**
 * Check if a source is allowed for a specific industry
 */
export function isSourceAllowedForIndustry(
  sourceId: string,
  industry: IndustryCategory
): boolean {
  if (!isTier1Source(sourceId)) {
    return false;
  }
  const whitelist = INDUSTRY_SOURCE_WHITELISTS[industry];
  return whitelist.allowedSources.includes(sourceId as Tier1SourceId);
}

/**
 * Get allowed sources for an industry
 */
export function getAllowedSourcesForIndustry(
  industry: IndustryCategory
): Tier1SourceMeta[] {
  const whitelist = INDUSTRY_SOURCE_WHITELISTS[industry];
  return whitelist.allowedSources.map((id) => TIER1_SOURCE_METADATA[id]);
}

/**
 * Check if a source string contains disallowed sources
 * Returns the disallowed source if found, null otherwise
 */
export function containsDisallowedSource(sourceText: string): string | null {
  const lowerText = sourceText.toLowerCase();
  for (const disallowed of DISALLOWED_SOURCES) {
    if (lowerText.includes(disallowed)) {
      return disallowed;
    }
  }
  return null;
}

/**
 * Validate a source URL against Tier-1 domains
 */
export function isValidTier1Url(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    for (const source of Object.values(TIER1_SOURCE_METADATA)) {
      if (hostname.includes(source.domain)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Get the Tier-1 source from a URL
 */
export function getSourceFromUrl(url: string): Tier1SourceMeta | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    for (const source of Object.values(TIER1_SOURCE_METADATA)) {
      if (hostname.includes(source.domain)) {
        return source;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================
// SOURCE VALIDATION RESULT
// ============================================

export interface SourceValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate source metadata object
 * Used when creating or updating insights
 */
export function validateSourceMeta(
  sourceMeta: {
    sourceId: string;
    urls?: string[];
    provider?: string;
  },
  industry?: IndustryCategory
): SourceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check source ID is Tier-1
  if (!isTier1Source(sourceMeta.sourceId)) {
    errors.push(
      `Source "${sourceMeta.sourceId}" is not a Tier-1 source. ` +
        `Allowed sources: ${Object.values(TIER1_SOURCES).join(", ")}`
    );
  } else if (industry) {
    // Check source is allowed for the specific industry
    if (!isSourceAllowedForIndustry(sourceMeta.sourceId, industry)) {
      const allowed = getAllowedSourcesForIndustry(industry)
        .map((s) => s.shortName)
        .join(", ");
      errors.push(
        `Source "${sourceMeta.sourceId}" is not allowed for ${industry}. ` +
          `Allowed sources for ${industry}: ${allowed}`
      );
    }
  }

  // Check provider name for disallowed sources
  if (sourceMeta.provider) {
    const disallowed = containsDisallowedSource(sourceMeta.provider);
    if (disallowed) {
      errors.push(
        `Provider "${sourceMeta.provider}" contains disallowed source: ${disallowed}`
      );
    }
  }

  // Check URLs are from Tier-1 domains
  if (sourceMeta.urls && sourceMeta.urls.length > 0) {
    for (const url of sourceMeta.urls) {
      if (!isValidTier1Url(url)) {
        errors.push(`URL "${url}" is not from a Tier-1 source domain`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// ATTRIBUTION FORMATTING
// ============================================

/**
 * Format attribution text for an insight
 * Uses approved phrasing patterns
 */
export function formatAttribution(
  sourceId: Tier1SourceId,
  context?: "summary" | "detail" | "footer"
): string {
  const source = TIER1_SOURCE_METADATA[sourceId];

  const phrases = {
    summary: `Based on research from ${source.name}`,
    detail: `According to analysis from ${source.name}`,
    footer: `Source: ${source.name}`,
  };

  return phrases[context || "footer"];
}

/**
 * Get attribution link for a Tier-1 source
 */
export function getAttributionLink(sourceId: Tier1SourceId): string {
  const source = TIER1_SOURCE_METADATA[sourceId];
  return source.url;
}

// ============================================
// CONTENT TONE VALIDATION
// ============================================

/**
 * Words to avoid (hype language)
 */
const HYPE_WORDS = [
  "exploding",
  "game-changing",
  "must-learn",
  "guaranteed",
  "guaranteed future",
  "top salary",
  "top salaries",
  "revolutionary",
  "disruptive",
  "unprecedented",
  "massive",
  "insane",
  "crazy",
  "hot",
  "fire",
  "future-proof",
  "must-have",
  "skyrocketing",
  "booming",
] as const;

/**
 * Approved neutral alternatives
 */
const APPROVED_ALTERNATIVES: Record<string, string> = {
  exploding: "growing",
  "game-changing": "changing",
  "must-learn": "in demand",
  guaranteed: "commonly",
  "guaranteed future": "growing field",
  "top salary": "competitive pay",
  "top salaries": "competitive salaries",
  revolutionary: "significant",
  disruptive: "transformative",
  unprecedented: "notable",
  massive: "substantial",
  insane: "strong",
  crazy: "high",
  hot: "in demand",
  fire: "popular",
  "future-proof": "long-term relevant",
  "must-have": "valuable",
  skyrocketing: "increasing",
  booming: "growing",
};

/**
 * Check content for hype language
 * Returns list of hype words found with suggested replacements
 */
export function checkContentTone(
  text: string
): Array<{ found: string; suggested: string }> {
  const issues: Array<{ found: string; suggested: string }> = [];
  const lowerText = text.toLowerCase();

  for (const hypeWord of HYPE_WORDS) {
    if (lowerText.includes(hypeWord)) {
      issues.push({
        found: hypeWord,
        suggested: APPROVED_ALTERNATIVES[hypeWord] || "neutral alternative",
      });
    }
  }

  return issues;
}

// ============================================
// INSIGHT STRUCTURE VALIDATION
// ============================================

export interface InsightContent {
  title: string;
  body: string;
  sourceId: Tier1SourceId;
  whyMatters?: string;
  dataPoint?: string;
  industryTags?: IndustryCategory[];
}

/**
 * Validate an insight follows the required structure:
 * - Title (clear, neutral)
 * - 2-4 sentence explanation (plain language)
 * - Source attribution (Tier-1 only)
 * - "Why this matters" (1 sentence, optional)
 * - Industry tag(s)
 */
export function validateInsightStructure(
  insight: InsightContent,
  industry?: IndustryCategory
): SourceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Title validation
  if (!insight.title || insight.title.trim().length === 0) {
    errors.push("Title is required");
  } else if (insight.title.length > 100) {
    warnings.push("Title is quite long - consider making it more concise");
  }

  // Body validation
  if (!insight.body || insight.body.trim().length === 0) {
    errors.push("Body explanation is required");
  } else {
    const sentences = insight.body
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    if (sentences.length < 2) {
      warnings.push("Body should have 2-4 sentences for proper explanation");
    }
    if (sentences.length > 5) {
      warnings.push("Body is quite long - aim for 2-4 sentences");
    }
  }

  // Source validation
  if (!isTier1Source(insight.sourceId)) {
    errors.push(`Source "${insight.sourceId}" is not a Tier-1 source`);
  } else if (industry && !isSourceAllowedForIndustry(insight.sourceId, industry)) {
    errors.push(
      `Source "${insight.sourceId}" is not allowed for industry "${industry}"`
    );
  }

  // Check for hype language
  const toneIssues = checkContentTone(insight.title + " " + insight.body);
  for (const issue of toneIssues) {
    warnings.push(
      `Hype language detected: "${issue.found}" - consider using "${issue.suggested}"`
    );
  }

  // Why matters validation (if provided)
  if (insight.whyMatters) {
    const whySentences = insight.whyMatters
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    if (whySentences.length > 1) {
      warnings.push("'Why this matters' should be a single sentence");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// EXPORT ALL SOURCE IDS FOR REFERENCE
// ============================================

export const ALL_TIER1_SOURCE_IDS = Object.values(TIER1_SOURCES);
export const ALL_INDUSTRY_CATEGORIES = Object.keys(
  INDUSTRY_SOURCE_WHITELISTS
) as IndustryCategory[];

// ============================================
// ADDING NEW INDUSTRIES
// ============================================

/**
 * HOW TO ADD A NEW INDUSTRY
 *
 * 1. Define the industry in IndustryCategory type above
 * 2. Create an entry in INDUSTRY_SOURCE_WHITELISTS with:
 *    - industry: the category key
 *    - name: human-readable name
 *    - description: what the industry covers
 *    - allowedSources: array of Tier1SourceId values
 *    - notes: guidance for content creators
 *
 * 3. Only use sources from TIER1_SOURCES - do not add new sources
 *    without updating this file first
 *
 * 4. If a new Tier-1 source is needed:
 *    a. Verify it meets all criteria:
 *       - Internationally recognised institution
 *       - Public or research-based organisation
 *       - Consulting/analysis firm with global credibility
 *       - Official public sector or industry body
 *    b. Add to TIER1_SOURCES enum
 *    c. Add metadata to TIER1_SOURCE_METADATA
 *    d. Add to relevant industry whitelists
 *
 * 5. Run validation on all existing content for the new industry
 */

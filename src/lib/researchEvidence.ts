/**
 * RESEARCH EVIDENCE SERVICE LAYER
 *
 * Stores verified research statistics about youth career readiness.
 * All statistics are from credible sources (OECD, Gallup) with
 * verified citations and working source links.
 *
 * RECENCY RULE: Evidence must be less than 24 months old (or marked evergreen)
 *
 * Last verified: January 2025
 */

export type ResearchTag =
  | "career-uncertainty"
  | "work-exposure"
  | "guidance"
  | "preparedness"
  | "expectations"
  | "outcomes"
  | "neet";

export interface ResearchStat {
  id: string;
  headline: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  /** ISO date when the source was originally published */
  sourcePublishedAt: string;
  /** ISO date when the source was last accessed/verified */
  sourceAccessedAt: string;
  tags: ResearchTag[];
  /**
   * Mark as true ONLY for conceptual findings that aren't time-sensitive.
   * Default is false - most stats should NOT be evergreen.
   */
  evergreen?: boolean;
}

// Backwards compatibility - expose sourceYear as computed property
export interface ResearchStatWithYear extends ResearchStat {
  sourceYear: number;
}

/**
 * Maximum age in months for evidence to be considered current.
 * Evidence older than this (unless marked evergreen) will be excluded.
 */
export const MAX_EVIDENCE_AGE_MONTHS = 24;

/**
 * Check if a research stat passes the recency rule.
 * Returns true if:
 * - The stat is marked as evergreen, OR
 * - The sourcePublishedAt date is within MAX_EVIDENCE_AGE_MONTHS of today
 */
export function isRecent(stat: ResearchStat, referenceDate: Date = new Date()): boolean {
  if (stat.evergreen) return true;

  const publishedDate = new Date(stat.sourcePublishedAt);
  const cutoffDate = new Date(referenceDate);
  cutoffDate.setMonth(cutoffDate.getMonth() - MAX_EVIDENCE_AGE_MONTHS);

  return publishedDate >= cutoffDate;
}

/**
 * Get all expired (non-evergreen) stats that are older than MAX_EVIDENCE_AGE_MONTHS.
 * Used for validation and reporting.
 */
export function getExpiredStats(referenceDate: Date = new Date()): ResearchStat[] {
  return RESEARCH_STATS_RAW.filter((stat) => !isRecent(stat, referenceDate));
}

/**
 * Validated and filtered research stats.
 * Logs warnings for any expired stats at module load time.
 */
function getValidatedStats(): ResearchStatWithYear[] {
  const expired = getExpiredStats();

  if (expired.length > 0 && typeof window === "undefined") {
    // Only log on server-side to avoid console spam
    console.warn(
      `[ResearchEvidence] ${expired.length} stat(s) are older than ${MAX_EVIDENCE_AGE_MONTHS} months:`,
      expired.map((s) => `${s.id} (published: ${s.sourcePublishedAt})`)
    );
  }

  return RESEARCH_STATS_RAW.filter((stat) => isRecent(stat)).map((stat) => ({
    ...stat,
    sourceYear: new Date(stat.sourcePublishedAt).getFullYear(),
  }));
}

/**
 * Raw research statistics data.
 * Each statistic includes a direct link to the source.
 */
const RESEARCH_STATS_RAW: ResearchStat[] = [
  {
    id: "oecd-career-uncertainty",
    headline: "39% of teenagers cannot name a career they expect to pursue",
    description:
      "Across OECD countries, nearly two in five 15-year-olds are unable to name a job they expect to hold by age 30—the highest share ever recorded, and a sharp increase since 2018.",
    sourceName: "OECD",
    sourceUrl:
      "https://www.oecd.org/en/publications/the-state-of-global-teenage-career-preparation_d5f8e3f2-en.html",
    sourcePublishedAt: "2025-01-14",
    sourceAccessedAt: "2025-01-22",
    tags: ["career-uncertainty"],
  },
  {
    id: "oecd-career-advisor",
    headline: "Less than half of students have spoken with a career advisor",
    description:
      "On average across OECD countries, only 49% of students have had a conversation with a career advisor at school—limiting their exposure to structured guidance.",
    sourceName: "OECD PISA",
    sourceUrl: "https://www.oecd.org/en/data/dashboards/teenage-career-readiness.html",
    sourcePublishedAt: "2024-06-01",
    sourceAccessedAt: "2025-01-22",
    tags: ["guidance", "work-exposure"],
  },
  {
    id: "oecd-job-shadowing",
    headline: "Only 45% of students have experienced real workplaces",
    description:
      "Fewer than half of students have participated in job shadowing or work-site visits, missing valuable exposure to how careers actually work in practice.",
    sourceName: "OECD PISA",
    sourceUrl: "https://www.oecd.org/en/data/dashboards/teenage-career-readiness.html",
    sourcePublishedAt: "2024-06-01",
    sourceAccessedAt: "2025-01-22",
    tags: ["work-exposure"],
  },
  {
    id: "oecd-internships",
    headline: "Only 35% of students have undertaken an internship",
    description:
      "Just over one-third of students have gained practical work experience through internships—leaving most without hands-on learning opportunities.",
    sourceName: "OECD PISA",
    sourceUrl: "https://www.oecd.org/en/data/dashboards/teenage-career-readiness.html",
    sourcePublishedAt: "2024-06-01",
    sourceAccessedAt: "2025-01-22",
    tags: ["work-exposure"],
  },
  {
    id: "gallup-path-uncertainty",
    headline: "41% of young people are unsure how to choose their path",
    description:
      "Many Gen Z individuals report difficulty navigating career decisions, even when they feel optimistic about their futures. The gap between aspiration and action is significant.",
    sourceName: "Gallup / Walton Family Foundation",
    sourceUrl:
      "https://www.waltonfamilyfoundation.org/about-us/newsroom/gen-zers-envision-a-bright-future-ahead-but-feel-ill-prepared-for-it-new-gallup-survey-finds",
    sourcePublishedAt: "2024-02-01",
    sourceAccessedAt: "2025-01-22",
    tags: ["career-uncertainty", "preparedness"],
    evergreen: true, // Recurring generational finding about career decision-making
  },
  {
    id: "gallup-preparedness",
    headline: "43% of students don't feel prepared for their future",
    description:
      "Despite improvements in recent years, a significant share of young people still do not agree they feel prepared for what lies ahead.",
    sourceName: "Gallup",
    sourceUrl: "https://news.gallup.com/poll/694238/gen-students-engaged-school-ready-future.aspx",
    sourcePublishedAt: "2025-01-09",
    sourceAccessedAt: "2025-01-22",
    tags: ["preparedness"],
  },
  {
    id: "oecd-expectations-gap",
    headline: "58% expect professional careers, but reality differs",
    description:
      "Most students aspire to be doctors, engineers, or lawyers—occupations that typically employ no more than one quarter of people in work. Career expectations have become increasingly concentrated.",
    sourceName: "OECD",
    sourceUrl:
      "https://www.oecd.org/en/publications/the-state-of-global-teenage-career-preparation_d5f8e3f2-en.html",
    sourcePublishedAt: "2025-01-14",
    sourceAccessedAt: "2025-01-22",
    tags: ["expectations"],
  },
  {
    id: "oecd-career-outcomes",
    headline: "Career exploration leads to better employment outcomes",
    description:
      "Students who engage in career development activities—like job shadowing and conversations with advisors—show better results in employment rates, earnings, and career satisfaction by age 25.",
    sourceName: "OECD",
    sourceUrl: "https://www.oecd.org/en/about/projects/career-readiness.html",
    sourcePublishedAt: "2024-09-01",
    sourceAccessedAt: "2025-01-22",
    tags: ["outcomes", "work-exposure"],
    evergreen: true, // Conceptual finding about exploration benefits
  },
  {
    id: "oecd-neet-average",
    headline: "14% of young adults are not in education, employment, or training",
    description:
      "Across OECD countries, the average NEET rate for 18-24 year-olds stands at 14%. Early career exposure and guidance are key factors in reducing this rate.",
    sourceName: "OECD Education at a Glance",
    sourceUrl:
      "https://www.oecd.org/en/publications/education-at-a-glance-2024_c00cad36-en.html",
    sourcePublishedAt: "2024-09-10",
    sourceAccessedAt: "2025-01-22",
    tags: ["neet", "outcomes"],
  },
  {
    id: "oecd-top-ten-jobs",
    headline: "Over half of students plan to work in just 10 occupations",
    description:
      "Career expectations have become more concentrated since 2000, with over half of both girls and boys expecting to work in one of ten popular occupations—limiting awareness of the full range of career options.",
    sourceName: "OECD",
    sourceUrl:
      "https://www.oecd.org/en/publications/the-state-of-global-teenage-career-preparation_d5f8e3f2-en.html",
    sourcePublishedAt: "2025-01-14",
    sourceAccessedAt: "2025-01-22",
    tags: ["expectations", "guidance"],
  },
];

// Cache the validated stats
let _cachedStats: ResearchStatWithYear[] | null = null;

/**
 * Get validated research statistics (filtered by recency).
 */
export const RESEARCH_STATS: ResearchStatWithYear[] = (() => {
  if (!_cachedStats) {
    _cachedStats = getValidatedStats();
  }
  return _cachedStats;
})();

/**
 * Get all research statistics (validated and filtered by recency).
 */
export function getAllStats(): ResearchStatWithYear[] {
  return RESEARCH_STATS;
}

/**
 * Get statistics suitable for the "Did You Know?" rotating banner.
 * These are the most impactful stats for quick display.
 */
export function getRotatingStats(): ResearchStatWithYear[] {
  return RESEARCH_STATS.filter((stat) =>
    [
      "oecd-career-uncertainty",
      "gallup-path-uncertainty",
      "oecd-job-shadowing",
      "gallup-preparedness",
      "oecd-career-outcomes",
    ].includes(stat.id)
  );
}

/**
 * Get statistics for the "Why This Matters" section.
 * These are the core stats that support the platform's mission.
 */
export function getWhyThisMattersStats(): ResearchStatWithYear[] {
  return RESEARCH_STATS.filter((stat) =>
    [
      "oecd-career-uncertainty",
      "oecd-job-shadowing",
      "gallup-path-uncertainty",
      "gallup-preparedness",
      "oecd-career-outcomes",
    ].includes(stat.id)
  );
}

/**
 * Get statistics for the About page section.
 */
export function getAboutPageStats(): ResearchStatWithYear[] {
  return RESEARCH_STATS.filter((stat) =>
    [
      "oecd-career-uncertainty",
      "oecd-job-shadowing",
      "gallup-preparedness",
    ].includes(stat.id)
  );
}

/**
 * Get key findings for the Research & Evidence page (3-6 cards).
 */
export function getKeyFindings(): ResearchStatWithYear[] {
  return RESEARCH_STATS.filter((stat) =>
    [
      "oecd-career-uncertainty",
      "gallup-path-uncertainty",
      "oecd-job-shadowing",
      "oecd-internships",
      "gallup-preparedness",
      "oecd-career-outcomes",
    ].includes(stat.id)
  );
}

/**
 * Get all statistics by tag.
 */
export function getStatsByTag(tag: ResearchTag): ResearchStatWithYear[] {
  return RESEARCH_STATS.filter((stat) => stat.tags.includes(tag));
}

/**
 * Get 2 featured statistics for the landing page.
 * These represent the core gap: career uncertainty + limited real-world exposure.
 */
export function getFeaturedStats(): ResearchStatWithYear[] {
  return RESEARCH_STATS.filter((stat) =>
    ["oecd-career-uncertainty", "oecd-job-shadowing"].includes(stat.id)
  );
}

/**
 * Last updated date for the research evidence.
 */
export const RESEARCH_LAST_UPDATED = "2025-01-22";

/**
 * Export raw stats for testing purposes only.
 * @internal
 */
export const _RESEARCH_STATS_RAW_FOR_TESTING = RESEARCH_STATS_RAW;

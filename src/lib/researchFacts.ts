/**
 * RESEARCH FACTS DATASET
 *
 * A large pool of evidence-backed facts for the "Did You Know?" experience.
 * All facts are sourced from credible publishers (OECD, WEF, ILO, McKinsey, Gallup).
 *
 * IMPORTANT:
 * - Never invent statistics - all numeric claims must have verified sources
 * - Update facts when sources are refreshed (check quarterly)
 * - Facts older than 24 months should be replaced with newer equivalents
 *
 * Last updated: January 2025
 */

export type FactCategory =
  | "career-readiness"
  | "skills-future"
  | "employment"
  | "education"
  | "ai-technology"
  | "work-trends";

export interface ResearchFact {
  id: string;
  /** The main fact - should be attention-grabbing but accurate */
  headline: string;
  /** Optional additional context (1-2 sentences max) */
  context?: string;
  sourceName: string;
  sourceUrl: string;
  /** ISO date when the source was published */
  sourcePublishedAt: string;
  /** ISO date when we last verified/accessed the source */
  sourceAccessedAt: string;
  category: FactCategory;
  /** Mark true ONLY for conceptual facts, not time-sensitive statistics */
  evergreen?: boolean;
}

/**
 * Maximum age in months for facts to be considered current.
 */
export const MAX_FACT_AGE_MONTHS = 24;

/**
 * Check if a fact passes the recency rule.
 */
export function isFactRecent(fact: ResearchFact, referenceDate: Date = new Date()): boolean {
  if (fact.evergreen) return true;

  const publishedDate = new Date(fact.sourcePublishedAt);
  const cutoffDate = new Date(referenceDate);
  cutoffDate.setMonth(cutoffDate.getMonth() - MAX_FACT_AGE_MONTHS);

  return publishedDate >= cutoffDate;
}

/**
 * The complete pool of research facts.
 * Architecture supports scaling to hundreds of facts.
 */
const RESEARCH_FACTS_RAW: ResearchFact[] = [
  // ============================================
  // OECD - CAREER READINESS
  // ============================================
  {
    id: "oecd-39-percent-no-career",
    headline: "39% of teenagers cannot name a career they expect to pursue",
    context: "This is the highest share ever recorded across OECD countries, and a sharp increase since 2018.",
    sourceName: "OECD",
    sourceUrl: "https://www.oecd.org/en/publications/the-state-of-global-teenage-career-preparation_d5f8e3f2-en.html",
    sourcePublishedAt: "2025-01-14",
    sourceAccessedAt: "2025-01-22",
    category: "career-readiness",
  },
  {
    id: "oecd-half-top-ten-jobs",
    headline: "Over half of students plan to work in just 10 occupations",
    context: "Career expectations have become increasingly concentrated since 2000.",
    sourceName: "OECD",
    sourceUrl: "https://www.oecd.org/en/publications/the-state-of-global-teenage-career-preparation_d5f8e3f2-en.html",
    sourcePublishedAt: "2025-01-14",
    sourceAccessedAt: "2025-01-22",
    category: "career-readiness",
  },
  {
    id: "oecd-58-percent-professional",
    headline: "58% of students expect professional careers, but these jobs employ only 25% of workers",
    context: "Most aspire to be doctors, engineers, or lawyers—creating a major expectations gap.",
    sourceName: "OECD",
    sourceUrl: "https://www.oecd.org/en/publications/the-state-of-global-teenage-career-preparation_d5f8e3f2-en.html",
    sourcePublishedAt: "2025-01-14",
    sourceAccessedAt: "2025-01-22",
    category: "career-readiness",
  },
  {
    id: "oecd-49-percent-career-advisor",
    headline: "Only 49% of students have spoken with a career advisor at school",
    context: "This limits exposure to structured guidance about career options.",
    sourceName: "OECD PISA",
    sourceUrl: "https://www.oecd.org/en/data/dashboards/teenage-career-readiness.html",
    sourcePublishedAt: "2024-06-01",
    sourceAccessedAt: "2025-01-22",
    category: "career-readiness",
  },
  {
    id: "oecd-45-percent-workplace",
    headline: "Only 45% of students have visited a real workplace",
    context: "Job shadowing provides valuable exposure to how careers actually work in practice.",
    sourceName: "OECD PISA",
    sourceUrl: "https://www.oecd.org/en/data/dashboards/teenage-career-readiness.html",
    sourcePublishedAt: "2024-06-01",
    sourceAccessedAt: "2025-01-22",
    category: "career-readiness",
  },
  {
    id: "oecd-35-percent-internship",
    headline: "Only 35% of students have done an internship",
    context: "Most students lack hands-on work experience before entering the job market.",
    sourceName: "OECD PISA",
    sourceUrl: "https://www.oecd.org/en/data/dashboards/teenage-career-readiness.html",
    sourcePublishedAt: "2024-06-01",
    sourceAccessedAt: "2025-01-22",
    category: "career-readiness",
  },
  {
    id: "oecd-neet-14-percent",
    headline: "14% of young adults (18-24) are not in education, employment, or training",
    context: "This NEET rate is the OECD average—early career exposure helps reduce it.",
    sourceName: "OECD Education at a Glance",
    sourceUrl: "https://www.oecd.org/en/publications/education-at-a-glance-2024_c00cad36-en.html",
    sourcePublishedAt: "2024-09-10",
    sourceAccessedAt: "2025-01-22",
    category: "employment",
  },
  {
    id: "oecd-career-outcomes",
    headline: "Career exploration activities lead to better employment outcomes by age 25",
    context: "Job shadowing, internships, and advisor conversations all improve results.",
    sourceName: "OECD",
    sourceUrl: "https://www.oecd.org/en/about/projects/career-readiness.html",
    sourcePublishedAt: "2024-09-01",
    sourceAccessedAt: "2025-01-22",
    category: "career-readiness",
    evergreen: true,
  },
  {
    id: "oecd-disadvantaged-3x-neet",
    headline: "Young adults from disadvantaged backgrounds are 3.5x more likely to be NEET",
    context: "Even with the same education level, social background heavily influences outcomes.",
    sourceName: "OECD Education at a Glance",
    sourceUrl: "https://www.oecd.org/en/publications/education-at-a-glance-2025_1c0d9c79-en/full-report/transition-from-education-to-work-where-are-today-s-youth_b90719d0.html",
    sourcePublishedAt: "2025-01-01",
    sourceAccessedAt: "2025-01-22",
    category: "employment",
  },

  // ============================================
  // WORLD ECONOMIC FORUM - FUTURE OF JOBS
  // ============================================
  {
    id: "wef-78-million-new-jobs",
    headline: "78 million new jobs will be created globally by 2030",
    context: "170 million new roles created, 92 million displaced—net positive of 78 million.",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    sourcePublishedAt: "2025-01-08",
    sourceAccessedAt: "2025-01-22",
    category: "skills-future",
  },
  {
    id: "wef-22-percent-disruption",
    headline: "22% of jobs will be disrupted by 2030",
    context: "Major drivers: technology, economic uncertainty, and the green transition.",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    sourcePublishedAt: "2025-01-08",
    sourceAccessedAt: "2025-01-22",
    category: "skills-future",
  },
  {
    id: "wef-39-percent-skills-change",
    headline: "39% of key skills required for jobs will change by 2030",
    context: "This is down from 44% projected in 2023, but still represents major disruption.",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    sourcePublishedAt: "2025-01-08",
    sourceAccessedAt: "2025-01-22",
    category: "skills-future",
  },
  {
    id: "wef-ai-top-skill",
    headline: "AI and big data are now the #1 most in-demand skills",
    context: "Followed by networks, cybersecurity, and technological literacy.",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    sourcePublishedAt: "2025-01-08",
    sourceAccessedAt: "2025-01-22",
    category: "skills-future",
  },
  {
    id: "wef-creative-thinking-rising",
    headline: "Creative thinking is rising as a top skill alongside AI literacy",
    context: "Human skills like resilience, flexibility, and curiosity remain essential.",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    sourcePublishedAt: "2025-01-08",
    sourceAccessedAt: "2025-01-22",
    category: "skills-future",
  },
  {
    id: "wef-skills-gap-barrier",
    headline: "Skills gaps are companies' biggest barrier—more than capital or regulations",
    context: "Employers struggle more with finding skilled talent than funding projects.",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    sourcePublishedAt: "2025-01-08",
    sourceAccessedAt: "2025-01-22",
    category: "skills-future",
  },
  {
    id: "wef-67-percent-hiring-ai",
    headline: "Over 67% of employers plan to hire for AI-specific roles",
    context: "Even as 40% expect workforce adjustments due to AI adoption.",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    sourcePublishedAt: "2025-01-08",
    sourceAccessedAt: "2025-01-22",
    category: "ai-technology",
  },
  {
    id: "wef-41-no-training-needed",
    headline: "41% of workers won't need significant training by 2030",
    context: "But 29% will need upskilling within their current roles.",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    sourcePublishedAt: "2025-01-08",
    sourceAccessedAt: "2025-01-22",
    category: "skills-future",
  },
  {
    id: "wef-half-realign-for-ai",
    headline: "Half of all businesses are realigning their organizations for AI",
    context: "AI is driving fundamental changes in how companies structure work.",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    sourcePublishedAt: "2025-01-08",
    sourceAccessedAt: "2025-01-22",
    category: "ai-technology",
  },

  // ============================================
  // ILO - GLOBAL YOUTH EMPLOYMENT
  // ============================================
  {
    id: "ilo-youth-unemployment-13",
    headline: "Global youth unemployment hit a 15-year low of 13% in 2023",
    context: "That's 64.9 million young people—nearly 4 million fewer than before COVID.",
    sourceName: "ILO",
    sourceUrl: "https://www.ilo.org/publications/major-publications/global-employment-trends-youth-2024",
    sourcePublishedAt: "2024-08-01",
    sourceAccessedAt: "2025-01-22",
    category: "employment",
  },
  {
    id: "ilo-youth-unemployment-2024",
    headline: "Youth unemployment remained at 12.6% globally in 2024",
    context: "Recovery from COVID has stabilized, but progress remains uneven by region.",
    sourceName: "ILO",
    sourceUrl: "https://www.ilo.org/resource/other/world-employment-and-social-outlook-trends-2025-figures",
    sourcePublishedAt: "2025-01-01",
    sourceAccessedAt: "2025-01-22",
    category: "employment",
  },
  {
    id: "ilo-neet-20-percent",
    headline: "20.4% of young people globally are NEET (not in education, employment, or training)",
    context: "The rate for young women (28.2%) is more than double that of young men (13.1%).",
    sourceName: "ILO",
    sourceUrl: "https://www.ilo.org/publications/major-publications/global-employment-trends-youth-2024",
    sourcePublishedAt: "2024-08-01",
    sourceAccessedAt: "2025-01-22",
    category: "employment",
  },
  {
    id: "ilo-arab-states-28",
    headline: "Youth unemployment in Arab States is 28%—the world's highest",
    context: "Regional variations in youth employment remain stark.",
    sourceName: "ILO",
    sourceUrl: "https://www.ilo.org/publications/major-publications/global-employment-trends-youth-2024",
    sourcePublishedAt: "2024-08-01",
    sourceAccessedAt: "2025-01-22",
    category: "employment",
  },
  {
    id: "ilo-two-thirds-neet-female",
    headline: "Two-thirds of NEETs globally are female",
    context: "Young women face greater disadvantage in the transition to employment.",
    sourceName: "ILO",
    sourceUrl: "https://www.ilo.org/publications/major-publications/global-employment-trends-youth-2024",
    sourcePublishedAt: "2024-08-01",
    sourceAccessedAt: "2025-01-22",
    category: "employment",
  },

  // ============================================
  // MCKINSEY - AI & WORKFORCE
  // ============================================
  {
    id: "mckinsey-30-percent-automated",
    headline: "Up to 30% of work hours could be automated by 2030",
    context: "Generative AI is accelerating this timeline significantly.",
    sourceName: "McKinsey Global Institute",
    sourceUrl: "https://www.mckinsey.com/mgi/our-research/a-new-future-of-work-the-race-to-deploy-ai-and-raise-skills-in-europe-and-beyond",
    sourcePublishedAt: "2024-09-01",
    sourceAccessedAt: "2025-01-22",
    category: "ai-technology",
  },
  {
    id: "mckinsey-12-million-transitions",
    headline: "Europe may need 12 million job transitions by 2030—double the pre-pandemic pace",
    context: "Workers will need to move between occupations at unprecedented rates.",
    sourceName: "McKinsey Global Institute",
    sourceUrl: "https://www.mckinsey.com/mgi/our-research/a-new-future-of-work-the-race-to-deploy-ai-and-raise-skills-in-europe-and-beyond",
    sourcePublishedAt: "2024-09-01",
    sourceAccessedAt: "2025-01-22",
    category: "work-trends",
  },
  {
    id: "mckinsey-46-percent-talent-gap",
    headline: "46% of companies say talent skill gaps are slowing AI adoption",
    context: "Finding skilled workers is the top barrier, even above funding.",
    sourceName: "McKinsey",
    sourceUrl: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai",
    sourcePublishedAt: "2025-01-01",
    sourceAccessedAt: "2025-01-22",
    category: "ai-technology",
  },
  {
    id: "mckinsey-75-percent-using-ai",
    headline: "75% of knowledge workers already use AI tools—even without company approval",
    context: "AI adoption is happening faster than many organizations realize.",
    sourceName: "McKinsey",
    sourceUrl: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai",
    sourcePublishedAt: "2025-01-01",
    sourceAccessedAt: "2025-01-22",
    category: "ai-technology",
  },
  {
    id: "mckinsey-71-percent-genai",
    headline: "71% of organizations now use generative AI in at least one function",
    context: "Up from 65% just six months earlier.",
    sourceName: "McKinsey",
    sourceUrl: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai",
    sourcePublishedAt: "2025-01-01",
    sourceAccessedAt: "2025-01-22",
    category: "ai-technology",
  },
  {
    id: "mckinsey-tech-skills-25-percent",
    headline: "Demand for tech skills could grow 25-29% by 2030",
    context: "Social and emotional skills demand will also rise 11-14%.",
    sourceName: "McKinsey Global Institute",
    sourceUrl: "https://www.mckinsey.com/mgi/our-research/a-new-future-of-work-the-race-to-deploy-ai-and-raise-skills-in-europe-and-beyond",
    sourcePublishedAt: "2024-09-01",
    sourceAccessedAt: "2025-01-22",
    category: "skills-future",
  },
  {
    id: "mckinsey-health-stem-growth",
    headline: "Health and STEM jobs expected to grow 17-30% by 2030",
    context: "These sectors will create significant new opportunities.",
    sourceName: "McKinsey Global Institute",
    sourceUrl: "https://www.mckinsey.com/mgi/our-research/a-new-future-of-work-the-race-to-deploy-ai-and-raise-skills-in-europe-and-beyond",
    sourcePublishedAt: "2024-09-01",
    sourceAccessedAt: "2025-01-22",
    category: "skills-future",
  },

  // ============================================
  // GALLUP - GEN Z READINESS
  // ============================================
  {
    id: "gallup-56-percent-prepared",
    headline: "56% of Gen Z now feel prepared for their future—up from 44% in 2023",
    context: "Student preparedness has increased significantly over the past two years.",
    sourceName: "Gallup / Walton Family Foundation",
    sourceUrl: "https://news.gallup.com/poll/694238/gen-students-engaged-school-ready-future.aspx",
    sourcePublishedAt: "2025-01-09",
    sourceAccessedAt: "2025-01-22",
    category: "career-readiness",
  },
  {
    id: "gallup-41-percent-unsure",
    headline: "41% of Gen Z feel unsure how to choose their career path",
    context: "Many feel optimistic about the future but lack clarity on how to get there.",
    sourceName: "Gallup / Walton Family Foundation",
    sourceUrl: "https://www.waltonfamilyfoundation.org/about-us/newsroom/gen-zers-envision-a-bright-future-ahead-but-feel-ill-prepared-for-it-new-gallup-survey-finds",
    sourcePublishedAt: "2024-02-01",
    sourceAccessedAt: "2025-01-22",
    category: "career-readiness",
  },
  {
    id: "gallup-29-percent-career-ready",
    headline: "Only 29% of high schoolers feel very prepared to succeed in their careers",
    context: "Career confidence lags behind optimism about the future.",
    sourceName: "Gallup / Walton Family Foundation",
    sourceUrl: "https://news.gallup.com/poll/691418/gen-parents-lack-knowledge-post-high-school-options.aspx",
    sourcePublishedAt: "2024-10-01",
    sourceAccessedAt: "2025-01-22",
    category: "career-readiness",
  },
  {
    id: "gallup-26-percent-college-apply",
    headline: "Only 26% of high schoolers feel very prepared to apply to college",
    context: "Students often lack confidence in navigating post-secondary options.",
    sourceName: "Gallup / Walton Family Foundation",
    sourceUrl: "https://news.gallup.com/poll/691418/gen-parents-lack-knowledge-post-high-school-options.aspx",
    sourcePublishedAt: "2024-10-01",
    sourceAccessedAt: "2025-01-22",
    category: "education",
  },
  {
    id: "gallup-engaged-4x-future",
    headline: "Engaged students are 4x more likely to believe they have a great future",
    context: "School engagement strongly predicts confidence about the future.",
    sourceName: "Gallup / Walton Family Foundation",
    sourceUrl: "https://news.gallup.com/poll/694238/gen-students-engaged-school-ready-future.aspx",
    sourcePublishedAt: "2025-01-09",
    sourceAccessedAt: "2025-01-22",
    category: "education",
    evergreen: true,
  },
  {
    id: "gallup-engaged-10x-prepared",
    headline: "Engaged students are 10x more likely to feel prepared for the future",
    context: "The link between engagement and preparedness is remarkably strong.",
    sourceName: "Gallup / Walton Family Foundation",
    sourceUrl: "https://news.gallup.com/poll/694238/gen-students-engaged-school-ready-future.aspx",
    sourcePublishedAt: "2025-01-09",
    sourceAccessedAt: "2025-01-22",
    category: "education",
    evergreen: true,
  },
  {
    id: "gallup-46-percent-finances",
    headline: "Less than half of Gen Z (46%) feel they'll be prepared to manage their finances",
    context: "Financial literacy remains a major concern for young people.",
    sourceName: "Gallup / Walton Family Foundation",
    sourceUrl: "https://nextgeninsights.waltonfamilyfoundation.org/resources/2024-voices-of-gen-z-study/",
    sourcePublishedAt: "2024-08-01",
    sourceAccessedAt: "2025-01-22",
    category: "career-readiness",
  },
  {
    id: "gallup-hs-engagement-up",
    headline: "High school engagement increased 6-14 points across all measures in 2025",
    context: "Every measure of school engagement reached its highest level to date.",
    sourceName: "Gallup / Walton Family Foundation",
    sourceUrl: "https://news.gallup.com/poll/694238/gen-students-engaged-school-ready-future.aspx",
    sourcePublishedAt: "2025-01-09",
    sourceAccessedAt: "2025-01-22",
    category: "education",
  },

  // ============================================
  // ADDITIONAL CAREER & SKILLS FACTS
  // ============================================
  {
    id: "wef-reskilling-1-billion",
    headline: "The Reskilling Revolution aims to equip 1 billion people with skills by 2030",
    context: "A global initiative to prepare workers for the changing job market.",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    sourcePublishedAt: "2025-01-08",
    sourceAccessedAt: "2025-01-22",
    category: "skills-future",
  },
  {
    id: "oecd-gender-gap-education",
    headline: "Women lead men in education by 6 points, but trail by 8 points in employment",
    context: "55% of young women are in education vs 49% of men, but employment favors men.",
    sourceName: "OECD Education at a Glance",
    sourceUrl: "https://www.oecd.org/en/publications/education-at-a-glance-2025_1c0d9c79-en/full-report/transition-from-education-to-work-where-are-today-s-youth_b90719d0.html",
    sourcePublishedAt: "2025-01-01",
    sourceAccessedAt: "2025-01-22",
    category: "employment",
  },
  {
    id: "mckinsey-new-roles-emerging",
    headline: "New roles like 'AI evaluation writer' and 'agent product manager' are emerging",
    context: "Companies are creating entirely new job categories to work alongside AI.",
    sourceName: "McKinsey",
    sourceUrl: "https://www.mckinsey.com/mgi/our-research/agents-robots-and-us-skill-partnerships-in-the-age-of-ai",
    sourcePublishedAt: "2025-01-01",
    sourceAccessedAt: "2025-01-22",
    category: "ai-technology",
  },
  {
    id: "wef-leadership-social-top10",
    headline: "Leadership and social influence rank in the top 10 skills for 2030",
    context: "Human skills remain crucial even as technical skills surge in demand.",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    sourcePublishedAt: "2025-01-08",
    sourceAccessedAt: "2025-01-22",
    category: "skills-future",
  },
  {
    id: "ilo-italy-neet-drop",
    headline: "Italy's NEET rate dropped 8 percentage points—the most of any country",
    context: "Targeted youth employment programs show strong results when implemented.",
    sourceName: "ILO",
    sourceUrl: "https://www.ilo.org/publications/major-publications/global-employment-trends-youth-2024",
    sourcePublishedAt: "2024-08-01",
    sourceAccessedAt: "2025-01-22",
    category: "employment",
  },

  // ============================================
  // CFYE — CHALLENGE FUND FOR YOUTH EMPLOYMENT
  // ============================================
  {
    id: "unicef-75-pct-lack-skills",
    headline: "75% of youth aged 15-24 lack critical employment skills",
    context: "A massive skills gap that targeted training programmes are working to close.",
    sourceName: "UNICEF (cited by CFYE)",
    sourceUrl: "https://fundforyouthemployment.nl/",
    sourcePublishedAt: "2024-11-01",
    sourceAccessedAt: "2025-02-10",
    category: "skills-future",
  },
  {
    id: "mo-ibrahim-83-pct-africa",
    headline: "83% of youth entering the labour market may remain unemployed in sub-Saharan Africa",
    context: "The region faces the world's most severe youth employment challenge.",
    sourceName: "Mo Ibrahim Foundation",
    sourceUrl: "https://mo.ibrahim.foundation/",
    sourcePublishedAt: "2024-06-01",
    sourceAccessedAt: "2025-02-10",
    category: "employment",
  },
  {
    id: "cfye-100k-jobs-created",
    headline: "100,000+ jobs created, matched, and improved across 11 countries in Africa & MENA",
    context: "The Challenge Fund for Youth Employment programme funded by the Netherlands Ministry of Foreign Affairs.",
    sourceName: "CFYE / Netherlands MFA",
    sourceUrl: "https://fundforyouthemployment.nl/",
    sourcePublishedAt: "2024-11-01",
    sourceAccessedAt: "2025-02-10",
    category: "employment",
  },
  {
    id: "cfye-49-pct-women",
    headline: "49% of jobs in the CFYE programme went to young women—near gender parity",
    context: "Deliberate programme design ensured women benefited equally from job creation.",
    sourceName: "CFYE / Palladium",
    sourceUrl: "https://fundforyouthemployment.nl/",
    sourcePublishedAt: "2024-11-01",
    sourceAccessedAt: "2025-02-10",
    category: "employment",
  },
  {
    id: "cfye-51k-trained",
    headline: "51,593 young people completed employment training across 72 initiatives",
    context: "Training programmes spanning digital skills, green jobs, and vocational education.",
    sourceName: "CFYE",
    sourceUrl: "https://fundforyouthemployment.nl/",
    sourcePublishedAt: "2024-11-01",
    sourceAccessedAt: "2025-02-10",
    category: "employment",
  },
  {
    id: "kenya-youth-35-pct",
    headline: "Youth unemployment in Kenya: 35%, affecting 4.5 million young people",
    context: "Kenya is a key focus country for youth employment programmes in East Africa.",
    sourceName: "ILO / Netherlands Embassy",
    sourceUrl: "https://www.ilo.org/publications/major-publications/global-employment-trends-youth-2024",
    sourcePublishedAt: "2024-08-01",
    sourceAccessedAt: "2025-02-10",
    category: "employment",
  },
];

// Cache filtered facts
let _cachedFacts: ResearchFact[] | null = null;

/**
 * Get all facts that pass the recency filter.
 */
export function getResearchFacts(): ResearchFact[] {
  if (!_cachedFacts) {
    _cachedFacts = RESEARCH_FACTS_RAW.filter((fact) => isFactRecent(fact));

    // Log warnings for expired facts (server-side only)
    if (typeof window === "undefined") {
      const expired = RESEARCH_FACTS_RAW.filter((fact) => !isFactRecent(fact));
      if (expired.length > 0) {
        console.warn(
          `[ResearchFacts] ${expired.length} fact(s) are older than ${MAX_FACT_AGE_MONTHS} months:`,
          expired.map((f) => f.id)
        );
      }
    }
  }
  return _cachedFacts;
}

/**
 * Get facts by category.
 */
export function getFactsByCategory(category: FactCategory): ResearchFact[] {
  return getResearchFacts().filter((fact) => fact.category === category);
}

/**
 * Get a deterministic shuffle of facts based on a seed.
 * Used for consistent ordering per user/session.
 */
export function getShuffledFacts(seed: number): ResearchFact[] {
  const facts = [...getResearchFacts()];

  // Simple seeded shuffle (Fisher-Yates with seeded random)
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  for (let i = facts.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [facts[i], facts[j]] = [facts[j], facts[i]];
  }

  return facts;
}

/**
 * Get a fact by ID.
 */
export function getFactById(id: string): ResearchFact | undefined {
  return getResearchFacts().find((fact) => fact.id === id);
}

/**
 * Get total count of available facts.
 */
export function getFactCount(): number {
  return getResearchFacts().length;
}

/**
 * Invalidate the cached facts so the next call to getResearchFacts()
 * re-evaluates recency filters. Called during content revalidation.
 */
export function invalidateFactsCache(): void {
  _cachedFacts = null;
}

/**
 * Get metadata about the facts pool for monitoring.
 */
export function getFactsMetadata() {
  const allFacts = RESEARCH_FACTS_RAW;
  const currentFacts = getResearchFacts();
  const expired = allFacts.filter((f) => !isFactRecent(f));

  return {
    totalRaw: allFacts.length,
    totalCurrent: currentFacts.length,
    totalExpired: expired.length,
    expiredIds: expired.map((f) => f.id),
    categories: Object.fromEntries(
      [...new Set(currentFacts.map((f) => f.category))].map((cat) => [
        cat,
        currentFacts.filter((f) => f.category === cat).length,
      ])
    ),
    lastEvaluatedAt: new Date().toISOString(),
  };
}

/**
 * Export raw facts for testing purposes only.
 * @internal
 */
export const _RESEARCH_FACTS_RAW_FOR_TESTING = RESEARCH_FACTS_RAW;

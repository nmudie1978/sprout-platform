/**
 * Podcast Recommendations - Goal-Linked Content
 *
 * CORE PRINCIPLE: Podcasts exist ONLY to support a user's Primary (and optionally Secondary) Goal.
 *
 * Rules:
 * - Max 3 podcast recommendations per goal category
 * - Must relate directly to: how people in the field think, real-world experiences, career paths
 * - Avoid hype, "get rich quick", or influencer-style content
 * - Prefer: professional discussions, practitioner interviews, long-form thinking
 * - Links must be valid and manually curated
 *
 * SCOPE:
 * - Shown ONLY inside My Goals
 * - NOT shown on: Dashboard, Explore Careers, Industry Insights, Navigation, Search
 */

export interface PodcastRecommendation {
  id: string;
  goalCategory: string; // e.g., "Software Engineering", "AI", "Healthcare"
  title: string; // Podcast name
  episodeTitle?: string; // Optional but preferred
  description: string; // 1 short sentence: why this is useful
  platform: "spotify";
  externalUrl: string; // Must be a valid, direct link
  active: boolean;
}

/**
 * Goal category mappings
 * Maps common goal titles/keywords to podcast categories
 */
export const GOAL_TO_PODCAST_CATEGORY: Record<string, string> = {
  // Tech / Software
  "software developer": "software-engineering",
  "software engineer": "software-engineering",
  "web developer": "software-engineering",
  "frontend developer": "software-engineering",
  "backend developer": "software-engineering",
  "full stack developer": "software-engineering",
  programmer: "software-engineering",
  coder: "software-engineering",
  developer: "software-engineering",

  // AI / Machine Learning
  "ai engineer": "ai-technology",
  "machine learning engineer": "ai-technology",
  "data scientist": "ai-technology",
  "ai researcher": "ai-technology",
  "ml engineer": "ai-technology",

  // IT / Infrastructure
  "it specialist": "software-engineering",
  "system administrator": "software-engineering",
  "devops engineer": "software-engineering",
  "cloud engineer": "software-engineering",
  "network engineer": "software-engineering",
  cybersecurity: "software-engineering",

  // Design
  "ux designer": "design-creative",
  "ui designer": "design-creative",
  "product designer": "design-creative",
  "graphic designer": "design-creative",
  designer: "design-creative",

  // Business / Entrepreneurship
  entrepreneur: "business-career",
  "business owner": "business-career",
  "startup founder": "business-career",
  founder: "business-career",

  // Healthcare
  doctor: "healthcare",
  nurse: "healthcare",
  "healthcare worker": "healthcare",
  "medical professional": "healthcare",
  paramedic: "healthcare",

  // Trades
  electrician: "trades",
  plumber: "trades",
  carpenter: "trades",
  mechanic: "trades",
  technician: "trades",

  // Finance
  accountant: "finance",
  "financial analyst": "finance",
  banker: "finance",
  "investment analyst": "finance",

  // Marketing
  marketer: "marketing",
  "marketing manager": "marketing",
  "digital marketer": "marketing",
  "content creator": "marketing",

  // General / Fallback
  default: "general-career",
};

/**
 * Curated podcast recommendations by category
 * Max 3 per category as per requirements
 */
export const PODCAST_RECOMMENDATIONS: PodcastRecommendation[] = [
  // ============================================
  // AI / Technology
  // ============================================
  {
    id: "ai-lex-fridman",
    goalCategory: "ai-technology",
    title: "Lex Fridman Podcast",
    episodeTitle: "AI, software, and the future of work",
    description:
      "Long-form conversations with engineers and researchers about AI and technology.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/2MAi0BvDc6GTFvKFPXnkCL",
    active: true,
  },
  {
    id: "ai-practical-ai",
    goalCategory: "ai-technology",
    title: "Practical AI",
    description: "How AI is applied in real companies and products.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/1LaCr5TFAgYPK5qHjP3XDp",
    active: true,
  },
  {
    id: "ai-machine-learning-guide",
    goalCategory: "ai-technology",
    title: "Machine Learning Guide",
    description:
      "Clear explanations of machine learning concepts for practitioners.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/5M9yZpSyF1jc7uFp2MlhP9",
    active: true,
  },

  // ============================================
  // Software Engineering
  // ============================================
  {
    id: "se-software-engineering-daily",
    goalCategory: "software-engineering",
    title: "Software Engineering Daily",
    description: "Practical discussions about real-world software engineering.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/6UCtBYL29hwhw4YbTdX83N",
    active: true,
  },
  {
    id: "se-syntax",
    goalCategory: "software-engineering",
    title: "Syntax",
    description:
      "Web development tips and career advice from working developers.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/4kYCRYJ3yK5DQbP5tbfZby",
    active: true,
  },
  {
    id: "se-codenewbie",
    goalCategory: "software-engineering",
    title: "CodeNewbie",
    description:
      "Stories from people on their coding journey, perfect for beginners.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/2T2OwucPOy2uDG1CUsjIMB",
    active: true,
  },

  // ============================================
  // Design / Creative
  // ============================================
  {
    id: "design-design-matters",
    goalCategory: "design-creative",
    title: "Design Matters",
    episodeTitle: "with Debbie Millman",
    description:
      "In-depth conversations with designers about creativity and career.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/6X0mWPYmLwxTijvIAOjqPG",
    active: true,
  },
  {
    id: "design-honest-designers",
    goalCategory: "design-creative",
    title: "The Honest Designers Show",
    description: "Real talk about the design industry and building a career.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/3QJoX9ZM3twWZ69XYb7ybp",
    active: true,
  },

  // ============================================
  // Business / Career
  // ============================================
  {
    id: "biz-how-i-built-this",
    goalCategory: "business-career",
    title: "How I Built This",
    description:
      "Founders and professionals discussing real career journeys.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/6E709HRH7XaiZrMfgtNCun",
    active: true,
  },
  {
    id: "biz-knowledge-project",
    goalCategory: "business-career",
    title: "The Knowledge Project",
    description:
      "Clear thinking, decision-making, and long-term career growth.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/1VyK52NSZHaDKeMJzT4TSM",
    active: true,
  },
  {
    id: "biz-masters-of-scale",
    goalCategory: "business-career",
    title: "Masters of Scale",
    description:
      "How successful companies grew, with insights for any career path.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/1bJRgaFZHuzifad4IAApFR",
    active: true,
  },

  // ============================================
  // Healthcare
  // ============================================
  {
    id: "health-healthcare-triage",
    goalCategory: "healthcare",
    title: "Healthcare Triage",
    description:
      "Evidence-based discussions about healthcare systems and careers.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/0K7sveL69sHJxPMJWz0JHT",
    active: true,
  },

  // ============================================
  // Finance
  // ============================================
  {
    id: "finance-planet-money",
    goalCategory: "finance",
    title: "Planet Money",
    description:
      "Makes economics and finance accessible and interesting.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/4FYpq3lSeQMAhqNI81O0Cn",
    active: true,
  },

  // ============================================
  // Trades
  // ============================================
  {
    id: "trades-blue-collar",
    goalCategory: "trades",
    title: "The Blue Collar Recruiter",
    description:
      "Insights about skilled trades careers and industry opportunities.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/3qIqJ2dHqEGGIqccLBXOeP",
    active: true,
  },

  // ============================================
  // Marketing
  // ============================================
  {
    id: "marketing-everyone-hates",
    goalCategory: "marketing",
    title: "Everyone Hates Marketers",
    description: "No-nonsense marketing advice without the hype.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/7iQXmUT7XGuZSzAMjoNWlX",
    active: true,
  },

  // ============================================
  // General Career (Fallback)
  // ============================================
  {
    id: "gen-how-i-built-this",
    goalCategory: "general-career",
    title: "How I Built This",
    description:
      "Founders and professionals discussing real career journeys.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/6E709HRH7XaiZrMfgtNCun",
    active: true,
  },
  {
    id: "gen-knowledge-project",
    goalCategory: "general-career",
    title: "The Knowledge Project",
    description:
      "Clear thinking, decision-making, and long-term career growth.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/1VyK52NSZHaDKeMJzT4TSM",
    active: true,
  },
  {
    id: "gen-ted-talks-daily",
    goalCategory: "general-career",
    title: "TED Talks Daily",
    description:
      "Ideas worth spreading - diverse perspectives on work and life.",
    platform: "spotify",
    externalUrl: "https://open.spotify.com/show/1VXcH8QHkjRcTCEd88U3ti",
    active: true,
  },
];

/**
 * Get podcast category from a goal title
 */
export function getPodcastCategoryFromGoal(goalTitle: string): string {
  const normalizedTitle = goalTitle.toLowerCase().trim();

  // Check for exact match first
  if (GOAL_TO_PODCAST_CATEGORY[normalizedTitle]) {
    return GOAL_TO_PODCAST_CATEGORY[normalizedTitle];
  }

  // Check for partial matches
  for (const [keyword, category] of Object.entries(GOAL_TO_PODCAST_CATEGORY)) {
    if (normalizedTitle.includes(keyword) || keyword.includes(normalizedTitle)) {
      return category;
    }
  }

  // Default fallback
  return "general-career";
}

/**
 * Get podcast recommendations for a goal
 * Returns max 3 active podcasts matching the goal category
 */
export function getPodcastsForGoal(goalTitle: string): PodcastRecommendation[] {
  const category = getPodcastCategoryFromGoal(goalTitle);

  return PODCAST_RECOMMENDATIONS.filter(
    (p) => p.goalCategory === category && p.active
  ).slice(0, 3);
}

/**
 * Check if a goal has podcast recommendations
 */
export function hasPodcastsForGoal(goalTitle: string): boolean {
  return getPodcastsForGoal(goalTitle).length > 0;
}

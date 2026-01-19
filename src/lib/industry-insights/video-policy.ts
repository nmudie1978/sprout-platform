/**
 * INDUSTRY INSIGHTS - VIDEO POLICY
 *
 * STRICT RULES for all video content in Industry Insights.
 *
 * CORE PRINCIPLE:
 * Videos must be educational, calm, factual, system-level (not personality-driven),
 * understandable by 16-20 year olds, and trusted by parents, schools, educators.
 *
 * Videos are NOT: social media content, influencer videos, vlogs, promotional
 * material, or entertainment-first content.
 *
 * RULES:
 * - Videos may ONLY come from Tier-1 institutions
 * - Maximum length: 8 minutes (target: 2-6 minutes)
 * - No autoplay, no "watch next", no algorithmic recommendations
 * - Every video must have written context and source attribution
 */

// ============================================
// TIER-1 VIDEO SOURCES
// ============================================

export const VIDEO_TIER1_SOURCES = {
  // Global / Cross-Industry
  WORLD_ECONOMIC_FORUM: "world_economic_forum",
  OECD: "oecd",
  UNESCO: "unesco",
  ILO: "ilo",

  // Healthcare / Medicine
  WHO: "who",
  NHS: "nhs",

  // Education / Research (Selective)
  MIT_OPENCOURSEWARE: "mit_opencourseware",

  // Conditional (Use Sparingly)
  TED: "ted",
} as const;

export type VideoTier1SourceId =
  (typeof VIDEO_TIER1_SOURCES)[keyof typeof VIDEO_TIER1_SOURCES];

// ============================================
// VIDEO SOURCE METADATA
// ============================================

export interface VideoSourceMeta {
  id: VideoTier1SourceId;
  name: string;
  shortName: string;
  youtubeChannel?: string;
  youtubeChannelId?: string;
  domain: string;
  description: string;
  useCases: string[];
  category: "global" | "healthcare" | "education" | "conditional";
  restrictions?: string;
}

export const VIDEO_SOURCE_METADATA: Record<VideoTier1SourceId, VideoSourceMeta> =
  {
    // Global / Cross-Industry
    [VIDEO_TIER1_SOURCES.WORLD_ECONOMIC_FORUM]: {
      id: VIDEO_TIER1_SOURCES.WORLD_ECONOMIC_FORUM,
      name: "World Economic Forum",
      shortName: "WEF",
      youtubeChannel: "World Economic Forum",
      youtubeChannelId: "UCw-kH-Od73XDAt7qtH9uBYA",
      domain: "weforum.org",
      description: "Global economic and workforce insights",
      useCases: [
        "Future of Jobs",
        "skills demand",
        "industry transformation",
        "global workforce trends",
      ],
      category: "global",
    },
    [VIDEO_TIER1_SOURCES.OECD]: {
      id: VIDEO_TIER1_SOURCES.OECD,
      name: "OECD",
      shortName: "OECD",
      youtubeChannel: "OECD",
      youtubeChannelId: "UC4QkDhPAyVxjrjdM6soaAVw",
      domain: "oecd.org",
      description: "International economic policy and employment analysis",
      useCases: [
        "employment trends",
        "education policy",
        "skills analysis",
        "labour market",
      ],
      category: "global",
    },
    [VIDEO_TIER1_SOURCES.UNESCO]: {
      id: VIDEO_TIER1_SOURCES.UNESCO,
      name: "UNESCO",
      shortName: "UNESCO",
      youtubeChannel: "UNESCO",
      youtubeChannelId: "UCwjMzP_K-a3IqAv0hpFCiXQ",
      domain: "unesco.org",
      description: "Education and skills development globally",
      useCases: [
        "education trends",
        "skills for the future",
        "vocational training",
      ],
      category: "global",
    },
    [VIDEO_TIER1_SOURCES.ILO]: {
      id: VIDEO_TIER1_SOURCES.ILO,
      name: "International Labour Organization",
      shortName: "ILO",
      youtubeChannel: "International Labour Organization",
      youtubeChannelId: "UC3H65aqFhLJyPW7VydY44jg",
      domain: "ilo.org",
      description: "Global labour standards and employment",
      useCases: [
        "youth employment",
        "decent work",
        "labour trends",
        "trade skills",
      ],
      category: "global",
    },

    // Healthcare / Medicine
    [VIDEO_TIER1_SOURCES.WHO]: {
      id: VIDEO_TIER1_SOURCES.WHO,
      name: "World Health Organization",
      shortName: "WHO",
      youtubeChannel: "World Health Organization (WHO)",
      youtubeChannelId: "UC07-dOwgza1IguKA86jqxNA",
      domain: "who.int",
      description: "Global health workforce and healthcare careers",
      useCases: [
        "healthcare workforce",
        "health careers",
        "medical skills",
        "global health",
      ],
      category: "healthcare",
    },
    [VIDEO_TIER1_SOURCES.NHS]: {
      id: VIDEO_TIER1_SOURCES.NHS,
      name: "National Health Service",
      shortName: "NHS",
      youtubeChannel: "NHS",
      domain: "nhs.uk",
      description: "Public healthcare system careers and training",
      useCases: ["healthcare careers", "nursing", "medical training"],
      category: "healthcare",
    },

    // Education / Research
    [VIDEO_TIER1_SOURCES.MIT_OPENCOURSEWARE]: {
      id: VIDEO_TIER1_SOURCES.MIT_OPENCOURSEWARE,
      name: "MIT OpenCourseWare",
      shortName: "MIT OCW",
      youtubeChannel: "MIT OpenCourseWare",
      youtubeChannelId: "UCEBb1b_L6zDS3xTUrIALZOw",
      domain: "ocw.mit.edu",
      description: "Educational content from MIT",
      useCases: ["technology concepts", "engineering basics", "science"],
      category: "education",
      restrictions: "Only short explainer-style videos (not full lectures)",
    },

    // Conditional (Use Sparingly)
    [VIDEO_TIER1_SOURCES.TED]: {
      id: VIDEO_TIER1_SOURCES.TED,
      name: "TED",
      shortName: "TED",
      youtubeChannel: "TED",
      youtubeChannelId: "UCAuUUnT6oDeKwE6v1GHlLw",
      domain: "ted.com",
      description: "Ideas worth spreading - selected talks only",
      useCases: [
        "system explanations",
        "industry overviews",
        "work patterns",
        "skills development",
      ],
      category: "conditional",
      restrictions:
        "Only talks that explain systems or industries. Must be framed as perspective, not prediction. Never personality- or hype-driven.",
    },
  };

// ============================================
// DISALLOWED VIDEO SOURCES
// ============================================

/**
 * These video sources are NEVER permitted in Industry Insights.
 */
export const DISALLOWED_VIDEO_SOURCES = [
  // YouTube Creators / Influencers
  "cnbc",
  "bloomberg",
  "vice",
  "vox",
  "buzzfeed",
  "insider",
  "tech insider",
  "business insider",

  // Day in the Life / Vlogs
  "day in the life",
  "vlog",
  "shadowing",
  "follow me",

  // Influencer channels
  "ali abdaal",
  "graham stephan",
  "andrei jikh",
  "mike rowe",
  "tech career insider",
  "tech lead",
  "joma tech",
  "mayuko",

  // Company marketing
  "google",
  "microsoft",
  "amazon",
  "meta",
  "apple",
  "salesforce",
  "hubspot",

  // Social media style
  "tiktok",
  "shorts",
  "reels",
  "instagram",

  // Podcasts
  "podcast",
  "joe rogan",
  "lex fridman",

  // Motivational / Hype
  "gary vee",
  "gary vaynerchuk",
  "tony robbins",
  "motivational",
  "hustle",
  "grind",

  // Stanford (personality-driven commencement speeches)
  "stanford",
  "commencement",
] as const;

// ============================================
// VIDEO LENGTH CONSTRAINTS
// ============================================

export const VIDEO_LENGTH_CONSTRAINTS = {
  /** Target minimum length in seconds */
  targetMinSeconds: 120, // 2 minutes
  /** Target maximum length in seconds */
  targetMaxSeconds: 360, // 6 minutes
  /** Absolute maximum length in seconds */
  absoluteMaxSeconds: 480, // 8 minutes
  /** Warning threshold in seconds */
  warningThresholdSeconds: 420, // 7 minutes
} as const;

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Check if a source ID is a valid Tier-1 video source
 */
export function isVideoTier1Source(
  sourceId: string
): sourceId is VideoTier1SourceId {
  return Object.values(VIDEO_TIER1_SOURCES).includes(
    sourceId as VideoTier1SourceId
  );
}

/**
 * Get video source metadata by ID
 */
export function getVideoSource(sourceId: string): VideoSourceMeta | null {
  if (!isVideoTier1Source(sourceId)) {
    return null;
  }
  return VIDEO_SOURCE_METADATA[sourceId];
}

/**
 * Check if a channel name is from a disallowed source
 */
export function isDisallowedChannel(channelName: string): boolean {
  const lowerChannel = channelName.toLowerCase();
  return DISALLOWED_VIDEO_SOURCES.some((disallowed) =>
    lowerChannel.includes(disallowed)
  );
}

/**
 * Check if a video title contains disallowed content patterns
 */
export function isDisallowedTitle(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  const disallowedPatterns = [
    "day in the life",
    "vlog",
    "how i make",
    "how i earn",
    "salary reveal",
    "get rich",
    "millionaire",
    "passive income",
  ];
  return disallowedPatterns.some((pattern) => lowerTitle.includes(pattern));
}

/**
 * Parse duration string (e.g., "12:34" or "1:23:45") to seconds
 */
export function parseDurationToSeconds(duration: string): number {
  const parts = duration.split(":").map(Number);
  if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * Format seconds to duration string (e.g., "12:34")
 */
export function formatSecondsToDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Validate video duration against policy constraints
 */
export function validateVideoDuration(durationString: string): {
  valid: boolean;
  seconds: number;
  warning?: string;
  error?: string;
} {
  const seconds = parseDurationToSeconds(durationString);

  if (seconds === 0) {
    return {
      valid: false,
      seconds: 0,
      error: "Could not parse video duration",
    };
  }

  if (seconds > VIDEO_LENGTH_CONSTRAINTS.absoluteMaxSeconds) {
    return {
      valid: false,
      seconds,
      error: `Video exceeds maximum length of ${VIDEO_LENGTH_CONSTRAINTS.absoluteMaxSeconds / 60} minutes (${formatSecondsToDuration(seconds)})`,
    };
  }

  if (seconds > VIDEO_LENGTH_CONSTRAINTS.warningThresholdSeconds) {
    return {
      valid: true,
      seconds,
      warning: `Video is longer than recommended (${formatSecondsToDuration(seconds)}). Consider using an excerpt.`,
    };
  }

  if (seconds < VIDEO_LENGTH_CONSTRAINTS.targetMinSeconds) {
    return {
      valid: true,
      seconds,
      warning: `Video is shorter than target minimum (${formatSecondsToDuration(seconds)})`,
    };
  }

  return {
    valid: true,
    seconds,
  };
}

// ============================================
// VIDEO VALIDATION RESULT
// ============================================

export interface VideoValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Comprehensive video validation
 */
export function validateVideo(video: {
  sourceId?: string;
  channel?: string;
  title: string;
  duration?: string;
  description?: string;
}): VideoValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Source validation
  if (video.sourceId && !isVideoTier1Source(video.sourceId)) {
    errors.push(
      `Source "${video.sourceId}" is not a Tier-1 video source. ` +
        `Allowed sources: ${Object.values(VIDEO_TIER1_SOURCES).join(", ")}`
    );
  }

  // 2. Channel validation
  if (video.channel) {
    if (isDisallowedChannel(video.channel)) {
      errors.push(
        `Channel "${video.channel}" is from a disallowed source. ` +
          "Only Tier-1 institutional channels are permitted."
      );
    }

    // Check if channel matches a known Tier-1 source
    const matchedSource = Object.values(VIDEO_SOURCE_METADATA).find(
      (source) =>
        source.youtubeChannel?.toLowerCase() === video.channel?.toLowerCase()
    );
    if (!matchedSource && !video.sourceId) {
      warnings.push(
        `Channel "${video.channel}" is not a recognised Tier-1 source. Please verify.`
      );
    }
  }

  // 3. Title validation
  if (isDisallowedTitle(video.title)) {
    errors.push(
      `Video title "${video.title}" contains disallowed content patterns (e.g., "day in the life", "vlog").`
    );
  }

  // Check for hype language in title
  const hypeWords = [
    "exploding",
    "insane",
    "crazy",
    "guaranteed",
    "secret",
    "hack",
    "hustle",
  ];
  const lowerTitle = video.title.toLowerCase();
  const foundHype = hypeWords.filter((word) => lowerTitle.includes(word));
  if (foundHype.length > 0) {
    warnings.push(
      `Video title contains hype language: "${foundHype.join(", ")}". Consider a more neutral framing.`
    );
  }

  // 4. Duration validation
  if (video.duration) {
    const durationResult = validateVideoDuration(video.duration);
    if (!durationResult.valid && durationResult.error) {
      errors.push(durationResult.error);
    }
    if (durationResult.warning) {
      warnings.push(durationResult.warning);
    }
  }

  // 5. Description validation (must have context)
  if (!video.description || video.description.trim().length < 20) {
    warnings.push(
      "Video should have a written summary (2-4 sentences) explaining what it covers and why it's relevant."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// VIDEO METADATA STRUCTURE
// ============================================

export interface VideoMetadata {
  /** Tier-1 source ID */
  sourceId: VideoTier1SourceId;
  /** Source display name */
  sourceName: string;
  /** YouTube video ID */
  videoId: string;
  /** Video title */
  title: string;
  /** Written summary (2-4 sentences) */
  summary: string;
  /** Why this video is relevant (1 sentence) */
  whyRelevant?: string;
  /** Duration string (e.g., "5:30") */
  duration: string;
  /** Duration in seconds */
  durationSeconds: number;
  /** YouTube channel name */
  channel: string;
  /** Industry category */
  industry: string;
  /** Topic tag */
  topic?: string;
  /** Framing line for display */
  framingLine: string;
}

/**
 * Create properly framed video metadata
 */
export function createVideoMetadata(input: {
  sourceId: VideoTier1SourceId;
  videoId: string;
  title: string;
  summary: string;
  whyRelevant?: string;
  duration: string;
  industry: string;
  topic?: string;
}): VideoMetadata {
  const source = VIDEO_SOURCE_METADATA[input.sourceId];
  const durationSeconds = parseDurationToSeconds(input.duration);

  return {
    sourceId: input.sourceId,
    sourceName: source.name,
    videoId: input.videoId,
    title: input.title,
    summary: input.summary,
    whyRelevant: input.whyRelevant,
    duration: input.duration,
    durationSeconds,
    channel: source.youtubeChannel || source.name,
    industry: input.industry,
    topic: input.topic,
    framingLine: `This short video from ${source.shortName} explains how this industry is changing globally.`,
  };
}

// ============================================
// EXPORT HELPERS
// ============================================

export const ALL_VIDEO_TIER1_SOURCE_IDS = Object.values(VIDEO_TIER1_SOURCES);

/**
 * Get all video sources for a specific category
 */
export function getVideoSourcesByCategory(
  category: VideoSourceMeta["category"]
): VideoSourceMeta[] {
  return Object.values(VIDEO_SOURCE_METADATA).filter(
    (source) => source.category === category
  );
}

/**
 * Get video sources appropriate for an industry
 */
export function getVideoSourcesForIndustry(
  industry: string
): VideoSourceMeta[] {
  // Global sources apply to all industries
  const globalSources = getVideoSourcesByCategory("global");
  const conditionalSources = getVideoSourcesByCategory("conditional");

  switch (industry.toLowerCase()) {
    case "healthcare":
    case "health":
      return [
        ...globalSources,
        ...getVideoSourcesByCategory("healthcare"),
        ...conditionalSources,
      ];
    case "technology":
    case "tech":
      return [
        ...globalSources,
        ...getVideoSourcesByCategory("education"),
        ...conditionalSources,
      ];
    default:
      return [...globalSources, ...conditionalSources];
  }
}

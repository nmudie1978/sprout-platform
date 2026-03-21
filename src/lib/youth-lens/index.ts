/**
 * YOUTH LENS — PUBLIC API
 *
 * Barrel export for the relevance-driven video matching system.
 */

// Types
export type {
  VideoAsset,
  VideoType,
  VideoSource,
  StatInsight,
  MatchConfig,
  VideoMatchResult,
  VideoScoreDebug,
  MatchDebugInfo,
} from "./types";

export {
  VIDEO_TYPE_LABELS,
  VIDEO_SOURCE_LABELS,
  formatDuration,
} from "./types";

// Tags
export type { CanonicalTag } from "./tags";
export {
  CANONICAL_TAGS,
  normaliseTag,
  normaliseTags,
  isCanonicalTag,
} from "./tags";

// Stat insights
export {
  STAT_INSIGHTS,
  getStatInsight,
  getAllStatInsights,
} from "./stat-insights";

// Approved video pool
export {
  APPROVED_VIDEOS,
  getApprovedVideos,
  getApprovedVideo,
  getApprovedVideosByType,
} from "./approved-videos";

// Matching algorithm
export {
  DEFAULT_MATCH_CONFIG,
  matchVideosToStat,
  matchAllStats,
  matchVideosToStatDebug,
} from "./match-videos-to-stat";

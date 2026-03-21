/**
 * YOUTH LENS VIDEO MATCHING — TYPE DEFINITIONS
 *
 * Data models for the relevance-driven video matching system.
 * Designed for curated content with deterministic, explainable scoring.
 */

// ============================================
// VIDEO TYPES
// ============================================

export type VideoType = "story" | "day_in_life" | "explainer";

export type VideoSource = "youtube" | "ted" | "endeavrly";

export interface VideoAsset {
  id: string;
  title: string;
  description?: string;
  type: VideoType;
  source: VideoSource;
  embedUrl: string;
  thumbnailUrl: string;
  durationSec: number;
  publishedAt: string; // ISO date
  channelName?: string;

  // Relevance signals
  tags: string[]; // canonical tags from tags.ts

  // TODO: Replace tagScore with semantic similarity using transcript embeddings.
  transcriptText?: string; // optional (for smarter matching later)

  // Quality / governance signals
  signals?: {
    hasTranscript?: boolean;
    /** Precomputed: video likely features a real person talking */
    humanLikely?: boolean;
    // TODO: Add automated human detection using thumbnail face detection.
    /** Precomputed: video likely uses animation/motion graphics */
    animatedLikely?: boolean;
    /** Source is on verified/trusted channel list */
    verifiedSource?: boolean;
  };
}

// ============================================
// STAT INSIGHT TYPES
// ============================================

export interface StatInsight {
  id: string;
  headline: string;
  explanation: string;
  sourceLabel?: string; // e.g. "OECD · 2025"
  tags: string[]; // canonical tags, ordered by importance (primary first)
}

// ============================================
// MATCH CONFIGURATION
// ============================================

export interface MatchConfig {
  /** Maximum videos to return per stat (default 3) */
  maxVideos: number;
  /** Minimum confidence threshold; below this, return empty (default 0.30) */
  minConfidence: number;
  /** Only include videos published within this many months (default 60) */
  recencyMonths: number;
  /** Minimum video duration in seconds (default 30) */
  minDurationSec: number;
  /** Maximum video duration in seconds (default 900 = 15 min) */
  maxDurationSec: number;
  /** Prefer human-presented content over animated (default true) */
  preferHuman: boolean;
  /** Diversity target: aim for one of each type if available */
  diversityTarget: VideoType[];
}

// ============================================
// MATCH RESULT
// ============================================

export interface VideoMatchResult {
  statId: string;
  videos: VideoAsset[];
  /** Best match confidence score (0–1) */
  confidence: number;
  /** Human-readable reason (for debugging/admin transparency) */
  reason?: string;
}

// ============================================
// DEBUG TYPES
// ============================================

export interface VideoScoreDebug {
  videoId: string;
  title: string;
  tagScore: number;
  freshnessScore: number;
  humanScore: number;
  qualityScore: number;
  totalScore: number;
  filtered: boolean;
  filterReason?: string;
}

export interface MatchDebugInfo {
  statId: string;
  poolSize: number;
  afterHardFilter: number;
  topScores: VideoScoreDebug[];
  selectedIds: string[];
  confidence: number;
}

// ============================================
// DISPLAY HELPERS
// ============================================

export const VIDEO_TYPE_LABELS: Record<VideoType, string> = {
  story: "Story",
  day_in_life: "Day in the Life",
  explainer: "Explainer",
};

export const VIDEO_SOURCE_LABELS: Record<VideoSource, string> = {
  youtube: "YouTube",
  ted: "TED",
  endeavrly: "Endeavrly Original",
};

/**
 * Convert duration in seconds to display string (e.g. "5:27")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

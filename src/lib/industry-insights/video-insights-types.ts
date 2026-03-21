/**
 * VIDEO INSIGHTS TYPES
 *
 * Structured, curated short-form video integration for Youth Lens stat cards.
 *
 * Videos must be manually curated by admin.
 * Future: CMS-based moderation system.
 * No user-submitted videos at MVP stage.
 */

// ============================================
// VIDEO INSIGHT TYPES
// ============================================

export type VideoInsightType = "story" | "day_in_life" | "explainer";

export type VideoInsightSource = "youtube" | "ted" | "endeavrly";

export interface VideoInsight {
  id: string;
  title: string;
  description: string;
  /** Duration string, e.g. "2:30" or "4:15" */
  duration: string;
  type: VideoInsightType;
  source: VideoInsightSource;
  /** Full embed URL (e.g. https://www.youtube.com/embed/VIDEO_ID) */
  embedUrl: string;
  /** Thumbnail image URL */
  thumbnailUrl: string;
}

export interface IndustryStatInsight {
  id: string;
  headline: string;
  percentage?: string;
  summary: string;
  /** Youth-specific context explaining why this stat matters for 15-23 year olds */
  explanation: string;
  videos: VideoInsight[];
}

// ============================================
// DISPLAY LABELS
// ============================================

export const VIDEO_TYPE_LABELS: Record<VideoInsightType, string> = {
  story: "Story",
  day_in_life: "Day in the Life",
  explainer: "Explainer",
};

export const VIDEO_SOURCE_LABELS: Record<VideoInsightSource, string> = {
  youtube: "YouTube",
  ted: "TED",
  endeavrly: "Endeavrly Original",
};

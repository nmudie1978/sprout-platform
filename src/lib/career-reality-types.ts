/** Types for the "The Reality" section in Understand */

export type RealityVideoType = 'harsh_truth' | 'day_in_the_life' | 'balanced';

export interface RealityVideo {
  videoId: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
  whySelected: string;
  videoType: RealityVideoType;
}

export interface RealityCheckResult {
  career: string;
  realitySummary: string;
  realityPoints: string[];
  fitSignal: string;
  videos: RealityVideo[];
  /**
   * True only on the immediate cold-cache response, while the richer AI summary
   * + videos are still being generated in the background. The client shows
   * curated/placeholder content and polls until a non-pending result is cached.
   */
  pending?: boolean;
}

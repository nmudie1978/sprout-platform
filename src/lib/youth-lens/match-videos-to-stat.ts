/**
 * YOUTH LENS — VIDEO MATCHING ALGORITHM
 *
 * Deterministic, explainable scoring system that matches curated videos
 * to research stat insights based on tag overlap, freshness, human
 * presentation, and quality signals.
 *
 * Scoring weights:
 *   0.55 × tagScore
 *   0.20 × freshnessScore
 *   0.15 × humanScore
 *   0.10 × qualityScore
 *
 * Diversity selection aims for one of each VideoType when possible.
 */

import type {
  VideoAsset,
  StatInsight,
  MatchConfig,
  VideoMatchResult,
  VideoScoreDebug,
  MatchDebugInfo,
  VideoType,
} from "./types";
import { normaliseTags } from "./tags";

// ============================================
// DEFAULT CONFIGURATION
// ============================================

export const DEFAULT_MATCH_CONFIG: MatchConfig = {
  maxVideos: 3,
  minConfidence: 0.3,
  recencyMonths: 240, // 20 years — curated TED content is evergreen
  minDurationSec: 30,
  maxDurationSec: 900,
  preferHuman: true,
  diversityTarget: ["story", "day_in_life", "explainer"],
};

// ============================================
// SCORING WEIGHTS
// ============================================

const WEIGHT_TAG = 0.55;
const WEIGHT_FRESHNESS = 0.20;
const WEIGHT_HUMAN = 0.15;
const WEIGHT_QUALITY = 0.10;

/** Primary tags (first 2 in the stat's tag list) get a 1.5× boost. */
const PRIMARY_TAG_BOOST = 1.5;

// ============================================
// HARD FILTERS
// ============================================

/**
 * Apply hard filters to remove videos that should never be shown.
 * Returns the filtered pool and filter reasons for debug.
 */
function applyHardFilters(
  videos: VideoAsset[],
  config: MatchConfig,
): { passed: VideoAsset[]; debugFiltered: VideoScoreDebug[] } {
  const now = new Date();
  const cutoffDate = new Date(now);
  cutoffDate.setMonth(cutoffDate.getMonth() - config.recencyMonths);

  const passed: VideoAsset[] = [];
  const debugFiltered: VideoScoreDebug[] = [];

  for (const video of videos) {
    let filtered = false;
    let filterReason = "";

    // Duration check
    if (video.durationSec < config.minDurationSec) {
      filtered = true;
      filterReason = `Duration ${video.durationSec}s < min ${config.minDurationSec}s`;
    } else if (video.durationSec > config.maxDurationSec) {
      filtered = true;
      filterReason = `Duration ${video.durationSec}s > max ${config.maxDurationSec}s`;
    }

    // Recency check
    if (!filtered && video.publishedAt) {
      const publishDate = new Date(video.publishedAt);
      if (publishDate < cutoffDate) {
        filtered = true;
        filterReason = `Published ${video.publishedAt} is older than ${config.recencyMonths} months`;
      }
    }

    // Valid embed URL check
    if (!filtered && !video.embedUrl) {
      filtered = true;
      filterReason = "Missing embedUrl";
    }

    // Animated exclusion (when preferHuman is true)
    if (
      !filtered &&
      config.preferHuman &&
      video.signals?.animatedLikely &&
      !video.signals?.humanLikely
    ) {
      filtered = true;
      filterReason = "Animated-only content excluded (preferHuman=true)";
    }

    if (filtered) {
      debugFiltered.push({
        videoId: video.id,
        title: video.title,
        tagScore: 0,
        freshnessScore: 0,
        humanScore: 0,
        qualityScore: 0,
        totalScore: 0,
        filtered: true,
        filterReason,
      });
    } else {
      passed.push(video);
    }
  }

  return { passed, debugFiltered };
}

// ============================================
// SCORING FUNCTIONS
// ============================================

/**
 * Tag overlap score with primary tag boost.
 * Primary tags are the first 2 tags in the stat's ordered tag list.
 */
function computeTagScore(stat: StatInsight, video: VideoAsset): number {
  const statTags = normaliseTags(stat.tags);
  const videoTags = new Set(normaliseTags(video.tags));

  if (statTags.length === 0) return 0;

  const primaryTags = new Set(statTags.slice(0, 2));
  let weightedMatches = 0;
  let totalWeight = 0;

  for (const tag of statTags) {
    const weight = primaryTags.has(tag) ? PRIMARY_TAG_BOOST : 1;
    totalWeight += weight;
    if (videoTags.has(tag)) {
      weightedMatches += weight;
    }
  }

  return totalWeight > 0 ? weightedMatches / totalWeight : 0;
}

/**
 * Freshness score: 1.0 for just-published, decays linearly to 0.0
 * at the recency cutoff.
 */
function computeFreshnessScore(
  video: VideoAsset,
  recencyMonths: number,
): number {
  if (!video.publishedAt) return 0.5; // Unknown date gets neutral score

  const now = new Date();
  const publishDate = new Date(video.publishedAt);
  const monthsOld =
    (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

  return Math.max(0, 1 - monthsOld / recencyMonths);
}

/**
 * Human presentation score.
 * humanLikely: 1.0, unknown: 0.5, animatedLikely: penalty.
 */
function computeHumanScore(video: VideoAsset): number {
  let score = 0.5; // default unknown

  if (video.signals?.humanLikely) {
    score = 1.0;
  }
  if (video.signals?.animatedLikely) {
    score -= 0.3;
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Quality score based on verified source and transcript availability.
 */
function computeQualityScore(video: VideoAsset): number {
  let score = 0.5; // baseline

  if (video.signals?.verifiedSource) {
    score += 0.3;
  }
  if (video.signals?.hasTranscript) {
    score += 0.2;
  }

  return Math.min(1, score);
}

/**
 * Compute the weighted total score for a video against a stat.
 */
function scoreVideo(
  stat: StatInsight,
  video: VideoAsset,
  config: MatchConfig,
): VideoScoreDebug {
  const tagScore = computeTagScore(stat, video);
  const freshnessScore = computeFreshnessScore(video, config.recencyMonths);
  const humanScore = computeHumanScore(video);
  const qualityScore = computeQualityScore(video);

  const totalScore =
    WEIGHT_TAG * tagScore +
    WEIGHT_FRESHNESS * freshnessScore +
    WEIGHT_HUMAN * humanScore +
    WEIGHT_QUALITY * qualityScore;

  return {
    videoId: video.id,
    title: video.title,
    tagScore,
    freshnessScore,
    humanScore,
    qualityScore,
    totalScore,
    filtered: false,
  };
}

// ============================================
// DIVERSITY SELECTION
// ============================================

/**
 * Select up to maxVideos from scored candidates, aiming for type diversity.
 *
 * Strategy: pick the best-scoring video of each target type first,
 * then fill remaining slots with highest-scoring remaining videos.
 */
function diversitySelect(
  scoredVideos: { video: VideoAsset; debug: VideoScoreDebug }[],
  config: MatchConfig,
): { video: VideoAsset; debug: VideoScoreDebug }[] {
  if (scoredVideos.length <= config.maxVideos) return scoredVideos;

  // Sort by total score descending
  const sorted = [...scoredVideos].sort(
    (a, b) => b.debug.totalScore - a.debug.totalScore,
  );

  const selected: { video: VideoAsset; debug: VideoScoreDebug }[] = [];
  const usedIds = new Set<string>();

  // Phase 1: pick best of each target type
  for (const targetType of config.diversityTarget) {
    if (selected.length >= config.maxVideos) break;
    const candidate = sorted.find(
      (s) => s.video.type === targetType && !usedIds.has(s.video.id),
    );
    if (candidate) {
      selected.push(candidate);
      usedIds.add(candidate.video.id);
    }
  }

  // Phase 2: fill remaining with top scorers
  for (const candidate of sorted) {
    if (selected.length >= config.maxVideos) break;
    if (!usedIds.has(candidate.video.id)) {
      selected.push(candidate);
      usedIds.add(candidate.video.id);
    }
  }

  return selected;
}

// ============================================
// MAIN MATCHING FUNCTION
// ============================================

/**
 * Match videos from the approved pool to a stat insight.
 *
 * Returns the best matching videos (up to maxVideos), with confidence
 * score and optional debug info.
 */
export function matchVideosToStat(
  stat: StatInsight,
  videoPool: VideoAsset[],
  configOverrides?: Partial<MatchConfig>,
): VideoMatchResult {
  const config: MatchConfig = { ...DEFAULT_MATCH_CONFIG, ...configOverrides };

  // Step 1: Hard filters
  const { passed } = applyHardFilters(videoPool, config);

  if (passed.length === 0) {
    return {
      statId: stat.id,
      videos: [],
      confidence: 0,
      reason: "No videos passed hard filters",
    };
  }

  // Step 2: Score all passing videos
  const scored = passed.map((video) => ({
    video,
    debug: scoreVideo(stat, video, config),
  }));

  // Step 3: Diversity selection
  const selected = diversitySelect(scored, config);

  // Step 4: Compute confidence as the best match score
  const confidence =
    selected.length > 0
      ? Math.max(...selected.map((s) => s.debug.totalScore))
      : 0;

  // Step 5: Apply confidence threshold
  if (confidence < config.minConfidence) {
    return {
      statId: stat.id,
      videos: [],
      confidence,
      reason: `Best confidence ${confidence.toFixed(2)} below threshold ${config.minConfidence}`,
    };
  }

  return {
    statId: stat.id,
    videos: selected.map((s) => s.video),
    confidence,
    reason: `Matched ${selected.length} video(s) with confidence ${confidence.toFixed(2)}`,
  };
}

// ============================================
// BATCH MATCHING
// ============================================

/**
 * Match videos to multiple stat insights at once.
 * Returns one VideoMatchResult per stat.
 */
export function matchAllStats(
  stats: StatInsight[],
  videoPool: VideoAsset[],
  configOverrides?: Partial<MatchConfig>,
): VideoMatchResult[] {
  return stats.map((stat) => matchVideosToStat(stat, videoPool, configOverrides));
}

// ============================================
// DEBUG MATCHING
// ============================================

/**
 * Run matching with full debug output.
 * Only use in development or when NEXT_PUBLIC_DEBUG_MATCHING is enabled.
 */
export function matchVideosToStatDebug(
  stat: StatInsight,
  videoPool: VideoAsset[],
  configOverrides?: Partial<MatchConfig>,
): MatchDebugInfo {
  const config: MatchConfig = { ...DEFAULT_MATCH_CONFIG, ...configOverrides };

  // Hard filters
  const { passed, debugFiltered } = applyHardFilters(videoPool, config);

  // Score all passing videos
  const scored = passed.map((video) => ({
    video,
    debug: scoreVideo(stat, video, config),
  }));

  // Sort by score for debug output
  const sortedScored = [...scored].sort(
    (a, b) => b.debug.totalScore - a.debug.totalScore,
  );

  // Diversity selection
  const selected = diversitySelect(scored, config);
  const confidence =
    selected.length > 0
      ? Math.max(...selected.map((s) => s.debug.totalScore))
      : 0;

  return {
    statId: stat.id,
    poolSize: videoPool.length,
    afterHardFilter: passed.length,
    topScores: [
      ...sortedScored.map((s) => s.debug),
      ...debugFiltered,
    ],
    selectedIds:
      confidence >= config.minConfidence
        ? selected.map((s) => s.video.id)
        : [],
    confidence,
  };
}

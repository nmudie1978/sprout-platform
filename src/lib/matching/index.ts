/**
 * Matching Engine — Public API
 *
 * Import from '@/lib/matching' to use the engine.
 */

export {
  rankCareers,
  getMatchReasonsFromEngine,
  getMatchResultForCareer,
  debugScoreCareerV2,
  buildCareerProfile,
  buildUserProfile,
  scoreCareer,
  clearProfileCache,
} from "./engine";

export type {
  CareerMatchProfile,
  UserMatchProfile,
  MatchResult,
  DimensionScore,
  MatchingWeights,
  MatchingConfig,
} from "./types";

export { MATCHING_CONFIG } from "./config";

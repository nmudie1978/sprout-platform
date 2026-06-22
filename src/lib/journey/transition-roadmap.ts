/**
 * Transition-roadmap helpers.
 *
 * For a "Not in work" (between) or career-change (other) starting point,
 * the main roadmap must read as a practical RETURN-TO-WORK / transition
 * path — transferable skills → proof/portfolio → supported way in → first
 * role → growth — NOT a school-leaver's multi-year university ladder.
 *
 * The AI prompt is told this, but LLMs still occasionally bolt a
 * "Begin university studies → Complete your degree" spine onto a
 * degree-associated career (e.g. Animator). This deterministic filter is
 * the safety net: it strips formal multi-year academic steps from a
 * transition roadmap so the result can never contradict the bridge map.
 *
 * It only removes `education` steps that are clearly about a university
 * DEGREE — it deliberately keeps vocational fagbrev/fagskole (the genuine
 * route into a trade), short courses, and certifications, which are valid
 * fast routes for a career-changer.
 */

/** Matches university-degree language but NOT fagbrev/fagskole/short courses. */
const DEGREE_STEP_RE =
  /\b(universit\w*|bachelor'?s?|master'?s?|ph\.?\s?d|doctorate|profesjon\w*|videreg\w*)\b|\bdegree\b|\bgraduat\w*\b/i;

interface RoadmapStepLike {
  stage: string;
  title: string;
  description?: string;
}

/** True if this step is a university-degree education step (to be removed). */
export function isFormalDegreeStep(step: RoadmapStepLike): boolean {
  if (step.stage !== 'education') return false;
  return DEGREE_STEP_RE.test(`${step.title} ${step.description ?? ''}`);
}

/**
 * Remove university-degree education steps from a transition roadmap.
 * Returns a NEW array; non-education and non-degree steps are preserved
 * in order. If every step somehow matched (it won't in practice), the
 * original list is returned unchanged so we never produce an empty roadmap.
 */
export function stripFormalEducationSteps<T extends RoadmapStepLike>(items: T[]): T[] {
  const kept = items.filter((it) => !isFormalDegreeStep(it));
  return kept.length > 0 ? kept : items;
}

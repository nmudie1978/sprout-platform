/**
 * Condense a career-changer's transition roadmap by marking the early
 * "leverage transferable skills" + "build a portfolio / proof" steps as
 * happening IN PARALLEL (a shared `concurrentGroup`) rather than one after the
 * other. The renderers then draw them as a single stacked stop, and aligning
 * their ages shortens the overall span.
 *
 * Pure + deterministic. Only the FIRST matching adjacent pair is grouped, and
 * only when neither step is already grouped — safe to run on any journey.
 */

import type { JourneyItem } from './career-journey-types';

const SKILLS_RE = /transferable|leverage|your strengths|existing skills/i;
const PROOF_RE = /portfolio|proof|projects?\b|case study|work samples/i;

export const TRANSITION_PARALLEL_GROUP = 'transition-parallel';

export function groupConcurrentTransitionSteps(items: JourneyItem[]): JourneyItem[] {
  for (let i = 0; i < items.length - 1; i++) {
    const a = items[i];
    const b = items[i + 1];
    if (
      a.stage !== 'experience' ||
      b.stage !== 'experience' ||
      a.concurrentGroup != null ||
      b.concurrentGroup != null
    ) {
      continue;
    }
    const pair =
      (SKILLS_RE.test(a.title) && PROOF_RE.test(b.title)) ||
      (PROOF_RE.test(a.title) && SKILLS_RE.test(b.title));
    if (!pair) continue;

    const start = Math.min(a.startAge, b.startAge);
    const end = Math.max(a.endAge ?? a.startAge, b.endAge ?? b.startAge);
    const next = [...items];
    next[i] = { ...a, startAge: start, endAge: end, concurrentGroup: TRANSITION_PARALLEL_GROUP };
    next[i + 1] = { ...b, startAge: start, endAge: end, concurrentGroup: TRANSITION_PARALLEL_GROUP };
    return next;
  }
  return items;
}

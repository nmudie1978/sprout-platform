/**
 * First-Role Enricher
 *
 * Post-processes a generated Journey (AI or fallback) to inject a real
 * suggested first role into the "accept your first entry-level role"
 * step, sourced from career-requirements.json's entryLevelRequirements.
 *
 * Matches the PDF report's "First Role" concept (McKinsey · Business
 * Analyst · Oslo): real, curated, per-career, with a reason the user
 * can see in the step's detail dialog.
 *
 * If the career has no entry-level record (~72 truly pathless careers),
 * this is a no-op and the generic step copy remains.
 */

import type { Journey, JourneyItem } from './career-journey-types';
import { getFirstRoleSuggestion } from '@/lib/education';

const FIRST_ROLE_STEP_RE = /accept.*(?:first|entry)|start.*first|begin.*first|first.*entry/i;

export function enrichFirstRoleStep(journey: Journey): Journey {
  const suggestion = getFirstRoleSuggestion(journey.career);
  if (!suggestion) return journey;

  const idx = journey.items.findIndex((it) => FIRST_ROLE_STEP_RE.test(it.title));
  if (idx < 0) return journey;

  const original = journey.items[idx];
  const enriched: JourneyItem = {
    ...original,
    // Surface the curated role as the step subtitle so it reads like
    // the PDF's First Role card ("McKinsey · Business Analyst"), while
    // the step title stays in the imperative ("Accept your first
    // entry-level role") for the roadmap timeline.
    subtitle: suggestion.role,
    description: buildReason(journey.career, suggestion),
  };

  const items = [...journey.items];
  items[idx] = enriched;
  return { ...journey, items };
}

function buildReason(
  career: string,
  s: { role: string; description: string; whatYouNeed: string },
): string {
  const parts: string[] = [];
  parts.push(
    `${s.role} is a realistic first role on the path to becoming a ${career}.`,
  );
  if (s.description) parts.push(s.description);
  if (s.whatYouNeed) parts.push(`You'll be ready for this because: ${s.whatYouNeed}`);
  return parts.join(' ');
}

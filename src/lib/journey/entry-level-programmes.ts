/**
 * Entry-level routes & programmes — shared source.
 *
 * The Career Transition mindmap's "Structured ways in" branch and the matching
 * "Entry-level routes & programmes" roadmap scenario both point a career-changer
 * at the same concrete routes in. Keeping the portal URLs + the reframe tip here
 * (one place) means the mindmap leaves and the roadmap step never drift apart.
 *
 * Bundle-light: imports only the `CareerCategory` *type* (erased) + the
 * trainee-programmes list — never the career catalogue.
 */

import type { SuggestedResource } from './career-journey-types';
import type { CareerCategory } from '@/lib/career-pathways';
import { getTraineeProgrammesForCategory } from './trainee-programmes';

/** Stable portal URLs, shared with the mindmap `programmes` branch leaves. */
export const ENTRY_LEVEL_PORTAL_URLS = {
  apprenticeships: 'https://utdanning.no',
  jobs: 'https://www.finn.no/job',
  earlyCareer: 'https://careers.linkedin.com/pathways-programs',
} as const;

/** Always-relevant entry-level portals as roadmap-step resources. */
export const ENTRY_LEVEL_PORTALS: SuggestedResource[] = [
  { label: 'Apprenticeships (lærling) — utdanning.no', url: ENTRY_LEVEL_PORTAL_URLS.apprenticeships, type: 'platform' },
  { label: 'Entry-level & trainee jobs — finn.no/job', url: ENTRY_LEVEL_PORTAL_URLS.jobs, type: 'platform' },
  { label: 'Early-career programmes — LinkedIn', url: ENTRY_LEVEL_PORTAL_URLS.earlyCareer, type: 'platform' },
];

/** The "what entry-level really asks" reframe — a tip, not a link. */
export const ENTRY_LEVEL_REALITY_TIP =
  'Most entry-level ads list nice-to-haves, not requirements — apply if you meet the core, not every line.';

/**
 * Programme links for the "Entry-level routes & programmes" transition route:
 * named sector trainee/graduate programmes first (when the target category has
 * any), then the always-relevant portals.
 */
export function getEntryLevelProgrammeResources(
  targetCategory?: CareerCategory,
): SuggestedResource[] {
  const named: SuggestedResource[] = getTraineeProgrammesForCategory(targetCategory)
    .slice(0, 3)
    .map((p) => ({
      label: `${p.company} — ${p.kind} programme`,
      url: p.url,
      type: 'platform' as const,
    }));
  return [...named, ...ENTRY_LEVEL_PORTALS];
}

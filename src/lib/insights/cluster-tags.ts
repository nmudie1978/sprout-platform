/**
 * Cluster tags — turn the careers a user is *circling* into soft "boost" tags
 * for the verified insights pool.
 *
 * Why not the primary goal? A youth explorer's chosen career is volatile — it
 * changes constantly, and many users have none set. So we anchor freshness to
 * the durable INTEREST CLUSTER instead: the careers they've saved, rated, or
 * explored. That survives goal switches and works with no goal at all.
 *
 * The verified pool is tagged by world-of-work THEMES (future-of-work, ai,
 * green-jobs…), not sectors, so this is a gentle lean — the pool API treats
 * tags as a soft scoring boost, never a hard filter. Universal themes are
 * always blended in so the result is never empty (a brand-new user still gets
 * relevant, broadening content).
 */

import { findCareerCategory, type CareerCategory } from '@/lib/career-pathways';

/** Always-relevant world-of-work themes (match the pool's most common tags). */
const UNIVERSAL_TAGS = ['future-of-work', 'skills', 'youth-employment', 'career-planning'];

/** Career category → verified-pool theme tags. Tags the pool doesn't currently
 *  carry are harmless (soft boost ignores misses) and future-proof the map. */
const CATEGORY_TO_THEME_TAGS: Record<CareerCategory, string[]> = {
  HEALTHCARE_LIFE_SCIENCES: ['wellbeing', 'mental-health'],
  EDUCATION_TRAINING: ['education', 'skills', 'apprenticeships'],
  TECHNOLOGY_IT: ['technology', 'digital-skills', 'ai', 'automation'],
  ARTIFICIAL_INTELLIGENCE: ['ai', 'automation', 'technology', 'innovation'],
  BUSINESS_MANAGEMENT: ['entrepreneurship', 'startups', 'workplace-culture'],
  FINANCE_BANKING: ['economy', 'global-economy', 'entrepreneurship'],
  SALES_MARKETING: ['creator-economy', 'networking', 'gig-economy'],
  MANUFACTURING_ENGINEERING: ['automation', 'green-jobs', 'innovation', 'apprenticeships'],
  LOGISTICS_TRANSPORT: ['automation', 'green-jobs', 'global-trends'],
  HOSPITALITY_TOURISM: ['gig-economy', 'languages', 'workplace-culture'],
  TELECOMMUNICATIONS: ['technology', 'digital-skills', 'innovation'],
  CREATIVE_MEDIA: ['creator-economy', 'creativity', 'data-viz'],
  PUBLIC_SERVICE_SAFETY: ['policy', 'workplace-culture', 'wellbeing'],
  MILITARY_DEFENCE: ['policy', 'skills'],
  SPORT_FITNESS: ['wellbeing', 'mental-health'],
  REAL_ESTATE_PROPERTY: ['economy', 'entrepreneurship'],
  SOCIAL_CARE_COMMUNITY: ['wellbeing', 'mental-health', 'emotional-intelligence'],
  CONSTRUCTION_TRADES: ['green-jobs', 'apprenticeships', 'sustainability', 'skills'],
};

/**
 * Derive soft-boost theme tags from the careers a user is circling.
 * Cluster-specific tags come first (so they survive the cap), then universal
 * themes guarantee a non-empty, relevant result.
 */
export function deriveClusterTags(careerIds: string[], max = 10): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (t: string) => {
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  };
  for (const id of careerIds) {
    const cat = findCareerCategory(id);
    if (!cat) continue;
    for (const t of CATEGORY_TO_THEME_TAGS[cat] ?? []) push(t);
  }
  for (const t of UNIVERSAL_TAGS) push(t);
  return out.slice(0, max);
}

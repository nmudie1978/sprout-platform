/**
 * Discover Recommendation Engine
 *
 * Converts Discover profile signals into personalised recommendations.
 * Modular and extensible — new signals or matching rules can be added easily.
 */

import {
  type DiscoverProfile,
  type DiscoverSignals,
  INTEREST_OPTIONS,
  STRENGTH_OPTIONS,
  MOTIVATION_OPTIONS,
} from './types';
import { getAllCareers, type Career } from '@/lib/career-pathways';

// ============================================
// SIGNAL EXTRACTION
// ============================================

/**
 * Extract aggregated tags from all Discover selections.
 */
export function extractSignals(profile: DiscoverProfile): DiscoverSignals {
  const tags = new Set<string>();

  // Interest tags
  for (const id of profile.interests) {
    const opt = INTEREST_OPTIONS.find((o) => o.id === id);
    if (opt) opt.tags.forEach((t) => tags.add(t));
  }

  // Strength tags
  for (const id of profile.strengths) {
    const opt = STRENGTH_OPTIONS.find((o) => o.id === id);
    if (opt) opt.tags.forEach((t) => tags.add(t));
  }

  // Motivation tags
  for (const id of profile.motivations) {
    const opt = MOTIVATION_OPTIONS.find((o) => o.id === id);
    if (opt) opt.tags.forEach((t) => tags.add(t));
  }

  // Work preference tags
  const wp = profile.workPreferences;
  if (wp.peoplePreference === 'with-people') tags.add('social');
  if (wp.peoplePreference === 'independently') tags.add('independent');
  if (wp.workType.includes('practical')) tags.add('hands-on');
  if (wp.workType.includes('creative')) tags.add('creative');
  if (wp.workType.includes('technical')) tags.add('tech');
  if (wp.workType.includes('academic')) tags.add('research');
  if (wp.environment === 'outdoor') tags.add('outdoor');
  if (wp.pace === 'fast-paced') tags.add('dynamic');
  if (wp.pace === 'steady') tags.add('structured');

  const topTags = Array.from(tags);

  return {
    topTags,
    summaryText: generateSummary(profile),
    careerFitTags: topTags, // Same for now — can diverge later
    jobFitTags: extractJobTags(profile),
  };
}

// ============================================
// SUMMARY GENERATION
// ============================================

/**
 * Generate a human-readable summary from Discover selections.
 * Avoids psychometric labels — uses plain language.
 */
export function generateSummary(profile: DiscoverProfile): string {
  const parts: string[] = [];

  // Interests summary
  const interestLabels = profile.interests
    .map((id) => INTEREST_OPTIONS.find((o) => o.id === id)?.label.toLowerCase())
    .filter(Boolean);

  if (interestLabels.length > 0) {
    if (interestLabels.length <= 2) {
      parts.push(`You seem drawn to ${interestLabels.join(' and ')}`);
    } else {
      const last = interestLabels.pop();
      parts.push(`You seem drawn to ${interestLabels.join(', ')}, and ${last}`);
    }
  }

  // Work style summary
  const wp = profile.workPreferences;
  const styleParts: string[] = [];
  if (wp.peoplePreference === 'with-people') styleParts.push('working with people');
  if (wp.peoplePreference === 'independently') styleParts.push('working independently');
  if (wp.workType.includes('practical')) styleParts.push('practical work');
  if (wp.workType.includes('creative')) styleParts.push('creative work');
  if (wp.workType.includes('technical')) styleParts.push('technical work');
  if (wp.pace === 'varied') styleParts.push('variety in your day');
  if (wp.environment === 'outdoor') styleParts.push('being active outdoors');

  if (styleParts.length > 0) {
    parts.push(`You prefer ${styleParts.slice(0, 3).join(', ')}`);
  }

  // Motivation summary
  const motivationLabels = profile.motivations
    .map((id) => {
      const opt = MOTIVATION_OPTIONS.find((o) => o.id === id);
      if (!opt) return null;
      return opt.label.replace('I want to ', '').replace('I want ', '').toLowerCase();
    })
    .filter(Boolean);

  if (motivationLabels.length > 0) {
    parts.push(`You value ${motivationLabels.slice(0, 2).join(' and ')}`);
  }

  if (parts.length === 0) return 'Complete your Discover profile to get personalised insights.';

  return parts.join('. ') + '.';
}

// ============================================
// CAREER MATCHING
// ============================================

/**
 * Tag mapping: maps Discover tags to career keywords for matching.
 */
const TAG_TO_CAREER_KEYWORDS: Record<string, string[]> = {
  care: ['health', 'patient', 'nurse', 'therapy', 'medical', 'care'],
  social: ['communication', 'team', 'client', 'customer', 'people'],
  service: ['service', 'support', 'help', 'community'],
  analytical: ['analysis', 'data', 'research', 'problem', 'logic'],
  logic: ['technical', 'engineering', 'system', 'programming'],
  practical: ['hands-on', 'construction', 'maintenance', 'repair'],
  'hands-on': ['physical', 'manual', 'practical', 'labour'],
  tech: ['software', 'developer', 'IT', 'technology', 'digital', 'cyber'],
  digital: ['web', 'app', 'digital', 'online'],
  creative: ['design', 'art', 'creative', 'media', 'content'],
  design: ['graphic', 'UX', 'interior', 'architecture'],
  outdoor: ['outdoor', 'environment', 'agriculture', 'nature', 'field'],
  structured: ['administration', 'management', 'process', 'operations'],
  planning: ['project', 'planning', 'coordination', 'logistics'],
  leadership: ['manager', 'lead', 'director', 'strategy'],
  healthcare: ['health', 'medical', 'clinical', 'hospital', 'therapy'],
  finance: ['finance', 'banking', 'accounting', 'investment'],
  data: ['data', 'analytics', 'statistics', 'intelligence'],
  communication: ['communication', 'media', 'marketing', 'PR', 'journalism'],
  research: ['research', 'science', 'academic', 'laboratory'],
  engineering: ['engineer', 'mechanical', 'electrical', 'civil'],
};

export interface CareerRecommendation {
  career: Career;
  score: number;
  reasons: string[];
}

/**
 * Score and rank careers based on Discover profile.
 */
export function getRecommendedCareers(
  profile: DiscoverProfile,
  limit = 6
): CareerRecommendation[] {
  const signals = extractSignals(profile);
  const allCareers = getAllCareers();

  const scored = allCareers.map((career) => {
    let score = 0;
    const reasons: string[] = [];
    const careerText = `${career.title} ${career.description} ${career.keySkills.join(' ')} ${career.dailyTasks.join(' ')}`.toLowerCase();

    // Match against Discover tags
    for (const tag of signals.topTags) {
      const keywords = TAG_TO_CAREER_KEYWORDS[tag] || [tag];
      for (const keyword of keywords) {
        if (careerText.includes(keyword.toLowerCase())) {
          score += 10;
          break; // Count each tag once per career
        }
      }
    }

    // Generate reasons from matched interests
    for (const interestId of profile.interests) {
      const opt = INTEREST_OPTIONS.find((o) => o.id === interestId);
      if (!opt) continue;
      for (const tag of opt.tags) {
        const keywords = TAG_TO_CAREER_KEYWORDS[tag] || [tag];
        if (keywords.some((k) => careerText.includes(k.toLowerCase()))) {
          reasons.push(`Matches your interest in ${opt.label.toLowerCase()}`);
          break;
        }
      }
    }

    // Generate reasons from work preferences
    const wp = profile.workPreferences;
    if (wp.workType.includes('practical') && careerText.includes('hands-on')) {
      reasons.push('Fits your preference for practical work');
    }
    if (wp.workType.includes('creative') && careerText.includes('creative')) {
      reasons.push('Suits your creative side');
    }
    if (wp.workType.includes('technical') && (careerText.includes('technical') || careerText.includes('engineer'))) {
      reasons.push('Aligned with your technical interests');
    }

    // Entry-level bonus
    if (career.entryLevel) score += 5;

    // Growth outlook bonus
    if (career.growthOutlook === 'high') score += 3;

    return { career, score, reasons: [...new Set(reasons)].slice(0, 3) };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ============================================
// JOB MATCHING
// ============================================

function extractJobTags(profile: DiscoverProfile): string[] {
  const tags: string[] = [];

  if (profile.interests.includes('helping-people')) tags.push('helpful', 'service');
  if (profile.interests.includes('technology')) tags.push('tech', 'digital');
  if (profile.interests.includes('being-creative')) tags.push('creative');
  if (profile.interests.includes('organising')) tags.push('organized', 'admin');
  if (profile.interests.includes('working-outdoors')) tags.push('outdoor', 'physical');
  if (profile.interests.includes('building-things')) tags.push('hands-on', 'practical');
  if (profile.strengths.includes('people-person')) tags.push('social', 'friendly');
  if (profile.strengths.includes('reliable')) tags.push('reliable', 'responsible');
  if (profile.strengths.includes('detail-oriented')) tags.push('detail', 'careful');

  return tags;
}

/**
 * Check if a job matches the user's Discover profile.
 * Returns a relevance label or null.
 */
export function getJobRelevanceLabel(
  jobTraits: string[],
  jobCategory: string,
  profile: DiscoverProfile
): string | null {
  const signals = extractSignals(profile);
  const jobTags = signals.jobFitTags;

  // Check trait overlap
  const traitOverlap = jobTraits.filter((t) =>
    jobTags.some((jt) => t.toLowerCase().includes(jt) || jt.includes(t.toLowerCase()))
  );

  if (traitOverlap.length >= 2) {
    return 'Great fit for your profile';
  }

  // Check interest alignment
  if (profile.interests.includes('helping-people') && ['CARE', 'SERVICE', 'COMMUNITY'].includes(jobCategory)) {
    return 'Good for someone who likes helping people';
  }
  if (profile.interests.includes('technology') && ['TECH', 'DIGITAL'].includes(jobCategory)) {
    return 'Aligned with your interest in technology';
  }
  if (profile.interests.includes('working-outdoors') && ['OUTDOOR', 'GARDEN', 'DELIVERY'].includes(jobCategory)) {
    return 'Suits your preference for outdoor work';
  }

  if (traitOverlap.length >= 1) {
    return 'Worth exploring based on your interests';
  }

  return null;
}

// ============================================
// DISCOVER COMPLETION STATUS
// ============================================

export function isDiscoverComplete(profile: DiscoverProfile): boolean {
  return (
    profile.interests.length >= 2 &&
    profile.strengths.length >= 2 &&
    profile.motivations.length >= 1 &&
    profile.clarityLevel !== null
  );
}

export function getDiscoverCompletionPercent(profile: DiscoverProfile): number {
  let completed = 0;
  const total = 5;

  if (profile.interests.length >= 2) completed++;
  if (profile.strengths.length >= 2) completed++;
  if (profile.workPreferences.peoplePreference || profile.workPreferences.workType.length > 0) completed++;
  if (profile.motivations.length >= 1) completed++;
  if (profile.clarityLevel !== null) completed++;

  return Math.round((completed / total) * 100);
}

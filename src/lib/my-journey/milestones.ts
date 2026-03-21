/**
 * My Journey Milestones
 *
 * Milestone definitions for the Roadmap view.
 * Statuses are derived from the existing journey state machine - NOT hardcoded.
 *
 * Structure: DISCOVER · UNDERSTAND · ACT
 */

import type { JourneyStateId, JourneyLens } from '@/lib/journey/types';
import { JOURNEY_STATE_CONFIG, OPTIONAL_JOURNEY_STATES } from '@/lib/journey/types';

// ============================================
// MILESTONE TYPE
// ============================================

export interface Milestone {
  id: JourneyStateId;
  lens: JourneyLens;
  order: number;
  title: string;
  shortDescription: string;
  whyItMatters: string;
  optional: boolean;
  route: string;
}

// ============================================
// MILESTONE DEFINITIONS
// ============================================

export const MILESTONES: Milestone[] = [
  // ==========================================
  // DISCOVER LENS - Know yourself
  // ==========================================
  {
    id: 'REFLECT_ON_STRENGTHS',
    lens: 'DISCOVER',
    order: 0,
    title: 'Reflect on Strengths',
    shortDescription: 'Identify your core capabilities',
    whyItMatters: 'Understanding your strengths helps you find careers that play to your natural talents.',
    optional: false,
    route: '/my-journey?step=strengths',
  },
  {
    id: 'EXPLORE_CAREERS',
    lens: 'DISCOVER',
    order: 1,
    title: 'Explore Careers',
    shortDescription: 'Browse career possibilities',
    whyItMatters: 'Exploring options helps you discover paths you might not have considered.',
    optional: false,
    route: '/careers',
  },
  {
    id: 'ROLE_DEEP_DIVE',
    lens: 'DISCOVER',
    order: 2,
    title: 'Deep Dive',
    shortDescription: 'Research a role in depth',
    whyItMatters: 'Understanding what a job really involves helps you make informed decisions.',
    optional: false,
    route: '/my-journey?step=deep-dive',
  },

  // ==========================================
  // UNDERSTAND LENS - Know the world
  // ==========================================
  {
    id: 'REVIEW_INDUSTRY_OUTLOOK',
    lens: 'UNDERSTAND',
    order: 3,
    title: 'Industry Outlook',
    shortDescription: 'Understand market trends',
    whyItMatters: 'Knowing industry trends helps you prepare for the future job market.',
    optional: false,
    route: '/insights',
  },
  {
    id: 'CAREER_SHADOW',
    lens: 'UNDERSTAND',
    order: 4,
    title: 'Career Shadow',
    shortDescription: 'See a professional at work',
    whyItMatters: 'Real-world exposure gives you insights no research can provide.',
    optional: false,
    route: '/shadows',
  },
  {
    id: 'CREATE_ACTION_PLAN',
    lens: 'UNDERSTAND',
    order: 5,
    title: 'Action Plan',
    shortDescription: 'Create your roadmap',
    whyItMatters: 'A concrete plan turns aspirations into achievable steps.',
    optional: false,
    route: '/my-journey?step=plan',
  },

  // ==========================================
  // ACT LENS - Take aligned action
  // ==========================================
  {
    id: 'COMPLETE_ALIGNED_ACTION',
    lens: 'ACT',
    order: 6,
    title: 'First Action',
    shortDescription: 'Complete a meaningful action',
    whyItMatters: 'Taking action builds real experience and confidence.',
    optional: false,
    route: '/dashboard',
  },
  {
    id: 'SUBMIT_ACTION_REFLECTION',
    lens: 'ACT',
    order: 7,
    title: 'Reflect',
    shortDescription: 'Process what you learned',
    whyItMatters: 'Reflection turns experience into lasting wisdom.',
    optional: false,
    route: '/my-journey?tab=reflections',
  },
  {
    id: 'UPDATE_PLAN',
    lens: 'ACT',
    order: 8,
    title: 'Update Plan',
    shortDescription: 'Refine based on learnings',
    whyItMatters: 'Adapting your plan keeps it relevant and achievable.',
    optional: true,
    route: '/my-journey?step=plan',
  },
  {
    id: 'EXTERNAL_FEEDBACK',
    lens: 'ACT',
    order: 9,
    title: 'Get Feedback',
    shortDescription: 'Receive external input',
    whyItMatters: 'Outside perspectives help you see blind spots and grow faster.',
    optional: true,
    route: '/my-journey?step=feedback',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get milestones for a specific lens
 */
export function getMilestonesByLens(lens: JourneyLens): Milestone[] {
  return MILESTONES.filter((m) => m.lens === lens);
}

/**
 * Get mandatory milestones only
 */
export function getMandatoryMilestones(): Milestone[] {
  return MILESTONES.filter((m) => !m.optional);
}

/**
 * Get milestone by ID
 */
export function getMilestoneById(id: JourneyStateId): Milestone | undefined {
  return MILESTONES.find((m) => m.id === id);
}

/**
 * Get total mandatory milestone count
 */
export function getTotalMandatoryCount(): number {
  return MILESTONES.filter((m) => !m.optional).length;
}

/**
 * Get mandatory milestone count per lens
 */
export function getMandatoryCountByLens(lens: JourneyLens): number {
  return MILESTONES.filter((m) => m.lens === lens && !m.optional).length;
}

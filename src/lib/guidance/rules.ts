/**
 * GUIDANCE LAYER — Rules Engine
 *
 * State-driven rules that determine which guidance items to show.
 * Each rule maps a user state condition to a guidance message.
 *
 * Rules are evaluated per-placement. Only the highest-priority matching
 * rules are shown (max 2 per placement to avoid clutter).
 */

import type { GuidanceRule, GuidancePlacement, GuidanceContext, GuidanceItem } from './types';

// ── Rule Definitions ────────────────────────────────────────────────

export const GUIDANCE_RULES: GuidanceRule[] = [
  // ================================================================
  // DASHBOARD
  // ================================================================
  {
    id: 'dashboard-no-goal',
    placement: 'dashboard',
    condition: (ctx) => !ctx.isFirstLogin && ctx.onboardingComplete && !ctx.hasGoal,
    item: {
      category: 'direction',
      variant: 'callout',
      message: 'Setting a career direction helps shape your whole journey.',
      submessage: 'Head to My Journey to explore options and choose a direction — you can always change it later.',
      dismissible: true,
      priority: 1,
    },
  },
  {
    id: 'dashboard-discover-incomplete',
    placement: 'dashboard',
    condition: (ctx) =>
      !ctx.isFirstLogin &&
      ctx.hasGoal &&
      ctx.currentLens === 'DISCOVER' &&
      ctx.discoverProgress > 0 &&
      ctx.discoverProgress < 100,
    item: {
      category: 'reinforcement',
      variant: 'hint',
      message: 'You\'re building a clearer picture of yourself.',
      submessage: 'Continue your Discover steps to unlock the next stage of your journey.',
      dismissible: true,
      priority: 2,
    },
  },
  {
    id: 'dashboard-understand-started',
    placement: 'dashboard',
    condition: (ctx) =>
      ctx.currentLens === 'UNDERSTAND' &&
      ctx.understandProgress > 0 &&
      ctx.understandProgress < 100,
    item: {
      category: 'reinforcement',
      variant: 'hint',
      message: 'You\'re connecting your interests to the real world.',
      submessage: 'Keep going — understanding what a career actually involves makes all the difference.',
      dismissible: true,
      priority: 2,
    },
  },
  {
    id: 'dashboard-act-started',
    placement: 'dashboard',
    condition: (ctx) =>
      ctx.currentLens === 'ACT' &&
      ctx.actProgress > 0 &&
      ctx.actProgress < 100,
    item: {
      category: 'reinforcement',
      variant: 'hint',
      message: 'You\'re turning plans into real steps.',
      submessage: 'Every action, even a small one, builds momentum.',
      dismissible: true,
      priority: 2,
    },
  },
  {
    id: 'dashboard-no-saved-items',
    placement: 'dashboard',
    condition: (ctx) =>
      !ctx.isFirstLogin &&
      ctx.onboardingComplete &&
      ctx.savedItemsCount === 0 &&
      ctx.hasGoal,
    item: {
      category: 'context',
      variant: 'hint',
      message: 'Your library is empty.',
      submessage: 'Save articles and videos from Insights to build a personal resource collection.',
      dismissible: true,
      priority: 5,
    },
  },

  // ================================================================
  // DISCOVER
  // ================================================================
  {
    id: 'discover-start-reassurance',
    placement: 'discover',
    condition: (ctx) =>
      ctx.currentLens === 'DISCOVER' &&
      ctx.completedSteps.length === 0,
    item: {
      category: 'reassurance',
      variant: 'callout',
      message: 'There are no wrong answers here.',
      submessage: 'This is about understanding yourself better. You can update everything as you grow.',
      dismissible: true,
      priority: 1,
    },
  },
  {
    id: 'discover-strengths-done',
    placement: 'discover',
    condition: (ctx) =>
      ctx.currentLens === 'DISCOVER' &&
      ctx.hasStrengths &&
      !ctx.hasCareerInterests,
    item: {
      category: 'direction',
      variant: 'hint',
      message: 'Nice — now explore careers that match your strengths.',
      submessage: 'Browse broadly. You don\'t need to commit to anything yet.',
      dismissible: true,
      priority: 2,
    },
  },
  {
    id: 'discover-almost-done',
    placement: 'discover',
    condition: () => false, // Disabled — client-side completion check handles progression
    item: {
      category: 'reinforcement',
      variant: 'nudge',
      message: '',
      submessage: '',
      dismissible: true,
      priority: 3,
    },
  },

  // ================================================================
  // UNDERSTAND
  // ================================================================
  {
    id: 'understand-start',
    placement: 'understand',
    condition: (ctx) =>
      ctx.currentLens === 'UNDERSTAND' &&
      ctx.understandProgress === 0,
    item: {
      category: 'context',
      variant: 'callout',
      message: 'Time to look outward.',
      submessage: 'Now that you know yourself better, explore what your chosen path actually looks like in the real world.',
      dismissible: true,
      priority: 1,
    },
  },
  {
    id: 'understand-mid-progress',
    placement: 'understand',
    condition: (ctx) =>
      ctx.currentLens === 'UNDERSTAND' &&
      ctx.understandProgress > 33 &&
      ctx.understandProgress < 100,
    item: {
      category: 'reinforcement',
      variant: 'hint',
      message: 'You\'re building a real understanding of your path.',
      submessage: 'The more you know about what\'s ahead, the better prepared you\'ll be.',
      dismissible: true,
      priority: 3,
    },
  },

  // ================================================================
  // ACT / GROW
  // ================================================================
  {
    id: 'act-start',
    placement: 'act',
    condition: (ctx) =>
      ctx.currentLens === 'ACT' &&
      ctx.actProgress === 0,
    item: {
      category: 'reassurance',
      variant: 'callout',
      message: 'Start as small as you like.',
      submessage: 'A short course, a side project, or a single application — the size doesn\'t matter, the step does.',
      dismissible: true,
      priority: 1,
    },
  },
  {
    id: 'act-first-action-done',
    placement: 'act',
    condition: (ctx) =>
      ctx.currentLens === 'ACT' &&
      ctx.alignedActionsCount > 0 &&
      ctx.reflectionsCount === 0,
    item: {
      category: 'direction',
      variant: 'hint',
      message: 'You\'ve taken your first real step.',
      submessage: 'Now reflect on what you learned — it deepens the experience and helps you decide what\'s next.',
      dismissible: true,
      priority: 2,
    },
  },

  // ================================================================
  // LEARNING GOALS
  // ================================================================
  {
    id: 'learning-goals-empty',
    placement: 'learning-goals',
    condition: (ctx) => ctx.learningGoalCount === 0 && ctx.hasGoal,
    item: {
      category: 'context',
      variant: 'hint',
      message: 'Learning goals help you track specific skills.',
      submessage: 'Think about one skill that would move you closer to your career direction, and start there.',
      dismissible: true,
      priority: 1,
    },
  },
  {
    id: 'learning-goals-progress',
    placement: 'learning-goals',
    condition: (ctx) => ctx.learningGoalCount > 0 && ctx.learningGoalCount < 3,
    item: {
      category: 'reassurance',
      variant: 'hint',
      message: 'Quality over quantity.',
      submessage: 'A few focused goals are more useful than a long list. Add more only when these feel manageable.',
      dismissible: true,
      priority: 4,
    },
  },

  // ================================================================
  // SCHOOL ALIGNMENT
  // ================================================================
  {
    id: 'school-no-education',
    placement: 'school-alignment',
    condition: (ctx) => !ctx.hasEducationContext && ctx.hasGoal,
    item: {
      category: 'context',
      variant: 'callout',
      message: 'Add your school details to see how they connect.',
      submessage: 'Understanding how your subjects relate to your career goal helps you make smarter choices now.',
      dismissible: true,
      priority: 1,
    },
  },
  {
    id: 'school-no-subjects',
    placement: 'school-alignment',
    condition: (ctx) => ctx.hasEducationContext && !ctx.hasSubjects,
    item: {
      category: 'direction',
      variant: 'hint',
      message: 'Add your current subjects to see career alignment.',
      submessage: 'We\'ll show which subjects matter most for your career direction.',
      dismissible: true,
      priority: 1,
    },
  },
];

// ── Engine ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'endeavrly-guidance-dismissed';
const GOAL_KEY = 'endeavrly-guidance-goal';
const MAX_PER_PLACEMENT = 2;

/**
 * Dismissed state is scoped to the active goal. When the goal changes,
 * all previous dismissals are cleared so guidance can re-evaluate fresh.
 */
function getDismissed(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function dismissGuidance(id: string): void {
  if (typeof window === 'undefined') return;
  const dismissed = getDismissed();
  dismissed.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed]));
}

/**
 * Clear all guidance dismissals. Called when the primary goal changes
 * so that guidance rules are re-evaluated fresh for the new goal.
 */
export function resetGuidanceDismissals(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Track which goal the dismissed state belongs to. If the goal changed,
 * automatically clear dismissed state so rules re-evaluate for the new goal.
 */
export function syncGuidanceGoal(goalTitle: string | null): void {
  if (typeof window === 'undefined') return;
  const prev = localStorage.getItem(GOAL_KEY);
  const current = goalTitle ?? '';
  if (prev !== null && prev !== current) {
    resetGuidanceDismissals();
  }
  localStorage.setItem(GOAL_KEY, current);
}

export function getGuidanceForPlacement(
  placement: GuidancePlacement,
  context: GuidanceContext,
): GuidanceItem[] {
  const dismissed = getDismissed();

  return GUIDANCE_RULES
    .filter((rule) =>
      rule.placement === placement &&
      !dismissed.has(rule.id) &&
      rule.condition(context),
    )
    .sort((a, b) => a.item.priority - b.item.priority)
    .slice(0, MAX_PER_PLACEMENT)
    .map((rule) => ({
      ...rule.item,
      id: rule.id,
      placement: rule.placement,
    }));
}

// ── Context Builder ─────────────────────────────────────────────────

export function buildGuidanceContext(options: {
  journey: {
    currentLens: string | null;
    completedSteps: string[];
    summary: {
      overallProgress: number;
      lenses: {
        discover: { progress: number; isComplete: boolean };
        understand: { progress: number; isComplete: boolean };
        act: { progress: number; isComplete: boolean };
      };
      primaryGoal: { title: string | null };
      strengths: string[];
      careerInterests: string[];
      savedSummary: { total: number };
      alignedActionsCount: number;
      reflectionSummary: { total: number };
    };
  } | null;
  isFirstLogin: boolean;
  onboardingComplete: boolean;
  educationContext: { currentSubjects: string[] } | null;
  learningGoalCount: number;
  jobsApplied: number;
}): GuidanceContext {
  const j = options.journey;
  const s = j?.summary;

  return {
    currentLens: (j?.currentLens as GuidanceContext['currentLens']) ?? null,
    completedSteps: j?.completedSteps ?? [],
    overallProgress: s?.overallProgress ?? 0,

    discoverProgress: s?.lenses?.discover?.progress ?? 0,
    understandProgress: s?.lenses?.understand?.progress ?? 0,
    actProgress: s?.lenses?.act?.progress ?? 0,
    discoverComplete: s?.lenses?.discover?.isComplete ?? false,
    understandComplete: s?.lenses?.understand?.isComplete ?? false,
    actComplete: s?.lenses?.act?.isComplete ?? false,

    hasGoal: !!s?.primaryGoal?.title,
    goalTitle: s?.primaryGoal?.title ?? null,
    hasStrengths: (s?.strengths?.length ?? 0) > 0,
    strengthsCount: s?.strengths?.length ?? 0,
    hasCareerInterests: (s?.careerInterests?.length ?? 0) > 0,
    careerInterestsCount: s?.careerInterests?.length ?? 0,
    isFirstLogin: options.isFirstLogin,
    onboardingComplete: options.onboardingComplete,

    hasEducationContext: !!options.educationContext,
    hasSubjects: (options.educationContext?.currentSubjects?.length ?? 0) > 0,
    subjectCount: options.educationContext?.currentSubjects?.length ?? 0,

    learningGoalCount: options.learningGoalCount,

    savedItemsCount: s?.savedSummary?.total ?? 0,
    alignedActionsCount: s?.alignedActionsCount ?? 0,
    reflectionsCount: s?.reflectionSummary?.total ?? 0,
    jobsApplied: options.jobsApplied,
  };
}

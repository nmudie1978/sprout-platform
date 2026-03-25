import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  GUIDANCE_RULES,
  getGuidanceForPlacement,
  dismissGuidance,
  buildGuidanceContext,
} from '../rules';
import type { GuidanceContext, GuidancePlacement } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────

function makeContext(overrides: Partial<GuidanceContext> = {}): GuidanceContext {
  return {
    currentLens: null,
    completedSteps: [],
    overallProgress: 0,
    discoverProgress: 0,
    understandProgress: 0,
    actProgress: 0,
    discoverComplete: false,
    understandComplete: false,
    actComplete: false,
    hasGoal: false,
    goalTitle: null,
    hasStrengths: false,
    strengthsCount: 0,
    hasCareerInterests: false,
    careerInterestsCount: 0,
    isFirstLogin: false,
    onboardingComplete: false,
    hasEducationContext: false,
    hasSubjects: false,
    subjectCount: 0,
    learningGoalCount: 0,
    savedItemsCount: 0,
    alignedActionsCount: 0,
    reflectionsCount: 0,
    jobsApplied: 0,
    ...overrides,
  };
}

// Mock localStorage for dismissal tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────

describe('getGuidanceForPlacement', () => {
  it('returns empty array for placement with no matching rules', () => {
    const ctx = makeContext();
    // 'careers' placement has no rules defined in the current rule set
    const items = getGuidanceForPlacement('careers', ctx);
    expect(items).toEqual([]);
  });

  it('returns empty array when no conditions match for a valid placement', () => {
    // Default context has isFirstLogin=true-ish conditions that won't match dashboard rules
    const ctx = makeContext({ isFirstLogin: true });
    const items = getGuidanceForPlacement('dashboard', ctx);
    expect(items).toEqual([]);
  });
});

describe('Dashboard rules', () => {
  it('shows direction callout when user has no goal', () => {
    const ctx = makeContext({
      isFirstLogin: false,
      onboardingComplete: true,
      hasGoal: false,
    });
    const items = getGuidanceForPlacement('dashboard', ctx);
    expect(items.length).toBeGreaterThanOrEqual(1);

    const noGoalItem = items.find((i) => i.id === 'dashboard-no-goal');
    expect(noGoalItem).toBeDefined();
    expect(noGoalItem!.category).toBe('direction');
    expect(noGoalItem!.variant).toBe('callout');
    expect(noGoalItem!.placement).toBe('dashboard');
  });

  it('shows reinforcement hint for mid-discover progress', () => {
    const ctx = makeContext({
      isFirstLogin: false,
      onboardingComplete: true,
      hasGoal: true,
      currentLens: 'DISCOVER',
      discoverProgress: 50,
    });
    const items = getGuidanceForPlacement('dashboard', ctx);

    const midDiscover = items.find((i) => i.id === 'dashboard-discover-incomplete');
    expect(midDiscover).toBeDefined();
    expect(midDiscover!.category).toBe('reinforcement');
    expect(midDiscover!.variant).toBe('hint');
  });
});

describe('Discover rules', () => {
  it('shows reassurance callout when no steps are completed', () => {
    const ctx = makeContext({
      currentLens: 'DISCOVER',
      completedSteps: [],
    });
    const items = getGuidanceForPlacement('discover', ctx);

    const reassurance = items.find((i) => i.id === 'discover-start-reassurance');
    expect(reassurance).toBeDefined();
    expect(reassurance!.category).toBe('reassurance');
    expect(reassurance!.variant).toBe('callout');
  });

  it('shows direction hint when strengths are done but no career interests', () => {
    const ctx = makeContext({
      currentLens: 'DISCOVER',
      hasStrengths: true,
      strengthsCount: 3,
      hasCareerInterests: false,
      careerInterestsCount: 0,
      completedSteps: ['strengths'],
    });
    const items = getGuidanceForPlacement('discover', ctx);

    const directionHint = items.find((i) => i.id === 'discover-strengths-done');
    expect(directionHint).toBeDefined();
    expect(directionHint!.category).toBe('direction');
    expect(directionHint!.variant).toBe('hint');
  });
});

describe('Max 2 items per placement enforcement', () => {
  it('returns at most 2 items even when more rules match', () => {
    // Create a context that matches multiple dashboard rules
    const ctx = makeContext({
      isFirstLogin: false,
      onboardingComplete: true,
      hasGoal: false,
      currentLens: 'DISCOVER',
      discoverProgress: 50,
      savedItemsCount: 0,
    });

    const items = getGuidanceForPlacement('dashboard', ctx);
    expect(items.length).toBeLessThanOrEqual(2);
  });
});

describe('Priority ordering', () => {
  it('returns items sorted by priority (lower number first)', () => {
    // Discover with no steps and strengths done but no career interests
    // This matches discover-start-reassurance (priority 1) and discover-strengths-done (priority 2)
    const ctx = makeContext({
      currentLens: 'DISCOVER',
      completedSteps: [],
      hasStrengths: true,
      hasCareerInterests: false,
    });
    const items = getGuidanceForPlacement('discover', ctx);

    expect(items.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < items.length; i++) {
      expect(items[i].priority).toBeGreaterThanOrEqual(items[i - 1].priority);
    }
  });

  it('higher priority items are kept when truncated to max 2', () => {
    // Match as many dashboard rules as possible
    const ctx = makeContext({
      isFirstLogin: false,
      onboardingComplete: true,
      hasGoal: false,
      savedItemsCount: 0,
    });
    const items = getGuidanceForPlacement('dashboard', ctx);

    // dashboard-no-goal has priority 1, dashboard-no-saved-items has priority 5
    // If both match, the priority-1 item must be present
    const hasHighPriority = items.some((i) => i.id === 'dashboard-no-goal');
    expect(hasHighPriority).toBe(true);

    // All returned items should have the lowest priorities among matching rules
    items.forEach((item) => {
      expect(item.priority).toBeDefined();
    });
  });
});

describe('dismissGuidance', () => {
  it('dismissed items are excluded from results', () => {
    const ctx = makeContext({
      isFirstLogin: false,
      onboardingComplete: true,
      hasGoal: false,
    });

    // Before dismissal the item is present
    let items = getGuidanceForPlacement('dashboard', ctx);
    expect(items.some((i) => i.id === 'dashboard-no-goal')).toBe(true);

    // Dismiss it
    dismissGuidance('dashboard-no-goal');

    // After dismissal it should be gone
    items = getGuidanceForPlacement('dashboard', ctx);
    expect(items.some((i) => i.id === 'dashboard-no-goal')).toBe(false);
  });
});

describe('buildGuidanceContext', () => {
  it('correctly maps full journey state to flat context', () => {
    const ctx = buildGuidanceContext({
      journey: {
        currentLens: 'DISCOVER',
        completedSteps: ['strengths', 'interests'],
        summary: {
          overallProgress: 35,
          lenses: {
            discover: { progress: 70, isComplete: false },
            understand: { progress: 10, isComplete: false },
            act: { progress: 0, isComplete: false },
          },
          primaryGoal: { title: 'Doctor' },
          strengths: ['Communication', 'Empathy'],
          careerInterests: ['Medicine'],
          savedSummary: { total: 5 },
          alignedActionsCount: 2,
          reflectionSummary: { total: 1 },
        },
      },
      isFirstLogin: false,
      onboardingComplete: true,
      educationContext: { currentSubjects: ['Biology', 'Chemistry'] },
      learningGoalCount: 3,
      jobsApplied: 1,
    });

    expect(ctx.currentLens).toBe('DISCOVER');
    expect(ctx.completedSteps).toEqual(['strengths', 'interests']);
    expect(ctx.overallProgress).toBe(35);

    expect(ctx.discoverProgress).toBe(70);
    expect(ctx.understandProgress).toBe(10);
    expect(ctx.actProgress).toBe(0);
    expect(ctx.discoverComplete).toBe(false);
    expect(ctx.understandComplete).toBe(false);
    expect(ctx.actComplete).toBe(false);

    expect(ctx.hasGoal).toBe(true);
    expect(ctx.goalTitle).toBe('Doctor');
    expect(ctx.hasStrengths).toBe(true);
    expect(ctx.strengthsCount).toBe(2);
    expect(ctx.hasCareerInterests).toBe(true);
    expect(ctx.careerInterestsCount).toBe(1);

    expect(ctx.isFirstLogin).toBe(false);
    expect(ctx.onboardingComplete).toBe(true);

    expect(ctx.hasEducationContext).toBe(true);
    expect(ctx.hasSubjects).toBe(true);
    expect(ctx.subjectCount).toBe(2);

    expect(ctx.learningGoalCount).toBe(3);
    expect(ctx.savedItemsCount).toBe(5);
    expect(ctx.alignedActionsCount).toBe(2);
    expect(ctx.reflectionsCount).toBe(1);
    expect(ctx.jobsApplied).toBe(1);
  });
});

describe('Edge case: null journey data produces safe defaults', () => {
  it('returns safe defaults when journey is null', () => {
    const ctx = buildGuidanceContext({
      journey: null,
      isFirstLogin: true,
      onboardingComplete: false,
      educationContext: null,
      learningGoalCount: 0,
      jobsApplied: 0,
    });

    expect(ctx.currentLens).toBeNull();
    expect(ctx.completedSteps).toEqual([]);
    expect(ctx.overallProgress).toBe(0);

    expect(ctx.discoverProgress).toBe(0);
    expect(ctx.understandProgress).toBe(0);
    expect(ctx.actProgress).toBe(0);
    expect(ctx.discoverComplete).toBe(false);
    expect(ctx.understandComplete).toBe(false);
    expect(ctx.actComplete).toBe(false);

    expect(ctx.hasGoal).toBe(false);
    expect(ctx.goalTitle).toBeNull();
    expect(ctx.hasStrengths).toBe(false);
    expect(ctx.strengthsCount).toBe(0);
    expect(ctx.hasCareerInterests).toBe(false);
    expect(ctx.careerInterestsCount).toBe(0);

    expect(ctx.isFirstLogin).toBe(true);
    expect(ctx.onboardingComplete).toBe(false);

    expect(ctx.hasEducationContext).toBe(false);
    expect(ctx.hasSubjects).toBe(false);
    expect(ctx.subjectCount).toBe(0);

    expect(ctx.learningGoalCount).toBe(0);
    expect(ctx.savedItemsCount).toBe(0);
    expect(ctx.alignedActionsCount).toBe(0);
    expect(ctx.reflectionsCount).toBe(0);
    expect(ctx.jobsApplied).toBe(0);
  });
});

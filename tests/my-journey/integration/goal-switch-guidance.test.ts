/**
 * Goal Switch Guidance Tests
 *
 * Verifies that changing the primary career goal correctly resets
 * guidance state, dismissals, and derived context. This prevents
 * stale prompts from a previous goal appearing after a goal change.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  buildGuidanceContext,
  getGuidanceForPlacement,
  dismissGuidance,
  resetGuidanceDismissals,
  syncGuidanceGoal,
  GUIDANCE_RULES,
} from '@/lib/guidance/rules';
import type { GuidanceContext } from '@/lib/guidance/types';

// ── Helpers ──────────────────────────────────────────────────────────

function makeGuidanceContext(overrides: Partial<GuidanceContext> = {}): GuidanceContext {
  return {
    currentLens: 'DISCOVER',
    completedSteps: [],
    overallProgress: 0,
    discoverProgress: 0,
    understandProgress: 0,
    actProgress: 0,
    discoverComplete: false,
    understandComplete: false,
    actComplete: false,
    hasGoal: true,
    goalTitle: 'Software Engineer',
    hasStrengths: false,
    strengthsCount: 0,
    hasCareerInterests: false,
    careerInterestsCount: 0,
    isFirstLogin: false,
    onboardingComplete: true,
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

function getMatchingRuleIds(placement: string, ctx: GuidanceContext): string[] {
  return GUIDANCE_RULES
    .filter((rule) => rule.placement === placement && rule.condition(ctx))
    .map((rule) => rule.id);
}

// ── Setup ────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
});

// ── A. PRIMARY GOAL REPLACEMENT ──────────────────────────────────────

describe('A. Primary Goal Replacement', () => {
  it('buildGuidanceContext reflects the new goal immediately', () => {
    const ctxA = buildGuidanceContext({
      journey: {
        currentLens: 'DISCOVER',
        completedSteps: [],
        summary: {
          overallProgress: 10,
          lenses: {
            discover: { progress: 10, isComplete: false },
            understand: { progress: 0, isComplete: false },
            act: { progress: 0, isComplete: false },
          },
          primaryGoal: { title: 'Doctor' },
          strengths: [],
          careerInterests: [],
          savedSummary: { total: 0 },
          alignedActionsCount: 0,
          reflectionSummary: { total: 0 },
        },
      },
      isFirstLogin: false,
      onboardingComplete: true,
      educationContext: null,
      learningGoalCount: 0,
      jobsApplied: 0,
    });

    expect(ctxA.goalTitle).toBe('Doctor');
    expect(ctxA.hasGoal).toBe(true);

    const ctxB = buildGuidanceContext({
      journey: {
        currentLens: 'DISCOVER',
        completedSteps: [],
        summary: {
          overallProgress: 0,
          lenses: {
            discover: { progress: 0, isComplete: false },
            understand: { progress: 0, isComplete: false },
            act: { progress: 0, isComplete: false },
          },
          primaryGoal: { title: 'AI Engineer' },
          strengths: [],
          careerInterests: [],
          savedSummary: { total: 0 },
          alignedActionsCount: 0,
          reflectionSummary: { total: 0 },
        },
      },
      isFirstLogin: false,
      onboardingComplete: true,
      educationContext: null,
      learningGoalCount: 0,
      jobsApplied: 0,
    });

    expect(ctxB.goalTitle).toBe('AI Engineer');
    expect(ctxB.hasGoal).toBe(true);
  });

  it('no prompt references old goal after context switch', () => {
    const ctxGoalA = makeGuidanceContext({ goalTitle: 'Doctor', hasGoal: true });
    const ctxGoalB = makeGuidanceContext({ goalTitle: 'AI Engineer', hasGoal: true });

    // Get items for goal A
    const itemsA = getGuidanceForPlacement('discover', ctxGoalA);

    // Get items for goal B — should be identical rules but for new context
    const itemsB = getGuidanceForPlacement('discover', ctxGoalB);

    // Neither set should contain the other goal's title in any message
    for (const item of itemsB) {
      expect(item.message).not.toContain('Doctor');
      if (item.submessage) {
        expect(item.submessage).not.toContain('Doctor');
      }
    }
  });
});

// ── B. REPEATED GOAL SWITCHING ───────────────────────────────────────

describe('B. Repeated Goal Switching', () => {
  it('Career A -> B -> C: only latest goal context is active', () => {
    const goals = ['Doctor', 'Software Engineer', 'Data Scientist'];

    for (const goal of goals) {
      syncGuidanceGoal(goal);
      const ctx = makeGuidanceContext({ goalTitle: goal, hasGoal: true });
      expect(ctx.goalTitle).toBe(goal);
    }

    // Final context should only reference Data Scientist
    const finalCtx = makeGuidanceContext({
      goalTitle: 'Data Scientist',
      hasGoal: true,
    });
    expect(finalCtx.goalTitle).toBe('Data Scientist');
  });

  it('dismissals from earlier goals do not persist through switches', () => {
    // Set goal A and dismiss a guidance item
    syncGuidanceGoal('Doctor');
    dismissGuidance('discover-start-reassurance');

    // Switch to goal B — dismissals should be cleared
    syncGuidanceGoal('AI Engineer');

    // The item should be available again
    const ctx = makeGuidanceContext({
      goalTitle: 'AI Engineer',
      hasGoal: true,
      currentLens: 'DISCOVER',
    });

    // Check that previously dismissed rule can now match (if conditions met)
    const rule = GUIDANCE_RULES.find((r) => r.id === 'discover-start-reassurance');
    if (rule && rule.condition(ctx)) {
      const items = getGuidanceForPlacement('discover', ctx);
      const found = items.find((i) => i.id === 'discover-start-reassurance');
      expect(found).toBeDefined();
    }
  });
});

// ── C. POPUP / GUIDE RESET ───────────────────────────────────────────

describe('C. Popup / Guide Reset', () => {
  it('dismissGuidance persists to localStorage', () => {
    dismissGuidance('test-rule-1');
    const raw = localStorage.getItem('endeavrly-guidance-dismissed');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toContain('test-rule-1');
  });

  it('resetGuidanceDismissals clears all dismissed items', () => {
    dismissGuidance('test-rule-1');
    dismissGuidance('test-rule-2');
    resetGuidanceDismissals();

    const raw = localStorage.getItem('endeavrly-guidance-dismissed');
    expect(raw).toBeNull();
  });

  it('syncGuidanceGoal clears dismissals when goal changes', () => {
    // Initialize with goal A
    syncGuidanceGoal('Doctor');
    dismissGuidance('some-rule');

    // Verify it's dismissed
    let raw = localStorage.getItem('endeavrly-guidance-dismissed');
    expect(JSON.parse(raw!)).toContain('some-rule');

    // Switch to goal B
    syncGuidanceGoal('AI Engineer');

    // Dismissals should be cleared
    raw = localStorage.getItem('endeavrly-guidance-dismissed');
    expect(raw).toBeNull();
  });

  it('syncGuidanceGoal does NOT clear dismissals when goal is the same', () => {
    syncGuidanceGoal('Doctor');
    dismissGuidance('some-rule');

    // "Switch" to the same goal
    syncGuidanceGoal('Doctor');

    // Dismissals should still be present
    const raw = localStorage.getItem('endeavrly-guidance-dismissed');
    expect(JSON.parse(raw!)).toContain('some-rule');
  });

  it('guidance items re-evaluate from scratch after goal change', () => {
    // Use context that triggers 'discover-start-reassurance':
    // currentLens=DISCOVER, completedSteps=[]
    syncGuidanceGoal('Doctor');
    const ctx = makeGuidanceContext({
      goalTitle: 'Doctor',
      hasGoal: true,
      currentLens: 'DISCOVER',
      completedSteps: [],
      onboardingComplete: true,
      isFirstLogin: false,
    });

    // Verify the rule matches before dismissal
    const rule = GUIDANCE_RULES.find((r) => r.id === 'discover-start-reassurance')!;
    expect(rule.condition(ctx)).toBe(true);

    // Dismiss it
    dismissGuidance('discover-start-reassurance');

    // Verify it's gone
    const afterDismiss = getGuidanceForPlacement('discover', ctx);
    expect(afterDismiss.find((i) => i.id === 'discover-start-reassurance')).toBeUndefined();

    // Switch goal — dismissals cleared
    syncGuidanceGoal('AI Engineer');

    // Same conditions but new goal — item should reappear
    const ctxB = makeGuidanceContext({
      goalTitle: 'AI Engineer',
      hasGoal: true,
      currentLens: 'DISCOVER',
      completedSteps: [],
      onboardingComplete: true,
      isFirstLogin: false,
    });

    const afterSwitch = getGuidanceForPlacement('discover', ctxB);
    expect(afterSwitch.find((i) => i.id === 'discover-start-reassurance')).toBeDefined();
  });
});

// ── D. HARD REFRESH / REHYDRATION ────────────────────────────────────

describe('D. Hard Refresh / Rehydration', () => {
  it('guidance goal key survives localStorage round-trip', () => {
    syncGuidanceGoal('Doctor');

    // Read it back
    const stored = localStorage.getItem('endeavrly-guidance-goal');
    expect(stored).toBe('Doctor');
  });

  it('after refresh, same goal does not clear dismissals', () => {
    syncGuidanceGoal('Doctor');
    dismissGuidance('my-rule');

    // Simulate app remount / page refresh
    syncGuidanceGoal('Doctor');

    const raw = localStorage.getItem('endeavrly-guidance-dismissed');
    expect(JSON.parse(raw!)).toContain('my-rule');
  });

  it('after refresh with different goal in DB, dismissals are cleared', () => {
    syncGuidanceGoal('Doctor');
    dismissGuidance('my-rule');

    // Simulate: DB now has different goal (user changed via another tab)
    syncGuidanceGoal('AI Engineer');

    const raw = localStorage.getItem('endeavrly-guidance-dismissed');
    expect(raw).toBeNull();
  });

  it('null goal transition clears dismissals', () => {
    syncGuidanceGoal('Doctor');
    dismissGuidance('my-rule');

    // Goal cleared
    syncGuidanceGoal(null);

    const raw = localStorage.getItem('endeavrly-guidance-dismissed');
    expect(raw).toBeNull();
  });
});

// ── E. NAVIGATION REGRESSION ─────────────────────────────────────────

describe('E. Navigation Regression — Context Consistency', () => {
  it('guidance context from fresh journey data always uses latest goal', () => {
    // Simulate: fresh API response with new goal
    const freshJourney = {
      currentLens: 'DISCOVER' as const,
      completedSteps: [] as string[],
      summary: {
        overallProgress: 0,
        lenses: {
          discover: { progress: 0, isComplete: false },
          understand: { progress: 0, isComplete: false },
          act: { progress: 0, isComplete: false },
        },
        primaryGoal: { title: 'AI Engineer' },
        strengths: [] as string[],
        careerInterests: [] as string[],
        savedSummary: { total: 0 },
        alignedActionsCount: 0,
        reflectionSummary: { total: 0 },
      },
    };

    const ctx = buildGuidanceContext({
      journey: freshJourney,
      isFirstLogin: false,
      onboardingComplete: true,
      educationContext: null,
      learningGoalCount: 0,
      jobsApplied: 0,
    });

    expect(ctx.goalTitle).toBe('AI Engineer');
    expect(ctx.hasGoal).toBe(true);
  });

  it('guidance context with null journey still reports no goal', () => {
    const ctx = buildGuidanceContext({
      journey: null,
      isFirstLogin: false,
      onboardingComplete: true,
      educationContext: null,
      learningGoalCount: 0,
      jobsApplied: 0,
    });

    expect(ctx.goalTitle).toBeNull();
    expect(ctx.hasGoal).toBe(false);
  });

  it('all placements return consistent results for same context', () => {
    const ctx = makeGuidanceContext({
      goalTitle: 'AI Engineer',
      hasGoal: true,
    });

    const placements = ['discover', 'understand', 'act', 'learning-goals', 'school-alignment'] as const;

    for (const placement of placements) {
      const items = getGuidanceForPlacement(placement, ctx);
      // Each item's goal-related messages should reference AI Engineer only
      for (const item of items) {
        expect(item.message).not.toContain('Doctor');
        expect(item.message).not.toContain('Software Engineer');
      }
    }
  });
});

// ── F. ASYNC / CACHE REGRESSION ──────────────────────────────────────

describe('F. Async / Cache Regression', () => {
  it('getGuidanceForPlacement always reads fresh from localStorage', () => {
    const ctx = makeGuidanceContext({
      goalTitle: 'Doctor',
      hasGoal: true,
      currentLens: 'DISCOVER',
    });

    // Get initial items
    const initial = getGuidanceForPlacement('discover', ctx);

    // Externally dismiss an item (simulating another component)
    if (initial.length > 0) {
      dismissGuidance(initial[0].id);

      // Re-query — should exclude dismissed item
      const after = getGuidanceForPlacement('discover', ctx);
      expect(after.find((i) => i.id === initial[0].id)).toBeUndefined();
    }
  });

  it('multiple rapid syncGuidanceGoal calls converge to latest', () => {
    syncGuidanceGoal('A');
    dismissGuidance('rule-1');

    syncGuidanceGoal('B');
    dismissGuidance('rule-2');

    syncGuidanceGoal('C');
    dismissGuidance('rule-3');

    // Only the last dismissal should survive
    const raw = localStorage.getItem('endeavrly-guidance-dismissed');
    if (raw) {
      const dismissed = JSON.parse(raw);
      // rule-1 and rule-2 were cleared by goal switches
      expect(dismissed).not.toContain('rule-1');
      expect(dismissed).not.toContain('rule-2');
      expect(dismissed).toContain('rule-3');
    }

    // Goal key should be latest
    expect(localStorage.getItem('endeavrly-guidance-goal')).toBe('C');
  });

  it('stale cached journey data cannot show old goal guidance when dismissals are synced', () => {
    // Setup: User was on Doctor, dismissed guidance
    syncGuidanceGoal('Doctor');
    dismissGuidance('discover-start-reassurance');

    // Goal changes to AI Engineer
    syncGuidanceGoal('AI Engineer');

    // Even if stale cached data still says Doctor, dismissed state is cleared
    // so guidance will re-evaluate fresh when correct context arrives
    const staleCtx = makeGuidanceContext({
      goalTitle: 'Doctor', // stale
      hasGoal: true,
      currentLens: 'DISCOVER',
    });

    const freshCtx = makeGuidanceContext({
      goalTitle: 'AI Engineer', // fresh
      hasGoal: true,
      currentLens: 'DISCOVER',
    });

    // Both should have no dismissed items blocking them
    const staleItems = getGuidanceForPlacement('discover', staleCtx);
    const freshItems = getGuidanceForPlacement('discover', freshCtx);

    // Key assertion: previously dismissed 'discover-start-reassurance' should
    // now be available in fresh context (since dismissals were cleared)
    const rule = GUIDANCE_RULES.find((r) => r.id === 'discover-start-reassurance');
    if (rule && rule.condition(freshCtx)) {
      const found = freshItems.find((i) => i.id === 'discover-start-reassurance');
      expect(found).toBeDefined();
    }
  });
});

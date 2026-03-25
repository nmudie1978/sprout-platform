/**
 * Unit Tests: UI State Generation & Gating Logic
 *
 * Validates:
 * - Correct step statuses (locked/next/completed/skipped)
 * - Lens access gating at UI level
 * - Progress bar accuracy
 * - Step counts and ordering
 * - Conditional rendering signals
 */

import { describe, it, expect } from 'vitest';
import { createOrchestrator } from '@/lib/journey/orchestrator';
import { canAccessLens, JOURNEY_STATES, JOURNEY_STATE_CONFIG, type JourneyStateId } from '@/lib/journey/types';
import {
  calculateDiscoverProgress,
  calculateUnderstandProgress,
  calculateActProgress,
  calculateAllLensProgress,
  getLensProgressSummary,
  getCurrentStepInLens,
  getTotalStepsInLens,
} from '@/lib/journey/progress-calculator';
import {
  makeContext,
  makeSummary,
  assertJourneyState,
  JOURNEY_PRESETS,
  makeExploredRole,
} from '../utils/test-helpers';
import { DEFAULT_JOURNEY_SUMMARY } from '@/lib/journey/types';

// ============================================
// STEP STATUS GENERATION
// ============================================

describe('Step Status Generation', () => {
  it('fresh user: first step is "next", all others "locked"', () => {
    const orch = createOrchestrator(makeContext(), {
      journeyState: 'REFLECT_ON_STRENGTHS',
      journeyCompletedSteps: [],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });
    const ui = orch.getUIState();

    assertJourneyState(ui, {
      stepStatuses: {
        REFLECT_ON_STRENGTHS: 'next',
        EXPLORE_CAREERS: 'locked',
        ROLE_DEEP_DIVE: 'locked',
        REVIEW_INDUSTRY_OUTLOOK: 'locked',
        CAREER_SHADOW: 'locked',
        CREATE_ACTION_PLAN: 'locked',
        COMPLETE_ALIGNED_ACTION: 'locked',
        SUBMIT_ACTION_REFLECTION: 'locked',
        UPDATE_PLAN: 'locked',
        EXTERNAL_FEEDBACK: 'locked',
      },
    });
  });

  it('mid-Discover: first step completed, second is next, rest locked', () => {
    const { context, dbState } = JOURNEY_PRESETS.partialDiscover();
    const orch = createOrchestrator(context, dbState);
    const ui = orch.getUIState();

    assertJourneyState(ui, {
      stepStatuses: {
        REFLECT_ON_STRENGTHS: 'completed',
        EXPLORE_CAREERS: 'next',
        ROLE_DEEP_DIVE: 'locked',
      },
    });
  });

  it('Discover complete: all 3 completed, UNDERSTAND first step is next', () => {
    const { context, dbState } = JOURNEY_PRESETS.discoverComplete();
    const orch = createOrchestrator(context, dbState);
    const ui = orch.getUIState();

    assertJourneyState(ui, {
      stepStatuses: {
        REFLECT_ON_STRENGTHS: 'completed',
        EXPLORE_CAREERS: 'completed',
        ROLE_DEEP_DIVE: 'completed',
        REVIEW_INDUSTRY_OUTLOOK: 'next',
        CAREER_SHADOW: 'locked',
      },
    });
  });

  it('full journey: all mandatory steps completed', () => {
    const { context, dbState } = JOURNEY_PRESETS.fullyComplete();
    const orch = createOrchestrator(context, dbState);
    const ui = orch.getUIState();

    const mandatorySteps: JourneyStateId[] = [
      'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
      'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
      'COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION',
    ];

    for (const stepId of mandatorySteps) {
      const step = ui.steps.find((s) => s.id === stepId);
      expect(step?.status, `${stepId} should be completed`).toBe('completed');
    }
  });
});

// ============================================
// UI STATE SHAPE
// ============================================

describe('UI State Shape', () => {
  it('always returns exactly 10 steps', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);
    const ui = orch.getUIState();

    expect(ui.steps.length).toBe(10);
  });

  it('steps are ordered 0 through 9', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);
    const ui = orch.getUIState();

    for (let i = 0; i < ui.steps.length; i++) {
      expect(ui.steps[i].order).toBe(i);
    }
  });

  it('step IDs match JOURNEY_STATES order', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);
    const ui = orch.getUIState();

    for (let i = 0; i < JOURNEY_STATES.length; i++) {
      expect(ui.steps[i].id).toBe(JOURNEY_STATES[i]);
    }
  });

  it('optional flag is the inverse of mandatory', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);
    const ui = orch.getUIState();

    for (const step of ui.steps) {
      expect(step.optional).toBe(!step.mandatory);
    }
  });

  it('canAdvanceToNextLens is false for fresh user', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);
    const ui = orch.getUIState();

    expect(ui.canAdvanceToNextLens).toBe(false);
    expect(ui.nextStepReason).toBeTruthy();
  });

  it('summary is always present and well-formed', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);
    const ui = orch.getUIState();

    expect(ui.summary).toBeDefined();
    expect(ui.summary.lenses).toBeDefined();
    expect(ui.summary.lenses.discover).toBeDefined();
    expect(ui.summary.lenses.understand).toBeDefined();
    expect(ui.summary.lenses.act).toBeDefined();
  });
});

// ============================================
// LENS ACCESS GATING (UI-Level)
// ============================================

describe('Lens Access Gating', () => {
  it('DISCOVER always accessible', () => {
    expect(canAccessLens('DISCOVER', []).canAccess).toBe(true);
  });

  it('UNDERSTAND locked with 0 steps', () => {
    expect(canAccessLens('UNDERSTAND', []).canAccess).toBe(false);
  });

  it('UNDERSTAND locked with partial DISCOVER', () => {
    const partial: JourneyStateId[] = ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS'];
    expect(canAccessLens('UNDERSTAND', partial).canAccess).toBe(false);
  });

  it('UNDERSTAND unlocked with full DISCOVER', () => {
    const full: JourneyStateId[] = ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'];
    expect(canAccessLens('UNDERSTAND', full).canAccess).toBe(true);
  });

  it('ACT locked without DISCOVER', () => {
    expect(canAccessLens('ACT', []).canAccess).toBe(false);
  });

  it('ACT locked with only DISCOVER done', () => {
    const discover: JourneyStateId[] = ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'];
    expect(canAccessLens('ACT', discover).canAccess).toBe(false);
  });

  it('ACT locked with partial UNDERSTAND', () => {
    const partial: JourneyStateId[] = [
      'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
      'REVIEW_INDUSTRY_OUTLOOK',
    ];
    expect(canAccessLens('ACT', partial).canAccess).toBe(false);
  });

  it('ACT unlocked with full DISCOVER + UNDERSTAND', () => {
    const full: JourneyStateId[] = [
      'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
      'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
    ];
    expect(canAccessLens('ACT', full).canAccess).toBe(true);
  });

  it('access denial includes helpful reason message', () => {
    const { canAccess, reason } = canAccessLens('UNDERSTAND', []);
    expect(canAccess).toBe(false);
    expect(reason).toBeTruthy();
    expect(reason).toContain('DISCOVER');
  });
});

// ============================================
// PROGRESS CALCULATIONS FOR UI
// ============================================

describe('Progress Calculations For UI', () => {
  it('getCurrentStepInLens returns correct step number', () => {
    expect(getCurrentStepInLens('DISCOVER', [])).toBe(1);
    expect(getCurrentStepInLens('DISCOVER', ['REFLECT_ON_STRENGTHS'])).toBe(2);
    expect(getCurrentStepInLens('DISCOVER', ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS'])).toBe(3);
    expect(getCurrentStepInLens('DISCOVER', ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'])).toBe(3); // Caps at max
  });

  it('getTotalStepsInLens returns correct counts', () => {
    expect(getTotalStepsInLens('DISCOVER')).toBe(3);
    expect(getTotalStepsInLens('UNDERSTAND')).toBe(3);
    expect(getTotalStepsInLens('ACT')).toBe(2);
  });

  it('getLensProgressSummary shows step text for incomplete lens', () => {
    const result = calculateDiscoverProgress({
      strengthsConfirmed: true,
      careersExplored: false,
      roleDeepDiveCompleted: false,
    });
    const text = getLensProgressSummary(result);
    expect(text).toBe('Step 2 of 3: Explore careers');
  });

  it('getLensProgressSummary shows "Complete" for finished lens', () => {
    const result = calculateDiscoverProgress({
      strengthsConfirmed: true,
      careersExplored: true,
      roleDeepDiveCompleted: true,
    });
    const text = getLensProgressSummary(result);
    expect(text).toBe('Complete');
  });

  it('getLensProgressSummary shows bonus text for optional completions', () => {
    const result = calculateActProgress({
      alignedActionCompleted: true,
      actionReflectionSubmitted: true,
      planUpdated: true,
      externalFeedbackReceived: true,
    });
    const text = getLensProgressSummary(result);
    expect(text).toContain('Complete');
    expect(text).toContain('+2 bonus');
  });
});

// ============================================
// OVERALL PROGRESS CALCULATOR
// ============================================

describe('Overall Progress Calculator', () => {
  it('returns 0% for completely empty journey', () => {
    const result = calculateAllLensProgress(DEFAULT_JOURNEY_SUMMARY);
    expect(result.overallProgress).toBe(0);
  });

  it('returns 33% when only DISCOVER is complete', () => {
    const summary = makeSummary({
      strengths: ['A', 'B', 'C'],
      careerInterests: ['Doctor'],
      exploredRoles: [makeExploredRole()],
    });
    const result = calculateAllLensProgress(summary);
    expect(result.DISCOVER.isComplete).toBe(true);
    expect(result.UNDERSTAND.isComplete).toBe(false);
    expect(result.ACT.isComplete).toBe(false);
    expect(result.overallProgress).toBe(33);
  });

  it('returns 67% when DISCOVER + UNDERSTAND complete', () => {
    const summary = makeSummary({
      strengths: ['A', 'B', 'C'],
      careerInterests: ['Doctor'],
      exploredRoles: [makeExploredRole()],
      industryInsightsSummary: { trendsReviewed: 3, insightsSaved: 0, lastReviewedAt: new Date().toISOString() },
      shadowSummary: { ...DEFAULT_JOURNEY_SUMMARY.shadowSummary, completed: 1 },
      planCreated: true,
    });
    const result = calculateAllLensProgress(summary);
    expect(result.DISCOVER.isComplete).toBe(true);
    expect(result.UNDERSTAND.isComplete).toBe(true);
    expect(result.overallProgress).toBe(67);
  });

  it('returns 100% when all three lenses complete', () => {
    const summary = makeSummary({
      strengths: ['A', 'B', 'C'],
      careerInterests: ['Doctor'],
      exploredRoles: [makeExploredRole()],
      industryInsightsSummary: { trendsReviewed: 3, insightsSaved: 0, lastReviewedAt: new Date().toISOString() },
      shadowSummary: { ...DEFAULT_JOURNEY_SUMMARY.shadowSummary, completed: 1 },
      planCreated: true,
      alignedActionsCount: 1,
      alignedActionReflections: [{ id: '1', actionId: 'a1', prompt: '', response: 'test', createdAt: '' }],
    });
    const result = calculateAllLensProgress(summary);
    expect(result.overallProgress).toBe(100);
  });

  it('partial across multiple lenses calculates weighted average', () => {
    const summary = makeSummary({
      // DISCOVER: 1 of 3 = 33%
      strengths: ['A', 'B', 'C'],
      // UNDERSTAND: 0%
      // ACT: 0%
    });
    const result = calculateAllLensProgress(summary);
    // (33 + 0 + 0) / 3 = 11
    expect(result.overallProgress).toBe(11);
  });
});

// ============================================
// STEP METADATA ACCURACY
// ============================================

describe('Step Metadata Accuracy', () => {
  it('each step has a non-empty title and description', () => {
    for (const state of JOURNEY_STATES) {
      const config = JOURNEY_STATE_CONFIG[state];
      expect(config.title.length, `${state} title empty`).toBeGreaterThan(0);
      expect(config.description.length, `${state} description empty`).toBeGreaterThan(0);
    }
  });

  it('each step has a valid lens assignment', () => {
    const validLenses = new Set(['DISCOVER', 'UNDERSTAND', 'ACT']);
    for (const state of JOURNEY_STATES) {
      expect(validLenses.has(JOURNEY_STATE_CONFIG[state].lens), `${state} has invalid lens`).toBe(true);
    }
  });

  it('mandatory steps have non-null stepNumber', () => {
    for (const state of JOURNEY_STATES) {
      const config = JOURNEY_STATE_CONFIG[state];
      if (config.mandatory) {
        expect(config.stepNumber, `${state} mandatory but no stepNumber`).not.toBeNull();
      }
    }
  });

  it('optional steps have null stepNumber', () => {
    for (const state of JOURNEY_STATES) {
      const config = JOURNEY_STATE_CONFIG[state];
      if (!config.mandatory) {
        expect(config.stepNumber, `${state} optional but has stepNumber`).toBeNull();
      }
    }
  });
});

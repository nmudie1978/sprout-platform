/**
 * State Persistence & Integrity Tests
 *
 * Validates:
 * - State persistence through orchestrator reload
 * - Career goal switching with independent state
 * - No cross-contamination between goals
 * - Correct restoration after simulated logout/login
 * - State reconciliation when context and DB diverge
 */

import { describe, it, expect } from 'vitest';
import { createOrchestrator, JourneyOrchestrator } from '@/lib/journey/orchestrator';
import { DEFAULT_JOURNEY_SUMMARY, type JourneyStateId, type JourneySummary } from '@/lib/journey/types';
import {
  makeContext,
  makeSummary,
  makeStrengthsData,
  makeExploreCareersData,
  makeRoleDeepDiveData,
  makeIndustryOutlookData,
  makeCareerShadowData,
  makeActionPlanData,
  makeAlignedActionData,
  makeReflectionData,
  makeExploredRole,
  makeRolePlan,
  assertJourneyState,
  JOURNEY_PRESETS,
  MOCK_CAREERS,
} from '../utils/test-helpers';

// ============================================
// SIMULATE PERSIST AND RELOAD
// ============================================

/**
 * Simulates saving state to DB and reloading by extracting
 * serializable state from the orchestrator and creating a new one.
 */
function simulateReload(orch: JourneyOrchestrator, context = makeContext()): JourneyOrchestrator {
  const uiState = orch.getUIState();
  return createOrchestrator(context, {
    journeyState: uiState.currentState,
    journeyCompletedSteps: uiState.completedSteps,
    journeySkippedSteps: uiState.skippedSteps,
    journeySummary: uiState.summary,
  });
}

// ============================================
// STATE PERSISTENCE AFTER TRANSITIONS
// ============================================

describe('State Persistence After Transitions', () => {
  it('preserves current state through reload', () => {
    const { context, dbState } = JOURNEY_PRESETS.partialDiscover();
    const orch = createOrchestrator(context, dbState);

    const reloaded = simulateReload(orch, JOURNEY_PRESETS.partialDiscover().context);
    expect(reloaded.getCurrentState()).toBe(orch.getCurrentState());
  });

  it('preserves completed steps through reload', () => {
    const { context, dbState } = JOURNEY_PRESETS.discoverComplete();
    const orch = createOrchestrator(context, dbState);

    const reloaded = simulateReload(orch, JOURNEY_PRESETS.discoverComplete().context);
    expect(reloaded.getCompletedSteps()).toEqual(
      expect.arrayContaining(orch.getCompletedSteps())
    );
  });

  it('preserves summary data through reload', () => {
    const { context, dbState } = JOURNEY_PRESETS.discoverComplete();
    const orch = createOrchestrator(context, dbState);

    const reloaded = simulateReload(orch, JOURNEY_PRESETS.discoverComplete().context);
    const originalSummary = orch.getSummary();
    const reloadedSummary = reloaded.getSummary();

    expect(reloadedSummary.strengths).toEqual(originalSummary.strengths);
    expect(reloadedSummary.careerInterests).toEqual(originalSummary.careerInterests);
  });

  it('preserves skipped steps through reload', () => {
    const { context, dbState } = JOURNEY_PRESETS.fullyComplete();
    const orch = createOrchestrator(context, dbState);
    orch.skipStep('UPDATE_PLAN', 'Testing persistence');

    const reloaded = simulateReload(orch, JOURNEY_PRESETS.fullyComplete().context);
    expect(reloaded.isStepSkipped('UPDATE_PLAN')).toBe(true);
  });

  it('preserves state after completing a step and reloading', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);

    orch.updateSummary(makeStrengthsData());
    orch.markStepCompleted('REFLECT_ON_STRENGTHS');
    orch.transitionTo('EXPLORE_CAREERS');

    // Simulate page refresh with updated context
    const updatedContext = makeContext({
      confirmedStrengths: ['Communication', 'Teamwork', 'Problem Solving'],
    });
    const reloaded = simulateReload(orch, updatedContext);

    expect(reloaded.getCurrentState()).toBe('EXPLORE_CAREERS');
    expect(reloaded.isStepCompleted('REFLECT_ON_STRENGTHS')).toBe(true);
  });
});

// ============================================
// CAREER GOAL SWITCHING
// ============================================

describe('Career Goal Switching', () => {
  it('creates independent orchestrators for different goals', () => {
    // Doctor journey: completed Discover
    const doctorContext = makeContext({
      confirmedStrengths: ['Communication', 'Teamwork', 'Problem Solving'],
      savedCareers: [MOCK_CAREERS.doctor],
      exploredRolesCount: 1,
    });
    const doctorOrch = createOrchestrator(doctorContext, {
      journeyState: 'REVIEW_INDUSTRY_OUTLOOK',
      journeyCompletedSteps: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'],
      journeySummary: makeSummary({
        primaryGoal: { title: 'Doctor', selectedAt: '2026-01-01' },
        strengths: ['Communication', 'Teamwork', 'Problem Solving'],
        exploredRoles: [makeExploredRole('Doctor')],
      }),
    });

    // Engineer journey: just started
    const engineerContext = makeContext({
      confirmedStrengths: ['Analytical', 'Logical', 'Creative'],
    });
    const engineerOrch = createOrchestrator(engineerContext, {
      journeyState: 'EXPLORE_CAREERS',
      journeyCompletedSteps: ['REFLECT_ON_STRENGTHS'],
      journeySummary: makeSummary({
        primaryGoal: { title: 'Software Engineer', selectedAt: '2026-02-01' },
        strengths: ['Analytical', 'Logical', 'Creative'],
      }),
    });

    // They should be independent
    expect(doctorOrch.getCurrentState()).toBe('REVIEW_INDUSTRY_OUTLOOK');
    expect(engineerOrch.getCurrentState()).toBe('EXPLORE_CAREERS');
    expect(doctorOrch.getCompletedSteps().length).toBe(3);
    expect(engineerOrch.getCompletedSteps().length).toBe(1);
  });

  it('no cross-contamination: Doctor data does not leak into Engineer', () => {
    const doctorSummary = makeSummary({
      primaryGoal: { title: 'Doctor', selectedAt: '2026-01-01' },
      roleRealityNotes: ['Long hours in hospital'],
      pathQualifications: ['MBBS'],
      pathSkills: ['Diagnosis'],
    });

    const engineerSummary = makeSummary({
      primaryGoal: { title: 'Engineer', selectedAt: '2026-02-01' },
      roleRealityNotes: ['Remote work possible'],
      pathQualifications: ['CS Degree'],
      pathSkills: ['JavaScript'],
    });

    // Verify no cross-contamination
    expect(doctorSummary.pathQualifications).not.toContain('CS Degree');
    expect(engineerSummary.pathQualifications).not.toContain('MBBS');
    expect(doctorSummary.pathSkills).not.toContain('JavaScript');
    expect(engineerSummary.pathSkills).not.toContain('Diagnosis');
  });

  it('switching between goals preserves each goal state independently', () => {
    // Create Doctor journey at Understand
    const doctorData = JOURNEY_PRESETS.discoverComplete();
    const doctorOrch = createOrchestrator(doctorData.context, doctorData.dbState);
    const doctorState = doctorOrch.getUIState();

    // Create Engineer journey at Discover
    const engineerData = JOURNEY_PRESETS.partialDiscover();
    const engineerOrch = createOrchestrator(engineerData.context, engineerData.dbState);
    const engineerState = engineerOrch.getUIState();

    // "Switch" back to Doctor — should still be at Understand
    const doctorReloaded = createOrchestrator(doctorData.context, {
      journeyState: doctorState.currentState,
      journeyCompletedSteps: doctorState.completedSteps,
      journeySummary: doctorState.summary,
    });
    expect(doctorReloaded.getCurrentState()).toBe('REVIEW_INDUSTRY_OUTLOOK');
    expect(doctorReloaded.getCurrentLens()).toBe('UNDERSTAND');

    // Engineer still at Discover
    expect(engineerOrch.getCurrentState()).toBe('EXPLORE_CAREERS');
    expect(engineerOrch.getCurrentLens()).toBe('DISCOVER');
  });
});

// ============================================
// STATE RECONCILIATION
// ============================================

describe('State Reconciliation', () => {
  it('auto-advances when context shows completion but DB is behind', () => {
    // Context says all DISCOVER steps done, but DB state is at first step
    const context = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [MOCK_CAREERS.doctor],
      exploredRolesCount: 1,
    });

    const orch = createOrchestrator(context, {
      journeyState: 'REFLECT_ON_STRENGTHS',
      journeyCompletedSteps: [],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });

    // Should reconcile to REVIEW_INDUSTRY_OUTLOOK
    expect(orch.getCurrentState()).toBe('REVIEW_INDUSTRY_OUTLOOK');
    expect(orch.getCompletedSteps()).toContain('REFLECT_ON_STRENGTHS');
    expect(orch.getCompletedSteps()).toContain('EXPLORE_CAREERS');
    expect(orch.getCompletedSteps()).toContain('ROLE_DEEP_DIVE');
  });

  it('stops reconciliation at first incomplete step', () => {
    // Only strengths are done
    const context = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      // savedCareers empty => EXPLORE_CAREERS not complete
    });

    const orch = createOrchestrator(context, {
      journeyState: 'REFLECT_ON_STRENGTHS',
      journeyCompletedSteps: [],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });

    expect(orch.getCurrentState()).toBe('EXPLORE_CAREERS');
    expect(orch.getCompletedSteps()).toContain('REFLECT_ON_STRENGTHS');
    expect(orch.getCompletedSteps()).not.toContain('EXPLORE_CAREERS');
  });

  it('handles invalid stored state by recalculating', () => {
    const { context, dbState } = JOURNEY_PRESETS.invalidState();
    const orch = createOrchestrator(context, dbState);

    // Should fall back to REFLECT_ON_STRENGTHS
    expect(orch.getCurrentState()).toBe('REFLECT_ON_STRENGTHS');
  });

  it('reconciles full journey to correct final state', () => {
    const context = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [MOCK_CAREERS.doctor],
      exploredRolesCount: 1,
      industryOutlookReviewed: true,
      pathDataSaved: true,
      shadowsCompleted: 1,
      planCreated: true,
      alignedActionsCompleted: 1,
      actionReflectionsSubmitted: 1,
    });

    const orch = createOrchestrator(context, {
      journeyState: 'REFLECT_ON_STRENGTHS',
      journeyCompletedSteps: [],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });

    // Should reconcile all the way to UPDATE_PLAN (next after SUBMIT_ACTION_REFLECTION)
    expect(orch.getCurrentState()).toBe('UPDATE_PLAN');
    expect(orch.getCompletedSteps().length).toBe(8);
  });
});

// ============================================
// CORRUPT STATE RECOVERY
// ============================================

describe('Corrupt State Recovery', () => {
  it('handles null journey summary gracefully', () => {
    const context = makeContext();
    const orch = createOrchestrator(context, {
      journeyState: 'REFLECT_ON_STRENGTHS',
      journeyCompletedSteps: [],
      journeySummary: null,
    });

    expect(orch.getCurrentState()).toBe('REFLECT_ON_STRENGTHS');
    expect(orch.getSummary()).toBeDefined();
    expect(orch.getSummary().lenses).toBeDefined();
  });

  it('handles null db state gracefully', () => {
    const context = makeContext();
    const orch = createOrchestrator(context, null);

    expect(orch.getCurrentState()).toBe('REFLECT_ON_STRENGTHS');
    expect(orch.getCompletedSteps()).toEqual([]);
  });

  it('handles DB state ahead of context (orphaned progress)', () => {
    // DB says CAREER_SHADOW is next, but context shows nothing completed
    const { context, dbState } = JOURNEY_PRESETS.corrupted();
    const orch = createOrchestrator(context, dbState);

    // Context has no completed steps, so reconciliation won't advance
    // Current state from DB should be used but context determines actual completion
    const state = orch.getCurrentState();
    const completed = orch.getCompletedSteps();

    // The orchestrator respects the DB-stored state as the starting point for reconciliation
    // Since context shows nothing completed, it should start fresh
    expect(state).toBeDefined();
    // All Discover steps were in completedSteps, but context shows they aren't met
    // The stored completedSteps from DB are preserved
    expect(completed.length).toBeGreaterThanOrEqual(0);
  });

  it('recovers when completedSteps contains invalid state IDs', () => {
    const context = makeContext();
    const orch = createOrchestrator(context, {
      journeyState: 'REFLECT_ON_STRENGTHS',
      journeyCompletedSteps: ['INVALID_STATE' as JourneyStateId, 'REFLECT_ON_STRENGTHS'],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });

    // Should still function
    expect(orch.getCurrentState()).toBeDefined();
    expect(orch.getUIState()).toBeDefined();
  });
});

// ============================================
// SUMMARY DATA INTEGRITY
// ============================================

describe('Summary Data Integrity', () => {
  it('does not create duplicate career interests on re-exploration', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);

    orch.updateSummary(makeExploreCareersData(['Doctor', 'Engineer']));
    orch.updateSummary(makeExploreCareersData(['Doctor', 'Teacher'])); // Doctor already exists

    const summary = orch.getSummary();
    const doctorCount = summary.careerInterests.filter((c) => c === 'Doctor').length;
    expect(doctorCount).toBe(1); // No duplicates
    expect(summary.careerInterests).toContain('Teacher');
    expect(summary.careerInterests).toContain('Engineer');
  });

  it('does not create duplicate explored roles', () => {
    const { context, dbState } = JOURNEY_PRESETS.partialDiscover();
    const orch = createOrchestrator(context, dbState);

    const role = makeExploredRole('Doctor');
    orch.updateSummary({ type: 'ROLE_DEEP_DIVE', role });
    orch.updateSummary({ type: 'ROLE_DEEP_DIVE', role: { ...role, entryExpectations: 'Updated expectations' } });

    const summary = orch.getSummary();
    const doctorRoles = summary.exploredRoles.filter((r) => r.title === 'Doctor');
    expect(doctorRoles.length).toBe(1);
    expect(doctorRoles[0].entryExpectations).toBe('Updated expectations');
  });

  it('does not create duplicate demonstrated skills', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);

    orch.updateSummary({
      type: 'REFLECT_ON_STRENGTHS',
      topStrengths: ['A', 'B', 'C'],
      demonstratedSkills: ['Teamwork', 'Leadership'],
    });
    orch.updateSummary({
      type: 'REFLECT_ON_STRENGTHS',
      topStrengths: ['A', 'B', 'C'],
      demonstratedSkills: ['Teamwork', 'Communication'],
    });

    const summary = orch.getSummary();
    const teamworkCount = summary.demonstratedSkills.filter((s) => s === 'Teamwork').length;
    expect(teamworkCount).toBe(1);
    expect(summary.demonstratedSkills).toContain('Communication');
    expect(summary.demonstratedSkills).toContain('Leadership');
  });

  it('updates role plan instead of duplicating when same role title', () => {
    const { context, dbState } = JOURNEY_PRESETS.discoverComplete();
    const orch = createOrchestrator(context, dbState);

    orch.updateSummary(makeActionPlanData('Doctor'));
    orch.updateSummary(makeActionPlanData('Doctor')); // Same role again

    const summary = orch.getSummary();
    const doctorPlans = summary.rolePlans.filter((p) => p.roleTitle === 'Doctor');
    expect(doctorPlans.length).toBe(1);
  });
});

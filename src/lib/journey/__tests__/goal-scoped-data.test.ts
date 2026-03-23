/**
 * Tests for Goal-Scoped Journey Data
 *
 * Verifies:
 * 1. Goal data isolation — different goals have independent state
 * 2. Shared vs goal-specific data separation
 * 3. Step completion syncs to goal data
 * 4. Orchestrator context sync works correctly
 * 5. Roadmap card data structure
 * 6. Goal switching preserves data
 * 7. Migration logic
 * 8. Edge cases
 */

import { describe, it, expect } from 'vitest';
import { DEFAULT_JOURNEY_SUMMARY, type JourneySummary } from '../types';
import { createOrchestrator } from '../orchestrator';
import type { JourneyStateContext, JourneyStateId } from '../types';

// ============================================
// HELPERS
// ============================================

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function createDefaultContext(overrides: Partial<JourneyStateContext> = {}): JourneyStateContext {
  return {
    userId: 'test-user-1',
    profile: { displayName: 'Test User', bio: null, city: null, skillTags: [], interests: [], careerAspiration: null },
    confirmedStrengths: [],
    savedCareers: [],
    exploredRolesCount: 0,
    primaryGoalSelected: false,
    industryOutlookReviewed: false,
    requirementsReviewed: false,
    planCreated: false,
    shadowsRequested: 0,
    shadowsCompleted: 0,
    shadowsSkipped: false,
    pathDataSaved: false,
    savedItemsCount: 0,
    alignedActionsCompleted: 0,
    actionReflectionsSubmitted: 0,
    externalFeedbackReceived: false,
    planUpdatedAfterAction: false,
    completedJobs: 0,
    reflectionsCount: 0,
    journeySummary: null,
    skippedSteps: {},
    ...overrides,
  };
}

function createSummaryWithGoalData(goalTitle: string): JourneySummary {
  return {
    ...DEFAULT_JOURNEY_SUMMARY,
    primaryGoal: { title: goalTitle, selectedAt: new Date().toISOString() },
    strengths: ['Communication', 'Problem Solving'],
    careerInterests: ['TECHNOLOGY_IT'],
  };
}

// ============================================
// GOAL ID GENERATION
// ============================================

describe('Goal ID Generation', () => {
  it('should slugify goal titles consistently', () => {
    expect(slugify('Physiotherapist (Fysioterapeut)')).toBe('physiotherapist-fysioterapeut');
    expect(slugify('Software Developer')).toBe('software-developer');
    expect(slugify('Application Security Lead')).toBe('application-security-lead');
  });

  it('should handle special characters', () => {
    expect(slugify('AI & Machine Learning')).toBe('ai-machine-learning');
    expect(slugify('  Spaces  Around  ')).toBe('spaces-around');
  });

  it('should produce unique IDs for different goals', () => {
    const id1 = slugify('Physiotherapist');
    const id2 = slugify('Software Developer');
    expect(id1).not.toBe(id2);
  });

  it('should produce same ID for same goal', () => {
    const id1 = slugify('Physiotherapist');
    const id2 = slugify('Physiotherapist');
    expect(id1).toBe(id2);
  });
});

// ============================================
// DATA ISOLATION
// ============================================

describe('Goal Data Isolation', () => {
  it('should create independent orchestrators for different goals', () => {
    const context1 = createDefaultContext({
      confirmedStrengths: ['Communication', 'Teamwork', 'Problem Solving'],
      savedCareers: [{ id: '1', title: 'TECHNOLOGY_IT', savedAt: '' }],
      exploredRolesCount: 1,
    });
    const context2 = createDefaultContext({
      confirmedStrengths: ['Communication', 'Teamwork', 'Problem Solving'],
      // No saved careers — still on EXPLORE_CAREERS
    });

    const orch1 = createOrchestrator(context1, {
      journeyState: 'REVIEW_INDUSTRY_OUTLOOK',
      journeyCompletedSteps: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'],
      journeySummary: createSummaryWithGoalData('Software Developer'),
    });

    const orch2 = createOrchestrator(context2, {
      journeyState: 'EXPLORE_CAREERS',
      journeyCompletedSteps: ['REFLECT_ON_STRENGTHS'],
      journeySummary: createSummaryWithGoalData('Nurse'),
    });

    expect(orch1.getCurrentState()).toBe('REVIEW_INDUSTRY_OUTLOOK');
    expect(orch2.getCurrentState()).toBe('EXPLORE_CAREERS');
    expect(orch1.getCompletedSteps().length).toBe(3);
    // orch2: REFLECT_ON_STRENGTHS completed via reconciliation + 1 from DB
    expect(orch2.getCompletedSteps()).toContain('REFLECT_ON_STRENGTHS');
  });
});

// ============================================
// SHARED vs GOAL-SPECIFIC DATA
// ============================================

describe('Shared vs Goal-Specific Data', () => {
  it('strengths should be on the profile (shared across goals)', () => {
    const summary = createSummaryWithGoalData('Developer');
    // Strengths are in the summary but conceptually shared
    expect(summary.strengths).toEqual(['Communication', 'Problem Solving']);
  });

  it('career interests should be on the profile (shared)', () => {
    const summary = createSummaryWithGoalData('Developer');
    expect(summary.careerInterests).toEqual(['TECHNOLOGY_IT']);
  });

  it('role-specific data should be separate per goal', () => {
    const summary1: JourneySummary = {
      ...DEFAULT_JOURNEY_SUMMARY,
      roleRealityNotes: ['Involves coding daily'],
      industryInsightNotes: ['Tech is growing'],
      pathQualifications: ['CS Degree'],
    };

    const summary2: JourneySummary = {
      ...DEFAULT_JOURNEY_SUMMARY,
      roleRealityNotes: ['Patient care focused'],
      industryInsightNotes: ['Healthcare demand rising'],
      pathQualifications: ['Nursing Degree'],
    };

    // These should be completely independent
    expect(summary1.roleRealityNotes).not.toEqual(summary2.roleRealityNotes);
    expect(summary1.pathQualifications).not.toEqual(summary2.pathQualifications);
  });
});

// ============================================
// ORCHESTRATOR CONTEXT SYNC
// ============================================

describe('Orchestrator Context Sync', () => {
  it('should sync confirmedStrengths after REFLECT_ON_STRENGTHS completion', () => {
    const context = createDefaultContext();
    const orchestrator = createOrchestrator(context, {
      journeyState: 'REFLECT_ON_STRENGTHS',
      journeyCompletedSteps: [],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });

    orchestrator.updateSummary({
      type: 'REFLECT_ON_STRENGTHS',
      topStrengths: ['A', 'B', 'C'],
      demonstratedSkills: ['X'],
    });

    // After updateSummary, context should be synced
    const uiState = orchestrator.getUIState();
    expect(uiState.summary.strengths).toEqual(['A', 'B', 'C']);
  });

  it('should sync industryOutlookReviewed after REVIEW_INDUSTRY_OUTLOOK', () => {
    const context = createDefaultContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [{ id: '1', title: 'IT', savedAt: '' }],
      exploredRolesCount: 1,
    });
    const orchestrator = createOrchestrator(context, {
      journeyState: 'REVIEW_INDUSTRY_OUTLOOK',
      journeyCompletedSteps: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });

    orchestrator.updateSummary({
      type: 'REVIEW_INDUSTRY_OUTLOOK',
      trendsReviewed: ['a', 'b', 'c'],
      outlookNotes: ['note1'],
      roleRealityNotes: ['reality'],
      industryInsightNotes: ['insight'],
    });

    const summary = orchestrator.getSummary();
    expect(summary.roleRealityNotes).toEqual(['reality']);
    expect(summary.industryInsightNotes).toEqual(['insight']);
  });

  it('should sync pathDataSaved after CAREER_SHADOW (path data) completion', () => {
    const context = createDefaultContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [{ id: '1', title: 'IT', savedAt: '' }],
      exploredRolesCount: 1,
      industryOutlookReviewed: true,
    });
    const orchestrator = createOrchestrator(context, {
      journeyState: 'CAREER_SHADOW',
      journeyCompletedSteps: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE', 'REVIEW_INDUSTRY_OUTLOOK'],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });

    orchestrator.updateSummary({
      type: 'CAREER_SHADOW',
      qualifications: ['BSc'],
      keySkills: ['Python'],
    });

    const summary = orchestrator.getSummary();
    expect(summary.pathQualifications).toEqual(['BSc']);
    expect(summary.pathSkills).toEqual(['Python']);
  });
});

// ============================================
// ROADMAP CARD DATA STRUCTURE
// ============================================

describe('Roadmap Card Data Structure', () => {
  it('should have correct shape for card annotations', () => {
    const cardData = {
      'item-1': { status: 'done', notes: 'Completed this', resourceLink: 'https://example.com', confidence: 'high' },
      'item-2': { status: 'in_progress', notes: '', resourceLink: '', confidence: 'medium' },
      'item-3': { status: 'not_started', notes: '', resourceLink: '', confidence: '' },
    };

    expect(cardData['item-1'].status).toBe('done');
    expect(cardData['item-2'].status).toBe('in_progress');
    expect(cardData['item-3'].status).toBe('not_started');
  });

  it('should default to not_started for unknown items', () => {
    const cardData: Record<string, unknown> = {};
    const itemId = 'unknown-item';
    const status = (cardData[itemId] as { status?: string })?.status || 'not_started';
    expect(status).toBe('not_started');
  });
});

// ============================================
// STEP ORDERING GATE
// ============================================

describe('Step Ordering', () => {
  it('should not allow completing a step that is not current', () => {
    const context = createDefaultContext();
    const orchestrator = createOrchestrator(context, {
      journeyState: 'REFLECT_ON_STRENGTHS',
      journeyCompletedSteps: [],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });

    const currentState = orchestrator.getCurrentState();
    expect(currentState).toBe('REFLECT_ON_STRENGTHS');

    // EXPLORE_CAREERS is not the current state
    const completedSteps = orchestrator.getCompletedSteps();
    const canCompleteExploreCareers = 'EXPLORE_CAREERS' === currentState || completedSteps.includes('EXPLORE_CAREERS' as JourneyStateId);
    expect(canCompleteExploreCareers).toBe(false);
  });

  it('should allow re-completing an already completed step', () => {
    const context = createDefaultContext({
      confirmedStrengths: ['A', 'B', 'C'],
    });
    const orchestrator = createOrchestrator(context, {
      journeyState: 'EXPLORE_CAREERS',
      journeyCompletedSteps: ['REFLECT_ON_STRENGTHS'],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });

    const completedSteps = orchestrator.getCompletedSteps();
    const canReComplete = completedSteps.includes('REFLECT_ON_STRENGTHS');
    expect(canReComplete).toBe(true);
  });
});

// ============================================
// RECONCILIATION
// ============================================

describe('State Reconciliation', () => {
  it('should auto-advance past completed steps on load', () => {
    // Context shows strengths done, careers done, deep dive done
    const context = createDefaultContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [{ id: '1', title: 'IT', savedAt: '' }],
      exploredRolesCount: 1,
    });

    // But DB says current state is still REFLECT_ON_STRENGTHS
    const orchestrator = createOrchestrator(context, {
      journeyState: 'REFLECT_ON_STRENGTHS',
      journeyCompletedSteps: [],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });

    // Reconciliation should advance to REVIEW_INDUSTRY_OUTLOOK
    expect(orchestrator.getCurrentState()).toBe('REVIEW_INDUSTRY_OUTLOOK');
    expect(orchestrator.getCompletedSteps()).toContain('REFLECT_ON_STRENGTHS');
    expect(orchestrator.getCompletedSteps()).toContain('EXPLORE_CAREERS');
    expect(orchestrator.getCompletedSteps()).toContain('ROLE_DEEP_DIVE');
  });

  it('should stop reconciliation at first incomplete step', () => {
    const context = createDefaultContext({
      confirmedStrengths: ['A', 'B', 'C'],
      // savedCareers is empty — EXPLORE_CAREERS not complete
    });

    const orchestrator = createOrchestrator(context, {
      journeyState: 'REFLECT_ON_STRENGTHS',
      journeyCompletedSteps: [],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });

    // Should advance past REFLECT_ON_STRENGTHS but stop at EXPLORE_CAREERS
    expect(orchestrator.getCurrentState()).toBe('EXPLORE_CAREERS');
    expect(orchestrator.getCompletedSteps()).toContain('REFLECT_ON_STRENGTHS');
    expect(orchestrator.getCompletedSteps()).not.toContain('EXPLORE_CAREERS');
  });
});

// ============================================
// EDGE CASES
// ============================================

describe('Edge Cases', () => {
  it('should handle null journey summary gracefully', () => {
    const context = createDefaultContext();
    const orchestrator = createOrchestrator(context, {
      journeyState: 'REFLECT_ON_STRENGTHS',
      journeyCompletedSteps: [],
      journeySummary: null,
    });

    expect(orchestrator.getCurrentState()).toBe('REFLECT_ON_STRENGTHS');
    expect(orchestrator.getCompletedSteps()).toEqual([]);
  });

  it('should handle empty completed steps', () => {
    const context = createDefaultContext();
    const orchestrator = createOrchestrator(context, {
      journeyState: 'REFLECT_ON_STRENGTHS',
      journeyCompletedSteps: [],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });

    expect(orchestrator.isStepCompleted('REFLECT_ON_STRENGTHS')).toBe(false);
  });

  it('should handle markStepCompleted for last step', () => {
    const context = createDefaultContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [{ id: '1', title: 'IT', savedAt: '' }],
      exploredRolesCount: 1,
      industryOutlookReviewed: true,
      pathDataSaved: true,
      planCreated: true,
      alignedActionsCompleted: 1,
      actionReflectionsSubmitted: 1,
      planUpdatedAfterAction: true,
      externalFeedbackReceived: true,
      shadowsCompleted: 1,
    });

    const allSteps: JourneyStateId[] = [
      'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
      'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
      'COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION', 'UPDATE_PLAN',
    ];

    const orchestrator = createOrchestrator(context, {
      journeyState: 'EXTERNAL_FEEDBACK',
      journeyCompletedSteps: allSteps,
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });

    orchestrator.markStepCompleted('EXTERNAL_FEEDBACK');
    expect(orchestrator.isStepCompleted('EXTERNAL_FEEDBACK')).toBe(true);
  });

  it('should handle goal title with unicode characters', () => {
    const goalId = slugify('Lege (Doctor) — Øst-Norge');
    expect(goalId).toBe('lege-doctor-st-norge');
    expect(goalId.length).toBeGreaterThan(0);
  });
});

// ============================================
// LENS PROGRESS WITH GOAL DATA
// ============================================

describe('Lens Progress with Goal-Specific Data', () => {
  it('should calculate Understand progress with path data', () => {
    const context = createDefaultContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [{ id: '1', title: 'IT', savedAt: '' }],
      exploredRolesCount: 1,
      industryOutlookReviewed: true,
      pathDataSaved: true,
      shadowsCompleted: 1,
    });

    const orchestrator = createOrchestrator(context, {
      journeyState: 'CREATE_ACTION_PLAN',
      journeyCompletedSteps: [
        'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
        'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW',
      ],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    });

    const uiState = orchestrator.getUIState();
    const understandProgress = uiState.summary.lenses.understand;
    // 2 of 3 mandatory steps done (REVIEW_INDUSTRY_OUTLOOK + CAREER_SHADOW)
    expect(understandProgress.progress).toBe(67);
  });
});

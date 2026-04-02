/**
 * Unit Tests: Step Completion Data Validation
 *
 * Validates the validateStepCompletionData function across all step types.
 * Tests both valid and invalid inputs to ensure data integrity at the API boundary.
 */

import { describe, it, expect } from 'vitest';
import { validateStepCompletionData } from '@/lib/journey/orchestrator';
import type { StepCompletionData, JourneyStateId } from '@/lib/journey/types';
import {
  makeStrengthsData,
  makeExploreCareersData,
  makeRoleDeepDiveData,
  makeIndustryOutlookData,
  makeCareerShadowData,
  makeActionPlanData,
  makeAlignedActionData,
  makeReflectionData,
  makeUpdatePlanData,
  makeExternalFeedbackData,
  makeExploredRole,
  makeRolePlan,
} from '../utils/test-helpers';

// ============================================
// VALID INPUTS (happy path)
// ============================================

describe('Valid Step Completion Data', () => {
  const validCases: { stepId: JourneyStateId; data: StepCompletionData }[] = [
    { stepId: 'REFLECT_ON_STRENGTHS', data: makeStrengthsData() },
    { stepId: 'EXPLORE_CAREERS', data: makeExploreCareersData() },
    { stepId: 'ROLE_DEEP_DIVE', data: makeRoleDeepDiveData() },
    { stepId: 'REVIEW_INDUSTRY_OUTLOOK', data: makeIndustryOutlookData() },
    { stepId: 'CAREER_SHADOW', data: makeCareerShadowData() },
    { stepId: 'CREATE_ACTION_PLAN', data: makeActionPlanData() },
    { stepId: 'COMPLETE_ALIGNED_ACTION', data: makeAlignedActionData() },
    { stepId: 'SUBMIT_ACTION_REFLECTION', data: makeReflectionData() },
  ];

  for (const { stepId, data } of validCases) {
    it(`accepts valid data for ${stepId}`, () => {
      const result = validateStepCompletionData(stepId, data);
      expect(result.valid, `${stepId} should accept valid data: ${result.error}`).toBe(true);
    });
  }
});

// ============================================
// REFLECT_ON_STRENGTHS VALIDATION
// ============================================

describe('REFLECT_ON_STRENGTHS Validation', () => {
  it('rejects empty strengths array', () => {
    const result = validateStepCompletionData('REFLECT_ON_STRENGTHS', {
      type: 'REFLECT_ON_STRENGTHS',
      topStrengths: [],
      demonstratedSkills: [],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects 1 strength', () => {
    const result = validateStepCompletionData('REFLECT_ON_STRENGTHS', {
      type: 'REFLECT_ON_STRENGTHS',
      topStrengths: ['Only one'],
      demonstratedSkills: [],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects 2 strengths', () => {
    const result = validateStepCompletionData('REFLECT_ON_STRENGTHS', {
      type: 'REFLECT_ON_STRENGTHS',
      topStrengths: ['One', 'Two'],
      demonstratedSkills: [],
    });
    expect(result.valid).toBe(false);
  });

  it('accepts exactly 3 strengths', () => {
    const result = validateStepCompletionData('REFLECT_ON_STRENGTHS', makeStrengthsData());
    expect(result.valid).toBe(true);
  });

  it('accepts more than 3 strengths', () => {
    const result = validateStepCompletionData('REFLECT_ON_STRENGTHS', {
      type: 'REFLECT_ON_STRENGTHS',
      topStrengths: ['A', 'B', 'C', 'D', 'E'],
      demonstratedSkills: [],
    });
    expect(result.valid).toBe(true);
  });
});

// ============================================
// EXPLORE_CAREERS VALIDATION
// ============================================

describe('EXPLORE_CAREERS Validation', () => {
  it('rejects empty career selection', () => {
    const result = validateStepCompletionData('EXPLORE_CAREERS', {
      type: 'EXPLORE_CAREERS',
      selectedCareers: [],
    });
    expect(result.valid).toBe(false);
  });

  it('accepts single career', () => {
    const result = validateStepCompletionData('EXPLORE_CAREERS', makeExploreCareersData(['Doctor']));
    expect(result.valid).toBe(true);
  });

  it('accepts multiple careers', () => {
    const result = validateStepCompletionData('EXPLORE_CAREERS', makeExploreCareersData(['Doctor', 'Engineer', 'Teacher']));
    expect(result.valid).toBe(true);
  });
});

// ============================================
// ROLE_DEEP_DIVE VALIDATION
// ============================================

describe('ROLE_DEEP_DIVE Validation', () => {
  it('rejects missing role', () => {
    const result = validateStepCompletionData('ROLE_DEEP_DIVE', {
      type: 'ROLE_DEEP_DIVE',
      role: undefined as unknown as ReturnType<typeof makeExploredRole>,
    });
    expect(result.valid).toBe(false);
  });

  it('rejects role with empty title', () => {
    const result = validateStepCompletionData('ROLE_DEEP_DIVE', {
      type: 'ROLE_DEEP_DIVE',
      role: { ...makeExploredRole(), title: '' },
    });
    expect(result.valid).toBe(false);
  });

  it('accepts valid role data', () => {
    const result = validateStepCompletionData('ROLE_DEEP_DIVE', makeRoleDeepDiveData());
    expect(result.valid).toBe(true);
  });
});

// ============================================
// REVIEW_INDUSTRY_OUTLOOK VALIDATION
// ============================================

describe('REVIEW_INDUSTRY_OUTLOOK Validation', () => {
  it('rejects fewer than 3 trends', () => {
    const result = validateStepCompletionData('REVIEW_INDUSTRY_OUTLOOK', {
      type: 'REVIEW_INDUSTRY_OUTLOOK',
      trendsReviewed: ['one', 'two'],
      outlookNotes: ['note'],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects empty trends', () => {
    const result = validateStepCompletionData('REVIEW_INDUSTRY_OUTLOOK', {
      type: 'REVIEW_INDUSTRY_OUTLOOK',
      trendsReviewed: [],
      outlookNotes: [],
    });
    expect(result.valid).toBe(false);
  });

  it('accepts exactly 3 trends', () => {
    const result = validateStepCompletionData('REVIEW_INDUSTRY_OUTLOOK', makeIndustryOutlookData());
    expect(result.valid).toBe(true);
  });
});

// ============================================
// CREATE_ACTION_PLAN VALIDATION
// ============================================

describe('CREATE_ACTION_PLAN Validation', () => {
  it('rejects fewer than 2 short-term actions', () => {
    const result = validateStepCompletionData('CREATE_ACTION_PLAN', {
      type: 'CREATE_ACTION_PLAN',
      plan: { ...makeRolePlan(), shortTermActions: ['one'] },
    });
    expect(result.valid).toBe(false);
  });

  it('accepts empty mid-term milestone (optional field)', () => {
    const result = validateStepCompletionData('CREATE_ACTION_PLAN', {
      type: 'CREATE_ACTION_PLAN',
      plan: { ...makeRolePlan(), midTermMilestone: '' },
    });
    expect(result.valid).toBe(true);
  });

  it('rejects missing skill to build', () => {
    const result = validateStepCompletionData('CREATE_ACTION_PLAN', {
      type: 'CREATE_ACTION_PLAN',
      plan: { ...makeRolePlan(), skillToBuild: '' },
    });
    expect(result.valid).toBe(false);
  });

  it('accepts complete action plan', () => {
    const result = validateStepCompletionData('CREATE_ACTION_PLAN', makeActionPlanData());
    expect(result.valid).toBe(true);
  });
});

// ============================================
// CAREER_SHADOW VALIDATION
// ============================================

describe('CAREER_SHADOW Validation', () => {
  it('rejects when all fields empty', () => {
    const result = validateStepCompletionData('CAREER_SHADOW', {
      type: 'CAREER_SHADOW',
      qualifications: [],
      keySkills: [],
      courses: [],
      requirements: [],
    });
    expect(result.valid).toBe(false);
  });

  it('accepts when only qualifications filled', () => {
    const result = validateStepCompletionData('CAREER_SHADOW', {
      type: 'CAREER_SHADOW',
      qualifications: ['MBBS'],
      keySkills: [],
      courses: [],
      requirements: [],
    });
    expect(result.valid).toBe(true);
  });

  it('accepts when only keySkills filled', () => {
    const result = validateStepCompletionData('CAREER_SHADOW', {
      type: 'CAREER_SHADOW',
      qualifications: [],
      keySkills: ['Python'],
      courses: [],
      requirements: [],
    });
    expect(result.valid).toBe(true);
  });

  it('accepts full career shadow data', () => {
    const result = validateStepCompletionData('CAREER_SHADOW', makeCareerShadowData());
    expect(result.valid).toBe(true);
  });
});

// ============================================
// COMPLETE_ALIGNED_ACTION VALIDATION
// ============================================

describe('COMPLETE_ALIGNED_ACTION Validation', () => {
  it('rejects missing action type', () => {
    const result = validateStepCompletionData('COMPLETE_ALIGNED_ACTION', {
      type: 'COMPLETE_ALIGNED_ACTION',
      actionType: '' as 'SMALL_JOB',
      actionId: 'a1',
      actionTitle: 'test',
      linkedToGoal: true,
    });
    expect(result.valid).toBe(false);
  });

  it('rejects missing action title', () => {
    const result = validateStepCompletionData('COMPLETE_ALIGNED_ACTION', {
      type: 'COMPLETE_ALIGNED_ACTION',
      actionType: 'VOLUNTEER_WORK',
      actionId: 'a1',
      actionTitle: '',
      linkedToGoal: true,
    });
    expect(result.valid).toBe(false);
  });

  it('accepts valid aligned action', () => {
    const result = validateStepCompletionData('COMPLETE_ALIGNED_ACTION', makeAlignedActionData());
    expect(result.valid).toBe(true);
  });
});

// ============================================
// SUBMIT_ACTION_REFLECTION VALIDATION
// ============================================

describe('SUBMIT_ACTION_REFLECTION Validation', () => {
  it('rejects empty response', () => {
    const result = validateStepCompletionData('SUBMIT_ACTION_REFLECTION', {
      type: 'SUBMIT_ACTION_REFLECTION',
      actionId: 'a1',
      reflectionResponse: '',
    });
    expect(result.valid).toBe(false);
  });

  it('rejects whitespace-only response', () => {
    const result = validateStepCompletionData('SUBMIT_ACTION_REFLECTION', {
      type: 'SUBMIT_ACTION_REFLECTION',
      actionId: 'a1',
      reflectionResponse: '    \n\t  ',
    });
    expect(result.valid).toBe(false);
  });

  it('accepts valid reflection', () => {
    const result = validateStepCompletionData('SUBMIT_ACTION_REFLECTION', makeReflectionData());
    expect(result.valid).toBe(true);
  });
});

// ============================================
// TYPE MISMATCH DETECTION
// ============================================

describe('Type Mismatch Detection', () => {
  it('rejects when stepId does not match data.type', () => {
    // Try to use EXPLORE_CAREERS data for REFLECT_ON_STRENGTHS
    const result = validateStepCompletionData(
      'REFLECT_ON_STRENGTHS',
      makeExploreCareersData() as unknown as StepCompletionData
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain('mismatch');
  });

  it('rejects CAREER_SHADOW data for REVIEW_INDUSTRY_OUTLOOK', () => {
    const result = validateStepCompletionData(
      'REVIEW_INDUSTRY_OUTLOOK',
      makeCareerShadowData() as unknown as StepCompletionData
    );
    expect(result.valid).toBe(false);
  });
});

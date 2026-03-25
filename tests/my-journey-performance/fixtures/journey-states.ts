/**
 * Performance Test Fixtures — Journey States
 *
 * Realistic journey state data at various complexity levels.
 * Used to measure how performance degrades as data grows.
 */

import {
  type JourneyUIState,
  type JourneyStepUI,
  type JourneySummary,
  type JourneyStateId,
  type LensProgress,
  type AlignedAction,
  JOURNEY_STATE_CONFIG,
  DEFAULT_JOURNEY_SUMMARY,
} from '@/lib/journey/types';

// ============================================
// HELPERS
// ============================================

function makeStep(
  id: JourneyStateId,
  status: 'completed' | 'next' | 'locked' | 'skipped'
): JourneyStepUI {
  const config = JOURNEY_STATE_CONFIG[id];
  return {
    id,
    title: config.title,
    description: config.description,
    status,
    order: config.order,
    artifacts: [],
    mandatory: config.mandatory,
    optional: !config.mandatory,
    stepNumber: config.stepNumber,
  };
}

function makeLensProgress(
  progress: number,
  completedMandatory: JourneyStateId[],
  totalMandatory: number,
  isComplete: boolean
): LensProgress {
  return {
    progress,
    completedMandatory,
    completedOptional: [],
    totalMandatory,
    totalOptional: 0,
    isComplete,
  };
}

function generateExploredRoles(count: number) {
  const roles = [];
  const roleNames = [
    'Doctor', 'Software Engineer', 'Teacher', 'Nurse', 'Architect',
    'Data Scientist', 'Pharmacist', 'Lawyer', 'Journalist', 'Pilot',
    'Marine Biologist', 'Psychologist', 'Accountant', 'Physiotherapist',
    'Graphic Designer', 'Veterinarian', 'Paramedic', 'Economist',
    'Environmental Scientist', 'Social Worker',
  ];
  for (let i = 0; i < count; i++) {
    roles.push({
      title: roleNames[i % roleNames.length],
      exploredAt: new Date(2026, 0, i + 1).toISOString(),
      educationPaths: [`Degree in ${roleNames[i % roleNames.length]}`, 'Apprenticeship'],
      certifications: [`Cert-${i}`],
      companies: [`Company-${i}`, `Company-${i + 1}`],
      humanSkills: ['Communication', 'Problem Solving', 'Teamwork'],
      entryExpectations: 'Entry-level position available after qualification.',
    });
  }
  return roles;
}

function generateAlignedActions(count: number): AlignedAction[] {
  const types = ['SMALL_JOB', 'PERSONAL_PROJECT', 'COURSE_OR_CERTIFICATION', 'VOLUNTEER_WORK', 'INDUSTRY_EVENT', 'MENTORSHIP_SESSION'] as const;
  const actions: AlignedAction[] = [];
  for (let i = 0; i < count; i++) {
    actions.push({
      id: `action-${i}`,
      type: types[i % types.length] as typeof types[number],
      title: `Action ${i + 1}: ${types[i % types.length].replace(/_/g, ' ').toLowerCase()}`,
      completedAt: new Date(2026, 1, i + 1).toISOString(),
      linkedToGoal: true,
    });
  }
  return actions;
}

function generateReflections(count: number) {
  const reflections = [];
  for (let i = 0; i < count; i++) {
    reflections.push({
      id: `reflection-${i}`,
      actionId: `action-${i % Math.max(1, Math.floor(count / 2))}`,
      prompt: `What did you learn from action ${i + 1}?`,
      response: `I learned valuable skills about ${['communication', 'problem solving', 'teamwork', 'leadership', 'time management'][i % 5]}. This experience helped me understand the importance of practical application in my career path.`,
      createdAt: new Date(2026, 2, i + 1).toISOString(),
    });
  }
  return reflections;
}

function generateSavedItems(count: number) {
  const types = ['articles', 'videos', 'podcasts', 'shorts'] as const;
  return {
    total: count,
    byType: {
      articles: Math.floor(count * 0.4),
      videos: Math.floor(count * 0.3),
      podcasts: Math.floor(count * 0.2),
      shorts: Math.floor(count * 0.1),
    },
  };
}

// ============================================
// FIXTURE: EMPTY JOURNEY (first-time user)
// ============================================

export const EMPTY_JOURNEY: JourneyUIState = {
  currentLens: 'DISCOVER',
  currentState: 'REFLECT_ON_STRENGTHS',
  completedSteps: [],
  skippedSteps: {} as Record<JourneyStateId, never>,
  canAdvanceToNextLens: false,
  nextStepReason: 'Start by reflecting on your strengths.',
  steps: [
    makeStep('REFLECT_ON_STRENGTHS', 'next'),
    makeStep('EXPLORE_CAREERS', 'locked'),
    makeStep('ROLE_DEEP_DIVE', 'locked'),
    makeStep('REVIEW_INDUSTRY_OUTLOOK', 'locked'),
    makeStep('CAREER_SHADOW', 'locked'),
    makeStep('CREATE_ACTION_PLAN', 'locked'),
    makeStep('COMPLETE_ALIGNED_ACTION', 'locked'),
    makeStep('SUBMIT_ACTION_REFLECTION', 'locked'),
    makeStep('UPDATE_PLAN', 'locked'),
    makeStep('EXTERNAL_FEEDBACK', 'locked'),
  ],
  summary: {
    ...DEFAULT_JOURNEY_SUMMARY,
    lenses: {
      discover: makeLensProgress(0, [], 3, false),
      understand: makeLensProgress(0, [], 3, false),
      act: makeLensProgress(0, [], 2, false),
    },
    overallProgress: 0,
  },
};

// ============================================
// FIXTURE: MEDIUM JOURNEY (mid-Understand)
// ============================================

export const MEDIUM_JOURNEY: JourneyUIState = {
  currentLens: 'UNDERSTAND',
  currentState: 'CAREER_SHADOW',
  completedSteps: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE', 'REVIEW_INDUSTRY_OUTLOOK'],
  skippedSteps: {} as Record<JourneyStateId, never>,
  canAdvanceToNextLens: false,
  nextStepReason: 'Research path requirements and skills.',
  steps: [
    makeStep('REFLECT_ON_STRENGTHS', 'completed'),
    makeStep('EXPLORE_CAREERS', 'completed'),
    makeStep('ROLE_DEEP_DIVE', 'completed'),
    makeStep('REVIEW_INDUSTRY_OUTLOOK', 'completed'),
    makeStep('CAREER_SHADOW', 'next'),
    makeStep('CREATE_ACTION_PLAN', 'locked'),
    makeStep('COMPLETE_ALIGNED_ACTION', 'locked'),
    makeStep('SUBMIT_ACTION_REFLECTION', 'locked'),
    makeStep('UPDATE_PLAN', 'locked'),
    makeStep('EXTERNAL_FEEDBACK', 'locked'),
  ],
  summary: {
    ...DEFAULT_JOURNEY_SUMMARY,
    lenses: {
      discover: makeLensProgress(100, ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'], 3, true),
      understand: makeLensProgress(33, ['REVIEW_INDUSTRY_OUTLOOK'], 3, false),
      act: makeLensProgress(0, [], 2, false),
    },
    overallProgress: 44,
    strengths: ['Communication', 'Problem Solving', 'Teamwork'],
    careerInterests: ['Doctor', 'Pharmacist'],
    exploredRoles: generateExploredRoles(3),
    primaryGoal: { title: 'Doctor', selectedAt: '2026-01-10' },
    industryInsightsSummary: { trendsReviewed: 3, insightsSaved: 2, lastReviewedAt: '2026-01-20' },
    roleRealityNotes: ['Long training period', 'High responsibility'],
    industryInsightNotes: ['Growing demand in NHS', 'Technology integration'],
    savedSummary: generateSavedItems(5),
    timelineSummary: { totalEvents: 8, thisMonth: 3 },
  },
};

// ============================================
// FIXTURE: LARGE JOURNEY (fully complete, rich data)
// ============================================

export const LARGE_JOURNEY: JourneyUIState = {
  currentLens: 'ACT',
  currentState: 'EXTERNAL_FEEDBACK',
  completedSteps: [
    'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
    'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
    'COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION',
    'UPDATE_PLAN', 'EXTERNAL_FEEDBACK',
  ],
  skippedSteps: {} as Record<JourneyStateId, never>,
  canAdvanceToNextLens: false,
  nextStepReason: 'Journey complete! Continue growing.',
  steps: [
    makeStep('REFLECT_ON_STRENGTHS', 'completed'),
    makeStep('EXPLORE_CAREERS', 'completed'),
    makeStep('ROLE_DEEP_DIVE', 'completed'),
    makeStep('REVIEW_INDUSTRY_OUTLOOK', 'completed'),
    makeStep('CAREER_SHADOW', 'completed'),
    makeStep('CREATE_ACTION_PLAN', 'completed'),
    makeStep('COMPLETE_ALIGNED_ACTION', 'completed'),
    makeStep('SUBMIT_ACTION_REFLECTION', 'completed'),
    makeStep('UPDATE_PLAN', 'completed'),
    makeStep('EXTERNAL_FEEDBACK', 'completed'),
  ],
  summary: {
    ...DEFAULT_JOURNEY_SUMMARY,
    lenses: {
      discover: makeLensProgress(100, ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'], 3, true),
      understand: makeLensProgress(100, ['REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN'], 3, true),
      act: makeLensProgress(100, ['COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION'], 2, true),
    },
    overallProgress: 100,
    strengths: ['Communication', 'Problem Solving', 'Teamwork', 'Leadership', 'Creativity'],
    demonstratedSkills: ['Active Listening', 'Critical Thinking', 'Time Management', 'Empathy'],
    careerInterests: ['Doctor', 'Pharmacist', 'Nurse', 'Physiotherapist', 'Paramedic'],
    exploredRoles: generateExploredRoles(15),
    primaryGoal: { title: 'Doctor', selectedAt: '2026-01-05' },
    rolePlans: [
      {
        roleTitle: 'Doctor',
        shortTermActions: ['Research medical schools', 'Shadow a GP', 'Volunteer at hospital', 'Study biology'],
        midTermMilestone: 'Apply to medical school',
        skillToBuild: 'Biology and chemistry knowledge',
        createdAt: '2026-01-15',
      },
    ],
    certificationsRequired: ['MBBS', 'GMC Registration', 'DBS Check'],
    companiesOfInterest: ['NHS', 'Private Hospital Group', 'Medical Research Institute'],
    futureOutlookNotes: ['Positive growth trajectory', 'AI integration changing diagnostics', 'Aging population increasing demand'],
    roleRealityNotes: ['Long hours', 'Continuous learning required', 'High emotional resilience needed', 'Strong teamwork'],
    industryInsightNotes: ['NHS expansion', 'Technology-driven diagnostics', 'Growing mental health focus'],
    pathQualifications: ['A-Level Biology', 'A-Level Chemistry', 'MBBS Degree', 'Foundation Year'],
    pathSkills: ['Diagnosis', 'Patient Communication', 'Clinical Skills', 'Research'],
    pathCourses: ['Biology A-Level', 'Chemistry A-Level', 'Medical School', 'Foundation Programme'],
    pathRequirements: ['UCAT Score', 'Work Experience', 'DBS Check', 'Personal Statement'],
    nextActions: [
      { action: 'Apply for work experience', priority: 'high' as const, category: 'experience' as const },
      { action: 'Research UCAT preparation', priority: 'medium' as const, category: 'learning' as const },
    ],
    alignedActions: generateAlignedActions(12),
    alignedActionsCount: 12,
    alignedActionReflections: generateReflections(10),
    savedSummary: generateSavedItems(25),
    recentSavedItems: [],
    timelineSummary: { totalEvents: 45, thisMonth: 8 },
    lastTimelineEventAt: new Date().toISOString(),
    shadowSummary: { total: 3, accepted: 2, skipped: false, skipReason: null, pending: 0, completed: 2, declined: 1, lastUpdatedAt: '2026-02-15' },
    reflectionSummary: { total: 10, thisMonth: 3, lastReflectionAt: '2026-03-10' },
    industryInsightsSummary: { trendsReviewed: 8, insightsSaved: 5, lastReviewedAt: '2026-02-20' },
    requirementsReviewed: true,
    planCreated: true,
    planUpdatedAt: '2026-03-01',
    planChangeReason: 'Updated after hospital volunteering experience',
    externalFeedback: [
      { source: 'mentor', summary: 'Strong progress, focus on biology coursework', receivedAt: '2026-02-28' },
      { source: 'teacher', summary: 'Excellent communication skills', receivedAt: '2026-03-05' },
    ],
  },
};

// ============================================
// FIXTURE: MULTIPLE GOALS (switching scenario)
// ============================================

export const GOAL_STATES = {
  doctor: {
    goalId: 'doctor',
    goalTitle: 'Doctor',
    journeyState: LARGE_JOURNEY,
  },
  engineer: {
    goalId: 'software-engineer',
    goalTitle: 'Software Engineer',
    journeyState: MEDIUM_JOURNEY,
  },
  teacher: {
    goalId: 'teacher',
    goalTitle: 'Teacher',
    journeyState: EMPTY_JOURNEY,
  },
};

// ============================================
// FIXTURE: CORRUPTED / PARTIAL STATES
// ============================================

export const PARTIAL_JOURNEY: JourneyUIState = {
  ...MEDIUM_JOURNEY,
  summary: {
    ...MEDIUM_JOURNEY.summary,
    // Missing expected data
    exploredRoles: [],
    careerInterests: [],
    primaryGoal: { title: null, selectedAt: null },
  },
};

// ============================================
// MOCK API RESPONSE WRAPPERS
// ============================================

export function wrapJourneyResponse(journey: JourneyUIState) {
  return { success: true, journey };
}

export function wrapGoalsResponse(primary: { title: string } | null, secondary: { title: string } | null = null) {
  return {
    primaryGoal: primary ? { id: '1', title: primary.title, selectedAt: '2026-01-01' } : null,
    secondaryGoal: secondary ? { id: '2', title: secondary.title, selectedAt: '2026-01-02' } : null,
  };
}

export function wrapReflectionsResponse(complete = false) {
  if (!complete) return { discoverReflections: null };
  return {
    discoverReflections: {
      motivations: ['Helping people', 'Making a difference'],
      workStyle: ['Structured', 'Team-oriented'],
      growthAreas: ['Patience', 'Public speaking'],
      roleModels: 'Dr. Smith - local GP who inspired me',
      experiences: 'Volunteered at a care home for 3 months',
    },
  };
}

export function wrapGoalDataResponse(hasData = true) {
  if (!hasData) return { goalData: null };
  return {
    goalData: {
      updatedAt: new Date().toISOString(),
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  };
}

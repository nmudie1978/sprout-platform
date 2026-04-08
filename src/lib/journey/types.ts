/**
 * Journey State Machine Types
 *
 * Defines the complete type system for the guided journey workflow.
 *
 * NEW PHILOSOPHY: DISCOVER · UNDERSTAND · GROW
 *
 * This represents the user's guided path to career clarity:
 * - DISCOVER: Explore the career — high-level view, day-in-the-life, salary, outlook
 * - UNDERSTAND: Know the reality — daily work, qualifications, the hard parts
 * - GROW: Build your roadmap — track progress, set next steps, build momentum
 *
 * Small jobs are NOT foundational. They are ONE option among many aligned actions.
 */

// ============================================
// JOURNEY LENSES (Top-Level Structure)
// ============================================

export const JOURNEY_LENSES = ['DISCOVER', 'UNDERSTAND', 'ACT'] as const;
export type JourneyLens = (typeof JOURNEY_LENSES)[number];

// ============================================
// JOURNEY PHASES (Within Each Lens)
// ============================================

export const JOURNEY_PHASES = {
  DISCOVER: ['SELF_AWARENESS', 'EXPLORATION'] as const,
  UNDERSTAND: ['REALITY', 'STRATEGY'] as const,
  ACT: ['ALIGNED_ACTION', 'REFLECTION'] as const,
} as const;

export type JourneyPhase =
  | 'SELF_AWARENESS'
  | 'EXPLORATION'
  | 'REALITY'
  | 'STRATEGY'
  | 'ALIGNED_ACTION'
  | 'REFLECTION';

// ============================================
// JOURNEY STATES (Milestones)
// ============================================

export const JOURNEY_STATES = [
  // DISCOVER lens
  'REFLECT_ON_STRENGTHS',      // Step 1: Reflect on strengths (MANDATORY)
  'EXPLORE_CAREERS',           // Step 2: Explore at least 1 career (MANDATORY)
  'ROLE_DEEP_DIVE',            // Step 3: Complete 1 role deep dive (MANDATORY)
  // UNDERSTAND lens
  'REVIEW_INDUSTRY_OUTLOOK',   // Step 1: Review industry outlook (MANDATORY)
  'CAREER_SHADOW',             // Step 2: Career shadow (MANDATORY)
  'CREATE_ACTION_PLAN',        // Step 3: Create draft action plan (MANDATORY)
  // ACT lens
  'COMPLETE_ALIGNED_ACTION',   // Step 1: Complete 1 aligned action (MANDATORY)
  'SUBMIT_ACTION_REFLECTION',  // Step 2: Submit reflection on action (MANDATORY)
  'UPDATE_PLAN',               // OPTIONAL: Update plan after action
  'EXTERNAL_FEEDBACK',         // OPTIONAL: Receive external feedback
] as const;

export type JourneyStateId = (typeof JOURNEY_STATES)[number];

// States that can be skipped (optional)
export const OPTIONAL_JOURNEY_STATES: JourneyStateId[] = [
  'UPDATE_PLAN',
  'EXTERNAL_FEEDBACK',
];

// Mandatory states per lens
export const MANDATORY_STATES: Record<JourneyLens, JourneyStateId[]> = {
  DISCOVER: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'],
  UNDERSTAND: ['REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN'],
  ACT: ['COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION'],
};

// ============================================
// LENS/PHASE/STATE MAPPING
// ============================================

export interface StateConfig {
  id: JourneyStateId;
  lens: JourneyLens;
  phase: JourneyPhase;
  title: string;
  description: string;
  order: number;
  mandatory: boolean;
  stepNumber: number | null; // Step number within lens (null for optional)
}

export const JOURNEY_STATE_CONFIG: Record<JourneyStateId, StateConfig> = {
  // ==========================================
  // DISCOVER LENS — Explore the career
  // ==========================================

  // DISCOVER → SELF_AWARENESS
  REFLECT_ON_STRENGTHS: {
    id: 'REFLECT_ON_STRENGTHS',
    lens: 'DISCOVER',
    phase: 'SELF_AWARENESS',
    title: 'Reflect on Strengths',
    description: 'Identify your top 3 strengths by taking a quick quiz or reflecting on what you excel at.',
    order: 0,
    mandatory: true,
    stepNumber: 1,
  },

  // DISCOVER → EXPLORATION
  EXPLORE_CAREERS: {
    id: 'EXPLORE_CAREERS',
    lens: 'DISCOVER',
    phase: 'EXPLORATION',
    title: 'Explore Careers',
    description: 'Look up 3 career paths that interest you. Write down what you think the job involves.',
    order: 1,
    mandatory: true,
    stepNumber: 2,
  },
  ROLE_DEEP_DIVE: {
    id: 'ROLE_DEEP_DIVE',
    lens: 'DISCOVER',
    phase: 'EXPLORATION',
    title: 'Set Your Career Direction',
    description: 'Pick a career path you like and find out more about what the job looks like daily.',
    order: 2,
    mandatory: true,
    stepNumber: 3,
  },

  // ==========================================
  // UNDERSTAND LENS — Know the reality
  // ==========================================

  // UNDERSTAND → REALITY
  REVIEW_INDUSTRY_OUTLOOK: {
    id: 'REVIEW_INDUSTRY_OUTLOOK',
    lens: 'UNDERSTAND',
    phase: 'REALITY',
    title: 'Role Reality & Industry Insights',
    description: 'Research your chosen career — what does the job involve day to day? What are the trends and job market like? Note 3 key insights.',
    order: 3,
    mandatory: true,
    stepNumber: 1,
  },
  CAREER_SHADOW: {
    id: 'CAREER_SHADOW',
    lens: 'UNDERSTAND',
    phase: 'REALITY',
    title: 'Path, Skills & Requirements',
    description: 'Find out what qualifications, skills, and experience are needed to get started in this career.',
    order: 4,
    mandatory: true,
    stepNumber: 2,
  },

  // UNDERSTAND → STRATEGY
  CREATE_ACTION_PLAN: {
    id: 'CREATE_ACTION_PLAN',
    lens: 'UNDERSTAND',
    phase: 'STRATEGY',
    title: 'Validate Your Understanding of the Role',
    description: 'Confirm what you\'ve learned by writing down 3 actions you can take to move forward based on your research.',
    order: 5,
    mandatory: true,
    stepNumber: 3,
  },

  // ==========================================
  // ACT LENS - Take aligned action
  // ==========================================

  // ACT → ALIGNED_ACTION
  COMPLETE_ALIGNED_ACTION: {
    id: 'COMPLETE_ALIGNED_ACTION',
    lens: 'ACT',
    phase: 'ALIGNED_ACTION',
    title: 'Complete Aligned Action',
    description: 'Pick a small action to get started. Apply for an internship, start a course, or build a portfolio.',
    order: 6,
    mandatory: true,
    stepNumber: 1,
  },

  // ACT → REFLECTION
  SUBMIT_ACTION_REFLECTION: {
    id: 'SUBMIT_ACTION_REFLECTION',
    lens: 'ACT',
    phase: 'REFLECTION',
    title: 'Reflect on Action',
    description: 'Reflect on what you\'ve learned. How did the task help you progress toward your career goal?',
    order: 7,
    mandatory: true,
    stepNumber: 2,
  },
  UPDATE_PLAN: {
    id: 'UPDATE_PLAN',
    lens: 'ACT',
    phase: 'REFLECTION',
    title: 'Update Plan',
    description: 'Update your plan with new insights. What can you improve for the next step?',
    order: 8,
    mandatory: false,
    stepNumber: null,
  },
  EXTERNAL_FEEDBACK: {
    id: 'EXTERNAL_FEEDBACK',
    lens: 'ACT',
    phase: 'REFLECTION',
    title: 'External Feedback',
    description: 'Ask for feedback from someone you trust. What do they think about your progress so far?',
    order: 9,
    mandatory: false,
    stepNumber: null,
  },
};

// ============================================
// LENS DESCRIPTIONS
// ============================================

export const LENS_DESCRIPTIONS: Record<JourneyLens, { title: string; subtitle: string; fullDescription: string }> = {
  DISCOVER: {
    title: 'Discover',
    subtitle: 'Explore the career',
    fullDescription: 'Get a high-level view of any career — what it is, who does it, salary range, growth outlook, and whether it\'s worth a closer look.',
  },
  UNDERSTAND: {
    title: 'Understand',
    subtitle: 'Know the reality',
    fullDescription: 'Go deeper into what the role actually involves day to day — the qualifications, the hard parts, the typical week, and what it really takes to qualify.',
  },
  ACT: {
    title: 'Grow',
    subtitle: 'Build your roadmap',
    fullDescription: 'Map your path toward this career, set concrete next steps, track your progress over time, and build momentum.',
  },
};

// ============================================
// ALIGNED ACTION TYPES
// ============================================

export const ALIGNED_ACTION_TYPES = [
  'SMALL_JOB',
  'CAREER_SHADOW',
  'PERSONAL_PROJECT',
  'COURSE_OR_CERTIFICATION',
  'INDUSTRY_EVENT',
  'VOLUNTEER_WORK',
  'MENTORSHIP_SESSION',
] as const;

export type AlignedActionType = (typeof ALIGNED_ACTION_TYPES)[number];

export const ALIGNED_ACTION_LABELS: Record<AlignedActionType, string> = {
  SMALL_JOB: 'Small Job',
  CAREER_SHADOW: 'Career Shadow',
  PERSONAL_PROJECT: 'Personal Project',
  COURSE_OR_CERTIFICATION: 'Course or Certification',
  INDUSTRY_EVENT: 'Industry Event',
  VOLUNTEER_WORK: 'Volunteer Work',
  MENTORSHIP_SESSION: 'Mentorship Session',
};

// Helper to get states by lens
export function getStatesByLens(lens: JourneyLens): JourneyStateId[] {
  return Object.values(JOURNEY_STATE_CONFIG)
    .filter((config) => config.lens === lens)
    .sort((a, b) => a.order - b.order)
    .map((config) => config.id);
}

// Helper to get mandatory states by lens
export function getMandatoryStatesByLens(lens: JourneyLens): JourneyStateId[] {
  return Object.values(JOURNEY_STATE_CONFIG)
    .filter((config) => config.lens === lens && config.mandatory)
    .sort((a, b) => a.order - b.order)
    .map((config) => config.id);
}

// Helper to get optional states by lens
export function getOptionalStatesByLens(lens: JourneyLens): JourneyStateId[] {
  return Object.values(JOURNEY_STATE_CONFIG)
    .filter((config) => config.lens === lens && !config.mandatory)
    .sort((a, b) => a.order - b.order)
    .map((config) => config.id);
}

// Helper to get states by phase
export function getStatesByPhase(lens: JourneyLens, phase: JourneyPhase): JourneyStateId[] {
  return Object.values(JOURNEY_STATE_CONFIG)
    .filter((config) => config.lens === lens && config.phase === phase)
    .sort((a, b) => a.order - b.order)
    .map((config) => config.id);
}

// ============================================
// JOURNEY STEP STATUS
// ============================================

export type JourneyStepStatus = 'locked' | 'next' | 'completed' | 'skipped' | 'optional';

// ============================================
// JOURNEY SUMMARY STRUCTURE
// ============================================

export interface LensProgress {
  progress: number; // 0-100 percentage
  completedMandatory: JourneyStateId[];
  completedOptional: JourneyStateId[];
  totalMandatory: number;
  totalOptional: number;
  isComplete: boolean; // All mandatory steps done
}

export interface JourneySummary {
  // Lens-based progress (DISCOVER · UNDERSTAND · ACT)
  lenses: {
    discover: LensProgress;
    understand: LensProgress;
    act: LensProgress;
  };

  // Total journey progress
  overallProgress: number; // 0-100 (each lens = 33.3%)

  // Primary goal
  primaryGoal: {
    title: string | null;
    selectedAt: string | null;
  };

  // Core progress data
  strengths: string[];
  demonstratedSkills: string[];
  careerInterests: string[];
  exploredRoles: ExploredRole[];
  rolePlans: RolePlan[];
  certificationsRequired: string[];
  companiesOfInterest: string[];
  futureOutlookNotes: string[];
  roleRealityNotes: string[];
  industryInsightNotes: string[];
  pathQualifications: string[];
  pathSkills: string[];
  pathCourses: string[];
  pathRequirements: string[];
  nextActions: NextAction[];

  // Aligned actions (replaces job-centric tracking)
  alignedActions: AlignedAction[];
  alignedActionsCount: number;
  alignedActionReflections: ActionReflection[];

  // Saved items summary
  savedSummary: {
    total: number;
    byType: {
      articles: number;
      videos: number;
      podcasts: number;
      shorts: number;
    };
  };
  recentSavedItems: SavedItemSummary[];

  // Timeline summary
  timelineSummary: {
    totalEvents: number;
    thisMonth: number;
  };
  lastTimelineEventAt: string | null;

  // Shadowing summary
  shadowSummary: {
    total: number;
    accepted: number;
    skipped: boolean;
    skipReason: string | null;
    pending: number;
    completed: number;
    declined: number;
    lastUpdatedAt: string | null;
  };

  // Reflections summary
  reflectionSummary: {
    total: number;
    thisMonth: number;
    lastReflectionAt: string | null;
  };

  // Industry insights summary
  industryInsightsSummary: {
    trendsReviewed: number;
    insightsSaved: number;
    lastReviewedAt: string | null;
  };

  // Requirements review status
  requirementsReviewed: boolean;

  // Plan status
  planCreated: boolean;
  planUpdatedAt: string | null;
  planChangeReason: string | null;
  externalFeedback: { source: string; summary: string; receivedAt: string }[];
}

export interface AlignedAction {
  id: string;
  type: AlignedActionType;
  title: string;
  description?: string;
  completedAt: string;
  linkedToGoal: boolean;
  metadata?: Record<string, unknown>;
}

export interface ActionReflection {
  id: string;
  actionId: string;
  prompt: string;
  response: string;
  createdAt: string;
}

export interface SavedItemSummary {
  id: string;
  type: 'ARTICLE' | 'VIDEO' | 'PODCAST' | 'SHORT';
  title: string;
  savedAt: string;
}

export interface ExploredRole {
  title: string;
  exploredAt: string;
  educationPaths: string[];
  certifications: string[];
  companies: string[];
  humanSkills: string[];
  entryExpectations: string;
}

export interface RolePlan {
  roleTitle: string;
  shortTermActions: string[];
  midTermMilestone: string;
  skillToBuild: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NextAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  category: 'skill' | 'experience' | 'learning' | 'networking';
}

// ============================================
// JOURNEY STATE DEFINITION
// ============================================

export interface JourneyStateDefinition {
  id: JourneyStateId;
  title: string;
  description: string;
  order: number;
  allowedTransitions: JourneyStateId[];
  artifactsProduced: string[];
  mandatory: boolean;
}

// ============================================
// SKIPPED STEPS TRACKING
// ============================================

export interface SkippedStep {
  stepId: JourneyStateId;
  reason: string;
  skippedAt: string;
}

export type SkippedStepsMap = Record<JourneyStateId, SkippedStep>;

// ============================================
// JOURNEY STATE CONTEXT (for criteria evaluation)
// ============================================

export interface JourneyStateContext {
  userId: string;
  profile: {
    displayName?: string | null;
    bio?: string | null;
    city?: string | null;
    skillTags?: string[];
    interests?: string[];
    careerAspiration?: string | null;
  } | null;
  // DISCOVER lens data
  confirmedStrengths: string[];
  savedCareers: SavedCareer[];
  exploredRolesCount: number;
  primaryGoalSelected: boolean;
  // UNDERSTAND lens data
  industryOutlookReviewed: boolean;
  requirementsReviewed: boolean;
  planCreated: boolean;
  shadowsRequested: number;
  shadowsCompleted: number;
  shadowsSkipped: boolean;
  pathDataSaved: boolean;
  savedItemsCount: number;
  // ACT lens data
  alignedActionsCompleted: number;
  actionReflectionsSubmitted: number;
  externalFeedbackReceived: boolean;
  planUpdatedAfterAction: boolean;
  // Legacy (for backwards compatibility)
  completedJobs: number;
  reflectionsCount: number;
  // Summary and skipped steps
  journeySummary: JourneySummary | null;
  skippedSteps: SkippedStepsMap;
}

export interface SavedCareer {
  id: string;
  title: string;
  savedAt: string;
}

// ============================================
// JOURNEY UI STATE
// ============================================

export interface JourneyUIState {
  currentLens: JourneyLens;
  currentState: JourneyStateId;
  completedSteps: JourneyStateId[];
  skippedSteps: SkippedStepsMap;
  steps: JourneyStepUI[];
  summary: JourneySummary;
  canAdvanceToNextLens: boolean;
  nextStepReason: string | null;
}

export interface JourneyStepUI {
  id: JourneyStateId;
  title: string;
  description: string;
  status: JourneyStepStatus;
  order: number;
  artifacts: string[];
  mandatory: boolean;
  optional: boolean; // Convenience property (!mandatory)
  stepNumber: number | null; // Step X of Y for mandatory steps
  skipReason?: string;
}

// ============================================
// GATING LOGIC
// ============================================

/**
 * Gating rules:
 * - DISCOVER must be fully completed (all 3 mandatory steps) before UNDERSTAND unlocks
 * - UNDERSTAND must be fully completed (all 3 mandatory steps) before ACT unlocks
 * - Users can preview future steps but cannot mark them complete without prerequisites
 */
export function canAccessLens(
  lens: JourneyLens,
  completedSteps: JourneyStateId[]
): { canAccess: boolean; reason: string | null } {
  const discoverMandatory = MANDATORY_STATES.DISCOVER;
  const understandMandatory = MANDATORY_STATES.UNDERSTAND;

  switch (lens) {
    case 'DISCOVER':
      return { canAccess: true, reason: null };

    case 'UNDERSTAND': {
      const discoverComplete = discoverMandatory.every(s => completedSteps.includes(s));
      if (!discoverComplete) {
        const remaining = discoverMandatory.filter(s => !completedSteps.includes(s));
        return {
          canAccess: false,
          reason: `Complete DISCOVER first. Remaining: ${remaining.map(s => JOURNEY_STATE_CONFIG[s].title).join(', ')}`,
        };
      }
      return { canAccess: true, reason: null };
    }

    case 'ACT': {
      const discoverComplete = discoverMandatory.every(s => completedSteps.includes(s));
      const understandComplete = understandMandatory.every(s => completedSteps.includes(s));

      if (!discoverComplete) {
        return {
          canAccess: false,
          reason: 'Complete DISCOVER first.',
        };
      }
      if (!understandComplete) {
        const remaining = understandMandatory.filter(s => !completedSteps.includes(s));
        return {
          canAccess: false,
          reason: `Complete UNDERSTAND first. Remaining: ${remaining.map(s => JOURNEY_STATE_CONFIG[s].title).join(', ')}`,
        };
      }
      return { canAccess: true, reason: null };
    }
  }
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface JourneyTransitionRequest {
  targetState: JourneyStateId;
  data?: Record<string, unknown>;
}

export interface JourneyTransitionResponse {
  success: boolean;
  completedSteps: JourneyStateId[];
  skippedSteps: SkippedStepsMap;
  summary: JourneySummary;
  error?: string;
}

export interface JourneyCompleteStepRequest {
  stepId: JourneyStateId;
  data: StepCompletionData;
}

export interface JourneySkipStepRequest {
  stepId: JourneyStateId;
  reason: string;
}

export type StepCompletionData =
  | ReflectOnStrengthsData
  | ExploreCareersData
  | RoleDeepDiveData
  | ReviewIndustryOutlookData
  | CreateActionPlanData
  | CareerShadowData
  | CompleteAlignedActionData
  | SubmitActionReflectionData
  | UpdatePlanData
  | ExternalFeedbackData;

export interface ReflectOnStrengthsData {
  type: 'REFLECT_ON_STRENGTHS';
  topStrengths: string[];
  demonstratedSkills: string[];
}

export interface ExploreCareersData {
  type: 'EXPLORE_CAREERS';
  selectedCareers: string[];
}

export interface RoleDeepDiveData {
  type: 'ROLE_DEEP_DIVE';
  role: ExploredRole;
}

export interface SelectPrimaryGoalData {
  type: 'SELECT_PRIMARY_GOAL';
  goalTitle: string;
  goalReason?: string;
}

export interface ReviewIndustryOutlookData {
  type: 'REVIEW_INDUSTRY_OUTLOOK';
  trendsReviewed: string[];
  outlookNotes: string[];
  roleRealityNotes?: string[];
  industryInsightNotes?: string[];
}

export interface ReviewRequirementsData {
  type: 'REVIEW_REQUIREMENTS';
  skillsIdentified: string[];
  qualificationsNoted: string[];
  entryPathways: string[];
}

export interface CreateActionPlanData {
  type: 'CREATE_ACTION_PLAN';
  plan: RolePlan;
}

export interface CareerShadowData {
  type: 'CAREER_SHADOW';
  shadowRequestId?: string;
  skipped?: boolean;
  skipReason?: string;
  qualifications?: string[];
  keySkills?: string[];
  courses?: string[];
  requirements?: string[];
}

export interface SaveInsightsData {
  type: 'SAVE_INSIGHTS';
  savedItemIds: string[];
}

export interface CompleteAlignedActionData {
  type: 'COMPLETE_ALIGNED_ACTION';
  actionType: AlignedActionType;
  actionId: string;
  actionTitle: string;
  linkedToGoal: boolean;
  metadata?: Record<string, unknown>;
}

export interface SubmitActionReflectionData {
  type: 'SUBMIT_ACTION_REFLECTION';
  actionId: string;
  reflectionResponse: string;
}

export interface UpdatePlanData {
  type: 'UPDATE_PLAN';
  updatedPlan: RolePlan;
  changeReason: string;
}

export interface ExternalFeedbackData {
  type: 'EXTERNAL_FEEDBACK';
  feedbackSource: 'employer' | 'mentor' | 'reviewer';
  feedbackSummary: string;
  receivedAt: string;
}

// ============================================
// DEFAULT VALUES
// ============================================

const DEFAULT_LENS_PROGRESS: LensProgress = {
  progress: 0,
  completedMandatory: [],
  completedOptional: [],
  totalMandatory: 0,
  totalOptional: 0,
  isComplete: false,
};

export const DEFAULT_JOURNEY_SUMMARY: JourneySummary = {
  // Lens-based progress
  lenses: {
    discover: { ...DEFAULT_LENS_PROGRESS, totalMandatory: 3, totalOptional: 0 },
    understand: { ...DEFAULT_LENS_PROGRESS, totalMandatory: 3, totalOptional: 0 },
    act: { ...DEFAULT_LENS_PROGRESS, totalMandatory: 2, totalOptional: 2 },
  },
  overallProgress: 0,
  // Primary goal
  primaryGoal: {
    title: null,
    selectedAt: null,
  },
  // Core progress
  strengths: [],
  demonstratedSkills: [],
  careerInterests: [],
  exploredRoles: [],
  rolePlans: [],
  certificationsRequired: [],
  companiesOfInterest: [],
  futureOutlookNotes: [],
  roleRealityNotes: [],
  industryInsightNotes: [],
  pathQualifications: [],
  pathSkills: [],
  pathCourses: [],
  pathRequirements: [],
  nextActions: [],
  // Aligned actions
  alignedActions: [],
  alignedActionsCount: 0,
  alignedActionReflections: [],
  // Saved items
  savedSummary: {
    total: 0,
    byType: {
      articles: 0,
      videos: 0,
      podcasts: 0,
      shorts: 0,
    },
  },
  recentSavedItems: [],
  // Timeline
  timelineSummary: {
    totalEvents: 0,
    thisMonth: 0,
  },
  lastTimelineEventAt: null,
  // Shadows
  shadowSummary: {
    total: 0,
    accepted: 0,
    skipped: false,
    skipReason: null,
    pending: 0,
    completed: 0,
    declined: 0,
    lastUpdatedAt: null,
  },
  // Reflections
  reflectionSummary: {
    total: 0,
    thisMonth: 0,
    lastReflectionAt: null,
  },
  // Industry insights
  industryInsightsSummary: {
    trendsReviewed: 0,
    insightsSaved: 0,
    lastReviewedAt: null,
  },
  // Requirements
  requirementsReviewed: false,
  // Plan
  planCreated: false,
  planUpdatedAt: null,
  planChangeReason: null,
  externalFeedback: [],
};

// ============================================
// REFLECTION TYPES
// ============================================

export type ReflectionContextType =
  | 'ALIGNED_ACTION'
  | 'ROLE_DEEP_DIVE'
  | 'INDUSTRY_INSIGHTS'
  | 'SHADOW_COMPLETED'
  | 'CAREER_DISCOVERY'
  | 'PLAN_BUILD'
  | 'STRENGTHS_REFLECTION';

export interface ReflectionPrompt {
  contextType: ReflectionContextType;
  prompt: string;
  optional: boolean;
}

export const REFLECTION_PROMPTS: Record<ReflectionContextType, string[]> = {
  ALIGNED_ACTION: [
    'What did you learn from this experience?',
    'How does this connect to your primary goal?',
    'What would you do differently next time?',
  ],
  ROLE_DEEP_DIVE: [
    'Did this role excite you?',
    'What surprised you about this career path?',
    'Can you see yourself in this role?',
  ],
  INDUSTRY_INSIGHTS: [
    'Which trend do you find most interesting?',
    'How might this affect your career plans?',
    'Did anything surprise you about the industry outlook?',
  ],
  SHADOW_COMPLETED: [
    'What was the most valuable thing you learned?',
    'Would you want to work in this field?',
    'What questions do you still have?',
  ],
  CAREER_DISCOVERY: [
    'What draws you to this career area?',
    'How does this fit with your strengths?',
    'What questions do you still have?',
  ],
  PLAN_BUILD: [
    'How confident do you feel about this plan?',
    'What might be your biggest challenge?',
    'Who could help you achieve these goals?',
  ],
  STRENGTHS_REFLECTION: [
    'How do these strengths show up in your daily life?',
    'When have you used these strengths recently?',
    'How might these strengths help in your career?',
  ],
};

// ============================================
// TIMELINE EVENT TYPES
// ============================================

export type TimelineEventTypeId =
  | 'PROFILE_CREATED'
  | 'STRENGTHS_CONFIRMED'
  | 'CAREER_EXPLORED'
  | 'ROLE_DEEP_DIVE_COMPLETED'
  | 'PRIMARY_GOAL_SET'
  | 'INDUSTRY_OUTLOOK_REVIEWED'
  | 'REQUIREMENTS_REVIEWED'
  | 'PLAN_CREATED'
  | 'PLAN_UPDATED'
  | 'SHADOW_REQUESTED'
  | 'SHADOW_APPROVED'
  | 'SHADOW_DECLINED'
  | 'SHADOW_COMPLETED'
  | 'SHADOW_SKIPPED'
  | 'ALIGNED_ACTION_COMPLETED'
  | 'ACTION_REFLECTION_SUBMITTED'
  | 'EXTERNAL_FEEDBACK_RECEIVED'
  | 'ITEM_SAVED'
  | 'REFLECTION_RECORDED';

export interface TimelineEventData {
  id: string;
  type: TimelineEventTypeId;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ============================================
// SAVED ITEM TYPES
// ============================================

export type SavedItemType = 'ARTICLE' | 'VIDEO' | 'PODCAST' | 'SHORT';

export interface SavedItemData {
  id: string;
  type: SavedItemType;
  title: string;
  url: string;
  source?: string;
  tags: string[];
  careerPathId?: string;
  roleId?: string;
  thumbnail?: string;
  description?: string;
  savedAt: string;
}

// ============================================
// LEGACY TYPE MAPPINGS (for migration)
// ============================================

// Map old state IDs to new ones for data migration
export const LEGACY_STATE_MAPPING: Record<string, JourneyStateId | null> = {
  'BASELINE_PROFILE': 'REFLECT_ON_STRENGTHS',
  'FIRST_JOB_ACQUIRED': 'COMPLETE_ALIGNED_ACTION',
  'MULTIPLE_JOB_EXPERIENCE': 'COMPLETE_ALIGNED_ACTION',
  'CAPABILITY_REFLECTION': 'REFLECT_ON_STRENGTHS',
  'CAREER_DISCOVERY': 'EXPLORE_CAREERS',
  'ROLE_DEEP_DIVE': 'ROLE_DEEP_DIVE',
  'CAREER_SHADOW_REQUEST': 'CAREER_SHADOW',
  'INDUSTRY_INSIGHTS': 'REVIEW_INDUSTRY_OUTLOOK',
  'PLAN_BUILD': 'CREATE_ACTION_PLAN',
  'CONTINUOUS_GROWTH': null, // No direct mapping
};

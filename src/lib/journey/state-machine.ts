/**
 * Journey State Machine
 *
 * Architecture: MY JOURNEY = DISCOVER · UNDERSTAND · ACT
 *
 * DISCOVER (Know yourself)
 *   - SELF_AWARENESS: REFLECT_ON_STRENGTHS
 *   - EXPLORATION: EXPLORE_CAREERS, ROLE_DEEP_DIVE
 *
 * UNDERSTAND (Know the world)
 *   - REALITY: REVIEW_INDUSTRY_OUTLOOK, CAREER_SHADOW
 *   - STRATEGY: CREATE_ACTION_PLAN
 *
 * ACT (Take aligned action)
 *   - ALIGNED_ACTION: COMPLETE_ALIGNED_ACTION
 *   - REFLECTION: SUBMIT_ACTION_REFLECTION, UPDATE_PLAN (optional), EXTERNAL_FEEDBACK (optional)
 */

import {
  type JourneyStateId,
  type JourneyStateDefinition,
  type JourneyStateContext,
  type SkippedStepsMap,
  type JourneyLens,
  type JourneyPhase,
  JOURNEY_STATES,
  OPTIONAL_JOURNEY_STATES,
  JOURNEY_STATE_CONFIG,
  getStatesByLens,
  getMandatoryStatesByLens,
} from './types';

// ============================================
// STATE DEFINITIONS
// ============================================

export const JOURNEY_STATE_DEFINITIONS: Record<JourneyStateId, JourneyStateDefinition> = {
  // DISCOVER → SELF_AWARENESS
  REFLECT_ON_STRENGTHS: {
    id: 'REFLECT_ON_STRENGTHS',
    title: 'Reflect on Strengths',
    description: 'Identify your top 3 strengths by taking a quick quiz or reflecting on what you excel at',
    order: 0,
    allowedTransitions: ['EXPLORE_CAREERS'],
    artifactsProduced: ['confirmed_strengths', 'skill_inventory'],
    mandatory: true,
  },
  // DISCOVER → EXPLORATION
  EXPLORE_CAREERS: {
    id: 'EXPLORE_CAREERS',
    title: 'Explore Careers',
    description: 'Look up 3 career paths that interest you. Write down what you think the job involves',
    order: 1,
    allowedTransitions: ['ROLE_DEEP_DIVE'],
    artifactsProduced: ['career_interests', 'exploration_history'],
    mandatory: true,
  },
  ROLE_DEEP_DIVE: {
    id: 'ROLE_DEEP_DIVE',
    title: 'Set Your Career Direction',
    description: 'Pick a career path you like and find out more about what the job looks like daily',
    order: 2,
    allowedTransitions: ['REVIEW_INDUSTRY_OUTLOOK'],
    artifactsProduced: ['role_research', 'requirements_map'],
    mandatory: true,
  },
  // UNDERSTAND → REALITY
  REVIEW_INDUSTRY_OUTLOOK: {
    id: 'REVIEW_INDUSTRY_OUTLOOK',
    title: 'Role Reality & Industry Insights',
    description: 'Research your chosen career — what does the job involve day to day? What are the trends and job market like? Note 3 key insights',
    order: 3,
    allowedTransitions: ['CAREER_SHADOW'],
    artifactsProduced: ['industry_awareness', 'future_outlook'],
    mandatory: true,
  },
  CAREER_SHADOW: {
    id: 'CAREER_SHADOW',
    title: 'Path, Skills & Requirements',
    description: 'Find out what qualifications, skills, and experience are needed to get started in this career',
    order: 4,
    allowedTransitions: ['CREATE_ACTION_PLAN'],
    artifactsProduced: ['shadow_request', 'real_world_exposure'],
    mandatory: true,
  },
  // UNDERSTAND → STRATEGY
  CREATE_ACTION_PLAN: {
    id: 'CREATE_ACTION_PLAN',
    title: 'Validate Your Understanding of the Role',
    description: 'Confirm what you\'ve learned by writing down 3 actions you can take to move forward based on your research',
    order: 5,
    allowedTransitions: ['COMPLETE_ALIGNED_ACTION'],
    artifactsProduced: ['action_plan', 'milestones'],
    mandatory: true,
  },
  // ACT → ALIGNED_ACTION
  COMPLETE_ALIGNED_ACTION: {
    id: 'COMPLETE_ALIGNED_ACTION',
    title: 'Complete Aligned Action',
    description: 'Pick a small action to get started. Apply for an internship, start a course, or build a portfolio',
    order: 6,
    allowedTransitions: ['SUBMIT_ACTION_REFLECTION'],
    artifactsProduced: ['aligned_action_completed'],
    mandatory: true,
  },
  // ACT → REFLECTION
  SUBMIT_ACTION_REFLECTION: {
    id: 'SUBMIT_ACTION_REFLECTION',
    title: 'Reflect on Action',
    description: 'Reflect on what you\'ve learned. How did the task help you progress toward your career goal?',
    order: 7,
    allowedTransitions: ['UPDATE_PLAN', 'EXTERNAL_FEEDBACK'],
    artifactsProduced: ['action_reflection'],
    mandatory: true,
  },
  UPDATE_PLAN: {
    id: 'UPDATE_PLAN',
    title: 'Update Plan',
    description: 'Update your plan with new insights. What can you improve for the next step?',
    order: 8,
    allowedTransitions: ['EXTERNAL_FEEDBACK'],
    artifactsProduced: ['updated_plan'],
    mandatory: false,
  },
  EXTERNAL_FEEDBACK: {
    id: 'EXTERNAL_FEEDBACK',
    title: 'External Feedback',
    description: 'Ask for feedback from someone you trust. What do they think about your progress so far?',
    order: 9,
    allowedTransitions: [],
    artifactsProduced: ['external_feedback'],
    mandatory: false,
  },
};

// ============================================
// LENS/PHASE UTILITIES
// ============================================

/**
 * Get the lens a state belongs to
 */
export function getStateLens(state: JourneyStateId): JourneyLens {
  const config = JOURNEY_STATE_CONFIG[state];
  if (!config) {
    console.warn(`Unknown journey state for lens: ${state}, defaulting to DISCOVER`);
    return 'DISCOVER';
  }
  return config.lens;
}

/**
 * Get the phase a state belongs to
 */
export function getStatePhase(state: JourneyStateId): JourneyPhase {
  const config = JOURNEY_STATE_CONFIG[state];
  if (!config) {
    console.warn(`Unknown journey state for phase: ${state}, defaulting to SELF_AWARENESS`);
    return 'SELF_AWARENESS';
  }
  return config.phase;
}

/**
 * Calculate progress for a specific lens
 */
export function calculateLensProgress(
  lens: JourneyLens,
  context: JourneyStateContext
): { progress: number; completedStates: JourneyStateId[]; completedPhases: JourneyPhase[] } {
  const mandatoryStates = getMandatoryStatesByLens(lens);
  const completedStates: JourneyStateId[] = [];
  const completedPhases = new Set<JourneyPhase>();

  for (const state of mandatoryStates) {
    if (hasCompletedOrSkippedState(state, context)) {
      completedStates.push(state);
      completedPhases.add(JOURNEY_STATE_CONFIG[state].phase);
    }
  }

  const progress = mandatoryStates.length > 0
    ? Math.round((completedStates.length / mandatoryStates.length) * 100)
    : 0;

  return {
    progress,
    completedStates,
    completedPhases: Array.from(completedPhases),
  };
}

// ============================================
// STATE CHECKING UTILITIES
// ============================================

/**
 * Check if a state is optional
 */
export function isOptionalState(state: JourneyStateId): boolean {
  return OPTIONAL_JOURNEY_STATES.includes(state);
}

/**
 * Check if a state has been skipped
 */
export function isStateSkipped(state: JourneyStateId, skippedSteps: SkippedStepsMap): boolean {
  return state in skippedSteps;
}

// ============================================
// ENTRY CRITERIA
// ============================================

/**
 * Check if user can enter a given state
 */
export function canEnterState(state: JourneyStateId, context: JourneyStateContext): boolean {
  const stateOrder = JOURNEY_STATE_DEFINITIONS[state].order;

  // First state is always accessible
  if (stateOrder === 0) return true;

  // Get previous mandatory state
  const previousState = JOURNEY_STATES[stateOrder - 1];

  // Previous state must be either completed or skipped (if optional)
  return hasCompletedOrSkippedState(previousState, context);
}

/**
 * Check if a state has been completed or skipped (for optional states)
 */
export function hasCompletedOrSkippedState(
  state: JourneyStateId,
  context: JourneyStateContext
): boolean {
  // Check if skipped first (for optional states)
  if (isOptionalState(state) && isStateSkipped(state, context.skippedSteps)) {
    return true;
  }

  // Otherwise check completion criteria
  return hasCompletedState(state, context);
}

/**
 * Check if a state has been completed based on its exit criteria
 */
export function hasCompletedState(state: JourneyStateId, context: JourneyStateContext): boolean {
  switch (state) {
    // DISCOVER lens
    case 'REFLECT_ON_STRENGTHS':
      return checkStrengthsReflectionComplete(context);

    case 'EXPLORE_CAREERS':
      return checkCareerExplorationComplete(context);

    case 'ROLE_DEEP_DIVE':
      return checkRoleDeepDiveComplete(context);

    // UNDERSTAND lens
    case 'REVIEW_INDUSTRY_OUTLOOK':
      return checkIndustryOutlookComplete(context);

    case 'CAREER_SHADOW':
      return checkCareerShadowComplete(context);

    case 'CREATE_ACTION_PLAN':
      return checkActionPlanComplete(context);

    // ACT lens
    case 'COMPLETE_ALIGNED_ACTION':
      return checkAlignedActionComplete(context);

    case 'SUBMIT_ACTION_REFLECTION':
      return checkActionReflectionComplete(context);

    case 'UPDATE_PLAN':
      return checkPlanUpdateComplete(context);

    case 'EXTERNAL_FEEDBACK':
      return checkExternalFeedbackComplete(context);

    default:
      return false;
  }
}

// ============================================
// EXIT CRITERIA IMPLEMENTATIONS
// ============================================

function checkStrengthsReflectionComplete(context: JourneyStateContext): boolean {
  // User has confirmed at least 3 strengths
  return context.confirmedStrengths.length >= 3;
}

function checkCareerExplorationComplete(context: JourneyStateContext): boolean {
  // At least one career path selected for exploration
  return context.savedCareers.length >= 1;
}

function checkRoleDeepDiveComplete(context: JourneyStateContext): boolean {
  // At least one explored role saved
  return context.exploredRolesCount >= 1;
}

function checkIndustryOutlookComplete(context: JourneyStateContext): boolean {
  // User has reviewed industry outlook
  return context.industryOutlookReviewed;
}

function checkCareerShadowComplete(context: JourneyStateContext): boolean {
  // Step completed when path data is saved OR shadow completed (legacy)
  return context.shadowsCompleted >= 1 || context.pathDataSaved === true;
}

function checkActionPlanComplete(context: JourneyStateContext): boolean {
  // User has created an action plan
  return context.planCreated;
}

function checkAlignedActionComplete(context: JourneyStateContext): boolean {
  // At least one aligned action completed
  return context.alignedActionsCompleted >= 1;
}

function checkActionReflectionComplete(context: JourneyStateContext): boolean {
  // At least one action reflection submitted
  return context.actionReflectionsSubmitted >= 1;
}

function checkPlanUpdateComplete(context: JourneyStateContext): boolean {
  // Plan has been updated after action
  return context.planUpdatedAfterAction;
}

function checkExternalFeedbackComplete(context: JourneyStateContext): boolean {
  // External feedback has been received
  return context.externalFeedbackReceived;
}

// ============================================
// TRANSITION VALIDATION
// ============================================

/**
 * Check if transition from current state to target state is allowed
 */
export function canTransition(
  currentState: JourneyStateId,
  targetState: JourneyStateId,
  context: JourneyStateContext
): { allowed: boolean; reason: string | null } {
  const currentDef = JOURNEY_STATE_DEFINITIONS[currentState];
  const targetDef = JOURNEY_STATE_DEFINITIONS[targetState];

  // Allow backward navigation to any completed or skipped state
  if (targetDef.order < currentDef.order) {
    return { allowed: true, reason: null };
  }

  // Check if target is in allowed transitions
  if (currentDef.allowedTransitions.includes(targetState)) {
    // Must meet exit criteria of current state (or skip if optional)
    if (!hasCompletedOrSkippedState(currentState, context)) {
      return {
        allowed: false,
        reason: getExitCriteriaMessage(currentState),
      };
    }
    return { allowed: true, reason: null };
  }

  // Same state - allowed
  if (targetState === currentState) {
    return { allowed: true, reason: null };
  }

  return { allowed: false, reason: 'Invalid transition' };
}

/**
 * Check if a state can be skipped
 */
export function canSkipState(
  state: JourneyStateId,
  _context: JourneyStateContext
): { canSkip: boolean; reason: string | null } {
  if (!isOptionalState(state)) {
    return {
      canSkip: false,
      reason: 'This step cannot be skipped',
    };
  }

  return { canSkip: true, reason: null };
}

/**
 * Get user-friendly message about what's needed to complete a state
 */
export function getExitCriteriaMessage(state: JourneyStateId): string {
  switch (state) {
    // DISCOVER lens
    case 'REFLECT_ON_STRENGTHS':
      return 'Confirm your top 3 strengths to continue';

    case 'EXPLORE_CAREERS':
      return 'Select at least one career path to explore';

    case 'ROLE_DEEP_DIVE':
      return 'Complete a deep dive into at least one role';

    // UNDERSTAND lens
    case 'REVIEW_INDUSTRY_OUTLOOK':
      return 'Review the industry outlook for your chosen field';

    case 'CAREER_SHADOW':
      return 'Complete a career shadow to continue';

    case 'CREATE_ACTION_PLAN':
      return 'Create an action plan with short-term actions and milestones';

    // ACT lens
    case 'COMPLETE_ALIGNED_ACTION':
      return 'Complete at least one aligned action (job, shadow, project, course, or event)';

    case 'SUBMIT_ACTION_REFLECTION':
      return 'Submit a reflection on what you learned from your action';

    case 'UPDATE_PLAN':
      return 'Update your plan based on what you learned';

    case 'EXTERNAL_FEEDBACK':
      return 'Receive external feedback from an employer, mentor, or reviewer';

    default:
      return 'Complete the current step to continue';
  }
}

// ============================================
// STATE UTILITIES
// ============================================

/**
 * Get the order index of a state
 */
export function getStateOrder(state: JourneyStateId): number {
  const def = JOURNEY_STATE_DEFINITIONS[state];
  if (!def) {
    console.warn(`Unknown journey state: ${state}, defaulting to order 0`);
    return 0;
  }
  return def.order;
}

/**
 * Get the next state in the journey
 */
export function getNextState(currentState: JourneyStateId): JourneyStateId | null {
  const currentDef = JOURNEY_STATE_DEFINITIONS[currentState];
  const transitions = currentDef.allowedTransitions;

  if (transitions.length === 0) {
    return null;
  }

  // Return the first mandatory transition, or the first transition
  for (const nextState of transitions) {
    if (JOURNEY_STATE_CONFIG[nextState].mandatory) {
      return nextState;
    }
  }

  return transitions[0];
}

/**
 * Get all states up to and including the given state
 */
export function getStatesUpTo(state: JourneyStateId): JourneyStateId[] {
  const order = getStateOrder(state);
  return JOURNEY_STATES.slice(0, order + 1) as JourneyStateId[];
}

/**
 * Determine which state a user should be in based on their progress
 */
export function determineCurrentState(context: JourneyStateContext): JourneyStateId {
  // Walk through states from the end to find the highest completed/skipped state
  for (let i = JOURNEY_STATES.length - 1; i >= 0; i--) {
    const state = JOURNEY_STATES[i];
    if (hasCompletedOrSkippedState(state, context)) {
      // Return the next state if available, otherwise stay at current
      const nextState = getNextState(state);
      return nextState || state;
    }
  }

  // Default to first state
  return 'REFLECT_ON_STRENGTHS';
}

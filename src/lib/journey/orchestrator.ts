/**
 * Journey Orchestrator
 *
 * Centralized service for managing journey state transitions.
 * Architecture: MY JOURNEY = DISCOVER · UNDERSTAND · ACT
 *
 * All state changes must pass through this orchestrator.
 */

import {
  type JourneyStateId,
  type JourneyStateContext,
  type JourneySummary,
  type JourneyUIState,
  type JourneyStepUI,
  type StepCompletionData,
  type JourneyStepStatus,
  type SkippedStepsMap,
  type JourneyLens,
  type LensProgress,
  DEFAULT_JOURNEY_SUMMARY,
  JOURNEY_STATES,
  JOURNEY_STATE_CONFIG,
} from './types';

import {
  JOURNEY_STATE_DEFINITIONS,
  canTransition,
  hasCompletedState,
  hasCompletedOrSkippedState,
  getStateOrder,
  getExitCriteriaMessage,
  determineCurrentState,
  calculateLensProgress,
  getStateLens,
  getStatePhase,
} from './state-machine';

// ============================================
// ORCHESTRATOR CLASS
// ============================================

export class JourneyOrchestrator {
  private context: JourneyStateContext;
  private currentState: JourneyStateId;
  private completedSteps: JourneyStateId[];
  private skippedSteps: SkippedStepsMap;
  private summary: JourneySummary;

  constructor(
    context: JourneyStateContext,
    currentState: JourneyStateId,
    completedSteps: JourneyStateId[],
    skippedSteps: SkippedStepsMap,
    summary: JourneySummary | null
  ) {
    this.context = context;
    this.currentState = currentState;
    this.completedSteps = completedSteps;
    this.skippedSteps = skippedSteps;
    this.summary = summary || { ...DEFAULT_JOURNEY_SUMMARY };

    // Always recalculate lens progress
    this.updateLensProgress();
  }

  // ============================================
  // LENS PROGRESS
  // ============================================

  /**
   * Update lens progress in the summary
   */
  private updateLensProgress(): void {
    const lenses: JourneyLens[] = ['DISCOVER', 'UNDERSTAND', 'ACT'];

    for (const lens of lenses) {
      const progress = calculateLensProgress(lens, this.context);
      const key = lens.toLowerCase() as 'discover' | 'understand' | 'act';

      this.summary.lenses[key] = {
        progress: progress.progress,
        completedMandatory: progress.completedStates || [],
        completedOptional: [],
        totalMandatory: this.getLensMandatoryStates(lens),
        totalOptional: this.getLensOptionalStates(lens),
        isComplete: progress.progress >= 100,
      };
    }
  }

  /**
   * Get count of mandatory states for a lens
   */
  private getLensMandatoryStates(lens: JourneyLens): number {
    return Object.values(JOURNEY_STATE_CONFIG).filter((c) => c.lens === lens && c.mandatory).length;
  }

  /**
   * Get count of optional states for a lens
   */
  private getLensOptionalStates(lens: JourneyLens): number {
    return Object.values(JOURNEY_STATE_CONFIG).filter((c) => c.lens === lens && !c.mandatory).length;
  }

  /**
   * Get total states for a lens
   */
  private getLensTotalStates(lens: JourneyLens): number {
    return Object.values(JOURNEY_STATE_CONFIG).filter((c) => c.lens === lens).length;
  }

  /**
   * Get progress for a specific lens
   */
  getLensProgress(lens: JourneyLens): LensProgress {
    const key = lens.toLowerCase() as 'discover' | 'understand' | 'act';
    return { ...this.summary.lenses[key] };
  }

  // ============================================
  // STATE QUERIES
  // ============================================

  /**
   * Get the current active step
   */
  getCurrentState(): JourneyStateId {
    return this.currentState;
  }

  /**
   * Get the lens of the current state
   */
  getCurrentLens(): JourneyLens {
    return getStateLens(this.currentState);
  }

  /**
   * Get the next allowed step (if any)
   */
  getNextAllowedStep(): JourneyStateId | null {
    const currentOrder = getStateOrder(this.currentState);

    if (currentOrder >= JOURNEY_STATES.length - 1) {
      return null;
    }

    const nextState = JOURNEY_STATES[currentOrder + 1] as JourneyStateId;

    // Check if current state exit criteria are met (or skipped if optional)
    if (hasCompletedOrSkippedState(this.currentState, this.context)) {
      return nextState;
    }

    return null;
  }

  /**
   * Get all skipped steps
   */
  getSkippedSteps(): SkippedStepsMap {
    return { ...this.skippedSteps };
  }

  /**
   * Check if a specific step is skipped
   */
  isStepSkipped(stepId: JourneyStateId): boolean {
    return stepId in this.skippedSteps;
  }

  /**
   * Skip an optional step with a reason
   */
  skipStep(
    stepId: JourneyStateId,
    reason: string
  ): { success: boolean; error?: string } {
    // Check if this step can be skipped (optional steps only)
    const config = JOURNEY_STATE_CONFIG[stepId];
    if (!config || config.mandatory) {
      return {
        success: false,
        error: 'Only optional steps can be skipped',
      };
    }

    // Record the skip
    this.skippedSteps[stepId] = {
      stepId,
      reason,
      skippedAt: new Date().toISOString(),
    };

    // Update context
    this.context.skippedSteps = this.skippedSteps;
    this.context.shadowsSkipped = true;

    // Update summary
    this.summary.shadowSummary.skipped = true;
    this.summary.shadowSummary.skipReason = reason;

    // Recalculate lens progress
    this.updateLensProgress();

    return { success: true };
  }

  /**
   * Get all completed steps
   */
  getCompletedSteps(): JourneyStateId[] {
    return [...this.completedSteps];
  }

  /**
   * Check if a specific step is completed
   */
  isStepCompleted(stepId: JourneyStateId): boolean {
    return this.completedSteps.includes(stepId);
  }

  /**
   * Check if user can advance to next step
   */
  canAdvanceToNext(): { canAdvance: boolean; reason: string | null } {
    const nextStep = this.getNextAllowedStep();

    if (!nextStep) {
      // If at the last step, no reason needed
      const currentOrder = getStateOrder(this.currentState);
      const isLastStep = currentOrder >= JOURNEY_STATES.length - 1;

      return {
        canAdvance: false,
        reason: isLastStep ? null : getExitCriteriaMessage(this.currentState),
      };
    }

    return { canAdvance: true, reason: null };
  }

  // ============================================
  // STATE TRANSITIONS
  // ============================================

  /**
   * Attempt to transition to a target state
   */
  transitionTo(
    targetState: JourneyStateId
  ): { success: boolean; newState: JourneyStateId; error?: string } {
    const { allowed, reason } = canTransition(this.currentState, targetState, this.context);

    if (!allowed) {
      return {
        success: false,
        newState: this.currentState,
        error: reason || 'Transition not allowed',
      };
    }

    // Mark current state as completed if moving forward
    const targetOrder = getStateOrder(targetState);
    const currentOrder = getStateOrder(this.currentState);

    if (targetOrder > currentOrder && !this.completedSteps.includes(this.currentState)) {
      this.completedSteps.push(this.currentState);
    }

    this.currentState = targetState;

    // Recalculate lens progress
    this.updateLensProgress();

    return {
      success: true,
      newState: this.currentState,
    };
  }

  /**
   * Go back to a previously completed step (for review/edit)
   */
  revisitStep(stepId: JourneyStateId): { success: boolean; error?: string } {
    if (!this.completedSteps.includes(stepId) && stepId !== this.currentState) {
      return {
        success: false,
        error: 'Cannot revisit a step that has not been completed',
      };
    }

    // Allow revisiting - don't change completed steps
    this.currentState = stepId;

    return { success: true };
  }

  // ============================================
  // SUMMARY MANAGEMENT
  // ============================================

  /**
   * Update the journey summary with step completion data
   */
  updateSummary(data: StepCompletionData): JourneySummary {
    switch (data.type) {
      // DISCOVER lens steps
      case 'REFLECT_ON_STRENGTHS':
        this.summary.strengths = data.topStrengths;
        this.summary.demonstratedSkills = [
          ...new Set([...this.summary.demonstratedSkills, ...data.demonstratedSkills]),
        ];
        // Sync context so state machine sees updated strengths
        this.context.confirmedStrengths = data.topStrengths;
        break;

      case 'EXPLORE_CAREERS':
        this.summary.careerInterests = [
          ...new Set([...this.summary.careerInterests, ...data.selectedCareers]),
        ];
        // Sync context so state machine sees saved careers
        this.context.savedCareers = data.selectedCareers.map((title: string) => ({
          id: title,
          title,
          savedAt: new Date().toISOString(),
        }));
        break;

      case 'ROLE_DEEP_DIVE':
        // Add explored role to summary
        const existingRoleIndex = this.summary.exploredRoles.findIndex(
          (r) => r.title === data.role.title
        );

        if (existingRoleIndex >= 0) {
          this.summary.exploredRoles[existingRoleIndex] = data.role;
        } else {
          this.summary.exploredRoles.push(data.role);
        }
        // Sync context so state machine sees explored roles count
        this.context.exploredRolesCount = this.summary.exploredRoles.length;

        // Update certifications and companies
        this.summary.certificationsRequired = [
          ...new Set([...this.summary.certificationsRequired, ...data.role.certifications]),
        ];
        this.summary.companiesOfInterest = [
          ...new Set([...this.summary.companiesOfInterest, ...data.role.companies]),
        ];
        break;

      // UNDERSTAND lens steps
      case 'REVIEW_INDUSTRY_OUTLOOK':
        // Update trends reviewed count
        if (data.trendsReviewed) {
          this.summary.industryInsightsSummary.trendsReviewed = Math.max(
            this.summary.industryInsightsSummary.trendsReviewed,
            data.trendsReviewed.length
          );
        }

        this.summary.industryInsightsSummary.lastReviewedAt = new Date().toISOString();

        // Save outlook notes (legacy)
        this.summary.futureOutlookNotes = [
          ...new Set([...this.summary.futureOutlookNotes, ...data.outlookNotes]),
        ];

        // Save split notes
        if (data.roleRealityNotes) {
          this.summary.roleRealityNotes = data.roleRealityNotes;
        }
        if (data.industryInsightNotes) {
          this.summary.industryInsightNotes = data.industryInsightNotes;
        }

        // Sync context
        this.context.industryOutlookReviewed = true;
        break;

      case 'CREATE_ACTION_PLAN':
        // Add or update plan
        const existingPlanIndex = this.summary.rolePlans.findIndex(
          (p) => p.roleTitle === data.plan.roleTitle
        );

        if (existingPlanIndex >= 0) {
          this.summary.rolePlans[existingPlanIndex] = data.plan;
        } else {
          this.summary.rolePlans.push(data.plan);
        }

        this.summary.planCreated = true;
        this.summary.planUpdatedAt = new Date().toISOString();
        // Sync context
        this.context.planCreated = true;

        // Update next actions based on plan
        this.summary.nextActions = [
          ...data.plan.shortTermActions.map((action: string) => ({
            action,
            priority: 'high' as const,
            category: 'experience' as const,
          })),
          {
            action: data.plan.skillToBuild,
            priority: 'medium' as const,
            category: 'skill' as const,
          },
        ];
        break;

      case 'CAREER_SHADOW':
        if (data.skipped) {
          // User skipped this step
          this.summary.shadowSummary.skipped = true;
          this.summary.shadowSummary.skipReason = data.skipReason || null;
          this.context.shadowsSkipped = true;
        } else if (data.shadowRequestId) {
          // User created a shadow request
          this.summary.shadowSummary.total += 1;
          this.summary.shadowSummary.pending += 1;
          this.summary.shadowSummary.lastUpdatedAt = new Date().toISOString();
          this.context.shadowsCompleted += 1;
        }
        break;

      // ACT lens steps
      case 'COMPLETE_ALIGNED_ACTION':
        this.summary.alignedActionsCount += 1;
        this.context.alignedActionsCompleted = this.summary.alignedActionsCount;
        this.summary.alignedActions.push({
          id: data.actionId,
          type: data.actionType,
          title: data.actionTitle,
          completedAt: new Date().toISOString(),
          linkedToGoal: data.linkedToGoal,
          metadata: data.metadata,
        });
        break;

      case 'SUBMIT_ACTION_REFLECTION':
        this.summary.alignedActionReflections.push({
          id: `reflection-${Date.now()}`,
          actionId: data.actionId,
          prompt: 'What did you learn?',
          response: data.reflectionResponse,
          createdAt: new Date().toISOString(),
        });
        this.summary.reflectionSummary.total += 1;
        this.summary.reflectionSummary.lastReflectionAt = new Date().toISOString();
        this.context.actionReflectionsSubmitted = this.summary.alignedActionReflections.length;
        break;

      case 'UPDATE_PLAN':
        // Update existing plan
        if (this.summary.rolePlans.length > 0) {
          this.summary.rolePlans[0] = {
            ...this.summary.rolePlans[0],
            ...data.updatedPlan,
            updatedAt: new Date().toISOString(),
          };
        }
        this.summary.planUpdatedAt = new Date().toISOString();
        this.context.planUpdatedAfterAction = true;
        break;

      case 'EXTERNAL_FEEDBACK':
        // Record external feedback received
        break;
    }

    // Recalculate lens progress after any update
    this.updateLensProgress();

    return this.summary;
  }

  /**
   * Get the current journey summary
   */
  getSummary(): JourneySummary {
    return { ...this.summary };
  }

  // ============================================
  // UI STATE GENERATION
  // ============================================

  /**
   * Generate the complete UI state for the frontend
   */
  getUIState(): JourneyUIState {
    const steps: JourneyStepUI[] = JOURNEY_STATES.map((stateId, index) => {
      const def = JOURNEY_STATE_DEFINITIONS[stateId];
      const config = JOURNEY_STATE_CONFIG[stateId];
      const skippedInfo = this.skippedSteps[stateId];

      return {
        id: stateId,
        title: config.title,
        description: config.description,
        status: this.getStepStatus(stateId),
        order: config.order,
        artifacts: def.artifactsProduced,
        mandatory: config.mandatory,
        optional: !config.mandatory,
        stepNumber: index + 1,
        skipReason: skippedInfo?.reason,
      };
    });

    const { canAdvance, reason } = this.canAdvanceToNext();

    return {
      currentLens: this.getCurrentLens(),
      currentState: this.currentState,
      completedSteps: this.getCompletedSteps(),
      skippedSteps: this.getSkippedSteps(),
      steps,
      summary: this.getSummary(),
      canAdvanceToNextLens: canAdvance,
      nextStepReason: reason,
    };
  }

  /**
   * Determine the status of a step for UI display
   */
  private getStepStatus(stepId: JourneyStateId): JourneyStepStatus {
    const stepOrder = getStateOrder(stepId);
    const currentOrder = getStateOrder(this.currentState);

    // Check if skipped (for optional states)
    if (stepId in this.skippedSteps) {
      return 'skipped';
    }

    // Completed steps
    if (this.completedSteps.includes(stepId)) {
      return 'completed';
    }

    // Current step is "next" (active)
    if (stepId === this.currentState) {
      return 'next';
    }

    // Steps after current are locked
    if (stepOrder > currentOrder) {
      return 'locked';
    }

    // Steps before current that aren't marked completed
    // Check if they meet completion criteria
    if (hasCompletedState(stepId, this.context)) {
      return 'completed';
    }

    return 'locked';
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create an orchestrator instance from database state
 */
export function createOrchestrator(
  context: JourneyStateContext,
  dbState: {
    journeyState: string;
    journeyCompletedSteps: string[];
    journeySkippedSteps?: unknown;
    journeySummary: unknown;
  } | null
): JourneyOrchestrator {
  // Determine initial state based on context if no DB state
  // Validate that the stored state is a known state ID, fall back to recalculating if not
  const storedState = dbState?.journeyState as JourneyStateId | undefined;
  const isValidState = storedState && JOURNEY_STATES.includes(storedState);
  const currentState = isValidState ? storedState : determineCurrentState(context);

  const completedSteps = (dbState?.journeyCompletedSteps as JourneyStateId[]) || [];

  const skippedSteps = (dbState?.journeySkippedSteps as SkippedStepsMap) || {};

  const summary = dbState?.journeySummary
    ? (dbState.journeySummary as JourneySummary)
    : { ...DEFAULT_JOURNEY_SUMMARY };

  // Sync summary with context data
  summary.alignedActionsCount = context.completedJobs || 0;

  // Ensure context has skipped steps
  context.skippedSteps = skippedSteps;

  // Reconcile: if the current state is already completed according to the context
  // but wasn't recorded in completedSteps, auto-advance to the correct state.
  // This recovers users who completed a step but the state machine didn't advance.
  let reconciledState = currentState;
  const reconciledCompleted = [...completedSteps];

  for (let i = 0; i < JOURNEY_STATES.length; i++) {
    const stateId = JOURNEY_STATES[i] as JourneyStateId;
    if (stateId !== reconciledState) continue;

    // If the current state is completed but not in completedSteps, fix it
    if (hasCompletedOrSkippedState(stateId, context)) {
      if (!reconciledCompleted.includes(stateId)) {
        reconciledCompleted.push(stateId);
      }
      // Advance to next state if available
      const nextIdx = i + 1;
      if (nextIdx < JOURNEY_STATES.length) {
        reconciledState = JOURNEY_STATES[nextIdx] as JourneyStateId;
        // Continue the loop to check if the next state is also already complete
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return new JourneyOrchestrator(context, reconciledState, reconciledCompleted, skippedSteps, summary);
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate step completion data matches the step type
 */
export function validateStepCompletionData(
  stepId: JourneyStateId,
  data: StepCompletionData
): { valid: boolean; error?: string } {
  const expectedType = stepId;

  if (data.type !== expectedType) {
    return {
      valid: false,
      error: `Data type mismatch. Expected ${expectedType}, got ${data.type}`,
    };
  }

  // Specific validation per step
  switch (data.type) {
    case 'REFLECT_ON_STRENGTHS':
      if (data.topStrengths.length < 3) {
        return { valid: false, error: 'At least 3 strengths are required' };
      }
      break;

    case 'EXPLORE_CAREERS':
      if (data.selectedCareers.length < 1) {
        return { valid: false, error: 'At least one career must be selected' };
      }
      break;

    case 'ROLE_DEEP_DIVE':
      if (!data.role || !data.role.title) {
        return { valid: false, error: 'Role information is required' };
      }
      break;

    case 'REVIEW_INDUSTRY_OUTLOOK':
      if (!data.trendsReviewed || data.trendsReviewed.length < 3) {
        return { valid: false, error: 'Review at least 3 industry trends to continue' };
      }
      break;

    case 'CREATE_ACTION_PLAN':
      if (data.plan.shortTermActions.length < 2) {
        return { valid: false, error: 'At least 2 short-term actions are required' };
      }
      if (!data.plan.midTermMilestone) {
        return { valid: false, error: 'Mid-term milestone is required' };
      }
      if (!data.plan.skillToBuild) {
        return { valid: false, error: 'Skill to build is required' };
      }
      break;

    case 'CAREER_SHADOW':
      // A shadow request must be created (mandatory step)
      if (!data.shadowRequestId) {
        return { valid: false, error: 'A shadow request is required to complete this step' };
      }
      break;

    case 'COMPLETE_ALIGNED_ACTION':
      if (!data.actionType || !data.actionTitle) {
        return { valid: false, error: 'Action type and title are required' };
      }
      break;

    case 'SUBMIT_ACTION_REFLECTION':
      if (!data.reflectionResponse || data.reflectionResponse.trim().length === 0) {
        return { valid: false, error: 'A reflection response is required' };
      }
      break;
  }

  return { valid: true };
}

/**
 * Journey Module Exports
 *
 * Centralized exports for the journey state machine, orchestrator, and services.
 */

// Types
export * from './types';

// State Machine
export {
  JOURNEY_STATE_DEFINITIONS,
  canEnterState,
  hasCompletedState,
  hasCompletedOrSkippedState,
  canTransition,
  canSkipState,
  getExitCriteriaMessage,
  getStateOrder,
  getNextState,
  getStatesUpTo,
  determineCurrentState,
  isOptionalState,
  isStateSkipped,
  // Lens utilities
  getStateLens,
  getStatePhase,
  calculateLensProgress,
} from './state-machine';

// Orchestrator
export {
  JourneyOrchestrator,
  createOrchestrator,
  validateStepCompletionData,
} from './orchestrator';

// Timeline Service
export {
  createTimelineEvent,
  createTimelineEventsBatch,
  getTimelineEvents,
  getTimelineByMonth,
  getTimelineEventCounts,
  getEventTitle,
  getEventIcon,
  getEventCategory,
  TimelineEvents,
  type CreateTimelineEventInput,
  type TimelineQueryOptions,
} from './timeline-service';

// Saved Items Service (My Library)
export {
  saveItem,
  unsaveItem,
  updateSavedItem,
  getSavedItem,
  isItemSaved,
  getSavedItems,
  getSavedItemsByType,
  getRecentSavedItems,
  getSavedItemCounts,
  getUserTags,
  getSavedItemsByCareer,
  addTagToItems,
  removeTagFromItems,
  type CreateSavedItemInput,
  type UpdateSavedItemInput,
  type SavedItemQueryOptions,
} from './saved-items-service';

// Reflections Service
export {
  createReflection,
  recordReflection,
  skipReflection,
  getReflection,
  getReflections,
  getReflectionsForContext,
  getPendingReflections,
  getReflectionCounts,
  getReflectionsByContextType,
  getRandomPrompt,
  getContextTypeDisplayName,
  createReflectionsForAction,
  type ReflectionData,
  type CreateReflectionInput,
  type RecordReflectionInput,
  type ReflectionQueryOptions,
} from './reflections-service';

// Shadow Provider
export {
  getShadowProvider,
  resetShadowProvider,
  setShadowProvider,
  DatabaseShadowProvider,
  MockShadowProvider,
  type ShadowProvider,
  type ShadowRequest,
  type ShadowSummary,
  type ShadowHost,
  type ShadowRequestStatus,
  type ShadowFormat,
  type CreateShadowRequestInput,
  type UpdateShadowRequestInput,
} from './shadow-provider';

// Progress Calculator
export {
  calculateDiscoverProgress,
  calculateUnderstandProgress,
  calculateActProgress,
  calculateAllLensProgress,
  type LensProgressDetails,
} from './progress-calculator';

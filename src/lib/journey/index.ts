/**
 * Journey Module Exports
 *
 * Centralised exports for journey services. The legacy state-machine /
 * orchestrator / progress-calculator have been removed — see
 * CLAUDE.md <journey_logic>. Tabs are content views; progression lives
 * in the per-step roadmap, not in a stage machine.
 */

// Types
export * from './types';

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


/**
 * Timeline Service
 *
 * Aggregates events from multiple sources into a unified journey timeline.
 * Creates timeline events for significant actions and provides query utilities.
 */

import { prisma } from '@/lib/prisma';
import type { TimelineEventTypeId, TimelineEventData } from './types';

// ============================================
// EVENT CREATION
// ============================================

export interface CreateTimelineEventInput {
  userId: string;
  type: TimelineEventTypeId;
  metadata?: Record<string, unknown>;
}

/**
 * Create a new timeline event
 */
export async function createTimelineEvent(
  input: CreateTimelineEventInput
): Promise<TimelineEventData> {
  const event = await prisma.timelineEvent.create({
    data: {
      userId: input.userId,
      type: input.type,
      metadata: (input.metadata || {}) as object,
    },
  });

  return formatTimelineEvent(event);
}

/**
 * Create multiple timeline events in a batch
 */
export async function createTimelineEventsBatch(
  events: CreateTimelineEventInput[]
): Promise<number> {
  const result = await prisma.timelineEvent.createMany({
    data: events.map((e) => ({
      userId: e.userId,
      type: e.type,
      metadata: (e.metadata || {}) as object,
    })),
  });

  return result.count;
}

// ============================================
// EVENT QUERIES
// ============================================

export interface TimelineQueryOptions {
  userId: string;
  limit?: number;
  offset?: number;
  types?: TimelineEventTypeId[];
  startDate?: Date;
  endDate?: Date;
}

/**
 * Get timeline events for a user
 */
export async function getTimelineEvents(
  options: TimelineQueryOptions
): Promise<{ events: TimelineEventData[]; total: number }> {
  const { userId, limit = 50, offset = 0, types, startDate, endDate } = options;

  const where = {
    userId,
    ...(types && types.length > 0 ? { type: { in: types } } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  const [events, total] = await Promise.all([
    prisma.timelineEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.timelineEvent.count({ where }),
  ]);

  return {
    events: events.map(formatTimelineEvent),
    total,
  };
}

/**
 * Get timeline events grouped by month
 */
export async function getTimelineByMonth(
  userId: string,
  months: number = 6
): Promise<Map<string, TimelineEventData[]>> {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const events = await prisma.timelineEvent.findMany({
    where: {
      userId,
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'desc' },
  });

  const grouped = new Map<string, TimelineEventData[]>();

  for (const event of events) {
    const monthKey = `${event.createdAt.getFullYear()}-${String(event.createdAt.getMonth() + 1).padStart(2, '0')}`;

    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }

    grouped.get(monthKey)!.push(formatTimelineEvent(event));
  }

  return grouped;
}

/**
 * Get timeline event counts for summary
 */
export async function getTimelineEventCounts(
  userId: string
): Promise<{ total: number; thisMonth: number; lastEventAt: string | null }> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, thisMonth, lastEvent] = await Promise.all([
    prisma.timelineEvent.count({ where: { userId } }),
    prisma.timelineEvent.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.timelineEvent.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
  ]);

  return {
    total,
    thisMonth,
    lastEventAt: lastEvent?.createdAt.toISOString() || null,
  };
}

// ============================================
// EVENT TYPE HELPERS
// ============================================

/**
 * Get human-readable title for an event type
 */
export function getEventTitle(type: TimelineEventTypeId, metadata?: Record<string, unknown>): string {
  const titles: Record<TimelineEventTypeId, string> = {
    PROFILE_CREATED: 'Profile Created',
    STRENGTHS_CONFIRMED: metadata?.strength ? `Confirmed Strength: ${metadata.strength}` : 'Strengths Confirmed',
    CAREER_EXPLORED: metadata?.career ? `Explored: ${metadata.career}` : 'Career Explored',
    ROLE_DEEP_DIVE_COMPLETED: metadata?.role ? `Deep Dive: ${metadata.role}` : 'Role Deep Dive Completed',
    PRIMARY_GOAL_SET: metadata?.goal ? `Goal Set: ${metadata.goal}` : 'Primary Goal Set',
    INDUSTRY_OUTLOOK_REVIEWED: metadata?.industry ? `Reviewed: ${metadata.industry}` : 'Industry Outlook Reviewed',
    REQUIREMENTS_REVIEWED: metadata?.role ? `Requirements: ${metadata.role}` : 'Requirements Reviewed',
    PLAN_CREATED: metadata?.role ? `Plan Created: ${metadata.role}` : 'Action Plan Created',
    PLAN_UPDATED: 'Plan Updated',
    SHADOW_REQUESTED: metadata?.host ? `Shadow Requested: ${metadata.host}` : 'Career Shadow Requested',
    SHADOW_APPROVED: 'Shadow Request Approved',
    SHADOW_DECLINED: 'Shadow Request Declined',
    SHADOW_COMPLETED: 'Career Shadow Completed',
    SHADOW_SKIPPED: 'Career Shadow Step Skipped',
    ALIGNED_ACTION_COMPLETED: metadata?.actionType ? `Completed: ${metadata.actionType}` : 'Aligned Action Completed',
    ACTION_REFLECTION_SUBMITTED: 'Action Reflection Submitted',
    EXTERNAL_FEEDBACK_RECEIVED: metadata?.source ? `Feedback from: ${metadata.source}` : 'External Feedback Received',
    ITEM_SAVED: metadata?.title ? `Saved: ${metadata.title}` : 'Item Saved',
    REFLECTION_RECORDED: 'Reflection Recorded',
  };

  return titles[type] || type;
}

/**
 * Get icon name for an event type
 */
export function getEventIcon(type: TimelineEventTypeId): string {
  const icons: Record<TimelineEventTypeId, string> = {
    PROFILE_CREATED: 'user-plus',
    STRENGTHS_CONFIRMED: 'star',
    CAREER_EXPLORED: 'heart',
    ROLE_DEEP_DIVE_COMPLETED: 'search',
    PRIMARY_GOAL_SET: 'target',
    INDUSTRY_OUTLOOK_REVIEWED: 'trending-up',
    REQUIREMENTS_REVIEWED: 'clipboard-list',
    PLAN_CREATED: 'map',
    PLAN_UPDATED: 'map-pin',
    SHADOW_REQUESTED: 'eye',
    SHADOW_APPROVED: 'check-circle',
    SHADOW_DECLINED: 'x-circle',
    SHADOW_COMPLETED: 'award',
    SHADOW_SKIPPED: 'skip-forward',
    ALIGNED_ACTION_COMPLETED: 'briefcase',
    ACTION_REFLECTION_SUBMITTED: 'message-circle',
    EXTERNAL_FEEDBACK_RECEIVED: 'award',
    ITEM_SAVED: 'bookmark',
    REFLECTION_RECORDED: 'message-circle',
  };

  return icons[type] || 'circle';
}

/**
 * Get category for an event type (for filtering)
 */
export function getEventCategory(type: TimelineEventTypeId): 'profile' | 'experience' | 'career' | 'learning' | 'reflection' {
  const categories: Record<TimelineEventTypeId, 'profile' | 'experience' | 'career' | 'learning' | 'reflection'> = {
    PROFILE_CREATED: 'profile',
    STRENGTHS_CONFIRMED: 'profile',
    CAREER_EXPLORED: 'career',
    ROLE_DEEP_DIVE_COMPLETED: 'career',
    PRIMARY_GOAL_SET: 'career',
    INDUSTRY_OUTLOOK_REVIEWED: 'learning',
    REQUIREMENTS_REVIEWED: 'learning',
    PLAN_CREATED: 'career',
    PLAN_UPDATED: 'career',
    SHADOW_REQUESTED: 'experience',
    SHADOW_APPROVED: 'experience',
    SHADOW_DECLINED: 'experience',
    SHADOW_COMPLETED: 'experience',
    SHADOW_SKIPPED: 'experience',
    ALIGNED_ACTION_COMPLETED: 'experience',
    ACTION_REFLECTION_SUBMITTED: 'reflection',
    EXTERNAL_FEEDBACK_RECEIVED: 'experience',
    ITEM_SAVED: 'learning',
    REFLECTION_RECORDED: 'reflection',
  };

  return categories[type] || 'profile';
}

// ============================================
// HELPER FUNCTIONS
// ============================================

interface PrismaTimelineEvent {
  id: string;
  userId: string;
  type: string;
  metadata: unknown;
  createdAt: Date;
}

function formatTimelineEvent(event: PrismaTimelineEvent): TimelineEventData {
  const metadata = (event.metadata as Record<string, unknown>) || {};

  return {
    id: event.id,
    type: event.type as TimelineEventTypeId,
    title: getEventTitle(event.type as TimelineEventTypeId, metadata),
    description: metadata.description as string | undefined,
    metadata,
    createdAt: event.createdAt.toISOString(),
  };
}

// ============================================
// CONVENIENCE FUNCTIONS FOR COMMON EVENTS
// ============================================

export const TimelineEvents = {
  profileCreated: (userId: string) =>
    createTimelineEvent({
      userId,
      type: 'PROFILE_CREATED',
    }),

  strengthsConfirmed: (userId: string, strengths: string[]) =>
    createTimelineEvent({
      userId,
      type: 'STRENGTHS_CONFIRMED',
      metadata: { strengths },
    }),

  careerExplored: (userId: string, careerId: string, careerTitle: string) =>
    createTimelineEvent({
      userId,
      type: 'CAREER_EXPLORED',
      metadata: { careerId, career: careerTitle },
    }),

  roleDeepDiveCompleted: (userId: string, roleId: string, roleTitle: string) =>
    createTimelineEvent({
      userId,
      type: 'ROLE_DEEP_DIVE_COMPLETED',
      metadata: { roleId, role: roleTitle },
    }),

  primaryGoalSet: (userId: string, goalId: string, goalTitle: string) =>
    createTimelineEvent({
      userId,
      type: 'PRIMARY_GOAL_SET',
      metadata: { goalId, goal: goalTitle },
    }),

  industryOutlookReviewed: (userId: string, industryTitle: string) =>
    createTimelineEvent({
      userId,
      type: 'INDUSTRY_OUTLOOK_REVIEWED',
      metadata: { industry: industryTitle },
    }),

  requirementsReviewed: (userId: string, roleId: string, roleTitle: string) =>
    createTimelineEvent({
      userId,
      type: 'REQUIREMENTS_REVIEWED',
      metadata: { roleId, role: roleTitle },
    }),

  planCreated: (userId: string, roleTitle: string) =>
    createTimelineEvent({
      userId,
      type: 'PLAN_CREATED',
      metadata: { role: roleTitle },
    }),

  planUpdated: (userId: string) =>
    createTimelineEvent({
      userId,
      type: 'PLAN_UPDATED',
    }),

  shadowRequested: (userId: string, requestId: string, hostName?: string) =>
    createTimelineEvent({
      userId,
      type: 'SHADOW_REQUESTED',
      metadata: { requestId, host: hostName },
    }),

  shadowApproved: (userId: string, requestId: string) =>
    createTimelineEvent({
      userId,
      type: 'SHADOW_APPROVED',
      metadata: { requestId },
    }),

  shadowDeclined: (userId: string, requestId: string) =>
    createTimelineEvent({
      userId,
      type: 'SHADOW_DECLINED',
      metadata: { requestId },
    }),

  shadowCompleted: (userId: string, requestId: string) =>
    createTimelineEvent({
      userId,
      type: 'SHADOW_COMPLETED',
      metadata: { requestId },
    }),

  shadowSkipped: (userId: string, reason: string) =>
    createTimelineEvent({
      userId,
      type: 'SHADOW_SKIPPED',
      metadata: { reason },
    }),

  alignedActionCompleted: (userId: string, actionType: string, details?: Record<string, unknown>) =>
    createTimelineEvent({
      userId,
      type: 'ALIGNED_ACTION_COMPLETED',
      metadata: { actionType, ...details },
    }),

  actionReflectionSubmitted: (userId: string, actionId: string) =>
    createTimelineEvent({
      userId,
      type: 'ACTION_REFLECTION_SUBMITTED',
      metadata: { actionId },
    }),

  externalFeedbackReceived: (userId: string, source: string, feedbackType?: string) =>
    createTimelineEvent({
      userId,
      type: 'EXTERNAL_FEEDBACK_RECEIVED',
      metadata: { source, feedbackType },
    }),

  itemSaved: (userId: string, itemId: string, itemType: string, title: string) =>
    createTimelineEvent({
      userId,
      type: 'ITEM_SAVED',
      metadata: { itemId, itemType, title },
    }),

  reflectionRecorded: (userId: string, contextType: string, contextId?: string) =>
    createTimelineEvent({
      userId,
      type: 'REFLECTION_RECORDED',
      metadata: { contextType, contextId },
    }),
};

/**
 * Reflections Service
 *
 * Manages optional reflection moments after significant journey events.
 * Users can respond to prompts or skip reflections.
 */

import { prisma } from '@/lib/prisma';
import type { ReflectionContextType, REFLECTION_PROMPTS } from './types';
import { TimelineEvents } from './timeline-service';

// ============================================
// TYPES
// ============================================

export interface ReflectionData {
  id: string;
  profileId: string;
  contextType: ReflectionContextType;
  contextId: string | null;
  prompt: string;
  response: string | null;
  skipped: boolean;
  createdAt: string;
}

export interface CreateReflectionInput {
  profileId: string;
  userId: string;
  contextType: ReflectionContextType;
  contextId?: string;
  prompt: string;
}

export interface RecordReflectionInput {
  response?: string;
  skipped?: boolean;
}

// ============================================
// REFLECTION MANAGEMENT
// ============================================

/**
 * Create a reflection prompt for the user
 */
export async function createReflection(input: CreateReflectionInput): Promise<ReflectionData> {
  const reflection = await prisma.journeyReflection.create({
    data: {
      profileId: input.profileId,
      contextType: input.contextType,
      contextId: input.contextId,
      prompt: input.prompt,
      skipped: false,
    },
  });

  return formatReflection(reflection);
}

/**
 * Record a user's response to a reflection
 */
export async function recordReflection(
  reflectionId: string,
  profileId: string,
  userId: string,
  input: RecordReflectionInput
): Promise<ReflectionData | null> {
  const reflection = await prisma.journeyReflection.findFirst({
    where: { id: reflectionId, profileId },
  });

  if (!reflection) return null;

  const updated = await prisma.journeyReflection.update({
    where: { id: reflectionId },
    data: {
      response: input.response || null,
      skipped: input.skipped || false,
    },
  });

  // Create timeline event if not skipped
  if (!input.skipped && input.response) {
    await TimelineEvents.reflectionRecorded(userId, reflection.contextType, reflection.contextId || undefined);
  }

  return formatReflection(updated);
}

/**
 * Skip a reflection
 */
export async function skipReflection(
  reflectionId: string,
  profileId: string
): Promise<ReflectionData | null> {
  const reflection = await prisma.journeyReflection.findFirst({
    where: { id: reflectionId, profileId },
  });

  if (!reflection) return null;

  const updated = await prisma.journeyReflection.update({
    where: { id: reflectionId },
    data: { skipped: true },
  });

  return formatReflection(updated);
}

/**
 * Get a single reflection
 */
export async function getReflection(reflectionId: string, profileId: string): Promise<ReflectionData | null> {
  const reflection = await prisma.journeyReflection.findFirst({
    where: { id: reflectionId, profileId },
  });

  return reflection ? formatReflection(reflection) : null;
}

// ============================================
// QUERY OPERATIONS
// ============================================

export interface ReflectionQueryOptions {
  profileId: string;
  contextType?: ReflectionContextType;
  contextId?: string;
  includeSkipped?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Get reflections with filtering
 */
export async function getReflections(
  options: ReflectionQueryOptions
): Promise<{ reflections: ReflectionData[]; total: number }> {
  const { profileId, contextType, contextId, includeSkipped = true, limit = 50, offset = 0 } = options;

  const where = {
    profileId,
    ...(contextType ? { contextType } : {}),
    ...(contextId ? { contextId } : {}),
    ...(!includeSkipped ? { skipped: false } : {}),
  };

  const [reflections, total] = await Promise.all([
    prisma.journeyReflection.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.journeyReflection.count({ where }),
  ]);

  return {
    reflections: reflections.map(formatReflection),
    total,
  };
}

/**
 * Get reflections for a specific context item
 */
export async function getReflectionsForContext(
  profileId: string,
  contextType: ReflectionContextType,
  contextId: string
): Promise<ReflectionData[]> {
  const reflections = await prisma.journeyReflection.findMany({
    where: {
      profileId,
      contextType,
      contextId,
    },
    orderBy: { createdAt: 'asc' },
  });

  return reflections.map(formatReflection);
}

/**
 * Get pending reflections (created but not yet responded to)
 */
export async function getPendingReflections(profileId: string): Promise<ReflectionData[]> {
  const reflections = await prisma.journeyReflection.findMany({
    where: {
      profileId,
      response: null,
      skipped: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  return reflections.map(formatReflection);
}

/**
 * Get reflection counts for summary
 */
export async function getReflectionCounts(
  profileId: string
): Promise<{ total: number; thisMonth: number; lastReflectionAt: string | null }> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, thisMonth, lastReflection] = await Promise.all([
    prisma.journeyReflection.count({
      where: { profileId, skipped: false, response: { not: null } },
    }),
    prisma.journeyReflection.count({
      where: {
        profileId,
        skipped: false,
        response: { not: null },
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.journeyReflection.findFirst({
      where: { profileId, skipped: false, response: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
  ]);

  return {
    total,
    thisMonth,
    lastReflectionAt: lastReflection?.createdAt.toISOString() || null,
  };
}

/**
 * Get reflections grouped by context type
 */
export async function getReflectionsByContextType(
  profileId: string
): Promise<Record<ReflectionContextType, ReflectionData[]>> {
  const reflections = await prisma.journeyReflection.findMany({
    where: {
      profileId,
      skipped: false,
      response: { not: null },
    },
    orderBy: { createdAt: 'desc' },
  });

  const grouped: Record<ReflectionContextType, ReflectionData[]> = {
    ALIGNED_ACTION: [],
    ROLE_DEEP_DIVE: [],
    INDUSTRY_INSIGHTS: [],
    SHADOW_COMPLETED: [],
    CAREER_DISCOVERY: [],
    PLAN_BUILD: [],
    STRENGTHS_REFLECTION: [],
  };

  for (const reflection of reflections) {
    const contextType = reflection.contextType as ReflectionContextType;
    if (grouped[contextType]) {
      grouped[contextType].push(formatReflection(reflection));
    }
  }

  return grouped;
}

// ============================================
// PROMPT HELPERS
// ============================================

/**
 * Get a random prompt for a context type
 */
export function getRandomPrompt(contextType: ReflectionContextType, prompts: typeof REFLECTION_PROMPTS): string {
  const typePrompts = prompts[contextType];
  const randomIndex = Math.floor(Math.random() * typePrompts.length);
  return typePrompts[randomIndex];
}

/**
 * Get context type display name
 */
export function getContextTypeDisplayName(contextType: ReflectionContextType): string {
  const names: Record<ReflectionContextType, string> = {
    ALIGNED_ACTION: 'Aligned Action',
    ROLE_DEEP_DIVE: 'Role Deep Dive',
    INDUSTRY_INSIGHTS: 'Industry Insights',
    SHADOW_COMPLETED: 'Career Shadow',
    CAREER_DISCOVERY: 'Career Discovery',
    PLAN_BUILD: 'Plan Building',
    STRENGTHS_REFLECTION: 'Strengths Reflection',
  };

  return names[contextType] || contextType;
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Create reflections for a completed action
 */
export async function createReflectionsForAction(
  profileId: string,
  userId: string,
  contextType: ReflectionContextType,
  contextId: string,
  prompts: string[]
): Promise<ReflectionData[]> {
  const reflections = await prisma.journeyReflection.createMany({
    data: prompts.map((prompt) => ({
      profileId,
      contextType,
      contextId,
      prompt,
      skipped: false,
    })),
  });

  // Fetch the created reflections
  const created = await prisma.journeyReflection.findMany({
    where: {
      profileId,
      contextType,
      contextId,
    },
    orderBy: { createdAt: 'asc' },
  });

  return created.map(formatReflection);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

interface PrismaReflection {
  id: string;
  profileId: string;
  contextType: string;
  contextId: string | null;
  prompt: string;
  response: string | null;
  skipped: boolean;
  createdAt: Date;
}

function formatReflection(reflection: PrismaReflection): ReflectionData {
  return {
    id: reflection.id,
    profileId: reflection.profileId,
    contextType: reflection.contextType as ReflectionContextType,
    contextId: reflection.contextId,
    prompt: reflection.prompt,
    response: reflection.response,
    skipped: reflection.skipped,
    createdAt: reflection.createdAt.toISOString(),
  };
}

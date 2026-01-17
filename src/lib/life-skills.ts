import { prisma } from '@/lib/prisma';
import { LifeSkillRecommendationSource, Prisma } from '@prisma/client';

// ============================================
// LIFE SKILLS TRACK - Core Logic
// Version 1.0 - Rules-based triggers only
// ============================================

// Event types that trigger life skill recommendations
export type LifeSkillEventType =
  | 'JOB_ACCEPTED'
  | 'MESSAGE_SENT_FIRST'
  | 'JOB_STARTING_SOON'
  | 'RUNNING_LATE_TEMPLATE_USED'
  | 'CONVERSATION_STARTED'
  | 'JOB_DECLINED'
  | 'PAYMENT_DISCUSSED'
  | 'LOCATION_SHARED'
  | 'JOB_COMPLETED'
  | 'SAFETY_CONCERN_REPORTED';

// Mapping of event types to card keys (rules-based)
const EVENT_TO_CARD_MAP: Record<LifeSkillEventType, string[]> = {
  JOB_ACCEPTED: ['FIRST_JOB_ACCEPTED', 'ARRIVING_ON_TIME', 'CLARIFY_THE_TASK'],
  MESSAGE_SENT_FIRST: ['FIRST_MESSAGE_TO_ADULT'],
  JOB_STARTING_SOON: ['ARRIVING_ON_TIME'],
  RUNNING_LATE_TEMPLATE_USED: ['RUNNING_LATE'],
  CONVERSATION_STARTED: ['FIRST_MESSAGE_TO_ADULT'],
  JOB_DECLINED: ['DECLINING_A_JOB'],
  PAYMENT_DISCUSSED: ['PRICE_AND_PAYMENT'],
  LOCATION_SHARED: ['SAFETY_BOUNDARIES'],
  JOB_COMPLETED: ['AFTER_THE_JOB'],
  SAFETY_CONCERN_REPORTED: ['WHEN_SOMETHING_FEELS_OFF'],
};

// Whitelist of valid card keys (v1)
const VALID_CARD_KEYS = [
  'FIRST_JOB_ACCEPTED',
  'FIRST_MESSAGE_TO_ADULT',
  'ARRIVING_ON_TIME',
  'RUNNING_LATE',
  'CLARIFY_THE_TASK',
  'DECLINING_A_JOB',
  'PRICE_AND_PAYMENT',
  'SAFETY_BOUNDARIES',
  'AFTER_THE_JOB',
  'WHEN_SOMETHING_FEELS_OFF',
];

/**
 * Check if user has life skills tips enabled
 */
export async function isLifeSkillsEnabled(userId: string): Promise<boolean> {
  const prefs = await prisma.userPreferences.findUnique({
    where: { userId },
    select: { showLifeSkills: true },
  });
  // Default to true if no preferences set
  return prefs?.showLifeSkills ?? true;
}

/**
 * Record a life skill event and create recommendation if applicable
 * Uses idempotent upsert to prevent duplicates
 */
export async function recordLifeSkillEvent(
  userId: string,
  eventType: LifeSkillEventType,
  entityId?: string,
  metadata?: Prisma.InputJsonObject
): Promise<{ eventId: string; cardRecommended?: string } | null> {
  // Check if user has life skills enabled
  const enabled = await isLifeSkillsEnabled(userId);
  if (!enabled) {
    return null;
  }

  // Check if user is a youth (only youth get tips)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== 'YOUTH') {
    return null;
  }

  try {
    // Idempotent event creation
    const event = await prisma.lifeSkillEvent.upsert({
      where: {
        userId_eventType_entityId: {
          userId,
          eventType,
          entityId: entityId ?? '',
        },
      },
      update: {},
      create: {
        userId,
        eventType,
        entityId: entityId ?? null,
        metadata: metadata ?? undefined,
      },
    });

    // Get card keys for this event type
    const cardKeys = EVENT_TO_CARD_MAP[eventType];
    if (!cardKeys || cardKeys.length === 0) {
      return { eventId: event.id };
    }

    // Find first card key that user hasn't been shown yet
    const cardKey = await findUnshownCard(userId, cardKeys);
    if (!cardKey) {
      return { eventId: event.id };
    }

    // Get the card
    const card = await prisma.lifeSkillCard.findUnique({
      where: { key: cardKey },
      select: { id: true },
    });
    if (!card) {
      return { eventId: event.id };
    }

    // Create recommendation (may fail if already exists - that's OK)
    try {
      await prisma.lifeSkillRecommendation.create({
        data: {
          userId,
          eventId: event.id,
          cardId: card.id,
          source: LifeSkillRecommendationSource.RULES,
          reason: `Triggered by ${eventType}`,
        },
      });
      return { eventId: event.id, cardRecommended: cardKey };
    } catch {
      // Recommendation already exists for this event
      return { eventId: event.id };
    }
  } catch (error) {
    // Event already exists (unique constraint)
    console.error('Life skill event recording failed:', error);
    return null;
  }
}

/**
 * Find a card key that the user hasn't been shown yet
 */
async function findUnshownCard(userId: string, cardKeys: string[]): Promise<string | null> {
  // Get cards the user has already been shown
  const shownCards = await prisma.lifeSkillView.findMany({
    where: { userId },
    select: { card: { select: { key: true } } },
  });
  const shownKeys = new Set(shownCards.map((v) => v.card.key));

  // Return first card key not yet shown
  for (const key of cardKeys) {
    if (!shownKeys.has(key)) {
      return key;
    }
  }
  return null;
}

/**
 * Get pending life skill recommendations for a user
 * Returns recommendations that haven't been dismissed or saved
 */
export async function getPendingRecommendations(userId: string) {
  // Check if enabled
  const enabled = await isLifeSkillsEnabled(userId);
  if (!enabled) {
    return [];
  }

  // Get recommendations without corresponding views
  const recommendations = await prisma.lifeSkillRecommendation.findMany({
    where: {
      userId,
      views: { none: {} },
    },
    include: {
      card: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 1, // Only show one at a time
  });

  return recommendations.map((r) => ({
    id: r.id,
    cardKey: r.card.key,
    title: r.card.title,
    body: r.card.body,
    tags: r.card.tags,
    source: r.source,
    reason: r.reason,
    createdAt: r.createdAt,
  }));
}

/**
 * Mark a recommendation as viewed (shown to user)
 */
export async function markRecommendationShown(
  userId: string,
  recommendationId: string
): Promise<boolean> {
  try {
    const recommendation = await prisma.lifeSkillRecommendation.findUnique({
      where: { id: recommendationId },
      select: { userId: true, cardId: true },
    });

    if (!recommendation || recommendation.userId !== userId) {
      return false;
    }

    await prisma.lifeSkillView.upsert({
      where: {
        userId_cardId_recommendationId: {
          userId,
          cardId: recommendation.cardId,
          recommendationId,
        },
      },
      update: { status: 'SHOWN' },
      create: {
        userId,
        cardId: recommendation.cardId,
        recommendationId,
        status: 'SHOWN',
      },
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Dismiss a recommendation (user clicked "Got it")
 */
export async function dismissRecommendation(
  userId: string,
  recommendationId: string
): Promise<boolean> {
  try {
    const recommendation = await prisma.lifeSkillRecommendation.findUnique({
      where: { id: recommendationId },
      select: { userId: true, cardId: true },
    });

    if (!recommendation || recommendation.userId !== userId) {
      return false;
    }

    await prisma.lifeSkillView.upsert({
      where: {
        userId_cardId_recommendationId: {
          userId,
          cardId: recommendation.cardId,
          recommendationId,
        },
      },
      update: { status: 'DISMISSED', updatedAt: new Date() },
      create: {
        userId,
        cardId: recommendation.cardId,
        recommendationId,
        status: 'DISMISSED',
      },
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Save a card for later (user clicked "Save")
 */
export async function saveCard(userId: string, recommendationId: string): Promise<boolean> {
  try {
    const recommendation = await prisma.lifeSkillRecommendation.findUnique({
      where: { id: recommendationId },
      select: { userId: true, cardId: true },
    });

    if (!recommendation || recommendation.userId !== userId) {
      return false;
    }

    await prisma.lifeSkillView.upsert({
      where: {
        userId_cardId_recommendationId: {
          userId,
          cardId: recommendation.cardId,
          recommendationId,
        },
      },
      update: { status: 'SAVED', updatedAt: new Date() },
      create: {
        userId,
        cardId: recommendation.cardId,
        recommendationId,
        status: 'SAVED',
      },
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Get saved cards for a user
 */
export async function getSavedCards(userId: string) {
  const views = await prisma.lifeSkillView.findMany({
    where: {
      userId,
      status: 'SAVED',
    },
    include: {
      card: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return views.map((v) => ({
    viewId: v.id,
    cardKey: v.card.key,
    title: v.card.title,
    body: v.card.body,
    tags: v.card.tags,
    savedAt: v.updatedAt,
  }));
}

/**
 * Toggle life skills on/off for a user
 */
export async function setLifeSkillsPreference(
  userId: string,
  enabled: boolean
): Promise<boolean> {
  try {
    await prisma.userPreferences.upsert({
      where: { userId },
      update: { showLifeSkills: enabled },
      create: { userId, showLifeSkills: enabled },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * AI Agent function: Recommend a card (constrained to whitelist)
 * This is called by the AI agent when it detects a teachable moment
 */
export async function aiRecommendCard(
  userId: string,
  cardKey: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  // Validate card key is in whitelist
  if (!VALID_CARD_KEYS.includes(cardKey)) {
    return { success: false, error: `Invalid card key: ${cardKey}` };
  }

  // Check if AI recommendations are enabled
  const aiEnabled = process.env.LIFE_SKILLS_AI_ENABLED === 'true';
  if (!aiEnabled) {
    return { success: false, error: 'AI recommendations disabled' };
  }

  // Check if user has life skills enabled
  const enabled = await isLifeSkillsEnabled(userId);
  if (!enabled) {
    return { success: false, error: 'User has life skills disabled' };
  }

  // Check if user already has this card
  const existingView = await prisma.lifeSkillView.findFirst({
    where: {
      userId,
      card: { key: cardKey },
    },
  });
  if (existingView) {
    return { success: false, error: 'User already has this card' };
  }

  // Get the card
  const card = await prisma.lifeSkillCard.findUnique({
    where: { key: cardKey },
    select: { id: true, isActive: true },
  });
  if (!card || !card.isActive) {
    return { success: false, error: 'Card not found or inactive' };
  }

  // Create a synthetic event for AI recommendation
  const event = await prisma.lifeSkillEvent.create({
    data: {
      userId,
      eventType: 'AI_RECOMMENDATION',
      metadata: { cardKey, reason },
    },
  });

  // Create recommendation
  await prisma.lifeSkillRecommendation.create({
    data: {
      userId,
      eventId: event.id,
      cardId: card.id,
      source: LifeSkillRecommendationSource.AI,
      reason: reason.slice(0, 140), // Max 140 chars
    },
  });

  return { success: true };
}

/**
 * Get all active cards (for reference/testing)
 */
export async function getAllActiveCards() {
  return prisma.lifeSkillCard.findMany({
    where: { isActive: true },
    orderBy: { key: 'asc' },
  });
}

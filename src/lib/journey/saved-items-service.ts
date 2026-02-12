/**
 * Saved Items Service (My Library)
 *
 * CRUD operations for saved content items (articles, videos, podcasts, shorts).
 * Supports tagging by career path and role.
 */

import { prisma } from '@/lib/prisma';
import type { SavedItemType, SavedItemData, SavedItemSummary } from './types';
import { TimelineEvents } from './timeline-service';

// ============================================
// TYPES
// ============================================

export interface CreateSavedItemInput {
  profileId: string;
  userId: string;
  type: SavedItemType;
  title: string;
  url: string;
  source?: string;
  tags?: string[];
  careerPathId?: string;
  roleId?: string;
  thumbnail?: string;
  description?: string;
}

export interface UpdateSavedItemInput {
  tags?: string[];
  careerPathId?: string | null;
  roleId?: string | null;
}

export interface SavedItemQueryOptions {
  profileId: string;
  type?: SavedItemType;
  careerPathId?: string;
  roleId?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  search?: string;
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Save a new item to the user's library
 */
export async function saveItem(input: CreateSavedItemInput): Promise<SavedItemData> {
  // Check for duplicate URL (only among active items)
  const existing = await prisma.savedItem.findFirst({
    where: {
      profileId: input.profileId,
      url: input.url,
      deletedAt: null,
    },
  });

  if (existing) {
    return formatSavedItem(existing);
  }

  const item = await prisma.savedItem.create({
    data: {
      profileId: input.profileId,
      type: input.type,
      title: input.title,
      url: input.url,
      source: input.source,
      tags: input.tags || [],
      careerPathId: input.careerPathId,
      roleId: input.roleId,
      thumbnail: input.thumbnail,
      description: input.description,
    },
  });

  // Create timeline event (non-blocking — don't let this fail the save)
  try {
    await TimelineEvents.itemSaved(input.userId, item.id, input.type, input.title);
  } catch (e) {
    console.error('Failed to create timeline event for saved item:', e);
  }

  return formatSavedItem(item);
}

/**
 * Soft-delete an item from the library (30-day recovery window)
 */
export async function unsaveItem(itemId: string, profileId: string): Promise<boolean> {
  const result = await prisma.savedItem.updateMany({
    where: {
      id: itemId,
      profileId,
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  });

  return result.count > 0;
}

/**
 * Update an item's tags or associations
 */
export async function updateSavedItem(
  itemId: string,
  profileId: string,
  updates: UpdateSavedItemInput
): Promise<SavedItemData | null> {
  const item = await prisma.savedItem.findFirst({
    where: { id: itemId, profileId, deletedAt: null },
  });

  if (!item) return null;

  const updated = await prisma.savedItem.update({
    where: { id: itemId },
    data: {
      ...(updates.tags !== undefined ? { tags: updates.tags } : {}),
      ...(updates.careerPathId !== undefined ? { careerPathId: updates.careerPathId } : {}),
      ...(updates.roleId !== undefined ? { roleId: updates.roleId } : {}),
    },
  });

  return formatSavedItem(updated);
}

/**
 * Get a single saved item
 */
export async function getSavedItem(itemId: string, profileId: string): Promise<SavedItemData | null> {
  const item = await prisma.savedItem.findFirst({
    where: { id: itemId, profileId, deletedAt: null },
  });

  return item ? formatSavedItem(item) : null;
}

/**
 * Check if an item is saved
 */
export async function isItemSaved(url: string, profileId: string): Promise<boolean> {
  const count = await prisma.savedItem.count({
    where: { url, profileId, deletedAt: null },
  });

  return count > 0;
}

// ============================================
// QUERY OPERATIONS
// ============================================

/**
 * Get saved items with filtering
 */
export async function getSavedItems(
  options: SavedItemQueryOptions
): Promise<{ items: SavedItemData[]; total: number }> {
  const { profileId, type, careerPathId, roleId, tags, limit = 50, offset = 0, search } = options;

  const where = {
    profileId,
    deletedAt: null as null,
    ...(type ? { type } : {}),
    ...(careerPathId ? { careerPathId } : {}),
    ...(roleId ? { roleId } : {}),
    ...(tags && tags.length > 0 ? { tags: { hasSome: tags } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.savedItem.findMany({
      where,
      orderBy: { savedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.savedItem.count({ where }),
  ]);

  return {
    items: items.map(formatSavedItem),
    total,
  };
}

/**
 * Get saved items grouped by type
 */
export async function getSavedItemsByType(profileId: string): Promise<Record<SavedItemType, SavedItemData[]>> {
  const items = await prisma.savedItem.findMany({
    where: { profileId, deletedAt: null },
    orderBy: { savedAt: 'desc' },
  });

  const grouped: Record<SavedItemType, SavedItemData[]> = {
    ARTICLE: [],
    VIDEO: [],
    PODCAST: [],
    SHORT: [],
  };

  for (const item of items) {
    const type = item.type as SavedItemType;
    grouped[type].push(formatSavedItem(item));
  }

  return grouped;
}

/**
 * Get recently saved items
 */
export async function getRecentSavedItems(profileId: string, limit: number = 5): Promise<SavedItemSummary[]> {
  const items = await prisma.savedItem.findMany({
    where: { profileId, deletedAt: null },
    orderBy: { savedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      type: true,
      title: true,
      savedAt: true,
    },
  });

  return items.map((item) => ({
    id: item.id,
    type: item.type as SavedItemType,
    title: item.title,
    savedAt: item.savedAt.toISOString(),
  }));
}

/**
 * Get counts by type for summary
 */
export async function getSavedItemCounts(
  profileId: string
): Promise<{ articles: number; videos: number; podcasts: number; shorts: number; total: number }> {
  const counts = await prisma.savedItem.groupBy({
    by: ['type'],
    where: { profileId, deletedAt: null },
    _count: { type: true },
  });

  const result = {
    articles: 0,
    videos: 0,
    podcasts: 0,
    shorts: 0,
    total: 0,
  };

  for (const count of counts) {
    const num = count._count.type;
    result.total += num;

    switch (count.type) {
      case 'ARTICLE':
        result.articles = num;
        break;
      case 'VIDEO':
        result.videos = num;
        break;
      case 'PODCAST':
        result.podcasts = num;
        break;
      case 'SHORT':
        result.shorts = num;
        break;
    }
  }

  return result;
}

/**
 * Get all unique tags used by user
 */
export async function getUserTags(profileId: string): Promise<string[]> {
  const items = await prisma.savedItem.findMany({
    where: { profileId, deletedAt: null },
    select: { tags: true },
  });

  const tagsSet = new Set<string>();
  for (const item of items) {
    for (const tag of item.tags) {
      tagsSet.add(tag);
    }
  }

  return Array.from(tagsSet).sort();
}

/**
 * Get items by career path with counts
 */
export async function getSavedItemsByCareer(
  profileId: string
): Promise<Array<{ careerPathId: string; count: number; items: SavedItemData[] }>> {
  const items = await prisma.savedItem.findMany({
    where: {
      profileId,
      deletedAt: null,
      careerPathId: { not: null },
    },
    orderBy: { savedAt: 'desc' },
  });

  const grouped = new Map<string, SavedItemData[]>();

  for (const item of items) {
    const careerId = item.careerPathId!;
    if (!grouped.has(careerId)) {
      grouped.set(careerId, []);
    }
    grouped.get(careerId)!.push(formatSavedItem(item));
  }

  return Array.from(grouped.entries()).map(([careerPathId, items]) => ({
    careerPathId,
    count: items.length,
    items,
  }));
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Add a tag to multiple items
 */
export async function addTagToItems(itemIds: string[], profileId: string, tag: string): Promise<number> {
  let updated = 0;

  for (const itemId of itemIds) {
    const item = await prisma.savedItem.findFirst({
      where: { id: itemId, profileId, deletedAt: null },
    });

    if (item && !item.tags.includes(tag)) {
      await prisma.savedItem.update({
        where: { id: itemId },
        data: { tags: [...item.tags, tag] },
      });
      updated++;
    }
  }

  return updated;
}

/**
 * Remove a tag from multiple items
 */
export async function removeTagFromItems(itemIds: string[], profileId: string, tag: string): Promise<number> {
  let updated = 0;

  for (const itemId of itemIds) {
    const item = await prisma.savedItem.findFirst({
      where: { id: itemId, profileId, deletedAt: null },
    });

    if (item && item.tags.includes(tag)) {
      await prisma.savedItem.update({
        where: { id: itemId },
        data: { tags: item.tags.filter((t) => t !== tag) },
      });
      updated++;
    }
  }

  return updated;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

interface PrismaSavedItem {
  id: string;
  profileId: string;
  type: string;
  title: string;
  url: string;
  source: string | null;
  tags: string[];
  careerPathId: string | null;
  roleId: string | null;
  thumbnail: string | null;
  description: string | null;
  savedAt: Date;
}

function formatSavedItem(item: PrismaSavedItem): SavedItemData {
  return {
    id: item.id,
    type: item.type as SavedItemType,
    title: item.title,
    url: item.url,
    source: item.source || undefined,
    tags: item.tags,
    careerPathId: item.careerPathId || undefined,
    roleId: item.roleId || undefined,
    thumbnail: item.thumbnail || undefined,
    description: item.description || undefined,
    savedAt: item.savedAt.toISOString(),
  };
}

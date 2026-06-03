/**
 * Saved Careers Service
 *
 * CRUD for careers a youth has bookmarked (the ♥ on a career card).
 * One row per profile+career, keyed by the `SavedCareer` unique constraint
 * on [profileId, careerId]. Mirrors `saved-items-service.ts`.
 *
 * Replaces the former `useCuriositySaves` localStorage store so the
 * dashboard's "Saved Careers" survives a device/browser change.
 */

import { prisma } from '@/lib/prisma';

// ============================================
// TYPES
// ============================================

export interface SaveCareerInput {
  profileId: string;
  careerId: string;
  careerTitle: string;
  careerEmoji?: string | null;
  note?: string | null;
}

/** Wire/UI shape — matches the legacy `SavedCuriosity` interface. */
export interface SavedCareerData {
  careerId: string;
  careerTitle: string;
  careerEmoji: string;
  savedAt: string;
  note?: string;
}

// ============================================
// MAPPER
// ============================================

export function formatSavedCareer(row: {
  careerId: string;
  careerTitle: string;
  careerEmoji: string | null;
  savedAt: Date;
  note: string | null;
}): SavedCareerData {
  return {
    careerId: row.careerId,
    careerTitle: row.careerTitle,
    careerEmoji: row.careerEmoji ?? '',
    savedAt: row.savedAt.toISOString(),
    ...(row.note ? { note: row.note } : {}),
  };
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Save (or update) a bookmarked career. Idempotent via the
 * [profileId, careerId] unique constraint.
 */
export async function saveCareer(input: SaveCareerInput): Promise<SavedCareerData> {
  const row = await prisma.savedCareer.upsert({
    where: {
      profileId_careerId: {
        profileId: input.profileId,
        careerId: input.careerId,
      },
    },
    create: {
      profileId: input.profileId,
      careerId: input.careerId,
      careerTitle: input.careerTitle,
      careerEmoji: input.careerEmoji ?? null,
      note: input.note ?? null,
    },
    update: {
      careerTitle: input.careerTitle,
      careerEmoji: input.careerEmoji ?? null,
      ...(input.note !== undefined ? { note: input.note } : {}),
    },
  });

  return formatSavedCareer(row);
}

/**
 * Remove a bookmarked career. Hard delete (no soft-delete needed — a
 * re-save just re-creates the row). Returns true if a row was removed.
 */
export async function unsaveCareer(profileId: string, careerId: string): Promise<boolean> {
  const result = await prisma.savedCareer.deleteMany({
    where: { profileId, careerId },
  });
  return result.count > 0;
}

/**
 * List a profile's saved careers, newest first.
 */
export async function getSavedCareers(profileId: string): Promise<SavedCareerData[]> {
  const rows = await prisma.savedCareer.findMany({
    where: { profileId },
    orderBy: { savedAt: 'desc' },
  });
  return rows.map(formatSavedCareer);
}

/**
 * Bulk-save (backfill from localStorage). Idempotent — existing
 * [profileId, careerId] rows are skipped, not overwritten, so a backfill
 * never clobbers a fresher server note. Returns the created count.
 */
export async function bulkSaveCareers(
  profileId: string,
  items: Array<Omit<SaveCareerInput, 'profileId'>>
): Promise<number> {
  if (items.length === 0) return 0;

  const result = await prisma.savedCareer.createMany({
    data: items.map((it) => ({
      profileId,
      careerId: it.careerId,
      careerTitle: it.careerTitle,
      careerEmoji: it.careerEmoji ?? null,
      note: it.note ?? null,
    })),
    skipDuplicates: true,
  });

  return result.count;
}

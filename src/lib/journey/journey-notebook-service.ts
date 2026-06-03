/**
 * Journey Notebook Service
 *
 * Server persistence for the "My Journey" reflection notebook — the free-text
 * Discover / Understand / Clarity reflections a youth writes per career in the
 * JourneyReflectionsTray. One row per profile+careerSlug (upserted), mirroring
 * the `endeavrly-journey-reflections` localStorage record so reflections
 * survive a device/browser change. Mirrors `saved-careers-service.ts`.
 */

import { prisma } from '@/lib/prisma';

// ============================================
// TYPES
// ============================================

export interface NotebookLenses {
  discover?: string | null;
  understand?: string | null;
  clarity?: string | null;
}

export interface UpsertNotebookInput extends NotebookLenses {
  profileId: string;
  careerSlug: string;
}

/** Wire/UI shape — matches the localStorage ReflectionRecord. */
export interface JourneyNotebookData {
  careerSlug: string;
  discover: string;
  understand: string;
  clarity: string;
  updatedAt: string;
}

// ============================================
// MAPPER
// ============================================

export function formatNotebook(row: {
  careerSlug: string;
  discover: string | null;
  understand: string | null;
  clarity: string | null;
  updatedAt: Date;
}): JourneyNotebookData {
  return {
    careerSlug: row.careerSlug,
    discover: row.discover ?? '',
    understand: row.understand ?? '',
    clarity: row.clarity ?? '',
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Only include lens fields that were actually provided, so a partial write
 *  (e.g. only `discover`) doesn't blank the others. */
function lensWriteData(input: NotebookLenses) {
  const data: NotebookLenses = {};
  if (input.discover !== undefined) data.discover = input.discover ?? null;
  if (input.understand !== undefined) data.understand = input.understand ?? null;
  if (input.clarity !== undefined) data.clarity = input.clarity ?? null;
  return data;
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Create or update a career's notebook. Idempotent via the
 * [profileId, careerSlug] unique constraint.
 */
export async function upsertNotebook(input: UpsertNotebookInput): Promise<JourneyNotebookData> {
  const lenses = lensWriteData(input);
  const row = await prisma.journeyNotebook.upsert({
    where: {
      profileId_careerSlug: {
        profileId: input.profileId,
        careerSlug: input.careerSlug,
      },
    },
    create: {
      profileId: input.profileId,
      careerSlug: input.careerSlug,
      discover: lenses.discover ?? null,
      understand: lenses.understand ?? null,
      clarity: lenses.clarity ?? null,
    },
    update: lenses,
  });
  return formatNotebook(row);
}

/**
 * Get one career's notebook, or null if none.
 */
export async function getNotebook(
  profileId: string,
  careerSlug: string
): Promise<JourneyNotebookData | null> {
  const row = await prisma.journeyNotebook.findUnique({
    where: { profileId_careerSlug: { profileId, careerSlug } },
  });
  return row ? formatNotebook(row) : null;
}

/**
 * Get every notebook for a profile, newest first (dashboard + library read).
 */
export async function getAllNotebooks(profileId: string): Promise<JourneyNotebookData[]> {
  const rows = await prisma.journeyNotebook.findMany({
    where: { profileId },
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map(formatNotebook);
}

/**
 * Bulk upsert (backfill from localStorage). Idempotent — re-running it is
 * safe; existing rows are updated, missing ones created. Returns the count
 * processed.
 */
export async function bulkUpsertNotebooks(
  profileId: string,
  items: Array<{ careerSlug: string } & NotebookLenses>
): Promise<number> {
  let count = 0;
  for (const item of items) {
    if (!item.careerSlug) continue;
    await upsertNotebook({ profileId, ...item });
    count++;
  }
  return count;
}

/**
 * Journey Recovery Service
 *
 * Soft-delete, restore, purge, export, import, and snapshot logic
 * for journey data (saved items, notes, trait observations).
 */

import { prisma } from '@/lib/prisma';
import { AuditAction, type SavedItemType } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { logAuditAction } from '@/lib/safety';

// ============================================
// CONSTANTS
// ============================================

const RETENTION_DAYS = 30;
const MAX_SNAPSHOTS_PER_USER = 10;

export const EXPORT_SCHEMA_VERSION = '1.0';

// ============================================
// TYPES
// ============================================

export type RecoverableTable = 'savedItem' | 'journeyNote' | 'traitObservation';

export interface JourneyExportEnvelope {
  schemaVersion: string;
  exportedAt: string;
  data: {
    savedItems: Array<Record<string, unknown>>;
    notes: Array<Record<string, unknown>>;
    traits: Array<Record<string, unknown>>;
    timelineEvents: Array<Record<string, unknown>>;
  };
}

export interface ImportResult {
  imported: { savedItems: number; notes: number; traits: number };
  skipped: { savedItems: number; notes: number; traits: number };
}

export interface DeletedItems {
  savedItems: Array<Record<string, unknown>>;
  notes: Array<Record<string, unknown>>;
  traits: Array<Record<string, unknown>>;
}

// ============================================
// SOFT DELETE & RESTORE
// ============================================

export async function softDeleteSavedItem(itemId: string, profileId: string): Promise<boolean> {
  const result = await prisma.savedItem.updateMany({
    where: { id: itemId, profileId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  return result.count > 0;
}

export async function softDeleteNote(noteId: string, profileId: string): Promise<boolean> {
  const result = await prisma.journeyNote.updateMany({
    where: { id: noteId, profileId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  return result.count > 0;
}

export async function softDeleteTrait(traitId: string, profileId: string): Promise<boolean> {
  const result = await prisma.traitObservation.updateMany({
    where: { id: traitId, profileId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  return result.count > 0;
}

export async function restoreItem(
  table: RecoverableTable,
  itemId: string,
  profileId: string
): Promise<boolean> {
  switch (table) {
    case 'savedItem': {
      const r = await prisma.savedItem.updateMany({
        where: { id: itemId, profileId, deletedAt: { not: null } },
        data: { deletedAt: null },
      });
      return r.count > 0;
    }
    case 'journeyNote': {
      const r = await prisma.journeyNote.updateMany({
        where: { id: itemId, profileId, deletedAt: { not: null } },
        data: { deletedAt: null },
      });
      return r.count > 0;
    }
    case 'traitObservation': {
      const r = await prisma.traitObservation.updateMany({
        where: { id: itemId, profileId, deletedAt: { not: null } },
        data: { deletedAt: null },
      });
      return r.count > 0;
    }
  }
}

export async function permanentlyDelete(
  table: RecoverableTable,
  itemId: string,
  profileId: string
): Promise<boolean> {
  switch (table) {
    case 'savedItem': {
      const r = await prisma.savedItem.deleteMany({
        where: { id: itemId, profileId, deletedAt: { not: null } },
      });
      return r.count > 0;
    }
    case 'journeyNote': {
      const r = await prisma.journeyNote.deleteMany({
        where: { id: itemId, profileId, deletedAt: { not: null } },
      });
      return r.count > 0;
    }
    case 'traitObservation': {
      const r = await prisma.traitObservation.deleteMany({
        where: { id: itemId, profileId, deletedAt: { not: null } },
      });
      return r.count > 0;
    }
  }
}

/**
 * Get all soft-deleted items within the retention window.
 */
export async function getDeletedItems(
  profileId: string,
  filterType?: RecoverableTable
): Promise<DeletedItems> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const deletedWhere = { profileId, deletedAt: { not: null, gte: cutoff } };

  const [savedItems, notes, traits] = await Promise.all([
    !filterType || filterType === 'savedItem'
      ? prisma.savedItem.findMany({
          where: deletedWhere,
          orderBy: { deletedAt: 'desc' },
        })
      : Promise.resolve([]),
    !filterType || filterType === 'journeyNote'
      ? prisma.journeyNote.findMany({
          where: deletedWhere,
          orderBy: { deletedAt: 'desc' },
        })
      : Promise.resolve([]),
    !filterType || filterType === 'traitObservation'
      ? prisma.traitObservation.findMany({
          where: deletedWhere,
          orderBy: { deletedAt: 'desc' },
        })
      : Promise.resolve([]),
  ]);

  return {
    savedItems: savedItems as unknown as Array<Record<string, unknown>>,
    notes: notes as unknown as Array<Record<string, unknown>>,
    traits: traits as unknown as Array<Record<string, unknown>>,
  };
}

/**
 * Hard-delete all items past the retention window (for scheduled cleanup).
 */
export async function purgeExpired(): Promise<{ savedItems: number; notes: number; traits: number }> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const expiredWhere = { deletedAt: { not: null, lt: cutoff } };

  const [s, n, t] = await Promise.all([
    prisma.savedItem.deleteMany({ where: expiredWhere }),
    prisma.journeyNote.deleteMany({ where: expiredWhere }),
    prisma.traitObservation.deleteMany({ where: expiredWhere }),
  ]);

  return { savedItems: s.count, notes: n.count, traits: t.count };
}

// ============================================
// EXPORT
// ============================================

export async function exportJourney(profileId: string): Promise<JourneyExportEnvelope> {
  const profile = await prisma.youthProfile.findUnique({
    where: { id: profileId },
    select: { userId: true },
  });

  const [savedItems, notes, traits, timelineEvents] = await Promise.all([
    prisma.savedItem.findMany({ where: { profileId, deletedAt: null } }),
    prisma.journeyNote.findMany({ where: { profileId, deletedAt: null } }),
    prisma.traitObservation.findMany({ where: { profileId, deletedAt: null } }),
    profile
      ? prisma.timelineEvent.findMany({
          where: { userId: profile.userId },
          orderBy: { createdAt: 'asc' },
        })
      : Promise.resolve([]),
  ]);

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      savedItems: savedItems as unknown as Array<Record<string, unknown>>,
      notes: notes as unknown as Array<Record<string, unknown>>,
      traits: traits as unknown as Array<Record<string, unknown>>,
      timelineEvents: timelineEvents as unknown as Array<Record<string, unknown>>,
    },
  };
}

// ============================================
// IMPORT
// ============================================

export async function importJourney(
  profileId: string,
  userId: string,
  payload: JourneyExportEnvelope
): Promise<ImportResult> {
  // 1. Auto-create a pre-import snapshot
  await createSnapshot(profileId, 'pre_import', 'Auto-snapshot before import');

  const result: ImportResult = {
    imported: { savedItems: 0, notes: 0, traits: 0 },
    skipped: { savedItems: 0, notes: 0, traits: 0 },
  };

  // 2. Import saved items (dedupe by profileId + url)
  for (const item of payload.data.savedItems) {
    const url = item.url as string;
    if (!url) { result.skipped.savedItems++; continue; }

    const existing = await prisma.savedItem.findFirst({
      where: { profileId, url, deletedAt: null },
    });

    if (existing) {
      result.skipped.savedItems++;
    } else {
      await prisma.savedItem.create({
        data: {
          profileId,
          type: (item.type as SavedItemType) || 'ARTICLE',
          title: (item.title as string) || 'Imported item',
          url,
          source: (item.source as string) || null,
          tags: Array.isArray(item.tags) ? item.tags as string[] : [],
          careerPathId: (item.careerPathId as string) || null,
          roleId: (item.roleId as string) || null,
          thumbnail: (item.thumbnail as string) || null,
          description: (item.description as string) || null,
        },
      });
      result.imported.savedItems++;
    }
  }

  // 3. Import notes (dedupe by profileId + content + createdAt)
  for (const note of payload.data.notes) {
    const content = note.content as string;
    if (!content) { result.skipped.notes++; continue; }

    const createdAt = note.createdAt ? new Date(note.createdAt as string) : null;
    const existing = createdAt
      ? await prisma.journeyNote.findFirst({
          where: { profileId, content, createdAt, deletedAt: null },
        })
      : null;

    if (existing) {
      result.skipped.notes++;
    } else {
      await prisma.journeyNote.create({
        data: {
          profileId,
          title: (note.title as string) || null,
          content,
          color: (note.color as string) || null,
          pinned: (note.pinned as boolean) || false,
          groupName: (note.groupName as string) || null,
        },
      });
      result.imported.notes++;
    }
  }

  // 4. Import traits (dedupe by profileId + traitId — current observation wins)
  for (const trait of payload.data.traits) {
    const traitId = trait.traitId as string;
    if (!traitId) { result.skipped.traits++; continue; }

    const existing = await prisma.traitObservation.findFirst({
      where: { profileId, traitId, deletedAt: null },
    });

    if (existing) {
      result.skipped.traits++;
    } else {
      await prisma.traitObservation.create({
        data: {
          profileId,
          traitId,
          observation: (trait.observation as string) || 'unsure',
          contextType: (trait.contextType as string) || null,
          contextId: (trait.contextId as string) || null,
        },
      });
      result.imported.traits++;
    }
  }

  // 5. Log audit
  await logAuditAction({
    userId,
    action: AuditAction.JOURNEY_DATA_IMPORTED,
    targetType: 'YouthProfile',
    targetId: profileId,
    metadata: {
      importedSavedItems: result.imported.savedItems,
      importedNotes: result.imported.notes,
      importedTraits: result.imported.traits,
    },
  });

  return result;
}

// ============================================
// SNAPSHOTS
// ============================================

export async function createSnapshot(
  profileId: string,
  trigger: string,
  label?: string
): Promise<{ id: string }> {
  const data = await exportJourney(profileId);

  const snapshot = await prisma.journeySnapshot.create({
    data: {
      profileId,
      trigger,
      label: label || null,
      data: data as unknown as Prisma.InputJsonValue,
    },
    select: { id: true },
  });

  // Enforce max snapshots per user (keep most recent)
  const allSnapshots = await prisma.journeySnapshot.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });

  if (allSnapshots.length > MAX_SNAPSHOTS_PER_USER) {
    const idsToDelete = allSnapshots.slice(MAX_SNAPSHOTS_PER_USER).map((s) => s.id);
    await prisma.journeySnapshot.deleteMany({
      where: { id: { in: idsToDelete } },
    });
  }

  return snapshot;
}

export async function listSnapshots(
  profileId: string
): Promise<Array<{ id: string; trigger: string; label: string | null; createdAt: Date }>> {
  return prisma.journeySnapshot.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
    take: MAX_SNAPSHOTS_PER_USER,
    select: {
      id: true,
      trigger: true,
      label: true,
      createdAt: true,
    },
  });
}

export async function restoreSnapshot(
  snapshotId: string,
  profileId: string,
  userId: string
): Promise<ImportResult> {
  const snapshot = await prisma.journeySnapshot.findFirst({
    where: { id: snapshotId, profileId },
  });

  if (!snapshot) {
    throw new Error('Snapshot not found');
  }

  // 1. Create a pre-restore snapshot
  await createSnapshot(profileId, 'pre_restore', 'Auto-snapshot before restore');

  // 2. Soft-delete all current items
  const now = new Date();
  await Promise.all([
    prisma.savedItem.updateMany({
      where: { profileId, deletedAt: null },
      data: { deletedAt: now },
    }),
    prisma.journeyNote.updateMany({
      where: { profileId, deletedAt: null },
      data: { deletedAt: now },
    }),
    prisma.traitObservation.updateMany({
      where: { profileId, deletedAt: null },
      data: { deletedAt: now },
    }),
  ]);

  // 3. Import snapshot data
  const payload = snapshot.data as unknown as JourneyExportEnvelope;
  return importJourney(profileId, userId, payload);
}

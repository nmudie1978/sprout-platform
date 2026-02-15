/**
 * Journey Recovery Service
 *
 * Soft-delete, restore, purge, export, import, and snapshot logic
 * for journey data (saved items, notes).
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

export const EXPORT_SCHEMA_VERSION = '1.1';

// ============================================
// TYPES
// ============================================

export type RecoverableTable = 'savedItem' | 'journeyNote';

export interface JourneyMachineState {
  journeyState: string;
  journeyCompletedSteps: string[];
  journeySkippedSteps: Record<string, string> | null;
  journeySummary: Record<string, unknown> | null;
}

export interface SnapshotClientState {
  overlayAnnotations?: Record<string, unknown>;
  timelineStyle?: string;
  learningGoals?: unknown[];
}

export interface JourneyExportEnvelope {
  schemaVersion: string;
  exportedAt: string;
  data: {
    savedItems: Array<Record<string, unknown>>;
    notes: Array<Record<string, unknown>>;
    timelineEvents: Array<Record<string, unknown>>;
    journeyMachine?: JourneyMachineState;
    clientState?: SnapshotClientState;
  };
}

export interface ImportResult {
  imported: { savedItems: number; notes: number };
  skipped: { savedItems: number; notes: number };
}

export interface DeletedItems {
  savedItems: Array<Record<string, unknown>>;
  notes: Array<Record<string, unknown>>;
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

  const [savedItems, notes] = await Promise.all([
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
  ]);

  return {
    savedItems: savedItems as unknown as Array<Record<string, unknown>>,
    notes: notes as unknown as Array<Record<string, unknown>>,
  };
}

/**
 * Hard-delete all items past the retention window (for scheduled cleanup).
 */
export async function purgeExpired(): Promise<{ savedItems: number; notes: number }> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const expiredWhere = { deletedAt: { not: null, lt: cutoff } };

  const [s, n] = await Promise.all([
    prisma.savedItem.deleteMany({ where: expiredWhere }),
    prisma.journeyNote.deleteMany({ where: expiredWhere }),
  ]);

  return { savedItems: s.count, notes: n.count };
}

// ============================================
// EXPORT
// ============================================

export async function exportJourney(profileId: string): Promise<JourneyExportEnvelope> {
  const profile = await prisma.youthProfile.findUnique({
    where: { id: profileId },
    select: {
      userId: true,
      journeyState: true,
      journeyCompletedSteps: true,
      journeySkippedSteps: true,
      journeySummary: true,
    },
  });

  const [savedItems, notes, timelineEvents] = await Promise.all([
    prisma.savedItem.findMany({ where: { profileId, deletedAt: null } }),
    prisma.journeyNote.findMany({ where: { profileId, deletedAt: null } }),
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
      timelineEvents: timelineEvents as unknown as Array<Record<string, unknown>>,
      journeyMachine: profile
        ? {
            journeyState: profile.journeyState,
            journeyCompletedSteps: profile.journeyCompletedSteps,
            journeySkippedSteps: profile.journeySkippedSteps as Record<string, string> | null,
            journeySummary: profile.journeySummary as Record<string, unknown> | null,
          }
        : undefined,
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
    imported: { savedItems: 0, notes: 0 },
    skipped: { savedItems: 0, notes: 0 },
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

  // 4. Log audit
  await logAuditAction({
    userId,
    action: AuditAction.JOURNEY_DATA_IMPORTED,
    targetType: 'YouthProfile',
    targetId: profileId,
    metadata: {
      importedSavedItems: result.imported.savedItems,
      importedNotes: result.imported.notes,
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

export async function createSnapshotWithClientState(
  profileId: string,
  trigger: string,
  label?: string,
  clientState?: SnapshotClientState
): Promise<{ id: string }> {
  const envelope = await exportJourney(profileId);

  if (clientState) {
    envelope.data.clientState = clientState;
  }

  const snapshot = await prisma.journeySnapshot.create({
    data: {
      profileId,
      trigger,
      label: label ? label.slice(0, 200) : null,
      data: envelope as unknown as Prisma.InputJsonValue,
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

export async function renameSnapshot(
  snapshotId: string,
  profileId: string,
  newLabel: string
): Promise<boolean> {
  const result = await prisma.journeySnapshot.updateMany({
    where: { id: snapshotId, profileId },
    data: { label: newLabel.trim().slice(0, 200) },
  });
  return result.count > 0;
}

export async function deleteSnapshot(
  snapshotId: string,
  profileId: string
): Promise<boolean> {
  const result = await prisma.journeySnapshot.deleteMany({
    where: { id: snapshotId, profileId },
  });
  return result.count > 0;
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

export interface RestoreResult extends ImportResult {
  clientState?: SnapshotClientState;
}

export async function restoreSnapshot(
  snapshotId: string,
  profileId: string,
  userId: string
): Promise<RestoreResult> {
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
  ]);

  // 3. Import snapshot data
  const payload = snapshot.data as unknown as JourneyExportEnvelope;
  const importResult = await importJourney(profileId, userId, payload);

  // 4. Restore journey state machine fields if present
  const machine = payload.data?.journeyMachine;
  if (machine) {
    await prisma.youthProfile.update({
      where: { id: profileId },
      data: {
        journeyState: machine.journeyState,
        journeyCompletedSteps: machine.journeyCompletedSteps,
        journeySkippedSteps: machine.journeySkippedSteps as Prisma.InputJsonValue ?? undefined,
        journeySummary: machine.journeySummary as Prisma.InputJsonValue ?? undefined,
        journeyLastUpdated: new Date(),
      },
    });
  }

  return {
    ...importResult,
    clientState: payload.data?.clientState,
  };
}

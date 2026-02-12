import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditAction } from '@prisma/client';
import { logAuditAction } from '@/lib/safety';
import {
  getDeletedItems,
  restoreItem,
  permanentlyDelete,
  type RecoverableTable,
} from '@/lib/journey/recovery-service';

const VALID_TABLES: RecoverableTable[] = ['savedItem', 'journeyNote', 'traitObservation'];

function isValidTable(t: string): t is RecoverableTable {
  return VALID_TABLES.includes(t as RecoverableTable);
}

/**
 * GET /api/journey/deleted
 * Returns soft-deleted items within the 30-day retention window.
 * Optional query param: ?type=savedItem|journeyNote|traitObservation
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type');
    const filterType = typeParam && isValidTable(typeParam) ? typeParam : undefined;

    const deleted = await getDeletedItems(profile.id, filterType);

    return NextResponse.json(deleted);
  } catch (error) {
    console.error('Error fetching deleted items:', error);
    return NextResponse.json({ error: 'Failed to fetch deleted items' }, { status: 500 });
  }
}

/**
 * POST /api/journey/deleted
 * Restore a soft-deleted item.
 * Body: { table: "savedItem" | "journeyNote" | "traitObservation", itemId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { table, itemId } = body;

    if (!table || !isValidTable(table)) {
      return NextResponse.json({ error: 'Invalid table. Must be savedItem, journeyNote, or traitObservation' }, { status: 400 });
    }

    if (!itemId || typeof itemId !== 'string') {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
    }

    const restored = await restoreItem(table, itemId, profile.id);

    if (!restored) {
      return NextResponse.json({ error: 'Item not found or not deleted' }, { status: 404 });
    }

    await logAuditAction({
      userId: session.user.id,
      action: AuditAction.JOURNEY_ITEM_RESTORED,
      targetType: table,
      targetId: itemId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error restoring item:', error);
    return NextResponse.json({ error: 'Failed to restore item' }, { status: 500 });
  }
}

/**
 * DELETE /api/journey/deleted
 * Permanently delete a soft-deleted item.
 * Query: ?table=savedItem&id=xxx
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const table = searchParams.get('table');
    const itemId = searchParams.get('id');

    if (!table || !isValidTable(table)) {
      return NextResponse.json({ error: 'Invalid table parameter' }, { status: 400 });
    }

    if (!itemId) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const deleted = await permanentlyDelete(table, itemId, profile.id);

    if (!deleted) {
      return NextResponse.json({ error: 'Item not found or not in deleted state' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error permanently deleting item:', error);
    return NextResponse.json({ error: 'Failed to permanently delete item' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createSnapshotWithClientState,
  listSnapshots,
  restoreSnapshot,
  renameSnapshot,
  deleteSnapshot,
} from '@/lib/journey/recovery-service';

/**
 * GET /api/journey/snapshot
 * List snapshots (max 10, most recent first).
 */
export async function GET() {
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

    const snapshots = await listSnapshots(profile.id);

    return NextResponse.json({ snapshots });
  } catch (error) {
    console.error('Error listing snapshots:', error);
    return NextResponse.json({ error: 'Failed to list snapshots' }, { status: 500 });
  }
}

/**
 * POST /api/journey/snapshot
 * Create a manual snapshot.
 * Body: { label?: string, clientState?: { overlayAnnotations, timelineStyle, learningGoals } }
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

    const body = await req.json().catch(() => ({}));
    const label = typeof body.label === 'string' ? body.label.slice(0, 200) : undefined;
    const clientState = body.clientState && typeof body.clientState === 'object'
      ? body.clientState
      : undefined;

    const snapshot = await createSnapshotWithClientState(
      profile.id,
      'manual',
      label,
      clientState
    );

    return NextResponse.json({ success: true, snapshotId: snapshot.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating snapshot:', error);
    return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 });
  }
}

/**
 * PUT /api/journey/snapshot
 * Restore from a snapshot.
 * Body: { snapshotId: string }
 */
export async function PUT(req: NextRequest) {
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
    const { snapshotId } = body;

    if (!snapshotId || typeof snapshotId !== 'string') {
      return NextResponse.json({ error: 'Missing snapshotId' }, { status: 400 });
    }

    const result = await restoreSnapshot(snapshotId, profile.id, session.user.id);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error restoring snapshot:', error);
    return NextResponse.json({ error: 'Failed to restore snapshot' }, { status: 500 });
  }
}

/**
 * PATCH /api/journey/snapshot
 * Rename a snapshot.
 * Body: { snapshotId: string, label: string }
 */
export async function PATCH(req: NextRequest) {
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
    const { snapshotId, label } = body;

    if (!snapshotId || typeof snapshotId !== 'string') {
      return NextResponse.json({ error: 'Missing snapshotId' }, { status: 400 });
    }
    if (typeof label !== 'string' || !label.trim()) {
      return NextResponse.json({ error: 'Missing label' }, { status: 400 });
    }

    const updated = await renameSnapshot(snapshotId, profile.id, label);

    if (!updated) {
      return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error renaming snapshot:', error);
    return NextResponse.json({ error: 'Failed to rename snapshot' }, { status: 500 });
  }
}

/**
 * DELETE /api/journey/snapshot
 * Delete a snapshot.
 * Query: ?id=<snapshotId>
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

    const snapshotId = req.nextUrl.searchParams.get('id');

    if (!snapshotId) {
      return NextResponse.json({ error: 'Missing snapshot id' }, { status: 400 });
    }

    const deleted = await deleteSnapshot(snapshotId, profile.id);

    if (!deleted) {
      return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting snapshot:', error);
    return NextResponse.json({ error: 'Failed to delete snapshot' }, { status: 500 });
  }
}

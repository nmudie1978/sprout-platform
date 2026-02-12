import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createSnapshot,
  listSnapshots,
  restoreSnapshot,
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
 * Body: { label?: string }
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

    const snapshot = await createSnapshot(profile.id, 'manual', label);

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

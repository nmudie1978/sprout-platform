export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  saveCareer,
  unsaveCareer,
  getSavedCareers,
  bulkSaveCareers,
} from '@/lib/journey';

/**
 * Resolve (or lazily create) the YouthProfile id for the current session.
 * Returns null if unauthenticated / not a youth.
 */
async function resolveProfileId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'YOUTH') return null;

  let profile = await prisma.youthProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    profile = await prisma.youthProfile.create({
      data: {
        userId: session.user.id,
        displayName: session.user.email?.split('@')[0] || 'User',
      },
      select: { id: true },
    });
  }

  return profile.id;
}

/**
 * GET /api/saved-careers — list the current user's saved careers.
 */
export async function GET() {
  try {
    const profileId = await resolveProfileId();
    if (!profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const careers = await getSavedCareers(profileId);
    return NextResponse.json({ success: true, careers });
  } catch (error) {
    console.error('Failed to fetch saved careers:', error);
    return NextResponse.json({ error: 'Failed to fetch saved careers' }, { status: 500 });
  }
}

/**
 * POST /api/saved-careers — save (bookmark) a career.
 * Body: { careerId, careerTitle, careerEmoji?, note? }
 */
export async function POST(req: NextRequest) {
  try {
    const profileId = await resolveProfileId();
    if (!profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { careerId, careerTitle, careerEmoji, note } = body;

    if (!careerId || !careerTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: careerId, careerTitle' },
        { status: 400 }
      );
    }

    const career = await saveCareer({ profileId, careerId, careerTitle, careerEmoji, note });
    return NextResponse.json({ success: true, career });
  } catch (error) {
    console.error('Failed to save career:', error);
    return NextResponse.json({ error: 'Failed to save career' }, { status: 500 });
  }
}

/**
 * DELETE /api/saved-careers?careerId=... — remove a saved career.
 */
export async function DELETE(req: NextRequest) {
  try {
    const profileId = await resolveProfileId();
    if (!profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const careerId = new URL(req.url).searchParams.get('careerId');
    if (!careerId) {
      return NextResponse.json({ error: 'Missing careerId' }, { status: 400 });
    }

    const removed = await unsaveCareer(profileId, careerId);
    return NextResponse.json({ success: true, removed });
  } catch (error) {
    console.error('Failed to remove saved career:', error);
    return NextResponse.json({ error: 'Failed to remove saved career' }, { status: 500 });
  }
}

/**
 * PUT /api/saved-careers — bulk backfill from localStorage.
 * Body: { items: [{ careerId, careerTitle, careerEmoji?, note? }, ...] }
 * Idempotent (skipDuplicates) — safe to call once on first authed load.
 */
export async function PUT(req: NextRequest) {
  try {
    const profileId = await resolveProfileId();
    if (!profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];

    const valid = items.filter(
      (it: unknown): it is { careerId: string; careerTitle: string } =>
        !!it &&
        typeof (it as { careerId?: unknown }).careerId === 'string' &&
        typeof (it as { careerTitle?: unknown }).careerTitle === 'string'
    );

    const created = await bulkSaveCareers(profileId, valid);
    const careers = await getSavedCareers(profileId);
    return NextResponse.json({ success: true, created, careers });
  } catch (error) {
    console.error('Failed to backfill saved careers:', error);
    return NextResponse.json({ error: 'Failed to backfill saved careers' }, { status: 500 });
  }
}

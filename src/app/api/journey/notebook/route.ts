export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  upsertNotebook,
  getNotebook,
  getAllNotebooks,
  bulkUpsertNotebooks,
} from '@/lib/journey';

/** Resolve (or lazily create) the YouthProfile id for the session. */
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
 * GET /api/journey/notebook            → { notebooks: [...] } (all)
 * GET /api/journey/notebook?careerSlug=x → { notebook: {...} | null }
 */
export async function GET(req: NextRequest) {
  try {
    const profileId = await resolveProfileId();
    if (!profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const careerSlug = new URL(req.url).searchParams.get('careerSlug');
    if (careerSlug) {
      const notebook = await getNotebook(profileId, careerSlug);
      return NextResponse.json({ success: true, notebook });
    }

    const notebooks = await getAllNotebooks(profileId);
    return NextResponse.json({ success: true, notebooks });
  } catch (error) {
    console.error('Failed to fetch journey notebook:', error);
    return NextResponse.json({ error: 'Failed to fetch journey notebook' }, { status: 500 });
  }
}

/**
 * POST /api/journey/notebook — upsert one career's notebook.
 * Body: { careerSlug, discover?, understand?, clarity? }
 */
export async function POST(req: NextRequest) {
  try {
    const profileId = await resolveProfileId();
    if (!profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const careerSlug = typeof body?.careerSlug === 'string' ? body.careerSlug.trim() : '';
    if (!careerSlug) {
      return NextResponse.json({ error: 'Missing careerSlug' }, { status: 400 });
    }

    const notebook = await upsertNotebook({
      profileId,
      careerSlug,
      ...(typeof body.discover === 'string' ? { discover: body.discover } : {}),
      ...(typeof body.understand === 'string' ? { understand: body.understand } : {}),
      ...(typeof body.clarity === 'string' ? { clarity: body.clarity } : {}),
    });

    return NextResponse.json({ success: true, notebook });
  } catch (error) {
    console.error('Failed to save journey notebook:', error);
    return NextResponse.json({ error: 'Failed to save journey notebook' }, { status: 500 });
  }
}

/**
 * PUT /api/journey/notebook — bulk backfill from localStorage.
 * Body: { items: [{ careerSlug, discover?, understand?, clarity? }, ...] }
 */
export async function PUT(req: NextRequest) {
  try {
    const profileId = await resolveProfileId();
    if (!profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const rawItems = Array.isArray(body?.items) ? body.items : [];
    const items = rawItems
      .filter(
        (it: unknown): it is { careerSlug: string } =>
          !!it && typeof (it as { careerSlug?: unknown }).careerSlug === 'string'
      )
      .map((it: Record<string, unknown>) => ({
        careerSlug: (it.careerSlug as string).trim(),
        ...(typeof it.discover === 'string' ? { discover: it.discover } : {}),
        ...(typeof it.understand === 'string' ? { understand: it.understand } : {}),
        ...(typeof it.clarity === 'string' ? { clarity: it.clarity } : {}),
      }))
      .filter((it: { careerSlug: string }) => it.careerSlug.length > 0);

    const count = await bulkUpsertNotebooks(profileId, items);
    const notebooks = await getAllNotebooks(profileId);
    return NextResponse.json({ success: true, count, notebooks });
  } catch (error) {
    console.error('Failed to backfill journey notebook:', error);
    return NextResponse.json({ error: 'Failed to backfill journey notebook' }, { status: 500 });
  }
}

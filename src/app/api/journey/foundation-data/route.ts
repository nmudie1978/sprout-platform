export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/journey/foundation-data
 *
 * Load the user's foundation card data (status, notes, micro-actions).
 * Stored at the profile level so it persists across goal changes.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { foundationCardData: true },
    });

    return NextResponse.json({ foundationCardData: profile?.foundationCardData ?? null });
  } catch (error) {
    console.error('Failed to load foundation data:', error);
    return NextResponse.json({ error: 'Failed to load foundation data' }, { status: 500 });
  }
}

/**
 * PATCH /api/journey/foundation-data
 *
 * Save/update foundation card data. Persists at profile level
 * so it survives primary goal changes.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { foundationCardData } = body;

    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        foundationCardData: foundationCardData
          ? JSON.parse(JSON.stringify(foundationCardData))
          : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save foundation data:', error);
    return NextResponse.json({ error: 'Failed to save foundation data' }, { status: 500 });
  }
}

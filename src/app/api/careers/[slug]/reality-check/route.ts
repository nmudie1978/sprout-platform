import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/careers/[slug]/reality-check - Get career reality check
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    const realityCheck = await prisma.careerRealityCheck.findUnique({
      where: { roleSlug: slug },
      select: {
        id: true,
        roleSlug: true,
        title: true,
        overview: true,
        dayToDay: true,
        misconceptions: true,
        hardParts: true,
        starterSteps: true,
        typicalPath: true,
        skillGaps: true,
        saturationNote: true,
        isActive: true,
        updatedAt: true,
      },
    });

    if (!realityCheck || !realityCheck.isActive) {
      return NextResponse.json({
        found: false,
        message: 'Reality check coming soon',
        slug,
      });
    }

    return NextResponse.json({
      found: true,
      realityCheck: {
        ...realityCheck,
        // Parse JSON fields to arrays
        dayToDay: realityCheck.dayToDay as string[],
        misconceptions: realityCheck.misconceptions as string[],
        hardParts: realityCheck.hardParts as string[],
        starterSteps: realityCheck.starterSteps as string[],
        typicalPath: realityCheck.typicalPath as string[],
        skillGaps: realityCheck.skillGaps as string[],
      },
    });
  } catch (error) {
    console.error('Failed to fetch reality check:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reality check' },
      { status: 500 }
    );
  }
}

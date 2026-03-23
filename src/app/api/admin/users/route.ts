export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/users
 *
 * Returns all users with their profiles, sorted by most recent.
 * Admin-only endpoint.
 */
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        accountStatus: true,
        authProvider: true,
        fullName: true,
        youthProfile: {
          select: {
            displayName: true,
            city: true,
            interests: true,
            skillTags: true,
            careerAspiration: true,
            primaryGoal: true,
            journeyState: true,
            journeyCompletedSteps: true,
            onboardingCompletedAt: true,
          },
        },
        employerProfile: {
          select: {
            companyName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Summary stats
    const totalUsers = await prisma.user.count();
    const youthCount = await prisma.user.count({ where: { role: 'YOUTH' } });
    const employerCount = await prisma.user.count({ where: { role: 'EMPLOYER' } });
    const last7Days = await prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    });
    const last30Days = await prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    });

    return NextResponse.json({
      users,
      stats: {
        total: totalUsers,
        youth: youthCount,
        employers: employerCount,
        last7Days,
        last30Days,
      },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

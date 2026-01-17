import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserGrowthGraph, getRecentTrustSignals } from '@/lib/growth';
import { getTrustSignalLabel, getTrustSignalDescription } from '@/lib/trust-signals';

// GET /api/growth - Get user's private growth data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only youth can access their growth data
    if (session.user.role !== 'YOUTH') {
      return NextResponse.json(
        { error: 'This feature is only available for youth workers' },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    // Get growth graph data
    const growthGraph = await getUserGrowthGraph(userId);

    if (!growthGraph) {
      return NextResponse.json({
        hasData: false,
        message: 'No growth data yet. Complete your first job to start tracking!',
      });
    }

    // Get recent trust signals with labels
    const recentSignals = await getRecentTrustSignals(userId, 10);
    const signalsWithLabels = recentSignals.map(signal => ({
      id: signal.id,
      type: signal.type,
      label: getTrustSignalLabel(signal.type),
      description: getTrustSignalDescription(signal.type),
      earnedAt: signal.createdAt,
    }));

    return NextResponse.json({
      hasData: true,
      growth: growthGraph,
      recentSignals: signalsWithLabels,
    });
  } catch (error) {
    console.error('Failed to fetch growth data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch growth data' },
      { status: 500 }
    );
  }
}

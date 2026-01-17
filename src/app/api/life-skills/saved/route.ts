import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSavedCards } from '@/lib/life-skills';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedCards = await getSavedCards(session.user.id);
    return NextResponse.json({ savedCards });
  } catch (error) {
    console.error('Failed to get saved life skill cards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

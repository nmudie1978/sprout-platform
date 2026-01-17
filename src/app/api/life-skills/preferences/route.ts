import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isLifeSkillsEnabled, setLifeSkillsPreference } from '@/lib/life-skills';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enabled = await isLifeSkillsEnabled(session.user.id);
    return NextResponse.json({ showLifeSkills: enabled });
  } catch (error) {
    console.error('Failed to get life skills preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { showLifeSkills } = body;

    if (typeof showLifeSkills !== 'boolean') {
      return NextResponse.json(
        { error: 'showLifeSkills must be a boolean' },
        { status: 400 }
      );
    }

    const success = await setLifeSkillsPreference(session.user.id, showLifeSkills);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, showLifeSkills });
  } catch (error) {
    console.error('Failed to update life skills preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

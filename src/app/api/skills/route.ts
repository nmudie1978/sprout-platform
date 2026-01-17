import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllSkills } from '@/lib/growth';

// GET /api/skills - Get all available skills
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const skills = await getAllSkills();

    // Group skills by category
    const groupedSkills: Record<string, typeof skills> = {};
    for (const skill of skills) {
      if (!groupedSkills[skill.category]) {
        groupedSkills[skill.category] = [];
      }
      groupedSkills[skill.category].push(skill);
    }

    return NextResponse.json({
      skills,
      groupedSkills,
    });
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

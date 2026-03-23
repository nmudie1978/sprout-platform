export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { EducationContext } from '@/lib/education/types';

/**
 * GET /api/journey/education-context
 * Returns the user's current education context from journeySummary.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'YOUTH') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.youthProfile.findUnique({
    where: { userId: session.user.id },
    select: { journeySummary: true },
  });

  const summary = (profile?.journeySummary as Record<string, unknown>) || {};
  const educationContext = (summary.educationContext as EducationContext) || null;

  return NextResponse.json({ educationContext });
}

/**
 * POST /api/journey/education-context
 * Saves the user's education context into journeySummary.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'YOUTH') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { stage, currentSubjects, ageBand, schoolName, yearLevel, studyProgram, expectedCompletion } = body;

  if (!stage || !Array.isArray(currentSubjects)) {
    return NextResponse.json({ error: 'stage and currentSubjects are required' }, { status: 400 });
  }

  const validStages = ['school', 'college', 'university', 'other'];
  if (!validStages.includes(stage)) {
    return NextResponse.json({ error: 'Invalid education stage' }, { status: 400 });
  }

  // Sanitise subjects — max 15, max 60 chars each
  const cleanSubjects = currentSubjects
    .filter((s: unknown): s is string => typeof s === 'string' && s.trim().length > 0)
    .map((s: string) => s.trim().slice(0, 60))
    .slice(0, 15);

  const str = (v: unknown, max: number) => typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined;

  const educationContext: EducationContext = {
    stage,
    currentSubjects: cleanSubjects,
    ageBand: str(ageBand, 20),
    schoolName: str(schoolName, 100),
    yearLevel: str(yearLevel, 30),
    studyProgram: str(studyProgram, 80),
    expectedCompletion: str(expectedCompletion, 10),
    updatedAt: new Date().toISOString(),
  };

  // Merge into existing journeySummary
  const profile = await prisma.youthProfile.findUnique({
    where: { userId: session.user.id },
    select: { journeySummary: true },
  });

  const existingSummary = (profile?.journeySummary as Record<string, unknown>) || {};
  const updatedSummary = { ...existingSummary, educationContext };

  await prisma.youthProfile.update({
    where: { userId: session.user.id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { journeySummary: updatedSummary as any },
  });

  return NextResponse.json({ success: true, educationContext });
}

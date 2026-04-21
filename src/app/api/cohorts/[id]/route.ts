/**
 * Cohort detail — aggregated stats for a single cohort.
 *
 * TEACHER-only. Returns ONLY aggregated counts. No per-student
 * reflections, no per-student Journey content, no names / emails.
 * This is the contract that makes school mode safe for under-18s:
 * a teacher can see how their class is doing without ever seeing
 * what any individual student wrote.
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const cohort = await prisma.cohort.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      name: true,
      careerFocus: true,
      createdAt: true,
      teacherId: true,
      deletedAt: true,
    },
  });

  if (!cohort || cohort.deletedAt) {
    return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
  }
  if (cohort.teacherId !== session.user.id) {
    // Don't leak existence to other teachers.
    return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
  }

  // Aggregate stats — groupBy / distinct counts only, so no per-student
  // content ever leaves the DB. We read JourneyGoalData (which has an
  // indexed string `goalId`) rather than YouthProfile.primaryGoal (JSON
  // blob that can't be grouped).
  const [studentCount, startedJourneyCount, topCareers] = await Promise.all([
    prisma.cohortMembership.count({ where: { cohortId: id } }),

    // Distinct users who have at least one JourneyGoalData row.
    // findMany + Set beats trying to express this in groupBy because
    // we don't care about goals per user, just who's started.
    prisma.journeyGoalData
      .findMany({
        where: {
          user: { cohortMemberships: { some: { cohortId: id } } },
        },
        select: { userId: true },
        distinct: ["userId"],
      })
      .then((rows) => rows.length),

    // Top 5 careers the cohort is exploring. goalId is the career slug.
    prisma.journeyGoalData.groupBy({
      by: ["goalId"],
      where: {
        user: { cohortMemberships: { some: { cohortId: id } } },
      },
      _count: { _all: true },
      orderBy: { _count: { goalId: "desc" } },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    cohort: {
      id: cohort.id,
      code: cohort.code,
      name: cohort.name,
      careerFocus: cohort.careerFocus,
      createdAt: cohort.createdAt,
    },
    stats: {
      studentCount,
      startedJourney: startedJourneyCount,
      topCareers: topCareers.map((c) => ({
        slug: c.goalId,
        count: c._count._all,
      })),
    },
  });
}

// DELETE /api/cohorts/[id] — soft-delete a cohort. Memberships stay
// on the row so audit/history is preserved; the cohort just
// disappears from the teacher's list and students are effectively
// disconnected.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const cohort = await prisma.cohort.findUnique({
    where: { id },
    select: { teacherId: true, deletedAt: true },
  });
  if (!cohort || cohort.deletedAt || cohort.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
  }

  await prisma.cohort.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

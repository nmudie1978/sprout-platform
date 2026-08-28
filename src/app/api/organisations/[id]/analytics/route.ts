/**
 * Organisation analytics — aggregate by default and by design.
 *
 * Everything here is a COUNT. No endpoint in this file can return one young
 * person's reflections, notes, goals or journey text, because it never reads
 * those tables. Institutions get to know how a programme is going; they do
 * not get to read a fifteen-year-old's diary.
 *
 * Two protections beyond that:
 *   - every figure passes the k-anonymity floor from the org's settings, so
 *     a class of three never produces a breakdown
 *   - advisors and educators see only their own slice, derived server-side
 *     from assignments and cohort membership, never from a query parameter
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { OrgMembershipStatus, OrgRole, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import { visibleParticipantMembershipIds } from "@/lib/organisations/access";
import { isStaffRole } from "@/lib/organisations/permissions";
import { withOrgAccess } from "@/lib/organisations/route-helpers";
import { canShowAggregate, redactAggregate } from "@/lib/organisations/visibility";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return withOrgAccess(id, "analytics:view_aggregate", async (context) => {
    const cohortId = new URL(request.url).searchParams.get("cohortId");

    // Which memberships is this viewer entitled to see AT ALL? Advisors are
    // scoped to their assignments, educators to their cohorts. Managers and
    // admins see the whole organisation — in aggregate.
    let scopedMembershipIds: string[] | null = null;
    if (context.role === OrgRole.ADVISOR || context.role === OrgRole.EDUCATOR) {
      const visible = await visibleParticipantMembershipIds(context);
      scopedMembershipIds = visible === null ? null : [...visible];
    }

    if (cohortId) {
      const cohortMembers = await prisma.orgCohortMembership.findMany({
        where: { cohortId, cohort: { organisationId: context.organisationId } },
        select: { membershipId: true },
      });
      const cohortIds = cohortMembers.map((c) => c.membershipId);
      scopedMembershipIds =
        scopedMembershipIds === null
          ? cohortIds
          : scopedMembershipIds.filter((mid) => cohortIds.includes(mid));
    }

    const memberships = await withDbRetry(() =>
      prisma.organisationMembership.findMany({
        where: {
          organisationId: context.organisationId,
          status: OrgMembershipStatus.ACTIVE,
          role: OrgRole.PARTICIPANT,
          ...(scopedMembershipIds !== null ? { id: { in: scopedMembershipIds } } : {}),
        },
        select: { id: true, userId: true },
      })
    );

    const userIds = memberships.map((m) => m.userId);
    const groupSize = userIds.length;

    // Below the floor, return the headcount and nothing else. A cohort of
    // four must not yield a career breakdown that names one person's choice.
    if (!canShowAggregate(groupSize, context.settings)) {
      return NextResponse.json({
        participants: groupSize,
        suppressed: true,
        minimumGroupSize: context.settings.minimumAggregateGroupSize,
        message: "Not enough participants yet to show a breakdown without identifying someone.",
      });
    }

    const [withGoal, exploringCounts, interestRows, savedRows, roadmapCount] =
      await withDbRetry(() =>
        Promise.all([
          // "Has a primary goal" — a single boolean per participant. The goal
          // itself is never read here. `DbNull` is the Json-column form of
          // "the column is SQL NULL".
          prisma.youthProfile.count({
            where: { userId: { in: userIds }, primaryGoal: { not: Prisma.DbNull } },
          }),
          // Popular careers across the group. Counts only.
          prisma.careerInterest.groupBy({
            by: ["careerId"],
            where: { userId: { in: userIds } },
            _count: { _all: true },
            orderBy: { _count: { careerId: "desc" } },
            take: 25,
          }),
          prisma.careerInterest.findMany({
            where: { userId: { in: userIds } },
            select: { userId: true },
            distinct: ["userId"],
          }),
          // Saved careers are keyed by PROFILE, not user — count distinct
          // profiles and map back through the profile's userId.
          prisma.savedCareer.findMany({
            where: { profile: { userId: { in: userIds } } },
            select: { profileId: true },
            distinct: ["profileId"],
          }),
          prisma.youthProfile.count({
            where: { userId: { in: userIds }, generatedTimeline: { not: Prisma.DbNull } },
          }),
        ])
      );

    const topCareers = redactAggregate(
      exploringCounts.map((c) => ({ careerId: c.careerId, count: c._count._all })),
      groupSize,
      context.settings
    );

    const pct = (n: number) => (groupSize > 0 ? Math.round((n / groupSize) * 100) : 0);

    return NextResponse.json({
      participants: groupSize,
      suppressed: false,
      scope: {
        role: context.role,
        // Makes it visible in the UI that an advisor's numbers are their own
        // caseload, not the whole institution.
        limitedToAssigned: scopedMembershipIds !== null,
        cohortId: cohortId ?? null,
      },
      engagement: {
        exploringCareers: interestRows.length,
        exploringPct: pct(interestRows.length),
        withPrimaryGoal: withGoal,
        withPrimaryGoalPct: pct(withGoal),
        withRoadmap: roadmapCount,
        withRoadmapPct: pct(roadmapCount),
        savingCareers: savedRows.length,
        savingCareersPct: pct(savedRows.length),
      },
      topCareers,
      privacy: {
        minimumGroupSize: context.settings.minimumAggregateGroupSize,
        individualViewsEnabled: context.settings.allowIndividualParticipantView,
        note: "Aggregated counts only. Individual reflections, notes and goals are never included.",
      },
      viewerIsStaff: isStaffRole(context.role),
    });
  });
}

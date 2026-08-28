/**
 * One cohort — edit, archive, and bulk member assignment.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { OrgAuditAction, OrgCohortStatus, OrgMembershipStatus } from "@prisma/client";

import { apiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { logOrgAudit, requestIp, userActor } from "@/lib/organisations/audit";
import { withOrgAccess, parseBody } from "@/lib/organisations/route-helpers";
import { assignCohortMembersSchema, updateCohortSchema } from "@/lib/organisations/validation";

/** Confirm a cohort id from the URL really belongs to the authorised tenant. */
async function requireCohort(organisationId: string, cohortId: string) {
  return prisma.orgCohort.findFirst({
    where: { id: cohortId, organisationId, deletedAt: null },
    select: { id: true, name: true },
  });
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; cohortId: string }> }
) {
  const { id, cohortId } = await ctx.params;

  return withOrgAccess(id, "cohorts:edit", async (context) => {
    const body = await parseBody(request, updateCohortSchema);
    if (!body.ok) return body.response;

    const cohort = await requireCohort(context.organisationId, cohortId);
    if (!cohort) return apiError("NOT_FOUND", "Cohort not found.");

    const updated = await prisma.orgCohort.update({
      where: { id: cohortId },
      data: body.data as never,
    });

    await logOrgAudit({
      action:
        body.data.status === OrgCohortStatus.ARCHIVED
          ? OrgAuditAction.COHORT_ARCHIVED
          : OrgAuditAction.COHORT_UPDATED,
      actor: userActor(context.userId, context.email),
      actorUserId: context.userId,
      organisationId: context.organisationId,
      targetType: "cohort",
      targetId: cohortId,
      summary: `Updated cohort ${updated.name}`,
      ipAddress: requestIp(request.headers),
    });

    return NextResponse.json({ cohort: updated });
  });
}

/** Bulk add or remove members. Used by the "assign class" flow. */
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; cohortId: string }> }
) {
  const { id, cohortId } = await ctx.params;

  return withOrgAccess(id, "cohorts:assign_members", async (context) => {
    const body = await parseBody(request, assignCohortMembersSchema);
    if (!body.ok) return body.response;

    const cohort = await requireCohort(context.organisationId, cohortId);
    if (!cohort) return apiError("NOT_FOUND", "Cohort not found.");

    // Every membership id must belong to THIS organisation. Filtering rather
    // than trusting the payload is what stops a crafted request pulling
    // another institution's members into this cohort.
    const valid = await prisma.organisationMembership.findMany({
      where: {
        id: { in: body.data.membershipIds },
        organisationId: context.organisationId,
        status: { not: OrgMembershipStatus.REMOVED },
      },
      select: { id: true },
    });
    const validIds = valid.map((v) => v.id);
    const rejected = body.data.membershipIds.filter((mid) => !validIds.includes(mid));

    if (body.data.action === "add") {
      await prisma.orgCohortMembership.createMany({
        data: validIds.map((membershipId) => ({ cohortId, membershipId })),
        skipDuplicates: true,
      });
    } else {
      await prisma.orgCohortMembership.deleteMany({
        where: { cohortId, membershipId: { in: validIds } },
      });
    }

    await logOrgAudit({
      action:
        body.data.action === "add"
          ? OrgAuditAction.COHORT_MEMBER_ADDED
          : OrgAuditAction.COHORT_MEMBER_REMOVED,
      actor: userActor(context.userId, context.email),
      actorUserId: context.userId,
      organisationId: context.organisationId,
      targetType: "cohort",
      targetId: cohortId,
      summary: `${body.data.action === "add" ? "Added" : "Removed"} ${validIds.length} member(s) — ${cohort.name}`,
      metadata: { count: validIds.length, rejected: rejected.length },
      ipAddress: requestIp(request.headers),
    });

    return NextResponse.json({
      ok: true,
      affected: validIds.length,
      // Reported back, not silently dropped, so a bad paste is visible.
      rejected,
    });
  });
}

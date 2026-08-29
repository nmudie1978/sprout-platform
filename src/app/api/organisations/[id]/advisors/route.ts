/**
 * Advisor ⇄ participant assignments.
 *
 * This is the relationship that scopes an advisor's caseload. Without an
 * assignment an advisor sees aggregate figures for the organisation and
 * nothing individual, however permissive the org's settings are.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { OrgAuditAction, OrgMembershipStatus, OrgRole } from "@prisma/client";

import { apiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { logOrgAudit, requestIp, userActor } from "@/lib/organisations/audit";
import { withOrgAccess, parseBody } from "@/lib/organisations/route-helpers";
import { advisorAssignmentSchema } from "@/lib/organisations/validation";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return withOrgAccess(id, "members:list", async (context) => {
    const advisorMembershipId =
      new URL(request.url).searchParams.get("advisorMembershipId") ??
      // An advisor with no explicit parameter is asking about their own
      // caseload. Anyone else must name whose caseload they mean.
      (context.role === OrgRole.ADVISOR ? context.membershipId : null);

    if (!advisorMembershipId) {
      return apiError("BAD_REQUEST", "Name an advisor.", { request });
    }

    // An advisor may only ever read their OWN caseload here.
    if (context.role === OrgRole.ADVISOR && advisorMembershipId !== context.membershipId) {
      return apiError("FORBIDDEN", "You can only see your own participants.", { request });
    }

    const assignments = await prisma.advisorAssignment.findMany({
      where: {
        organisationId: context.organisationId,
        advisorMembershipId,
        endedAt: null,
      },
      select: {
        id: true,
        assignedAt: true,
        participantMembership: {
          select: {
            id: true,
            status: true,
            dataSharingConsentAt: true,
            dataSharingConsentRevokedAt: true,
            user: {
              select: { email: true, youthProfile: { select: { displayName: true } } },
            },
          },
        },
      },
    });

    return NextResponse.json({
      assignments: assignments.map((a) => ({
        assignmentId: a.id,
        assignedAt: a.assignedAt,
        membershipId: a.participantMembership.id,
        name:
          a.participantMembership.user.youthProfile?.displayName ??
          a.participantMembership.user.email,
        status: a.participantMembership.status,
        dataSharingConsent:
          a.participantMembership.dataSharingConsentAt !== null &&
          a.participantMembership.dataSharingConsentRevokedAt === null,
      })),
    });
  });
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return withOrgAccess(id, "members:assign_advisor", async (context) => {
    const body = await parseBody(request, advisorAssignmentSchema);
    if (!body.ok) return body.response;

    const advisor = await prisma.organisationMembership.findFirst({
      where: {
        id: body.data.advisorMembershipId,
        organisationId: context.organisationId,
        role: OrgRole.ADVISOR,
        status: OrgMembershipStatus.ACTIVE,
      },
      select: { id: true },
    });
    if (!advisor) return apiError("NOT_FOUND", "That advisor isn't in this organisation.");

    // Same tenant filter as everywhere else: participants are re-derived
    // from the database, never taken on trust from the request body.
    const participants = await prisma.organisationMembership.findMany({
      where: {
        id: { in: body.data.participantMembershipIds },
        organisationId: context.organisationId,
        role: OrgRole.PARTICIPANT,
        status: { not: OrgMembershipStatus.REMOVED },
      },
      select: { id: true },
    });
    const participantIds = participants.map((p) => p.id);

    if (body.data.action === "assign") {
      await prisma.advisorAssignment.createMany({
        data: participantIds.map((participantMembershipId) => ({
          organisationId: context.organisationId,
          advisorMembershipId: advisor.id,
          participantMembershipId,
        })),
        skipDuplicates: true,
      });
    } else {
      // Soft-end rather than delete, so the record that an advisor once had
      // access to a participant survives for audit.
      await prisma.advisorAssignment.updateMany({
        where: {
          organisationId: context.organisationId,
          advisorMembershipId: advisor.id,
          participantMembershipId: { in: participantIds },
          endedAt: null,
        },
        data: { endedAt: new Date() },
      });
    }

    await logOrgAudit({
      action:
        body.data.action === "assign"
          ? OrgAuditAction.ADVISOR_ASSIGNED
          : OrgAuditAction.ADVISOR_UNASSIGNED,
      actor: userActor(context.userId, context.email),
      actorUserId: context.userId,
      organisationId: context.organisationId,
      targetType: "advisor_assignment",
      targetId: advisor.id,
      summary: `${body.data.action === "assign" ? "Assigned" : "Unassigned"} ${participantIds.length} participant(s)`,
      metadata: { count: participantIds.length },
      ipAddress: requestIp(request.headers),
    });

    return NextResponse.json({
      ok: true,
      affected: participantIds.length,
      rejected: body.data.participantMembershipIds.filter((p) => !participantIds.includes(p)),
    });
  });
}

/**
 * One membership — change role, suspend, or remove.
 *
 * Removing a member removes their MEMBERSHIP, never their account. Their
 * personal Endeavrly profile, journey, reflections and saved careers are
 * untouched and remain theirs. That distinction is the whole reason the
 * institutional layer is additive.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { OrgAuditAction, OrgMembershipStatus, OrgRole } from "@prisma/client";

import { apiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { invalidateEntitlements } from "@/lib/entitlements/service";
import { logOrgAudit, requestIp, userActor } from "@/lib/organisations/audit";
import { withOrgAccess, parseBody } from "@/lib/organisations/route-helpers";
import { updateMembershipSchema } from "@/lib/organisations/validation";

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; membershipId: string }> }
) {
  const { id, membershipId } = await ctx.params;

  return withOrgAccess(id, "members:change_role", async (context) => {
    const body = await parseBody(request, updateMembershipSchema);
    if (!body.ok) return body.response;

    // Re-read scoped to the tenant. Without this an admin at one school could
    // pass another school's membership id and edit it.
    const membership = await prisma.organisationMembership.findFirst({
      where: { id: membershipId, organisationId: context.organisationId },
      select: { id: true, userId: true, role: true, status: true },
    });
    if (!membership) return apiError("NOT_FOUND", "That member isn't in this organisation.");

    // An organisation must never be left without an admin — otherwise nobody
    // can invite, configure or recover it without Endeavrly intervening.
    const demotingAnAdmin =
      membership.role === OrgRole.ORGANISATION_ADMIN &&
      ((body.data.role && body.data.role !== OrgRole.ORGANISATION_ADMIN) ||
        (body.data.status && body.data.status !== OrgMembershipStatus.ACTIVE));

    if (demotingAnAdmin) {
      const remainingAdmins = await prisma.organisationMembership.count({
        where: {
          organisationId: context.organisationId,
          role: OrgRole.ORGANISATION_ADMIN,
          status: OrgMembershipStatus.ACTIVE,
          id: { not: membershipId },
        },
      });
      if (remainingAdmins === 0) {
        return apiError(
          "CONFLICT",
          "This is the last organisation admin. Promote someone else first.",
          { request }
        );
      }
    }

    const updated = await prisma.organisationMembership.update({
      where: { id: membershipId },
      data: body.data as never,
      select: { id: true, role: true, status: true, expiresAt: true },
    });

    invalidateEntitlements(membership.userId);

    await logOrgAudit({
      action:
        body.data.role && body.data.role !== membership.role
          ? OrgAuditAction.MEMBERSHIP_ROLE_CHANGED
          : OrgAuditAction.MEMBERSHIP_STATUS_CHANGED,
      actor: userActor(context.userId, context.email),
      actorUserId: context.userId,
      organisationId: context.organisationId,
      targetType: "membership",
      targetId: membershipId,
      summary: `Membership updated: ${membership.role}/${membership.status} → ${updated.role}/${updated.status}`,
      ipAddress: requestIp(request.headers),
    });

    return NextResponse.json({ membership: updated });
  });
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; membershipId: string }> }
) {
  const { id, membershipId } = await ctx.params;

  return withOrgAccess(id, "members:remove", async (context) => {
    const membership = await prisma.organisationMembership.findFirst({
      where: { id: membershipId, organisationId: context.organisationId },
      select: { id: true, userId: true, role: true },
    });
    if (!membership) return apiError("NOT_FOUND", "That member isn't in this organisation.");

    if (membership.id === context.membershipId) {
      return apiError("CONFLICT", "You can't remove your own membership.", { request });
    }

    if (membership.role === OrgRole.ORGANISATION_ADMIN) {
      const remainingAdmins = await prisma.organisationMembership.count({
        where: {
          organisationId: context.organisationId,
          role: OrgRole.ORGANISATION_ADMIN,
          status: OrgMembershipStatus.ACTIVE,
          id: { not: membershipId },
        },
      });
      if (remainingAdmins === 0) {
        return apiError("CONFLICT", "This is the last organisation admin.", { request });
      }
    }

    // Status change, not a row delete: the audit trail and any cohort history
    // stay intact, and rejoining later reuses the same row.
    await prisma.organisationMembership.update({
      where: { id: membershipId },
      data: { status: OrgMembershipStatus.REMOVED },
    });

    invalidateEntitlements(membership.userId);

    await logOrgAudit({
      action: OrgAuditAction.MEMBERSHIP_REMOVED,
      actor: userActor(context.userId, context.email),
      actorUserId: context.userId,
      organisationId: context.organisationId,
      targetType: "membership",
      targetId: membershipId,
      summary: "Membership removed — personal account untouched",
      ipAddress: requestIp(request.headers),
    });

    return NextResponse.json({ ok: true });
  });
}

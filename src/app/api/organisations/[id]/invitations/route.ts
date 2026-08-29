/**
 * Organisation invitations — list, bulk-create, revoke.
 *
 * Bulk invitation is the primary institutional onboarding route: an admin
 * pastes a class list, picks a role and a cohort, and everyone gets a link.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { InvitationStatus, OrgAuditAction, OrgRole, Prisma } from "@prisma/client";

import { apiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import { logOrgAudit, requestIp, userActor } from "@/lib/organisations/audit";
import {
  DEFAULT_INVITATION_TTL_DAYS,
  generateInvitationToken,
  hashInvitationToken,
  invitationExpiry,
  parseBulkEmails,
} from "@/lib/organisations/invitations";
import { checkSeatAvailable } from "@/lib/organisations/licences";
import { withOrgAccess, parseBody } from "@/lib/organisations/route-helpers";
import { createInvitationsSchema } from "@/lib/organisations/validation";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return withOrgAccess(id, "members:invite", async (context) => {
    const status = new URL(request.url).searchParams.get("status");

    const invitations = await withDbRetry(() =>
      prisma.organisationInvitation.findMany({
        where: {
          organisationId: context.organisationId,
          ...(status ? { status: status as InvitationStatus } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 500,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          expiresAt: true,
          createdAt: true,
          acceptedAt: true,
          invitedBy: true,
          cohort: { select: { id: true, name: true } },
        },
      })
    );

    return NextResponse.json({ invitations });
  });
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return withOrgAccess(id, "members:invite", async (context) => {
    const body = await parseBody(request, createInvitationsSchema);
    if (!body.ok) return body.response;

    const { emails, invalid } = parseBulkEmails(body.data.emails);
    if (emails.length === 0) {
      return apiError("VALIDATION_FAILED", "No valid email addresses in that list.", {
        request,
        details: { invalid },
      });
    }

    // A cohort id from the body is untrusted — confirm it belongs to THIS
    // organisation before attaching anyone to it.
    if (body.data.cohortId) {
      const cohort = await prisma.orgCohort.findFirst({
        where: {
          id: body.data.cohortId,
          organisationId: context.organisationId,
          deletedAt: null,
        },
        select: { id: true },
      });
      if (!cohort) return apiError("NOT_FOUND", "That cohort isn't in this organisation.");
    }

    // Only ORGANISATION_ADMINs may mint more admins. Otherwise any admin-
    // adjacent role could escalate by inviting itself a second account.
    const role = (body.data.role ?? OrgRole.PARTICIPANT) as OrgRole;
    if (role === OrgRole.ORGANISATION_ADMIN && context.role !== OrgRole.ORGANISATION_ADMIN) {
      return apiError("FORBIDDEN", "Only an organisation admin can invite another admin.", {
        request,
      });
    }

    // Warn (don't block) when the invitation batch would overshoot the seats.
    // Blocking would strand an admin mid-onboarding; the seat check at JOIN
    // time is the real enforcement point.
    const licence = await prisma.licence.findFirst({
      where: {
        organisationId: context.organisationId,
        status: { in: ["TRIAL", "ACTIVE"] },
      },
      orderBy: { startDate: "desc" },
      select: { userLimit: true, activeUserCount: true },
    });
    const seats = licence
      ? checkSeatAvailable({
          userLimit: licence.userLimit,
          activeUserCount: licence.activeUserCount,
        })
      : { allowed: true as const, remaining: null };
    const seatWarning =
      seats.remaining !== null && emails.length > seats.remaining
        ? `This batch (${emails.length}) exceeds the ${seats.remaining} seats remaining on the licence.`
        : null;

    const expiresAt = invitationExpiry(body.data.expiresInDays ?? DEFAULT_INVITATION_TTL_DAYS);
    const actor = userActor(context.userId, context.email);

    const created: { email: string; token: string }[] = [];
    const skipped: { email: string; reason: string }[] = [];

    for (const email of emails) {
      // Already in the organisation? Skip rather than sending a link that
      // would only tell them they're already a member.
      const existingMember = await prisma.organisationMembership.findFirst({
        where: {
          organisationId: context.organisationId,
          status: { in: ["ACTIVE", "INVITED"] },
          user: { email },
        },
        select: { id: true },
      });
      if (existingMember) {
        skipped.push({ email, reason: "ALREADY_A_MEMBER" });
        continue;
      }

      const token = generateInvitationToken();
      try {
        await prisma.organisationInvitation.create({
          data: {
            organisationId: context.organisationId,
            email,
            role,
            cohortId: body.data.cohortId ?? null,
            tokenHash: hashInvitationToken(token),
            status: InvitationStatus.PENDING,
            expiresAt,
            invitedBy: context.email,
            message: body.data.message ?? null,
          },
        });
        created.push({ email, token });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          // The (organisationId, email, status) unique — a PENDING invitation
          // already exists. Re-inviting is a no-op, not an error.
          skipped.push({ email, reason: "ALREADY_INVITED" });
          continue;
        }
        throw error;
      }
    }

    await logOrgAudit({
      action: OrgAuditAction.INVITATION_SENT,
      actor,
      actorUserId: context.userId,
      organisationId: context.organisationId,
      targetType: "invitation_batch",
      summary: `Invited ${created.length} ${role}(s)`,
      metadata: { role, created: created.length, skipped: skipped.length },
      ipAddress: requestIp(request.headers),
    });

    return NextResponse.json(
      {
        // Raw tokens are returned ONCE, to this authorised admin, so the
        // portal can render copyable links. They are not stored anywhere.
        invitations: created.map((c) => ({
          email: c.email,
          url: `/join/invitation?token=${encodeURIComponent(c.token)}`,
        })),
        skipped,
        invalidEmails: invalid,
        seatWarning,
      },
      { status: 201 }
    );
  });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return withOrgAccess(id, "members:invite", async (context) => {
    const invitationId = new URL(request.url).searchParams.get("invitationId");
    if (!invitationId) return apiError("BAD_REQUEST", "No invitation given.", { request });

    const invitation = await prisma.organisationInvitation.findFirst({
      where: { id: invitationId, organisationId: context.organisationId },
      select: { id: true, email: true, status: true },
    });
    if (!invitation) return apiError("NOT_FOUND", "Invitation not found.");
    if (invitation.status === InvitationStatus.ACCEPTED) {
      return apiError("CONFLICT", "That invitation has already been accepted.", { request });
    }

    await prisma.organisationInvitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.REVOKED, revokedAt: new Date() },
    });

    await logOrgAudit({
      action: OrgAuditAction.INVITATION_REVOKED,
      actor: userActor(context.userId, context.email),
      actorUserId: context.userId,
      organisationId: context.organisationId,
      targetType: "invitation",
      targetId: invitationId,
      summary: `Revoked invitation to ${invitation.email}`,
      ipAddress: requestIp(request.headers),
    });

    return NextResponse.json({ ok: true });
  });
}

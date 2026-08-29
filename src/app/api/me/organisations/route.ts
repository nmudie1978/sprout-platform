/**
 * The organisations the signed-in user belongs to.
 *
 * Powers the context switcher and the "your programmes" panel. Also carries
 * the data-sharing consent state, because a young person must always be able
 * to see — and change — what they've agreed to share with an institution.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { OrgAuditAction, OrgMembershipStatus } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import { logOrgAudit, userActor } from "@/lib/organisations/audit";
import { isStaffRole } from "@/lib/organisations/permissions";
import { dataSharingConsentSchema } from "@/lib/organisations/validation";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("UNAUTHORIZED", "Sign in to continue.");

  const memberships = await withDbRetry(() =>
    prisma.organisationMembership.findMany({
      where: {
        userId: session.user.id,
        status: { in: [OrgMembershipStatus.ACTIVE, OrgMembershipStatus.INVITED] },
        organisation: { deletedAt: null },
      },
      orderBy: { joinedAt: "desc" },
      select: {
        id: true,
        role: true,
        status: true,
        joinedAt: true,
        expiresAt: true,
        dataSharingConsentAt: true,
        dataSharingConsentRevokedAt: true,
        organisation: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            logoUrl: true,
            settings: {
              select: {
                requireParticipantDataSharingConsent: true,
                participantPrivacyNotice: true,
                allowIndividualParticipantView: true,
              },
            },
          },
        },
        cohortMemberships: {
          select: { cohort: { select: { id: true, name: true, type: true } } },
        },
      },
    })
  );

  return NextResponse.json({
    organisations: memberships.map((m) => ({
      membershipId: m.id,
      organisationId: m.organisation.id,
      name: m.organisation.name,
      slug: m.organisation.slug,
      type: m.organisation.type,
      logoUrl: m.organisation.logoUrl,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt,
      expiresAt: m.expiresAt,
      /** Whether this membership opens an organisation-facing portal. */
      hasStaffPortal: isStaffRole(m.role),
      cohorts: m.cohortMemberships.map((c) => c.cohort),
      dataSharing: {
        consented:
          m.dataSharingConsentAt !== null && m.dataSharingConsentRevokedAt === null,
        required: m.organisation.settings?.requireParticipantDataSharingConsent ?? true,
        // Only meaningful when the organisation has individual views on at all.
        organisationCanViewIndividuals:
          m.organisation.settings?.allowIndividualParticipantView ?? false,
        notice: m.organisation.settings?.participantPrivacyNotice ?? null,
      },
    })),
  });
}

/**
 * Grant or withdraw data-sharing consent for one organisation.
 *
 * Withdrawal is always available and takes effect immediately. It never
 * removes the membership — the young person keeps the institution-funded
 * features, they just stop sharing individual progress.
 */
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("UNAUTHORIZED", "Sign in to continue.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("BAD_REQUEST", "Invalid JSON body.", { request });
  }

  const parsed = dataSharingConsentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_FAILED", "Check the request.", {
      request,
      details: parsed.error.flatten(),
    });
  }

  const membership = await prisma.organisationMembership.findUnique({
    where: {
      userId_organisationId: {
        userId: session.user.id,
        organisationId: parsed.data.organisationId,
      },
    },
    select: { id: true },
  });
  if (!membership) return apiError("NOT_FOUND", "You're not a member of that organisation.");

  const now = new Date();
  await prisma.organisationMembership.update({
    where: { id: membership.id },
    data: parsed.data.consent
      ? { dataSharingConsentAt: now, dataSharingConsentRevokedAt: null }
      : { dataSharingConsentRevokedAt: now },
  });

  await logOrgAudit({
    action: OrgAuditAction.SETTINGS_UPDATED,
    actor: userActor(session.user.id, session.user.email),
    actorUserId: session.user.id,
    organisationId: parsed.data.organisationId,
    targetType: "membership",
    targetId: membership.id,
    summary: parsed.data.consent
      ? "Participant granted data-sharing consent"
      : "Participant withdrew data-sharing consent",
  });

  return NextResponse.json({ ok: true, consented: parsed.data.consent });
}

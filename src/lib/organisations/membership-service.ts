/**
 * Membership writes — the one place a user is attached to an organisation.
 *
 * Access codes, invitations and domain offers all funnel through
 * `joinOrganisation`, so the invariants below hold no matter how someone
 * arrived:
 *
 *   - An existing Endeavrly account is NEVER duplicated. Joining an
 *     organisation adds a membership row and touches nothing else about the
 *     user's identity or personal data.
 *   - Re-joining reuses the existing membership row (the compound unique),
 *     so a student who left and came back doesn't accumulate ghosts.
 *   - Seat limits are checked inside the same transaction as the write, so
 *     two simultaneous joins can't both take the last seat.
 */

import {
  AccessCodeStatus,
  OrgAuditAction,
  OrgMembershipStatus,
  OrgRole,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import { invalidateEntitlements } from "@/lib/entitlements/service";

import { logOrgAudit } from "./audit";
import { derivedCodeStatus } from "./access-codes";
import { checkSeatAvailable } from "./licences";

export interface JoinRequest {
  userId: string;
  organisationId: string;
  role: OrgRole;
  cohortId?: string | null;
  expiresAt?: Date | null;
  accessCodeId?: string | null;
  invitationId?: string | null;
  /** For the audit trail. */
  actor: string;
  source: "ACCESS_CODE" | "INVITATION" | "DOMAIN" | "ADMIN";
}

export type JoinFailure = "SEAT_LIMIT_REACHED" | "NO_ACTIVE_LICENCE" | "ALREADY_ACTIVE_MEMBER";

export type JoinResult =
  | { ok: true; membershipId: string; rejoined: boolean }
  | { ok: false; failure: JoinFailure };

/**
 * Attach a user to an organisation.
 *
 * The seat check and the membership write share one transaction. Without
 * that, two students redeeming the last seat of a 500-seat school licence at
 * the same moment would both succeed.
 */
export async function joinOrganisation(request: JoinRequest): Promise<JoinResult> {
  const now = new Date();

  const result = await withDbRetry(() =>
    prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.findFirst({
        where: { id: request.organisationId, deletedAt: null },
        select: {
          id: true,
          name: true,
          licences: {
            where: {
              status: { in: ["TRIAL", "ACTIVE"] },
              startDate: { lte: now },
              OR: [{ endDate: null }, { endDate: { gt: now } }],
            },
            orderBy: { startDate: "desc" },
            take: 1,
            select: { id: true, userLimit: true },
          },
        },
      });

      if (!organisation) return { ok: false as const, failure: "NO_ACTIVE_LICENCE" as const };

      const licence = organisation.licences[0];
      if (!licence) return { ok: false as const, failure: "NO_ACTIVE_LICENCE" as const };

      const existing = await tx.organisationMembership.findUnique({
        where: {
          userId_organisationId: {
            userId: request.userId,
            organisationId: request.organisationId,
          },
        },
        select: { id: true, status: true },
      });

      if (existing?.status === OrgMembershipStatus.ACTIVE) {
        return { ok: false as const, failure: "ALREADY_ACTIVE_MEMBER" as const };
      }

      // Count live, inside the transaction. `Licence.activeUserCount` is a
      // denormalised convenience for dashboards and is never trusted here.
      const activeUserCount = await tx.organisationMembership.count({
        where: {
          organisationId: request.organisationId,
          status: OrgMembershipStatus.ACTIVE,
        },
      });

      const seats = checkSeatAvailable({ userLimit: licence.userLimit, activeUserCount });
      if (!seats.allowed) return { ok: false as const, failure: "SEAT_LIMIT_REACHED" as const };

      const membership = await tx.organisationMembership.upsert({
        where: {
          userId_organisationId: {
            userId: request.userId,
            organisationId: request.organisationId,
          },
        },
        create: {
          userId: request.userId,
          organisationId: request.organisationId,
          role: request.role,
          status: OrgMembershipStatus.ACTIVE,
          expiresAt: request.expiresAt ?? null,
          accessCodeId: request.accessCodeId ?? null,
          invitationId: request.invitationId ?? null,
        },
        update: {
          // A rejoin refreshes the terms of membership but never resets the
          // person's data-sharing consent — that decision is theirs to keep.
          role: request.role,
          status: OrgMembershipStatus.ACTIVE,
          expiresAt: request.expiresAt ?? null,
          accessCodeId: request.accessCodeId ?? null,
          invitationId: request.invitationId ?? null,
          joinedAt: now,
        },
        select: { id: true },
      });

      if (request.cohortId) {
        await tx.orgCohortMembership.upsert({
          where: {
            cohortId_membershipId: {
              cohortId: request.cohortId,
              membershipId: membership.id,
            },
          },
          create: { cohortId: request.cohortId, membershipId: membership.id },
          update: {},
        });
      }

      await tx.licence.update({
        where: { id: licence.id },
        data: { activeUserCount: activeUserCount + 1 },
      });

      return {
        ok: true as const,
        membershipId: membership.id,
        rejoined: existing !== null,
        organisationName: organisation.name,
      };
    })
  );

  if (!result.ok) return result;

  invalidateEntitlements(request.userId);

  await logOrgAudit({
    action: OrgAuditAction.MEMBERSHIP_CREATED,
    actor: request.actor,
    actorUserId: request.userId,
    organisationId: request.organisationId,
    targetType: "membership",
    targetId: result.membershipId,
    summary: `${request.role} joined ${result.organisationName} via ${request.source}`,
    metadata: { source: request.source, role: request.role, rejoined: result.rejoined },
  });

  return { ok: true, membershipId: result.membershipId, rejoined: result.rejoined };
}

/**
 * Record a code redemption and advance its counters.
 *
 * The unique on (accessCodeId, userId) is what makes this safe under
 * concurrency: a duplicate redemption raises P2002 rather than double-
 * incrementing `currentUses`.
 */
export async function recordAccessCodeRedemption(
  accessCodeId: string,
  userId: string
): Promise<{ ok: boolean; alreadyRedeemed: boolean }> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.accessCodeRedemption.create({ data: { accessCodeId, userId } });

      const code = await tx.accessCode.update({
        where: { id: accessCodeId },
        data: { currentUses: { increment: 1 } },
        select: {
          status: true,
          maxUses: true,
          currentUses: true,
          singleUse: true,
          expiresAt: true,
        },
      });

      const next = derivedCodeStatus(code);
      if (next !== code.status && next !== AccessCodeStatus.ACTIVE) {
        await tx.accessCode.update({ where: { id: accessCodeId }, data: { status: next } });
      }
    });
    return { ok: true, alreadyRedeemed: false };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, alreadyRedeemed: true };
    }
    throw error;
  }
}

/**
 * Change a membership's status. Used by admins for suspend/remove and by the
 * nightly job for expiry. Always invalidates the user's entitlement cache so
 * a revocation takes effect on their next request, not a minute later.
 */
export async function setMembershipStatus(
  membershipId: string,
  status: OrgMembershipStatus,
  actor: string
): Promise<void> {
  const membership = await prisma.organisationMembership.update({
    where: { id: membershipId },
    data: { status },
    select: { userId: true, organisationId: true, role: true },
  });

  invalidateEntitlements(membership.userId);

  await logOrgAudit({
    action:
      status === OrgMembershipStatus.REMOVED
        ? OrgAuditAction.MEMBERSHIP_REMOVED
        : OrgAuditAction.MEMBERSHIP_STATUS_CHANGED,
    actor,
    organisationId: membership.organisationId,
    targetType: "membership",
    targetId: membershipId,
    summary: `Membership set to ${status}`,
    metadata: { status, role: membership.role },
  });
}

/** Recount seats for one licence. Called by the nightly job. */
export async function refreshLicenceSeatCount(licenceId: string): Promise<number> {
  const licence = await prisma.licence.findUnique({
    where: { id: licenceId },
    select: { organisationId: true },
  });
  if (!licence) return 0;

  const activeUserCount = await prisma.organisationMembership.count({
    where: { organisationId: licence.organisationId, status: OrgMembershipStatus.ACTIVE },
  });

  await prisma.licence.update({ where: { id: licenceId }, data: { activeUserCount } });
  return activeUserCount;
}

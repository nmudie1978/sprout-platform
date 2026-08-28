/**
 * Tenant isolation — the single chokepoint for every organisation-scoped
 * request.
 *
 * The rule this file exists to enforce: an administrator at Organisation A
 * must never reach Organisation B's data. The mechanism is that no route
 * handler is allowed to trust an `organisationId` from a URL or body. It
 * calls `requireOrgAccess`, which re-derives the caller's membership of that
 * organisation from the database on every request and fails closed.
 *
 * There is no caching here on purpose. Entitlements are cached because a
 * stale grant is a mild commercial error; tenancy is not, because a stale
 * membership is a data breach.
 */

import { getServerSession } from "next-auth";
import {
  OrgMembershipStatus,
  OrgRole,
  OrganisationStatus,
  type Prisma,
} from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";

import { roleHasPermission, type OrgPermission } from "./permissions";
import { DEFAULT_PRIVACY_SETTINGS, type OrganisationPrivacySettings } from "./visibility";

export interface OrgAccessContext {
  userId: string;
  email: string;
  membershipId: string;
  organisationId: string;
  organisationName: string;
  organisationSlug: string;
  role: OrgRole;
  settings: OrganisationPrivacySettings;
}

export type OrgAccessFailure =
  | "NOT_AUTHENTICATED"
  | "NOT_A_MEMBER"
  | "MEMBERSHIP_NOT_ACTIVE"
  | "ORGANISATION_NOT_ACTIVE"
  | "INSUFFICIENT_PERMISSION";

export type OrgAccessResult =
  | { ok: true; context: OrgAccessContext }
  | { ok: false; failure: OrgAccessFailure };

/** HTTP status for each failure. Non-membership is 404, not 403 — see below. */
export const ORG_ACCESS_STATUS: Record<OrgAccessFailure, number> = {
  NOT_AUTHENTICATED: 401,
  // Deliberately 404: telling a stranger "403 Forbidden" for an organisation
  // id confirms that organisation exists. Non-members get the same answer
  // whether or not the id is real.
  NOT_A_MEMBER: 404,
  MEMBERSHIP_NOT_ACTIVE: 403,
  ORGANISATION_NOT_ACTIVE: 403,
  INSUFFICIENT_PERMISSION: 403,
};

export const ORG_ACCESS_MESSAGES: Record<OrgAccessFailure, string> = {
  NOT_AUTHENTICATED: "You need to sign in.",
  NOT_A_MEMBER: "Not found.",
  MEMBERSHIP_NOT_ACTIVE: "Your membership of this organisation isn't active.",
  ORGANISATION_NOT_ACTIVE: "This organisation isn't active on Endeavrly right now.",
  INSUFFICIENT_PERMISSION: "You don't have permission to do that.",
};

/**
 * Resolve and authorise the caller against one organisation.
 *
 * @param organisationId  Untrusted — comes from the request.
 * @param permission      Optional. When given, the caller's role must hold it.
 */
export async function requireOrgAccess(
  organisationId: string,
  permission?: OrgPermission
): Promise<OrgAccessResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return { ok: false, failure: "NOT_AUTHENTICATED" };
  }

  const membership = await withDbRetry(() =>
    prisma.organisationMembership.findUnique({
      // The compound unique is the isolation boundary: a membership row for
      // THIS user at THIS organisation either exists or it does not.
      where: { userId_organisationId: { userId: session.user.id, organisationId } },
      select: {
        id: true,
        role: true,
        status: true,
        expiresAt: true,
        organisation: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            deletedAt: true,
            settings: {
              select: {
                allowIndividualParticipantView: true,
                advisorCanViewAssignedDetail: true,
                educatorCanViewCohortDetail: true,
                managerCanViewIndividualDetail: true,
                minimumAggregateGroupSize: true,
                requireParticipantDataSharingConsent: true,
              },
            },
          },
        },
      },
    })
  );

  if (!membership || membership.organisation.deletedAt !== null) {
    return { ok: false, failure: "NOT_A_MEMBER" };
  }

  if (
    membership.status !== OrgMembershipStatus.ACTIVE ||
    (membership.expiresAt !== null && membership.expiresAt.getTime() <= Date.now())
  ) {
    return { ok: false, failure: "MEMBERSHIP_NOT_ACTIVE" };
  }

  const orgStatus = membership.organisation.status;
  if (orgStatus !== OrganisationStatus.ACTIVE && orgStatus !== OrganisationStatus.ONBOARDING) {
    return { ok: false, failure: "ORGANISATION_NOT_ACTIVE" };
  }

  if (permission && !roleHasPermission(membership.role, permission)) {
    return { ok: false, failure: "INSUFFICIENT_PERMISSION" };
  }

  return {
    ok: true,
    context: {
      userId: session.user.id,
      email: session.user.email,
      membershipId: membership.id,
      organisationId: membership.organisation.id,
      organisationName: membership.organisation.name,
      organisationSlug: membership.organisation.slug,
      role: membership.role,
      settings: membership.organisation.settings ?? DEFAULT_PRIVACY_SETTINGS,
    },
  };
}

/**
 * Every organisation-scoped Prisma query must be built from this, never from
 * a bare `{ id }`. Taking the organisation id from the *authorised context*
 * rather than the request makes a cross-tenant read a compile-time-visible
 * mistake instead of a silent one.
 */
export function tenantScope(context: OrgAccessContext): { organisationId: string } {
  return { organisationId: context.organisationId };
}

/**
 * The set of participant membership ids this viewer may see individually,
 * before the consent check. Returns null when the viewer may see all of them
 * (a manager with the org-level exception granted).
 *
 * Advisors are narrowed to their explicit assignments; educators to the
 * cohorts they belong to. Anyone else gets an empty set.
 */
export async function visibleParticipantMembershipIds(
  context: OrgAccessContext
): Promise<Set<string> | null> {
  if (context.role === OrgRole.MANAGER && context.settings.managerCanViewIndividualDetail) {
    return null;
  }

  if (context.role === OrgRole.ADVISOR) {
    const links = await withDbRetry(() =>
      prisma.advisorAssignment.findMany({
        where: {
          organisationId: context.organisationId,
          advisorMembershipId: context.membershipId,
          endedAt: null,
        },
        select: { participantMembershipId: true },
      })
    );
    return new Set(links.map((l) => l.participantMembershipId));
  }

  if (context.role === OrgRole.EDUCATOR) {
    const cohortIds = await withDbRetry(() =>
      prisma.orgCohortMembership.findMany({
        where: { membershipId: context.membershipId },
        select: { cohortId: true },
      })
    );
    if (cohortIds.length === 0) return new Set();

    const peers = await withDbRetry(() =>
      prisma.orgCohortMembership.findMany({
        where: {
          cohortId: { in: cohortIds.map((c) => c.cohortId) },
          // Belt and braces: the cohort is already org-scoped by construction,
          // but restate it so a future refactor can't widen this silently.
          cohort: { organisationId: context.organisationId },
        },
        select: { membershipId: true },
      })
    );
    return new Set(peers.map((p) => p.membershipId));
  }

  return new Set();
}

/** Convenience for building a members query already narrowed to one tenant. */
export function membersWhere(
  context: OrgAccessContext,
  extra: Prisma.OrganisationMembershipWhereInput = {}
): Prisma.OrganisationMembershipWhereInput {
  return {
    organisationId: context.organisationId,
    status: { not: OrgMembershipStatus.REMOVED },
    ...extra,
  };
}

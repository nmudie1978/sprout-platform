/**
 * Server-side guard for the organisation portal pages.
 *
 * Pages resolve the organisation by SLUG (readable URLs) but authorise by the
 * membership row, exactly as the API routes do. A slug is just a lookup key;
 * it confers nothing.
 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { OrgMembershipStatus, OrganisationStatus } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { isStaffRole, type OrgPermission, roleHasPermission } from "./permissions";
import { DEFAULT_PRIVACY_SETTINGS, type OrganisationPrivacySettings } from "./visibility";

export interface PortalContext {
  userId: string;
  email: string;
  membershipId: string;
  organisationId: string;
  organisationName: string;
  organisationSlug: string;
  organisationType: string;
  role: string;
  settings: OrganisationPrivacySettings;
}

/**
 * Resolve the viewer's staff context for one organisation, or redirect.
 *
 * Redirects rather than throwing, because these are pages: a participant who
 * follows a stale link should land back on their own journey, not on an error.
 */
export async function requirePortalAccess(
  slug: string,
  permission?: OrgPermission
): Promise<PortalContext> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    redirect(`/auth/signin?callbackUrl=/organisation/${encodeURIComponent(slug)}`);
  }

  const organisation = await prisma.organisation.findFirst({
    where: { slug, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      status: true,
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
  });

  // A non-member and a non-existent organisation get the same outcome, so the
  // slug namespace can't be probed for which institutions exist.
  if (!organisation) redirect("/dashboard");

  const membership = await prisma.organisationMembership.findUnique({
    where: {
      userId_organisationId: { userId: session.user.id, organisationId: organisation.id },
    },
    select: { id: true, role: true, status: true, expiresAt: true },
  });

  if (
    !membership ||
    membership.status !== OrgMembershipStatus.ACTIVE ||
    (membership.expiresAt !== null && membership.expiresAt.getTime() <= Date.now())
  ) {
    redirect("/dashboard");
  }

  if (
    organisation.status !== OrganisationStatus.ACTIVE &&
    organisation.status !== OrganisationStatus.ONBOARDING
  ) {
    redirect("/dashboard");
  }

  // Participants and parents have no portal. Their experience is their own
  // journey — that is the whole design.
  if (!isStaffRole(membership.role)) redirect("/dashboard");

  if (permission && !roleHasPermission(membership.role, permission)) {
    redirect(`/organisation/${organisation.slug}`);
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    membershipId: membership.id,
    organisationId: organisation.id,
    organisationName: organisation.name,
    organisationSlug: organisation.slug,
    organisationType: organisation.type,
    role: membership.role,
    settings: organisation.settings ?? DEFAULT_PRIVACY_SETTINGS,
  };
}

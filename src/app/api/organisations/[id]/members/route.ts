/**
 * Members of one organisation.
 *
 * The privacy shape here is the important part. Staff always see WHO is in
 * the organisation (that is what administering it means). They see individual
 * PROGRESS only when `canViewIndividualParticipant` says so, which requires
 * the organisation to have opted in, the role to permit it, the relationship
 * to exist, and the young person to have consented.
 *
 * When that test fails the row still appears — with the person's name and
 * role, and nothing about their journey.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { OrgRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import {
  membersWhere,
  visibleParticipantMembershipIds,
  type OrgAccessContext,
} from "@/lib/organisations/access";
import { withOrgAccess } from "@/lib/organisations/route-helpers";
import { canViewIndividualParticipant } from "@/lib/organisations/visibility";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return withOrgAccess(id, "members:list", async (context: OrgAccessContext) => {
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");
    const cohortFilter = searchParams.get("cohortId");
    const query = searchParams.get("q")?.trim() ?? "";
    const take = Math.min(Number(searchParams.get("limit") ?? 100), 500);

    const visibleIds = await visibleParticipantMembershipIds(context);

    const memberships = await withDbRetry(() =>
      prisma.organisationMembership.findMany({
        where: membersWhere(context, {
          ...(roleFilter ? { role: roleFilter as OrgRole } : {}),
          ...(cohortFilter ? { cohortMemberships: { some: { cohortId: cohortFilter } } } : {}),
          ...(query
            ? {
                user: {
                  OR: [
                    { email: { contains: query, mode: "insensitive" } },
                    {
                      youthProfile: {
                        displayName: { contains: query, mode: "insensitive" },
                      },
                    },
                  ],
                },
              }
            : {}),
        }),
        orderBy: [{ role: "asc" }, { joinedAt: "desc" }],
        take,
        select: {
          id: true,
          role: true,
          status: true,
          joinedAt: true,
          expiresAt: true,
          dataSharingConsentAt: true,
          dataSharingConsentRevokedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              youthProfile: { select: { displayName: true } },
            },
          },
          cohortMemberships: { select: { cohort: { select: { id: true, name: true } } } },
        },
      })
    );

    // Which of these could this viewer see progress for, if everything else
    // lined up? Resolved once per member so the answer is consistent.
    const rows = memberships.map((m) => {
      const hasConsented =
        m.dataSharingConsentAt !== null && m.dataSharingConsentRevokedAt === null;

      const decision = canViewIndividualParticipant({
        viewerRole: context.role,
        settings: context.settings,
        isAssignedAdvisor:
          context.role === OrgRole.ADVISOR && (visibleIds === null || visibleIds.has(m.id)),
        sharesCohortAsEducator:
          context.role === OrgRole.EDUCATOR && (visibleIds === null || visibleIds.has(m.id)),
        participantHasConsented: hasConsented,
      });

      return {
        membershipId: m.id,
        // Display name where the young person has set one; otherwise the
        // email, because staff need to be able to identify who they invited.
        name: m.user.youthProfile?.displayName ?? m.user.email,
        email: m.user.email,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
        expiresAt: m.expiresAt,
        cohorts: m.cohortMemberships.map((c) => c.cohort),
        dataSharingConsent: hasConsented,
        /** Whether THIS viewer may open this person's individual progress. */
        canViewProgress: decision.allowed,
        progressUnavailableReason: decision.allowed ? null : decision.reason,
      };
    });

    return NextResponse.json({
      members: rows,
      viewer: { role: context.role, membershipId: context.membershipId },
      counts: {
        total: rows.length,
        withIndividualVisibility: rows.filter((r) => r.canViewProgress).length,
      },
    });
  });
}

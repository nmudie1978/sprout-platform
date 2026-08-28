/**
 * The internal commercial dashboard's data source.
 *
 * Platform counts, commercial roll-up and the alert list from section 9 of
 * the spec. Everything here is aggregate — the internal portal shows how the
 * business is doing, never what an individual young person is exploring.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { LicenceStatus, OrgMembershipStatus, OrganisationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import { requireSuperAdmin } from "@/lib/admin/platform-guard";
import {
  buildCommercialAlerts,
  derivedLicenceStatus,
  summariseRevenue,
  RENEWAL_ALERT_WINDOW_DAYS,
  MS_PER_DAY,
} from "@/lib/organisations/licences";

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  const now = new Date();
  const renewalHorizon = new Date(now.getTime() + RENEWAL_ALERT_WINDOW_DAYS * MS_PER_DAY);

  const [
    totalOrganisations,
    activeOrganisations,
    organisations,
    institutionalUserCount,
    totalUsers,
    expiringSoon,
    pendingInvitations,
  ] = await withDbRetry(() =>
    Promise.all([
      prisma.organisation.count({ where: { deletedAt: null } }),
      prisma.organisation.count({
        where: { deletedAt: null, status: OrganisationStatus.ACTIVE },
      }),
      prisma.organisation.findMany({
        where: { deletedAt: null, status: { in: [OrganisationStatus.ACTIVE, OrganisationStatus.ONBOARDING] } },
        select: {
          id: true,
          name: true,
          licences: {
            orderBy: { startDate: "desc" },
            take: 1,
            select: {
              status: true,
              startDate: true,
              endDate: true,
              trialEndsAt: true,
              userLimit: true,
              activeUserCount: true,
              annualValueMinor: true,
            },
          },
        },
      }),
      // Distinct users holding at least one ACTIVE membership. Counting
      // memberships instead would double-count anyone in two organisations.
      prisma.organisationMembership
        .findMany({
          where: { status: OrgMembershipStatus.ACTIVE },
          select: { userId: true },
          distinct: ["userId"],
        })
        .then((rows) => rows.length),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.licence.count({
        where: {
          status: { in: [LicenceStatus.TRIAL, LicenceStatus.ACTIVE] },
          endDate: { gte: now, lte: renewalHorizon },
        },
      }),
      prisma.organisationInvitation.count({ where: { status: "PENDING" } }),
    ])
  );

  const licences = organisations
    .map((o) => o.licences[0])
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  const revenue = summariseRevenue(
    licences.map((l) => ({
      status: derivedLicenceStatus(l, now),
      annualValueMinor: l.annualValueMinor,
    }))
  );

  const alerts = buildCommercialAlerts(
    organisations.map((o) => {
      const licence = o.licences[0];
      return {
        organisationId: o.id,
        organisationName: o.name,
        licence: licence
          ? {
              status: licence.status,
              startDate: licence.startDate,
              endDate: licence.endDate,
              trialEndsAt: licence.trialEndsAt,
              userLimit: licence.userLimit,
              activeUserCount: licence.activeUserCount,
            }
          : null,
      };
    }),
    now
  );

  const statusCounts = licences.reduce<Record<string, number>>((acc, l) => {
    const status = derivedLicenceStatus(l, now);
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  const totalSeats = licences.reduce((sum, l) => sum + (l.userLimit ?? 0), 0);
  const usedSeats = licences.reduce((sum, l) => sum + l.activeUserCount, 0);

  return NextResponse.json({
    platform: {
      totalOrganisations,
      activeOrganisations,
      trialOrganisations: statusCounts[LicenceStatus.TRIAL] ?? 0,
      activeLicences: statusCounts[LicenceStatus.ACTIVE] ?? 0,
      expiringLicences: expiringSoon,
      institutionalUsers: institutionalUserCount,
      // Everyone who is not on an institutional licence. This is the number
      // that must never go down because of anything in this feature.
      directUsers: Math.max(0, totalUsers - institutionalUserCount),
      totalUsers,
      pendingInvitations,
    },
    commercial: {
      arrMinor: revenue.arrMinor,
      mrrMinor: revenue.mrrMinor,
      trialPipelineMinor: revenue.trialPipelineMinor,
      totalSeats,
      usedSeats,
      seatUtilisation: totalSeats > 0 ? usedSeats / totalSeats : null,
    },
    alerts,
  });
}

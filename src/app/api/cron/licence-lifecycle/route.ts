/**
 * Nightly licence, membership and access-code lifecycle job.
 *
 * Success criteria 12 and 13 of the spec: licences expire automatically, and
 * access is revoked automatically when appropriate. This job is what makes
 * those true without anyone remembering to do it.
 *
 * Note the safety property: this job is a TIDY-UP, not the enforcement point.
 * `resolveEntitlements` already refuses an expired licence or membership on
 * every request, so if this job never ran, nobody would retain access they
 * shouldn't. What the job does is make the stored state match reality, so the
 * admin portal and the seat counts tell the truth.
 *
 * Authorisation: Vercel Cron bearer token from CRON_SECRET, matching the
 * existing cron routes.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  AccessCodeStatus,
  InvitationStatus,
  LicenceStatus,
  OrgAuditAction,
  OrgMembershipStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { invalidateAllEntitlements } from "@/lib/entitlements/service";
import { logOrgAudit } from "@/lib/organisations/audit";
import { derivedCodeStatus } from "@/lib/organisations/access-codes";
import { derivedLicenceStatus } from "@/lib/organisations/licences";

function authorise(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // Production insists on a secret; dev leaves it runnable by hand.
    return process.env.NODE_ENV !== "production";
  }
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

export async function GET(request: NextRequest) {
  if (!authorise(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const summary = {
    licencesExpired: 0,
    licencesActivated: 0,
    membershipsExpired: 0,
    invitationsExpired: 0,
    codesClosed: 0,
    seatCountsRefreshed: 0,
  };

  // ── 1. Licences ─────────────────────────────────────────────────────────
  const licences = await prisma.licence.findMany({
    where: { status: { in: [LicenceStatus.TRIAL, LicenceStatus.ACTIVE] } },
    select: {
      id: true,
      organisationId: true,
      status: true,
      startDate: true,
      endDate: true,
      trialEndsAt: true,
      organisation: { select: { name: true } },
    },
  });

  for (const licence of licences) {
    const next = derivedLicenceStatus(licence, now);
    if (next === licence.status) continue;

    await prisma.licence.update({ where: { id: licence.id }, data: { status: next } });

    if (next === LicenceStatus.EXPIRED) summary.licencesExpired += 1;
    if (next === LicenceStatus.ACTIVE) summary.licencesActivated += 1;

    await logOrgAudit({
      action:
        next === LicenceStatus.EXPIRED
          ? OrgAuditAction.LICENCE_EXPIRED
          : OrgAuditAction.LICENCE_STATUS_CHANGED,
      actor: "system:cron",
      organisationId: licence.organisationId,
      targetType: "licence",
      targetId: licence.id,
      summary: `${licence.organisation.name}: ${licence.status} → ${next} (automatic)`,
    });
  }

  // ── 2. Memberships past their own expiry ────────────────────────────────
  const expiredMemberships = await prisma.organisationMembership.updateMany({
    where: {
      status: OrgMembershipStatus.ACTIVE,
      expiresAt: { not: null, lte: now },
    },
    data: { status: OrgMembershipStatus.EXPIRED },
  });
  summary.membershipsExpired = expiredMemberships.count;

  // ── 3. Invitations past their expiry ────────────────────────────────────
  const expiredInvitations = await prisma.organisationInvitation.updateMany({
    where: { status: InvitationStatus.PENDING, expiresAt: { lte: now } },
    data: { status: InvitationStatus.EXPIRED },
  });
  summary.invitationsExpired = expiredInvitations.count;

  // ── 4. Access codes that have lapsed or run out ─────────────────────────
  const activeCodes = await prisma.accessCode.findMany({
    where: { status: AccessCodeStatus.ACTIVE },
    select: {
      id: true,
      status: true,
      maxUses: true,
      currentUses: true,
      singleUse: true,
      expiresAt: true,
    },
  });

  for (const code of activeCodes) {
    const next = derivedCodeStatus(code, now);
    if (next === code.status) continue;
    await prisma.accessCode.update({ where: { id: code.id }, data: { status: next } });
    summary.codesClosed += 1;
  }

  // ── 5. Refresh denormalised seat counts ─────────────────────────────────
  // Kept honest here rather than trusted anywhere load-bearing: the join path
  // counts live inside its transaction. This is for dashboards and alerts.
  const liveLicences = await prisma.licence.findMany({
    where: { status: { in: [LicenceStatus.TRIAL, LicenceStatus.ACTIVE] } },
    select: { id: true, organisationId: true, activeUserCount: true },
  });

  for (const licence of liveLicences) {
    const activeUserCount = await prisma.organisationMembership.count({
      where: {
        organisationId: licence.organisationId,
        status: OrgMembershipStatus.ACTIVE,
      },
    });
    if (activeUserCount !== licence.activeUserCount) {
      await prisma.licence.update({ where: { id: licence.id }, data: { activeUserCount } });
      summary.seatCountsRefreshed += 1;
    }
  }

  // Anything above may have changed what someone can do. Clear the cache so
  // the next request resolves fresh rather than up to a minute stale.
  if (
    summary.licencesExpired > 0 ||
    summary.licencesActivated > 0 ||
    summary.membershipsExpired > 0
  ) {
    invalidateAllEntitlements();
  }

  return NextResponse.json({ ok: true, ranAt: now.toISOString(), ...summary });
}

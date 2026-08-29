/**
 * One organisation — full profile read, and administrative update.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { AccessCodeStatus, InvitationStatus, OrgAuditAction, OrgMembershipStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-error";
import { withDbRetry } from "@/lib/db-retry";
import { requireSuperAdmin } from "@/lib/admin/platform-guard";
import { invalidateAllEntitlements } from "@/lib/entitlements/service";
import { logOrgAudit, requestIp } from "@/lib/organisations/audit";
import { updateOrganisationSchema } from "@/lib/organisations/validation";
import { derivedLicenceStatus, seatUtilisation, daysUntil } from "@/lib/organisations/licences";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;

  const organisation = await withDbRetry(() =>
    prisma.organisation.findFirst({
      where: { id, deletedAt: null },
      include: {
        settings: true,
        domains: { orderBy: { domain: "asc" } },
        licences: {
          orderBy: { startDate: "desc" },
          include: { plan: { select: { id: true, key: true, name: true } } },
        },
        cohorts: {
          where: { deletedAt: null },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            startDate: true,
            endDate: true,
            _count: { select: { memberships: true } },
          },
        },
        _count: {
          select: {
            memberships: { where: { status: OrgMembershipStatus.ACTIVE } },
            accessCodes: { where: { status: AccessCodeStatus.ACTIVE } },
            invitations: { where: { status: InvitationStatus.PENDING } },
          },
        },
      },
    })
  );

  if (!organisation) return apiError("NOT_FOUND", "Organisation not found.");

  const now = new Date();
  const currentLicence = organisation.licences[0] ?? null;

  // Role mix, for the overview tab. Counts only — no individual data ever
  // crosses into the internal portal from this endpoint.
  const roleCounts = await withDbRetry(() =>
    prisma.organisationMembership.groupBy({
      by: ["role"],
      where: { organisationId: id, status: OrgMembershipStatus.ACTIVE },
      _count: { _all: true },
    })
  );

  const recentAudit = await withDbRetry(() =>
    prisma.orgAuditLog.findMany({
      where: { organisationId: id },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        action: true,
        actor: true,
        summary: true,
        createdAt: true,
      },
    })
  );

  return NextResponse.json({
    organisation: {
      ...organisation,
      activeUsers: organisation._count.memberships,
      activeAccessCodes: organisation._count.accessCodes,
      pendingInvitations: organisation._count.invitations,
      roleCounts: roleCounts.map((r) => ({ role: r.role, count: r._count._all })),
      currentLicence: currentLicence
        ? {
            ...currentLicence,
            derivedStatus: derivedLicenceStatus(currentLicence, now),
            daysRemaining: daysUntil(currentLicence.endDate, now),
            utilisation: seatUtilisation({
              userLimit: currentLicence.userLimit,
              activeUserCount: organisation._count.memberships,
            }),
          }
        : null,
      recentAudit,
    },
  });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("BAD_REQUEST", "Invalid JSON body.", { request });
  }

  const parsed = updateOrganisationSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_FAILED", "Check the organisation details.", {
      request,
      details: parsed.error.flatten(),
    });
  }

  const existing = await prisma.organisation.findFirst({
    where: { id, deletedAt: null },
    select: { status: true, name: true },
  });
  if (!existing) return apiError("NOT_FOUND", "Organisation not found.");

  const organisation = await withDbRetry(() =>
    prisma.organisation.update({
      where: { id },
      data: parsed.data as never,
      select: { id: true, name: true, slug: true, status: true, type: true },
    })
  );

  const statusChanged = parsed.data.status && parsed.data.status !== existing.status;
  if (statusChanged) {
    // Suspending an organisation must take effect promptly, not a cache TTL
    // later. Enumerating its members would cost more than a global clear.
    invalidateAllEntitlements();
  }

  await logOrgAudit({
    action: statusChanged
      ? OrgAuditAction.ORGANISATION_STATUS_CHANGED
      : OrgAuditAction.ORGANISATION_UPDATED,
    actor: auth.context.actor,
    organisationId: id,
    targetType: "organisation",
    targetId: id,
    summary: statusChanged
      ? `Status ${existing.status} → ${parsed.data.status}`
      : `Updated ${organisation.name}`,
    metadata: { fields: Object.keys(parsed.data) },
    ipAddress: requestIp(request.headers),
  });

  return NextResponse.json({ organisation });
}

/**
 * Soft-delete. Never a hard delete: memberships, audit trail and commercial
 * history all hang off this row, and a real customer record should survive
 * a misclick. Entitlement resolution already ignores soft-deleted orgs.
 */
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const existing = await prisma.organisation.findFirst({
    where: { id, deletedAt: null },
    select: { name: true },
  });
  if (!existing) return apiError("NOT_FOUND", "Organisation not found.");

  await withDbRetry(() =>
    prisma.organisation.update({
      where: { id },
      data: { deletedAt: new Date(), status: "ARCHIVED" },
    })
  );
  invalidateAllEntitlements();

  await logOrgAudit({
    action: OrgAuditAction.ORGANISATION_STATUS_CHANGED,
    actor: auth.context.actor,
    organisationId: id,
    targetType: "organisation",
    targetId: id,
    summary: `Archived ${existing.name}`,
    ipAddress: requestIp(request.headers),
  });

  return NextResponse.json({ ok: true });
}

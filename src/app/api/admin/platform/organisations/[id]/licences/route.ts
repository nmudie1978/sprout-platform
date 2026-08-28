/**
 * Licences for one organisation — list and issue.
 *
 * Issuing a licence seeds `enabledModules` from the chosen plan but stores
 * them on the licence itself. That is deliberate: a bespoke contract must
 * never require inventing a new plan, and editing a plan later must never
 * silently change what an existing customer has already bought.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { LicenceStatus, OrgAuditAction, OrgMembershipStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-error";
import { withDbRetry } from "@/lib/db-retry";
import { requireSuperAdmin } from "@/lib/admin/platform-guard";
import { invalidateAllEntitlements } from "@/lib/entitlements/service";
import { logOrgAudit, requestIp } from "@/lib/organisations/audit";
import { createLicenceSchema } from "@/lib/organisations/validation";
import { daysUntil, derivedLicenceStatus } from "@/lib/organisations/licences";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const licences = await withDbRetry(() =>
    prisma.licence.findMany({
      where: { organisationId: id },
      orderBy: { startDate: "desc" },
      include: { plan: { select: { id: true, key: true, name: true } } },
    })
  );

  const now = new Date();
  return NextResponse.json({
    licences: licences.map((l) => ({
      ...l,
      derivedStatus: derivedLicenceStatus(l, now),
      daysRemaining: daysUntil(l.endDate, now),
    })),
  });
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("BAD_REQUEST", "Invalid JSON body.", { request });
  }

  const parsed = createLicenceSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_FAILED", "Check the licence details.", {
      request,
      details: parsed.error.flatten(),
    });
  }

  const organisation = await prisma.organisation.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, name: true },
  });
  if (!organisation) return apiError("NOT_FOUND", "Organisation not found.");

  const data = parsed.data;

  let plan: { id: string; name: string; defaultModules: string[]; defaultUserLimit: number | null } | null =
    null;
  if (data.licencePlanId) {
    plan = await prisma.licencePlan.findUnique({
      where: { id: data.licencePlanId },
      select: { id: true, name: true, defaultModules: true, defaultUserLimit: true },
    });
    if (!plan) return apiError("NOT_FOUND", "That licence plan doesn't exist.", { request });
  }

  // Explicit modules win; otherwise inherit the plan's defaults. An empty
  // array from the client is respected — a licence with no modules is a
  // legitimate (if unusual) state, and silently backfilling it would hide it.
  const enabledModules = data.enabledModules ?? plan?.defaultModules ?? [];
  const userLimit = data.userLimit ?? plan?.defaultUserLimit ?? null;

  const activeUserCount = await prisma.organisationMembership.count({
    where: { organisationId: id, status: OrgMembershipStatus.ACTIVE },
  });

  const licence = await withDbRetry(() =>
    prisma.licence.create({
      data: {
        organisationId: id,
        licencePlanId: plan?.id ?? null,
        status: (data.status ?? LicenceStatus.TRIAL) as never,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        userLimit,
        activeUserCount,
        enabledModules: enabledModules as never,
        contractReference: data.contractReference ?? null,
        contractValueMinor: data.contractValueMinor ?? null,
        annualValueMinor: data.annualValueMinor ?? null,
        currency: data.currency ?? null,
        renewalDate: data.renewalDate ?? null,
        autoRenew: data.autoRenew ?? false,
        trialEndsAt: data.trialEndsAt ?? null,
        commercialNotes: data.commercialNotes ?? null,
      },
      include: { plan: { select: { key: true, name: true } } },
    })
  );

  // A new licence can grant modules immediately — don't make members wait
  // out the entitlement cache TTL to see what their institution just bought.
  invalidateAllEntitlements();

  await logOrgAudit({
    action: OrgAuditAction.LICENCE_CREATED,
    actor: auth.context.actor,
    organisationId: id,
    targetType: "licence",
    targetId: licence.id,
    summary: `Issued ${plan?.name ?? "custom"} licence to ${organisation.name}`,
    metadata: {
      status: licence.status,
      userLimit,
      moduleCount: enabledModules.length,
      endDate: licence.endDate?.toISOString() ?? null,
    },
    ipAddress: requestIp(request.headers),
  });

  return NextResponse.json({ licence }, { status: 201 });
}

/**
 * One licence — amend terms, modules, seats and status.
 *
 * This is where Endeavrly overrides module access and adjusts user limits
 * per section 12 of the spec, without touching any feature code.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { OrgAuditAction } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-error";
import { withDbRetry } from "@/lib/db-retry";
import { requireSuperAdmin } from "@/lib/admin/platform-guard";
import { invalidateAllEntitlements } from "@/lib/entitlements/service";
import { logOrgAudit, requestIp } from "@/lib/organisations/audit";
import { updateLicenceSchema } from "@/lib/organisations/validation";

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

  const parsed = updateLicenceSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_FAILED", "Check the licence details.", {
      request,
      details: parsed.error.flatten(),
    });
  }

  const existing = await prisma.licence.findUnique({
    where: { id },
    select: {
      organisationId: true,
      status: true,
      startDate: true,
      endDate: true,
      enabledModules: true,
      userLimit: true,
      organisation: { select: { name: true } },
    },
  });
  if (!existing) return apiError("NOT_FOUND", "Licence not found.");

  const nextStart = parsed.data.startDate ?? existing.startDate;
  const nextEnd = parsed.data.endDate === undefined ? existing.endDate : parsed.data.endDate;
  if (nextEnd && nextEnd <= nextStart) {
    return apiError("VALIDATION_FAILED", "The end date must be after the start date.", {
      request,
    });
  }

  const licence = await withDbRetry(() =>
    prisma.licence.update({
      where: { id },
      data: parsed.data as never,
      include: { plan: { select: { key: true, name: true } } },
    })
  );

  invalidateAllEntitlements();

  const statusChanged = parsed.data.status && parsed.data.status !== existing.status;
  await logOrgAudit({
    action: statusChanged ? OrgAuditAction.LICENCE_STATUS_CHANGED : OrgAuditAction.LICENCE_UPDATED,
    actor: auth.context.actor,
    organisationId: existing.organisationId,
    targetType: "licence",
    targetId: id,
    summary: statusChanged
      ? `${existing.organisation.name}: licence ${existing.status} → ${parsed.data.status}`
      : `${existing.organisation.name}: licence amended`,
    metadata: {
      fields: Object.keys(parsed.data),
      modulesBefore: existing.enabledModules,
      modulesAfter: licence.enabledModules,
      userLimitBefore: existing.userLimit,
      userLimitAfter: licence.userLimit,
    },
    ipAddress: requestIp(request.headers),
  });

  return NextResponse.json({ licence });
}

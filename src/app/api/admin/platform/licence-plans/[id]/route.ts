/**
 * One licence plan — edit.
 *
 * Editing a plan changes only what FUTURE licences inherit. Licences already
 * issued carry their own module list and are untouched, so a commercial
 * repackaging can never silently alter what an existing customer bought.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { OrgAuditAction } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-error";
import { withDbRetry } from "@/lib/db-retry";
import { requireSuperAdmin } from "@/lib/admin/platform-guard";
import { logOrgAudit, requestIp } from "@/lib/organisations/audit";
import { updateLicencePlanSchema } from "@/lib/organisations/validation";

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

  const parsed = updateLicencePlanSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_FAILED", "Check the plan details.", {
      request,
      details: parsed.error.flatten(),
    });
  }

  const existing = await prisma.licencePlan.findUnique({
    where: { id },
    select: { key: true, defaultModules: true },
  });
  if (!existing) return apiError("NOT_FOUND", "Plan not found.");

  const plan = await withDbRetry(() =>
    prisma.licencePlan.update({ where: { id }, data: parsed.data as never })
  );

  await logOrgAudit({
    action: OrgAuditAction.LICENCE_PLAN_UPDATED,
    actor: auth.context.actor,
    targetType: "licence_plan",
    targetId: id,
    summary: `Updated plan ${existing.key}`,
    metadata: {
      fields: Object.keys(parsed.data),
      modulesBefore: existing.defaultModules,
      modulesAfter: plan.defaultModules,
    },
    ipAddress: requestIp(request.headers),
  });

  return NextResponse.json({ plan });
}

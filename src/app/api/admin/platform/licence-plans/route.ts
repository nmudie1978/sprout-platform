/**
 * Licence plans — list and create.
 *
 * Plans are DATA. Nothing in the application branches on a plan key; the
 * entitlement engine only ever sees the module list a licence carries. That
 * is what lets Endeavrly invent a new commercial package without a deploy.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { OrgAuditAction, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-error";
import { withDbRetry } from "@/lib/db-retry";
import { requireSuperAdmin } from "@/lib/admin/platform-guard";
import { logOrgAudit, requestIp } from "@/lib/organisations/audit";
import { licencePlanSchema } from "@/lib/organisations/validation";

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  const plans = await withDbRetry(() =>
    prisma.licencePlan.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { licences: true } } },
    })
  );

  return NextResponse.json({
    plans: plans.map((p) => ({ ...p, licenceCount: p._count.licences })),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("BAD_REQUEST", "Invalid JSON body.", { request });
  }

  const parsed = licencePlanSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_FAILED", "Check the plan details.", {
      request,
      details: parsed.error.flatten(),
    });
  }

  try {
    const plan = await withDbRetry(() =>
      prisma.licencePlan.create({ data: parsed.data as never })
    );

    await logOrgAudit({
      action: OrgAuditAction.LICENCE_PLAN_CREATED,
      actor: auth.context.actor,
      targetType: "licence_plan",
      targetId: plan.id,
      summary: `Created plan ${plan.key}`,
      metadata: { modules: plan.defaultModules },
      ipAddress: requestIp(request.headers),
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return apiError("CONFLICT", "A plan with that key already exists.", { request });
    }
    console.error("[platform] create licence plan failed", error);
    return apiError("INTERNAL", "Couldn't create that plan.", { request });
  }
}

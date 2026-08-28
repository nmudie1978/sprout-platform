/**
 * Cohorts for one organisation — list and create.
 *
 * These are the ORGANISATION-scoped cohorts (OrgCohort), not the legacy
 * teacher-owned school-mode Cohort. See docs/institutional-architecture.md.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { OrgAuditAction, OrgCohortStatus, Prisma } from "@prisma/client";

import { apiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import { logOrgAudit, requestIp, userActor } from "@/lib/organisations/audit";
import { withOrgAccess, parseBody } from "@/lib/organisations/route-helpers";
import { createCohortSchema } from "@/lib/organisations/validation";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return withOrgAccess(id, "cohorts:list", async (context) => {
    const includeArchived =
      new URL(request.url).searchParams.get("includeArchived") === "true";

    const cohorts = await withDbRetry(() =>
      prisma.orgCohort.findMany({
        where: {
          organisationId: context.organisationId,
          deletedAt: null,
          ...(includeArchived ? {} : { status: { not: OrgCohortStatus.ARCHIVED } }),
        },
        orderBy: [{ status: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          status: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          _count: { select: { memberships: true } },
        },
      })
    );

    return NextResponse.json({
      cohorts: cohorts.map((c) => ({ ...c, memberCount: c._count.memberships })),
    });
  });
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return withOrgAccess(id, "cohorts:create", async (context) => {
    const body = await parseBody(request, createCohortSchema);
    if (!body.ok) return body.response;

    if (body.data.startDate && body.data.endDate && body.data.endDate <= body.data.startDate) {
      return apiError("VALIDATION_FAILED", "The end date must be after the start date.", {
        request,
      });
    }

    try {
      const cohort = await withDbRetry(() =>
        prisma.orgCohort.create({
          data: {
            organisationId: context.organisationId,
            name: body.data.name,
            description: body.data.description ?? null,
            type: (body.data.type ?? "PROGRAMME") as never,
            status: (body.data.status ?? "ACTIVE") as never,
            startDate: body.data.startDate ?? null,
            endDate: body.data.endDate ?? null,
          },
        })
      );

      await logOrgAudit({
        action: OrgAuditAction.COHORT_CREATED,
        actor: userActor(context.userId, context.email),
        actorUserId: context.userId,
        organisationId: context.organisationId,
        targetType: "cohort",
        targetId: cohort.id,
        summary: `Created cohort ${cohort.name}`,
        ipAddress: requestIp(request.headers),
      });

      return NextResponse.json({ cohort }, { status: 201 });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return apiError("CONFLICT", "A cohort with that name already exists here.", { request });
      }
      throw error;
    }
  });
}

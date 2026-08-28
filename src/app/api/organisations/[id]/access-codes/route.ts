/**
 * Access codes for one organisation — list and mint.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { AccessCodeStatus, OrgAuditAction, OrgRole, Prisma } from "@prisma/client";

import { apiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import { getOrganisationEntitlements } from "@/lib/entitlements/service";
import { logOrgAudit, requestIp, userActor } from "@/lib/organisations/audit";
import { derivedCodeStatus, generateAccessCode } from "@/lib/organisations/access-codes";
import { normaliseDomain } from "@/lib/organisations/domains";
import { withOrgAccess, parseBody } from "@/lib/organisations/route-helpers";
import { createAccessCodeSchema } from "@/lib/organisations/validation";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return withOrgAccess(id, "codes:list", async (context) => {
    const codes = await withDbRetry(() =>
      prisma.accessCode.findMany({
        where: { organisationId: context.organisationId },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          code: true,
          label: true,
          status: true,
          assignedRole: true,
          maxUses: true,
          currentUses: true,
          singleUse: true,
          expiresAt: true,
          allowedEmailDomains: true,
          moduleOverrides: true,
          membershipDurationDays: true,
          createdAt: true,
          cohort: { select: { id: true, name: true } },
        },
      })
    );

    const now = new Date();
    return NextResponse.json({
      codes: codes.map((c) => ({
        ...c,
        // The derived status, so a code that lapsed overnight doesn't sit in
        // the list still labelled ACTIVE until the nightly job catches it.
        effectiveStatus: derivedCodeStatus(c, now),
      })),
    });
  });
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return withOrgAccess(id, "codes:create", async (context) => {
    const body = await parseBody(request, createAccessCodeSchema);
    if (!body.ok) return body.response;

    const role = (body.data.assignedRole ?? OrgRole.PARTICIPANT) as OrgRole;
    // A code that mints admins would be a self-service escalation route into
    // the organisation. Codes are for participants and, at most, staff the
    // admin explicitly chooses — never another admin.
    if (role === OrgRole.ORGANISATION_ADMIN) {
      return apiError("FORBIDDEN", "Access codes can't grant organisation admin.", { request });
    }

    if (body.data.cohortId) {
      const cohort = await prisma.orgCohort.findFirst({
        where: {
          id: body.data.cohortId,
          organisationId: context.organisationId,
          deletedAt: null,
        },
        select: { id: true },
      });
      if (!cohort) return apiError("NOT_FOUND", "That cohort isn't in this organisation.");
    }

    // Module overrides are bounded by what the organisation's own licence
    // covers. An admin cannot mint themselves capabilities the institution
    // hasn't bought — that decision belongs to Endeavrly, not the customer.
    let moduleOverrides = body.data.moduleOverrides ?? [];
    if (moduleOverrides.length > 0) {
      const { modules } = await getOrganisationEntitlements(context.organisationId);
      const licensed = new Set(modules);
      const rejected = moduleOverrides.filter((m) => !licensed.has(m as never));
      if (rejected.length > 0) {
        return apiError(
          "FORBIDDEN",
          "Those modules aren't part of your licence. Talk to Endeavrly to add them.",
          { request, details: { rejected } }
        );
      }
    }

    const domains = (body.data.allowedEmailDomains ?? [])
      .map(normaliseDomain)
      .filter(Boolean);

    // Retry on the astronomically unlikely code collision rather than 500.
    let created: { id: string; code: string } | null = null;
    for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
      const code = generateAccessCode(body.data.prefix ?? null);
      try {
        created = await prisma.accessCode.create({
          data: {
            organisationId: context.organisationId,
            code,
            label: body.data.label ?? null,
            status: AccessCodeStatus.ACTIVE,
            cohortId: body.data.cohortId ?? null,
            assignedRole: role,
            maxUses: body.data.singleUse ? 1 : (body.data.maxUses ?? null),
            singleUse: body.data.singleUse ?? false,
            expiresAt: body.data.expiresAt ?? null,
            allowedEmailDomains: domains,
            moduleOverrides: moduleOverrides as never,
            membershipDurationDays: body.data.membershipDurationDays ?? null,
            createdBy: context.email,
          },
          select: { id: true, code: true },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          continue;
        }
        throw error;
      }
    }

    if (!created) {
      return apiError("INTERNAL", "Couldn't generate a unique code. Try again.", { request });
    }

    await logOrgAudit({
      action: OrgAuditAction.ACCESS_CODE_CREATED,
      actor: userActor(context.userId, context.email),
      actorUserId: context.userId,
      organisationId: context.organisationId,
      targetType: "access_code",
      targetId: created.id,
      summary: `Created access code ${created.code}`,
      metadata: { role, maxUses: body.data.maxUses ?? null, cohortId: body.data.cohortId ?? null },
      ipAddress: requestIp(request.headers),
    });

    return NextResponse.json({ code: created }, { status: 201 });
  });
}

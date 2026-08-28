/**
 * Organisation settings — the privacy and enrolment policy.
 *
 * Section 19 of the spec asks that consent requirements be configurable
 * rather than assumed. This is that surface: an organisation decides how much
 * individual visibility its staff have, and whether participants must
 * actively agree before any of it applies.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { OrgAuditAction } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logOrgAudit, requestIp, userActor } from "@/lib/organisations/audit";
import { withOrgAccess, parseBody } from "@/lib/organisations/route-helpers";
import { organisationSettingsSchema } from "@/lib/organisations/validation";
import { getOrganisationEntitlements } from "@/lib/entitlements/service";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return withOrgAccess(id, "org:view_settings", async (context) => {
    const [organisation, entitlements] = await Promise.all([
      prisma.organisation.findUnique({
        where: { id: context.organisationId },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          country: true,
          logoUrl: true,
          settings: true,
          domains: {
            select: {
              id: true,
              domain: true,
              verified: true,
              enrolmentPolicy: true,
              defaultRole: true,
            },
          },
        },
      }),
      getOrganisationEntitlements(context.organisationId),
    ]);

    return NextResponse.json({
      organisation,
      licence: entitlements.licence
        ? {
            // What the institution can see about its own commercial terms.
            // Contract values and internal notes stay in the Endeavrly portal.
            status: entitlements.licence.status,
            planName: entitlements.licence.planName,
            startDate: entitlements.licence.startDate,
            endDate: entitlements.licence.endDate,
            userLimit: entitlements.licence.userLimit,
            activeUserCount: entitlements.licence.activeUserCount,
          }
        : null,
      modules: entitlements.modules,
      viewerRole: context.role,
    });
  });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return withOrgAccess(id, "org:edit_settings", async (context) => {
    const body = await parseBody(request, organisationSettingsSchema);
    if (!body.ok) return body.response;

    const before = await prisma.organisationSettings.findUnique({
      where: { organisationId: context.organisationId },
    });

    const settings = await prisma.organisationSettings.upsert({
      where: { organisationId: context.organisationId },
      create: { organisationId: context.organisationId, ...body.data },
      update: body.data,
    });

    // Privacy-relevant switches are called out explicitly in the audit
    // summary, so a later review can see exactly when an organisation
    // turned individual visibility on and who did it.
    const privacyKeys = [
      "allowIndividualParticipantView",
      "advisorCanViewAssignedDetail",
      "educatorCanViewCohortDetail",
      "managerCanViewIndividualDetail",
      "requireParticipantDataSharingConsent",
      "minimumAggregateGroupSize",
    ] as const;
    const privacyChanges = privacyKeys.filter(
      (k) => k in body.data && before?.[k] !== settings[k]
    );

    await logOrgAudit({
      action: OrgAuditAction.SETTINGS_UPDATED,
      actor: userActor(context.userId, context.email),
      actorUserId: context.userId,
      organisationId: context.organisationId,
      targetType: "organisation_settings",
      targetId: settings.id,
      summary:
        privacyChanges.length > 0
          ? `Privacy settings changed: ${privacyChanges.join(", ")}`
          : "Organisation settings updated",
      metadata: {
        fields: Object.keys(body.data),
        privacyChanges: privacyChanges.map((k) => ({
          field: k,
          from: before?.[k] ?? null,
          to: settings[k],
        })),
      },
      ipAddress: requestIp(request.headers),
    });

    return NextResponse.json({ settings });
  });
}

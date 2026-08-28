/**
 * Organisations — list and create. Endeavrly super admins only.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { OrgAuditAction, OrgMembershipStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-error";
import { withDbRetry } from "@/lib/db-retry";
import { requireSuperAdmin } from "@/lib/admin/platform-guard";
import { logOrgAudit, requestIp } from "@/lib/organisations/audit";
import { createOrganisationSchema, slugify } from "@/lib/organisations/validation";
import { derivedLicenceStatus, seatUtilisation } from "@/lib/organisations/licences";

export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const take = Math.min(Number(searchParams.get("limit") ?? 50), 200);

  const where: Prisma.OrganisationWhereInput = {
    deletedAt: null,
    ...(status ? { status: status as Prisma.EnumOrganisationStatusFilter["equals"] } : {}),
    ...(type ? { type: type as Prisma.EnumOrganisationTypeFilter["equals"] } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { primaryContactEmail: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const organisations = await withDbRetry(() =>
    prisma.organisation.findMany({
      where,
      orderBy: [{ status: "asc" }, { name: "asc" }],
      take,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        status: true,
        country: true,
        createdAt: true,
        licences: {
          orderBy: { startDate: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            trialEndsAt: true,
            userLimit: true,
            activeUserCount: true,
            annualValueMinor: true,
            currency: true,
            plan: { select: { key: true, name: true } },
          },
        },
        _count: { select: { memberships: { where: { status: OrgMembershipStatus.ACTIVE } } } },
      },
    })
  );

  const now = new Date();

  return NextResponse.json({
    organisations: organisations.map((org) => {
      const licence = org.licences[0] ?? null;
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        type: org.type,
        status: org.status,
        country: org.country,
        createdAt: org.createdAt,
        activeUsers: org._count.memberships,
        licence: licence
          ? {
              id: licence.id,
              // Show the derived status, not the stored one, so the list never
              // advertises a licence as ACTIVE the day after it lapsed.
              status: derivedLicenceStatus(licence, now),
              storedStatus: licence.status,
              planName: licence.plan?.name ?? "Custom",
              planKey: licence.plan?.key ?? null,
              endDate: licence.endDate,
              userLimit: licence.userLimit,
              utilisation: seatUtilisation({
                userLimit: licence.userLimit,
                activeUserCount: org._count.memberships,
              }),
              annualValueMinor: licence.annualValueMinor,
              currency: licence.currency,
            }
          : null,
      };
    }),
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

  const parsed = createOrganisationSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_FAILED", "Check the organisation details.", {
      request,
      details: parsed.error.flatten(),
    });
  }

  const data = parsed.data;
  const slug = data.slug ?? slugify(data.name);
  if (!slug) {
    return apiError("VALIDATION_FAILED", "That name doesn't produce a usable slug.", { request });
  }

  try {
    const organisation = await withDbRetry(() =>
      prisma.organisation.create({
        data: {
          name: data.name,
          slug,
          type: data.type as never,
          status: (data.status ?? "PROSPECT") as never,
          country: data.country ?? null,
          logoUrl: data.logoUrl ?? null,
          primaryContactName: data.primaryContactName ?? null,
          primaryContactEmail: data.primaryContactEmail ?? null,
          billingEmail: data.billingEmail ?? null,
          billingAddress: data.billingAddress ?? null,
          internalNotes: data.internalNotes ?? null,
          // Every organisation gets a settings row immediately, so the
          // conservative privacy defaults apply from the first second rather
          // than only once someone opens the settings page.
          settings: { create: {} },
        },
        select: { id: true, name: true, slug: true, type: true, status: true },
      })
    );

    await logOrgAudit({
      action: OrgAuditAction.ORGANISATION_CREATED,
      actor: auth.context.actor,
      organisationId: organisation.id,
      targetType: "organisation",
      targetId: organisation.id,
      summary: `Created ${organisation.name} (${organisation.type})`,
      ipAddress: requestIp(request.headers),
    });

    return NextResponse.json({ organisation }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return apiError("CONFLICT", "An organisation with that slug already exists.", { request });
    }
    console.error("[platform] create organisation failed", error);
    return apiError("INTERNAL", "Couldn't create that organisation.", { request });
  }
}

/**
 * Access-code redemption.
 *
 * GET  ?code=…  Preview: names the organisation without joining anything, so
 *               a young person can see who they are about to share with.
 * POST          Redeem: validate → record → create membership → assign cohort
 *               → recalculate entitlements.
 *
 * Requires a signed-in Endeavrly account. A code never creates an account and
 * never modifies one — it only ever adds a membership.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { OrgAuditAction } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import { checkRateLimitAsync, RateLimits, getRateLimitHeaders } from "@/lib/rate-limit";
import { invalidateEntitlements } from "@/lib/entitlements/service";
import { logOrgAudit, requestIp, userActor } from "@/lib/organisations/audit";
import {
  ACCESS_CODE_MESSAGES,
  membershipExpiryFor,
  normaliseAccessCode,
  validateAccessCode,
  type AccessCodeSnapshot,
} from "@/lib/organisations/access-codes";
import { joinOrganisation, recordAccessCodeRedemption } from "@/lib/organisations/membership-service";
import { redeemAccessCodeSchema } from "@/lib/organisations/validation";

async function loadCode(code: string) {
  return withDbRetry(() =>
    prisma.accessCode.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        status: true,
        organisationId: true,
        cohortId: true,
        assignedRole: true,
        maxUses: true,
        currentUses: true,
        singleUse: true,
        expiresAt: true,
        allowedEmailDomains: true,
        moduleOverrides: true,
        membershipDurationDays: true,
        organisation: {
          select: {
            name: true,
            slug: true,
            type: true,
            status: true,
            deletedAt: true,
            settings: {
              select: {
                defaultMembershipDurationDays: true,
                participantPrivacyNotice: true,
                requireParticipantDataSharingConsent: true,
              },
            },
          },
        },
        cohort: { select: { id: true, name: true } },
      },
    })
  );
}

type LoadedCode = NonNullable<Awaited<ReturnType<typeof loadCode>>>;

function toSnapshot(code: LoadedCode): AccessCodeSnapshot {
  return {
    id: code.id,
    code: code.code,
    status: code.status,
    organisationId: code.organisationId,
    // A soft-deleted organisation must read as unusable, whatever its status
    // column happens to say.
    organisationStatus: code.organisation.deletedAt ? "ARCHIVED" : code.organisation.status,
    cohortId: code.cohortId,
    assignedRole: code.assignedRole,
    maxUses: code.maxUses,
    currentUses: code.currentUses,
    singleUse: code.singleUse,
    expiresAt: code.expiresAt,
    allowedEmailDomains: code.allowedEmailDomains,
    moduleOverrides: code.moduleOverrides,
    membershipDurationDays: code.membershipDurationDays,
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return apiError("UNAUTHORIZED", "Sign in to use a code.");
  }

  // The preview endpoint answers "is this a real code, and whose is it?" — so
  // without a limit it is a free oracle for guessing codes and mapping which
  // organisations exist on the platform. POST was already throttled; GET was
  // not, and GET is the one an attacker would actually loop on.
  const preview = await checkRateLimitAsync(
    `join-code-preview:${session.user.id}`,
    RateLimits.STRICT
  );
  if (!preview.success) {
    return apiError("RATE_LIMITED", "Too many code checks. Please wait a moment.", {
      request,
      headers: getRateLimitHeaders(preview.limit, preview.remaining, preview.reset),
    });
  }

  const raw = new URL(request.url).searchParams.get("code");
  if (!raw) return apiError("BAD_REQUEST", "No code given.", { request });

  // Bound the lookup key — a code is at most a short prefix plus 8 characters.
  if (raw.length > 64) {
    return NextResponse.json(
      { valid: false, reason: "CODE_NOT_FOUND", message: ACCESS_CODE_MESSAGES.CODE_NOT_FOUND },
      { status: 200 }
    );
  }

  const code = await loadCode(normaliseAccessCode(raw));
  if (!code) {
    return NextResponse.json(
      { valid: false, reason: "CODE_NOT_FOUND", message: ACCESS_CODE_MESSAGES.CODE_NOT_FOUND },
      { status: 200 }
    );
  }

  const alreadyRedeemed =
    (await prisma.accessCodeRedemption.count({
      where: { accessCodeId: code.id, userId: session.user.id },
    })) > 0;

  const validation = validateAccessCode(
    toSnapshot(code),
    { email: session.user.email, alreadyRedeemed },
    new Date()
  );

  if (!validation.valid) {
    return NextResponse.json({
      valid: false,
      reason: validation.reason,
      message: ACCESS_CODE_MESSAGES[validation.reason],
    });
  }

  // Preview only. Deliberately does NOT reveal the module overrides or usage
  // counts — that is the organisation's commercial configuration.
  return NextResponse.json({
    valid: true,
    preview: {
      organisationName: code.organisation.name,
      organisationType: code.organisation.type,
      cohortName: code.cohort?.name ?? null,
      role: code.assignedRole,
      privacyNotice: code.organisation.settings?.participantPrivacyNotice ?? null,
      dataSharingRequested:
        code.organisation.settings?.requireParticipantDataSharingConsent ?? true,
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return apiError("UNAUTHORIZED", "Sign in to use a code.");
  }

  // Codes are guessable-by-brute-force if unthrottled, and a hit enrols the
  // guesser into a real organisation. Rate limit before touching the DB.
  const limit = await checkRateLimitAsync(`join-code:${session.user.id}`, RateLimits.STRICT);
  if (!limit.success) {
    return apiError("RATE_LIMITED", "Too many attempts. Try again shortly.", {
      request,
      headers: getRateLimitHeaders(limit.limit, limit.remaining, limit.reset),
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("BAD_REQUEST", "Invalid JSON body.", { request });
  }

  const parsed = redeemAccessCodeSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_FAILED", "Check the code and try again.", { request });
  }

  const code = await loadCode(normaliseAccessCode(parsed.data.code));

  const alreadyRedeemed = code
    ? (await prisma.accessCodeRedemption.count({
        where: { accessCodeId: code.id, userId: session.user.id },
      })) > 0
    : false;

  const validation = validateAccessCode(
    code ? toSnapshot(code) : null,
    { email: session.user.email, alreadyRedeemed },
    new Date()
  );

  if (!validation.valid) {
    return NextResponse.json(
      {
        ok: false,
        reason: validation.reason,
        message: ACCESS_CODE_MESSAGES[validation.reason],
      },
      { status: 400 }
    );
  }

  const loaded = code as LoadedCode;

  // Claim the redemption BEFORE creating the membership. The unique on
  // (accessCodeId, userId) makes this the concurrency guard: two parallel
  // requests can't both increment `currentUses` past the limit.
  const redemption = await recordAccessCodeRedemption(loaded.id, session.user.id);
  if (!redemption.ok) {
    return NextResponse.json(
      {
        ok: false,
        reason: "CODE_ALREADY_REDEEMED",
        message: ACCESS_CODE_MESSAGES.CODE_ALREADY_REDEEMED,
      },
      { status: 400 }
    );
  }

  const expiresAt = membershipExpiryFor(
    { membershipDurationDays: loaded.membershipDurationDays },
    loaded.organisation.settings?.defaultMembershipDurationDays ?? null
  );

  const join = await joinOrganisation({
    userId: session.user.id,
    organisationId: loaded.organisationId,
    role: loaded.assignedRole,
    cohortId: loaded.cohortId,
    expiresAt,
    accessCodeId: loaded.id,
    actor: userActor(session.user.id, session.user.email),
    source: "ACCESS_CODE",
  });

  if (!join.ok) {
    // The seat check failed after the redemption was claimed. Release it so
    // the young person isn't permanently locked out of a code they never got
    // to use, and so the organisation's usage count stays honest.
    await prisma.accessCodeRedemption
      .deleteMany({ where: { accessCodeId: loaded.id, userId: session.user.id } })
      .catch(() => {});
    await prisma.accessCode
      .update({ where: { id: loaded.id }, data: { currentUses: { decrement: 1 } } })
      .catch(() => {});

    const message =
      join.failure === "SEAT_LIMIT_REACHED"
        ? "That organisation has reached its user limit. Let them know and try again later."
        : join.failure === "ALREADY_ACTIVE_MEMBER"
          ? "You're already a member of that organisation."
          : "That organisation doesn't have an active licence right now.";
    return NextResponse.json({ ok: false, reason: join.failure, message }, { status: 409 });
  }

  invalidateEntitlements(session.user.id);

  await logOrgAudit({
    action: OrgAuditAction.ACCESS_CODE_REDEEMED,
    actor: userActor(session.user.id, session.user.email),
    actorUserId: session.user.id,
    organisationId: loaded.organisationId,
    targetType: "access_code",
    targetId: loaded.id,
    summary: `Code ${loaded.code} redeemed`,
    metadata: { role: loaded.assignedRole, cohortId: loaded.cohortId },
    ipAddress: requestIp(request.headers),
  });

  return NextResponse.json({
    ok: true,
    organisation: {
      id: loaded.organisationId,
      name: loaded.organisation.name,
      slug: loaded.organisation.slug,
    },
    role: loaded.assignedRole,
    cohortName: loaded.cohort?.name ?? null,
  });
}

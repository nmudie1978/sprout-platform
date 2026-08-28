/**
 * Invitation preview and acceptance.
 *
 * The invariant from section 15 of the spec: if the invitee already has an
 * Endeavrly account, DO NOT create a duplicate. Acceptance adds a membership
 * to the existing user and touches nothing else about their identity, their
 * profile or their journey.
 *
 * GET  ?token=…  Preview — names the organisation for the acceptance screen.
 *                Works signed-out so the invitee can see who invited them
 *                before deciding whether to register.
 * POST           Accept — requires a signed-in account whose email matches.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { InvitationStatus, OrgAuditAction } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import { checkRateLimitAsync, RateLimits, getRateLimitHeaders } from "@/lib/rate-limit";
import { invalidateEntitlements } from "@/lib/entitlements/service";
import { logOrgAudit, requestIp, userActor } from "@/lib/organisations/audit";
import {
  INVITATION_MESSAGES,
  hashInvitationToken,
  validateInvitation,
  type InvitationSnapshot,
} from "@/lib/organisations/invitations";
import { joinOrganisation } from "@/lib/organisations/membership-service";
import { acceptInvitationSchema } from "@/lib/organisations/validation";

async function loadByToken(token: string) {
  // Lookup is by hash — the raw token exists only in the recipient's email.
  return withDbRetry(() =>
    prisma.organisationInvitation.findUnique({
      where: { tokenHash: hashInvitationToken(token) },
      select: {
        id: true,
        organisationId: true,
        email: true,
        role: true,
        cohortId: true,
        status: true,
        expiresAt: true,
        message: true,
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

type LoadedInvitation = NonNullable<Awaited<ReturnType<typeof loadByToken>>>;

function toSnapshot(invitation: LoadedInvitation): InvitationSnapshot {
  return {
    id: invitation.id,
    organisationId: invitation.organisationId,
    organisationName: invitation.organisation.name,
    organisationStatus: invitation.organisation.deletedAt
      ? "ARCHIVED"
      : invitation.organisation.status,
    email: invitation.email,
    role: invitation.role,
    cohortId: invitation.cohortId,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
  };
}

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return apiError("BAD_REQUEST", "No invitation token given.", { request });

  // Unauthenticated endpoint — throttle by IP so the token space can't be
  // walked. Tokens are 256-bit, so this is defence in depth, not the barrier.
  const ip = requestIp(request.headers) ?? "unknown";
  const limit = await checkRateLimitAsync(`invite-preview:${ip}`, RateLimits.STRICT);
  if (!limit.success) {
    return apiError("RATE_LIMITED", "Too many attempts. Try again shortly.", {
      request,
      headers: getRateLimitHeaders(limit.limit, limit.remaining, limit.reset),
    });
  }

  const invitation = await loadByToken(token);
  const session = await getServerSession(authOptions);
  const accountEmail = session?.user?.email ?? null;

  const validation = validateInvitation(
    invitation ? toSnapshot(invitation) : null,
    accountEmail,
    new Date()
  );

  if (!validation.valid) {
    return NextResponse.json({
      valid: false,
      reason: validation.reason,
      message: INVITATION_MESSAGES[validation.reason],
      // The invited address is shown ONLY on a mismatch, and only to someone
      // already holding the token, so they know which account to sign in with.
      invitedEmail:
        validation.reason === "EMAIL_MISMATCH" ? (invitation?.email ?? null) : null,
    });
  }

  const loaded = invitation as LoadedInvitation;
  return NextResponse.json({
    valid: true,
    signedIn: Boolean(session?.user?.id),
    preview: {
      organisationName: loaded.organisation.name,
      organisationType: loaded.organisation.type,
      role: loaded.role,
      cohortName: loaded.cohort?.name ?? null,
      email: loaded.email,
      message: loaded.message,
      privacyNotice: loaded.organisation.settings?.participantPrivacyNotice ?? null,
      dataSharingRequested:
        loaded.organisation.settings?.requireParticipantDataSharingConsent ?? true,
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return apiError("UNAUTHORIZED", "Sign in to accept an invitation.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("BAD_REQUEST", "Invalid JSON body.", { request });
  }

  const parsed = acceptInvitationSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_FAILED", "That invitation link isn't valid.", { request });
  }

  const invitation = await loadByToken(parsed.data.token);
  const validation = validateInvitation(
    invitation ? toSnapshot(invitation) : null,
    session.user.email,
    new Date()
  );

  if (!validation.valid) {
    return NextResponse.json(
      {
        ok: false,
        reason: validation.reason,
        message: INVITATION_MESSAGES[validation.reason],
      },
      { status: 400 }
    );
  }

  const loaded = invitation as LoadedInvitation;

  const durationDays = loaded.organisation.settings?.defaultMembershipDurationDays ?? null;
  const expiresAt = durationDays
    ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
    : null;

  const join = await joinOrganisation({
    userId: session.user.id,
    organisationId: loaded.organisationId,
    role: loaded.role,
    cohortId: loaded.cohortId,
    expiresAt,
    invitationId: loaded.id,
    actor: userActor(session.user.id, session.user.email),
    source: "INVITATION",
  });

  if (!join.ok) {
    // The invitation stays PENDING so it can be honoured once the
    // organisation frees a seat or renews — nothing is consumed on failure.
    const message =
      join.failure === "SEAT_LIMIT_REACHED"
        ? "That organisation has reached its user limit. Let them know and try again later."
        : join.failure === "ALREADY_ACTIVE_MEMBER"
          ? "You're already a member of that organisation."
          : "That organisation doesn't have an active licence right now.";
    return NextResponse.json({ ok: false, reason: join.failure, message }, { status: 409 });
  }

  await prisma.organisationInvitation.update({
    where: { id: loaded.id },
    data: {
      status: InvitationStatus.ACCEPTED,
      acceptedAt: new Date(),
      acceptedByUserId: session.user.id,
    },
  });

  invalidateEntitlements(session.user.id);

  await logOrgAudit({
    action: OrgAuditAction.INVITATION_ACCEPTED,
    actor: userActor(session.user.id, session.user.email),
    actorUserId: session.user.id,
    organisationId: loaded.organisationId,
    targetType: "invitation",
    targetId: loaded.id,
    summary: `Invitation accepted as ${loaded.role}`,
    ipAddress: requestIp(request.headers),
  });

  return NextResponse.json({
    ok: true,
    organisation: {
      id: loaded.organisationId,
      name: loaded.organisation.name,
      slug: loaded.organisation.slug,
    },
    role: loaded.role,
    cohortName: loaded.cohort?.name ?? null,
  });
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateGuardianToken, logAuditAction, recordConsent } from "@/lib/safety";
import { AuditAction, AccountStatus } from "@prisma/client";
import { sendGuardianConsentEmail } from "@/lib/mail";
import { checkRateLimitAsync, getRateLimitHeaders } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-error";

// POST /api/guardian-consent - Request guardian consent (by youth)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return apiError("UNAUTHORIZED", "Please sign in", { request: req });
    }

    // Cap guardian-consent requests to 3 per day per youth. The email
    // is already fire-and-forget via Resend, so without this a youth
    // account could be used to flood a guardian inbox.
    const rateLimit = await checkRateLimitAsync(
      `guardian-consent:${session.user.id}`,
      { interval: 24 * 60 * 60 * 1000, maxRequests: 3 },
    );
    if (!rateLimit.success) {
      return apiError("RATE_LIMITED", "Guardian consent has already been requested multiple times today. Please wait 24 hours or contact support.", {
        request: req,
        headers: getRateLimitHeaders(rateLimit.limit, rateLimit.remaining, rateLimit.reset),
      });
    }

    const body = await req.json();
    const { guardianEmail } = body;

    if (!guardianEmail || !guardianEmail.includes("@")) {
      return apiError("VALIDATION_FAILED", "Valid guardian email is required", { request: req, details: { field: "guardianEmail" } });
    }

    // Generate unique token for guardian consent link.
    // Tokens expire after 14 days — balances "guardian checks email
    // when convenient" against the risk of a stale token sitting
    // in a forwarded inbox forever. The youth can always re-request
    // (rate-limited to 3/day) which rotates the token.
    const guardianToken = generateGuardianToken();
    const guardianTokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Update youth profile with guardian email and token
    const updated = await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        guardianEmail,
        guardianToken,
        guardianTokenExpiresAt,
        guardianConsent: false, // Reset if they're re-requesting
        guardianConsentAt: null,
      },
      select: { displayName: true, user: { select: { fullName: true } } },
    });

    // Log the consent request
    await logAuditAction({
      userId: session.user.id,
      action: AuditAction.GUARDIAN_CONSENT_REQUESTED,
      metadata: { guardianEmail },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // Create notification for youth
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "GUARDIAN_CONSENT_REQUESTED",
        title: "Guardian Consent Requested",
        message: `A consent request has been sent to ${guardianEmail}. Please ask your guardian to check their email.`,
      },
    });

    // Send the actual email via Resend. Fire-and-forget so a transient
    // mail outage never blocks the youth from re-trying. The consent link
    // is delivered via email only — never returned to the client.
    const firstName = updated.displayName || updated.user.fullName?.split(" ")[0] || "Your child";
    const fullDisplay = updated.user.fullName || updated.displayName || firstName;
    sendGuardianConsentEmail({
      guardianEmail,
      youthDisplayName: fullDisplay,
      youthFirstName: firstName,
      consentToken: guardianToken,
    }).catch((err) => {
      console.error("[guardian-consent] Email send failed:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Guardian consent request sent. Please ask your guardian to check their email.",
    });
  } catch (error) {
    console.error("Failed to request guardian consent:", error);
    return NextResponse.json(
      { error: "Failed to request guardian consent" },
      { status: 500 }
    );
  }
}

// GET /api/guardian-consent?token=xxx - Get consent request info (by guardian)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return apiError("VALIDATION_FAILED", "Token is required", { request: req, details: { field: "token" } });
    }

    // Find youth profile by guardian token
    const youthProfile = await prisma.youthProfile.findUnique({
      where: { guardianToken: token },
      select: {
        displayName: true,
        guardianConsent: true,
        guardianConsentAt: true,
        guardianTokenExpiresAt: true,
        user: {
          select: {
            email: true,
            dateOfBirth: true,
            createdAt: true,
          },
        },
      },
    });

    if (!youthProfile) {
      return apiError("INVALID_TOKEN", "Invalid or expired consent token", { request: req, status: 404 });
    }

    // Enforce token expiry. NULL expiresAt = pre-migration legacy
    // token; we grandfather those so existing in-flight requests
    // don't break the day the migration lands. All tokens issued
    // after this code ships have a set expiresAt.
    if (
      youthProfile.guardianTokenExpiresAt &&
      youthProfile.guardianTokenExpiresAt < new Date()
    ) {
      return apiError("TOKEN_EXPIRED", "This consent link has expired. Please ask the young person to re-send it from their profile.", {
        request: req,
        details: { expired: true },
      });
    }

    // Calculate age for display
    let age: number | null = null;
    if (youthProfile.user.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(youthProfile.user.dateOfBirth);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    return NextResponse.json({
      displayName: youthProfile.displayName,
      email: youthProfile.user.email,
      age,
      alreadyConsented: youthProfile.guardianConsent,
      consentedAt: youthProfile.guardianConsentAt,
      accountCreatedAt: youthProfile.user.createdAt,
    });
  } catch (error) {
    console.error("Failed to get consent info:", error);
    return NextResponse.json(
      { error: "Failed to get consent information" },
      { status: 500 }
    );
  }
}

// PUT /api/guardian-consent - Grant consent (by guardian)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, consent, guardianName } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    if (consent !== true) {
      return NextResponse.json(
        { error: "Consent must be explicitly granted" },
        { status: 400 }
      );
    }

    // Find youth profile by guardian token
    const youthProfile = await prisma.youthProfile.findUnique({
      where: { guardianToken: token },
      select: {
        id: true,
        userId: true,
        displayName: true,
        guardianConsent: true,
        guardianTokenExpiresAt: true,
      },
    });

    if (!youthProfile) {
      return NextResponse.json(
        { error: "Invalid or expired consent token" },
        { status: 404 }
      );
    }

    // Expiry gate — see GET handler for grandfathering rationale.
    if (
      youthProfile.guardianTokenExpiresAt &&
      youthProfile.guardianTokenExpiresAt < new Date()
    ) {
      return NextResponse.json(
        {
          error: "This consent link has expired. Please ask the young person to re-send it from their profile.",
          expired: true,
        },
        { status: 410 }
      );
    }

    if (youthProfile.guardianConsent) {
      return NextResponse.json(
        { error: "Consent has already been granted" },
        { status: 400 }
      );
    }

    // Update youth profile with consent
    await prisma.youthProfile.update({
      where: { id: youthProfile.id },
      data: {
        guardianConsent: true,
        guardianConsentAt: new Date(),
        // Clear token + its expiry after use (one-time use)
        guardianToken: null,
        guardianTokenExpiresAt: null,
      },
    });

    // Update user account status to ACTIVE
    await prisma.user.update({
      where: { id: youthProfile.userId },
      data: {
        accountStatus: AccountStatus.ACTIVE,
      },
    });

    // Log the consent grant
    await logAuditAction({
      userId: youthProfile.userId,
      action: AuditAction.GUARDIAN_CONSENT_GRANTED,
      metadata: { guardianName },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // Record consent for GDPR
    await recordConsent({
      userId: youthProfile.userId,
      consentType: "guardian",
      version: "1.0",
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // Create notification for youth
    await prisma.notification.create({
      data: {
        userId: youthProfile.userId,
        type: "GUARDIAN_CONSENT_RECEIVED",
        title: "Guardian Consent Received!",
        message: "Your guardian has approved your account. You can now apply to jobs and send messages.",
        link: "/dashboard",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Consent granted for ${youthProfile.displayName}`,
    });
  } catch (error) {
    console.error("Failed to grant guardian consent:", error);
    return NextResponse.json(
      { error: "Failed to grant consent" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateGuardianToken, logAuditAction, recordConsent } from "@/lib/safety";
import { AuditAction, AccountStatus } from "@prisma/client";

// POST /api/guardian-consent - Request guardian consent (by youth)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { guardianEmail } = body;

    if (!guardianEmail || !guardianEmail.includes("@")) {
      return NextResponse.json(
        { error: "Valid guardian email is required" },
        { status: 400 }
      );
    }

    // Generate unique token for guardian consent link
    const guardianToken = generateGuardianToken();

    // Update youth profile with guardian email and token
    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        guardianEmail,
        guardianToken,
        guardianConsent: false, // Reset if they're re-requesting
        guardianConsentAt: null,
      },
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

    // TODO: In production, send actual email to guardian with consent link
    // For MVP, we'll just return the token so it can be used directly
    const consentLink = `/guardian-consent/${guardianToken}`;

    return NextResponse.json({
      success: true,
      message: "Guardian consent request sent",
      // Include link for testing (remove in production)
      _testConsentLink: consentLink,
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
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Find youth profile by guardian token
    const youthProfile = await prisma.youthProfile.findUnique({
      where: { guardianToken: token },
      select: {
        displayName: true,
        guardianConsent: true,
        guardianConsentAt: true,
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
      return NextResponse.json(
        { error: "Invalid or expired consent token" },
        { status: 404 }
      );
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
      },
    });

    if (!youthProfile) {
      return NextResponse.json(
        { error: "Invalid or expired consent token" },
        { status: 404 }
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
        // Clear token after use (one-time use)
        guardianToken: null,
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

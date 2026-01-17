/**
 * Mock EID (BankID/Vipps) Verification Endpoint
 *
 * In production, this would integrate with:
 * - Norwegian BankID (https://www.bankid.no/)
 * - Vipps Login (https://vipps.no/login/)
 *
 * For MVP/testing, we simulate the verification flow.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditAction, calculateAge, MIN_EMPLOYER_AGE } from "@/lib/safety";
import { AuditAction, AccountStatus } from "@prisma/client";

// Mock verification delay to simulate real API call
const MOCK_VERIFICATION_DELAY_MS = 1500;

// POST /api/employer/verify-eid - Initiate EID verification
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { provider, mockMode } = body;

    // Validate provider
    const validProviders = ["bankid", "vipps", "mock"];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: "Invalid verification provider" },
        { status: 400 }
      );
    }

    // Check if already verified
    const existingProfile = await prisma.employerProfile.findUnique({
      where: { userId: session.user.id },
      select: { eidVerified: true },
    });

    if (existingProfile?.eidVerified) {
      return NextResponse.json(
        { error: "Account is already EID verified" },
        { status: 400 }
      );
    }

    // Log verification attempt
    await logAuditAction({
      userId: session.user.id,
      action: AuditAction.EID_VERIFICATION_STARTED,
      metadata: { provider },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // In production, redirect to BankID/Vipps OAuth flow
    // For MVP, we use a mock flow

    if (provider === "mock" || mockMode) {
      // Mock mode: Generate a verification token that can be completed immediately
      const verificationToken = crypto.randomUUID();

      // Store verification session (in production, use Redis or similar)
      // For MVP, we'll use a simple approach with the token in the response

      return NextResponse.json({
        status: "pending",
        verificationToken,
        provider: "mock",
        message: "Mock verification initiated. Complete by calling PUT with the token.",
        // In production, this would be a redirect URL to BankID/Vipps
        redirectUrl: `/employer/settings?verifyEid=${verificationToken}`,
      });
    }

    // Production flow would return redirect URLs for BankID/Vipps
    return NextResponse.json({
      status: "pending",
      message: `Redirect to ${provider} for verification`,
      // These would be real OAuth URLs in production
      redirectUrl: `https://${provider}.example.com/auth?client_id=xxx&redirect_uri=xxx`,
    });
  } catch (error) {
    console.error("EID verification initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate EID verification" },
      { status: 500 }
    );
  }
}

// PUT /api/employer/verify-eid - Complete EID verification (mock callback)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { verificationToken, mockData } = body;

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, MOCK_VERIFICATION_DELAY_MS));

    // In production, verify the token with BankID/Vipps callback
    // For mock, we accept any token and use the provided mock data

    // Mock verification data (in production, this comes from BankID/Vipps)
    const verifiedData = mockData || {
      nationalId: "12345678901", // Norwegian national ID (fødselsnummer)
      dateOfBirth: "1990-01-15",
      name: "Test Employer",
    };

    // Calculate age from verified date of birth
    const birthDate = new Date(verifiedData.dateOfBirth);
    const age = calculateAge(birthDate);

    if (age < MIN_EMPLOYER_AGE) {
      await logAuditAction({
        userId: session.user.id,
        action: AuditAction.EID_VERIFICATION_FAILED,
        metadata: { reason: "underage", age },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      });

      return NextResponse.json(
        { error: `You must be at least ${MIN_EMPLOYER_AGE} years old to hire youth workers` },
        { status: 400 }
      );
    }

    // Update user with verified date of birth
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dateOfBirth: birthDate,
        accountStatus: AccountStatus.ACTIVE,
      },
    });

    // Update employer profile with EID verification
    await prisma.employerProfile.update({
      where: { userId: session.user.id },
      data: {
        eidVerified: true,
        eidVerifiedAt: new Date(),
        eidProvider: "mock", // In production: "bankid" or "vipps"
        ageVerified: true,
        dateOfBirth: birthDate,
      },
    });

    // Log successful verification
    await logAuditAction({
      userId: session.user.id,
      action: AuditAction.EID_VERIFICATION_COMPLETED,
      metadata: {
        provider: "mock",
        age,
        // Don't log nationalId for privacy
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "ACCOUNT_VERIFIED",
        title: "Identity Verified!",
        message: "Your identity has been verified. You can now post jobs and connect with youth workers.",
        link: "/employer/dashboard",
      },
    });

    return NextResponse.json({
      success: true,
      eidVerified: true,
      ageVerified: true,
      age,
      accountStatus: AccountStatus.ACTIVE,
    });
  } catch (error) {
    console.error("EID verification completion error:", error);

    // Log failure
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await logAuditAction({
        userId: session.user.id,
        action: AuditAction.EID_VERIFICATION_FAILED,
        metadata: { error: "completion_error" },
      });
    }

    return NextResponse.json(
      { error: "Failed to complete EID verification" },
      { status: 500 }
    );
  }
}

// GET /api/employer/verify-eid - Check EID verification status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.employerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        eidVerified: true,
        eidVerifiedAt: true,
        eidProvider: true,
        ageVerified: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        accountStatus: true,
        dateOfBirth: true,
      },
    });

    return NextResponse.json({
      eidVerified: profile?.eidVerified || false,
      eidVerifiedAt: profile?.eidVerifiedAt,
      eidProvider: profile?.eidProvider,
      ageVerified: profile?.ageVerified || false,
      accountStatus: user?.accountStatus,
      // Available providers for verification
      availableProviders: [
        { id: "mock", name: "Mock Verification (Testing)", available: true },
        { id: "bankid", name: "BankID", available: false, comingSoon: true },
        { id: "vipps", name: "Vipps Login", available: false, comingSoon: true },
      ],
    });
  } catch (error) {
    console.error("EID verification status error:", error);
    return NextResponse.json(
      { error: "Failed to get verification status" },
      { status: 500 }
    );
  }
}

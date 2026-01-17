import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to accept terms" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const acceptanceTimestamp = new Date();

    // Check if user already has an acceptance record
    const existingAcceptance = await prisma.legalAcceptance.findUnique({
      where: { userId },
    });

    if (existingAcceptance) {
      // Update existing record with new acceptance
      await prisma.legalAcceptance.update({
        where: { userId },
        data: {
          acceptedTermsAt: acceptanceTimestamp,
          acceptedPrivacyAt: acceptanceTimestamp,
          termsVersion: "v1",
          privacyVersion: "v1",
          ipAddress: req.headers.get("x-forwarded-for") || undefined,
          userAgent: req.headers.get("user-agent") || undefined,
        },
      });
    } else {
      // Create new acceptance record
      await prisma.legalAcceptance.create({
        data: {
          userId,
          acceptedTermsAt: acceptanceTimestamp,
          acceptedPrivacyAt: acceptanceTimestamp,
          termsVersion: "v1",
          privacyVersion: "v1",
          ipAddress: req.headers.get("x-forwarded-for") || undefined,
          userAgent: req.headers.get("user-agent") || undefined,
        },
      });
    }

    // Log the acceptance in audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: AuditAction.TERMS_ACCEPTED,
        metadata: {
          termsVersion: "v1",
          privacyVersion: "v1",
          acceptedAt: acceptanceTimestamp.toISOString(),
        },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error accepting terms:", error);
    return NextResponse.json(
      { error: "Failed to record acceptance" },
      { status: 500 }
    );
  }
}

// GET endpoint to check if user has accepted terms
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const acceptance = await prisma.legalAcceptance.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      hasAccepted: !!acceptance,
      acceptance: acceptance
        ? {
            acceptedTermsAt: acceptance.acceptedTermsAt,
            acceptedPrivacyAt: acceptance.acceptedPrivacyAt,
            termsVersion: acceptance.termsVersion,
            privacyVersion: acceptance.privacyVersion,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking acceptance:", error);
    return NextResponse.json(
      { error: "Failed to check acceptance status" },
      { status: 500 }
    );
  }
}

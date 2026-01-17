import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditAction, calculateAge, MIN_EMPLOYER_AGE } from "@/lib/safety";
import { AuditAction, AccountStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dateOfBirth } = await req.json();

    if (!dateOfBirth) {
      return NextResponse.json(
        { error: "Date of birth is required" },
        { status: 400 }
      );
    }

    const birthDate = new Date(dateOfBirth);
    const age = calculateAge(birthDate);

    if (age < MIN_EMPLOYER_AGE) {
      return NextResponse.json(
        { error: `You must be at least ${MIN_EMPLOYER_AGE} years old to post jobs` },
        { status: 400 }
      );
    }

    // Update user with date of birth
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dateOfBirth: birthDate,
        accountStatus: AccountStatus.ACTIVE,
      },
    });

    // Update employer profile with age verification flag
    const profile = await prisma.employerProfile.update({
      where: { userId: session.user.id },
      data: {
        dateOfBirth: birthDate, // Keep for backwards compatibility
        ageVerified: true,
      },
    });

    // Log the verification
    await logAuditAction({
      userId: session.user.id,
      action: AuditAction.AGE_VERIFIED,
      metadata: { age, method: "self-declaration" },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "ACCOUNT_VERIFIED",
        title: "Age Verified!",
        message: "Your age has been verified. You can now post jobs and connect with youth workers.",
        link: "/employer/dashboard",
      },
    });

    return NextResponse.json({
      success: true,
      ageVerified: profile.ageVerified,
      age,
    });
  } catch (error) {
    console.error("Age verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify age" },
      { status: 500 }
    );
  }
}

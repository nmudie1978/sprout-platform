export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountStatus, AgeBracket, YouthAgeBand } from "@prisma/client";
import { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from "@/lib/legal/versions";

// Helper to calculate age from birthdate
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Helper to determine age bracket from age
function getAgeBracket(age: number): AgeBracket | null {
  if (age >= 16 && age <= 17) return "SIXTEEN_SEVENTEEN";
  if (age >= 18 && age <= 20) return "EIGHTEEN_TWENTY";
  return null;
}

// Helper to determine youth age band from age
function getYouthAgeBand(age: number): YouthAgeBand | null {
  if (age < 16) return "UNDER_SIXTEEN";
  if (age >= 16 && age <= 17) return "SIXTEEN_SEVENTEEN";
  if (age >= 18 && age <= 20) return "EIGHTEEN_TWENTY";
  return null;
}

interface CompleteProfileRequest {
  role: "YOUTH";
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: CompleteProfileRequest = await request.json();
    const { role, acceptedTerms, acceptedPrivacy } = body;

    // Endeavrly is a youth-only platform — the only role created here is YOUTH.
    if (role !== "YOUTH") {
      return NextResponse.json(
        { error: "Invalid role." },
        { status: 400 }
      );
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      return NextResponse.json(
        { error: "You must accept the Terms of Service and Privacy Policy" },
        { status: 400 }
      );
    }

    // Get user with VIPPS data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        dateOfBirth: true,
        phoneNumber: true,
        accountStatus: true,
        youthProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify user is in ONBOARDING status
    if (user.accountStatus !== "ONBOARDING") {
      return NextResponse.json(
        { error: "Profile already completed" },
        { status: 400 }
      );
    }

    // Calculate age if birthdate exists
    let age: number | null = null;
    let ageBracket: AgeBracket | null = null;
    let youthAgeBand: YouthAgeBand | null = null;

    if (user.dateOfBirth) {
      age = calculateAge(user.dateOfBirth);
      ageBracket = getAgeBracket(age);
      youthAgeBand = getYouthAgeBand(age);
    }

    // Enforce the 15+ signup floor.
    if (age !== null && age < 15) {
      return NextResponse.json(
        { error: "You must be at least 15 years old to register" },
        { status: 400 }
      );
    }

    // All youth (15–23) are ACTIVE on creation — age is a roadmap signal,
    // not a gate, and there is no guardian-consent barrier. See CLAUDE.md
    // <age_policy>.
    const accountStatus: AccountStatus = "ACTIVE";

    // Start transaction to update user and create profile
    const result = await prisma.$transaction(async (tx) => {
      // Update user with role and status
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          role: "YOUTH",
          accountStatus,
          ageBracket,
          youthAgeBand,
          isVerifiedAdult: age !== null && age >= 18,
          verificationProvider: "VIPPS",
          verifiedAt: new Date(),
        },
      });

      // Create YouthProfile
      await tx.youthProfile.create({
        data: {
          userId: user.id,
          displayName: user.fullName || user.email.split("@")[0],
          phoneNumber: user.phoneNumber,
          // No guardian-consent barrier — every youth account is good to
          // go on creation. See CLAUDE.md <age_policy>.
          guardianConsent: true,
        },
      });

      // Create LegalAcceptance record
      await tx.legalAcceptance.create({
        data: {
          userId: user.id,
          acceptedTermsAt: new Date(),
          acceptedPrivacyAt: new Date(),
          termsVersion: CURRENT_TERMS_VERSION,
          privacyVersion: CURRENT_PRIVACY_VERSION,
        },
      });

      // Log the profile completion
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "TERMS_ACCEPTED",
          targetType: "user",
          targetId: user.id,
          metadata: {
            role,
            provider: "VIPPS",
            acceptedTerms,
            acceptedPrivacy,
          },
        },
      });

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      user: {
        id: result.id,
        role: result.role,
        accountStatus: result.accountStatus,
      },
      redirectUrl: "/dashboard",
      message: "Profile completed successfully!",
    });
  } catch (error) {
    console.error("Complete profile error:", error);
    return NextResponse.json(
      { error: "Failed to complete profile. Please try again." },
      { status: 500 }
    );
  }
}

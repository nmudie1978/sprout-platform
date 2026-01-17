import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, AccountStatus, AgeBracket, YouthAgeBand } from "@prisma/client";

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
  role: "YOUTH" | "EMPLOYER";
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  companyName?: string; // Required for employers
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
    const { role, acceptedTerms, acceptedPrivacy, companyName } = body;

    // Validate required fields
    if (!role || !["YOUTH", "EMPLOYER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be YOUTH or EMPLOYER" },
        { status: 400 }
      );
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      return NextResponse.json(
        { error: "You must accept the Terms of Service and Privacy Policy" },
        { status: 400 }
      );
    }

    if (role === "EMPLOYER" && !companyName?.trim()) {
      return NextResponse.json(
        { error: "Company name is required for employers" },
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
        employerProfile: true,
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

    // Validate age requirements based on role
    if (role === "YOUTH") {
      if (age !== null) {
        if (age < 15) {
          return NextResponse.json(
            { error: "You must be at least 15 years old to register as a youth worker" },
            { status: 400 }
          );
        }
        if (age > 20) {
          return NextResponse.json(
            { error: "Youth workers must be 20 or younger. Please register as an employer instead." },
            { status: 400 }
          );
        }
      }
    }

    if (role === "EMPLOYER") {
      if (age !== null && age < 18) {
        return NextResponse.json(
          { error: "You must be at least 18 years old to register as an employer" },
          { status: 400 }
        );
      }
    }

    // Determine account status based on role and age
    let accountStatus: AccountStatus;
    if (role === "YOUTH") {
      // Youth under 18 needs guardian consent
      accountStatus = age !== null && age < 18 ? "PENDING_VERIFICATION" : "ACTIVE";
    } else {
      // Employers need to complete company setup
      accountStatus = "ONBOARDING";
    }

    // Start transaction to update user and create profile
    const result = await prisma.$transaction(async (tx) => {
      // Update user with role and status
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          role: role as UserRole,
          accountStatus,
          ageBracket,
          youthAgeBand,
          isVerifiedAdult: age !== null && age >= 18,
          verificationProvider: "VIPPS",
          verifiedAt: new Date(),
        },
      });

      // Create role-specific profile
      if (role === "YOUTH") {
        // Create YouthProfile
        await tx.youthProfile.create({
          data: {
            userId: user.id,
            displayName: user.fullName || user.email.split("@")[0],
            phoneNumber: user.phoneNumber,
            guardianConsent: age !== null && age >= 18, // Auto-consent for adults
          },
        });
      } else {
        // Create EmployerProfile
        await tx.employerProfile.create({
          data: {
            userId: user.id,
            companyName: companyName!.trim(),
            phoneNumber: user.phoneNumber,
            ageVerified: age !== null && age >= 18,
            dateOfBirth: user.dateOfBirth,
          },
        });
      }

      // Create LegalAcceptance record
      await tx.legalAcceptance.create({
        data: {
          userId: user.id,
          acceptedTermsAt: new Date(),
          acceptedPrivacyAt: new Date(),
          termsVersion: "v1",
          privacyVersion: "v1",
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

      // If youth needs guardian consent, log that too
      if (role === "YOUTH" && age !== null && age < 18) {
        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "GUARDIAN_CONSENT_REQUESTED",
            targetType: "user",
            targetId: user.id,
            metadata: { age, requiresConsent: true },
          },
        });
      }

      return updatedUser;
    });

    // Determine redirect URL based on role and status
    let redirectUrl = "/dashboard";
    if (role === "EMPLOYER") {
      redirectUrl = "/employer/dashboard";
    } else if (accountStatus === "PENDING_VERIFICATION") {
      redirectUrl = "/auth/pending-verification";
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.id,
        role: result.role,
        accountStatus: result.accountStatus,
      },
      redirectUrl,
      message: role === "YOUTH" && accountStatus === "PENDING_VERIFICATION"
        ? "Account created! Guardian consent is required before you can apply for jobs."
        : "Profile completed successfully!",
    });
  } catch (error) {
    console.error("Complete profile error:", error);
    return NextResponse.json(
      { error: "Failed to complete profile. Please try again." },
      { status: 500 }
    );
  }
}

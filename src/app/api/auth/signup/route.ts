import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AccountStatus, AuditAction } from "@prisma/client";
import {
  calculateAge,
  logAuditAction,
  MIN_YOUTH_AGE,
  MAX_YOUTH_AGE,
  MIN_EMPLOYER_AGE,
  validateAgeBracket,
} from "@/lib/safety";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, ageBracket, dateOfBirth, acceptedTerms, acceptedPrivacy } = await req.json();

    // Validate legal acceptance
    if (!acceptedTerms || !acceptedPrivacy) {
      return NextResponse.json(
        { error: "You must accept the Terms of Service and Privacy Policy to create an account" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Validate date of birth for youth users
    let birthDate: Date | null = null;
    let age: number | null = null;
    let initialAccountStatus: AccountStatus = AccountStatus.ONBOARDING;

    if (role === "YOUTH") {
      if (!dateOfBirth) {
        return NextResponse.json(
          { error: "Date of birth is required for youth workers" },
          { status: 400 }
        );
      }

      birthDate = new Date(dateOfBirth);
      age = calculateAge(birthDate);

      // Validate age is within acceptable range (15-20)
      if (age < MIN_YOUTH_AGE) {
        return NextResponse.json(
          { error: `You must be at least ${MIN_YOUTH_AGE} years old to register` },
          { status: 400 }
        );
      }

      if (age > MAX_YOUTH_AGE) {
        return NextResponse.json(
          { error: `Youth workers must be ${MAX_YOUTH_AGE} or younger. Consider registering as an employer.` },
          { status: 400 }
        );
      }

      // Validate age bracket matches date of birth
      const expectedBracket = validateAgeBracket(birthDate);
      if (ageBracket && expectedBracket && ageBracket !== expectedBracket) {
        return NextResponse.json(
          { error: "Age bracket does not match your date of birth" },
          { status: 400 }
        );
      }

      // Youth under 18 need guardian consent before becoming ACTIVE
      if (age < 18) {
        initialAccountStatus = AccountStatus.PENDING_VERIFICATION;
      } else {
        initialAccountStatus = AccountStatus.ACTIVE;
      }
    } else if (role === "EMPLOYER") {
      // Employers must be at least 18 years old
      if (dateOfBirth) {
        birthDate = new Date(dateOfBirth);
        age = calculateAge(birthDate);

        if (age < MIN_EMPLOYER_AGE) {
          return NextResponse.json(
            { error: `Employers must be at least ${MIN_EMPLOYER_AGE} years old` },
            { status: 400 }
          );
        }
      }
      // Employers need age verification before becoming ACTIVE
      initialAccountStatus = AccountStatus.ONBOARDING;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        ageBracket: ageBracket || null,
        dateOfBirth: birthDate,
        accountStatus: initialAccountStatus,
      },
    });

    // Create employer profile if role is EMPLOYER
    if (role === "EMPLOYER") {
      await prisma.employerProfile.create({
        data: {
          userId: newUser.id,
          companyName: email.split("@")[0], // Default company name from email
        },
      });
    }

    // Create legal acceptance record
    const acceptanceTimestamp = new Date();
    await prisma.legalAcceptance.create({
      data: {
        userId: newUser.id,
        acceptedTermsAt: acceptanceTimestamp,
        acceptedPrivacyAt: acceptanceTimestamp,
        termsVersion: "v1",
        privacyVersion: "v1",
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    // Log account creation
    await logAuditAction({
      userId: newUser.id,
      action: AuditAction.ACCOUNT_CREATED,
      metadata: {
        role,
        age,
        accountStatus: initialAccountStatus,
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // Return success with account status info
    return NextResponse.json({
      success: true,
      accountStatus: initialAccountStatus,
      requiresGuardianConsent: role === "YOUTH" && age !== null && age < 18,
      requiresAgeVerification: role === "EMPLOYER",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

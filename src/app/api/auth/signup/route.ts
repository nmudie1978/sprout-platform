export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AccountStatus, AuditAction } from "@prisma/client";
import {
  generateGuardianToken,
  logAuditAction,
  MIN_EMPLOYER_AGE,
  validateAgeBracket,
} from "@/lib/safety";
import {
  getAge,
  getAgeBand,
  validateSignupAge,
  PLATFORM_MIN_AGE,
  PLATFORM_MAX_AGE,
} from "@/lib/safety/age";
import { sendGuardianConsentEmail } from "@/lib/mail";
import { checkRateLimitAsync, getRateLimitHeaders, RateLimits } from "@/lib/rate-limit";
import { isSchoolEmail } from "@/lib/education/school-domains";

export async function POST(req: NextRequest) {
  try {
    // Per-IP rate limit — the user doesn't have an account yet, so IP is
    // the only available identifier. STRICT (10/min) stops scripted
    // account-creation spam. Accepts `x-forwarded-for` from Vercel.
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rateLimit = await checkRateLimitAsync(`signup:${ip}`, RateLimits.STRICT);
    if (!rateLimit.success) {
      const response = NextResponse.json(
        { error: "Too many signup attempts from this network. Please try again shortly." },
        { status: 429 }
      );
      Object.entries(
        getRateLimitHeaders(rateLimit.limit, rateLimit.remaining, rateLimit.reset)
      ).forEach(([k, v]) => response.headers.set(k, v));
      return response;
    }

    const { firstName, lastName, surname, email, password, role, ageBracket, dateOfBirth, guardianEmail, acceptedTerms, acceptedPrivacy } = await req.json();

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

    // Validate name
    const trimmedFirst = (firstName || "").trim();
    const trimmedSurname = (surname || lastName || "").trim();
    if (!trimmedFirst) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }
    const fullName = trimmedSurname ? `${trimmedFirst} ${trimmedSurname}` : trimmedFirst;

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Validate date of birth for youth users
    // SAFETY INVARIANT: Platform minimum age is 16 (hard block under-16)
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
      age = getAge(birthDate);

      // CORE SAFETY CHECK: Validate age using canonical function
      const ageValidation = validateSignupAge(dateOfBirth);
      if (!ageValidation.valid) {
        return NextResponse.json(
          { error: ageValidation.error },
          { status: 400 }
        );
      }

      // Double-check age constraints server-side (defense in depth)
      if (age === null || age < PLATFORM_MIN_AGE) {
        return NextResponse.json(
          { error: `Endeavrly is for users aged ${PLATFORM_MIN_AGE}-${PLATFORM_MAX_AGE}. You must be at least ${PLATFORM_MIN_AGE} to create an account.` },
          { status: 400 }
        );
      }

      if (age > PLATFORM_MAX_AGE) {
        return NextResponse.json(
          { error: `Youth workers must be ${PLATFORM_MAX_AGE} or younger. Consider registering as an employer.` },
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
      // Youth 18-20 can be ACTIVE immediately
      if (age < 18) {
        initialAccountStatus = AccountStatus.PENDING_VERIFICATION;
      } else {
        initialAccountStatus = AccountStatus.ACTIVE;
      }
    } else if (role === "TEACHER") {
      // Teachers must be 18+ and use a recognised school domain.
      // The domain check is a signup-time filter — it's not a
      // substitute for human review. /admin can still suspend a
      // teacher account at any time.
      if (!isSchoolEmail(email)) {
        return NextResponse.json(
          {
            error:
              "Teacher accounts require a school email address (e.g. *.skole.no, *.vgs.no, *.fylkeskommune.no, .edu). If your school isn't on the list, contact support.",
          },
          { status: 400 }
        );
      }

      if (!dateOfBirth) {
        return NextResponse.json(
          { error: "Date of birth is required to create a teacher account." },
          { status: 400 }
        );
      }

      birthDate = new Date(dateOfBirth);
      age = getAge(birthDate);

      if (age === null || Number.isNaN(birthDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid date of birth" },
          { status: 400 }
        );
      }

      if (age < 18) {
        return NextResponse.json(
          { error: "Teachers must be at least 18 years old." },
          { status: 400 }
        );
      }

      // Teachers are ACTIVE on creation — they're not trusted with
      // youth PII (aggregated cohort data only), so no EID step.
      initialAccountStatus = AccountStatus.ACTIVE;
    } else if (role === "EMPLOYER") {
      // Employers MUST provide DOB and prove 18+. Previously DOB was
      // optional, leaving `ageVerified=false` as the only gate — but
      // that's an onboarding state, not a hard block on signup itself.
      // Require a self-declared age here; EID verification (Vipps/BankID)
      // is the stronger second gate before job posting.
      if (!dateOfBirth) {
        return NextResponse.json(
          { error: "Date of birth is required to create an employer account." },
          { status: 400 }
        );
      }

      birthDate = new Date(dateOfBirth);
      age = getAge(birthDate);

      if (age === null || Number.isNaN(birthDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid date of birth" },
          { status: 400 }
        );
      }

      if (age < MIN_EMPLOYER_AGE) {
        return NextResponse.json(
          { error: `Employers must be at least ${MIN_EMPLOYER_AGE} years old.` },
          { status: 400 }
        );
      }

      // Employers still need EID verification before becoming ACTIVE.
      // Self-declared age is a floor, not a substitute.
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
        fullName,
        ageBracket: ageBracket || null,
        dateOfBirth: birthDate,
        accountStatus: initialAccountStatus,
      },
    });

    // Create role-specific profiles
    if (role === "YOUTH") {
      // Under-18 users supply a guardian email at signup so the consent
      // flow can kick off immediately. Generate a token now so the parent
      // can be emailed without an extra round-trip.
      const needsGuardianConsent = age !== null && age < 18;
      const guardianToken = needsGuardianConsent ? generateGuardianToken() : null;
      const trimmedGuardianEmail =
        needsGuardianConsent && typeof guardianEmail === "string"
          ? guardianEmail.trim()
          : null;

      await prisma.youthProfile.create({
        data: {
          userId: newUser.id,
          displayName: trimmedFirst,
          surname: trimmedSurname || null,
          guardianConsent: !needsGuardianConsent,
          guardianEmail: trimmedGuardianEmail,
          guardianToken: guardianToken,
        },
      });

      // Log the consent request and fire off the guardian email via Resend.
      // The audit log is the source of truth — if mail fails (e.g. Resend
      // outage) the youth account still exists and the email can be re-
      // triggered later from the profile page.
      if (needsGuardianConsent && trimmedGuardianEmail && guardianToken) {
        await logAuditAction({
          userId: newUser.id,
          action: AuditAction.GUARDIAN_CONSENT_REQUESTED,
          metadata: { guardianEmail: trimmedGuardianEmail, atSignup: true },
          ipAddress: req.headers.get("x-forwarded-for") || undefined,
          userAgent: req.headers.get("user-agent") || undefined,
        });

        // Fire-and-forget — don't block signup if Resend is slow or
        // misconfigured. Errors are logged inside sendMail().
        sendGuardianConsentEmail({
          guardianEmail: trimmedGuardianEmail,
          youthDisplayName: `${trimmedFirst} ${trimmedSurname}`.trim(),
          youthFirstName: trimmedFirst,
          consentToken: guardianToken,
        }).catch((err) => {
          console.error("[signup] Guardian email send failed:", err);
        });
      }
    } else if (role === "EMPLOYER") {
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

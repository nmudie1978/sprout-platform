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

    const { firstName, lastName, surname, email: rawEmail, password, role, ageBracket, dateOfBirth, guardianEmail: rawGuardianEmail, acceptedTerms, acceptedPrivacy } = await req.json();

    // Normalise emails: trim + lowercase so the account is stored in a
    // canonical form. Without this, signing up as "Foo@Bar.com" and later
    // signing in as "foo@bar.com" would fail the lookup and lock the user
    // out. The sign-in path (src/lib/auth.ts) normalises the same way.
    const email =
      typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : rawEmail;
    const guardianEmail =
      typeof rawGuardianEmail === "string"
        ? rawGuardianEmail.trim().toLowerCase()
        : rawGuardianEmail;

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

    // Under-18 youth supply a guardian email at signup so the consent flow
    // can kick off immediately. Compute these before the transaction so we
    // can reuse them for the post-commit email.
    const needsGuardianConsent = role === "YOUTH" && age !== null && age < 18;
    const guardianToken = needsGuardianConsent ? generateGuardianToken() : null;
    const trimmedGuardianEmail =
      needsGuardianConsent && typeof guardianEmail === "string"
        ? guardianEmail.trim()
        : null;
    const acceptanceTimestamp = new Date();
    const ipAddress = req.headers.get("x-forwarded-for") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    // Create the account atomically. Wrapping the user + profile + legal
    // acceptance in ONE transaction means a single pooled connection and
    // all-or-nothing semantics — no half-created accounts, and far less
    // connection pressure than 3+ sequential round-trips (which was causing
    // intermittent 500s on cold serverless invocations).
    const newUser = await withDbRetry(() => prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
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

      if (role === "YOUTH") {
        await tx.youthProfile.create({
          data: {
            userId: createdUser.id,
            displayName: trimmedFirst,
            surname: trimmedSurname || null,
            guardianConsent: !needsGuardianConsent,
            guardianEmail: trimmedGuardianEmail,
            guardianToken: guardianToken,
          },
        });
      } else if (role === "EMPLOYER") {
        await tx.employerProfile.create({
          data: {
            userId: createdUser.id,
            companyName: email.split("@")[0], // Default company name from email
          },
        });
      }

      await tx.legalAcceptance.create({
        data: {
          userId: createdUser.id,
          acceptedTermsAt: acceptanceTimestamp,
          acceptedPrivacyAt: acceptanceTimestamp,
          termsVersion: "v1",
          privacyVersion: "v1",
          ipAddress,
          userAgent,
        },
      });

      return createdUser;
    }));

    // Best-effort, post-commit side effects. The account already exists, so
    // none of these should fail the request — logAuditAction swallows its
    // own errors, and the email is fire-and-forget.
    if (needsGuardianConsent && trimmedGuardianEmail && guardianToken) {
      await logAuditAction({
        userId: newUser.id,
        action: AuditAction.GUARDIAN_CONSENT_REQUESTED,
        metadata: { guardianEmail: trimmedGuardianEmail, atSignup: true },
        ipAddress,
        userAgent,
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

    // Log account creation
    await logAuditAction({
      userId: newUser.id,
      action: AuditAction.ACCOUNT_CREATED,
      metadata: {
        role,
        age,
        accountStatus: initialAccountStatus,
      },
      ipAddress,
      userAgent,
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
    // Surface the Prisma error code (safe — codes like P1001/P2024 carry no
    // sensitive data) so transient DB-connection failures are diagnosable in
    // prod instead of hiding behind a generic message.
    const code = (error as { code?: string })?.code;
    const transient = isTransientDbError(error);
    return NextResponse.json(
      {
        error: transient
          ? "We couldn't reach the database just now. Please try again in a moment."
          : "Failed to create account",
        ...(code ? { code } : {}),
      },
      { status: transient ? 503 : 500 }
    );
  }
}

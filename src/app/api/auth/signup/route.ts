export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AccountStatus, AuditAction, UserRole } from "@prisma/client";
import {
  CURRENT_TERMS_VERSION,
  CURRENT_PRIVACY_VERSION,
  anonymiseIp,
} from "@/lib/legal/versions";
import {
  logAuditAction,
  validateAgeBracket,
} from "@/lib/safety";
import {
  getAge,
  getAgeBand,
  validateSignupAge,
  PLATFORM_MIN_AGE,
} from "@/lib/safety/age";
import { checkRateLimitAsync, getRateLimitHeaders, RateLimits } from "@/lib/rate-limit";
import { isSchoolEmail } from "@/lib/education/school-domains";
import { normaliseCountry, defaultLocaleForCountry } from "@/lib/countries";
import { LOCALE_COOKIE } from "@/i18n/config";
import { notifyAccountEvent } from "@/lib/account-notify";
import {
  issueVerificationEmail,
  sendExistingAccountNotice,
} from "@/lib/auth/email-verification-service";
import {
  normaliseEmail,
  PENDING_VERIFICATION_COOKIE,
  PENDING_VERIFICATION_MAX_AGE_S,
} from "@/lib/auth/email-verification";
import {
  SIGNIN_GRANT_COOKIE,
  SIGNIN_GRANT_TTL_MS,
  createSigninGrant,
  createDecoyGrant,
  grantSecret,
} from "@/lib/auth/signin-grant";
import { logAndSwallow } from "@/lib/observability";

// Transient DB/connection errors worth a quick retry on serverless cold
// starts (can't-reach-db, connection closed, pool timeout, too many
// connections). Until prod DATABASE_URL points at the Supabase pooler, the
// first request to a cold function can fail to acquire a connection; one
// retry turns the user-visible 500 into a success.
const TRANSIENT_DB_CODES = new Set(["P1000", "P1001", "P1002", "P1008", "P1017", "P2024"]);

function isTransientDbError(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  if (code && TRANSIENT_DB_CODES.has(code)) return true;
  const msg = (err as { message?: string })?.message?.toLowerCase() ?? "";
  return (
    msg.includes("can't reach database") ||
    msg.includes("connection") ||
    msg.includes("timed out") ||
    msg.includes("too many")
  );
}

async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (!isTransientDbError(err)) throw err;
    await new Promise((r) => setTimeout(r, 250));
    return fn();
  }
}

/**
 * ACCOUNT-ENUMERATION GUARD.
 *
 * This body is returned byte-for-byte whether the address was free or already
 * belonged to someone. Previously the route answered a known address with a
 * 409 "an account with this email already exists", which turned public signup
 * into a free oracle for "does this person have an Endeavrly account?" — a
 * question about under-18s that we should never answer to an anonymous caller.
 *
 * The genuine owner is not left in the dark: they get an email telling them
 * they already have an account, with sign-in and password-reset links. See
 * buildExistingAccountEmail.
 */
const SIGNUP_ACCEPTED = {
  ok: true,
  message: "Check your email to confirm your address.",
} as const;

/** Prisma's unique-constraint violation. */
const UNIQUE_VIOLATION = "P2002";

/**
 * The one success response for every accepted signup — new account, existing
 * account, or a lost insert race.
 *
 * Everything observable has to match across all three, or the enumeration
 * guard leaks through a side channel instead of the body. That includes the
 * locale cookie: setting it only for newly created accounts would make its
 * presence a perfect "this address was free" tell, so it is set purely from
 * the country the caller submitted.
 */
function signupAcceptedResponse(
  role: string,
  rawCountry: unknown,
  email: string,
  /**
   * The account this browser just created, or null on the existing-account and
   * lost-race paths. Null gets a DECOY grant, not no grant — see below.
   */
  createdUserId: string | null,
): NextResponse {
  const res = NextResponse.json(SIGNUP_ACCEPTED);

  // Remember which address is awaiting confirmation, so the "check your email"
  // screen can name it and the resend button has something to act on while the
  // user is still signed out.
  //
  // A COOKIE RATHER THAN A QUERY PARAMETER, for three reasons:
  //   • the address stays out of the URL bar, browser history, bookmarks and
  //     any Referer header — the screen is meant to be privacy-conscious, and
  //     an address printed in the location bar is the opposite of that;
  //   • httpOnly keeps it out of reach of any script on the page;
  //   • it means /api/auth/resend-verification can refuse to mail an arbitrary
  //     caller-supplied address, and only ever mails this one or the session's.
  // Set on EVERY accepted signup, duplicate included — a cookie that appeared
  // only for new accounts would itself answer "was this address free?".
  res.cookies.set(PENDING_VERIFICATION_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PENDING_VERIFICATION_MAX_AGE_S,
  });

  // THE SIGN-IN GRANT. Sealed proof that THIS browser created THIS account, so
  // the "check your email" screen can notice the confirmation land and sign the
  // user in rather than making them retype a password they set a minute ago.
  // See src/lib/auth/signin-grant.ts for the trust model — in short, the grant
  // alone does nothing: a session is only minted once the account's
  // `emailVerified` is stamped AFTER this grant was issued.
  //
  // Set on EVERY accepted signup. The existing-account and lost-race paths get
  // a decoy that names a random id: `Set-Cookie` is plainly visible to whoever
  // made the request, so a grant that appeared only for new accounts would
  // answer "was this address free?" — exactly the question this route is built
  // never to answer. The decoy is encrypted, byte-for-byte the same length as a
  // real grant, and resolves to nobody, so it can never mint a session.
  const secret = grantSecret();
  if (secret) {
    res.cookies.set(
      SIGNIN_GRANT_COOKIE,
      createdUserId
        ? createSigninGrant(createdUserId, { secret })
        : createDecoyGrant({ secret }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: Math.floor(SIGNIN_GRANT_TTL_MS / 1000),
      },
    );
  }

  // Youth from a country whose UI language isn't the default get that language
  // automatically (e.g. Spain → Spanish). They can still switch via the
  // language toggle. Same cookie options as /api/locale.
  if (role === "YOUTH") {
    const locale = defaultLocaleForCountry(normaliseCountry(rawCountry));
    if (locale) {
      res.cookies.set(LOCALE_COOKIE, locale, {
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        path: "/",
      });
    }
  }
  return res;
}

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

    const { firstName, lastName, surname, email: rawEmail, password, role: requestedRole, ageBracket, dateOfBirth, country: rawCountry, acceptedTerms, acceptedPrivacy } = await req.json();

    // SECURITY: never trust a client-supplied role. Public self-service
    // signup may only create the self-service roles — an attacker must not
    // be able to provision an ADMIN (or any other elevated) account by
    // posting `{ "role": "ADMIN" }`. Anything missing/unrecognised falls
    // back to YOUTH; anything outside the allowlist is rejected outright.
    const ALLOWED_SIGNUP_ROLES = new Set(["YOUTH", "TEACHER"]);
    const role =
      typeof requestedRole === "string" && requestedRole ? requestedRole : "YOUTH";
    if (!ALLOWED_SIGNUP_ROLES.has(role)) {
      return NextResponse.json(
        { error: "Invalid account type." },
        { status: 400 }
      );
    }

    // Normalise emails: trim + lowercase so the account is stored in a
    // canonical form. Without this, signing up as "Foo@Bar.com" and later
    // signing in as "foo@bar.com" would fail the lookup and lock the user
    // out. The sign-in path (src/lib/auth.ts) normalises the same way.
    const email = normaliseEmail(rawEmail);

    // Validate legal acceptance
    if (!acceptedTerms || !acceptedPrivacy) {
      return NextResponse.json(
        { error: "You must accept the Terms of Service and Privacy Policy to create an account" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!email || typeof password !== "string" || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Shape + length bounds on everything the browser sends. Two reasons:
    // an unbounded `password` is a cheap way to make the server burn CPU in
    // bcrypt (which only reads the first 72 bytes anyway), and an unbounded
    // name is a free way to write megabytes into a row on an endpoint that
    // needs no account to reach.
    if (email.length > 254 || !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate name
    const trimmedFirst = (firstName ?? "").toString().trim();
    const trimmedSurname = (surname ?? lastName ?? "").toString().trim();
    if (!trimmedFirst) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }
    if (trimmedFirst.length > 100 || trimmedSurname.length > 100) {
      return NextResponse.json(
        { error: "That name is too long. Please use 100 characters or fewer." },
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
    if (password.length > 200) {
      return NextResponse.json(
        { error: "Password must be 200 characters or fewer" },
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

      // Double-check the floor server-side (defense in depth). No upper limit —
      // anyone 15+ is welcome; validateSignupAge above already rejects
      // implausible ages as a sanity guard.
      if (age === null || age < PLATFORM_MIN_AGE) {
        return NextResponse.json(
          { error: `Endeavrly is for ages ${PLATFORM_MIN_AGE} and up. You must be at least ${PLATFORM_MIN_AGE} to create an account.` },
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

      // All youth (15–30) are ACTIVE on creation. Age personalises the
      // Clarity roadmap; it is NOT an in-app gate, and there is no
      // guardian-consent barrier to using the product. See CLAUDE.md
      // <age_policy>. The only age check is the 15–30 floor above.
      initialAccountStatus = AccountStatus.ACTIVE;
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
      // Job-poster / employer accounts have been removed from Endeavrly —
      // this is a youth career-exploration platform, not a jobs marketplace.
      return NextResponse.json(
        { error: "Job poster accounts are no longer supported." },
        { status: 400 }
      );
    }

    // Hash the password BEFORE branching on whether the account exists.
    //
    // TIMING SIDE CHANNEL: bcrypt is deliberately slow (~100ms). If we only
    // hashed on the create path, "known address" and "free address" would take
    // measurably different times and the enumeration guard below would be
    // defeated by a stopwatch. Paying the same cost on both paths removes that.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists. The address is already normalised (trim +
    // lowercase) and `User.email` is `@unique` in the schema, so this lookup
    // and the DB constraint agree on what "the same address" means.
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      // Do NOT create a second account, and do NOT tell the caller that this
      // address is taken. Notify the address itself instead — only its genuine
      // owner sees that, and for them it's the most useful message possible.
      // Awaited (not fire-and-forget) so the response timing doesn't depend on
      // which branch ran.
      await sendExistingAccountNotice(email).catch(
        logAndSwallow("signup:existing-account-notice"),
      );
      return signupAcceptedResponse(role, rawCountry, email, null);
    }

    const acceptanceTimestamp = new Date();
    const ipAddress = anonymiseIp(req.headers.get("x-forwarded-for"));
    const userAgent = req.headers.get("user-agent") || undefined;

    // Create the account atomically. Wrapping the user + profile + legal
    // acceptance in ONE transaction means a single pooled connection and
    // all-or-nothing semantics — no half-created accounts, and far less
    // connection pressure than 3+ sequential round-trips (which was causing
    // intermittent 500s on cold serverless invocations).
    let newUser: { id: string };
    try {
      newUser = await withDbRetry(() => prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          // Runtime-validated against ALLOWED_SIGNUP_ROLES above; the cast
          // narrows the post-validation string to the Prisma enum.
          role: role as UserRole,
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
            // Country picked at signup (foundation for per-country
            // tailoring; falls back to Norway). See src/lib/countries.ts.
            country: normaliseCountry(rawCountry),
            // No guardian-consent barrier: every youth account is good to
            // go on creation. See CLAUDE.md <age_policy>.
            guardianConsent: true,
          },
        });
      }

      await tx.legalAcceptance.create({
        data: {
          userId: createdUser.id,
          acceptedTermsAt: acceptanceTimestamp,
          acceptedPrivacyAt: acceptanceTimestamp,
          termsVersion: CURRENT_TERMS_VERSION,
          privacyVersion: CURRENT_PRIVACY_VERSION,
          ipAddress,
          userAgent,
        },
      });

        return createdUser;
      }));
    } catch (err) {
      // RACE CONDITION. Two signups for the same address can both pass the
      // findUnique above before either inserts. The `@unique` constraint on
      // User.email is the real guarantee — it lets exactly one of them commit
      // and rejects the other with P2002. That loser is not an error: it is
      // simply the duplicate case arriving a few milliseconds later, so it
      // takes the same enumeration-safe path as a detected duplicate.
      //
      // This is why uniqueness is enforced in the database and not only by the
      // lookup: the lookup narrows the window, the constraint closes it.
      if ((err as { code?: string })?.code === UNIQUE_VIOLATION) {
        await sendExistingAccountNotice(email).catch(
          logAndSwallow("signup:existing-account-notice"),
        );
        return signupAcceptedResponse(role, rawCountry, email, null);
      }
      throw err;
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

    // Send the verification email. `respectCooldown: false` because this is
    // the first send for a brand-new account — the signup rate limit above is
    // what protects this path; the cooldown guards the user-triggered resend.
    //
    // Awaited so a mail-provider outage is visible in the request, but a
    // failure must NOT fail the signup: the account exists, the user is about
    // to be signed in, and they can resend from the banner. issueVerification-
    // Email already reports send failures to Sentry.
    await issueVerificationEmail({
      userId: newUser.id,
      email,
      firstName: trimmedFirst,
      respectCooldown: false,
    }).catch(logAndSwallow("signup:issue-verification"));

    // Tell the operator someone joined. Fire-and-forget and never awaited:
    // this is for their benefit, and must not add latency to — or be able to
    // fail — a young person's registration.
    void notifyAccountEvent({
      kind: "signup",
      email,
      role,
      country: rawCountry ?? null,
    }).then((outcome) => {
      if (!outcome.sent && outcome.reason === "MAIL_FAILED") {
        console.warn("[account-notify] signup notification failed:", outcome.error);
      }
    });

    return signupAcceptedResponse(role, rawCountry, email, newUser.id);
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

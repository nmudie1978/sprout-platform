import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getToken } from "next-auth/jwt";

const ADMIN_SESSION_COOKIE = "endeavrly_admin_session";

// Routes that don't require age verification
const PUBLIC_ROUTES = [
  "/",
  "/auth",
  "/legal",
  "/api/auth",
  "/not-eligible",
  "/guardian-consent",
];

// Routes that require guardian consent for minors (16-17)
const SENSITIVE_ROUTES = [
  "/messages",
  "/jobs/apply",
  "/api/applications",
  "/api/messages",
];

/**
 * Routes an under-18 youth without guardian consent is BLOCKED from.
 * Matches the full authenticated surface — if consent is missing,
 * redirect to /profile with a flag so the youth sees the "Guardian
 * pending — Resend" UI and can't reach anything until consent lands.
 *
 * Excluded from the block (safe to browse while awaiting consent):
 *   /profile itself (so they can see the pending-guardian card)
 *   /auth/*            (sign-out, etc.)
 *   /legal/*           (terms, privacy, safety, eligibility)
 *   /guardian-consent/* (for the guardian's own grant flow via email link)
 *   /not-eligible      (age-rejection page)
 *   /api/auth/*        (NextAuth session endpoints)
 *   /api/profile       (needed to render the pending card)
 *   /api/guardian-consent (needed to resend the email)
 *
 * The block itself enforces CLAUDE.md §Safeguarding: "Adults must be
 * verified before posting jobs" and the implicit reciprocal — minors
 * must be guardian-approved before engaging with the platform.
 * GDPR Art 8 requires guardian consent for under-16 processing.
 */
const GUARDIAN_GATED_PREFIXES = [
  "/dashboard",
  "/my-journey",
  "/my-path",
  "/careers",
  "/jobs",
  "/messages",
  "/applications",
  "/insights",
  "/explore",
  "/growth",
  "/career-advisor",
  "/career-events",
  "/ask-a-pro",
  "/shadows",
  "/reviews",
  "/feedback",
  "/earnings",
];

function isGuardianGatedRoute(pathname: string): boolean {
  return GUARDIAN_GATED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

/**
 * Verify admin session token in middleware
 */
async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) {
      return false;
    }

    const secretKey = new TextEncoder().encode(secret);
    await jwtVerify(token, secretKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a route is public (no auth required)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

/**
 * Check if a route is sensitive (requires guardian consent for minors)
 */
function isSensitiveRoute(pathname: string): boolean {
  return SENSITIVE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

/**
 * Small-jobs surface that is currently disabled by the
 * NEXT_PUBLIC_SMALL_JOBS_ENABLED flag. These paths still exist in code
 * and in the database so the marketplace can be turned back on later,
 * but stale links / bookmarks / deep links from emails should not land
 * on dead UI. Redirect them to the dashboard with a small hint param
 * so we can surface a "returning later" toast if desired.
 */
const SMALL_JOBS_DISABLED_PREFIXES = [
  "/jobs",
  "/applications",
  "/messages",
  "/employer",
];

// `/employer-paused` is the sign-posted landing page for existing
// employer accounts while small-jobs is off. Must not itself be
// caught by the `/employer` prefix above.
const SMALL_JOBS_ALLOWLIST = ["/employer-paused"];

function isSmallJobsPath(pathname: string): boolean {
  if (
    SMALL_JOBS_ALLOWLIST.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    )
  ) {
    return false;
  }
  return SMALL_JOBS_DISABLED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ============================================
  // SMALL JOBS FEATURE GATE
  // ============================================
  // When disabled, bounce anyone landing on a small-jobs page back to
  // the dashboard. The API routes under /api/jobs etc. are left live —
  // other parts of the app may still read them internally (e.g. the
  // admin moderation queue needs Conversation data), but no UI path
  // exposes them to youth or employers.
  if (
    process.env.NEXT_PUBLIC_SMALL_JOBS_ENABLED !== "true" &&
    isSmallJobsPath(pathname)
  ) {
    const redirect = new URL("/dashboard", request.url);
    redirect.searchParams.set("smallJobsDisabled", "1");
    return NextResponse.redirect(redirect);
  }

  // ============================================
  // ADMIN ROUTE PROTECTION
  // ============================================
  if (pathname.startsWith("/admin")) {
    // Allow access to login page
    if (pathname === "/admin/login") {
      // If already authenticated, redirect to dashboard
      const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      if (token) {
        const isValid = await verifyAdminToken(token);
        if (isValid) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
      // Continue to login page
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-pathname", pathname);
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    // For all other /admin/* routes, require authentication
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (!token) {
      // No token - redirect to login
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const isValid = await verifyAdminToken(token);
    if (!isValid) {
      // Invalid token - clear cookie and redirect to login
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete(ADMIN_SESSION_COOKIE);
      return response;
    }

    // Valid session - continue
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // ============================================
  // AGE GATING (CORE SAFETY INVARIANT)
  // ============================================
  // Note: Full age verification happens at the API/page level
  // because middleware can't access database directly.
  // This middleware sets up headers for downstream checks.
  //
  // Server-side enforcement happens in:
  // - /api/auth/signup (blocks under-16 from creating accounts)
  // - API routes use checkPlatformAccess() from /lib/safety/age.ts
  // - Page components verify access server-side
  //
  // The JWT token from NextAuth includes the user's role and
  // potentially age band, which downstream handlers use for checks.

  // Skip public routes
  if (isPublicRoute(pathname)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // For authenticated routes, check if user session exists
  // and mark sensitive routes for additional consent checks
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token) {
      // ──────────────────────────────────────────────
      // GUARDIAN-CONSENT GATE (CORE SAFETY INVARIANT)
      // ──────────────────────────────────────────────
      // Under-18 youth (ageBracket SIXTEEN_SEVENTEEN) without
      // `guardianConsent === true` are blocked from every gated
      // route and redirected to /profile where the Resend card
      // lives. /profile is intentionally NOT in the gated list so
      // they can see and action the pending state.
      //
      // The fields `ageBracket` and `guardianConsent` are populated
      // on the JWT at sign-in and refreshed when the client calls
      // NextAuth's `update()` helper — see src/lib/auth.ts jwt()
      // callback. Stale data fails closed in the safe direction
      // (consent just granted → temporary block, never accidental
      // access). Under-16 is blocked at signup in /api/auth/signup,
      // not here.
      if (
        token.role === "YOUTH" &&
        token.ageBracket === "SIXTEEN_SEVENTEEN" &&
        !token.guardianConsent &&
        isGuardianGatedRoute(pathname)
      ) {
        const redirectUrl = new URL("/profile", request.url);
        redirectUrl.searchParams.set("awaitingGuardian", "1");
        return NextResponse.redirect(redirectUrl);
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-pathname", pathname);

      // Mark if this is a sensitive route (for downstream consent checks)
      if (isSensitiveRoute(pathname)) {
        requestHeaders.set("x-requires-consent", "true");
      }

      // Pass user info to downstream handlers
      if (token.sub) {
        requestHeaders.set("x-user-id", token.sub);
      }
      if (token.role) {
        requestHeaders.set("x-user-role", token.role as string);
      }

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }
  } catch (error) {
    // Token verification failed - continue without user context
    console.error("Middleware token error:", error);
  }

  // ============================================
  // REGULAR ROUTES
  // ============================================
  // Add pathname to headers so layout can access it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (static image assets)
     * - videos/ (static video assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|videos/).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getToken } from "next-auth/jwt";
import { isConsentWriteGatedApi, MUTATING_METHODS } from "@/lib/auth/consent-gate";

const ADMIN_SESSION_COOKIE = "endeavrly_admin_session";

// Routes that don't require age verification
const PUBLIC_ROUTES = [
  "/",
  "/auth",
  "/legal",
  "/api/auth",
  "/not-eligible",
];

// Routes that require guardian consent for minors (16-17)
const SENSITIVE_ROUTES = [
  "/messages",
  "/jobs/apply",
  "/api/applications",
  "/api/messages",
];

// Guardian-consent write-gate (GDPR Art 8) lives in
// `@/lib/auth/consent-gate` so it can be unit-tested in isolation. Note:
// `/api/goals` is intentionally NOT gated — setting a Primary/Secondary
// Goal is core exploration, available to everyone at any age.

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
  // DEV / TEST PREVIEW ROUTES — never reachable in production
  // ============================================
  // /dev/* and /test/* are unfinished demo/preview surfaces (theme
  // previews, journey-renderer sandboxes, grow-* mockups). robots.txt
  // disallows them but that's only advisory — block them outright in
  // production so they never render to a real user (incl. minors).
  if (
    process.env.VERCEL_ENV === "production" &&
    (pathname === "/dev" ||
      pathname.startsWith("/dev/") ||
      pathname === "/test" ||
      pathname.startsWith("/test/"))
  ) {
    return new NextResponse(null, { status: 404 });
  }

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
      // SOFTENED GUARDIAN-CONSENT GATE (GDPR Art 8)
      // ──────────────────────────────────────────────
      // 16-17 youth without guardian consent may browse freely but can't
      // persist personal data until a guardian confirms. We block only
      // mutating calls to the data-write API routes; everything else
      // (all reads, every page) is allowed. The fields are read from the
      // JWT — see src/lib/auth.ts jwt() callback, refreshed via update().
      if (
        token.role === "YOUTH" &&
        token.ageBracket === "SIXTEEN_SEVENTEEN" &&
        !token.guardianConsent &&
        MUTATING_METHODS.has(request.method) &&
        isConsentWriteGatedApi(pathname)
      ) {
        return NextResponse.json(
          {
            error:
              "A parent or guardian needs to confirm your account before you can save this. You can keep exploring in the meantime.",
            code: "GUARDIAN_CONSENT_REQUIRED",
          },
          { status: 403 }
        );
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

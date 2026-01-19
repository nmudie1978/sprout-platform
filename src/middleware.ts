import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getToken } from "next-auth/jwt";

const ADMIN_SESSION_COOKIE = "sprout_admin_session";

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

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

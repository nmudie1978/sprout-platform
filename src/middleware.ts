import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_SESSION_COOKIE = "sprout_admin_session";

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
     * - api (API routes) - except /admin routes need protection
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

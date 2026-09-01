import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createAdminSession,
  setAdminSessionCookie,
  checkAdminEnvVars,
} from "@/lib/admin/auth";
import {
  getClientIP,
  isRateLimited,
  recordFailedAttempt,
  clearRateLimit,
  formatRetryTime,
} from "@/lib/admin/rateLimit";
import { checkRateLimitAsync, resetRateLimit } from "@/lib/rate-limit";

/**
 * Shared (Redis-backed) lockout for the Admin Portal password.
 *
 * The in-memory limiter above is per running instance, which on Vercel means
 * an attacker gets a fresh 5-attempt allowance on every cold start and on
 * every instance the platform happens to route them to — in practice barely a
 * limit at all. This bucket lives in Redis, so it holds across instances.
 *
 * One admin password protects the whole moderation surface (every user record,
 * every safeguarding report), so it is deliberately tighter than the youth
 * sign-in throttle: 10 attempts per hour per IP, plus a shared global bucket
 * so rotating source addresses doesn't buy an attacker much either.
 */
const ADMIN_LOGIN_PER_IP = { interval: 60 * 60_000, maxRequests: 10 };
const ADMIN_LOGIN_GLOBAL = { interval: 60 * 60_000, maxRequests: 60 };

export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    const envCheck = checkAdminEnvVars();
    if (!envCheck.configured) {
      return NextResponse.json(
        {
          error: "Admin portal is not configured",
          missingEnvVars: envCheck.missing,
        },
        { status: 503 }
      );
    }

    // Check rate limiting
    const clientIP = getClientIP(request);

    // Cross-instance lockout first. Checked BEFORE the body is parsed and
    // before bcrypt runs, so a throttled attacker costs us nothing.
    const shared = await Promise.all([
      checkRateLimitAsync(`admin-login:ip:${clientIP}`, ADMIN_LOGIN_PER_IP),
      checkRateLimitAsync("admin-login:global", ADMIN_LOGIN_GLOBAL),
    ]).catch(() => null);
    if (shared && shared.some((r) => !r.success)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const rateLimitCheck = isRateLimited(clientIP);

    if (rateLimitCheck.limited) {
      return NextResponse.json(
        {
          error: "Too many login attempts",
          retryAfter: rateLimitCheck.retryAfter,
          retryAfterFormatted: formatRetryTime(rateLimitCheck.retryAfter || 0),
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Verify credentials
    const isValid = await verifyAdminCredentials(username, password);

    if (!isValid) {
      // Record failed attempt
      recordFailedAttempt(clientIP);

      // Check if now locked out
      const newRateLimitCheck = isRateLimited(clientIP);
      if (newRateLimitCheck.limited) {
        return NextResponse.json(
          {
            error: "Too many login attempts",
            retryAfter: newRateLimitCheck.retryAfter,
            retryAfterFormatted: formatRetryTime(newRateLimitCheck.retryAfter || 0),
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: "Invalid username or password",
          remainingAttempts: newRateLimitCheck.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Success - clear rate limit and create session
    clearRateLimit(clientIP);
    await resetRateLimit(`admin-login:ip:${clientIP}`);

    const token = await createAdminSession(username);
    await setAdminSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

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

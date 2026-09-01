export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { consumeVerificationToken } from "@/lib/auth/email-verification-service";
import { safeRelativePath } from "@/lib/auth/app-url";
import { checkRateLimitAsync, RateLimits } from "@/lib/rate-limit";
import { logAndSwallow } from "@/lib/observability";

/**
 * The endpoint the emailed verification link points at.
 *
 * It is a GET because that is what a link in an email can be, and it
 * immediately redirects to /auth/verify-email with a coarse ?status=. Two
 * reasons for the redirect rather than rendering here:
 *
 *  1. The raw token never ends up in the address bar, browser history, or the
 *     Referer header sent to any third-party asset on the result page.
 *  2. Reloading the result page can't re-submit the token.
 *
 * The response deliberately carries no detail beyond the four outcomes in
 * VerificationOutcome — nothing about whether the token existed, which account
 * it belonged to, or why it failed.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  // Where to send the user after a successful confirmation. Validated as a
  // same-origin relative path — see safeRelativePath's open-redirect note.
  const next = safeRelativePath(url.searchParams.get("next"), "/dashboard");

  const resultUrl = (status: string) => {
    const target = new URL("/auth/verify-email", url.origin);
    target.searchParams.set("status", status);
    if (status === "success") target.searchParams.set("next", next);
    return target;
  };

  try {
    // Throttle by IP. The token space is 256 bits so guessing is hopeless, but
    // an unauthenticated endpoint that hits the database on every call should
    // never be free to hammer.
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const rl = await checkRateLimitAsync(`verify-email:${ip}`, RateLimits.STRICT);
    if (!rl.success) {
      return NextResponse.redirect(resultUrl("invalid"), 303);
    }

    const outcome = await consumeVerificationToken(token);
    return NextResponse.redirect(resultUrl(outcome), 303);
  } catch (error) {
    logAndSwallow("auth:verify-email")(error);
    // Never surface the underlying failure — the user gets the safe generic
    // state with a route to request a fresh link.
    return NextResponse.redirect(resultUrl("invalid"), 303);
  }
}

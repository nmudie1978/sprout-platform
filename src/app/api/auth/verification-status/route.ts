export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  normaliseEmail,
  PENDING_VERIFICATION_COOKIE,
} from "@/lib/auth/email-verification";
import { mintSessionToken, sessionCookieName, sessionCookieOptions } from "@/lib/auth";
import { checkRateLimitAsync, RateLimits } from "@/lib/rate-limit";
import { logAndSwallow } from "@/lib/observability";

/** Never cached: the whole point is observing a change. */
const NO_STORE = { headers: { "Cache-Control": "no-store" } } as const;

/**
 * "Has the person confirmed their email yet?" — polled by the check-your-email
 * screen so it can let them straight in the moment they click the link.
 *
 * WHY THIS EXISTS. Clicking the emailed link signs you in *in the tab the link
 * opened*. That is very often not the tab you signed up in: mail clients open
 * the system browser, and people frequently sign up on a laptop and read mail
 * on a phone. Without this, the original tab sits on "check your email"
 * forever while the account is already confirmed — the user has done
 * everything right and the product looks broken.
 *
 * WHY IT CAN MINT A SESSION. The only caller that gets anything back is a
 * browser holding the httpOnly cookie signup set on this device, for an
 * address that has since been confirmed. That browser already chose the
 * account's password moments ago, so it could sign in by hand anyway — this
 * grants no access it did not already have, it just removes a pointless step.
 * The cookie is httpOnly and SameSite=Lax, so no script can lift it.
 *
 * It is deliberately incapable of answering about an arbitrary address: there
 * is no request body and no query parameter. Without the cookie it says
 * "unknown" and stops, so it can never become a "is this person registered?"
 * oracle.
 */
export async function GET(req: NextRequest) {
  try {
    // Polling endpoint, so the ceiling is generous — but it is public and
    // touches the database, so it is not free.
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const rl = await checkRateLimitAsync(`verification-status:${ip}`, RateLimits.GENEROUS);
    if (!rl.success) {
      // Tell the client to back off rather than leaving it hammering.
      return NextResponse.json({ verified: false, backoff: true }, { status: 429, ...NO_STORE });
    }

    const email = normaliseEmail(req.cookies.get(PENDING_VERIFICATION_COOKIE)?.value);
    // No cookie: answer exactly as an unverified account would, so the
    // difference leaks nothing about whether an address exists.
    if (!email) return NextResponse.json({ verified: false }, NO_STORE);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true, deletedAt: true },
    });

    if (!user || user.deletedAt || !user.emailVerified) {
      return NextResponse.json({ verified: false }, NO_STORE);
    }

    const token = await mintSessionToken(user.id);
    if (!token) {
      // Confirmed, but the account can't hold a session (suspended, paused).
      // Report it as confirmed and let the normal sign-in path explain why.
      return NextResponse.json({ verified: true, signedIn: false }, NO_STORE);
    }

    const res = NextResponse.json({ verified: true, signedIn: true }, NO_STORE);
    res.cookies.set(sessionCookieName(), token, sessionCookieOptions());
    // The pending cookie has done its job; leaving it would keep this endpoint
    // answering about an address long after it stopped being relevant.
    res.cookies.set(PENDING_VERIFICATION_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch (error) {
    logAndSwallow("auth:verification-status")(error);
    // Fail closed — the page keeps waiting rather than advancing wrongly.
    return NextResponse.json({ verified: false }, NO_STORE);
  }
}

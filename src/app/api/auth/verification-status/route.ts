export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimitAsync, RateLimits } from "@/lib/rate-limit";
import { logAndSwallow } from "@/lib/observability";
import { PENDING_VERIFICATION_COOKIE } from "@/lib/auth/email-verification";
import {
  SIGNIN_GRANT_COOKIE,
  createHandoffToken,
  grantSecret,
  readSigninGrant,
  verificationSatisfiesGrant,
} from "@/lib/auth/signin-grant";

/**
 * "Has the link been clicked yet?" — polled by the Check your email screen.
 *
 * The user who has just signed up is sitting on a screen that cannot know
 * anything has happened: they confirm in another tab or on their phone, and
 * nothing here changes until they reload. This endpoint is what lets that
 * screen notice, and — once it has — sign them in without asking for the
 * password they set a minute ago.
 *
 * IT TAKES NO INPUT. Not an address, not an id, nothing from the body or the
 * query string. The only thing it reads is the httpOnly, sealed grant
 * cookie that /api/auth/signup set on this browser. That is what keeps it from
 * being an "is this person registered / have they confirmed?" oracle: a caller
 * can only ever ask about the account this browser itself created, and only for
 * the 30 minutes the grant lives.
 *
 * `verified: true` is returned only when the account's confirmation POST-DATES
 * the grant — signing up with a stranger's already-confirmed address must not
 * hand you their account. See src/lib/auth/signin-grant.ts.
 */
export async function GET(req: NextRequest) {
  // The honest answer to every failure. Nothing here distinguishes "no grant",
  // "expired grant", "decoy grant", "no such user" or "not confirmed yet" —
  // the screen behaves identically for all of them (keep waiting), and the
  // differences are exactly what an attacker would want to learn.
  const waiting = NextResponse.json({ verified: false });

  try {
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    // GENEROUS, because this is polled: a tab checking every few seconds is the
    // normal case, and throttling it would break the feature it exists for.
    // It's still a cap on how hard one host can hammer a DB-touching endpoint.
    const limit = await checkRateLimitAsync(`verification-status:${ip}`, RateLimits.GENEROUS);
    if (!limit.success) return waiting;

    const secret = grantSecret();
    if (!secret) return waiting;

    const grant = readSigninGrant(req.cookies.get(SIGNIN_GRANT_COOKIE)?.value, { secret });
    if (!grant) return waiting;

    const user = await prisma.user.findUnique({
      where: { id: grant.userId },
      select: {
        emailVerified: true,
        accountStatus: true,
        isPaused: true,
        deletedAt: true,
      },
    });
    if (!user) return waiting;

    // A suspended, banned or deleted account must not be walked through a side
    // door the sign-in path would have refused (see the same check in
    // src/lib/auth.ts). Reported as "still waiting" rather than as a distinct
    // state — this screen has nothing useful to say about moderation.
    if (
      user.deletedAt ||
      user.isPaused ||
      user.accountStatus === "SUSPENDED" ||
      user.accountStatus === "BANNED"
    ) {
      return waiting;
    }

    if (!verificationSatisfiesGrant(user.emailVerified, grant.issuedAt)) return waiting;

    // Confirmed. Mint the two-minute, single-use token the page exchanges for a
    // session via the `verification-handoff` provider. It goes in the body
    // rather than a cookie because `signIn()` has to be able to send it, and it
    // is only reachable by a browser that already holds the grant — a
    // cross-origin page can neither send the (SameSite=Lax) cookie on a fetch
    // nor read this response.
    return NextResponse.json({
      verified: true,
      handoff: createHandoffToken(
        { userId: grant.userId, grantIssuedAt: grant.issuedAt },
        { secret },
      ),
    });
  } catch (error) {
    logAndSwallow("auth:verification-status")(error);
    return waiting;
  }
}

/**
 * Drop both signup cookies once the handoff has produced a session.
 *
 * Housekeeping rather than a control — the grant is bounded by its own 30
 * minutes and the handoff token by two — but leaving a live grant sitting in
 * the browser of someone who is already signed in serves no purpose.
 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  for (const name of [SIGNIN_GRANT_COOKIE, PENDING_VERIFICATION_COOKIE]) {
    res.cookies.set(name, "", { httpOnly: true, path: "/", maxAge: 0 });
  }
  return res;
}

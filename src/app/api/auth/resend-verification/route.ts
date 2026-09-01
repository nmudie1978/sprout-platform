export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueVerificationEmail } from "@/lib/auth/email-verification-service";
import {
  normaliseEmail,
  PENDING_VERIFICATION_COOKIE,
} from "@/lib/auth/email-verification";
import { checkRateLimitAsync, RateLimits } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { logAndSwallow } from "@/lib/observability";

/**
 * "Send it again" for the verification email.
 *
 * Reachable two ways, because both are real situations:
 *   • signed in, from the dashboard banner — we use the session's account;
 *   • signed out, from the "check your email" screen — we use the httpOnly
 *     cookie signup set on this browser;
 *   • signed out, from the sign-in screen after the hard gate refused them —
 *     we accept email + password, and verify the password before sending.
 *
 * The reply is always the same generic shape, so it can't be used to test
 * whether an address is registered or whether it is already verified.
 *
 * ANTI-ABUSE, in layers. The address can never be chosen by the caller (see
 * below), which removes the worst case outright; these bound the rest:
 *   1. per-IP burst limit (STRICT, 10/min) — stops one host scripting it;
 *   2. per-address cooldown (1 per 60s) — bounds inbox noise for a targeted
 *      address even when the requests come from many hosts;
 *   3. per-address hourly cap (5/hr) — bounds the total any one inbox can be
 *      made to receive.
 * Layers 2 and 3 are Redis-backed, so they hold across Vercel instances rather
 * than being per-lambda (see src/lib/rate-limit.ts).
 */
const GENERIC_MESSAGE =
  "If that address still needs confirming, we've sent a new link. It can take a minute to arrive.";

/**
 * A real bcrypt hash of a value nobody knows, compared against when the
 * supplied address has no account — bcrypt's cost is the whole point, so
 * skipping it for unknown addresses would leak their absence via timing.
 */
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

/** Seconds until an exhausted bucket refills, floored at 1 for display. */
function retryAfterSeconds(reset: number, now: number): number {
  return Math.max(1, Math.ceil((reset - now) / 1000));
}

export async function POST(req: NextRequest) {
  try {
    const now = Date.now();
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();

    const ipLimit = await checkRateLimitAsync(
      `resend-verification:ip:${ip}`,
      RateLimits.STRICT,
    );
    if (!ipLimit.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Too many requests from this network. Please wait a moment.",
          retryAfterSeconds: retryAfterSeconds(ipLimit.reset, now),
        },
        { status: 429 },
      );
    }

    // WHERE THE ADDRESS COMES FROM — never from the request body.
    //
    // An endpoint that mails whatever address it is handed is a mail cannon
    // aimed at any inbox on the internet, and rate limits only make it a slow
    // one. So there are exactly two sources, both of which the caller had to
    // already prove some claim to:
    //   1. the session — a signed-in user resending for their own account;
    //   2. the httpOnly cookie signup set on this browser, for the user who is
    //      still on the "check your email" screen and not yet signed in.
    const session = await getServerSession(authOptions);
    let email = normaliseEmail(session?.user?.email);
    if (!session?.user?.id || !email) {
      email = normaliseEmail(req.cookies.get(PENDING_VERIFICATION_COOKIE)?.value);
    }

    // 3. Correct credentials. Needed because the HARD GATE refuses to sign an
    //    unconfirmed account in, so that user has no session — and if they came
    //    back on a different device or after the 30-minute cookie expired, no
    //    cookie either. Without this they would be permanently stuck: unable to
    //    sign in, and unable to ask for the link that would let them.
    //
    //    The password is what makes this safe to accept from the request body.
    //    An address alone would let anyone aim mail at any inbox; an address
    //    plus its password is proof the caller owns the account, so this adds
    //    no capability an attacker didn't already have.
    if (!email) {
      const body = await req.json().catch(() => ({}));
      const claimed = normaliseEmail(body.email);
      const password = typeof body.password === "string" ? body.password : "";
      if (claimed && password && password.length <= 200) {
        const candidate = await prisma.user.findUnique({
          where: { email: claimed },
          select: { password: true },
        });
        // Compare against a dummy hash when there is no such account, so the
        // response time doesn't reveal whether the address is registered.
        const hash = candidate?.password ?? DUMMY_HASH;
        const ok = await bcrypt.compare(password, hash);
        if (ok && candidate?.password) email = claimed;
      }
    }

    if (!email) {
      return NextResponse.json({ ok: true, message: GENERIC_MESSAGE }, { status: 200 });
    }

    // COOLDOWN — checked before any database lookup, so it behaves identically
    // for a registered address, an unregistered one, and an already-verified
    // one. Deriving the cooldown from the account's last token instead would
    // mean only real, unverified accounts ever reported a wait, and that
    // difference would re-open the enumeration hole this whole flow closes.
    const cooldown = await checkRateLimitAsync(
      `resend-verification:cooldown:${email}`,
      RateLimits.EMAIL_VERIFICATION_COOLDOWN,
    );
    if (!cooldown.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Hold on a moment before asking for another email.",
          retryAfterSeconds: retryAfterSeconds(cooldown.reset, now),
        },
        { status: 200 },
      );
    }

    const hourly = await checkRateLimitAsync(
      `resend-verification:account:${email}`,
      RateLimits.EMAIL_VERIFICATION_RESEND,
    );
    if (!hourly.success) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "That's a lot of confirmation emails. Please check your spam folder, then try again later.",
          retryAfterSeconds: retryAfterSeconds(hourly.reset, now),
        },
        { status: 200 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        deletedAt: true,
        youthProfile: { select: { displayName: true } },
      },
    });

    // No account, already confirmed, or deleted: send nothing and say exactly
    // what we'd say otherwise. Reacting differently to an already-verified
    // address would leak verification state as well as existence.
    if (user && !user.emailVerified && !user.deletedAt) {
      // The cooldown above has already been enforced uniformly, so the
      // service-level one would only double-count this send.
      await issueVerificationEmail({
        userId: user.id,
        email: user.email,
        firstName: user.youthProfile?.displayName ?? null,
        respectCooldown: false,
      });
    }

    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE }, { status: 200 });
  } catch (error) {
    logAndSwallow("auth:resend-verification")(error);
    // Keep the generic shape even on failure — no internals, no status leak.
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE }, { status: 200 });
  }
}

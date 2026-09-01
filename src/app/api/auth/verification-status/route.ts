export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  normaliseEmail,
  PENDING_VERIFICATION_COOKIE,
} from "@/lib/auth/email-verification";
import { logAndSwallow } from "@/lib/observability";

/**
 * "Has the address I just signed up with been confirmed yet?"
 *
 * Polled by the /auth/check-email page so the tab the person is waiting in
 * moves on by itself once they click the link — typically in another tab, or
 * on their phone — instead of sitting on "check your inbox" forever.
 *
 * The address is NOT accepted from the caller. It comes from the httpOnly
 * cookie signup set, so this endpoint can only ever answer for the account
 * whose signup happened in this browser. That matters: an endpoint that took
 * an email in the query string would be an account-enumeration oracle,
 * telling anyone whether a given address exists and whether it is verified.
 *
 * With no cookie, the answer is a flat `{ verified: false }` — the same shape
 * an unverified account gets, so nothing is leaked by the difference.
 */
export async function GET() {
  try {
    const store = await cookies();
    const raw = store.get(PENDING_VERIFICATION_COOKIE)?.value ?? "";
    const email = normaliseEmail(raw);
    if (!email) return NextResponse.json({ verified: false });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true, deletedAt: true },
    });

    const verified = Boolean(user?.emailVerified) && !user?.deletedAt;
    return NextResponse.json(
      { verified },
      // Never cached: the whole point is observing a change.
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logAndSwallow("auth:verification-status")(error);
    // Fail closed — the page keeps waiting rather than advancing wrongly.
    return NextResponse.json({ verified: false });
  }
}

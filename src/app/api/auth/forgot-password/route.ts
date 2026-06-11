export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { buildPasswordResetEmail } from "@/lib/email/password-reset-email";
import {
  generateResetToken,
  hashResetToken,
  resetTokenExpiry,
} from "@/lib/auth/password-reset";
import { checkRateLimitAsync, RateLimits } from "@/lib/rate-limit";
import { logAndSwallow } from "@/lib/observability";

// Generic response — identical whether or not the email exists, so this
// endpoint can't be used to enumerate accounts.
const GENERIC = {
  ok: true,
  message: "If an account exists for that email, we've sent a reset link.",
};

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const rl = await checkRateLimitAsync(`forgot-password:${ip}`, RateLimits.STRICT);
    if (!rl.success) {
      // Still generic, just throttled.
      return NextResponse.json(GENERIC, { status: 200 });
    }

    const body = await req.json().catch(() => ({}));
    const email = (body.email ?? "").toString().trim().toLowerCase();
    if (!email) return NextResponse.json(GENERIC, { status: 200 });

    const user = await prisma.user.findUnique({ where: { email } });

    // Only issue a token for an active credentials account (one with a
    // password). OAuth-only / deleted accounts get the same generic reply.
    if (user && user.password && !user.deletedAt) {
      const rawToken = generateResetToken();
      const tokenHash = hashResetToken(rawToken);

      // Invalidate any outstanding tokens, then issue a fresh one.
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt: resetTokenExpiry(Date.now()) },
      });

      const base =
        process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://endeavrly.com";
      const resetUrl = `${base.replace(/\/$/, "")}/auth/reset-password?token=${rawToken}`;
      const { subject, html, text } = buildPasswordResetEmail(resetUrl);
      const sent = await sendMail({ to: email, subject, html, text });
      if (sent.skipped) {
        // Mail isn't configured — make this loud so it can't hide in prod.
        logAndSwallow("forgot-password:mail-skipped")(
          new Error("Password reset email skipped: Resend not configured (RESEND_API_KEY/MAIL_FROM)."),
        );
      }
    }

    return NextResponse.json(GENERIC, { status: 200 });
  } catch (error) {
    logAndSwallow("auth:forgot-password")(error);
    // Never leak failure detail; keep the response generic.
    return NextResponse.json(GENERIC, { status: 200 });
  }
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  hashResetToken,
  isResetTokenUsable,
  validateNewPassword,
} from "@/lib/auth/password-reset";
import { checkRateLimitAsync, RateLimits } from "@/lib/rate-limit";
import { logAndSwallow } from "@/lib/observability";

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const rl = await checkRateLimitAsync(`reset-password:${ip}`, RateLimits.STRICT);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawToken = (body.token ?? "").toString();
    const password = body.password;

    const pwError = validateNewPassword(password);
    if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });
    if (!rawToken) return NextResponse.json({ error: "Invalid or expired link." }, { status: 400 });

    const tokenHash = hashResetToken(rawToken);
    const token = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!isResetTokenUsable(token, Date.now())) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password as string, 10);
    // Set the new password, consume this token, and invalidate any siblings.
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: token!.userId },
        // passwordChangedAt evicts every session issued before this moment —
        // a reset must sign out whoever else was holding a session token, not
        // just change the password for next time. See src/lib/auth.ts.
        // Completing a reset proves the person controls the inbox the link
        // was sent to — that is exactly what email verification asserts, so
        // record it here too rather than nagging a user who has just
        // demonstrated ownership. Idempotent: re-setting the same fact is fine.
        data: {
          password: hashed,
          passwordChangedAt: new Date(),
          emailVerified: new Date(),
        },
        select: { email: true },
      }),
      prisma.passwordResetToken.update({ where: { id: token!.id }, data: { usedAt: new Date() } }),
      prisma.passwordResetToken.updateMany({
        where: { userId: token!.userId, usedAt: null },
        data: { usedAt: new Date() },
      }),
    ]);

    // Return the account email so the client can verify the change end-to-end
    // by signing in with the new password (the caller already proved ownership
    // of this email by possessing the single-use reset token).
    return NextResponse.json({ ok: true, email: updatedUser.email });
  } catch (error) {
    logAndSwallow("auth:reset-password")(error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

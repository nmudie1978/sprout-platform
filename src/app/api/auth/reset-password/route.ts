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
    await prisma.$transaction([
      prisma.user.update({ where: { id: token!.userId }, data: { password: hashed } }),
      prisma.passwordResetToken.update({ where: { id: token!.id }, data: { usedAt: new Date() } }),
      prisma.passwordResetToken.updateMany({
        where: { userId: token!.userId, usedAt: null },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    logAndSwallow("auth:reset-password")(error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

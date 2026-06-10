export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/theme-ping  { theme: "dark" | "light" }
 *
 * Increments an anonymous, aggregate dark/light counter (ThemeTally). Stores
 * NO identifier of any kind — just bumps one of two running totals. The client
 * (components/theme-tally-ping.tsx) calls this at most once per browser session
 * and only for signed-in users, so the figure approximates the dark-vs-light
 * split of active app users. Failures are swallowed — this must never affect UX.
 */
export async function POST(req: NextRequest) {
  try {
    // Only count signed-in users (who accepted the Privacy Policy at signup).
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const body = await req.json().catch(() => null);
    const theme = body?.theme;
    if (theme !== "dark" && theme !== "light") {
      return NextResponse.json({ error: "invalid theme" }, { status: 400 });
    }

    await prisma.themeTally.upsert({
      where: { theme },
      create: { theme, count: 1 },
      update: { count: { increment: 1 } },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Never block the UI over a telemetry write.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

/**
 * Youth joins a cohort by code.
 *
 * YOUTH-only. Teachers distribute a 6-char code verbally / in class.
 * The youth enters it on their profile (or during onboarding) and
 * becomes a CohortMembership row. That's all that crosses the boundary
 * between youth and teacher — no notifications, no bidirectional chat,
 * no teacher-visible per-student content.
 *
 * Rate-limited to stop code brute-forcing.
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidCohortCode, normaliseCohortCode } from "@/lib/cohort/code";
import { checkRateLimitAsync, getRateLimitHeaders, RateLimits } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "YOUTH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Brute-force protection on cohort codes. STRICT is 10/min — plenty
  // for legitimate "typed it wrong" retries but stops enumeration.
  const rl = await checkRateLimitAsync(
    `cohort-join:${session.user.id}`,
    RateLimits.STRICT,
  );
  if (!rl.success) {
    const res = NextResponse.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      { status: 429 },
    );
    Object.entries(
      getRateLimitHeaders(rl.limit, rl.remaining, rl.reset),
    ).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const code = normaliseCohortCode(String(body.code ?? ""));
  if (!isValidCohortCode(code)) {
    return NextResponse.json(
      { error: "That code doesn't look right — please check and try again." },
      { status: 400 },
    );
  }

  const cohort = await prisma.cohort.findUnique({
    where: { code },
    select: { id: true, name: true, deletedAt: true },
  });

  if (!cohort || cohort.deletedAt) {
    return NextResponse.json(
      { error: "We couldn't find that class. Ask your teacher to confirm the code." },
      { status: 404 },
    );
  }

  // Upsert-style: idempotent join. If the student is already a
  // member, return success silently.
  try {
    await prisma.cohortMembership.upsert({
      where: {
        cohortId_youthId: {
          cohortId: cohort.id,
          youthId: session.user.id,
        },
      },
      create: {
        cohortId: cohort.id,
        youthId: session.user.id,
      },
      update: {}, // no-op
    });
  } catch (err) {
    console.error("[cohorts/join] upsert failed:", err);
    return NextResponse.json({ error: "Failed to join class" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    cohort: { id: cohort.id, name: cohort.name },
  });
}

// DELETE /api/cohorts/join — youth leaves a cohort. Takes the
// membership id in the body. Youth can always leave unilaterally.
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "YOUTH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const cohortId = body && typeof body.cohortId === "string" ? body.cohortId : null;
  if (!cohortId) {
    return NextResponse.json({ error: "cohortId required" }, { status: 400 });
  }

  await prisma.cohortMembership.deleteMany({
    where: { cohortId, youthId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}

// GET /api/cohorts/join — list the youth's current memberships.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "YOUTH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const memberships = await prisma.cohortMembership.findMany({
    where: { youthId: session.user.id, cohort: { deletedAt: null } },
    select: {
      joinedAt: true,
      cohort: {
        select: { id: true, name: true, code: true, careerFocus: true },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return NextResponse.json({
    memberships: memberships.map((m) => ({
      joinedAt: m.joinedAt,
      cohort: m.cohort,
    })),
  });
}

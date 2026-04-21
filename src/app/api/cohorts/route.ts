/**
 * Cohort list / create endpoints.
 *
 * TEACHER-only. A cohort is a class a teacher has spun up — it carries
 * a 6-char join code students type in on their profile to become
 * members. The teacher never sees individual student content; the
 * detail endpoint at /api/cohorts/[id] returns aggregated numbers only.
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCohortCode } from "@/lib/cohort/code";
import { sanitizeText } from "@/lib/validation/sanitize";
import { checkRateLimitAsync, getRateLimitHeaders, RateLimits } from "@/lib/rate-limit";

// GET /api/cohorts — list the teacher's own cohorts (active only).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cohorts = await prisma.cohort.findMany({
    where: { teacherId: session.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      name: true,
      careerFocus: true,
      createdAt: true,
      _count: { select: { memberships: true } },
    },
  });

  return NextResponse.json({
    cohorts: cohorts.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      careerFocus: c.careerFocus,
      createdAt: c.createdAt,
      studentCount: c._count.memberships,
    })),
  });
}

// POST /api/cohorts — create a new cohort.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Small rate limit so a single teacher can't spawn hundreds of cohorts.
  const rl = await checkRateLimitAsync(
    `cohort-create:${session.user.id}`,
    RateLimits.STRICT,
  );
  if (!rl.success) {
    const res = NextResponse.json(
      { error: "You're creating cohorts too quickly. Please wait a moment." },
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

  const name = sanitizeText(String(body.name ?? "")).slice(0, 120);
  const careerFocus = body.careerFocus
    ? sanitizeText(String(body.careerFocus)).slice(0, 80)
    : null;

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Cohort name must be at least 2 characters" },
      { status: 400 },
    );
  }

  // Collision-retry loop. With 32^6 ≈ 1B codes, conflicts are
  // practically impossible, but the UNIQUE constraint makes it safe
  // to retry deterministically.
  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const code = generateCohortCode();
    try {
      const cohort = await prisma.cohort.create({
        data: {
          code,
          teacherId: session.user.id,
          name,
          careerFocus,
        },
        select: {
          id: true,
          code: true,
          name: true,
          careerFocus: true,
          createdAt: true,
        },
      });
      return NextResponse.json({ cohort }, { status: 201 });
    } catch (err: unknown) {
      // P2002 = unique-constraint violation (code). Retry with a new
      // code. Any other error bubbles out.
      const e = err as { code?: string; meta?: { target?: string[] } };
      if (e.code === "P2002" && e.meta?.target?.includes("code")) {
        continue;
      }
      console.error("[cohorts] create failed:", err);
      return NextResponse.json({ error: "Failed to create cohort" }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "Could not allocate a unique cohort code — please try again." },
    { status: 500 },
  );
}

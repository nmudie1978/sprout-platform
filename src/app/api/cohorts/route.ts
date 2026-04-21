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
import { prisma, withRLSContext } from "@/lib/prisma";
import { generateCohortCode } from "@/lib/cohort/code";
import { sanitizeText } from "@/lib/validation/sanitize";
import { checkRateLimitAsync, getRateLimitHeaders, RateLimits } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-error";

// GET /api/cohorts — list the teacher's own cohorts (active only).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    return apiError("UNAUTHORIZED", "Teacher session required");
  }

  // Defense in depth: explicit where on teacherId stays in place, and
  // withRLSContext sets the session variable that the Cohort RLS
  // policy reads. If either safety net fails, the other still holds.
  const cohorts = await withRLSContext(session.user.id, (tx) =>
    tx.cohort.findMany({
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
    })
  );

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
    return apiError("UNAUTHORIZED", "Teacher session required", { request: req });
  }

  // Small rate limit so a single teacher can't spawn hundreds of cohorts.
  const rl = await checkRateLimitAsync(
    `cohort-create:${session.user.id}`,
    RateLimits.STRICT,
  );
  if (!rl.success) {
    return apiError(
      "RATE_LIMITED",
      "You're creating cohorts too quickly. Please wait a moment.",
      {
        request: req,
        headers: getRateLimitHeaders(rl.limit, rl.remaining, rl.reset),
      },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return apiError("BAD_REQUEST", "Invalid request body", { request: req });
  }

  const name = sanitizeText(String(body.name ?? "")).slice(0, 120);
  const careerFocus = body.careerFocus
    ? sanitizeText(String(body.careerFocus)).slice(0, 80)
    : null;

  if (name.length < 2) {
    return apiError("VALIDATION_FAILED", "Cohort name must be at least 2 characters", {
      request: req,
      details: { field: "name" },
    });
  }

  // Collision-retry loop. With 32^6 ≈ 1B codes, conflicts are
  // practically impossible, but the UNIQUE constraint makes it safe
  // to retry deterministically.
  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const code = generateCohortCode();
    try {
      const cohort = await withRLSContext(session.user.id, (tx) =>
        tx.cohort.create({
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
        })
      );
      return NextResponse.json({ cohort }, { status: 201 });
    } catch (err: unknown) {
      // P2002 = unique-constraint violation (code). Retry with a new
      // code. Any other error bubbles out.
      const e = err as { code?: string; meta?: { target?: string[] } };
      if (e.code === "P2002" && e.meta?.target?.includes("code")) {
        continue;
      }
      console.error("[cohorts] create failed:", err);
      return apiError("DB_ERROR", "Failed to create cohort", { request: req });
    }
  }

  return apiError(
    "INTERNAL",
    "Could not allocate a unique cohort code — please try again.",
    { request: req },
  );
}

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
import { prisma, withRLSContext } from "@/lib/prisma";
import { isValidCohortCode, normaliseCohortCode } from "@/lib/cohort/code";
import { checkRateLimitAsync, getRateLimitHeaders, RateLimits } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-error";
import { logAndSwallow } from "@/lib/observability";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "YOUTH") {
    return apiError("UNAUTHORIZED", "Youth session required", { request: req });
  }

  // Brute-force protection on cohort codes. STRICT is 10/min — plenty
  // for legitimate "typed it wrong" retries but stops enumeration.
  const rl = await checkRateLimitAsync(
    `cohort-join:${session.user.id}`,
    RateLimits.STRICT,
  );
  if (!rl.success) {
    return apiError(
      "RATE_LIMITED",
      "Too many attempts. Please wait a minute and try again.",
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

  const code = normaliseCohortCode(String(body.code ?? ""));
  if (!isValidCohortCode(code)) {
    return apiError(
      "VALIDATION_FAILED",
      "That code doesn't look right — please check and try again.",
      { request: req, details: { field: "code" } },
    );
  }

  const cohort = await prisma.cohort.findUnique({
    where: { code },
    select: { id: true, name: true, deletedAt: true },
  });

  if (!cohort || cohort.deletedAt) {
    return apiError(
      "NOT_FOUND",
      "We couldn't find that class. Ask your teacher to confirm the code.",
      { request: req },
    );
  }

  // Upsert-style: idempotent join. If the student is already a
  // member, return success silently. withRLSContext so the
  // CohortMembership RLS policy (youthId = current_app_user_id)
  // enforces that the youth can only write a row for themselves —
  // even if the POST body were to somehow reach Prisma with a
  // different youthId, the DB would reject it.
  try {
    await withRLSContext(session.user.id, (tx) =>
      tx.cohortMembership.upsert({
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
      })
    );
  } catch (err) {
    logAndSwallow("cohorts:join:upsert")(err);
    return apiError("DB_ERROR", "Failed to join class", { request: req });
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
    return apiError("UNAUTHORIZED", "Youth session required", { request: req });
  }
  const body = await req.json().catch(() => null);
  const cohortId = body && typeof body.cohortId === "string" ? body.cohortId : null;
  if (!cohortId) {
    return apiError("BAD_REQUEST", "cohortId required", {
      request: req,
      details: { field: "cohortId" },
    });
  }

  await withRLSContext(session.user.id, (tx) =>
    tx.cohortMembership.deleteMany({
      where: { cohortId, youthId: session.user.id },
    })
  );

  return NextResponse.json({ ok: true });
}

// GET /api/cohorts/join — list the youth's current memberships.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "YOUTH") {
    return apiError("UNAUTHORIZED", "Youth session required");
  }
  const memberships = await withRLSContext(session.user.id, (tx) =>
    tx.cohortMembership.findMany({
      where: { youthId: session.user.id, cohort: { deletedAt: null } },
      select: {
        joinedAt: true,
        cohort: {
          select: { id: true, name: true, code: true, careerFocus: true },
        },
      },
      orderBy: { joinedAt: "desc" },
    })
  );

  return NextResponse.json({
    memberships: memberships.map((m) => ({
      joinedAt: m.joinedAt,
      cohort: m.cohort,
    })),
  });
}

/**
 * GET /api/health — liveness/readiness probe.
 *
 * Returns 200 only when the app can reach the database AND, where Redis is
 * configured, actually talk to it.
 *
 * The Redis check exists because of a real eight-week outage. In June 2026 the
 * owner's Redis was deprovisioned for unpaid invoices while REDIS_URL stayed
 * set. `connect()` never settled, so every rate-limited route hung to a 504 and
 * Discover's "A Day in the Life" panel was blank for EVERY career — and this
 * probe returned {"status":"ok"} the entire time, because it only ran SELECT 1.
 * A probe that cannot see the thing that broke is worse than no probe: it
 * actively reassures.
 *
 * Why a dead Redis is a 503 and not a warning: nothing internal consumes this
 * route, so its audience is an external uptime monitor, and those alert on the
 * STATUS CODE. Returning 200 with a sad body would reproduce exactly the
 * failure this is meant to catch. The site does keep serving — the limiter
 * degrades to in-memory — so the body carries `db: "up"` and `degraded: true`
 * to say plainly that this is not a full outage.
 *
 * An unconfigured Redis is NOT an error: dev and preview run without it by
 * design, and alerting there would be noise. Never cached.
 *
 * MAIL is checked for the same reason Redis is. Email verification is a hard
 * gate, so a dead Resend key does not degrade signup — it stops it, and it does
 * so invisibly, because sendMail() no-ops when unconfigured and the auth routes
 * return a generic 200 either way (anti-enumeration). A revoked key already
 * broke password-reset mail once, on 2026-06-19, and was found by a person
 * rather than a monitor. The probe is cached and read-only; see mail-health.ts.
 *
 * COMMIT reports what is actually running. Nine production deploys failed over
 * three days on 2026-08-31 while `main` moved ahead, and nothing surfaced the
 * drift — a merged fix simply was not live. Comparing this against the head of
 * `main` makes "merged but not deployed" detectable instead of assumed.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient, isRedisConfigured } from "@/lib/rate-limit";
import { checkMailHealth, mailStateIsFailing } from "@/lib/mail-health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RedisHealth = "up" | "down" | "not-configured";

/**
 * PING rather than merely connecting. The July failure produced a half-open
 * client that looked alive; a round-trip is the only honest check. Bounded by
 * getRedisClient's own 2s connect budget, so this cannot hang the probe.
 */
async function checkRedis(): Promise<RedisHealth> {
  if (!isRedisConfigured()) return "not-configured";
  try {
    const client = await getRedisClient();
    if (!client) return "down";
    await client.ping();
    return "up";
  } catch {
    return "down";
  }
}

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    // A dead database is reported on its own terms — never folded into a
    // Redis verdict, so the operator knows which dependency to look at.
    //
    // The raw error is logged, NOT returned: this endpoint is public (uptime
    // monitors need it unauthenticated) and Prisma's connection errors quote
    // the database host, port and user back verbatim — e.g. P1001 "Can't reach
    // database server at `db.<ref>.supabase.co:5432`". That handed the project
    // reference and topology to anyone who curled the probe while the DB was
    // down. The stable Prisma code is enough to triage from and carries none
    // of that.
    console.error("[health] Database check failed:", error);
    const code = (error as { code?: string })?.code;
    return NextResponse.json(
      { status: "error", db: "down", ...(code ? { code } : {}) },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const redis = await checkRedis();

  // Production is the only place a missing mail config is an error; dev and
  // preview run without it deliberately.
  const isProduction = process.env.VERCEL_ENV === "production";
  const mail = await checkMailHealth();

  const degraded = redis === "down" || mailStateIsFailing(mail, isProduction);

  return NextResponse.json(
    {
      status: degraded ? "degraded" : "ok",
      db: "up",
      redis,
      // Whether new users can actually be signed up. See mail-health.ts.
      mail,
      // What is actually running, so "merged but not deployed" is visible.
      // Vercel injects the SHA for git-linked builds; a CLI deploy has none.
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? "unknown",
      ...(degraded ? { degraded: true } : {}),
      // Surfaced deliberately. RATE_LIMIT_ALLOW_IN_MEMORY is the escape hatch
      // that lets a production deploy boot without Redis, and in-memory limits
      // are per-instance on Vercel — i.e. effectively no rate limiting on
      // signup, sign-in, reports or the AI endpoints. It is the single setting
      // most likely to be left on by accident after a test deploy, so the
      // probe reports it rather than letting it hide in the dashboard.
      ...(process.env.RATE_LIMIT_ALLOW_IN_MEMORY === "true"
        ? { rateLimiting: "in-memory-escape-hatch-enabled" }
        : {}),
      latencyMs: Date.now() - startedAt,
    },
    { status: degraded ? 503 : 200, headers: { "Cache-Control": "no-store" } },
  );
}

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
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient, isRedisConfigured } from "@/lib/rate-limit";

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
    return NextResponse.json(
      { status: "error", db: "down", message: String(error) },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const redis = await checkRedis();
  const degraded = redis === "down";

  return NextResponse.json(
    {
      status: degraded ? "degraded" : "ok",
      db: "up",
      redis,
      ...(degraded ? { degraded: true } : {}),
      latencyMs: Date.now() - startedAt,
    },
    { status: degraded ? 503 : 200, headers: { "Cache-Control": "no-store" } },
  );
}

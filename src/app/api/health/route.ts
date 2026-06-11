/**
 * GET /api/health — liveness/readiness probe.
 *
 * Returns 200 only when the app can actually reach the database. This
 * platform has a documented history of prod DATABASE_URL/pooler
 * misconfiguration that only surfaced as user-facing 500s well after
 * deploy; a cheap `SELECT 1` probe lets an external uptime monitor catch
 * a dead DB connection immediately. Never cached.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok", db: "up", latencyMs: Date.now() - startedAt },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { status: "error", db: "down", message: String(error) },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { auditLogsToCsv } from "@/lib/audit-log-export";

/**
 * GET /api/admin/audit-logs/export
 *
 * Streams AuditLog rows as CSV for compliance / GDPR subject-access
 * requests. Admin-only via the custom admin cookie session (same
 * auth as /api/admin/metrics).
 *
 * Query params (all optional):
 *   from       — ISO date, inclusive lower bound on createdAt
 *                (default: 90 days ago)
 *   to         — ISO date, inclusive upper bound on createdAt
 *                (default: now)
 *   userId     — exact match on AuditLog.userId (subject of action)
 *                — primary filter for GDPR subject-access requests
 *   actorId    — exact match on AuditLog.actorId (who performed it)
 *   action     — AuditAction enum value (e.g. ACCOUNT_SUSPENDED)
 *   targetType — e.g. "user", "job", "message"
 *
 * Hard cap: 50k rows per request. If the filter produces more, the
 * response body contains a clear error message instead of a truncated
 * CSV (silent truncation would be dangerous for a compliance artifact).
 * Narrow the date range or add userId to reduce the window.
 */

const MAX_ROWS = 50_000;
const DEFAULT_WINDOW_DAYS = 90;

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;

  // Date range
  const fromRaw = searchParams.get("from");
  const toRaw = searchParams.get("to");
  const from = fromRaw ? new Date(fromRaw) : defaultFrom();
  const to = toRaw ? new Date(toRaw) : new Date();
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return NextResponse.json(
      { error: "Invalid 'from' or 'to' — expected ISO date strings" },
      { status: 400 },
    );
  }
  if (from > to) {
    return NextResponse.json(
      { error: "'from' must be earlier than 'to'" },
      { status: 400 },
    );
  }

  // Optional filters
  const userId = searchParams.get("userId") || undefined;
  const actorId = searchParams.get("actorId") || undefined;
  const targetType = searchParams.get("targetType") || undefined;

  const actionRaw = searchParams.get("action");
  let action: AuditAction | undefined;
  if (actionRaw) {
    if (!(actionRaw in AuditAction)) {
      return NextResponse.json(
        { error: `Unknown action '${actionRaw}'` },
        { status: 400 },
      );
    }
    action = actionRaw as AuditAction;
  }

  const where: Prisma.AuditLogWhereInput = {
    createdAt: { gte: from, lte: to },
    ...(userId && { userId }),
    ...(actorId && { actorId }),
    ...(action && { action }),
    ...(targetType && { targetType }),
  };

  // Count first so we can fail loudly rather than silently truncate.
  const total = await prisma.auditLog.count({ where });
  if (total > MAX_ROWS) {
    return NextResponse.json(
      {
        error: `Result set has ${total} rows (max ${MAX_ROWS}). Narrow the date range or add a userId filter.`,
      },
      { status: 413 },
    );
  }

  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: MAX_ROWS,
  });

  const csv = auditLogsToCsv(rows);

  const stamp = new Date().toISOString().slice(0, 10);
  const filenameParts = ["endeavrly-audit-logs"];
  if (userId) filenameParts.push(`user-${userId.slice(0, 8)}`);
  if (action) filenameParts.push(action.toLowerCase());
  filenameParts.push(stamp);
  const filename = `${filenameParts.join("-")}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Audit-Log-Row-Count": String(rows.length),
    },
  });
}

function defaultFrom(): Date {
  const d = new Date();
  d.setDate(d.getDate() - DEFAULT_WINDOW_DAYS);
  d.setHours(0, 0, 0, 0);
  return d;
}

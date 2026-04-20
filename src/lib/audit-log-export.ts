/**
 * Audit log CSV export helper.
 *
 * Used by /api/admin/audit-logs/export for GDPR subject-access and
 * internal compliance requests. Kept separate from the route so it
 * can be unit-tested and reused (e.g. by a future admin UI button
 * that downloads via fetch + blob).
 */

import type { AuditLog } from "@prisma/client";
import { csvCell } from "./feedback-stats";

export const AUDIT_LOG_CSV_HEADERS = [
  "id",
  "createdAt",
  "action",
  "userId",
  "actorId",
  "targetType",
  "targetId",
  "ipAddress",
  "userAgent",
  "metadata",
] as const;

/**
 * Format an array of AuditLog rows as CSV.
 *
 * `metadata` is a JSON field — we stringify it so the raw structure
 * survives the CSV round-trip. Excel will show it as an escaped
 * JSON string which is the correct behaviour for an audit artifact:
 * the receiver can round-trip through JSON.parse when needed.
 */
export function auditLogsToCsv(rows: AuditLog[]): string {
  const lines = [AUDIT_LOG_CSV_HEADERS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvCell(r.id),
        csvCell(r.createdAt),
        csvCell(r.action),
        csvCell(r.userId),
        csvCell(r.actorId),
        csvCell(r.targetType),
        csvCell(r.targetId),
        csvCell(r.ipAddress),
        csvCell(r.userAgent),
        csvCell(r.metadata ? JSON.stringify(r.metadata) : ""),
      ].join(","),
    );
  }
  return lines.join("\n");
}

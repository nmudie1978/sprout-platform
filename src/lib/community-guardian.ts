/**
 * Admin moderation utilities.
 *
 * Historically this file also held the "community guardian" job-moderation
 * system (guardian assignment, job pausing, community derivation). That
 * machinery belonged to the removed small-jobs marketplace and has been
 * deleted. What remains is the generic admin check and the report reason
 * codes used by the content-reporting / admin-review flow, which the
 * platform keeps for safeguarding (see CLAUDE.md).
 */

import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

/**
 * Check if a user is an admin.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === UserRole.ADMIN;
}

/**
 * Report reason codes used by the content-reporting + admin-review flow.
 */
export const REPORT_REASONS = {
  INAPPROPRIATE_CONTENT: "Inappropriate or offensive content",
  SUSPECTED_SCAM: "Suspected scam or fraud",
  SAFETY_CONCERN: "Safety concern",
  HARASSMENT: "Harassment or bullying",
  SPAM: "Spam or irrelevant content",
  OTHER: "Other",
} as const;

export type ReportReason = keyof typeof REPORT_REASONS;

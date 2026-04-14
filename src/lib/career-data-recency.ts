/**
 * Career-data recency helpers.
 *
 * The catalogue at `src/lib/career-pathways.ts` (~813 careers) is
 * hand-curated. Salaries and growth outlook can drift quietly. The
 * audit (Apr 2026) flagged this as the highest single risk to user
 * trust — users may set life decisions against figures that haven't
 * been checked in years.
 *
 * These helpers let the UI surface a small "salary data may be out
 * of date" disclaimer when a career has no `lastVerifiedAt` or it's
 * older than 12 months.
 */

import type { Career } from "@/lib/career-pathways";

/** Age cap for catalogue salaries to be considered "fresh". */
export const CAREER_DATA_MAX_AGE_DAYS = 365;

/** True if the career has never been verified, or it was verified
 *  more than CAREER_DATA_MAX_AGE_DAYS ago. */
export function isCareerSalaryStale(
  career: Pick<Career, "lastVerifiedAt">,
  now: Date = new Date(),
): boolean {
  if (!career.lastVerifiedAt) return true;
  const verified = new Date(career.lastVerifiedAt).getTime();
  if (Number.isNaN(verified)) return true;
  const ageDays = (now.getTime() - verified) / (1000 * 60 * 60 * 24);
  return ageDays > CAREER_DATA_MAX_AGE_DAYS;
}

/** Roll-up over the whole catalogue. Use in scripts / admin views. */
export function catalogueRecencySummary(careers: Pick<Career, "lastVerifiedAt">[]) {
  const total = careers.length;
  const stale = careers.filter((c) => isCareerSalaryStale(c)).length;
  const fresh = total - stale;
  const stalePct = total === 0 ? 0 : Number(((stale / total) * 100).toFixed(1));
  return { total, fresh, stale, stalePct };
}

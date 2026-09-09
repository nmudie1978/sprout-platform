import { UPGRADE_COPY, type UpgradeReason } from "@/lib/pricing/upgrade-reasons";

/**
 * "7 of 10 careers explored" — a quiet count, not a fuel gauge.
 *
 * Renders NOTHING when the allowance is unlimited. A Pro user should not be
 * reminded of a limit they do not have, and an "unlimited" badge on every
 * surface is noise.
 *
 * Deliberately no progress bar and no colour change as the number climbs.
 * Turning a young person's exploration into a depleting resource makes them
 * hesitate before opening the eleventh career, which is the opposite of what
 * this product is for. They can read the number and decide.
 */
export function UsageIndicator({
  used,
  limit,
  noun,
  className = "",
}: {
  used: number;
  /** null = unlimited; the component renders nothing. */
  limit: number | null;
  /** Plural noun, e.g. "careers explored". */
  noun: string;
  className?: string;
}) {
  if (limit === null) return null;
  return (
    <p className={`text-xs text-muted-foreground tabular-nums ${className}`}>
      {used} of {limit} {noun}
    </p>
  );
}

/** The reason key matching a metered allowance, for the prompt at its limit. */
export const ALLOWANCE_REASON: Record<string, UpgradeReason> = {
  careerExplorations: "career_limit",
  careerTwinQuestions: "career_twin_limit",
  savedCareers: "saved_careers",
};

export type { UpgradeReason };
export { UPGRADE_COPY };

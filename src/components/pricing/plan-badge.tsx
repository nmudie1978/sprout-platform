import { Badge } from "@/components/ui/badge";
import type { SubscriptionTier } from "@prisma/client";

/**
 * The user's current plan, for the profile and account surfaces.
 *
 * Free is shown as a plain outline rather than something that looks like a
 * warning. Being on the free plan is a legitimate state, not a deficiency to
 * flag, and this platform is read by teenagers.
 */
export function PlanBadge({ tier }: { tier: SubscriptionTier | null }) {
  // Deprecated paid tiers still resolve as Pro entitlements, so they should
  // read as Pro here too rather than exposing an internal name.
  const isPro = tier !== null && tier !== "FREE";
  return (
    <Badge
      variant={isPro ? "default" : "outline"}
      className={isPro ? "" : "text-muted-foreground border-border"}
    >
      {isPro ? "Pro" : "Free"}
    </Badge>
  );
}

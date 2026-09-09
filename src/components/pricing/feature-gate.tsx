import type { ReactNode } from "react";
import type { EntitlementModule } from "@prisma/client";
import { currentUserModules } from "@/lib/entitlements/guard";
import { UpgradePrompt } from "./upgrade-prompt";
import type { UpgradeReason } from "@/lib/pricing/upgrade-reasons";

/**
 * Server-side gate around a Pro surface.
 *
 * A SERVER component on purpose. Gating in the browser only hides pixels: the
 * data has already been sent, and anyone can read it. This never renders the
 * children's content for a user without the module, so the protected markup
 * never reaches them.
 *
 * It is not the security boundary either — the API routes are. This stops a
 * Free user seeing a broken or empty surface, while the route stops them
 * fetching what sits behind it. Both are needed: the gate for the experience,
 * the route for the rule.
 *
 * `preview` is the better default where it exists. Showing a real glimpse of
 * what Pro contains is more honest, and more persuasive, than a padlock.
 */
export async function FeatureGate({
  module,
  reason,
  children,
  preview,
}: {
  module: EntitlementModule;
  reason: UpgradeReason;
  children: ReactNode;
  /** Shown above the prompt when locked, e.g. a blurred or partial view. */
  preview?: ReactNode;
}) {
  // currentUserModules resolves the session itself and returns [] when
  // signed out, so a logged-out visitor sees the preview and the prompt
  // rather than an error.
  const allowed = (await currentUserModules()).includes(module);
  if (allowed) return <>{children}</>;

  return (
    <div className="space-y-4">
      {preview}
      <UpgradePrompt reason={reason} />
    </div>
  );
}

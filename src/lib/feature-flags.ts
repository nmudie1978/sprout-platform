/**
 * Feature flags.
 *
 * Opt-in surfaces. Default-off so the app ships focused on career
 * exploration; flip a flag later to re-enable capabilities that exist
 * in code but aren't appropriate for the current product phase.
 *
 * These are evaluated server AND client side, so they read from
 * `NEXT_PUBLIC_*` env vars which Next.js inlines into the client
 * bundle at build time.
 */

function envTrue(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.toLowerCase() === "true";
}

/**
 * Small Jobs — the micro-jobs marketplace (browse, apply, messages,
 * employer posting). Temporarily disabled so the product ships as a
 * focused career-exploration tool. All code, APIs and DB tables stay
 * intact — only the user-facing surface is gated.
 */
export const SMALL_JOBS_ENABLED = envTrue("NEXT_PUBLIC_SMALL_JOBS_ENABLED");

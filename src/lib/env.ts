import { z } from "zod";

/**
 * Centralised runtime environment validation.
 *
 * Two of this app's worst prod incidents were silent misconfiguration —
 * a placeholder `DATABASE_URL` (db.example.com) and a missing
 * `NEXTAUTH_SECRET` — that only surfaced as user-facing 500s well after
 * deploy. This schema runs once at server boot (see
 * `instrumentation.ts` → `register()`) and fails the process LOUDLY in
 * production when a required var is missing or obviously a placeholder,
 * turning a slow incident into an immediate, obvious deploy failure.
 *
 * Local `next dev` and Vercel Preview deploys intentionally run with
 * dummy values (Preview has no real DATABASE_URL), so validation only
 * hard-fails when `VERCEL_ENV === "production"`. Elsewhere it is a no-op.
 */

const PLACEHOLDER_RE = /example\.com|dummy|placeholder|changeme|your-/i;

// Vars the app genuinely cannot function without in production.
const requiredSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine((v) => !PLACEHOLDER_RE.test(v), "looks like a placeholder value"),
  NEXTAUTH_SECRET: z.string().min(16, "must be a real secret (>=16 chars)"),
  NEXTAUTH_URL: z
    .string()
    .url()
    .refine((v) => !PLACEHOLDER_RE.test(v), "looks like a placeholder value"),
  // Required in production: the nightly GDPR-retention purge and the
  // revalidate cron reject any request without `Bearer $CRON_SECRET`. If
  // this is unset in prod, Vercel Cron gets a 403 and the purge SILENTLY
  // NEVER RUNS — a data-retention compliance hole. Fail the deploy loudly
  // instead of discovering it weeks later.
  CRON_SECRET: z.string().min(16, "must be a real secret (>=16 chars)"),
  // Required in production: the Admin Portal session is signed/verified with
  // this. If it's unset, `verifyAdminToken` returns false for everyone — the
  // Portal (and the safeguarding reports queue behind it) silently locks out
  // ALL admins. Fail-closed is safe, but fail the deploy loudly instead of
  // discovering admin access is bricked.
  ADMIN_SESSION_SECRET: z.string().min(16, "must be a real secret (>=16 chars)"),
});

// Should be present in production, but their own modules already guard
// them (rate-limit.ts for REDIS_URL) or they degrade gracefully — so these
// are warnings, not hard failures.
const RECOMMENDED = [
  "REDIS_URL",
  "DIRECT_URL",
  "OPENAI_API_KEY",
  "RESEND_API_KEY",
] as const;

/**
 * Validate required production env vars. Throws in production on any
 * missing/invalid required var; logs a warning for absent recommended
 * vars. No-op outside production.
 */
export function validateEnv(): void {
  if (process.env.VERCEL_ENV !== "production") return;

  const result = requiredSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `[env] Invalid or missing required production environment variables:\n${issues}`,
    );
  }

  const missing = RECOMMENDED.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.warn(
      `[env] Recommended production env vars not set: ${missing.join(", ")}`,
    );
  }
}

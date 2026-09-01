/**
 * Next.js instrumentation entry — wires the correct Sentry runtime
 * config based on which runtime is loading. See:
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Fail the boot loudly in production if required env vars are missing
    // or placeholders, instead of surfacing as user-facing 500s later.
    const { validateEnv } = await import("@/lib/env");
    validateEnv();

    // Say plainly when a dev server is pointed at a hosted database. This
    // project has no staging environment, so `.env` points at production and
    // a local signup writes a real row. A warning rather than a failure:
    // production is currently the only database that exists, so blocking
    // would stop all local work. See src/lib/db-guard.ts.
    if (process.env.NODE_ENV !== "production") {
      const { assertSafeDatabase } = await import("@/lib/db-guard");
      assertSafeDatabase();
    }
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Capture errors thrown by React Server Components / Server Actions
// for Sentry. No-op when no DSN is configured.
export const onRequestError = Sentry.captureRequestError;

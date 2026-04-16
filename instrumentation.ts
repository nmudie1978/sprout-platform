/**
 * Next.js instrumentation entry — wires the correct Sentry runtime
 * config based on which runtime is loading. See:
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Capture errors thrown by React Server Components / Server Actions
// for Sentry. No-op when no DSN is configured.
export const onRequestError = Sentry.captureRequestError;

/**
 * Sentry — browser runtime config.
 *
 * Loaded automatically by @sentry/nextjs on every client page. Only
 * initialises when SENTRY_DSN is present, so this file is a safe no-op
 * in environments where Sentry isn't configured (local dev without a
 * DSN, preview deploys, etc.). Set NEXT_PUBLIC_SENTRY_DSN in Vercel
 * → Production to start capturing browser errors.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
    // Sample at 10% in prod to keep volume / cost under control. Tune
    // up to 1.0 once you have real volume data and a paid Sentry plan.
    tracesSampleRate: 0.1,
    // Replay only on errors — saves both bandwidth and cost.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    // Don't ship breadcrumbs that may contain PII.
    sendDefaultPii: false,
  });
}

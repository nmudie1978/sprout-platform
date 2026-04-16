/**
 * Sentry — Node.js server runtime config.
 *
 * Loaded for server components, API routes, and server actions. As
 * with the client config, only activates when SENTRY_DSN is set —
 * safe to ship without a DSN (local dev, preview deploys).
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}

/**
 * Observability helpers for fire-and-forget work.
 *
 * Many API routes kick off non-blocking side effects (intent
 * logging, notification creation, background refreshes). A thrown
 * error from those must not fail the user-facing request, but
 * swallowing it silently means we lose visibility when the
 * background system regresses (the original sin: `.catch(() => {})`
 * everywhere).
 *
 * `logAndSwallow` is the middle path — send the error to Sentry at
 * `warning` level (so it doesn't page oncall like a real error),
 * then return control. In development we also console.warn so
 * regressions surface during local work.
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Returns a `.catch` handler that reports the error to Sentry as
 * a warning and otherwise swallows it. Use for genuine
 * fire-and-forget work where the user doesn't care about success.
 *
 * @example
 *   logIntent(userId, intent).catch(logAndSwallow("chat:logIntent"));
 */
export function logAndSwallow(context: string): (err: unknown) => void {
  return (err) => {
    try {
      Sentry.captureException(err, {
        level: "warning",
        tags: { background: context },
      });
    } catch {
      // If Sentry itself fails, don't cascade — last-ditch is just to
      // not tank the calling request.
    }
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[bg:${context}]`, err);
    }
  };
}

/**
 * Report a SERVER-side failure to Sentry at `error` level (so it surfaces in
 * the issue stream / can page) and always console.error it. Use in the
 * top-level catch of routes whose failure matters — especially AI routes,
 * where a swallowed error means a flagship feature is silently down.
 *
 * @example
 *   } catch (error) {
 *     captureServerError("chat:POST", error);
 *     return NextResponse.json(fallback);
 *   }
 */
export function captureServerError(context: string, err: unknown): void {
  try {
    Sentry.captureException(err, {
      level: "error",
      tags: { serverRoute: context },
    });
  } catch {
    // Don't cascade if Sentry itself fails.
  }
  // eslint-disable-next-line no-console
  console.error(`[err:${context}]`, err);
}

/**
 * Like `logAndSwallow` but for a client-side mutation whose failure
 * the user would want to eventually know about. Sentry gets the
 * error at `error` level so we actually investigate regressions.
 * Caller still has to decide if they want to surface anything to
 * the user — this helper doesn't touch UI.
 */
export function captureClientMutationError(context: string): (err: unknown) => void {
  return (err) => {
    try {
      Sentry.captureException(err, {
        level: "error",
        tags: { clientMutation: context },
      });
    } catch {
      // noop
    }
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error(`[mut:${context}]`, err);
    }
  };
}

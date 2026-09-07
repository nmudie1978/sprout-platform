/**
 * Is transactional email actually able to send?
 *
 * This exists because email delivery became load-bearing. With the
 * verification hard gate on, a dead Resend key does not degrade signup — it
 * stops it completely, and it does so INVISIBLY: sendMail() returns
 * `{ok: true, skipped: true}` when unconfigured, and the signup and
 * password-reset endpoints deliberately return a generic 200 whether or not
 * anything was sent (anti-enumeration). So a broken key looks exactly like a
 * working one from outside, and the only symptom is young people quietly
 * unable to create accounts.
 *
 * That already happened once: on 2026-06-19 password-reset mail stopped for an
 * unknown period because the production key had been revoked. Nothing detected
 * it; a person reported it.
 *
 * WHY A LIVE PROBE RATHER THAN A PRESENCE CHECK: "the env var is set" is
 * precisely the check that failed in June. The key was present and revoked.
 * Only asking Resend distinguishes the two.
 *
 * WHY IT IS CACHED: /api/health is public and unauthenticated, so an
 * uncached upstream call would let anyone turn a curl loop into traffic
 * against Resend's API and add its latency to every probe. The result is held
 * for PROBE_TTL_MS, which keeps the endpoint fast and the upstream quiet while
 * still catching a revoked key within minutes.
 *
 * It NEVER sends an email. `GET /domains` is a read-only call that
 * authenticates the key and nothing more.
 */

export type MailHealth =
  | "up" // key present and accepted by Resend
  | "invalid-key" // key present and REJECTED — the June failure
  | "not-configured" // no key at all
  | "unreachable"; // couldn't ask (network/timeout) — not proof of breakage

/** How long a probe result is reused. */
export const PROBE_TTL_MS = 5 * 60 * 1000;

/** Upper bound on the upstream call, so the probe can never hang /api/health. */
const PROBE_TIMEOUT_MS = 3000;

const RESEND_DOMAINS_URL = "https://api.resend.com/domains";

let cached: { at: number; value: MailHealth } | null = null;

/** Drop the memoised result. For tests. */
export function resetMailHealthCache(): void {
  cached = null;
}

/**
 * Classify an HTTP status from Resend's API.
 *
 * 401/403 is the signal that matters: the key exists but is not accepted.
 * Anything else (including 5xx and rate limiting) says nothing about the key,
 * so it is reported as "unreachable" rather than falsely condemning a key that
 * may be fine.
 */
export function classifyResendStatus(status: number): MailHealth {
  if (status === 401 || status === 403) return "invalid-key";
  if (status >= 200 && status < 300) return "up";
  return "unreachable";
}

/** Shape of the key Resend issues. Cheap guard against a placeholder value. */
export function looksLikeResendKey(key: string | undefined): boolean {
  return typeof key === "string" && key.startsWith("re_") && key.length > 10;
}

/**
 * Probe mail readiness, memoised for PROBE_TTL_MS.
 *
 * `fetchImpl` and `now` are injectable so this is testable without network or
 * fake timers.
 */
export async function checkMailHealth({
  fetchImpl = globalThis.fetch,
  now = Date.now(),
  apiKey = process.env.RESEND_API_KEY,
  mailFrom = process.env.MAIL_FROM,
}: {
  fetchImpl?: typeof globalThis.fetch;
  now?: number;
  apiKey?: string;
  mailFrom?: string;
} = {}): Promise<MailHealth> {
  // A key without a verified sender is just as unable to send, so treat a
  // missing MAIL_FROM as unconfigured rather than reporting a misleading "up".
  if (!looksLikeResendKey(apiKey) || !mailFrom) return "not-configured";

  if (cached && now - cached.at < PROBE_TTL_MS) return cached.value;

  let value: MailHealth;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    try {
      const res = await fetchImpl(RESEND_DOMAINS_URL, {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      value = classifyResendStatus(res.status);
    } finally {
      clearTimeout(timer);
    }
  } catch {
    // Network error, DNS failure or timeout. We genuinely do not know, and
    // saying "invalid-key" here would page someone over a blip.
    value = "unreachable";
  }

  cached = { at: now, value };
  return value;
}

/**
 * Should this mail state fail the readiness probe?
 *
 * Only in production, and only for states that are definitely broken. Dev and
 * preview run without mail by design, and "unreachable" is an unknown rather
 * than a failure — alerting on either would be noise, and a noisy probe gets
 * muted, which is how the June outage stayed invisible.
 */
export function mailStateIsFailing(
  state: MailHealth,
  isProduction: boolean,
): boolean {
  if (!isProduction) return false;
  return state === "not-configured" || state === "invalid-key";
}

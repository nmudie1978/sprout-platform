/**
 * PROGRAMME URL VALIDATOR
 *
 * Lightweight URL validator for Study Path programme links. Every
 * programme in `programmes.json` has a `url` field that gets rendered
 * as a "Visit page →" link inside the EducationBrowser. When those
 * links go stale the user hits a 404 — a high-stakes failure because
 * the whole Study Path section is meant to be trustworthy pathway
 * data.
 *
 * This module runs at CI time via `scripts/validate-programmes.ts`
 * and classifies each URL into a structured status. Results get
 * written to `programme-validation.json` and consumed at module-load
 * time by `getProgrammesForCareer`, which filters out any URL that
 * classifies as a hard client error (404/410/gone). The UI path
 * never makes a network call — validation is strictly offline
 * and scheduled.
 *
 * Status classification (ordered strict → lenient):
 *   - LIVE         200–299 or 304 — URL works
 *   - REDIRECT     3xx — URL redirects somewhere, usually fine but flagged
 *   - CLIENT_ERROR 400–499 (except 403, 405 which fall back to GET) — dead
 *   - SERVER_ERROR 500–599 — probably transient, not filtered out
 *   - DNS          Host resolution failed — dead
 *   - TIMEOUT      Request took > timeout — flagged, not filtered
 *   - BLOCKED      TLS/CORS/WAF rejection — flagged, not filtered
 *   - UNKNOWN      Anything else — defensive, treated as LIVE
 *
 * Defensive bias: a URL is only HIDDEN from users when classification
 * is CLIENT_ERROR or DNS — both unambiguously "this won't load". Every
 * other status gets through so a transient blip doesn't nuke half the
 * Study Path programmes from the UI.
 */

// ── Types ────────────────────────────────────────────────────────────

export type ValidationStatus =
  | 'LIVE'
  | 'REDIRECT'
  | 'CLIENT_ERROR'
  | 'SERVER_ERROR'
  | 'DNS'
  | 'TIMEOUT'
  | 'BLOCKED'
  | 'UNKNOWN';

export interface ValidationResult {
  url: string;
  status: ValidationStatus;
  httpCode: number | null;
  checkedAt: string; // ISO timestamp
}

// ── Classification ───────────────────────────────────────────────────

/**
 * Pure classifier: maps an HTTP status code to a ValidationStatus.
 * Exported for unit testing.
 */
export function classifyHttpStatus(code: number): ValidationStatus {
  if (code === 304) return 'LIVE';
  if (code >= 200 && code < 300) return 'LIVE';
  if (code >= 300 && code < 400) return 'REDIRECT';
  if (code >= 400 && code < 500) return 'CLIENT_ERROR';
  if (code >= 500 && code < 600) return 'SERVER_ERROR';
  return 'UNKNOWN';
}

/**
 * Whether a programme with this status should be HIDDEN from the UI.
 * Only the two unambiguous "this URL won't load" states get filtered:
 * CLIENT_ERROR (404/410/etc) and DNS. Everything else falls through
 * so a transient issue doesn't erase the Study Path content.
 *
 * Exported so consumers of `programme-validation.json` can apply the
 * same rule without re-encoding it at the call site.
 */
export function shouldHideFromUi(status: ValidationStatus): boolean {
  return status === 'CLIENT_ERROR' || status === 'DNS';
}

// ── URL validator ────────────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Validate a single URL. Uses HEAD first, falls back to a ranged GET
 * for servers that reject HEAD (405/403 are the common cases).
 *
 * Returns a ValidationResult with one of the classified statuses. Never
 * throws — a network error becomes DNS / TIMEOUT / BLOCKED.
 */
export async function validateProgrammeUrl(
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<ValidationResult> {
  const checkedAt = new Date().toISOString();

  // Defensive URL parse — guards against malformed data in the JSON
  // (empty string, non-http scheme, etc.). Those count as CLIENT_ERROR
  // with no http code because the link would never work.
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { url, status: 'CLIENT_ERROR', httpCode: null, checkedAt };
    }
  } catch {
    return { url, status: 'CLIENT_ERROR', httpCode: null, checkedAt };
  }

  // Attempt HEAD first
  try {
    const headRes = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      // Pretend to be a normal browser — some WAFs block bare User-Agents.
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; EndeavrlyProgrammeValidator/1.0; +https://endeavrly.no)',
      },
    });

    // HEAD 405 (Method Not Allowed) or 403 (some servers reject HEAD
    // with 403 even on public URLs) — fall back to a ranged GET.
    if (headRes.status === 405 || headRes.status === 403) {
      try {
        const getRes = await fetch(url, {
          method: 'GET',
          headers: {
            Range: 'bytes=0-0',
            'User-Agent':
              'Mozilla/5.0 (compatible; EndeavrlyProgrammeValidator/1.0; +https://endeavrly.no)',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(timeoutMs),
        });
        // 206 Partial Content is a success for ranged GET
        if (getRes.ok || getRes.status === 206 || getRes.status === 304) {
          return { url, status: 'LIVE', httpCode: getRes.status, checkedAt };
        }
        return {
          url,
          status: classifyHttpStatus(getRes.status),
          httpCode: getRes.status,
          checkedAt,
        };
      } catch {
        return { url, status: 'BLOCKED', httpCode: null, checkedAt };
      }
    }

    // Normal HEAD response
    return {
      url,
      status: classifyHttpStatus(headRes.status),
      httpCode: headRes.status,
      checkedAt,
    };
  } catch (err) {
    // Classify the network error. We check both `.name` and
    // `.message` because error shapes differ across runtimes:
    //
    //   - Undici (Node fetch) throws `TypeError('fetch failed')`
    //     with `cause.code === 'ENOTFOUND'` for DNS issues
    //   - Browser / jsdom throws `DOMException` with
    //     `name === 'AbortError'` for timeouts, where `.message`
    //     may just be the constructor's first arg
    //   - TLS errors surface with "certificate", "ssl", "tls" in
    //     either the message or the cause chain
    const name =
      err && typeof err === 'object' && 'name' in err
        ? String((err as { name: unknown }).name).toLowerCase()
        : '';
    const message =
      err instanceof Error ? err.message.toLowerCase() : '';
    const causeMessage =
      err &&
      typeof err === 'object' &&
      'cause' in err &&
      err.cause instanceof Error
        ? err.cause.message.toLowerCase()
        : '';
    const combined = `${name} ${message} ${causeMessage}`;

    // Timeout — AbortError or any message mentioning timeout/abort.
    if (
      name === 'aborterror' ||
      combined.includes('abort') ||
      combined.includes('timeout')
    ) {
      return { url, status: 'TIMEOUT', httpCode: null, checkedAt };
    }
    // DNS failure — host not found.
    if (
      combined.includes('enotfound') ||
      combined.includes('getaddrinfo') ||
      combined.includes('dns')
    ) {
      return { url, status: 'DNS', httpCode: null, checkedAt };
    }
    // TLS / SSL / CORS rejection.
    if (
      combined.includes('certificate') ||
      combined.includes('ssl') ||
      combined.includes('tls') ||
      combined.includes('cors')
    ) {
      return { url, status: 'BLOCKED', httpCode: null, checkedAt };
    }
    return { url, status: 'UNKNOWN', httpCode: null, checkedAt };
  }
}

// ── Batch validator with concurrency limiter ─────────────────────────

const DEFAULT_CONCURRENCY = 5;

/**
 * Validate a batch of URLs in parallel with a concurrency cap. Used by
 * the CI script to validate all 100+ programmes without hammering
 * any one server. Results are returned in input order.
 */
export async function validateProgrammeUrls(
  urls: string[],
  opts: { concurrency?: number; timeoutMs?: number } = {},
): Promise<ValidationResult[]> {
  const concurrency = opts.concurrency ?? DEFAULT_CONCURRENCY;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const results: ValidationResult[] = new Array(urls.length);

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((url) => validateProgrammeUrl(url, timeoutMs)),
    );
    for (let j = 0; j < batchResults.length; j++) {
      results[i + j] = batchResults[j];
    }
  }

  return results;
}

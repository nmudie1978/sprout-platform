/**
 * validate-programme-url — unit tests.
 *
 * The validator is used by scripts/validate-programmes.ts (CI) and
 * indirectly by getProgrammesForCareer (via the static validation
 * JSON file). Tests cover:
 *
 *   - classifyHttpStatus — pure classifier, every HTTP code bucket
 *   - shouldHideFromUi  — the gate that controls what's hidden from
 *                         the UI; must only flag unambiguous "dead"
 *                         statuses
 *   - validateProgrammeUrl — defensive URL parse + fetch mock
 *
 * The batch validator is exercised implicitly via the CLI script and
 * the full suite; a dedicated integration test would require
 * real network I/O which we skip here.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  classifyHttpStatus,
  shouldHideFromUi,
  validateProgrammeUrl,
} from '../validate-programme-url';

// ── classifyHttpStatus ──────────────────────────────────────────────

describe('classifyHttpStatus', () => {
  it('maps 200 to LIVE', () => {
    expect(classifyHttpStatus(200)).toBe('LIVE');
  });

  it('maps 201 to LIVE', () => {
    expect(classifyHttpStatus(201)).toBe('LIVE');
  });

  it('maps 299 to LIVE (upper edge of 2xx)', () => {
    expect(classifyHttpStatus(299)).toBe('LIVE');
  });

  it('maps 304 to LIVE (Not Modified is valid)', () => {
    expect(classifyHttpStatus(304)).toBe('LIVE');
  });

  it('maps 301 to REDIRECT', () => {
    expect(classifyHttpStatus(301)).toBe('REDIRECT');
  });

  it('maps 302 to REDIRECT', () => {
    expect(classifyHttpStatus(302)).toBe('REDIRECT');
  });

  it('maps 308 to REDIRECT', () => {
    expect(classifyHttpStatus(308)).toBe('REDIRECT');
  });

  it('maps 400 to CLIENT_ERROR', () => {
    expect(classifyHttpStatus(400)).toBe('CLIENT_ERROR');
  });

  it('maps 404 to CLIENT_ERROR', () => {
    expect(classifyHttpStatus(404)).toBe('CLIENT_ERROR');
  });

  it('maps 410 (Gone) to CLIENT_ERROR', () => {
    expect(classifyHttpStatus(410)).toBe('CLIENT_ERROR');
  });

  it('maps 499 to CLIENT_ERROR (upper edge of 4xx)', () => {
    expect(classifyHttpStatus(499)).toBe('CLIENT_ERROR');
  });

  it('maps 500 to SERVER_ERROR', () => {
    expect(classifyHttpStatus(500)).toBe('SERVER_ERROR');
  });

  it('maps 502 (Bad Gateway) to SERVER_ERROR', () => {
    expect(classifyHttpStatus(502)).toBe('SERVER_ERROR');
  });

  it('maps 503 (Service Unavailable) to SERVER_ERROR', () => {
    expect(classifyHttpStatus(503)).toBe('SERVER_ERROR');
  });

  it('maps 599 to SERVER_ERROR (upper edge of 5xx)', () => {
    expect(classifyHttpStatus(599)).toBe('SERVER_ERROR');
  });

  it('maps weird codes outside standard ranges to UNKNOWN', () => {
    expect(classifyHttpStatus(999)).toBe('UNKNOWN');
    expect(classifyHttpStatus(100)).toBe('UNKNOWN'); // 1xx not classified as LIVE
    expect(classifyHttpStatus(0)).toBe('UNKNOWN');
  });
});

// ── shouldHideFromUi ────────────────────────────────────────────────

describe('shouldHideFromUi', () => {
  it('returns true for CLIENT_ERROR (404 family)', () => {
    // A 404 is unambiguously dead — user would hit a broken page.
    expect(shouldHideFromUi('CLIENT_ERROR')).toBe(true);
  });

  it('returns true for DNS failure', () => {
    // DNS resolution failure means the host is gone entirely.
    expect(shouldHideFromUi('DNS')).toBe(true);
  });

  it('returns false for LIVE', () => {
    expect(shouldHideFromUi('LIVE')).toBe(false);
  });

  it('returns false for REDIRECT (URL changed but still works)', () => {
    // Redirects are fine — the end URL works. A 301/308 should not
    // hide the programme from users.
    expect(shouldHideFromUi('REDIRECT')).toBe(false);
  });

  it('returns false for SERVER_ERROR (probably transient)', () => {
    // A 5xx is almost always transient; hiding on a single failed
    // check would nuke legitimate programmes over a server blip.
    expect(shouldHideFromUi('SERVER_ERROR')).toBe(false);
  });

  it('returns false for TIMEOUT (probably transient)', () => {
    expect(shouldHideFromUi('TIMEOUT')).toBe(false);
  });

  it('returns false for BLOCKED (WAF / TLS — not dead, just unfriendly)', () => {
    // A WAF or TLS issue blocks our CI runner but real users may
    // reach the URL fine. Don't hide.
    expect(shouldHideFromUi('BLOCKED')).toBe(false);
  });

  it('returns false for UNKNOWN (defensive default)', () => {
    expect(shouldHideFromUi('UNKNOWN')).toBe(false);
  });
});

// ── validateProgrammeUrl ────────────────────────────────────────────

describe('validateProgrammeUrl (negative / edge cases)', () => {
  it('classifies an empty string as CLIENT_ERROR', async () => {
    const result = await validateProgrammeUrl('');
    expect(result.status).toBe('CLIENT_ERROR');
    expect(result.httpCode).toBeNull();
  });

  it('classifies a non-URL string as CLIENT_ERROR', async () => {
    const result = await validateProgrammeUrl('not a url');
    expect(result.status).toBe('CLIENT_ERROR');
    expect(result.httpCode).toBeNull();
  });

  it('rejects non-http(s) schemes', async () => {
    const result = await validateProgrammeUrl('javascript:alert(1)');
    expect(result.status).toBe('CLIENT_ERROR');
    expect(result.httpCode).toBeNull();
  });

  it('rejects data: URIs', async () => {
    const result = await validateProgrammeUrl('data:text/html,hello');
    expect(result.status).toBe('CLIENT_ERROR');
  });

  it('records a checkedAt ISO timestamp on every result', async () => {
    const result = await validateProgrammeUrl('not-a-url');
    expect(result.checkedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
    );
  });
});

describe('validateProgrammeUrl (mocked fetch)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Start with a no-op mock; each test overrides per case.
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns LIVE when the server returns 200', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    const result = await validateProgrammeUrl('https://example.com/ok');
    expect(result.status).toBe('LIVE');
    expect(result.httpCode).toBe(200);
  });

  it('returns CLIENT_ERROR when the server returns 404', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
    const result = await validateProgrammeUrl('https://example.com/gone');
    expect(result.status).toBe('CLIENT_ERROR');
    expect(result.httpCode).toBe(404);
  });

  it('returns REDIRECT when the server returns 301', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 301,
    });
    const result = await validateProgrammeUrl('https://example.com/moved');
    expect(result.status).toBe('REDIRECT');
    expect(result.httpCode).toBe(301);
  });

  it('returns SERVER_ERROR when the server returns 503', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });
    const result = await validateProgrammeUrl('https://example.com/flaky');
    expect(result.status).toBe('SERVER_ERROR');
    expect(result.httpCode).toBe(503);
  });

  it('falls back to GET when HEAD returns 405', async () => {
    // HEAD returns 405, then GET returns 200 → result should be LIVE.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 405 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    globalThis.fetch = fetchMock;
    const result = await validateProgrammeUrl('https://example.com/no-head');
    expect(result.status).toBe('LIVE');
    expect(result.httpCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // First call should be HEAD
    expect(fetchMock.mock.calls[0][1]?.method).toBe('HEAD');
    // Second call should be GET
    expect(fetchMock.mock.calls[1][1]?.method).toBe('GET');
  });

  it('falls back to GET when HEAD returns 403 (some WAFs)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 403 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    globalThis.fetch = fetchMock;
    const result = await validateProgrammeUrl('https://example.com/waf');
    expect(result.status).toBe('LIVE');
  });

  it('accepts 206 Partial Content as LIVE (ranged GET fallback)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 405 })
      .mockResolvedValueOnce({ ok: false, status: 206 });
    globalThis.fetch = fetchMock;
    const result = await validateProgrammeUrl('https://example.com/ranged');
    expect(result.status).toBe('LIVE');
    expect(result.httpCode).toBe(206);
  });

  it('classifies a DNS-error fetch as DNS', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(
      Object.assign(new Error('getaddrinfo ENOTFOUND example.invalid'), {
        code: 'ENOTFOUND',
      }),
    );
    const result = await validateProgrammeUrl('https://example.invalid/');
    expect(result.status).toBe('DNS');
    expect(result.httpCode).toBeNull();
  });

  it('classifies an AbortError as TIMEOUT', async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new DOMException('Timeout', 'AbortError'));
    const result = await validateProgrammeUrl('https://example.com/slow');
    expect(result.status).toBe('TIMEOUT');
    expect(result.httpCode).toBeNull();
  });

  it('classifies a TLS/SSL error as BLOCKED', async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new Error('certificate has expired'));
    const result = await validateProgrammeUrl('https://expired.badssl.com');
    expect(result.status).toBe('BLOCKED');
    expect(result.httpCode).toBeNull();
  });
});

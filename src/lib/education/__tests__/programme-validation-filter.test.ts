/**
 * Programme validation filter — integration test.
 *
 * Proves that `getProgrammesForCareer` (and related accessors) honour
 * the `programme-validation.json` hidden set. Because the validation
 * data is loaded statically at module import time, we can't mutate it
 * at runtime — so this test asserts the observable contract through
 * `getHiddenProgrammeIds()`.
 */

import { describe, expect, it } from 'vitest';
import {
  getHiddenProgrammeIds,
  getProgrammesForCareer,
  getProgrammeById,
} from '../index';
import { shouldHideFromUi, classifyHttpStatus } from '../validate-programme-url';
import validation from '../data/programme-validation.json';

describe('Programme validation filter', () => {
  it('getHiddenProgrammeIds returns a Set whose ids all correspond to hideable validation statuses', () => {
    const hidden = getHiddenProgrammeIds();
    expect(hidden).toBeInstanceOf(Set);

    const results = (validation as { results?: Record<string, { status: string }> }).results ?? {};
    const hideableIds = new Set(
      Object.entries(results)
        .filter(([, r]) => shouldHideFromUi(r.status as never))
        .map(([id]) => id),
    );
    expect(hidden).toEqual(hideableIds);
  });

  it('getProgrammesForCareer returns programmes for a known career', () => {
    // Sanity check that the filter doesn't accidentally break the
    // happy path. "doctor" has many programmes in the dataset.
    const programmes = getProgrammesForCareer('doctor');
    expect(programmes.length).toBeGreaterThan(0);
    for (const p of programmes) {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('url');
      expect(p.url).toMatch(/^https?:\/\//);
    }
  });

  it('returns a Doctor programme by ID (fallback: by stable ID)', () => {
    const programmes = getProgrammesForCareer('doctor');
    const first = programmes[0];
    const resolved = getProgrammeById(first.id);
    expect(resolved).not.toBeNull();
    expect(resolved?.id).toBe(first.id);
  });

  it('returns null for a non-existent programme ID', () => {
    const resolved = getProgrammeById('no-such-programme-id-zzzz');
    expect(resolved).toBeNull();
  });
});

describe('Programme validation filter — contract integrity', () => {
  it('hidden set only contains statuses flagged by shouldHideFromUi', () => {
    // Meta test: the validator's contract is that only CLIENT_ERROR
    // and DNS should be hidden. This test re-states that invariant
    // so a future change to `shouldHideFromUi` must also update this.
    const hideable = [
      'LIVE',
      'REDIRECT',
      'CLIENT_ERROR',
      'SERVER_ERROR',
      'DNS',
      'TIMEOUT',
      'BLOCKED',
      'UNKNOWN',
    ] as const;
    const flagged = hideable.filter((s) => shouldHideFromUi(s));
    expect(flagged).toEqual(['CLIENT_ERROR', 'DNS']);
  });

  it('classifyHttpStatus + shouldHideFromUi round-trip: only a dead 4xx hides', () => {
    // A 404 classifies as CLIENT_ERROR and is hideable; a 503 classifies as
    // SERVER_ERROR and is not.
    expect(shouldHideFromUi(classifyHttpStatus(404))).toBe(true);
    expect(shouldHideFromUi(classifyHttpStatus(410))).toBe(true);
    expect(shouldHideFromUi(classifyHttpStatus(503))).toBe(false);
    expect(shouldHideFromUi(classifyHttpStatus(200))).toBe(false);
    expect(shouldHideFromUi(classifyHttpStatus(301))).toBe(false);
  });

  it('does NOT hide on 401/403/405/429 — those describe the request, not the page', () => {
    // CONTRACT CHANGE (2026-08-29). This previously asserted 403 hides.
    //
    // It was changed because the old contract actively lost content: on
    // 2026-08-24 a CI run walked 16 vilbli.no URLs in quick succession, tripped
    // rate limiting, and recorded 405 for every one. Under the old rule that
    // would have hidden the entire vocational trades cluster — electrician,
    // welder, industrial-mechanic and ~60 dependent careers — from Study Path.
    // All 16 pages return 200 on a manual check.
    //
    // A host that answers 403/405/429 to a validator and 200 to a browser has
    // told us about our request, not about the page. `BLOCKED` is the honest
    // classification and it deliberately falls outside shouldHideFromUi.
    for (const code of [401, 403, 405, 429]) {
      expect(classifyHttpStatus(code)).toBe('BLOCKED');
      expect(shouldHideFromUi(classifyHttpStatus(code))).toBe(false);
    }
  });
});

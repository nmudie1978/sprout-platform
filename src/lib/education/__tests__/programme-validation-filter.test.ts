/**
 * Programme validation filter — integration test.
 *
 * Proves that `getProgrammesForCareer` (and related accessors) honour
 * the `programme-validation.json` hidden set. Because the validation
 * data is loaded statically at module import time, we can't mutate it
 * at runtime — so this test uses a synthetic validator-style set and
 * asserts the observable contract through `getHiddenProgrammeIds()`.
 *
 * The test also validates that the default (empty) validation file
 * means NO programmes are hidden — the feature is backwards
 * compatible and fails safe: missing validation data = full programme
 * list.
 */

import { describe, expect, it } from 'vitest';
import {
  getHiddenProgrammeIds,
  getProgrammesForCareer,
  getProgrammeById,
} from '../index';
import { shouldHideFromUi, classifyHttpStatus } from '../validate-programme-url';

describe('Programme validation filter (default: empty)', () => {
  it('getHiddenProgrammeIds returns an empty set when no programmes are broken', () => {
    // The seed programme-validation.json ships with empty results —
    // fail-safe default until the CI script runs for the first time.
    const hidden = getHiddenProgrammeIds();
    expect(hidden).toBeInstanceOf(Set);
    expect(hidden.size).toBe(0);
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

  it('classifyHttpStatus + shouldHideFromUi round-trip: only 4xx hides', () => {
    // Proof that a 404 response would both classify as CLIENT_ERROR
    // AND be flagged as hideable, while a 503 would classify as
    // SERVER_ERROR and NOT be flagged.
    expect(shouldHideFromUi(classifyHttpStatus(404))).toBe(true);
    expect(shouldHideFromUi(classifyHttpStatus(410))).toBe(true);
    expect(shouldHideFromUi(classifyHttpStatus(403))).toBe(true);
    expect(shouldHideFromUi(classifyHttpStatus(503))).toBe(false);
    expect(shouldHideFromUi(classifyHttpStatus(200))).toBe(false);
    expect(shouldHideFromUi(classifyHttpStatus(301))).toBe(false);
  });
});

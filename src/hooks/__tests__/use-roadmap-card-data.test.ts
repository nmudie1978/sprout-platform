/**
 * stripFoundation — unit tests for Issue 3 (Foundation persistence).
 *
 * Foundation card data lives at PROFILE scope under a separate
 * endpoint (/api/journey/foundation-data). Per-goal card-data records
 * must never contain a foundation snapshot, otherwise switching
 * careers could restore a stale foundation on top of the fresh
 * profile-level value. The `stripFoundation` helper is the gate that
 * enforces this on both the read merge and the write payload inside
 * `useRoadmapCardData`.
 *
 * These tests verify the contract:
 *
 *   Positive — foundation slot removed from payloads
 *   Positive — other cards preserved unchanged
 *   Positive — no-op when foundation key absent
 *   Negative — does not mutate the input object
 *   Negative — deep equality preserved for other keys
 *
 * A React-hook integration test would require a mock fetch + jsdom +
 * react-testing-library. The pure-helper tests here give us high
 * confidence in the data-integrity contract without that stack.
 */

import { describe, expect, it } from 'vitest';
import {
  stripFoundation,
  FOUNDATION_ITEM_ID_INTERNAL,
} from '../use-roadmap-card-data';

describe('stripFoundation (Issue 3 — positive tests)', () => {
  it('removes the foundation slot when present', () => {
    const input = {
      [FOUNDATION_ITEM_ID_INTERNAL]: { status: 'done', notes: 'school stuff' },
      'step-1': { status: 'in_progress', notes: '' },
      'step-2': { status: 'not_started', notes: '' },
    };
    const out = stripFoundation(input);
    expect(out).not.toHaveProperty(FOUNDATION_ITEM_ID_INTERNAL);
    expect(out['step-1']).toEqual({ status: 'in_progress', notes: '' });
    expect(out['step-2']).toEqual({ status: 'not_started', notes: '' });
  });

  it('returns the original reference when foundation slot is absent', () => {
    const input = {
      'step-1': { status: 'done', notes: '' },
    };
    const out = stripFoundation(input);
    // Same object identity — nothing to strip, no new allocation.
    expect(out).toBe(input);
  });

  it('returns an empty object when only the foundation slot is present', () => {
    const input = { [FOUNDATION_ITEM_ID_INTERNAL]: { status: 'done' } };
    const out = stripFoundation(input);
    expect(out).toEqual({});
  });

  it('preserves all non-foundation keys unchanged', () => {
    const input = {
      [FOUNDATION_ITEM_ID_INTERNAL]: { status: 'done' },
      'a-1': { status: 'done', stickyNote: 'nice' },
      'a-2': { status: 'in_progress', notes: 'more' },
      'a-3': { status: 'not_started' },
    };
    const out = stripFoundation(input);
    expect(Object.keys(out).sort()).toEqual(['a-1', 'a-2', 'a-3']);
    expect(out['a-1']).toEqual({ status: 'done', stickyNote: 'nice' });
    expect(out['a-2']).toEqual({ status: 'in_progress', notes: 'more' });
    expect(out['a-3']).toEqual({ status: 'not_started' });
  });
});

describe('stripFoundation (Issue 3 — negative tests)', () => {
  it('does not mutate the input object', () => {
    const input = {
      [FOUNDATION_ITEM_ID_INTERNAL]: { status: 'done', school: 'Lawsidenn' },
      'step-1': { status: 'in_progress' },
    };
    const snapshot = JSON.parse(JSON.stringify(input));
    stripFoundation(input);
    expect(input).toEqual(snapshot);
  });

  it('does not strip keys that merely contain "foundation" as a substring', () => {
    // Guards against a naive implementation that used a regex or
    // substring match instead of the exact key.
    const input = {
      'foundation-extra': { status: 'done' },
      'my-foundations': { status: 'done' },
      'foundation': { status: 'done' },
    };
    const out = stripFoundation(input);
    expect(out).toEqual(input);
  });

  it('only removes the exact FOUNDATION_ITEM_ID key', () => {
    expect(FOUNDATION_ITEM_ID_INTERNAL).toBe('my-foundation');
    const input = {
      'my-foundation': { status: 'done' },
      'not-my-foundation': { status: 'done' },
    };
    const out = stripFoundation(input);
    expect(out).not.toHaveProperty('my-foundation');
    expect(out).toHaveProperty('not-my-foundation');
  });

  it('handles empty input without error', () => {
    expect(stripFoundation({})).toEqual({});
  });
});

/**
 * Lens progress + snapshot predicate — unit tests for Issue 1.
 *
 * Covers:
 *   - computeLensProgress uses the explicit YES/NO signals, NOT
 *     `hasPrimaryGoal`
 *   - The three checkpoints are independent OR conditions
 *   - isJourneySnapshotWorthy matches the three-checkpoint spec
 *   - journeyStageLabel returns the highest-reached stage, not the
 *     next-to-do stage
 *   - Per-career keying — switching careers doesn't bleed state
 *
 * Storage contract: every flag is a localStorage key of the form
 * `journey-{discover|understand|grow-active}-confirmed-{slug}` (grow
 * uses `journey-grow-active-{slug}`). The tests populate localStorage
 * directly to simulate the UI's write path without coupling to the
 * writer components.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  computeLensProgress,
  isJourneySnapshotWorthy,
  journeyStageLabel,
  setDiscoverConfirmed,
  setUnderstandConfirmed,
  markGrowActive,
} from '../lens-progress';

// Minimal localStorage polyfill so the module's `typeof window`
// branches resolve to a real writable store in Node/vitest.
function installLocalStorageShim() {
  if (typeof globalThis.window === 'undefined') {
    const store = new Map<string, string>();
    (globalThis as unknown as { window: typeof globalThis }).window =
      globalThis as unknown as typeof globalThis;
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: (k: string) => (store.has(k) ? (store.get(k) ?? null) : null),
      setItem: (k: string, v: string) => {
        store.set(k, String(v));
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => {
        store.clear();
      },
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      get length() {
        return store.size;
      },
    } as Storage;
    (globalThis.window as unknown as { localStorage: Storage }).localStorage =
      (globalThis as unknown as { localStorage: Storage }).localStorage;
  }
}

installLocalStorageShim();

function clearStorage() {
  try {
    (globalThis as unknown as { localStorage: Storage }).localStorage.clear();
  } catch {
    /* ignore */
  }
}

describe('computeLensProgress (Issue 1)', () => {
  beforeEach(clearStorage);
  afterEach(clearStorage);

  it('returns all-false when nothing has been confirmed', () => {
    const p = computeLensProgress({ hasPrimaryGoal: true, careerTitle: 'Chef' });
    expect(p.discoverDone).toBe(false);
    expect(p.understandDone).toBe(false);
    expect(p.growDone).toBe(false);
    expect(p.completedCount).toBe(0);
    expect(p.highestStage).toBeNull();
    expect(p.currentLens).toBe('discover');
  });

  it('does NOT mark Discover done just because a primary goal exists', () => {
    // Regression: previously computeLensProgress used
    // `discoverDone = hasPrimaryGoal` which meant setting a career as
    // primary auto-registered Discover completion. Per spec, only an
    // explicit YES on the Discover confirmation card counts.
    const p = computeLensProgress({ hasPrimaryGoal: true, careerTitle: 'Chef' });
    expect(p.discoverDone).toBe(false);
  });

  it('marks Discover done after setDiscoverConfirmed YES', () => {
    setDiscoverConfirmed('Chef', true);
    const p = computeLensProgress({ hasPrimaryGoal: false, careerTitle: 'Chef' });
    expect(p.discoverDone).toBe(true);
    expect(p.understandDone).toBe(false);
    expect(p.growDone).toBe(false);
    expect(p.completedCount).toBe(1);
    expect(p.highestStage).toBe('discover');
  });

  it('marks Understand done independently of Discover', () => {
    // Old logic gated `understandDone = discoverDone && isUnderstandConfirmed`.
    // Per spec the three checkpoints are independent OR conditions,
    // so Understand can be true even if Discover is false.
    setUnderstandConfirmed('Chef', true);
    const p = computeLensProgress({ hasPrimaryGoal: false, careerTitle: 'Chef' });
    expect(p.discoverDone).toBe(false);
    expect(p.understandDone).toBe(true);
    expect(p.growDone).toBe(false);
    expect(p.highestStage).toBe('understand');
  });

  it('marks Grow done independently of Understand', () => {
    // Old logic gated `growDone = understandDone && isGrowActive`.
    // The spec permits Grow completion as a sufficient checkpoint.
    markGrowActive('Chef');
    const p = computeLensProgress({ hasPrimaryGoal: false, careerTitle: 'Chef' });
    expect(p.growDone).toBe(true);
    expect(p.highestStage).toBe('grow');
  });

  it('all three checkpoints reached → completedCount 3, highestStage grow', () => {
    setDiscoverConfirmed('Chef', true);
    setUnderstandConfirmed('Chef', true);
    markGrowActive('Chef');
    const p = computeLensProgress({ hasPrimaryGoal: false, careerTitle: 'Chef' });
    expect(p.completedCount).toBe(3);
    expect(p.highestStage).toBe('grow');
  });

  it('setDiscoverConfirmed(false) clears the flag', () => {
    setDiscoverConfirmed('Chef', true);
    setDiscoverConfirmed('Chef', false);
    const p = computeLensProgress({ hasPrimaryGoal: false, careerTitle: 'Chef' });
    expect(p.discoverDone).toBe(false);
  });

  it('flags are keyed per-career — Chef state does not bleed to Doctor', () => {
    setDiscoverConfirmed('Chef', true);
    setUnderstandConfirmed('Chef', true);
    const chef = computeLensProgress({ hasPrimaryGoal: false, careerTitle: 'Chef' });
    const doctor = computeLensProgress({ hasPrimaryGoal: false, careerTitle: 'Doctor' });
    expect(chef.discoverDone).toBe(true);
    expect(chef.understandDone).toBe(true);
    expect(doctor.discoverDone).toBe(false);
    expect(doctor.understandDone).toBe(false);
  });

  it('null or empty career title returns all-false', () => {
    const nullResult = computeLensProgress({ hasPrimaryGoal: true, careerTitle: null });
    expect(nullResult.discoverDone).toBe(false);
    expect(nullResult.highestStage).toBeNull();
    const emptyResult = computeLensProgress({ hasPrimaryGoal: true, careerTitle: '' });
    expect(emptyResult.discoverDone).toBe(false);
    expect(emptyResult.highestStage).toBeNull();
  });
});

describe('isJourneySnapshotWorthy (Issue 1 — positive tests)', () => {
  beforeEach(clearStorage);
  afterEach(clearStorage);

  it('returns true after Discover YES', () => {
    setDiscoverConfirmed('Chef', true);
    expect(isJourneySnapshotWorthy('Chef')).toBe(true);
  });

  it('returns true after Understand YES', () => {
    setUnderstandConfirmed('Chef', true);
    expect(isJourneySnapshotWorthy('Chef')).toBe(true);
  });

  it('returns true after Grow 2/2 tasks complete', () => {
    markGrowActive('Chef');
    expect(isJourneySnapshotWorthy('Chef')).toBe(true);
  });

  it('returns true when all three checkpoints are reached', () => {
    setDiscoverConfirmed('Chef', true);
    setUnderstandConfirmed('Chef', true);
    markGrowActive('Chef');
    expect(isJourneySnapshotWorthy('Chef')).toBe(true);
  });
});

describe('isJourneySnapshotWorthy (Issue 1 — negative tests)', () => {
  beforeEach(clearStorage);
  afterEach(clearStorage);

  it('returns false with no progression', () => {
    expect(isJourneySnapshotWorthy('Chef')).toBe(false);
  });

  it('setting a primary goal alone is NOT snapshot-worthy', () => {
    // Intentionally does NOT call any set* function — simulates a
    // user who set Chef as their primary goal but never answered
    // Discover YES, never answered Understand YES, and never
    // completed Grow tasks.
    expect(isJourneySnapshotWorthy('Chef')).toBe(false);
  });

  it('returns false for null/empty/undefined career title', () => {
    expect(isJourneySnapshotWorthy(null)).toBe(false);
    expect(isJourneySnapshotWorthy(undefined)).toBe(false);
    expect(isJourneySnapshotWorthy('')).toBe(false);
  });

  it('Chef snapshot status does not contaminate Doctor', () => {
    setDiscoverConfirmed('Chef', true);
    expect(isJourneySnapshotWorthy('Chef')).toBe(true);
    expect(isJourneySnapshotWorthy('Doctor')).toBe(false);
  });

  it('revoking a confirmation (NO) removes snapshot status', () => {
    setDiscoverConfirmed('Chef', true);
    expect(isJourneySnapshotWorthy('Chef')).toBe(true);
    setDiscoverConfirmed('Chef', false);
    expect(isJourneySnapshotWorthy('Chef')).toBe(false);
  });
});

describe('journeyStageLabel (Issue 1)', () => {
  beforeEach(clearStorage);
  afterEach(clearStorage);

  it('returns null when no checkpoint reached', () => {
    expect(journeyStageLabel('Chef')).toBeNull();
  });

  it('returns "Discover" after Discover YES', () => {
    setDiscoverConfirmed('Chef', true);
    expect(journeyStageLabel('Chef')).toEqual({
      label: 'Discover',
      highest: 'discover',
    });
  });

  it('returns "Understand" after Understand YES (highest-reached)', () => {
    // Regression: previously the Dashboard renderer showed
    // "Understand" when Discover was done but Understand was not —
    // i.e. it was showing the NEXT stage, not the reached stage.
    // journeyStageLabel should return the HIGHEST reached stage.
    setUnderstandConfirmed('Chef', true);
    expect(journeyStageLabel('Chef')).toEqual({
      label: 'Understand',
      highest: 'understand',
    });
  });

  it('returns "Grow" after Grow active', () => {
    markGrowActive('Chef');
    expect(journeyStageLabel('Chef')).toEqual({
      label: 'Grow',
      highest: 'grow',
    });
  });

  it('returns "Complete" only when all three checkpoints are reached', () => {
    setDiscoverConfirmed('Chef', true);
    setUnderstandConfirmed('Chef', true);
    markGrowActive('Chef');
    expect(journeyStageLabel('Chef')).toEqual({
      label: 'Complete',
      highest: 'grow',
    });
  });

  it('returns "Grow" (not "Complete") when only Grow is done', () => {
    // Guards against a false-positive "Complete" when only the Grow
    // flag happens to be set. Complete requires ALL three.
    markGrowActive('Chef');
    expect(journeyStageLabel('Chef')).toEqual({
      label: 'Grow',
      highest: 'grow',
    });
  });

  it('returns null for null/undefined career title', () => {
    expect(journeyStageLabel(null)).toBeNull();
    expect(journeyStageLabel(undefined)).toBeNull();
  });
});

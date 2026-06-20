import { describe, it, expect } from 'vitest';
import { buildBridgeMindmap } from '../build-bridge-mindmap';
import type { BridgeInput, TriedRoute } from '../bridge-mindmap-types';

const base: BridgeInput = {
  previousOccupation: 'Interior designer',
  targetCareer: 'Project Manager',
  withNav: true,
  triedRoutes: [],
  blocker: 'unknown-routes',
};

describe('buildBridgeMindmap — NAV gate', () => {
  it('includes workplace-nav branch only when withNav', () => {
    expect(buildBridgeMindmap(base).branches.some((b) => b.kind === 'workplace-nav')).toBe(true);
    expect(
      buildBridgeMindmap({ ...base, withNav: false }).branches.some((b) => b.kind === 'workplace-nav'),
    ).toBe(false);
  });

  it('nav leaves are factual with a nav.no pointer', () => {
    const nav = buildBridgeMindmap(base).branches.find((b) => b.kind === 'workplace-nav')!;
    expect(nav.leaves.length).toBeGreaterThan(0);
    expect(nav.leaves.every((l) => l.navFact)).toBe(true);
    expect(nav.leaves.some((l) => (l.detail ?? '').includes('nav.no'))).toBe(true);
  });
});

describe('buildBridgeMindmap — blocker ordering + emphasis', () => {
  it('no-callbacks floats workplace-nav first + emphasises it', () => {
    const m = buildBridgeMindmap({ ...base, blocker: 'no-callbacks' });
    expect(m.branches[0].kind).toBe('workplace-nav');
    expect(m.branches[0].emphasis).toBe(true);
  });

  it('no-experience floats proof first', () => {
    const m = buildBridgeMindmap({ ...base, blocker: 'no-experience' });
    expect(m.branches[0].kind).toBe('proof');
    expect(m.branches[0].emphasis).toBe(true);
  });

  it('unknown-routes emphasises nothing and leads with anchor', () => {
    const m = buildBridgeMindmap({ ...base, blocker: 'unknown-routes' });
    expect(m.branches[0].kind).toBe('anchor');
    expect(m.branches.every((b) => !b.emphasis)).toBe(true);
  });

  it('emphasis falls through when the target branch is gated out', () => {
    const m = buildBridgeMindmap({ ...base, withNav: false, blocker: 'no-callbacks' });
    expect(m.branches[0].kind).toBe('network');
    expect(m.branches[0].emphasis).toBe(true);
  });
});

describe('buildBridgeMindmap — tried dedup + edges', () => {
  it('moves tried routes into a single greyed tried branch', () => {
    const m = buildBridgeMindmap({ ...base, triedRoutes: ['course', 'applications'] });
    const tried = m.branches.find((b) => b.kind === 'tried')!;
    expect(tried.leaves).toHaveLength(2);
    expect(tried.leaves.every((l) => l.state === 'tried')).toBe(true);
    expect(tried.emphasis).toBe(false);

    const live = m.branches.filter((b) => b.kind !== 'tried').flatMap((b) => b.leaves);
    expect(
      live.some((l) => l.mapsToTriedRoute && ['course', 'applications'].includes(l.mapsToTriedRoute)),
    ).toBe(false);
  });

  it('keeps every live branch non-empty even when all routes are tried', () => {
    const all: TriedRoute[] = ['course', 'applications', 'cv', 'networking', 'placement', 'freelancing'];
    const m = buildBridgeMindmap({ ...base, triedRoutes: all });
    expect(m.branches.filter((b) => b.kind !== 'tried').every((b) => b.leaves.length > 0)).toBe(true);
  });

  it('renders with null previousOccupation (generic anchor)', () => {
    const m = buildBridgeMindmap({ ...base, previousOccupation: null });
    const anchor = m.branches.find((b) => b.kind === 'anchor')!;
    expect(anchor.leaves.length).toBeGreaterThan(0);
    expect(anchor.title).toMatch(/strengths you already have/i);
  });

  it('no tried branch when nothing tried', () => {
    expect(buildBridgeMindmap(base).branches.some((b) => b.kind === 'tried')).toBe(false);
  });

  it('centre carries target + previous occupation', () => {
    const m = buildBridgeMindmap(base);
    expect(m.center.targetCareer).toBe('Project Manager');
    expect(m.center.previousOccupation).toBe('Interior designer');
  });
});

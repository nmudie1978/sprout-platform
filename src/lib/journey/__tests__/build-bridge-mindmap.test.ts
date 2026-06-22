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

describe('buildBridgeMindmap — Structured ways in (trainee programmes)', () => {
  it('names matching trainee programmes as leaves for a finance career', () => {
    const finance = { ...base, targetCareer: 'Financial Analyst', targetCategory: 'FINANCE_BANKING' as const };
    const b = buildBridgeMindmap(finance).branches.find((x) => x.kind === 'programmes')!;
    expect(b.title).toMatch(/structured ways in/i);
    expect(b.leaves.some((l) => l.label.includes('DNB'))).toBe(true);
  });

  it('omits named programmes when the category has none, but keeps apprenticeships', () => {
    const health = { ...base, targetCareer: 'Nurse', targetCategory: 'HEALTHCARE_LIFE_SCIENCES' as const };
    const b = buildBridgeMindmap(health).branches.find((x) => x.kind === 'programmes')!;
    expect(b.leaves.some((l) => l.label.includes('DNB'))).toBe(false);
    expect(b.leaves.some((l) => /apprentice|lærling/i.test(l.label))).toBe(true);
  });

  it('no targetCategory → no named programmes, still has the generic leaves', () => {
    const b = buildBridgeMindmap(base).branches.find((x) => x.kind === 'programmes')!;
    expect(b.leaves.some((l) => /programme$/i.test(l.label))).toBe(false);
    expect(b.leaves.length).toBeGreaterThanOrEqual(4);
  });
});

describe('buildBridgeMindmap — workplace branch (NAV-aware)', () => {
  it('always includes the "get into a workplace" branch, with or without NAV', () => {
    expect(buildBridgeMindmap(base).branches.some((b) => b.kind === 'workplace-nav')).toBe(true);
    expect(
      buildBridgeMindmap({ ...base, withNav: false }).branches.some((b) => b.kind === 'workplace-nav'),
    ).toBe(true);
  });

  it('on NAV → leaves are factual with a nav.no pointer', () => {
    const nav = buildBridgeMindmap(base).branches.find((b) => b.kind === 'workplace-nav')!;
    expect(nav.leaves.length).toBeGreaterThan(0);
    expect(nav.leaves.every((l) => l.navFact)).toBe(true);
    expect(nav.leaves.some((l) => (l.detail ?? '').includes('nav.no'))).toBe(true);
  });

  it('off NAV → general placement leaves, no NAV facts and no nav.no pointer', () => {
    const wp = buildBridgeMindmap({ ...base, withNav: false }).branches.find((b) => b.kind === 'workplace-nav')!;
    expect(wp.leaves.length).toBeGreaterThan(0);
    expect(wp.leaves.every((l) => !l.navFact)).toBe(true);
    expect(wp.leaves.some((l) => (l.detail ?? '').includes('nav.no'))).toBe(false);
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

  it('no-callbacks still floats the workplace branch first off NAV (always present)', () => {
    const m = buildBridgeMindmap({ ...base, withNav: false, blocker: 'no-callbacks' });
    expect(m.branches[0].kind).toBe('workplace-nav');
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

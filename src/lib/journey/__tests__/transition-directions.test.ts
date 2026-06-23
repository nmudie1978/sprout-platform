import { describe, it, expect } from 'vitest';
import {
  getTransitionDirections,
  buildDirectionJourney,
  type DirectionContext,
} from '../transition-directions';
import { buildBridgeMindmap } from '../build-bridge-mindmap';
import type { BridgeInput } from '../bridge-mindmap-types';

const input: BridgeInput = {
  previousOccupation: 'Interior designer',
  targetCareer: 'Project Manager',
  targetCategory: 'BUSINESS_MANAGEMENT',
  withNav: false,
  triedRoutes: [],
  blocker: 'unknown-routes',
};

const ctx: DirectionContext = {
  targetCareer: 'Project Manager',
  startAge: 30,
  targetCategory: 'BUSINESS_MANAGEMENT',
  previousOccupation: 'Interior designer',
};

describe('getTransitionDirections', () => {
  it('derives directions from the mindmap branches (structured/proof/network/training)', () => {
    const dirs = getTransitionDirections(buildBridgeMindmap(input));
    const ids = dirs.map((d) => d.id);
    expect(ids).toEqual(expect.arrayContaining(['structured', 'proof', 'network', 'training']));
    // never offers anchor / workplace / tried as a "direction"
    expect(ids).not.toContain('anchor');
    expect(ids).not.toContain('tried');
  });

  it('reflects branch ordering (blocker-driven) — proof first for no-experience', () => {
    const dirs = getTransitionDirections(buildBridgeMindmap({ ...input, blocker: 'no-experience' }));
    expect(dirs[0].id).toBe('proof');
  });

  it('labels the programmes direction "Entry-level routes & programmes"', () => {
    const dirs = getTransitionDirections(buildBridgeMindmap(input));
    const structured = dirs.find((d) => d.id === 'structured');
    expect(structured?.label).toBe('Entry-level routes & programmes');
  });
});

describe('buildDirectionJourney', () => {
  it('each direction yields a distinct, non-empty, age-ascending sequence ending in a career step', () => {
    for (const id of ['structured', 'proof', 'network', 'training'] as const) {
      const items = buildDirectionJourney(id, ctx);
      expect(items.length).toBeGreaterThanOrEqual(3);
      // ages monotonic non-decreasing
      for (let i = 1; i < items.length; i++) {
        expect(items[i].startAge).toBeGreaterThanOrEqual(items[i - 1].startAge);
      }
      // starts at/after the user's current age
      expect(items[0].startAge).toBeGreaterThanOrEqual(ctx.startAge);
      // ends in a 'career' step (the established role)
      expect(items[items.length - 1].stage).toBe('career');
      // unique ids
      expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
    }
  });

  it('different directions produce different first steps', () => {
    const structured = buildDirectionJourney('structured', ctx)[0].title;
    const proof = buildDirectionJourney('proof', ctx)[0].title;
    const network = buildDirectionJourney('network', ctx)[0].title;
    expect(new Set([structured, proof, network]).size).toBe(3);
  });

  it('structured route names sector-matched trainee programmes when available', () => {
    const items = buildDirectionJourney('structured', { ...ctx, targetCategory: 'FINANCE_BANKING' });
    const text = items.map((i) => `${i.title} ${i.subtitle ?? ''}`).join(' ');
    expect(text).toMatch(/DNB|PwC|Deloitte/);
  });

  it('structured route degrades gracefully with no sector match (no named employers)', () => {
    const items = buildDirectionJourney('structured', { ...ctx, targetCategory: 'HEALTHCARE_LIFE_SCIENCES' });
    expect(items.length).toBeGreaterThanOrEqual(3);
    const text = items.map((i) => `${i.title} ${i.subtitle ?? ''}`).join(' ');
    expect(text).not.toMatch(/DNB|Equinor/);
  });

  it('is deterministic (same input → identical output)', () => {
    expect(buildDirectionJourney('proof', ctx)).toEqual(buildDirectionJourney('proof', ctx));
  });

  it('structured route attaches programme details (links) to the apply step', () => {
    const items = buildDirectionJourney('structured', { ...ctx, targetCategory: 'FINANCE_BANKING' });
    const withResources = items.find((i) => (i.suggestedResources?.length ?? 0) > 0);
    expect(withResources).toBeTruthy();
    const urls = withResources!.suggestedResources!.map((r) => r.url);
    // includes the three always-on portals
    expect(urls).toEqual(
      expect.arrayContaining([
        'https://utdanning.no',
        'https://www.finn.no/job',
        'https://careers.linkedin.com/pathways-programs',
      ]),
    );
    // and a description carrying the entry-level reality tip
    expect(withResources!.description ?? '').toMatch(/entry-level/i);
  });

  it('only the structured route carries resources (proof/network/training do not)', () => {
    for (const id of ['proof', 'network', 'training'] as const) {
      const items = buildDirectionJourney(id, ctx);
      expect(items.every((i) => !i.suggestedResources)).toBe(true);
    }
  });
});

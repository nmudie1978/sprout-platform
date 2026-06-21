import { describe, it, expect } from 'vitest';
import { layoutMindmap } from '../bridge-mindmap-layout';
import { buildBridgeMindmap } from '../../../lib/journey/build-bridge-mindmap';
import type { BridgeInput } from '../../../lib/journey/bridge-mindmap-types';

const input: BridgeInput = {
  previousOccupation: 'Interior designer',
  targetCareer: 'Project Manager',
  withNav: true,
  triedRoutes: ['course'],
  blocker: 'no-callbacks',
};

const model = buildBridgeMindmap(input);

describe('layoutMindmap', () => {
  it('is deterministic for the same input', () => {
    expect(layoutMindmap(model, { width: 920 })).toEqual(layoutMindmap(model, { width: 920 }));
  });

  it('keeps every box within [0,width] x [0,height]', () => {
    const L = layoutMindmap(model, { width: 920 });
    const boxes = [L.center, ...L.branches, ...L.branches.flatMap((b) => b.leaves)];
    for (const b of boxes) {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.x + b.w).toBeLessThanOrEqual(L.width + 0.001);
      expect(b.y + b.h).toBeLessThanOrEqual(L.height + 0.001);
    }
  });

  it('does not vertically overlap adjacent branch boxes', () => {
    const L = layoutMindmap(model, { width: 920 });
    const sorted = [...L.branches].sort((a, b) => a.y - b.y);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].y).toBeGreaterThanOrEqual(sorted[i - 1].y + sorted[i - 1].h);
    }
  });

  it('emits one edge per branch plus one per leaf', () => {
    const L = layoutMindmap(model, { width: 920 });
    const leafCount = L.branches.reduce((n, b) => n + b.leaves.length, 0);
    expect(L.edges).toHaveLength(L.branches.length + leafCount);
  });

  it('produces a positive height even with a single empty-ish branch', () => {
    const tiny = buildBridgeMindmap({ ...input, withNav: false, triedRoutes: [], blocker: 'unknown-routes' });
    const L = layoutMindmap(tiny, { width: 720 });
    expect(L.height).toBeGreaterThan(0);
  });
});

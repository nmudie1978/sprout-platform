import { describe, it, expect } from 'vitest';
import { ADJACENCY, resolveAnchorRoles } from '../bridge-domain-adjacency';

describe('resolveAnchorRoles — coverage', () => {
  it('every map entry resolves to >=2 roles with a "build on" title', () => {
    for (const entry of ADJACENCY) {
      const res = resolveAnchorRoles(entry.match[0]);
      expect(res.leaves.length, `entry ${entry.match[0]}`).toBeGreaterThanOrEqual(2);
      expect(res.title).toMatch(/^Build on your /);
      expect(res.leaves.every((l) => l.label.trim().length > 0)).toBe(true);
    }
  });

  it('unknown occupation falls back to generic strengths', () => {
    const res = resolveAnchorRoles('zorblax wrangler');
    expect(res.title).toMatch(/strengths you already have/i);
    expect(res.leaves.length).toBeGreaterThanOrEqual(2);
  });

  it('null occupation falls back to generic strengths', () => {
    const res = resolveAnchorRoles(null);
    expect(res.title).toMatch(/strengths you already have/i);
    expect(res.leaves.length).toBeGreaterThanOrEqual(2);
  });

  it('is case-insensitive and matches within a longer title', () => {
    const res = resolveAnchorRoles('Senior INTERIOR Designer (residential)');
    expect(res.title).toContain('Senior INTERIOR Designer');
    expect(res.leaves.some((l) => /fit-out|FF&E/i.test(l.label))).toBe(true);
  });
});

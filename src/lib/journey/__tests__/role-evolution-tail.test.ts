/**
 * deriveRoleEvolutionTail — the deterministic "how the role grows" coda the
 * Winding Road appends after the last journey milestone.
 *
 * Drives off existing bundled data (career-progressions + career-specialisms):
 *  - specialism fork    → "what type of X" (psychologist)
 *  - expert/lead fork   → two-track (software-developer)
 *  - flat-next fork      → several grows-into roles (it-support)
 *  - linear single      → one senior node from the level ladder (solicitor)
 *  - null               → career with no progression data (renders nothing)
 */

import { describe, expect, it } from 'vitest';
import { deriveRoleEvolutionTail } from '../role-evolution-tail';

const ENTRY_AGE = 23;

describe('deriveRoleEvolutionTail', () => {
  it('forks into specialisms when the career has them (psychologist)', () => {
    const tail = deriveRoleEvolutionTail('psychologist', ENTRY_AGE);
    expect(tail).not.toBeNull();
    expect(tail!.core.title).toBe('Psychologist');
    expect(tail!.forked).toBe(true);
    // capped at 3, all specialism-kind
    expect(tail!.branches).toHaveLength(3);
    expect(tail!.branches.every((b) => b.kind === 'specialism')).toBe(true);
    expect(tail!.branches.map((b) => b.title)).toContain('Clinical Psychologist');
  });

  it('forks into the expert/lead tracks when present (software-developer)', () => {
    const tail = deriveRoleEvolutionTail('software-developer', ENTRY_AGE);
    expect(tail).not.toBeNull();
    expect(tail!.forked).toBe(true);
    expect(tail!.branches).toHaveLength(2);
    expect(tail!.branches.every((b) => b.kind === 'track')).toBe(true);
    // representative role from each track
    expect(tail!.branches[0].title).toBe('Senior Developer');
    expect(tail!.branches[1].title).toBe('Tech Lead');
    expect(tail!.branches[0].trackLabel).toBeTruthy();
    expect(tail!.branches[1].trackLabel).toBeTruthy();
  });

  it('forks into the flat grows-into roles when there is no track fork (it-support)', () => {
    const tail = deriveRoleEvolutionTail('it-support', ENTRY_AGE);
    expect(tail).not.toBeNull();
    expect(tail!.forked).toBe(true);
    expect(tail!.branches.every((b) => b.kind === 'next')).toBe(true);
    expect(tail!.branches.map((b) => b.title)).toEqual(['IT Admin', 'Systems Admin', 'IT Manager']);
  });

  it('stays linear with a single senior node when nothing diverges (solicitor)', () => {
    const tail = deriveRoleEvolutionTail('solicitor', ENTRY_AGE);
    expect(tail).not.toBeNull();
    expect(tail!.forked).toBe(false);
    expect(tail!.branches).toHaveLength(1);
    expect(tail!.branches[0].kind).toBe('single');
    // core = the established (mid) role, senior = the top of the ladder
    expect(tail!.core.title).toBe('Associate Solicitor');
    expect(tail!.branches[0].title).toBe('Partner / Equity Partner');
  });

  it('returns null for a career with no progression data', () => {
    expect(deriveRoleEvolutionTail('totally-made-up-career-xyz', ENTRY_AGE)).toBeNull();
  });

  it('synthesizes ascending approximate ages: entry <= core < senior', () => {
    for (const id of ['psychologist', 'software-developer', 'it-support', 'solicitor']) {
      const tail = deriveRoleEvolutionTail(id, ENTRY_AGE)!;
      expect(tail.core.approxAge).toBeGreaterThanOrEqual(ENTRY_AGE);
      for (const b of tail.branches) {
        expect(b.approxAge).toBeGreaterThan(tail.core.approxAge);
      }
    }
  });
});

import { describe, it, expect } from 'vitest';
import { groupIntoColumns, columnAgeLabel, type ComputedStep } from '../shared-roadmap';
import type { JourneyItem } from '@/lib/journey/career-journey-types';

function step(id: string, startAge: number, endAge?: number, concurrentGroup?: string): ComputedStep {
  return {
    item: { id, stage: 'experience', title: id, startAge, endAge, isMilestone: false, concurrentGroup } as JourneyItem,
    index: 0,
    state: 'future',
    ageLabel: `Age ${startAge}`,
  };
}

describe('groupIntoColumns', () => {
  it('keeps ungrouped steps as one column each', () => {
    const cols = groupIntoColumns([step('a', 20), step('b', 21), step('c', 22)]);
    expect(cols).toHaveLength(3);
    expect(cols.every((c) => c.length === 1)).toBe(true);
  });

  it('collapses consecutive same-group steps into one column', () => {
    const cols = groupIntoColumns([
      step('a', 20),
      step('b', 21, 22, 'g1'),
      step('c', 21, 22, 'g1'),
      step('d', 23),
    ]);
    expect(cols.map((c) => c.length)).toEqual([1, 2, 1]);
    expect(cols[1].map((c) => c.item.id)).toEqual(['b', 'c']);
  });

  it('does not merge non-adjacent groups or different group keys', () => {
    const cols = groupIntoColumns([
      step('a', 20, 21, 'g1'),
      step('b', 22, 23, 'g2'),
      step('c', 24, 25, 'g1'),
    ]);
    expect(cols.map((c) => c.length)).toEqual([1, 1, 1]);
  });

  it('columnAgeLabel spans the whole group', () => {
    expect(columnAgeLabel([step('a', 20)])).toBe('Age 20');
    expect(columnAgeLabel([step('b', 21, 23, 'g1'), step('c', 21, 22, 'g1')])).toBe('Age 21–23');
  });
});

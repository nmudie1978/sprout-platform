import { describe, it, expect } from 'vitest';
import { groupConcurrentTransitionSteps, TRANSITION_PARALLEL_GROUP } from '../concurrent-transition-steps';
import type { JourneyItem } from '../career-journey-types';

const item = (over: Partial<JourneyItem>): JourneyItem =>
  ({ id: over.id ?? 'x', stage: 'experience', title: '', startAge: 20, isMilestone: false, ...over }) as JourneyItem;

describe('groupConcurrentTransitionSteps', () => {
  it('groups an adjacent "leverage skills" + "portfolio" pair with aligned ages', () => {
    const out = groupConcurrentTransitionSteps([
      item({ id: 'a', title: 'Begin leveraging transferable skills', startAge: 21, endAge: 22 }),
      item({ id: 'b', title: 'Build a small portfolio', startAge: 22, endAge: 23 }),
      item({ id: 'c', title: 'Land your first paid role', startAge: 23, stage: 'career' }),
    ]);
    expect(out[0].concurrentGroup).toBe(TRANSITION_PARALLEL_GROUP);
    expect(out[1].concurrentGroup).toBe(TRANSITION_PARALLEL_GROUP);
    // ages aligned across the pair → one stop, condensed
    expect(out[0].startAge).toBe(21);
    expect(out[0].endAge).toBe(23);
    expect(out[1].startAge).toBe(21);
    expect(out[1].endAge).toBe(23);
    expect(out[2].concurrentGroup).toBeUndefined();
  });

  it('order-independent (portfolio before skills also groups)', () => {
    const out = groupConcurrentTransitionSteps([
      item({ id: 'a', title: 'Build a portfolio of proof', startAge: 21 }),
      item({ id: 'b', title: 'Leverage your transferable skills', startAge: 22 }),
    ]);
    expect(out[0].concurrentGroup).toBe(TRANSITION_PARALLEL_GROUP);
    expect(out[1].concurrentGroup).toBe(TRANSITION_PARALLEL_GROUP);
  });

  it('leaves unrelated or non-adjacent steps untouched', () => {
    const before = [
      item({ id: 'a', title: 'Apply for entry-level roles', startAge: 21 }),
      item({ id: 'b', title: 'Accept your first role', startAge: 22, stage: 'career' }),
    ];
    expect(groupConcurrentTransitionSteps(before)).toEqual(before);
  });

  it('only groups experience steps, not education/career', () => {
    const before = [
      item({ id: 'a', title: 'Study transferable skills', startAge: 21, stage: 'education' }),
      item({ id: 'b', title: 'Build a portfolio', startAge: 22 }),
    ];
    expect(groupConcurrentTransitionSteps(before)).toEqual(before);
  });

  it('groups only the first matching pair', () => {
    const out = groupConcurrentTransitionSteps([
      item({ id: 'a', title: 'Leverage transferable skills', startAge: 21 }),
      item({ id: 'b', title: 'Build a portfolio', startAge: 22 }),
      item({ id: 'c', title: 'Leverage more skills', startAge: 23 }),
      item({ id: 'd', title: 'Build another portfolio', startAge: 24 }),
    ]);
    expect(out.filter((s) => s.concurrentGroup === TRANSITION_PARALLEL_GROUP)).toHaveLength(2);
    expect(out[2].concurrentGroup).toBeUndefined();
  });
});

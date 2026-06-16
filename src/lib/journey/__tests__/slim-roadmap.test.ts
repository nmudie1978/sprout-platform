/**
 * Rules: merge-apply-into-entry + slim-roadmap
 *
 * The roadmap is kept slim: "Apply for X" steps are merged into the
 * following "Begin/Accept X" step, and the whole roadmap is capped at
 * MAX_ROADMAP_STEPS, dropping the lowest-priority steps so the kept arc
 * still flows education → entry → core → growth.
 */

import { describe, expect, it } from 'vitest';
import { sanitizeJourney, MAX_ROADMAP_STEPS } from '../roadmap-rules';
import type { Journey, JourneyItem } from '../career-journey-types';

function makeJourney(items: Journey['items']): Journey {
  return { id: 'test', career: 'Software Engineer', startAge: 18, startYear: 2026, items };
}

const item = (over: Partial<JourneyItem> & Pick<JourneyItem, 'id' | 'stage' | 'title' | 'startAge'>): JourneyItem =>
  ({ isMilestone: false, ...over } as JourneyItem);

describe('merge-apply-into-entry', () => {
  it('merges "Apply for university" into "Begin university studies"', () => {
    const out = sanitizeJourney(
      makeJourney([
        item({ id: '1', stage: 'education', title: 'Apply for university studies', startAge: 18, isMilestone: true }),
        item({ id: '2', stage: 'education', title: 'Begin university studies', startAge: 18, endAge: 21 }),
      ]),
    );
    expect(out.items.some((i) => /apply\s+for\s+university/i.test(i.title))).toBe(false);
    expect(out.items.some((i) => /begin\s+university/i.test(i.title))).toBe(true);
    expect(out.items).toHaveLength(1);
  });

  it('merges "Apply for entry-level roles" into "Accept your first entry-level role"', () => {
    const out = sanitizeJourney(
      makeJourney([
        item({ id: '1', stage: 'experience', title: 'Apply for entry-level roles', startAge: 22, isMilestone: true }),
        item({ id: '2', stage: 'experience', title: 'Accept your first entry-level role', startAge: 22, endAge: 24 }),
      ]),
    );
    expect(out.items.some((i) => /^apply\b/i.test(i.title))).toBe(false);
    expect(out.items.some((i) => /accept\s+your\s+first/i.test(i.title))).toBe(true);
    expect(out.items).toHaveLength(1);
  });

  it('leaves a lone "Apply for X" (no following Begin/Accept) untouched', () => {
    const out = sanitizeJourney(
      makeJourney([
        item({ id: '1', stage: 'experience', title: 'Apply for entry-level roles', startAge: 22, isMilestone: true }),
      ]),
    );
    expect(out.items.some((i) => /^apply\b/i.test(i.title))).toBe(true);
  });
});

describe('slim-roadmap cap', () => {
  it('caps the roadmap at MAX_ROADMAP_STEPS', () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      item({ id: String(i), stage: 'experience', title: `Gain experience round ${i + 1}`, startAge: 22 + i }),
    );
    const out = sanitizeJourney(makeJourney(many));
    expect(out.items.length).toBeLessThanOrEqual(MAX_ROADMAP_STEPS);
  });

  it('keeps the high-value arc and drops low-priority steps first', () => {
    const out = sanitizeJourney(
      makeJourney([
        item({ id: '1', stage: 'education', title: 'Begin university studies', startAge: 18, endAge: 21 }),
        item({ id: '2', stage: 'education', title: 'Complete graduation', startAge: 21 }),
        item({ id: '3', stage: 'certification', title: 'Earn an extra certification', startAge: 22 }),
        item({ id: '4', stage: 'experience', title: 'Take an internship', startAge: 22 }),
        item({ id: '5', stage: 'experience', title: 'Accept your first entry-level role', startAge: 23, endAge: 25 }),
        item({ id: '6', stage: 'experience', title: 'Volunteer to build a portfolio', startAge: 24 }),
        item({ id: '7', stage: 'career', title: 'Grow into the core role', startAge: 26, endAge: 29 }),
        item({ id: '8', stage: 'career', title: 'Step up to a senior role', startAge: 30 }),
      ]),
    );
    expect(out.items.length).toBeLessThanOrEqual(MAX_ROADMAP_STEPS);
    const titles = out.items.map((i) => i.title.toLowerCase());
    // The education → entry → core → growth arc survives.
    expect(titles.some((t) => /begin university/.test(t))).toBe(true);
    expect(titles.some((t) => /graduation/.test(t))).toBe(true);
    expect(titles.some((t) => /entry-level/.test(t))).toBe(true);
    expect(titles.some((t) => /core role/.test(t))).toBe(true);
    expect(titles.some((t) => /senior/.test(t))).toBe(true);
    // Low-priority extras are dropped first (8 items → 6, so the two lowest go).
    expect(titles.some((t) => /portfolio/.test(t))).toBe(false);
    expect(titles.some((t) => /internship/.test(t))).toBe(false);
  });

  it('preserves chronological order after capping', () => {
    const out = sanitizeJourney(
      makeJourney([
        item({ id: '1', stage: 'education', title: 'Begin university studies', startAge: 18, endAge: 21 }),
        item({ id: '2', stage: 'certification', title: 'Earn a certification', startAge: 22 }),
        item({ id: '3', stage: 'experience', title: 'Accept your first entry-level role', startAge: 23, endAge: 25 }),
        item({ id: '4', stage: 'career', title: 'Grow into the core role', startAge: 26, endAge: 29 }),
        item({ id: '5', stage: 'career', title: 'Step up to a senior role', startAge: 30 }),
        item({ id: '6', stage: 'experience', title: 'Take an internship', startAge: 22 }),
        item({ id: '7', stage: 'experience', title: 'Volunteer somewhere', startAge: 24 }),
      ]),
    );
    const ages = out.items.map((i) => i.startAge);
    const sorted = [...ages].sort((a, b) => a - b);
    expect(ages).toEqual(sorted);
  });
});

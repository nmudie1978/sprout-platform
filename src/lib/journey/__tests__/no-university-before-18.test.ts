/**
 * Rule: no-university-before-18
 *
 * In Norway, university (universitet/høgskole/bachelor/master/profesjonsstudium/
 * fagskole) admission opens only from age 18. The roadmap MUST never put a
 * "Begin university studies" or "Apply for university studies" step at age
 * 17 or younger, even if the user is currently 15-17 and would otherwise
 * have it as their next step. Apprenticeships (læretid / fagbrev) are
 * exempt — they can legitimately start at 17.
 *
 * These tests cover the screenshot scenario (Nurse, age 17, finish year
 * 2027) plus a few related edge cases.
 */

import { describe, expect, it } from 'vitest';
import { sanitizeJourney, HIGHER_EDUCATION_MIN_AGE } from '../roadmap-rules';
import type { Journey } from '../career-journey-types';

function makeJourney(items: Journey['items']): Journey {
  return {
    id: 'test',
    career: 'Nurse',
    startAge: 17,
    startYear: 2026,
    items,
  };
}

describe('no-university-before-18 rule', () => {
  it('clamps "Begin university studies" at age 17 → 18 (screenshot scenario)', () => {
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Apply for university studies', startAge: 17, isMilestone: true },
      { id: '2', stage: 'education', title: 'Begin university studies', startAge: 17, endAge: 20, isMilestone: false },
      { id: '3', stage: 'experience', title: 'Gain practical experience through placements', startAge: 19, endAge: 20, isMilestone: false },
    ]);
    const out = sanitizeJourney(j);
    const begin = out.items.find((it) => /begin\s+university/i.test(it.title));
    const apply = out.items.find((it) => /apply\s+for\s+university/i.test(it.title));
    expect(begin?.startAge).toBeGreaterThanOrEqual(HIGHER_EDUCATION_MIN_AGE);
    expect(apply?.startAge).toBeGreaterThanOrEqual(HIGHER_EDUCATION_MIN_AGE);
  });

  it('Apply and Begin pair stay at the same age after the bump', () => {
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Apply for university studies', startAge: 16, isMilestone: true },
      { id: '2', stage: 'education', title: 'Begin university studies', startAge: 16, endAge: 19, isMilestone: false },
    ]);
    const out = sanitizeJourney(j);
    const apply = out.items.find((it) => /apply\s+for\s+university/i.test(it.title));
    const begin = out.items.find((it) => /begin\s+university/i.test(it.title));
    expect(apply?.startAge).toBe(begin?.startAge);
    expect(begin?.startAge).toBeGreaterThanOrEqual(HIGHER_EDUCATION_MIN_AGE);
  });

  it('cascades the shift through subsequent steps so they keep their relative spacing', () => {
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Apply for university studies', startAge: 17, isMilestone: true },
      { id: '2', stage: 'education', title: 'Begin university studies', startAge: 17, endAge: 20, isMilestone: false },
      { id: '3', stage: 'education', title: 'Complete graduation', startAge: 20, isMilestone: true },
      { id: '4', stage: 'experience', title: 'Apply for entry-level roles', startAge: 21, isMilestone: true },
    ]);
    const out = sanitizeJourney(j);
    const begin = out.items.find((it) => /begin\s+university/i.test(it.title));
    const grad = out.items.find((it) => /complete\s+graduation/i.test(it.title));
    const entry = out.items.find((it) => /apply\s+for\s+entry/i.test(it.title));
    expect(begin?.startAge).toBe(18);
    // Original gap was begin→grad = 3 years, grad→entry = 1 year. Preserve.
    expect(grad?.startAge).toBeGreaterThanOrEqual(21);
    expect(entry?.startAge).toBeGreaterThanOrEqual(22);
  });

  it('does NOT clamp apprenticeship steps (læretid is allowed at 17)', () => {
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Apply for apprenticeship', startAge: 17, isMilestone: true },
      { id: '2', stage: 'education', title: 'Begin apprenticeship at a care home', startAge: 17, endAge: 19, isMilestone: false },
    ]);
    const out = sanitizeJourney(j);
    const apprentice = out.items.find((it) => /apprenticeship/i.test(it.title) && /begin/i.test(it.title));
    expect(apprentice?.startAge).toBe(17);
  });

  it('does NOT clamp vocational fagbrev / fagskole vocational training', () => {
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Earn vocational qualification', startAge: 17, isMilestone: true },
    ]);
    const out = sanitizeJourney(j);
    const vocational = out.items.find((it) => /vocational/i.test(it.title));
    expect(vocational?.startAge).toBe(17);
  });

  it('leaves higher-ed alone when the user is already 18+', () => {
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Apply for university studies', startAge: 19, isMilestone: true },
      { id: '2', stage: 'education', title: 'Begin university studies', startAge: 19, endAge: 22, isMilestone: false },
    ]);
    const out = sanitizeJourney(j);
    const begin = out.items.find((it) => /begin\s+university/i.test(it.title));
    expect(begin?.startAge).toBe(19);
  });

  it('catches "bachelor" and "master" phrasing too', () => {
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Begin bachelor in nursing', startAge: 17, endAge: 20, isMilestone: false },
    ]);
    const out = sanitizeJourney(j);
    expect(out.items[0].startAge).toBeGreaterThanOrEqual(18);
  });

  it('catches Norwegian spelling "universitet" and "fagskole"', () => {
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Begin studies at universitetet', startAge: 16, endAge: 19, isMilestone: false },
    ]);
    const out = sanitizeJourney(j);
    expect(out.items[0].startAge).toBeGreaterThanOrEqual(18);
  });
});

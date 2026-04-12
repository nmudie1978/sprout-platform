/**
 * Rule: anchored-to-user-age (finish-year anchor)
 *
 * The Foundation card holds the user's expected finish year for their
 * current education stage (e.g. "I finish videregående in 2034"). The
 * roadmap MUST anchor the first post-foundation step to that year — the
 * user's current age + (finishYear - currentYear) — and cascade the
 * resulting shift through every subsequent step.
 *
 * Without this, AI-generated timelines that ignore the prompt's
 * anchoring instruction would render at the user's current age. The
 * client sanitiser is the authoritative enforcement point.
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

const CTX_2034 = {
  currentAge: 17,
  currentYear: 2026,
  expectedFinishYear: '2034',
};

const CTX_2027 = {
  currentAge: 17,
  currentYear: 2026,
  expectedFinishYear: '2027',
};

describe('finish-year anchor', () => {
  it('shifts the first post-foundation step to the user-age-at-finish (2034 case)', () => {
    // User is 17 now in 2026, finishes school in 2034 → ageAtFinish = 25.
    // AI emitted "Begin university studies" at age 17 (ignored prompt).
    // Sanitiser must shift it to 25 and cascade everything after.
    //
    // Test data uses clean 1-year gaps so the strict non-overlap rule
    // (rule: no-overlapping-steps) doesn't add its own +1 corrections
    // on top of our shift. The shift itself is what we're testing.
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Apply for university studies', startAge: 17, isMilestone: true },
      { id: '2', stage: 'education', title: 'Begin university studies', startAge: 17, endAge: 19, isMilestone: false },
      { id: '3', stage: 'education', title: 'Complete graduation', startAge: 20, isMilestone: true },
      { id: '4', stage: 'experience', title: 'Apply for entry-level roles', startAge: 21, isMilestone: true },
      { id: '5', stage: 'experience', title: 'Accept your first entry-level role', startAge: 21, endAge: 23, isMilestone: false },
    ]);
    const out = sanitizeJourney(j, CTX_2034);

    const apply = out.items.find((it) => /apply\s+for\s+university/i.test(it.title));
    const begin = out.items.find((it) => /begin\s+university/i.test(it.title));
    const grad = out.items.find((it) => /complete\s+graduation/i.test(it.title));
    const entryApply = out.items.find((it) => /apply\s+for\s+entry/i.test(it.title));
    const entryAccept = out.items.find((it) => /accept\s+your\s+first/i.test(it.title));

    // Begin uni anchored to age 25 (2034 - 2026 + 17)
    expect(begin?.startAge).toBe(25);
    // Apply pair locked to begin
    expect(apply?.startAge).toBe(25);
    // Cascading: grad was 3 yrs after apply (17 → 20) → still 3 yrs after (25 → 28)
    expect(grad?.startAge).toBe(28);
    // entry apply was 1 year after grad → still 1 year after
    expect(entryApply?.startAge).toBe(29);
    // entry accept locked to entryApply pair
    expect(entryAccept?.startAge).toBe(29);
  });

  it('shifts to age 18 when finish year is 2027 (one year ahead)', () => {
    // User is 17 in 2026, finishes school in 2027 → ageAtFinish = 18.
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Apply for university studies', startAge: 17, isMilestone: true },
      { id: '2', stage: 'education', title: 'Begin university studies', startAge: 17, endAge: 20, isMilestone: false },
    ]);
    const out = sanitizeJourney(j, CTX_2027);
    const begin = out.items.find((it) => /begin\s+university/i.test(it.title));
    expect(begin?.startAge).toBe(18);
  });

  it('finish-year anchor and higher-ed clamp interact correctly (finish=2026 → 17, clamped to 18)', () => {
    // User is 17 in 2026, says they finish in 2026 (this year). ageAtFinish=17,
    // but higher-ed minimum bumps it to 18.
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Apply for university studies', startAge: 17, isMilestone: true },
      { id: '2', stage: 'education', title: 'Begin university studies', startAge: 17, endAge: 20, isMilestone: false },
    ]);
    const out = sanitizeJourney(j, { currentAge: 17, currentYear: 2026, expectedFinishYear: '2026' });
    const begin = out.items.find((it) => /begin\s+university/i.test(it.title));
    expect(begin?.startAge).toBeGreaterThanOrEqual(HIGHER_EDUCATION_MIN_AGE);
  });

  it('does nothing if no context is provided (backwards compatible)', () => {
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Apply for university studies', startAge: 19, isMilestone: true },
      { id: '2', stage: 'education', title: 'Begin university studies', startAge: 19, endAge: 22, isMilestone: false },
    ]);
    const out = sanitizeJourney(j);
    const begin = out.items.find((it) => /begin\s+university/i.test(it.title));
    expect(begin?.startAge).toBe(19);
  });

  it('does nothing when expectedFinishYear is null/empty', () => {
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Apply for university studies', startAge: 19, isMilestone: true },
      { id: '2', stage: 'education', title: 'Begin university studies', startAge: 19, endAge: 22, isMilestone: false },
    ]);
    const out = sanitizeJourney(j, { currentAge: 17, currentYear: 2026, expectedFinishYear: null });
    const begin = out.items.find((it) => /begin\s+university/i.test(it.title));
    expect(begin?.startAge).toBe(19);
  });

  it('parses "June 2034", "Spring 2034", and "2034-06" finish strings', () => {
    const baseItems: Journey['items'] = [
      { id: '1', stage: 'education', title: 'Apply for university studies', startAge: 17, isMilestone: true },
      { id: '2', stage: 'education', title: 'Begin university studies', startAge: 17, endAge: 20, isMilestone: false },
    ];

    for (const finish of ['June 2034', 'Spring 2034', '2034-06', '2034']) {
      const out = sanitizeJourney(makeJourney(baseItems), {
        currentAge: 17,
        currentYear: 2026,
        expectedFinishYear: finish,
      });
      const begin = out.items.find((it) => /begin\s+university/i.test(it.title));
      expect(begin?.startAge, `for finish "${finish}"`).toBe(25);
    }
  });

  it('shifts apprenticeship steps too (anchor applies to all post-foundation items)', () => {
    // The finish-year anchor is general — it applies to whatever the
    // first post-foundation step is, including apprenticeships. (The
    // higher-ed clamp is the OPT-OUT for university only.)
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Apply for apprenticeship', startAge: 17, isMilestone: true },
      { id: '2', stage: 'education', title: 'Begin apprenticeship at a care home', startAge: 17, endAge: 19, isMilestone: false },
    ]);
    const out = sanitizeJourney(j, CTX_2034);
    const begin = out.items.find((it) => /begin\s+apprenticeship/i.test(it.title));
    expect(begin?.startAge).toBe(25);
  });

  it('leaves earlier foundation-stage items alone (only post-foundation shifts)', () => {
    // If for some reason a foundation-stage item leaks into items[],
    // it should keep its original age. Only the first non-foundation
    // step and what follows should shift.
    const j = makeJourney([
      { id: '0', stage: 'foundation', title: 'Choose subjects', startAge: 16, endAge: 18, isMilestone: false },
      { id: '1', stage: 'education', title: 'Apply for university studies', startAge: 17, isMilestone: true },
      { id: '2', stage: 'education', title: 'Begin university studies', startAge: 17, endAge: 20, isMilestone: false },
    ]);
    const out = sanitizeJourney(j, CTX_2034);
    const foundation = out.items.find((it) => /choose\s+subjects/i.test(it.title));
    const begin = out.items.find((it) => /begin\s+university/i.test(it.title));
    expect(foundation?.startAge).toBe(16);
    expect(begin?.startAge).toBe(25);
  });

  it('ignores broken inputs — past finish year', () => {
    // User says they finished in 2020 but they're 17 now in 2026. That's
    // ageAtFinish = 11 — nonsense. Sanitiser should bail and not shift.
    const j = makeJourney([
      { id: '1', stage: 'education', title: 'Apply for university studies', startAge: 17, isMilestone: true },
      { id: '2', stage: 'education', title: 'Begin university studies', startAge: 17, endAge: 20, isMilestone: false },
    ]);
    const out = sanitizeJourney(j, { currentAge: 17, currentYear: 2026, expectedFinishYear: '2020' });
    const begin = out.items.find((it) => /begin\s+university/i.test(it.title));
    // No shift triggered, but higher-ed clamp still applies
    expect(begin?.startAge).toBeGreaterThanOrEqual(HIGHER_EDUCATION_MIN_AGE);
  });
});

import { describe, it, expect } from 'vitest';
import { getFundingForCareer, getAllFundingSources } from '../funding';

describe('getFundingForCareer — country-aware', () => {
  it('Norway → Lånekassen (and not CSN/SU)', () => {
    const u = getFundingForCareer(null, 'NO').universal;
    expect(u.length).toBeGreaterThan(0);
    expect(u.every((f) => f.country === 'NO')).toBe(true);
    expect(u.some((f) => /lånekassen/i.test(f.name))).toBe(true);
    expect(u.some((f) => /csn|statens uddannelse/i.test(f.name))).toBe(false);
  });

  it('Sweden → CSN only', () => {
    const u = getFundingForCareer(null, 'SE').universal;
    expect(u.length).toBeGreaterThan(0);
    expect(u.every((f) => f.country === 'SE')).toBe(true);
    expect(u.some((f) => /csn/i.test(f.name))).toBe(true);
    expect(u.some((f) => /lånekassen/i.test(f.name))).toBe(false);
  });

  it('Denmark → SU, Finland → Kela, Iceland → Menntasjóður', () => {
    expect(getFundingForCareer(null, 'DK').universal.some((f) => /\bSU\b/.test(f.name))).toBe(true);
    expect(getFundingForCareer(null, 'FI').universal.some((f) => /kela/i.test(f.name))).toBe(true);
    expect(getFundingForCareer(null, 'IS').universal.some((f) => /menntasjóður/i.test(f.name))).toBe(true);
    for (const c of ['DK', 'FI', 'IS']) {
      expect(getFundingForCareer(null, c).universal.every((f) => f.country === c)).toBe(true);
    }
  });

  it('country without funding data (Spain) → no universal funding', () => {
    expect(getFundingForCareer(null, 'ES').universal).toEqual([]);
  });

  it('career-specific scholarships are country-filtered too', () => {
    // engineer has a NO Equinor scholarship; a Swedish engineer should not see it
    const noEng = getFundingForCareer('engineer', 'NO').careerSpecific;
    expect(noEng.length).toBeGreaterThan(0);
    expect(noEng.every((f) => f.country === 'NO')).toBe(true);
    expect(getFundingForCareer('engineer', 'SE').careerSpecific.every((f) => f.country === 'SE')).toBe(true);
  });

  it('defaults to Norway when no country is given (backwards compatible)', () => {
    expect(getFundingForCareer(null).universal.every((f) => f.country === 'NO')).toBe(true);
  });
});

describe('funding data integrity', () => {
  it('every source has the required fields, a 2-letter country, and an https url', () => {
    for (const f of getAllFundingSources()) {
      expect(f.id, f.name).toBeTruthy();
      expect(f.name).toBeTruthy();
      expect(f.description).toBeTruthy();
      expect(f.amount).toBeTruthy();
      expect(f.country).toMatch(/^[A-Z]{2}$/);
      expect(f.url, f.name).toMatch(/^https:\/\//);
    }
  });

  it('covers all five Nordic countries', () => {
    const countries = new Set(getAllFundingSources().map((f) => f.country));
    for (const c of ['NO', 'SE', 'DK', 'FI', 'IS']) expect(countries.has(c)).toBe(true);
  });
});

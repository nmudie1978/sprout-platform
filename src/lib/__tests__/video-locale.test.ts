import { describe, it, expect } from 'vitest';
import {
  videoSearchLocale,
  buildDayInLifeQuery,
  buildEnglishDayInLifeQuery,
} from '@/lib/video-locale';

describe('videoSearchLocale', () => {
  it('maps Spain to Spanish (es / ES / Spanish phrase)', () => {
    expect(videoSearchLocale('Spain')).toEqual({
      lang: 'es',
      region: 'ES',
      phrase: 'un día en la vida de',
    });
  });

  it('falls back to English for unlocalised countries (Spain-only pilot — Norway stays English)', () => {
    const english = { lang: 'en', region: undefined, phrase: 'day in the life' };
    expect(videoSearchLocale('Norway')).toEqual(english);
    expect(videoSearchLocale('Germany')).toEqual(english);
    expect(videoSearchLocale(null)).toEqual(english);
    expect(videoSearchLocale(undefined)).toEqual(english);
    expect(videoSearchLocale('')).toEqual(english);
  });
});

describe('buildDayInLifeQuery', () => {
  it('builds a Spanish query for Spain', () => {
    expect(buildDayInLifeQuery('Doctor', 'Spain')).toBe('un día en la vida de Doctor');
  });

  it('builds an English query for unlocalised/missing countries (incl. Norway in this pilot)', () => {
    expect(buildDayInLifeQuery('Doctor', 'Norway')).toBe('day in the life Doctor');
    expect(buildDayInLifeQuery('Doctor', null)).toBe('day in the life Doctor');
    expect(buildDayInLifeQuery('Doctor', 'Germany')).toBe('day in the life Doctor');
  });
});

describe('buildEnglishDayInLifeQuery', () => {
  it('is always English regardless of country', () => {
    expect(buildEnglishDayInLifeQuery('Nurse')).toBe('day in the life Nurse');
  });
});

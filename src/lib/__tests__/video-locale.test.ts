import { describe, it, expect } from 'vitest';
import {
  videoSearchLocale,
  buildDayInLifeQuery,
  buildEnglishDayInLifeQuery,
  buildEnglishExplainerQuery,
  normaliseCareerSpelling,
  broadenCareer,
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

describe('normaliseCareerSpelling', () => {
  it('maps British "programme" to American "program"', () => {
    expect(normaliseCareerSpelling('IT Programme Manager')).toBe('IT Program Manager');
    expect(normaliseCareerSpelling('programme manager')).toBe('program manager');
  });
  it('leaves other words alone', () => {
    expect(normaliseCareerSpelling('Nurse')).toBe('Nurse');
  });
});

describe('buildEnglishExplainerQuery', () => {
  it('builds a "what does a X do" query and normalises spelling', () => {
    expect(buildEnglishExplainerQuery('Program Manager')).toBe('what does a Program Manager do');
    expect(buildEnglishExplainerQuery('IT Programme Manager')).toBe('what does a IT Program Manager do');
  });
});

describe('broadenCareer', () => {
  it('strips a leading qualifier from a 3+ word title and normalises spelling', () => {
    expect(broadenCareer('IT Programme Manager')).toBe('Program Manager');
    expect(broadenCareer('Senior Software Developer')).toBe('Software Developer');
  });
  it('returns a spelling-normalised variant when only spelling differs', () => {
    expect(broadenCareer('Programme Manager')).toBe('Program Manager');
  });
  it('returns null when there is nothing to broaden', () => {
    expect(broadenCareer('Nurse')).toBeNull();
    expect(broadenCareer('Software Developer')).toBeNull();
  });
});

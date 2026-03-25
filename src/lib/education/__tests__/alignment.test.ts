import { describe, it, expect } from 'vitest';
import { getCareerSubjectMapping, calculateSubjectAlignment } from '../alignment';

describe('getCareerSubjectMapping', () => {
  it('returns a mapping for known careers (doctor)', () => {
    const result = getCareerSubjectMapping('doctor');
    expect(result).not.toBeNull();
    expect(result!.career).toBe('doctor');
    expect(result!.keySubjects).toContain('Biology');
    expect(result!.keySubjects).toContain('Chemistry');
    expect(result!.keySubjects).toContain('Mathematics');
    expect(result!.supportingSubjects).toBeDefined();
    expect(result!.focusAreas).toBeDefined();
    expect(result!.nextDecisions).toBeDefined();
    expect(result!.whySubjectsMatter).toBeTruthy();
  });

  it('returns a mapping for known careers (nurse)', () => {
    const result = getCareerSubjectMapping('nurse');
    expect(result).not.toBeNull();
    expect(result!.career).toBe('nurse');
    expect(result!.keySubjects).toContain('Biology');
  });

  it('returns a mapping for known careers (software developer)', () => {
    const result = getCareerSubjectMapping('software developer');
    expect(result).not.toBeNull();
    expect(result!.career).toBe('software developer');
    expect(result!.keySubjects).toContain('Mathematics');
    expect(result!.keySubjects).toContain('Computer Science');
  });

  it('returns a generic fallback mapping for completely unknown careers', () => {
    const result = getCareerSubjectMapping('zookeeper');
    // The function generates a generic mapping rather than returning null
    expect(result).not.toBeNull();
    expect(result!.keySubjects).toBeDefined();
    expect(result!.keySubjects.length).toBeGreaterThan(0);
  });

  it('matches case-insensitively', () => {
    const upper = getCareerSubjectMapping('DOCTOR');
    const mixed = getCareerSubjectMapping('Doctor');
    const lower = getCareerSubjectMapping('doctor');

    expect(upper).not.toBeNull();
    expect(mixed).not.toBeNull();
    expect(lower).not.toBeNull();
    expect(upper!.career).toBe('doctor');
    expect(mixed!.career).toBe('doctor');
    expect(lower!.career).toBe('doctor');
  });

  it('performs partial/fuzzy matching (e.g. "Software Engineer" matches engineer via partial keyword)', () => {
    const result = getCareerSubjectMapping('Software Engineer');
    expect(result).not.toBeNull();
    // "softwareengineer" contains "engineer", so it matches the engineer career first
    expect(result!.career).toBe('engineer');
    expect(result!.keySubjects).toContain('Mathematics');
    expect(result!.keySubjects).toContain('Physics');
  });

  it('performs partial/fuzzy matching (e.g. "Become a Doctor" matches doctor)', () => {
    const result = getCareerSubjectMapping('Become a Doctor');
    expect(result).not.toBeNull();
    expect(result!.career).toBe('doctor');
    expect(result!.keySubjects).toContain('Biology');
  });

  it('matches via aliases (e.g. "security analyst" matches cybersecurity)', () => {
    const result = getCareerSubjectMapping('security analyst');
    expect(result).not.toBeNull();
    expect(result!.career).toBe('cybersecurity');
  });

  it('matches via aliases (e.g. "pastry" matches chef)', () => {
    const result = getCareerSubjectMapping('pastry');
    expect(result).not.toBeNull();
    expect(result!.career).toBe('chef');
  });
});

describe('calculateSubjectAlignment', () => {
  it('returns strong alignment when all key subjects match', () => {
    // Doctor requires Biology, Chemistry, Mathematics
    const result = calculateSubjectAlignment(
      ['Biology', 'Chemistry', 'Mathematics'],
      'doctor',
    );
    expect(result.alignment).toBe('strong');
    expect(result.matchedKey).toHaveLength(3);
    expect(result.missingKey).toHaveLength(0);
  });

  it('returns strong alignment when 2 of 3 key subjects match (ratio >= 0.66)', () => {
    const result = calculateSubjectAlignment(
      ['Biology', 'Chemistry'],
      'doctor',
    );
    expect(result.alignment).toBe('strong');
    expect(result.matchedKey).toHaveLength(2);
    expect(result.missingKey).toContain('Mathematics');
  });

  it('returns partial alignment when 1 of 3 key subjects match (ratio >= 0.33)', () => {
    const result = calculateSubjectAlignment(
      ['Biology', 'English', 'Art'],
      'doctor',
    );
    expect(result.alignment).toBe('partial');
    expect(result.matchedKey).toHaveLength(1);
    expect(result.matchedKey).toContain('Biology');
  });

  it('returns missing alignment when no key subjects match', () => {
    const result = calculateSubjectAlignment(
      ['History', 'Art', 'Drama'],
      'doctor',
    );
    expect(result.alignment).toBe('missing');
    expect(result.matchedKey).toHaveLength(0);
    expect(result.missingKey).toHaveLength(3);
  });

  it('performs fuzzy subject matching (Math matches Mathematics via substring)', () => {
    // normalise('Math') = 'math', normalise('Mathematics') = 'mathematics'
    // 'mathematics'.includes('math') = true, so this matches
    const result = calculateSubjectAlignment(
      ['Math', 'Chemistry', 'Biology'],
      'doctor',
    );
    expect(result.alignment).toBe('strong');
    expect(result.matchedKey).toContain('Mathematics');
  });

  it('does not fuzzy-match "Maths" to "Mathematics" (not a substring)', () => {
    // normalise('Maths') = 'maths', normalise('Mathematics') = 'mathematics'
    // 'mathematics'.includes('maths') = false — "maths" is not a substring
    const result = calculateSubjectAlignment(
      ['Maths', 'Chemistry', 'Biology'],
      'doctor',
    );
    // Only 2 of 3 key subjects match (Chemistry, Biology), so still strong (>= 0.66)
    expect(result.alignment).toBe('strong');
    expect(result.matchedKey).not.toContain('Mathematics');
    expect(result.matchedKey).toContain('Biology');
    expect(result.matchedKey).toContain('Chemistry');
  });

  it('performs fuzzy subject matching (Bio matches Biology)', () => {
    const result = calculateSubjectAlignment(
      ['Bio', 'Chemistry', 'Mathematics'],
      'doctor',
    );
    expect(result.alignment).toBe('strong');
    expect(result.matchedKey).toContain('Biology');
  });

  it('returns unknown alignment for empty subjects list', () => {
    const result = calculateSubjectAlignment([], 'doctor');
    expect(result.alignment).toBe('unknown');
    expect(result.matchedKey).toHaveLength(0);
    expect(result.missingKey).toHaveLength(3);
  });

  it('handles unknown career gracefully with a generic mapping', () => {
    // getCareerSubjectMapping always returns a mapping (never null due to generic fallback),
    // so calculateSubjectAlignment should still produce a valid result
    const result = calculateSubjectAlignment(
      ['English', 'Mathematics'],
      'underwater basket weaver',
    );
    // The generic fallback includes English and Mathematics as key subjects
    expect(result.alignment).toBeDefined();
    expect(['strong', 'partial', 'missing', 'unknown']).toContain(result.alignment);
    expect(result.matchedKey).toBeDefined();
    expect(result.missingKey).toBeDefined();
  });
});

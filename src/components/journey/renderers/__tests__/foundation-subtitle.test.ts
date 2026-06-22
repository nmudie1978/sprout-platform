import { describe, it, expect } from 'vitest';
import { buildFoundationSubtitle } from '../foundation-banner';
import type { EducationContext } from '@/lib/education/types';

const ctx = (over: Partial<EducationContext>): EducationContext =>
  ({ stage: 'between', ...over }) as EducationContext;

describe('buildFoundationSubtitle', () => {
  it('no context → prompt to add details', () => {
    expect(buildFoundationSubtitle(null)).toBe('Tap to add details');
    expect(buildFoundationSubtitle(undefined)).toBe('Tap to add details');
  });

  it('between + previousOccupation + target → "was X → transitioning to Y"', () => {
    expect(
      buildFoundationSubtitle(ctx({ previousOccupation: 'Medical Specialist' }), 'Psychologist'),
    ).toBe('Not working · was Medical Specialist → transitioning to Psychologist');
  });

  it('between + previousOccupation, no target → no transition suffix', () => {
    expect(
      buildFoundationSubtitle(ctx({ previousOccupation: 'Medical Specialist' })),
    ).toBe('Not working · was Medical Specialist');
  });

  it('between, no previousOccupation, with target → still names the target', () => {
    expect(buildFoundationSubtitle(ctx({}), 'Psychologist')).toBe(
      'Not working right now → transitioning to Psychologist',
    );
  });

  it('between, nothing → plain "Not working right now"', () => {
    expect(buildFoundationSubtitle(ctx({}))).toBe('Not working right now');
  });

  it('other (in work) → role label, no transition suffix (target unused here)', () => {
    expect(
      buildFoundationSubtitle(ctx({ stage: 'other', currentRole: 'Nurse' }), 'Doctor'),
    ).toBe('In work · Nurse');
  });

  it('school/university stages are unaffected by careerTitle', () => {
    expect(buildFoundationSubtitle(ctx({ stage: 'school' }), 'Psychologist')).not.toContain(
      'transitioning',
    );
  });
});

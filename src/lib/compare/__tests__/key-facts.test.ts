import { describe, it, expect } from 'vitest';
import type { Career } from '@/lib/career-pathways';
import { getKeyFacts, formatSalaryRange } from '@/lib/compare/key-facts';

const base = (over: Partial<Career> = {}): Career => ({
  id: 'test-role',
  title: 'Test Role',
  emoji: '🧪',
  description: 'A test career.',
  avgSalary: '500,000 - 800,000 kr/year',
  educationPath: "Bachelor's degree (3 years)",
  keySkills: ['a'],
  dailyTasks: ['b'],
  growthOutlook: 'medium',
  ...over,
});

describe('formatSalaryRange', () => {
  it('compacts a NOK range', () => {
    expect(formatSalaryRange('850,000 - 1,500,000 kr/year')).toBe('850k–1.5M kr/yr');
    expect(formatSalaryRange('420,000 - 600,000 kr/year')).toBe('420k–600k kr/yr');
  });
  it('handles a single figure', () => {
    expect(formatSalaryRange('2,000,000 kr/year')).toBe('2M kr/yr');
  });
  it('falls back gracefully when unparseable', () => {
    expect(formatSalaryRange('Varies')).toBe('Varies');
  });
});

describe('getKeyFacts', () => {
  it('derives salary, qualify (years + route) and a work–life label', () => {
    const f = getKeyFacts(base({ avgSalary: '900,000 - 1,500,000 kr/year', educationPath: "Bachelor's (3 years)" }));
    expect(f.salary).toBe('900k–1.5M kr/yr');
    expect(f.qualify).toMatch(/3 yrs · University/);
    expect(f.workLifeScore).toBeGreaterThanOrEqual(0);
    expect(f.workLifeScore).toBeLessThanOrEqual(10);
    expect(['Predictable hours', 'Manageable', 'Demanding']).toContain(f.workLifeLabel);
  });

  it('labels a vocational, no-year path as the route only', () => {
    const f = getKeyFacts(base({ educationPath: 'Fagbrev (vocational) + apprenticeship', avgSalary: '420,000 - 600,000 kr/year' }));
    expect(f.qualify).toMatch(/Vocational/);
    expect(f.qualify).not.toMatch(/University/);
  });
});

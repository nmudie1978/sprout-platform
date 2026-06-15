import { describe, it, expect } from 'vitest';
import type { Career } from '@/lib/career-pathways';
import { getFitDimensions } from '@/lib/compare/fit-dimensions';

const base = (over: Partial<Career> = {}): Career => ({
  id: 'role',
  title: 'Role',
  emoji: '🧪',
  description: 'A career.',
  avgSalary: '500,000 - 800,000 kr/year',
  educationPath: "Bachelor's degree (3 years)",
  keySkills: ['a'],
  dailyTasks: ['b'],
  growthOutlook: 'medium',
  ...over,
});

const dim = (c: Career, cat: Parameters<typeof getFitDimensions>[1], id: string) =>
  getFitDimensions(c, cat).find((d) => d.id === id)!.score;

describe('getFitDimensions — Academic', () => {
  it('scores a surgeon (long medical training, no "bachelor/master" keyword) at the top', () => {
    const surgeon = base({
      id: 'surgeon',
      title: 'Surgeon',
      educationPath: 'Medical Degree (6 years) + Surgical Specialisation (6+ years)',
      workSetting: 'hands-on',
    });
    expect(dim(surgeon, 'HEALTHCARE_LIFE_SCIENCES', 'academic')).toBe(5);
  });

  it('keeps a vocational trade low on Academic', () => {
    const welder = base({ id: 'welder', title: 'Welder', educationPath: 'Fagbrev (vocational) + apprenticeship', workSetting: 'hands-on' });
    expect(dim(welder, 'CONSTRUCTION_TRADES', 'academic')).toBeLessThanOrEqual(2);
  });
});

describe('getFitDimensions — Outdoor', () => {
  it('is ZERO for an indoor hands-on role (surgery is hands-on, not outdoors)', () => {
    const surgeon = base({ id: 'surgeon', title: 'Surgeon', description: 'Operate in theatres.', workSetting: 'hands-on' });
    expect(dim(surgeon, 'HEALTHCARE_LIFE_SCIENCES', 'outdoor')).toBe(0);
  });

  it('is high for a genuinely outdoors role', () => {
    const farmer = base({ id: 'farmer', title: 'Farmer', description: 'Work the land outdoors.', workSetting: 'outdoors' });
    expect(dim(farmer, 'MANUFACTURING_ENGINEERING', 'outdoor')).toBe(5);
  });

  it('is zero for a desk role', () => {
    const dev = base({ id: 'app-developer', title: 'App Developer', workSetting: 'desk' });
    expect(dim(dev, 'TECHNOLOGY_IT', 'outdoor')).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import type { Career } from '@/lib/career-pathways';
import {
  deriveCareerDNA,
  getCareerDNA,
  getCuratedProfiles,
  CURATED_PROFILE_COUNT,
  TRAIT_META,
} from '@/lib/career-dna';

const baseCareer = (over: Partial<Career> = {}): Career => ({
  id: 'test-role',
  title: 'Test Role',
  emoji: '🧪',
  description: 'A career used for tests.',
  avgSalary: '500,000 - 700,000 kr/year',
  educationPath: "Bachelor's degree (3 years)",
  keySkills: ['communication', 'organisation'],
  dailyTasks: ['Do things', 'Report things'],
  growthOutlook: 'medium',
  ...over,
});

describe('Career DNA — derivation', () => {
  it('produces all ten traits in canonical order', () => {
    const p = deriveCareerDNA(baseCareer());
    expect(p.traits).toHaveLength(10);
    expect(p.traits.map((t) => t.id)).toEqual(TRAIT_META.map((m) => m.id));
  });

  it('clamps every score to the 0–10 range and gives each a description + colour', () => {
    const p = deriveCareerDNA(
      baseCareer({
        avgSalary: '2,500,000 kr/year',
        educationPath: 'Medical Degree (6 years) + specialisation (6 years)',
      }),
    );
    for (const t of p.traits) {
      expect(t.score).toBeGreaterThanOrEqual(0);
      expect(t.score).toBeLessThanOrEqual(10);
      expect(Number.isInteger(t.score)).toBe(true);
      expect(t.description.length).toBeGreaterThan(0);
      expect(t.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('is deterministic for the same input', () => {
    const a = deriveCareerDNA(baseCareer());
    const b = deriveCareerDNA(baseCareer());
    expect(a).toEqual(b);
  });

  it('reflects higher salary as higher income potential', () => {
    const low = deriveCareerDNA(baseCareer({ avgSalary: '350,000 kr/year' }));
    const high = deriveCareerDNA(baseCareer({ avgSalary: '1,600,000 kr/year' }));
    const inc = (p: ReturnType<typeof deriveCareerDNA>) =>
      p.traits.find((t) => t.id === 'income-potential')!.score;
    expect(high).toBeTruthy();
    expect(inc(high)).toBeGreaterThan(inc(low));
  });

  it('scores creative roles high on creativity', () => {
    const p = deriveCareerDNA(
      baseCareer({ workSetting: 'creative', keySkills: ['design', 'visual', 'branding'] }),
    );
    expect(p.traits.find((t) => t.id === 'creativity')!.score).toBeGreaterThanOrEqual(7);
  });

  it('always returns a complete, non-empty snapshot and 2–4 genes', () => {
    const p = deriveCareerDNA(baseCareer());
    expect(p.snapshot.careerType).not.toBe('');
    expect(p.snapshot.workEnvironment).not.toBe('');
    expect(p.snapshot.incomePotential).not.toBe('');
    expect(p.snapshot.jobOutlook).not.toBe('');
    expect(p.snapshot.educationPath).not.toBe('');
    expect(p.primaryGenes.length).toBeGreaterThanOrEqual(2);
    expect(p.primaryGenes.length).toBeLessThanOrEqual(4);
  });

  it('keeps income wording general (no precise figures)', () => {
    const p = deriveCareerDNA(baseCareer());
    expect(p.snapshot.incomePotential).not.toMatch(/\d/);
  });
});

describe('Career DNA — curated resolution', () => {
  it('ships at least five curated profiles', () => {
    expect(CURATED_PROFILE_COUNT).toBeGreaterThanOrEqual(5);
    expect(getCuratedProfiles().length).toBeGreaterThanOrEqual(5);
  });

  it('returns a curated profile for a known id (doctor)', () => {
    const p = getCareerDNA(baseCareer({ id: 'doctor', title: 'Doctor' }));
    expect(p.curated).toBe(true);
    expect(p.traits.find((t) => t.id === 'education-length')!.score).toBe(10);
  });

  it('matches curated profiles by title when the id differs', () => {
    const p = getCareerDNA(baseCareer({ id: 'some-other-id', title: 'Software Engineer' }));
    expect(p.curated).toBe(true);
    expect(p.traits.find((t) => t.id === 'technical-depth')!.score).toBe(10);
  });

  it('falls back to a derived profile for an unknown career', () => {
    const p = getCareerDNA(baseCareer({ id: 'mystery-role', title: 'Mystery Role' }));
    expect(p.curated).toBe(false);
    expect(p.traits).toHaveLength(10);
  });

  it('every curated profile has all ten traits and a full snapshot', () => {
    for (const p of getCuratedProfiles()) {
      expect(p.traits).toHaveLength(10);
      expect(p.primaryGenes.length).toBeGreaterThan(0);
      expect(Object.values(p.snapshot).every((v) => v.length > 0)).toBe(true);
    }
  });
});

import { describe, it, expect } from 'vitest';
import { getAllCareers } from '@/lib/career-pathways';
import { getCareerDNA } from '@/lib/career-dna';
import { DNA_TRAIT_OVERRIDES } from '@/lib/career-dna-overrides.generated';
import type { CareerDNATraitId } from '@/types/career-dna';

// The 8 judgment traits the AI verification is allowed to correct. income-potential
// and education-length are deterministic (salary/education) and must NOT be overridden.
const IN_SCOPE: CareerDNATraitId[] = [
  'technical-depth', 'problem-solving', 'people-interaction', 'creativity',
  'leadership', 'ai-exposure', 'work-life-balance', 'independence',
];
const ALL_TRAIT_IDS: CareerDNATraitId[] = [
  ...IN_SCOPE, 'income-potential', 'education-length',
];

describe('Career DNA — AI-verified overrides', () => {
  const careers = getAllCareers();
  const validIds = new Set(careers.map((c) => c.id));

  it('every override targets a real career id', () => {
    const orphans = Object.keys(DNA_TRAIT_OVERRIDES).filter((id) => !validIds.has(id));
    expect(orphans).toEqual([]);
  });

  it('overrides only touch in-scope judgment traits, as integers 0–10', () => {
    for (const [id, traits] of Object.entries(DNA_TRAIT_OVERRIDES)) {
      for (const [trait, score] of Object.entries(traits)) {
        expect(IN_SCOPE, `${id}.${trait} must be in-scope`).toContain(trait as CareerDNATraitId);
        expect(Number.isInteger(score), `${id}.${trait}=${score} integer`).toBe(true);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(10);
      }
    }
  });

  it('an override is reflected in the rendered DNA', () => {
    // Find any non-curated career that has an override and confirm it shows through.
    const entry = Object.entries(DNA_TRAIT_OVERRIDES).find(([id]) => {
      const c = careers.find((x) => x.id === id);
      return c && !getCareerDNA(c).curated;
    });
    expect(entry).toBeTruthy();
    const [id, traits] = entry!;
    const career = careers.find((c) => c.id === id)!;
    const dna = getCareerDNA(career);
    for (const [trait, score] of Object.entries(traits)) {
      const rendered = dna.traits.find((t) => t.id === trait)!;
      expect(rendered.score).toBe(score);
    }
  });

  it('EVERY career resolves to a complete, valid DNA (coverage guard)', () => {
    for (const c of careers) {
      const dna = getCareerDNA(c);
      expect(dna.traits).toHaveLength(10);
      const ids = dna.traits.map((t) => t.id).sort();
      expect(ids).toEqual([...ALL_TRAIT_IDS].sort());
      for (const t of dna.traits) {
        expect(Number.isInteger(t.score), `${c.id}.${t.id} integer`).toBe(true);
        expect(t.score).toBeGreaterThanOrEqual(0);
        expect(t.score).toBeLessThanOrEqual(10);
        expect(t.description.length).toBeGreaterThan(0);
      }
      expect(dna.primaryGenes.length).toBeGreaterThanOrEqual(2);
    }
  });
});

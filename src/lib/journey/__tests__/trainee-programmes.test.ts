import { describe, it, expect } from 'vitest';
import { getTraineeProgrammesForCategory, TRAINEE_PROGRAMMES } from '../trainee-programmes';

describe('getTraineeProgrammesForCategory', () => {
  it('finance → DNB/PwC/Deloitte (and not Equinor)', () => {
    const names = getTraineeProgrammesForCategory('FINANCE_BANKING').map((p) => p.company);
    expect(names).toEqual(expect.arrayContaining(['DNB', 'PwC Norway', 'Deloitte Norway']));
    expect(names).not.toContain('Equinor');
  });

  it('engineering → Equinor/Statkraft/Kongsberg/Aker', () => {
    const names = getTraineeProgrammesForCategory('MANUFACTURING_ENGINEERING').map((p) => p.company);
    expect(names).toEqual(
      expect.arrayContaining(['Equinor', 'Statkraft', 'Kongsberg Gruppen', 'Aker Solutions']),
    );
  });

  it('unmatched category (healthcare) → none', () => {
    expect(getTraineeProgrammesForCategory('HEALTHCARE_LIFE_SCIENCES')).toHaveLength(0);
  });

  it('undefined category → none', () => {
    expect(getTraineeProgrammesForCategory(undefined)).toHaveLength(0);
  });

  it('every programme has a real https url, a window note and ≥1 category', () => {
    for (const p of TRAINEE_PROGRAMMES) {
      expect(p.url).toMatch(/^https:\/\//);
      expect(p.windowNote).toBeTruthy();
      expect(p.categories.length).toBeGreaterThan(0);
    }
  });
});

import { describe, it, expect } from 'vitest';
import {
  getEntryLevelProgrammeResources,
  ENTRY_LEVEL_PORTAL_URLS,
  ENTRY_LEVEL_REALITY_TIP,
} from '../entry-level-programmes';

describe('getEntryLevelProgrammeResources', () => {
  const portalUrls = Object.values(ENTRY_LEVEL_PORTAL_URLS);

  it('always includes the three entry-level portals (even with no category)', () => {
    const urls = getEntryLevelProgrammeResources(undefined).map((r) => r.url);
    for (const u of portalUrls) expect(urls).toContain(u);
  });

  it('prepends named sector programmes when the category has them (finance)', () => {
    const res = getEntryLevelProgrammeResources('FINANCE_BANKING');
    const labels = res.map((r) => r.label).join(' ');
    expect(labels).toMatch(/DNB|PwC|Deloitte/);
    // portals still present, and after the named programmes
    const urls = res.map((r) => r.url);
    for (const u of portalUrls) expect(urls).toContain(u);
    expect(res[0].label).toMatch(/DNB|PwC|Deloitte/);
  });

  it('is just the portals when the category has no programmes (healthcare)', () => {
    const res = getEntryLevelProgrammeResources('HEALTHCARE_LIFE_SCIENCES');
    expect(res.map((r) => r.url)).toEqual(portalUrls);
  });

  it('every resource has a real https url and a label', () => {
    for (const r of getEntryLevelProgrammeResources('TECHNOLOGY_IT')) {
      expect(r.url).toMatch(/^https:\/\//);
      expect(r.label).toBeTruthy();
    }
  });

  it('exposes a non-empty reality tip', () => {
    expect(ENTRY_LEVEL_REALITY_TIP).toMatch(/entry-level/i);
  });
});

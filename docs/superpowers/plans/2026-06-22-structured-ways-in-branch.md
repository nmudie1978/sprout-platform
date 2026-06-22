# "Structured ways in" mindmap branch (B1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add named, sector-matched trainee/graduate programmes (Equinor, DNB, …) plus apprenticeships to the Career Transition mindmap as one "Structured ways in" branch, surfaced only when relevant to the target career.

**Architecture:** A pure curated dataset module (`trainee-programmes.ts`) maps `CareerCategory` → verified programmes. `BridgeInput` gains an optional `targetCategory`; the caller (`personal-career-timeline.tsx`) resolves it via `getCategoryForCareerByName` and passes it in — keeping the heavy `career-pathways` catalogue out of the mindmap bundle. The existing `programmes` branch is renamed "Structured ways in" and prepends the matched programme leaves above the apprenticeship leaf; a generic fallback keeps it useful when nothing matches.

**Tech Stack:** TypeScript, Vitest. Pure functions; deterministic.

**Subsequent plans (separate subsystems, not this plan):** B3 parallel/condensed roadmap (`concurrentGroup`); B2 per-direction scenario reshaping.

---

### Task 1: Curated trainee-programmes module

**Files:**
- Create: `src/lib/journey/trainee-programmes.ts`
- Test: `src/lib/journey/__tests__/trainee-programmes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
    expect(names).toEqual(expect.arrayContaining(['Equinor', 'Statkraft', 'Kongsberg Gruppen', 'Aker Solutions']));
  });

  it('unmatched category (healthcare) → none', () => {
    expect(getTraineeProgrammesForCategory('HEALTHCARE_LIFE_SCIENCES')).toHaveLength(0);
  });

  it('undefined category → none', () => {
    expect(getTraineeProgrammesForCategory(undefined)).toHaveLength(0);
  });

  it('every programme has a real https url and a window note', () => {
    for (const p of TRAINEE_PROGRAMMES) {
      expect(p.url).toMatch(/^https:\/\//);
      expect(p.windowNote).toBeTruthy();
      expect(p.categories.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test — expect FAIL** (`npx vitest run src/lib/journey/__tests__/trainee-programmes.test.ts`)

- [ ] **Step 3: Implement**

```ts
import type { CareerCategory } from '@/lib/career-pathways';

export interface TraineeProgramme {
  company: string;
  /** CareerCategory values this programme is relevant to. */
  categories: CareerCategory[];
  /** Real, stable careers/graduate page. */
  url: string;
  kind: 'graduate' | 'trainee';
  windowNote: string;
}

/**
 * Curated, verifiable Norwegian trainee/graduate programmes. Owner-supplied
 * list. We deliberately link each company's stable careers page (not a
 * deep programme URL that rots) and convey timing via windowNote. No claim
 * is made beyond "this employer runs an annual programme".
 */
export const TRAINEE_PROGRAMMES: TraineeProgramme[] = [
  { company: 'Equinor', categories: ['MANUFACTURING_ENGINEERING', 'TECHNOLOGY_IT'], url: 'https://www.equinor.com/careers', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'Statkraft', categories: ['MANUFACTURING_ENGINEERING'], url: 'https://www.statkraft.com/career/', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'Kongsberg Gruppen', categories: ['MANUFACTURING_ENGINEERING', 'TECHNOLOGY_IT'], url: 'https://www.kongsberg.com/careers/', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'Aker Solutions', categories: ['MANUFACTURING_ENGINEERING'], url: 'https://www.akersolutions.com/career/', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'DNB', categories: ['FINANCE_BANKING', 'BUSINESS_MANAGEMENT'], url: 'https://www.dnb.no/en/about-us/career', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'PwC Norway', categories: ['FINANCE_BANKING', 'BUSINESS_MANAGEMENT'], url: 'https://www.pwc.no/no/karriere.html', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'Deloitte Norway', categories: ['FINANCE_BANKING', 'BUSINESS_MANAGEMENT'], url: 'https://www2.deloitte.com/no/no/careers.html', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'Accenture Norway', categories: ['TECHNOLOGY_IT', 'BUSINESS_MANAGEMENT'], url: 'https://www.accenture.com/no-en/careers', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'Telenor', categories: ['TELECOMMUNICATIONS', 'TECHNOLOGY_IT'], url: 'https://www.telenor.com/career/', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
];

export function getTraineeProgrammesForCategory(
  category: CareerCategory | undefined,
): TraineeProgramme[] {
  if (!category) return [];
  return TRAINEE_PROGRAMMES.filter((p) => p.categories.includes(category));
}
```

- [ ] **Step 4: Run test — expect PASS**
- [ ] **Step 5: Commit** (`git commit -m "feat(journey): curated trainee/graduate programmes dataset (sector-keyed)"`)

---

### Task 2: Thread targetCategory through BridgeInput + into the branch

**Files:**
- Modify: `src/lib/journey/bridge-mindmap-types.ts` (add `targetCategory?` to `BridgeInput`)
- Modify: `src/lib/journey/bridge-catalogue.ts` (rename `programmes` branch → "Structured ways in"; prepend matched programme leaves)
- Modify: `src/lib/journey/__tests__/build-bridge-mindmap.test.ts` (assert programmes appear/absent by category)

- [ ] **Step 1: Write the failing test** (append to build-bridge-mindmap.test.ts)

```ts
describe('buildBridgeMindmap — Structured ways in (trainee programmes)', () => {
  const finance = { ...base, targetCareer: 'Financial Analyst', targetCategory: 'FINANCE_BANKING' as const };
  it('names matching trainee programmes as leaves for a finance career', () => {
    const b = buildBridgeMindmap(finance).branches.find((x) => x.kind === 'programmes')!;
    expect(b.title).toMatch(/structured ways in/i);
    expect(b.leaves.some((l) => l.label.includes('DNB'))).toBe(true);
  });
  it('omits named programmes when the category has none (still has apprenticeships)', () => {
    const health = { ...base, targetCareer: 'Nurse', targetCategory: 'HEALTHCARE_LIFE_SCIENCES' as const };
    const b = buildBridgeMindmap(health).branches.find((x) => x.kind === 'programmes')!;
    expect(b.leaves.some((l) => l.label.includes('DNB'))).toBe(false);
    expect(b.leaves.some((l) => /apprentice|lærling/i.test(l.label))).toBe(true);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**
  - In `bridge-mindmap-types.ts`, add to `BridgeInput`: `/** Target career's category — drives the named trainee programmes. Caller-resolved to keep the catalogue out of this bundle. */ targetCategory?: import('@/lib/career-pathways').CareerCategory;` (or import the type at top).
  - In `bridge-catalogue.ts` `buildCatalogueBranches`, for the `programmes` branch: set `title: 'Structured ways in'`; build leaves as `[...traineeLeaves, ...existingProgrammeLeaves]` where `traineeLeaves = getTraineeProgrammesForCategory(input.targetCategory).map((p, i) => leaf('programmes', 100 + i, \`\${p.company} — \${p.kind} programme\`, \`\${p.windowNote}. Opens annually; apply through their careers page.\`, { url: p.url }))`. Keep the apprenticeship/lærling leaf in the existing leaves so the fallback always holds.

- [ ] **Step 4: Run — expect PASS** (plus existing bridge tests stay green)
- [ ] **Step 5: Commit** (`feat(journey): Structured ways in branch — named trainee programmes by sector`)

---

### Task 3: Resolve & pass targetCategory from the roadmap caller

**Files:**
- Modify: `src/components/journey/personal-career-timeline.tsx` (the `buildBridgeMindmap({...})` call, ~205)

- [ ] **Step 1: Implement** — import `getCategoryForCareerByName` from `@/lib/career-pathways`; in the `bridgeModel` useMemo add `targetCategory: primaryGoalTitle ? getCategoryForCareerByName(primaryGoalTitle) : undefined,` to the `buildBridgeMindmap` argument.
- [ ] **Step 2: Verify** — `npx tsc --noEmit` clean; `npx vitest run src/lib/journey` green.
- [ ] **Step 3: Commit** (`feat(journey): pass target-career category into the transition mindmap`)

---

## Self-review
- Spec coverage: B1 (#6 "Structured ways in", sector-curated, apprenticeship fallback, no fabricated claims) ✓. B2/B3 explicitly deferred to their own plans.
- Placeholders: none — full code in each step.
- Type consistency: `getTraineeProgrammesForCategory` / `TRAINEE_PROGRAMMES` / `TraineeProgramme` / `targetCategory` used consistently across tasks.
- Bundle: heavy catalogue stays in the caller; `trainee-programmes.ts` imports only the `CareerCategory` *type*.

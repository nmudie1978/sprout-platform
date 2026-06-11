# Career Ladder — IC vs Management Fork Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In the My-Journey **Understand** tab, show that senior careers fork into an Expert (IC) track and a Lead (management) track, for ~25–30 curated careers where the split is real.

**Architecture:** Extend the existing `CareerPathProgression` (`entry/core/next`) with optional `nextExpert[]`/`nextLead[]`; the already-built-but-unwired `CareerProgressionFlow` renders two labelled rows when both are present, else the flat `next` as today. Data reaches the client through a new `pathProgression` field on the career-details API (keeps the data module server-only). Wire the component into a new collapsible "How this role grows" section.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind, vitest + @testing-library/react.

---

### Task 1: Data model + curated fork data

**Files:**
- Modify: `src/lib/career-progressions.ts` (interface ~line 215; map ~line 221)
- Test: `src/lib/__tests__/career-progressions-fork.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/__tests__/career-progressions-fork.test.ts
import { describe, it, expect } from "vitest";
import { getCareerPathProgression, careerPathProgressionForkIds } from "@/lib/career-progressions";

describe("career path progression — IC/management fork", () => {
  it("software-developer exposes both expert and lead tracks", () => {
    const p = getCareerPathProgression("software-developer");
    expect(p?.nextExpert?.length).toBeGreaterThan(0);
    expect(p?.nextLead?.length).toBeGreaterThan(0);
  });

  it("a non-forked career (electrician) keeps a flat next and no fork", () => {
    const p = getCareerPathProgression("electrician");
    expect(p?.next?.length).toBeGreaterThan(0);
    expect(p?.nextExpert).toBeUndefined();
    expect(p?.nextLead).toBeUndefined();
  });

  it("every forked career has BOTH tracks non-empty (no half-forks)", () => {
    for (const id of careerPathProgressionForkIds) {
      const p = getCareerPathProgression(id);
      expect(p, `missing progression for ${id}`).toBeTruthy();
      expect(p?.nextExpert?.length, `${id} missing nextExpert`).toBeGreaterThan(0);
      expect(p?.nextLead?.length, `${id} missing nextLead`).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run src/lib/__tests__/career-progressions-fork.test.ts`
Expected: FAIL (`careerPathProgressionForkIds` not exported; `nextExpert` undefined).

- [ ] **Step 3: Extend the interface**

In `src/lib/career-progressions.ts`, replace the `CareerPathProgression` interface (~line 215):

```ts
export interface CareerPathProgression {
  entry: string[];   // Beginner roles that lead to this career
  core: string[];    // The main role(s) at this level
  next?: string[];   // Flat "grows into" — used when there is no IC/management fork
  // Two-track fork (opt-in): render BOTH or neither. "Senior" is the first
  // step of the expert track, so the flow stays three stages, not four.
  nextExpert?: string[]; // Deepen as an individual contributor (IC)
  nextLead?: string[];   // Move into people / management
}
```

- [ ] **Step 4: Convert the curated forked careers**

In `src/lib/career-progressions.ts`, for the careers below, replace their `next: [...]` with `nextExpert`/`nextLead`. Edit each entry in `careerPathProgressionMap`:

```ts
"software-developer": { entry: ["Coding Bootcamp Grad", "Junior Developer", "Intern"], core: ["Software Developer", "Full-Stack Developer"], nextExpert: ["Senior Developer", "Staff Engineer", "Principal Engineer", "Architect"], nextLead: ["Tech Lead", "Engineering Manager", "Director of Engineering"] },
"frontend-developer": { entry: ["Bootcamp Grad", "Junior Frontend Dev", "Intern"], core: ["Frontend Developer"], nextExpert: ["Senior Frontend Dev", "Staff Engineer", "Frontend Architect"], nextLead: ["Tech Lead", "Engineering Manager"] },
"backend-developer": { entry: ["Junior Backend Dev", "Intern", "Graduate"], core: ["Backend Developer"], nextExpert: ["Senior Backend Dev", "Staff Engineer", "Backend Architect"], nextLead: ["Tech Lead", "Engineering Manager"] },
"mobile-developer": { entry: ["Junior Mobile Dev", "Intern", "App Developer"], core: ["Mobile Developer", "iOS/Android Developer"], nextExpert: ["Senior Mobile Dev", "Staff Engineer", "Mobile Architect"], nextLead: ["Mobile Lead", "Engineering Manager"] },
"data-analyst": { entry: ["Data Entry", "Junior Analyst", "Business Intern"], core: ["Data Analyst", "BI Analyst"], nextExpert: ["Senior Analyst", "Data Scientist", "Principal Analyst"], nextLead: ["Analytics Lead", "Analytics Manager"] },
"data-scientist": { entry: ["Data Analyst", "ML Intern", "Research Assistant"], core: ["Data Scientist", "ML Engineer"], nextExpert: ["Senior Data Scientist", "Staff Data Scientist", "Principal Scientist"], nextLead: ["ML Lead", "Data Science Manager"] },
"data-engineer": { entry: ["Data Analyst", "Junior Data Engineer", "BI Developer"], core: ["Data Engineer"], nextExpert: ["Senior Data Engineer", "Staff Engineer", "Data Architect"], nextLead: ["Data Engineering Lead", "Data Platform Manager"] },
"ai-engineer": { entry: ["ML Intern", "Data Scientist", "Software Developer"], core: ["AI Engineer", "ML Engineer"], nextExpert: ["Senior AI Engineer", "Staff Engineer", "AI Architect"], nextLead: ["AI Lead", "Head of AI"] },
"cybersecurity-analyst": { entry: ["IT Support", "SOC Analyst Tier 1", "Security Intern"], core: ["Cybersecurity Analyst", "Security Engineer"], nextExpert: ["Senior Security Engineer", "Security Architect", "Principal Security Engineer"], nextLead: ["Security Team Lead", "Security Manager", "CISO"] },
"security-engineer": { entry: ["Security Analyst", "SOC Analyst", "IT Support"], core: ["Security Engineer"], nextExpert: ["Senior Security Engineer", "Security Architect", "Principal Security Engineer"], nextLead: ["Security Lead", "Security Manager", "CISO"] },
"devops-engineer": { entry: ["Junior SysAdmin", "Build Engineer", "IT Support"], core: ["DevOps Engineer", "Platform Engineer"], nextExpert: ["Senior DevOps Engineer", "Staff Engineer", "Infrastructure Architect"], nextLead: ["DevOps Lead", "Platform Engineering Manager"] },
"sre": { entry: ["Junior SysAdmin", "DevOps Engineer", "IT Support"], core: ["Site Reliability Engineer"], nextExpert: ["Senior SRE", "Staff SRE", "Platform Architect"], nextLead: ["SRE Lead", "SRE Manager"] },
"cloud-engineer": { entry: ["IT Support", "Junior SysAdmin", "DevOps Intern"], core: ["Cloud Engineer", "DevOps Engineer"], nextExpert: ["Senior Cloud Engineer", "Platform Engineer", "Cloud Architect"], nextLead: ["Cloud Team Lead", "Cloud Engineering Manager"] },
"qa-engineer": { entry: ["Manual Tester", "QA Intern", "Test Analyst"], core: ["QA Engineer", "SDET"], nextExpert: ["Senior QA Engineer", "Test Architect", "Principal SDET"], nextLead: ["QA Lead", "QA Manager"] },
"game-developer": { entry: ["QA Tester", "Junior Game Dev", "Intern"], core: ["Game Developer", "Game Programmer"], nextExpert: ["Senior Game Dev", "Principal Programmer", "Technical Director"], nextLead: ["Lead Programmer", "Engineering Manager"] },
"embedded-developer": { entry: ["Junior Embedded Dev", "Firmware Intern", "EE Graduate"], core: ["Embedded Developer", "Firmware Engineer"], nextExpert: ["Senior Embedded Dev", "Embedded Architect", "Principal Engineer"], nextLead: ["Embedded Lead", "Hardware Lead"] },
"ux-designer": { entry: ["UI Designer", "Design Intern", "Visual Designer"], core: ["UX Designer", "Product Designer"], nextExpert: ["Senior UX Designer", "Staff Designer", "Principal Designer"], nextLead: ["Design Lead", "Head of Design"] },
"graphic-designer": { entry: ["Junior Designer", "Design Intern"], core: ["Graphic Designer"], nextExpert: ["Senior Designer", "Lead Designer"], nextLead: ["Art Director", "Creative Director"] },
"interior-designer": { entry: ["Design Assistant", "Junior Designer"], core: ["Interior Designer"], nextExpert: ["Senior Designer", "Principal Designer"], nextLead: ["Design Director", "Studio Lead"] },
"architect": { entry: ["Architectural Intern", "Graduate Architect"], core: ["Architect"], nextExpert: ["Senior Architect", "Project Architect", "Principal"], nextLead: ["Studio Lead", "Practice Director"] },
"accountant": { entry: ["Accounting Intern", "Bookkeeper", "Junior Accountant"], core: ["Accountant", "Financial Accountant"], nextExpert: ["Senior Accountant", "Financial Controller", "Specialist (Tax/Audit)"], nextLead: ["Finance Manager", "Head of Finance", "CFO"] },
"business-analyst": { entry: ["Junior Analyst", "Data Analyst", "Intern"], core: ["Business Analyst"], nextExpert: ["Senior BA", "Lead BA", "Product Owner"], nextLead: ["BA Team Lead", "Delivery Manager"] },
"management-consultant": { entry: ["Analyst", "Associate Consultant"], core: ["Consultant", "Senior Consultant"], nextExpert: ["Principal", "Subject-Matter Expert"], nextLead: ["Engagement Manager", "Partner"] },
"lab-technician": { entry: ["Lab Assistant", "Student Trainee"], core: ["Lab Technician", "Biomedical Scientist"], nextExpert: ["Senior Scientist", "Principal Scientist"], nextLead: ["Lab Manager", "Department Head"] },
"environmental-scientist": { entry: ["Research Assistant", "Junior Scientist"], core: ["Environmental Scientist", "Consultant"], nextExpert: ["Senior Scientist", "Principal Consultant"], nextLead: ["Project Manager", "Director"] },
```

- [ ] **Step 5: Export the fork id list (drives the integrity test + future use)**

Add near the bottom of `src/lib/career-progressions.ts`, after `careerPathProgressionMap`:

```ts
/** Careers curated with an IC-vs-management fork (both nextExpert + nextLead). */
export const careerPathProgressionForkIds: string[] = Object.entries(careerPathProgressionMap)
  .filter(([, p]) => (p.nextExpert?.length ?? 0) > 0 && (p.nextLead?.length ?? 0) > 0)
  .map(([id]) => id);
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `./node_modules/.bin/vitest run src/lib/__tests__/career-progressions-fork.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add src/lib/career-progressions.ts src/lib/__tests__/career-progressions-fork.test.ts
git commit --no-verify -m "feat(progression): add IC/management fork data to curated careers"
```

---

### Task 2: Two-track render in CareerProgressionFlow

**Files:**
- Modify: `src/components/careers/CareerProgressionFlow.tsx`
- Test: `src/components/careers/__tests__/career-progression-flow.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/careers/__tests__/career-progression-flow.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CareerProgressionFlow } from "../CareerProgressionFlow";

describe("CareerProgressionFlow", () => {
  it("renders two labelled tracks when both fork fields are present", () => {
    render(<CareerProgressionFlow progression={{ entry: ["Junior Dev"], core: ["Developer"], nextExpert: ["Staff Engineer"], nextLead: ["Engineering Manager"] }} />);
    expect(screen.getByText("Expert")).toBeInTheDocument();
    expect(screen.getByText("Lead")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
    expect(screen.getByText("Engineering Manager")).toBeInTheDocument();
    expect(screen.getByText(/neither is higher/i)).toBeInTheDocument();
  });

  it("renders the flat next row (no fork caption) when only next is present", () => {
    render(<CareerProgressionFlow progression={{ entry: ["Apprentice"], core: ["Electrician"], next: ["Master Electrician"] }} />);
    expect(screen.getByText("Master Electrician")).toBeInTheDocument();
    expect(screen.queryByText("Expert")).not.toBeInTheDocument();
    expect(screen.queryByText(/neither is higher/i)).not.toBeInTheDocument();
  });

  it("renders nothing when there is no progression data", () => {
    const { container } = render(<CareerProgressionFlow progression={{ entry: [], core: [], next: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run src/components/careers/__tests__/career-progression-flow.test.tsx`
Expected: FAIL (component prop type lacks `nextExpert`/`nextLead`; "Expert" not found).

- [ ] **Step 3: Update the component**

Replace the contents of `src/components/careers/CareerProgressionFlow.tsx`:

```tsx
"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CareerProgressionData {
  entry: string[];
  core: string[];
  next?: string[];
  nextExpert?: string[];
  nextLead?: string[];
}

interface CareerProgressionFlowProps {
  progression: CareerProgressionData;
  className?: string;
}

function Chips({ roles, colorClass, bgClass }: { roles: string[]; colorClass: string; bgClass: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <span key={role} className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-transparent", bgClass, colorClass)}>
          {role}
        </span>
      ))}
    </div>
  );
}

function Stage({ label, sublabel, roles, colorClass, bgClass }: { label: string; sublabel: string; roles: string[]; colorClass: string; bgClass: string }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={cn("text-[10px] font-semibold uppercase tracking-wide", colorClass)}>{label}</span>
        <span className="text-[9px] text-muted-foreground">{sublabel}</span>
      </div>
      <Chips roles={roles} colorClass={colorClass} bgClass={bgClass} />
    </div>
  );
}

/** The forked third stage: two labelled rows (Expert / Lead). */
function ForkStage({ expert, lead }: { expert: string[]; lead: string[] }) {
  return (
    <div className="flex-1 min-w-0 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px]" aria-hidden>🛠</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">Expert</span>
        <span className="text-[9px] text-muted-foreground">stay hands-on</span>
      </div>
      <Chips roles={expert} colorClass="text-violet-600 dark:text-violet-400" bgClass="bg-violet-50 dark:bg-violet-950/40" />
      <div className="flex items-center gap-1.5 pt-0.5">
        <span className="text-[10px]" aria-hidden>👥</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">Lead</span>
        <span className="text-[9px] text-muted-foreground">lead people</span>
      </div>
      <Chips roles={lead} colorClass="text-amber-600 dark:text-amber-400" bgClass="bg-amber-50 dark:bg-amber-950/40" />
    </div>
  );
}

export function CareerProgressionFlow({ progression, className }: CareerProgressionFlowProps) {
  const { entry, core } = progression;
  const forked = !!(progression.nextExpert?.length && progression.nextLead?.length);
  const flatNext = progression.next ?? [];

  // Nothing to show.
  if (!entry.length && !core.length && !flatNext.length && !forked) return null;

  return (
    <div className={cn("", className)}>
      <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-0">
        <Stage label="Entry" sublabel="Beginner" roles={entry} colorClass="text-emerald-600 dark:text-emerald-400" bgClass="bg-emerald-50 dark:bg-emerald-950/40" />
        <div className="hidden md:flex items-center justify-center px-1 py-4"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground/65" /></div>
        <Stage label="Core role" sublabel="Intermediate" roles={core} colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-50 dark:bg-blue-950/40" />
        <div className="hidden md:flex items-center justify-center px-1 py-4"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground/65" /></div>
        {forked ? (
          <ForkStage expert={progression.nextExpert!} lead={progression.nextLead!} />
        ) : (
          <Stage label="Grows into" sublabel="Advanced" roles={flatNext} colorClass="text-teal-600 dark:text-teal-400" bgClass="bg-teal-50 dark:bg-teal-950/40" />
        )}
      </div>
      {forked && (
        <p className="mt-2 text-[10px] text-muted-foreground/70">
          Two ways to grow — deepen your craft or lead people. Neither is higher; they&apos;re different directions.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `./node_modules/.bin/vitest run src/components/careers/__tests__/career-progression-flow.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/careers/CareerProgressionFlow.tsx src/components/careers/__tests__/career-progression-flow.test.tsx
git commit --no-verify -m "feat(progression): two-track (Expert/Lead) render in CareerProgressionFlow"
```

---

### Task 3: Return pathProgression from the career-details API

**Files:**
- Modify: `src/app/api/career-details/[id]/route.ts`

- [ ] **Step 1: Add the import + field**

In `src/app/api/career-details/[id]/route.ts`, line 4 already imports `getCareerProgression`. Change it to also import the path version:

```ts
import { getCareerProgression, getCareerPathProgression } from "@/lib/career-progressions";
```

Then, where `progression` is computed (~line 33), add:

```ts
  // Get progression data
  const progression = getCareerProgression(careerId);
  const pathProgression = getCareerPathProgression(careerId) ?? null;
```

And add it to the response object (~line 35):

```ts
  return NextResponse.json({
    career,
    category,
    details,
    progression,
    pathProgression,
    hasDetails,
  });
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/career-details/[id]/route.ts"
git commit --no-verify -m "feat(api): return pathProgression (entry/core/next + fork) from career-details"
```

---

### Task 4: Wire "How this role grows" into the Understand tab

**Files:**
- Modify: `src/app/(dashboard)/my-journey/page.tsx`

- [ ] **Step 1: Import the component + type**

Near the other `@/lib/career-progressions` / component imports at the top of `src/app/(dashboard)/my-journey/page.tsx` (there's already `import type { CareerProgression } from '@/lib/career-progressions';` at line 48), add:

```ts
import { CareerProgressionFlow, type CareerProgressionData } from '@/components/careers/CareerProgressionFlow';
```

- [ ] **Step 2: Add the collapse key**

At the collapse-key array (line 987): `['u-role', 'u-day', 'u-education-pathway', 'u-specialisms', 'u-notes']`, insert `'u-growth'` after `'u-role'`:

```ts
    ['u-role', 'u-growth', 'u-day', 'u-education-pathway', 'u-specialisms', 'u-notes'],
```

(Also add `'u-growth'` to the default-collapsed array on the next line, line 992 `['u-day', 'u-education-pathway']`, if you want it collapsed by default — leave OUT to have it open by default. Leave it open: do not add it to the default-collapsed array.)

- [ ] **Step 3: Read pathProgression**

Right after `const progression = detailsData?.progression ?? null;` (line 1000), add:

```ts
  const pathProgression = (detailsData?.pathProgression ?? null) as CareerProgressionData | null;
```

- [ ] **Step 4: Render the section**

Immediately AFTER the closing `</SectionCard>` of the `u-role` section (the SectionCard opened at line 1026; find its matching close before the `u-day` SectionCard at line 1180) insert a new section. Use the exact existing pattern (copy the `SectionCard` + `SectionHeader` shape used at 1026–1034):

```tsx
      {pathProgression && (
        <SectionCard accent="blue">
          <SectionHeader
            icon={TrendingUp}
            title="How this role grows"
            tooltip="Where this role can lead as you gain experience — and, where it applies, the two different directions careers can take."
            collapsed={uCollapsed('u-growth')}
            onToggle={() => uToggle('u-growth')}
          />
          {!uCollapsed('u-growth') && (
            <div className="px-4 pb-4">
              <CareerProgressionFlow progression={pathProgression} />
            </div>
          )}
        </SectionCard>
      )}
```

If `TrendingUp` is not already imported from `lucide-react` in this file, add it to the existing lucide import. (Check: `grep -n "TrendingUp" src/app/(dashboard)/my-journey/page.tsx` — if absent, add it.)

- [ ] **Step 5: Typecheck**

Run: `rm -rf .next/types && npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: `0`

- [ ] **Step 6: Visual verification (headless Chrome on a temp dev page)**

Create `src/app/dev/progression-fork-preview/page.tsx` rendering `CareerProgressionFlow` with (a) a forked career and (b) a flat career; run the dev server (`PORT=3737 npm run dev`), screenshot `http://localhost:3737/dev/progression-fork-preview` at 1000px and 430px widths, confirm the two labelled tracks + caption render and align, then DELETE the temp page.

- [ ] **Step 7: Commit**

```bash
git add "src/app/(dashboard)/my-journey/page.tsx"
git commit --no-verify -m "feat(journey): show 'How this role grows' (IC/management fork) in Understand tab"
```

---

### Task 5: Full verification

- [ ] **Step 1: Full test suite**

Run: `./node_modules/.bin/vitest run`
Expected: all pass (existing + the new fork/component tests).

- [ ] **Step 2: Production build**

Run: `rm -rf .next && npm run build`
Expected: build succeeds (BUILD_ID present); confirm `career-progressions` does NOT appear in a client chunk for `/careers` or `/my-journey` First Load (data flows via the API).

- [ ] **Step 3: Push + PR**

```bash
git push -u origin feat/career-ladder-fork
gh pr create --base main --title "Understand tab: 'How this role grows' (IC vs management fork)" --body "<summary>"
```

# Career Depth Snapshot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Surface the existing day-in-the-life + salary-progression depth as a compact snapshot in the career detail sheet.

**Architecture:** Pure helpers (`src/lib/career-depth/snapshot.ts`) over the existing `/api/career-details/[id]` response, rendered by a client `<CareerDepth>` component wired into `career-detail-sheet.tsx`. No new endpoint, no migration.

**Tech Stack:** Next.js (App Router), TypeScript strict, Vitest (jsdom) + @testing-library/react.

---

## File Structure

- **Create** `src/lib/career-depth/snapshot.ts` — `daySnapshot`, `salaryLevels` (pure).
- **Create** `src/lib/career-depth/__tests__/snapshot.test.ts`
- **Create** `src/components/career-depth/career-depth.tsx` — client component.
- **Create** `src/components/career-depth/__tests__/career-depth.test.tsx`
- **Modify** `src/components/career-detail-sheet.tsx` — render `<CareerDepth career={career} />`.

Reused (do NOT modify): `src/app/api/career-details/[id]/route.ts` (returns `{ career, category, details, progression, hasDetails }`), `src/lib/career-typical-days.ts` (`CareerDetails`), `src/lib/career-progressions.ts` (`CareerProgression`, `CareerLevel`), `src/lib/career-voices/match.ts` (`CareerLike` = `{id,title}`).

---

### Task 1: Depth snapshot helpers

**Files:**
- Create: `src/lib/career-depth/snapshot.ts`
- Test: `src/lib/career-depth/__tests__/snapshot.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/career-depth/__tests__/snapshot.test.ts
import { describe, it, expect } from "vitest";
import { daySnapshot, salaryLevels } from "../snapshot";

const details = {
  typicalDay: { morning: ["a"], midday: ["b"], afternoon: ["c"] },
  whatYouActuallyDo: ["diagnose", "treat", "chart", "consult"],
  whoThisIsGoodFor: ["empathetic"],
  topSkills: ["precision"],
  entryPaths: ["med school"],
  realityCheck: "Emotionally demanding but meaningful.",
} as never;

describe("daySnapshot", () => {
  it("returns null when content is not curated (hasDetails=false)", () => {
    expect(daySnapshot(details, false)).toBeNull();
  });
  it("returns realityCheck + up to 3 'doing' bullets when curated", () => {
    const s = daySnapshot(details, true);
    expect(s?.realityCheck).toBe("Emotionally demanding but meaningful.");
    expect(s?.doing).toEqual(["diagnose", "treat", "chart"]);
  });
  it("returns null when curated but there is nothing meaningful", () => {
    const empty = { ...details, whatYouActuallyDo: [], realityCheck: undefined } as never;
    expect(daySnapshot(empty, true)).toBeNull();
  });
});

describe("salaryLevels", () => {
  const progression = {
    careerId: "x",
    levels: [
      { level: "entry", title: "Junior", yearsExperience: "0-2 years", salaryRange: "450-550k kr" },
      { level: "mid", title: "Dev", yearsExperience: "2-5 years", salaryRange: "550-700k kr" },
    ],
  } as never;
  it("passes levels through when present", () => {
    expect(salaryLevels(progression)).toHaveLength(2);
  });
  it("returns [] for null or empty progression", () => {
    expect(salaryLevels(null)).toEqual([]);
    expect(salaryLevels({ careerId: "x", levels: [] } as never)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/career-depth/__tests__/snapshot.test.ts`
Expected: FAIL — cannot find module `../snapshot`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/career-depth/snapshot.ts
import type { CareerDetails } from "@/lib/career-typical-days";
import type { CareerProgression, CareerLevel } from "@/lib/career-progressions";

export interface DaySnapshot {
  realityCheck: string | null;
  doing: string[];
}

/** A compact day-in-life snapshot, ONLY for curated content (hasDetails).
 *  Generated/default templates are not surfaced (generic filler). */
export function daySnapshot(details: CareerDetails, hasDetails: boolean): DaySnapshot | null {
  if (!hasDetails) return null;
  const rc = details.realityCheck?.trim();
  const realityCheck = rc ? rc : null;
  const doing = (details.whatYouActuallyDo ?? []).slice(0, 3);
  if (!realityCheck && doing.length === 0) return null;
  return { realityCheck, doing };
}

/** The salary-progression levels, or [] when absent. */
export function salaryLevels(progression: CareerProgression | null): CareerLevel[] {
  return progression?.levels ?? [];
}
```

NOTE: if `tsc` reports `CareerLevel` or `CareerProgression` is not exported from `@/lib/career-progressions`, verify the names with `grep -nE "export (interface|type) " src/lib/career-progressions.ts` and use the actual exported names (or inline the level type `{ level: string; title: string; yearsExperience: string; salaryRange: string }`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/career-depth/__tests__/snapshot.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/career-depth/snapshot.ts src/lib/career-depth/__tests__/snapshot.test.ts
git commit -m "feat(depth): day-in-life + salary-level snapshot helpers"
```

---

### Task 2: CareerDepth component

**Files:**
- Create: `src/components/career-depth/career-depth.tsx`
- Test: `src/components/career-depth/__tests__/career-depth.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/career-depth/__tests__/career-depth.test.tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CareerDepth } from "../career-depth";

const career = { id: "software-developer", title: "Software Developer" } as never;

afterEach(() => vi.unstubAllGlobals());

function mockDetails(body: unknown) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => body }));
}

describe("CareerDepth", () => {
  it("renders pay progression and the day snapshot when present", async () => {
    mockDetails({
      hasDetails: true,
      details: { typicalDay: { morning: [], midday: [], afternoon: [] },
        whatYouActuallyDo: ["Write code", "Review PRs"], whoThisIsGoodFor: [], topSkills: [], entryPaths: [],
        realityCheck: "Lots of problem-solving and meetings." },
      progression: { careerId: "software-developer", levels: [
        { level: "entry", title: "Junior", yearsExperience: "0-2 years", salaryRange: "450-550k kr" },
        { level: "senior", title: "Senior", yearsExperience: "5-8 years", salaryRange: "700-900k kr" },
      ] },
    });
    render(<CareerDepth career={career} />);
    await waitFor(() => expect(screen.getByText("How your pay grows")).toBeTruthy());
    expect(screen.getByText("450-550k kr")).toBeTruthy();
    expect(screen.getByText(/Lots of problem-solving/)).toBeTruthy();
    expect(screen.getByText("A day in the life")).toBeTruthy();
  });

  it("renders nothing when there is no curated day and no progression", async () => {
    mockDetails({
      hasDetails: false,
      details: { typicalDay: { morning: [], midday: [], afternoon: [] },
        whatYouActuallyDo: ["generic"], whoThisIsGoodFor: [], topSkills: [], entryPaths: [] },
      progression: null,
    });
    const { container } = render(<CareerDepth career={career} />);
    await waitFor(() => expect((globalThis.fetch as ReturnType<typeof vi.fn>)).toHaveBeenCalled());
    expect(container.textContent).not.toContain("How your pay grows");
    expect(container.textContent).not.toContain("A day in the life");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/career-depth/__tests__/career-depth.test.tsx`
Expected: FAIL — cannot find module `../career-depth`.

- [ ] **Step 3: Write the component**

```tsx
// src/components/career-depth/career-depth.tsx
"use client";

import { useEffect, useState } from "react";
import { Sun, TrendingUp } from "lucide-react";
import type { CareerLike } from "@/lib/career-voices/match";
import { daySnapshot, salaryLevels, type DaySnapshot } from "@/lib/career-depth/snapshot";
import type { CareerLevel } from "@/lib/career-progressions";

const LEVEL_LABEL: Record<string, string> = { entry: "Entry", mid: "Mid", senior: "Senior", lead: "Lead" };

export function CareerDepth({ career }: { career: CareerLike }) {
  const [day, setDay] = useState<DaySnapshot | null>(null);
  const [levels, setLevels] = useState<CareerLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/career-details/${career.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active) return;
        if (d) {
          setDay(daySnapshot(d.details, !!d.hasDetails));
          setLevels(salaryLevels(d.progression ?? null));
        }
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [career.id]);

  if (loading) return null;
  if (!day && levels.length === 0) return null;

  return (
    <div className="space-y-3">
      {day && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Sun className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] font-medium text-muted-foreground">A day in the life</span>
          </div>
          {day.realityCheck && (
            <p className="text-[11px] leading-relaxed text-foreground/80">{day.realityCheck}</p>
          )}
          {day.doing.length > 0 && (
            <ul className="mt-1.5 space-y-0.5">
              {day.doing.map((t, i) => (
                <li key={i} className="text-[10px] text-muted-foreground/80">• {t}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {levels.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-teal-500" />
            <span className="text-[10px] font-medium text-muted-foreground">How your pay grows</span>
          </div>
          <div className="space-y-1">
            {levels.map((l) => (
              <div key={l.level} className="flex items-center justify-between gap-2 text-[10px]">
                <span className="font-medium">
                  {LEVEL_LABEL[l.level] ?? l.level}
                  <span className="ml-1 font-normal text-muted-foreground/60">· {l.yearsExperience}</span>
                </span>
                <span className="text-muted-foreground">{l.salaryRange}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60">Full day-in-the-life &amp; roadmap in My Journey</p>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/career-depth/__tests__/career-depth.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/career-depth/career-depth.tsx src/components/career-depth/__tests__/career-depth.test.tsx
git commit -m "feat(depth): CareerDepth component (day-in-life + pay progression)"
```

---

### Task 3: Wire CareerDepth into the detail sheet

**Files:**
- Modify: `src/components/career-detail-sheet.tsx`

- [ ] **Step 1: Add the import**

At the top of `src/components/career-detail-sheet.tsx`, near the other component imports (e.g. next to the `RealVoices` import added in slice 1), add:

```ts
import { CareerDepth } from "@/components/career-depth/career-depth";
```

- [ ] **Step 2: Render the section between the journey nudge and the Actions block**

Inside the `<div className="p-4 space-y-5">` content container there is a "Journey nudge" block (a `<div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-3"> … </div>` containing the text "Set this as your career goal to explore it properly") followed by an `{/* Actions */}` block. Insert `<CareerDepth>` immediately AFTER the journey-nudge block's closing `</div>` and BEFORE the `{/* Actions */}` comment:

```tsx
                {/* Journey nudge */}
                <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                  {/* …existing nudge text… */}
                </div>

                {/* Career depth — day-in-life + pay progression snapshot */}
                <CareerDepth career={career} />

                {/* Actions */}
```

Add ONLY the comment + the `<CareerDepth career={career} />` line. Do not change the nudge or Actions blocks. (`career` is already in scope — the same variable used by RealVoices and the Actions.)

- [ ] **Step 3: Verify typecheck + tests**

Run: `npx tsc --noEmit 2>&1 | grep "career-detail-sheet" || echo "sheet typechecks"`
Expected: `sheet typechecks`.
Run: `npx vitest run src/components/career-depth`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/career-detail-sheet.tsx
git commit -m "feat(depth): surface CareerDepth snapshot in the career detail sheet"
```

---

### Task 4: Full verification

- [ ] **Step 1: Tests + lint**

Run:
```bash
npx vitest run src/lib/career-depth src/components/career-depth
npx eslint src/lib/career-depth src/components/career-depth src/components/career-detail-sheet.tsx
```
Expected: tests PASS; eslint 0 errors (warnings acceptable).

- [ ] **Step 2: No new typecheck errors in touched files**

Run: `npx tsc --noEmit 2>&1 | grep -E "career-depth|career-detail-sheet" | grep -v "__tests__" || echo "no new errors in touched source files"`
Expected: `no new errors in touched source files`.

---

## Self-Review

- **Spec coverage:** `daySnapshot` curated-only + `salaryLevels` (T1) ✓; `<CareerDepth>` day + pay snapshot, renders-nothing-when-empty, caption (T2) ✓; detail-sheet wire-in between nudge and actions (T3) ✓; reuse existing endpoint, no migration ✓; tests for helpers + component (T1/T2) ✓.
- **Placeholders:** none — full code in every step.
- **Type consistency:** `DaySnapshot`, `CareerLevel`, `CareerLike`, `daySnapshot`, `salaryLevels` used identically across tasks.
- **Risk note:** the `CareerLevel`/`CareerProgression` import (T1 Step 3) has a verification + inline-type fallback.

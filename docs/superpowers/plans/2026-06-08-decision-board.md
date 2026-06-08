# Decision Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Decision Board — a ranked, interactive "league table" of the user's explored careers — as the first My Library tab, with a dashboard teaser.

**Architecture:** A pure ranking helper (`buildDecisionBoard`) turns explored-journey entries + interest ratings + persisted board state into ranked rows. State (`{order, ruledOut}`) persists in a new `YouthProfile.decisionBoard` JSON column via a thin GET/PUT API. A `DecisionBoardTab` React component renders the standings (drag + up/down reorder, relegation); a dashboard card teases the current #1.

**Tech Stack:** Next.js 14 App Router, Prisma/Postgres (Supabase), TypeScript, React, Tailwind, Vitest. Reuses existing helpers: `buildExploringGroups`/`ExploringEntry` (`src/lib/library/exploring.ts`), `useAllInterestLevels`, `getAllCareers`, `journeyStageLabel` (`src/lib/journey/lens-progress.ts`), the `/api/goals` auth+`withDbRetry` pattern, and `LIBRARY_TABS` (`src/lib/library/tabs.ts`).

**Branch:** `feat/decision-board` (already created off `origin/main`, with the spec committed). Implement here; reconcile at merge (library/page.tsx + dashboard/page.tsx see parallel churn).

---

## File structure

- `prisma/schema.prisma` (modify) — add `decisionBoard Json?` to `YouthProfile`.
- `prisma/migrations/20260608120000_add_decision_board/migration.sql` (create) — additive column.
- `src/lib/decision-board/types.ts` (create) — `DecisionBoardState`, `DecisionRow`, `DecisionBoardResult`.
- `src/lib/decision-board/build.ts` (create) — pure `buildDecisionBoard()`.
- `src/lib/decision-board/__tests__/build.test.ts` (create) — unit tests.
- `src/app/api/journey/decision-board/route.ts` (create) — GET/PUT.
- `src/lib/decision-board/__tests__/api-shape.test.ts` (create) — request/response validation test for the zod schema.
- `src/hooks/use-decision-board.ts` (create) — React Query read + persist mutation.
- `src/components/decision-board/decision-board.tsx` (create) — the board UI.
- `src/components/decision-board/decision-row.tsx` (create) — one row (collapsed + expanded).
- `src/lib/library/tabs.ts` (modify) — add `"decision"` tab, first; drop `"compared"`.
- `src/app/(dashboard)/library/page.tsx` (modify) — render `DecisionBoardTab`, remove `ComparedTab`.
- `src/components/dashboard/where-youre-leaning.tsx` (create) — dashboard teaser card.
- `src/app/(dashboard)/dashboard/page.tsx` (modify) — mount the teaser near "My Explored Journeys".

---

## Task 1: DB column + migration

**Files:**
- Modify: `prisma/schema.prisma` (the `model YouthProfile` block)
- Create: `prisma/migrations/20260608120000_add_decision_board/migration.sql`

- [ ] **Step 1: Add the column to the schema**

In `prisma/schema.prisma`, inside `model YouthProfile`, beside the other `Json?` fields (e.g. `primaryGoal Json?`), add:

```prisma
  // Decision Board state: { order: string[], ruledOut: string[] } of career ids.
  // order = the user's manual ranking (empty ⇒ use the auto rank); ruledOut =
  // careers relegated to "Out of the running".
  decisionBoard Json?
```

- [ ] **Step 2: Create the migration SQL**

```sql
-- Decision Board per-user state (manual order + relegated careers).
ALTER TABLE "YouthProfile" ADD COLUMN IF NOT EXISTS "decisionBoard" JSONB;
```

- [ ] **Step 3: Regenerate the Prisma client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client" with no errors.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"` against the changed schema's generated types.
Expected: no NEW errors introduced (pre-existing project errors unrelated).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20260608120000_add_decision_board
git commit -m "feat(db): add YouthProfile.decisionBoard json column"
```

> NOTE: The prod `migrate deploy` runs on deploy. This is an additive nullable column — safe. Flag to the owner like prior migrations.

---

## Task 2: Types + pure `buildDecisionBoard` (TDD)

**Files:**
- Create: `src/lib/decision-board/types.ts`
- Create: `src/lib/decision-board/build.ts`
- Test: `src/lib/decision-board/__tests__/build.test.ts`

- [ ] **Step 1: Define the types**

`src/lib/decision-board/types.ts`:

```typescript
import type { InterestLevel } from "@/lib/interest-level/types";

/** Persisted board state (YouthProfile.decisionBoard). */
export interface DecisionBoardState {
  /** Manual ranking by careerId. Empty ⇒ use the auto rank. */
  order: string[];
  /** Career ids relegated to "Out of the running". */
  ruledOut: string[];
}

/** A career that has been explored, as input to the board. */
export interface DecisionInput {
  careerId: string;
  title: string;
  emoji: string;
  interest: InterestLevel | null;
  /** 0 Discover · 1 Understand · 2 Clarity · 3 Complete — highest reached. */
  progress: number;
  /** ms epoch of the journey's last update; final tiebreak. */
  updatedAt: number;
}

export interface DecisionRow extends DecisionInput {
  /** 1-based rank in the standings (relegated rows get null). */
  rank: number | null;
  ruledOut: boolean;
}

export interface DecisionBoardResult {
  ranked: DecisionRow[];      // in standings order, rank 1..N
  ruledOut: DecisionRow[];    // relegated, rank null
  /** The current #1, or null when fewer than one ranked career. */
  leader: DecisionRow | null;
}

export const EMPTY_BOARD: DecisionBoardState = { order: [], ruledOut: [] };
```

- [ ] **Step 2: Write the failing tests**

`src/lib/decision-board/__tests__/build.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildDecisionBoard } from "../build";
import { EMPTY_BOARD } from "../types";
import type { DecisionInput } from "../types";

const mk = (p: Partial<DecisionInput> & { careerId: string }): DecisionInput => ({
  title: p.careerId, emoji: "🎯", interest: null, progress: 0, updatedAt: 0, ...p,
});

describe("buildDecisionBoard", () => {
  it("auto-ranks by interest desc, then progress, then recency", () => {
    const input = [
      mk({ careerId: "a", interest: 3, progress: 3, updatedAt: 1 }),
      mk({ careerId: "b", interest: 5, progress: 1, updatedAt: 1 }),
      mk({ careerId: "c", interest: 5, progress: 3, updatedAt: 1 }),
    ];
    const r = buildDecisionBoard(input, EMPTY_BOARD);
    expect(r.ranked.map((x) => x.careerId)).toEqual(["c", "b", "a"]);
    expect(r.ranked.map((x) => x.rank)).toEqual([1, 2, 3]);
    expect(r.leader?.careerId).toBe("c");
  });

  it("uses recency as the final tiebreak", () => {
    const input = [
      mk({ careerId: "old", interest: 4, progress: 2, updatedAt: 10 }),
      mk({ careerId: "new", interest: 4, progress: 2, updatedAt: 20 }),
    ];
    const r = buildDecisionBoard(input, EMPTY_BOARD);
    expect(r.ranked.map((x) => x.careerId)).toEqual(["new", "old"]);
  });

  it("honours manual order over the auto rank", () => {
    const input = [
      mk({ careerId: "a", interest: 5, progress: 3 }),
      mk({ careerId: "b", interest: 1, progress: 0 }),
    ];
    const r = buildDecisionBoard(input, { order: ["b", "a"], ruledOut: [] });
    expect(r.ranked.map((x) => x.careerId)).toEqual(["b", "a"]);
  });

  it("appends careers missing from manual order by auto rank", () => {
    const input = [
      mk({ careerId: "a", interest: 5 }),
      mk({ careerId: "b", interest: 4 }),
      mk({ careerId: "c", interest: 3 }),
    ];
    const r = buildDecisionBoard(input, { order: ["c"], ruledOut: [] });
    expect(r.ranked.map((x) => x.careerId)).toEqual(["c", "a", "b"]);
  });

  it("excludes ruled-out careers from the standings", () => {
    const input = [mk({ careerId: "a", interest: 5 }), mk({ careerId: "b", interest: 4 })];
    const r = buildDecisionBoard(input, { order: [], ruledOut: ["a"] });
    expect(r.ranked.map((x) => x.careerId)).toEqual(["b"]);
    expect(r.ranked[0].rank).toBe(1);
    expect(r.ruledOut.map((x) => x.careerId)).toEqual(["a"]);
    expect(r.ruledOut[0].rank).toBeNull();
    expect(r.leader?.careerId).toBe("b");
  });

  it("returns a null leader for an empty board", () => {
    expect(buildDecisionBoard([], EMPTY_BOARD).leader).toBeNull();
  });
});
```

- [ ] **Step 3: Run the tests, verify they fail**

Run: `npx vitest run src/lib/decision-board/__tests__/build.test.ts`
Expected: FAIL — `buildDecisionBoard` not found.

- [ ] **Step 4: Implement `buildDecisionBoard`**

`src/lib/decision-board/build.ts`:

```typescript
import type { DecisionInput, DecisionBoardState, DecisionRow, DecisionBoardResult } from "./types";

/** Auto comparison: interest desc, progress desc, recency desc. */
function autoCompare(a: DecisionInput, b: DecisionInput): number {
  const ai = a.interest ?? 0, bi = b.interest ?? 0;
  if (ai !== bi) return bi - ai;
  if (a.progress !== b.progress) return b.progress - a.progress;
  return b.updatedAt - a.updatedAt;
}

export function buildDecisionBoard(
  input: DecisionInput[],
  board: DecisionBoardState,
): DecisionBoardResult {
  const ruledOutSet = new Set(board.ruledOut);
  const byId = new Map(input.map((c) => [c.careerId, c]));

  // Standings = everything not relegated, ordered by manual order first
  // (in the saved sequence), then any remainder by auto rank.
  const standing = input.filter((c) => !ruledOutSet.has(c.careerId));
  const manual = board.order
    .map((id) => byId.get(id))
    .filter((c): c is DecisionInput => !!c && !ruledOutSet.has(c.careerId));
  const manualIds = new Set(manual.map((c) => c.careerId));
  const remainder = standing.filter((c) => !manualIds.has(c.careerId)).sort(autoCompare);
  const orderedStanding = [...manual, ...remainder];

  const ranked: DecisionRow[] = orderedStanding.map((c, i) => ({
    ...c, rank: i + 1, ruledOut: false,
  }));
  const ruledOut: DecisionRow[] = input
    .filter((c) => ruledOutSet.has(c.careerId))
    .sort(autoCompare)
    .map((c) => ({ ...c, rank: null, ruledOut: true }));

  return { ranked, ruledOut, leader: ranked[0] ?? null };
}
```

- [ ] **Step 5: Run the tests, verify they pass**

Run: `npx vitest run src/lib/decision-board/__tests__/build.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/decision-board/types.ts src/lib/decision-board/build.ts src/lib/decision-board/__tests__/build.test.ts
git commit -m "feat(decision-board): pure buildDecisionBoard ranking helper"
```

---

## Task 3: Persistence API (GET/PUT) (TDD on the schema)

**Files:**
- Create: `src/app/api/journey/decision-board/route.ts`
- Test: `src/lib/decision-board/__tests__/api-shape.test.ts`

- [ ] **Step 1: Write the failing schema test**

`src/lib/decision-board/__tests__/api-shape.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { decisionBoardSchema } from "@/app/api/journey/decision-board/route";

describe("decisionBoardSchema", () => {
  it("accepts a valid board", () => {
    expect(decisionBoardSchema.parse({ order: ["a", "b"], ruledOut: ["c"] }))
      .toEqual({ order: ["a", "b"], ruledOut: ["c"] });
  });
  it("defaults missing arrays to empty", () => {
    expect(decisionBoardSchema.parse({})).toEqual({ order: [], ruledOut: [] });
  });
  it("rejects non-string ids", () => {
    expect(() => decisionBoardSchema.parse({ order: [1] })).toThrow();
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/lib/decision-board/__tests__/api-shape.test.ts`
Expected: FAIL — module/route not found.

- [ ] **Step 3: Implement the route** (mirror `/api/goals` auth + `withDbRetry`)

`src/app/api/journey/decision-board/route.ts`:

```typescript
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { withDbRetry } from "@/lib/db-retry";
import { EMPTY_BOARD, type DecisionBoardState } from "@/lib/decision-board/types";

export const decisionBoardSchema = z.object({
  order: z.array(z.string().max(120)).max(200).optional().default([]),
  ruledOut: z.array(z.string().max(120)).max(200).optional().default([]),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await prisma.youthProfile.findUnique({
    where: { userId: session.user.id },
    select: { decisionBoard: true },
  });
  const board = (profile?.decisionBoard as DecisionBoardState | null) ?? EMPTY_BOARD;
  return NextResponse.json({ board });
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const board = decisionBoardSchema.parse(await request.json());
    await withDbRetry(() =>
      prisma.youthProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          displayName: session.user.name || "User",
          decisionBoard: board as unknown as Prisma.InputJsonValue,
        },
        update: { decisionBoard: board as unknown as Prisma.InputJsonValue },
      }),
    );
    return NextResponse.json({ success: true, board });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid board", details: error.errors }, { status: 400 });
    console.error("Error saving decision board:", error);
    return NextResponse.json({ error: "Failed to save board" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/lib/decision-board/__tests__/api-shape.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/journey/decision-board/route.ts src/lib/decision-board/__tests__/api-shape.test.ts
git commit -m "feat(decision-board): GET/PUT /api/journey/decision-board"
```

---

## Task 4: `useDecisionBoard` hook

**Files:**
- Create: `src/hooks/use-decision-board.ts`

- [ ] **Step 1: Implement the hook** (React Query, mirrors `explored-goals`/mutation patterns in `dashboard/page.tsx`)

`src/hooks/use-decision-board.ts`:

```typescript
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EMPTY_BOARD, type DecisionBoardState } from "@/lib/decision-board/types";

const KEY = ["decision-board"];

export function useDecisionBoard() {
  const qc = useQueryClient();
  const query = useQuery<DecisionBoardState>({
    queryKey: KEY,
    queryFn: async () => {
      const res = await fetch("/api/journey/decision-board");
      if (!res.ok) return EMPTY_BOARD;
      const data = await res.json();
      return (data.board as DecisionBoardState) ?? EMPTY_BOARD;
    },
    staleTime: 60_000,
  });

  const save = useMutation({
    mutationFn: async (board: DecisionBoardState) => {
      qc.setQueryData(KEY, board); // optimistic
      const res = await fetch("/api/journey/decision-board", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(board),
      });
      if (!res.ok) throw new Error("Failed to save board");
      return board;
    },
    onError: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { board: query.data ?? EMPTY_BOARD, isLoading: query.isLoading, save: save.mutate };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "use-decision-board"` → Expected: empty (clean).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-decision-board.ts
git commit -m "feat(decision-board): useDecisionBoard read+persist hook"
```

---

## Task 5: `DecisionRow` component (collapsed + expanded)

**Files:**
- Create: `src/components/decision-board/decision-row.tsx`

- [ ] **Step 1: Implement the row**

A presentational row taking `{ row: DecisionRow, careerData, reflectionsCount, onUp, onDown, onRelegate, onRestore, expanded, onToggle }`. Collapsed shows: rank medal/number, emoji + title, `InterestLevelStars` (reuse `@/components/interest-level/interest-level-rating`), stage badge (reuse `journeyStageLabel`), salary range (`careerData.avgSalary`), 📝 when `reflectionsCount > 0`, and up/down arrow buttons + a drag handle (`⠿`) + a relegate (`×`) / restore (`↩`) control. Expanded reveals the career's "Reality" one-liner (`careerData.realityCheck` if present), study/route summary, and the user's reflections for that career. Match existing card styling (`rounded-card border border-border/60 bg-card/40`, `text-xs`).

```tsx
"use client";
import { ChevronUp, ChevronDown, GripVertical, X, Undo2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { InterestLevelStars } from "@/components/interest-level/interest-level-rating";
import type { DecisionRow } from "@/lib/decision-board/types";
import type { getAllCareers } from "@/lib/career-pathways";

type Career = ReturnType<typeof getAllCareers>[number];
const MEDAL = ["🥇", "🥈", "🥉"];

export function DecisionRowView(props: {
  row: DecisionRow;
  career: Career | undefined;
  reflectionsCount: number;
  stageLabel: string;
  expanded: boolean;
  onToggle: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onRelegate?: () => void;
  onRestore?: () => void;
}) {
  const { row, career, reflectionsCount, stageLabel } = props;
  return (
    <div className={cn("rounded-card border border-border/60 bg-card/40", row.ruledOut && "opacity-50")}>
      <div className="flex items-center gap-2 px-3 py-2">
        {row.rank !== null && (
          <span className="w-6 shrink-0 text-center text-sm font-bold tabular-nums">
            {row.rank <= 3 ? MEDAL[row.rank - 1] : row.rank}
          </span>
        )}
        <span className="text-sm shrink-0">{row.emoji}</span>
        <button onClick={props.onToggle} className="min-w-0 flex-1 text-left">
          <span className="text-xs font-medium text-foreground/90 truncate">{row.title}</span>
        </button>
        {row.interest != null && <InterestLevelStars value={row.interest} />}
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60 hidden sm:inline">{stageLabel}</span>
        {career?.avgSalary && <span className="text-[10px] text-muted-foreground/50 hidden md:inline">{career.avgSalary}</span>}
        {reflectionsCount > 0 && <FileText className="h-3 w-3 text-muted-foreground/40" />}
        {!row.ruledOut && (
          <span className="flex items-center gap-0.5 shrink-0">
            <button onClick={props.onUp} aria-label="Move up" className="p-0.5 text-muted-foreground/40 hover:text-foreground"><ChevronUp className="h-3.5 w-3.5" /></button>
            <button onClick={props.onDown} aria-label="Move down" className="p-0.5 text-muted-foreground/40 hover:text-foreground"><ChevronDown className="h-3.5 w-3.5" /></button>
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/25 cursor-grab" />
            <button onClick={props.onRelegate} aria-label="Out of the running" className="p-0.5 text-muted-foreground/30 hover:text-destructive"><X className="h-3 w-3" /></button>
          </span>
        )}
        {row.ruledOut && (
          <button onClick={props.onRestore} aria-label="Back into the running" className="p-0.5 text-muted-foreground/40 hover:text-foreground"><Undo2 className="h-3.5 w-3.5" /></button>
        )}
      </div>
      {props.expanded && (
        <div className="border-t border-border/30 px-3 py-2 space-y-1.5 text-[11px] text-muted-foreground/70">
          {career?.realityCheck && <p><span className="font-medium text-foreground/70">The reality: </span>{career.realityCheck}</p>}
          {/* study/route + reflections rendered by the parent via props if available */}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck** — `npx tsc --noEmit 2>&1 | grep "decision-row"` → empty.

- [ ] **Step 3: Commit**

```bash
git add src/components/decision-board/decision-row.tsx
git commit -m "feat(decision-board): DecisionRow presentational component"
```

> NOTE: confirm `Career.avgSalary` / `realityCheck` field names against `getAllCareers()` output during implementation; adjust the property reads if the catalogue uses different names.

---

## Task 6: `DecisionBoardTab` component (assembly + interactions)

**Files:**
- Create: `src/components/decision-board/decision-board.tsx`

- [ ] **Step 1: Implement the board**

Assembles inputs and wires interactions:

1. Source explored journeys the same way `ExploringTab` does (fetch `/api/journey/goal-data/list`, map to `ExploringEntry` via the existing logic), then map each to a `DecisionInput` (`progress` from `journeyCompletedSteps`/`journeyStageLabel`; `interest` from `useAllInterestLevels()`; `updatedAt` from the goal's `updatedAt`).
2. `const { board, save } = useDecisionBoard();`
3. `const { ranked, ruledOut, leader } = buildDecisionBoard(inputs, board);`
4. Header "lean" line: when `leader`, render *"You've explored N careers — you're leaning {leader.emoji} {leader.title}"* + a short reason (`leader.interest === 5 ? "highest interest" : …`, plus "journey complete" when `leader.progress === 3`).
5. Reorder helpers compute a new `order` array from the current `ranked` ids and call `save({ ...board, order })`:
   - `moveUp(i)` / `moveDown(i)`: swap `ranked[i]` with neighbour, persist the resulting id order.
   - drag: use the same swap on drop (HTML5 draggable; keep minimal — arrows are the primary control).
6. `relegate(id)`: `save({ order: board.order.filter(x=>x!==id), ruledOut: [...board.ruledOut, id] })`.
7. `restore(id)`: `save({ ...board, ruledOut: board.ruledOut.filter(x=>x!==id) })`.
8. `resetToSuggested()`: `save({ order: [], ruledOut: board.ruledOut })`.
9. Render the lean header, the ranked `DecisionRowView` list, an "Out of the running" divider + relegated rows when `ruledOut.length > 0`, and a subtle "Reset to suggested" link when `board.order.length > 0`.
10. Empty state (fewer than 2 explored careers): a calm "Explore a couple of careers and they'll start stacking up here." message.

Key reorder helper (persist ids in standings order after a swap):

```tsx
function persistOrder(rows: DecisionRow[]) {
  save({ order: rows.map((r) => r.careerId), ruledOut: board.ruledOut });
}
function move(i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= ranked.length) return;
  const next = [...ranked];
  [next[i], next[j]] = [next[j], next[i]];
  persistOrder(next);
}
```

- [ ] **Step 2: Typecheck** — `npx tsc --noEmit 2>&1 | grep "decision-board.tsx"` → empty.

- [ ] **Step 3: Commit**

```bash
git add src/components/decision-board/decision-board.tsx
git commit -m "feat(decision-board): DecisionBoardTab assembly + reorder/relegate"
```

---

## Task 7: Wire as the first My Library tab (replace "Compared")

**Files:**
- Modify: `src/lib/library/tabs.ts`
- Modify: `src/lib/library/__tests__/tabs.test.ts`
- Modify: `src/app/(dashboard)/library/page.tsx`

- [ ] **Step 1: Update the tab list + type**

In `src/lib/library/tabs.ts`: change `LibraryTab` to `"decision" | "exploring" | "saved" | "reflections"`, set `LIBRARY_TABS` to `[{key:"decision",label:"Decision Board"},{key:"exploring",label:"Exploring"},{key:"saved",label:"Saved careers"},{key:"reflections",label:"Reflections"}]`, update the `KNOWN` set, and change `resolveLibraryTab`'s default to `"decision"`.

- [ ] **Step 2: Update the tabs unit test**

In `src/lib/library/__tests__/tabs.test.ts`, update any assertion that hard-codes the old keys/count to the new four (`decision` first, no `compared`). Run: `npx vitest run src/lib/library/__tests__/tabs.test.ts` → Expected: PASS.

- [ ] **Step 3: Render the board, remove ComparedTab**

In `src/app/(dashboard)/library/page.tsx`: import `DecisionBoardTab` (default-render it for `active === "decision"`), remove the `ComparedTab` branch and the `ComparedTab` function + the now-unused `CompareModal`/`floating-compare-cta` imports if they become orphaned (verify with grep; leave `CompareModal` import if still used elsewhere).

- [ ] **Step 4: Typecheck + tabs test**

Run: `npx tsc --noEmit 2>&1 | grep -E "library/page.tsx|library/tabs.ts"` → empty. Run the tabs test again → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/library/tabs.ts src/lib/library/__tests__/tabs.test.ts "src/app/(dashboard)/library/page.tsx"
git commit -m "feat(library): Decision Board as the first tab (replaces Compared)"
```

---

## Task 8: Dashboard "Where you're leaning" teaser

**Files:**
- Create: `src/components/dashboard/where-youre-leaning.tsx`
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Implement the teaser card**

`where-youre-leaning.tsx`: a client component that reuses the same explored-journey + interest sourcing, `useDecisionBoard()`, and `buildDecisionBoard()` to compute `leader` + ranked count. Renders a compact card (matching the dashboard card style) headed "WHERE YOU'RE LEANING" with a "See the board →" link to `/library?tab=decision`, the leader's emoji + title + `InterestLevelStars` + stage, and the line *"You've explored N careers — see how they stack up."* When fewer than 2 explored careers, render the calm "explore a couple and they'll stack up here" empty state.

- [ ] **Step 2: Mount it on the dashboard**

In `src/app/(dashboard)/dashboard/page.tsx`, add `<WhereYoureLeaning />` near the "My Explored Journeys" section (in the same grid region; follow the existing `DashboardSection`/card placement). Keep it gated to signed-in users like the other personalised cards.

- [ ] **Step 3: Typecheck** — `npx tsc --noEmit 2>&1 | grep -E "where-youre-leaning|dashboard/page.tsx"` → empty.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/where-youre-leaning.tsx "src/app/(dashboard)/dashboard/page.tsx"
git commit -m "feat(dashboard): 'Where you're leaning' Decision Board teaser"
```

---

## Task 9: Full verification

- [ ] **Step 1: Run the whole decision-board + library test set**

Run: `npx vitest run src/lib/decision-board src/lib/library/__tests__/tabs.test.ts`
Expected: all PASS.

- [ ] **Step 2: Typecheck the touched files**

Run: `npx tsc --noEmit 2>&1 | grep -E "decision-board|where-youre-leaning|library/(page|tabs)|api/journey/decision-board"`
Expected: empty.

- [ ] **Step 3: Manual smoke (the `verify` skill or `npm run dev`)**

Open `/library` → Decision Board is the first tab, lists explored careers ranked by interest; up/down arrows reorder and persist across reload; "Out of the running" relegates and restores; "Reset to suggested" restores auto order. Dashboard shows "Where you're leaning" with the current #1.

- [ ] **Step 4: Open the PR**

```bash
git push -u origin feat/decision-board
gh pr create --base main --title "feat: Decision Board (ranked league table of explored careers)" --body "Implements docs/superpowers/specs/2026-06-08-decision-board-design.md"
```

> The additive `decisionBoard` migration runs on prod `migrate deploy`. Flag to the owner before merge.

---

## Notes for the implementer

- **Verify catalogue field names** (`avgSalary`, `realityCheck`, `emoji`, education/route field) against `getAllCareers()` output; the row code reads them by name.
- **Reuse, don't reinvent**: `ExploringTab` already maps goal-data → `ExploringEntry` (interest, completed, emoji, title). Lift that mapping into a shared helper if cleaner, or import it.
- **Parallel churn**: rebase onto latest `origin/main` before the PR; `library/page.tsx` and `dashboard/page.tsx` are actively edited.
- **Drag is secondary**: arrows are the primary, accessible reorder control; keep drag minimal (HTML5 draggable swap) — do not pull in a drag library for v1.

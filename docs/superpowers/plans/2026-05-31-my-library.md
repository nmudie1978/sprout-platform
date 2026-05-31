# My Library + *Yours* Nav Reshuffle — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new *My Library* page (tabbed: Saved careers · Compared · Reflections), move AI Advisor into the *Yours* sidebar group, add a *My Library* nav item, and wire dashboard "See all →" links — without disturbing the golden dashboard layout.

**Architecture:** A new client route `/library` reads two localStorage collections (`useCuriositySaves`, `getSavedComparisons`) and one server endpoint (`GET /api/journey/reflections`), behind a `mounted` guard. Tab state comes from `?tab=`. Pure helpers (`resolveLibraryTab`, `filterAnsweredReflections`) are unit-tested. Nav config edits in `sidebar-nav.tsx` + `mobile-bottom-nav.tsx`. Dashboard gets two "See all →" links and a small Reflections preview; the pre-existing dashboard section titled "My Library" is renamed "Saved Resources" to free the name.

**Tech Stack:** Next.js 14 App Router (client component), TypeScript strict, Tailwind + shadcn, TanStack Query, vitest + @testing-library/react (jsdom), lucide-react icons.

**Spec:** `docs/superpowers/specs/2026-05-31-my-library-design.md`

---

## File structure

- **Create** `src/lib/library/tabs.ts` — pure helpers: `LIBRARY_TABS`, `LibraryTab` type, `resolveLibraryTab`, `filterAnsweredReflections`.
- **Create** `src/lib/library/__tests__/tabs.test.ts` — unit tests for the helpers.
- **Create** `src/app/(dashboard)/library/page.tsx` — the tabbed client page.
- **Modify** `src/components/sidebar-nav.tsx` — move AI Advisor into *Yours*; add *My Library*.
- **Modify** `src/components/mobile-bottom-nav.tsx` — same reshuffle in the "more menu" groups.
- **Modify** `src/components/__tests__/mobile-bottom-nav.test.tsx` — assert new membership.
- **Modify** `src/app/(dashboard)/dashboard/page.tsx` — rename existing "My Library" section → "Saved Resources"; add "See all →" to Saved Careers section; add a Reflections preview section with "See all →".

---

## Task 1: Library tab helpers (pure, TDD)

**Files:**
- Create: `src/lib/library/tabs.ts`
- Test: `src/lib/library/__tests__/tabs.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/library/__tests__/tabs.test.ts
import { describe, it, expect } from "vitest";
import { resolveLibraryTab, filterAnsweredReflections, LIBRARY_TABS } from "../tabs";

describe("resolveLibraryTab", () => {
  it("defaults to 'saved' when param is null", () => {
    expect(resolveLibraryTab(null)).toBe("saved");
  });
  it("defaults to 'saved' for an unknown value", () => {
    expect(resolveLibraryTab("bogus")).toBe("saved");
  });
  it("accepts each known tab", () => {
    for (const tab of LIBRARY_TABS) {
      expect(resolveLibraryTab(tab.key)).toBe(tab.key);
    }
  });
  it("is case-insensitive", () => {
    expect(resolveLibraryTab("Reflections")).toBe("reflections");
  });
});

describe("filterAnsweredReflections", () => {
  const base = { id: "1", contextType: "CAREER_DISCOVERY", contextId: null, prompt: "p", createdAt: "2026-01-01" };
  it("keeps answered, non-skipped reflections", () => {
    const r = [{ ...base, response: "yes", skipped: false }];
    expect(filterAnsweredReflections(r)).toHaveLength(1);
  });
  it("drops skipped reflections even if they have a response", () => {
    const r = [{ ...base, response: "yes", skipped: true }];
    expect(filterAnsweredReflections(r)).toHaveLength(0);
  });
  it("drops reflections with null/empty response", () => {
    const r = [
      { ...base, response: null, skipped: false },
      { ...base, response: "   ", skipped: false },
    ];
    expect(filterAnsweredReflections(r)).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/library/__tests__/tabs.test.ts`
Expected: FAIL — `Failed to resolve import "../tabs"`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/library/tabs.ts
import type { ReflectionData } from "@/lib/journey/reflections-service";

export interface LibraryTabDef {
  key: LibraryTab;
  label: string;
}

export type LibraryTab = "saved" | "compared" | "reflections";

export const LIBRARY_TABS: readonly LibraryTabDef[] = [
  { key: "saved", label: "Saved careers" },
  { key: "compared", label: "Compared" },
  { key: "reflections", label: "Reflections" },
] as const;

const KNOWN = new Set<LibraryTab>(["saved", "compared", "reflections"]);

export function resolveLibraryTab(param: string | null | undefined): LibraryTab {
  const v = (param ?? "").toLowerCase() as LibraryTab;
  return KNOWN.has(v) ? v : "saved";
}

export function filterAnsweredReflections(reflections: ReflectionData[]): ReflectionData[] {
  return reflections.filter((r) => !r.skipped && !!r.response && r.response.trim().length > 0);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/library/__tests__/tabs.test.ts`
Expected: PASS (4 + 3 assertions).

- [ ] **Step 5: Commit**

```bash
git add src/lib/library/tabs.ts src/lib/library/__tests__/tabs.test.ts
git commit -m "feat(library): pure tab helpers (resolveLibraryTab, filterAnsweredReflections)"
```

---

## Task 2: The `/library` page

**Files:**
- Create: `src/app/(dashboard)/library/page.tsx`

Note: this is a presentational client page; its pure logic is already covered by Task 1. No new render test (the repo has no harness for next-auth/searchParams client pages, and the localStorage hooks aren't easily mountable). Verify manually + typecheck/lint.

- [ ] **Step 1: Create the page**

```tsx
// src/app/(dashboard)/library/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Heart, GitCompare, NotebookPen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCuriositySaves } from "@/hooks/use-curiosity-saves";
import { getSavedComparisons, type SavedComparison } from "@/components/career-radar/saved-comparisons-tray";
import { getAllCareers, type Career } from "@/lib/career-pathways";
import { resolveLibraryTab, filterAnsweredReflections, LIBRARY_TABS, type LibraryTab } from "@/lib/library/tabs";
import type { ReflectionData } from "@/lib/journey/reflections-service";

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = resolveLibraryTab(searchParams.get("tab"));
  const setActive = (tab: LibraryTab) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", tab);
    router.replace(`/library?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-5">
        <h1 className="text-xl font-bold tracking-tight">My Library</h1>
        <p className="text-sm text-muted-foreground">Everything you've saved and written, in one calm place.</p>
      </header>

      <div className="flex gap-1.5 mb-5 border-b border-border/60">
        {LIBRARY_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={cn(
              "px-3 py-2 text-sm rounded-t-md transition-colors -mb-px border-b-2",
              active === t.key
                ? "border-teal-400 text-teal-600 dark:text-teal-300 font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!mounted ? (
        <p className="text-sm text-muted-foreground/60">Loading…</p>
      ) : active === "saved" ? (
        <SavedCareersTab />
      ) : active === "compared" ? (
        <ComparedTab />
      ) : (
        <ReflectionsTab />
      )}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground/60 py-8 text-center">{children}</p>;
}

function SavedCareersTab() {
  const { curiosities, removeCuriosity } = useCuriositySaves();
  if (curiosities.length === 0) {
    return <EmptyState>Nothing saved yet — explore careers and tap the heart to save them here.</EmptyState>;
  }
  const open = (careerId: string) => {
    const career: Career | undefined = getAllCareers().find((c) => c.id === careerId);
    if (career) window.dispatchEvent(new CustomEvent("open-career-detail", { detail: career }));
  };
  return (
    <ul className="divide-y divide-border/60 rounded-lg border border-border/60 overflow-hidden bg-muted/10">
      {curiosities.map((c) => (
        <li key={c.careerId} className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors">
          <button type="button" onClick={() => open(c.careerId)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
            <span className="shrink-0">{c.careerEmoji}</span>
            <span className="truncate flex-1">{c.careerTitle}</span>
          </button>
          <button
            type="button"
            onClick={() => removeCuriosity(c.careerId)}
            className="p-1 rounded text-muted-foreground/30 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            aria-label={`Remove ${c.careerTitle}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function ComparedTab() {
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  useEffect(() => setComparisons(getSavedComparisons()), []);
  if (comparisons.length === 0) {
    return <EmptyState>No comparisons yet — compare careers on My Career Radar and save them to revisit here.</EmptyState>;
  }
  return (
    <ul className="space-y-2">
      {comparisons.map((cmp) => (
        <li key={cmp.id} className="rounded-lg border border-border/60 bg-muted/10 px-3 py-2.5 text-sm">
          {cmp.careers.map((c) => `${c.emoji} ${c.title}`).join("  vs  ")}
        </li>
      ))}
    </ul>
  );
}

function ReflectionsTab() {
  const { data, isLoading } = useQuery<{ reflections: ReflectionData[] }>({
    queryKey: ["library-reflections"],
    queryFn: async () => {
      const res = await fetch("/api/journey/reflections?includeSkipped=false&limit=100");
      if (!res.ok) return { reflections: [] };
      return res.json();
    },
    staleTime: 60 * 1000,
  });
  if (isLoading) return <EmptyState>Loading…</EmptyState>;
  const answered = filterAnsweredReflections(data?.reflections ?? []);
  if (answered.length === 0) {
    return <EmptyState>No reflections yet — they appear here as you move through My Journey.</EmptyState>;
  }
  return (
    <ul className="space-y-3">
      {answered.map((r) => (
        <li key={r.id} className="rounded-lg border border-border/60 bg-muted/10 px-4 py-3">
          <p className="text-xs text-muted-foreground/70 mb-1">{r.prompt}</p>
          <p className="text-sm">{r.response}</p>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Confirm `getSavedComparisons` and `SavedComparison` are exported**

Run: `grep -n "export function getSavedComparisons\|export interface SavedComparison\|export type SavedComparison" src/components/career-radar/saved-comparisons-tray.tsx`
Expected: `getSavedComparisons` is exported (confirmed). If `SavedComparison` is **not** exported, add `export` to its declaration in that file in this step (it's a type only — safe), or define a minimal local `type SavedComparison = { id: string; careers: { id: string; title: string; emoji: string }[] }` in the page and drop the import.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (no errors in `library/page.tsx`).

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/library/page.tsx src/components/career-radar/saved-comparisons-tray.tsx
git commit -m "feat(library): tabbed My Library page (saved careers, compared, reflections)"
```

---

## Task 3: Sidebar nav reshuffle

**Files:**
- Modify: `src/components/sidebar-nav.tsx`

- [ ] **Step 1: Add `Library` to the lucide import**

In the import block from `"lucide-react"` (around line 27-55), add `Library,` alongside the existing icons.

- [ ] **Step 2: Add the My Library nav item to the *Yours* section**

In the `YOURS` `<NavSection>` (the one with `accent`), after the `My Career Radar` `<NavItem>` (currently `/careers/radar`), insert:

```tsx
<NavItem href="/career-advisor" icon={Bot} label="AI Advisor" active={isActive("/career-advisor")} collapsed={collapsed} personal tooltip="Ask questions about careers, education and next steps — and meet a possible future self with Career Twin. Honest, calm, tailored to you." />
<NavItem href="/library" icon={Library} label="My Library" active={isActive("/library")} collapsed={collapsed} personal tooltip="Everything you've saved and written — saved careers, comparisons, and your reflections, in one place." />
```

- [ ] **Step 3: Remove AI Advisor from the *Explore* section**

In the `Explore` `<NavSection>`, delete the existing line:

```tsx
<NavItem href="/career-advisor" icon={Bot} label="AI Advisor" active={isActive("/career-advisor")} collapsed={collapsed} tooltip="Ask questions about careers, education and next steps. Honest, calm, and tailored to you." />
```

(Explore now contains only Explore Careers, Youth Events, Industry Insights.)

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npx next lint --file src/components/sidebar-nav.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sidebar-nav.tsx
git commit -m "feat(nav): move AI Advisor into Yours, add My Library to sidebar"
```

---

## Task 4: Mobile bottom-nav reshuffle + test

**Files:**
- Modify: `src/components/mobile-bottom-nav.tsx`
- Modify: `src/components/__tests__/mobile-bottom-nav.test.tsx`

- [ ] **Step 1: Write/extend the failing test**

Open `src/components/__tests__/mobile-bottom-nav.test.tsx`. Add (matching the file's existing import of the nav config — use the same exported symbol the existing tests use; if the config is not currently exported, export the YOUTH "more menu" groups array from `mobile-bottom-nav.tsx` as `youthMoreMenuGroups` and import it here):

```ts
it("lists My Library in the youth more-menu", () => {
  const allItems = youthMoreMenuGroups.flatMap((g) => g.items);
  expect(allItems.some((i) => i.href === "/library")).toBe(true);
});

it("groups AI Advisor with the personal surfaces, not Explore", () => {
  const personalGroup = youthMoreMenuGroups.find((g) =>
    g.items.some((i) => i.href === "/my-journey")
  );
  expect(personalGroup?.items.some((i) => i.href === "/career-advisor")).toBe(true);
  const exploreGroup = youthMoreMenuGroups.find((g) =>
    g.items.some((i) => i.href === "/careers")
  );
  expect(exploreGroup?.items.some((i) => i.href === "/career-advisor")).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/__tests__/mobile-bottom-nav.test.tsx`
Expected: FAIL — either the import is missing (export the group) or the assertions fail (AI Advisor still under Explore, no `/library`).

- [ ] **Step 3: Make the changes in `mobile-bottom-nav.tsx`**

1. If not already exported, change the YOUTH more-menu groups declaration to a named export `export const youthMoreMenuGroups = [ ... ]` (keep existing usage working).
2. In the personal group (the one containing `/my-journey` and `/careers/radar`), add after the radar item:
   ```ts
   { href: "/career-advisor", label: "AI Advisor", icon: Bot },
   { href: "/library", label: "My Library", icon: Library },
   ```
3. Remove the `{ href: "/career-advisor", label: "AI Advisor", icon: Bot }` entry from the Explore group (around line 122).
4. Add `Library` to the `lucide-react` import in this file.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/__tests__/mobile-bottom-nav.test.tsx`
Expected: PASS (all existing + 2 new).

- [ ] **Step 5: Commit**

```bash
git add src/components/mobile-bottom-nav.tsx src/components/__tests__/mobile-bottom-nav.test.tsx
git commit -m "feat(nav): mobile bottom-nav — AI Advisor in Yours, add My Library"
```

---

## Task 5: Dashboard wiring (minimal, golden-safe)

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Rename the pre-existing "My Library" section to "Saved Resources"**

At `src/app/(dashboard)/dashboard/page.tsx:1357`, change `title="My Library"` to `title="Saved Resources"`. (This is the `SavedItem` articles/videos section — its tooltip at line 1360 already says "Articles, videos, and resources you've saved"; leave the tooltip.) This frees the "My Library" name for the new page and removes user confusion.

- [ ] **Step 2: Add "See all →" to the Saved Careers section**

On the `DashboardSection` at line 1374 (icon `Heart`, the `useCuriositySaves` one), add an `action` prop (the component already supports `action?: React.ReactNode`):

```tsx
action={
  <Link href="/library?tab=saved" className="text-[10px] text-teal-500/70 hover:text-teal-500 transition-colors">
    See all →
  </Link>
}
```

Ensure `Link` is imported (it is used elsewhere in the file — confirm `import Link from "next/link"` exists; if not, add it).

- [ ] **Step 3: Add a compact Reflections preview section**

Immediately after the Saved Careers `DashboardSection` closes (after line 1454, still inside the same grid `div` or as a sibling block matching the surrounding layout — match the existing two-column grid pattern), add a new section. Fetch reflections with a query and show the latest 1–2 answered ones:

```tsx
{/* ── Reflections preview ─────────────────────── */}
<DashboardSection
  title="Reflections"
  icon={NotebookPen}
  iconColor="text-violet-500"
  tooltip="Short notes you've written as you move through My Journey."
  className="mb-0"
  fixedHeight="h-[180px] overflow-y-auto"
  action={
    <Link href="/library?tab=reflections" className="text-[10px] text-teal-500/70 hover:text-teal-500 transition-colors">
      See all →
    </Link>
  }
>
  {recentReflections.length > 0 ? (
    <ul className="space-y-2">
      {recentReflections.slice(0, 2).map((r) => (
        <li key={r.id} className="rounded-lg border border-border/60 bg-muted/10 px-2.5 py-2">
          <p className="text-[10px] text-muted-foreground/60 mb-0.5 line-clamp-1">{r.prompt}</p>
          <p className="text-[11px] text-muted-foreground/80 line-clamp-2">{r.response}</p>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-xs text-muted-foreground/50">Your reflections will appear here as you move through My Journey.</p>
  )}
</DashboardSection>
```

Add the supporting query near the other dashboard `useQuery` calls (after the `dashboardStats` query, ~line 585), plus the `filterAnsweredReflections` import and `NotebookPen` lucide import:

```tsx
import { filterAnsweredReflections } from "@/lib/library/tabs";
import type { ReflectionData } from "@/lib/journey/reflections-service";
// ...add NotebookPen to the existing lucide-react import

const { data: reflectionsData } = useQuery<{ reflections: ReflectionData[] }>({
  queryKey: ["dashboard-reflections"],
  queryFn: async () => {
    const res = await fetch("/api/journey/reflections?includeSkipped=false&limit=20");
    if (!res.ok) return { reflections: [] };
    return res.json();
  },
  enabled: session?.user.role === "YOUTH",
  staleTime: 60 * 1000,
});
const recentReflections = filterAnsweredReflections(reflectionsData?.reflections ?? []);
```

Note on layout: the Saved Careers section sits in a grid that is two-column only when `SMALL_JOBS_ENABLED` (else single-column). Since Small Jobs is disabled, place the Reflections section so it reads as the next calm row (single column), matching the existing `mb-4` spacing. Verify visually against the golden layout in Step 5.

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npx next lint --file "src/app/(dashboard)/dashboard/page.tsx"`
Expected: PASS.

- [ ] **Step 5: Visual check against golden layout**

Run the app (`npm run dev`), open `/dashboard` as a YOUTH user. Confirm: the resources section now reads "Saved Resources"; Saved Careers shows a "See all →" linking to `/library?tab=saved`; a quiet Reflections section appears with "See all →"; nothing else in the golden layout shifted. Compare against the `dashboard-v1-golden` tag if in doubt.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(dashboard)/dashboard/page.tsx"
git commit -m "feat(dashboard): See-all links to My Library + reflections preview; rename resources section"
```

---

## Task 6: Full verification

- [ ] **Step 1: Run the whole suite**

Run: `npm run test:run`
Expected: all pass (was 567 passing + new library/nav tests).

- [ ] **Step 2: Typecheck + lint the whole project**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 3: Final commit if anything outstanding, then open PR (do NOT merge).**

---

## Notes / decisions for reviewer

1. **"My Library" naming collision resolved by renaming** the existing dashboard `SavedItem` (articles/videos) section to **"Saved Resources"**. The new nav page owns "My Library". If you'd prefer, Resources could later become a 4th tab on the page (data + `LibraryCard` already exist) and the renamed section's "See all" would point to `/library?tab=resources` — deferred.
2. **Saved + Compared are localStorage/device-local** (`useCuriositySaves`, `getSavedComparisons`); only Reflections is server-backed. No new API routes or migrations.
3. **i18n:** v1 page strings are plain English; nb-NO translation is a follow-up (sidebar/mobile nav labels are already literal strings in this codebase, so no namespace was required for the nav changes).
4. **No merge to main** — leave on `feat/my-library` + PR for user review.

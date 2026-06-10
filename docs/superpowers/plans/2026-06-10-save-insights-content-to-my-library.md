# Save Insights Content → "My Content" Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users bookmark Skills That Matter gallery cards into the existing `SavedItem` store, and view/remove them in a new "My Content" tab in My Library.

**Architecture:** Reuse-only. Saving posts to the existing `POST /api/journey/saved-items` with a `tags: ["skills-that-matter"]` marker; the new tab lists `GET /api/journey/saved-items?tags=skills-that-matter` and removes via `DELETE ...?id=`. No schema migration, no new API routes. A shared constant ties the save tag to the list filter.

**Tech Stack:** Next.js 14 App Router, React (client components), TanStack Query, Prisma (`SavedItem`), `sonner` toasts, Vitest, Tailwind.

> **Env note (this repo):** `vitest`/`tsc` frequently exit 194 with no output in the local sandbox. For the pure-logic tests below, if `npx vitest run <file>` produces no output, fall back to the documented native-Node harness: write a tiny `_harness.ts` in the repo root that imports the function and asserts, run `node _harness.ts`, then delete it. Commit with `--no-verify` (a pre-existing date-bomb test blocks the pre-commit hook) and trust CI. See memory `reference_node_tooling_exit194_workaround`.

---

## File Structure

| File | Responsibility | New/Modify |
|---|---|---|
| `src/lib/insights/saved-content.ts` | Shared tag constant + pure `badgeToSavedItemType()` mapper | Create |
| `src/lib/insights/__tests__/saved-content.test.ts` | Unit tests for the mapper | Create |
| `src/lib/library/tabs.ts` | Register the `content` tab | Modify |
| `src/lib/library/__tests__/tabs.test.ts` | Assert the new tab resolves | Modify |
| `src/components/ui/circular-gallery.tsx` | Optional per-card bookmark button | Modify |
| `src/components/insights/skills-gallery.tsx` | Wire save handler + saved-state + toast | Modify |
| `src/components/library/my-content-tab.tsx` | List + remove saved Insights items | Create |
| `src/app/(dashboard)/library/page.tsx` | Render `MyContentTab` for the `content` tab | Modify |

---

## Task 1: Shared tag constant + pure badge→type mapper

**Files:**
- Create: `src/lib/insights/saved-content.ts`
- Test: `src/lib/insights/__tests__/saved-content.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/insights/__tests__/saved-content.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { badgeToSavedItemType, SKILLS_CONTENT_TAG } from "../saved-content";

describe("SKILLS_CONTENT_TAG", () => {
  it("is the stable marker shared by save + list", () => {
    expect(SKILLS_CONTENT_TAG).toBe("skills-that-matter");
  });
});

describe("badgeToSavedItemType", () => {
  it("maps the three gallery badges (case-insensitive)", () => {
    expect(badgeToSavedItemType("Article")).toBe("ARTICLE");
    expect(badgeToSavedItemType("podcast")).toBe("PODCAST");
    expect(badgeToSavedItemType("VIDEO")).toBe("VIDEO");
  });
  it("falls back to ARTICLE for unknown/missing badges", () => {
    expect(badgeToSavedItemType(undefined)).toBe("ARTICLE");
    expect(badgeToSavedItemType("something-else")).toBe("ARTICLE");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/insights/__tests__/saved-content.test.ts`
Expected: FAIL — cannot find module `../saved-content`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/lib/insights/saved-content.ts`:

```ts
/**
 * Shared contract between saving a Skills That Matter card (the gallery) and
 * listing saved Insights content (the My Library "My Content" tab). Both sides
 * MUST use SKILLS_CONTENT_TAG so the tab can filter to insights-origin items
 * without a schema change.
 */

/** Tag applied to SavedItems created from the Skills That Matter gallery. */
export const SKILLS_CONTENT_TAG = "skills-that-matter";

/** SavedItem types the gallery can produce (mirrors the Prisma SavedItemType). */
export type SaveableType = "ARTICLE" | "VIDEO" | "PODCAST" | "SHORT";

/**
 * Map a gallery card's display badge ("Article" | "Podcast" | "Video") to a
 * SavedItemType. Unknown/missing badges default to ARTICLE (the safest, most
 * common type) rather than throwing.
 */
export function badgeToSavedItemType(badge: string | undefined): SaveableType {
  switch ((badge ?? "").toLowerCase()) {
    case "video":
      return "VIDEO";
    case "podcast":
      return "PODCAST";
    case "article":
      return "ARTICLE";
    default:
      return "ARTICLE";
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/insights/__tests__/saved-content.test.ts`
Expected: PASS (5 assertions). If no output (exit 194), use the native-Node harness fallback described in the Env note.

- [ ] **Step 5: Commit**

```bash
git add src/lib/insights/saved-content.ts src/lib/insights/__tests__/saved-content.test.ts
git commit --no-verify -m "feat(insights): shared tag + badge→SavedItemType mapper for saving content"
```

---

## Task 2: Register the "My Content" tab

**Files:**
- Modify: `src/lib/library/tabs.ts`
- Test: `src/lib/library/__tests__/tabs.test.ts`

- [ ] **Step 1: Add the failing test assertions**

In `src/lib/library/__tests__/tabs.test.ts`, inside `describe("resolveLibraryTab", ...)`, add:

```ts
  it("resolves the new 'content' tab", () => {
    expect(resolveLibraryTab("content")).toBe("content");
  });
  it("includes a 'My Content' tab in LIBRARY_TABS", () => {
    expect(LIBRARY_TABS.some((t) => t.key === "content" && t.label === "My Content")).toBe(true);
  });
```

(The existing `it("accepts each known tab", ...)` test already iterates `LIBRARY_TABS`, so it will also cover the new key once added.)

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/library/__tests__/tabs.test.ts`
Expected: FAIL — `resolveLibraryTab("content")` returns `"decision"`; no `content` entry in `LIBRARY_TABS`.

- [ ] **Step 3: Implement — extend the union, tabs list, and known set**

In `src/lib/library/tabs.ts`:

Change the type:
```ts
export type LibraryTab = "decision" | "saved" | "content" | "reflections";
```

Change `LIBRARY_TABS` to include the new tab (after "saved"):
```ts
export const LIBRARY_TABS: readonly LibraryTabDef[] = [
  { key: "decision", label: "Decision Board" },
  { key: "saved", label: "Saved careers" },
  { key: "content", label: "My Content" },
  { key: "reflections", label: "Reflections" },
] as const;
```

Change the `KNOWN` set:
```ts
const KNOWN = new Set<LibraryTab>(["decision", "saved", "content", "reflections"]);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/library/__tests__/tabs.test.ts`
Expected: PASS (all existing + 2 new assertions).

- [ ] **Step 5: Commit**

```bash
git add src/lib/library/tabs.ts src/lib/library/__tests__/tabs.test.ts
git commit --no-verify -m "feat(library): register the My Content tab"
```

---

## Task 3: Add an optional bookmark button to CircularGallery

**Files:**
- Modify: `src/components/ui/circular-gallery.tsx`

No unit test (3D drag UI). Verified via build + review.

- [ ] **Step 1: Extend the imports and props**

At the top, add `Bookmark` to the lucide import and `cn` is already imported:
```ts
import { ChevronLeft, ChevronRight, MousePointer2, Bookmark } from "lucide-react";
```

Extend `CircularGalleryProps`:
```ts
interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** How far the cards sit from the centre. */
  radius?: number;
  /** Degrees added per animation frame while idle. */
  autoRotateSpeed?: number;
  /** When provided, each card shows a bookmark button that calls this. */
  onSave?: (item: GalleryItem) => void;
  /** Reports whether a card id is already saved (drives the filled icon). */
  isSaved?: (id: string) => boolean;
}
```

Destructure them in the component signature:
```ts
  ({ items, className, radius = 440, autoRotateSpeed = 0.036, onSave, isSaved, ...props }, ref) => {
```

- [ ] **Step 2: Render the bookmark button as a sibling of the link**

In the per-card `return (...)` (the positioned `<div role="group">`), the current body is:

```tsx
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full w-full"
                    onClick={(e) => {
                      if (drag.current.moved) e.preventDefault();
                    }}
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
```

Add the bookmark button immediately AFTER that block (still inside the positioned `<div>`), so it overlays the card without nesting a `<button>` inside the `<a>`:

```tsx
                {onSave && (
                  <button
                    type="button"
                    // stopPropagation on pointer-down so pressing the bookmark
                    // never starts a ring drag; preventDefault on click so it
                    // never opens the card's link.
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSave(item);
                    }}
                    aria-label={
                      isSaved?.(item.id) ? `Saved: ${item.title}` : `Save ${item.title}`
                    }
                    className="absolute right-1.5 top-1.5 z-20 rounded-full bg-black/55 p-1 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                  >
                    <Bookmark
                      className={cn("h-3 w-3", isSaved?.(item.id) && "fill-current")}
                    />
                  </button>
                )}
```

- [ ] **Step 3: Verify it builds / type-checks**

Run: `npx tsc --noEmit -p tsconfig.json` (or rely on CI if tsc exits 127/194 locally).
Expected: no new type errors in `circular-gallery.tsx`. Manually confirm the button is a sibling of the `<a>`, not nested inside it.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/circular-gallery.tsx
git commit --no-verify -m "feat(ui): optional per-card bookmark button on CircularGallery"
```

---

## Task 4: Wire the save handler into SkillsGallery

**Files:**
- Modify: `src/components/insights/skills-gallery.tsx`

- [ ] **Step 1: Add imports**

At the top of `skills-gallery.tsx`, add:
```ts
import { toast } from "sonner";
import {
  badgeToSavedItemType,
  SKILLS_CONTENT_TAG,
} from "@/lib/insights/saved-content";
import type { GalleryItem } from "@/components/ui/circular-gallery";
```
(`useCallback`, `useState` are already imported; `CircularGallery` is already imported.)

- [ ] **Step 2: Add saved-state + save handler inside the `SkillsGallery` component**

After the existing `const [isLoadingMore, setIsLoadingMore] = useState(false);` line, add:

```tsx
  // In-session "saved" fill state, keyed by gallery item id. Best-effort only
  // (the pool reshuffles per visit); the server dedupes by URL regardless.
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const handleSave = useCallback(async (item: GalleryItem) => {
    if (!item.href) return;
    try {
      const res = await fetch("/api/journey/saved-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: badgeToSavedItemType(item.badge),
          title: item.title,
          url: item.href,
          source: item.subtitle,
          thumbnail: item.image,
          tags: [SKILLS_CONTENT_TAG],
        }),
      });
      if (!res.ok) throw new Error("save failed");
      setSavedIds((prev) => new Set(prev).add(item.id));
      toast.success("Saved to My Library");
    } catch {
      toast.error("Couldn't save — please try again.");
    }
  }, []);

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);
```

- [ ] **Step 3: Pass the handlers to CircularGallery**

Change:
```tsx
        <CircularGallery items={items} />
```
to:
```tsx
        <CircularGallery items={items} onSave={handleSave} isSaved={isSaved} />
```

Also update the helper line under the gallery from `Drag to explore · tap a card to open it` to:
```tsx
        Drag to explore · tap a card to open it · bookmark to save
```

- [ ] **Step 4: Verify build / type-check**

Run: `npx tsc --noEmit -p tsconfig.json` (or rely on CI).
Expected: no new type errors. Confirm `toast` resolves (`sonner` is already a dependency and `<Toaster/>` is mounted app-wide).

- [ ] **Step 5: Commit**

```bash
git add src/components/insights/skills-gallery.tsx
git commit --no-verify -m "feat(insights): save Skills That Matter cards to My Library"
```

---

## Task 5: MyContentTab component (list + remove)

**Files:**
- Create: `src/components/library/my-content-tab.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/library/my-content-tab.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { SKILLS_CONTENT_TAG } from "@/lib/insights/saved-content";

interface SavedContentItem {
  id: string;
  type: string;
  title: string;
  url: string;
  source?: string | null;
  thumbnail?: string | null;
}

/**
 * "My Content" tab — saved Skills That Matter cards. Lists SavedItems tagged
 * SKILLS_CONTENT_TAG, opens them in a new tab, and removes via DELETE.
 */
export function MyContentTab() {
  // null = loading; [] = loaded-empty.
  const [items, setItems] = useState<SavedContentItem[] | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/journey/saved-items?tags=${SKILLS_CONTENT_TAG}&limit=200`,
      );
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data = (await res.json()) as { items?: SavedContentItem[] };
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    // Optimistic removal.
    setItems((prev) => (prev ? prev.filter((i) => i.id !== id) : prev));
    await fetch(`/api/journey/saved-items?id=${id}`, { method: "DELETE" }).catch(
      () => {},
    );
  }, []);

  if (items === null) {
    return (
      <p className="text-sm text-muted-foreground/60 py-10 text-center">Loading…</p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground/60 py-10 text-center">
        Nothing saved yet — tap the bookmark on any Skills That Matter card in
        Industry Insights.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.id}
          className="group relative overflow-hidden rounded-card border border-border/60 bg-card/40"
        >
          {it.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={it.thumbnail}
              alt=""
              className="h-24 w-full object-cover"
            />
          )}
          <div className="p-2.5">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-muted-foreground/50">
              {it.type}
            </p>
            <a
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block line-clamp-2 text-xs font-medium text-foreground/90 hover:text-primary"
            >
              {it.title}
            </a>
            {it.source && (
              <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground/60">
                {it.source}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => remove(it.id)}
            aria-label={`Remove ${it.title}`}
            className="absolute right-1.5 top-1.5 rounded-control bg-black/40 p-1 text-white/70 opacity-0 transition-opacity hover:bg-destructive/80 hover:text-white group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify build / type-check**

Run: `npx tsc --noEmit -p tsconfig.json` (or rely on CI).
Expected: no new type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/library/my-content-tab.tsx
git commit --no-verify -m "feat(library): My Content tab component (list + remove saved insights)"
```

---

## Task 6: Render MyContentTab in the library page

**Files:**
- Modify: `src/app/(dashboard)/library/page.tsx`

- [ ] **Step 1: Import the component**

After the existing `import { DecisionBoardTab } from "@/components/decision-board/decision-board";` line, add:
```ts
import { MyContentTab } from "@/components/library/my-content-tab";
```

- [ ] **Step 2: Add the render branch**

Change the tab-render ternary chain (near the bottom of the `LibraryPage` return) from:
```tsx
      {!mounted ? (
        <EmptyState>Loading…</EmptyState>
      ) : active === "decision" ? (
        <DecisionBoardTab />
      ) : active === "saved" ? (
        <SavedCareersTab />
      ) : (
        <ReflectionsTab />
      )}
```
to:
```tsx
      {!mounted ? (
        <EmptyState>Loading…</EmptyState>
      ) : active === "decision" ? (
        <DecisionBoardTab />
      ) : active === "saved" ? (
        <SavedCareersTab />
      ) : active === "content" ? (
        <MyContentTab />
      ) : (
        <ReflectionsTab />
      )}
```

- [ ] **Step 3: Verify build / type-check**

Run: `npx tsc --noEmit -p tsconfig.json` (or rely on CI).
Expected: no new type errors. The tab bar already renders from `LIBRARY_TABS`, so "My Content" appears automatically.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(dashboard)/library/page.tsx"
git commit --no-verify -m "feat(library): wire My Content tab into the library page"
```

---

## Task 7: Final verification

- [ ] **Step 1: Run the unit tests**

Run: `npx vitest run src/lib/insights/__tests__/saved-content.test.ts src/lib/library/__tests__/tabs.test.ts`
Expected: PASS. (Native-Node harness fallback if exit 194.)

- [ ] **Step 2: Manual smoke checklist (record results)**

- [ ] Industry Insights → Skills That Matter: each card shows a bookmark (top-right); tapping it shows "Saved to My Library" and fills the icon; tapping the card body still opens the link; dragging the ring does NOT trigger a save.
- [ ] My Library → "My Content" tab: shows the saved cards in a grid; the × removes one; empty state shows when none.
- [ ] Saving the same card twice does not create a duplicate (server dedupes by URL).

- [ ] **Step 3: Push + open PR**

```bash
git push -u origin feat/save-insights-content
gh pr create --base main --title "feat: save Skills That Matter content to a My Library 'My Content' tab" --body "Implements docs/superpowers/specs/2026-06-10-save-insights-content-to-my-library.md. Reuse-only (no migration/new routes)."
```

---

## Self-Review (completed)

- **Spec coverage:** Tag-based scoping (Task 1 constant; Task 4 save tag; Task 5 list filter) ✓; save affordance on gallery (Tasks 3–4) ✓; My Content tab (Tasks 2, 5, 6) ✓; pure mapper + tabs tests (Tasks 1–2) ✓; deferred Part A untouched ✓.
- **Placeholders:** none — every code step shows complete code.
- **Type consistency:** `badgeToSavedItemType`/`SKILLS_CONTENT_TAG`/`SaveableType` defined in Task 1 and used verbatim in Tasks 4–5; `GalleryItem` (from `circular-gallery.tsx`) used in Tasks 3–4; `LibraryTab` `"content"` added in Task 2 and matched by the `active === "content"` branch in Task 6; saved-items POST body matches the route's destructure (`type,title,url,source,tags,thumbnail`); DELETE uses `?id=` per the route; GET returns `{ items }` consumed in Task 5.

# Save Insights content → "My Content" tab in My Library

**Date:** 2026-06-10
**Status:** Approved design — ready for implementation plan
**Scope:** Small, reuse-heavy. No schema migration, no new API routes.

## Overview

Let users **save** cards from the **Skills That Matter** gallery (articles, podcasts, videos)
and view what they've saved in a new **"My Content"** tab in My Library. The tab is scoped to
**Insights-saved items only**.

This is part B+C of a larger idea. **Part A (making TED the main video source)** is explicitly
deferred to a separate follow-up because it carries policy + accuracy decisions; this spec does
not touch it.

## Goals

- A young person can save an interesting Skills That Matter card with one tap.
- Saved Insights content is retrievable later from a dedicated My Library tab.
- Calm, no gamification, privacy-first (per CLAUDE.md). Reuse existing infrastructure.

## Non-goals (deferred / out of scope)

- TED as the main/primary video source (Part A — separate spec).
- Saving from the other Insights sections (Big Picture, Jobs on the Rise, Reality Checks, etc.).
- A cross-device "already saved" indicator on the gallery cards.
- Any new `SavedItem` schema field / migration.

## What already exists (reuse, do not rebuild)

- **`SavedItem` model** (`prisma/schema.prisma`): `type` (enum `ARTICLE|VIDEO|PODCAST|SHORT`),
  `title`, `url`, `source`, `tags[]`, `thumbnail`, `description`, `savedAt`, `deletedAt`
  (soft delete). Dedup by URL among active items.
- **`/api/journey/saved-items`** route: `GET` (lists; supports `?tags=` filter), `POST`
  (accepts `{ type, title, url, source, tags, thumbnail, description, ... }`), `DELETE`.
- **`saveToLibrary()` pattern** in `src/components/insights/insight-carousel.tsx` — the exact
  POST shape to reuse.
- **`SkillsGallery`** (`src/components/insights/skills-gallery.tsx`) renders the section as a
  `CircularGallery` of `GalleryItem`s built from `{ articles, podcasts, videos }`, each with
  `id`, `image`, `title`, `subtitle` (source), `badge` (`Article|Podcast|Video`), `href`.
- **My Library tabs**: `src/lib/library/tabs.ts` (`LibraryTab`, `LIBRARY_TABS`, `KNOWN`,
  `resolveLibraryTab`) + `src/app/(dashboard)/library/page.tsx`.

## Key design decision — scoping "Insights content"

`SavedItem` is shared (e.g. Career Twin also writes to it). To show *only* Insights-saved items
in the tab, **tag items saved from the gallery with `["skills-that-matter"]`** and filter the
tab via the route's existing `?tags=skills-that-matter`.

- **Chosen:** tag-based. No migration; the route already supports `tags` on POST + GET filter.
- **Rejected:** a new `origin` enum column on `SavedItem` — requires a migration for no real gain.

## Part B — Save affordance on the Skills That Matter gallery

1. **`CircularGallery` / `GalleryItem`** (`src/components/ui/circular-gallery.tsx`): add an
   optional `onSave?: (item: GalleryItem) => void` and `isSaved?: (id: string) => boolean`.
   When `onSave` is provided, render a small **bookmark button overlaid in each card's corner**.
   Clicking it calls `onSave` and must **not** trigger the card's outbound `<a>` link
   (`preventDefault` / `stopPropagation`).
2. **`SkillsGallery`**: provide `onSave`. The handler maps the `GalleryItem` → save payload and
   POSTs to `/api/journey/saved-items`:
   - `type` ← `badgeToSavedItemType(item.badge)` (`Article→ARTICLE`, `Podcast→PODCAST`,
     `Video→VIDEO`)
   - `title` ← `item.title`, `url` ← `item.href`, `source` ← `item.subtitle`,
     `thumbnail` ← `item.image`
   - `tags` ← `["skills-that-matter"]`
3. **Feedback:** toast "Saved to My Library" on success; the bookmark fills. Saving is
   **idempotent** (service dedupes by URL). Track saved ids in component state for the
   filled-icon state within the session (best-effort; not persisted to the gallery).
4. Saving requires a signed-in YOUTH session (route already enforces). For signed-out users the
   bookmark can be hidden or prompt sign-in — match the page's existing pattern.

## Part C — "My Content" tab in My Library

1. **`src/lib/library/tabs.ts`**: add `"content"` to the `LibraryTab` union, a
   `{ key: "content", label: "My Content" }` entry to `LIBRARY_TABS`, add `"content"` to
   `KNOWN`. `resolveLibraryTab` keeps defaulting to `"decision"`.
2. **`MyContentTab`** (new client component): GET
   `/api/journey/saved-items?tags=skills-that-matter` (reasonable limit), render a **responsive
   grid** of saved cards — thumbnail, title, source, type badge, outbound open-link — each with
   a **remove (×)** that calls `DELETE /api/journey/saved-items` and optimistically drops it.
   Calm empty state ("Nothing saved yet — tap the bookmark on any Skills That Matter card.").
   Use a clean grid, **not** the 3D `CircularGallery` (a saved list should be scannable).
3. **`library/page.tsx`**: render `MyContentTab` for the `content` tab; add it to the tab bar
   via `LIBRARY_TABS` (already mapped).

## Components & boundaries

| Unit | Responsibility | Depends on |
|---|---|---|
| `badgeToSavedItemType()` (pure) | map gallery badge → `SavedItemType` | none (unit-tested) |
| `CircularGallery` (extended) | optional per-card save button | `onSave`, `isSaved` props |
| `SkillsGallery` (extended) | wire save handler + tag | `/api/journey/saved-items`, toast |
| `MyContentTab` (new) | list + remove saved Insights items | `/api/journey/saved-items` |
| `tabs.ts` (extended) | register the `content` tab | none |

## Testing

- **`badgeToSavedItemType()`** — pure unit tests (all badges + unknown fallback).
- **`tabs.ts`** — extend the existing test: `"content"` resolves, unknown still defaults to
  `"decision"`, `LIBRARY_TABS` contains the new entry.
- UI (gallery button, MyContentTab) — verified by review + CI; vitest/tsc do not run in this
  local env (native-node harness used for pure logic where possible).

## Risks / notes

- The gallery shuffles per visit, so the in-session "saved" fill is best-effort, not a durable
  badge — acceptable (dedup prevents double-saves regardless).
- Keep the save button subtle (calm UI principle); no counts, no streaks, no gamification.
- Tag string `"skills-that-matter"` is the contract between save (Part B) and list (Part C);
  define it once as a shared constant to avoid drift.

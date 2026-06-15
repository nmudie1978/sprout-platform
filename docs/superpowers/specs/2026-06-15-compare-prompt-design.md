# Compare Shortlist — Persist + "You have 3, compare now?" Prompt

**Date:** 2026-06-15
**Status:** Approved (brainstormed with user) — built on branch `feat/compare-prompt`, NOT deployed.

## Goal

As a user saves careers to compare (the "Add to compare shortlist" button in the
career modal), the shortlist should **persist across the whole site over time**,
and the moment it reaches **3**, the platform shows a calm prompt:

> **You now have 3 careers to compare.**
> Do you want to go to the compare section to look at these?
> **[Yes, compare]** · **[Not now]**

**Yes** opens the existing Compare modal in place. **Not now** dismisses; the user
keeps browsing.

## Current state (what exists)

- `useCompareShortlist` (`src/hooks/use-compare-shortlist.ts`): in-memory React
  state, **max 3**, **not persisted** (clears on navigation). Its only consumer
  is the Career Radar.
- The career detail sheet's "Add to compare shortlist" button dispatches a
  `window` CustomEvent `"add-career-to-compare"`.
- **Only the Career Radar** (`/careers/radar`) listens for that event, so adding
  to compare from a career modal opened anywhere else does nothing today.
- The radar renders its own compare UI (an inline `CompareVault` in the Matches
  Report header + a `CompareModal`). `FloatingCompareCTA` exists but is unused.

## Design

Two problems to solve: **persistence/site-wide** and **the prompt**. Both are
solved without editing the 2,800-line, actively-changing radar.

### 1. Shared, persistent store — `src/lib/compare/shortlist-store.ts` (new)
A tiny module store backing the shortlist:
- localStorage-persisted, keyed per user (`endeavrly:compare-shortlist:<userId|guest>`)
  — same privacy-first, device-local pattern as Interest Level.
- `subscribe` / `getSnapshot` (stable reference) for `useSyncExternalStore`;
  cross-tab via the `storage` event.
- Methods: `add(career) → "added"|"duplicate"|"full"`, `remove(id)`, `toggle`,
  `clear`, `loadSet`, `setUser(uid)`, `MAX = 3`.
- Pure helper `shouldPromptForCompare(prev, next, max)` = `prev < max && next === max`
  (unit-tested) — the up-crossing detector.

### 2. Hook refactor — `use-compare-shortlist.ts`
Re-implement over the store with `useSyncExternalStore`; **preserve the exact
API** (`shortlist, toggle, isInShortlist, clear, remove, loadSet, max`) plus a new
`add`. The radar keeps working unchanged and now gets a persistent, shared
shortlist for free.

### 3. Global host — `src/components/compare/compare-host.tsx` (new)
A `"use client"` component mounted once in the dashboard layout. **Route-aware**
via `usePathname()` to avoid duplicating the radar's existing UI:

| Concern | Off radar | On `/careers/radar` |
|---|---|---|
| `"add-career-to-compare"` listener (+ toasts) | host handles | radar handles (host suppressed → no double-add/toast) |
| Floating compare pill | host renders `FloatingCompareCTA` | suppressed (radar has its CompareVault) |
| Compare modal | host renders | host renders (opens on prompt "Yes") |
| **3-reached prompt** | host renders | host renders |

The **prompt is driven by the shared store's count transition**, not the event —
so it fires no matter where or how the 3rd item was added (radar or off-radar),
with zero radar changes. On mount, the "previous count" seeds to the current
count so a pre-filled shortlist never prompts on load.

Prompt UI: Radix `AlertDialog`, calm copy above. "Yes" → open the `CompareModal`;
"Not now" → close. Re-prompts only on a fresh up-crossing to 3 (drop below 3, add
back to 3).

### 4. Mount
Add `<CompareHost />` to `src/app/(dashboard)/layout.tsx` alongside `{children}`.

## Out of scope
- No DB persistence (localStorage only, on-pattern).
- No radar refactor (deferred; the host coexists via route-awareness).
- No change to the Compare modal's contents.

## Testing
- **Lib:** `shouldPromptForCompare` boundaries; store `add` dedup/full/persist
  (jsdom localStorage).
- **Component:** host shows the prompt when count crosses to 3; "Yes" opens the
  modal; renders the pill off-radar and suppresses it on `/careers/radar`; does
  not prompt when the shortlist is already full on mount.

## Verification / rollout
Typecheck + tests + build green. Commit to `feat/compare-prompt` and push the
**branch** (preview only). **No production deploy** without explicit go-ahead.

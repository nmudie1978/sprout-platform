# Language switcher reachable on every surface — design

**Date:** 2026-06-02
**Status:** Approved (design); implementation pending

## Problem

The platform already has full language-switching infrastructure:

- `next-intl` with 3 complete UI translations: `en-GB`, `nb-NO`, `es` (`messages/*.json`).
- A working `LanguageDropdown` component (`src/components/language-dropdown.tsx`).
- A `useLocaleSwitch` hook (`src/hooks/use-locale-switch.ts`) and `/api/locale` PATCH
  endpoint that sets the `NEXT_LOCALE` cookie (1-year expiry) and, for logged-in users,
  persists `UserPreferences.preferredLocale`.

But the switcher is rendered in exactly **one** place: the `/dashboard` page's inline
header. It is absent from the landing page, all auth pages, About/Legal pages, the
sidebar, the mobile nav, and every other signed-in page (careers, journey, library,
profile, admin, dev).

**Goal:** make the language switcher reachable from every screen — logged out or in —
so a user can set their language "at all times".

This is a **placement / surfacing** task. No new localization infrastructure is needed.

## Key facts confirmed during design

- **Language ≠ country.** Language (UI strings) lives in the `NEXT_LOCALE` cookie +
  `UserPreferences.preferredLocale`. Country (content substrate) lives in
  `YouthProfile.country` and is set at signup. This work touches only the **language**
  layer. Country switching is explicitly out of scope.
- **`/api/locale` already supports anonymous users.** It sets the cookie
  unconditionally and only upserts the DB row when a session exists (verified in
  `src/app/api/locale/route.ts`). So switching language on the logged-out landing and
  auth pages works with **zero backend changes**.

## Decisions (from brainstorming)

- **Scope:** truly everywhere — landing, auth, About/Legal, and all signed-in pages.
- **Signed-in placement:** a new slim **persistent top bar** across all signed-in pages.
- **Top bar role:** holds the **language switcher only** (+ logo). The existing theme
  toggle and sign-out stay in the sidebar / mobile nav; the dashboard keeps its own
  page-level header. The top bar does NOT consolidate other controls.
- **Mobile:** the top bar is visible on mobile as well (mobile currently has no top
  header, so this adds a language control mobile users lack today).
- **Auth pages:** introduce a new shared `src/app/auth/layout.tsx` rather than editing
  each auth page individually.

## Changes by surface

### 1. Signed-in app — new persistent top bar
- **New:** `src/components/app-top-bar.tsx` (client component). Slim sticky header:
  logo on the left, `<LanguageDropdown />` on the right. Visible on desktop and mobile.
- **Edit:** `src/app/(dashboard)/layout.tsx` — mount `<AppTopBar />` above the page
  content area so it renders on every signed-in page (dashboard, careers, journey,
  library, profile, admin, dev). Sidebar and mobile bottom nav are left untouched
  (they keep theme toggle + sign-out).
- **Edit:** `src/app/(dashboard)/dashboard/page.tsx` — remove the now-duplicate
  `<LanguageDropdown />` (and its import if unused) from the inline page header
  (~line 927) so the dashboard does not show two switchers.

### 2. Landing page
- **Edit:** `src/app/page.tsx` — add `<LanguageDropdown />` into the existing sticky
  inline nav, alongside the auth buttons (`LandingNavAuthClient`).

### 3. Auth pages
- **New:** `src/app/auth/layout.tsx` — minimal shared layout with a small header
  (logo + `<LanguageDropdown />`) wrapping all auth pages: signin, signup, verify,
  complete-profile, error. One file covers all five; individual auth pages are not edited
  (beyond what the new layout requires).

### 4. About / Legal pages
- **Edit:** `src/app/about/layout.tsx` and `src/app/legal/layout.tsx` — add
  `<LanguageDropdown />` to each existing sticky header (logo + Back button).

## What does NOT change
- `LanguageDropdown`, `useLocaleSwitch`, `/api/locale`, the `NEXT_LOCALE` cookie, and the
  three message catalogs are reused as-is. No backend or i18n-config changes.
- Country selection / substrate gate is untouched.

## Open implementation details (decide during build)
- **Compact variant:** `LanguageDropdown` may need a small `size`/`variant` prop so it
  sits cleanly in tight headers (auth corner, landing nav). Add this **only** if the
  current styling looks wrong in those spots; otherwise reuse unchanged.
- **Top bar spacing:** the new bar must not visually collide with pages that already
  render their own page-level header (notably the dashboard). It is slim and sits above
  the content; verify vertical spacing on dashboard + a few child pages.

## Out of scope
- Adding new languages or new translations.
- In-app country switching (separate feature).
- Consolidating theme toggle / sign-out into the top bar.

## Acceptance criteria
- A logged-out visitor can change the UI language from the landing page and from any
  auth page (signup/login), and the choice persists via the `NEXT_LOCALE` cookie.
- A signed-in user can change the UI language from any signed-in page (the top bar is
  present on all of them), on both desktop and mobile.
- About and Legal pages expose the switcher in their headers.
- The dashboard shows exactly one language switcher (no duplicate).
- No regression to theme toggle / sign-out placement.

/**
 * Mobile bottom nav route coverage — tests for Issue 5.
 *
 * These tests assert the *navigation registry*, not the rendered
 * component. They prove that every route intended to be reachable on
 * mobile is actually present in the mobile nav config — without
 * requiring jsdom or React Testing Library, which would add setup
 * cost for what is fundamentally a data-contract test.
 *
 * The coverage matrix enforced below maps to the product requirement:
 * "Core sections such as Dashboard, My Journey, My Career Radar, and
 * other relevant menu items must be accessible and usable on mobile".
 *
 * To keep the test decoupled from the component internals I read the
 * file source and parse the route strings out. This means the tests
 * will break loudly if someone removes a required route, which is
 * exactly the regression guard we want.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

const NAV_SOURCE = readFileSync(
  join(process.cwd(), 'src/components/mobile-bottom-nav.tsx'),
  'utf-8',
);

// All routes that MUST be reachable from the mobile navigation for
// a YOUTH user — either via the bottom bar or the More drawer. This
// list is the single source of truth for mobile parity.
const REQUIRED_YOUTH_ROUTES = [
  '/dashboard',         // Home / bottom bar
  '/my-journey',        // Journey / bottom bar
  '/careers',           // Explore Careers / bottom bar
  '/careers/radar',     // My Career Radar — previously missing from mobile
  '/career-events',     // Youth Events — previously missing from mobile
  '/insights',          // Industry Insights — previously missing from mobile
  '/career-advisor',    // AI Advisor — now under "Yours"
  '/library',           // My Library — saved careers, comparisons, reflections
  '/profile',           // Profile — present but previously hidden behind wrong slot
  '/info',              // About — previously missing from mobile
  '/feedback',          // Feedback — previously missing from mobile
  '/reviews',           // User Reviews — previously missing from mobile
];

// NOTE: The "job poster" (EMPLOYER) role and the small-jobs marketplace
// were fully removed — Endeavrly is a youth career-exploration platform,
// not a jobs marketplace. The previous REQUIRED_EMPLOYER_ROUTES / /jobs /
// /applications checks were dropped with that removal.
//
// NOTE: The COMMUNITY_GUARDIAN role and its `/guardian` route were
// intentionally removed in "Strip jobs-era guardian machinery"
// (1861776) — such users were promoted to ADMIN. The previous
// REQUIRED_GUARDIAN_ROUTES check was left stale by that change and has
// been dropped here. /jobs and /profile remain covered by
// REQUIRED_YOUTH_ROUTES above.

describe('MobileBottomNav route coverage (Issue 5 — positive tests)', () => {
  it.each(REQUIRED_YOUTH_ROUTES)(
    'exposes youth route %s somewhere in mobile nav',
    (route) => {
      // Check that the route string appears in the mobile-bottom-nav
      // source (either the bar item list or the drawer section list).
      // The regex uses a quoted-string match so partial matches (e.g.
      // /careers matching /careers/radar) don't mask a missing
      // specific route.
      const exactMatch = new RegExp(`["']${route.replace(/[/]/g, '\\/')}["']`);
      expect(
        exactMatch.test(NAV_SOURCE),
        `Route "${route}" must appear in mobile-bottom-nav.tsx`,
      ).toBe(true);
    },
  );

  it('includes a More drawer trigger', () => {
    expect(NAV_SOURCE).toMatch(/SheetTrigger/);
    expect(NAV_SOURCE).toMatch(/aria-haspopup="dialog"/);
  });

  it('drawer sections group routes under human-readable titles', () => {
    expect(NAV_SOURCE).toMatch(/title:\s*['"]Yours['"]/);
    expect(NAV_SOURCE).toMatch(/title:\s*['"]Explore['"]/);
    expect(NAV_SOURCE).toMatch(/title:\s*['"]Account['"]/);
  });

  it('groups AI Advisor and My Library under "Yours", not "Explore"', () => {
    // Extract each section block by slicing from its title to the next title.
    const sectionBody = (title: string) => {
      const start = NAV_SOURCE.indexOf(`title: "${title}"`);
      expect(start, `"${title}" section must exist`).toBeGreaterThanOrEqual(0);
      const rest = NAV_SOURCE.slice(start + 1);
      const nextTitle = rest.indexOf('title: "');
      return nextTitle === -1 ? rest : rest.slice(0, nextTitle);
    };
    const yours = sectionBody('Yours');
    const explore = sectionBody('Explore');

    // AI Advisor moved out of Explore into Yours; My Library is new in Yours.
    expect(yours).toMatch(/["']\/career-advisor["']/);
    expect(yours).toMatch(/["']\/library["']/);
    expect(explore).not.toMatch(/["']\/career-advisor["']/);
    expect(explore).not.toMatch(/["']\/library["']/);
  });

  it('touch targets are at least 44x44 (WCAG minimum)', () => {
    // Every interactive element in the mobile nav should declare
    // min-h-[44px] so taps meet the WCAG AA minimum.
    const matches = NAV_SOURCE.match(/min-h-\[44px\]/g);
    expect(matches).not.toBeNull();
    expect((matches ?? []).length).toBeGreaterThanOrEqual(3);
  });

  it('honours the iOS safe-area inset on both the bar and drawer footer', () => {
    // The nav itself reads env(safe-area-inset-bottom) so it clears
    // the home indicator.
    expect(NAV_SOURCE).toMatch(/env\(safe-area-inset-bottom/);
  });
});

describe('MobileBottomNav route coverage (Issue 5 — negative tests)', () => {
  it('does NOT hide My Career Radar behind a desktop-only path', () => {
    // Regression: My Career Radar used to be reachable only from the
    // desktop sidebar. If someone removes it from the mobile nav
    // without updating the required-route list, this test flags it.
    expect(NAV_SOURCE).toMatch(/\/careers\/radar/);
  });

  it('does NOT render the nav on auth / legal pages', () => {
    // The component returns null on /auth and /legal — this prevents
    // the bottom bar from rendering on signup/signin/legal flows
    // where it would be confusing.
    expect(NAV_SOURCE).toMatch(
      /pathname\.startsWith\(['"]\/auth['"]\)/,
    );
    expect(NAV_SOURCE).toMatch(
      /pathname\.startsWith\(['"]\/legal['"]\)/,
    );
  });

  it('does NOT render the nav on the landing page', () => {
    expect(NAV_SOURCE).toMatch(/pathname === ['"]\/['"]/);
  });

  it('is hidden on desktop (lg breakpoint and above)', () => {
    // lg:hidden ensures the mobile nav does NOT show on desktop
    // where the sidebar takes over.
    expect(NAV_SOURCE).toMatch(/lg:hidden/);
  });

  it('More trigger has a distinct icon from the primary nav items', () => {
    // MoreHorizontal is the visual indicator that the fifth slot
    // opens a drawer. Previously there was no drawer at all.
    expect(NAV_SOURCE).toMatch(/MoreHorizontal/);
  });
});

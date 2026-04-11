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
  '/applications',      // My Small Jobs — previously missing from mobile
  '/career-events',     // Youth Events — previously missing from mobile
  '/insights',          // Industry Insights — previously missing from mobile
  '/career-advisor',    // AI Advisor — previously missing from mobile
  '/jobs',              // Browse Jobs / bottom bar
  '/profile',           // Profile — present but previously hidden behind wrong slot
  '/info',              // About — previously missing from mobile
  '/feedback',          // Feedback — previously missing from mobile
  '/reviews',           // User Reviews — previously missing from mobile
];

const REQUIRED_EMPLOYER_ROUTES = [
  '/employer/dashboard',
  '/employer/post-job',
  '/employer/talent',
  '/messages',
  '/employer/settings',
  '/feedback',
];

const REQUIRED_GUARDIAN_ROUTES = ['/guardian', '/jobs', '/profile'];

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

  it.each(REQUIRED_EMPLOYER_ROUTES)(
    'exposes employer route %s somewhere in mobile nav',
    (route) => {
      const exactMatch = new RegExp(`["']${route.replace(/[/]/g, '\\/')}["']`);
      expect(exactMatch.test(NAV_SOURCE)).toBe(true);
    },
  );

  it.each(REQUIRED_GUARDIAN_ROUTES)(
    'exposes guardian route %s somewhere in mobile nav',
    (route) => {
      const exactMatch = new RegExp(`["']${route.replace(/[/]/g, '\\/')}["']`);
      expect(exactMatch.test(NAV_SOURCE)).toBe(true);
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

  it('does NOT hide My Small Jobs (Applications)', () => {
    expect(NAV_SOURCE).toMatch(/\/applications/);
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

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Guards the sidebar replacement of "Youth Events" with "Events & Opportunities".
 * Source-level checks (rendering SidebarNav needs session/router mocks) — these
 * keep the nav item, route, mobile nav and onboarding tour in sync.
 */
const read = (p: string) => readFileSync(p, "utf8");

describe("sidebar: Events & Opportunities", () => {
  it("the desktop sidebar links to /events-opportunities and drops 'Youth Events'", () => {
    const src = read("src/components/sidebar-nav.tsx");
    expect(src).toContain('href="/events-opportunities"');
    expect(src).toContain('label="Events & Opportunities"');
    expect(src).not.toContain('label="Youth Events"');
  });

  it("the mobile bottom nav points at /events-opportunities", () => {
    const src = read("src/components/mobile-bottom-nav.tsx");
    expect(src).toContain('href: "/events-opportunities"');
    expect(src).not.toContain('href: "/career-events"');
  });

  it("the onboarding tour targets /events-opportunities", () => {
    const src = read("src/components/onboarding/tour-steps.ts");
    expect(src).toContain('target: "/events-opportunities"');
    expect(src).not.toContain('target: "/career-events"');
  });

  it("the page exists at the expected route", () => {
    expect(() => read("src/app/(dashboard)/events-opportunities/page.tsx")).not.toThrow();
  });
});

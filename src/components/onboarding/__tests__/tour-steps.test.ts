import { describe, it, expect } from "vitest";
import { STEPS } from "../tour-steps";

// The YOUTH sidebar destinations a walkthrough step may point at. Mirrors the
// hrefs rendered in src/components/sidebar-nav.tsx — if a target here isn't a
// real sidebar href, the spotlight would have nothing to highlight.
const SIDEBAR_HREFS = new Set([
  "/dashboard",
  "/my-journey",
  "/careers/radar",
  "/library",
  "/career-advisor",
  "/careers",
  "/career-events",
  "/insights",
  "/profile",
  "/info",
  "/feedback",
]);

// The feature steps must walk down the sidebar in its visual order:
// Dashboard → My Journey → My Career Radar → My Library → Career Twin →
// Explore Careers → Youth Events → Industry Insights.
const SIDEBAR_ORDER = [
  "/dashboard",
  "/my-journey",
  "/careers/radar",
  "/library",
  "/career-advisor",
  "/careers",
  "/career-events",
  "/insights",
];

describe("walkthrough tour steps", () => {
  it("is intro + 8 sidebar steps + CTA = 10 steps", () => {
    expect(STEPS).toHaveLength(10);
  });

  it("every target points at a real sidebar destination", () => {
    for (const step of STEPS) {
      if (step.target !== undefined) {
        expect(SIDEBAR_HREFS.has(step.target)).toBe(true);
      }
    }
  });

  it("walks the sidebar in order between the intro and CTA", () => {
    const targets = STEPS.map((s) => s.target);
    expect(targets).toEqual([undefined, ...SIDEBAR_ORDER, undefined]);
  });

  it("covers My Library (the previously-missing item)", () => {
    const byTitle = Object.fromEntries(STEPS.map((s) => [s.title, s.target]));
    expect(byTitle["My Library"]).toBe("/library");
  });

  it("leaves the intro and CTA steps without a target", () => {
    expect(STEPS[0].target).toBeUndefined(); // "Let me show you around"
    expect(STEPS[STEPS.length - 1].target).toBeUndefined(); // "Choose your first career goal"
  });
});

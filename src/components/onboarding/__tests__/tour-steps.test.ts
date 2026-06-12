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

describe("walkthrough tour steps", () => {
  it("has the expected 7 steps", () => {
    expect(STEPS).toHaveLength(7);
  });

  it("every target points at a real sidebar destination", () => {
    for (const step of STEPS) {
      if (step.target !== undefined) {
        expect(SIDEBAR_HREFS.has(step.target)).toBe(true);
      }
    }
  });

  it("maps the five feature steps to the right sidebar items", () => {
    const byTitle = Object.fromEntries(STEPS.map((s) => [s.title, s.target]));
    expect(byTitle["Career Radar"]).toBe("/careers/radar");
    expect(byTitle["Dashboard"]).toBe("/dashboard");
    expect(byTitle["My Journey"]).toBe("/my-journey");
    expect(byTitle["Career Twin"]).toBe("/career-advisor");
    expect(byTitle["Industry Insights"]).toBe("/insights");
  });

  it("leaves the intro and CTA steps without a target", () => {
    expect(STEPS[0].target).toBeUndefined(); // "Let me show you around"
    expect(STEPS[STEPS.length - 1].target).toBeUndefined(); // "Choose your first career goal"
  });
});

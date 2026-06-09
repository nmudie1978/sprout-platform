/**
 * Journey-completion celebration guard.
 *
 * The one-time "moment of arrival" must fire exactly once per career per
 * device — these tests pin that contract (mark → has, per-career isolation,
 * null-safety).
 */

import { describe, it, expect, beforeEach } from "vitest";
import { hasCelebratedJourney, markJourneyCelebrated } from "../celebration";

describe("journey celebration guard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("is false before the journey has been celebrated", () => {
    expect(hasCelebratedJourney("cloud-engineer")).toBe(false);
  });

  it("becomes true after marking, and stays true", () => {
    markJourneyCelebrated("cloud-engineer");
    expect(hasCelebratedJourney("cloud-engineer")).toBe(true);
    expect(hasCelebratedJourney("cloud-engineer")).toBe(true);
  });

  it("is isolated per career", () => {
    markJourneyCelebrated("cloud-engineer");
    expect(hasCelebratedJourney("nurse")).toBe(false);
  });

  it("is null/undefined-safe (no throw, never celebrated)", () => {
    expect(hasCelebratedJourney(null)).toBe(false);
    expect(hasCelebratedJourney(undefined)).toBe(false);
    expect(() => markJourneyCelebrated(null)).not.toThrow();
    expect(() => markJourneyCelebrated(undefined)).not.toThrow();
  });
});

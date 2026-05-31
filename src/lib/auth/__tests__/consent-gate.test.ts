import { describe, it, expect } from "vitest";
import {
  isConsentWriteGatedApi,
  CONSENT_WRITE_GATED_API_PREFIXES,
  MUTATING_METHODS,
} from "../consent-gate";

describe("isConsentWriteGatedApi", () => {
  it("gates nothing — every action is allowed at any age / consent state", () => {
    expect(CONSENT_WRITE_GATED_API_PREFIXES).toEqual([]);
    for (const path of [
      "/api/goals",
      "/api/goals/anything",
      "/api/journey",
      "/api/journey/reflections",
      "/api/discover",
      "/api/profile/skills",
      "/api/profile/career-goals",
      "/api/life-skills",
      "/api/interview-prep",
      "/api/insights/saved",
      "/api/careers",
      "/dashboard",
    ]) {
      expect(isConsentWriteGatedApi(path)).toBe(false);
    }
  });

  it("still exposes MUTATING_METHODS for the middleware", () => {
    expect(MUTATING_METHODS.has("PUT")).toBe(true);
    expect(MUTATING_METHODS.has("POST")).toBe(true);
    expect(MUTATING_METHODS.has("PATCH")).toBe(true);
    expect(MUTATING_METHODS.has("DELETE")).toBe(true);
    expect(MUTATING_METHODS.has("GET")).toBe(false);
  });
});

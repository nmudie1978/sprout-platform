import { describe, it, expect } from "vitest";
import {
  isConsentWriteGatedApi,
  MUTATING_METHODS,
} from "../consent-gate";

describe("isConsentWriteGatedApi", () => {
  it("does NOT gate /api/goals — everyone may set a primary/secondary goal at any age", () => {
    expect(isConsentWriteGatedApi("/api/goals")).toBe(false);
    expect(isConsentWriteGatedApi("/api/goals/anything")).toBe(false);
  });

  it("still gates genuinely sensitive personal-data writes", () => {
    expect(isConsentWriteGatedApi("/api/journey")).toBe(true);
    expect(isConsentWriteGatedApi("/api/journey/reflections")).toBe(true);
    expect(isConsentWriteGatedApi("/api/discover")).toBe(true);
    expect(isConsentWriteGatedApi("/api/profile/skills")).toBe(true);
    expect(isConsentWriteGatedApi("/api/life-skills")).toBe(true);
  });

  it("does not gate unrelated routes", () => {
    expect(isConsentWriteGatedApi("/api/careers")).toBe(false);
    expect(isConsentWriteGatedApi("/dashboard")).toBe(false);
  });

  it("treats only mutating methods as gated verbs", () => {
    expect(MUTATING_METHODS.has("PUT")).toBe(true);
    expect(MUTATING_METHODS.has("POST")).toBe(true);
    expect(MUTATING_METHODS.has("PATCH")).toBe(true);
    expect(MUTATING_METHODS.has("DELETE")).toBe(true);
    expect(MUTATING_METHODS.has("GET")).toBe(false);
  });
});

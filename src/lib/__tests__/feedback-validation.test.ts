import { describe, it, expect } from "vitest";
import {
  feedbackSchema,
  containsContactInfo,
  sanitizeMessage,
} from "../feedback-validation";

describe("feedbackSchema", () => {
  it("accepts a minimal valid payload (kind + message only)", () => {
    const parsed = feedbackSchema.parse({ kind: "IDEA", message: "add dark mode toggle" });
    expect(parsed.kind).toBe("IDEA");
    expect(parsed.area).toBeUndefined();
  });

  it("accepts a full payload", () => {
    const parsed = feedbackSchema.parse({
      kind: "CONFUSED",
      area: "JOURNEY",
      message: "lost on the understand tab",
      role: "TEEN_16_20",
      source: "profile",
    });
    expect(parsed.area).toBe("JOURNEY");
    expect(parsed.role).toBe("TEEN_16_20");
  });

  it("rejects a missing kind", () => {
    expect(() => feedbackSchema.parse({ message: "hi" })).toThrow();
  });

  it("rejects an empty message", () => {
    expect(() => feedbackSchema.parse({ kind: "PRAISE", message: "" })).toThrow();
  });

  it("rejects a whitespace-only message (empty after trim)", () => {
    expect(() => feedbackSchema.parse({ kind: "PRAISE", message: "   " })).toThrow();
  });

  it("rejects an unknown area", () => {
    expect(() => feedbackSchema.parse({ kind: "IDEA", message: "x", area: "JOBS" })).toThrow();
  });
});

describe("containsContactInfo", () => {
  it("flags emails, phones and contact phrases", () => {
    expect(containsContactInfo("reach me at a@b.com")).toBe(true);
    expect(containsContactInfo("call 0049 1234 5678")).toBe(true);
    expect(containsContactInfo("email me please")).toBe(true);
  });
  it("passes ordinary feedback", () => {
    expect(containsContactInfo("the radar was confusing at first")).toBe(false);
  });
});

describe("sanitizeMessage", () => {
  it("trims, collapses whitespace and caps at 1000 chars", () => {
    expect(sanitizeMessage("  a   b  ")).toBe("a b");
    expect(sanitizeMessage("x".repeat(1200)).length).toBe(1000);
  });
});

import { describe, it, expect } from "vitest";
import {
  estimateCostUsd,
  estimateTokens,
  getModelRate,
  FALLBACK_RATE,
  MODEL_RATES,
} from "@/lib/ai-usage/pricing";

describe("getModelRate", () => {
  it("matches a known model exactly", () => {
    expect(getModelRate("gpt-4o-mini")).toEqual(MODEL_RATES["gpt-4o-mini"]);
  });

  it("is case-insensitive", () => {
    expect(getModelRate("GPT-4o-Mini")).toEqual(MODEL_RATES["gpt-4o-mini"]);
  });

  it("resolves a pinned/dated model to its family, longest prefix winning", () => {
    // Must NOT fall through to the 16x more expensive "gpt-4o" rate.
    expect(getModelRate("gpt-4o-mini-2024-07-18")).toEqual(MODEL_RATES["gpt-4o-mini"]);
  });

  it("over-estimates an unknown model so the ceiling trips early, not late", () => {
    expect(getModelRate("some-future-model")).toEqual(FALLBACK_RATE);
    expect(getModelRate(null)).toEqual(FALLBACK_RATE);
  });
});

describe("estimateCostUsd", () => {
  it("prices a typical Career Twin turn", () => {
    // 1,200 in + 400 out on gpt-4o-mini = $0.00018 + $0.00024
    expect(estimateCostUsd("gpt-4o-mini", 1200, 400)).toBeCloseTo(0.00042, 6);
  });

  it("is zero for a refused request that never reached the provider", () => {
    expect(estimateCostUsd("gpt-4o-mini", 0, 0)).toBe(0);
  });

  it("treats nonsense token counts as zero rather than throwing", () => {
    expect(estimateCostUsd("gpt-4o-mini", -50, Number.NaN)).toBe(0);
  });

  it("rounds to the 6dp precision of the database column", () => {
    const cost = estimateCostUsd("gpt-4o-mini", 1, 1);
    expect(cost.toString()).toBe((Math.round(cost * 1e6) / 1e6).toString());
  });
});

describe("estimateTokens", () => {
  it("rounds up so a fallback estimate never under-counts spend", () => {
    expect(estimateTokens("abcde")).toBe(2);
    expect(estimateTokens("")).toBe(0);
  });
});

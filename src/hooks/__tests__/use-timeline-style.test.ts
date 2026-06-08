import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTimelineStyle } from "../use-timeline-style";

beforeEach(() => localStorage.clear());

describe("useTimelineStyle", () => {
  it("defaults to rail when nothing is stored (hard rule)", () => {
    const { result } = renderHook(() => useTimelineStyle());
    expect(result.current.style).toBe("rail");
  });

  it("respects an explicit stored stepping choice", () => {
    localStorage.setItem("endeavrly-timeline-style", "stepping");
    const { result } = renderHook(() => useTimelineStyle());
    expect(result.current.style).toBe("stepping");
  });

  it("falls back to rail for an invalid/legacy stored value", () => {
    localStorage.setItem("endeavrly-timeline-style", "zigzag");
    const { result } = renderHook(() => useTimelineStyle());
    expect(result.current.style).toBe("rail");
  });
});

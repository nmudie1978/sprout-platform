import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTimelineStyle } from "../use-timeline-style";

beforeEach(() => localStorage.clear());

describe("useTimelineStyle", () => {
  it("defaults to winding when nothing is stored (hard rule)", () => {
    const { result } = renderHook(() => useTimelineStyle());
    expect(result.current.style).toBe("winding");
  });

  it("respects an explicit stored stepping-stones choice", () => {
    localStorage.setItem("endeavrly-timeline-style", "stepping-stones");
    const { result } = renderHook(() => useTimelineStyle());
    expect(result.current.style).toBe("stepping-stones");
  });

  it("migrates the legacy 'rail' value to winding", () => {
    localStorage.setItem("endeavrly-timeline-style", "rail");
    const { result } = renderHook(() => useTimelineStyle());
    expect(result.current.style).toBe("winding");
  });

  it("migrates the legacy 'stepping' value to stepping-stones", () => {
    localStorage.setItem("endeavrly-timeline-style", "stepping");
    const { result } = renderHook(() => useTimelineStyle());
    expect(result.current.style).toBe("stepping-stones");
  });

  it("falls back to winding for an invalid/legacy stored value", () => {
    localStorage.setItem("endeavrly-timeline-style", "zigzag");
    const { result } = renderHook(() => useTimelineStyle());
    expect(result.current.style).toBe("winding");
  });
});

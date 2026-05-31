import { describe, it, expect } from "vitest";
import { resolveLibraryTab, filterAnsweredReflections, LIBRARY_TABS } from "../tabs";
import type { ReflectionData } from "@/lib/journey/reflections-service";

describe("resolveLibraryTab", () => {
  it("defaults to 'saved' when param is null", () => {
    expect(resolveLibraryTab(null)).toBe("saved");
  });
  it("defaults to 'saved' for an unknown value", () => {
    expect(resolveLibraryTab("bogus")).toBe("saved");
  });
  it("accepts each known tab", () => {
    for (const tab of LIBRARY_TABS) {
      expect(resolveLibraryTab(tab.key)).toBe(tab.key);
    }
  });
  it("is case-insensitive", () => {
    expect(resolveLibraryTab("Reflections")).toBe("reflections");
  });
});

describe("filterAnsweredReflections", () => {
  const base: Omit<ReflectionData, "response" | "skipped"> = {
    id: "1",
    profileId: "p",
    contextType: "CAREER_DISCOVERY",
    contextId: null,
    prompt: "p",
    createdAt: "2026-01-01",
  };
  it("keeps answered, non-skipped reflections", () => {
    const r: ReflectionData[] = [{ ...base, response: "yes", skipped: false }];
    expect(filterAnsweredReflections(r)).toHaveLength(1);
  });
  it("drops skipped reflections even if they have a response", () => {
    const r: ReflectionData[] = [{ ...base, response: "yes", skipped: true }];
    expect(filterAnsweredReflections(r)).toHaveLength(0);
  });
  it("drops reflections with null/empty response", () => {
    const r: ReflectionData[] = [
      { ...base, response: null, skipped: false },
      { ...base, response: "   ", skipped: false },
    ];
    expect(filterAnsweredReflections(r)).toHaveLength(0);
  });
});

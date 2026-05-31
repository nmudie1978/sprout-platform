import { describe, it, expect } from "vitest";
import {
  resolveLibraryTab,
  filterAnsweredReflections,
  readLocalJourneyReflections,
  LIBRARY_TABS,
} from "../tabs";
import type { ReflectionData } from "@/lib/journey/reflections-service";

/** Minimal in-memory Storage stand-in for the pure reader. */
function fakeStorage(map: Record<string, string>): Pick<Storage, "length" | "key" | "getItem"> {
  const keys = Object.keys(map);
  return {
    length: keys.length,
    key: (i: number) => keys[i] ?? null,
    getItem: (k: string) => (k in map ? map[k] : null),
  };
}

const PREFIX = "endeavrly-journey-reflections";

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

describe("readLocalJourneyReflections", () => {
  it("returns [] when userId is empty", () => {
    const s = fakeStorage({ [`${PREFIX}:u1:nurse`]: JSON.stringify({ discover: "hi" }) });
    expect(readLocalJourneyReflections("", s)).toHaveLength(0);
  });

  it("only reads keys for the given user and prefix", () => {
    const s = fakeStorage({
      [`${PREFIX}:u1:nurse`]: JSON.stringify({ discover: "mine", updatedAt: "2026-01-02" }),
      [`${PREFIX}:u2:nurse`]: JSON.stringify({ discover: "someone else", updatedAt: "2026-01-02" }),
      "unrelated-key": "ignore me",
    });
    const out = readLocalJourneyReflections("u1", s);
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe("mine");
    expect(out[0].careerSlug).toBe("nurse");
  });

  it("emits one entry per non-empty lens and skips blank ones", () => {
    const s = fakeStorage({
      [`${PREFIX}:u1:nurse`]: JSON.stringify({
        discover: "d",
        understand: "   ",
        clarity: "c",
        updatedAt: "2026-01-01",
      }),
    });
    const out = readLocalJourneyReflections("u1", s);
    expect(out.map((e) => e.lens)).toEqual(["discover", "clarity"]);
    expect(out[0].lensLabel).toBe("Discover");
  });

  it("sorts newest first across careers", () => {
    const s = fakeStorage({
      [`${PREFIX}:u1:nurse`]: JSON.stringify({ discover: "old", updatedAt: "2026-01-01" }),
      [`${PREFIX}:u1:pilot`]: JSON.stringify({ discover: "new", updatedAt: "2026-02-01" }),
    });
    const out = readLocalJourneyReflections("u1", s);
    expect(out.map((e) => e.text)).toEqual(["new", "old"]);
  });

  it("ignores malformed JSON without throwing", () => {
    const s = fakeStorage({
      [`${PREFIX}:u1:nurse`]: "{not json",
      [`${PREFIX}:u1:pilot`]: JSON.stringify({ clarity: "ok", updatedAt: "2026-01-01" }),
    });
    const out = readLocalJourneyReflections("u1", s);
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe("ok");
  });
});

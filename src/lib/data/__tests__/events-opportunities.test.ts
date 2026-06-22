import { describe, it, expect } from "vitest";
import {
  EXTERNAL_SOURCES,
  EVENT_CATEGORIES,
  OPPORTUNITY_CATEGORIES,
  ALL_EVENT_OPP_URLS,
  filterSources,
  filterCategories,
} from "../events-opportunities";

describe("events-opportunities data", () => {
  it("every configured external URL is a valid absolute http(s) URL", () => {
    expect(ALL_EVENT_OPP_URLS.length).toBeGreaterThan(0);
    for (const url of ALL_EVENT_OPP_URLS) {
      const u = new URL(url); // throws on invalid
      expect(["http:", "https:"]).toContain(u.protocol);
    }
  });

  it("has 5 event categories and the 5 opportunity types in order", () => {
    expect(EVENT_CATEGORIES).toHaveLength(5);
    expect(OPPORTUNITY_CATEGORIES.map((c) => c.type)).toEqual([
      "apprenticeships", "internships", "graduate-programs", "student-jobs", "entry-level",
    ]);
  });

  it("Internships filter includes the expected sources", () => {
    const ids = filterSources(EXTERNAL_SOURCES, { type: "internships" }).map((s) => s.id);
    for (const id of ["glassdoor-internships", "the-hub", "graduateland", "academic-work", "linkedin-jobs", "finn-jobb", "nav-arbeidsplassen"]) {
      expect(ids).toContain(id);
    }
  });

  it("Apprenticeships filter includes NAV, FINN and Jobbnorge", () => {
    const ids = filterSources(EXTERNAL_SOURCES, { type: "apprenticeships" }).map((s) => s.id);
    for (const id of ["nav-arbeidsplassen", "finn-jobb", "jobbnorge"]) expect(ids).toContain(id);
  });

  it("Graduate Programs filter includes LinkedIn Jobs, FINN, Graduateland, Academic Work", () => {
    const ids = filterSources(EXTERNAL_SOURCES, { type: "graduate-programs" }).map((s) => s.id);
    for (const id of ["linkedin-jobs", "finn-jobb", "graduateland", "academic-work"]) expect(ids).toContain(id);
  });

  it("query filter matches name / tags / search terms; nonsense returns empty", () => {
    expect(filterSources(EXTERNAL_SOURCES, { query: "lærling" }).some((s) => s.id === "finn-jobb" || s.id === "nav-arbeidsplassen")).toBe(true);
    expect(filterSources(EXTERNAL_SOURCES, { query: "zzzznope-not-a-thing" })).toHaveLength(0);
  });

  it("location scoping keeps nation-wide sources and drops city-only ones elsewhere", () => {
    const oslo = filterSources(EXTERNAL_SOURCES, { location: "oslo" }).map((s) => s.id);
    expect(oslo).toContain("uio-careers"); // Oslo-scoped
    expect(oslo).toContain("nav-arbeidsplassen"); // nation-wide always matches
    const bergen = filterSources(EXTERNAL_SOURCES, { location: "bergen" }).map((s) => s.id);
    expect(bergen).not.toContain("uio-careers");
  });

  it("filterCategories narrows by text and returns all when empty", () => {
    expect(filterCategories(OPPORTUNITY_CATEGORIES, "")).toHaveLength(5);
    const r = filterCategories(OPPORTUNITY_CATEGORIES, "apprentice");
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((c) => `${c.name} ${c.description}`.toLowerCase().includes("appren") || (c.searchTerms ?? []).join(" ").includes("appren"))).toBe(true);
  });
});

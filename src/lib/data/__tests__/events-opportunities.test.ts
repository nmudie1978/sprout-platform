import { describe, it, expect } from "vitest";
import {
  EXTERNAL_SOURCES,
  EVENT_CATEGORIES,
  OPPORTUNITY_CATEGORIES,
  ALL_EVENT_OPP_URLS,
  GLOBAL_SOURCES,
  filterSources,
  filterCategories,
  getSourcesForCountry,
  getLocationOptions,
  eventSearchQuery,
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

describe("events-opportunities — country tailoring", () => {
  const ids = (country?: string | null) => getSourcesForCountry(country).map((s) => s.id);

  it("Norway shows NAV/FINN/Jobbnorge and NOT Spanish/Swedish portals", () => {
    const no = ids("Norway");
    expect(no).toContain("nav-arbeidsplassen");
    expect(no).toContain("finn-jobb");
    expect(no).toContain("jobbnorge");
    expect(no).not.toContain("sepe");
    expect(no).not.toContain("arbetsformedlingen");
  });

  it("Spain shows SEPE/InfoJobs and NOT Norwegian portals", () => {
    const es = ids("Spain");
    expect(es).toContain("sepe");
    expect(es).toContain("infojobs");
    expect(es).not.toContain("nav-arbeidsplassen");
    expect(es).not.toContain("finn-jobb");
  });

  it("Sweden shows Arbetsförmedlingen; Denmark shows Jobnet", () => {
    expect(ids("Sweden")).toContain("arbetsformedlingen");
    expect(ids("Denmark")).toContain("jobnet");
    expect(ids("Sweden")).not.toContain("nav-arbeidsplassen");
  });

  it("global sources appear for every country, known or not", () => {
    const globalIds = GLOBAL_SOURCES.map((s) => s.id);
    for (const country of ["Norway", "Spain", "Sweden", "Denmark", "Germany", null, undefined]) {
      for (const g of globalIds) expect(ids(country)).toContain(g);
    }
    expect(globalIds).toContain("linkedin-pathways");
    expect(globalIds).toContain("eures");
  });

  it("unknown/missing country falls back to GLOBAL only (no wrong-country portals)", () => {
    expect(ids("Germany")).toEqual(GLOBAL_SOURCES.map((s) => s.id));
    expect(ids(null)).toEqual(GLOBAL_SOURCES.map((s) => s.id));
    expect(ids("Germany")).not.toContain("nav-arbeidsplassen");
    expect(ids("Germany")).not.toContain("sepe");
  });

  it("location options are country-aware", () => {
    const no = getLocationOptions("Norway");
    expect(no[0]).toEqual({ value: "all", label: "All Norway" });
    expect(no.map((o) => o.value)).toContain("oslo");
    expect(no.map((o) => o.value)).not.toContain("madrid");

    const es = getLocationOptions("Spain");
    expect(es[0]).toEqual({ value: "all", label: "All Spain" });
    expect(es.map((o) => o.value)).toContain("madrid");

    // Unknown country → neutral "All locations" + remote, no cities.
    const xx = getLocationOptions("Germany");
    expect(xx[0]).toEqual({ value: "all", label: "All locations" });
    expect(xx.map((o) => o.value)).toEqual(["all", "remote"]);
  });

  it("every country's location options end with Remote / Online", () => {
    for (const country of ["Norway", "Spain", "Sweden", "Denmark", "Germany"]) {
      const opts = getLocationOptions(country);
      expect(opts[opts.length - 1]).toEqual({ value: "remote", label: "Remote / Online" });
    }
  });

  it("event search query is tailored to the country", () => {
    expect(eventSearchQuery("job-fairs", "Spain")).toBe("job fair career fair Spain");
    expect(eventSearchQuery("open-days", "Norway")).toBe("university open day Norway");
    // No country → generic query (no trailing space).
    expect(eventSearchQuery("job-fairs", null)).toBe("job fair career fair");
  });
});

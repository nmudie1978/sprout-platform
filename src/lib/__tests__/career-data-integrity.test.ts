/**
 * Career data integrity guards.
 *
 * These tests exist because a data-shape bug (13 careers sharing duplicate
 * ids) reached production and crashed the careers page with a duplicate React
 * key. The UI keys careers by `id`, so duplicate or malformed ids are a
 * crash/skip risk. This suite turns "a user finds it in prod" into "the commit
 * is blocked" — it runs in the pre-commit hook and CI.
 *
 * It validates the *source* (`CAREER_PATHWAYS`), not just the deduped
 * `getAllCareers()` output, so a newly-introduced duplicate can't slip through
 * the dedupe safety net unnoticed.
 */
import { describe, it, expect } from "vitest";
import { CAREER_PATHWAYS, getAllCareers, type Career } from "@/lib/career-pathways";

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_GROWTH = new Set(["high", "medium", "stable"]);
const VALID_SECTOR = new Set(["public", "private", "mixed"]);

/** Every career object across every category, WITHOUT deduping. */
function flatSourceCareers(): Career[] {
  return Object.values(CAREER_PATHWAYS).flat();
}

describe("career data integrity", () => {
  it("has at least one career in every category", () => {
    for (const [category, careers] of Object.entries(CAREER_PATHWAYS)) {
      expect(careers.length, `category "${category}" is empty`).toBeGreaterThan(0);
    }
  });

  it("cross-listed careers are identical across categories", () => {
    // A career may legitimately appear in more than one category (it shows
    // under both category tabs). But every copy of a given id MUST be the
    // same career — divergent facts (salary, education path, etc.) for the
    // same id mean the user sees different data depending on how they
    // navigated, and the detail page (first-match) silently wins.
    const byId = new Map<string, Career[]>();
    for (const c of flatSourceCareers()) {
      const list = byId.get(c.id) ?? [];
      list.push(c);
      byId.set(c.id, list);
    }
    const divergent: string[] = [];
    for (const [id, copies] of byId) {
      if (copies.length < 2) continue;
      const canonical = JSON.stringify(copies[0]);
      if (copies.some((c) => JSON.stringify(c) !== canonical)) divergent.push(id);
    }
    expect(divergent, `cross-listed careers with conflicting content:\n${divergent.join("\n")}`).toEqual([]);
  });

  it("getAllCareers() returns unique ids", () => {
    const ids = getAllCareers().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every career id is non-empty kebab-case", () => {
    const bad = flatSourceCareers().filter((c) => !KEBAB_CASE.test(c.id ?? "")).map((c) => c.id || "(empty)");
    expect(bad, `non-kebab-case ids:\n${bad.join("\n")}`).toEqual([]);
  });

  it("every career has the required fields, correctly typed and non-empty", () => {
    const problems: string[] = [];
    for (const c of flatSourceCareers()) {
      const where = c.id || c.title || "(unknown)";
      if (!c.title?.trim()) problems.push(`${where}: missing title`);
      if (!c.emoji?.trim()) problems.push(`${where}: missing emoji`);
      if (!c.description?.trim()) problems.push(`${where}: missing description`);
      if (!c.avgSalary?.trim()) problems.push(`${where}: missing avgSalary`);
      if (!c.educationPath?.trim()) problems.push(`${where}: missing educationPath`);
      if (!Array.isArray(c.keySkills) || c.keySkills.length === 0) problems.push(`${where}: empty keySkills`);
      if (!Array.isArray(c.dailyTasks) || c.dailyTasks.length === 0) problems.push(`${where}: empty dailyTasks`);
      if (!VALID_GROWTH.has(c.growthOutlook)) problems.push(`${where}: invalid growthOutlook "${c.growthOutlook}"`);
      if (c.sector !== undefined && !VALID_SECTOR.has(c.sector)) problems.push(`${where}: invalid sector "${c.sector}"`);
    }
    expect(problems, `career field problems:\n${problems.slice(0, 40).join("\n")}`).toEqual([]);
  });

  it("has a healthy number of careers", () => {
    // Sanity floor — guards against an accidental data wipe / bad merge.
    expect(getAllCareers().length).toBeGreaterThan(500);
  });
});

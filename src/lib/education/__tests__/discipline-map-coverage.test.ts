import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { DISCIPLINE_IDS } from "../disciplines";
import mapData from "../data/career-discipline-map.json";

const src = readFileSync("src/lib/career-pathways.ts", "utf8");
const careerIds = Array.from(
  new Set(Array.from(src.matchAll(/id: "([a-z0-9][a-z0-9-]*)"/g), (m) => m[1])),
);
const map = (mapData as { map: Record<string, string> }).map;
const valid = new Set<string>(DISCIPLINE_IDS as readonly string[]);

describe("discipline map coverage", () => {
  it("maps every catalogue career to a valid bucket", () => {
    const unmapped = careerIds.filter((id) => !map[id]);
    expect(unmapped).toEqual([]);
    const badBucket = Object.values(map).filter((b) => !valid.has(b));
    expect(badBucket).toEqual([]);
  });

  // Regression: the map-building pass keyed on title tokens, so non-software
  // "*-developer" careers (food/curriculum/property/real-estate) were wrongly
  // bucketed into computer-science-software and surfaced as "close cousins" of
  // DevOps Engineer in the Career Transition Map. Lock the correct buckets in.
  it("does not bucket non-software '*-developer' careers into software", () => {
    const expectedBuckets: Record<string, string> = {
      "food-product-developer": "agriculture-food",
      "curriculum-developer": "education-teaching",
      "property-developer": "real-estate",
      "real-estate-developer": "real-estate",
    };
    for (const [careerId, bucket] of Object.entries(expectedBuckets)) {
      expect(map[careerId], careerId).toBe(bucket);
    }
  });
});

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
});

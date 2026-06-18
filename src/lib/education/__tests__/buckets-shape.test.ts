import { describe, it, expect } from "vitest";
import data from "../data/discipline-buckets.json";
import { DISCIPLINE_IDS } from "../disciplines";

const buckets = (data as any).buckets as Array<any>;

describe("discipline buckets data", () => {
  it("every bucket has a NO local + >=1 europe entry, valid ids", () => {
    const ids = new Set(DISCIPLINE_IDS as readonly string[]);
    for (const b of buckets) {
      expect(ids.has(b.id)).toBe(true);
      expect((b.local?.NO ?? []).length).toBeGreaterThanOrEqual(1);
      expect((b.europe ?? []).length).toBeGreaterThanOrEqual(1);
    }
  });
});

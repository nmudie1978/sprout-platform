import { describe, it, expect } from "vitest";
import { validateInsightItems } from "../validate-insight-url";

type Item = { id: string };
const items = (n: number): Item[] =>
  Array.from({ length: n }, (_, i) => ({ id: `item-${i}` }));
const key = (it: Item) => it.id;

describe("validateInsightItems", () => {
  it("filters out items the validator marks dead (fast path)", async () => {
    const result = await validateInsightItems(
      items(4),
      key,
      async (k) => k !== "item-2", // item-2 is "dead"
      { budgetMs: 5000, concurrency: 4 },
    );
    expect(result.map(key)).toEqual(["item-0", "item-1", "item-3"]);
  });

  it("keeps un-validated items once the time budget is exhausted", async () => {
    // A slow validator that would filter EVERYTHING if allowed to run. With a
    // tiny budget and concurrency 5, only the first batch (items 0-4) is
    // validated (and filtered); the rest must be kept rather than waited on,
    // so a cold cache can never stall the request on slow hosts.
    const slowAlwaysDead = async () => {
      await new Promise((r) => setTimeout(r, 60));
      return false;
    };
    const start = Date.now();
    const result = await validateInsightItems(items(13), key, slowAlwaysDead, {
      budgetMs: 10,
      concurrency: 5,
    });
    const elapsed = Date.now() - start;

    // Items 5..12 are past the budget → kept unvalidated.
    expect(result.map(key)).toEqual([
      "item-5", "item-6", "item-7", "item-8", "item-9", "item-10", "item-11", "item-12",
    ]);
    // Only ~one batch of validation ran, not all three.
    expect(elapsed).toBeLessThan(200);
  });
});

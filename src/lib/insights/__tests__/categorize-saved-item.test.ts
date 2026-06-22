import { describe, it, expect } from "vitest";
import { categorizeSavedItem, TRANSITION_MAP_TAG } from "../saved-content";

describe("categorizeSavedItem", () => {
  it("buckets a transition-map tag as a mindmap (tag wins over type)", () => {
    expect(categorizeSavedItem({ type: "ARTICLE", tags: [TRANSITION_MAP_TAG] })).toBe("mindmaps");
  });
  it("buckets videos and shorts as videos", () => {
    expect(categorizeSavedItem({ type: "VIDEO" })).toBe("videos");
    expect(categorizeSavedItem({ type: "SHORT" })).toBe("videos");
  });
  it("buckets podcasts and articles", () => {
    expect(categorizeSavedItem({ type: "PODCAST" })).toBe("podcasts");
    expect(categorizeSavedItem({ type: "ARTICLE" })).toBe("articles");
    expect(categorizeSavedItem({ type: null, tags: [] })).toBe("articles");
  });
});

import { describe, it, expect, vi, afterEach } from "vitest";
import { verifyPoolItem } from "../verify-pool";
import type { PoolItem } from "../pool-types";

function makeItem(overrides: Partial<PoolItem> = {}): PoolItem {
  return {
    id: "x",
    title: "t",
    summary: "s",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    contentType: "article",
    tags: [],
    domain: "weforum.org", // on the curated tier-1 allow-list
    addedAt: "2026-01-01T00:00:00Z",
    lastVerifiedAt: "2026-01-01T00:00:00Z",
    verificationStatus: "pending",
    canonicalUrlHash: "h",
    ...overrides,
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("verifyPoolItem — network handling", () => {
  it("keeps a trusted host VERIFIED when every fetch throws (anti-bot/timeout/reset)", async () => {
    // The regression behind the 49% false-fail: tier-1 sites block the CI
    // runner at the network layer, so fetch throws rather than returning 403.
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const result = await verifyPoolItem(makeItem());
    expect(result.verificationStatus).toBe("verified");
  });

  it("still FAILS a trusted host on an explicit 404", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    const result = await verifyPoolItem(makeItem());
    expect(result.verificationStatus).toBe("failed");
  });

  it("VERIFIES a trusted host on a 200 HEAD", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, { status: 200, headers: { "content-type": "text/html" } }),
      ),
    );
    const result = await verifyPoolItem(makeItem());
    expect(result.verificationStatus).toBe("verified");
  });

  it("FAILS an untrusted domain without making any request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await verifyPoolItem(makeItem({ domain: "some-random-blog.example" }));
    expect(result.verificationStatus).toBe("failed");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

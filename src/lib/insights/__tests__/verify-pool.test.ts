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

/**
 * Method-aware fetch mock. `head`/`get` are HTTP statuses or the string
 * "throw" to reject. Bodies are long enough to clear the soft-404 guard.
 */
function mockFetch(opts: { head?: number | "throw"; get?: number | "throw" }) {
  return vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
    const which = init?.method === "GET" ? opts.get : opts.head;
    if (which === "throw" || which === undefined) {
      return Promise.reject(new Error("network"));
    }
    const body = which === 200 ? "x".repeat(2000) : null;
    return Promise.resolve(
      new Response(body, { status: which, headers: { "content-type": "text/html" } }),
    );
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("verifyPoolItem — network handling", () => {
  it("keeps a trusted host VERIFIED when every fetch throws (anti-bot/timeout/reset)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    expect((await verifyPoolItem(makeItem())).verificationStatus).toBe("verified");
  });

  it("VERIFIES a trusted host on a 200 HEAD (no GET needed)", async () => {
    const fetchMock = mockFetch({ head: 200, get: 200 });
    vi.stubGlobal("fetch", fetchMock);
    expect((await verifyPoolItem(makeItem())).verificationStatus).toBe("verified");
    // Only HEAD should have been issued.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps a trusted host VERIFIED when HEAD AND GET both return 403 (anti-bot, e.g. WEF/OECD)", async () => {
    vi.stubGlobal("fetch", mockFetch({ head: 403, get: 403 }));
    expect((await verifyPoolItem(makeItem())).verificationStatus).toBe("verified");
  });

  it("FAILS a trusted host when a 403 HEAD masks a real 404 on GET (e.g. UNICEF)", async () => {
    // HEAD is unreliable — confirm with GET, which reveals the genuine 404.
    vi.stubGlobal("fetch", mockFetch({ head: 403, get: 404 }));
    expect((await verifyPoolItem(makeItem())).verificationStatus).toBe("failed");
  });

  it("FAILS a trusted host on an explicit 404 (genuine link rot)", async () => {
    vi.stubGlobal("fetch", mockFetch({ head: 404, get: 404 }));
    expect((await verifyPoolItem(makeItem())).verificationStatus).toBe("failed");
  });

  it("FAILS an untrusted domain without making any request", async () => {
    const fetchMock = mockFetch({ head: 200, get: 200 });
    vi.stubGlobal("fetch", fetchMock);
    expect(
      (await verifyPoolItem(makeItem({ domain: "some-random-blog.example" }))).verificationStatus,
    ).toBe("failed");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

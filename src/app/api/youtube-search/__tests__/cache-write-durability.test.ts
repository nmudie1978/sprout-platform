import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The cache write on a MISS must COMPLETE before the route responds.
 *
 * These routes run as serverless functions. Work that is still pending when the
 * response is returned may never run: the instance can be frozen or reclaimed
 * the moment the response is flushed. A fire-and-forget
 * `prisma.videoCache.upsert(...).catch(...)` therefore isn't a latency
 * optimisation, it's a coin flip — and when it loses, the next request for the
 * same career repeats 2-4 YouTube searches at 100 quota units each against a
 * single 10k/day key. That quota pressure is what poisoned the cache in #282.
 *
 * `career-reality/route.ts` already awaits its write to the very same table;
 * this pins the same guarantee here.
 */

const upsertCalls: { settled: boolean }[] = [];

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  upsert: vi.fn(),
  getServerSession: vi.fn(),
  checkRateLimitAsync: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimitAsync: mocks.checkRateLimitAsync,
  RateLimits: { AI_CHAT: { limit: 10, windowMs: 1000 } },
}));
vi.mock("@/lib/observability", () => ({
  logAndSwallow: () => () => {},
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    videoCache: {
      findUnique: mocks.findUnique,
      upsert: mocks.upsert,
    },
  },
}));

const { GET } = await import("../route");

/** A YouTube search response with one usable video. */
function youtubePayload() {
  return {
    ok: true,
    json: async () => ({
      items: [
        { id: { videoId: "abc123" }, snippet: { title: "Day in the life of a Personal Trainer" } },
      ],
    }),
  };
}

beforeEach(() => {
  upsertCalls.length = 0;
  vi.clearAllMocks();

  process.env.YOUTUBE_API_KEY = "test-key";
  mocks.getServerSession.mockResolvedValue({ user: { id: "user-1" } });
  mocks.checkRateLimitAsync.mockResolvedValue({ success: true });
  // Cache MISS — forces the upstream call and the cache write.
  mocks.findUnique.mockResolvedValue(null);

  // A write that takes a few ticks, like a real network round-trip. If the
  // route doesn't await it, `settled` is still false when GET resolves.
  mocks.upsert.mockImplementation(() => {
    const call = { settled: false };
    upsertCalls.push(call);
    return new Promise((resolve) => {
      setTimeout(() => {
        call.settled = true;
        resolve({});
      }, 10);
    });
  });

  vi.stubGlobal("fetch", vi.fn(async () => youtubePayload()));
});

describe("/api/youtube-search cache write durability", () => {
  it("finishes writing the cache entry before responding on a miss", async () => {
    const { NextRequest } = await import("next/server");
    const req = new NextRequest(
      "http://localhost/api/youtube-search?career=Personal%20Trainer",
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    expect(upsertCalls).toHaveLength(1);
    expect(
      upsertCalls[0].settled,
      "cache write was still pending when the route responded — on Vercel the " +
        "function can be frozen here and the write lost entirely",
    ).toBe(true);
  });

  it("still responds when the cache write fails", async () => {
    mocks.upsert.mockImplementation(() => Promise.reject(new Error("db down")));

    const { NextRequest } = await import("next/server");
    const req = new NextRequest(
      "http://localhost/api/youtube-search?career=Personal%20Trainer",
    );

    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    // A failed cache write must never cost the user their videos.
    expect(body.videos).toHaveLength(1);
  });
});

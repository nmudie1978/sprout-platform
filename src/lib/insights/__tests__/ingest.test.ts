import { describe, it, expect } from "vitest";
import {
  parseFeed,
  filterRelevant,
  dedupe,
  screenSafe,
  toPoolItem,
} from "../ingest";

const SAMPLE = `<?xml version="1.0"?><rss><channel>
<item><title>The future of work in 2026</title><link>https://www.weforum.org/a</link>
<description>How AI reshapes careers for young people.</description>
<pubDate>Wed, 10 Jun 2026 00:00:00 GMT</pubDate></item>
</channel></rss>`;

describe("parseFeed", () => {
  it("extracts items from RSS", () => {
    const items = parseFeed(SAMPLE);
    expect(items[0]).toMatchObject({
      title: "The future of work in 2026",
      url: "https://www.weforum.org/a",
    });
    expect(items[0].summary).toContain("AI");
  });

  it("extracts items from Atom (link href + summary)", () => {
    const atom = `<feed><entry><title>Skills for careers</title>
      <link href="https://www.oecd.org/x"/><summary>jobs and skills</summary>
      <updated>2026-06-10T00:00:00Z</updated></entry></feed>`;
    const items = parseFeed(atom);
    expect(items[0]).toMatchObject({
      title: "Skills for careers",
      url: "https://www.oecd.org/x",
    });
  });
});

describe("filterRelevant", () => {
  it("keeps recent + keyword-matching items only", () => {
    const recent = {
      title: "Jobs of the future",
      url: "u",
      summary: "careers and skills",
      publishDate: new Date("2026-06-10T00:00:00Z").toISOString(),
    };
    const old = {
      title: "Jobs",
      url: "v",
      summary: "careers",
      publishDate: "2000-01-01T00:00:00Z",
    };
    const offtopic = {
      title: "Quarterly earnings call",
      url: "w",
      summary: "dividend payout",
      publishDate: new Date("2026-06-10T00:00:00Z").toISOString(),
    };
    const out = filterRelevant(
      [recent, old, offtopic],
      new Date("2026-06-12T00:00:00Z")
    );
    expect(out.map((i) => i.url)).toEqual(["u"]);
  });
});

describe("dedupe", () => {
  it("drops items whose canonical hash is already known", () => {
    const item = {
      title: "t",
      url: "https://x.com/a?utm_source=rss",
      summary: "s",
    };
    const first = dedupe([item], new Set());
    expect(first).toHaveLength(1);
    const seen = new Set(first.map((i) => i.urlHash));
    expect(dedupe([item], seen)).toEqual([]);
  });

  it("drops duplicates within the same batch", () => {
    const a = { title: "t", url: "https://x.com/a", summary: "s" };
    const b = { title: "t2", url: "https://x.com/a#frag", summary: "s2" };
    expect(dedupe([a, b], new Set())).toHaveLength(1);
  });
});

describe("screenSafe", () => {
  it("accepts safe content and rejects unsafe", () => {
    expect(screenSafe({ title: "safe careers piece", summary: "s" })).toBe(true);
    expect(screenSafe({ title: "online casino betting", summary: "s" })).toBe(
      false
    );
  });
});

describe("toPoolItem", () => {
  it("maps to a verified PoolItem shape", () => {
    const p = toPoolItem(
      {
        title: "t",
        url: "https://www.weforum.org/a",
        summary: "s",
        urlHash: "abc123def456",
        publishDate: undefined,
      },
      { source: "WEF", contentType: "article", defaultTags: ["x"] }
    );
    expect(p).toMatchObject({
      title: "t",
      sourceUrl: "https://www.weforum.org/a",
      contentType: "article",
      verificationStatus: "verified",
      canonicalUrlHash: "abc123def456",
      domain: "weforum.org",
      sourceName: "WEF",
    });
  });
});

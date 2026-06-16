import { describe, it, expect } from "vitest";
import {
  parseFeed,
  cleanText,
  isRelevant,
  feedItemToCandidate,
  selectFreshCandidates,
  type FeedConfig,
  type RawFeedItem,
} from "../rss-ingest";
import type { SeedCandidate } from "../pool-types";

const RSS_SAMPLE = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <title>Sample</title>
  <item>
    <title>How AI is reshaping careers for young people</title>
    <link>https://www.weforum.org/stories/2026/03/ai-careers/</link>
    <description><![CDATA[<p>A look at the <b>skills</b> that matter most as AI changes work.</p>]]></description>
    <pubDate>Mon, 02 Mar 2026 09:00:00 GMT</pubDate>
  </item>
  <item>
    <title>A recipe for the perfect sourdough</title>
    <link>https://www.weforum.org/stories/2026/02/sourdough/</link>
    <description>Baking bread at home.</description>
    <pubDate>Tue, 10 Feb 2026 09:00:00 GMT</pubDate>
  </item>
</channel></rss>`;

const ATOM_SAMPLE = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>The future of work &amp; skills in 2026</title>
    <link href="https://ourworldindata.org/future-of-work-2026"/>
    <summary>What the data says about jobs and employment trends.</summary>
    <published>2026-01-15T00:00:00Z</published>
  </entry>
</feed>`;

const FEED: FeedConfig = {
  feedUrl: "https://www.weforum.org/feed/",
  sourceName: "World Economic Forum",
  contentType: "article",
  defaultTags: ["future-of-work"],
};

describe("parseFeed", () => {
  it("parses RSS 2.0 items with CDATA descriptions", () => {
    const items = parseFeed(RSS_SAMPLE);
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe("How AI is reshaping careers for young people");
    expect(items[0].link).toBe("https://www.weforum.org/stories/2026/03/ai-careers/");
    expect(items[0].date).toContain("Mar 2026");
  });

  it("parses Atom entries with href links and entity-encoded titles", () => {
    const items = parseFeed(ATOM_SAMPLE);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("The future of work & skills in 2026");
    expect(items[0].link).toBe("https://ourworldindata.org/future-of-work-2026");
  });

  it("returns [] for malformed XML rather than throwing", () => {
    expect(parseFeed("not xml at all")).toEqual([]);
    expect(parseFeed("")).toEqual([]);
  });
});

describe("cleanText", () => {
  it("strips HTML tags and decodes entities", () => {
    expect(cleanText("<p>Hello &amp; <b>welcome</b></p>")).toBe("Hello & welcome");
  });
  it("collapses whitespace and trims", () => {
    expect(cleanText("  a\n\n  b   c ")).toBe("a b c");
  });
  it("truncates very long text to a summary length", () => {
    const long = "word ".repeat(100);
    expect(cleanText(long).length).toBeLessThanOrEqual(300);
  });
});

describe("isRelevant", () => {
  it("keeps items with a genuine work/career signal", () => {
    expect(isRelevant("How AI is reshaping careers", "skills that matter")).toBe(true);
    expect(isRelevant("Future of work in 2026", "")).toBe(true);
    expect(isRelevant("New apprenticeship routes for young people", "")).toBe(true);
    expect(isRelevant("The skills gap in green jobs", "")).toBe(true);
  });
  it("rejects off-topic items", () => {
    expect(isRelevant("A recipe for sourdough", "Baking bread at home")).toBe(false);
  });
  it("rejects incidental keyword matches (no real work signal)", () => {
    // "learning"/"work" appear but it's not career content
    expect(isRelevant("Picower Institute for Learning and Memory names new director", "")).toBe(false);
    expect(isRelevant("MIT researchers built their own operating system", "how chips work")).toBe(false);
  });
  it("rejects institutional-announcement and health-outbreak noise even if a work term appears", () => {
    expect(isRelevant("Jane Doe named head of the Department of Labor Studies", "")).toBe(false);
    expect(isRelevant("WHO launches Ebola response plan for health workers", "outbreak")).toBe(false);
  });
});

describe("feedItemToCandidate", () => {
  it("maps a feed item to a SeedCandidate with ISO publishDate", () => {
    const raw: RawFeedItem = {
      title: "How AI is reshaping careers",
      link: "https://www.weforum.org/stories/2026/03/ai-careers/",
      description: "<p>skills that matter</p>",
      date: "Mon, 02 Mar 2026 09:00:00 GMT",
    };
    const c = feedItemToCandidate(raw, FEED);
    expect(c).not.toBeNull();
    expect(c!.sourceName).toBe("World Economic Forum");
    expect(c!.contentType).toBe("article");
    expect(c!.publishDate).toBe("2026-03-02");
    expect(c!.tags).toContain("future-of-work");
    expect(c!.tags).toContain("ai"); // keyword-derived
    expect(c!.summary.length).toBeGreaterThan(0);
  });

  it("returns null when the date can't be parsed", () => {
    const raw: RawFeedItem = { title: "x", link: "https://weforum.org/x", description: "", date: "garbage" };
    expect(feedItemToCandidate(raw, FEED)).toBeNull();
  });
});

describe("selectFreshCandidates", () => {
  const now = new Date("2026-06-15T00:00:00Z").getTime();

  function cand(overrides: Partial<SeedCandidate>): SeedCandidate {
    return {
      title: "t",
      summary: "s",
      sourceName: "World Economic Forum",
      sourceUrl: "https://www.weforum.org/a",
      contentType: "article",
      tags: ["future-of-work"],
      publishDate: "2026-03-01",
      ...overrides,
    };
  }

  it("drops out-of-window incoming items", () => {
    const incoming = [
      cand({ sourceUrl: "https://www.weforum.org/fresh", publishDate: "2026-03-01" }),
      cand({ sourceUrl: "https://www.weforum.org/old", publishDate: "2024-01-01" }),
    ];
    const out = selectFreshCandidates({ incoming, existing: [], existingUrls: [], now, max: 10 });
    expect(out.map((c) => c.sourceUrl)).toEqual(["https://www.weforum.org/fresh"]);
  });

  it("dedupes against existing seed + pool URLs (canonical)", () => {
    const incoming = [cand({ sourceUrl: "https://www.weforum.org/dup/?utm_source=rss" })];
    const out = selectFreshCandidates({
      incoming,
      existing: [],
      existingUrls: ["https://www.weforum.org/dup"],
      now,
      max: 10,
    });
    expect(out).toHaveLength(0);
  });

  it("dedupes incoming against each other", () => {
    const incoming = [
      cand({ sourceUrl: "https://www.weforum.org/same" }),
      cand({ sourceUrl: "https://www.weforum.org/same" }),
    ];
    const out = selectFreshCandidates({ incoming, existing: [], existingUrls: [], now, max: 10 });
    expect(out).toHaveLength(1);
  });

  it("caps the number of new items", () => {
    const incoming = Array.from({ length: 30 }, (_, i) =>
      cand({ sourceUrl: `https://www.weforum.org/a${i}` }),
    );
    const out = selectFreshCandidates({ incoming, existing: [], existingUrls: [], now, max: 12 });
    expect(out).toHaveLength(12);
  });

  it("caps items per source for diversity", () => {
    const incoming = [
      ...Array.from({ length: 10 }, (_, i) =>
        cand({ sourceName: "MIT News", sourceUrl: `https://news.mit.edu/a${i}` }),
      ),
      ...Array.from({ length: 10 }, (_, i) =>
        cand({ sourceName: "TED", sourceUrl: `https://www.ted.com/t${i}` }),
      ),
    ];
    const out = selectFreshCandidates({
      incoming,
      existing: [],
      existingUrls: [],
      now,
      max: 12,
      maxPerSource: 3,
    });
    const mit = out.filter((c) => c.sourceName === "MIT News").length;
    const ted = out.filter((c) => c.sourceName === "TED").length;
    expect(mit).toBeLessThanOrEqual(3);
    expect(ted).toBeLessThanOrEqual(3);
  });
});

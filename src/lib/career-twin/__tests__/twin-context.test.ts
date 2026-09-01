import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TwinRow } from "@/lib/career-twin/history";

/**
 * Conversation context must be bounded: however long a Twin thread runs, the
 * prompt we send stays a fixed size — recent turns verbatim, everything older
 * folded into a rolling summary.
 */

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  upsert: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    careerTwinMessage: { findMany: mocks.findMany },
    careerTwinSummary: { findUnique: mocks.findUnique, upsert: mocks.upsert },
    aiUsageEvent: { create: mocks.create },
  },
}));

const { selectContextWindow, buildSummaryBlock, buildSummaryPrompt, loadTwinContext, refreshTwinSummaryIfNeeded } =
  await import("@/lib/career-twin/context");

const T0 = new Date("2026-08-31T00:00:00Z").getTime();
const row = (i: number, content = `message ${i}`): TwinRow => ({
  role: i % 2 === 0 ? "user" : "assistant",
  content,
  mode: null,
  createdAt: new Date(T0 + i * 60_000),
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.findUnique.mockResolvedValue(null);
  mocks.upsert.mockResolvedValue({});
  mocks.create.mockResolvedValue({});
});

describe("selectContextWindow", () => {
  it("keeps only the most recent turns and reports the rest as summary material", () => {
    const rows = Array.from({ length: 20 }, (_, i) => row(i));
    const win = selectContextWindow(rows, { maxTurns: 6, maxTokens: 10_000 });
    expect(win.recent).toHaveLength(6);
    expect(win.recent[5].content).toBe("message 19");
    expect(win.older).toHaveLength(14);
  });

  it("does not grow as the conversation grows", () => {
    const short = selectContextWindow(Array.from({ length: 8 }, (_, i) => row(i)), {
      maxTurns: 6,
      maxTokens: 10_000,
    });
    const long = selectContextWindow(Array.from({ length: 400 }, (_, i) => row(i)), {
      maxTurns: 6,
      maxTokens: 10_000,
    });
    expect(long.recent).toHaveLength(short.recent.length);
  });

  it("drops older turns when the token budget bites before the turn count does", () => {
    const rows = Array.from({ length: 6 }, (_, i) => row(i, "x".repeat(2000)));
    const win = selectContextWindow(rows, { maxTurns: 6, maxTokens: 600 });
    // 2000 chars ≈ 500 tokens each, so only one fits in a 600-token budget.
    expect(win.recent.length).toBeLessThan(6);
    expect(win.estimatedTokens).toBeLessThanOrEqual(600);
  });

  it("always keeps the newest message, even if it alone blows the budget", () => {
    const rows = [row(0, "x".repeat(20_000)), row(1, "y".repeat(20_000))];
    const win = selectContextWindow(rows, { maxTurns: 6, maxTokens: 10 });
    expect(win.recent).toHaveLength(1);
    expect(win.recent[0].content.startsWith("y")).toBe(true);
  });

  it("clamps each message and ignores non-conversation rows", () => {
    const rows = [
      { ...row(0), role: "system", content: "should be dropped" },
      row(1, "z".repeat(5000)),
    ];
    const win = selectContextWindow(rows, { maxTurns: 6, maxTokens: 100_000 });
    expect(win.recent).toHaveLength(1);
    expect(win.recent[0].content).toHaveLength(2000);
  });

  it("handles an empty thread", () => {
    expect(selectContextWindow([], { maxTurns: 6, maxTokens: 1000 })).toMatchObject({
      recent: [],
      older: [],
    });
  });
});

describe("buildSummaryBlock", () => {
  it("is empty when there is no summary", () => {
    expect(buildSummaryBlock(null)).toBe("");
    expect(buildSummaryBlock("   ")).toBe("");
  });

  it("labels the summary as background, not as something to recap", () => {
    const block = buildSummaryBlock("They are weighing nursing against paramedic work.");
    expect(block).toContain("They are weighing nursing");
    expect(block.toLowerCase()).toContain("don't recap");
  });
});

describe("loadTwinContext", () => {
  it("treats only messages newer than the summary's coverage as unsummarised", async () => {
    const rows = Array.from({ length: 20 }, (_, i) => row(i));
    mocks.findMany.mockResolvedValue([...rows].reverse());
    mocks.findUnique.mockResolvedValue({
      summary: "earlier context",
      coveredThrough: rows[9].createdAt,
    });

    const ctx = await loadTwinContext("u1", "c1", {
      maxContextTurns: 6,
      maxContextTokens: 10_000,
    } as never);

    expect(ctx.summary).toBe("earlier context");
    expect(ctx.older).toHaveLength(14);
    // Rows 10..13 are older-than-the-window but newer than the summary.
    expect(ctx.unsummarised).toHaveLength(4);
  });
});

describe("buildSummaryPrompt", () => {
  it("folds the previous summary in so context reaches back indefinitely", () => {
    const { user } = buildSummaryPrompt("Nurse", "They liked the night-shift story.", [row(0)], 100);
    expect(user).toContain("Summary so far");
    expect(user).toContain("They liked the night-shift story.");
    expect(user).toContain("ONE merged summary");
  });

  it("caps the summary length in the instruction", () => {
    const { system } = buildSummaryPrompt("Nurse", null, [row(0)], 150);
    expect(system).toContain("at most 150 words");
  });
});

describe("refreshTwinSummaryIfNeeded", () => {
  const cfg = {
    maxContextTurns: 6,
    maxContextTokens: 10_000,
    summaryTriggerTurns: 6,
    summaryMaxTokens: 220,
    summaryModel: "gpt-4o-mini",
  } as never;

  const openaiWith = (content: string) => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content } }],
          usage: { prompt_tokens: 300, completion_tokens: 90 },
        }),
      },
    },
  });

  it("does nothing while the thread is short — no model call, no spend", async () => {
    mocks.findMany.mockResolvedValue([...Array.from({ length: 8 }, (_, i) => row(i))].reverse());
    const openai = openaiWith("summary");
    expect(await refreshTwinSummaryIfNeeded(openai as never, {
      userId: "u1", careerId: "c1", careerTitle: "Nurse", cfg,
    })).toBeNull();
    expect(openai.chat.completions.create).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("summarises once enough older turns have built up, and records the cost", async () => {
    const rows = Array.from({ length: 20 }, (_, i) => row(i));
    mocks.findMany.mockResolvedValue([...rows].reverse());
    const openai = openaiWith("They are weighing nursing against paramedic work.");

    const result = await refreshTwinSummaryIfNeeded(openai as never, {
      userId: "u1", careerId: "c1", careerTitle: "Nurse", cfg,
    });

    expect(result).toBe("They are weighing nursing against paramedic work.");
    expect(mocks.upsert).toHaveBeenCalledTimes(1);
    const upsert = mocks.upsert.mock.calls[0][0];
    expect(upsert.create.coveredThrough).toEqual(rows[13].createdAt);
    // Ledger row for the summariser's own token spend.
    const ledger = mocks.create.mock.calls[0][0].data;
    expect(ledger).toMatchObject({
      feature: "career_twin_summary",
      status: "successful",
      inputTokens: 300,
      outputTokens: 90,
    });
  });

  it("caps the stored summary so it cannot grow across refreshes", async () => {
    mocks.findMany.mockResolvedValue(
      [...Array.from({ length: 20 }, (_, i) => row(i))].reverse(),
    );
    const openai = openaiWith("word ".repeat(5000));
    const result = await refreshTwinSummaryIfNeeded(openai as never, {
      userId: "u1", careerId: "c1", careerTitle: "Nurse", cfg,
    });
    expect(result!.length).toBeLessThanOrEqual(220 * 4);
  });

  it("keeps the old summary when the model call fails", async () => {
    mocks.findMany.mockResolvedValue(
      [...Array.from({ length: 20 }, (_, i) => row(i))].reverse(),
    );
    const openai = {
      chat: { completions: { create: vi.fn().mockRejectedValue(new Error("boom")) } },
    };
    expect(await refreshTwinSummaryIfNeeded(openai as never, {
      userId: "u1", careerId: "c1", careerTitle: "Nurse", cfg,
    })).toBeNull();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});

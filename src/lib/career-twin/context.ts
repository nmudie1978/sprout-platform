/**
 * Career Twin conversation context — bounded by construction.
 *
 * A Twin thread can run for months. Replaying the whole transcript on every
 * turn would grow the prompt (and the bill) without limit, so context is:
 *
 *   [rolling summary of older turns]  +  [last N turns, verbatim, token-capped]
 *
 * The summary is refreshed AFTER a turn completes (never on the request path)
 * and folds the previous summary in, so context reaches back indefinitely
 * while the prompt stays a fixed size.
 *
 * Window sizes are configured in src/lib/ai-usage/config.ts.
 */
import type OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { logAndSwallow } from "@/lib/observability";
import { isResponseSafe } from "@/lib/ai-guardrails";
import { getCareerTwinConfig, type CareerTwinAiConfig } from "@/lib/ai-usage/config";
import { estimateTokens } from "@/lib/ai-usage/pricing";
import { recordAiUsage } from "@/lib/ai-usage/record";
import { AI_FEATURES } from "@/lib/ai-usage/types";
import { loadTwinHistory, TWIN_THREAD_LOAD_LIMIT, type TwinRow, type TwinTurn } from "./history";

/** Per-message clamp before anything reaches the model. */
const MAX_MESSAGE_CHARS = 2000;
/** Per-message clamp inside a summarisation prompt (cheaper than full text). */
const SUMMARY_SOURCE_CHARS = 600;

export interface ContextWindow {
  /** Recent turns replayed verbatim, oldest → newest. */
  recent: TwinTurn[];
  /** Everything older than the verbatim window — summary material. */
  older: TwinRow[];
  /** Rough token size of `recent`. */
  estimatedTokens: number;
}

/**
 * Pure: split a thread into the verbatim window and the older remainder.
 *
 * Two independent bounds, both applied: at most `maxTurns` messages, and at
 * most `maxTokens` estimated tokens (oldest dropped first). The newest message
 * is always kept — a window of nothing would be worse than a slightly large one.
 */
export function selectContextWindow(
  rows: TwinRow[],
  opts: { maxTurns: number; maxTokens: number },
): ContextWindow {
  const valid = rows.filter((r) => r.role === "user" || r.role === "assistant");
  const maxTurns = Math.max(1, opts.maxTurns);

  let startIndex = Math.max(0, valid.length - maxTurns);
  const tokensOf = (from: number) =>
    valid
      .slice(from)
      .reduce((sum, r) => sum + estimateTokens(r.content.slice(0, MAX_MESSAGE_CHARS)) + 4, 0);

  // Drop from the oldest end until the window fits the token budget.
  while (startIndex < valid.length - 1 && tokensOf(startIndex) > opts.maxTokens) {
    startIndex += 1;
  }

  return {
    recent: valid.slice(startIndex).map((r) => ({
      role: r.role as "user" | "assistant",
      content: r.content.slice(0, MAX_MESSAGE_CHARS),
    })),
    older: valid.slice(0, startIndex),
    estimatedTokens: tokensOf(startIndex),
  };
}

/** Pure: the system-prompt block that carries summarised older context. */
export function buildSummaryBlock(summary: string | null | undefined): string {
  if (!summary?.trim()) return "";
  return (
    "\n\nEARLIER IN THIS CONVERSATION (summary of older messages — treat as " +
    "background you already know, don't recap it back at them):\n" +
    summary.trim()
  );
}

export interface LoadedTwinContext extends ContextWindow {
  /** Rolling summary of everything before `recent`, or null. */
  summary: string | null;
  /** Older messages not yet folded into the summary. */
  unsummarised: TwinRow[];
}

/**
 * Load a thread and split it into summary + verbatim window.
 * One query for the messages, one for the summary row.
 */
export async function loadTwinContext(
  userId: string,
  careerId: string,
  cfg: CareerTwinAiConfig = getCareerTwinConfig(),
): Promise<LoadedTwinContext> {
  const [rows, summaryRow] = await Promise.all([
    loadTwinHistory(userId, careerId, Math.ceil(TWIN_THREAD_LOAD_LIMIT / 2)),
    prisma.careerTwinSummary.findUnique({
      where: { userId_careerId: { userId, careerId } },
      select: { summary: true, coveredThrough: true },
    }),
  ]);

  const window = selectContextWindow(rows, {
    maxTurns: cfg.maxContextTurns,
    maxTokens: cfg.maxContextTokens,
  });
  const coveredThrough = summaryRow?.coveredThrough ?? null;

  return {
    ...window,
    summary: summaryRow?.summary ?? null,
    unsummarised: coveredThrough
      ? window.older.filter((r) => r.createdAt > coveredThrough)
      : window.older,
  };
}

/** Pure: the summarisation prompt. Kept small — this call must stay cheap. */
export function buildSummaryPrompt(
  careerTitle: string,
  previousSummary: string | null,
  messages: TwinRow[],
  maxWords: number,
): { system: string; user: string } {
  const system =
    `You compress a career-guidance conversation between a young person and an imagined ` +
    `future-self version of them working as a ${careerTitle}. ` +
    `Write a factual third-person summary of at most ${maxWords} words covering: what the young ` +
    `person has asked about, what they seem drawn to or worried about, and any concrete plans or ` +
    `advice already given. Keep it neutral and non-clinical. No new advice, no bullet points, ` +
    `no preamble — just the summary.`;

  const transcript = messages
    .map((m) => `${m.role === "user" ? "Young person" : "Future self"}: ${m.content.slice(0, SUMMARY_SOURCE_CHARS)}`)
    .join("\n");

  const user = previousSummary?.trim()
    ? `Summary so far:\n${previousSummary.trim()}\n\nNewer messages to fold in:\n${transcript}\n\n` +
      `Return ONE merged summary of the whole conversation.`
    : `Messages to summarise:\n${transcript}`;

  return { system, user };
}

/**
 * Refresh the rolling summary if enough older messages have accumulated.
 *
 * Call AFTER responding to the user — it costs a (small) model call and must
 * never sit on the request path. Best-effort: any failure leaves the previous
 * summary in place and the next turn simply tries again.
 *
 * @returns the new summary, or null when nothing was done.
 */
export async function refreshTwinSummaryIfNeeded(
  openai: OpenAI,
  args: {
    userId: string;
    careerId: string;
    careerTitle: string;
    cfg?: CareerTwinAiConfig;
  },
): Promise<string | null> {
  const cfg = args.cfg ?? getCareerTwinConfig();
  try {
    const ctx = await loadTwinContext(args.userId, args.careerId, cfg);
    if (ctx.unsummarised.length < cfg.summaryTriggerTurns) return null;

    const newest = ctx.older[ctx.older.length - 1];
    if (!newest) return null;

    const maxWords = Math.max(40, Math.floor(cfg.summaryMaxTokens * 0.7));
    const { system, user } = buildSummaryPrompt(
      args.careerTitle,
      ctx.summary,
      ctx.unsummarised,
      maxWords,
    );

    const completion = await openai.chat.completions.create(
      {
        model: cfg.summaryModel,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.2,
        max_tokens: cfg.summaryMaxTokens,
      },
      { timeout: 20_000 },
    );

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    await recordAiUsage({
      userId: args.userId,
      feature: AI_FEATURES.CAREER_TWIN_SUMMARY,
      status: text ? "successful" : "failed",
      model: cfg.summaryModel,
      inputTokens: completion.usage?.prompt_tokens ?? estimateTokens(system + user),
      outputTokens: completion.usage?.completion_tokens ?? estimateTokens(text),
    });

    // The summary is replayed into every later prompt, so it goes through the
    // same output guardrail as anything else the model writes.
    if (!text || !isResponseSafe(text).safe) return null;

    // Hard char cap: the summary must not grow across refreshes either.
    const bounded = text.slice(0, cfg.summaryMaxTokens * 4);
    const turnsCovered = ctx.older.length;

    await prisma.careerTwinSummary.upsert({
      where: { userId_careerId: { userId: args.userId, careerId: args.careerId } },
      create: {
        userId: args.userId,
        careerId: args.careerId,
        summary: bounded,
        coveredThrough: newest.createdAt,
        turnsCovered,
      },
      update: { summary: bounded, coveredThrough: newest.createdAt, turnsCovered },
    });
    return bounded;
  } catch (error) {
    logAndSwallow("career-twin:summary")(error);
    return null;
  }
}

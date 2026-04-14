/**
 * Pure statistical helpers for the admin feedback dashboard.
 *
 * Keeps the aggregation logic out of the page component so it can be
 * unit-tested and reused by the CSV export route.
 */

import type { FeedbackRole, Feedback } from "@prisma/client";

export type LikertKey = "q1" | "q2" | "q3" | "q4" | "q5";

export const LIKERT_KEYS: LikertKey[] = ["q1", "q2", "q3", "q4", "q5"];

export const LIKERT_QUESTIONS: Record<LikertKey, string> = {
  q1: "I understood what this app is for.",
  q2: "I understood what I should do first.",
  q3: "The app felt calm and not overwhelming.",
  q4: "The focus on having a main goal made sense to me.",
  q5: "I would feel comfortable using this (or letting my child use this).",
};

export const ROLE_LABEL: Record<FeedbackRole, string> = {
  TEEN_16_20: "Teen (15–23)",
  PARENT_GUARDIAN: "Parent / Guardian",
  ADULT_OTHER: "Adult (teacher / mentor / other)",
};

export const CLARITY_TOPIC_LABEL: Record<string, string> = {
  PRIMARY_VS_SECONDARY_GOAL: "Primary vs secondary goal",
  REAL_LIFE_WORK: "How it connects to real-life work",
  SMALL_JOBS: "Small jobs section",
  NEXT_STEPS: "What to do next",
  NONE: "Nothing — it was clear",
};

export interface LikertStats {
  n: number;
  mean: number;
  median: number;
  stddev: number;
  /** % of responses ≥ 4 (top-2-box — standard survey agreement metric). */
  topTwoBox: number;
  /** Counts for each Likert value 1..5 (index 0 = "1 Strongly disagree"). */
  distribution: [number, number, number, number, number];
}

export interface FeedbackAggregate {
  total: number;
  byRole: Record<FeedbackRole, number>;
  perQuestion: Record<LikertKey, LikertStats>;
  clarityTopics: { topic: string; count: number; pct: number }[];
  freeTextSubmissions: {
    id: string;
    createdAt: Date;
    role: FeedbackRole;
    text: string;
  }[];
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance =
    values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function likertStats(values: number[]): LikertStats {
  const dist: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const v of values) {
    if (v >= 1 && v <= 5) dist[v - 1] += 1;
  }
  const topTwo = values.filter((v) => v >= 4).length;
  return {
    n: values.length,
    mean: Number(mean(values).toFixed(2)),
    median: Number(median(values).toFixed(2)),
    stddev: Number(stddev(values).toFixed(2)),
    topTwoBox:
      values.length === 0 ? 0 : Number(((topTwo / values.length) * 100).toFixed(1)),
    distribution: dist,
  };
}

/**
 * Aggregate a set of feedback rows into everything the admin page needs.
 * Pre-filter rows by role/date at the call site; this function just rolls
 * up whatever it receives.
 */
export function aggregateFeedback(rows: Feedback[]): FeedbackAggregate {
  const byRole: Record<FeedbackRole, number> = {
    TEEN_16_20: 0,
    PARENT_GUARDIAN: 0,
    ADULT_OTHER: 0,
  };
  for (const r of rows) byRole[r.role] += 1;

  const perQuestion = {} as Record<LikertKey, LikertStats>;
  for (const k of LIKERT_KEYS) {
    perQuestion[k] = likertStats(rows.map((r) => r[k]));
  }

  const topicCounts = new Map<string, number>();
  for (const r of rows) {
    for (const t of r.clarityTopics) {
      topicCounts.set(t, (topicCounts.get(t) || 0) + 1);
    }
  }
  const clarityTopics = [...topicCounts.entries()]
    .map(([topic, count]) => ({
      topic,
      count,
      pct: rows.length === 0 ? 0 : Number(((count / rows.length) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count);

  const freeTextSubmissions = rows
    .filter((r) => r.confusingText && r.confusingText.trim().length > 0)
    .map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      role: r.role,
      text: r.confusingText as string,
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    total: rows.length,
    byRole,
    perQuestion,
    clarityTopics,
    freeTextSubmissions,
  };
}

/** CSV encode a single value — wraps in quotes and escapes internal quotes. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Format a full CSV from raw feedback rows. One row per submission. */
export function feedbackToCsv(rows: Feedback[]): string {
  const header = [
    "id",
    "createdAt",
    "role",
    "q1",
    "q2",
    "q3",
    "q4",
    "q5",
    "confusingText",
    "clarityTopics",
    "source",
    "userAgent",
    "appVersion",
    "createdByUserId",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.createdAt,
        r.role,
        r.q1,
        r.q2,
        r.q3,
        r.q4,
        r.q5,
        r.confusingText ?? "",
        r.clarityTopics.join("; "),
        r.source ?? "",
        r.userAgent ?? "",
        r.appVersion ?? "",
        r.createdByUserId ?? "",
      ]
        .map(csvCell)
        .join(","),
    );
  }
  return lines.join("\n");
}

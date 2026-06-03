/**
 * Pure aggregation helpers for the typed-feedback admin dashboard.
 * Kept out of the page component so it can be unit-tested and reused by
 * the CSV export route.
 */

import type { FeedbackRole, FeedbackKind, FeedbackArea, Feedback } from "@prisma/client";

export const KIND_LABEL: Record<FeedbackKind, string> = {
  CONFUSED: "Something confused me",
  PROBLEM: "Found a problem",
  IDEA: "I have an idea",
  PRAISE: "Something I liked",
};

export const AREA_LABEL: Record<FeedbackArea, string> = {
  JOURNEY: "My Journey",
  CAREER_RADAR: "Career Radar",
  EXPLORE_CAREERS: "Explore Careers",
  LIBRARY: "My Library",
  CAREER_TWIN: "Career Twin",
  OTHER: "Something else",
};

export const ROLE_LABEL: Record<FeedbackRole, string> = {
  TEEN_16_20: "Teen (15–23)",
  PARENT_GUARDIAN: "Parent / Guardian",
  ADULT_OTHER: "Adult (teacher / mentor / other)",
};

export const KIND_VALUES: FeedbackKind[] = ["CONFUSED", "PROBLEM", "IDEA", "PRAISE"];
export const AREA_VALUES: FeedbackArea[] = [
  "JOURNEY",
  "CAREER_RADAR",
  "EXPLORE_CAREERS",
  "LIBRARY",
  "CAREER_TWIN",
  "OTHER",
];
export const ROLE_VALUES: FeedbackRole[] = ["TEEN_16_20", "PARENT_GUARDIAN", "ADULT_OTHER"];

export interface FeedbackMessage {
  id: string;
  createdAt: Date;
  kind: FeedbackKind;
  area: FeedbackArea | null;
  role: FeedbackRole | null;
  text: string;
}

export interface FeedbackAggregate {
  /** Count of new-model rows (those with a `kind`). */
  total: number;
  /** Count of legacy Likert rows (no `kind`). */
  legacyCount: number;
  byKind: Record<FeedbackKind, number>;
  byArea: Record<FeedbackArea, number>;
  byRole: Record<FeedbackRole, number>;
  /** New-model rows with a non-empty message, newest first. */
  messages: FeedbackMessage[];
}

/**
 * Roll a set of feedback rows up into everything the admin page needs.
 * Pre-filter rows by kind/area/date at the call site; this just rolls up
 * whatever it receives. Legacy Likert rows (no `kind`) are counted only
 * in `legacyCount` and excluded from every other breakdown.
 */
export function aggregateFeedback(rows: Feedback[]): FeedbackAggregate {
  const byKind: Record<FeedbackKind, number> = { CONFUSED: 0, PROBLEM: 0, IDEA: 0, PRAISE: 0 };
  const byArea: Record<FeedbackArea, number> = {
    JOURNEY: 0,
    CAREER_RADAR: 0,
    EXPLORE_CAREERS: 0,
    LIBRARY: 0,
    CAREER_TWIN: 0,
    OTHER: 0,
  };
  const byRole: Record<FeedbackRole, number> = {
    TEEN_16_20: 0,
    PARENT_GUARDIAN: 0,
    ADULT_OTHER: 0,
  };

  let total = 0;
  let legacyCount = 0;
  const messages: FeedbackMessage[] = [];

  for (const r of rows) {
    if (!r.kind) {
      legacyCount += 1;
      continue;
    }
    total += 1;
    byKind[r.kind] += 1;
    if (r.area) byArea[r.area] += 1;
    if (r.role) byRole[r.role] += 1;
    if (r.message && r.message.trim().length > 0) {
      messages.push({
        id: r.id,
        createdAt: r.createdAt,
        kind: r.kind,
        area: r.area ?? null,
        role: r.role ?? null,
        text: r.message,
      });
    }
  }

  messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return { total, legacyCount, byKind, byArea, byRole, messages };
}

/** CSV-encode a single value — wraps in quotes and escapes internal quotes. */
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
    "kind",
    "area",
    "role",
    "message",
    "legacyText",
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
        r.kind ?? "",
        r.area ?? "",
        r.role ?? "",
        r.message ?? "",
        r.confusingText ?? "", // legacy free text, preserved on export
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

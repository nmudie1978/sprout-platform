"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  CLARITY_TOPIC_LABEL,
  LIKERT_KEYS,
  LIKERT_QUESTIONS,
  ROLE_LABEL,
  type FeedbackAggregate,
} from "@/lib/feedback-stats";

interface FeedbackReportProps {
  agg: FeedbackAggregate;
}

/** Likert colour ramp — red (strongly disagree) → green (strongly agree). */
const LIKERT_COLOURS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#10b981"];

const ROLE_COLOURS: Record<string, string> = {
  PARENT_GUARDIAN: "#0ea5e9",
  TEEN_16_20: "#14b8a6",
  ADULT_OTHER: "#a855f7",
};

/** Tailwind-flavoured palette for clarity-topic pie. */
const TOPIC_COLOURS = ["#14b8a6", "#0ea5e9", "#a855f7", "#f59e0b", "#ec4899", "#84cc16"];

/**
 * High-level visual summary of the feedback aggregate. Sits above the
 * dense per-question table on /admin/feedback so a non-technical
 * stakeholder can glance the pilot results in seconds.
 */
export function FeedbackReport({ agg }: FeedbackReportProps) {
  const overallTopTwo = useMemo(() => {
    const all = LIKERT_KEYS.map((k) => agg.perQuestion[k].topTwoBox);
    if (all.length === 0) return 0;
    return Number((all.reduce((a, b) => a + b, 0) / all.length).toFixed(1));
  }, [agg]);

  const overallMean = useMemo(() => {
    const all = LIKERT_KEYS.map((k) => agg.perQuestion[k].mean);
    if (all.length === 0) return 0;
    return Number((all.reduce((a, b) => a + b, 0) / all.length).toFixed(2));
  }, [agg]);

  // Combined Likert distribution across every question/response.
  const overallDistribution = useMemo(() => {
    const totals = [0, 0, 0, 0, 0];
    for (const k of LIKERT_KEYS) {
      const d = agg.perQuestion[k].distribution;
      for (let i = 0; i < 5; i++) totals[i] += d[i];
    }
    const sum = totals.reduce((a, b) => a + b, 0) || 1;
    return totals.map((count, i) => ({
      label: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"][i],
      value: i + 1,
      count,
      pct: Number(((count / sum) * 100).toFixed(1)),
    }));
  }, [agg]);

  const agreementByQuestion = useMemo(
    () =>
      LIKERT_KEYS.map((k) => ({
        key: k,
        // Truncate question text so the y-axis stays compact.
        question: shortLabel(LIKERT_QUESTIONS[k]),
        topTwoBox: agg.perQuestion[k].topTwoBox,
        mean: agg.perQuestion[k].mean,
      })).sort((a, b) => b.topTwoBox - a.topTwoBox),
    [agg],
  );

  const roleData = useMemo(
    () =>
      (Object.keys(agg.byRole) as (keyof typeof agg.byRole)[])
        .map((role) => ({
          role,
          name: ROLE_LABEL[role],
          value: agg.byRole[role],
        }))
        .filter((d) => d.value > 0),
    [agg],
  );

  const topicData = useMemo(
    () =>
      agg.clarityTopics.map((t) => ({
        name: CLARITY_TOPIC_LABEL[t.topic] ?? t.topic,
        value: t.count,
        pct: t.pct,
      })),
    [agg],
  );

  const stackedDistribution = useMemo(
    () =>
      LIKERT_KEYS.map((k) => {
        const d = agg.perQuestion[k].distribution;
        const total = d.reduce((a, b) => a + b, 0) || 1;
        return {
          key: k,
          question: shortLabel(LIKERT_QUESTIONS[k]),
          v1: Number(((d[0] / total) * 100).toFixed(1)),
          v2: Number(((d[1] / total) * 100).toFixed(1)),
          v3: Number(((d[2] / total) * 100).toFixed(1)),
          v4: Number(((d[3] / total) * 100).toFixed(1)),
          v5: Number(((d[4] / total) * 100).toFixed(1)),
        };
      }),
    [agg],
  );

  if (agg.total === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Aggregated report
      </h2>

      {/* Headline overall scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <ScoreCard
          label="Overall mean (1–5)"
          value={overallMean.toFixed(2)}
          tone={scoreTone(overallMean, "mean")}
        />
        <ScoreCard
          label="Overall agreement (top-2-box)"
          value={`${overallTopTwo}%`}
          tone={scoreTone(overallTopTwo, "pct")}
        />
        <ScoreCard label="Sample size" value={String(agg.total)} hint="responses analysed" />
      </div>

      {/* Overall distribution stacked horizontal bar */}
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 mb-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          Overall response distribution (all questions combined)
        </p>
        <div className="flex h-8 rounded-md overflow-hidden">
          {overallDistribution.map((d, i) => (
            <div
              key={d.label}
              className="flex items-center justify-center text-[10px] font-semibold text-white"
              style={{
                width: `${d.pct}%`,
                backgroundColor: LIKERT_COLOURS[i],
                minWidth: d.pct > 0 ? "auto" : 0,
              }}
              title={`${d.label}: ${d.count} (${d.pct}%)`}
            >
              {d.pct >= 8 ? `${d.pct}%` : ""}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          {overallDistribution.map((d, i) => (
            <div key={d.label} className="flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-sm"
                style={{ backgroundColor: LIKERT_COLOURS[i] }}
              />
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column: agreement-by-question + role split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        {/* Agreement by question — horizontal bars sorted desc */}
        <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card/50 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            Agreement by question (% rating 4–5)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={agreementByQuestion}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                dataKey="question"
                type="category"
                width={180}
                tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
              />
              <Tooltip
                formatter={((v: number) => [`${v}%`, "Agreement"]) as never}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="topTwoBox" radius={[0, 4, 4, 0]}>
                {agreementByQuestion.map((d, i) => (
                  <Cell key={i} fill={agreementColour(d.topTwoBox)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role split donut */}
        <div className="rounded-xl border border-border/60 bg-card/50 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            Who responded
          </p>
          {roleData.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  label={(d) => `${d.value}`}
                  labelLine={false}
                >
                  {roleData.map((d) => (
                    <Cell key={d.role} fill={ROLE_COLOURS[d.role] ?? "#64748b"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Question breakdown — stacked horizontal bars */}
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 mb-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          Per-question response breakdown
        </p>
        <ResponsiveContainer width="100%" height={Math.max(200, stackedDistribution.length * 44)}>
          <BarChart
            data={stackedDistribution}
            layout="vertical"
            stackOffset="expand"
            margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              dataKey="question"
              type="category"
              width={180}
              tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
            />
            <Tooltip
              formatter={((v: number, name: string) => {
                const idx = Number(String(name).replace("v", "")) - 1;
                const labels = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];
                return [`${v}%`, labels[idx] ?? name];
              }) as never}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="v1" stackId="d" fill={LIKERT_COLOURS[0]} />
            <Bar dataKey="v2" stackId="d" fill={LIKERT_COLOURS[1]} />
            <Bar dataKey="v3" stackId="d" fill={LIKERT_COLOURS[2]} />
            <Bar dataKey="v4" stackId="d" fill={LIKERT_COLOURS[3]} />
            <Bar dataKey="v5" stackId="d" fill={LIKERT_COLOURS[4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Clarity topics pie */}
      {topicData.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card/50 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            Clarity topics requested
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={topicData}
                dataKey="value"
                nameKey="name"
                outerRadius={85}
                paddingAngle={2}
                label={(d) => `${d.value}`}
                labelLine={false}
              >
                {topicData.map((_, i) => (
                  <Cell key={i} fill={TOPIC_COLOURS[i % TOPIC_COLOURS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={((v: number, name: string, p: { payload?: { pct?: number } }) => [
                  `${v} (${p?.payload?.pct ?? 0}%)`,
                  name,
                ]) as never}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={48}
                iconType="circle"
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function ScoreCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "good" | "warn" | "bad" | "neutral";
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-500 dark:text-emerald-400"
      : tone === "warn"
        ? "text-amber-500 dark:text-amber-400"
        : tone === "bad"
          ? "text-red-500 dark:text-red-400"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`text-3xl font-bold tabular-nums mt-1 ${toneClass}`}>{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground/70 mt-0.5">{hint}</div>}
    </div>
  );
}

function shortLabel(q: string): string {
  // Drop the trailing period and shorten to fit the y-axis label gutter.
  const trimmed = q.replace(/\.$/, "");
  return trimmed.length > 60 ? trimmed.slice(0, 57) + "…" : trimmed;
}

function scoreTone(value: number, kind: "mean" | "pct"): "good" | "warn" | "bad" | "neutral" {
  if (kind === "mean") {
    if (value >= 4) return "good";
    if (value >= 3) return "warn";
    if (value > 0) return "bad";
    return "neutral";
  }
  if (value >= 70) return "good";
  if (value >= 50) return "warn";
  if (value > 0) return "bad";
  return "neutral";
}

function agreementColour(pct: number): string {
  if (pct >= 70) return "#10b981"; // emerald
  if (pct >= 50) return "#eab308"; // amber
  return "#ef4444"; // red
}

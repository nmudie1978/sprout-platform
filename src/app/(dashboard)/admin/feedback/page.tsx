import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Download, MessageSquare } from "lucide-react";
import {
  aggregateFeedback,
  CLARITY_TOPIC_LABEL,
  LIKERT_KEYS,
  LIKERT_QUESTIONS,
  ROLE_LABEL,
} from "@/lib/feedback-stats";
import { FeedbackReport } from "@/components/admin/feedback-report";
import type { FeedbackRole } from "@prisma/client";

export const dynamic = "force-dynamic";

const ROLE_OPTIONS: { value: "" | FeedbackRole; label: string }[] = [
  { value: "", label: "All roles" },
  { value: "PARENT_GUARDIAN", label: "Parent / Guardian" },
  { value: "TEEN_16_20", label: "Teen (15–23)" },
  { value: "ADULT_OTHER", label: "Adult (teacher / mentor / other)" },
];

interface PageProps {
  searchParams: { role?: string };
}

export default async function AdminFeedbackPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const validRoles: FeedbackRole[] = ["TEEN_16_20", "PARENT_GUARDIAN", "ADULT_OTHER"];
  const roleFilter =
    searchParams.role && validRoles.includes(searchParams.role as FeedbackRole)
      ? (searchParams.role as FeedbackRole)
      : null;

  const rows = await prisma.feedback.findMany({
    where: roleFilter ? { role: roleFilter } : undefined,
    orderBy: { createdAt: "desc" },
  });
  const overallRows = await prisma.feedback.findMany();

  const agg = aggregateFeedback(rows);
  const overall = aggregateFeedback(overallRows);

  const exportHref = roleFilter
    ? `/api/admin/feedback/export?role=${roleFilter}`
    : "/api/admin/feedback/export";

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-teal-400" />
            Feedback results
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Raw submissions from <code className="text-xs">/feedback</code> aggregated
            for the pilot. Likert scale 1 (strongly disagree) → 5 (strongly agree).
          </p>
        </div>
        <a
          href={exportHref}
          className="inline-flex items-center gap-2 rounded-md border border-teal-500/40 bg-teal-500/10 px-3 py-2 text-sm font-medium text-teal-600 dark:text-teal-300 hover:bg-teal-500/20 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </div>

      {/* Role filter (plain anchor links — server component, no JS needed) */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Role filter
        </span>
        {ROLE_OPTIONS.map((opt) => {
          const active = (roleFilter ?? "") === opt.value;
          return (
            <Link
              key={opt.value || "all"}
              href={opt.value ? `/admin/feedback?role=${opt.value}` : "/admin/feedback"}
              className={
                active
                  ? "rounded-md border border-teal-500/40 bg-teal-500/15 px-3 py-1.5 text-xs font-medium text-teal-700 dark:text-teal-300"
                  : "rounded-md border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
              }
            >
              {opt.label}
            </Link>
          );
        })}
      </div>

      {/* Headline counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <HeadlineCard
          label={roleFilter ? `Responses (${ROLE_LABEL[roleFilter]})` : "Responses"}
          value={agg.total}
          hint={roleFilter ? `of ${overall.total} total` : undefined}
        />
        <HeadlineCard label="Parents" value={overall.byRole.PARENT_GUARDIAN} />
        <HeadlineCard label="Teens" value={overall.byRole.TEEN_16_20} />
        <HeadlineCard label="Other adults" value={overall.byRole.ADULT_OTHER} />
      </div>

      {/* Empty state */}
      {agg.total === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          No feedback submissions yet for this filter.
        </div>
      ) : (
        <>
          {/* Visual aggregated report — overall scores, charts, breakdowns */}
          <FeedbackReport agg={agg} />

          {/* Detailed per-question Likert cards (mean / median / std dev / top-2) */}
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Per-question statistics (detail)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {LIKERT_KEYS.map((k) => (
              <LikertCard
                key={k}
                question={LIKERT_QUESTIONS[k]}
                stats={agg.perQuestion[k]}
              />
            ))}
          </div>

          {/* Clarity topics */}
          {agg.clarityTopics.length > 0 && (
            <>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Most-requested clarity topics
              </h2>
              <div className="rounded-xl border border-border/60 p-4 mb-8 space-y-2">
                {agg.clarityTopics.map((t) => {
                  const maxCount = agg.clarityTopics[0]?.count || 1;
                  const widthPct = (t.count / maxCount) * 100;
                  return (
                    <div key={t.topic} className="grid grid-cols-[1fr_auto] items-center gap-3">
                      <div>
                        <div className="text-sm mb-1">
                          {CLARITY_TOPIC_LABEL[t.topic] ?? t.topic}
                        </div>
                        <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                          <div
                            className="h-full bg-teal-500/70"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground shrink-0">
                        {t.count} · {t.pct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Free-text feed */}
          {agg.freeTextSubmissions.length > 0 && (
            <>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Free-text responses ({agg.freeTextSubmissions.length})
              </h2>
              <div className="space-y-2">
                {agg.freeTextSubmissions.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-lg border border-border/50 p-3 bg-card/30"
                  >
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                      <span className="font-medium">{ROLE_LABEL[f.role]}</span>
                      <time dateTime={f.createdAt.toISOString()}>
                        {f.createdAt.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                      {f.text}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function HeadlineCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums mt-1">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground/70 mt-0.5">{hint}</div>}
    </div>
  );
}

function LikertCard({
  question,
  stats,
}: {
  question: string;
  stats: ReturnType<typeof aggregateFeedback>["perQuestion"][keyof ReturnType<typeof aggregateFeedback>["perQuestion"]];
}) {
  const maxBar = Math.max(1, ...stats.distribution);
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4">
      <p className="text-sm font-medium mb-3">{question}</p>

      {/* Summary stats row */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-center">
        <SummaryStat label="Mean" value={stats.mean.toFixed(2)} />
        <SummaryStat label="Median" value={stats.median.toFixed(1)} />
        <SummaryStat label="Std dev" value={stats.stddev.toFixed(2)} />
        <SummaryStat
          label="Top-2 %"
          value={`${stats.topTwoBox}%`}
          highlight={stats.topTwoBox >= 70}
        />
      </div>

      {/* 5-bar distribution */}
      <div className="flex items-end gap-1.5 h-20">
        {stats.distribution.map((count, i) => {
          const h = (count / maxBar) * 100;
          const label = i + 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-[10px] font-mono text-muted-foreground/80">
                {count}
              </div>
              <div className="w-full bg-muted/30 rounded-sm relative" style={{ height: "100%" }}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-teal-500/70 rounded-sm"
                  style={{ height: `${h}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground">{label}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-muted-foreground/60 uppercase tracking-wider">
        <span>Strongly disagree</span>
        <span>Strongly agree</span>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground/70">
        {label}
      </div>
      <div
        className={
          highlight
            ? "text-lg font-bold tabular-nums text-teal-500 dark:text-teal-400"
            : "text-lg font-bold tabular-nums"
        }
      >
        {value}
      </div>
    </div>
  );
}

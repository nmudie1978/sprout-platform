import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { Download, MessageSquare, Star } from "lucide-react";
import {
  aggregateFeedback,
  KIND_LABEL,
  AREA_LABEL,
  ROLE_LABEL,
  KIND_VALUES,
  AREA_VALUES,
  ROLE_VALUES,
  type FeedbackAggregate,
} from "@/lib/feedback-stats";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  // Gated by the env-var Admin Portal (same as /admin dashboard + career-paths).
  // Middleware already requires a valid Portal cookie for every /admin/* route;
  // this re-verifies it server-side and redirects to the Portal login if missing.
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin/login");
  }

  const rows = await prisma.feedback.findMany({ orderBy: { createdAt: "desc" } });
  const agg = aggregateFeedback(rows);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            Feedback
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Typed feedback from <code className="text-xs">/feedback</code>.
            {agg.legacyCount > 0 && (
              <> {agg.total} new · {agg.legacyCount} legacy (old pilot survey) responses.</>
            )}
          </p>
        </div>
        <a
          href="/api/admin/feedback/export"
          className="inline-flex items-center gap-2 rounded-control border border-border bg-card/50 px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </div>

      {/* Platform rating summary — shown whenever any ratings exist, even
          if there's no written feedback yet. */}
      {agg.ratingCount > 0 && <RatingPanel agg={agg} />}

      {/* Headline counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {KIND_VALUES.map((k) => (
          <Counter key={k} label={KIND_LABEL[k]} value={agg.byKind[k]} />
        ))}
      </div>

      {agg.total === 0 ? (
        <div className="rounded-card border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          No typed feedback yet.
        </div>
      ) : (
        <>
          {/* By area + by role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            <BarPanel
              title="By area"
              data={AREA_VALUES.map((a) => ({ label: AREA_LABEL[a], count: agg.byArea[a] }))}
            />
            <BarPanel
              title="Who's giving feedback"
              data={ROLE_VALUES.map((r) => ({ label: ROLE_LABEL[r], count: agg.byRole[r] }))}
            />
          </div>

          {/* Message feed */}
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Responses ({agg.messages.length})
          </h2>
          <div className="space-y-2">
            {agg.messages.map((m) => (
              <div key={m.id} className="rounded-control border border-border/60 p-3 bg-card/30">
                <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground mb-1.5">
                  <span className="inline-flex items-center gap-2">
                    <span className="font-semibold text-foreground/80">{KIND_LABEL[m.kind]}</span>
                    {m.area && <span className="rounded-full bg-muted px-2 py-0.5">{AREA_LABEL[m.area]}</span>}
                    {m.role && <span>{ROLE_LABEL[m.role]}</span>}
                  </span>
                  <time dateTime={m.createdAt.toISOString()}>
                    {m.createdAt.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{m.text}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-border/60 bg-card/50 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums mt-1">{value}</div>
    </div>
  );
}

function RatingPanel({ agg }: { agg: FeedbackAggregate }) {
  const stars: (1 | 2 | 3 | 4 | 5)[] = [5, 4, 3, 2, 1];
  const max = Math.max(1, ...stars.map((s) => agg.ratingDistribution[s]));
  return (
    <div className="rounded-card border border-border/60 bg-card/50 p-5 mb-6 flex flex-col gap-5 sm:flex-row sm:items-center">
      {/* Average */}
      <div className="flex items-center gap-4 sm:border-r sm:border-border/60 sm:pr-6">
        <div className="text-4xl font-bold tabular-nums">{agg.ratingAvg?.toFixed(1)}</div>
        <div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={cn(
                  "h-4 w-4",
                  (agg.ratingAvg ?? 0) >= n - 0.25
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30",
                )}
              />
            ))}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            average of {agg.ratingCount} rating{agg.ratingCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>
      {/* Distribution */}
      <div className="flex-1 space-y-1.5">
        {stars.map((s) => {
          const c = agg.ratingDistribution[s];
          return (
            <div key={s} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-right tabular-nums text-muted-foreground">{s}</span>
              <Star className="h-3 w-3 text-amber-400/70" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full bg-amber-400/70"
                  style={{ width: `${(c / max) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right tabular-nums text-muted-foreground">{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BarPanel({ title, data }: { title: string; data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="rounded-card border border-border/60 bg-card/50 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
        {title}
      </p>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div>
              <div className="text-sm mb-1">{d.label}</div>
              <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className="h-full bg-primary/60"
                  style={{ width: `${(d.count / max) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-xs font-mono text-muted-foreground shrink-0">{d.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

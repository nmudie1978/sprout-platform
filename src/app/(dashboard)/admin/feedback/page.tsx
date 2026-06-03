import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Download, MessageSquare } from "lucide-react";
import {
  aggregateFeedback,
  KIND_LABEL,
  AREA_LABEL,
  ROLE_LABEL,
  KIND_VALUES,
  AREA_VALUES,
  ROLE_VALUES,
} from "@/lib/feedback-stats";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
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

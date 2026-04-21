import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Shield, AlertTriangle, Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { ConversationReportStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_FILTERS: { value: "" | ConversationReportStatus; label: string }[] = [
  { value: "", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "IN_REVIEW", label: "In review" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
];

const STATUS_CONFIG: Record<ConversationReportStatus, { label: string; className: string; Icon: typeof Clock }> = {
  OPEN:      { label: "Open",      className: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",   Icon: Clock },
  IN_REVIEW: { label: "In review", className: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",       Icon: Shield },
  RESOLVED:  { label: "Resolved",  className: "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300",   Icon: CheckCircle2 },
  DISMISSED: { label: "Dismissed", className: "border-muted-foreground/40 bg-muted/30 text-muted-foreground",             Icon: XCircle },
};

const CATEGORY_LABELS: Record<string, string> = {
  GROOMING: "Grooming / predatory",
  SEXUAL_CONTENT: "Sexual content",
  OFF_PLATFORM: "Moving off-platform",
  HARASSMENT: "Harassment / bullying",
  INAPPROPRIATE_JOB: "Inappropriate job",
  OTHER: "Other",
};

export default async function AdminConversationReportsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const validStatuses = Object.values(ConversationReportStatus) as ConversationReportStatus[];
  const statusFilter =
    searchParams.status && validStatuses.includes(searchParams.status as ConversationReportStatus)
      ? (searchParams.status as ConversationReportStatus)
      : null;

  const [reports, counts] = await Promise.all([
    prisma.conversationReport.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            role: true,
            youthProfile: { select: { displayName: true } },
            employerProfile: { select: { companyName: true } },
          },
        },
        reported: {
          select: {
            id: true,
            email: true,
            role: true,
            youthProfile: { select: { displayName: true } },
            employerProfile: { select: { companyName: true } },
          },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
    }),
    prisma.conversationReport.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[c.status] = c._count._all;

  const openCount = countMap.OPEN ?? 0;
  const inReviewCount = countMap.IN_REVIEW ?? 0;

  const labelFor = (u: typeof reports[number]["reporter"]): string =>
    u.youthProfile?.displayName ||
    u.employerProfile?.companyName ||
    u.email?.split("@")[0] ||
    "—";

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-teal-400" />
            Conversation reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Safety reports on private conversations — grooming, harassment,
            off-platform attempts. Auto-freezes the conversation on filing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatPill label="Open" value={openCount} tone="amber" />
          <StatPill label="In review" value={inReviewCount} tone="blue" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Status
        </span>
        {STATUS_FILTERS.map((opt) => {
          const active = (statusFilter ?? "") === opt.value;
          const count = opt.value ? countMap[opt.value] ?? 0 : reports.length;
          return (
            <Link
              key={opt.value || "all"}
              href={opt.value ? `/admin/conversation-reports?status=${opt.value}` : "/admin/conversation-reports"}
              className={
                active
                  ? "rounded-md border border-teal-500/40 bg-teal-500/15 px-3 py-1.5 text-xs font-medium text-teal-700 dark:text-teal-300"
                  : "rounded-md border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
              }
            >
              {opt.label} <span className="text-muted-foreground/60 ml-1">{count}</span>
            </Link>
          );
        })}
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          No conversation reports {statusFilter ? `in "${statusFilter}"` : "yet"}.
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reporter</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reported</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submitted</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const status = STATUS_CONFIG[r.status];
                const StatusIcon = status.Icon;
                const isUrgent = r.category === "GROOMING" || r.category === "SEXUAL_CONTENT";
                return (
                  <tr
                    key={r.id}
                    className={cn(
                      "border-t border-border/30 hover:bg-muted/20 transition-colors",
                      isUrgent && r.status === "OPEN" && "bg-red-500/5",
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium", status.className)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground/80">
                      {isUrgent && <AlertTriangle className="inline h-3 w-3 text-red-500 mr-1" />}
                      {CATEGORY_LABELS[r.category] ?? r.category}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground/70">
                      {labelFor(r.reporter)} <span className="text-muted-foreground/50">· {r.reporter.role.toLowerCase()}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground/70">
                      {labelFor(r.reported)} <span className="text-muted-foreground/50">· {r.reported.role.toLowerCase()}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[240px] truncate" title={r.details || undefined}>
                      {r.details || <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/conversation-reports/${r.id}`}
                        className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, tone }: { label: string; value: number; tone: "amber" | "red" | "blue" }) {
  const cls =
    tone === "amber"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : tone === "red"
      ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
      : "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300";
  return (
    <div className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium", cls)}>
      <span className="opacity-70 mr-1.5">{label}</span>
      <span className="font-bold text-sm">{value}</span>
    </div>
  );
}

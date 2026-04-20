import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Shield, ChevronRight, Clock, AlertTriangle, CheckCircle2, XCircle, UserX, Briefcase } from "lucide-react";
import { CommunityReportStatus } from "@prisma/client";
import { REPORT_REASONS } from "@/lib/community-guardian";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { status?: string };
}

const STATUS_FILTERS: { value: "" | CommunityReportStatus; label: string }[] = [
  { value: "", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "ESCALATED", label: "Escalated" },
  { value: "ACTION_TAKEN", label: "Action taken" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
];

const STATUS_CONFIG: Record<CommunityReportStatus, { label: string; className: string; Icon: typeof Clock }> = {
  OPEN:         { label: "Open",         className: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",   Icon: Clock },
  UNDER_REVIEW: { label: "Under review", className: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",       Icon: Shield },
  ESCALATED:    { label: "Escalated",    className: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",           Icon: AlertTriangle },
  ACTION_TAKEN: { label: "Action taken", className: "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300", Icon: CheckCircle2 },
  RESOLVED:     { label: "Resolved",     className: "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300",   Icon: CheckCircle2 },
  DISMISSED:    { label: "Dismissed",    className: "border-muted-foreground/40 bg-muted/30 text-muted-foreground",             Icon: XCircle },
};

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const validStatuses = Object.values(CommunityReportStatus) as CommunityReportStatus[];
  const statusFilter =
    searchParams.status && validStatuses.includes(searchParams.status as CommunityReportStatus)
      ? (searchParams.status as CommunityReportStatus)
      : null;

  const [reports, counts] = await Promise.all([
    prisma.communityReport.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        community: { select: { name: true } },
        reporter: {
          select: {
            id: true,
            email: true,
            youthProfile: { select: { displayName: true } },
            employerProfile: { select: { companyName: true } },
          },
        },
        assignedGuardian: {
          select: { id: true, youthProfile: { select: { displayName: true } } },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
    }),
    prisma.communityReport.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[c.status] = c._count._all;

  const openCount = countMap.OPEN ?? 0;
  const escalatedCount = countMap.ESCALATED ?? 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-5 w-5 text-teal-400" />
            Moderation queue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Community reports submitted by youth, parents, and employers. Action items appear at the top.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatPill label="Open" value={openCount} tone="amber" />
          <StatPill label="Escalated" value={escalatedCount} tone="red" />
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
              href={opt.value ? `/admin/reports?status=${opt.value}` : "/admin/reports"}
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
          No reports {statusFilter ? `in "${statusFilter}"` : "yet"}.
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reason</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reporter</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Community</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submitted</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const status = STATUS_CONFIG[r.status];
                const StatusIcon = status.Icon;
                const TargetIcon = r.targetType === "JOB_POST" ? Briefcase : UserX;
                const reporterName =
                  r.reporter.youthProfile?.displayName ??
                  r.reporter.employerProfile?.companyName ??
                  r.reporter.email?.split("@")[0] ??
                  "—";
                const reasonLabel = REPORT_REASONS[r.reason as keyof typeof REPORT_REASONS] ?? r.reason;

                return (
                  <tr key={r.id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium", status.className)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-foreground/80">
                        <TargetIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
                        {r.targetType === "JOB_POST" ? "Job" : "User"}
                        <code className="text-[10px] text-muted-foreground/50 ml-1">{r.targetId.slice(0, 8)}</code>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground/80">
                      {reasonLabel}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground/70">
                      {reporterName}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {r.community.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/reports/${r.id}`}
                        className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        Review
                        <ChevronRight className="h-3 w-3" />
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

function StatPill({ label, value, tone }: { label: string; value: number; tone: "amber" | "red" }) {
  const cls =
    tone === "amber"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300";
  return (
    <div className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium", cls)}>
      <span className="opacity-70 mr-1.5">{label}</span>
      <span className="font-bold text-sm">{value}</span>
    </div>
  );
}

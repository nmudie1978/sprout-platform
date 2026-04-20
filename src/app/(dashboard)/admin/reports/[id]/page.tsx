import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Shield, User, Briefcase, Clock, AlertTriangle } from "lucide-react";
import { REPORT_REASONS } from "@/lib/community-guardian";
import { ReportActions } from "@/components/admin/report-actions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminReportDetailPage({ params }: PageProps) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const report = await prisma.communityReport.findUnique({
    where: { id },
    include: {
      community: { select: { name: true } },
      reporter: {
        select: {
          id: true,
          email: true,
          role: true,
          youthProfile: { select: { displayName: true } },
          employerProfile: { select: { companyName: true } },
        },
      },
      assignedGuardian: {
        select: {
          id: true,
          email: true,
          youthProfile: { select: { displayName: true } },
        },
      },
    },
  });

  if (!report) {
    notFound();
  }

  // Fetch the target's details so the admin can make an informed call
  const targetJob =
    report.targetType === "JOB_POST"
      ? await prisma.microJob.findUnique({ where: { id: report.targetId } })
      : null;
  const targetUser =
    report.targetType === "USER"
      ? await prisma.user.findUnique({
          where: { id: report.targetId },
          include: {
            youthProfile: { select: { displayName: true, city: true } },
            employerProfile: { select: { companyName: true, eidVerified: true, ageVerified: true } },
          },
        })
      : null;

  const reporterName =
    report.reporter.youthProfile?.displayName ??
    report.reporter.employerProfile?.companyName ??
    report.reporter.email ??
    "—";
  const reasonLabel = REPORT_REASONS[report.reason as keyof typeof REPORT_REASONS] ?? report.reason;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Link
        href="/admin/reports"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to queue
      </Link>

      <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 mb-1">
        <Shield className="h-5 w-5 text-teal-400" />
        Report #{report.id.slice(0, 8)}
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Submitted {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(report.createdAt)}
        {" · "}
        Community: <span className="text-foreground/80">{report.community.name}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DetailCard label="Status">
          <StatusPill status={report.status} />
        </DetailCard>
        <DetailCard label="Target">
          <span className="inline-flex items-center gap-1.5 text-sm">
            {report.targetType === "JOB_POST" ? <Briefcase className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            {report.targetType === "JOB_POST" ? "Job post" : "User"}
          </span>
        </DetailCard>
        <DetailCard label="Reason">
          <span className="text-sm">{reasonLabel}</span>
        </DetailCard>
      </div>

      {report.details && (
        <div className="rounded-lg border border-border/40 bg-card p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Reporter's note
          </p>
          <p className="text-sm whitespace-pre-wrap text-foreground/90">{report.details}</p>
        </div>
      )}

      <div className="rounded-lg border border-border/40 bg-card p-4 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Reporter
        </p>
        <p className="text-sm text-foreground/90">{reporterName}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{report.reporter.email} · {report.reporter.role}</p>
      </div>

      {targetJob && (
        <div className="rounded-lg border border-border/40 bg-card p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Reported job
          </p>
          <p className="text-sm font-medium text-foreground/90">{targetJob.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {targetJob.category} · {targetJob.location ?? "—"} · {targetJob.status}
            {targetJob.isPaused && <span className="ml-2 text-amber-500">· PAUSED</span>}
          </p>
          {targetJob.description && (
            <p className="text-xs text-foreground/70 mt-2 whitespace-pre-wrap max-h-32 overflow-y-auto">
              {targetJob.description}
            </p>
          )}
        </div>
      )}

      {targetUser && (
        <div className="rounded-lg border border-border/40 bg-card p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Reported user
          </p>
          <p className="text-sm font-medium text-foreground/90">
            {targetUser.youthProfile?.displayName ?? targetUser.employerProfile?.companyName ?? targetUser.email}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {targetUser.role} · {targetUser.email}
            {targetUser.isPaused && <span className="ml-2 text-amber-500">· PAUSED</span>}
            {targetUser.accountStatus !== "ACTIVE" && <span className="ml-2 text-amber-500">· {targetUser.accountStatus}</span>}
          </p>
        </div>
      )}

      {report.guardianNote && (
        <div className="rounded-lg border border-border/40 bg-muted/20 p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Guardian note
          </p>
          <p className="text-sm whitespace-pre-wrap text-foreground/80">{report.guardianNote}</p>
        </div>
      )}

      {report.actionTaken && (
        <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300 mb-2">
            Action taken
          </p>
          <p className="text-sm text-foreground/80">{report.actionTaken}</p>
          {report.actionTakenAt && (
            <p className="text-xs text-muted-foreground mt-1">
              {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(report.actionTakenAt)}
            </p>
          )}
        </div>
      )}

      <ReportActions
        reportId={report.id}
        currentStatus={report.status}
        targetType={report.targetType}
        targetAlreadyPaused={
          targetJob?.isPaused ?? targetUser?.isPaused ?? false
        }
      />
    </div>
  );
}

function DetailCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/40 bg-card p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; Icon: typeof Clock }> = {
    OPEN: { label: "Open", className: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300", Icon: Clock },
    UNDER_REVIEW: { label: "Under review", className: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300", Icon: Shield },
    ESCALATED: { label: "Escalated", className: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300", Icon: AlertTriangle },
    ACTION_TAKEN: { label: "Action taken", className: "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300", Icon: Shield },
    RESOLVED: { label: "Resolved", className: "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300", Icon: Shield },
    DISMISSED: { label: "Dismissed", className: "border-muted-foreground/40 bg-muted/30 text-muted-foreground", Icon: Shield },
  };
  const c = config[status] ?? config.OPEN;
  const Icon = c.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${c.className}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

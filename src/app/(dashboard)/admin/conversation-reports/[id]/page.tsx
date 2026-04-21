import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Shield, AlertTriangle, Clock } from "lucide-react";
import { ConversationReportActions } from "@/components/admin/conversation-report-actions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  GROOMING: "Grooming / predatory behaviour",
  SEXUAL_CONTENT: "Sexual content",
  OFF_PLATFORM: "Moving off-platform",
  HARASSMENT: "Harassment / bullying",
  INAPPROPRIATE_JOB: "Inappropriate job posting",
  OTHER: "Other",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminConversationReportDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const report = await prisma.conversationReport.findUnique({
    where: { id },
    include: {
      reporter: {
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          youthProfile: { select: { displayName: true } },
          employerProfile: { select: { companyName: true } },
        },
      },
      reported: {
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          youthProfile: { select: { displayName: true } },
          employerProfile: { select: { companyName: true } },
        },
      },
      conversation: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          messages: {
            orderBy: { createdAt: "asc" },
            take: 200,
            select: {
              id: true,
              senderId: true,
              content: true,
              intent: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!report) {
    notFound();
  }

  const reviewer = report.reviewerId
    ? await prisma.user.findUnique({
        where: { id: report.reviewerId },
        select: { email: true, youthProfile: { select: { displayName: true } } },
      })
    : null;

  const label = (u: typeof report.reporter): string =>
    u.youthProfile?.displayName ||
    u.employerProfile?.companyName ||
    u.email?.split("@")[0] ||
    "—";

  const isUrgent = report.category === "GROOMING" || report.category === "SEXUAL_CONTENT";

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Link
        href="/admin/conversation-reports"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to queue
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            {isUrgent && <AlertTriangle className="h-5 w-5 text-red-500" />}
            {!isUrgent && <Shield className="h-5 w-5 text-teal-400" />}
            {CATEGORY_LABELS[report.category] ?? report.category}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Filed {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(report.createdAt)}
            {" · "}Status: <span className="font-medium">{report.status}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: party info + details + conversation preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PartyCard title="Reporter" user={report.reporter} label={label(report.reporter)} />
            <PartyCard title="Reported user" user={report.reported} label={label(report.reported)} highlight />
          </div>

          {report.details && (
            <section className="rounded-lg border border-border/40 bg-card p-4">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Reporter's details</h2>
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                {report.details}
              </p>
            </section>
          )}

          {report.reviewerNote && (
            <section className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
              <h2 className="text-xs uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2">Reviewer note</h2>
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                {report.reviewerNote}
              </p>
              {reviewer && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  Reviewed by{" "}
                  {reviewer.youthProfile?.displayName || reviewer.email?.split("@")[0] || "—"}
                  {report.reviewedAt && " on " + new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(report.reviewedAt)}
                </p>
              )}
            </section>
          )}

          <section className="rounded-lg border border-border/40 bg-card p-4">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Conversation (most recent {report.conversation.messages.length} of 200 max)
            </h2>
            {report.conversation.messages.length === 0 ? (
              <p className="text-xs text-muted-foreground">No messages in this conversation.</p>
            ) : (
              <ol className="space-y-2 max-h-[480px] overflow-y-auto text-xs">
                {report.conversation.messages.map((m) => {
                  const fromReported = m.senderId === report.reportedId;
                  return (
                    <li
                      key={m.id}
                      className={cn(
                        "rounded-md border p-2.5",
                        fromReported
                          ? "border-red-500/30 bg-red-500/5"
                          : "border-border/40 bg-muted/20",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={cn("text-[10px] uppercase tracking-wider font-semibold", fromReported ? "text-red-700 dark:text-red-300" : "text-muted-foreground")}>
                          {fromReported ? "Reported user" : "Reporter"}
                          {m.intent && <span className="ml-2 text-muted-foreground/60">· {m.intent}</span>}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(m.createdAt)}
                        </span>
                      </div>
                      <p className="text-foreground/85 whitespace-pre-wrap leading-relaxed">
                        {m.content}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>

        {/* Right: actions */}
        <aside className="lg:col-span-1">
          <ConversationReportActions reportId={report.id} currentStatus={report.status} />
          {report.actionTaken && (
            <div className="mt-3 rounded-lg border border-border/40 bg-muted/20 p-3">
              <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Last action taken</h3>
              <p className="text-xs text-foreground/80">{report.actionTaken}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function PartyCard({
  title,
  user,
  label,
  highlight,
}: {
  title: string;
  user: { role: string; email: string | null; createdAt: Date };
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-lg border p-3",
      highlight ? "border-red-500/30 bg-red-500/5" : "border-border/40 bg-card",
    )}>
      <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{title}</h3>
      <div className="text-sm font-medium text-foreground/90">{label}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">
        {user.role.toLowerCase()} · joined {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(user.createdAt)}
      </div>
      {user.email && (
        <div className="text-[10px] text-muted-foreground/70 mt-1 font-mono truncate">{user.email}</div>
      )}
    </div>
  );
}

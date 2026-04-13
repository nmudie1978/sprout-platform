"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  MapPin,
  Clock,
  XCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Filter,
  Download,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useCallback, memo } from "react";
import { toast } from "sonner";

const categoryEmojis: Record<string, string> = {
  BABYSITTING: "\u{1F476}",
  DOG_WALKING: "\u{1F415}",
  SNOW_CLEARING: "\u2744\uFE0F",
  CLEANING: "\u{1F9F9}",
  DIY_HELP: "\u{1F527}",
  TECH_HELP: "\u{1F4BB}",
  ERRANDS: "\u{1F3C3}",
  OTHER: "\u2728",
};

type FilterType = "all" | "pending" | "accepted" | "in_progress" | "completed" | "rejected" | "saved";

// Fixed widths on the Status/Pay/Arrow columns are load-bearing: each
// <div className="grid ..."> is its own independent grid, so `auto` sizes
// to that grid's own content. The header's "Status"/"Pay" text is much
// narrower than the row's Pending badge + "263 kr / fixed" block, which
// pushed the fr columns out of alignment between the header and rows.
// Fixed pixel widths force both grids to share the same geometry.
const APP_GRID =
  "grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)_minmax(0,1fr)_110px_90px_20px]";

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

function getStatusBadge(app: any) {
  const isAccepted = app.status === "ACCEPTED";
  const jobStatus = app.job?.status;
  const isJobDone = isAccepted && (jobStatus === "COMPLETED" || jobStatus === "REVIEWED");
  const isJobInProgress = isAccepted && jobStatus === "IN_PROGRESS";

  if (isJobDone) return <Badge className="h-5 text-[10px] bg-green-600 text-white px-1.5"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Done</Badge>;
  if (isJobInProgress) return <Badge className="h-5 text-[10px] bg-teal-500 text-white px-1.5">Active</Badge>;
  if (isAccepted) return <Badge className="h-5 text-[10px] bg-emerald-500 text-white px-1.5"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Accepted</Badge>;
  if (app.status === "REJECTED") return <Badge variant="destructive" className="h-5 text-[10px] px-1.5"><XCircle className="h-2.5 w-2.5 mr-0.5" />Declined</Badge>;
  return <Badge variant="secondary" className="h-5 text-[10px] px-1.5"><Clock className="h-2.5 w-2.5 mr-0.5" />Pending</Badge>;
}

// ── List header ──────────────────────────────────────────────────────

function ApplicationListHeader() {
  return (
    <div className={`hidden lg:grid ${APP_GRID} items-center gap-4 px-4 py-2 border-b bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wider`}>
      <span>Job</span>
      <span>Location</span>
      <span>Date</span>
      <span>Status</span>
      <span className="text-right">Pay</span>
      <span className="w-3.5" />
    </div>
  );
}

// ── List row ─────────────────────────────────────────────────────────

const ApplicationRow = memo(function ApplicationRow({ app }: { app: any }) {
  const employer = app.job.postedBy?.employerProfile;
  const isRejected = app.status === "REJECTED";
  const appliedAgo = formatTimeAgo(app.createdAt);

  return (
    <Link href={`/jobs/${app.job.id}`} className="block group">
      {/* Desktop: grid row */}
      <div className={`hidden lg:grid ${APP_GRID} items-center gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${isRejected ? "opacity-50" : ""}`}>
        {/* Job */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center text-lg shrink-0">
            {categoryEmojis[app.job.category] || "\u2728"}
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
              {app.job.title}
            </h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <span className="truncate font-medium">{employer?.companyName || "Individual"}</span>
              {employer?.verified && <CheckCircle2 className="h-3 w-3 text-blue-500 shrink-0" />}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{app.job.location?.split(",")[0] || "TBC"}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{app.job.startDate ? formatDate(app.job.startDate).split(",")[0] : "TBC"}</span>
        </div>

        {/* Status */}
        <div>{getStatusBadge(app)}</div>

        {/* Pay */}
        <div className="text-right">
          <span className="font-bold text-sm">{formatCurrency(app.job.payAmount)}</span>
          {app.job.payType && (
            <p className="text-[10px] text-muted-foreground">
              {app.job.payType === "HOURLY" ? "/hr" : "fixed"}
            </p>
          )}
        </div>

        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* Mobile: stacked row */}
      <div className={`flex lg:hidden items-start gap-3 px-3 py-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${isRejected ? "opacity-50" : ""}`}>
        <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center text-lg shrink-0">
          {categoryEmojis[app.job.category] || "\u2728"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
              {app.job.title}
            </h4>
            {getStatusBadge(app)}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {employer?.companyName || "Individual"}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground/70 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5" />
              {app.job.location?.split(",")[0] || "TBC"}
            </span>
            <span>{appliedAgo}</span>
          </div>
        </div>
        <div className="text-right shrink-0 pt-0.5">
          <span className="font-bold text-sm">{formatCurrency(app.job.payAmount)}</span>
          {app.job.payType && (
            <p className="text-[10px] text-muted-foreground">
              {app.job.payType === "HOURLY" ? "/hr" : "fixed"}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
});

// ── Type ─────────────────────────────────────────────────────────────

interface ApplicationsResponse {
  applications: any[];
  pagination: {
    total: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
  counts: {
    pending: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
  };
}

// ── Page ─────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [filter, setFilter] = useState<FilterType>("all");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ApplicationsResponse>({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const response = await fetch("/api/applications");
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const applications = data?.applications || [];

  // Saved jobs — must be before any early returns (React hooks rules)
  const { data: savedData } = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: async () => {
      const r = await fetch("/api/jobs/saved");
      if (!r.ok) return { saved: [] };
      return r.json();
    },
    enabled: session?.user.role === "YOUTH",
  });
  const savedJobs: { id: string; savedAt: string; job: any }[] = savedData?.saved ?? [];
  const savedCount = savedJobs.length;

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p>Loading applications...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session?.user.role !== "YOUTH") {
    return (
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">This page is only available for youth workers.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredApplications = applications
    .filter((app: any) => {
      const isAccepted = app.status === "ACCEPTED";
      const jobStatus = app.job?.status;
      const isJobDone = isAccepted && (jobStatus === "COMPLETED" || jobStatus === "REVIEWED");
      const isJobInProgress = isAccepted && jobStatus === "IN_PROGRESS";

      switch (filter) {
        case "pending": return app.status === "PENDING";
        case "accepted": return isAccepted && !isJobInProgress && !isJobDone;
        case "in_progress": return isJobInProgress;
        case "completed": return isJobDone;
        case "rejected": return app.status === "REJECTED";
        default: return true;
      }
    })
    .sort((a: any, b: any) => {
      const aIsDone = a.status === "ACCEPTED" && (a.job?.status === "COMPLETED" || a.job?.status === "REVIEWED");
      const bIsDone = b.status === "ACCEPTED" && (b.job?.status === "COMPLETED" || b.job?.status === "REVIEWED");
      if (aIsDone && !bIsDone) return 1;
      if (!aIsDone && bIsDone) return -1;
      return 0;
    });

  const counts = applications.reduce(
    (acc: Record<string, number>, app: any) => {
      acc.all++;
      const isAccepted = app.status === "ACCEPTED";
      const jobStatus = app.job?.status;
      const isJobDone = isAccepted && (jobStatus === "COMPLETED" || jobStatus === "REVIEWED");
      const isJobInProgress = isAccepted && jobStatus === "IN_PROGRESS";

      if (app.status === "PENDING") acc.pending++;
      else if (app.status === "REJECTED") acc.rejected++;
      else if (isJobDone) acc.completed++;
      else if (isJobInProgress) acc.in_progress++;
      else if (isAccepted) acc.accepted++;

      return acc;
    },
    { all: 0, pending: 0, accepted: 0, in_progress: 0, completed: 0, rejected: 0 }
  );

  const filterButtons: { key: FilterType; label: string; color: string }[] = [
    { key: "all", label: "All", color: "bg-slate-500" },
    { key: "pending", label: "Pending", color: "bg-blue-500" },
    { key: "accepted", label: "Accepted", color: "bg-emerald-500" },
    { key: "in_progress", label: "Active", color: "bg-teal-500" },
    { key: "completed", label: "Done", color: "bg-green-600" },
    { key: "rejected", label: "Declined", color: "bg-red-500" },
    { key: "saved", label: "Saved", color: "bg-amber-500" },
  ];

  const countsWithSaved: Record<FilterType, number> = { ...(counts as Record<Exclude<FilterType, "saved">, number>), saved: savedCount };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
            </Button>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">My Applications</h1>
                <p className="text-sm text-muted-foreground">{applications.length} total</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground/60 hover:text-muted-foreground"
              onClick={async () => {
                try {
                  const res = await fetch('/api/earnings?period=all');
                  if (!res.ok) throw new Error('Failed to fetch');
                  const data = await res.json();
                  // Build simple CSV
                  const rows = [['Date', 'Job', 'Category', 'Amount', 'Status']];
                  for (const e of data.earnings ?? []) {
                    rows.push([
                      new Date(e.earnedAt).toLocaleDateString(),
                      e.job?.title ?? 'Unknown',
                      e.job?.category ?? '',
                      String(e.amount ?? 0),
                      e.status ?? '',
                    ]);
                  }
                  rows.push([]);
                  rows.push(['Total', '', '', String(data.summary?.totalEarnings ?? 0), '']);
                  const csv = rows.map((r) => r.join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `earnings-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch {
                  toast.error('Failed to download earnings');
                }
              }}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Earnings CSV
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {filterButtons.map((btn) => (
            <Button
              key={btn.key}
              variant={filter === btn.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(btn.key)}
              className={filter === btn.key ? btn.color : ""}
            >
              {btn.label}
              <Badge variant="secondary" className={`ml-2 text-xs ${filter === btn.key ? "bg-white/20 text-white" : ""}`}>
                {countsWithSaved[btn.key]}
              </Badge>
            </Button>
          ))}
        </div>

        {/* List */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {filter === "saved" ? (
            savedJobs.length > 0 ? (
              <div className="border rounded-xl overflow-hidden bg-card divide-y">
                {savedJobs.map((s) => (
                  <Link
                    key={s.id}
                    href={`/jobs/${s.job.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <Bookmark className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.job.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {s.job.location ?? "Location TBC"} · Saved {formatTimeAgo(s.savedAt)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground shrink-0">
                      {formatCurrency(s.job.payAmount)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bookmark className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground mb-4">No saved jobs yet</p>
                  <Button asChild><Link href="/jobs">Browse Small Jobs</Link></Button>
                </CardContent>
              </Card>
            )
          ) : filteredApplications.length > 0 ? (
            <div className="border rounded-xl overflow-hidden bg-card">
              <ApplicationListHeader />
              {filteredApplications.map((app: any) => (
                <ApplicationRow key={app.id} app={app} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  {filter === "all"
                    ? "No applications yet"
                    : `No ${filter.replace("_", " ")} applications`}
                </p>
                {filter === "all" ? (
                  <Button asChild><Link href="/jobs">Browse Small Jobs</Link></Button>
                ) : (
                  <Button variant="outline" onClick={() => setFilter("all")}>View All</Button>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

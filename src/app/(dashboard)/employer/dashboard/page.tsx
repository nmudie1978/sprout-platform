"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  CheckCircle,
  Plus,
  Star,
  ExternalLink,
  Clock,
  UserCheck,
  XCircle,
  AlertCircle,
  ArrowRight,
  MapPin,
  CalendarDays,
  Settings,
  User,
  RefreshCw,
  Pencil,
  Hash,
  TrendingUp,
  Eye,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  Zap,
  Copy,
  Check,
  Filter,
  LayoutGrid,
  List,
  Search,
  MessageCircle,
  Heart,
  FileText,
  Calendar,
  Download,
  DollarSign,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import { DashboardReviews } from "@/components/dashboard-reviews";
import { JobStatusManager } from "@/components/job-status-manager";
import { JobEditDialog } from "@/components/job-edit-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmPaymentButton } from "@/components/confirm-payment-button";
import { DeleteJobButton } from "@/components/delete-job-button";

type JobStatus = "ALL" | "POSTED" | "ON_HOLD" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type ViewMode = "grid" | "list";

// Generate short job ID for display
function getShortJobId(fullId: string): string {
  return fullId.slice(0, 8).toUpperCase();
}

// Copy to clipboard component
function CopyJobId({ jobId }: { jobId: string }) {
  const [copied, setCopied] = useState(false);
  const shortId = getShortJobId(jobId);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(jobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <Hash className="h-3 w-3" />
            {shortId}
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3 opacity-50" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Click to copy full ID"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Status tab component
function StatusTabs({
  activeStatus,
  onStatusChange,
  counts,
}: {
  activeStatus: JobStatus;
  onStatusChange: (status: JobStatus) => void;
  counts: Record<JobStatus, number>;
}) {
  const tabs: { status: JobStatus; label: string; color: string; icon: React.ReactNode }[] = [
    { status: "ALL", label: "All Jobs", color: "bg-slate-500", icon: <LayoutGrid className="h-4 w-4" /> },
    { status: "POSTED", label: "Open", color: "bg-blue-500", icon: <Zap className="h-4 w-4" /> },
    { status: "ON_HOLD", label: "Paused", color: "bg-yellow-500", icon: <AlertCircle className="h-4 w-4" /> },
    { status: "IN_PROGRESS", label: "Assigned", color: "bg-emerald-500", icon: <Clock className="h-4 w-4" /> },
    { status: "COMPLETED", label: "Done", color: "bg-purple-500", icon: <CheckCircle className="h-4 w-4" /> },
    { status: "CANCELLED", label: "Cancelled", color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <motion.button
          key={tab.status}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStatusChange(tab.status)}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeStatus === tab.status
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
              : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
          <span
            className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
              activeStatus === tab.status
                ? "bg-white/20 text-white"
                : "bg-background text-muted-foreground"
            }`}
          >
            {counts[tab.status]}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// Job card component for grid view
function JobCard({
  job,
  onDoubleClick,
  onUpdateApplication,
  isUpdating,
}: {
  job: any;
  onDoubleClick: () => void;
  onUpdateApplication: (appId: string, status: string) => void;
  isUpdating: boolean;
}) {
  const acceptedWorker = job.applications?.find((app: any) => app.status === "ACCEPTED");
  const isInProgress = job.status === "IN_PROGRESS" || job.status === "ASSIGNED";
  const isCompleted = job.status === "COMPLETED";
  const pendingApplications = job.applications?.filter((app: any) => app.status === "PENDING") || [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "POSTED":
        return { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-600 dark:text-blue-400", label: "Open", dot: "bg-blue-500" };
      case "ON_HOLD":
        return { bg: "bg-yellow-500/10 border-yellow-500/30", text: "text-yellow-600 dark:text-yellow-400", label: "Paused", dot: "bg-yellow-500" };
      case "IN_PROGRESS":
      case "ASSIGNED":
        return { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-600 dark:text-emerald-400", label: "Assigned", dot: "bg-emerald-500" };
      case "COMPLETED":
        return { bg: "bg-purple-500/10 border-purple-500/30", text: "text-purple-600 dark:text-purple-400", label: "Done", dot: "bg-purple-500" };
      case "CANCELLED":
        return { bg: "bg-red-500/10 border-red-500/30", text: "text-red-600 dark:text-red-400", label: "Cancelled", dot: "bg-red-500" };
      default:
        return { bg: "bg-muted", text: "text-muted-foreground", label: status, dot: "bg-muted-foreground" };
    }
  };

  const statusConfig = getStatusConfig(job.status);

  const formatDateRange = (startDate: string | null, endDate: string | null) => {
    if (!startDate) return "Date TBC";
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const formatShort = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    if (end && start.toDateString() !== end.toDateString()) {
      return `${formatShort(start)} - ${formatShort(end)}`;
    }
    return formatShort(start);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onDoubleClick={onDoubleClick}
      className={`group relative rounded-2xl border-2 bg-card p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10 ${statusConfig.bg}`}
    >
      {/* Status indicator bar */}
      <div className={`absolute top-0 left-4 right-4 h-1 rounded-b-full ${statusConfig.dot}`} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mt-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CopyJobId jobId={job.id} />
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${statusConfig.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
          </div>
          <h3 className="font-semibold text-base truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {job.title}
          </h3>
        </div>

        {/* Quick Actions - visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <JobEditDialog
            job={job}
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <JobStatusManager jobId={job.id} currentStatus={job.status} />
        </div>
      </div>

      {/* Meta info */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{formatDateRange(job.startDate, job.endDate)}</span>
        </div>
      </div>

      {/* Pay amount - highlighted */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {formatCurrency(job.payAmount)}
        </span>
        {job.payType === "HOURLY" && (
          <span className="text-xs text-muted-foreground">/hour</span>
        )}
      </div>

      {/* Assigned worker */}
      {isInProgress && acceptedWorker && (
        <div className="mt-3 pt-3 border-t border-emerald-500/20">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/youth/${acceptedWorker.youth.id}`}
                className="text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline truncate block"
                onClick={(e) => e.stopPropagation()}
              >
                {acceptedWorker.youth.youthProfile?.displayName || "Youth Worker"}
              </Link>
            </div>
            {acceptedWorker.youth.youthProfile?.averageRating && (
              <span className="flex items-center gap-0.5 text-xs">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {acceptedWorker.youth.youthProfile.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Completed job with payment confirmation */}
      {isCompleted && acceptedWorker && (
        <div className="mt-3 pt-3 border-t border-purple-500/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center">
                <CheckCircle className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-400 truncate">
                {acceptedWorker.youth.youthProfile?.displayName || "Youth Worker"}
              </span>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <ConfirmPaymentButton
                jobId={job.id}
                jobTitle={job.title}
                amount={job.payAmount}
                youthName={acceptedWorker.youth.youthProfile?.displayName}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pending applications */}
      {pendingApplications.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
              <Users className="h-3 w-3" />
              {pendingApplications.length} pending
            </span>
          </div>
          <div className="space-y-2">
            {pendingApplications.slice(0, 2).map((app: any) => (
              <div
                key={app.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background/50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {(app.youth.youthProfile?.displayName || "Y")[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {app.youth.youthProfile?.displayName || "Youth"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="h-6 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => onUpdateApplication(app.id, "ACCEPTED")}
                    disabled={isUpdating}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => onUpdateApplication(app.id, "REJECTED")}
                    disabled={isUpdating}
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {pendingApplications.length > 2 && (
              <p className="text-xs text-center text-muted-foreground">
                +{pendingApplications.length - 2} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* No applications indicator */}
      {(!job.applications || job.applications.length === 0) && !isInProgress && !isCompleted && job.status !== "CANCELLED" && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Awaiting applications
          </p>
        </div>
      )}

      {/* Cancelled job - delete option */}
      {job.status === "CANCELLED" && (
        <div className="mt-3 pt-3 border-t border-red-500/20" onClick={(e) => e.stopPropagation()}>
          <DeleteJobButton
            jobId={job.id}
            jobTitle={job.title}
            jobStatus={job.status}
          />
        </div>
      )}

      {/* Double-click hint */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          Double-click to view <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </motion.div>
  );
}

// Job row component for list view
function JobRow({
  job,
  onDoubleClick,
  onUpdateApplication,
  isUpdating,
}: {
  job: any;
  onDoubleClick: () => void;
  onUpdateApplication: (appId: string, status: string) => void;
  isUpdating: boolean;
}) {
  const pendingApplications = job.applications?.filter((app: any) => app.status === "PENDING") || [];
  const acceptedWorker = job.applications?.find((app: any) => app.status === "ACCEPTED");
  const isInProgress = job.status === "IN_PROGRESS" || job.status === "ASSIGNED";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "POSTED":
        return { text: "text-blue-600", dot: "bg-blue-500", label: "Open" };
      case "ON_HOLD":
        return { text: "text-yellow-600", dot: "bg-yellow-500", label: "Paused" };
      case "IN_PROGRESS":
      case "ASSIGNED":
        return { text: "text-emerald-600", dot: "bg-emerald-500", label: "Assigned" };
      case "COMPLETED":
        return { text: "text-purple-600", dot: "bg-purple-500", label: "Done" };
      case "CANCELLED":
        return { text: "text-red-600", dot: "bg-red-500", label: "Cancelled" };
      default:
        return { text: "text-muted-foreground", dot: "bg-muted-foreground", label: status };
    }
  };

  const statusConfig = getStatusConfig(job.status);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: "hsl(var(--muted) / 0.3)" }}
      onDoubleClick={onDoubleClick}
      className="group grid grid-cols-12 gap-4 items-center px-4 py-3 border-b cursor-pointer transition-colors"
    >
      {/* Job ID */}
      <div className="col-span-1">
        <CopyJobId jobId={job.id} />
      </div>

      {/* Title & Location */}
      <div className="col-span-3 min-w-0">
        <h4 className="font-medium text-sm truncate group-hover:text-purple-600 transition-colors">
          {job.title}
        </h4>
        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
          <MapPin className="h-3 w-3 shrink-0" />
          {job.location}
        </p>
      </div>

      {/* Date */}
      <div className="col-span-2 text-sm text-muted-foreground">
        {job.startDate ? formatDate(job.startDate) : "TBC"}
      </div>

      {/* Pay */}
      <div className="col-span-1">
        <span className="font-semibold text-sm">{formatCurrency(job.payAmount)}</span>
      </div>

      {/* Status */}
      <div className="col-span-1">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusConfig.text}`}>
          <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
          {statusConfig.label}
        </span>
      </div>

      {/* Applications / Assigned */}
      <div className="col-span-2">
        {isInProgress && acceptedWorker ? (
          <Link
            href={`/youth/${acceptedWorker.youth.id}`}
            className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <UserCheck className="h-3 w-3" />
            {acceptedWorker.youth.youthProfile?.displayName || "Assigned"}
          </Link>
        ) : pendingApplications.length > 0 ? (
          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30">
            {pendingApplications.length} pending
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">No applications</span>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <JobEditDialog
          job={job}
          trigger={
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          }
        />
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href={`/jobs/${job.id}`} onClick={(e) => e.stopPropagation()}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <JobStatusManager jobId={job.id} currentStatus={job.status} />
      </div>
    </motion.div>
  );
}

export default function EmployerDashboardPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeStatus, setActiveStatus] = useState<JobStatus>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: myJobs, refetch: refetchJobs } = useQuery({
    queryKey: ["employer-jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs?my=true");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
    enabled: !!session?.user.id,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });

  const { data: profile } = useQuery({
    queryKey: ["employer-profile"],
    queryFn: async () => {
      const response = await fetch("/api/employer/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
    enabled: !!session?.user.id,
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update application");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Application updated", description: "The applicant has been notified." });
      queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update application", variant: "destructive" });
    },
  });

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    if (!myJobs) return [];

    let jobs = myJobs;

    // Filter by status
    if (activeStatus !== "ALL") {
      if (activeStatus === "IN_PROGRESS") {
        jobs = jobs.filter((job: any) => job.status === "IN_PROGRESS" || job.status === "ASSIGNED");
      } else if (activeStatus === "CANCELLED") {
        jobs = jobs.filter((job: any) => job.status === "CANCELLED");
      } else {
        jobs = jobs.filter((job: any) => job.status === activeStatus);
      }
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      jobs = jobs.filter((job: any) =>
        job.title.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.id.toLowerCase().includes(query)
      );
    }

    return jobs;
  }, [myJobs, activeStatus, searchQuery]);

  // Count jobs by status
  const statusCounts = useMemo(() => {
    if (!myJobs) return { ALL: 0, POSTED: 0, ON_HOLD: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 };
    return {
      ALL: myJobs.length,
      POSTED: myJobs.filter((j: any) => j.status === "POSTED").length,
      ON_HOLD: myJobs.filter((j: any) => j.status === "ON_HOLD").length,
      IN_PROGRESS: myJobs.filter((j: any) => j.status === "IN_PROGRESS" || j.status === "ASSIGNED").length,
      COMPLETED: myJobs.filter((j: any) => j.status === "COMPLETED").length,
      CANCELLED: myJobs.filter((j: any) => j.status === "CANCELLED").length,
    };
  }, [myJobs]);

  const totalApplications = myJobs?.reduce((sum: number, job: any) => sum + (job._count?.applications || 0), 0) || 0;

  if (session?.user.role !== "EMPLOYER") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Access denied. Employers only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Employer Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your job postings and applications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetchJobs()} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Link href="/employer/post-job">
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Link>
            </Button>
          </div>
        </div>

        {/* Profile Card - Compact */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card className="border-2 border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-purple-500/30">
                    <AvatarImage src={profile?.companyLogo || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg">
                      {(profile?.companyName || "C")[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">{profile?.companyName || "Your Company"}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {profile?.averageRating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-foreground">{profile.averageRating.toFixed(1)}</span>
                        </span>
                      )}
                      <span>{profile?.totalReviews || 0} reviews</span>
                      <span>•</span>
                      <span>{myJobs?.length || 0} jobs posted</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/employer/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Row - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6"
        >
          {[
            { label: "Open", value: statusCounts.POSTED, icon: Zap, color: "text-blue-500" },
            { label: "Paused", value: statusCounts.ON_HOLD, icon: AlertCircle, color: "text-yellow-500" },
            { label: "Assigned", value: statusCounts.IN_PROGRESS, icon: Clock, color: "text-emerald-500" },
            { label: "Done", value: statusCounts.COMPLETED, icon: CheckCircle, color: "text-purple-500" },
            { label: "Applications", value: totalApplications, icon: Users, color: "text-pink-500" },
          ].map((stat) => (
            <Card key={stat.label} className="border bg-card/50">
              <CardContent className="p-3 flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Card className="border bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {[
                  { href: "/messages", label: "Messages", icon: MessageCircle, color: "text-blue-500" },
                  { href: "/employer/favorites", label: "Favorites", icon: Heart, color: "text-rose-500" },
                  { href: "/employer/rehire", label: "Re-hire", icon: RefreshCw, color: "text-green-500" },
                  { href: "/employer/templates", label: "Templates", icon: FileText, color: "text-amber-500" },
                  { href: "/employer/calendar", label: "Calendar", icon: Calendar, color: "text-purple-500" },
                  { href: "/employer/spending", label: "Spending", icon: DollarSign, color: "text-emerald-500" },
                  { href: "/employer/export", label: "Export", icon: Download, color: "text-cyan-500" },
                  { href: "/employer/talent", label: "Talent", icon: Users, color: "text-indigo-500" },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-colors group"
                  >
                    <action.icon className={`h-5 w-5 ${action.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Jobs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-purple-500" />
                    Your Job Postings
                  </CardTitle>
                  <CardDescription>
                    Double-click any job to view details • Job IDs can be copied
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  {/* View toggle */}
                  <div className="flex items-center border rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode("grid")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="mt-4">
                <StatusTabs
                  activeStatus={activeStatus}
                  onStatusChange={setActiveStatus}
                  counts={statusCounts}
                />
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {filteredJobs.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredJobs.map((job: any) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onDoubleClick={() => router.push(`/jobs/${job.id}`)}
                        onUpdateApplication={(appId, status) =>
                          updateApplicationMutation.mutate({ applicationId: appId, status })
                        }
                        isUpdating={updateApplicationMutation.isPending}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-xl overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                      <div className="col-span-1">ID</div>
                      <div className="col-span-3">Job</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-1">Pay</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-2">Applications</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    {/* Table rows */}
                    {filteredJobs.map((job: any) => (
                      <JobRow
                        key={job.id}
                        job={job}
                        onDoubleClick={() => router.push(`/jobs/${job.id}`)}
                        onUpdateApplication={(appId, status) =>
                          updateApplicationMutation.mutate({ applicationId: appId, status })
                        }
                        isUpdating={updateApplicationMutation.isPending}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                    <Briefcase className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">
                    {searchQuery ? "No jobs match your search" : "No jobs posted yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "Try a different search term" : "Start by posting your first micro-job"}
                  </p>
                  {!searchQuery && (
                    <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
                      <Link href="/employer/post-job">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Post Your First Job
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <Star className="h-6 w-6 text-amber-400" />
            Your Reviews & Rating
          </h2>
          <DashboardReviews />
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  Star,
  ArrowRight,
  Calendar,
  Building2,
  CheckCircle2,
  MapPin,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  MessageCircle,
  Compass,
  Search,
  ChevronRight,
  HandHeart,
  LayoutDashboard,
  User,
  Bot,
  Bell,
  LayoutGrid,
  List,
  GitCommitHorizontal,
} from "lucide-react";
import Link from "next/link";
import { EarningsCompact } from "@/components/earnings-compact";
import { ProfileStrengthCompact } from "@/components/profile-strength-compact";
import { BadgesDisplay } from "@/components/badges-display";
import { VerificationStatus } from "@/components/verification-status";
import { JobCardSimple } from "@/components/job-card";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { NextStepPanel } from "@/components/onboarding/next-step-panel";

const categoryEmojis: Record<string, string> = {
  BABYSITTING: "👶",
  DOG_WALKING: "🐕",
  SNOW_CLEARING: "❄️",
  CLEANING: "🧹",
  DIY_HELP: "🔧",
  TECH_HELP: "💻",
  ERRANDS: "🏃",
  OTHER: "✨",
};

// Compact Application Card Component
function ApplicationCard({ app }: { app: any }) {
  const isAccepted = app.status === "ACCEPTED";
  const isRejected = app.status === "REJECTED";
  const isPending = app.status === "PENDING";
  const jobStatus = app.job.status;

  // Determine the most relevant status to display
  const isJobDone = isAccepted && (jobStatus === "COMPLETED" || jobStatus === "REVIEWED");
  const isJobInProgress = isAccepted && jobStatus === "IN_PROGRESS";

  const getStatusColor = () => {
    if (isJobDone) return "border-l-green-500 bg-green-50/50 dark:bg-green-950/20";
    if (isJobInProgress) return "border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20";
    if (isAccepted) return "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20";
    if (isRejected) return "border-l-red-400 bg-red-50/30 dark:bg-red-950/10 opacity-60";
    return "border-l-blue-400 bg-blue-50/30 dark:bg-blue-950/10";
  };

  // Single badge showing the most relevant status
  const getStatusBadge = () => {
    // Job completed - show "Done" in green
    if (isJobDone) {
      return (
        <Badge className="h-5 text-[10px] bg-green-600 text-white px-1.5">
          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
          Done
        </Badge>
      );
    }
    // Job in progress - show "In Progress"
    if (isJobInProgress) {
      return (
        <Badge className="h-5 text-[10px] bg-purple-500 text-white px-1.5">
          In Progress
        </Badge>
      );
    }
    // Accepted but not started yet - show "Accepted"
    if (isAccepted) {
      return (
        <Badge className="h-5 text-[10px] bg-emerald-500 text-white px-1.5">
          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
          Accepted
        </Badge>
      );
    }
    // Rejected
    if (isRejected) {
      return (
        <Badge variant="destructive" className="h-5 text-[10px] px-1.5">
          <XCircle className="h-2.5 w-2.5 mr-0.5" />
          Declined
        </Badge>
      );
    }
    // Pending
    return (
      <Badge variant="secondary" className="h-5 text-[10px] px-1.5">
        <Clock className="h-2.5 w-2.5 mr-0.5" />
        Pending
      </Badge>
    );
  };

  return (
    <Link href={`/jobs/${app.job.id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        className={`p-3 rounded-xl border-l-4 border bg-card hover:shadow-md transition-all cursor-pointer relative z-10 ${getStatusColor()}`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg flex-shrink-0">
              {categoryEmojis[app.job.category] || "✨"}
            </span>
            <div className="min-w-0">
              <h4 className="font-medium text-sm truncate leading-tight">
                {app.job.title}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {app.job.postedBy?.employerProfile?.companyName || "Job Poster"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {getStatusBadge()}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {app.job.location?.split(",")[0] || "TBC"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {app.job.startDate ? formatDate(app.job.startDate).split(",")[0] : "TBC"}
            </span>
          </div>
          <span className="font-bold text-gray-600 dark:text-gray-400">
            {formatCurrency(app.job.payAmount)}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

// List View Application Row
function ApplicationListItem({ app }: { app: any }) {
  const isAccepted = app.status === "ACCEPTED";
  const isRejected = app.status === "REJECTED";
  const isPending = app.status === "PENDING";
  const jobStatus = app.job.status;
  const isJobDone = isAccepted && (jobStatus === "COMPLETED" || jobStatus === "REVIEWED");
  const isJobInProgress = isAccepted && jobStatus === "IN_PROGRESS";

  const getStatusBadge = () => {
    if (isJobDone) return <Badge className="h-5 text-[10px] bg-green-600 text-white px-1.5">Done</Badge>;
    if (isJobInProgress) return <Badge className="h-5 text-[10px] bg-purple-500 text-white px-1.5">In Progress</Badge>;
    if (isAccepted) return <Badge className="h-5 text-[10px] bg-emerald-500 text-white px-1.5">Accepted</Badge>;
    if (isRejected) return <Badge variant="destructive" className="h-5 text-[10px] px-1.5">Declined</Badge>;
    return <Badge variant="secondary" className="h-5 text-[10px] px-1.5">Pending</Badge>;
  };

  return (
    <Link href={`/jobs/${app.job.id}`} className="block">
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors border-b last:border-b-0">
        <span className="text-lg">{categoryEmojis[app.job.category] || "✨"}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{app.job.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {app.job.postedBy?.employerProfile?.companyName || "Job Poster"} • {app.job.location?.split(",")[0] || "TBC"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-medium text-muted-foreground">{formatCurrency(app.job.payAmount)}</span>
          {getStatusBadge()}
        </div>
      </div>
    </Link>
  );
}

// Timeline View Application Item
function ApplicationTimelineItem({ app, isLast }: { app: any; isLast: boolean }) {
  const isAccepted = app.status === "ACCEPTED";
  const isRejected = app.status === "REJECTED";
  const jobStatus = app.job.status;
  const isJobDone = isAccepted && (jobStatus === "COMPLETED" || jobStatus === "REVIEWED");
  const isJobInProgress = isAccepted && jobStatus === "IN_PROGRESS";

  const getTimelineColor = () => {
    if (isJobDone) return "bg-green-500";
    if (isJobInProgress) return "bg-purple-500";
    if (isAccepted) return "bg-emerald-500";
    if (isRejected) return "bg-red-400";
    return "bg-blue-400";
  };

  const getStatusLabel = () => {
    if (isJobDone) return "Completed";
    if (isJobInProgress) return "In Progress";
    if (isAccepted) return "Accepted";
    if (isRejected) return "Declined";
    return "Pending";
  };

  return (
    <Link href={`/jobs/${app.job.id}`} className="block">
      <div className="flex gap-3 group">
        {/* Timeline line and dot */}
        <div className="flex flex-col items-center">
          <div className={`w-3 h-3 rounded-full ${getTimelineColor()} ring-4 ring-background`} />
          {!isLast && <div className="w-0.5 flex-1 bg-border mt-1" />}
        </div>
        {/* Content */}
        <div className="flex-1 pb-4 group-hover:bg-muted/30 -ml-1 pl-2 pr-2 py-1 rounded-lg transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base">{categoryEmojis[app.job.category] || "✨"}</span>
                <p className="font-medium text-sm truncate">{app.job.title}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {app.job.postedBy?.employerProfile?.companyName || "Job Poster"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[10px] text-muted-foreground">{formatDate(app.createdAt).split(",")[0]}</span>
              <span className={`text-[10px] font-medium ${
                isJobDone ? "text-green-600" :
                isJobInProgress ? "text-purple-600" :
                isAccepted ? "text-emerald-600" :
                isRejected ? "text-red-500" : "text-blue-600"
              }`}>
                {getStatusLabel()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {app.job.location?.split(",")[0] || "TBC"}
            </span>
            <span className="font-medium text-foreground">{formatCurrency(app.job.payAmount)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

type ApplicationView = "cards" | "list" | "timeline";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [applicationView, setApplicationView] = useState<ApplicationView>("cards");
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  // Query onboarding status
  const { data: onboardingStatus } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: async () => {
      const response = await fetch("/api/onboarding");
      if (!response.ok) throw new Error("Failed to fetch onboarding status");
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 60 * 1000,
  });

  // Show onboarding modal if needed
  useEffect(() => {
    if (onboardingStatus) {
      if (onboardingStatus.needsOnboarding) {
        setShowOnboarding(true);
        setOnboardingComplete(false);
      } else {
        setOnboardingComplete(true);
      }
    }
  }, [onboardingStatus]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setOnboardingComplete(true);
  };

  const { data: applicationsData } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const response = await fetch("/api/applications");
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 30 * 1000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  const { data: jobsData } = useQuery({
    queryKey: ["nearby-jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs?status=POSTED&limit=6");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
    staleTime: 60 * 1000, // Cache for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Handle both old array format and new paginated format
  const jobs = Array.isArray(jobsData) ? jobsData : (jobsData?.jobs || []);

  // Extract applications array from paginated response
  const applications = Array.isArray(applicationsData) ? applicationsData : (applicationsData?.applications || []);

  const pendingApps = applications.filter((app: any) => app.status === "PENDING");
  const acceptedApps = applications.filter((app: any) => app.status === "ACCEPTED");
  // Count completed jobs from applications where the job status is COMPLETED or REVIEWED
  const completedJobs = applications.filter((app: any) =>
    app.status === "ACCEPTED" &&
    (app.job?.status === "COMPLETED" || app.job?.status === "REVIEWED")
  ).length;

  if (session?.user.role !== "YOUTH") {
    return (
      <div className="container mx-auto px-4 py-8 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p>Loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Background gradient - matches Industry Insights */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />

      <PageHeader
        title="Welcome back"
        gradientText={session?.user?.youthProfile?.displayName || ""}
        description="Here's your job activity overview"
        icon={LayoutDashboard}
      />

      {/* Onboarding Modal */}
      <OnboardingWizard
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      {/* Next Step Panel - shows after onboarding */}
      {onboardingComplete && <NextStepPanel />}

      {/* Stats Bar - Subtle informational cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-2 mb-6"
      >
        <Card className="border bg-blue-50/40 dark:bg-blue-950/20">
          <CardContent className="py-3 px-2 text-center">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{pendingApps.length}</div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              Pending
            </p>
          </CardContent>
        </Card>
        <Card className="border bg-emerald-50/40 dark:bg-emerald-950/20">
          <CardContent className="py-3 px-2 text-center">
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{acceptedApps.length}</div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Accepted
            </p>
          </CardContent>
        </Card>
        <Card className="border bg-purple-50/40 dark:bg-purple-950/20">
          <CardContent className="py-3 px-2 text-center">
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">{completedJobs}</div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
              <Star className="h-2.5 w-2.5" />
              Completed
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="border bg-muted/30">
          <CardContent className="p-3">
            <div className="grid grid-cols-4 gap-1">
              {[
                { href: "/jobs", label: "Small Jobs", icon: Search, color: "text-blue-500" },
                { href: "/messages", label: "Messages", icon: MessageCircle, color: "text-green-500" },
                { href: "/pokes", label: "Pokes", icon: HandHeart, color: "text-pink-500" },
                { href: "/careers", label: "Careers", icon: Compass, color: "text-purple-500" },
              ].map((action) => {
                const IconComponent = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors group cursor-pointer"
                  >
                    <IconComponent className={`h-5 w-5 ${action.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                      {action.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Applications & Jobs */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Applications */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">My Applications</h2>
                    {applications?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {applications.length}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    {applications?.length > 0 && (
                      <div className="flex items-center bg-slate-800 dark:bg-slate-900 rounded-xl p-1.5 gap-1">
                        <button
                          onClick={() => setApplicationView("cards")}
                          className={`p-2.5 rounded-full transition-all ${
                            applicationView === "cards"
                              ? "bg-slate-600/80 text-white ring-2 ring-slate-500/50"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                          }`}
                          title="Card view"
                        >
                          <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setApplicationView("list")}
                          className={`p-2.5 rounded-full transition-all ${
                            applicationView === "list"
                              ? "bg-slate-600/80 text-white ring-2 ring-slate-500/50"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                          }`}
                          title="List view"
                        >
                          <List className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setApplicationView("timeline")}
                          className={`p-2.5 rounded-full transition-all ${
                            applicationView === "timeline"
                              ? "bg-slate-600/80 text-white ring-2 ring-slate-500/50"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                          }`}
                          title="Timeline view"
                        >
                          <GitCommitHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                      <Link href="/jobs">
                        Find Small Jobs <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {applications && applications.length > 0 ? (
                  <>
                    {/* Cards View */}
                    {applicationView === "cards" && (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[...applications]
                          .sort((a: any, b: any) => {
                            const aIsDone = a.status === "ACCEPTED" && (a.job?.status === "COMPLETED" || a.job?.status === "REVIEWED");
                            const bIsDone = b.status === "ACCEPTED" && (b.job?.status === "COMPLETED" || b.job?.status === "REVIEWED");
                            if (aIsDone && !bIsDone) return 1;
                            if (!aIsDone && bIsDone) return -1;
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                          })
                          .slice(0, 6)
                          .map((app: any) => (
                            <ApplicationCard key={app.id} app={app} />
                          ))}
                      </div>
                    )}

                    {/* List View */}
                    {applicationView === "list" && (
                      <div className="border rounded-lg divide-y">
                        {[...applications]
                          .sort((a: any, b: any) => {
                            const aIsDone = a.status === "ACCEPTED" && (a.job?.status === "COMPLETED" || a.job?.status === "REVIEWED");
                            const bIsDone = b.status === "ACCEPTED" && (b.job?.status === "COMPLETED" || b.job?.status === "REVIEWED");
                            if (aIsDone && !bIsDone) return 1;
                            if (!aIsDone && bIsDone) return -1;
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                          })
                          .slice(0, 8)
                          .map((app: any) => (
                            <ApplicationListItem key={app.id} app={app} />
                          ))}
                      </div>
                    )}

                    {/* Timeline View */}
                    {applicationView === "timeline" && (
                      <div className="pl-1">
                        {[...applications]
                          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .slice(0, 8)
                          .map((app: any, index: number, arr: any[]) => (
                            <ApplicationTimelineItem key={app.id} app={app} isLast={index === arr.length - 1} />
                          ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center border rounded-lg bg-muted/30">
                    <div className="text-3xl mb-2">📋</div>
                    <p className="text-sm text-muted-foreground mb-3">No applications yet</p>
                    <Button size="sm" asChild>
                      <Link href="/jobs">Browse Small Jobs</Link>
                    </Button>
                  </div>
                )}

                {applications?.length > 6 && (
                  <div className="text-center mt-3">
                    <Button variant="outline" size="sm" className="text-xs" asChild>
                      <Link href="/applications">
                        View all {applications.length} applications
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Jobs Near You */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <h2 className="font-semibold">Small Jobs Near You</h2>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                    <Link href="/jobs">
                      View All <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>

                {jobs && jobs.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {jobs.slice(0, 4).map((job: any) => (
                      <JobCardSimple key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center border rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">No jobs available right now</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Sidebar Widgets */}
        <div className="space-y-4">
            {/* Profile Strength */}
            {/* Account Verification Status */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <VerificationStatus compact />
            </motion.div>

            {/* Profile Strength */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <ProfileStrengthCompact />
            </motion.div>

            {/* Earnings */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <EarningsCompact />
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <BadgesDisplay compact />
            </motion.div>

            {/* Career Insights Link */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative z-30"
            >
              <Link href="/careers" className="block">
                <Card className="border hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group relative z-30">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                        <Compass className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Explore Careers</p>
                        <p className="text-xs text-muted-foreground">Discover your path</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* AI Career Advisor Link */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="relative z-30"
            >
              <Link href="/career-advisor" className="block">
                <Card className="border hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group bg-gradient-to-r from-primary/5 to-purple-500/5 relative z-30">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 group-hover:from-primary/30 group-hover:to-purple-500/30 transition-colors">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">AI Career Advisor</p>
                        <p className="text-xs text-muted-foreground">Get personalised guidance</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </div>
        </div>
    </div>
  );
}

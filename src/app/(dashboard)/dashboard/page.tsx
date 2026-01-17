"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  User,
  Search,
  Bot,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { EarningsCompact } from "@/components/earnings-compact";
import { ProfileStrengthCompact } from "@/components/profile-strength-compact";
import { BadgesDisplay } from "@/components/badges-display";
import { VerificationStatus } from "@/components/verification-status";

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
                {app.job.postedBy?.employerProfile?.companyName || "Employer"}
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
          <span className="font-bold text-primary">
            {formatCurrency(app.job.payAmount)}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

// Compact Job Card for "Jobs Near You"
function JobCardCompact({ job }: { job: any }) {
  return (
    <Link href={`/jobs/${job.id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="p-3 rounded-xl border-l-4 border-l-amber-600 border bg-amber-50/50 dark:bg-amber-950/20 hover:shadow-md hover:border-amber-400 transition-all cursor-pointer relative z-10"
      >
        <div className="flex items-start gap-2 mb-2">
          <span className="text-lg">{categoryEmojis[job.category] || "✨"}</span>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{job.title}</h4>
          </div>
          <span className="font-bold text-sm text-primary whitespace-nowrap">
            {formatCurrency(job.payAmount)}
          </span>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Building2 className="h-3 w-3 flex-shrink-0" />
            <span className="font-medium text-foreground/70">Employer:</span>
            <span className="truncate">{job.postedBy?.employerProfile?.companyName || "TBC"}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="font-medium text-foreground/70">Location:</span>
            <span className="truncate">{job.location?.split(",")[0] || "TBC"}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium text-foreground/70">Start:</span>
              <span>{job.startDate ? formatDate(job.startDate).split(",")[0] : "Flexible"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium text-foreground/70">Posted:</span>
              <span>{formatDate(job.createdAt).split(",")[0]}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();

  const { data: applications } = useQuery({
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

  const pendingApps = applications?.filter((app: any) => app.status === "PENDING") || [];
  const acceptedApps = applications?.filter((app: any) => app.status === "ACCEPTED") || [];
  // Count completed jobs from applications where the job status is COMPLETED or REVIEWED
  const completedJobs = applications?.filter((app: any) =>
    app.status === "ACCEPTED" &&
    (app.job?.status === "COMPLETED" || app.job?.status === "REVIEWED")
  )?.length || 0;

  if (session?.user.role !== "YOUTH") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p>Loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Multi-layered gradient background */}
      <div className="fixed inset-0 -z-20">
        {/* Base gradient - blue to cyan transition */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30" />

        {/* Secondary gradient overlay - adds depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-sky-50/30 dark:from-transparent dark:via-slate-800/20 dark:to-cyan-900/20" />

        {/* Radial highlight in center-top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-blue-100/50 via-cyan-50/20 to-transparent dark:from-blue-900/20 dark:via-cyan-950/10 dark:to-transparent blur-2xl" />

        {/* Bottom fade to darker */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-slate-100/80 via-slate-50/40 to-transparent dark:from-slate-950/90 dark:via-slate-900/50 dark:to-transparent" />
      </div>

      {/* Animated Background - Gradient Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-400/25 via-cyan-300/20 to-transparent blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/4 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-teal-400/20 via-emerald-300/15 to-transparent blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] rounded-full bg-gradient-to-tl from-indigo-400/20 via-blue-300/15 to-transparent blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, -15, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* Additional accent blob */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-200/10 via-cyan-100/15 to-teal-200/10 dark:from-blue-800/10 dark:via-cyan-900/10 dark:to-teal-800/10 blur-3xl"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Floating Bubbles - Discreet and light */}
      <div className="fixed inset-0 z-30 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${6 + (i % 3) * 4}px`,
              height: `${6 + (i % 3) * 4}px`,
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
              background: i % 2 === 0
                ? "radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(59,130,246,0.2) 50%, transparent 70%)"
                : "radial-gradient(circle, rgba(6,182,212,0.5) 0%, rgba(6,182,212,0.2) 50%, transparent 70%)",
              boxShadow: i % 2 === 0
                ? "0 0 12px rgba(59,130,246,0.3)"
                : "0 0 12px rgba(6,182,212,0.3)",
            }}
            animate={{
              y: [0, -25 - (i % 3) * 10, 0],
              x: [0, i % 2 === 0 ? 10 : -10, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 8 + i * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold">
            Welcome back
            {session?.user?.youthProfile?.displayName && (
              <span className="text-primary">, {session.user.youthProfile.displayName}</span>
            )}
            !
          </h1>
          <p className="text-sm text-muted-foreground">Here's your job activity overview</p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3 mb-6 relative z-20"
        >
          <Card className="border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingApps.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{acceptedApps.length}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedJobs}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 relative z-20"
        >
          <Card className="border bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
            <CardContent className="p-3">
              <div className="grid grid-cols-5 gap-1">
                {[
                  { href: "/jobs", label: "Find Jobs", icon: Search, color: "text-blue-500" },
                  { href: "/messages", label: "Messages", icon: MessageCircle, color: "text-green-500" },
                  { href: "/careers", label: "Careers", icon: Compass, color: "text-purple-500" },
                  { href: "/profile", label: "Profile", icon: User, color: "text-amber-500" },
                  { href: "/career-advisor", label: "AI Advisor", icon: Bot, color: "text-purple-500" },
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
        <div className="grid lg:grid-cols-3 gap-6 relative z-20">
          {/* Left Column - Applications & Jobs */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Applications */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
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
                <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                  <Link href="/jobs">
                    Find Jobs <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>

              {applications && applications.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {[...applications]
                    .sort((a: any, b: any) => {
                      // Done jobs go last
                      const aIsDone = a.status === "ACCEPTED" && (a.job?.status === "COMPLETED" || a.job?.status === "REVIEWED");
                      const bIsDone = b.status === "ACCEPTED" && (b.job?.status === "COMPLETED" || b.job?.status === "REVIEWED");
                      if (aIsDone && !bIsDone) return 1;
                      if (!aIsDone && bIsDone) return -1;
                      // Then sort by createdAt (most recent first)
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .slice(0, 6)
                    .map((app: any) => (
                      <ApplicationCard key={app.id} app={app} />
                    ))}
                </div>
              ) : (
                <Card className="border">
                  <CardContent className="py-8 text-center">
                    <div className="text-3xl mb-2">📋</div>
                    <p className="text-sm text-muted-foreground mb-3">No applications yet</p>
                    <Button size="sm" asChild>
                      <Link href="/jobs">Browse Jobs</Link>
                    </Button>
                  </CardContent>
                </Card>
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
            </motion.div>

            {/* Jobs Near You */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <h2 className="font-semibold">Jobs Near You</h2>
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
                    <JobCardCompact key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <Card className="border">
                  <CardContent className="py-6 text-center">
                    <p className="text-sm text-muted-foreground">No jobs available right now</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Right Column - Sidebar Widgets */}
          <div className="space-y-4 relative z-20">
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
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                        <Compass className="h-5 w-5 text-purple-600" />
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
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 group-hover:from-primary/30 group-hover:to-purple-500/30 transition-colors">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">AI Career Advisor</p>
                        <p className="text-xs text-muted-foreground">Get personalized guidance</p>
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
    </div>
  );
}

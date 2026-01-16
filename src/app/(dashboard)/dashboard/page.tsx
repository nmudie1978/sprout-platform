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

  const getStatusColor = () => {
    if (isAccepted) return "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20";
    if (isRejected) return "border-l-red-400 bg-red-50/30 dark:bg-red-950/10 opacity-60";
    return "border-l-blue-400 bg-blue-50/30 dark:bg-blue-950/10";
  };

  const getStatusBadge = () => {
    if (isAccepted) {
      return (
        <Badge className="h-5 text-[10px] bg-emerald-500 text-white px-1.5">
          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
          Accepted
        </Badge>
      );
    }
    if (isRejected) {
      return (
        <Badge variant="destructive" className="h-5 text-[10px] px-1.5">
          <XCircle className="h-2.5 w-2.5 mr-0.5" />
          Declined
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="h-5 text-[10px] px-1.5">
        <Clock className="h-2.5 w-2.5 mr-0.5" />
        Pending
      </Badge>
    );
  };

  const getJobStatusBadge = () => {
    if (!isAccepted) return null;
    switch (jobStatus) {
      case "IN_PROGRESS":
        return (
          <Badge className="h-5 text-[10px] bg-purple-500 text-white px-1.5">
            <Loader2 className="h-2.5 w-2.5 mr-0.5 animate-spin" />
            Active
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="h-5 text-[10px] bg-green-600 text-white px-1.5">
            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
            Done
          </Badge>
        );
      default:
        return null;
    }
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
            {getJobStatusBadge()}
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
        className="p-3 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all cursor-pointer relative z-10"
      >
        <div className="flex items-start gap-2 mb-2">
          <span className="text-lg">{categoryEmojis[job.category] || "✨"}</span>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{job.title}</h4>
            <p className="text-xs text-muted-foreground truncate">
              {job.postedBy?.employerProfile?.companyName || "Employer"}
            </p>
          </div>
          <span className="font-bold text-sm text-primary whitespace-nowrap">
            {formatCurrency(job.payAmount)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location?.split(",")[0] || "TBC"}
          </span>
          <span>•</span>
          <span>{job.startDate ? formatDate(job.startDate).split(",")[0] : "Flexible"}</span>
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
  });

  const { data: jobs } = useQuery({
    queryKey: ["nearby-jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs?status=POSTED&limit=6");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
  });

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
      {/* Base gradient background layer */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-violet-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/50" />

      {/* Animated Mesh Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large animated gradient blob - top right (purple/blue) */}
        <motion.div
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(59,130,246,0.25) 40%, transparent 70%)",
            filter: "blur(40px)",
          }}
          animate={{
            x: [0, 60, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Large animated gradient blob - left side (emerald/teal) */}
        <motion.div
          className="absolute top-[15%] -left-[15%] w-[50%] h-[50%] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(20,184,166,0.2) 40%, transparent 70%)",
            filter: "blur(40px)",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />

        {/* Animated gradient blob - bottom right (pink/purple) */}
        <motion.div
          className="absolute bottom-[5%] right-[10%] w-[45%] h-[45%] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(168,85,247,0.2) 40%, transparent 70%)",
            filter: "blur(40px)",
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, 60, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />

        {/* Center floating blob (blue/cyan) */}
        <motion.div
          className="absolute top-[40%] left-[35%] w-[35%] h-[35%] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(6,182,212,0.2) 40%, transparent 70%)",
            filter: "blur(35px)",
          }}
          animate={{
            x: [0, -30, 30, 0],
            y: [0, 30, -30, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(139,92,246,0.15) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(139,92,246,0.15) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${6 + (i % 3) * 4}px`,
              height: `${6 + (i % 3) * 4}px`,
              left: `${10 + i * 11}%`,
              top: `${15 + (i % 4) * 20}%`,
              background: i % 2 === 0
                ? "rgba(139,92,246,0.6)"
                : i % 3 === 0
                  ? "rgba(16,185,129,0.6)"
                  : "rgba(59,130,246,0.6)",
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, i % 2 === 0 ? 15 : -15, 0],
              opacity: [0.4, 0.9, 0.4],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 5 + i * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6,
            }}
          />
        ))}

        {/* Top gradient line accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

        {/* Animated shimmer line */}
        <motion.div
          className="absolute top-[30%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scaleX: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
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
                  {applications.slice(0, 6).map((app: any) => (
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
            >
              <Link href="/careers">
                <Card className="border hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group">
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
            >
              <Link href="/career-advisor">
                <Card className="border hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group bg-gradient-to-r from-primary/5 to-purple-500/5">
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

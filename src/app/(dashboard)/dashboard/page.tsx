"use client";

/**
 * DASHBOARD PAGE — Style 7 "Glow" (Glassmorphism)
 *
 * - Glassmorphism cards: backdrop-blur, semi-transparent, subtle glow
 * - Journey as SVG ring/donut chart
 * - Hero stat + Quick Stats with progress bars
 * - Teal/cyan + purple accent palette
 * - AI Advisor callout with purple glow
 * - Ultra-dark background
 * - Recent activity, Coming Up, Applications list, New Jobs list
 * - Journey-first: growth and careers are primary, small jobs secondary
 */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  MapPin,
  Clock,
  Loader2,
  ChevronRight,
  Briefcase,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Star,
  Compass,
  Bot,
  BookOpen,
  Bell,
  Sparkles,
  Wallet,
  User,
} from "lucide-react";
import Link from "next/link";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

import { VerificationStatus } from "@/components/verification-status";

// ── Glass Card ───────────────────────────────────────────────────────
function GlassCard({ children, className = "", glow }: {
  children: React.ReactNode; className?: string; glow?: string;
}) {
  return (
    <div className={`bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-3xl ${glow || ""} ${className}`}>
      {children}
    </div>
  );
}

// ── Application Row ──────────────────────────────────────────────────
function AppRow({ app }: { app: any }) {
  const isAccepted = app.status === "ACCEPTED";
  const isRejected = app.status === "REJECTED";
  const jobStatus = app.job.status;
  const isJobDone = isAccepted && (jobStatus === "COMPLETED" || jobStatus === "REVIEWED");
  const isJobInProgress = isAccepted && jobStatus === "IN_PROGRESS";

  const dot = isJobDone ? "bg-teal-400" : isJobInProgress ? "bg-purple-400" : isAccepted ? "bg-emerald-400" : isRejected ? "bg-slate-600" : "bg-amber-400";
  const label = isJobDone ? "Completed" : isJobInProgress ? "Active" : isAccepted ? "Accepted" : isRejected ? "Declined" : "Pending";

  return (
    <Link href={`/jobs/${app.job.id}`} className="block group">
      <div className={`flex items-center gap-3 py-2.5 px-3 rounded-2xl hover:bg-white/5 transition-colors ${isRejected ? "opacity-35" : ""}`}>
        <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 truncate group-hover:text-teal-300 transition-colors">{app.job.title}</p>
          <p className="text-[11px] text-slate-500 truncate">
            {app.job.postedBy?.employerProfile?.companyName || "Job Poster"} · {app.job.location?.split(",")[0] || "TBC"}
          </p>
        </div>
        <span className="text-sm tabular-nums font-medium text-slate-300 shrink-0">{formatCurrency(app.job.payAmount)}</span>
        <span className="text-[11px] text-slate-500 w-16 text-right shrink-0">{label}</span>
      </div>
    </Link>
  );
}

// ── Job Row ──────────────────────────────────────────────────────────
function JobRow({ job }: { job: any }) {
  const employer = job.postedBy?.employerProfile;
  const postedDate = job.createdAt ? new Date(job.createdAt) : null;
  const isNew = postedDate && (Date.now() - postedDate.getTime()) < 48 * 60 * 60 * 1000;

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <div className="flex items-center gap-3 py-2.5 px-3 rounded-2xl hover:bg-white/5 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-200 truncate group-hover:text-teal-300 transition-colors">{job.title}</p>
            {isNew && <span className="text-[9px] font-bold text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded-full shrink-0">NEW</span>}
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {employer?.companyName || "Individual"} · {job.location?.split(",")[0] || "TBC"}
          </p>
        </div>
        <span className="text-sm tabular-nums font-medium text-slate-300 shrink-0">{formatCurrency(job.payAmount)}</span>
      </div>
    </Link>
  );
}

const journeyStages = ["Discover", "Understand", "Act", "Reflect"];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

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
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { data: jobsData } = useQuery({
    queryKey: ["nearby-jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs?status=POSTED&limit=6");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const jobs = Array.isArray(jobsData) ? jobsData : (jobsData?.jobs || []);
  const applications = Array.isArray(applicationsData) ? applicationsData : (applicationsData?.applications || []);
  const pendingApps = applications.filter((app: any) => app.status === "PENDING");
  const acceptedApps = applications.filter((app: any) => app.status === "ACCEPTED");
  const completedJobs = applications.filter((app: any) =>
    app.status === "ACCEPTED" && (app.job?.status === "COMPLETED" || app.job?.status === "REVIEWED")
  ).length;

  const upcomingJob = acceptedApps
    .filter((app: any) => app.job?.startDate && new Date(app.job.startDate) > new Date())
    .sort((a: any, b: any) => new Date(a.job.startDate).getTime() - new Date(b.job.startDate).getTime())[0];

  const sortedApps = [...applications]
    .sort((a: any, b: any) => {
      const aIsDone = a.status === "ACCEPTED" && (a.job?.status === "COMPLETED" || a.job?.status === "REVIEWED");
      const bIsDone = b.status === "ACCEPTED" && (b.job?.status === "COMPLETED" || b.job?.status === "REVIEWED");
      if (aIsDone && !bIsDone) return 1;
      if (!aIsDone && bIsDone) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const journeyStageIndex = completedJobs >= 3 ? 3 : completedJobs >= 1 ? 2 : applications.length >= 1 ? 1 : 0;
  const journeyPct = ((journeyStageIndex + 1) / journeyStages.length) * 100;

  // Build recent activity
  const recentActivity = [...applications]
    .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 3)
    .map((app: any) => {
      const time = new Date(app.updatedAt || app.createdAt);
      const diff = Date.now() - time.getTime();
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(mins / 60);
      const days = Math.floor(hours / 24);
      const timeStr = days > 0 ? `${days}d ago` : hours > 0 ? `${hours}h ago` : mins > 0 ? `${mins}m ago` : "Just now";
      const verb = app.status === "ACCEPTED" ? "accepted" : app.status === "REJECTED" ? "not selected" : "submitted";
      return { text: `Application ${verb}`, detail: app.job.title, time: timeStr };
    });

  const displayName = session?.user?.youthProfile?.displayName || "";

  if (session?.user.role !== "YOUTH") {
    return (
      <div className="min-h-screen bg-[#0c0f1a] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] bg-[#0c0f1a] text-slate-100" style={{ fontFamily: "'Inter', 'Nunito', system-ui, sans-serif" }}>
      <OnboardingWizard open={showOnboarding} onComplete={handleOnboardingComplete} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Hey, {displayName} <span className="text-2xl">👋</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/40 backdrop-blur border border-slate-700/30 rounded-2xl px-3 py-1.5 text-xs text-slate-400" suppressHydrationWarning>
              <Calendar className="h-3.5 w-3.5" />
              <span suppressHydrationWarning>
                {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
              </span>
            </div>
            <button className="p-2 rounded-2xl bg-slate-800/40 border border-slate-700/30 hover:bg-slate-800/60 transition-colors">
              <Bell className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <VerificationStatus compact />
        </div>

        {/* ── Hero: My Journey ────────────────────────────────────── */}
        <Link href="/my-journey" className="block mb-6 group">
          <GlassCard className="p-6" glow="shadow-[0_0_30px_rgba(20,184,166,0.1)] hover:shadow-[0_0_40px_rgba(20,184,166,0.16)]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-500/15">
                  <TrendingUp className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-100">My Journey</h2>
                  <p className="text-xs text-slate-500">Track your growth and progression</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                View Journey <ArrowRight className="h-3 w-3" />
              </div>
            </div>
            <div className="flex items-center gap-8">
              {/* Journey ring */}
              <div className="shrink-0">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-700/50" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeDasharray={`${journeyPct} ${100 - journeyPct}`}
                      strokeLinecap="round"
                      className="text-teal-400" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{journeyStageIndex + 1}/4</span>
                  </div>
                </div>
              </div>
              {/* Stage progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm text-slate-300">Current stage:</p>
                  <span className="text-sm font-semibold text-teal-300">{journeyStages[journeyStageIndex]}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {journeyStages.map((stage, i) => (
                    <div key={stage} className="flex flex-col items-center gap-1.5">
                      <div className={`w-full h-1.5 rounded-full transition-all ${i <= journeyStageIndex ? "bg-teal-400" : "bg-slate-700/50"}`} />
                      <span className={`text-[10px] font-medium ${i <= journeyStageIndex ? "text-teal-300" : "text-slate-600"}`}>{stage}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-[11px] text-slate-500">{completedJobs} jobs completed</span>
                  <span className="text-[11px] text-slate-500">{applications.length} applications</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </Link>

        {/* ── Primary row: Career Explorer + Industry Insights + AI Advisor ── */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Career Explorer */}
          <Link href="/careers" className="block group">
            <GlassCard className="p-5 h-full" glow="shadow-[0_0_20px_rgba(20,184,166,0.08)] hover:shadow-[0_0_25px_rgba(20,184,166,0.14)]">
              <div className="p-2.5 rounded-2xl bg-teal-500/15 w-fit mb-3">
                <Compass className="h-5 w-5 text-teal-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mb-1">Career Explorer</h3>
              <p className="text-xs text-slate-500 mb-4">Discover paths, skills, and what it takes to get there</p>
              <span className="text-xs text-teal-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Careers <ArrowRight className="h-3 w-3" />
              </span>
            </GlassCard>
          </Link>

          {/* Industry Insights */}
          <Link href="/insights" className="block group">
            <GlassCard className="p-5 h-full" glow="shadow-[0_0_20px_rgba(59,130,246,0.08)] hover:shadow-[0_0_25px_rgba(59,130,246,0.14)]">
              <div className="p-2.5 rounded-2xl bg-blue-500/15 w-fit mb-3">
                <BookOpen className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mb-1">Industry Insights</h3>
              <p className="text-xs text-slate-500 mb-4">Real-world trends, stories, and advice from professionals</p>
              <span className="text-xs text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                Browse Insights <ArrowRight className="h-3 w-3" />
              </span>
            </GlassCard>
          </Link>

          {/* AI Advisor */}
          <Link href="/career-advisor" className="block group">
            <GlassCard className="p-5 h-full" glow="shadow-[0_0_20px_rgba(147,51,234,0.08)] hover:shadow-[0_0_25px_rgba(147,51,234,0.14)]">
              <div className="p-2.5 rounded-2xl bg-purple-500/15 w-fit mb-3">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mb-1">AI Advisor</h3>
              <p className="text-xs text-slate-500 mb-4">Get personalised career guidance and job recommendations</p>
              <span className="text-xs text-purple-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                Start Chat <ArrowRight className="h-3 w-3" />
              </span>
            </GlassCard>
          </Link>
        </div>

        {/* ── Coming Up ───────────────────────────────────────────── */}
        {upcomingJob && (
          <Link href={`/jobs/${upcomingJob.job.id}`} className="block mb-6">
            <GlassCard className="p-4" glow="shadow-[0_0_20px_rgba(20,184,166,0.06)] hover:shadow-[0_0_25px_rgba(20,184,166,0.12)]">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-teal-500/15">
                  <Calendar className="h-5 w-5 text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-0.5">Coming Up</p>
                  <p className="text-sm font-medium text-slate-200 truncate">{upcomingJob.job.title}</p>
                  <p className="text-xs text-slate-500">{formatDate(upcomingJob.job.startDate)} · {upcomingJob.job.location?.split(",")[0] || "TBC"}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-teal-400 shrink-0" />
              </div>
            </GlassCard>
          </Link>
        )}

        {/* ── Secondary: Small Jobs & Activity ────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-200">Recent Activity</h2>
                  <Link href="/applications" className="text-[11px] text-teal-400 hover:text-teal-300">View all</Link>
                </div>
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400/60 shrink-0" />
                    <span className="text-sm text-slate-300 flex-1 truncate">{a.text} — <span className="text-slate-500">{a.detail}</span></span>
                    <span className="text-[10px] text-slate-600 shrink-0">{a.time}</span>
                  </div>
                ))}
              </GlassCard>
            )}

            {/* My Applications */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-200">My Applications</h2>
                <Link href="/jobs" className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1">
                  Find Jobs <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {applications.length > 0 ? (
                <>
                  {sortedApps.slice(0, 4).map((app: any) => <AppRow key={app.id} app={app} />)}
                  {applications.length > 4 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/30 text-center">
                      <Link href="/applications" className="text-xs text-teal-400 hover:text-teal-300">View all {applications.length}</Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-slate-500 mb-3">No applications yet</p>
                  <Link href="/jobs" className="text-sm text-teal-400 hover:text-teal-300">Browse Jobs</Link>
                </div>
              )}
            </GlassCard>
          </div>

          {/* ── Right sidebar ─────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Small Jobs */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-200">Small Jobs</h3>
                </div>
                <Link href="/jobs" className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
              </div>
              {jobs.length > 0 ? (
                jobs.slice(0, 4).map((job: any) => <JobRow key={job.id} job={job} />)
              ) : (
                <div className="py-4 text-center"><p className="text-sm text-slate-500">No new jobs right now</p></div>
              )}
            </GlassCard>

            {/* Quick Links */}
            <GlassCard className="p-3">
              {[
                { href: "/earnings", label: "My Earnings", icon: Wallet },
                { href: "/profile", label: "Edit Profile", icon: User },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="block group">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl hover:bg-white/5 transition-colors">
                    <item.icon className="h-4 w-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
                    <span className="text-sm text-slate-400 flex-1 group-hover:text-slate-200 transition-colors">{item.label}</span>
                    <ChevronRight className="h-3 w-3 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

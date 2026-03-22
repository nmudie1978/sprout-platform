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

import { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
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
  Play,
  ExternalLink,
} from "lucide-react";
import { getDisplayVideos } from "@/lib/industry-insights/video-pool";
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

// ── Saved Careers Carousel ───────────────────────────────────────────
function SavedCareersCarousel({ careers }: { careers: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {careers.slice(0, 10).map((swipe: any) => {
          const career = swipe.careerCard;
          if (!career) return null;
          return (
            <Link key={swipe.id} href="/careers" className="block shrink-0 group">
              <div className="w-36 p-3 rounded-2xl bg-slate-700/20 border border-slate-700/30 hover:border-teal-500/30 hover:bg-slate-700/30 transition-all">
                <p className="text-xs font-medium text-slate-200 truncate group-hover:text-teal-300 transition-colors mb-1">
                  {career.roleName}
                </p>
                <p className="text-[10px] text-slate-500 line-clamp-2 mb-2">{career.summary}</p>
                {career.salaryBand && (
                  <p className="text-[10px] text-teal-400/70">{career.salaryBand}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      {canScrollRight && careers.length > 2 && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
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

  // Fetch saved/explored careers for carousel
  const { data: savedCareersData } = useQuery({
    queryKey: ["saved-careers"],
    queryFn: async () => {
      const response = await fetch("/api/careers/saved");
      if (!response.ok) return [];
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const savedCareers = Array.isArray(savedCareersData) ? savedCareersData : [];

  // Get a recommended video from the curated pool
  const { videos: recommendedVideos } = getDisplayVideos();

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

        {/* ── Primary row: Saved Careers Carousel + Recommended Video ── */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Saved Careers Carousel */}
          <GlassCard className="p-5 overflow-hidden" glow="shadow-[0_0_20px_rgba(20,184,166,0.08)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-teal-400" />
                <h3 className="text-sm font-semibold text-slate-100">Careers You Explored</h3>
              </div>
              <Link href="/careers" className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1">
                Explore More <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {savedCareers.length > 0 ? (
              <SavedCareersCarousel careers={savedCareers} />
            ) : (
              <Link href="/careers" className="block">
                <div className="py-6 text-center rounded-2xl border border-dashed border-slate-700/50 hover:border-teal-500/30 transition-colors">
                  <Compass className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 mb-1">No careers explored yet</p>
                  <span className="text-xs text-teal-400">Start exploring careers</span>
                </div>
              </Link>
            )}
          </GlassCard>

          {/* Recommended Video/Podcast */}
          <GlassCard className="p-5" glow="shadow-[0_0_20px_rgba(59,130,246,0.08)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-100">Recommended for You</h3>
              </div>
              <Link href="/insights" className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
                All Insights <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {recommendedVideos.length > 0 ? (
              <a
                href={`https://www.youtube.com/watch?v=${recommendedVideos[0].videoUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="relative rounded-2xl overflow-hidden mb-3">
                  <img
                    src={recommendedVideos[0].thumbnail}
                    alt={recommendedVideos[0].title}
                    className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                      <Play className="h-5 w-5 text-white fill-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white font-medium">
                    {recommendedVideos[0].duration}
                  </div>
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-blue-500/80 text-[9px] text-white font-bold uppercase">
                    {recommendedVideos[0].pillarTag}
                  </div>
                </div>
                <p className="text-sm text-slate-200 font-medium line-clamp-2 group-hover:text-blue-300 transition-colors mb-1">
                  {recommendedVideos[0].title}
                </p>
                <p className="text-[11px] text-slate-500">{recommendedVideos[0].sourceName}</p>
              </a>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-slate-500">No recommendations right now</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* ── AI Advisor Banner ─────────────────────────────────────── */}
        <Link href="/career-advisor" className="block mb-6 group">
          <GlassCard className="px-5 py-3" glow="shadow-[0_0_15px_rgba(147,51,234,0.08)] hover:shadow-[0_0_20px_rgba(147,51,234,0.14)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/15 shrink-0">
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200">AI Career Advisor</p>
                <p className="text-[11px] text-slate-500">Get personalised career guidance and job recommendations</p>
              </div>
              <span className="text-xs text-purple-400 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                Start Chat <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </GlassCard>
        </Link>

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

        {/* ── Activity + Applications + Small Jobs — side by side ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Recent Activity — compact */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-200">Activity</h2>
              <Link href="/applications" className="text-[11px] text-teal-400 hover:text-teal-300">View all</Link>
            </div>
            {recentActivity.length > 0 ? (
              recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400/60 shrink-0" />
                  <span className="text-xs text-slate-400 flex-1 truncate">{a.text} — {a.detail}</span>
                  <span className="text-[10px] text-slate-600 shrink-0">{a.time}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">No recent activity</p>
            )}
          </GlassCard>

          {/* My Applications — compact */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-200">Applications</h2>
              <Link href="/jobs" className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1">
                Find Jobs <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {applications.length > 0 ? (
              <>
                {sortedApps.slice(0, 3).map((app: any) => <AppRow key={app.id} app={app} />)}
                {applications.length > 3 && (
                  <div className="mt-2 pt-2 border-t border-slate-700/30 text-center">
                    <Link href="/applications" className="text-[11px] text-teal-400 hover:text-teal-300">View all {applications.length}</Link>
                  </div>
                )}
              </>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-slate-500 mb-2">No applications yet</p>
                <Link href="/jobs" className="text-xs text-teal-400 hover:text-teal-300">Browse Jobs</Link>
              </div>
            )}
          </GlassCard>

          {/* Small Jobs — compact */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-200">Small Jobs</h3>
              </div>
              <Link href="/jobs" className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
            </div>
            {jobs.length > 0 ? (
              jobs.slice(0, 3).map((job: any) => <JobRow key={job.id} job={job} />)
            ) : (
              <div className="py-4 text-center"><p className="text-xs text-slate-500">No new jobs right now</p></div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * DASHBOARD PAGE — Journey-First Layout
 *
 * Section order:
 * 1. Header (greeting + date)
 * 2. Verification status
 * 3. Journey Hero (SVG ring + stage progress)
 * 4. Career Goals (primary + secondary, 2-col)
 * 5. Careers You Explored (horizontal carousel)
 * 6. Industry Insights (compact auto-rotating carousel)
 * 7. AI Advisor Banner
 * 8. Job Stats + My Library (2-col)
 * 9. Activity + Applications (2-col)
 */

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import {
  ArrowRight,
  Calendar,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  TrendingUp,
  Compass,
  BookOpen,
  Bell,
  Play,
  Target,
  CheckCircle2,
  Clock,
  FileText,
  Video,
  Headphones,
  BookMarked,
  MessageSquare,
  Search,
  Wallet,
} from "lucide-react";
import { getDisplayVideos, type InsightVideo } from "@/lib/industry-insights/video-pool";
import type { CareerGoal, GoalsResponse } from "@/lib/goals/types";
import { TIMEFRAME_CONFIG } from "@/lib/goals/types";
import Link from "next/link";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { VerificationStatus } from "@/components/verification-status";

// ── Glass Card ───────────────────────────────────────────────────────
function GlassCard({ children, className = "", glow }: {
  children: React.ReactNode; className?: string; glow?: string;
}) {
  return (
    <div className={`bg-card/80 backdrop-blur-xl border border-border/40 rounded-3xl ${glow || ""} ${className}`}>
      {children}
    </div>
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
        <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-1.5 rounded-full bg-muted/80 border border-border/50 text-muted-foreground active:text-foreground sm:hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
        </button>
      )}
      <div ref={scrollRef} onScroll={checkScroll} className="flex gap-3 overflow-x-auto scroll-smooth" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {careers.slice(0, 10).map((swipe: any) => {
          const career = swipe.careerCard;
          if (!career) return null;
          return (
            <Link key={swipe.id} href="/careers" className="block shrink-0 group">
              <div className="w-36 p-3 rounded-2xl bg-muted/40 border border-border/40 hover:border-teal-500/30 hover:bg-muted/50 transition-all">
                <p className="text-xs font-medium text-foreground truncate group-hover:text-teal-300 transition-colors mb-1">{career.roleName}</p>
                <p className="text-[10px] text-muted-foreground/70 line-clamp-2 mb-2">{career.summary}</p>
                {career.salaryBand && <p className="text-[10px] text-teal-400/70">{career.salaryBand}</p>}
              </div>
            </Link>
          );
        })}
      </div>
      {canScrollRight && careers.length > 2 && (
        <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-1.5 rounded-full bg-muted/80 border border-border/50 text-muted-foreground active:text-foreground sm:hover:text-foreground transition-colors">
          <ChevronRight className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
        </button>
      )}
    </div>
  );
}

// ── Goal Summary Card ────────────────────────────────────────────────
function GoalCard({ goal, slot, accentClass }: { goal: CareerGoal | null; slot: "primary" | "secondary"; accentClass: string }) {
  if (!goal) {
    return (
      <Link href="/goals" className="block h-full">
        <GlassCard className="p-5 h-full flex flex-col items-center justify-center hover:border-border/60 transition-colors">
          <div className="py-4 text-center">
            <Target className="h-7 w-7 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">
              {slot === "primary" ? "Set your primary goal" : "Add a backup path"}
            </p>
            <span className={`text-xs ${accentClass}`}>
              {slot === "primary" ? "Choose a career direction" : "Explore alternatives"}
            </span>
          </div>
        </GlassCard>
      </Link>
    );
  }

  const completedSteps = goal.nextSteps.filter((s) => s.completed).length;
  const totalSteps = goal.nextSteps.length;
  const statusColor = goal.status === "committed" ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-300";
  const confidenceDots = goal.confidence === "high" ? 3 : goal.confidence === "medium" ? 2 : 1;

  return (
    <Link href="/goals" className="block h-full group">
      <GlassCard className="p-5 h-full hover:border-border/60 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1">
              {slot === "primary" ? "Primary Goal" : "Secondary Goal"}
            </p>
            <p className={`text-sm font-semibold text-foreground truncate group-hover:${accentClass} transition-colors`}>
              {goal.title}
            </p>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${statusColor}`}>
            {goal.status === "committed" ? "Committed" : "Exploring"}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((d) => (
              <div key={d} className={`w-1.5 h-1.5 rounded-full ${d <= confidenceDots ? "bg-teal-400" : "bg-muted"}`} />
            ))}
            <span className="text-[10px] text-muted-foreground/70 ml-1">confidence</span>
          </div>
          <span className="text-[10px] text-muted-foreground/70">{TIMEFRAME_CONFIG[goal.timeframe]?.label}</span>
        </div>

        {totalSteps > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground/70">{completedSteps}/{totalSteps} steps</span>
            </div>
            <div className="w-full h-1 bg-muted/50 rounded-full">
              <div className={`h-full rounded-full transition-all ${slot === "primary" ? "bg-teal-400" : "bg-purple-400"}`} style={{ width: `${(completedSteps / totalSteps) * 100}%` }} />
            </div>
          </div>
        )}
      </GlassCard>
    </Link>
  );
}

// ── Insight Ticker (rolling right-to-left) ────────────────────────────
function InsightTicker({ videos }: { videos: InsightVideo[] }) {
  const pillarColors: Record<string, string> = {
    explore: "bg-teal-500/20 text-teal-300",
    learn: "bg-blue-500/20 text-blue-300",
    grow: "bg-purple-500/20 text-purple-300",
  };

  // Double the items so the loop is seamless
  const items = [...videos, ...videos];

  return (
    <div className="overflow-hidden relative group/ticker">
      <div
        className="flex gap-4 w-max animate-[ticker_60s_linear_infinite] group-hover/ticker:[animation-play-state:paused]"
      >
        {items.map((video, i) => (
          <a
            key={`${video.videoUrl}-${i}`}
            href={`https://www.youtube.com/watch?v=${video.videoUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 shrink-0 group/item"
          >
            <div className="relative w-16 h-10 rounded-lg overflow-hidden shrink-0">
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/item:bg-black/40 transition-colors">
                <Play className="h-3 w-3 text-white fill-white opacity-70" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground/80 whitespace-nowrap group-hover/item:text-blue-300 transition-colors">{video.title}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground/70">{video.sourceName}</span>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${pillarColors[video.pillarTag] || pillarColors.explore}`}>
                  {video.pillarTag}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card/80 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card/80 to-transparent pointer-events-none" />
    </div>
  );
}

// ── Saved Item Type Icon ─────────────────────────────────────────────
function SavedItemIcon({ type }: { type: string }) {
  switch (type) {
    case "VIDEO": return <Video className="h-3.5 w-3.5 text-blue-400" />;
    case "PODCAST": return <Headphones className="h-3.5 w-3.5 text-purple-400" />;
    case "ARTICLE": return <FileText className="h-3.5 w-3.5 text-teal-400" />;
    default: return <BookMarked className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

const journeyStages = ["Discover", "Understand", "Act", "Reflect"];

export default function DashboardPage() {
  const { data: session, status } = useSession();
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

  const { data: goalsData } = useQuery<GoalsResponse>({
    queryKey: ["my-goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) return { primaryGoal: null, secondaryGoal: null };
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { data: savedItemsData } = useQuery({
    queryKey: ["saved-items-recent"],
    queryFn: async () => {
      const response = await fetch("/api/journey/saved-items?limit=4");
      if (!response.ok) return { items: [] };
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 2 * 60 * 1000,
  });

  const savedCareers = Array.isArray(savedCareersData) ? savedCareersData : [];
  const { videos: recommendedVideos } = getDisplayVideos();
  const savedItems = savedItemsData?.items || savedItemsData?.recentItems || [];

  const applications = Array.isArray(applicationsData) ? applicationsData : (applicationsData?.applications || []);
  const pendingApps = applications.filter((app: any) => app.status === "PENDING");
  const acceptedApps = applications.filter((app: any) => app.status === "ACCEPTED");
  const completedJobs = applications.filter((app: any) =>
    app.status === "ACCEPTED" && (app.job?.status === "COMPLETED" || app.job?.status === "REVIEWED")
  ).length;

  const upcomingJob = acceptedApps
    .filter((app: any) => app.job?.startDate && new Date(app.job.startDate) > new Date())
    .sort((a: any, b: any) => new Date(a.job.startDate).getTime() - new Date(b.job.startDate).getTime())[0];

  const journeyStageIndex = completedJobs >= 3 ? 3 : completedJobs >= 1 ? 2 : applications.length >= 1 ? 1 : 0;
  const journeyPct = ((journeyStageIndex + 1) / journeyStages.length) * 100;

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

  if (status === "loading" || session?.user.role !== "YOUTH") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] bg-background text-foreground" style={{ fontFamily: "'Inter', 'Nunito', system-ui, sans-serif" }}>
      <OnboardingWizard open={showOnboarding} onComplete={handleOnboardingComplete} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate mr-3">
            Hey, {displayName} <span className="text-xl sm:text-2xl">👋</span>
          </h1>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 bg-muted/60 backdrop-blur border border-border/40 rounded-2xl px-3 py-1.5 text-xs text-muted-foreground" suppressHydrationWarning>
              <Calendar className="h-3.5 w-3.5" />
              <span suppressHydrationWarning>
                {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
              </span>
            </div>
            <button className="p-2.5 sm:p-2 rounded-2xl bg-muted/60 border border-border/40 active:bg-muted/80 sm:hover:bg-muted/80 transition-colors">
              <Bell className="h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <VerificationStatus compact />
        </div>

        {/* ── 1. Journey Hero ──────────────────────────────────── */}
        <Link href="/my-journey" className="block mb-6 group">
          <GlassCard className="p-4 sm:p-6" glow="shadow-[0_0_30px_rgba(20,184,166,0.1)] hover:shadow-[0_0_40px_rgba(20,184,166,0.16)]">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-teal-500/15">
                  <TrendingUp className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-foreground">My Journey</h2>
                  <p className="text-xs text-muted-foreground/70">Track your growth</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                View Journey <ArrowRight className="h-3 w-3" />
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-8">
              <div className="shrink-0">
                <div className="relative w-16 h-16 sm:w-24 sm:h-24">
                  <svg className="w-16 h-16 sm:w-24 sm:h-24 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted/50" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeDasharray={`${journeyPct} ${100 - journeyPct}`}
                      strokeLinecap="round"
                      className="text-teal-400" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base sm:text-xl font-bold text-foreground">{journeyStageIndex + 1}/4</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <p className="text-xs sm:text-sm text-foreground/80">Current stage:</p>
                  <span className="text-xs sm:text-sm font-semibold text-teal-300">{journeyStages[journeyStageIndex]}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {journeyStages.map((stage, i) => (
                    <div key={stage} className="flex flex-col items-center gap-1">
                      <div className={`w-full h-1.5 rounded-full transition-all ${i <= journeyStageIndex ? "bg-teal-400" : "bg-muted/50"}`} />
                      <span className={`text-[10px] sm:text-[11px] font-medium ${i <= journeyStageIndex ? "text-teal-300" : "text-muted-foreground/50"}`}>{stage}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                  <span className="text-[11px] text-muted-foreground/70">{completedJobs} jobs</span>
                  <span className="text-[11px] text-muted-foreground/70">{applications.length} applied</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </Link>

        {/* ── 2. Career Goals ──────────────────────────────────── */}
        {!goalsData?.primaryGoal ? (
          <Link href="/profile" className="block mb-6 group">
            <GlassCard className="p-5 sm:p-6 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors" glow="shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="p-3 rounded-2xl bg-primary/10 shrink-0">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-foreground mb-1">Set your career goal</h3>
                  <p className="text-sm text-muted-foreground">
                    Everything on Endeavrly is built around your goal — your journey, recommended careers, and insights all adapt to where you want to go. Set one now to unlock your personalised path.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-primary shrink-0">
                  Go to Profile <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </GlassCard>
          </Link>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <GoalCard goal={goalsData.primaryGoal} slot="primary" accentClass="text-teal-400" />
            <GoalCard goal={goalsData?.secondaryGoal ?? null} slot="secondary" accentClass="text-purple-400" />
          </div>
        )}

        {/* ── 3. Careers You Explored + My Library (2-col) ───── */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Careers You Explored */}
          <GlassCard className="p-5 overflow-hidden" glow="shadow-[0_0_20px_rgba(20,184,166,0.08)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-teal-400" />
                <h3 className="text-sm font-semibold text-foreground">Careers You Explored</h3>
              </div>
              <Link href="/careers" className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1">
                Explore <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {savedCareers.length > 0 ? (
              <div className="divide-y divide-border/40">
                {savedCareers.slice(0, 5).map((swipe: any) => {
                  const career = swipe.careerCard;
                  if (!career) return null;
                  return (
                    <Link key={swipe.id} href="/careers" className="flex items-center gap-2 py-2 px-1 group hover:bg-muted/60 rounded-lg transition-colors">
                      <Compass className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                      <span className="text-xs text-foreground truncate flex-1 group-hover:text-teal-300 transition-colors">{career.roleName}</span>
                      {career.salaryBand && <span className="text-[10px] text-muted-foreground/70 shrink-0">{career.salaryBand}</span>}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Link href="/careers" className="block">
                <div className="py-5 text-center rounded-2xl border border-dashed border-border/50 hover:border-teal-500/30 transition-colors">
                  <Compass className="h-7 w-7 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground/70 mb-1">No careers explored yet</p>
                  <span className="text-xs text-teal-400">Start exploring</span>
                </div>
              </Link>
            )}
          </GlassCard>

          {/* My Library */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">My Library</h3>
              </div>
              <Link href="/my-journey" className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {Array.isArray(savedItems) && savedItems.length > 0 ? (
              <div className="space-y-1">
                {savedItems.slice(0, 4).map((item: any) => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 py-2 px-2 rounded-xl hover:bg-muted/60 transition-colors group">
                    <SavedItemIcon type={item.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground/80 truncate group-hover:text-teal-300 transition-colors">{item.title}</p>
                      {item.source && <p className="text-[10px] text-muted-foreground/50">{item.source}</p>}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="py-5 text-center rounded-2xl border border-dashed border-border/50">
                <BookMarked className="h-7 w-7 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground/70 mb-1">No saved content yet</p>
                <Link href="/insights" className="text-xs text-blue-400 hover:text-blue-300">Save articles & videos as you explore</Link>
              </div>
            )}
          </GlassCard>
        </div>

        {/* ── 4. Small Jobs + Activity (2-col) ──────────────── */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Small Jobs</h3>
              </div>
              <Link href="/jobs" className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1">
                Browse <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
              {[
                { label: "Applied", value: applications.length, color: "text-blue-400" },
                { label: "Waiting", value: pendingApps.length, color: "text-amber-400" },
                { label: "Accepted", value: acceptedApps.length, color: "text-emerald-400" },
                { label: "Done", value: completedJobs, color: "text-teal-400" },
              ].map((stat) => (
                <div key={stat.label} className="flex-1 text-center py-1.5 rounded-lg bg-muted/40">
                  <p className={`text-sm font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground/70">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
              {[
                { href: "/messages", icon: MessageSquare, label: "Messages" },
                { href: "/jobs", icon: Search, label: "Browse" },
                { href: "/applications", icon: FileText, label: "Apps" },
                { href: "/earnings", icon: Wallet, label: "Earnings" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="flex-1 group/link">
                  <div className="flex flex-col items-center gap-1 py-2.5 sm:py-2 rounded-lg active:bg-muted/60 sm:hover:bg-muted/60 transition-colors min-h-[44px] justify-center">
                    <link.icon className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-muted-foreground/70 group-hover/link:text-teal-400 transition-colors" />
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground/70 group-hover/link:text-foreground/80 transition-colors">{link.label}</span>
                  </div>
                </Link>
              ))}
            </div>
            {upcomingJob && (
              <Link href={`/jobs/${upcomingJob.job.id}`} className="block group/up mt-2">
                <div className="flex items-center gap-2 p-2.5 sm:p-2 rounded-lg bg-teal-500/5 border border-teal-500/10 active:border-teal-500/20 sm:hover:border-teal-500/20 transition-colors">
                  <Calendar className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-teal-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Coming Up</p>
                    <p className="text-xs sm:text-[11px] text-foreground/80 truncate">{upcomingJob.job.title}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 sm:h-3 sm:w-3 text-teal-400 shrink-0" />
                </div>
              </Link>
            )}
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-foreground">Activity</h2>
              <Link href="/applications" className="text-[11px] text-teal-400 hover:text-teal-300">View all</Link>
            </div>
            {recentActivity.length > 0 ? (
              recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400/60 shrink-0" />
                  <span className="text-xs text-muted-foreground flex-1 truncate">{a.text} — {a.detail}</span>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0">{a.time}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground/70 py-3 text-center">No recent activity</p>
            )}
          </GlassCard>
        </div>

        {/* ── 5. Industry Insights — rolling ticker ────────────── */}
        <GlassCard className="p-4" glow="shadow-[0_0_15px_rgba(59,130,246,0.06)]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-foreground">Industry Insights</h3>
            </div>
            <Link href="/insights" className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
              All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recommendedVideos.length > 0 ? (
            <InsightTicker videos={recommendedVideos} />
          ) : (
            <p className="text-xs text-muted-foreground/70 py-3 text-center">No insights available right now</p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

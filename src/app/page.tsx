import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Sprout,
  ArrowRight,
  ArrowDown,
  Briefcase,
  Compass,
  TrendingUp,
  Route,
  Eye,
  Zap,
  BarChart3,
  Sparkles,
  Star,
  Users,
  Clock,
  Target,
  ChevronRight,
} from "lucide-react";
import { YourTimelineSection } from "@/components/landing/your-timeline-section";
import { AnimatedBackground } from "@/components/landing/animated-background";

const LandingNavAuth = dynamic(
  () =>
    import("@/components/landing/landing-nav").then(
      (mod) => mod.LandingNavAuth
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="h-9 w-20 bg-muted/50 rounded-lg animate-pulse hidden sm:block" />
        <div className="h-10 w-24 bg-emerald-600/30 rounded-lg animate-pulse" />
      </div>
    ),
  }
);

// ============================================
// SECTION DATA
// ============================================

const PILLARS = [
  {
    step: "01",
    title: "Start Small",
    description:
      "Take on real-world micro-jobs. Build skills. Gain confidence.",
    icon: Briefcase,
    accent: "from-emerald-500 to-teal-500",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/30",
    accentText: "text-emerald-600 dark:text-emerald-400",
    accentBorder: "border-emerald-200/60 dark:border-emerald-800/40",
  },
  {
    step: "02",
    title: "Explore Smart",
    description:
      "Deep dive into real career realities — not just the highlight reel.",
    icon: Compass,
    accent: "from-blue-500 to-indigo-500",
    accentBg: "bg-blue-50 dark:bg-blue-950/30",
    accentText: "text-blue-600 dark:text-blue-400",
    accentBorder: "border-blue-200/60 dark:border-blue-800/40",
  },
  {
    step: "03",
    title: "Understand the Market",
    description:
      "See trends, industry growth, and what\u2019s changing in the world of work.",
    icon: TrendingUp,
    accent: "from-amber-500 to-orange-500",
    accentBg: "bg-amber-50 dark:bg-amber-950/30",
    accentText: "text-amber-600 dark:text-amber-400",
    accentBorder: "border-amber-200/60 dark:border-amber-800/40",
  },
  {
    step: "04",
    title: "Shape Your Future",
    description:
      "Visualise your personal timeline and design your next steps.",
    icon: Route,
    accent: "from-violet-500 to-purple-500",
    accentBg: "bg-violet-50 dark:bg-violet-950/30",
    accentText: "text-violet-600 dark:text-violet-400",
    accentBorder: "border-violet-200/60 dark:border-violet-800/40",
  },
];

const DIFFERENTIATORS = [
  {
    icon: Eye,
    title: "Reality over hype",
    description:
      "Honest insights about what careers are actually like.",
  },
  {
    icon: Zap,
    title: "Experience before decision",
    description:
      "Try small things before committing to big ones.",
  },
  {
    icon: BarChart3,
    title: "Data meets direction",
    description:
      "Market insight combined with personal growth.",
  },
];

// ============================================
// PAGE
// ============================================

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Page-wide animated background — fixed behind all content */}
      <AnimatedBackground />

      {/* ============================================ */}
      {/* NAVIGATION */}
      {/* ============================================ */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-700/40 bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Sprout className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">
              Sprout
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/about"
              className="text-sm text-neutral-400 hover:text-white transition-colors hidden sm:inline"
            >
              About
            </Link>
            <Suspense
              fallback={
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="h-9 w-20 bg-slate-800/50 rounded-lg animate-pulse hidden sm:block" />
                  <div className="h-10 w-24 bg-emerald-600/30 rounded-lg animate-pulse" />
                </div>
              }
            >
              <LandingNavAuth />
            </Suspense>
          </div>
        </div>
      </nav>

      {/* ============================================ */}
      {/* SECTION 1 — HERO */}
      {/* ============================================ */}
      <section className="relative">
        <div className="relative z-20 mx-auto max-w-4xl px-5 pt-20 pb-32 sm:pt-28 sm:pb-40 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-4 py-1.5 text-xs font-medium text-emerald-300 mb-8 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            Built for 15–21 year olds
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-white animate-fade-in-up">
            Start small.{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Explore smart.
            </span>
            <br />
            Shape your future.
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
            A development platform for 15–21 year olds who want clarity,
            confidence, and real-world direction.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up animation-delay-400">
            <Button
              size="lg"
              asChild
              className="h-12 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/40 text-base"
            >
              <Link href="/auth/signup">
                Start Exploring
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 px-8 rounded-xl border-slate-600 text-neutral-200 text-base hover:bg-slate-800/60 hover:text-white"
            >
              <a href="#how-it-works">
                See How It Works
                <ArrowDown className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2 — HOW IT WORKS (4 PILLARS) */}
      {/* ============================================ */}
      <section id="how-it-works" className="relative z-10 py-20 sm:py-28 bg-slate-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-5">
          {/* Section header */}
          <div className="text-center mb-14 sm:mb-18">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
              Your growth,{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                structured.
              </span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto">
              Four pillars that take you from curiosity to clarity.
            </p>
          </div>

          {/* 4 Pillar Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.step}
                  className={`group relative rounded-2xl border border-slate-700/60 bg-slate-800/60 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20`}
                >
                  {/* Step number */}
                  <span className="text-xs font-semibold text-neutral-500 tracking-wider uppercase mb-4 block">
                    {pillar.step}
                  </span>

                  {/* Icon */}
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${pillar.accentBg} mb-4`}
                  >
                    <Icon
                      className={`h-5 w-5 ${pillar.accentText}`}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold mb-2 tracking-tight text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Subtle hover arrow */}
                  <ChevronRight className="absolute top-6 right-5 h-4 w-4 text-neutral-600/0 group-hover:text-neutral-500 transition-all duration-300 group-hover:translate-x-0.5" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3 — WHY SPROUT IS DIFFERENT */}
      {/* ============================================ */}
      <section className="relative z-10 py-20 sm:py-28 border-y border-slate-700/40 bg-slate-900/70 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-5">
          <div className="text-center mb-14 sm:mb-18">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
              Not career advice.{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Career clarity.
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
            {DIFFERENTIATORS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950/40 mb-5">
                    <Icon className="h-5.5 w-5.5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 tracking-tight text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4 — PRODUCT PREVIEW */}
      {/* ============================================ */}
      <section className="relative z-10 py-20 sm:py-28 bg-slate-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
              Everything in{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                one place
              </span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto">
              A calm, focused workspace designed around your growth.
            </p>
          </div>

          {/* Mock Dashboard */}
          <div className="relative rounded-2xl border border-slate-700/60 bg-slate-800/70 backdrop-blur-sm shadow-xl shadow-black/20 overflow-hidden">
            {/* Mock titlebar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-700/40 bg-slate-800/50">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-700/60 px-3 py-1">
                  <Sprout className="h-3 w-3 text-emerald-400" />
                  <span className="text-[11px] text-neutral-400">
                    sprout.app/dashboard
                  </span>
                </div>
              </div>
              <div className="w-12" />
            </div>

            {/* Mock content grid */}
            <div className="grid md:grid-cols-3 gap-4 p-5">
              {/* Small Jobs Panel */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium text-white">Small Jobs</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { title: "Garden Maintenance", tag: "Outdoor", pay: "150 kr/hr" },
                    { title: "Pet Sitting (Weekend)", tag: "Animals", pay: "120 kr/hr" },
                    { title: "Tech Help for Senior", tag: "Digital", pay: "140 kr/hr" },
                  ].map((job) => (
                    <div
                      key={job.title}
                      className="flex items-center justify-between rounded-lg bg-slate-800/60 border border-slate-700/30 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-xs font-medium text-neutral-200">{job.title}</p>
                        <span className="text-[10px] text-neutral-500">
                          {job.tag}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-400">
                        {job.pay}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Insight Panel */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">Career Insight</span>
                </div>
                <div className="rounded-lg bg-slate-800/60 border border-slate-700/30 p-3 mb-3">
                  <p className="text-xs font-medium text-neutral-200 mb-1">UX Designer</p>
                  <p className="text-[10px] text-neutral-500 leading-relaxed mb-2">
                    Designs digital products people love to use. Combines
                    research, empathy, and visual thinking.
                  </p>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      Growing
                    </span>
                    <span className="flex items-center gap-1 text-neutral-500">
                      <Star className="h-3 w-3" />
                      4.6 satisfaction
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-800/60 border border-slate-700/30 p-3">
                  <p className="text-xs font-medium text-neutral-200 mb-1">Data Analyst</p>
                  <p className="text-[10px] text-neutral-500 leading-relaxed mb-2">
                    Turns numbers into stories that help businesses make better
                    decisions.
                  </p>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      High demand
                    </span>
                    <span className="flex items-center gap-1 text-neutral-500">
                      <Users className="h-3 w-3" />
                      Remote-friendly
                    </span>
                  </div>
                </div>
              </div>

              {/* Right column: Market Trend + Journey */}
              <div className="space-y-4">
                {/* Market Trend */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-white">Market Trends</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-16 px-1 mb-2">
                    {[35, 42, 38, 55, 48, 62, 58, 70, 65, 78].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-amber-500 to-amber-400"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    Tech sector roles +12% this quarter
                  </p>
                </div>

                {/* Journey Timeline */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Route className="h-4 w-4 text-violet-400" />
                    <span className="text-sm font-medium text-white">My Journey</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Discover", status: "done" },
                      { label: "Understand", status: "active" },
                      { label: "Act", status: "upcoming" },
                    ].map((step) => (
                      <div key={step.label} className="flex items-center gap-2.5">
                        <div
                          className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                            step.status === "done"
                              ? "bg-emerald-500"
                              : step.status === "active"
                                ? "bg-violet-500 ring-2 ring-violet-500/20"
                                : "bg-neutral-600"
                          }`}
                        />
                        <span
                          className={`text-xs ${
                            step.status === "done"
                              ? "text-neutral-500 line-through"
                              : step.status === "active"
                                ? "font-medium text-white"
                                : "text-neutral-600"
                          }`}
                        >
                          {step.label}
                        </span>
                        {step.status === "active" && (
                          <span className="text-[10px] text-violet-400 font-medium ml-auto">
                            In progress
                          </span>
                        )}
                        {step.status === "done" && (
                          <Clock className="h-3 w-3 text-neutral-600 ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5 — YOUR TIMELINE */}
      {/* ============================================ */}
      <YourTimelineSection />

      {/* ============================================ */}
      {/* SECTION 6 — CLOSING CTA */}
      {/* ============================================ */}
      <section className="relative z-10 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-600/90 via-teal-600/90 to-emerald-700/90" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 -z-10 opacity-[0.04]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="mx-auto max-w-3xl px-5 py-20 sm:py-28 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Target className="h-7 w-7 text-white/90" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Your future doesn&apos;t start
            <br className="hidden sm:block" /> after school.
            <br />
            <span className="text-emerald-200">It starts now.</span>
          </h2>
          <p className="text-emerald-100/80 text-lg max-w-lg mx-auto mb-10">
            Join a platform built to help you explore, grow, and take your
            first real steps — at your own pace.
          </p>
          <Button
            size="lg"
            asChild
            className="h-13 px-10 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg shadow-black/10 text-base font-semibold transition-all hover:shadow-xl"
          >
            <Link href="/auth/signup">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="relative z-10 border-t border-slate-700/40 bg-slate-900/90 backdrop-blur-sm py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600">
                <Sprout className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-base text-white">Sprout</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-neutral-400">
              <Link
                href="/about"
                className="hover:text-white transition-colors"
              >
                About
              </Link>
              <Link
                href="/about/research"
                className="hover:text-white transition-colors"
              >
                Research
              </Link>
              <Link
                href="/legal/terms"
                className="hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/legal/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/legal/safety"
                className="hover:text-white transition-colors"
              >
                Safety
              </Link>
              <Link
                href="/legal/eligibility"
                className="hover:text-white transition-colors"
              >
                Eligibility
              </Link>
              <Link
                href="/legal/disclaimer"
                className="hover:text-white transition-colors"
              >
                Disclaimer
              </Link>
            </div>
            <p className="text-xs text-neutral-500">
              &copy; {new Date().getFullYear()} Sprout. A career development
              platform for young people.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

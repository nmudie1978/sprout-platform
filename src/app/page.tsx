import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Star,
  ArrowRight,
  Sparkles,
  Check,
  Compass,
  Briefcase,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { HeroVideo } from "@/components/hero-video";
import { RetroGrid } from "@/components/ui/retro-grid";
import { ShineBorder } from "@/components/ui/shine-border";
import { WordRevealLine, FadeReveal } from "@/components/landing/hero-word-reveal";

const LandingNavAuth = dynamic(
  () =>
    import("@/components/landing/landing-nav").then(
      (mod) => mod.LandingNavAuth
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="h-9 w-20 bg-slate-800/50 rounded-lg animate-pulse hidden sm:block" />
        <div className="h-10 w-24 bg-emerald-600/30 rounded-lg animate-pulse" />
      </div>
    ),
  }
);

// ============================================
// SECTION DATA
// ============================================

const TIMELINE_NODES = [
  { age: 15, label: "First Curiosity", status: "completed" as const },
  { age: 16, label: "Trying Things Out", status: "completed" as const },
  { age: 17, label: "Understanding Strengths", status: "current" as const },
  { age: 18, label: "Exploring Directions", status: "future" as const },
  { age: 19, label: "Building Confidence", status: "future" as const },
  { age: 20, label: "Gaining Experience", status: "future" as const },
  { age: 21, label: "Finding Your Path", status: "future" as const },
];

const FEATURES = [
  {
    title: "Explore careers",
    description:
      "Browse real paths and honest information about what different careers involve.",
    icon: Compass,
    accentBg: "bg-emerald-500/15",
    accentText: "text-emerald-400",
  },
  {
    title: "Reflect privately",
    description:
      "Guided prompts help you notice what fits. Everything stays on your device.",
    icon: BookOpen,
    accentBg: "bg-blue-500/15",
    accentText: "text-blue-400",
  },
  {
    title: "Try small experiences",
    description:
      "Safe, verified opportunities to try things and build real understanding.",
    icon: Briefcase,
    accentBg: "bg-amber-500/15",
    accentText: "text-amber-400",
  },
  {
    title: "Safety by default",
    description:
      "Verified adults, structured messaging, no payments, no public profiles.",
    icon: ShieldCheck,
    accentBg: "bg-violet-500/15",
    accentText: "text-violet-400",
  },
];

const CONTRASTS = [
  {
    not: "A career quiz that tells you what to be.",
    instead:
      "A space to work things out for yourself \u2014 through real experiences and honest reflection.",
  },
  {
    not: "A motivational app that hypes you up.",
    instead:
      "Straightforward information about what different paths are actually like.",
  },
  {
    not: "A platform that tracks, scores, or ranks your future.",
    instead:
      "A private place to explore, try things, and grow at whatever pace feels right.",
  },
];

// ============================================
// PAGE
// ============================================

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* ============================================ */}
      {/* NAVIGATION */}
      {/* ============================================ */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Star className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">
              Endeavrly
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/about"
              className="text-sm text-neutral-500 hover:text-white transition-colors hidden sm:inline"
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
      <section className="relative overflow-hidden">
        {/* Radial gradient glow — emerald-tinted */}
        <div className="absolute top-0 z-0 h-full w-full bg-emerald-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />

        {/* Animated retro grid */}
        <RetroGrid angle={65} cellSize={50} opacity={0.35} lineColor="#14532d" />

        <div className="relative z-10 mx-auto max-w-6xl px-5 pt-28 pb-20 sm:pt-36 sm:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — text */}
            <div className="max-w-2xl">
              {/* Context label */}
              <FadeReveal delay={0} className="mb-12 sm:mb-16">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-600">
                  For 15–23 year olds
                </p>
              </FadeReveal>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight leading-snug text-white mb-10 sm:mb-12">
                <WordRevealLine
                  text="Your future is yours to explore."
                  startDelay={300}
                />
              </h1>

              {/* Description */}
              <div className="space-y-5 mb-12 sm:mb-14 max-w-lg">
                <FadeReveal delay={1400}>
                  <p className="text-base sm:text-[17px] text-neutral-400 leading-relaxed">
                    Endeavrly is a space for young people to explore careers honestly,
                    try small real-world experiences, and reflect on what fits —
                    without anyone telling them what to think or who to become.
                  </p>
                </FadeReveal>
                <FadeReveal delay={1800}>
                  <p className="text-base sm:text-[17px] text-neutral-400 leading-relaxed">
                    There are no quizzes that assign you a career. No algorithms
                    deciding what you should see. No rankings, no scores, no
                    pressure to perform. Just tools to help you understand yourself
                    a little better — one experience at a time.
                  </p>
                </FadeReveal>
              </div>

              {/* CTA — understated text link */}
              <FadeReveal delay={2400}>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 text-sm text-emerald-400/80 hover:text-emerald-300 transition-colors group"
                >
                  Explore Endeavrly
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </FadeReveal>
            </div>

            {/* Right — video (coming soon) */}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3 — A GENTLE STRUCTURE */}
      {/* ============================================ */}
      <section id="how-it-works" className="border-t border-slate-800/60 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
          {/* Section header */}
          <div className="text-center mb-14 sm:mb-18">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5 text-white">
              A gentle{" "}
              <span className="text-emerald-400">structure.</span>
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Not a rigid path. A way to explore, reflect, and build confidence
              over time.
            </p>
          </div>

          {/* Feature Cards — 2×2 grid */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-5 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-6 sm:p-7"
                >
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl ${feature.accentBg}`}
                  >
                    <Icon className={`h-5 w-5 ${feature.accentText}`} />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-white mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3b — YOUR TIMELINE */}
      {/* ============================================ */}
      <section className="border-t border-slate-800/60">
        <div className="mx-auto max-w-5xl px-5 py-24 sm:py-32">
          {/* Badge */}
          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-400">
                Your Timeline
              </span>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white text-center mb-5 sm:mb-6">
            Your journey,{" "}
            <span className="text-emerald-400">your pace.</span>
          </h2>

          {/* Subcopy */}
          <p className="text-base sm:text-lg text-neutral-400 text-center max-w-lg mx-auto mb-12 sm:mb-16 leading-relaxed">
            Everyone grows differently. See your progress as a gentle
            unfolding, not a race.
          </p>

          {/* Timeline card */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-700/25 px-4 sm:px-10 py-8 sm:py-10">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 relative min-w-[600px] pb-2">
                {/* Connecting line — gray base */}
                <div
                  className="absolute h-0.5 bg-slate-700/50 rounded-full"
                  style={{
                    top: "22px",
                    left: "calc(100% / 14)",
                    right: "calc(100% / 14)",
                  }}
                />
                {/* Connecting line — emerald completed portion */}
                <div
                  className="absolute h-0.5 bg-emerald-500 rounded-full"
                  style={{
                    top: "22px",
                    left: "calc(100% / 14)",
                    width: "calc(2 / 6 * (100% - 100% / 7))",
                  }}
                />

                {/* Nodes */}
                {TIMELINE_NODES.map((node) => (
                  <div
                    key={node.age}
                    className="flex flex-col items-center relative z-10"
                  >
                    {/* Circle */}
                    {node.status === "completed" && (
                      <div className="h-11 w-11 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check
                          className="h-5 w-5 text-white"
                          strokeWidth={2.5}
                        />
                      </div>
                    )}
                    {node.status === "current" && (
                      <div className="h-11 w-11 rounded-full border-[2.5px] border-emerald-500 bg-slate-950 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-white" />
                      </div>
                    )}
                    {node.status === "future" && (
                      <div className="h-11 w-11 rounded-full bg-slate-800 border border-slate-700/60" />
                    )}

                    {/* Age */}
                    <span
                      className={`mt-3 mb-1 ${
                        node.status === "current"
                          ? "text-sm font-bold text-emerald-400"
                          : node.status === "completed"
                            ? "text-sm font-medium text-white"
                            : "text-sm text-neutral-500"
                      }`}
                    >
                      {node.age}
                    </span>

                    {/* Label */}
                    <span
                      className={`text-xs text-center leading-tight max-w-[100px] ${
                        node.status === "current"
                          ? "text-white font-medium"
                          : node.status === "completed"
                            ? "text-neutral-400"
                            : "text-neutral-600"
                      }`}
                    >
                      {node.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4 — NOT THIS / THIS INSTEAD */}
      {/* ============================================ */}
      <section className="border-t border-slate-800/60">
        <div className="mx-auto max-w-5xl px-5 py-24 sm:py-32">
          {/* Section label — centred */}
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-600 mb-14 sm:mb-16 text-center">
            Built differently
          </p>

          <div className="space-y-12 sm:space-y-14">
            {CONTRASTS.map((item, i) => (
              <div
                key={i}
                className="grid sm:grid-cols-2 gap-4 sm:gap-12 max-w-3xl mx-auto"
              >
                {/* "Not this" side */}
                <div className="sm:text-right">
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-700 mb-2">
                    Not this
                  </p>
                  <p className="text-base text-neutral-500 line-through decoration-neutral-700/60 leading-relaxed">
                    {item.not}
                  </p>
                </div>

                {/* "This instead" side */}
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-emerald-500/60 mb-2">
                    This instead
                  </p>
                  <p className="text-base text-neutral-300 leading-relaxed">
                    {item.instead}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5 — TRUST SIGNALS */}
      {/* ============================================ */}
      <section className="border-t border-slate-800/60">
        <div className="mx-auto max-w-4xl px-5 py-14 sm:py-16">
          <div className="flex flex-wrap justify-center gap-3">
            {["No ads", "No tracking", "No payments", "No public profiles", "Safety by design"].map(
              (label) => (
                <span
                  key={label}
                  className="rounded-full border border-slate-700/50 bg-slate-900/40 px-5 py-2 text-[13px] text-neutral-400"
                >
                  {label}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 6 — CLOSING CTA */}
      {/* ============================================ */}
      <section className="border-t border-slate-800/60">
        <div className="mx-auto max-w-2xl px-5 py-28 sm:py-36 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-5">
            Get started.
          </h2>
          <p className="text-base sm:text-lg text-neutral-500 mb-12 sm:mb-14">
            Free. No credit card. No commitments.
          </p>
          <Button
            size="lg"
            asChild
            className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-base font-medium transition-colors"
          >
            <Link href="/auth/signup">Sign up free</Link>
          </Button>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600">
                <Star className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-base text-white">
                Endeavrly
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-neutral-500">
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
            <p className="text-xs text-neutral-600">
              &copy; {new Date().getFullYear()} Endeavrly. Helping young people
              build life skills and grow in confidence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import type { Metadata } from "next";
import {
  Compass,
  BookOpen,
  Sparkles,
  PenLine,
  Eye,
  MessageCircleHeart,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { CONTENT } from "../_content";

export const metadata: Metadata = {
  title: "Career OS — Endeavrly",
  robots: { index: false, follow: false },
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  BookOpen,
  Sparkles,
  PenLine,
  Eye,
  MessageCircleHeart,
  ShieldCheck,
};

// ─── Reusable window-chrome wrapper ──────────────────────────────────────────
function OSWindow({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-white/10 bg-[#1A1D2E]/90 backdrop-blur-md ${className}`}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.07] bg-[#14162A]/80">
        {/* Traffic-light dots */}
        <span className="w-3 h-3 rounded-full bg-[#FF5F57]" aria-hidden="true" />
        <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" aria-hidden="true" />
        <span className="w-3 h-3 rounded-full bg-[#28C840]" aria-hidden="true" />
        <span className="ml-3 flex-1 text-center font-mono text-[11px] text-white/35 tracking-wide truncate select-none">
          {title}
        </span>
      </div>
      {/* Window body */}
      <div className="p-0">{children}</div>
    </div>
  );
}

// ─── App icon tile ────────────────────────────────────────────────────────────
function AppIcon({
  icon,
  label,
  sub,
  step,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  step: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="font-mono text-[10px] text-white/30 tracking-widest uppercase mb-0.5">
          {step}
        </p>
        <p className="text-sm font-semibold text-white/90 leading-tight">{label}</p>
        <p className="text-xs text-white/45 leading-snug mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── Menubar item ─────────────────────────────────────────────────────────────
function MenubarItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] text-white/50 px-2 py-0.5 rounded hover:bg-white/5 transition-colors cursor-default select-none">
      {children}
    </span>
  );
}

export default function CareerOSPage() {
  const lensAccents = [
    "bg-gradient-to-br from-indigo-500 to-violet-600",
    "bg-gradient-to-br from-sky-500 to-indigo-500",
    "bg-gradient-to-br from-teal-400 to-cyan-600",
  ];

  return (
    <>
      {/* ── Global styles / keyframes ─────────────────────────────────── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .os-fade-0 { animation: fadeUp 0.6s 0.05s ease both; }
        .os-fade-1 { animation: fadeUp 0.6s 0.18s ease both; }
        .os-fade-2 { animation: fadeUp 0.6s 0.30s ease both; }
        .os-fade-3 { animation: fadeUp 0.6s 0.42s ease both; }

        @keyframes progressFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .progress-bar { animation: progressFill 1.6s 0.5s ease both; }

        body { background-color: #0D0F1C; }
      `}</style>

      {/* ── Wallpaper / desktop background ──────────────────────────── */}
      <div
        className="min-h-screen relative"
        style={{
          background:
            "radial-gradient(ellipse at 20% 15%, rgba(99,102,241,0.18) 0%, transparent 55%), " +
            "radial-gradient(ellipse at 80% 80%, rgba(20,184,166,0.12) 0%, transparent 50%), " +
            "linear-gradient(160deg, #0D0F1C 0%, #111428 50%, #0A0F1E 100%)",
        }}
        aria-label="Career OS landing page"
      >
        {/* ═════════════════════════════════════════════════════════════
            1. NAV — OS menubar
        ═════════════════════════════════════════════════════════════ */}
        <header
          className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0D0F1C]/80 backdrop-blur-xl"
          aria-label="Primary navigation"
        >
          <div className="max-w-6xl mx-auto px-6 h-10 flex items-center justify-between">
            {/* Left: brand + menu items */}
            <div className="flex items-center gap-1">
              <span className="font-mono text-[13px] font-semibold text-white/90 mr-3">
                {CONTENT.brand}
              </span>
              <nav className="hidden sm:flex items-center gap-0" aria-label="OS menubar">
                <MenubarItem>File</MenubarItem>
                <MenubarItem>View</MenubarItem>
                <MenubarItem>Careers</MenubarItem>
                <MenubarItem>Help</MenubarItem>
              </nav>
            </div>

            {/* Right: age label + CTA */}
            <div className="flex items-center gap-3">
              <span className="hidden md:inline font-mono text-[10px] text-white/30 tracking-widest uppercase">
                {CONTENT.ageLabel}
              </span>
              <a
                href={CONTENT.primaryCta.href}
                className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 text-white rounded-md px-3.5 py-1.5 transition-colors duration-150"
              >
                {CONTENT.primaryCta.label}
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </header>

        {/* ═════════════════════════════════════════════════════════════
            2. HERO — centered OS window
        ═════════════════════════════════════════════════════════════ */}
        <section
          className="max-w-3xl mx-auto px-4 pt-16 pb-10 sm:pt-24 sm:pb-16"
          aria-label="Hero"
        >
          <OSWindow title="endeavrly — welcome.app" className="os-fade-0">
            <div className="px-8 py-10 sm:px-12 sm:py-14">
              {/* System label */}
              <p className="os-fade-1 font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-400/80 mb-5">
                {CONTENT.tagline}
              </p>

              {/* Headline */}
              <h1 className="os-fade-2 font-sans text-3xl sm:text-5xl font-bold leading-[1.1] tracking-tight text-white mb-4">
                {CONTENT.headline}
              </h1>

              {/* Subhead */}
              <p className="os-fade-3 font-sans text-base sm:text-lg text-white/55 leading-relaxed mb-8 max-w-lg">
                {CONTENT.subhead}
              </p>

              {/* Problem + solution */}
              <div className="space-y-4 text-sm text-white/50 leading-7 font-sans mb-10 max-w-xl">
                <p>{CONTENT.problem}</p>
                <p className="text-white/70">{CONTENT.solution}</p>
              </div>

              {/* Status bar + CTA row */}
              <div className="border-t border-white/[0.07] pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a
                  href={CONTENT.primaryCta.href}
                  className="inline-flex items-center gap-2 font-sans font-semibold bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg px-5 py-2.5 text-sm transition-colors duration-150"
                >
                  {CONTENT.primaryCta.label}
                  <ArrowRight className="w-4 h-4" />
                </a>
                <div className="flex items-center gap-2 font-mono text-[10px] text-white/25">
                  <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  system ready
                </div>
              </div>
            </div>
          </OSWindow>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            3. FRAMEWORK — app-icon style tabs
        ═════════════════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-4 py-12 sm:py-20"
          aria-label="The three lenses"
        >
          <OSWindow title="journey.workspace — three-lenses">
            <div className="px-8 py-10 sm:px-12 sm:py-12">
              {/* Header */}
              <div className="mb-10">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-teal-400/70 mb-2">
                  how it works
                </p>
                <h2 className="font-sans text-2xl sm:text-3xl font-bold text-white mb-2">
                  {CONTENT.framework.title}
                </h2>
                <p className="font-sans text-sm text-white/45 leading-relaxed max-w-lg">
                  {CONTENT.framework.subtitle}
                </p>
              </div>

              {/* App icons / tabs */}
              <div className="grid grid-cols-3 gap-8 sm:gap-16 justify-items-center max-w-xl mx-auto mb-10">
                {CONTENT.framework.lenses.map((lens, i) => {
                  const Icon = ICONS[lens.icon];
                  return (
                    <AppIcon
                      key={lens.name}
                      icon={Icon ? <Icon className="w-6 h-6 text-white" /> : null}
                      label={lens.name}
                      sub={lens.tagline}
                      step={`0${i + 1}`}
                      accent={lensAccents[i]}
                    />
                  );
                })}
              </div>

              {/* Lens detail panels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CONTENT.framework.lenses.map((lens, i) => {
                  const Icon = ICONS[lens.icon];
                  return (
                    <div
                      key={lens.name}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {Icon && (
                          <Icon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        )}
                        <span className="font-mono text-[10px] text-white/40 tracking-wide">
                          {lens.name}.view
                        </span>
                      </div>
                      <p className="font-sans text-xs text-white/60 leading-relaxed">
                        {lens.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </OSWindow>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            4. FEATURES — 5 feature panels
        ═════════════════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-4 py-4 sm:py-6"
          aria-label="Features"
        >
          <OSWindow title="features.panel — capabilities">
            <div className="px-8 py-10 sm:px-12 sm:py-12">
              <div className="mb-8">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-400/70 mb-2">
                  what you get
                </p>
                <h2 className="font-sans text-2xl sm:text-3xl font-bold text-white">
                  Everything you need to find your way.
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CONTENT.features.map((feat, i) => {
                  const Icon = ICONS[feat.icon];
                  return (
                    <div
                      key={feat.title}
                      className="group rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all duration-200 p-5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                          {Icon && <Icon className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <div>
                          <p className="font-mono text-[9px] text-white/25 tracking-widest uppercase">
                            module_{String(i + 1).padStart(2, "0")}
                          </p>
                          <h3 className="font-sans text-sm font-semibold text-white/90 leading-tight">
                            {feat.title}
                          </h3>
                        </div>
                      </div>
                      <p className="font-sans text-xs text-white/45 leading-relaxed">
                        {feat.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </OSWindow>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            5. TIMELINE — progress / status bar style
        ═════════════════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-4 py-4 sm:py-6"
          aria-label="Your journey timeline"
        >
          <OSWindow title="journey.progress — your-timeline">
            <div className="px-8 py-10 sm:px-12 sm:py-12">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className="font-mono text-[10px] tracking-widest uppercase text-white/25 border border-white/10 rounded px-2 py-0.5">
                  {CONTENT.timeline.badge}
                </span>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="font-mono text-[10px] text-teal-400/60">● active</span>
              </div>

              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-white mb-2">
                {CONTENT.timeline.title}
              </h2>
              <p className="font-sans text-sm text-white/45 leading-relaxed mb-10 max-w-lg">
                {CONTENT.timeline.subtitle}
              </p>

              {/* Progress track */}
              <div className="relative">
                {/* Background track */}
                <div className="h-1.5 rounded-full bg-white/[0.06] mb-8 overflow-hidden">
                  <div
                    className="progress-bar h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-400"
                  />
                </div>

                {/* Step nodes */}
                <div className="grid grid-cols-3 gap-4">
                  {CONTENT.framework.lenses.map((lens, i) => {
                    const Icon = ICONS[lens.icon];
                    const stepColors = [
                      "border-indigo-500/60 text-indigo-400",
                      "border-violet-500/60 text-violet-400",
                      "border-teal-400/60 text-teal-400",
                    ];
                    return (
                      <div key={lens.name} className="flex flex-col gap-2">
                        {/* Status row */}
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${stepColors[i]} bg-[#1A1D2E]`}
                          >
                            {Icon && <Icon className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="font-mono text-[9px] text-white/25 tracking-widest uppercase">
                              step {i + 1}
                            </p>
                            <p className="font-sans text-sm font-semibold text-white/85">
                              {lens.name}
                            </p>
                          </div>
                        </div>
                        <p className="font-sans text-xs text-white/40 leading-snug pl-9">
                          {lens.tagline}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </OSWindow>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            6. CONTRAST — diff view style
        ═════════════════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-4 py-4 sm:py-6"
          aria-label="What makes Endeavrly different"
        >
          <OSWindow title="comparison.diff — built-differently">
            <div className="px-8 py-10 sm:px-12 sm:py-12">
              <div className="mb-8">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/25 mb-2">
                  diff view
                </p>
                <h2 className="font-sans text-2xl sm:text-3xl font-bold text-white">
                  {CONTENT.contrastTitle}
                </h2>
              </div>

              <div className="rounded-lg overflow-hidden border border-white/[0.08]">
                {/* Diff header */}
                <div className="flex items-center gap-4 px-4 py-2 bg-white/[0.04] border-b border-white/[0.06]">
                  <span className="font-mono text-[10px] text-red-400/70">
                    — other platforms
                  </span>
                  <div className="flex-1 h-px bg-white/[0.04]" />
                  <span className="font-mono text-[10px] text-teal-400/70">
                    + endeavrly
                  </span>
                </div>

                {CONTENT.contrasts.map((c, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-1 sm:grid-cols-2 ${
                      i < CONTENT.contrasts.length - 1
                        ? "border-b border-white/[0.05]"
                        : ""
                    }`}
                  >
                    {/* Removed line */}
                    <div className="flex gap-2 px-4 py-4 bg-red-950/10 border-r border-white/[0.04]">
                      <span className="font-mono text-xs text-red-400/50 flex-shrink-0 mt-0.5 select-none">
                        −
                      </span>
                      <p className="font-sans text-xs text-white/30 line-through leading-relaxed">
                        {c.not}
                      </p>
                    </div>
                    {/* Added line */}
                    <div className="flex gap-2 px-4 py-4 bg-teal-950/10">
                      <span className="font-mono text-xs text-teal-400/60 flex-shrink-0 mt-0.5 select-none">
                        +
                      </span>
                      <p className="font-sans text-xs text-white/75 leading-relaxed">
                        {c.instead}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </OSWindow>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            7. TRUST BADGES — status indicators
        ═════════════════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-4 py-4 sm:py-6"
          aria-label="Trust signals"
        >
          <div className="rounded-xl border border-white/[0.07] bg-[#1A1D2E]/60 backdrop-blur-sm px-6 py-5 sm:px-8">
            <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start">
              <span className="font-mono text-[10px] text-white/20 tracking-widest uppercase mr-1 hidden sm:inline">
                system status:
              </span>
              {CONTENT.trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] text-teal-300/80 border border-teal-400/20 bg-teal-400/[0.06] rounded px-3 py-1"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400" aria-hidden="true" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            8. BUILT BY
        ═════════════════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-4 py-4 sm:py-6"
          aria-label="About the builder"
        >
          <div className="rounded-xl border border-white/[0.07] bg-[#1A1D2E]/60 px-8 py-8 sm:px-12 sm:py-10">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/25 mb-3">
              {CONTENT.builtBy.label}
            </p>
            <p className="font-sans text-xl sm:text-2xl font-semibold text-white/80 leading-snug max-w-lg">
              {CONTENT.builtBy.heading}
            </p>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            9. CLOSING CTA — spotlight window
        ═════════════════════════════════════════════════════════════ */}
        <section
          className="max-w-3xl mx-auto px-4 py-10 sm:py-16"
          aria-label="Get started"
        >
          <OSWindow title="endeavrly — get-started.app">
            <div className="px-8 py-14 sm:px-12 sm:py-16 text-center">
              {/* Subtle glow */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />
              <h2 className="relative font-sans text-3xl sm:text-5xl font-bold text-white tracking-tight mb-3">
                {CONTENT.closingCta.title}
              </h2>
              <p className="relative font-sans text-sm text-white/40 mb-8">
                {CONTENT.closingCta.subtitle}
              </p>
              <a
                href={CONTENT.closingCta.href}
                className="relative inline-flex items-center gap-2 font-sans font-semibold bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg px-6 py-3 text-sm transition-colors duration-150"
              >
                {CONTENT.closingCta.button}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </OSWindow>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            10. FOOTER — dock / status bar style
        ═════════════════════════════════════════════════════════════ */}
        <footer
          className="border-t border-white/[0.07] bg-[#0D0F1C]/80 backdrop-blur-xl"
          aria-label="Footer"
        >
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center gap-5 md:gap-0 md:justify-between">
            {/* Brand */}
            <span className="font-mono text-sm text-white/50">
              {CONTENT.footer.brand}
            </span>

            {/* Links */}
            <nav aria-label="Footer links" className="flex flex-wrap gap-x-4 gap-y-2">
              {CONTENT.footer.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="font-mono text-[11px] text-white/30 hover:text-white/60 transition-colors duration-150"
                >
                  {link}
                </a>
              ))}
            </nav>

            {/* Copyright */}
            <p className="font-mono text-[10px] text-white/20 max-w-xs leading-5">
              {CONTENT.footer.copyright}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

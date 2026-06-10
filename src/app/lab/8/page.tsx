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
  title: "Gradient Display — Endeavrly",
  robots: { index: false, follow: false },
};

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Compass,
  BookOpen,
  Sparkles,
  PenLine,
  Eye,
  MessageCircleHeart,
  ShieldCheck,
};

// ─── Timeline steps ───────────────────────────────────────────────────────────
const STEPS = CONTENT.framework.lenses;

export default function Lab8Page() {
  return (
    <div
      style={{ backgroundColor: "#0A0A0F", color: "#E4E4F0" }}
      className="min-h-screen font-sans antialiased"
    >
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-text {
          background: linear-gradient(135deg, #2DD4BF, #34D399, #06B6D4, #2DD4BF);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: gradientShift 8s ease infinite;
        }
        .gradient-text-static {
          background: linear-gradient(135deg, #2DD4BF, #34D399, #06B6D4);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin: 0;
        }
      `}</style>

      {/* ── 1 NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12"
           style={{ backgroundColor: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <span className="text-lg font-semibold tracking-tight text-white">
          {CONTENT.brand}
        </span>
        <div className="flex items-center gap-4">
          <span
            className="hidden sm:inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: "rgba(45,212,191,0.1)", color: "#2DD4BF", border: "1px solid rgba(45,212,191,0.2)" }}
          >
            {CONTENT.ageLabel}
          </span>
          <a
            href={CONTENT.primaryCta.href}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#2DD4BF", color: "#0A0A0F" }}
          >
            {CONTENT.primaryCta.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </nav>

      {/* ── 2 HERO ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-24 md:px-12 md:pt-36 md:pb-36">
        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#2DD4BF" }}>
          {CONTENT.tagline}
        </p>
        <h1
          className="gradient-text mb-8 text-6xl font-extrabold leading-[1.05] tracking-tight md:text-8xl lg:text-[7rem]"
          style={{ letterSpacing: "-0.03em" }}
        >
          {CONTENT.headline}
        </h1>
        <p className="mb-6 max-w-2xl text-xl font-light leading-relaxed md:text-2xl" style={{ color: "#9494AA" }}>
          {CONTENT.subhead}
        </p>
        <div className="mb-10 max-w-2xl space-y-4 text-base leading-relaxed" style={{ color: "#6C6C80" }}>
          <p>{CONTENT.problem}</p>
          <p style={{ color: "#9494AA" }}>{CONTENT.solution}</p>
        </div>
        <a
          href={CONTENT.primaryCta.href}
          className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#2DD4BF", color: "#0A0A0F" }}
        >
          {CONTENT.primaryCta.label}
          <ArrowRight className="h-4 w-4" />
        </a>
      </section>

      <hr className="divider" />

      {/* ── 3 FRAMEWORK ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-24 md:px-12">
        <div className="mb-16">
          <h2 className="gradient-text-static mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            {CONTENT.framework.title}
          </h2>
          <p className="max-w-xl text-base leading-relaxed" style={{ color: "#6C6C80" }}>
            {CONTENT.framework.subtitle}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {CONTENT.framework.lenses.map((lens, i) => {
            const Icon = ICONS[lens.icon];
            return (
              <div
                key={lens.name}
                className="rounded-2xl p-7"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                    style={{ backgroundColor: "rgba(45,212,191,0.12)", color: "#2DD4BF" }}
                  >
                    {i + 1}
                  </span>
                  {Icon && <Icon className="h-4 w-4" style={{ color: "#2DD4BF" }} />}
                </div>
                <h3 className="mb-1 text-xl font-semibold text-white">{lens.name}</h3>
                <p className="mb-3 text-xs font-medium uppercase tracking-widest" style={{ color: "#2DD4BF" }}>
                  {lens.tagline}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#6C6C80" }}>
                  {lens.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <hr className="divider" />

      {/* ── 4 FEATURES ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-24 md:px-12">
        <h2 className="gradient-text-static mb-16 text-4xl font-bold tracking-tight md:text-5xl">
          Everything you need.
        </h2>
        <div className="space-y-0">
          {CONTENT.features.map((feat, i) => {
            const Icon = ICONS[feat.icon];
            return (
              <div key={feat.title}>
                <div className="flex items-start gap-6 py-8">
                  <div
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.15)" }}
                  >
                    {Icon && <Icon className="h-4.5 w-4.5" style={{ color: "#2DD4BF" }} />}
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-lg font-semibold text-white">{feat.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#6C6C80" }}>
                      {feat.body}
                    </p>
                  </div>
                </div>
                {i < CONTENT.features.length - 1 && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <hr className="divider" />

      {/* ── 5 TIMELINE ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-24 md:px-12">
        <div className="mb-16">
          <span
            className="mb-5 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{ backgroundColor: "rgba(45,212,191,0.1)", color: "#2DD4BF", border: "1px solid rgba(45,212,191,0.2)" }}
          >
            {CONTENT.timeline.badge}
          </span>
          <h2 className="gradient-text-static mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            {CONTENT.timeline.title}
          </h2>
          <p className="max-w-xl text-base leading-relaxed" style={{ color: "#6C6C80" }}>
            {CONTENT.timeline.subtitle}
          </p>
        </div>
        {/* Timeline spine */}
        <div className="relative pl-8 md:pl-0">
          {/* Vertical line */}
          <div
            className="absolute left-3 top-2 h-[calc(100%-1.5rem)] w-px md:hidden"
            style={{ background: "linear-gradient(to bottom, #2DD4BF, rgba(45,212,191,0.1))" }}
          />
          <div className="hidden md:block md:relative">
            <div
              className="absolute left-1/2 top-4 h-[calc(100%-2rem)] w-px -translate-x-1/2"
              style={{ background: "linear-gradient(to bottom, #2DD4BF, rgba(45,212,191,0.1))" }}
            />
          </div>
          <div className="space-y-12 md:space-y-0">
            {STEPS.map((step, i) => {
              const Icon = ICONS[step.icon];
              const isEven = i % 2 === 0;
              return (
                <div key={step.name} className="relative md:flex md:items-center md:gap-0 md:mb-16">
                  {/* Mobile dot */}
                  <div
                    className="absolute -left-8 top-1 h-4 w-4 rounded-full border-2 md:hidden"
                    style={{ backgroundColor: "#0A0A0F", borderColor: "#2DD4BF" }}
                  />
                  {/* Desktop layout */}
                  <div className={`hidden md:flex md:w-full md:items-center ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    <div className={`md:w-5/12 ${isEven ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                      <div className={`flex items-center gap-2 mb-3 ${isEven ? "justify-end" : ""}`}>
                        {Icon && !isEven && <Icon className="h-4 w-4" style={{ color: "#2DD4BF" }} />}
                        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#2DD4BF" }}>
                          Step {i + 1}
                        </span>
                        {Icon && isEven && <Icon className="h-4 w-4" style={{ color: "#2DD4BF" }} />}
                      </div>
                      <h3 className="mb-2 text-2xl font-bold text-white">{step.name}</h3>
                      <p className="text-sm font-medium mb-3" style={{ color: "#2DD4BF" }}>{step.tagline}</p>
                      <p className="text-sm leading-relaxed" style={{ color: "#6C6C80" }}>{step.body}</p>
                    </div>
                    {/* Centre dot */}
                    <div className="md:w-2/12 md:flex md:justify-center md:relative md:z-10">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: "rgba(45,212,191,0.15)", border: "2px solid #2DD4BF", color: "#2DD4BF" }}
                      >
                        {i + 1}
                      </div>
                    </div>
                    <div className="md:w-5/12" />
                  </div>
                  {/* Mobile content */}
                  <div className="md:hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#2DD4BF" }}>
                        Step {i + 1}
                      </span>
                      {Icon && <Icon className="h-3.5 w-3.5" style={{ color: "#2DD4BF" }} />}
                    </div>
                    <h3 className="mb-1 text-xl font-bold text-white">{step.name}</h3>
                    <p className="text-xs font-medium mb-2" style={{ color: "#2DD4BF" }}>{step.tagline}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "#6C6C80" }}>{step.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ── 6 CONTRAST ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-24 md:px-12">
        <h2 className="gradient-text-static mb-16 text-4xl font-bold tracking-tight md:text-5xl">
          {CONTENT.contrastTitle}
        </h2>
        <div className="space-y-0">
          {CONTENT.contrasts.map((c, i) => (
            <div key={i}>
              <div className="grid gap-4 py-8 md:grid-cols-2 md:gap-12">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#4A4A5A" }}>
                    Not this
                  </p>
                  <p className="text-base leading-relaxed line-through" style={{ color: "#3C3C50" }}>
                    {c.not}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#2DD4BF" }}>
                    Instead
                  </p>
                  <p className="text-base leading-relaxed" style={{ color: "#C4C4D4" }}>
                    {c.instead}
                  </p>
                </div>
              </div>
              {i < CONTENT.contrasts.length - 1 && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} />
              )}
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ── 7 TRUST BADGES ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20 md:px-12">
        <div className="flex flex-wrap items-center gap-4">
          {CONTENT.trustBadges.map((badge) => (
            <span
              key={badge}
              className="rounded-full px-5 py-2.5 text-sm font-medium"
              style={{
                backgroundColor: "rgba(45,212,191,0.07)",
                border: "1px solid rgba(45,212,191,0.18)",
                color: "#2DD4BF",
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ── 8 BUILT BY ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-24 md:px-12">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#2DD4BF" }}>
          {CONTENT.builtBy.label}
        </p>
        <h2 className="max-w-2xl text-3xl font-bold leading-snug text-white md:text-4xl">
          {CONTENT.builtBy.heading}
        </h2>
      </section>

      <hr className="divider" />

      {/* ── 9 CLOSING CTA ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-32 text-center md:px-12">
        <h2 className="gradient-text mb-5 text-5xl font-extrabold tracking-tight md:text-7xl" style={{ letterSpacing: "-0.03em" }}>
          {CONTENT.closingCta.title}
        </h2>
        <p className="mb-10 text-base" style={{ color: "#6C6C80" }}>
          {CONTENT.closingCta.subtitle}
        </p>
        <a
          href={CONTENT.closingCta.href}
          className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#2DD4BF", color: "#0A0A0F" }}
        >
          {CONTENT.closingCta.button}
          <ArrowRight className="h-4 w-4" />
        </a>
      </section>

      <hr className="divider" />

      {/* ── 10 FOOTER ────────────────────────────────────────────────────── */}
      <footer className="mx-auto max-w-5xl px-6 py-12 md:px-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <span className="text-lg font-semibold text-white">{CONTENT.footer.brand}</span>
          <nav aria-label="Footer links" className="flex flex-wrap gap-x-6 gap-y-2">
            {CONTENT.footer.links.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm transition-colors hover:text-white"
                style={{ color: "#4A4A5A" }}
              >
                {link}
              </a>
            ))}
          </nav>
        </div>
        <p className="mt-8 text-xs" style={{ color: "#3C3C50" }}>
          {CONTENT.footer.copyright}
        </p>
      </footer>
    </div>
  );
}

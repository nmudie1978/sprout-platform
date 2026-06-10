import type { Metadata } from "next";
import { Compass, BookOpen, Sparkles, PenLine, Eye, MessageCircleHeart, ShieldCheck, ArrowRight } from "lucide-react";
import { CONTENT } from "../_content";

export const metadata: Metadata = {
  title: "Brutalist Mono — Endeavrly",
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

const ACCENT = "#C8FF00";

export default function BrutalistMonoPage() {
  return (
    <div className="font-mono bg-black text-white min-h-screen">

      {/* ── [NAV] ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-white">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <span className="text-lg font-bold tracking-tight uppercase">
            {CONTENT.brand}
          </span>
          <span
            className="hidden sm:inline text-xs border px-2 py-1 uppercase tracking-widest"
            style={{ borderColor: ACCENT, color: ACCENT }}
          >
            {CONTENT.ageLabel}
          </span>
          <a
            href={CONTENT.primaryCta.href}
            className="text-xs uppercase tracking-widest border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors"
          >
            {CONTENT.primaryCta.label} <ArrowRight className="inline h-3 w-3 ml-1" />
          </a>
        </div>
      </nav>

      {/* ── [01] HERO ─────────────────────────────────────────────────────── */}
      <section className="border-b border-white">
        <div className="max-w-screen-xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-[1fr_auto] gap-12 items-start">
          <div className="space-y-8">
            {/* section marker */}
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">[01] / HERO</p>

            {/* tagline */}
            <p className="text-sm uppercase tracking-widest" style={{ color: ACCENT }}>
              {CONTENT.tagline}
            </p>

            {/* headline */}
            <h1 className="text-5xl md:text-7xl font-bold uppercase leading-none tracking-tighter">
              {CONTENT.headline.split(" ").slice(0, 2).join(" ")}{" "}
              <span style={{ color: ACCENT }}>
                {CONTENT.headline.split(" ").slice(2).join(" ")}
              </span>
            </h1>

            {/* subhead */}
            <p className="text-base md:text-lg max-w-xl text-white/80 leading-relaxed">
              {CONTENT.subhead}
            </p>

            {/* problem / solution */}
            <div className="border border-white/30 divide-y divide-white/30 max-w-xl">
              <div className="px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-white/40 mb-2">/ PROBLEM</p>
                <p className="text-sm text-white/70 leading-relaxed">{CONTENT.problem}</p>
              </div>
              <div className="px-4 py-4" style={{ borderLeftWidth: 3, borderLeftColor: ACCENT, borderLeftStyle: "solid" }}>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT }}>/ SOLUTION</p>
                <p className="text-sm text-white/90 leading-relaxed">{CONTENT.solution}</p>
              </div>
            </div>

            {/* CTA */}
            <a
              href={CONTENT.primaryCta.href}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-widest px-6 py-3 font-bold transition-opacity hover:opacity-80"
              style={{ backgroundColor: ACCENT, color: "#000" }}
            >
              {CONTENT.primaryCta.label}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* side decoration — rotated label */}
          <div className="hidden md:flex items-center justify-center">
            <span
              className="text-xs uppercase tracking-[0.4em] text-white/20 rotate-90 whitespace-nowrap"
              aria-hidden="true"
            >
              Career Exploration Platform
            </span>
          </div>
        </div>
      </section>

      {/* ── [02] FRAMEWORK ───────────────────────────────────────────────── */}
      <section className="border-b border-white">
        <div className="max-w-screen-xl mx-auto px-6 py-14">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-4">[02] / FRAMEWORK</p>
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">{CONTENT.framework.title}</h2>
            <p className="text-sm text-white/50 mt-2 max-w-xl">{CONTENT.framework.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white">
            {CONTENT.framework.lenses.map((lens, i) => {
              const Icon = ICONS[lens.icon];
              return (
                <div key={lens.name} className="px-6 py-8 first:pl-0 last:pr-0">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="text-xs uppercase tracking-widest font-bold px-2 py-0.5"
                      style={{ backgroundColor: ACCENT, color: "#000" }}
                    >
                      [{String(i + 1).padStart(2, "0")}]
                    </span>
                    {Icon && <Icon className="h-4 w-4 text-white/50" />}
                  </div>
                  <p className="text-xl font-bold uppercase mb-1">{lens.name}</p>
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-3">{lens.tagline}</p>
                  <p className="text-sm text-white/70 leading-relaxed">{lens.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── [03] FEATURES ────────────────────────────────────────────────── */}
      <section className="border-b border-white">
        <div className="max-w-screen-xl mx-auto px-6 py-14">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-10">[03] / FEATURES</p>
          <div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-white">
            {CONTENT.features.map((feat) => {
              const Icon = ICONS[feat.icon];
              return (
                <div key={feat.title} className="px-4 py-8 first:pl-0 last:pr-0 space-y-3">
                  {Icon && (
                    <div className="border border-white/40 inline-flex p-2">
                      <Icon className="h-4 w-4" />
                    </div>
                  )}
                  <p className="text-sm font-bold uppercase">{feat.title}</p>
                  <p className="text-xs text-white/60 leading-relaxed">{feat.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── [04] TIMELINE ────────────────────────────────────────────────── */}
      <section className="border-b border-white">
        <div className="max-w-screen-xl mx-auto px-6 py-14">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-4">[04] / TIMELINE</p>
          <div className="mb-10">
            <span
              className="inline-block text-xs uppercase tracking-widest px-3 py-1 font-bold mb-4"
              style={{ backgroundColor: ACCENT, color: "#000" }}
            >
              {CONTENT.timeline.badge}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold uppercase">{CONTENT.timeline.title}</h2>
            <p className="text-sm text-white/50 mt-2 max-w-lg">{CONTENT.timeline.subtitle}</p>
          </div>
          {/* Discover → Understand → Clarity rail */}
          <div className="relative">
            {/* horizontal rule line */}
            <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-white/20" aria-hidden="true" />
            <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 border border-white">
              {CONTENT.framework.lenses.map((lens, i) => {
                const isLast = i === CONTENT.framework.lenses.length - 1;
                return (
                  <div
                    key={lens.name}
                    className={`px-6 py-8 relative ${!isLast ? "md:border-r md:border-white" : ""}`}
                  >
                    <div
                      className="w-3 h-3 border-2 border-white mb-6 hidden md:block"
                      style={i === 2 ? { backgroundColor: ACCENT, borderColor: ACCENT } : {}}
                      aria-hidden="true"
                    />
                    <p
                      className="text-xs uppercase tracking-widest mb-2"
                      style={{ color: i === 2 ? ACCENT : "rgba(255,255,255,0.4)" }}
                    >
                      / STEP {i + 1}
                    </p>
                    <p className="text-lg font-bold uppercase mb-1">{lens.name}</p>
                    <p className="text-xs text-white/50 leading-relaxed">{lens.tagline}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── [05] CONTRAST ────────────────────────────────────────────────── */}
      <section className="border-b border-white">
        <div className="max-w-screen-xl mx-auto px-6 py-14">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-4">[05] / CONTRAST</p>
          <h2 className="text-3xl md:text-4xl font-bold uppercase mb-10">{CONTENT.contrastTitle}</h2>
          <div className="divide-y divide-white border border-white">
            {CONTENT.contrasts.map((c, i) => (
              <div key={i} className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white">
                <div className="px-6 py-6">
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-2">/ NOT THIS</p>
                  <p className="text-sm text-white/40 line-through decoration-white/40">{c.not}</p>
                </div>
                <div className="px-6 py-6" style={{ borderLeftColor: ACCENT }}>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT }}>/ INSTEAD</p>
                  <p className="text-sm text-white/90">{c.instead}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── [06] TRUST ───────────────────────────────────────────────────── */}
      <section className="border-b border-white">
        <div className="max-w-screen-xl mx-auto px-6 py-10">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-8">[06] / TRUST</p>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white border border-white">
            {CONTENT.trustBadges.map((badge) => (
              <div key={badge} className="px-6 py-8 text-center">
                <span
                  className="block text-xs uppercase tracking-widest font-bold"
                  style={{ color: ACCENT }}
                >
                  ✓
                </span>
                <span className="block text-sm uppercase tracking-widest mt-2">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── [07] BUILT BY ────────────────────────────────────────────────── */}
      <section className="border-b border-white">
        <div className="max-w-screen-xl mx-auto px-6 py-14">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-4">[07] / BUILT BY</p>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <span className="text-xs uppercase tracking-widest text-white/40 border border-white/30 px-3 py-1 self-start">
              {CONTENT.builtBy.label}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold uppercase">{CONTENT.builtBy.heading}</h2>
          </div>
        </div>
      </section>

      {/* ── [08] CLOSING CTA ─────────────────────────────────────────────── */}
      <section className="border-b border-white" style={{ backgroundColor: ACCENT }}>
        <div className="max-w-screen-xl mx-auto px-6 py-16 text-black">
          <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-6">[08] / START</p>
          <h2 className="text-4xl md:text-6xl font-bold uppercase leading-none tracking-tighter mb-4">
            {CONTENT.closingCta.title}
          </h2>
          <p className="text-sm uppercase tracking-widest opacity-60 mb-10">
            {CONTENT.closingCta.subtitle}
          </p>
          <a
            href={CONTENT.closingCta.href}
            className="inline-flex items-center gap-2 text-sm uppercase tracking-widest px-6 py-3 font-bold border-2 border-black hover:bg-black hover:text-white transition-colors"
            style={{ color: "#000" }}
          >
            {CONTENT.closingCta.button}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ── [FOOTER] ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <span className="text-sm font-bold uppercase tracking-tight">{CONTENT.footer.brand}</span>
            <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
              {CONTENT.footer.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  {link}
                </a>
              ))}
            </nav>
          </div>
          <p className="text-xs text-white/30 mt-6 uppercase tracking-wider">{CONTENT.footer.copyright}</p>
        </div>
      </footer>

    </div>
  );
}

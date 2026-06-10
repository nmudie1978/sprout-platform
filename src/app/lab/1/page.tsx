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
  title: "Editorial Serif — Endeavrly",
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

export default function EditorialSerifPage() {
  return (
    <>
      {/* Global keyframes for subtle fade-in */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease both; }
        .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.7s 0.22s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.34s ease both; }

        /* Drop-cap on the problem paragraph */
        .drop-cap::first-letter {
          float: left;
          font-size: 4.2rem;
          line-height: 0.82;
          margin-right: 0.18em;
          margin-top: 0.07em;
          font-family: Georgia, "Times New Roman", serif;
          color: #177D7A;
          font-weight: 400;
        }
      `}</style>

      <div className="min-h-screen bg-[#F8F5EF] text-[#2E2A25]">

        {/* ── Top rule ── */}
        <div className="h-[3px] bg-[#177D7A]" />

        {/* ══════════════════════════════════════════════════
            1. NAV
        ══════════════════════════════════════════════════ */}
        <header className="border-b border-[#2E2A25]/10">
          <nav
            className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between"
            aria-label="Primary navigation"
          >
            {/* Brand */}
            <span className="font-serif text-xl tracking-tight text-[#2E2A25]">
              {CONTENT.brand}
            </span>

            <div className="flex items-center gap-4">
              {/* Age label pill */}
              <span className="hidden sm:inline-block text-[10px] tracking-[0.15em] uppercase font-sans border border-[#2E2A25]/20 text-[#2E2A25]/60 rounded-full px-3 py-1">
                {CONTENT.ageLabel}
              </span>

              {/* Primary CTA */}
              <a
                href={CONTENT.primaryCta.href}
                className="inline-flex items-center gap-1.5 text-sm font-sans font-medium bg-[#177D7A] text-white rounded-full px-4 py-2 transition-opacity duration-200 hover:opacity-85"
              >
                {CONTENT.primaryCta.label}
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </nav>
        </header>

        {/* ══════════════════════════════════════════════════
            2. HERO
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24 border-b border-[#2E2A25]/10"
          aria-label="Hero"
        >
          {/* Kicker */}
          <p className="fade-up text-[11px] tracking-[0.18em] uppercase font-sans text-[#177D7A] mb-5">
            {CONTENT.tagline}
          </p>

          {/* Headline */}
          <h1 className="fade-up-1 font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight text-[#2E2A25] max-w-2xl mb-6">
            {CONTENT.headline}
          </h1>

          {/* Subhead */}
          <p className="fade-up-2 font-serif text-xl md:text-2xl text-[#2E2A25]/70 leading-relaxed max-w-xl mb-12">
            {CONTENT.subhead}
          </p>

          {/* Problem + Solution — two-column editorial */}
          <div className="fade-up-3 md:columns-2 md:gap-10 text-base leading-7 font-sans text-[#2E2A25]/80 mb-12 space-y-5 md:space-y-0">
            <p className="drop-cap">{CONTENT.problem}</p>
            <p className="break-inside-avoid">{CONTENT.solution}</p>
          </div>

          {/* Primary CTA */}
          <a
            href={CONTENT.primaryCta.href}
            className="inline-flex items-center gap-2 font-sans font-medium bg-[#177D7A] text-white rounded-full px-6 py-3 text-sm transition-opacity duration-200 hover:opacity-85"
          >
            {CONTENT.primaryCta.label}
            <ArrowRight className="w-4 h-4" />
          </a>
        </section>

        {/* ══════════════════════════════════════════════════
            3. FRAMEWORK — Three lenses
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-6 py-20 border-b border-[#2E2A25]/10"
          aria-label="The three lenses"
        >
          {/* Section kicker */}
          <p className="text-[11px] tracking-[0.18em] uppercase font-sans text-[#2E2A25]/40 mb-3">
            How it works
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight tracking-tight text-[#2E2A25] mb-3 max-w-xl">
            {CONTENT.framework.title}
          </h2>
          <p className="font-sans text-base text-[#2E2A25]/60 leading-relaxed max-w-lg mb-14">
            {CONTENT.framework.subtitle}
          </p>

          {/* Three lenses */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CONTENT.framework.lenses.map((lens, i) => {
              const Icon = ICONS[lens.icon];
              return (
                <article
                  key={lens.name}
                  className="relative pl-5 border-l border-[#177D7A]/30 group"
                >
                  {/* Step number */}
                  <span className="block text-[11px] tracking-[0.15em] uppercase font-sans text-[#177D7A]/60 mb-3">
                    0{i + 1}
                  </span>

                  {/* Icon + name */}
                  <div className="flex items-center gap-2 mb-1">
                    {Icon && (
                      <Icon className="w-4 h-4 text-[#177D7A] flex-shrink-0" />
                    )}
                    <h3 className="font-serif text-2xl text-[#2E2A25]">
                      {lens.name}
                    </h3>
                  </div>

                  {/* Tagline */}
                  <p className="font-sans text-xs tracking-wide text-[#2E2A25]/50 uppercase mb-3">
                    {lens.tagline}
                  </p>

                  {/* Body */}
                  <p className="font-sans text-sm leading-6 text-[#2E2A25]/70">
                    {lens.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            4. FEATURES — 5 features
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-6 py-20 border-b border-[#2E2A25]/10"
          aria-label="Features"
        >
          <p className="text-[11px] tracking-[0.18em] uppercase font-sans text-[#2E2A25]/40 mb-3">
            What you get
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight tracking-tight text-[#2E2A25] mb-14 max-w-lg">
            Everything you need to find your way.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-10">
            {CONTENT.features.map((feat) => {
              const Icon = ICONS[feat.icon];
              return (
                <article key={feat.title} className="flex flex-col gap-3">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#177D7A]/30 bg-[#177D7A]/5">
                    {Icon && <Icon className="w-4 h-4 text-[#177D7A]" />}
                  </div>
                  <h3 className="font-serif text-lg text-[#2E2A25]">{feat.title}</h3>
                  <p className="font-sans text-sm leading-6 text-[#2E2A25]/65">{feat.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            5. TIMELINE — Discover → Understand → Clarity
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-6 py-20 border-b border-[#2E2A25]/10"
          aria-label="Your journey timeline"
        >
          {/* Badge */}
          <span className="inline-block text-[11px] tracking-[0.15em] uppercase font-sans border border-[#177D7A]/40 text-[#177D7A] rounded-full px-3 py-1 mb-6">
            {CONTENT.timeline.badge}
          </span>

          <h2 className="font-serif text-4xl md:text-5xl leading-tight tracking-tight text-[#2E2A25] mb-3 max-w-xl">
            {CONTENT.timeline.title}
          </h2>
          <p className="font-sans text-base text-[#2E2A25]/60 leading-relaxed max-w-lg mb-14">
            {CONTENT.timeline.subtitle}
          </p>

          {/* Visual timeline */}
          <div className="relative flex flex-col md:flex-row gap-0 md:gap-0">
            {/* Connector line — desktop */}
            <div
              className="hidden md:block absolute top-5 left-[calc(16.666%-0.5rem)] right-[calc(16.666%-0.5rem)] h-px bg-[#2E2A25]/12"
              aria-hidden="true"
            />

            {CONTENT.framework.lenses.map((lens, i) => {
              const Icon = ICONS[lens.icon];
              return (
                <div
                  key={lens.name}
                  className="relative flex md:flex-col md:items-center md:text-center flex-row items-start gap-4 md:gap-4 flex-1 pb-8 md:pb-0 pl-0"
                >
                  {/* Node */}
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#F8F5EF] border-2 border-[#177D7A] z-10">
                    {Icon && <Icon className="w-4 h-4 text-[#177D7A]" />}
                  </div>

                  {/* Vertical connector — mobile */}
                  {i < CONTENT.framework.lenses.length - 1 && (
                    <div
                      className="md:hidden absolute left-5 top-10 bottom-0 w-px bg-[#2E2A25]/12"
                      aria-hidden="true"
                    />
                  )}

                  <div className="pt-0.5 md:pt-3">
                    <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#177D7A]/70 mb-1">
                      Step {i + 1}
                    </p>
                    <h3 className="font-serif text-xl text-[#2E2A25] mb-1">{lens.name}</h3>
                    <p className="font-sans text-sm text-[#2E2A25]/55 leading-5">{lens.tagline}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            6. CONTRAST — Built differently
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-6 py-20 border-b border-[#2E2A25]/10"
          aria-label="What makes Endeavrly different"
        >
          <p className="text-[11px] tracking-[0.18em] uppercase font-sans text-[#2E2A25]/40 mb-3">
            A different kind of platform
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight tracking-tight text-[#2E2A25] mb-14 max-w-xl">
            {CONTENT.contrastTitle}
          </h2>

          <div className="divide-y divide-[#2E2A25]/8">
            {CONTENT.contrasts.map((c, i) => (
              <div
                key={i}
                className="py-7 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10"
              >
                {/* Not — struck through */}
                <p className="font-sans text-sm leading-6 text-[#2E2A25]/35 line-through decoration-[#2E2A25]/20">
                  {c.not}
                </p>
                {/* Instead — affirmed */}
                <p className="font-sans text-sm leading-6 text-[#2E2A25]/80 font-medium">
                  {c.instead}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            7. TRUST BADGES
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-6 py-14 border-b border-[#2E2A25]/10"
          aria-label="Trust signals"
        >
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {CONTENT.trustBadges.map((badge) => (
              <span
                key={badge}
                className="inline-block text-[11px] tracking-[0.14em] uppercase font-sans border border-[#177D7A]/35 text-[#177D7A] rounded-full px-4 py-1.5"
              >
                {badge}
              </span>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            8. BUILT BY
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-6 py-20 border-b border-[#2E2A25]/10"
          aria-label="About the builder"
        >
          <p className="text-[11px] tracking-[0.18em] uppercase font-sans text-[#2E2A25]/40 mb-3">
            {CONTENT.builtBy.label}
          </p>
          <p className="font-serif text-3xl md:text-4xl leading-snug tracking-tight text-[#2E2A25] max-w-xl">
            {CONTENT.builtBy.heading}
          </p>
        </section>

        {/* ══════════════════════════════════════════════════
            9. CLOSING CTA
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-6 py-24 text-center border-b border-[#2E2A25]/10"
          aria-label="Get started"
        >
          <h2 className="font-serif text-5xl md:text-6xl leading-tight tracking-tight text-[#2E2A25] mb-4">
            {CONTENT.closingCta.title}
          </h2>
          <p className="font-sans text-base text-[#2E2A25]/55 mb-10">
            {CONTENT.closingCta.subtitle}
          </p>
          <a
            href={CONTENT.closingCta.href}
            className="inline-flex items-center gap-2 font-sans font-medium bg-[#177D7A] text-white rounded-full px-8 py-3.5 text-base transition-opacity duration-200 hover:opacity-85"
          >
            {CONTENT.closingCta.button}
            <ArrowRight className="w-4 h-4" />
          </a>
        </section>

        {/* ══════════════════════════════════════════════════
            10. FOOTER
        ══════════════════════════════════════════════════ */}
        <footer
          className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-0 md:justify-between"
          aria-label="Footer"
        >
          {/* Brand */}
          <span className="font-serif text-lg text-[#2E2A25]/70">
            {CONTENT.footer.brand}
          </span>

          {/* Links */}
          <nav aria-label="Footer links" className="flex flex-wrap gap-x-5 gap-y-2">
            {CONTENT.footer.links.map((link) => (
              <a
                key={link}
                href="#"
                className="font-sans text-xs text-[#2E2A25]/45 hover:text-[#177D7A] transition-colors duration-150 tracking-wide"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Copyright */}
          <p className="font-sans text-xs text-[#2E2A25]/35 max-w-xs md:text-right leading-5">
            {CONTENT.footer.copyright}
          </p>
        </footer>

        {/* Bottom rule */}
        <div className="h-[2px] bg-[#177D7A]/20" />
      </div>
    </>
  );
}

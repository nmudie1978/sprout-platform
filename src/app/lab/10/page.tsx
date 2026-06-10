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
  title: "Warm Zine — Endeavrly",
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

// Palette
// bg:       #FFF6EC  (warm cream)
// surface:  #FFFFFF  (white cards)
// ink:      #2C2117  (warm near-black)
// teal:     #2BB3A3  (soft teal accent)
// coral:    #FF8A6B  (peach/coral accent)
// muted:    #2C2117 at low opacity

export default function WarmZinePage() {
  return (
    <>
      <style>{`
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(20px) rotate(-1deg); }
          to   { opacity: 1; transform: translateY(0)   rotate(-1deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-float-in { animation: floatIn 0.65s ease both; }
        .anim-fade-1   { animation: fadeUp 0.65s 0.1s ease both; }
        .anim-fade-2   { animation: fadeUp 0.65s 0.22s ease both; }
        .anim-fade-3   { animation: fadeUp 0.65s 0.34s ease both; }
        .anim-fade-4   { animation: fadeUp 0.65s 0.46s ease both; }

        .dotted-divider {
          border: none;
          border-top: 2px dotted #2C211720;
          margin: 0;
        }
      `}</style>

      <div className="min-h-screen bg-[#FFF6EC] text-[#2C2117] font-sans">

        {/* ══════════════════════════════════════════════════
            1. NAV
        ══════════════════════════════════════════════════ */}
        <header className="sticky top-0 z-50 bg-[#FFF6EC]/90 backdrop-blur-sm border-b-2 border-dotted border-[#2C2117]/10">
          <nav
            className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between"
            aria-label="Primary navigation"
          >
            {/* Brand */}
            <span className="text-xl font-bold tracking-tight text-[#2C2117]">
              {CONTENT.brand}
            </span>

            <div className="flex items-center gap-3">
              {/* Age label — sticker badge, slight rotation */}
              <span className="hidden sm:inline-block -rotate-2 text-[10px] font-semibold tracking-wide uppercase bg-[#FF8A6B]/15 text-[#C05A3A] border border-[#FF8A6B]/40 rounded-full px-3 py-1 shadow-sm">
                {CONTENT.ageLabel}
              </span>

              {/* Primary CTA */}
              <a
                href={CONTENT.primaryCta.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold bg-[#2BB3A3] text-white rounded-full px-4 py-2 shadow-md shadow-[#2BB3A3]/30 transition-all duration-200 hover:bg-[#239e90] hover:shadow-lg hover:shadow-[#2BB3A3]/25"
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
          className="max-w-5xl mx-auto px-5 pt-16 pb-16 md:pt-24 md:pb-20"
          aria-label="Hero"
        >
          {/* Tagline sticker */}
          <div className="anim-float-in inline-block rotate-[-1.5deg] bg-[#2BB3A3] text-white text-xs font-bold tracking-widest uppercase rounded-2xl px-4 py-2 mb-8 shadow-lg shadow-[#2BB3A3]/30">
            {CONTENT.tagline}
          </div>

          {/* Headline */}
          <h1 className="anim-fade-1 text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-[#2C2117] max-w-2xl mb-5">
            {CONTENT.headline}
          </h1>

          {/* Subhead */}
          <p className="anim-fade-2 text-xl md:text-2xl text-[#2C2117]/65 leading-relaxed max-w-xl font-medium mb-10">
            {CONTENT.subhead}
          </p>

          {/* Problem + Solution cards */}
          <div className="anim-fade-3 grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-[#2C2117]/6">
              <p className="text-sm leading-7 text-[#2C2117]/70">{CONTENT.problem}</p>
            </div>
            <div className="bg-[#2BB3A3]/8 border border-[#2BB3A3]/25 rounded-3xl p-7">
              <p className="text-sm leading-7 text-[#2C2117]/80 font-medium">{CONTENT.solution}</p>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="anim-fade-4">
            <a
              href={CONTENT.primaryCta.href}
              className="inline-flex items-center gap-2 font-semibold bg-[#FF8A6B] text-white rounded-full px-7 py-3.5 text-base shadow-lg shadow-[#FF8A6B]/35 transition-all duration-200 hover:bg-[#e87559] hover:shadow-xl hover:shadow-[#FF8A6B]/30"
            >
              {CONTENT.primaryCta.label}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        <hr className="dotted-divider mx-5 md:mx-auto md:max-w-5xl" />

        {/* ══════════════════════════════════════════════════
            3. FRAMEWORK — Three lenses
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-5 py-20"
          aria-label="The three lenses"
        >
          {/* Section kicker */}
          <div className="flex items-center gap-3 mb-6">
            <span className="rotate-1 inline-block text-[10px] font-bold tracking-widest uppercase bg-[#FF8A6B]/15 text-[#C05A3A] border border-[#FF8A6B]/40 rounded-full px-3 py-1 shadow-sm">
              How it works
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-[#2C2117] mb-3 max-w-xl">
            {CONTENT.framework.title}
          </h2>
          <p className="text-base text-[#2C2117]/55 leading-relaxed max-w-lg mb-12 font-medium">
            {CONTENT.framework.subtitle}
          </p>

          {/* Three lens cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CONTENT.framework.lenses.map((lens, i) => {
              const Icon = ICONS[lens.icon];
              // Alternate card backgrounds for a cheerful zine feel
              const cardBg =
                i === 0
                  ? "bg-[#2BB3A3]/8 border-[#2BB3A3]/25"
                  : i === 1
                  ? "bg-[#FF8A6B]/8 border-[#FF8A6B]/25"
                  : "bg-white border-[#2C2117]/8";
              const accentColor =
                i === 0 ? "text-[#2BB3A3]" : i === 1 ? "text-[#FF8A6B]" : "text-[#2C2117]/50";
              const iconBg =
                i === 0
                  ? "bg-[#2BB3A3]/15"
                  : i === 1
                  ? "bg-[#FF8A6B]/15"
                  : "bg-[#2C2117]/6";

              return (
                <article
                  key={lens.name}
                  className={`rounded-3xl p-7 border shadow-sm ${cardBg}`}
                >
                  {/* Step pill */}
                  <span className={`text-[10px] font-bold tracking-widest uppercase ${accentColor} mb-4 block`}>
                    Step 0{i + 1}
                  </span>

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl ${iconBg} mb-4`}>
                    {Icon && <Icon className={`w-5 h-5 ${accentColor}`} />}
                  </div>

                  {/* Name + tagline */}
                  <h3 className="text-xl font-bold text-[#2C2117] mb-1">{lens.name}</h3>
                  <p className={`text-xs font-semibold tracking-wide uppercase ${accentColor} mb-3`}>
                    {lens.tagline}
                  </p>

                  {/* Body */}
                  <p className="text-sm leading-6 text-[#2C2117]/65">{lens.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <hr className="dotted-divider mx-5 md:mx-auto md:max-w-5xl" />

        {/* ══════════════════════════════════════════════════
            4. FEATURES — 5 features
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-5 py-20"
          aria-label="Features"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="-rotate-1 inline-block text-[10px] font-bold tracking-widest uppercase bg-[#2BB3A3]/12 text-[#1d8a7c] border border-[#2BB3A3]/30 rounded-full px-3 py-1 shadow-sm">
              What you get
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-[#2C2117] mb-12 max-w-lg">
            Everything you need to find your way.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {CONTENT.features.map((feat, i) => {
              const Icon = ICONS[feat.icon];
              // Last feature spans full width if it's the 5th (odd) card
              const isLast = i === CONTENT.features.length - 1 && CONTENT.features.length % 3 === 2;
              return (
                <article
                  key={feat.title}
                  className={`bg-white rounded-3xl p-7 border border-[#2C2117]/7 shadow-sm flex flex-col gap-4 ${isLast ? "sm:col-span-2 md:col-span-1" : ""}`}
                >
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#FFF6EC] border border-[#2C2117]/8">
                    {Icon && <Icon className="w-5 h-5 text-[#2BB3A3]" />}
                  </div>
                  <h3 className="text-base font-bold text-[#2C2117]">{feat.title}</h3>
                  <p className="text-sm leading-6 text-[#2C2117]/60">{feat.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <hr className="dotted-divider mx-5 md:mx-auto md:max-w-5xl" />

        {/* ══════════════════════════════════════════════════
            5. TIMELINE — Discover → Understand → Clarity
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-5 py-20"
          aria-label="Your journey timeline"
        >
          {/* Badge */}
          <span className="rotate-1 inline-block text-[10px] font-bold tracking-widest uppercase bg-[#FF8A6B]/15 text-[#C05A3A] border border-[#FF8A6B]/40 rounded-full px-3 py-1 shadow-sm mb-7">
            {CONTENT.timeline.badge}
          </span>

          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-[#2C2117] mb-3 max-w-xl">
            {CONTENT.timeline.title}
          </h2>
          <p className="text-base text-[#2C2117]/55 leading-relaxed max-w-lg mb-14 font-medium">
            {CONTENT.timeline.subtitle}
          </p>

          {/* Timeline steps — card style with connector */}
          <div className="relative flex flex-col md:flex-row gap-5 md:gap-0">
            {/* Desktop connector */}
            <div
              className="hidden md:block absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-0.5 bg-dotted border-t-2 border-dotted border-[#2C2117]/12"
              style={{ borderStyle: "dotted" }}
              aria-hidden="true"
            />

            {CONTENT.framework.lenses.map((lens, i) => {
              const Icon = ICONS[lens.icon];
              const accentBg =
                i === 0 ? "bg-[#2BB3A3]" : i === 1 ? "bg-[#FF8A6B]" : "bg-[#2C2117]";
              return (
                <div
                  key={lens.name}
                  className="relative flex md:flex-col md:items-center md:text-center gap-5 md:gap-4 flex-1"
                >
                  {/* Node */}
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-[3.25rem] h-[3.25rem] rounded-2xl ${accentBg} shadow-lg z-10`}
                  >
                    {Icon && <Icon className="w-5 h-5 text-white" />}
                  </div>

                  {/* Mobile connector */}
                  {i < CONTENT.framework.lenses.length - 1 && (
                    <div
                      className="md:hidden absolute left-[1.5rem] top-[3.25rem] bottom-[-1.25rem] w-0.5 border-l-2 border-dotted border-[#2C2117]/15"
                      style={{ borderStyle: "dotted" }}
                      aria-hidden="true"
                    />
                  )}

                  <div className="pt-0 md:pt-4">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[#2C2117]/40 mb-1">
                      Step {i + 1}
                    </p>
                    <h3 className="text-lg font-extrabold text-[#2C2117] mb-1">{lens.name}</h3>
                    <p className="text-sm text-[#2C2117]/55 font-medium leading-5">{lens.tagline}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <hr className="dotted-divider mx-5 md:mx-auto md:max-w-5xl" />

        {/* ══════════════════════════════════════════════════
            6. CONTRAST — Built differently
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-5 py-20"
          aria-label="What makes Endeavrly different"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="-rotate-2 inline-block text-[10px] font-bold tracking-widest uppercase bg-[#2BB3A3]/12 text-[#1d8a7c] border border-[#2BB3A3]/30 rounded-full px-3 py-1 shadow-sm">
              A different kind of platform
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-[#2C2117] mb-12 max-w-xl">
            {CONTENT.contrastTitle}
          </h2>

          <div className="flex flex-col gap-4">
            {CONTENT.contrasts.map((c, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-[#2C2117]/7 shadow-sm overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Not — muted with strike */}
                  <div className="px-7 py-6 border-b md:border-b-0 md:border-r border-dashed border-[#2C2117]/10">
                    <p className="text-xs font-bold tracking-widest uppercase text-[#2C2117]/30 mb-2">
                      Not this
                    </p>
                    <p className="text-sm leading-6 text-[#2C2117]/30 line-through decoration-[#2C2117]/20">
                      {c.not}
                    </p>
                  </div>
                  {/* Instead — affirmed */}
                  <div className="px-7 py-6 bg-[#2BB3A3]/5">
                    <p className="text-xs font-bold tracking-widest uppercase text-[#2BB3A3] mb-2">
                      Instead
                    </p>
                    <p className="text-sm leading-6 text-[#2C2117]/80 font-medium">{c.instead}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="dotted-divider mx-5 md:mx-auto md:max-w-5xl" />

        {/* ══════════════════════════════════════════════════
            7. TRUST BADGES
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-5 py-14"
          aria-label="Trust signals"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {CONTENT.trustBadges.map((badge, i) => {
              // Each badge gets a slight alternating rotation for a sticker-scatter feel
              const rotate = i % 2 === 0 ? "-rotate-1" : "rotate-1";
              return (
                <span
                  key={badge}
                  className={`${rotate} inline-block text-xs font-bold tracking-wide uppercase bg-white border-2 border-[#2BB3A3]/40 text-[#2BB3A3] rounded-2xl px-5 py-2 shadow-md shadow-[#2BB3A3]/10`}
                >
                  {badge}
                </span>
              );
            })}
          </div>
        </section>

        <hr className="dotted-divider mx-5 md:mx-auto md:max-w-5xl" />

        {/* ══════════════════════════════════════════════════
            8. BUILT BY
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-5 py-20"
          aria-label="About the builder"
        >
          <div className="bg-[#FF8A6B]/8 border border-[#FF8A6B]/25 rounded-3xl px-8 py-10 md:px-12 md:py-12">
            <p className="text-xs font-bold tracking-widest uppercase text-[#C05A3A] mb-3">
              {CONTENT.builtBy.label}
            </p>
            <p className="text-3xl md:text-4xl font-extrabold leading-snug tracking-tight text-[#2C2117] max-w-xl">
              {CONTENT.builtBy.heading}
            </p>
          </div>
        </section>

        <hr className="dotted-divider mx-5 md:mx-auto md:max-w-5xl" />

        {/* ══════════════════════════════════════════════════
            9. CLOSING CTA
        ══════════════════════════════════════════════════ */}
        <section
          className="max-w-5xl mx-auto px-5 py-24 text-center"
          aria-label="Get started"
        >
          {/* Decorative sticker accent */}
          <span className="rotate-2 inline-block text-[10px] font-bold tracking-widest uppercase bg-[#2BB3A3] text-white rounded-2xl px-4 py-2 shadow-lg shadow-[#2BB3A3]/30 mb-8">
            Free to join
          </span>

          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-[#2C2117] mb-4">
            {CONTENT.closingCta.title}
          </h2>
          <p className="text-base text-[#2C2117]/55 font-medium mb-10">
            {CONTENT.closingCta.subtitle}
          </p>
          <a
            href={CONTENT.closingCta.href}
            className="inline-flex items-center gap-2 font-bold bg-[#FF8A6B] text-white rounded-full px-9 py-4 text-base shadow-xl shadow-[#FF8A6B]/35 transition-all duration-200 hover:bg-[#e87559] hover:shadow-2xl hover:shadow-[#FF8A6B]/30"
          >
            {CONTENT.closingCta.button}
            <ArrowRight className="w-4 h-4" />
          </a>
        </section>

        {/* ══════════════════════════════════════════════════
            10. FOOTER
        ══════════════════════════════════════════════════ */}
        <footer
          className="border-t-2 border-dotted border-[#2C2117]/10 bg-white"
          aria-label="Footer"
        >
          <div className="max-w-5xl mx-auto px-5 py-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-0 md:justify-between">
            {/* Brand */}
            <span className="text-lg font-extrabold tracking-tight text-[#2C2117]/70">
              {CONTENT.footer.brand}
            </span>

            {/* Links */}
            <nav aria-label="Footer links" className="flex flex-wrap gap-x-5 gap-y-2">
              {CONTENT.footer.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-xs text-[#2C2117]/40 hover:text-[#2BB3A3] transition-colors duration-150 font-medium tracking-wide"
                >
                  {link}
                </a>
              ))}
            </nav>

            {/* Copyright */}
            <p className="text-xs text-[#2C2117]/35 max-w-xs md:text-right leading-5">
              {CONTENT.footer.copyright}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

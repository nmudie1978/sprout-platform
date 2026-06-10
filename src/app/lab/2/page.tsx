import type { Metadata } from "next";
import { CONTENT } from "../_content";
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

export const metadata: Metadata = {
  title: "Swiss Minimal — Endeavrly",
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

// ─── Design tokens (Swiss Minimal) ───────────────────────────────────────────
// bg: white (#fff)   text: near-black (#111)
// accent: cobalt     #1A4BFF
// rule: 1px #e2e2e2
// mono kicker: font-mono text-[10px] tracking-[0.18em] uppercase
// headline: font-sans font-medium tight tracking
// ─────────────────────────────────────────────────────────────────────────────

const accent = "text-[#1A4BFF]";
const accentBg = "bg-[#1A4BFF]";
const rule = "border-t border-[#e2e2e2]";
const kicker =
  "font-mono text-[10px] tracking-[0.18em] uppercase text-[#888]";
const sectionIndex =
  "font-mono text-[10px] tracking-[0.12em] uppercase text-[#bbb]";

export default function SwissMinimalPage() {
  return (
    <div className="min-h-screen bg-white text-[#111] font-sans antialiased selection:bg-[#1A4BFF] selection:text-white">
      {/* ── NAV ── */}
      <header className={`${rule} border-b border-[#e2e2e2]`}>
        <div className="max-w-[1080px] mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-medium text-sm tracking-tight">{CONTENT.brand}</span>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline font-mono text-[10px] tracking-[0.18em] uppercase text-[#888]">
              {CONTENT.ageLabel}
            </span>
            <a
              href={CONTENT.primaryCta.href}
              className={`${accentBg} text-white text-xs font-mono tracking-[0.12em] uppercase px-4 py-2 flex items-center gap-1.5 hover:bg-[#0035e0] transition-colors`}
            >
              {CONTENT.primaryCta.label}
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="max-w-[1080px] mx-auto px-6 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-8">
        {/* index + tagline col */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-8 lg:pt-1">
          <span className={`${sectionIndex}`}>00 / 09</span>
          <p className={`${kicker} mt-auto hidden lg:block`}>{CONTENT.tagline}</p>
        </div>

        {/* headline col */}
        <div className="lg:col-span-9">
          <p className={`${kicker} mb-5 lg:hidden`}>{CONTENT.tagline}</p>
          <h1 className="text-[clamp(2.4rem,6vw,5rem)] font-medium leading-[1.03] tracking-[-0.025em] mb-8">
            {CONTENT.headline}
          </h1>
          <p className="text-xl text-[#444] font-normal leading-snug mb-8 max-w-xl">
            {CONTENT.subhead}
          </p>
          <div className={`${rule} pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl`}>
            <p className="text-sm text-[#555] leading-relaxed">{CONTENT.problem}</p>
            <p className="text-sm text-[#111] leading-relaxed font-medium">{CONTENT.solution}</p>
          </div>
          <div className="mt-10">
            <a
              href={CONTENT.primaryCta.href}
              className={`${accentBg} text-white text-sm font-mono tracking-[0.12em] uppercase inline-flex items-center gap-2 px-6 py-3 hover:bg-[#0035e0] transition-colors`}
            >
              {CONTENT.primaryCta.label}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── FRAMEWORK ── */}
      <section className={`${rule}`}>
        <div className="max-w-[1080px] mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-8 mb-14">
            <div className="lg:col-span-3">
              <span className={`${sectionIndex}`}>01 / 09</span>
            </div>
            <div className="lg:col-span-9">
              <span className={`${kicker} block mb-3`}>The framework</span>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.6rem)] font-medium leading-tight tracking-[-0.02em] mb-3">
                {CONTENT.framework.title}
              </h2>
              <p className="text-sm text-[#555] max-w-lg leading-relaxed">
                {CONTENT.framework.subtitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e2e2e2]">
            {CONTENT.framework.lenses.map((lens, i) => {
              const Icon = ICONS[lens.icon];
              return (
                <div key={lens.name} className="bg-white p-8">
                  <div className="flex items-start justify-between mb-6">
                    {Icon && <Icon className={`w-5 h-5 ${accent}`} />}
                    <span className="font-mono text-[10px] text-[#ccc]">0{i + 1}</span>
                  </div>
                  <h3 className="text-base font-medium tracking-tight mb-1">{lens.name}</h3>
                  <p className={`${kicker} mb-4 text-[#1A4BFF]`}>{lens.tagline}</p>
                  <p className="text-sm text-[#555] leading-relaxed">{lens.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={`${rule}`}>
        <div className="max-w-[1080px] mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-4 lg:gap-x-8 mb-14">
            <div className="lg:col-span-3">
              <span className={`${sectionIndex}`}>02 / 09</span>
            </div>
            <div className="lg:col-span-9">
              <span className={`${kicker} block mb-3`}>Features</span>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.6rem)] font-medium leading-tight tracking-[-0.02em]">
                What you get.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8">
            <div className="lg:col-span-3" />
            <div className="lg:col-span-9">
              {CONTENT.features.map((feat, i) => {
                const Icon = ICONS[feat.icon];
                return (
                  <div
                    key={feat.title}
                    className={`${i > 0 ? "border-t border-[#e2e2e2]" : ""} py-7 grid grid-cols-[auto_1fr] gap-5 items-start`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center border border-[#e2e2e2]">
                      {Icon && <Icon className={`w-4 h-4 ${accent}`} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium tracking-tight mb-1">{feat.title}</h3>
                      <p className="text-sm text-[#555] leading-relaxed">{feat.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className={`${rule} bg-[#f9f9f9]`}>
        <div className="max-w-[1080px] mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-4 lg:gap-x-8 mb-14">
            <div className="lg:col-span-3">
              <span className={`${sectionIndex}`}>03 / 09</span>
            </div>
            <div className="lg:col-span-9">
              <span className={`${kicker} block mb-3`}>{CONTENT.timeline.badge}</span>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.6rem)] font-medium leading-tight tracking-[-0.02em] mb-3">
                {CONTENT.timeline.title}
              </h2>
              <p className="text-sm text-[#555] max-w-lg leading-relaxed">
                {CONTENT.timeline.subtitle}
              </p>
            </div>
          </div>

          {/* progression strip */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8">
            <div className="lg:col-span-3" />
            <div className="lg:col-span-9">
              <div className="relative">
                {/* connector line */}
                <div className="absolute top-5 left-5 right-5 h-px bg-[#e2e2e2] hidden md:block" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 md:gap-y-0 relative z-10">
                  {CONTENT.framework.lenses.map((lens, i) => (
                    <div key={lens.name} className="flex flex-col items-start md:items-center md:text-center gap-4">
                      <div className={`w-10 h-10 flex items-center justify-center text-white text-xs font-mono ${accentBg}`}>
                        0{i + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium tracking-tight">{lens.name}</h3>
                        <p className={`${kicker} mt-0.5 text-[#1A4BFF]`}>{lens.tagline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTRAST ── */}
      <section className={`${rule}`}>
        <div className="max-w-[1080px] mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-4 lg:gap-x-8 mb-14">
            <div className="lg:col-span-3">
              <span className={`${sectionIndex}`}>04 / 09</span>
            </div>
            <div className="lg:col-span-9">
              <h2 className="text-[clamp(1.6rem,3.5vw,2.6rem)] font-medium leading-tight tracking-[-0.02em]">
                {CONTENT.contrastTitle}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8">
            <div className="lg:col-span-3" />
            <div className="lg:col-span-9">
              <div className="grid grid-cols-2 gap-px bg-[#e2e2e2] mb-px">
                <div className="bg-white px-6 py-3">
                  <span className={`${kicker} text-[#bbb]`}>Not this</span>
                </div>
                <div className="bg-white px-6 py-3">
                  <span className={`${kicker} text-[#1A4BFF]`}>Instead</span>
                </div>
              </div>
              {CONTENT.contrasts.map((c, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 gap-px bg-[#e2e2e2]"
                >
                  <div className="bg-white px-6 py-6">
                    <p className="text-sm text-[#aaa] line-through leading-relaxed">{c.not}</p>
                  </div>
                  <div className="bg-white px-6 py-6">
                    <p className="text-sm text-[#111] leading-relaxed font-medium">{c.instead}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className={`${rule} bg-[#f9f9f9]`}>
        <div className="max-w-[1080px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-x-8 items-center">
            <div className="lg:col-span-3">
              <span className={`${sectionIndex}`}>05 / 09</span>
            </div>
            <div className="lg:col-span-9 flex flex-wrap gap-3">
              {CONTENT.trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="border border-[#e2e2e2] px-5 py-2 font-mono text-[10px] tracking-[0.16em] uppercase text-[#111] bg-white"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BUILT BY ── */}
      <section className={`${rule}`}>
        <div className="max-w-[1080px] mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-4 lg:gap-x-8">
            <div className="lg:col-span-3">
              <span className={`${sectionIndex}`}>06 / 09</span>
            </div>
            <div className="lg:col-span-9">
              <span className={`${kicker} block mb-3`}>{CONTENT.builtBy.label}</span>
              <h2 className="text-[clamp(1.4rem,3vw,2.2rem)] font-medium leading-tight tracking-[-0.02em] max-w-xl">
                {CONTENT.builtBy.heading}
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section className={`${rule} bg-[#111]`}>
        <div className="max-w-[1080px] mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-8">
            <div className="lg:col-span-3">
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#555]">
                07 / 09
              </span>
            </div>
            <div className="lg:col-span-9">
              <h2 className="text-[clamp(2rem,5vw,4rem)] font-medium leading-tight tracking-[-0.025em] text-white mb-4">
                {CONTENT.closingCta.title}
              </h2>
              <p className="text-sm text-[#888] mb-10 font-mono tracking-wide">
                {CONTENT.closingCta.subtitle}
              </p>
              <a
                href={CONTENT.closingCta.href}
                className="inline-flex items-center gap-2 bg-[#1A4BFF] text-white text-sm font-mono tracking-[0.12em] uppercase px-7 py-4 hover:bg-[#0035e0] transition-colors"
              >
                {CONTENT.closingCta.button}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#2a2a2a] bg-[#111]">
        <div className="max-w-[1080px] mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <span className="font-medium text-sm text-white tracking-tight">{CONTENT.footer.brand}</span>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {CONTENT.footer.links.map((link) => (
              <span
                key={link}
                className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#555] hover:text-[#888] cursor-pointer transition-colors"
              >
                {link}
              </span>
            ))}
          </nav>
          <p className="text-[11px] text-[#444] font-mono leading-snug md:text-right max-w-xs">
            {CONTENT.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}

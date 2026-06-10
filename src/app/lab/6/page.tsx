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
  title: "Cinematic Spotlight — Endeavrly",
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

// ─── Timeline steps are always the three journey lenses ───────────────────────
const TIMELINE_STEPS = CONTENT.framework.lenses;

export default function CinematicSpotlightPage() {
  return (
    <>
      {/* ── Keyframes + reduced-motion guard ─────────────────────────────────── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.55; }
          50%       { opacity: 0.80; }
        }
        .reveal {
          opacity: 0;
          animation: fadeUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal, .glow-pulse { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      {/* ── Root shell ───────────────────────────────────────────────────────── */}
      <div
        className="relative min-h-screen overflow-x-hidden"
        style={{ backgroundColor: "#05070A", color: "#F5F0E8" }}
      >
        {/* ── Fixed vignette overlay ──────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,176,55,0.07) 0%, transparent 70%), " +
              "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.72) 100%)",
          }}
        />

        {/* ────────────────────────────────────────────────────────────────────
            1. NAV
        ──────────────────────────────────────────────────────────────────── */}
        <header
          className="reveal relative z-10 flex items-center justify-between px-6 py-5 md:px-12"
          style={{ animationDelay: "0ms" }}
        >
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: "#F5F0E8", letterSpacing: "-0.01em" }}
          >
            {CONTENT.brand}
          </span>

          <div className="flex items-center gap-4">
            <span
              className="hidden rounded-full px-3 py-1 text-xs font-medium sm:inline-block"
              style={{
                background: "rgba(245,176,55,0.12)",
                color: "#F5B437",
                border: "1px solid rgba(245,176,55,0.25)",
              }}
            >
              {CONTENT.ageLabel}
            </span>
            <a
              href={CONTENT.primaryCta.href}
              className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{
                background: "rgba(245,176,55,0.15)",
                color: "#F5B437",
                border: "1px solid rgba(245,176,55,0.30)",
              }}
            >
              {CONTENT.primaryCta.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </header>

        {/* ────────────────────────────────────────────────────────────────────
            2. HERO
        ──────────────────────────────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto max-w-3xl px-6 pb-32 pt-24 text-center md:pt-36">
          {/* Spotlight glow behind headline */}
          <div
            aria-hidden="true"
            className="glow-pulse pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/4 rounded-full blur-[96px]"
            style={{
              background: "radial-gradient(circle, rgba(245,176,55,0.18) 0%, transparent 70%)",
              animation: "glowPulse 4s ease-in-out infinite",
            }}
          />

          <p
            className="reveal mb-6 text-sm font-semibold uppercase tracking-[0.18em]"
            style={{ animationDelay: "80ms", color: "#F5B437" }}
          >
            {CONTENT.tagline}
          </p>

          <h1
            className="reveal mb-6 text-[clamp(2.6rem,8vw,5.5rem)] font-extrabold leading-[1.04] tracking-tight"
            style={{ animationDelay: "180ms", color: "#F5F0E8" }}
          >
            {CONTENT.headline}
          </h1>

          <p
            className="reveal mx-auto mb-8 max-w-xl text-xl font-light leading-relaxed"
            style={{ animationDelay: "280ms", color: "rgba(245,240,232,0.70)" }}
          >
            {CONTENT.subhead}
          </p>

          {/* Problem */}
          <p
            className="reveal mx-auto mb-6 max-w-2xl text-base leading-relaxed"
            style={{ animationDelay: "360ms", color: "rgba(245,240,232,0.55)" }}
          >
            {CONTENT.problem}
          </p>

          {/* Divider */}
          <div
            className="reveal mx-auto mb-6 h-px w-24"
            style={{ animationDelay: "420ms", background: "rgba(245,176,55,0.30)" }}
          />

          {/* Solution */}
          <p
            className="reveal mx-auto mb-12 max-w-2xl text-base leading-relaxed"
            style={{ animationDelay: "480ms", color: "rgba(245,240,232,0.75)" }}
          >
            {CONTENT.solution}
          </p>

          {/* CTA */}
          <a
            href={CONTENT.primaryCta.href}
            className="reveal inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold transition-all hover:scale-[1.03] hover:brightness-110"
            style={{
              animationDelay: "560ms",
              background: "linear-gradient(135deg, #F5B437 0%, #E8962A 100%)",
              color: "#05070A",
              boxShadow: "0 0 32px rgba(245,176,55,0.28)",
            }}
          >
            {CONTENT.primaryCta.label}
            <ArrowRight className="h-4 w-4" />
          </a>
        </section>

        {/* ────────────────────────────────────────────────────────────────────
            3. FRAMEWORK
        ──────────────────────────────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto max-w-2xl px-6 pb-32 text-center">
          <p
            className="reveal mb-2 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ animationDelay: "620ms", color: "#F5B437" }}
          >
            The framework
          </p>
          <h2
            className="reveal mb-4 text-3xl font-bold tracking-tight md:text-4xl"
            style={{ animationDelay: "680ms" }}
          >
            {CONTENT.framework.title}
          </h2>
          <p
            className="reveal mx-auto mb-16 max-w-lg text-base leading-relaxed"
            style={{ animationDelay: "740ms", color: "rgba(245,240,232,0.60)" }}
          >
            {CONTENT.framework.subtitle}
          </p>

          <div className="flex flex-col gap-10 md:flex-row md:gap-8">
            {CONTENT.framework.lenses.map((lens, i) => {
              const Icon = ICONS[lens.icon] ?? Compass;
              return (
                <div
                  key={lens.name}
                  className="reveal flex flex-col items-center text-center"
                  style={{ animationDelay: `${800 + i * 100}ms` }}
                >
                  <div
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(245,176,55,0.10)",
                      border: "1px solid rgba(245,176,55,0.22)",
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: "#F5B437" }} />
                  </div>
                  <p
                    className="mb-1 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#F5B437" }}
                  >
                    {lens.name}
                  </p>
                  <p className="mb-3 text-lg font-semibold">{lens.tagline}</p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(245,240,232,0.55)" }}
                  >
                    {lens.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────────
            4. FEATURES
        ──────────────────────────────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto max-w-2xl px-6 pb-32">
          <p
            className="reveal mb-2 text-center text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ animationDelay: "1100ms", color: "#F5B437" }}
          >
            What&apos;s inside
          </p>
          <h2
            className="reveal mb-16 text-center text-3xl font-bold tracking-tight md:text-4xl"
            style={{ animationDelay: "1160ms" }}
          >
            Every tool you need. Nothing you don&apos;t.
          </h2>

          <div className="flex flex-col gap-8">
            {CONTENT.features.map((feat, i) => {
              const Icon = ICONS[feat.icon] ?? Compass;
              return (
                <div
                  key={feat.title}
                  className="reveal flex gap-5"
                  style={{ animationDelay: `${1220 + i * 90}ms` }}
                >
                  <div
                    className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: "rgba(245,176,55,0.09)",
                      border: "1px solid rgba(245,176,55,0.18)",
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: "#F5B437" }} />
                  </div>
                  <div>
                    <p className="mb-1 font-semibold">{feat.title}</p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "rgba(245,240,232,0.55)" }}
                    >
                      {feat.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────────
            5. TIMELINE
        ──────────────────────────────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto max-w-2xl px-6 pb-32 text-center">
          <span
            className="reveal mb-6 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              animationDelay: "1700ms",
              background: "rgba(245,176,55,0.12)",
              color: "#F5B437",
              border: "1px solid rgba(245,176,55,0.25)",
            }}
          >
            {CONTENT.timeline.badge}
          </span>
          <h2
            className="reveal mb-4 text-3xl font-bold tracking-tight md:text-4xl"
            style={{ animationDelay: "1760ms" }}
          >
            {CONTENT.timeline.title}
          </h2>
          <p
            className="reveal mx-auto mb-16 max-w-lg text-base leading-relaxed"
            style={{ animationDelay: "1820ms", color: "rgba(245,240,232,0.60)" }}
          >
            {CONTENT.timeline.subtitle}
          </p>

          {/* Step chain */}
          <div className="relative flex flex-col items-center gap-0">
            {TIMELINE_STEPS.map((step, i) => {
              const Icon = ICONS[step.icon] ?? Compass;
              const isLast = i === TIMELINE_STEPS.length - 1;
              return (
                <div key={step.name} className="flex w-full flex-col items-center">
                  <div
                    className="reveal flex w-full max-w-sm flex-col items-center rounded-2xl px-8 py-7 text-center"
                    style={{
                      animationDelay: `${1880 + i * 120}ms`,
                      background: "rgba(245,240,232,0.04)",
                      border: "1px solid rgba(245,176,55,0.14)",
                    }}
                  >
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                      style={{
                        background: "rgba(245,176,55,0.12)",
                        border: "1px solid rgba(245,176,55,0.28)",
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: "#F5B437" }} />
                    </div>
                    <p
                      className="mb-1 text-xs font-bold uppercase tracking-[0.16em]"
                      style={{ color: "#F5B437" }}
                    >
                      {step.name}
                    </p>
                    <p className="font-semibold">{step.tagline}</p>
                  </div>
                  {!isLast && (
                    <div
                      className="h-8 w-px"
                      style={{ background: "rgba(245,176,55,0.22)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────────
            6. CONTRAST
        ──────────────────────────────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto max-w-2xl px-6 pb-32 text-center">
          <h2
            className="reveal mb-16 text-3xl font-bold tracking-tight md:text-4xl"
            style={{ animationDelay: "2200ms" }}
          >
            {CONTENT.contrastTitle}
          </h2>

          <div className="flex flex-col gap-10">
            {CONTENT.contrasts.map((c, i) => (
              <div
                key={i}
                className="reveal flex flex-col gap-3"
                style={{ animationDelay: `${2260 + i * 100}ms` }}
              >
                {/* NOT */}
                <p
                  className="text-sm line-through"
                  style={{ color: "rgba(245,240,232,0.28)" }}
                >
                  {c.not}
                </p>
                {/* Connector */}
                <div
                  className="mx-auto h-5 w-px"
                  style={{ background: "rgba(245,176,55,0.25)" }}
                />
                {/* INSTEAD */}
                <p className="text-base font-medium" style={{ color: "#F5F0E8" }}>
                  {c.instead}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────────
            7. TRUST BADGES
        ──────────────────────────────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto max-w-2xl px-6 pb-32">
          <div className="reveal flex flex-wrap justify-center gap-3" style={{ animationDelay: "2560ms" }}>
            {CONTENT.trustBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full px-5 py-2 text-sm font-medium"
                style={{
                  background: "rgba(245,240,232,0.05)",
                  color: "rgba(245,240,232,0.75)",
                  border: "1px solid rgba(245,240,232,0.10)",
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────────
            8. BUILT BY
        ──────────────────────────────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto max-w-xl px-6 pb-32 text-center">
          <p
            className="reveal mb-2 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ animationDelay: "2640ms", color: "rgba(245,240,232,0.35)" }}
          >
            {CONTENT.builtBy.label}
          </p>
          <p
            className="reveal text-2xl font-bold"
            style={{ animationDelay: "2700ms" }}
          >
            {CONTENT.builtBy.heading}
          </p>
        </section>

        {/* ────────────────────────────────────────────────────────────────────
            9. CLOSING CTA
        ──────────────────────────────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto max-w-xl px-6 pb-36 text-center">
          {/* Glow behind closing CTA */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
            style={{ background: "radial-gradient(circle, rgba(245,176,55,0.12) 0%, transparent 70%)" }}
          />

          <h2
            className="reveal mb-4 text-[clamp(2.2rem,7vw,4rem)] font-extrabold leading-tight tracking-tight"
            style={{ animationDelay: "2780ms" }}
          >
            {CONTENT.closingCta.title}
          </h2>
          <p
            className="reveal mb-10 text-base"
            style={{ animationDelay: "2840ms", color: "rgba(245,240,232,0.55)" }}
          >
            {CONTENT.closingCta.subtitle}
          </p>
          <a
            href={CONTENT.closingCta.href}
            className="reveal inline-flex items-center gap-2 rounded-full px-9 py-4 text-base font-semibold transition-all hover:scale-[1.03] hover:brightness-110"
            style={{
              animationDelay: "2900ms",
              background: "linear-gradient(135deg, #F5B437 0%, #E8962A 100%)",
              color: "#05070A",
              boxShadow: "0 0 40px rgba(245,176,55,0.24)",
            }}
          >
            {CONTENT.closingCta.button}
            <ArrowRight className="h-4 w-4" />
          </a>
        </section>

        {/* ────────────────────────────────────────────────────────────────────
            10. FOOTER
        ──────────────────────────────────────────────────────────────────── */}
        <footer
          className="relative z-10 border-t px-6 py-12 text-center"
          style={{ borderColor: "rgba(245,240,232,0.08)" }}
        >
          <p className="mb-6 text-lg font-bold" style={{ color: "#F5F0E8" }}>
            {CONTENT.footer.brand}
          </p>
          <nav className="mb-6 flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="Footer">
            {CONTENT.footer.links.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: "rgba(245,240,232,0.40)" }}
              >
                {link}
              </a>
            ))}
          </nav>
          <p className="text-xs" style={{ color: "rgba(245,240,232,0.25)" }}>
            {CONTENT.footer.copyright}
          </p>
        </footer>
      </div>
    </>
  );
}

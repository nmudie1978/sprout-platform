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
  title: "Soft Aurora — Endeavrly",
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

export default function SoftAuroraPage() {
  return (
    <>
      <style>{`
        @keyframes aurora-1 {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(60px, -40px) scale(1.08); }
          66%  { transform: translate(-30px, 50px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes aurora-2 {
          0%   { transform: translate(0px, 0px) scale(1); }
          40%  { transform: translate(-70px, 30px) scale(1.12); }
          70%  { transform: translate(40px, -60px) scale(0.92); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes aurora-3 {
          0%   { transform: translate(0px, 0px) scale(1); }
          50%  { transform: translate(50px, 50px) scale(1.06); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .aurora-1 {
          animation: aurora-1 22s ease-in-out infinite;
        }
        .aurora-2 {
          animation: aurora-2 28s ease-in-out infinite;
        }
        .aurora-3 {
          animation: aurora-3 18s ease-in-out infinite;
        }
        .headline-glow {
          text-shadow: 0 0 60px rgba(45, 212, 191, 0.35), 0 0 120px rgba(45, 212, 191, 0.15);
        }
        @media (prefers-reduced-motion: reduce) {
          .aurora-1, .aurora-2, .aurora-3 {
            animation: none;
          }
        }
      `}</style>

      <div
        className="relative min-h-screen overflow-x-hidden"
        style={{ backgroundColor: "#0A0E14", color: "#E2E8F0" }}
      >
        {/* ── Aurora background ── */}
        <div
          className="pointer-events-none fixed inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="aurora-1 absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-3xl opacity-30"
            style={{
              background:
                "radial-gradient(circle at center, #2DD4BF 0%, #0891B2 40%, transparent 70%)",
            }}
          />
          <div
            className="aurora-2 absolute top-1/3 -right-60 h-[700px] w-[700px] rounded-full blur-3xl opacity-20"
            style={{
              background:
                "radial-gradient(circle at center, #7C3AED 0%, #4F46E5 40%, transparent 70%)",
            }}
          />
          <div
            className="aurora-3 absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full blur-3xl opacity-20"
            style={{
              background:
                "radial-gradient(circle at center, #10B981 0%, #059669 50%, transparent 70%)",
            }}
          />
        </div>

        {/* ── 1. Nav ── */}
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span
            className="text-xl font-semibold tracking-tight"
            style={{ color: "#2DD4BF" }}
          >
            {CONTENT.brand}
          </span>
          <div className="flex items-center gap-4">
            <span
              className="hidden rounded-full border px-3 py-1 text-xs font-medium sm:inline-block"
              style={{
                borderColor: "rgba(45,212,191,0.3)",
                color: "rgba(45,212,191,0.9)",
                backgroundColor: "rgba(45,212,191,0.07)",
              }}
            >
              {CONTENT.ageLabel}
            </span>
            <a
              href={CONTENT.primaryCta.href}
              className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "#2DD4BF",
                color: "#0A0E14",
              }}
            >
              {CONTENT.primaryCta.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </header>

        {/* ── 2. Hero ── */}
        <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-20 text-center">
          <p
            className="mb-6 text-sm font-medium uppercase tracking-[0.18em]"
            style={{ color: "rgba(45,212,191,0.75)" }}
          >
            {CONTENT.tagline}
          </p>
          <h1
            className="headline-glow mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
            style={{ color: "#F8FAFC" }}
          >
            {CONTENT.headline}
          </h1>
          <p
            className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed"
            style={{ color: "rgba(226,232,240,0.7)" }}
          >
            {CONTENT.subhead}
          </p>

          {/* Glass card holding problem/solution */}
          <div
            className="mx-auto mb-12 max-w-2xl rounded-2xl border p-8 text-left backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.08)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <p
              className="mb-5 text-base leading-relaxed"
              style={{ color: "rgba(226,232,240,0.6)" }}
            >
              {CONTENT.problem}
            </p>
            <p
              className="text-base leading-relaxed"
              style={{ color: "rgba(226,232,240,0.85)" }}
            >
              {CONTENT.solution}
            </p>
          </div>

          <a
            href={CONTENT.primaryCta.href}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold transition-all hover:scale-105 hover:opacity-90"
            style={{
              backgroundColor: "#2DD4BF",
              color: "#0A0E14",
              boxShadow: "0 0 30px rgba(45,212,191,0.4)",
            }}
          >
            {CONTENT.primaryCta.label}
            <ArrowRight className="h-4 w-4" />
          </a>
        </section>

        {/* ── 3. Framework ── */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
          <div className="mb-14 text-center">
            <h2
              className="mb-3 text-3xl font-bold sm:text-4xl"
              style={{ color: "#F8FAFC" }}
            >
              {CONTENT.framework.title}
            </h2>
            <p
              className="mx-auto max-w-xl text-base leading-relaxed"
              style={{ color: "rgba(226,232,240,0.6)" }}
            >
              {CONTENT.framework.subtitle}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {CONTENT.framework.lenses.map((lens, i) => {
              const Icon = ICONS[lens.icon] ?? Compass;
              return (
                <div
                  key={lens.name}
                  className="group rounded-2xl border p-8 backdrop-blur-sm transition-all hover:border-teal-500/30"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(45,212,191,0.1)" }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: "#2DD4BF" }}
                    />
                  </div>
                  <div
                    className="mb-1 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "rgba(45,212,191,0.7)" }}
                  >
                    Step {i + 1}
                  </div>
                  <h3
                    className="mb-1 text-xl font-bold"
                    style={{ color: "#F8FAFC" }}
                  >
                    {lens.name}
                  </h3>
                  <p
                    className="mb-3 text-sm font-medium"
                    style={{ color: "rgba(45,212,191,0.8)" }}
                  >
                    {lens.tagline}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(226,232,240,0.6)" }}
                  >
                    {lens.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. Features ── */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
          <h2
            className="mb-12 text-center text-3xl font-bold sm:text-4xl"
            style={{ color: "#F8FAFC" }}
          >
            Everything you need. Nothing you don&apos;t.
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CONTENT.features.map((feat) => {
              const Icon = ICONS[feat.icon] ?? Compass;
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl border p-7 backdrop-blur-sm"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "rgba(45,212,191,0.1)" }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: "#2DD4BF" }}
                    />
                  </div>
                  <h3
                    className="mb-2 text-base font-semibold"
                    style={{ color: "#F8FAFC" }}
                  >
                    {feat.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(226,232,240,0.6)" }}
                  >
                    {feat.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 5. Timeline ── */}
        <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
          <div
            className="rounded-3xl border p-12 text-center backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(45,212,191,0.05)",
              borderColor: "rgba(45,212,191,0.15)",
              boxShadow:
                "0 0 60px rgba(45,212,191,0.08), inset 0 1px 0 rgba(45,212,191,0.1)",
            }}
          >
            <span
              className="mb-5 inline-block rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{
                borderColor: "rgba(45,212,191,0.3)",
                color: "#2DD4BF",
                backgroundColor: "rgba(45,212,191,0.08)",
              }}
            >
              {CONTENT.timeline.badge}
            </span>
            <h2
              className="mb-4 text-3xl font-bold sm:text-4xl"
              style={{ color: "#F8FAFC" }}
            >
              {CONTENT.timeline.title}
            </h2>
            <p
              className="mx-auto mb-10 max-w-lg text-base leading-relaxed"
              style={{ color: "rgba(226,232,240,0.6)" }}
            >
              {CONTENT.timeline.subtitle}
            </p>
            {/* Progression bar */}
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {["Discover", "Understand", "Clarity"].map((step, i) => (
                <div key={step} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                      style={{
                        backgroundColor:
                          i === 2
                            ? "#2DD4BF"
                            : "rgba(45,212,191,0.15)",
                        color: i === 2 ? "#0A0E14" : "#2DD4BF",
                        boxShadow:
                          i === 2
                            ? "0 0 20px rgba(45,212,191,0.5)"
                            : undefined,
                      }}
                    >
                      {i + 1}
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{
                        color:
                          i === 2
                            ? "#2DD4BF"
                            : "rgba(226,232,240,0.6)",
                      }}
                    >
                      {step}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className="mb-4 h-px w-10 sm:w-16"
                      style={{ backgroundColor: "rgba(45,212,191,0.2)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. Contrast ── */}
        <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
          <h2
            className="mb-12 text-center text-3xl font-bold sm:text-4xl"
            style={{ color: "#F8FAFC" }}
          >
            {CONTENT.contrastTitle}
          </h2>
          <div className="grid gap-5">
            {CONTENT.contrasts.map((c) => (
              <div
                key={c.not}
                className="grid gap-4 rounded-2xl border p-7 backdrop-blur-sm sm:grid-cols-2"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold uppercase"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.06)",
                      color: "rgba(226,232,240,0.35)",
                    }}
                  >
                    Not
                  </span>
                  <p
                    className="text-sm leading-relaxed line-through decoration-white/20"
                    style={{ color: "rgba(226,232,240,0.35)" }}
                  >
                    {c.not}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold uppercase"
                    style={{
                      backgroundColor: "rgba(45,212,191,0.1)",
                      color: "#2DD4BF",
                    }}
                  >
                    Instead
                  </span>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(226,232,240,0.85)" }}
                  >
                    {c.instead}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. Trust badges ── */}
        <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
          <div className="flex flex-wrap justify-center gap-3">
            {CONTENT.trustBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border px-5 py-2 text-sm font-medium"
                style={{
                  borderColor: "rgba(45,212,191,0.2)",
                  color: "rgba(45,212,191,0.9)",
                  backgroundColor: "rgba(45,212,191,0.06)",
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </section>

        {/* ── 8. Built by ── */}
        <section className="relative z-10 mx-auto max-w-2xl px-6 pb-24 text-center">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "rgba(226,232,240,0.4)" }}
          >
            {CONTENT.builtBy.label}
          </p>
          <p
            className="text-xl font-medium leading-snug"
            style={{ color: "rgba(226,232,240,0.7)" }}
          >
            {CONTENT.builtBy.heading}
          </p>
        </section>

        {/* ── 9. Closing CTA ── */}
        <section className="relative z-10 mx-auto max-w-2xl px-6 pb-32 text-center">
          <div
            className="rounded-3xl border p-14 backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.08)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 80px rgba(45,212,191,0.06)",
            }}
          >
            <h2
              className="headline-glow mb-3 text-4xl font-bold sm:text-5xl"
              style={{ color: "#F8FAFC" }}
            >
              {CONTENT.closingCta.title}
            </h2>
            <p
              className="mb-8 text-base"
              style={{ color: "rgba(226,232,240,0.55)" }}
            >
              {CONTENT.closingCta.subtitle}
            </p>
            <a
              href={CONTENT.closingCta.href}
              className="inline-flex items-center gap-2 rounded-full px-9 py-3.5 text-base font-semibold transition-all hover:scale-105 hover:opacity-90"
              style={{
                backgroundColor: "#2DD4BF",
                color: "#0A0E14",
                boxShadow: "0 0 40px rgba(45,212,191,0.45)",
              }}
            >
              {CONTENT.closingCta.button}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* ── 10. Footer ── */}
        <footer
          className="relative z-10 border-t px-6 py-10"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <span
              className="text-lg font-semibold"
              style={{ color: "#2DD4BF" }}
            >
              {CONTENT.footer.brand}
            </span>
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {CONTENT.footer.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm transition-colors hover:text-white/80"
                  style={{ color: "rgba(226,232,240,0.4)" }}
                >
                  {link}
                </a>
              ))}
            </nav>
            <p
              className="text-xs"
              style={{ color: "rgba(226,232,240,0.3)" }}
            >
              {CONTENT.footer.copyright}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

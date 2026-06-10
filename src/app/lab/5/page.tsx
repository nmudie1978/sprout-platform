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
  title: "Bento Grid — Endeavrly",
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

// ─── Tile wrapper ─────────────────────────────────────────────────────────────
function Tile({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-white/[0.04] p-6",
        "transition-transform duration-200 hover:-translate-y-0.5",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

// ─── Accent pill ──────────────────────────────────────────────────────────────
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-0.5 text-xs font-medium tracking-wide text-teal-300">
      {children}
    </span>
  );
}

export default function BentoGridPage() {
  const C = CONTENT;

  return (
    <div
      className="min-h-screen w-full text-white antialiased"
      style={{ backgroundColor: "#0B0F17" }}
    >
      {/* ── 1. NAV ─────────────────────────────────────────────────────────── */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <span className="text-lg font-semibold tracking-tight text-white">
          {C.brand}
        </span>
        <div className="flex items-center gap-4">
          <Pill>{C.ageLabel}</Pill>
          <a
            href={C.primaryCta.href}
            className="inline-flex items-center gap-1.5 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {C.primaryCta.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </nav>

      {/* ── MAIN BENTO ────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-5 pb-20">
        {/* ── 2. HERO TILE ────────────────────────────────────────────────── */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <Tile className="lg:col-span-3 lg:row-span-2 flex flex-col justify-between gap-8 rounded-3xl bg-gradient-to-br from-teal-950/60 to-white/[0.03] p-8 sm:p-12">
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-teal-400">
                {C.tagline}
              </p>
              <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {C.headline}
              </h1>
              <p className="mb-6 max-w-xl text-lg text-white/70">{C.subhead}</p>
              <p className="mb-3 max-w-xl text-sm leading-relaxed text-white/50">
                {C.problem}
              </p>
              <p className="max-w-xl text-sm leading-relaxed text-teal-300/80">
                {C.solution}
              </p>
            </div>
            <a
              href={C.primaryCta.href}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {C.primaryCta.label}
              <ArrowRight className="h-4 w-4" />
            </a>
          </Tile>

          {/* Tagline side tile */}
          <Tile className="flex flex-col justify-center gap-2 rounded-3xl bg-teal-500/10">
            <Sparkles className="h-7 w-7 text-teal-400" />
            <p className="text-base font-semibold leading-snug text-white">
              Free. No credit card.
              <br />
              No commitments.
            </p>
            <p className="text-sm text-white/50">
              Your exploration stays private to you — always.
            </p>
          </Tile>

          {/* Trust badges tile */}
          <Tile className="flex flex-col justify-center gap-3 rounded-3xl">
            {C.trustBadges.map((b) => (
              <span
                key={b}
                className="flex items-center gap-2 text-sm text-white/70"
              >
                <ShieldCheck className="h-4 w-4 flex-shrink-0 text-teal-400" />
                {b}
              </span>
            ))}
          </Tile>
        </div>

        {/* ── 3. FRAMEWORK ────────────────────────────────────────────────── */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Title tile — spans 1 col on lg */}
          <Tile className="flex flex-col justify-center gap-2 sm:col-span-2 lg:col-span-1 rounded-3xl bg-white/[0.02]">
            <h2 className="text-xl font-bold text-white">{C.framework.title}</h2>
            <p className="text-sm leading-relaxed text-white/55">
              {C.framework.subtitle}
            </p>
          </Tile>

          {/* 3 lens tiles */}
          {C.framework.lenses.map((lens, i) => {
            const Icon = ICONS[lens.icon] ?? Compass;
            const accent = i === 0 ? "text-teal-400" : i === 1 ? "text-emerald-400" : "text-cyan-400";
            const bg = i === 0 ? "bg-teal-400/10" : i === 1 ? "bg-emerald-400/10" : "bg-cyan-400/10";
            return (
              <Tile key={lens.name} className="flex flex-col gap-3 rounded-3xl">
                <div className={`w-fit rounded-xl p-2 ${bg}`}>
                  <Icon className={`h-5 w-5 ${accent}`} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                  Step {i + 1}
                </p>
                <p className="text-base font-bold text-white">{lens.name}</p>
                <p className="text-xs text-teal-300/80">{lens.tagline}</p>
                <p className="text-sm leading-relaxed text-white/55">{lens.body}</p>
              </Tile>
            );
          })}
        </div>

        {/* ── 4. FEATURES ─────────────────────────────────────────────────── */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {C.features.map((feat, i) => {
            const Icon = ICONS[feat.icon] ?? Compass;
            // Last feature spans 2 cols on lg to fill the row nicely (5 items → 3+2)
            const span = i === 3 ? "lg:col-span-2" : "";
            return (
              <Tile key={feat.title} className={`flex flex-col gap-3 ${span}`}>
                <div className="w-fit rounded-xl bg-teal-400/10 p-2">
                  <Icon className="h-5 w-5 text-teal-400" />
                </div>
                <p className="text-base font-semibold text-white">{feat.title}</p>
                <p className="text-sm leading-relaxed text-white/55">{feat.body}</p>
              </Tile>
            );
          })}
        </div>

        {/* ── 5. TIMELINE ─────────────────────────────────────────────────── */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <Tile className="lg:col-span-2 rounded-3xl flex flex-col gap-6 bg-gradient-to-br from-emerald-950/50 to-white/[0.02]">
            <Pill>{C.timeline.badge}</Pill>
            <h2 className="text-2xl font-bold text-white">{C.timeline.title}</h2>
            <p className="text-sm leading-relaxed text-white/55">
              {C.timeline.subtitle}
            </p>
            {/* Visual step trail */}
            <div className="flex flex-col gap-3">
              {["Discover", "Understand", "Clarity"].map((step, i) => {
                const Icon = [Compass, BookOpen, Sparkles][i];
                const label = [
                  "Explore a career path",
                  "Understand the reality",
                  "See your full timeline",
                ][i];
                return (
                  <div key={step} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/20">
                      <Icon className="h-4 w-4 text-teal-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{step}</p>
                      <p className="text-xs text-white/45">{label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Tile>

          {/* ── 6. CONTRAST ─────────────────────────────────────────────── */}
          <Tile className="lg:col-span-2 rounded-3xl flex flex-col gap-5">
            <h2 className="text-xl font-bold text-white">{C.contrastTitle}</h2>
            {C.contrasts.map((ct, i) => (
              <div key={i} className="border-t border-white/[0.07] pt-4">
                <p className="mb-1.5 text-sm text-white/30 line-through">
                  {ct.not}
                </p>
                <p className="text-sm font-medium text-teal-300">{ct.instead}</p>
              </div>
            ))}
          </Tile>
        </div>

        {/* ── 7. TRUST + 8. BUILT-BY ──────────────────────────────────────── */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Trust badges — 4 mini tiles */}
          {C.trustBadges.map((b) => (
            <Tile
              key={b}
              className="flex items-center justify-center gap-2 rounded-2xl py-5 text-center text-sm font-semibold text-teal-300"
            >
              <ShieldCheck className="h-4 w-4 flex-shrink-0 text-teal-400" />
              {b}
            </Tile>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <Tile className="lg:col-span-2 rounded-3xl flex flex-col justify-center gap-3">
            <p className="text-xs font-medium uppercase tracking-widest text-white/35">
              {C.builtBy.label}
            </p>
            <h2 className="text-xl font-bold text-white">{C.builtBy.heading}</h2>
            <p className="text-sm leading-relaxed text-white/50">
              Endeavrly was designed and built by one person who cares about
              giving young people honest, useful tools — not another engagement
              loop.
            </p>
          </Tile>

          {/* ── 9. CLOSING CTA ────────────────────────────────────────────── */}
          <Tile className="lg:col-span-2 rounded-3xl flex flex-col justify-between gap-5 bg-gradient-to-br from-teal-600/25 to-emerald-600/10">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-white">
                {C.closingCta.title}
              </h2>
              <p className="text-sm text-white/60">{C.closingCta.subtitle}</p>
            </div>
            <a
              href={C.closingCta.href}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {C.closingCta.button}
              <ArrowRight className="h-4 w-4" />
            </a>
          </Tile>
        </div>
      </main>

      {/* ── 10. FOOTER ──────────────────────────────────────────────────────── */}
      <footer
        className="border-t border-white/[0.07] px-5 py-8"
        style={{ backgroundColor: "#080C12" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 sm:flex-row sm:justify-between">
          <span className="text-base font-semibold text-white">
            {C.footer.brand}
          </span>
          <nav
            aria-label="Footer"
            className="flex flex-wrap justify-center gap-x-5 gap-y-2"
          >
            {C.footer.links.map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs text-white/40 transition-colors hover:text-white/70"
              >
                {link}
              </a>
            ))}
          </nav>
          <p className="text-xs text-white/30">{C.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}

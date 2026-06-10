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
  title: "Journey Spine — Endeavrly",
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

// ─── Palette ────────────────────────────────────────────────────────────────
// bg:      #F7F4EF  (warm off-white paper)
// text:    #24211D  (near-black warm)
// teal:    #12837E  (accent / spine colour)
// tealLt:  #E3F3F2  (teal wash for node rings)
// muted:   #24211D at low opacity
// ─────────────────────────────────────────────────────────────────────────────

export default function JourneySpinePage() {
  const lenses = CONTENT.framework.lenses;

  return (
    <>
      {/* ── Global styles: keyframes + spine layout helpers ── */}
      <style>{`
        :root {
          --spine: #12837E;
          --bg: #F7F4EF;
          --text: #24211D;
          --teal-lt: #E3F3F2;
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-0 { animation: fadeSlide 0.65s 0.05s ease both; }
        .anim-1 { animation: fadeSlide 0.65s 0.15s ease both; }
        .anim-2 { animation: fadeSlide 0.65s 0.25s ease both; }
        .anim-3 { animation: fadeSlide 0.65s 0.35s ease both; }

        /*
          Spine layout:
          Mobile  → spine is a 2px line flush-left at 20px from left edge.
          Desktop → spine is a 2px line centred in the page column.

          Each node is a circle centred ON the spine line.
          Content alternates L / R of the spine on desktop.
        */

        .spine-wrap {
          position: relative;
        }

        /* The continuous vertical line */
        .spine-wrap::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 20px;
          width: 2px;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            #12837E 4%,
            #12837E 96%,
            transparent 100%
          );
          z-index: 0;
        }

        @media (min-width: 768px) {
          .spine-wrap::before {
            left: 50%;
            transform: translateX(-50%);
          }
        }

        /* A single spine stop — contains the node circle + content */
        .spine-stop {
          position: relative;
          display: flex;
          align-items: flex-start;
          padding-left: 52px;    /* mobile: content right of left-rail spine */
          padding-bottom: 64px;
          z-index: 1;
        }

        @media (min-width: 768px) {
          .spine-stop {
            padding-left: 0;
            padding-bottom: 72px;
            justify-content: center;
          }
        }

        /* The circular node marker */
        .spine-node {
          position: absolute;
          left: 8px;             /* (20px spine - 12px half-node) = 8px */
          top: 0;
          width: 24px;
          height: 24px;
          border-radius: 9999px;
          background: var(--bg);
          border: 2px solid var(--spine);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .spine-node {
            left: 50%;
            transform: translateX(-50%);
          }
        }

        /* Larger milestone node (for lens stops) */
        .spine-node--lg {
          width: 40px;
          height: 40px;
          left: 0;               /* (20px - 20px half-node) = 0 */
          background: var(--teal-lt);
          border-width: 2px;
        }

        @media (min-width: 768px) {
          .spine-node--lg {
            left: 50%;
            transform: translateX(-50%);
          }
        }

        /* On desktop: even stops go left, odd stops go right */
        .spine-card {
          width: 100%;
          max-width: 420px;
        }

        @media (min-width: 768px) {
          /* Even stops: card sits to the LEFT of the spine */
          .spine-stop--left .spine-card {
            margin-right: calc(50% + 36px);
            text-align: right;
          }
          /* Odd stops: card sits to the RIGHT of the spine */
          .spine-stop--right .spine-card {
            margin-left: calc(50% + 36px);
            text-align: left;
          }
          /* Full-width stops (e.g. the nav hero) override alignment */
          .spine-stop--full .spine-card {
            max-width: none;
            width: 100%;
            text-align: center;
          }
        }

        /* Larger padding-top for milestone nodes */
        .spine-stop--milestone {
          padding-top: 4px;
        }

        @media (min-width: 768px) {
          .spine-stop--milestone {
            padding-top: 8px;
          }
        }

        /* Hover lift on feature / contrast cards */
        .card-lift {
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .card-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(18, 131, 126, 0.10);
        }
      `}</style>

      <div className="min-h-screen bg-[#F7F4EF] text-[#24211D]">

        {/* ══════════════════════════════════════════════════
            TOP ACCENT BAR
        ══════════════════════════════════════════════════ */}
        <div className="h-[3px] bg-[#12837E]" />

        {/* ══════════════════════════════════════════════════
            1. NAV  (above the spine)
        ══════════════════════════════════════════════════ */}
        <header className="border-b border-[#24211D]/8">
          <nav
            className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between"
            aria-label="Primary navigation"
          >
            <span className="font-semibold text-lg tracking-tight text-[#24211D]">
              {CONTENT.brand}
            </span>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-[10px] tracking-[0.14em] uppercase border border-[#24211D]/20 text-[#24211D]/50 rounded-full px-3 py-1">
                {CONTENT.ageLabel}
              </span>
              <a
                href={CONTENT.primaryCta.href}
                className="inline-flex items-center gap-1.5 text-sm font-medium bg-[#12837E] text-white rounded-full px-4 py-2 hover:opacity-85 transition-opacity duration-150"
              >
                {CONTENT.primaryCta.label}
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </nav>
        </header>

        {/* ══════════════════════════════════════════════════
            SPINE — everything from here hangs on the path
        ══════════════════════════════════════════════════ */}
        <main
          className="spine-wrap max-w-3xl mx-auto px-6 pt-16 pb-0"
          aria-label="Journey"
        >

          {/* ── STOP: START MARKER (top of spine) ── */}
          <div className="spine-stop spine-stop--full" aria-hidden="true">
            <div className="spine-node" style={{ background: "#12837E", borderColor: "#12837E" }}>
              <span className="sr-only">Start</span>
            </div>
            <div className="spine-card mx-auto flex items-center justify-center">
              <span
                className="inline-block text-[10px] tracking-[0.16em] uppercase font-medium text-[#12837E] border border-[#12837E]/40 rounded-full px-3 py-1"
                aria-hidden="true"
              >
                Start your journey
              </span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              2. HERO STOP
          ══════════════════════════════════════════════════ */}
          <section
            className="spine-stop spine-stop--full"
            aria-label="Hero"
          >
            <div className="spine-node spine-node" style={{ border: "2px solid #12837E" }} />
            <div className="spine-card mx-auto text-center anim-0 pb-4">
              <p className="text-xs tracking-[0.16em] uppercase text-[#12837E] mb-4">
                {CONTENT.tagline}
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#24211D] leading-[1.08] mb-5">
                {CONTENT.headline}
              </h1>
              <p className="text-lg md:text-xl text-[#24211D]/65 leading-relaxed max-w-md mx-auto mb-8">
                {CONTENT.subhead}
              </p>
              <div className="text-sm leading-7 text-[#24211D]/60 max-w-lg mx-auto mb-10 space-y-4">
                <p>{CONTENT.problem}</p>
                <p className="text-[#24211D]/75 font-medium">{CONTENT.solution}</p>
              </div>
              <a
                href={CONTENT.primaryCta.href}
                className="inline-flex items-center gap-2 bg-[#12837E] text-white rounded-full px-7 py-3.5 text-sm font-medium hover:opacity-85 transition-opacity duration-150"
              >
                {CONTENT.primaryCta.label}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════
              3. FRAMEWORK — heading stop
          ══════════════════════════════════════════════════ */}
          <section aria-label="The three lenses">

            {/* Section heading — centred, sits on spine */}
            <div className="spine-stop spine-stop--full">
              <div className="spine-node" />
              <div className="spine-card mx-auto text-center">
                <p className="text-[10px] tracking-[0.16em] uppercase text-[#24211D]/35 mb-2">
                  How it works
                </p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#24211D] mb-2">
                  {CONTENT.framework.title}
                </h2>
                <p className="text-sm text-[#24211D]/55 leading-relaxed max-w-sm mx-auto">
                  {CONTENT.framework.subtitle}
                </p>
              </div>
            </div>

            {/* ── Three lens milestones on the spine ── */}
            {lenses.map((lens, i) => {
              const Icon = ICONS[lens.icon];
              const side = i % 2 === 0 ? "spine-stop--left" : "spine-stop--right";
              const lensColors = [
                { bg: "#E3F3F2", border: "#12837E" },
                { bg: "#D6EEEC", border: "#0E6B67" },
                { bg: "#CBE9E7", border: "#0A5856" },
              ];
              const col = lensColors[i];

              return (
                <div
                  key={lens.name}
                  className={`spine-stop spine-stop--milestone ${side}`}
                >
                  {/* Large milestone node with icon */}
                  <div
                    className="spine-node spine-node--lg"
                    style={{ background: col.bg, borderColor: col.border }}
                    aria-hidden="true"
                  >
                    {Icon && (
                      <Icon
                        className="w-4 h-4"
                        style={{ color: col.border }}
                      />
                    )}
                  </div>

                  {/* Lens card */}
                  <div
                    className="spine-card card-lift rounded-2xl border border-[#24211D]/8 bg-white p-6 shadow-[0_2px_12px_rgba(18,131,126,0.07)]"
                  >
                    <p
                      className="text-[10px] tracking-[0.16em] uppercase font-medium mb-2"
                      style={{ color: col.border }}
                    >
                      Step {i + 1}
                    </p>
                    <h3 className="text-xl font-bold text-[#24211D] mb-1">{lens.name}</h3>
                    <p className="text-xs uppercase tracking-wide text-[#24211D]/45 mb-3">
                      {lens.tagline}
                    </p>
                    <p className="text-sm leading-6 text-[#24211D]/65">{lens.body}</p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* ══════════════════════════════════════════════════
              4. FEATURES — 5 stops, alternating
          ══════════════════════════════════════════════════ */}
          <section aria-label="Features">
            <div className="spine-stop spine-stop--full">
              <div className="spine-node" />
              <div className="spine-card mx-auto text-center">
                <p className="text-[10px] tracking-[0.16em] uppercase text-[#24211D]/35 mb-2">
                  What you get
                </p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#24211D]">
                  Everything you need to find your way.
                </h2>
              </div>
            </div>

            {CONTENT.features.map((feat, i) => {
              const Icon = ICONS[feat.icon];
              const side = i % 2 === 0 ? "spine-stop--left" : "spine-stop--right";
              return (
                <div
                  key={feat.title}
                  className={`spine-stop ${side}`}
                >
                  <div className="spine-node">
                    {Icon && (
                      <Icon className="w-3 h-3 text-[#12837E]" />
                    )}
                  </div>
                  <div className="spine-card card-lift rounded-xl border border-[#24211D]/8 bg-white/80 p-5">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E3F3F2] flex items-center justify-center">
                        {Icon && <Icon className="w-3.5 h-3.5 text-[#12837E]" />}
                      </div>
                      <h3 className="font-semibold text-[#24211D] text-sm">{feat.title}</h3>
                    </div>
                    <p className="text-sm leading-6 text-[#24211D]/60">{feat.body}</p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* ══════════════════════════════════════════════════
              5. TIMELINE STOP
          ══════════════════════════════════════════════════ */}
          <section aria-label="Your journey timeline">
            <div className="spine-stop spine-stop--full">
              <div className="spine-node" style={{ background: "#12837E", borderColor: "#12837E" }} />
              <div className="spine-card mx-auto text-center">
                <span className="inline-block text-[10px] tracking-[0.14em] uppercase border border-[#12837E]/40 text-[#12837E] rounded-full px-3 py-1 mb-4">
                  {CONTENT.timeline.badge}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#24211D] mb-2">
                  {CONTENT.timeline.title}
                </h2>
                <p className="text-sm text-[#24211D]/55 leading-relaxed max-w-sm mx-auto mb-8">
                  {CONTENT.timeline.subtitle}
                </p>

                {/* Mini path visualisation */}
                <div className="relative flex items-center justify-center gap-0 max-w-sm mx-auto">
                  {lenses.map((lens, i) => {
                    const Icon = ICONS[lens.icon];
                    const isLast = i === lenses.length - 1;
                    return (
                      <div key={lens.name} className="flex items-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-[#E3F3F2] border-2 border-[#12837E] flex items-center justify-center">
                            {Icon && <Icon className="w-4 h-4 text-[#12837E]" />}
                          </div>
                          <span className="text-[10px] font-semibold text-[#12837E] tracking-wide">
                            {lens.name}
                          </span>
                        </div>
                        {!isLast && (
                          <div className="w-12 h-px bg-[#12837E]/30 mx-1 mb-4" aria-hidden="true" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════
              6. CONTRAST STOP — Built differently
          ══════════════════════════════════════════════════ */}
          <section aria-label="What makes Endeavrly different">
            <div className="spine-stop spine-stop--full">
              <div className="spine-node" />
              <div className="spine-card mx-auto text-center">
                <p className="text-[10px] tracking-[0.16em] uppercase text-[#24211D]/35 mb-2">
                  A different kind of platform
                </p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#24211D]">
                  {CONTENT.contrastTitle}
                </h2>
              </div>
            </div>

            {CONTENT.contrasts.map((c, i) => {
              const side = i % 2 === 0 ? "spine-stop--left" : "spine-stop--right";
              return (
                <div key={i} className={`spine-stop ${side}`}>
                  <div
                    className="spine-node"
                    style={{ background: "#F7F4EF", borderColor: "#24211D", borderWidth: "1px" }}
                  />
                  <div className="spine-card rounded-xl border border-[#24211D]/8 bg-white/80 p-5 space-y-3">
                    <p className="text-sm leading-6 text-[#24211D]/30 line-through decoration-[#24211D]/15">
                      {c.not}
                    </p>
                    <p className="text-sm leading-6 text-[#24211D]/75 font-medium">
                      {c.instead}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* ══════════════════════════════════════════════════
              7. TRUST BADGES STOP
          ══════════════════════════════════════════════════ */}
          <section aria-label="Trust signals">
            <div className="spine-stop spine-stop--full">
              <div className="spine-node" style={{ background: "#12837E", borderColor: "#12837E" }} />
              <div className="spine-card mx-auto">
                <div className="flex flex-wrap gap-2.5 justify-center">
                  {CONTENT.trustBadges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase border border-[#12837E]/40 text-[#12837E] rounded-full px-4 py-1.5 bg-[#E3F3F2]/60 font-medium"
                    >
                      <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════
              8. BUILT BY STOP
          ══════════════════════════════════════════════════ */}
          <section aria-label="About the builder">
            <div className="spine-stop spine-stop--left">
              <div className="spine-node" />
              <div className="spine-card rounded-xl border border-[#24211D]/8 bg-white/80 p-6">
                <p className="text-[10px] tracking-[0.16em] uppercase text-[#24211D]/35 mb-2">
                  {CONTENT.builtBy.label}
                </p>
                <p className="text-xl font-bold text-[#24211D] leading-snug">
                  {CONTENT.builtBy.heading}
                </p>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════
              9. CLOSING CTA — arrival node
          ══════════════════════════════════════════════════ */}
          <section aria-label="Get started">
            <div className="spine-stop spine-stop--full">
              {/* Arrival node — filled large */}
              <div
                className="spine-node spine-node--lg"
                style={{ background: "#12837E", borderColor: "#12837E", width: "48px", height: "48px" }}
                aria-hidden="true"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>

              <div className="spine-card mx-auto text-center">
                <p className="text-[10px] tracking-[0.16em] uppercase text-[#12837E] mb-4">
                  Arrival
                </p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#24211D] mb-3">
                  {CONTENT.closingCta.title}
                </h2>
                <p className="text-sm text-[#24211D]/55 mb-8">{CONTENT.closingCta.subtitle}</p>
                <a
                  href={CONTENT.closingCta.href}
                  className="inline-flex items-center gap-2 bg-[#12837E] text-white rounded-full px-8 py-3.5 text-sm font-medium hover:opacity-85 transition-opacity duration-150"
                >
                  {CONTENT.closingCta.button}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>

          {/* ── STOP: END OF SPINE ── */}
          <div className="spine-stop spine-stop--full pb-16" aria-hidden="true">
            <div
              className="spine-node"
              style={{ background: "#12837E", borderColor: "#12837E" }}
            />
          </div>

        </main>

        {/* ══════════════════════════════════════════════════
            10. FOOTER  (below the spine)
        ══════════════════════════════════════════════════ */}
        <footer
          className="border-t border-[#24211D]/8 bg-[#F7F4EF]"
          aria-label="Footer"
        >
          <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-0 md:justify-between">
            <span className="font-semibold text-base text-[#24211D]/60">
              {CONTENT.footer.brand}
            </span>

            <nav aria-label="Footer links" className="flex flex-wrap gap-x-5 gap-y-2">
              {CONTENT.footer.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-xs text-[#24211D]/40 hover:text-[#12837E] transition-colors duration-150 tracking-wide"
                >
                  {link}
                </a>
              ))}
            </nav>

            <p className="text-xs text-[#24211D]/30 max-w-xs md:text-right leading-5">
              {CONTENT.footer.copyright}
            </p>
          </div>

          <div className="h-[2px] bg-[#12837E]/15" />
        </footer>

      </div>
    </>
  );
}

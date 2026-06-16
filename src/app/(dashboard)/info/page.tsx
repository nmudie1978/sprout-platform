import { ExternalLink, Compass, BarChart3, Briefcase, Route, Target, Shield, ChevronRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import Link from "next/link";
import { getAboutPageStats, type ResearchStatWithYear } from "@/lib/researchEvidence";

export const metadata = {
  title: "About Endeavrly",
  description: "Why Endeavrly exists and how it helps young people.",
};

function TheGapSection() {
  const stats: ResearchStatWithYear[] = getAboutPageStats();
  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h2 className="text-lg font-semibold text-foreground mb-3">The problem we&apos;re solving</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        Research shows young people face a gap — not in ambition, but in exposure.
      </p>
      <div className="space-y-3 mb-5">
        {stats.map((stat) => (
          <div key={stat.id} className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm font-medium text-foreground mb-1">{stat.headline}</p>
            <p className="text-xs text-muted-foreground mb-1.5">{stat.description}</p>
            <a href={stat.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 hover:text-primary transition-colors">
              {stat.sourceName} ({stat.sourceYear}) <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Link href="/about/research" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-4">
          Research & Evidence <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function InfoPage() {
  return (
    <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-8 max-w-2xl">
      <BrandMark size="sm" className="mb-5" wordmarkClassName="font-semibold text-primary" />

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Why Endeavrly Exists</h1>
      <p className="text-sm text-foreground leading-relaxed">
        Most young people are expected to make career decisions without ever experiencing real work,
        without understanding what careers actually exist, and without a way to figure out what they&apos;re genuinely good at.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mt-2 mb-8">
        Endeavrly gives them a place to explore, try things, and learn about themselves — before the pressure of choosing a path kicks in.
      </p>

      {/* Framework — three lenses rendered L-to-R so the row reads as
          a journey, not a stack. Same staggered fade-in pattern used
          on the About page (0s → 0.4s → 0.8s) so Discover lands
          first, then Understand, then Clarity. Dynamic colour classes
          unrolled to fixed strings so Tailwind's JIT keeps them. */}
      <div className="pt-6 border-t border-border mb-8">
        <h2 className="text-lg font-semibold mb-1.5">Discover, Understand, Clarity</h2>
        <p className="text-sm text-muted-foreground mb-5">Three lenses, sequential on purpose — each gives you what you need for the next.</p>
        {/* Three lenses rendered L-to-R as a connected sequence: a gradient
            accent bar + glowing numbered node per lens, with flow chevrons in
            the gaps (desktop). Colour classes are full static strings so
            Tailwind's JIT keeps them. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {[
            {
              n: "1", name: "Discover", tagline: "Explore the career", delay: "0s",
              desc: "See what a career looks like at a glance — salary, growth, typical day, and the school subjects you need. Enough to know if it sparks your interest.",
              card: "border-teal-500/25 from-teal-500/[0.07] hover:border-teal-500/45",
              bar: "from-teal-400 to-teal-500",
              node: "from-teal-400 to-teal-500 shadow-[0_0_16px_-2px_rgba(20,184,166,0.65)]",
              eyebrow: "text-teal-600 dark:text-teal-400",
            },
            {
              n: "2", name: "Understand", tagline: "Know the reality", delay: "0.4s",
              desc: "Go deeper into education paths, real entry requirements, university programmes, and honest reality checks. This is where curiosity becomes clarity.",
              card: "border-emerald-500/25 from-emerald-500/[0.07] hover:border-emerald-500/45",
              bar: "from-emerald-400 to-emerald-500",
              node: "from-emerald-400 to-emerald-500 shadow-[0_0_16px_-2px_rgba(16,185,129,0.65)]",
              eyebrow: "text-emerald-600 dark:text-emerald-400",
            },
            {
              n: "3", name: "Clarity", tagline: "See your full journey", delay: "0.8s",
              desc: "Everything comes together here — your personalised roadmap, voice-guided narration of your path, a Momentum list of concrete next moves, and the full timeline of what it takes to get there.",
              card: "border-amber-500/25 from-amber-500/[0.07] hover:border-amber-500/45",
              bar: "from-amber-400 to-amber-500",
              node: "from-amber-400 to-amber-500 shadow-[0_0_16px_-2px_rgba(245,158,11,0.65)]",
              eyebrow: "text-amber-600 dark:text-amber-400",
            },
          ].map((lens, i) => (
            <div key={lens.name} className="relative">
              <article
                className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-gradient-to-b to-transparent p-4 transition-all duration-300 hover:-translate-y-0.5 motion-safe:animate-fade-in-up motion-safe:opacity-0 ${lens.card}`}
                style={{ animationDelay: lens.delay }}
              >
                <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${lens.bar}`} />
                <div className="mb-2.5 flex items-center gap-2.5">
                  <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${lens.node}`}>
                    {lens.n}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${lens.eyebrow}`}>{lens.name}</p>
                    <h3 className="text-sm font-semibold leading-tight text-foreground">{lens.tagline}</h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{lens.desc}</p>
              </article>
              {i < 2 && (
                <ChevronRight
                  aria-hidden
                  className="pointer-events-none absolute -right-[11px] top-[34px] z-10 hidden h-5 w-5 text-muted-foreground/35 md:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* What it does */}
      <div className="space-y-6 pt-6 border-t border-border">
        {[
          { icon: Compass, color: "text-teal-500", title: "See what's actually out there", desc: "Hundreds of roles with honest details about pay, qualifications, and growth." },
          { icon: BarChart3, color: "text-blue-500", title: "Understand the job market — early", desc: "Global insights from OECD, ILO, and WEF in a format that makes sense at 16." },
          { icon: Briefcase, color: "text-amber-500", title: "Explore real careers", desc: "Discover what people actually do, what they earn, and how they got there." },
          { icon: Target, color: "text-emerald-500", title: "Build your roadmap", desc: "A personalised plan from where you are now to where you want to be." },
          { icon: Route, color: "text-teal-500", title: "A journey, not a decision", desc: "No rankings, no leaderboards. Your progress is personal and private." },
          { icon: Shield, color: "text-rose-500", title: "Safe by design", desc: "Verified adults, structured messaging, no payments, no public profiles." },
        ].map((s) => (
          <div key={s.title} className="flex items-start gap-2.5">
            <s.icon className={`h-4 w-4 mt-0.5 shrink-0 ${s.color}`} />
            <div>
              <h3 className="text-sm font-semibold mb-0.5">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <TheGapSection />

      <div className="mt-10 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Questions? Reach us through{" "}
          <Link href="/feedback" className="text-foreground underline underline-offset-4 hover:text-primary">Support</Link>
          {" "}or our{" "}
          <Link href="/legal/privacy" className="text-foreground underline underline-offset-4 hover:text-primary">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

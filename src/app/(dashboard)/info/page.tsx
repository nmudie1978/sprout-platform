import { Star, ExternalLink, Compass, BarChart3, Briefcase, Route, Target, Shield } from "lucide-react";
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
      <div className="flex items-center gap-2 text-primary mb-5">
        <Star className="h-5 w-5" />
        <span className="font-semibold text-sm">Endeavrly</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Why Endeavrly Exists</h1>
      <p className="text-sm text-foreground leading-relaxed">
        Most young people are expected to make career decisions without ever experiencing real work,
        without understanding what careers actually exist, and without a way to figure out what they&apos;re genuinely good at.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mt-2 mb-8">
        Endeavrly gives them a place to explore, try things, and learn about themselves — before the pressure of choosing a path kicks in.
      </p>

      {/* Framework */}
      <div className="pt-6 border-t border-border mb-8">
        <h2 className="text-lg font-semibold mb-3">Discover, Understand, Grow</h2>
        <p className="text-sm text-muted-foreground mb-4">Three lenses, sequential on purpose — each gives you what you need for the next.</p>
        <div className="space-y-3">
          {[
            { n: "1", title: "Discover — Explore the career", desc: "Get a high-level view of any career — what it is, who does it, salary range, growth outlook.", color: "teal" },
            { n: "2", title: "Understand — Know the reality", desc: "Go deeper into what the role actually involves day to day, the qualifications, and what it really takes.", color: "emerald" },
            { n: "3", title: "Grow — Build your roadmap", desc: "Map your path to this career, set next steps, track your progress, and build momentum.", color: "amber" },
          ].map((l) => (
            <div key={l.n} className={`p-3 rounded-lg bg-${l.color}-50/50 dark:bg-${l.color}-950/20 border border-${l.color}-200/50 dark:border-${l.color}-800/30`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-${l.color}-500/20 text-${l.color}-600 dark:text-${l.color}-400 text-[10px] font-bold`}>{l.n}</span>
                <h3 className="text-sm font-semibold">{l.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground ml-7">{l.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What it does */}
      <div className="space-y-6 pt-6 border-t border-border">
        {[
          { icon: Compass, color: "text-teal-500", title: "See what's actually out there", desc: "Hundreds of roles with honest details about pay, qualifications, and growth." },
          { icon: BarChart3, color: "text-blue-500", title: "Understand the job market — early", desc: "Global insights from OECD, ILO, and WEF in a format that makes sense at 16." },
          { icon: Briefcase, color: "text-amber-500", title: "Try real work", desc: "Small local jobs that teach you about yourself — what you enjoy and what drains you." },
          { icon: Target, color: "text-emerald-500", title: "Earn independence", desc: "Skills like reliability, communication, and initiative — tracked over time." },
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

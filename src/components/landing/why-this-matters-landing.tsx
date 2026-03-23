/**
 * WHY THIS MATTERS - LANDING PAGE SECTION
 *
 * A compact, visually clean section displaying 2 evidence-backed
 * statistics to establish credibility without overwhelming the page.
 *
 * Features:
 * - Two soft-toned cards side by side (desktop) / stacked (mobile)
 * - Subtle source attribution
 * - Link to full Research & Evidence page
 * - Ties back to Discover · Understand · Grow
 */

import Link from "next/link";
import { ExternalLink, ArrowRight } from "lucide-react";
import { getFeaturedStats, type ResearchStatWithYear } from "@/lib/researchEvidence";

function EvidenceCard({ stat }: { stat: ResearchStatWithYear }) {
  return (
    <div className="rounded-xl border bg-card/80 backdrop-blur-sm p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Headline */}
      <p className="text-sm sm:text-base font-semibold text-foreground leading-snug mb-2">
        {stat.headline}
      </p>

      {/* Brief context */}
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
        {stat.description.split(".")[0]}.
      </p>

      {/* Source attribution */}
      <a
        href={stat.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground/70 hover:text-primary transition-colors group"
      >
        <span>Source: {stat.sourceName} ({stat.sourceYear})</span>
        <ExternalLink className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100" />
      </a>
    </div>
  );
}

export function WhyThisMattersLanding() {
  const featuredStats = getFeaturedStats();

  return (
    <section className="py-10 sm:py-14 border-b bg-gradient-to-b from-muted/10 to-muted/30">
      <div className="container px-4">
        {/* Section header */}
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Why This Matters
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Many young people want direction — but reliable pathways and real-world
            exposure aren&apos;t equally accessible.
          </p>
        </div>

        {/* Evidence cards - 2 columns on desktop, stacked on mobile */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 max-w-3xl mx-auto mb-8">
          {featuredStats.map((stat) => (
            <EvidenceCard key={stat.id} stat={stat} />
          ))}
        </div>

        {/* Connection to My Journey */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">
            That&apos;s why Endeavrly guides you through{" "}
            <span className="font-semibold text-blue-600">Discover</span>
            {" · "}
            <span className="font-semibold text-purple-600">Understand</span>
            {" · "}
            <span className="font-semibold text-green-600">Act</span>.
          </p>
        </div>

        {/* CTA to Research page */}
        <div className="flex flex-col items-center gap-1">
          <Link
            href="/about/research"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors group"
          >
            <span>View Research & Evidence</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="text-[10px] sm:text-xs text-muted-foreground/60">
            See the sources behind Endeavrly&apos;s mission
          </p>
        </div>
      </div>
    </section>
  );
}

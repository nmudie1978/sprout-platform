import Link from "next/link";
import { ExternalLink, BookOpen, Briefcase, Compass, Lightbulb, ArrowLeft } from "lucide-react";
import {
  getKeyFindings,
  getAllStats,
  RESEARCH_LAST_UPDATED,
  type ResearchStatWithYear,
} from "@/lib/researchEvidence";

export const metadata = {
  title: "Research & Evidence | Sprout",
  description:
    "Research-backed evidence on youth career readiness from OECD, Gallup, and leading education research organizations.",
};

// Tag colors for visual distinction
const TAG_COLORS: Record<string, string> = {
  "career-uncertainty": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "work-exposure": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  guidance: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  preparedness: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  expectations: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  outcomes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  neet: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

function StatCard({ stat }: { stat: ResearchStatWithYear }) {
  return (
    <div className="rounded-lg border bg-card p-3.5 hover:shadow-sm transition-shadow">
      {/* Headline */}
      <h3 className="text-sm font-semibold text-foreground leading-snug mb-1.5">
        {stat.headline}
      </h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
        {stat.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {stat.tags.map((tag) => (
          <span
            key={tag}
            className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${TAG_COLORS[tag] || "bg-muted text-muted-foreground"}`}
          >
            {tag.replace("-", " ")}
          </span>
        ))}
      </div>

      {/* Source attribution */}
      <div className="pt-2 border-t">
        <a
          href={stat.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors group"
        >
          <span className="font-medium">{stat.sourceName}</span>
          <span className="text-muted-foreground/50">({stat.sourceYear})</span>
          <ExternalLink className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100" />
        </a>
      </div>
    </div>
  );
}

export default function ResearchPage() {
  const keyFindings = getKeyFindings();
  const allStats = getAllStats();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to About
        </Link>
      </div>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-3">
          Research & Evidence
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Many young people report uncertainty about future pathways, and real-world exposure
          is uneven. Sprout exists to make the journey clearer and more practical.
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-2">
          Last updated: {RESEARCH_LAST_UPDATED}
        </p>
      </header>

      {/* Section 1: Key Findings */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Key Findings</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Research from leading organizations highlights the gap in career clarity and
          real-world exposure among youth aged 15–23.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {keyFindings.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </section>

      {/* Section 2: What This Means for Youth */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Compass className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">What This Means for Youth</h2>
        </div>

        <div className="bg-muted/30 rounded-lg border p-4">
          <p className="text-xs text-muted-foreground mb-3">
            These findings point to a practical challenge: many young people want to succeed but
            lack the experiences and information needed to build confidence in their path.
          </p>

          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-foreground">Uncertainty is common</strong>
                <span className="text-muted-foreground">
                  —but it stems from lack of exposure, not lack of ambition
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-foreground">Real experiences matter</strong>
                <span className="text-muted-foreground">
                  —job shadowing and hands-on work shape clearer expectations
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-foreground">Guidance makes a difference</strong>
                <span className="text-muted-foreground">
                  —conversations with advisors and structured reflection improve outcomes
                </span>
              </div>
            </li>
          </ul>

          <div className="mt-4 pt-3 border-t">
            <p className="text-[10px] text-muted-foreground">
              This is why Sprout is built around{" "}
              <strong className="text-foreground">Discover</strong> (exploration),{" "}
              <strong className="text-foreground">Understand</strong> (reflection), and{" "}
              <strong className="text-foreground">Act</strong> (real experiences).
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: What Sprout Does Differently */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">What Sprout Does Differently</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Discover */}
          <div className="rounded-lg border bg-gradient-to-br from-purple-50/50 to-background dark:from-purple-950/20 p-3.5">
            <div className="flex items-center gap-1.5 mb-2">
              <Compass className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-semibold text-foreground">Discover</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Structured self-awareness and career exploration. Understand your strengths,
              interests, and values through guided reflection and role deep-dives.
            </p>
          </div>

          {/* Understand */}
          <div className="rounded-lg border bg-gradient-to-br from-green-50/50 to-background dark:from-green-950/20 p-3.5">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              <h3 className="text-sm font-semibold text-foreground">Understand</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Industry context, career shadows, and planning tools. See how industries
              work and build a personal roadmap grounded in reality.
            </p>
          </div>

          {/* Act */}
          <div className="rounded-lg border bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/20 p-3.5">
            <div className="flex items-center gap-1.5 mb-2">
              <Briefcase className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold text-foreground">Act</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Real experience via small, local jobs. Start building practical skills and
              discover what work actually feels like—before making big decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Sources */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ExternalLink className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Sources</h2>
        </div>

        <div className="bg-muted/20 rounded-lg border p-4">
          <p className="text-[10px] text-muted-foreground mb-3">
            Full bibliography with links to primary sources. All statistics verified as of{" "}
            {RESEARCH_LAST_UPDATED}.
          </p>

          <ul className="space-y-2">
            {allStats.map((stat) => (
              <li key={stat.id} className="text-xs">
                <a
                  href={stat.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <span className="text-foreground group-hover:text-primary transition-colors">
                    {stat.sourceName}
                  </span>
                  <span className="text-muted-foreground"> ({stat.sourceYear}). </span>
                  <span className="text-muted-foreground/80 italic">
                    &ldquo;{stat.headline}&rdquo;
                  </span>
                  <ExternalLink className="inline h-2.5 w-2.5 ml-1 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Back link */}
      <div className="pt-8 border-t">
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to About
        </Link>
      </div>
    </div>
  );
}

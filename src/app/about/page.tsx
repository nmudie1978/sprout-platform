import { Sprout, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getAboutPageStats, type ResearchStatWithYear } from "@/lib/researchEvidence";

export const metadata = {
  title: "About Sprout",
  description: "What Sprout is, what it isn't, and why it exists.",
};

function TheGapSection() {
  const stats: ResearchStatWithYear[] = getAboutPageStats();

  return (
    <div className="mt-16 pt-10 border-t border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        The gap we&apos;re addressing
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Research shows that many young people face uncertainty about their future path —
        not because they lack ambition, but because they lack exposure.
      </p>

      <div className="space-y-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="p-4 rounded-lg bg-muted/30 border border-border/50"
          >
            <p className="text-sm font-medium text-foreground mb-1">
              {stat.headline}
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              {stat.description}
            </p>
            <a
              href={stat.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 hover:text-primary transition-colors"
            >
              <span>{stat.sourceName} ({stat.sourceYear})</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground leading-relaxed">
        That&apos;s why Sprout is built around <strong className="text-foreground">Discover</strong> (know yourself),{" "}
        <strong className="text-foreground">Understand</strong> (know the world), and{" "}
        <strong className="text-foreground">Act</strong> (take aligned action) — a structured approach
        to help young people build career clarity through self-discovery, planning, and purposeful action.
      </p>

      <div className="mt-4">
        <Link
          href="/about/research"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-4"
        >
          Research & Evidence
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-green-600 mb-8">
            <Sprout className="h-6 w-6" />
            <span className="font-semibold">Sprout</span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
            About Sprout
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Sprout is not a job board, a gig app, or a career quiz.
          </p>
          <p className="text-lg text-foreground leading-relaxed mt-4">
            It&apos;s a place where young people can take on small, local jobs, reflect on what they&apos;re learning,
            and start to understand what kind of work might suit them — without pressure, without competition,
            and without anyone telling them who they should become.
          </p>
        </div>

        {/* Principles */}
        <div className="space-y-10">
          {/* Principle 1: Journey-first */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              The journey matters more than the destination
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Sprout is designed around growth, not goals. There are no rankings, no leaderboards,
              and no pressure to optimise. Progress here is personal — it belongs to you, not to an algorithm.
            </p>
          </section>

          {/* Principle 2: Self-discovery first */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Self-discovery comes first
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Before you can act with purpose, it helps to know yourself. Sprout guides you to reflect on
              your strengths, explore careers that interest you, and build a plan — so that when you take
              action, it&apos;s aligned with who you actually are.
            </p>
          </section>

          {/* Principle 3: Career insight grounded in reality */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Career information without the hype
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              When you explore careers here, you&apos;ll find honest information — what the work actually
              involves, what it pays, what qualifications are needed, and what the job market looks like.
              No spin, no promises.
            </p>
          </section>

          {/* Principle 4: Safety as foundation */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Safety is a foundation, not a feature
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Sprout doesn&apos;t handle payments. Adults are verified before they can post jobs or message
              young people. Conversations are structured. Reporting tools are always available. These
              choices are deliberate — safety isn&apos;t something we added later.
            </p>
          </section>

          {/* Principle 5: Private, non-competitive growth */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Your growth is private
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              What you do on Sprout stays yours. There are no public profiles, no follower counts,
              and no way for others to compare themselves to you. Reflection and growth happen
              better without an audience.
            </p>
          </section>

          {/* Principle 6: Built for 15-23 year olds */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Built for a specific stage of life
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Sprout is designed for people roughly aged 15 to 23. That&apos;s not a limitation — it&apos;s
              a focus. This is a time when small experiences can have a big impact, and when honest
              information matters more than polished advice.
            </p>
          </section>
        </div>

        {/* The Gap We're Addressing */}
        <TheGapSection />

        {/* Closing */}
        <div className="mt-16 pt-10 border-t border-border">
          <p className="text-muted-foreground leading-relaxed">
            If you have questions or concerns, you can reach us through the{" "}
            <Link href="/report" className="text-foreground underline underline-offset-4 hover:text-green-600">
              Report a concern
            </Link>{" "}
            page or the contact details in our{" "}
            <Link href="/legal/privacy" className="text-foreground underline underline-offset-4 hover:text-green-600">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

import { Star, ExternalLink, Compass, BarChart3, Briefcase, Route, Target, Shield } from "lucide-react";
import Link from "next/link";
import { getAboutPageStats, type ResearchStatWithYear } from "@/lib/researchEvidence";

export const metadata = {
  title: "About Endeavrly",
  description: "Why Endeavrly exists and how it helps young people explore careers, gain independence, and understand themselves.",
};

function TheGapSection() {
  const stats: ResearchStatWithYear[] = getAboutPageStats();

  return (
    <div className="mt-16 pt-10 border-t border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        The problem we&apos;re solving
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Research consistently shows that young people face a gap — not in ambition, but in exposure.
        Most teenagers have never set foot in a real workplace, can&apos;t name a career they&apos;d want,
        and have no structured way to explore what&apos;s out there.
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
        Endeavrly addresses this with a structured journey:{" "}
        <strong className="text-foreground">Discover</strong> (understand yourself),{" "}
        <strong className="text-foreground">Understand</strong> (explore what&apos;s out there), and{" "}
        <strong className="text-foreground">Act</strong> (take your first steps) — so young people
        can build career clarity through experience, not guesswork.
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
          <Link href="/" className="inline-flex items-center gap-2 text-primary mb-8">
            <Star className="h-6 w-6" />
            <span className="font-semibold">Endeavrly</span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
            Why Endeavrly Exists
          </h1>

          <p className="text-lg text-foreground leading-relaxed">
            Most young people are expected to make career decisions without ever experiencing real work,
            without understanding what careers actually exist, and without a way to figure out what
            they&apos;re genuinely good at.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mt-4">
            Endeavrly gives them a place to explore, try things, and learn about themselves — before
            the pressure of choosing a path kicks in.
          </p>
        </div>

        {/* What it does */}
        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Compass className="h-5 w-5 text-teal-500" />
              <h2 className="text-xl font-semibold text-foreground">
                See what&apos;s actually out there
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              How do you choose a career if you don&apos;t know what careers exist? Endeavrly opens up
              the full landscape — hundreds of roles across every industry, with honest details about
              what the work involves, what it pays, what qualifications you need, and whether the field
              is growing or shrinking. No spin, no hype. Just the information you need to start forming
              your own view.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-foreground">
                Understand the global job market — early
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Young people rarely get access to the kind of job market data that shapes real career
              decisions. Endeavrly brings global insights from sources like the OECD, ILO, and World
              Economic Forum into a format that makes sense at 16, not just at 36. Which industries are
              growing? What skills do employers actually value? What&apos;s changing in the world of work?
              You shouldn&apos;t have to wait until university to find out.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-semibold text-foreground">
                Try real work and learn what you like
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Do you like working with your hands? Solving problems for people? Being outdoors?
              You won&apos;t know until you try. Endeavrly connects young people with small, local
              jobs — mowing lawns, helping with tech, pet sitting, event setup, cleaning. These aren&apos;t
              career-defining roles. They&apos;re experiments. Each one teaches you something about
              yourself: what you enjoy, what drains you, whether you&apos;re reliable, how you handle
              responsibility. That self-knowledge is worth more than any career quiz.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-emerald-500" />
              <h2 className="text-xl font-semibold text-foreground">
                Earn independence, not just money
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              A first job isn&apos;t really about the pay. It&apos;s about showing up on time,
              communicating with someone who&apos;s counting on you, and proving to yourself that you
              can do it. Endeavrly tracks the skills you build along the way — reliability,
              communication, initiative — and helps you see your own growth over time. The money is
              a bonus. The confidence is the real reward.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Route className="h-5 w-5 text-purple-500" />
              <h2 className="text-xl font-semibold text-foreground">
                A journey, not a decision
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Endeavrly doesn&apos;t ask you to pick a career. It asks you to explore. Set a goal
              if you want, change it whenever you need to, or leave it blank and just try things.
              There are no rankings, no leaderboards, and no algorithm telling you what to become.
              Your progress is personal and private. The only person it needs to make sense to is you.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-rose-500" />
              <h2 className="text-xl font-semibold text-foreground">
                Safe by design
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Endeavrly is built for ages 15 to 23. That means safety isn&apos;t an afterthought.
              Adults are verified before they can post jobs. Conversations are structured — no open
              messaging between minors and strangers. There are no payments inside the app, no public
              profiles, no follower counts, and no way for anyone to compare themselves to someone else.
              Reporting tools are always available. These aren&apos;t features we added. They&apos;re
              decisions we made from the start.
            </p>
          </section>
        </div>

        {/* The Gap */}
        <TheGapSection />

        {/* Closing */}
        <div className="mt-16 pt-10 border-t border-border">
          <p className="text-muted-foreground leading-relaxed">
            If you have questions or concerns, you can reach us through the{" "}
            <Link href="/report" className="text-foreground underline underline-offset-4 hover:text-primary">
              Report a concern
            </Link>{" "}
            page or the contact details in our{" "}
            <Link href="/legal/privacy" className="text-foreground underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

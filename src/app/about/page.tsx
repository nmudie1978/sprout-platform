import { Star, ExternalLink, Compass, BarChart3, Briefcase, Route, Target, Shield, Download, Users, ArrowRight, FileText } from "lucide-react";
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
        <strong className="text-foreground">Clarity</strong> (see your full journey) — so young people
        can build career confidence through understanding, not guesswork.
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

          {/* Download / read links — the one-page summary is for the
              elevator-pitch version; the full white paper is the deeper
              read for parents, investors, educators, and school leaders. */}
          <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-2">
            <a
              href="/Endeavrly-Summary.pdf"
              download="Endeavrly-Summary.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-teal-500/40 bg-teal-500/10 px-4 py-2.5 text-sm font-medium text-teal-700 dark:text-teal-300 hover:bg-teal-500/15 hover:border-teal-500/60 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download the summary (PDF)
            </a>
            <Link
              href="/about/white-paper"
              className="inline-flex items-center gap-2 rounded-lg border border-border hover:border-teal-500/50 px-4 py-2.5 text-sm font-medium text-foreground hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Read the full white paper
            </Link>
            <a
              href="/api/reports/white-paper"
              download="endeavrly-white-paper.pdf"
              className="inline-flex items-center gap-2 rounded-lg border border-border hover:border-teal-500/50 px-4 py-2.5 text-sm font-medium text-foreground hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download white paper (PDF)
            </a>
          </div>
        </div>

        {/* The Framework */}
        <div className="mt-16 pt-10 border-t border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            The framework: Discover, Understand, Clarity
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Everything in Endeavrly is built around three lenses. They&apos;re sequential on purpose —
            each one gives you what you need for the next.
          </p>

          {/* Cards reveal one-by-one (0s → 0.4s → 0.8s) so the row reads
              as a journey rather than a static row of three boxes.
              Pure CSS — no client component needed. Animation defined in
              globals.css under @keyframes fadeInUp. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              className="p-4 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-800/30 flex flex-col motion-safe:animate-fade-in-up motion-safe:opacity-0"
              style={{ animationDelay: "0s" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold shrink-0">1</span>
                <h3 className="font-semibold text-foreground">Discover — Explore the career</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get a high-level view of any career — what it is, who does it, the salary range, and whether it&apos;s
                worth a closer look. No commitment, just curiosity.
              </p>
            </div>

            <div
              className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 flex flex-col motion-safe:animate-fade-in-up motion-safe:opacity-0"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">2</span>
                <h3 className="font-semibold text-foreground">Understand — Know the reality</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Go deeper into what the role actually involves day to day — the qualifications, the hard parts, the
                typical week, and what it really takes to qualify.
              </p>
            </div>

            <div
              className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 flex flex-col motion-safe:animate-fade-in-up motion-safe:opacity-0"
              style={{ animationDelay: "0.8s" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold shrink-0">3</span>
                <h3 className="font-semibold text-foreground">Clarity — See your full journey</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                See the complete timeline, milestones, and progression for this career — so you can move forward with
                confidence, knowing exactly what the journey involves.
              </p>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            Each step builds on the last. Curiosity becomes clarity, clarity becomes direction — at your own pace,
            on your own terms.
          </p>
        </div>

        {/* What it does */}
        <div className="space-y-10 mt-16 pt-10 border-t border-border">
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
              <Route className="h-5 w-5 text-teal-500" />
              <h2 className="text-xl font-semibold text-foreground">
                A journey, not a decision
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Endeavrly doesn&apos;t ask you to pick a career forever. It asks you to explore. Set a Primary Goal
              to focus on one career first, change it whenever you need to, or just browse and try things.
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

        {/* For Parents */}
        <div className="mt-16 pt-10 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-emerald-500" />
            <h2 className="text-xl font-semibold text-foreground">
              Parents and professionals
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Your career path &mdash; the twists, the pivots, the unexpected turns &mdash; is exactly what young
            people need to see. By sharing your real career timeline, you help them understand that there are
            many ways to build a life, not just the ones they see around them.
          </p>
          <Link
            href="/for-parents"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 hover:border-emerald-500/60 transition-colors"
          >
            Learn how to contribute your career path
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

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

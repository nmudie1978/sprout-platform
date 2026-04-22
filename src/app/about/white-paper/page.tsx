import type { Metadata } from "next";
import {
  ShieldCheck,
  Compass,
  MapPin,
  Sparkles,
  Users,
  Briefcase,
  TrendingUp,
  Calendar,
  UserCog,
  User,
  Layers,
  Eye,
  Lock,
  MessageCircle,
  BarChart3,
  Download,
} from "lucide-react";

export const metadata: Metadata = {
  title: "White Paper — Endeavrly",
  description:
    "A safer, smarter way for young people to explore careers and first jobs. For parents, investors, educators, and school leaders.",
};

// ── Reusable section header ──────────────────────────────────────
function SectionHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8 pb-4 border-b border-border/40">
      <div className="flex items-baseline gap-3">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
          {number}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="mt-2 text-sm text-muted-foreground italic">{subtitle}</p>
      )}
    </div>
  );
}

// ── Module card (used in Section 3) ──────────────────────────────
function ModuleCard({
  icon: Icon,
  title,
  tagline,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tagline: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-6 mb-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="shrink-0 p-2 rounded-lg bg-teal-500/10">
          <Icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground italic mt-0.5">
            {tagline}
          </p>
        </div>
      </div>
      <div className="text-sm text-foreground/85 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

// ── Bullet list ──────────────────────────────────────────────────
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-foreground/85">
      {items.map((item, i) => {
        // Auto-promote a leading "Label — body" pattern: bold +
        // teal-tinted label so module sub-sections (e.g. "Career
        // Snapshot — …") read at a glance instead of disappearing
        // into prose. Bound the split position so dashes used in
        // mid-sentence ranges don't get swallowed.
        const dashIdx = item.indexOf(" — ");
        const hasLabel = dashIdx > 0 && dashIdx < 60;
        const label = hasLabel ? item.slice(0, dashIdx) : null;
        const body = hasLabel ? item.slice(dashIdx + 3) : item;
        return (
          <li key={i} className="flex gap-2.5">
            <span className="text-teal-500/70 mt-0.5 shrink-0">▸</span>
            <span className="leading-relaxed">
              {label && (
                <>
                  <strong className="font-semibold text-teal-700 dark:text-teal-300">
                    {label}
                  </strong>
                  {" — "}
                </>
              )}
              {body}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ── Table of contents ────────────────────────────────────────────
const TOC_ENTRIES: { id: string; number: string; title: string }[] = [
  { id: "exec-summary", number: "00", title: "Executive Summary" },
  { id: "section-01", number: "01", title: "The Problem We're Solving" },
  { id: "section-02", number: "02", title: "Three Core Principles" },
  { id: "section-03", number: "03", title: "Module-by-Module Walkthrough" },
  { id: "section-04", number: "04", title: "How the Matching Engine Works" },
  { id: "section-05", number: "05", title: "Safety & Privacy Commitments" },
  { id: "section-06", number: "06", title: "Technical Foundations" },
  { id: "section-07", number: "07", title: "Where We Sit in the Market" },
  { id: "section-08", number: "08", title: "What's Next" },
  { id: "section-09", number: "09", title: "A Note on What We Are Not" },
];

function TableOfContents() {
  return (
    <nav
      aria-labelledby="toc-heading"
      className="mb-12 rounded-xl border border-border/40 bg-card/30 p-5 md:p-6"
    >
      <div className="flex items-baseline justify-between mb-4">
        <h2
          id="toc-heading"
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400"
        >
          Contents
        </h2>
        <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">
          {TOC_ENTRIES.length} sections
        </span>
      </div>
      <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {TOC_ENTRIES.map((entry) => (
          <li key={entry.id} className="border-b border-border/20 last:border-b-0 md:border-b">
            <a
              href={`#${entry.id}`}
              className="group flex items-baseline gap-3 py-2.5 transition-colors hover:text-teal-700 dark:hover:text-teal-300"
            >
              <span className="text-[11px] font-mono tracking-wider text-muted-foreground/70 shrink-0 w-6">
                {entry.number}
              </span>
              <span className="text-sm font-medium text-foreground/85 group-hover:text-teal-700 dark:group-hover:text-teal-300 flex-1">
                {entry.title}
              </span>
              <span
                aria-hidden
                className="text-muted-foreground/30 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all"
              >
                →
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ── Principle tile (Section 2) ───────────────────────────────────
type PrincipleItem = { kind: "no" | "yes"; text: string };

function PrincipleTile({
  icon: Icon,
  accent,
  title,
  description,
  items,
  footer,
}: {
  icon: React.ComponentType<{ className?: string }>;
  /** Tailwind colour family used for the icon, divider and ✓/✕ chips. */
  accent: "teal" | "rose" | "amber";
  title: string;
  description: string;
  items: PrincipleItem[];
  footer?: React.ReactNode;
}) {
  const accentClasses = {
    teal: {
      icon: "text-teal-500",
      ring: "border-teal-500/30",
      yes: "bg-emerald-500/15 text-emerald-500",
      no: "bg-rose-500/15 text-rose-500",
    },
    rose: {
      icon: "text-rose-500",
      ring: "border-rose-500/30",
      yes: "bg-emerald-500/15 text-emerald-500",
      no: "bg-rose-500/15 text-rose-500",
    },
    amber: {
      icon: "text-amber-500",
      ring: "border-amber-500/30",
      yes: "bg-emerald-500/15 text-emerald-500",
      no: "bg-rose-500/15 text-rose-500",
    },
  }[accent];

  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${accentClasses.ring} bg-background/60`}>
          <Icon className={`h-3.5 w-3.5 ${accentClasses.icon}`} />
        </span>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      </div>
      <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">
        {description}
      </p>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-[12.5px] leading-snug">
            <span
              className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                it.kind === "no" ? accentClasses.no : accentClasses.yes
              }`}
              aria-hidden
            >
              {it.kind === "no" ? "✕" : "✓"}
            </span>
            <span className="text-foreground/80">{it.text}</span>
          </li>
        ))}
      </ul>
      {footer && (
        <p className="mt-3 pt-3 border-t border-border/30 text-[11px] italic text-muted-foreground/80">
          {footer}
        </p>
      )}
    </div>
  );
}

export default function WhitePaperPage() {
  return (
    <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
      {/* ─── Hero ──────────────────────────────────────────────── */}
      <header className="mb-12 pb-8 border-b border-border/40">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/[0.05] px-3 py-1 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-teal-700 dark:text-teal-400">
            White Paper · April 2026
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-3">
          Endeavrly
        </h1>
        <p className="text-xl md:text-2xl font-medium text-foreground/80 leading-snug mb-4">
          A safer, smarter way for young people to explore careers and first
          jobs.
        </p>
        <p className="text-sm text-muted-foreground">
          Prepared for parents, investors, educators, and school leaders.
        </p>

        <div className="not-prose mt-6">
          <a
            href="/api/reports/white-paper"
            download="endeavrly-white-paper.pdf"
            className="inline-flex items-center gap-2 rounded-lg border border-teal-500/40 bg-teal-500/10 px-4 py-2.5 text-sm font-medium text-teal-700 dark:text-teal-300 hover:bg-teal-500/15 hover:border-teal-500/60 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download white paper (PDF)
          </a>
        </div>
      </header>

      <TableOfContents />

      {/* ─── Executive Summary ─────────────────────────────────── */}
      <section id="exec-summary" className="mb-14 scroll-mt-24">
        <SectionHeader number="Executive Summary" title="What it is" />
        <div className="space-y-4 text-foreground/85 leading-relaxed">
          <p>
            A career exploration platform built specifically for young people
            aged <strong>15 to 23</strong>. It helps students understand who
            they are, explore careers that genuinely fit them, discover real
            education pathways and employers, and build a realistic roadmap
            toward a fulfilling career — without exposing them to the risks
            of general-purpose social platforms.
          </p>
          <p>
            Three non-negotiable commitments shape the product:{" "}
            <strong>safety by design</strong>,{" "}
            <strong>privacy by default</strong>, and{" "}
            <strong>exploration before pressure</strong>. No in-app payments.
            No direct free-text chat between minors and adults. No behavioural
            advertising, no popularity metrics, no social scoring. Every screen
            is calibrated to reduce anxiety and encourage curiosity — not to
            maximise engagement for its own sake.
          </p>
          <p>
            Under the hood: a multi-dimensional matching engine, multi-route
            career pathways (showing that there&apos;s always more than one way
            in), real Norwegian employer data, salary progression curves,
            application deadline awareness, a Socratic AI career coach, and
            a calm guided narrative that walks the student through their own
            future — not across years of forced engagement.
          </p>
        </div>
      </section>

      {/* ─── 1. The Problem ────────────────────────────────────── */}
      <section id="section-01" className="mb-14 scroll-mt-24">
        <SectionHeader
          number="01"
          title="The Problem We're Solving"
        />
        <p className="mb-4 leading-relaxed text-foreground/85">
          Today's 15- to 23-year-olds inherit a paradox. They have more
          information about careers than any generation in history — and yet
          youth career uncertainty, anxiety, and drift are higher than ever.
          The dominant tools available to them are not built for their stage of
          life.
        </p>
        <Bullets
          items={[
            "Social platforms optimise for engagement, not clarity, and expose minors to open messaging, public popularity signals, and algorithmic pressure.",
            "Freelance and gig platforms assume the user is an adult contractor, route money through in-app rails, and treat users as transactional suppliers.",
            "Careers advice websites are static, often outdated, and rarely tailored to a specific country, age, or academic pathway.",
            "School careers guidance is under-resourced in most countries and often reaches students too late — after subject choices have already been made.",
          ]}
        />
        <p className="mt-4 leading-relaxed text-foreground/85">
          The result is a generation that either over-commits to a single path
          they don't understand, or defers the decision until circumstance
          chooses for them. The platform exists on a single premise:{" "}
          <strong>
            exploration should be safe, structured, personal, and honest
          </strong>
          . A student should spend an hour on the platform and leave with a
          clearer sense of where they are, what realistically fits them, and
          what a concrete next step looks like — without being sold anything,
          tracked for profit, or exposed to strangers.
        </p>
      </section>

      {/* ─── 2. Three Principles ───────────────────────────────── */}
      <section id="section-02" className="mb-14 scroll-mt-24">
        <SectionHeader number="02" title="Three Core Principles" />
        <div className="grid md:grid-cols-3 gap-4">
          <PrincipleTile
            icon={ShieldCheck}
            accent="rose"
            title="Safety by Design"
            description="Built from the ground up for minors. Safety is architectural, not moderation bolted onto a general-purpose app."
            items={[
              { kind: "no", text: "Free-text chat between minors and adults" },
              { kind: "no", text: "In-app payments" },
              { kind: "yes", text: "Verified adult accounts before posting" },
              { kind: "yes", text: "One-tap report on every profile and job" },
              { kind: "yes", text: "Guardian consent is first-class" },
            ]}
          />

          <PrincipleTile
            icon={Sparkles}
            accent="amber"
            title="Exploration Before Pressure"
            description="Young people don't need gamification — they need room to think. Engagement traps are deliberately avoided."
            items={[
              { kind: "no", text: "Followers, likes, or leaderboards" },
              { kind: "no", text: "Streaks or notification spam" },
              { kind: "no", text: "“Falling behind” messaging" },
              { kind: "no", text: "Infinite scroll" },
            ]}
          />

          <PrincipleTile
            icon={Eye}
            accent="teal"
            title="Transparent Matching"
            description="Deterministic, rules-based scoring. Every match is explainable in plain English. AI is used narrowly, never as the primary engine for a life-shaping recommendation."
            items={[
              { kind: "yes", text: "Auditable logic, configurable weights" },
              { kind: "yes", text: "Plain-English explanations on every match" },
              { kind: "no", text: "Black-box LLM picking your child's career" },
            ]}
            footer={'Honestly answers: "Why was my child shown this career?"'}
          />
        </div>
      </section>

      {/* ─── 3. Modules ────────────────────────────────────────── */}
      <section id="section-03" className="mb-14 scroll-mt-24">
        <SectionHeader
          number="03"
          title="Module-by-Module Walkthrough"
          subtitle="Nine surfaces, each answering a specific question a young person might ask."
        />

        <ModuleCard
          icon={MapPin}
          title="Dashboard"
          tagline="Where am I right now?"
        >
          <p>
            The student's home base — information-dense but calm. It reinforces
            the student's current position without demanding new action.
          </p>
          <Bullets
            items={[
              "My Journey card — compact progress ring across Discover → Understand → Clarity for the current goal.",
              "Career Snapshot — salary range, growth outlook, sector, and pension context at a glance.",
              "Who Am I — a gentle self-portrait generated from discovery preferences.",
              "My Explored Journeys — history of every career seriously considered, switchable without losing context.",
              "Saved Careers and Small Jobs — quick access to bookmarks and applications.",
              "Discovery Nudge — a sparse, gentle suggestion that surfaces once per 20–30 minute session.",
              "Did You Know — rotating research-backed facts about the job market.",
            ]}
          />
        </ModuleCard>

        <ModuleCard
          icon={Compass}
          title="Career Radar"
          tagline="What careers actually fit me?"
        >
          <p>
            A personalised map of careers positioned by how well each aligns
            with the student's preferences.
          </p>
          <Bullets
            items={[
              "Discovery preferences — a lightweight quiz capturing subjects enjoyed, preferred work style, people preference, and free-form interests. Saved to profile, persists across sessions.",
              "The radar visualisation — each career is a dot; closer to centre means a stronger match.",
              "Matches Report — a scrollable, filterable list of matched careers.",
              "Compare — select 2–3 careers and view side-by-side.",
              "Multi-route career pathways — each career shows multiple entry routes (university, bootcamp, lateral entry, via abroad) with named real-person examples, not just the elite linear path.",
              "Top Norwegian employers per career — with favicons, industry tags, and direct career-page links.",
            ]}
          />
        </ModuleCard>

        <ModuleCard
          icon={Layers}
          title="My Journey"
          tagline="What does this career actually mean for me?"
        >
          <p>
            The deep-dive experience for a single career. Three stages with a
            single-predicate confirmation gating each — no multi-step
            completion ladder.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border/40 p-3 bg-background/40">
              <h4 className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1">
                Discover
              </h4>
              <p className="text-xs text-foreground/75 leading-relaxed">
                Calm, content-first introduction: day-in-the-life video,
                salary with full progression popup, growth outlook, key
                skills, qualification path. Interactive salary chart shows
                junior → senior trajectory.
              </p>
            </div>
            <div className="rounded-lg border border-border/40 p-3 bg-background/40">
              <h4 className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1">
                Understand
              </h4>
              <p className="text-xs text-foreground/75 leading-relaxed">
                What you&apos;ll do (tasks + tools), the reality (honest
                challenges), a typical day (morning/midday/afternoon),
                common misconceptions (myth buster), top Norwegian employers,
                education pathway (school readiness + study path + certifications),
                and funding &amp; scholarships.
              </p>
            </div>
            <div className="rounded-lg border border-border/40 p-3 bg-background/40">
              <h4 className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1">
                Clarity
              </h4>
              <p className="text-xs text-foreground/75 leading-relaxed">
                Personal roadmap with voice narration, confidence tracker,
                matched opportunities (internships + graduate programmes),
                application deadlines, pivot preview (&quot;what if I change
                my mind?&quot;), momentum actions, and shareable journey
                summary.
              </p>
            </div>
          </div>
          <p className="mt-3">
            <strong>Clarity</strong> is where the product&apos;s heart lives. An
            age-anchored timeline from today through to a senior role, with a
            voice-narrated journey simulation, a confidence tracker, real
            internship/graduate programme opportunities matched to the career,
            deadline awareness for key application dates, and a &quot;what if
            I change my mind?&quot; pivot preview showing what transfers
            between careers. The roadmap respects the rule that school finishes
            before university begins.
          </p>
        </ModuleCard>

        <ModuleCard
          icon={MessageCircle}
          title="AI Career Advisor"
          tagline="Can I ask a specific question?"
        >
          <p>
            A Socratic career coach — not just a Q&amp;A bot. Asks follow-up
            questions before giving answers, challenges pattern homogeneity
            (&quot;You&apos;ve saved 4 creative careers — have you considered
            the business side?&quot;), and has awareness of the student&apos;s
            radar preferences, education stage, and exploration history
            without them repeating themselves. Keeps persistent conversation
            history. Guarded by safety guardrails: no medical, legal, or
            financial advice; defers to human professionals for serious
            concerns.
          </p>
        </ModuleCard>

        <ModuleCard
          icon={Briefcase}
          title="Micro-Job Marketplace"
          tagline="Can I get my first work experience?"
        >
          <p>
            Local, age-appropriate jobs posted by verified adults: babysitting,
            dog walking, tech help, gardening, tutoring, cleaning, light DIY.
          </p>
          <Bullets
            items={[
              "Jobs are geolocated, filterable by category, schedule, and location; a map view surfaces what's nearby.",
              "Applications use structured messaging — predefined prompts only, no free text.",
              "Applications page tracks status (pending, accepted, in progress, completed).",
              "Earnings dashboard visualises completed work. Payments happen outside the platform — by design.",
              "Every posting has a Report button linked to moderation.",
            ]}
          />
          <p className="italic text-xs text-muted-foreground mt-2">
            The marketplace is not the point of Endeavrly — it exists in
            service of the Journey. Responsibility signals feed back into the
            student's own growth, never a public scoreboard.
          </p>
        </ModuleCard>

        <ModuleCard
          icon={TrendingUp}
          title="Industry Insights"
          tagline="What does the real world look like?"
        >
          <Bullets
            items={[
              "Global Lens — macroeconomic stats, featured reports, podcasts.",
              "Youth Lens — trends re-interpreted for the 15–23 demographic.",
              "Dig Deeper — trending roles and in-demand skills.",
              "Go Further — international context and verified events worth attending.",
            ]}
          />
          <p className="mt-2">
            Facts are evidence-linked to their sources with a freshness policy
            that flags stale data. Evergreen content is clearly marked.
          </p>
        </ModuleCard>

        <ModuleCard
          icon={Calendar}
          title="Career Events"
          tagline="Where can I go to learn more in person or live?"
        >
          <p>
            A curated feed of verified events: conferences, webinars,
            workshops, campus open days. Filtered by the student's career
            interests. An admin pipeline keeps the feed fresh.
          </p>
        </ModuleCard>

        <ModuleCard
          icon={UserCog}
          title="Parent / Guardian Dashboard"
          tagline="How is my child doing on the platform?"
        >
          <p>
            Parents and guardians have a first-class dashboard — not an
            afterthought.
          </p>
          <Bullets
            items={[
              "Visibility of the child's career exploration (which careers they've viewed, set as goals).",
              "View of job applications and job-related interactions.",
              "Safety reports and alerts linked to the child's account.",
              "Guardian consent flow, including ability to unlink or escalate.",
              "A calm, non-surveillant tone — built to support, not surveil.",
            ]}
          />
          <p className="mt-2">
            Parents also have a dedicated contribution channel at{" "}
            <code className="text-xs bg-muted/40 px-1.5 py-0.5 rounded">
              /contribute
            </code>
            : professionals and parents can share their own real career
            timelines, which are moderated and then shown back to students
            inside Clarity as <em>Real Career Paths</em> — demonstrating that
            careers almost never travel in a straight line.
          </p>
        </ModuleCard>

        <ModuleCard
          icon={User}
          title="Profile & Growth"
          tagline="What have I told the platform about me?"
        >
          <p>
            A single place where the student manages their display name,
            country, avatar, goals, discovery preferences, and safety
            settings. Every signal used to personalise the experience is
            visible and editable. No hidden profile, no shadow metrics.
          </p>
        </ModuleCard>
      </section>

      {/* ─── 4. Matching Engine ────────────────────────────────── */}
      <section id="section-04" className="mb-14 scroll-mt-24">
        <SectionHeader
          number="04"
          title="How the Matching Engine Works"
          subtitle="In plain English — because trustworthiness matters."
        />
        <p className="mb-4 text-foreground/85 leading-relaxed">
          Endeavrly uses a <strong>hybrid matching engine</strong> combining
          four layers. The whole design is built so that any match shown to a
          student can be explained in plain language, without pointing at an
          opaque AI.
        </p>
        <div className="space-y-4">
          <div className="rounded-lg border border-border/40 p-4 bg-background/40">
            <h4 className="font-semibold mb-1 text-sm">
              1 · Career attribute model
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Every career has structured attributes: which school subjects it
              relates to, whether it's desk / hands-on / outdoors / creative,
              how people-facing, how analytical, what academic pathway it
              needs, salary band, growth, and sector.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 p-4 bg-background/40">
            <h4 className="font-semibold mb-1 text-sm">
              2 · User preference profile
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Answers from the "What I like" quiz are mapped into the same
              structured dimensions. Working with people? Open to desk and
              outdoors? Interests in animals and coding? Each answer becomes a
              signal the scorer can use.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 p-4 bg-background/40">
            <h4 className="font-semibold mb-1 text-sm">
              3 · Weighted scoring engine
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              The student's profile is compared to every career along every
              dimension. Subject match weighs most (about 42% of the total),
              then work style, people preference, creative vs analytical,
              variety, and academic accessibility. Weights live in a single
              configuration file — tunable without touching scoring logic.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 p-4 bg-background/40">
            <h4 className="font-semibold mb-1 text-sm">
              4 · Diversity layer
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              After scoring, results are rebalanced so no single category can
              dominate more than 45% of the top results. Reserved "discovery"
              slots surface careers that score surprisingly high on one or two
              dimensions — careers the student might otherwise have never
              considered.
            </p>
          </div>
        </div>
        <div className="mt-5 rounded-lg border-l-4 border-teal-500/60 bg-teal-500/[0.04] p-4">
          <p className="text-sm text-foreground/90 leading-relaxed">
            <strong>Age-aware by default.</strong> If a 17-year-old says they
            finish school in 2027, the engine anchors the first post-school
            step (e.g. "Apply for university studies") to 2027 — not to their
            current age. No student can be shown a university step that starts
            before they've left school.
          </p>
        </div>
      </section>

      {/* ─── 5. Safety & Privacy ───────────────────────────────── */}
      <section id="section-05" className="mb-14 scroll-mt-24">
        <SectionHeader number="05" title="Safety & Privacy Commitments" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h4 className="font-semibold text-sm">
                Data minimisation (GDPR-aligned)
              </h4>
            </div>
            <ul className="text-xs space-y-1 text-foreground/75">
              <li>• Only the minimum data needed to serve the student.</li>
              <li>• No sensitive profiling categories collected or inferred.</li>
              <li>• No behavioural advertising.</li>
              <li>• Export or delete data from the profile page.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h4 className="font-semibold text-sm">Messaging safeguards</h4>
            </div>
            <ul className="text-xs space-y-1 text-foreground/75">
              <li>• Minors cannot send or receive free-text from adults.</li>
              <li>
                • All job-related communication uses predefined prompts.
              </li>
              <li>• Reports feed a moderation queue monitored by the team.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h4 className="font-semibold text-sm">No in-app payments</h4>
            </div>
            <p className="text-xs text-foreground/75">
              Endeavrly is not a payment processor. Work is agreed externally
              between the student and the adult. This structurally protects
              the platform from financial disputes and limits regulatory
              complexity typical of platforms involving minors and money.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h4 className="font-semibold text-sm">
                Trust signals are internal
              </h4>
            </div>
            <p className="text-xs text-foreground/75">
              The platform tracks responsibility signals (turning up, clear
              communication, finishing the job) for the student's own growth.
              They are <strong>never</strong> displayed publicly, scored, or
              used to rank students.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 p-4 md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h4 className="font-semibold text-sm">
                Age-appropriate defaults
              </h4>
            </div>
            <ul className="text-xs space-y-1 text-foreground/75">
              <li>
                • Dark mode default — calmer for most students; warm light
                mode is one click away.
              </li>
              <li>
                • Professional certifications are hidden from users under 20
                unless explicitly requested.
              </li>
              <li>
                • University-level steps never start before age 18 in any
                roadmap.
              </li>
              <li>
                • Any real-world statistic is tied to a published source with
                a freshness date.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── 6. Technical Foundations ──────────────────────────── */}
      <section id="section-06" className="mb-14 scroll-mt-24">
        <SectionHeader
          number="06"
          title="Technical Foundations"
          subtitle="Boring where it needs to be, interesting only where the student will feel it."
        />
        <p className="mb-4 text-foreground/85 leading-relaxed">
          Endeavrly is built on a modern, production-grade stack chosen for
          security, scalability, and speed of iteration.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ["Next.js 14", "App Router, React, TypeScript strict"],
            ["Supabase", "Auth + Postgres, Row-Level Security enforced"],
            ["Prisma ORM", "Type-safe database access"],
            ["Server Actions", "No business logic in UI components"],
            ["OpenAI (narrow use)", "TTS narration + AI Advisor, rate-limited"],
            [
              "Vitest · 464+ tests",
              "Safety, age-policy, education-alignment on every deploy",
            ],
          ].map(([name, detail]) => (
            <div
              key={name}
              className="rounded-lg border border-border/40 p-3 bg-background/40"
            >
              <p className="text-xs font-semibold text-foreground">{name}</p>
              <p className="text-[11px] text-foreground/65 mt-0.5">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 7. Where We Sit in the Market ─────────────────────── */}
      <section id="section-07" className="mb-14 scroll-mt-24">
        <SectionHeader
          number="07"
          title="Where We Sit in the Market"
          subtitle="Similar platforms exist globally — none built for the Nordic / European context, none built for individual youth and family use."
        />
        <p className="mb-4 text-foreground/85 leading-relaxed">
          Career-discovery platforms for young people are not a new category.
          A handful of established players serve North American and UK schools
          well. The table below shows where they sit and what they cover.
        </p>

        <div className="overflow-x-auto rounded-xl border border-border/40 mb-6">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground/80">
                <th className="px-3 py-2.5 font-semibold">Platform</th>
                <th className="px-3 py-2.5 font-semibold">Country</th>
                <th className="px-3 py-2.5 font-semibold">Main focus</th>
                <th className="px-3 py-2.5 font-semibold">Who buys it</th>
                <th className="px-3 py-2.5 font-semibold">Pricing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-foreground/85">
              <tr>
                <td className="px-3 py-3 align-top">
                  <div className="font-semibold text-teal-700 dark:text-teal-300">Unifrog</div>
                  <div className="text-[11px] text-muted-foreground/70">unifrog.org</div>
                </td>
                <td className="px-3 py-3 align-top">UK-led, ~110 countries via international schools</td>
                <td className="px-3 py-3 align-top">End-to-end school progression: exploration → recording achievements → applications (university, apprenticeships)</td>
                <td className="px-3 py-3 align-top">Schools (ages 4–18, teachers & counsellors)</td>
                <td className="px-3 py-3 align-top">School subscription</td>
              </tr>
              <tr>
                <td className="px-3 py-3 align-top">
                  <div className="font-semibold text-teal-700 dark:text-teal-300">Xello</div>
                  <div className="text-[11px] text-muted-foreground/70">xello.world</div>
                </td>
                <td className="px-3 py-3 align-top">USA, Canada, UK</td>
                <td className="px-3 py-3 align-top">K-12 college and career readiness — university, trade, military, career options</td>
                <td className="px-3 py-3 align-top">School districts (kindergarten → high school)</td>
                <td className="px-3 py-3 align-top">Institutional only</td>
              </tr>
              <tr>
                <td className="px-3 py-3 align-top">
                  <div className="font-semibold text-teal-700 dark:text-teal-300">CareerExplorer</div>
                  <div className="text-[11px] text-muted-foreground/70">careerexplorer.com</div>
                </td>
                <td className="px-3 py-3 align-top">USA-led, global web</td>
                <td className="px-3 py-3 align-top">Personality &amp; aptitude assessment with career matches; broad audience</td>
                <td className="px-3 py-3 align-top">Individuals — students, professionals, career changers</td>
                <td className="px-3 py-3 align-top">Free quiz, paid annual membership</td>
              </tr>
              <tr>
                <td className="px-3 py-3 align-top">
                  <div className="font-semibold text-teal-700 dark:text-teal-300">Find Their Path</div>
                  <div className="text-[11px] text-muted-foreground/70">findtheirpath.com</div>
                </td>
                <td className="px-3 py-3 align-top">North America (high schools)</td>
                <td className="px-3 py-3 align-top">Science-backed teen assessment with personalised matches; parent-facing guidance</td>
                <td className="px-3 py-3 align-top">Parents + their teen (grades 9–12)</td>
                <td className="px-3 py-3 align-top">One-time payment (~$47–97)</td>
              </tr>
              <tr className="bg-teal-500/[0.04]">
                <td className="px-3 py-3 align-top">
                  <div className="font-bold text-foreground">Endeavrly</div>
                  <div className="text-[11px] text-muted-foreground/70">endeavrly.no</div>
                </td>
                <td className="px-3 py-3 align-top">Norway-first, Nordics-next</td>
                <td className="px-3 py-3 align-top">15–23 youth career discovery + first-job marketplace + safety-by-design messaging + transparent matching</td>
                <td className="px-3 py-3 align-top">Direct-to-youth and family (no school licence required)</td>
                <td className="px-3 py-3 align-top">Free for youth; commercial model in development</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-semibold mt-6 mb-3">How we differ</h3>
        <Bullets
          items={[
            "Direct-to-family, not school-locked — Unifrog and Xello only reach a student if their school buys a licence. A young person whose school has no contract simply has no access. We open the front door directly to the student and their parents.",
            "Built for the Nordic context — Norwegian university programmes via utdanning.no, salary ranges grounded in SSB labour stats, NAV outlook signals, Norwegian apprenticeship pathways. Generic global tools don't speak fluently about Bachelor-Master 3+2 routes, fagbrev, or vidergående subject choices.",
            "Safety architecture from line one — we are designed for minors. No free-text chat between minors and adults, verified employers, no in-app payments, guardian consent first-class. Generic platforms bolt safety on; ours is structural.",
            "Transparent matching, not assessment-quiz lottery — every match is explainable in plain English (\"matches your interest in Chemistry\", \"hands-on work, which you said you enjoy\"). CareerExplorer-style personality quizzes give a result with no audit trail.",
            "First-job marketplace inside the same product — a student doesn't just learn that being a vet involves dogs; they can take a small dog-walking job nearby this weekend. Career exploration and real-world experience live in one app, not separate silos.",
            "No engagement traps — no streaks, leaderboards, infinite scroll, or notification spam. We are deliberately uncompetitive with TikTok and Instagram for attention, and that is the point.",
          ]}
        />

        <h3 className="text-base font-semibold mt-6 mb-3">The Nordic / European gap</h3>
        <p className="text-foreground/85 leading-relaxed mb-3">
          Every platform in the table above was built for an Anglophone, school-driven market. None of them are based in the Nordics, none of them run on Norwegian / Nordic labour data, and none of them treat the parent-and-teen pair as a primary unit.
        </p>
        <p className="text-foreground/85 leading-relaxed">
          The result is a clear gap. A 17-year-old in Oslo, Bergen, or Stavanger thinking about whether to pursue medicine, become a sjømann, train as an electrician, or take an unconventional path through utdanning.no has, today, no native digital companion. They get either generic North American advice they need to translate, or paper-based career-counsellor sessions delivered too late. The opportunity is to build that companion — first for Norway, then the broader Nordics, then meaningful European reach where the labour market and education system specifics matter just as much.
        </p>
      </section>

      {/* ─── 8. What's Next ────────────────────────────────────── */}
      <section id="section-08" className="mb-14 scroll-mt-24">
        <SectionHeader number="08" title="What's Next" />
        <Bullets
          items={[
            "Deeper integration of parent-contributed Real Career Paths into every Clarity tab, so students see the path walked before in non-linear ways.",
            "Richer regional data (Norway first, then broader Nordics) for university programmes, grade requirements, and real local job markets.",
            "Continued tuning of the matching engine based on observed student behaviour — within the constraint that it remains transparent and explainable.",
            "A lightweight school-facing mode for careers advisors to see anonymised, aggregated cohort trends — without ever identifying individual students.",
            "Expanded language support (currently English and Norwegian) with a strict translation-cache policy so the product stays fast.",
          ]}
        />
      </section>

      {/* ─── 9. What We Are Not ────────────────────────────────── */}
      <section id="section-09" className="mb-14 scroll-mt-24">
        <SectionHeader
          number="09"
          title="A Note on What We Are Not"
          subtitle="Clarity about boundaries."
        />
        <div className="grid md:grid-cols-2 gap-3">
          {[
            [
              "Not a gig economy platform",
              "No bidding, no ratings, no public profiles for sale.",
            ],
            [
              "Not a social network",
              "No followers, no feed, no likes.",
            ],
            [
              "Not a freelance marketplace",
              "Adults cannot source paid labour from minors through the platform.",
            ],
            [
              "Not an AI coach",
              "We do not make life decisions for young people. Every signal is visible and editable.",
            ],
            [
              "Not trying to maximise time-on-app",
              "A student who gets the clarity they came for and closes the app is a successful student.",
            ],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-lg border border-red-500/20 bg-red-500/[0.03] p-4"
            >
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
                ✕ {title}
              </p>
              <p className="text-xs text-foreground/75 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Closing ───────────────────────────────────────────── */}
      <section className="mb-8 pt-8 border-t border-border/40">
        <div className="text-center">
          <p className="text-base font-medium text-foreground/90 mb-1">
            Thank you for taking the time to read this.
          </p>
          <p className="text-sm text-muted-foreground">— The Endeavrly team</p>
        </div>
      </section>
    </article>
  );
}

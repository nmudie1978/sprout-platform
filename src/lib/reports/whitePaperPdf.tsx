import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// Calm, trustworthy palette — mirrors the on-screen white paper.
const colors = {
  ink: "#0F172A",
  muted: "#475569",
  subtle: "#64748B",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  surfaceAlt: "#F1F5F9",
  divider: "#E2E8F0",
  teal: "#0D9488",
  tealLight: "#CCFBF1",
  tealDark: "#0F766E",
  rose: "#E11D48",
  amber: "#D97706",
  emerald: "#059669",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    paddingTop: 44,
    paddingBottom: 50,
    paddingHorizontal: 48,
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 1.55,
    color: colors.ink,
  },
  // ── Hero / title ──
  eyebrow: {
    fontFamily: "Inter",
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: colors.teal,
    marginBottom: 10,
  },
  h1: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 28,
    lineHeight: 1.15,
    color: colors.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "Poppins",
    fontWeight: 500,
    fontSize: 14,
    lineHeight: 1.3,
    color: colors.muted,
    marginBottom: 8,
  },
  byline: {
    fontSize: 9,
    color: colors.subtle,
  },
  hero: {
    marginBottom: 28,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  // ── Sections ──
  sectionWrap: {
    marginBottom: 22,
  },
  sectionNumber: {
    fontFamily: "Inter",
    fontSize: 8,
    letterSpacing: 1.4,
    color: colors.teal,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  sectionTitle: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 9,
    color: colors.muted,
    marginBottom: 10,
  },
  // ── Prose ──
  para: {
    fontSize: 10,
    lineHeight: 1.55,
    color: colors.ink,
    marginBottom: 8,
  },
  strong: {
    fontFamily: "Inter",
    fontWeight: 500,
  },
  // ── Lists ──
  bulletRow: {
    flexDirection: "row",
    marginBottom: 4,
    paddingRight: 6,
  },
  bulletMark: {
    width: 12,
    fontSize: 10,
    color: colors.teal,
    lineHeight: 1.55,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.55,
    color: colors.ink,
  },
  // ── Card-style blocks ──
  cardGrid: {
    flexDirection: "column",
    gap: 8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    padding: 10,
    borderLeftWidth: 2,
    borderLeftColor: colors.teal,
  },
  cardTitle: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 11,
    color: colors.ink,
    marginBottom: 3,
  },
  cardBody: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: colors.muted,
  },
  // ── Callout ──
  callout: {
    backgroundColor: colors.tealLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.teal,
    padding: 10,
    borderRadius: 3,
    marginVertical: 8,
  },
  calloutText: {
    fontSize: 9.5,
    lineHeight: 1.55,
    color: colors.tealDark,
  },
  // ── Do / Don't tiles ──
  doDontTitle: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 10,
    color: colors.rose,
    marginBottom: 2,
  },
  doDontBody: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: colors.muted,
  },
  doDontCard: {
    borderWidth: 0.5,
    borderColor: colors.rose,
    borderRadius: 3,
    padding: 8,
    marginBottom: 6,
  },
  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: colors.divider,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: colors.subtle,
  },
  // ── Inline tag ──
  tag: {
    fontSize: 9,
    color: colors.teal,
    fontFamily: "Inter",
    fontWeight: 500,
  },
});

// ── Helper components ────────────────────────────────────────────

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow} wrap={false}>
      <Text style={styles.bulletMark}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

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
    <View wrap={false}>
      <Text style={styles.sectionNumber}>{number}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card} wrap={false}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{children}</Text>
    </View>
  );
}

// ── White paper document ─────────────────────────────────────────

export function WhitePaperPdf() {
  return (
    <Document
      title="Endeavrly — White Paper"
      author="Endeavrly"
      subject="A safer, smarter way for young people to explore careers and first jobs."
    >
      <Page size="A4" style={styles.page}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>White Paper · April 2026</Text>
          <Text style={styles.h1}>Endeavrly</Text>
          <Text style={styles.subtitle}>
            A safer, smarter way for young people to explore careers and first
            jobs.
          </Text>
          <Text style={styles.byline}>
            Prepared for parents, investors, educators, and school leaders.
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.sectionWrap}>
          <SectionHeader number="Executive Summary" title="What it is" />
          <Text style={styles.para}>
            A career discovery and first-job platform built specifically for
            young people aged 15 to 23. It helps students understand who they
            are, explore careers that genuinely fit them, find meaningful early
            work, and build a realistic roadmap toward a fulfilling adult life
            — without exposing them to the risks of general-purpose social and
            freelance platforms.
          </Text>
          <Text style={styles.para}>
            Three non-negotiable commitments shape the product: safety by
            design, privacy by default, and exploration before pressure. No
            in-app payments. No direct free-text chat between minors and
            adults. No behavioural advertising, no popularity metrics, no
            social scoring. Every screen is calibrated to reduce anxiety and
            encourage curiosity — not to maximise engagement for its own sake.
          </Text>
          <Text style={styles.para}>
            Under the hood: a transparent rules-based matching engine,
            age-aware readiness modelling, and a calm, guided narrative
            experience that walks the student through their own future in a
            single session — not across years of forced engagement.
          </Text>
        </View>

        {/* 01 Problem */}
        <View style={styles.sectionWrap}>
          <SectionHeader number="01" title="The Problem We're Solving" />
          <Text style={styles.para}>
            Today&rsquo;s 15- to 23-year-olds inherit a paradox. They have more
            information about careers than any generation in history — and yet
            youth career uncertainty, anxiety, and drift are higher than ever.
            The dominant tools available to them are not built for their stage
            of life.
          </Text>
          <Bullet>
            Social platforms optimise for engagement, not clarity, and expose
            minors to open messaging, public popularity signals, and
            algorithmic pressure.
          </Bullet>
          <Bullet>
            Freelance and gig platforms assume the user is an adult contractor,
            route money through in-app rails, and treat users as transactional
            suppliers.
          </Bullet>
          <Bullet>
            Careers advice websites are static, often outdated, and rarely
            tailored to a specific country, age, or academic pathway.
          </Bullet>
          <Bullet>
            School careers guidance is under-resourced in most countries and
            often reaches students too late — after subject choices have
            already been made.
          </Bullet>
          <Text style={styles.para}>
            The platform exists on a single premise: exploration should be
            safe, structured, personal, and honest. A student should spend an
            hour on the platform and leave with a clearer sense of where they
            are, what realistically fits them, and what a concrete next step
            looks like — without being sold anything, tracked for profit, or
            exposed to strangers.
          </Text>
        </View>
      </Page>

      {/* ── Page 2 ─────────────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        {/* 02 Principles */}
        <View style={styles.sectionWrap}>
          <SectionHeader number="02" title="Three Core Principles" />

          <View style={styles.cardGrid}>
            <Card title="Safety by Design">
              Built from the ground up for minors. Verified adult accounts
              before posting, one-tap report on every profile and job,
              guardian consent first-class. No free-text chat between minors
              and adults. No in-app payments.
            </Card>
            <Card title="Exploration Before Pressure">
              Young people don&rsquo;t need gamification — they need room to
              think. No followers, likes, leaderboards, streaks, or infinite
              scroll. No &ldquo;falling behind&rdquo; messaging.
            </Card>
            <Card title="Transparent Matching">
              Deterministic, rules-based scoring. Every match is explainable
              in plain English. AI is used narrowly, never as the primary
              engine for a life-shaping recommendation. Auditable logic,
              configurable weights.
            </Card>
          </View>
        </View>

        {/* 03 Modules */}
        <View style={styles.sectionWrap}>
          <SectionHeader
            number="03"
            title="Module-by-Module Walkthrough"
            subtitle="Nine surfaces, each answering a specific question a young person might ask."
          />

          <View style={styles.cardGrid}>
            <Card title="Dashboard — Where am I right now?">
              Compact progress across Discover → Understand → Clarity for the
              current goal. Career snapshot, gentle self-portrait, explored
              journeys history, saved careers and small jobs, sparse discovery
              nudges, rotating research-backed facts.
            </Card>
            <Card title="Career Radar — What careers actually fit me?">
              A personalised map positioned by preference alignment. Discovery
              quiz captures subjects, work style, people preference, and
              interests. Compare 2–3 careers side-by-side. Saved comparisons
              edge tray for quick recall.
            </Card>
            <Card title="My Journey — What does this career mean for me?">
              Three stages: Discover (day in the life, calm intro), Understand
              (role reality, education programmes, tools of the trade),
              Clarity (personal roadmap, voice-guided simulation, momentum
              actions, real career path contributions from professionals).
              Single-predicate confirmation gating each stage — no multi-step
              completion ladders.
            </Card>
            <Card title="AI Career Advisor — Can I ask a specific question?">
              Goal-aware chatbot with conversation history. Safety guardrails
              appropriate for minors: no medical, legal, or financial advice;
              defers to human professionals for serious concerns.
            </Card>
            <Card title="Micro-Job Marketplace — My first work experience">
              Local, age-appropriate jobs posted by verified adults.
              Geolocated, filterable, with a map view. Structured messaging
              (predefined prompts only). Earnings dashboard. Payments happen
              outside the platform — by design. Every posting has a Report
              button.
            </Card>
            <Card title="Industry Insights — What does the real world look like?">
              Global Lens, Youth Lens, Dig Deeper, Go Further. Evidence-linked
              facts with a freshness policy that flags stale data.
            </Card>
            <Card title="Career Events — Where can I learn more in person?">
              Curated feed of verified events filtered by career interest.
            </Card>
            <Card title="Parent / Guardian Dashboard">
              First-class, calm, non-surveillant. Visibility of the
              child&rsquo;s exploration, job applications, safety reports,
              guardian consent flow. Dedicated contribution channel at
              /contribute — professionals and parents share their real career
              timelines, moderated and shown back to students in Clarity as
              Real Career Paths.
            </Card>
            <Card title="Profile & Growth — What have I told the platform?">
              Single place for display name, country, avatar, goals, discovery
              preferences, and safety settings. Every signal used to
              personalise is visible and editable. No hidden profile, no
              shadow metrics.
            </Card>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Endeavrly — White Paper · April 2026</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* ── Page 3 ─────────────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        {/* 04 Matching Engine */}
        <View style={styles.sectionWrap}>
          <SectionHeader
            number="04"
            title="How the Matching Engine Works"
            subtitle="In plain English — because trustworthiness matters."
          />
          <Text style={styles.para}>
            Endeavrly uses a hybrid matching engine combining four layers. The
            whole design is built so that any match shown to a student can be
            explained in plain language, without pointing at an opaque AI.
          </Text>

          <View style={styles.cardGrid}>
            <Card title="1. Career attribute model">
              Every career has structured attributes: which school subjects it
              relates to, whether it&rsquo;s desk / hands-on / outdoors /
              creative, how people-facing, how analytical, what academic
              pathway it needs, salary band, growth, and sector.
            </Card>
            <Card title="2. User preference profile">
              Answers from the &ldquo;What I like&rdquo; quiz are mapped into
              the same structured dimensions. Each answer becomes a signal the
              scorer can use.
            </Card>
            <Card title="3. Weighted scoring engine">
              The student&rsquo;s profile is compared to every career along
              every dimension. Subject match weighs most (~42% of the total),
              then work style, people preference, creative vs analytical,
              variety, and academic accessibility. Weights live in a single
              configuration file — tunable without touching scoring logic.
            </Card>
            <Card title="4. Diversity layer">
              After scoring, results are rebalanced so no single category can
              dominate more than 45% of the top results. Reserved discovery
              slots surface careers that score surprisingly high on one or two
              dimensions — careers the student might otherwise never have
              considered.
            </Card>
          </View>

          <View style={styles.callout}>
            <Text style={styles.calloutText}>
              Age-aware by default. If a 17-year-old says they finish school in
              2027, the engine anchors the first post-school step to 2027 —
              not to their current age. No student can be shown a
              university step that starts before they&rsquo;ve left school.
            </Text>
          </View>
        </View>

        {/* 05 Safety & Privacy */}
        <View style={styles.sectionWrap}>
          <SectionHeader number="05" title="Safety & Privacy Commitments" />

          <View style={styles.cardGrid}>
            <Card title="Data minimisation (GDPR-aligned)">
              Only the minimum data needed to serve the student. No sensitive
              profiling categories collected or inferred. No behavioural
              advertising. Export or delete data from the profile page.
            </Card>
            <Card title="Messaging safeguards">
              Minors cannot send or receive free-text from adults. All
              job-related communication uses predefined prompts. Reports feed
              a moderation queue monitored by the team.
            </Card>
            <Card title="No in-app payments">
              Endeavrly is not a payment processor. Work is agreed externally
              between the student and the adult. This structurally protects
              the platform from financial disputes and limits regulatory
              complexity typical of platforms involving minors and money.
            </Card>
            <Card title="Trust signals are internal">
              The platform tracks responsibility signals (turning up, clear
              communication, finishing the job) for the student&rsquo;s own
              growth. They are never displayed publicly, scored, or used to
              rank students.
            </Card>
            <Card title="Age-appropriate defaults">
              Dark mode default (calmer for most students). Professional
              certifications hidden from users under 20 unless explicitly
              requested. University-level steps never start before age 18 in
              any roadmap. Every real-world statistic tied to a published
              source with a freshness date.
            </Card>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Endeavrly — White Paper · April 2026</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* ── Page 4 ─────────────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        {/* 06 Technical Foundations */}
        <View style={styles.sectionWrap}>
          <SectionHeader
            number="06"
            title="Technical Foundations"
            subtitle="Boring where it needs to be, interesting only where the student will feel it."
          />
          <Text style={styles.para}>
            Endeavrly is built on a modern, production-grade stack chosen for
            security, scalability, and speed of iteration.
          </Text>
          <View style={styles.cardGrid}>
            <Card title="Next.js 14">App Router, React, TypeScript strict.</Card>
            <Card title="Supabase">
              Auth + Postgres, Row-Level Security enforced.
            </Card>
            <Card title="Prisma ORM">Type-safe database access.</Card>
            <Card title="Server Actions">
              No business logic in UI components.
            </Card>
            <Card title="OpenAI (narrow use)">
              TTS narration + AI Advisor, rate-limited.
            </Card>
            <Card title="Vitest · 464+ tests">
              Safety, age-policy, education-alignment on every deploy.
            </Card>
          </View>
        </View>

        {/* 07 Market */}
        <View style={styles.sectionWrap}>
          <SectionHeader
            number="07"
            title="Where We Sit in the Market"
            subtitle="Similar platforms exist globally — none built for the Nordic / European context, none built for individual youth and family use."
          />
          <Text style={styles.para}>
            Career-discovery platforms for young people are not a new category.
            A handful of established players serve North American and UK
            schools well.
          </Text>
          <View style={styles.cardGrid}>
            <Card title="Unifrog (UK-led)">
              End-to-end school progression: exploration → recording
              achievements → applications. School subscription, ages 4–18.
            </Card>
            <Card title="Xello (USA / Canada / UK)">
              K-12 college and career readiness. Sold to school districts.
            </Card>
            <Card title="CareerExplorer (USA-led, global web)">
              Personality &amp; aptitude assessment with career matches. Free
              quiz, paid annual membership.
            </Card>
            <Card title="Find Their Path (North America)">
              Science-backed teen assessment with parent-facing guidance.
              One-time payment.
            </Card>
            <Card title="Endeavrly (Norway-first, Nordics-next)">
              15–23 youth career discovery + first-job marketplace +
              safety-by-design messaging + transparent matching. Direct-to-youth
              and family — no school licence required. Free for youth.
            </Card>
          </View>

          <Text style={[styles.para, { marginTop: 8 }]}>
            <Text style={styles.strong}>How we differ.</Text>
          </Text>
          <Bullet>
            Direct-to-family, not school-locked — Unifrog and Xello only reach
            a student if their school buys a licence. We open the front door
            directly to the student and their parents.
          </Bullet>
          <Bullet>
            Built for the Nordic context — Norwegian university programmes via
            utdanning.no, salary ranges grounded in SSB labour stats, NAV
            outlook signals, fagbrev and videregående subject choices.
          </Bullet>
          <Bullet>
            Safety architecture from line one — we are designed for minors.
            Generic platforms bolt safety on; ours is structural.
          </Bullet>
          <Bullet>
            Transparent matching — every match is explainable in plain English.
            Personality quizzes give a result with no audit trail.
          </Bullet>
          <Bullet>
            First-job marketplace inside the same product — career exploration
            and real-world experience live in one app, not separate silos.
          </Bullet>
          <Bullet>
            No engagement traps — no streaks, leaderboards, infinite scroll,
            or notification spam. Deliberately uncompetitive with TikTok and
            Instagram for attention.
          </Bullet>
        </View>

        <View style={styles.footer} fixed>
          <Text>Endeavrly — White Paper · April 2026</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* ── Page 5 ─────────────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        {/* 08 What's Next */}
        <View style={styles.sectionWrap}>
          <SectionHeader number="08" title="What's Next" />
          <Bullet>
            Deeper integration of parent-contributed Real Career Paths into
            every Clarity tab, so students see the path walked before in
            non-linear ways.
          </Bullet>
          <Bullet>
            Richer regional data (Norway first, then broader Nordics) for
            university programmes, grade requirements, and real local job
            markets.
          </Bullet>
          <Bullet>
            Continued tuning of the matching engine based on observed student
            behaviour — within the constraint that it remains transparent and
            explainable.
          </Bullet>
          <Bullet>
            A lightweight school-facing mode for careers advisors to see
            anonymised, aggregated cohort trends — without ever identifying
            individual students.
          </Bullet>
          <Bullet>
            Expanded language support (currently English and Norwegian) with a
            strict translation-cache policy so the product stays fast.
          </Bullet>
        </View>

        {/* 09 What We Are Not */}
        <View style={styles.sectionWrap}>
          <SectionHeader
            number="09"
            title="A Note on What We Are Not"
            subtitle="Clarity about boundaries."
          />

          <View style={styles.doDontCard}>
            <Text style={styles.doDontTitle}>✕ Not a gig economy platform</Text>
            <Text style={styles.doDontBody}>
              No bidding, no ratings, no public profiles for sale.
            </Text>
          </View>
          <View style={styles.doDontCard}>
            <Text style={styles.doDontTitle}>✕ Not a social network</Text>
            <Text style={styles.doDontBody}>
              No followers, no feed, no likes.
            </Text>
          </View>
          <View style={styles.doDontCard}>
            <Text style={styles.doDontTitle}>✕ Not a freelance marketplace</Text>
            <Text style={styles.doDontBody}>
              Adults cannot source paid labour from minors through the
              platform.
            </Text>
          </View>
          <View style={styles.doDontCard}>
            <Text style={styles.doDontTitle}>✕ Not an AI coach</Text>
            <Text style={styles.doDontBody}>
              We do not make life decisions for young people. Every signal is
              visible and editable.
            </Text>
          </View>
          <View style={styles.doDontCard}>
            <Text style={styles.doDontTitle}>
              ✕ Not trying to maximise time-on-app
            </Text>
            <Text style={styles.doDontBody}>
              A student who gets the clarity they came for and closes the app
              is a successful student.
            </Text>
          </View>
        </View>

        {/* Closing */}
        <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: colors.divider, alignItems: "center" }}>
          <Text style={{ fontSize: 11, fontFamily: "Poppins", fontWeight: 500, color: colors.ink, marginBottom: 2 }}>
            Thank you for taking the time to read this.
          </Text>
          <Text style={{ fontSize: 9, color: colors.subtle }}>— The Endeavrly team</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>Endeavrly — White Paper · April 2026</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

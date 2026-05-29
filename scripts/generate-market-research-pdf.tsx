/* eslint-disable react/no-unescaped-entities */
import path from "path";
import fs from "fs/promises";
import React from "react";
import {
  Document,
  Font,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

// ─────────────────────────────────────────────────────────────────────
// Endeavrly — Deep Market Research Report (PDF, v2)
//
// v2 rewrite (2026-05-02): product framing clarified to a focused 7-
// feature career intelligence platform with no marketplace. Small Jobs
// removed entirely; AI Career Agent, Industry Insights, Compare
// Careers, Voice-narrated Roadmap Generator, and Parent Career
// Insights confirmed as core features alongside My Journey + Career
// Radar. Scoring updated where the new framing genuinely strengthens
// the case; underlying market data unchanged.
// ─────────────────────────────────────────────────────────────────────

const fontsDir = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "Poppins",
  fonts: [
    { src: path.join(fontsDir, "Poppins-Medium.ttf"), fontWeight: 500 },
    { src: path.join(fontsDir, "Poppins-SemiBold.ttf"), fontWeight: 600 },
  ],
});
Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(fontsDir, "Inter-Regular.ttf"), fontWeight: 400 },
    { src: path.join(fontsDir, "Inter-Medium.ttf"), fontWeight: 500 },
  ],
});

const c = {
  ink: "#0B1220",
  body: "#1F2937",
  muted: "#475569",
  subtle: "#64748B",
  faint: "#94A3B8",
  bg: "#FBFAF6",
  paper: "#FFFFFF",
  surface: "#F4F2ED",
  hairline: "#E2E8F0",
  hairlineSoft: "#EEF2F7",
  teal: "#0F766E",
  tealSoft: "#E6F4F1",
  tealInk: "#0B5E58",
  amber: "#B45309",
  amberSoft: "#FBF3E2",
  rose: "#BE123C",
  roseSoft: "#FBEAEE",
  emerald: "#047857",
  emeraldSoft: "#E8F5EE",
  cover: "#0B1220",
  coverInk: "#F8FAFC",
  coverMuted: "#94A3B8",
  coverAccent: "#14B8A6",
  coverRule: "#1E293B",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: c.bg,
    paddingTop: 56,
    paddingBottom: 60,
    paddingHorizontal: 50,
    fontFamily: "Inter",
    fontSize: 9.5,
    lineHeight: 1.55,
    color: c.body,
  },
  cover: {
    backgroundColor: c.cover,
    color: c.coverInk,
    paddingTop: 64,
    paddingBottom: 60,
    paddingHorizontal: 56,
    fontFamily: "Inter",
  },
  // ── Type
  displayXL: { fontFamily: "Poppins", fontWeight: 600, fontSize: 36, lineHeight: 1.08, color: c.ink, letterSpacing: -0.5 },
  displayCover: { fontFamily: "Poppins", fontWeight: 600, fontSize: 40, lineHeight: 1.05, color: c.coverInk, letterSpacing: -0.6 },
  h1: { fontFamily: "Poppins", fontWeight: 600, fontSize: 22, lineHeight: 1.18, color: c.ink, letterSpacing: -0.3 },
  h2: { fontFamily: "Poppins", fontWeight: 600, fontSize: 14, lineHeight: 1.25, color: c.ink },
  h3: { fontFamily: "Poppins", fontWeight: 600, fontSize: 11, lineHeight: 1.3, color: c.ink },
  lead: { fontSize: 11, color: c.muted, lineHeight: 1.55 },
  body: { fontSize: 9.5, color: c.body, lineHeight: 1.55, marginBottom: 6 },
  bodyTight: { fontSize: 9.5, color: c.body, lineHeight: 1.5 },
  bodyLg: { fontSize: 10, color: c.body, lineHeight: 1.6, marginBottom: 8 },
  bodyMuted: { fontSize: 9, color: c.muted, lineHeight: 1.5 },
  caption: { fontSize: 7.5, color: c.subtle, lineHeight: 1.45 },
  overline: { fontSize: 7.5, fontFamily: "Inter", fontWeight: 500, color: c.teal, textTransform: "uppercase", letterSpacing: 1 },
  label: { fontSize: 7.5, fontFamily: "Inter", fontWeight: 500, color: c.subtle, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 4 },
  strong: { fontFamily: "Inter", fontWeight: 500 },
  // ── Layout
  pageHeader: {
    position: "absolute", top: 22, left: 50, right: 50,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  pageHeaderText: { fontSize: 7, fontFamily: "Inter", fontWeight: 500, color: c.faint, letterSpacing: 0.7, textTransform: "uppercase" },
  pageFooter: {
    position: "absolute", bottom: 26, left: 50, right: 50,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: 6, borderTopWidth: 0.5, borderTopColor: c.hairline,
  },
  pageFooterText: { fontSize: 7.5, color: c.faint, letterSpacing: 0.4 },
  rule: { height: 0.75, backgroundColor: c.hairline, marginVertical: 12 },
  ruleStrong: { height: 1.25, backgroundColor: c.ink, marginVertical: 14 },
  ruleSoft: { height: 0.5, backgroundColor: c.hairlineSoft, marginVertical: 8 },
  // ── Bullets
  bulletRow: { flexDirection: "row", marginBottom: 4, paddingRight: 4 },
  bulletMark: { width: 10, fontSize: 9.5, color: c.teal, lineHeight: 1.55 },
  bulletText: { flex: 1, fontSize: 9.5, lineHeight: 1.55, color: c.body },
  numRow: { flexDirection: "row", marginBottom: 6 },
  numMark: { width: 18, fontSize: 9.5, color: c.teal, fontFamily: "Inter", fontWeight: 500, lineHeight: 1.55 },
  // ── Cards
  callout: {
    backgroundColor: c.tealSoft, borderLeftWidth: 2.5, borderLeftColor: c.teal,
    paddingVertical: 12, paddingHorizontal: 14, marginVertical: 10,
  },
  calloutLabel: {
    fontSize: 7, fontFamily: "Inter", fontWeight: 500, color: c.tealInk,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 4,
  },
  warning: {
    backgroundColor: c.roseSoft, borderLeftWidth: 2.5, borderLeftColor: c.rose,
    paddingVertical: 12, paddingHorizontal: 14, marginVertical: 10,
  },
  warningLabel: {
    fontSize: 7, fontFamily: "Inter", fontWeight: 500, color: c.rose,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 4,
  },
  insight: {
    backgroundColor: c.paper, borderWidth: 0.5, borderColor: c.hairline,
    paddingVertical: 11, paddingHorizontal: 12, marginBottom: 8,
  },
  // ── Tables
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 6, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: c.ink,
    backgroundColor: c.surface,
  },
  tableHeaderText: {
    fontSize: 7.5, fontFamily: "Inter", fontWeight: 500,
    color: c.ink, textTransform: "uppercase", letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7, paddingHorizontal: 4,
    borderBottomWidth: 0.5, borderBottomColor: c.hairline,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 7, paddingHorizontal: 4,
    borderBottomWidth: 0.5, borderBottomColor: c.hairline,
    backgroundColor: c.hairlineSoft,
  },
  tableCell: { fontSize: 8.5, color: c.body, lineHeight: 1.42 },
  tableCellStrong: { fontSize: 8.5, color: c.ink, lineHeight: 1.42, fontFamily: "Inter", fontWeight: 500 },
});

// ── Components ────────────────────────────────────────────────────

function PageFrame({
  children,
  section,
}: {
  children: React.ReactNode;
  section: string;
}) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.pageHeader} fixed>
        <Text style={s.pageHeaderText}>Endeavrly · Market Research v2</Text>
        <Text style={s.pageHeaderText}>{section}</Text>
      </View>
      {children}
      <View style={s.pageFooter} fixed>
        <Text style={s.pageFooterText}>Strictly Confidential · Founder Briefing · May 2026</Text>
        <Text
          style={s.pageFooterText}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </View>
    </Page>
  );
}

function SectionHeader({ number, title, lead }: { number: string; title: string; lead?: string }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={s.overline}>{number}</Text>
      <View style={{ height: 4 }} />
      <Text style={s.h1}>{title}</Text>
      <View style={{ height: 6, width: 36, backgroundColor: c.teal, marginTop: 8 }} />
      {lead ? <Text style={[s.lead, { marginTop: 12, maxWidth: 460 }]}>{lead}</Text> : null}
      <View style={{ height: 14 }} />
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.bulletRow}>
      <Text style={s.bulletMark}>•</Text>
      <Text style={s.bulletText}>{children}</Text>
    </View>
  );
}

function NumberedItem({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <View style={s.numRow}>
      <Text style={s.numMark}>{`${n}.`}</Text>
      <Text style={s.bulletText}>{children}</Text>
    </View>
  );
}

function Callout({
  label,
  children,
  block = false,
}: {
  label?: string;
  children: React.ReactNode;
  block?: boolean;
}) {
  return (
    <View style={s.callout} wrap={false}>
      {label ? <Text style={s.calloutLabel}>{label}</Text> : null}
      {block ? children : <Text style={[s.bodyTight, { color: c.tealInk }]}>{children}</Text>}
    </View>
  );
}

function Warning({
  label,
  children,
  block = false,
}: {
  label?: string;
  children: React.ReactNode;
  block?: boolean;
}) {
  return (
    <View style={s.warning} wrap={false}>
      {label ? <Text style={s.warningLabel}>{label}</Text> : null}
      {block ? children : <Text style={[s.bodyTight, { color: c.ink }]}>{children}</Text>}
    </View>
  );
}

function Insight({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.insight} wrap={false}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.bodyTight}>{children}</Text>
    </View>
  );
}

function ScoreGrid({
  items,
}: {
  items: Array<{ label: string; score: number; tone?: "neutral" | "good" | "warn" | "bad" }>;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
      {items.map((item, i) => {
        const bg =
          item.tone === "good"
            ? c.emeraldSoft
            : item.tone === "warn"
              ? c.amberSoft
              : item.tone === "bad"
                ? c.roseSoft
                : c.surface;
        const ink =
          item.tone === "good"
            ? c.emerald
            : item.tone === "warn"
              ? c.amber
              : item.tone === "bad"
                ? c.rose
                : c.ink;
        return (
          <View
            key={i}
            style={{
              width: "31%",
              backgroundColor: bg,
              padding: 10,
              borderLeftWidth: 2,
              borderLeftColor: ink,
            }}
            wrap={false}
          >
            <Text style={[s.label, { color: ink, marginBottom: 6 }]}>{item.label}</Text>
            <Text style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 22, color: ink, lineHeight: 1.1 }}>
              {item.score}
              <Text style={{ fontFamily: "Poppins", fontWeight: 500, fontSize: 11, color: ink, opacity: 0.7 }}>
                {" / 10"}
              </Text>
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Cover Page ────────────────────────────────────────────────────

function CoverPage() {
  return (
    <Page size="A4" style={s.cover}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 36 }}>
        <View
          style={{ width: 8, height: 8, backgroundColor: c.coverAccent, transform: "rotate(45deg)" }}
        />
        <Text
          style={{
            fontSize: 9, fontFamily: "Inter", fontWeight: 500,
            color: c.coverInk, letterSpacing: 1.4, textTransform: "uppercase",
          }}
        >
          Endeavrly
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 8, color: c.coverAccent, letterSpacing: 1.6,
            textTransform: "uppercase", fontFamily: "Inter", fontWeight: 500,
            marginBottom: 24,
          }}
        >
          Deep Market Research v2 · May 2026
        </Text>
        <Text style={s.displayCover}>
          A focused career-intelligence platform for 15–23 year olds. Honest read on whether it scales globally — and where the moats actually live.
        </Text>
        <View style={{ height: 40 }} />
        <View style={{ width: 60, height: 2.5, backgroundColor: c.coverAccent, marginBottom: 18 }} />
        <Text style={{ fontSize: 12, color: c.coverInk, lineHeight: 1.55, maxWidth: 420 }}>
          A brutally honest, investment-grade assessment of seven product surfaces, country-specific data depth, and the founder's strategic options.
        </Text>
        <View style={{ height: 28 }} />
        <Text style={{ fontSize: 9, color: c.coverMuted, lineHeight: 1.5, maxWidth: 380 }}>
          Prepared like a top-tier strategy consultant, VC investor, EdTech founder, youth psychologist, trust &amp; safety expert, and product growth strategist would prepare it — for someone risking real capital.
        </Text>
      </View>

      <View
        style={{
          paddingTop: 18, borderTopWidth: 0.75, borderTopColor: c.coverRule,
          flexDirection: "row", justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 8, color: c.coverMuted, letterSpacing: 0.5 }}>
          Founder Briefing · Strictly Confidential
        </Text>
        <Text style={{ fontSize: 8, color: c.coverMuted, letterSpacing: 0.5 }}>
          14 sections · evidence-led · scored
        </Text>
      </View>
    </Page>
  );
}

// ── Section content ────────────────────────────────────────────────

function ProductFraming() {
  return (
    <PageFrame section="Product Framing">
      <SectionHeader
        number="What is Endeavrly"
        title="A focused 7-feature career-intelligence platform — no marketplace, no jobs, no gimmicks."
        lead="The essence: easy, quick, intuitive access to country-specific career data — packaged so a 15–23 year-old gets a rounded perspective on ANY job, how to attain it, and the realistic timeline to get there. Calm, structured, country-aware. Not entertainment. Not algorithmic chaos."
      />

      <Text style={s.h2}>The seven product surfaces</Text>
      <View style={{ height: 8 }} />
      <NumberedItem n={1}>
        <Text style={s.strong}>My Journey</Text> — the structured Discover → Understand → Clarity flow that walks the student through a career end-to-end with confirmation gating between stages.
      </NumberedItem>
      <NumberedItem n={2}>
        <Text style={s.strong}>Career Radar</Text> — preference-driven discovery + match% scoring, surfacing careers that genuinely fit the student rather than ones they've already heard of.
      </NumberedItem>
      <NumberedItem n={3}>
        <Text style={s.strong}>AI Career Agent</Text> — conversational, age-appropriate, country-aware. Not a generic ChatGPT wrapper — answers grounded in the platform's structured data with safeguarding guardrails.
      </NumberedItem>
      <NumberedItem n={4}>
        <Text style={s.strong}>Industry Insights</Text> — sector-level labour-market data, growth signals, salary trends, future-of-work indicators. Calm, data-led, not clickbait.
      </NumberedItem>
      <NumberedItem n={5}>
        <Text style={s.strong}>Compare Careers</Text> — side-by-side analysis of 2–3 careers (salary, education, day-to-day, outlook) so students can answer "doctor vs physiotherapist?" without spreadsheets.
      </NumberedItem>
      <NumberedItem n={6}>
        <Text style={s.strong}>Voice-narrated Roadmap Generator</Text> — the AI-generated, age-anchored timeline, played back as a guided narration. Differentiated against every checklist-style competitor.
      </NumberedItem>
      <NumberedItem n={7}>
        <Text style={s.strong}>Career Insights from parents / adults</Text> — moderated real-life career timelines contributed by professionals. The corpus that makes the platform feel like advice from someone you trust, not a textbook.
      </NumberedItem>

      <View style={{ height: 8 }} />
      <Callout label="What this is NOT">
        Not a small-jobs marketplace. Not a gig platform. Not a social network. Not a TikTok-style career feed. Not gamified. There are no public ratings, no streaks, no follower counts, no payment rails. The product is a calm, structured intelligence layer — and that constraint is the brand.
      </Callout>

      <View style={{ height: 6 }} />
      <Text style={s.h2}>Why the seven surfaces matter as a system</Text>
      <View style={{ height: 6 }} />
      <Bullet>
        Each feature compounds the others. Career Radar feeds My Journey. My Journey feeds the Roadmap. The Roadmap feeds the AI Agent's context. Industry Insights and Parent Insights are the credibility ballast under the AI's outputs. Compare Careers is the cross-feature decision surface. Pull any one and the system loses coherence.
      </Bullet>
      <Bullet>
        The moat is the wrap, not any single feature. SchooLinks can build voice narration. Unifrog can build AI chat. Naviance can buy a personality quiz. None of them is going to build all seven, with country-specific data depth, and a privacy-first posture, in 12 months. The integrated coherence is what compounds.
      </Bullet>
      <Bullet>
        Country-specific data is the commitment. The product's promise — &ldquo;rounded perspective of ANY job in YOUR country&rdquo; — implies a real per-country data investment. Nordic data is in. UK requires UCAS / apprenticeships work. Each new country is a deliberate strategic move, not a quick localisation pass.
      </Bullet>
    </PageFrame>
  );
}

function ExecSummary() {
  return (
    <PageFrame section="Executive Summary">
      <SectionHeader
        number="Executive Summary"
        title="A genuine, focused product with a clear category lane."
        lead="The Small-Jobs ambiguity is gone. Endeavrly is now unambiguously a career-intelligence platform — the same problem space as Unifrog / Naviance / SchooLinks, but with a structurally different product wrap. The honest verdict: pursue with discipline as a UK + Nordic regional category leader, with credible international expansion paths after country #3."
      />

      <Text style={s.h2}>The headline</Text>
      <View style={{ height: 8 }} />
      <Text style={s.bodyLg}>
        <Text style={s.strong}>Globally compelling? Yes — at the problem level.</Text> 40% of 15-year-olds globally are uncertain about their careers, double the rate of a decade ago (OECD PISA 2022, released May 2025). 957,000 UK youth are NEET (Oct–Dec 2025) — the worst since 2014. 44% of US graduates regret their major. #CareerTok has 2B+ views; 41% of Gen Z make career decisions from TikTok content, but 55% admit following misleading advice. The pain is real, rising, and trans-regional — and the supply of trustworthy, structured, country-aware alternatives is conspicuously thin.
      </Text>
      <Text style={s.bodyLg}>
        <Text style={s.strong}>Commercially compelling? More so than v1 of this report concluded.</Text> Removing the small-jobs marketplace narrows the product from a hybrid to a focused intelligence platform — which is the ONE thing the strategic-buyer market (EAB, PowerSchool, Cognia, Pearson, Manifest) actually pays cash for. Direct comp Unifrog ($22.4M revenue, profitable, bootstrapped, 60%+ UK state schools) is the floor. SchooLinks (most heavily funded modern entrant — $80M Series B Oct 2024) is the ceiling. Endeavrly's seven-surface wrap is structurally distinct from both.
      </Text>

      <Callout label="Honest commercial verdict">
        Endeavrly is realistically a $25–80M revenue regional-then-international category leader in five years with disciplined execution — UK schools first, Nordic data depth as moat, country-by-country expansion thereafter. Strategic acquisition by EAB / PowerSchool / Cognia / Pearson / Manifest at 4–6× ARR ($100–400M exit) is plausible. A $1B+ unicorn outcome would require either pivoting toward enterprise upskilling (Multiverse model — now 90% B2B corporate revenue) or scaling to 10+ countries with deep data in each, which is a different capital story. The product as currently scoped is a high-quality category-leader candidate, not a moonshot.
      </Callout>

      <View style={{ height: 6 }} />
      <Text style={s.h2}>Three reasons it succeeds</Text>
      <View style={{ height: 6 }} />
      <NumberedItem n={1}>
        <Text style={s.strong}>The product is now unambiguously a category leader candidate.</Text> Removing Small Jobs makes the pitch coherent: seven complementary surfaces that together produce &ldquo;a rounded perspective on any job&rdquo;. Procurement teams, parents, and employers all understand the product in 30 seconds. Investors stop asking &ldquo;wait, is this a gig platform?&rdquo;
      </NumberedItem>
      <NumberedItem n={2}>
        <Text style={s.strong}>Trust + structure beats algorithmic chaos.</Text> CareerTok's 2B+ views prove demand. ResumeBuilder 2025: 92% of Gen Z trust TikTok career content but 55% admit it misled them. The market is starving for the calm, structured, parent-safe, country-anchored alternative. The PowerSchool / Naviance $17.25M settlement (Feb 2026) just made privacy posture a procurement filter — Endeavrly walks past three competitor disqualifiers on day one.
      </NumberedItem>
      <NumberedItem n={3}>
        <Text style={s.strong}>The seven-surface wrap is the moat.</Text> Any single feature is copyable. The integrated set — country-specific data + voice narration + parent corpus + AI agent grounded in structured data + industry insights + compare + journey — is not. Building all seven coherently with safeguarding from day one is a 24-month head start nobody is currently sprinting toward.
      </NumberedItem>

      <View style={{ height: 8 }} />
      <Text style={s.h2}>Three reasons it fails</Text>
      <View style={{ height: 6 }} />
      <NumberedItem n={1}>
        <Text style={s.strong}>Country-data scaling cost compounds faster than revenue.</Text> The product's essence — &ldquo;rounded perspective of ANY job in YOUR country&rdquo; — implies real per-country data investment. Nordics is cheap (gov APIs). UK adds 8–12 weeks plus UCAS feeds. US has no national programme dataset. India is unbounded. Trying to be &ldquo;all countries&rdquo; without sequencing capital to match is the most likely failure mode.
      </NumberedItem>
      <NumberedItem n={2}>
        <Text style={s.strong}>School B2B is still 6–18 month sales cycles against entrenched incumbents.</Text> Naviance covers 35–40% of US high schools. Unifrog 60%+ of UK state schools. SchooLinks just raised $80M to fast-follow on AI. The seven-surface wrap differentiates the demo, not the procurement RFP — schools still buy on Gatsby reporting, SIMS integration, and safeguarding documentation.
      </NumberedItem>
      <NumberedItem n={3}>
        <Text style={s.strong}>The AI Career Agent puts you closer to the ChatGPT substitution zone.</Text> Chegg's collapse (7.8M → 2.6M subscribers in 24 months) shows what happens when generic AI commoditises a category. Endeavrly's wrap differentiates against that risk — country data + parent corpus + safeguarding — but only if the wrap actually drives engagement. If users prefer raw ChatGPT for speed, the AI Agent surface becomes the Achilles heel of the product, not a strength.
      </NumberedItem>

      <View style={{ height: 6 }} />
      <Warning label="Single sentence">
        This is a real, focused product solving a real problem in a category with real money — and v2's framing turns it from a hybrid concept into an unambiguous category-leader candidate. The execution gravity is now country-data scale, AI-agent retention, and patient B2B revenue.
      </Warning>
    </PageFrame>
  );
}

function ProblemValidation() {
  return (
    <PageFrame section="Problem Validation">
      <SectionHeader
        number="01"
        title="Yes — and the data is not subtle."
        lead="On every dimension the user flagged — uncertainty, anxiety, education-choice confusion, peer pressure — youth pain is measurable, rising, and durable. The question is intensity by region, which determines where to point the company first."
      />

      <Insight label="Future uncertainty">
        OECD PISA 2022 (released May 2025, 690,000 teens, 81 countries): ~40% of 15-year-olds are uncertain about future careers — double the figure from a decade ago. UK has deteriorated fastest: career uncertainty rose from 24.6% (2018) to 46.4% (2025), placing it among the worst-rated of 80 OECD countries (Education and Employers, 2025). Norway is &ldquo;now very high&rdquo; per OECD Working Paper 330 (April 2025), despite world-class state infrastructure.
      </Insight>
      <Insight label="Poor career guidance">
        UK counsellor-to-student ratios are not the binding constraint — the issue is content quality. Ofsted (2025) found careers advice &ldquo;ad-hoc and generic&rdquo; and &ldquo;tick-box&rdquo; for disadvantaged students despite the Gatsby framework. US: ASCA-recommended counsellor:student ratio is 250:1; actual national average is 372:1. India is the global outlier — one trained counsellor per ~3,000 students; only 13.2% of Indian students receive any professional career counselling; 90% choose careers blindly. (India Career Centre, 2024)
      </Insight>
      <Insight label="Lack of real-world visibility">
        OECD: most 15-year-olds globally have no employer or workplace contact. CareerTok exists precisely because the supply gap is real — 70% of Gen Z use TikTok for career advice, 41% have made career decisions from it, but 55% admit following misleading advice (ResumeBuilder, 2025). Demand for visibility is overwhelming; the supply is unvetted. Endeavrly's parent-insights corpus is the structural answer to that gap.
      </Insight>
      <Insight label="Pressure / anxiety">
        Deloitte Gen Z &amp; Millennial Survey 2025: 40% of Gen Zs feel stressed/anxious all or most of the time; 47% specifically worry about not being ready for life after school. UK BACP Mindometer 2025 cites career uncertainty as a leading driver of youth therapy demand. UNICEF UK (2024): 90% of GB parents are worried about their children's future life chances.
      </Insight>
      <Insight label="Confusing education choices">
        US: 30% of bachelor's students change major in first three years; 10% change more than once (NCES). 44% of job-seeking US graduates regret their major (BestColleges, 2025); top regrets are Journalism (87%), Sociology (72%), Liberal Arts (72%). 47% of US college students have seriously considered changing majors specifically due to AI displacement risk (CNBC / Intelligent.com, April 2026). UK: 50% of youth chase just 10 jobs; 5× more want arts/sport jobs than vacancies exist.
      </Insight>
      <Insight label="Feeling behind peers">
        Walton Family Foundation / Murmuration (US, 2025): only 4 in 10 high-schoolers — including just half of seniors — have thought &ldquo;a lot&rdquo; about their future career. Fewer than 30% feel &ldquo;very prepared&rdquo; for any post-secondary pathway. Parentkind UK National Parent Survey 2025: only 43% of parents rate school career advice as good.
      </Insight>

      <View style={{ height: 6 }} />
      <Callout label="Pain Intensity by Region (1–10)" block>
        <Text style={s.bodyTight}>
          <Text style={s.strong}>UK 9</Text> · <Text style={s.strong}>Nordics 7</Text> · <Text style={s.strong}>USA 8</Text> · <Text style={s.strong}>Canada 7</Text> · <Text style={s.strong}>Australia/NZ 6</Text> · <Text style={s.strong}>UAE/Saudi 6</Text> · <Text style={s.strong}>India 10</Text> · <Text style={s.strong}>SEA 8</Text> · <Text style={s.strong}>South Africa / SSA 10</Text> · <Text style={s.strong}>China 9</Text>
        </Text>
        <View style={{ height: 4 }} />
        <Text style={[s.caption, { color: c.tealInk }]}>
          Pain is not the same as addressability — a separate scoring follows in §03.
        </Text>
      </Callout>
    </PageFrame>
  );
}

function MarketDemand() {
  type Row = {
    region: string;
    pain: number;
    addr: number;
    notes: string;
    tier: "Tier 1" | "Tier 2" | "Tier 3" | "Avoid";
  };
  const rows: Row[] = [
    { region: "United Kingdom", pain: 9, addr: 9, notes: "Statutory Gatsby framework, £55M National Careers Service annual budget, English, GDPR-aligned, parents pay privately. Highest combined score.", tier: "Tier 1" },
    { region: "Nordics (NO/SE/DK/FI/IS)", pain: 7, addr: 8, notes: "OECD-ranked best-resourced systems still flagged for guidance gaps. State runs free dominant platforms — sell paid B2B against gov-grade quality. English-friendly, premium ARPU.", tier: "Tier 1" },
    { region: "United States", pain: 8, addr: 7, notes: "$1.6T student loans, 372:1 counsellor ratio, 44% major regret, $1.4B/yr Perkins V CTE funding. But: 13,000 districts, FERPA/COPPA, post-PowerSchool privacy paranoia, entrenched incumbents.", tier: "Tier 1" },
    { region: "Australia / NZ", pain: 6, addr: 9, notes: "Mature procurement, English, GDPR-style Privacy Act, parents pay. Small market (~5M under 25) but high willingness to pay.", tier: "Tier 2" },
    { region: "Canada", pain: 7, addr: 8, notes: "914k youth NEET (StatCan May 2025); easy adjunct to US deployment, bilingual but workable. PIPEDA-compliant.", tier: "Tier 2" },
    { region: "UAE / Saudi Arabia (Gulf)", pain: 6, addr: 8, notes: "B2G windfall — HRDF deployed SAR 1.4B in Q3 2024 alone. UAE NAFIS hit 131K Emiratis. Multi-million-dollar gov contracts; expects Arabic-first localisation, B2C limited.", tier: "Tier 2" },
    { region: "India", pain: 10, addr: 5, notes: "600M under-25; 1:3,000 counsellor ratio (some sources 1:630,000); only 13.2% receive any guidance. ARPU is the killer — Indian parents pay $5–20/yr for career help, not Western pricing. Only viable B2B2C or via gov/NGO partnerships.", tier: "Tier 3" },
    { region: "SE Asia (PH/ID/VN/TH)", pain: 8, addr: 5, notes: "Mid-tier ARPU, English second-language strong in PH/SG. Addressable but secondary.", tier: "Tier 3" },
    { region: "South Africa / SSA", pain: 10, addr: 3, notes: "SA youth (15–34) unemployment 46.1% Q1 2025. Massive humanitarian case, unworkable B2C unit economics. Donor-funded only (Mastercard Foundation, World Bank, FCDO).", tier: "Tier 3" },
    { region: "China", pain: 9, addr: 1, notes: "Youth unemployment 18.9%; 12.7M graduates entering 2026. But: foreign EdTech effectively blocked under Double Reduction policy + data-localisation laws. Not addressable for foreign B2C.", tier: "Avoid" },
  ];

  const tierColor = (t: Row["tier"]) =>
    t === "Tier 1" ? c.emerald : t === "Tier 2" ? c.teal : t === "Tier 3" ? c.amber : c.rose;

  return (
    <PageFrame section="Global Market Demand">
      <SectionHeader
        number="02"
        title="Pain × Addressability — the only matrix that matters."
        lead="Pain alone does not produce revenue. Each region is a function of pain × English-language depth × procurement infrastructure × ARPU × privacy regime × per-country data buildout cost."
      />

      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, { width: "26%" }]}>Region</Text>
        <Text style={[s.tableHeaderText, { width: "9%", textAlign: "center" }]}>Pain</Text>
        <Text style={[s.tableHeaderText, { width: "11%", textAlign: "center" }]}>Addr.</Text>
        <Text style={[s.tableHeaderText, { width: "12%" }]}>Tier</Text>
        <Text style={[s.tableHeaderText, { width: "42%" }]}>Why</Text>
      </View>
      {rows.map((r, i) => (
        <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt} wrap={false}>
          <Text style={[s.tableCellStrong, { width: "26%" }]}>{r.region}</Text>
          <Text style={[s.tableCellStrong, { width: "9%", textAlign: "center" }]}>{r.pain}</Text>
          <Text style={[s.tableCellStrong, { width: "11%", textAlign: "center" }]}>{r.addr}</Text>
          <Text style={[s.tableCell, { width: "12%", color: tierColor(r.tier), fontFamily: "Inter", fontWeight: 500 }]}>{r.tier}</Text>
          <Text style={[s.tableCell, { width: "42%" }]}>{r.notes}</Text>
        </View>
      ))}

      <View style={{ height: 14 }} />
      <Callout label="Strategic implication">
        Country sequencing IS the strategy. UK is the beachhead. Nordics is the credibility moat (data depth nobody else has). US is huge but slow and expensive to enter. Gulf is a quiet B2G windfall most founders miss. India is the right cause with the wrong unit economics. China is unaddressable. Globally applicable as a product concept; sequentially monetisable as a business — and the founder who confuses the two burns the round.
      </Callout>
    </PageFrame>
  );
}

function UserSegment() {
  return (
    <PageFrame section="User Segment Fit">
      <SectionHeader
        number="03"
        title="Strongest user is not the strongest buyer — and the seven-surface wrap is calibrated for both."
        lead="Endeavrly is built for 15–17 year olds, but the people who pay are 12–18 months removed from the screen. The seven features serve different stakeholders simultaneously — that's the design intent, and the commercial unlock."
      />

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
        <View style={{ flex: 1, backgroundColor: c.paper, borderWidth: 0.5, borderColor: c.hairline, padding: 12 }}>
          <Text style={s.label}>Strongest USER</Text>
          <Text style={s.h3}>15–17 year olds</Text>
          <View style={{ height: 4 }} />
          <Text style={s.bodyTight}>
            Career anxiety peaks at GCSE / pre-A-Level / pre-uni decision points. AI Career Agent + Voice-narrated Roadmap + Compare Careers map directly to their question pattern (&ldquo;what should I do, what does it look like, how do I get there&rdquo;). 91% prefer video learning. <Text style={s.strong}>They pay nothing. They use everything.</Text>
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: c.paper, borderWidth: 0.5, borderColor: c.hairline, padding: 12 }}>
          <Text style={s.label}>Strongest BUYER</Text>
          <Text style={s.h3}>UK MATs &amp; international schools</Text>
          <View style={{ height: 4 }} />
          <Text style={s.bodyTight}>
            Statutory Gatsby reporting + post-PowerSchool privacy anxiety + AI-anxiety in school leadership = active procurement budget for a calm, structured, AI-aware, GDPR-grade alternative to TikTok. UK secondary subscriptions cluster <Text style={s.strong}>£1,500–£4,500/yr per school</Text>; multi-school MATs aggregate quickly.
          </Text>
        </View>
      </View>

      <Text style={s.h2}>Segment ratings</Text>
      <View style={{ height: 6 }} />
      <Bullet>
        <Text style={s.strong}>Ages 15–17 (highest fit, primary user).</Text> Career Radar + AI Agent + Voice Roadmap + Compare Careers all answer their lived questions. Industry Insights gives them the &ldquo;what does this lead to&rdquo; horizon they're missing in school. They pay nothing — but their daily use is the product's gravity.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>Ages 18–23 (medium-high fit).</Text> Use case shifts toward &ldquo;am I on the right path / should I pivot&rdquo;. AI Agent + Compare Careers + Industry Insights become the headline surfaces. Compete with Handshake, LinkedIn Pathways, BridgeU. Endeavrly's voice + parent corpus + AI grounding is a real wedge here too.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>Parents (highest payer-intent — but channel is via schools).</Text> 90% of GB parents anxious about kids' futures. Parents value the parent-insights corpus emotionally and the privacy posture commercially. Will pay £30–£100 one-off for a tangible artefact (Career Report PDF). Will NOT subscribe at scale: see Chegg's 7.8M → 2.6M subscriber collapse and EdTech's 2.6% category conversion.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>Schools (strongest institutional buyer).</Text> Buy on Gatsby compliance, safeguarding posture, AI-readiness narrative, ease for staff. The college/career-readiness lead is the buyer — NOT the counsellor. UK MATs and international schools convert fastest. The seven-surface wrap is the procurement narrative: &ldquo;one tool, every question your students ask&rdquo;.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>Universities (lower fit, deferred).</Text> Career services exist but are post-purchase. Handshake owns post-uni-to-employer at $3.5B. Don't enter until UK schools are landed.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>Governments (highest ticket, slowest cycle).</Text> National Careers Service: £8.81M to Methods 2022–26. Saudi HRDF, UAE NAFIS spend billions. Realistic only as sub-contractor under a prime, or via Careers &amp; Enterprise Company regional grants, until there's a UK-flagship reference.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>Employers (sponsorship lane, optional).</Text> Industry Insights is the natural surface for branded content (Forage / Springpod model — &ldquo;a day at JPMorgan / DNB&rdquo;). Optional revenue: $50K–$250K per partner per year. Doesn't compromise the &ldquo;no jobs marketplace&rdquo; principle because nothing is being sold to youth — sponsors fund visibility into their sector, not job postings.
      </Bullet>

      <Callout label="The asymmetry">
        The strongest USER is 15–17. The strongest BUYER is a school administrator. Designing the product for the user while building the business model around the buyer is the whole game — and the seven-surface wrap is what lets you tell BOTH stories in the same demo without contradicting yourself.
      </Callout>
    </PageFrame>
  );
}

function Competitive() {
  type Comp = {
    name: string;
    region: string;
    model: string;
    scale: string;
    overlap: string;
  };
  const comps: Comp[] = [
    { name: "Unifrog", region: "UK / global", model: "B2B school license, bootstrapped, B Corp", scale: "$22.4M revenue, 1.9M students, 60%+ UK state schools, 110+ countries", overlap: "Highest. Calm, ethical, school-led — but tool-heavy UX, no narrative simulation, no parent stories, no voice agent. Endeavrly's seven-surface wrap is a generation ahead on UX." },
    { name: "Handshake", region: "USA primarily", model: "B2B (free unis, paid employers)", scale: "$444M raised at $3.5B valuation, 20M students, ~$190M revenue", overlap: "Low. Post-secondary; Handshake AI division now ~$1B annualised — different game. Reference for AI-agent monetisation upside if Endeavrly scales." },
    { name: "Naviance / PowerSchool", region: "USA", model: "B2B district license, ~$5,500/yr/district", scale: "8–10M students, 35–40% of US high schools", overlap: "Adjacency. Legacy UX, $17.25M privacy settlement (Feb 2026) — vulnerable on the trust axis Endeavrly leads on. Will need a defensive AI-agent in 2026." },
    { name: "SchooLinks", region: "USA", model: "B2B district, AI-powered positioning", scale: "$80M Series B Oct 2024 (Susquehanna), ~$23M revenue, 40 states", overlap: "Highest funded modern competitor. Most likely fast-follower for voice + AI features. The ceiling Endeavrly has to clear in product depth." },
    { name: "Xello", region: "USA / Canada", model: "B2B district + statewide", scale: "9M+ students; $3.60/HS student/yr (Kansas BoardDocs leak)", overlap: "Standard checklist model; not narrative-led. Endeavrly's structured-but-narrative approach beats this on demo." },
    { name: "MajorClarity", region: "USA", model: "B2B district (Edmentum-bundled)", scale: "Acquired twice in 2.5 yrs (Paper 2023 → Edmentum Oct 2025)", overlap: "Active consolidation target — signals strategic-buyer appetite for the segment." },
    { name: "BridgeU", region: "International schools", model: "B2B free schools / paid universities", scale: "$8.6M total raised, acquired by Manifest April 2025", overlap: "Pivoted to lead-gen because per-school B2B did not scale internationally. Cautionary tale on TAM-claim velocity." },
    { name: "Springpod", region: "UK / US", model: "Free students; employer + school premium", scale: "700K students, 2,000 schools, $2.5M from ASA for US launch", overlap: "Virtual work experience adjacency. Endeavrly's Industry Insights surface is the structural answer to this — content from sectors, packaged calmly, without the simulation production overhead." },
    { name: "Forage", region: "Global", model: "Pure employer-pay (sponsorships)", scale: "1M+ students, 125+ employers, acquired by EAB April 2024", overlap: "Reference monetisation model for Endeavrly's optional employer-sponsorship lane around Industry Insights." },
    { name: "Morrisby", region: "UK", model: "B2B school + B2C £120 Pass", scale: "£695/yr per school (Essentials)", overlap: "Heritage psychometric — UX dated. Endeavrly's Career Radar is a generation ahead." },
    { name: "Career quizzes (16Personalities, O*NET)", region: "Global", model: "Freemium ($9–99 reports) / public good", scale: "16Personalities: 6.16M monthly users, 1B+ tests in 45 langs", overlap: "Top-of-funnel single-shot tools. Endeavrly's seven surfaces are the post-quiz depth they don't have." },
    { name: "TikTok #CareerTok", region: "Global", model: "Free, ad-driven", scale: "2B+ views; 41% of Gen Z make decisions from it; 92% trust it; 55% mislead", overlap: "Biggest unstructured competitor. Endeavrly's value prop is &ldquo;everything CareerTok promises but actually trustworthy and structured&rdquo;." },
    { name: "ChatGPT (generic)", region: "Global", model: "Free / $20/mo", scale: "Default for Gen Z homework + career questions in 2026", overlap: "Substitution risk on the AI Agent surface. Endeavrly's defence: country-specific data, parent corpus, structured journey, age-appropriate guardrails. Generic ChatGPT does none of those — but feels &ldquo;close enough&rdquo; to many users." },
    { name: "utdanning.no", region: "Norway", model: "State-built, free", scale: "600 occupations, all programme data, dominant", overlap: "Data utility, not a journey product. Endeavrly's Nordic data depth depends on consuming it well — and Endeavrly cannot meaningfully sell paid product into Norway against it." },
  ];

  return (
    <PageFrame section="Competitive Landscape">
      <SectionHeader
        number="04"
        title="The category is saturated at the school-B2B core. Whitespace remains in the product wrap."
        lead="There are 14 named competitors of consequence. Most are functional. None combine voice-narrated simulation, family-anchored career stories, AI agent grounded in country data, industry insights, compare careers, calm UX, and a privacy-first posture. That coherent integration is the lane."
      />

      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, { width: "18%" }]}>Competitor</Text>
        <Text style={[s.tableHeaderText, { width: "14%" }]}>Region</Text>
        <Text style={[s.tableHeaderText, { width: "20%" }]}>Model</Text>
        <Text style={[s.tableHeaderText, { width: "22%" }]}>Scale</Text>
        <Text style={[s.tableHeaderText, { width: "26%" }]}>Overlap</Text>
      </View>
      {comps.map((c2, i) => (
        <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt} wrap={false}>
          <Text style={[s.tableCellStrong, { width: "18%" }]}>{c2.name}</Text>
          <Text style={[s.tableCell, { width: "14%" }]}>{c2.region}</Text>
          <Text style={[s.tableCell, { width: "20%" }]}>{c2.model}</Text>
          <Text style={[s.tableCell, { width: "22%" }]}>{c2.scale}</Text>
          <Text style={[s.tableCell, { width: "26%" }]}>{c2.overlap}</Text>
        </View>
      ))}

      <View style={{ height: 14 }} />
      <Text style={s.h2}>Why users would switch to Endeavrly</Text>
      <View style={{ height: 6 }} />
      <Bullet>Voice-narrated roadmap simulation — none of the school-B2B platforms ship this. The AI Career Agent grounded in structured country data is similarly novel.</Bullet>
      <Bullet>Parent-contributed real-life career timelines — uniquely Endeavrly. Unifrog has alumni; Springpod has employer videos; CareerTok has unmoderated creators. A moderated family-anchored corpus is structurally hard for incumbents to copy because it requires a community-building phase.</Bullet>
      <Bullet>Compare Careers + Industry Insights as first-class surfaces — most competitors hide industry data inside a side-tab; Endeavrly elevates it to a primary feature aligned with how 17-year-olds actually decide.</Bullet>
      <Bullet>Privacy-first as a positioning lever — only credible AFTER the PowerSchool / Naviance $17.25M settlement (Feb 2026) made it a procurement filter.</Bullet>
      <Bullet>Calm UX as anti-CareerTok — the wedge for parents who don't want their kid's career exploration happening on a dopamine algorithm.</Bullet>

      <Warning label="Honest counterweight">
        Distribution is the moat in EdTech, not features. Unifrog is profitable on a UX three years behind Endeavrly because it is in 60%+ of UK state schools. The seven-surface wrap differentiates the product but does not differentiate the procurement RFP — schools buy on Gatsby alignment + safeguarding documentation. Plan for a 24–36 month procurement-overlap fight, not a feature-driven leapfrog.
      </Warning>
    </PageFrame>
  );
}

function PMFSignals() {
  type F = { name: string; tractionScore: number; rationale: string };
  const features: F[] = [
    { name: "1. My Journey", tractionScore: 8, rationale: "The structural backbone. Confirmation-gated Discover → Understand → Clarity flow is the calm anti-CareerTok the market is asking for. Demos exceptionally well to schools, parents, and procurement. The single most important feature for procurement narrative." },
    { name: "2. Career Radar", tractionScore: 7, rationale: "Discovery + match% is table stakes for the category, but Endeavrly's hybrid scoring engine and design polish are above category average. Validating without being the headline differentiator." },
    { name: "3. AI Career Agent", tractionScore: 7, rationale: "Demos brilliantly, addresses real demand (Gen Z already turning to ChatGPT for career help). Defensibility hinges entirely on grounding — country data + parent corpus + structured journey context. Without that, it's a ChatGPT wrapper. With it, it's a category-defining feature." },
    { name: "4. Industry Insights", tractionScore: 7, rationale: "Underserved by direct competitors (Unifrog, Naviance, SchooLinks all bury labour-market data in side tabs). Elevating it as a first-class surface aligns with how 18–23 year-olds make pivot decisions. Sponsorship-monetisable upside." },
    { name: "5. Compare Careers", tractionScore: 8, rationale: "Maps directly to the lived 17-year-old question pattern (&ldquo;doctor or physiotherapist?&rdquo;). Few competitors do it well. Cross-feature surface that compounds value from Industry Insights + My Journey + Roadmap. Strong word-of-mouth potential." },
    { name: "6. Voice-narrated Roadmap Generator", tractionScore: 9, rationale: "The headline asset. Genuinely novel. Format-aligned with Gen Z (91% video preference). Demos to schools, parents, and investors better than any other feature. Likely the centrepiece of any future strategic-acquisition pitch." },
    { name: "7. Parent / Adult Career Insights", tractionScore: 8, rationale: "Unique. Solves the &ldquo;real-world visibility&rdquo; pain (OECD: most 15yos have no employer contact). Compounding moat — the corpus deepens with every contribution and is structurally hard to replicate. Weakness: chicken-and-egg on supply — needs first 1,000 contributors before it has UX value." },
    { name: "Privacy-first posture (cross-cutting)", tractionScore: 8, rationale: "Post-PowerSchool $17.25M settlement (Feb 2026) made this a procurement filter. 12–24 month head-start before incumbents retrofit. Strongest moat short-term. After Q3 2027 it becomes table stakes — capture window is now." },
    { name: "PDF Career Report (cross-cutting)", tractionScore: 6, rationale: "Tangible artefact = parent-perceived value. £30–£100 one-off price feasible. Not a recurring revenue line but legitimises the product to parents and unblocks employer/school sales conversations." },
  ];

  return (
    <PageFrame section="PMF Signals">
      <SectionHeader
        number="05"
        title="The seven surfaces score evenly. The voice roadmap and parent corpus are the headline assets."
        lead="Each of the seven features ranked on likelihood of producing the next 12 months of growth signal — pilot conversions, NPS, parent referral, school renewal."
      />

      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, { width: "44%" }]}>Feature</Text>
        <Text style={[s.tableHeaderText, { width: "12%", textAlign: "center" }]}>Score</Text>
        <Text style={[s.tableHeaderText, { width: "44%" }]}>Why</Text>
      </View>
      {features.map((f, i) => (
        <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt} wrap={false}>
          <Text style={[s.tableCellStrong, { width: "44%" }]}>{f.name}</Text>
          <Text style={[s.tableCellStrong, { width: "12%", textAlign: "center" }]}>{f.tractionScore} / 10</Text>
          <Text style={[s.tableCell, { width: "44%" }]}>{f.rationale}</Text>
        </View>
      ))}

      <View style={{ height: 14 }} />
      <Callout label="Where to invest next">
        Voice Roadmap, Parent Corpus, AI Agent grounding, and Privacy posture are the four traction levers. Cut feature work that is not in service of one of them. Specifically: Compare Careers should compound on the Industry Insights surface (one cross-feature decision flow), and the AI Agent's defensibility lives or dies on country-data grounding — invest the next 8 weeks of engineering accordingly.
      </Callout>
    </PageFrame>
  );
}

function Differentiation() {
  return (
    <PageFrame section="Differentiation">
      <SectionHeader
        number="06"
        title="Yes — and v2's framing makes the position structurally cleaner."
        lead="The category is &lsquo;calm, structured, country-aware career intelligence&rsquo;. With Small Jobs out of the picture, the position no longer needs to apologise for itself in the procurement deck."
      />

      <Text style={s.h2}>Where the position holds</Text>
      <View style={{ height: 6 }} />
      <Bullet>
        <Text style={s.strong}>Editorially.</Text> No mainstream competitor leads with &ldquo;calm + structured + country-aware&rdquo;. Unifrog is the closest spiritual cousin (B Corp, ethics-led) but its UX is administrator-led, not student-led. Endeavrly's product embodies the position — dark mode default, no streaks, no leaderboards, no engagement spam — in a way Unifrog's tooling does not.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>For the parent buyer.</Text> 90% of GB parents are anxious about their child's future (UNICEF UK 2024). For the parent who recoils from TikTok, &ldquo;calm and structured&rdquo; is exactly the message that converts. The seven-surface wrap promises a complete answer; that's the parent-facing pitch.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>Against AI substitution.</Text> ChatGPT has commoditised generic career advice. Endeavrly's defence is the wrap: country data + parent corpus + structured journey + voice + age-appropriate guardrails. AI can summarise but not source those. The AI Agent surface is where Endeavrly puts AI to work for users, rather than letting AI eat the category from outside.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>For the school buyer.</Text> One tool, every question. The seven-surface wrap is a procurement narrative that competitors with point solutions cannot match. Schools value coverage (the Gatsby framework rewards it) and the wrap tells that story in 30 seconds.
      </Bullet>

      <View style={{ height: 6 }} />
      <Text style={s.h2}>Where the position is fragile</Text>
      <View style={{ height: 6 }} />
      <Bullet>
        <Text style={s.strong}>Calm is a friction.</Text> No streaks, no leaderboards, no notifications = lower user retention metrics than gamified competitors. Investors who benchmark on DAU/MAU or 30-day retention will mark Endeavrly down. Reframe metric set as &ldquo;moments of clarity per user-month&rdquo; — but be honest that this is a contrarian metric the market may not reward.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>&ldquo;Calm&rdquo; is copyable.</Text> If the position works, Unifrog can ship a Calm Mode in a quarter. SchooLinks just raised $80M — they can dedicate a team to it. Position is a six-month moat, not a five-year one. The structural moats must come from country-data depth, parent corpus, and the seven-surface integration.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>Position ≠ procurement.</Text> School buyers compare Gatsby-benchmark coverage, safeguarding documentation, integration with SIMS / Arbor / Bromcom. &ldquo;Calm&rdquo; is an accelerant in the demo, not a determinant in the RFP.
      </Bullet>

      <Callout>
        The position is real and worth defending. Treat it as a 24-month head start, not a structural moat. The structural moat must come from data (country depth, parent corpus) and distribution (UK MAT contracts).
      </Callout>
    </PageFrame>
  );
}

function TrustSafetyMoat() {
  return (
    <PageFrame section="Trust &amp; Safety Moat">
      <SectionHeader
        number="07"
        title="A temporary, expensive, genuinely valuable moat."
        lead="Safeguarding-by-design is a moat for the next 18–24 months. It will not be a moat in five years, because incumbents will retrofit. Use it now or lose it."
      />

      <Text style={s.h2}>Why the moat is real right now</Text>
      <View style={{ height: 6 }} />
      <Bullet>
        <Text style={s.strong}>PowerSchool / Naviance settlement, $17.25M (Feb 2026).</Text> ~10 million students potentially eligible. Triggering offence was adtech tracking, not a hack — Google / Microsoft / Heap analytics on student-facing pages were enough. Every district CIO in North America just got a privacy memo. Endeavrly walks into procurement conversations as the post-settlement alternative.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>UK Children's Code (Sept 2020).</Text> 15 standards apply to EdTech used in UK schools even though schools themselves are exempt. Compliance is mandatory for any UK product targeting under-18s.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>COPPA 2026 enforcement.</Text> Up to $51,744 per violation per day. Built-in compliance from day one is a 6–8-week engineering investment; retrofitting is orders of magnitude more expensive. Endeavrly's privacy-by-design stance is therefore both a procurement and a financial moat.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>No marketplace = no high-risk surfaces.</Text> Removing Small Jobs eliminated the trickiest safeguarding surface (adult/minor messaging, payment fraud, gig safety). The seven-surface wrap is structurally lower-risk than any product including a marketplace, which simplifies every audit and every parent conversation.
      </Bullet>

      <Text style={s.h2}>Why the moat decays</Text>
      <View style={{ height: 6 }} />
      <Bullet>
        Privacy posture is a documentable, copyable property. Once SchooLinks (post-$80M Series B) decides to invest, they can match in 12–18 months.
      </Bullet>
      <Bullet>
        Trust is compounding for users but episodic for buyers. Procurement teams care during a settlement cycle; six months later their attention drifts.
      </Bullet>
      <Bullet>
        15–25% of engineering effort goes to compliance forever. The moat has a perpetual operating cost.
      </Bullet>

      <Callout label="Capture window">
        18–24 months. After that, the moat becomes table stakes and the differentiation must come from the country-data depth and the parent corpus. Use the window to land 25 UK MAT pilots and codify the safeguarding documentation as procurement-ready collateral. If a competitor publishes equivalent docs in 2027, Endeavrly's only defensible answer is &ldquo;we have 50 schools using it and 5,000 parent-contributed stories you cannot copy&rdquo;.
      </Callout>
    </PageFrame>
  );
}

function Monetisation() {
  type Lane = { rank: number; lane: string; ttv: string; ceiling: string; verdict: string; score: number };
  const lanes: Lane[] = [
    { rank: 1, lane: "School B2B licensing (UK MATs first, then international schools)", ttv: "9–18 months", ceiling: "$15–40M ARR at 500–1,500 schools", verdict: "Sticky once won. Procurement cycle is 6–12 months in UK, 6–18 in US. Avoid US districts initially — too many incumbents, post-PowerSchool privacy paranoia, FERPA/COPPA complexity. Per-school ARPU clusters £1.5K–£4.5K UK / $5–15 per student US. The seven-surface wrap is the procurement narrative.", score: 8 },
    { rank: 2, lane: "Employer / sponsor brand-pay around Industry Insights (Forage / Springpod model)", ttv: "0–9 months", ceiling: "$3–10M ARR with 10–30 partners", verdict: "Fastest path to revenue without compromising the &lsquo;no marketplace&rsquo; principle. Sponsors fund branded sector content, not job postings. 5 sponsor partners at $50–250K each = $250K–$1.25M ARR. Forage was acquired by EAB on this exact thesis (April 2024).", score: 7 },
    { rank: 3, lane: "Government contracts (B2G — UAE / Saudi / UK regional pilots)", ttv: "12–36 months", ceiling: "Ticket size $1M–$10M each, lumpy", verdict: "Huge but glacial. UK National Careers Service: £8.81M to Methods 2022–26. Saudi HRDF deployed SAR 1.4B in Q3 2024 alone. Realistic only as sub-contractor under a prime, or via Careers &amp; Enterprise Company regional grants. Don't pursue national wins until first UK-flagship reference customer.", score: 6 },
    { rank: 4, lane: "Premium PDF Career Report (one-off £30–£100, optional)", ttv: "0–3 months", ceiling: "£200K–£1M ARR cap as solo channel", verdict: "Tangible artefact = parent-perceived value. Drives word-of-mouth. Won't scale alone; treat as a top-of-funnel monetisation that legitimises the product to parents and unblocks employer/school sales conversations.", score: 6 },
    { rank: 5, lane: "AI Agent premium tier (school-paid, not parent-paid)", ttv: "12–18 months", ceiling: "$2–8M ARR add-on", verdict: "Most schools will pay an extra 20–40% on top of the base license for unlimited AI Agent + counsellor admin tools. Differentiated from raw ChatGPT by country data grounding. Reasonable add-on once base license velocity is proven.", score: 6 },
    { rank: 6, lane: "Affiliate / referral via Industry Insights links", ttv: "6–12 months", ceiling: "$100K–$500K ARR side stream", verdict: "Coursera, edX, government course catalogues all pay referral. Real but small; only worth it if it doesn't compromise content trust. Disclose every link.", score: 4 },
    { rank: 7, lane: "Parent-paid B2C subscription", ttv: "n/a", ceiling: "Not pursued", verdict: "Founder explicit: NOT charging parents. This is the right call. EdTech category 2.6% conversion; Chegg's 7.8M → 2.6M subscriber collapse; career exploration has no test-score deliverable to anchor willingness-to-pay. Confirmed dead.", score: 1 },
    { rank: 8, lane: "Marketplace / job take-rate", ttv: "n/a", ceiling: "Zero by design", verdict: "Removed from product scope (v2). No jobs marketplace, no take-rate, no marketplace-driven monetisation. Confirmed not in plan.", score: 1 },
  ];

  return (
    <PageFrame section="Monetisation">
      <SectionHeader
        number="08"
        title="Sell schools and sponsors. The product never charges youth or parents."
        lead="The v2 framing simplifies monetisation: three real lanes (B2B schools, employer sponsors on Industry Insights, government B2G), one optional add-on (AI Agent premium tier), one tangible artefact (PDF Report), and two confirmed-dead lanes."
      />

      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, { width: "5%" }]}>#</Text>
        <Text style={[s.tableHeaderText, { width: "30%" }]}>Lane</Text>
        <Text style={[s.tableHeaderText, { width: "12%" }]}>Time-to-value</Text>
        <Text style={[s.tableHeaderText, { width: "15%" }]}>Ceiling</Text>
        <Text style={[s.tableHeaderText, { width: "30%" }]}>Verdict</Text>
        <Text style={[s.tableHeaderText, { width: "8%", textAlign: "center" }]}>Score</Text>
      </View>
      {lanes.map((l, i) => (
        <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt} wrap={false}>
          <Text style={[s.tableCellStrong, { width: "5%" }]}>{l.rank}</Text>
          <Text style={[s.tableCellStrong, { width: "30%" }]}>{l.lane}</Text>
          <Text style={[s.tableCell, { width: "12%" }]}>{l.ttv}</Text>
          <Text style={[s.tableCell, { width: "15%" }]}>{l.ceiling}</Text>
          <Text style={[s.tableCell, { width: "30%" }]}>{l.verdict}</Text>
          <Text style={[s.tableCellStrong, { width: "8%", textAlign: "center" }]}>{l.score}/10</Text>
        </View>
      ))}

      <View style={{ height: 14 }} />
      <Callout label="The clean monetisation story">
        UK MAT licenses for sticky base revenue. Industry Insights employer sponsorship for fast ARR without compromising principles. AI Agent premium tier as the obvious year-2 add-on once base license velocity is proven. Government B2G as the long-tail upside. Everything else is deliberately not in the model. No youth-pay, no parent-pay, no marketplace — and that constraint, paradoxically, is what makes the pitch coherent to procurement teams who've seen too many EdTech products try to be everything.
      </Callout>
    </PageFrame>
  );
}

function ScaleRisks() {
  return (
    <PageFrame section="Scale Risks">
      <SectionHeader
        number="09"
        title="What blocks scale."
        lead="Each risk is concrete and quantifiable. The dominant one in v2's framing is country-data scaling — the product's promise of &ldquo;rounded perspective on any job in YOUR country&rdquo; is exactly the part that does not parallelise."
      />

      <Insight label="Country-data scaling cost compounds (HIGHEST)">
        The product's essence is country-specific. Nordic data is cheap (gov APIs, ~2–4 weeks per country). UK adds 8–12 weeks plus UCAS license fees. US is 3–6 months for the top 10 states only — there is no national programme dataset. India is effectively unbounded. Maintenance is 15–25% of initial build cost annually as programmes/entry requirements churn. <Text style={s.strong}>Implication:</Text> Endeavrly cannot be a global product on its current data architecture. Pick three countries and dominate them. Country #4 is a Series A decision, not a Year 1 launch.
      </Insight>
      <Insight label="School sales cycles (HIGH)">
        K-12 cycle: 6–18 months, average 8. UK MATs procure in late summer; US districts in May–April for autumn implementation. First school revenue is realistically 9–15 months from cold outreach. Burn rate must be reconciled with this calendar — running out of cash three months before pilot conversion is the single most common founder failure in this category.
      </Insight>
      <Insight label="EdTech churn (MEDIUM-HIGH)">
        9.6% monthly is the cited EdTech average — the worst SaaS vertical. One sector benchmark says annual churn doubled from 11% (2024) to 22% (2025) under budget pressure and AI disruption. Endeavrly must design renewal mechanics from day one (annual review reports for the head of careers, Gatsby compliance summaries, parent-NPS digests) rather than trusting product stickiness alone.
      </Insight>
      <Insight label="AI substitution (MEDIUM-HIGH)">
        The AI Career Agent surface is both an asset and a substitution surface. Chegg's collapse from 7.8M to 2.6M subscribers in 24 months proves what happens to undifferentiated AI-adjacent products. Endeavrly's defensibility hinges on the country-data grounding — without it, the AI Agent is a premium ChatGPT wrapper. Resource the grounding work as the highest-priority engineering investment of 2026.
      </Insight>
      <Insight label="Privacy regulatory burden (MEDIUM-HIGH)">
        15–25% of engineering effort goes to compliance forever. COPPA $51,744 / violation / day. UK Children's Code applies even though schools are exempt. Every new region adds DPIA, age-assurance tooling, data residency requirements (Saudi PDPL is particularly intense). Budget legal counsel at $30K–$100K / year baseline.
      </Insight>
      <Insight label="Parent-corpus chicken-and-egg (MEDIUM)">
        The Parent Insights corpus needs ~1,000 moderated stories before it has UX value. Without paid acquisition or viral mechanics (both rejected by design), the only path is direct outreach — alumni networks, founder networks, school PTA partnerships. This is a content-business in disguise during the first 12 months. Resource a part-time community lead from week 1, not week 12.
      </Insight>
      <Insight label="Local trust requirement (MEDIUM)">
        Schools won't buy from a brand they have not seen referenced. The first 5 UK pilot conversions are 5× harder than the next 50. Plan for a 6-month brand-building phase parallel to product (CEC partnership, careers-leader podcast appearances, Gatsby framework alignment whitepapers).
      </Insight>
      <Insight label="Funding climate (MEDIUM)">
        EdTech VC fell to $2.4B in 2024 — lowest in a decade, down 88% from 2021 peak. K-12 EdTech funding down 22.5% YoY in 2025. Average deal size is up but only for AI-first stories. Endeavrly's AI Agent surface helps the pitch; the &ldquo;calm, non-gamified&rdquo; ethics will get fewer sheets and lower multiples than aggressive AI-only plays even if fundamentals are stronger.
      </Insight>
    </PageFrame>
  );
}

function BrutalWeakness() {
  return (
    <PageFrame section="Brutal Weakness Test">
      <SectionHeader
        number="10"
        title="Why this might fail completely."
        lead="The strongest version of this report takes the founder's strongest priors and tries to break them. These are the assumptions most likely to be wrong — even after the v2 framing tightening."
      />

      <Text style={s.h2}>Hidden flaws</Text>
      <View style={{ height: 6 }} />
      <NumberedItem n={1}>
        <Text style={s.strong}>The &ldquo;calm&rdquo; positioning may be a usage cap, not a usage choice.</Text> Calm products lose retention battles to gamified ones. Duolingo's 8.8% conversion took five years of relentless gamification engineering. If Endeavrly's session lengths and weekly active rates run 2–3× lower than competitors, schools will quietly choose the louder product even if they admire the ethics. Reframe: retention metric must be &ldquo;decisions clarified per term&rdquo;, not weekly actives — and that metric is hard to sell in a procurement deck.
      </NumberedItem>
      <NumberedItem n={2}>
        <Text style={s.strong}>The voice-narrated simulation demos brilliantly and engages weakly.</Text> Demo-to-engagement gap is the classic AI-feature trap. A student who plays the simulation once may not return. If the core engagement loop is a one-shot voice playthrough, the product has a serious &ldquo;second visit&rdquo; problem. Validate with a 30-day cohort study before committing to the simulation as the headline asset.
      </NumberedItem>
      <NumberedItem n={3}>
        <Text style={s.strong}>The AI Career Agent is the substitution surface, not just a feature.</Text> Students don't compare Endeavrly's AI Agent to other school tools — they compare it to ChatGPT. If it's not noticeably better at career questions (faster, more accurate, more country-specific, better cited), they will use ChatGPT and get the rest from Endeavrly. Country-data grounding must be measurable and visible — not just architecturally present.
      </NumberedItem>
      <NumberedItem n={4}>
        <Text style={s.strong}>Parent-contributed career stories is a content-business in disguise.</Text> The corpus needs ~1,000 moderated parent stories before it has UX value. Parents will not contribute without seeing other contributions. Without paid acquisition or a viral hook (both rejected), the only path is heavy hand-curation in the first 12 months. Underestimating this cost is the most likely founder failure on the parent surface specifically.
      </NumberedItem>
      <NumberedItem n={5}>
        <Text style={s.strong}>Country-data scope creep.</Text> The product's promise (&ldquo;any job in YOUR country&rdquo;) is the marketing line and also the unbounded liability. Every new market requires real per-country data investment. Founders who promise global on day one and try to deliver on it without the capital to do so produce thin coverage everywhere and depth nowhere.
      </NumberedItem>
      <NumberedItem n={6}>
        <Text style={s.strong}>BridgeU is the cautionary tale.</Text> Raised $8.6M over eight years targeting international schools with a similar mission, did not scale enough to keep raising, pivoted to free-schools / paid-universities lead-gen, acquihired by Manifest in April 2025. Endeavrly's TAM (15–23, school-channel) is structurally similar to BridgeU's. Same gravity may apply. The seven-surface wrap is the structural answer to that gravity — but only if execution is disciplined.
      </NumberedItem>

      <View style={{ height: 8 }} />
      <Text style={s.h2}>Wrong assumptions to challenge</Text>
      <View style={{ height: 6 }} />
      <Bullet>
        <Text style={s.strong}>&ldquo;The seven-surface wrap is the moat.&rdquo;</Text> It is — for 24 months. After that, well-funded competitors copy any one surface they want. The Year 3 moat must be country-data depth + parent corpus + school distribution.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>&ldquo;The product applies globally.&rdquo;</Text> The CONCEPT does. The BUSINESS does not — country sequencing is a real constraint, not a marketing choice. Plan for three countries deeply, not 30 shallowly.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>&ldquo;AI is just a feature.&rdquo;</Text> The AI Agent is the surface where Endeavrly is most vulnerable to substitution. Treat it as a strategic battle, not a side feature.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>&ldquo;No gamification differentiates us.&rdquo;</Text> It differentiates the product but caps the user-engagement metrics that investors and procurement teams optimise for. Be deliberate about which metrics you fight on.
      </Bullet>

      <Warning label="The single most likely failure mode">
        Promising globally and trying to deliver before the country-data architecture supports it. Or — under-investing in country-data grounding for the AI Agent, which converts the product's strongest demo asset into its biggest substitution liability.
      </Warning>
    </PageFrame>
  );
}

function FounderStrategy() {
  return (
    <PageFrame section="Founder Strategy">
      <SectionHeader
        number="11"
        title="If investing your own $1M, here is the disciplined path."
        lead="The instinctive moves (build globally, sell to US districts, charge parents) are the exact moves that have killed comparable products. The data points to a narrower, more boring path with a higher hit rate — and v2's tighter scope makes that path easier to execute on."
      />

      <Text style={s.h2}>Recommended path: UK + Nordic depth, AI grounding, school-led distribution, employer sponsorship as fast ARR.</Text>
      <View style={{ height: 8 }} />

      <Insight label="Months 0–6 — Productionise the moats">
        Lock down Nordic + UK programmes data quality (the data depth no competitor will rebuild). Wire utdanning.no auto-sync + UK apprenticeships feed. Document privacy / safeguarding posture as procurement-ready collateral. Ship voice simulation v2 with measurable cohort-30 retention. AI Agent grounded against country data — measurable accuracy + citation rate vs ChatGPT. Hire one senior schools-sales person ex-Unifrog or ex-Pearson. Recruit the first 250 parent-story contributors via direct outreach.
      </Insight>
      <Insight label="Months 6–12 — First $250K–$1M ARR">
        Land 5 UK MAT pilots (£8K–£25K each) and 2 employer sponsor partners on Industry Insights (£50K–£150K each). Skip US entirely. Skip parent-paid subscription entirely. Skip Saudi / UAE for now — cycle too long for current cash position. Publish a Gatsby-aligned whitepaper, attend 3 careers-leader conferences, get one CEC reference.
      </Insight>
      <Insight label="Months 12–18 — Scale the proven lane">
        Convert pilots to full contracts (target 25 schools, 5 employer sponsors, $1.5–3M ARR). Begin Norway / Sweden / Denmark in parallel (gov-platform-adjacent positioning, not head-on). Hire a head of partnerships. Begin selective US conversations only with 2–3 international-school networks. Launch AI Agent premium tier as the obvious add-on now that base license velocity is proven.
      </Insight>
      <Insight label="Months 18–24 — Open the strategic optionality">
        At $3–5M ARR with 50+ schools, the company is fundable at 4–6× ARR ($12–30M) or beginning strategic-acquisition conversations from a position of strength. The strategic-buyer set (EAB, PowerSchool, Cognia, Pearson, Manifest) is now alive. Decide raise vs sell based on country #3 launch readiness and personal founder appetite for the next 4-year haul.
      </Insight>

      <View style={{ height: 8 }} />
      <Text style={s.h2}>Strategy options ranked</Text>
      <View style={{ height: 6 }} />
      <Bullet><Text style={s.strong}>1. Focus UK + Nordic first (RECOMMENDED).</Text> Highest hit rate. Cleanest narrative. Smallest cash burn. Compatible with all later optionality.</Bullet>
      <Bullet><Text style={s.strong}>2. Sell B2B schools + employer sponsors first (AGREES with #1).</Text> Yes — UK MATs and international schools, plus 2–5 sponsor partners on Industry Insights for fast ARR. Avoid US districts until 2027 at earliest.</Bullet>
      <Bullet><Text style={s.strong}>3. Build globally now — DO NOT.</Text> The data architecture is not global. Burning $1M trying to enter 8 markets at once is the single most common failure mode in this category.</Bullet>
      <Bullet><Text style={s.strong}>4. Pivot to parent market — DO NOT.</Text> Founder explicit: not charging parents. The data agrees: 2.6% conversion, Chegg's collapse, no test-outcome anchor.</Bullet>
      <Bullet><Text style={s.strong}>5. Build B2C traction first — DO NOT.</Text> Without paid acquisition (which conflicts with calm) and without virality (which conflicts with safety), B2C cannot acquire fast enough to validate. School-led distribution is the only viable model.</Bullet>
      <Bullet><Text style={s.strong}>6. Abandon — NO.</Text> The pain is real, the position is genuine, the strategic-buyer market is active, and the v2 framing makes the company more fundable, not less. Discipline produces a $100–400M strategic exit; abandonment is leaving founder-level value on the table.</Bullet>

      <Callout label="One-line strategy">
        Be the calm, structured, country-aware career-intelligence platform that wins UK MATs first, deepens in Nordics, monetises employer sponsors on Industry Insights in parallel, ships an AI Agent grounded against country data that beats ChatGPT for career questions, and gets acquired by EAB / PowerSchool / Cognia / Pearson / Manifest at $100–400M in 4–6 years.
      </Callout>
    </PageFrame>
  );
}

function FinalScores() {
  return (
    <PageFrame section="Final Scores">
      <SectionHeader
        number="12"
        title="Final scores (v2)."
        lead="Each score recalibrated against v2's framing. Three dimensions move up modestly (the product is now more fundable and more focused). Two are unchanged. Virality stays bounded by design."
      />

      <ScoreGrid
        items={[
          { label: "Global traction potential", score: 7, tone: "warn" },
          { label: "User need intensity", score: 8, tone: "good" },
          { label: "Monetisation potential", score: 6, tone: "warn" },
          { label: "Defensibility", score: 6, tone: "warn" },
          { label: "Virality potential", score: 3, tone: "bad" },
          { label: "Long-term company potential", score: 7, tone: "warn" },
        ]}
      />

      <View style={{ height: 8 }} />
      <Text style={s.h2}>How to read the scores</Text>
      <View style={{ height: 6 }} />
      <Bullet>
        <Text style={s.strong}>User need intensity 8/10 (unchanged)</Text> — anchored to OECD's 40% career uncertainty, UK 46.4% rising from 24.6%, US 44% major regret, India 1:3,000 counsellor ratio. Hard data, no debate.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>Long-term company potential 7/10 (was 6)</Text> — v2's focused product is more obviously a category-leader candidate. Higher than 7 still requires either pivoting toward enterprise upskilling (Multiverse) or scaling country-data depth across 10+ markets, which is a different capital story.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>Monetisation potential 6/10 (was 5)</Text> — cleaner story without parent-pay or marketplace distractions. The B2B + sponsorship + B2G triangle is real and well-precedented (Forage / Springpod / Unifrog). 7+ requires the AI Agent premium tier validating at scale.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>Defensibility 6/10 (was 5)</Text> — seven-surface wrap + country-data depth + parent corpus + privacy moat compound better than v1's small-jobs hybrid. Decay rate still 18–24 months on the privacy axis.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>Virality potential 3/10 (unchanged)</Text> — explicitly designed-out by the &ldquo;no leaderboards, no popularity metrics&rdquo; stance. Correct product choice; rational virality cap.
      </Bullet>
      <Bullet>
        <Text style={s.strong}>Global traction potential 7/10 (was 6)</Text> — the focused 7-feature product translates more easily across markets than v1's hybrid. Still bounded by country-by-country data buildout cost.
      </Bullet>

      <View style={{ height: 12 }} />
      <Callout label="Composite read">
        High-need, low-virality, mid-monetisation, mid-defensibility, mid-high traction-potential. The profile of a high-quality regional-then-international category leader with a strategic-acquisition exit. Plan capital, hires, and milestones around that profile, not around founder ambition or unicorn comp.
      </Callout>
    </PageFrame>
  );
}

function FinalVerdict() {
  return (
    <PageFrame section="Final Verdict">
      <SectionHeader
        number="13"
        title="Final verdict (v2)."
        lead="One clear answer."
      />

      <Callout label="Should this be pursued seriously?" block>
        <Text style={[s.bodyLg, { color: c.tealInk }]}>
          <Text style={s.strong}>Yes — and v2's framing makes it more fundable, more coherent, and more defensible than v1.</Text>
        </Text>
        <View style={{ height: 6 }} />
        <Text style={[s.bodyTight, { color: c.tealInk }]}>
          The pain is real and rising. The seven-surface wrap is genuinely distinct from every named competitor. The strategic-buyer market is active. Removing Small Jobs simplified the company into a clear category-leader candidate. Disciplined execution produces a $100–400M strategic exit in 4–6 years. Undisciplined execution — global expansion before country #3 is ready, AI Agent without country-data grounding, US districts before UK MATs — produces a slow-bleed BridgeU outcome.
        </Text>
      </Callout>

      <View style={{ height: 12 }} />
      <Text style={s.h2}>Three commitments required to make this work</Text>
      <View style={{ height: 6 }} />
      <NumberedItem n={1}>
        <Text style={s.strong}>Right-size the ambition.</Text> This is a $100–400M strategic-exit path. Not a $1B IPO on its current shape. Communicate that to investors and hires. The product principles that make Endeavrly excellent (calm, no-payment, no-gamification, no-marketplace) are also the principles that cap consumer upside — and that is fine if everyone agrees on the destination.
      </NumberedItem>
      <NumberedItem n={2}>
        <Text style={s.strong}>Sequence the country-data work.</Text> The product's promise is country-specific. The execution must match. Three countries deep beats ten countries shallow. Year 1: UK + Nordics. Year 2: country #3 (likely Australia or Ireland). Year 3: Series A funds country #4–6. Don't deviate from this until at least $5M ARR.
      </NumberedItem>
      <NumberedItem n={3}>
        <Text style={s.strong}>Win the AI Agent battle, don't ride it.</Text> The AI Career Agent is the surface most vulnerable to ChatGPT substitution. Resource country-data grounding as the highest-priority engineering investment of 2026. Measure citation rate, accuracy vs ChatGPT, and student preference monthly. If the AI Agent is just a wrapper, it's a liability — if it's measurably better than ChatGPT for career questions, it's the centrepiece of the product.
      </NumberedItem>

      <View style={{ height: 14 }} />
      <Warning label="The contrarian one-liner">
        The thing that makes Endeavrly genuinely good — its refusal to gamify, advertise, charge children, or run a marketplace — is also the thing that caps the consumer upside. That is not a problem to solve; it is a constraint to monetise around. Sell schools and employer sponsors, never students or parents. Build the company you want to exist, not the company a 2021-vintage VC deck demanded.
      </Warning>

      <View style={{ height: 16 }} />
      <Text style={s.bodyMuted}>
        Prepared May 2026 · Endeavrly internal founder briefing v2 · Built on hard data from OECD, ONS, ASCA, BestColleges, CNBC, EdWeek, EdSurge, Sacra, GetLatka, BusinessWire, K12Dive, ResumeBuilder, OECD WP330, StatCan, StatsSA, NSDC, ZipRecruiter, Tracxn, BoardDocs, Holoniq, EdTech Market Brief, Finro, and PowerSchool/Naviance settlement filings, plus competitor primary sources and government procurement data.
      </Text>
    </PageFrame>
  );
}

function SourcesPage() {
  const sources: Array<{ topic: string; items: string[] }> = [
    {
      topic: "Demand & pain",
      items: [
        "OECD, State of Global Teenage Career Preparation (May 2025) — 40% of 15yos uncertain about careers",
        "OECD Working Paper 330, Teenage Career Development in Norway (April 2025)",
        "ONS, Young people NEET (Oct–Dec 2025) — 957,000 UK youth NEET",
        "Education and Employers, Mismatch UK Crisis (2025) — 46.4% UK youth uncertain",
        "Walton Family Foundation / Murmuration — Most Gen Z high-schoolers feel unprepared",
        "Deloitte Gen Z & Millennial Survey 2025",
        "UNICEF UK — 90% GB parents worried about future life chances (2024)",
        "Parentkind National Parent Survey 2025",
        "ASCA School Counselor Ratios 2024–25 (372:1 national avg)",
        "BestColleges — 44% job-seeking grads regret major (2025)",
        "CBS / ZipRecruiter — Most Regretted Majors (2025)",
        "CNBC / Intelligent.com — 47% considered changing major due to AI (April 2026)",
        "ResumeBuilder — 4 in 10 Gen Z TikTok career decisions",
        "uConnect — 91% Gen Z prefer video for career learning",
        "Federal Reserve — 2024 Household Wellbeing (May 2025) — student loan / education ROI",
        "StatCan — Youth NEET 2025 (Canada)",
        "StatsSA Q1 2025 — South Africa youth unemployment",
        "Aspen Institute — India 600M under 25",
        "India Career Centre — Career Awareness Gap",
        "Asia Society — China 19% youth unemployment",
        "PwC Middle East Hopes & Fears 2025",
      ],
    },
    {
      topic: "Competitors & funding",
      items: [
        "Tracxn — Unifrog company profile",
        "Tracxn — BridgeU funding & investors (Manifest acquisition April 2025)",
        "PRNewswire — Edmentum acquires MajorClarity (Oct 2025)",
        "EdSurge — Hobsons higher-ed split, $410M total (PowerSchool Naviance $320M)",
        "BusinessWire — SchooLinks $80M Series B (Susquehanna, Oct 2024)",
        "Sacra — Handshake revenue & valuation",
        "TechCrunch — Handshake $80M @ $1.5B (May 2021)",
        "PRNewswire — Xello acquires Awato (2021)",
        "PRNewswire — YouScience ECMC strategic investment (April 2025)",
        "EAB acquires Forage (April 2024)",
        "Multiverse — Latka company profile / $1.7B valuation, $156M revenue (2025)",
        "GetLatka — Multiverse revenue trajectory",
        "Springpod — ASA $2.5M investment, partner pricing (work-experience simulations)",
        "Morrisby — pricing page",
        "Civic IQ — Naviance / PowerSchool district pricing analysis",
        "Influencer Marketing Hub — CareerTok",
        "Euronews — CareerTok Gen Z trend",
        "16Personalities — Premium Career Suite pricing",
        "Inpages — 16Personalities marketing strategy",
      ],
    },
    {
      topic: "Monetisation, GTM & regulatory",
      items: [
        "BoardDocs Kansas — Xello pricing quote ($3.60/HS, $3.00/MS per student)",
        "EdWeek Market Brief — K-12 sales cycle 6–18 months",
        "Civic IQ — How to sell to school districts (2026)",
        "FirstPageSage — SaaS Freemium conversion benchmarks (EdTech 2.6%)",
        "Medium / Nico Bottaro — Duolingo 8.8% conversion case study",
        "Chegg — Q4 2024 / FY2024 results & Q1 2025 subscriber decline",
        "Holoniq — EdTech VC reached $2.4B in 2024 (decade low)",
        "EdWeek Market Brief — 2024 worst year for EdTech VC in a decade",
        "Finro — EdTech multiples Q4 2025 (18.6× SaaS, <5× DTC subs)",
        "K12Dive — $17.25M PowerSchool / Naviance settlement (Feb 2026)",
        "PowerSchool Naviance Settlement — claim portal & terms",
        "Anonym — COPPA 2026 compliance ($51,744 / violation / day)",
        "ICO UK — Children's Code (Age Appropriate Design)",
        "Find a Tender — National Careers Service £8.81M contract (Methods, 2022–26)",
        "GOV.UK — National Careers Service 2025–26 funding rules",
        "GOV.UK — Education Secretary £2.5M Careers Hubs boost",
        "OECD — Utdanning.no Norway career portal profile",
        "Euroguidance — Norway / Denmark guidance system",
        "SPA — HRDF Q3 2024 SAR 1.4B training spend",
        "Saudi Vision 2030 — Human Capability Development Programme",
        "PIB / NSDC — Skill India / PMKVY 4.0",
        "Prospeo / Financial Models Lab — EdTech churn & CAC benchmarks",
        "Erasmus+ 2026 Annual Work Programme",
      ],
    },
  ];

  return (
    <PageFrame section="Sources">
      <SectionHeader
        number="14"
        title="Sources."
        lead="Every claim in this report traces to one of the named sources below. Where a source is not publicly disclosed (per-school ARPU for several incumbents, gov-contract specifics for some Gulf platforms), the report flags it as estimated rather than known."
      />

      {sources.map((group, i) => (
        <View key={i} style={{ marginBottom: 12 }} wrap={false}>
          <Text style={s.h3}>{group.topic}</Text>
          <View style={{ height: 4 }} />
          {group.items.map((item, j) => (
            <View key={j} style={s.bulletRow}>
              <Text style={[s.bulletMark, { color: c.subtle }]}>·</Text>
              <Text style={[s.bulletText, { fontSize: 8.5, color: c.muted, lineHeight: 1.45 }]}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
    </PageFrame>
  );
}

// ── Document ───────────────────────────────────────────────────────

function MarketResearchDocument() {
  return (
    <Document
      title="Endeavrly — Deep Market Research v2 (May 2026)"
      author="Endeavrly · Founder Briefing"
      subject="Investment-grade market research on the Endeavrly youth career-intelligence platform"
    >
      <CoverPage />
      <ProductFraming />
      <ExecSummary />
      <ProblemValidation />
      <MarketDemand />
      <UserSegment />
      <Competitive />
      <PMFSignals />
      <Differentiation />
      <TrustSafetyMoat />
      <Monetisation />
      <ScaleRisks />
      <BrutalWeakness />
      <FounderStrategy />
      <FinalScores />
      <FinalVerdict />
      <SourcesPage />
    </Document>
  );
}

// ── Runner ─────────────────────────────────────────────────────────

async function main() {
  const outDir = path.join(process.cwd(), "scripts", "output");
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "endeavrly-market-research-v2-may-2026.pdf");

  console.log("Rendering PDF…");
  const buf = await renderToBuffer(<MarketResearchDocument />);
  await fs.writeFile(outPath, buf);
  const stat = await fs.stat(outPath);
  console.log(`✔ Wrote ${outPath} (${(stat.size / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});

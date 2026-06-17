import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Svg,
  Path,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import path from "path";

/**
 * Endeavrly — short distributable whitepaper (4 pages).
 *
 * A standalone, on-brand PDF for interest groups (schools, youth
 * organisations, funders, partners). Served as a download from /api/whitepaper.
 *
 * FONT NOTE: the repo's public/fonts/Inter-*.ttf are the Inter *variable*
 * font, which @react-pdf cannot subset (renders blank glyphs). So this doc
 * uses the static Poppins-SemiBold for headings/brand and the engine's
 * built-in Helvetica for body text — both render reliably. (Replacing the
 * variable Inter with static instances would let the wider report stack use
 * Inter again; tracked separately.)
 */

let fontsRegistered = false;
function registerFontsOnce() {
  if (fontsRegistered) return;
  fontsRegistered = true;
  const fontsDir = path.join(process.cwd(), "public", "fonts");
  Font.register({
    family: "Poppins",
    fonts: [{ src: path.join(fontsDir, "Poppins-SemiBold.ttf"), fontWeight: 600 }],
  });
  Font.registerHyphenationCallback((w) => [w]);
}

const C = {
  ink: "#0B1220",
  body: "#27313F",
  muted: "#4B5563",
  faint: "#64748B",
  hairline: "#E2E8F0",
  bg: "#FBFAF6",
  accent: "#0F766E",
  accentSoft: "#E6F4F1",
  coverBg: "#0B1220",
  coverAccent: "#14B8A6",
  coverText: "#F8FAFC",
  coverMuted: "#94A3B8",
};

// Headings use Poppins (static, brand). Body omits fontFamily on purpose →
// the engine's built-in Helvetica, which always renders.
const POPPINS = { fontFamily: "Poppins", fontWeight: 600 as const };

const s = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    paddingTop: 54,
    paddingBottom: 56,
    paddingHorizontal: 52,
    fontSize: 10.5,
    lineHeight: 1.6,
    color: C.body,
  },
  cover: { backgroundColor: C.coverBg, padding: 52, color: C.coverText, height: "100%" },
  h1: { ...POPPINS, fontSize: 20, color: C.ink, letterSpacing: -0.2, marginBottom: 4 },
  h2: { ...POPPINS, fontSize: 13.5, color: C.ink, marginBottom: 6 },
  eyebrow: { ...POPPINS, fontSize: 8.5, letterSpacing: 1.2, textTransform: "uppercase", color: C.accent, marginBottom: 5 },
  body: { fontSize: 10.5, color: C.body, lineHeight: 1.62, marginBottom: 8 },
  strong: { fontWeight: 700, color: C.ink },
  accentBar: { height: 2.5, width: 40, backgroundColor: C.accent, marginTop: 8, marginBottom: 14 },
  rule: { height: 0.75, backgroundColor: C.hairline, marginVertical: 14 },
  bullet: { flexDirection: "row", marginBottom: 5 },
  bulletDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.accent, marginTop: 5, marginRight: 8 },
  bulletText: { flex: 1, fontSize: 10, color: C.body, lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 28, left: 52, right: 52, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: C.faint },
});

function BrandMark({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <Path d="M12 2 L20 21 L12 17 L4 21 Z" fill={color} />
    </Svg>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.bullet}>
      <View style={s.bulletDot} />
      <Text style={s.bulletText}>{children}</Text>
    </View>
  );
}

function Stat({ value, label, source }: { value: string; label: string; source: string }) {
  return (
    <View style={{ marginBottom: 11 }}>
      <Text style={{ ...POPPINS, fontSize: 17, color: C.accent }}>{value}</Text>
      <Text style={{ fontSize: 9.5, color: C.body, lineHeight: 1.45, marginTop: 2 }}>{label}</Text>
      <Text style={{ fontSize: 7.5, color: C.faint, marginTop: 1 }}>{source}</Text>
    </View>
  );
}

function PageFooter({ n }: { n: number }) {
  return (
    <View style={s.footer} fixed>
      <Text>Endeavrly — endeavrly.no</Text>
      <Text>{n}</Text>
    </View>
  );
}

export function WhitepaperDocument() {
  registerFontsOnce();
  return (
    <Document
      title="Endeavrly — Whitepaper"
      author="Endeavrly"
      subject="A calm, safe, privacy-first career-exploration platform for ages 15+"
    >
      {/* ── Page 1 — Cover ─────────────────────────────────────────── */}
      <Page size="A4">
        <View style={s.cover}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            <BrandMark color={C.coverAccent} size={20} />
            <Text style={{ ...POPPINS, fontSize: 15, color: C.coverText }}>Endeavrly</Text>
          </View>

          <View style={{ marginTop: 150 }}>
            <Text style={{ ...POPPINS, fontSize: 9, letterSpacing: 1.6, textTransform: "uppercase", color: C.coverAccent, marginBottom: 14 }}>
              Whitepaper
            </Text>
            <Text style={{ ...POPPINS, fontSize: 30, color: C.coverText, lineHeight: 1.15, letterSpacing: -0.6 }}>
              Helping young people figure out their future.
            </Text>
            <View style={{ height: 3, width: 56, backgroundColor: C.coverAccent, marginTop: 20, marginBottom: 20 }} />
            <Text style={{ fontSize: 12, color: C.coverMuted, lineHeight: 1.6, maxWidth: 420 }}>
              A calm, safe, privacy-first platform for exploring careers and building real
              direction — youth-first, and open to anyone 15 or older.
            </Text>
          </View>

          <View style={{ position: "absolute", bottom: 52, left: 52, right: 52 }}>
            <View style={{ height: 0.75, backgroundColor: C.coverMuted, opacity: 0.3, marginBottom: 12 }} />
            <Text style={{ fontSize: 8.5, color: C.coverMuted }}>
              Not a jobs marketplace · No ads · No in-app payments · GDPR by design
            </Text>
          </View>
        </View>
      </Page>

      {/* ── Page 2 — The problem + What it is ──────────────────────── */}
      <Page size="A4" style={s.page}>
        <Text style={s.eyebrow}>The problem</Text>
        <Text style={s.h1}>Young people are asked to choose a future they&rsquo;ve never seen.</Text>
        <View style={s.accentBar} />
        <Text style={s.body}>
          Teenagers are told to choose subjects, choose a degree, and choose a career — long before
          anyone shows them what those careers actually involve. The result is widespread uncertainty,
          expectations concentrated on a handful of high-profile jobs, and decisions made on guesswork
          rather than understanding.
        </Text>

        <View style={{ flexDirection: "row", gap: 22, marginTop: 6, marginBottom: 6 }}>
          <View style={{ flex: 1 }}>
            <Stat value="39%" label="of 15-year-olds cannot name a career they expect to pursue — the highest share on record." source="OECD, 2025" />
            <Stat value="45%" label="have ever visited a workplace to see how a career actually works." source="OECD / PISA 2022" />
          </View>
          <View style={{ flex: 1 }}>
            <Stat value="41%" label="of young people are unsure how to choose their path, even when optimistic about the future." source="Gallup / Walton Family Foundation, 2024" />
            <Stat value="58%" label="expect professional careers (doctor, lawyer, engineer) — roles that employ far fewer in reality." source="OECD, 2025" />
          </View>
        </View>

        <View style={s.rule} />

        <Text style={s.eyebrow}>What Endeavrly is</Text>
        <Text style={s.h2}>A career-exploration and clarity platform — calm by design.</Text>
        <Text style={s.body}>
          Endeavrly helps young people explore careers, understand realistic pathways, and build
          genuine clarity about their direction. It is built around three lenses, in sequence — each
          one gives you what you need for the next:
        </Text>
        <Bullet><Text style={s.strong}>Discover</Text> — explore what a career really looks like: lifestyle, salary, a typical day, and the subjects that matter.</Bullet>
        <Bullet><Text style={s.strong}>Understand</Text> — go deeper into education routes, real entry requirements, and honest reality checks.</Bullet>
        <Bullet><Text style={s.strong}>Clarity</Text> — a personalised roadmap from where you are now to where you want to be, with concrete next steps.</Bullet>
        <Text style={[s.body, { marginTop: 8 }]}>
          Alongside the journey sit a preference-matching <Text style={s.strong}>Career Radar</Text>,
          an AI <Text style={s.strong}>Career Twin</Text> you can ask what a job is really like, and a
          catalogue of over a thousand careers with honest detail about pay, qualifications, and growth.
        </Text>

        <PageFooter n={2} />
      </Page>

      {/* ── Page 3 — Who it's for + How it's different ─────────────── */}
      <Page size="A4" style={s.page}>
        <Text style={s.eyebrow}>Who it&rsquo;s for</Text>
        <Text style={s.h1}>Youth-first — and useful at any age.</Text>
        <View style={s.accentBar} />
        <Text style={s.body}>
          Endeavrly is built for young people starting out — typically 15&ndash;23 — but it is just as
          useful at any age for someone weighing a change of direction. A 34-year-old rethinking their
          path, or a 45-year-old curious about becoming a coach, gets the same honest exploration and a
          roadmap built from <Text style={s.strong}>where they are now</Text> — leveraging the experience
          they already have, not a school timetable. Anyone aged 15 or older is welcome. Age is only
          ever used to personalise the roadmap — never to gate access.
        </Text>

        <View style={s.rule} />

        <Text style={s.eyebrow}>How it&rsquo;s different</Text>
        <Text style={s.h2}>Trust is the product.</Text>
        <Text style={[s.body, { marginBottom: 10 }]}>
          Most platforms aimed at young people optimise for engagement. Endeavrly optimises for clarity
          and safety. That shapes every decision:
        </Text>
        <Bullet><Text style={s.strong}>Safe by design.</Text> No open social mechanics or public messaging between users; structured interactions only, with reporting and moderation throughout.</Bullet>
        <Bullet><Text style={s.strong}>Privacy-first (GDPR).</Text> Minimal data collection, no tracking ads, no behavioural profiling, no dark patterns.</Bullet>
        <Bullet><Text style={s.strong}>Calm, not addictive.</Text> No engagement-bait feeds, no streaks, no leaderboards, no follower counts. Trust signals are never social scoring.</Bullet>
        <Bullet><Text style={s.strong}>Honest.</Text> Straight information about what careers really involve — including the hard parts — drawn from real data, not hype.</Bullet>
        <Bullet><Text style={s.strong}>Not a marketplace.</Text> No job posters, no employer accounts, no gig work, and no in-app payments.</Bullet>

        <PageFooter n={3} />
      </Page>

      {/* ── Page 4 — Why it matters + Get involved ─────────────────── */}
      <Page size="A4" style={s.page}>
        <Text style={s.eyebrow}>Why it matters</Text>
        <Text style={s.h1}>Exploration changes outcomes.</Text>
        <View style={s.accentBar} />
        <Text style={s.body}>
          This is not only a confidence problem — it is an outcomes problem. Young people who engage in
          career-development activities, such as workplace visits and conversations with advisors, show
          better employment rates, earnings, and career satisfaction by age 25. Yet structured guidance
          remains out of reach for many: nearly half of 15-year-olds have never spoken with a career
          advisor. Endeavrly puts that exploration in every young person&rsquo;s pocket — calmly,
          privately, and for free.
        </Text>
        <Text style={{ fontSize: 8, color: C.faint, marginBottom: 4 }}>
          Sources: OECD, &ldquo;The State of Global Teenage Career Preparation&rdquo; (2025) and PISA 2022; Gallup / Walton Family Foundation (2024).
        </Text>

        <View style={s.rule} />

        <View style={{ backgroundColor: C.accentSoft, borderLeftWidth: 2, borderLeftColor: C.accent, padding: 16, marginTop: 4 }}>
          <Text style={s.eyebrow}>For interest groups</Text>
          <Text style={[s.h2, { marginBottom: 6 }]}>Let&rsquo;s help more young people find their direction.</Text>
          <Text style={[s.body, { marginBottom: 8 }]}>
            We&rsquo;re working with schools, youth organisations, funders, and partners who share the
            goal of giving young people honest, calm, and safe career exploration. Whether you support
            students directly or fund the systems that do, we&rsquo;d welcome a conversation.
          </Text>
          <Bullet><Text style={s.strong}>Schools &amp; colleges</Text> — a calm complement to careers guidance, safe for every student.</Bullet>
          <Bullet><Text style={s.strong}>Youth organisations</Text> — a private tool young people can use at their own pace.</Bullet>
          <Bullet><Text style={s.strong}>Funders &amp; partners</Text> — measurable engagement with career clarity, privacy-first by default.</Bullet>
          <Text style={[s.body, { marginTop: 10, marginBottom: 0 }]}>
            Get in touch: <Text style={{ fontWeight: 700, color: C.accent }}>support@endeavrly.no</Text> · endeavrly.no
          </Text>
        </View>

        <PageFooter n={4} />
      </Page>
    </Document>
  );
}

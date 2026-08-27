"use client";

/**
 * Light-mode canvas tones — review gallery (/lab/light-themes).
 *
 * Fifty candidate LIGHT backgrounds, grouped into ten families, each rendered
 * as a mock of the signed-in dashboard so they can be judged in real context.
 * Ink, the teal brand, white-on-brand and the gold accent are held CONSTANT so
 * the only variable is the canvas itself.
 *
 * Two deliberate constraints, both carried over from the live theme:
 *  - No stark white. Every base sits in the 78–92% lightness band, i.e. a toned
 *    paper, never a bright page. `globals.css` already remaps `bg-white` away
 *    in light mode; a near-white candidate here would misrepresent the result.
 *  - Cards step LIGHTER than the canvas, sidebar sits slightly deeper, and the
 *    border takes a decisive step down, so tinted surfaces stay separated.
 *
 * Nothing here touches the real app — pick a number and it gets wired into the
 * `:root` block in globals.css.
 */

import { useMemo, useRef, useState } from "react";
import {
  LayoutDashboard,
  Route,
  Target,
  Library,
  Compass,
  Sparkles,
  Star,
  Shuffle,
  CheckCircle2,
  Navigation2,
  type LucideIcon,
} from "lucide-react";

/** An HSL triple ("H S% L%"), ready to drop straight into hsl(...). */
type Hsl = string;

type Base = {
  id: number;
  name: string;
  vibe: string;
  /** The canvas. Everything else is derived from it. */
  bg: Hsl;
  /** True for the tone currently live in globals.css. */
  current?: boolean;
};

type Family = { title: string; blurb: string; bases: Base[] };

type Palette = {
  id: number;
  name: string;
  vibe: string;
  current?: boolean;
  background: Hsl;
  card: Hsl;
  sidebar: Hsl;
  border: Hsl;
  sidebarBorder: Hsl;
};

// ── Held constant across all fifty ───────────────────────────────────────────
// Deliberately the live values, so a chosen canvas can be pasted into
// globals.css without re-deriving anything else.
const INK = "202 30% 14%"; // --foreground
const MUTED_INK = "200 14% 34%"; // --muted-foreground
const BRAND = "178 69% 29%"; // --primary, #177D7A
const ON_BRAND = "0 0% 100%"; // --primary-foreground
const GOLD = "38 62% 42%"; // achievement gold, darkened to read on light
const VIOLET = "258 42% 42%"; // "Surprise me" secondary action

function parse(hsl: Hsl): [number, number, number] {
  const [h, s, l] = hsl.split(" ");
  return [parseFloat(h), parseFloat(s), parseFloat(l)];
}

const round = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Derive the surface set from a canvas, using the same relationships the live
 * "Deep Sea" theme uses: card +5L and a touch more saturated, sidebar -2L,
 * border a decisive -17L so tinted cards never blur into the page, and the
 * sidebar splitter deeper still at -21L.
 *
 * Sanity check: feeding Deep Sea's own canvas (198 32% 79%) back through this
 * reproduces the live tokens to within a rounding step, so a tone picked here
 * lands where you'd expect once pasted into globals.css.
 */
function toPalette(base: Base): Palette {
  const [h, s, l] = parse(base.bg);
  const fmt = (hh: number, ss: number, ll: number) =>
    `${round(hh)} ${round(clamp(ss, 0, 100))}% ${round(clamp(ll, 0, 100))}%`;
  return {
    id: base.id,
    name: base.name,
    vibe: base.vibe,
    current: base.current,
    background: base.bg,
    card: fmt(h + 1, s * 1.19, l + 5),
    sidebar: fmt(h - 1, s * 0.88, l - 2),
    border: fmt(h - 1, s * 0.8, l - 17),
    sidebarBorder: fmt(h - 2, s * 0.94, l - 21),
  };
}

// ── The fifty canvases ───────────────────────────────────────────────────────
// Ten families of five. Within a family the hue holds and the lightness /
// saturation move, so each row is a genuine like-for-like comparison.
const FAMILIES: Family[] = [
  {
    title: "Teal & Sea",
    blurb: "Brand-native. The canvas shares a hue family with the teal, so nothing clashes.",
    bases: [
      { id: 1, name: "Deep Sea", vibe: "the tone live today — deep teal-blue paper", bg: "198 32% 79%", current: true },
      { id: 2, name: "Shallow Sea", vibe: "same hue, lifted — lighter and airier", bg: "196 34% 84%" },
      { id: 3, name: "Lagoon", vibe: "greener, brighter water", bg: "186 30% 82%" },
      { id: 4, name: "Seafoam", vibe: "soft, desaturated sea-green", bg: "172 26% 85%" },
      { id: 5, name: "Spa Teal", vibe: "quietest teal — barely tinted", bg: "178 22% 87%" },
    ],
  },
  {
    title: "Blue & Slate",
    blurb: "Cooler and more corporate than the sea family. Reads calm, slightly formal.",
    bases: [
      { id: 6, name: "Harbour", vibe: "working blue, mid-depth", bg: "205 30% 82%" },
      { id: 7, name: "Steel Blue", vibe: "desaturated grey-blue", bg: "210 24% 84%" },
      { id: 8, name: "Denim", vibe: "honest mid-blue with body", bg: "216 28% 81%" },
      { id: 9, name: "Cornflower", vibe: "lighter, friendlier blue", bg: "222 34% 85%" },
      { id: 10, name: "Slate Navy", vibe: "deepest of the blues — grounded", bg: "212 20% 79%" },
    ],
  },
  {
    title: "Warm Paper & Sand",
    blurb: "The original Endeavrly direction. Warm, human, notebook-like.",
    bases: [
      { id: 11, name: "Warm Paper", vibe: "the classic warm-paper canvas", bg: "40 30% 88%" },
      { id: 12, name: "Oat", vibe: "softer, oatier, less yellow", bg: "38 26% 86%" },
      { id: 13, name: "Sandstone", vibe: "more pigment — proper sand", bg: "34 28% 84%" },
      { id: 14, name: "Parchment", vibe: "palest of the warm set", bg: "42 24% 89%" },
      { id: 15, name: "Wheat", vibe: "sunnier, golden lean", bg: "44 32% 87%" },
    ],
  },
  {
    title: "Clay, Terracotta & Rose",
    blurb: "Warmest family. Distinctive and human, but pulls attention toward the canvas.",
    bases: [
      { id: 16, name: "Clay", vibe: "earthy warm neutral", bg: "22 26% 85%" },
      { id: 17, name: "Terracotta", vibe: "strongest warm pigment here", bg: "16 32% 82%" },
      { id: 18, name: "Peach", vibe: "soft, optimistic warmth", bg: "24 40% 87%" },
      { id: 19, name: "Rose Beige", vibe: "beige with a pink lean", bg: "10 24% 87%" },
      { id: 20, name: "Dusty Rose", vibe: "muted pink — quiet, not sweet", bg: "350 22% 85%" },
    ],
  },
  {
    title: "Sage & Green",
    blurb: "Sits natively under the teal brand. Restful; the safest non-blue direction.",
    bases: [
      { id: 21, name: "Sage", vibe: "classic muted green-grey", bg: "120 14% 86%" },
      { id: 22, name: "Eucalyptus", vibe: "cooler, closer to the brand", bg: "140 16% 84%" },
      { id: 23, name: "Celadon", vibe: "lighter, porcelain green", bg: "132 20% 87%" },
      { id: 24, name: "Moss Paper", vibe: "yellow-leaning, warmer green", bg: "100 14% 85%" },
      { id: 25, name: "Fern", vibe: "deepest green — grounded", bg: "150 18% 82%" },
    ],
  },
  {
    title: "Lavender & Plum",
    blurb: "Cool and distinctive. Youth-friendly without being loud.",
    bases: [
      { id: 26, name: "Lavender Mist", vibe: "palest lilac wash", bg: "265 24% 88%" },
      { id: 27, name: "Lilac", vibe: "clear, gentle purple", bg: "275 22% 86%" },
      { id: 28, name: "Wisteria", vibe: "blue-leaning violet", bg: "258 26% 85%" },
      { id: 29, name: "Amethyst", vibe: "more pigment, more presence", bg: "282 20% 83%" },
      { id: 30, name: "Plum Dusk", vibe: "deepest, dustiest purple", bg: "295 16% 82%" },
    ],
  },
  {
    title: "Greige & Stone",
    blurb: "Near-neutral. Lets the teal and gold do all the talking.",
    bases: [
      { id: 31, name: "Greige", vibe: "warm grey — calm and grown-up", bg: "36 15% 87%" },
      { id: 32, name: "Cool Stone", vibe: "grey with a blue lean", bg: "210 12% 86%" },
      { id: 33, name: "Pewter", vibe: "cooler, slightly deeper", bg: "220 8% 84%" },
      { id: 34, name: "Ash", vibe: "true neutral, zero hue", bg: "0 0% 87%" },
      { id: 35, name: "Taupe", vibe: "warm grey-brown", bg: "28 10% 84%" },
    ],
  },
  {
    title: "Gold, Honey & Ochre",
    blurb: "Shares a hue with the achievement gold — rich, but watch the accent competing.",
    bases: [
      { id: 36, name: "Honey", vibe: "warm golden paper", bg: "42 42% 85%" },
      { id: 37, name: "Ochre", vibe: "deeper, more pigment", bg: "38 38% 82%" },
      { id: 38, name: "Caramel", vibe: "orange-leaning gold", bg: "30 34% 83%" },
      { id: 39, name: "Amber Glow", vibe: "brightest, sunniest option", bg: "46 46% 86%" },
      { id: 40, name: "Brass", vibe: "muted, metallic gold", bg: "44 28% 81%" },
    ],
  },
  {
    title: "Mist & Ice",
    blurb: "Coolest and most desaturated. Closest to a plain page without being white.",
    bases: [
      { id: 41, name: "Mist", vibe: "barely-there cool tint", bg: "200 18% 89%" },
      { id: 42, name: "Ice", vibe: "clean, crisp blue-white", bg: "195 26% 88%" },
      { id: 43, name: "Powder", vibe: "soft blue haze", bg: "214 22% 88%" },
      { id: 44, name: "Glacier", vibe: "cooler, faintly green", bg: "190 20% 86%" },
      { id: 45, name: "Fog", vibe: "greyest of the cool set", bg: "206 10% 87%" },
    ],
  },
  {
    title: "Deep-toned paper",
    blurb: "The grounded end (78–79% lightness). Most confident; least like a blank page.",
    bases: [
      { id: 46, name: "Deep Harbour", vibe: "Deep Sea, pushed further", bg: "202 28% 78%" },
      { id: 47, name: "Deep Clay", vibe: "rich, warm and enveloping", bg: "18 24% 79%" },
      { id: 48, name: "Deep Sage", vibe: "forest-adjacent, very calm", bg: "135 16% 78%" },
      { id: 49, name: "Deep Slate", vibe: "serious, near-architectural", bg: "216 16% 78%" },
      { id: 50, name: "Deep Plum", vibe: "unusual and memorable", bg: "285 16% 79%" },
    ],
  },
];

const ALL: Palette[] = FAMILIES.flatMap((f) => f.bases.map(toPalette));

const NAV: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Route, label: "My Journey" },
  { icon: Target, label: "Career Radar" },
  { icon: Compass, label: "Explore Careers" },
  { icon: Library, label: "My Library" },
];

/** Full-width dashboard mock — the honest test of a canvas. */
function Mock({ p }: { p: Palette }) {
  const bg = `hsl(${p.background})`;
  const card = `hsl(${p.card})`;
  const sidebar = `hsl(${p.sidebar})`;
  const border = `hsl(${p.border})`;
  const fg = `hsl(${INK})`;
  const muted = `hsl(${MUTED_INK})`;
  const brand = `hsl(${BRAND})`;

  const sectionCard: React.CSSProperties = {
    background: card,
    border: `1px solid ${border}`,
    borderRadius: 14,
    padding: 16,
  };

  return (
    <div style={{ display: "flex", background: bg, color: fg, minHeight: 480, fontFamily: "system-ui, sans-serif" }}>
      <aside style={{ width: 210, background: sidebar, borderRight: `1px solid hsl(${p.sidebarBorder})`, padding: "18px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "2px 6px 16px" }}>
          <span style={{ display: "inline-flex", height: 26, width: 26, alignItems: "center", justifyContent: "center", borderRadius: 8, background: brand }}>
            <Navigation2 size={15} color={`hsl(${ON_BRAND})`} />
          </span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Endeavrly</span>
        </div>
        {NAV.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, fontSize: 13.5,
              color: item.active ? fg : muted,
              background: item.active ? `hsl(${BRAND} / 0.16)` : "transparent",
              fontWeight: item.active ? 600 : 500,
            }}
          >
            <item.icon size={16} color={item.active ? brand : muted} />
            {item.label}
          </div>
        ))}
      </aside>

      <main style={{ flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Good to see you, Green 👋</div>
          <div style={{ fontSize: 12.5, color: muted, marginTop: 3 }}>Your direction, one calm step at a time.</div>
        </div>

        <div style={{ background: card, border: `1px solid hsl(${BRAND} / 0.45)`, borderRadius: 16, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>My Journey — Management Consultant</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: brand, fontWeight: 600 }}>
              <CheckCircle2 size={14} /> Complete
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ height: 64, width: 64, borderRadius: "50%", border: `4px solid ${brand}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: brand }}>3/3</div>
            <div style={{ flex: 1, display: "flex", gap: 8 }}>
              {["Discover", "Understand", "Clarity"].map((s) => (
                <div key={s} style={{ flex: 1 }}>
                  <div style={{ height: 6, borderRadius: 99, background: brand }} />
                  <div style={{ fontSize: 11.5, color: muted, marginTop: 6, textAlign: "center" }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={sectionCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: muted, marginBottom: 10 }}>
              <Target size={13} /> My Explored Journeys
            </div>
            {[["Management Consultant", "★★★☆☆"], ["Marine Biologist", "★★★★☆"], ["Genetic Counsellor", "★★★★★"]].map(([role, stars]) => (
              <div key={role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderTop: `1px solid ${border}` }}>
                <span style={{ fontSize: 13 }}>{role}</span>
                <span style={{ fontSize: 12, color: `hsl(${GOLD})` }}>{stars}</span>
              </div>
            ))}
          </div>
          <div style={sectionCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: muted, marginBottom: 10 }}>
              <Star size={13} /> Saved Careers
            </div>
            {["Paramedic", "Agile Coach", "Architect"].map((role) => (
              <div key={role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderTop: `1px solid ${border}` }}>
                <span style={{ fontSize: 13 }}>{role}</span>
                <span style={{ fontSize: 11.5, color: muted }}>saved</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, background: brand, color: `hsl(${ON_BRAND})`, border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600 }}>
            <Sparkles size={14} /> Set a career goal
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", color: `hsl(${VIOLET})`, border: `1px solid hsl(${VIOLET} / 0.45)`, borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600 }}>
            <Shuffle size={14} /> Surprise me
          </button>
          <span style={{ fontSize: 12, color: muted, marginLeft: 4 }}>Recommended for you · updated today</span>
        </div>
      </main>
    </div>
  );
}

/** Compact tile — enough structure to judge a tone, cheap enough to render 50. */
function Tile({ p, selected, onPick }: { p: Palette; selected: boolean; onPick: () => void }) {
  const border = `hsl(${p.border})`;
  const muted = `hsl(${MUTED_INK})`;
  return (
    <button
      onClick={onPick}
      style={{
        display: "block", width: "100%", textAlign: "left", padding: 0, cursor: "pointer",
        borderRadius: 12, overflow: "hidden",
        border: selected ? "2px solid #14b8a6" : "1px solid #d8d3cb",
        boxShadow: selected ? "0 0 0 4px rgba(20,184,166,0.18)" : "none",
        background: "transparent",
      }}
    >
      <div style={{ display: "flex", background: `hsl(${p.background})`, height: 104 }}>
        <div style={{ width: 34, background: `hsl(${p.sidebar})`, borderRight: `1px solid hsl(${p.sidebarBorder})`, padding: 7, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ height: 10, width: 10, borderRadius: 3, background: `hsl(${BRAND})` }} />
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 4, borderRadius: 99, background: `hsl(${MUTED_INK} / ${i === 0 ? 0.55 : 0.25})` }} />
          ))}
        </div>
        <div style={{ flex: 1, padding: 9, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ height: 5, width: "52%", borderRadius: 99, background: `hsl(${INK} / 0.7)` }} />
          <div style={{ background: `hsl(${p.card})`, border: `1px solid hsl(${BRAND} / 0.45)`, borderRadius: 6, height: 26 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ flex: 1, background: `hsl(${p.card})`, border: `1px solid ${border}`, borderRadius: 6, height: 20 }} />
            <div style={{ flex: 1, background: `hsl(${p.card})`, border: `1px solid ${border}`, borderRadius: 6, height: 20 }} />
          </div>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <div style={{ height: 11, width: 40, borderRadius: 99, background: `hsl(${BRAND})` }} />
            <div style={{ height: 11, width: 28, borderRadius: 99, border: `1px solid hsl(${VIOLET} / 0.45)` }} />
          </div>
        </div>
      </div>
      <div style={{ padding: "8px 10px", background: "#fff", borderTop: "1px solid #eceae6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#26221d" }}>{p.id}. {p.name}</span>
          {p.current && (
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "#0f766e", background: "#ccfbf1", borderRadius: 99, padding: "1px 6px" }}>
              live
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: muted, marginTop: 2, lineHeight: 1.35 }}>{p.vibe}</div>
      </div>
    </button>
  );
}

export function LightThemesLab() {
  const [selectedId, setSelectedId] = useState(1);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(
    () => ALL.find((p) => p.id === selectedId) ?? ALL[0],
    [selectedId],
  );

  const pick = (id: number) => {
    setSelectedId(id);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fullscreen = () => {
    const el = previewRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  // Token names match the `:root` block in globals.css exactly, so this can be
  // pasted straight in without translation.
  const cssBlock = [
    `--background: ${selected.background};`,
    `--card: ${selected.card};`,
    `--sidebar: ${selected.sidebar};`,
    `--border: ${selected.border};`,
    `--sidebar-border: ${selected.sidebarBorder};`,
  ].join("\n");

  return (
    <div style={{ minHeight: "100vh", background: "#f4f2ee", color: "#26221d" }}>
      <div ref={topRef} />

      <header style={{ padding: "24px 28px 8px", maxWidth: 900 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Light mode — 50 canvas tones</h1>
        <p style={{ fontSize: 13, color: "#6b655e", margin: "6px 0 0", lineHeight: 1.55 }}>
          Ten families of five. Ink, the teal brand, white-on-brand and the achievement gold are held
          constant, so the only thing changing is the canvas. Every tone sits between 78% and 92%
          lightness — a toned paper, never a white page, matching the existing{" "}
          <strong style={{ color: "#3f3a33" }}>no stark white</strong> direction. Cards step lighter
          than the canvas, the sidebar sits a touch deeper, and the border takes a decisive step down.
        </p>
        <p style={{ fontSize: 13, color: "#6b655e", margin: "10px 0 0", lineHeight: 1.55 }}>
          Click any tile to load it into the big preview. Tell me a number and it gets wired into{" "}
          <code style={{ background: "#e8e5df", borderRadius: 4, padding: "1px 5px" }}>globals.css</code>.
        </p>
      </header>

      {/* Selected preview */}
      <section style={{ padding: "18px 0 8px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "0 28px 10px" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {selected.id}. {selected.name}
              {selected.current && (
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "#0f766e", background: "#ccfbf1", borderRadius: 99, padding: "2px 7px", marginLeft: 8 }}>
                  live today
                </span>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: "#6b655e", marginTop: 2 }}>{selected.vibe}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 5 }}>
              {([["canvas", selected.background], ["card", selected.card], ["sidebar", selected.sidebar], ["edge", selected.border], ["brand", BRAND]] as const).map(([label, hsl]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ height: 28, width: 28, borderRadius: 6, background: `hsl(${hsl})`, border: "1px solid #d8d3cb" }} />
                  <div style={{ fontSize: 8, color: "#6b655e", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
            <button
              onClick={fullscreen}
              style={{ background: "#fff", color: "#26221d", border: "1px solid #d8d3cb", borderRadius: 8, padding: "8px 13px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              ⛶ Fullscreen
            </button>
          </div>
        </div>
        <div ref={previewRef}>
          <Mock p={selected} />
        </div>
        <pre style={{ margin: "12px 28px 0", padding: 12, background: "#fff", border: "1px solid #e3dfd8", borderRadius: 10, fontSize: 11.5, color: "#3f3a33", overflowX: "auto" }}>
{cssBlock}
        </pre>
      </section>

      {/* The fifty */}
      <div style={{ padding: "22px 28px 72px", display: "flex", flexDirection: "column", gap: 30 }}>
        {FAMILIES.map((family) => (
          <section key={family.title}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{family.title}</h2>
            <p style={{ fontSize: 12, color: "#6b655e", margin: "3px 0 12px", maxWidth: 760 }}>{family.blurb}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(232px, 1fr))", gap: 14 }}>
              {family.bases.map((b) => {
                const p = toPalette(b);
                return <Tile key={p.id} p={p} selected={p.id === selectedId} onPick={() => pick(p.id)} />;
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

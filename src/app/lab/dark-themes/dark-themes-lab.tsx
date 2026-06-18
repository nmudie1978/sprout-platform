"use client";

/**
 * Dark-mode variants — review gallery (/lab/dark-themes).
 *
 * Ten candidate DARK themes, all different shades of DARK BLUE, each rendered
 * as a full-width mock of the signed-in dashboard so they can be judged in
 * real context. The teal brand accent + light text are held constant so the
 * comparison is purely about the dark-blue canvas/surfaces. Tap ⛶ Fullscreen
 * on any one to see it edge-to-edge (Esc to exit). Nothing here touches the
 * real app — pick a number and I'll wire it into globals.css `.dark`.
 */

import { useRef } from "react";
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

type Palette = {
  id: number;
  name: string;
  vibe: string;
  /** All HSL triples ("H S% L%") so they drop into hsl(...) directly. */
  background: string;
  card: string;
  sidebar: string;
  border: string;
  foreground: string;
  muted: string; // muted-foreground
  primary: string; // teal brand — held constant
};

// Light text + teal brand are constant across all ten so the only variable is
// the dark-blue base. Hue runs slate → ocean → indigo; lightness runs deep →
// lifted; saturation runs muted → rich.
const FOREGROUND = "210 24% 96%";
const MUTED = "215 16% 64%";
const PRIMARY = "166 72% 50%";

const PALETTES: Palette[] = [
  { id: 1, name: "Midnight Navy", vibe: "deep, classic navy — high contrast", background: "222 47% 8%", card: "222 40% 12%", sidebar: "222 50% 6%", border: "222 28% 20%", foreground: FOREGROUND, muted: MUTED, primary: PRIMARY },
  { id: 2, name: "Slate Blue", vibe: "desaturated, calm blue-grey", background: "220 24% 11%", card: "220 22% 15%", sidebar: "220 26% 8%", border: "220 16% 24%", foreground: FOREGROUND, muted: MUTED, primary: PRIMARY },
  { id: 3, name: "Deep Ocean", vibe: "saturated, true blue", background: "212 60% 9%", card: "212 50% 13%", sidebar: "212 64% 7%", border: "212 38% 22%", foreground: FOREGROUND, muted: MUTED, primary: PRIMARY },
  { id: 4, name: "Indigo Night", vibe: "blue with a violet lean", background: "234 44% 10%", card: "234 40% 14%", sidebar: "234 48% 8%", border: "234 28% 23%", foreground: FOREGROUND, muted: MUTED, primary: PRIMARY },
  { id: 5, name: "Steel Blue", vibe: "cool, lifted grey-blue", background: "215 26% 13%", card: "215 22% 17%", sidebar: "215 28% 10%", border: "215 16% 26%", foreground: FOREGROUND, muted: MUTED, primary: PRIMARY },
  { id: 6, name: "Prussian", vibe: "deep teal-leaning blue", background: "205 55% 9%", card: "205 46% 13%", sidebar: "205 58% 7%", border: "205 34% 22%", foreground: FOREGROUND, muted: MUTED, primary: PRIMARY },
  { id: 7, name: "Cobalt Dusk", vibe: "brighter cobalt base", background: "224 50% 11%", card: "224 44% 15%", sidebar: "224 54% 9%", border: "224 34% 25%", foreground: FOREGROUND, muted: MUTED, primary: PRIMARY },
  { id: 8, name: "Charcoal Blue", vibe: "near-black, faint blue tint", background: "220 32% 7%", card: "220 26% 11%", sidebar: "220 34% 5%", border: "220 20% 18%", foreground: FOREGROUND, muted: MUTED, primary: PRIMARY },
  { id: 9, name: "Sapphire", vibe: "rich, jewel-toned blue", background: "218 58% 10%", card: "218 48% 14%", sidebar: "218 62% 8%", border: "218 40% 24%", foreground: FOREGROUND, muted: MUTED, primary: PRIMARY },
  { id: 10, name: "Twilight", vibe: "soft, lifted blue-grey", background: "226 22% 14%", card: "226 20% 18%", sidebar: "226 24% 11%", border: "226 14% 27%", foreground: FOREGROUND, muted: MUTED, primary: PRIMARY },
];

const NAV: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Route, label: "My Journey" },
  { icon: Target, label: "Career Radar" },
  { icon: Compass, label: "Explore Careers" },
  { icon: Library, label: "My Library" },
];

function Mock({ p }: { p: Palette }) {
  const bg = `hsl(${p.background})`;
  const card = `hsl(${p.card})`;
  const sidebar = `hsl(${p.sidebar})`;
  const border = `hsl(${p.border})`;
  const fg = `hsl(${p.foreground})`;
  const muted = `hsl(${p.muted})`;
  const primary = `hsl(${p.primary})`;

  const sectionCard: React.CSSProperties = {
    background: card,
    border: `1px solid hsl(${p.border})`,
    borderRadius: 14,
    padding: 16,
  };

  return (
    <div style={{ display: "flex", background: bg, color: fg, minHeight: 480, fontFamily: "system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: 210, background: sidebar, borderRight: `1px solid ${border}`, padding: "18px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "2px 6px 16px" }}>
          <span style={{ display: "inline-flex", height: 26, width: 26, alignItems: "center", justifyContent: "center", borderRadius: 8, background: primary }}>
            <Navigation2 size={15} color={`hsl(${p.background})`} />
          </span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Endeavrly</span>
        </div>
        {NAV.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, fontSize: 13.5,
              color: item.active ? fg : muted,
              background: item.active ? `hsl(${p.primary} / 0.14)` : "transparent",
              fontWeight: item.active ? 600 : 500,
            }}
          >
            <item.icon size={16} color={item.active ? primary : muted} />
            {item.label}
          </div>
        ))}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Good to see you, Green 👋</div>
          <div style={{ fontSize: 12.5, color: muted, marginTop: 3 }}>Your direction, one calm step at a time.</div>
        </div>

        {/* My Journey card — emerald/primary border, like the live dashboard */}
        <div style={{ background: card, border: `1px solid hsl(${p.primary} / 0.35)`, borderRadius: 16, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>My Journey — Management Consultant</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: primary, fontWeight: 600 }}>
              <CheckCircle2 size={14} /> Complete
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ height: 64, width: 64, borderRadius: "50%", border: `4px solid ${primary}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: primary }}>3/3</div>
            <div style={{ flex: 1, display: "flex", gap: 8 }}>
              {["Discover", "Understand", "Clarity"].map((s) => (
                <div key={s} style={{ flex: 1 }}>
                  <div style={{ height: 6, borderRadius: 99, background: primary }} />
                  <div style={{ fontSize: 11.5, color: muted, marginTop: 6, textAlign: "center" }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two section cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={sectionCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: muted, marginBottom: 10 }}>
              <Target size={13} /> My Explored Journeys
            </div>
            {[["Management Consultant", "★★★☆☆"], ["Sniper", "★★★★☆"], ["Special Forces Operator", "★★★★★"]].map(([role, stars]) => (
              <div key={role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderTop: `1px solid ${border}` }}>
                <span style={{ fontSize: 13 }}>{role}</span>
                <span style={{ fontSize: 12, color: "hsl(40 90% 62%)" }}>{stars}</span>
              </div>
            ))}
          </div>
          <div style={sectionCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: muted, marginBottom: 10 }}>
              <Star size={13} /> Saved Careers
            </div>
            {["Sniper", "Agile Coach", "Genetic Counsellor"].map((role) => (
              <div key={role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderTop: `1px solid ${border}` }}>
                <span style={{ fontSize: 13 }}>{role}</span>
                <span style={{ fontSize: 11.5, color: muted }}>saved</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons + helper text */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, background: primary, color: `hsl(${p.background})`, border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600 }}>
            <Sparkles size={14} /> Set a career goal
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", color: "hsl(258 70% 72%)", border: "1px solid hsl(258 60% 60% / 0.5)", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600 }}>
            <Shuffle size={14} /> Surprise me
          </button>
          <span style={{ fontSize: 12, color: muted, marginLeft: 4 }}>Recommended for you · updated today</span>
        </div>
      </main>
    </div>
  );
}

export function DarkThemesLab() {
  const refs = useRef<Record<number, HTMLDivElement | null>>({});

  const fullscreen = (id: number) => {
    const el = refs.current[id] as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0d12", color: "#e5e7eb" }}>
      <header style={{ padding: "24px 28px 8px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Dark mode — 10 dark-blue variants</h1>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: "6px 0 0", maxWidth: 820 }}>
          Each is a different shade of dark blue, shown as a full-width dashboard mock. The teal brand
          accent and light text are held constant so you&apos;re judging only the blue canvas. Tap{" "}
          <strong style={{ color: "#d1d5db" }}>⛶ Fullscreen</strong> on any one. Tell me a number (1–10) and I&apos;ll wire it into the real dark theme.
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 36, padding: "18px 0 64px" }}>
        {PALETTES.map((p) => (
          <section key={p.id}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px 10px" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#f3f4f6" }}>
                  {p.id}. {p.name}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{p.vibe}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {([["bg", p.background], ["card", p.card], ["edge", p.border], ["brand", p.primary]] as const).map(([label, hsl]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ height: 26, width: 26, borderRadius: 6, background: `hsl(${hsl})`, border: "1px solid #2a2f3a" }} />
                      <div style={{ fontSize: 8, color: "#9ca3af", marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => fullscreen(p.id)}
                  style={{ background: "#1f2430", color: "#e5e7eb", border: "1px solid #2a2f3a", borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  ⛶ Fullscreen
                </button>
              </div>
            </div>
            <div ref={(el) => { refs.current[p.id] = el; }}>
              <Mock p={p} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

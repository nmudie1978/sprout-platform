/**
 * Darker light-mode variants — preview.
 *
 * Five candidate light palettes, each ~20% darker than the current warm-paper
 * light theme (which reads too washed-out / near-white). Same warm, calm tone
 * family, with tonal variety (warm paper, greige, sage, cool stone, clay).
 *
 * Each variant is rendered as a FULL-WIDTH mock of the Career Radar page so you
 * can judge it at real scale; the ⛶ button opens that variant in true browser
 * fullscreen (Esc to exit). Nothing here touches the real app or dark mode.
 *
 * Visit: /dev/light-themes
 *
 * Pick one (1–5) and I'll wire it into globals.css under :root only.
 */

"use client";

import { useRef } from "react";
import {
  Star,
  Sparkles,
  LayoutDashboard,
  Route,
  Target,
  Library,
  Compass,
  Calendar,
  BarChart3,
  User as UserIcon,
  Info,
  HelpCircle,
  Moon,
  LogOut,
  ChevronRight,
  SlidersHorizontal,
  Filter,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";

type Palette = {
  id: number;
  name: string;
  vibe: string;
  background: string;
  card: string;
  sidebar: string;
  sidebarBorder: string;
  foreground: string;
  mutedForeground: string;
  border: string;
  primary: string; // teal brand, retained
  primaryForeground: string;
  accent: string; // soft gold highlight surface
  goalBanner: string; // warm goal-banner surface
};

// Current light theme (for reference): bg 40 39% 95, card 40 50% 98 — too light.
// Every variant below drops the surface lightness ~20% for a clearly toned
// paper, while keeping the dark ink, teal brand and gold accent.
const palettes: Palette[] = [
  {
    id: 1,
    name: "1 · Warm Paper (deeper)",
    vibe: "Today's warm-paper tone, just ~20% less washed-out. Safest pick.",
    background: "40 30% 88%",
    card: "40 36% 93%",
    sidebar: "38 28% 86%",
    sidebarBorder: "34 22% 79%",
    foreground: "33 12% 15%",
    mutedForeground: "32 8% 35%",
    border: "34 22% 80%",
    primary: "178 69% 28%",
    primaryForeground: "0 0% 100%",
    accent: "40 50% 86%",
    goalBanner: "40 45% 90%",
  },
  {
    id: 2,
    name: "2 · Greige (neutral warm)",
    vibe: "Lower-saturation warm grey. Calm, neutral, grown-up.",
    background: "36 15% 87%",
    card: "36 18% 92%",
    sidebar: "36 13% 85%",
    sidebarBorder: "36 12% 78%",
    foreground: "30 10% 15%",
    mutedForeground: "32 7% 35%",
    border: "36 12% 79%",
    primary: "178 64% 28%",
    primaryForeground: "0 0% 100%",
    accent: "40 28% 86%",
    goalBanner: "40 30% 89%",
  },
  {
    id: 3,
    name: "3 · Sage (green-tinted)",
    vibe: "Soft sage that sits natively under the teal brand. On-brand & restful.",
    background: "120 12% 87%",
    card: "120 15% 92%",
    sidebar: "120 11% 85%",
    sidebarBorder: "120 10% 78%",
    foreground: "150 16% 13%",
    mutedForeground: "130 8% 34%",
    border: "120 10% 79%",
    primary: "178 66% 27%",
    primaryForeground: "0 0% 100%",
    accent: "120 16% 86%",
    goalBanner: "100 22% 89%",
  },
  {
    id: 4,
    name: "4 · Cool Stone (blue-grey)",
    vibe: "Quiet, modern blue-grey. Crisp and a touch more 'product'.",
    background: "210 12% 87%",
    card: "210 16% 93%",
    sidebar: "210 11% 85%",
    sidebarBorder: "210 10% 78%",
    foreground: "215 24% 15%",
    mutedForeground: "210 9% 35%",
    border: "210 10% 79%",
    primary: "178 60% 28%",
    primaryForeground: "0 0% 100%",
    accent: "210 18% 87%",
    goalBanner: "200 22% 89%",
  },
  {
    id: 5,
    name: "5 · Clay / Sand (warmer)",
    vibe: "Warmer, more saturated sand. The cosiest, most editorial of the set.",
    background: "28 28% 86%",
    card: "30 34% 91%",
    sidebar: "26 24% 84%",
    sidebarBorder: "24 20% 77%",
    foreground: "18 26% 15%",
    mutedForeground: "22 12% 35%",
    border: "26 20% 78%",
    primary: "178 69% 27%",
    primaryForeground: "0 0% 100%",
    accent: "32 42% 86%",
    goalBanner: "30 40% 89%",
  },
];

export default function LightThemesPage() {
  const refs = useRef<Record<number, HTMLDivElement | null>>({});

  const fullscreen = (id: number) => {
    const el = refs.current[id] as
      | (HTMLDivElement & { webkitRequestFullscreen?: () => void })
      | null;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "auto",
        background: "#15171c",
        color: "#e5e7eb",
        zIndex: 50,
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <header style={{ padding: "22px 28px 6px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
          Darker light-mode variants
        </h1>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: "6px 0 0", maxWidth: 760 }}>
          Five candidates, each ~20% darker than the current (too-light) warm-paper
          theme, shown as full-width Career&nbsp;Radar mockups. Same calm tone, more
          presence. Tap <strong style={{ color: "#d1d5db" }}>⛶ Fullscreen</strong> on
          any one for a true full-page view (Esc to exit). Tell me which number and
          I&apos;ll wire it into the real light theme.
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 40, padding: "20px 0 60px" }}>
        {palettes.map((p) => (
          <section key={p.id}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "0 28px 10px",
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#f3f4f6" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{p.vibe}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[
                    ["bg", p.background],
                    ["card", p.card],
                    ["sidebar", p.sidebar],
                    ["border", p.border],
                    ["teal", p.primary],
                    ["ink", p.foreground],
                  ].map(([label, hsl]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 4,
                          background: `hsl(${hsl})`,
                          border: "1px solid #374151",
                        }}
                      />
                      <div style={{ fontSize: 8, color: "#9ca3af", marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => fullscreen(p.id)}
                  style={{
                    background: "#1f2937",
                    border: "1px solid #4b5563",
                    color: "#e5e7eb",
                    fontSize: 12,
                    padding: "7px 12px",
                    borderRadius: 7,
                    cursor: "pointer",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  ⛶ Fullscreen
                </button>
              </div>
            </div>
            <MockRadar palette={p} mockRef={(el) => (refs.current[p.id] = el)} />
          </section>
        ))}
      </div>
    </div>
  );
}

function MockRadar({
  palette: p,
  mockRef,
}: {
  palette: Palette;
  mockRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={mockRef}
      style={{
        background: `hsl(${p.background})`,
        color: `hsl(${p.foreground})`,
        display: "grid",
        gridTemplateColumns: "248px 1fr",
        minHeight: "82vh",
        fontSize: 14,
        overflow: "hidden",
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          background: `hsl(${p.sidebar})`,
          borderRight: `1px solid hsl(${p.sidebarBorder})`,
          padding: "18px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "2px 6px" }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: `hsl(${p.primary})`,
              display: "grid",
              placeItems: "center",
              color: `hsl(${p.primaryForeground})`,
            }}
          >
            <Star size={15} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 17 }}>Endeavrly</span>
        </div>

        <NavSection title="Yours" p={p}>
          <NavItem p={p} icon={LayoutDashboard} label="Dashboard" />
          <NavItem p={p} icon={Route} label="My Journey" dot />
          <NavItem p={p} icon={Target} label="My Career Radar" active />
          <NavItem p={p} icon={Library} label="My Library" />
          <NavItem p={p} icon={Sparkles} label="Career Twin" />
        </NavSection>

        <NavSection title="Explore" p={p}>
          <NavItem p={p} icon={Compass} label="Explore Careers" />
          <NavItem p={p} icon={Calendar} label="Youth Events" />
          <NavItem p={p} icon={BarChart3} label="Industry Insights" />
        </NavSection>

        <NavSection title="Account" p={p}>
          <NavItem p={p} icon={UserIcon} label="Profile" />
        </NavSection>

        <NavSection title="Endeavrly" p={p}>
          <NavItem p={p} icon={Info} label="About" />
          <NavItem p={p} icon={HelpCircle} label="Feedback" />
        </NavSection>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
          <NavItem p={p} icon={Moon} label="Dark Mode" />
          <NavItem p={p} icon={LogOut} label="Sign Out" />
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ padding: "26px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: `hsl(${p.accent})`,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Sparkles size={20} color={`hsl(${p.primary})`} />
          </div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>
            My <span style={{ color: `hsl(${p.primary})` }}>Career Radar</span>
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: `hsl(${p.mutedForeground})`, maxWidth: 760 }}>
          Careers matched to your interests, work style, and strengths. The closer a dot
          is to the centre, the stronger the match. Tap any dot to explore that career.
        </p>

        {/* Panel */}
        <div
          style={{
            background: `hsl(${p.card})`,
            border: `1px solid hsl(${p.border})`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {/* Goal banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 18px",
              background: `hsl(${p.goalBanner})`,
              borderBottom: `1px solid hsl(${p.border})`,
            }}
          >
            <Star size={16} color={`hsl(${p.primary})`} />
            <span style={{ fontSize: 13, color: `hsl(${p.mutedForeground})` }}>Career goal:</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: `hsl(${p.primary})` }}>
              Speech and Language Therapist
            </span>
            <ChevronRight size={16} color={`hsl(${p.mutedForeground})`} style={{ marginLeft: "auto" }} />
          </div>

          {/* Filter row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              padding: "12px 18px",
              fontSize: 13,
              color: `hsl(${p.mutedForeground})`,
              borderBottom: `1px solid hsl(${p.border})`,
            }}
          >
            <span style={{ fontWeight: 500, color: `hsl(${p.foreground})` }}>18 of 18 matches</span>
            <Pill p={p} icon={SlidersHorizontal} label="Show all" />
            <Pill p={p} label="All Sectors" />
            <Pill p={p} icon={Filter} label="Clear filter — show all careers" />
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <ZoomOut size={15} />
              <span style={{ fontSize: 12 }}>100%</span>
              <ZoomIn size={15} />
              <Pill p={p} icon={SlidersHorizontal} label="What I like" />
            </div>
          </div>

          {/* Radar */}
          <div style={{ display: "grid", placeItems: "center", padding: "26px 0 34px" }}>
            <RadarSvg p={p} />
          </div>
        </div>
      </main>
    </div>
  );
}

function RadarSvg({ p }: { p: Palette }) {
  const cx = 230;
  const cy = 230;
  const labels = [
    "Health", "Sport", "Education", "Public Service", "Tech", "Business",
    "Finance", "Marketing", "Creative", "Trades", "Logistics", "Hospitality",
    "Social Care", "Hospitality",
  ];
  const n = 13;
  const R = 175;
  const spokes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), label: labels[i], a };
  });
  // a teal goal wedge + scattered dots
  const dots = [
    [0.55, -0.5], [0.4, -0.2], [0.62, -0.35], [0.3, 0.05], [0.45, 0.1],
    [0.25, 0.25], [0.5, 0.3], [0.7, 0.0], [0.35, 0.45], [0.6, 0.5],
    [0.2, 0.55], [0.42, 0.62], [0.15, 0.4],
  ];
  return (
    <svg width={460} height={460} viewBox="0 0 460 460">
      {/* rings */}
      {[0.33, 0.66, 1].map((r, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={R * r}
          fill="none"
          stroke={`hsl(${p.border})`}
          strokeDasharray={i < 2 ? "3 5" : "0"}
        />
      ))}
      {/* spokes + labels */}
      {spokes.map((s, i) => (
        <g key={i}>
          <line x1={cx} y1={cy} x2={s.x} y2={s.y} stroke={`hsl(${p.border})`} strokeWidth={1} />
          <text
            x={cx + (R + 22) * Math.cos(s.a)}
            y={cy + (R + 22) * Math.sin(s.a)}
            fontSize={11}
            fill={`hsl(${p.mutedForeground})`}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {s.label}
          </text>
        </g>
      ))}
      {/* goal wedge */}
      <path
        d={`M ${cx} ${cy} L ${cx + R * Math.cos(-0.2)} ${cy + R * Math.sin(-0.2)} A ${R} ${R} 0 0 1 ${cx + R * Math.cos(0.55)} ${cy + R * Math.sin(0.55)} Z`}
        fill={`hsl(${p.primary} / 0.18)`}
      />
      {/* dots */}
      {dots.map(([rr, aa], i) => {
        const x = cx + R * rr * Math.cos(aa);
        const y = cy + R * rr * Math.sin(aa);
        const teal = i % 3 !== 0;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={6}
            fill={teal ? `hsl(${p.primary})` : "hsl(205 50% 55%)"}
          />
        );
      })}
      {/* goal dot (gold ring) */}
      <circle cx={cx + R * 0.5 * Math.cos(0.1)} cy={cy + R * 0.5 * Math.sin(0.1)} r={9} fill="hsl(330 70% 65%)" />
      <circle cx={cx + R * 0.5 * Math.cos(0.1)} cy={cy + R * 0.5 * Math.sin(0.1)} r={13} fill="none" stroke="hsl(330 70% 65%)" strokeWidth={2} opacity={0.5} />
    </svg>
  );
}

function Pill({ p, icon: Icon, label }: { p: Palette; icon?: LucideIcon; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        borderRadius: 999,
        border: `1px solid hsl(${p.border})`,
        background: `hsl(${p.card})`,
        fontSize: 12,
        color: `hsl(${p.foreground})`,
      }}
    >
      {Icon && <Icon size={13} color={`hsl(${p.mutedForeground})`} />}
      {label}
    </span>
  );
}

function NavSection({ title, p, children }: { title: string; p: Palette; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: `hsl(${p.mutedForeground})`,
          padding: "0 8px",
          marginBottom: 3,
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function NavItem({
  p,
  icon: Icon,
  label,
  active,
  dot,
}: {
  p: Palette;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  dot?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 9,
        background: active ? `hsl(${p.card})` : "transparent",
        border: active ? `1px solid hsl(${p.border})` : "1px solid transparent",
        color: active ? `hsl(${p.primary})` : `hsl(${p.foreground})`,
        fontSize: 14,
        fontWeight: active ? 600 : 400,
      }}
    >
      <Icon size={16} color={active ? `hsl(${p.primary})` : `hsl(${p.mutedForeground})`} />
      <span>{label}</span>
      {dot && (
        <span
          style={{
            marginLeft: "auto",
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: `hsl(${p.primary})`,
          }}
        />
      )}
    </div>
  );
}

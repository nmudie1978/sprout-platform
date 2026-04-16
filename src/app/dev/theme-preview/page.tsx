/**
 * Light-mode palette preview.
 *
 * Three candidate palettes rendered side-by-side as mock dashboards.
 * Each column scopes its own CSS variables on a wrapper — nothing
 * leaks to the rest of the app, and dark mode is never touched.
 *
 * Visit: /dev/theme-preview
 */

"use client";

import { useState } from "react";
import {
  Compass,
  LayoutDashboard,
  Route,
  Target,
  FileText,
  Calendar,
  BarChart3,
  Bot,
  Briefcase,
  User as UserIcon,
  Info,
  TrendingUp,
  BookMarked,
  Heart,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

type Palette = {
  id: string;
  name: string;
  blurb: string;
  vibe: string;
  // HSL triples ("h s% l%")
  background: string;
  card: string;
  sidebar: string;
  sidebarBorder: string;
  foreground: string;
  mutedForeground: string;
  border: string;
  primary: string;
  primaryForeground: string;
  accent: string; // subtle surface for hovers/info
  // optional soft gradient wash for the canvas — pass null for solid
  canvasWash?: string | null;
};

const palettes: Palette[] = [
  {
    id: "warm-cream",
    name: "A · Warm Cream + Teal",
    blurb: "Softened version of today's direction — cream canvas, teal brand.",
    vibe: "Warm, welcoming, familiar",
    background: "35 30% 97%",
    card: "0 0% 100%",
    sidebar: "35 22% 93%",
    sidebarBorder: "35 18% 86%",
    foreground: "220 22% 14%",
    mutedForeground: "220 10% 42%",
    border: "35 15% 88%",
    primary: "166 60% 36%",
    primaryForeground: "0 0% 100%",
    accent: "35 35% 94%",
    canvasWash: null,
  },
  {
    id: "cool-paper",
    name: "B · Cool Paper + Teal",
    blurb: "Linear/Vercel-style neutral white. Clean, minimal, modern.",
    vibe: "Crisp, professional, quiet",
    background: "220 25% 98%",
    card: "0 0% 100%",
    sidebar: "220 20% 96%",
    sidebarBorder: "220 15% 90%",
    foreground: "220 28% 12%",
    mutedForeground: "220 10% 42%",
    border: "220 15% 90%",
    primary: "166 60% 36%",
    primaryForeground: "0 0% 100%",
    accent: "220 30% 96%",
    canvasWash: null,
  },
  {
    id: "lavender",
    name: "C · Soft Lavender White",
    blurb: "Notion-ish tinted white — friendly without being loud.",
    vibe: "Youthful, approachable, calm",
    background: "260 35% 98%",
    card: "0 0% 100%",
    sidebar: "260 25% 96%",
    sidebarBorder: "260 18% 90%",
    foreground: "260 25% 14%",
    mutedForeground: "260 8% 45%",
    border: "260 18% 91%",
    primary: "166 60% 36%",
    primaryForeground: "0 0% 100%",
    accent: "260 35% 96%",
    canvasWash:
      "radial-gradient(80% 60% at 20% 0%, hsl(260 60% 96% / 0.6) 0%, transparent 60%)",
  },
  {
    id: "lilac-studio",
    name: "D · Lilac Studio (Shopify-inspired)",
    blurb:
      "Pale lilac canvas, soft periwinkle sidebar, deep indigo brand. Premium and editorial.",
    vibe: "Elegant, airy, premium — swaps teal for indigo",
    // #EDE8F5 canvas
    background: "260 35% 93%",
    // near-white cards with a cool undertone — lets content breathe above the lilac
    card: "260 40% 99%",
    // #ADBBDA-tinted sidebar
    sidebar: "230 28% 90%",
    sidebarBorder: "230 22% 82%",
    // deep indigo text (~#3D52A0 darkened) for strong contrast
    foreground: "228 40% 18%",
    // #8697C4 mid-tone
    mutedForeground: "225 22% 48%",
    border: "230 24% 86%",
    // #3D52A0 brand — this palette replaces teal with indigo
    primary: "228 45% 43%",
    primaryForeground: "0 0% 100%",
    accent: "250 35% 95%",
    canvasWash:
      "radial-gradient(90% 55% at 15% 0%, hsl(240 70% 96% / 0.9) 0%, transparent 65%), radial-gradient(70% 60% at 100% 0%, hsl(260 55% 94% / 0.7) 0%, transparent 60%)",
  },
];

export default function ThemePreviewPage() {
  const [focused, setFocused] = useState<string | null>(null);

  return (
    <div
      style={{
        // Break out of the /dev layout's bg-background + padding,
        // so the previews render edge-to-edge against a neutral page.
        position: "fixed",
        inset: 0,
        overflow: "auto",
        background: "#1a1d24",
        color: "#e5e7eb",
        padding: "24px",
        zIndex: 50,
      }}
    >
      <header style={{ marginBottom: 20, maxWidth: 1600, margin: "0 auto 20px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
          Light-mode palette preview
        </h1>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: "6px 0 0" }}>
          Three candidates rendered as mock dashboards. Each column scopes its
          own tokens — nothing here touches dark mode or the real app. Click a
          column to focus it full-width.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: focused
            ? "1fr"
            : "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 20,
          maxWidth: 1600,
          margin: "0 auto",
        }}
      >
        {palettes
          .filter((p) => !focused || p.id === focused)
          .map((p) => (
            <PaletteColumn
              key={p.id}
              palette={p}
              focused={focused === p.id}
              onToggleFocus={() =>
                setFocused(focused === p.id ? null : p.id)
              }
            />
          ))}
      </div>

      <footer
        style={{
          marginTop: 24,
          maxWidth: 1600,
          margin: "24px auto 0",
          fontSize: 12,
          color: "#9ca3af",
        }}
      >
        Tip: tell me which one (A / B / C) and I'll wire it into{" "}
        <code>globals.css</code> under <code>:root</code> only — the{" "}
        <code>.dark</code> block stays exactly as it is.
      </footer>
    </div>
  );
}

function PaletteColumn({
  palette: p,
  focused,
  onToggleFocus,
}: {
  palette: Palette;
  focused: boolean;
  onToggleFocus: () => void;
}) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Label strip */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f3f4f6" }}>
            {p.name}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
            {p.blurb}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#6b7280",
              marginTop: 4,
              fontStyle: "italic",
            }}
          >
            {p.vibe}
          </div>
        </div>
        <button
          onClick={onToggleFocus}
          style={{
            background: "transparent",
            border: "1px solid #374151",
            color: "#d1d5db",
            fontSize: 11,
            padding: "4px 8px",
            borderRadius: 6,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {focused ? "← Compare all" : "Focus →"}
        </button>
      </div>

      {/* Swatch row */}
      <div style={{ display: "flex", gap: 4, fontSize: 10 }}>
        <Swatch label="bg" hsl={p.background} />
        <Swatch label="card" hsl={p.card} />
        <Swatch label="sidebar" hsl={p.sidebar} />
        <Swatch label="border" hsl={p.border} />
        <Swatch label="primary" hsl={p.primary} />
        <Swatch label="text" hsl={p.foreground} />
        <Swatch label="muted" hsl={p.mutedForeground} />
      </div>

      {/* The mock dashboard, scoped */}
      <MockDashboard palette={p} />
    </section>
  );
}

function Swatch({ label, hsl }: { label: string; hsl: string }) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          background: `hsl(${hsl})`,
          border: "1px solid #374151",
        }}
      />
      <span style={{ fontSize: 9, color: "#9ca3af" }}>{label}</span>
    </div>
  );
}

/**
 * Mock dashboard. Reads palette values via inline CSS custom
 * properties on the wrapper — every child uses hsl(var(--xxx)) so we
 * never depend on the global `.dark` class being present or absent.
 */
function MockDashboard({ palette: p }: { palette: Palette }) {
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, active: true },
    { label: "My Journey", icon: Route, dot: true },
    { label: "My Career Radar", icon: Target },
    { label: "My Small Jobs", icon: FileText },
  ];
  const exploreItems = [
    { label: "Explore Careers", icon: Compass },
    { label: "Youth Events", icon: Calendar },
    { label: "Industry Insights", icon: BarChart3 },
    { label: "AI Advisor", icon: Bot },
  ];
  const smallJobs = [{ label: "Browse", icon: Briefcase }];
  const accountItems = [{ label: "Profile", icon: UserIcon }];

  return (
    <div
      style={
        {
          "--bg": p.background,
          "--card": p.card,
          "--sidebar": p.sidebar,
          "--sidebar-border": p.sidebarBorder,
          "--fg": p.foreground,
          "--muted-fg": p.mutedForeground,
          "--border": p.border,
          "--primary": p.primary,
          "--primary-fg": p.primaryForeground,
          "--accent": p.accent,
          background: p.canvasWash
            ? `${p.canvasWash}, hsl(${p.background})`
            : `hsl(${p.background})`,
          color: `hsl(${p.foreground})`,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #1f2937",
          display: "grid",
          gridTemplateColumns: "180px 1fr",
          minHeight: 560,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 13,
        } as React.CSSProperties
      }
    >
      {/* Sidebar */}
      <aside
        style={{
          background: `hsl(${p.sidebar})`,
          borderRight: `1px solid hsl(${p.sidebarBorder})`,
          padding: "14px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "2px 6px",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: `hsl(${p.primary})`,
              display: "grid",
              placeItems: "center",
              color: `hsl(${p.primaryForeground})`,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            ★
          </div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Endeavrly</div>
        </div>

        <NavSection title="Yours" palette={p}>
          {navItems.map((n) => (
            <NavItem
              key={n.label}
              palette={p}
              icon={n.icon}
              label={n.label}
              active={n.active}
              dot={n.dot}
            />
          ))}
        </NavSection>

        <NavSection title="Explore" palette={p}>
          {exploreItems.map((n) => (
            <NavItem
              key={n.label}
              palette={p}
              icon={n.icon}
              label={n.label}
            />
          ))}
        </NavSection>

        <NavSection title="Small Jobs" palette={p}>
          {smallJobs.map((n) => (
            <NavItem
              key={n.label}
              palette={p}
              icon={n.icon}
              label={n.label}
            />
          ))}
        </NavSection>

        <NavSection title="Account" palette={p}>
          {accountItems.map((n) => (
            <NavItem
              key={n.label}
              palette={p}
              icon={n.icon}
              label={n.label}
            />
          ))}
        </NavSection>
      </aside>

      {/* Main */}
      <main style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            Good evening Hhh{" "}
            <span style={{ fontSize: 14 }}>🇳🇴</span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: `hsl(${p.mutedForeground})`,
            }}
          >
            Thu 16 Apr
          </div>
        </div>

        {/* Info banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            background: `hsl(${p.accent})`,
            border: `1px solid hsl(${p.border})`,
            borderRadius: 8,
            fontSize: 11,
            color: `hsl(${p.mutedForeground})`,
          }}
        >
          <Info size={14} color={`hsl(${p.primary})`} />
          A snapshot of your journeys, activity, and saved content.{" "}
          <span style={{ color: `hsl(${p.primary})`, fontWeight: 500 }}>
            Learn more
          </span>
        </div>

        {/* Journey card */}
        <div
          style={{
            background: `hsl(${p.card})`,
            border: `1px solid hsl(${p.border})`,
            borderRadius: 12,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={16} color={`hsl(${p.primary})`} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                My Journey — Addiction Counsellor
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: `hsl(${p.mutedForeground})`,
                  marginTop: 1,
                }}
              >
                change
              </div>
            </div>
          </div>

          {/* Progress row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: `2px solid hsl(${p.primary} / 0.3)`,
                display: "grid",
                placeItems: "center",
                fontSize: 12,
                fontWeight: 600,
                color: `hsl(${p.primary})`,
                flexShrink: 0,
              }}
            >
              0/3
            </div>
            <div style={{ flex: 1, display: "flex", gap: 6 }}>
              {["Discover", "Understand", "Clarity"].map((step, i) => (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: i === 0 ? 600 : 400,
                    color:
                      i === 0
                        ? `hsl(${p.primary})`
                        : `hsl(${p.mutedForeground})`,
                  }}
                >
                  <div
                    style={{
                      height: 2,
                      background:
                        i === 0
                          ? `hsl(${p.primary})`
                          : `hsl(${p.border})`,
                      marginBottom: 6,
                      borderRadius: 1,
                    }}
                  />
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Snapshot tiles */}
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: `hsl(${p.mutedForeground})`,
                marginBottom: 6,
                textTransform: "uppercase",
              }}
            >
              Career Snapshot
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 6,
              }}
            >
              {[
                { label: "SALARY", value: "480k–680k kr" },
                { label: "GROWTH", value: "High" },
                { label: "SECTOR", value: "Public" },
                { label: "PENSION", value: "Strong" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    padding: "8px",
                    background: `hsl(${p.accent})`,
                    border: `1px solid hsl(${p.border})`,
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 8,
                      color: `hsl(${p.mutedForeground})`,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {s.label}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two-col section: Explored journeys + Library */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <PanelCard palette={p} icon={Target} title="MY EXPLORED JOURNEYS">
            <div
              style={{
                fontSize: 11,
                color: `hsl(${p.mutedForeground})`,
                padding: "16px 8px",
              }}
            >
              No journeys yet.
            </div>
          </PanelCard>

          <PanelCard palette={p} icon={BookMarked} title="MY LIBRARY" badge="6">
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                "Why Communication Is the #1 Career Skill",
                "Critical Thinking in an Age of Misinformation",
                "The Clean Energy Job Revolution",
                "Data Science: From Hype to Reality",
              ].map((t) => (
                <li
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 10.5,
                    padding: "2px 0",
                  }}
                >
                  <BookOpen size={11} color={`hsl(${p.mutedForeground})`} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </PanelCard>
        </div>

        {/* Saved + Small jobs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <PanelCard palette={p} icon={Heart} title="SAVED CAREERS">
            <div
              style={{
                fontSize: 11,
                color: `hsl(${p.mutedForeground})`,
                padding: "16px 8px",
              }}
            >
              No saved careers yet.
            </div>
          </PanelCard>

          <PanelCard palette={p} icon={Briefcase} title="MY SMALL JOBS">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
              {["APPLIED", "WAITING", "ACCEPTED", "DONE"].map((l) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>0</div>
                  <div
                    style={{
                      fontSize: 8,
                      color: `hsl(${p.mutedForeground})`,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
        </div>
      </main>
    </div>
  );
}

function NavSection({
  title,
  palette: p,
  children,
}: {
  title: string;
  palette: Palette;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: `hsl(${p.mutedForeground})`,
          padding: "0 6px",
          marginBottom: 2,
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
  palette: p,
  icon: Icon,
  label,
  active,
  dot,
}: {
  palette: Palette;
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
        gap: 8,
        padding: "6px 8px",
        borderRadius: 6,
        background: active ? `hsl(${p.primary} / 0.12)` : "transparent",
        color: active
          ? `hsl(${p.primary})`
          : `hsl(${p.foreground})`,
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        position: "relative",
      }}
    >
      <Icon size={14} color={active ? `hsl(${p.primary})` : `hsl(${p.mutedForeground})`} />
      <span>{label}</span>
      {dot && (
        <span
          style={{
            marginLeft: "auto",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: `hsl(${p.primary})`,
          }}
        />
      )}
    </div>
  );
}

function PanelCard({
  palette: p,
  icon: Icon,
  title,
  badge,
  children,
}: {
  palette: Palette;
  icon: LucideIcon;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: `hsl(${p.card})`,
        border: `1px solid hsl(${p.border})`,
        borderRadius: 10,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icon size={12} color={`hsl(${p.primary})`} />
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: `hsl(${p.foreground})`,
          }}
        >
          {title}
        </div>
        {badge && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 9,
              color: `hsl(${p.mutedForeground})`,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Deep-blue light-mode variants — preview.
 *
 * Ten candidate LIGHT palettes, all in the blue family but leaning DEEP /
 * dark-blue (not airy light-blue): richer saturation + lower surface lightness
 * than the sky/powder tones, while staying clearly light mode (dark ink, teal
 * brand retained). Range spans cyan-leaning harbour blues → true cobalt/denim →
 * indigo → desaturated steel/navy.
 *
 * Each variant renders as a FULL-WIDTH Career Radar mock; ⛶ opens it in true
 * browser fullscreen (Esc to exit). Nothing here touches the real app or dark mode.
 *
 * Visit: /dev/blue-themes
 *
 * Pick one (1–10) and I'll wire it into globals.css under :root only.
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
  primary: string;
  primaryForeground: string;
  accent: string;
  goalBanner: string;
};

// All deep-blue light palettes. Surface lightness ~79–84% (well below the
// 88–90% of the airy sky/powder blues) with higher saturation, so the blue
// reads rich and grounded rather than washed-out.
const palettes: Palette[] = [
  {
    id: 1,
    name: "1 · Steel Blue",
    vibe: "Classic mid-deep steel blue. Balanced, grown-up, the safe deep-blue pick.",
    background: "215 24% 84%",
    card: "216 28% 89%",
    sidebar: "214 22% 82%",
    sidebarBorder: "213 18% 75%",
    foreground: "218 28% 15%",
    mutedForeground: "215 13% 34%",
    border: "214 18% 76%",
    primary: "178 62% 27%",
    primaryForeground: "0 0% 100%",
    accent: "215 32% 82%",
    goalBanner: "216 28% 86%",
  },
  {
    id: 2,
    name: "2 · Denim",
    vibe: "True denim blue — friendly but deeper. A touch more saturated than Steel.",
    background: "220 28% 83%",
    card: "221 32% 88%",
    sidebar: "219 24% 81%",
    sidebarBorder: "218 20% 74%",
    foreground: "222 30% 15%",
    mutedForeground: "220 14% 33%",
    border: "219 20% 75%",
    primary: "178 62% 27%",
    primaryForeground: "0 0% 100%",
    accent: "220 36% 81%",
    goalBanner: "221 32% 85%",
  },
  {
    id: 3,
    name: "3 · Cobalt Mist",
    vibe: "Vivid cobalt, kept light. The most 'blue' of the set — confident and modern.",
    background: "224 32% 82%",
    card: "225 36% 87%",
    sidebar: "223 28% 80%",
    sidebarBorder: "222 22% 73%",
    foreground: "226 34% 15%",
    mutedForeground: "224 15% 33%",
    border: "223 22% 74%",
    primary: "178 62% 27%",
    primaryForeground: "0 0% 100%",
    accent: "224 40% 80%",
    goalBanner: "225 36% 84%",
  },
  {
    id: 4,
    name: "4 · Azure Deep",
    vibe: "Cyan-leaning deep azure. Sits natively next to the teal brand — on-brand & crisp.",
    background: "210 32% 82%",
    card: "211 38% 87%",
    sidebar: "209 28% 80%",
    sidebarBorder: "208 22% 73%",
    foreground: "214 30% 15%",
    mutedForeground: "210 14% 33%",
    border: "209 22% 74%",
    primary: "178 64% 27%",
    primaryForeground: "0 0% 100%",
    accent: "210 42% 80%",
    goalBanner: "211 38% 84%",
  },
  {
    id: 5,
    name: "5 · Slate Navy",
    vibe: "Quieter, desaturated navy-grey. Restrained and premium; least 'colourful'.",
    background: "218 20% 80%",
    card: "219 24% 85%",
    sidebar: "217 18% 78%",
    sidebarBorder: "216 15% 71%",
    foreground: "220 26% 14%",
    mutedForeground: "218 12% 32%",
    border: "217 16% 72%",
    primary: "178 60% 27%",
    primaryForeground: "0 0% 100%",
    accent: "218 28% 79%",
    goalBanner: "219 24% 83%",
  },
  {
    id: 6,
    name: "6 · Indigo Stone",
    vibe: "Violet-leaning deep blue. A little moody and editorial without going purple.",
    background: "232 24% 82%",
    card: "233 28% 87%",
    sidebar: "231 20% 80%",
    sidebarBorder: "230 17% 73%",
    foreground: "234 28% 15%",
    mutedForeground: "232 13% 33%",
    border: "231 18% 74%",
    primary: "178 62% 27%",
    primaryForeground: "0 0% 100%",
    accent: "232 32% 80%",
    goalBanner: "233 28% 84%",
  },
  {
    id: 7,
    name: "7 · Harbour",
    vibe: "Cooler harbour blue with a hint of teal. Clean, coastal, calm.",
    background: "205 28% 82%",
    card: "206 34% 87%",
    sidebar: "204 24% 80%",
    sidebarBorder: "203 20% 73%",
    foreground: "210 28% 15%",
    mutedForeground: "206 13% 33%",
    border: "204 20% 74%",
    primary: "178 64% 27%",
    primaryForeground: "0 0% 100%",
    accent: "205 38% 80%",
    goalBanner: "206 34% 84%",
  },
  {
    id: 8,
    name: "8 · Prussian Haze",
    vibe: "Deeper, richer Prussian blue. One of the darkest — strongest presence.",
    background: "212 26% 79%",
    card: "213 30% 84%",
    sidebar: "211 22% 77%",
    sidebarBorder: "210 18% 70%",
    foreground: "215 30% 14%",
    mutedForeground: "212 13% 31%",
    border: "211 18% 71%",
    primary: "178 62% 27%",
    primaryForeground: "0 0% 100%",
    accent: "212 32% 78%",
    goalBanner: "213 30% 82%",
  },
  {
    id: 9,
    name: "9 · Cadet Steel",
    vibe: "Soft desaturated cadet blue-grey. The most neutral; least likely to tire.",
    background: "207 18% 80%",
    card: "208 22% 85%",
    sidebar: "206 16% 78%",
    sidebarBorder: "205 14% 71%",
    foreground: "212 24% 15%",
    mutedForeground: "208 11% 32%",
    border: "206 15% 72%",
    primary: "178 60% 27%",
    primaryForeground: "0 0% 100%",
    accent: "207 26% 79%",
    goalBanner: "208 24% 83%",
  },
  {
    id: 10,
    name: "10 · Deep Cobalt",
    vibe: "Deepest + most saturated of the set. Boldest blue — furthest from light-blue.",
    background: "226 34% 79%",
    card: "227 38% 84%",
    sidebar: "225 30% 77%",
    sidebarBorder: "224 24% 70%",
    foreground: "230 34% 14%",
    mutedForeground: "226 16% 31%",
    border: "225 24% 71%",
    primary: "178 60% 27%",
    primaryForeground: "0 0% 100%",
    accent: "226 42% 77%",
    goalBanner: "227 38% 82%",
  },
  {
    id: 11,
    name: "11 · Cerulean",
    vibe: "Bright cerulean, kept deep. Clean and energetic without going pale.",
    background: "200 34% 82%",
    card: "201 40% 87%",
    sidebar: "199 30% 80%",
    sidebarBorder: "198 24% 73%",
    foreground: "205 30% 15%",
    mutedForeground: "200 14% 33%",
    border: "199 24% 74%",
    primary: "178 64% 27%",
    primaryForeground: "0 0% 100%",
    accent: "200 44% 80%",
    goalBanner: "201 40% 84%",
  },
  {
    id: 12,
    name: "12 · Sapphire",
    vibe: "Rich jewel-blue. Saturated and confident, a deeper cousin of Cobalt.",
    background: "222 34% 80%",
    card: "223 38% 85%",
    sidebar: "221 30% 78%",
    sidebarBorder: "220 24% 71%",
    foreground: "226 34% 14%",
    mutedForeground: "222 16% 32%",
    border: "221 24% 72%",
    primary: "178 62% 27%",
    primaryForeground: "0 0% 100%",
    accent: "222 42% 78%",
    goalBanner: "223 38% 83%",
  },
  {
    id: 13,
    name: "13 · Navy Stone",
    vibe: "Very deep, desaturated near-navy. Serious and architectural.",
    background: "218 22% 76%",
    card: "219 26% 81%",
    sidebar: "217 19% 74%",
    sidebarBorder: "216 16% 67%",
    foreground: "220 28% 13%",
    mutedForeground: "218 12% 30%",
    border: "217 17% 68%",
    primary: "178 60% 27%",
    primaryForeground: "0 0% 100%",
    accent: "218 28% 75%",
    goalBanner: "219 26% 79%",
  },
  {
    id: 14,
    name: "14 · Periwinkle Deep",
    vibe: "Blue with the faintest violet lift. Soft yet deep, a little characterful.",
    background: "235 30% 81%",
    card: "236 34% 86%",
    sidebar: "234 26% 79%",
    sidebarBorder: "233 21% 72%",
    foreground: "238 30% 15%",
    mutedForeground: "235 14% 33%",
    border: "234 21% 73%",
    primary: "178 62% 27%",
    primaryForeground: "0 0% 100%",
    accent: "235 38% 79%",
    goalBanner: "236 34% 83%",
  },
  {
    id: 15,
    name: "15 · Teal Blue",
    vibe: "Sits right between teal and blue — the most on-brand of the set.",
    background: "195 30% 82%",
    card: "196 36% 87%",
    sidebar: "194 26% 80%",
    sidebarBorder: "193 22% 73%",
    foreground: "200 28% 15%",
    mutedForeground: "196 14% 33%",
    border: "194 22% 74%",
    primary: "178 64% 27%",
    primaryForeground: "0 0% 100%",
    accent: "195 40% 80%",
    goalBanner: "196 36% 84%",
  },
  {
    id: 16,
    name: "16 · Midnight Fog",
    vibe: "Deepest near-navy of the set, still readable as light mode. Dramatic.",
    background: "228 28% 74%",
    card: "229 32% 80%",
    sidebar: "227 24% 72%",
    sidebarBorder: "226 20% 65%",
    foreground: "232 32% 13%",
    mutedForeground: "228 15% 29%",
    border: "227 20% 66%",
    primary: "178 60% 27%",
    primaryForeground: "0 0% 100%",
    accent: "228 36% 73%",
    goalBanner: "229 32% 78%",
  },
  {
    id: 17,
    name: "17 · Glacier Blue",
    vibe: "Cool, clean and a touch lighter — for when 'deep' feels a step too dark.",
    background: "205 32% 85%",
    card: "206 38% 90%",
    sidebar: "204 28% 83%",
    sidebarBorder: "203 22% 76%",
    foreground: "210 28% 15%",
    mutedForeground: "206 13% 34%",
    border: "204 22% 77%",
    primary: "178 64% 27%",
    primaryForeground: "0 0% 100%",
    accent: "205 40% 83%",
    goalBanner: "206 36% 87%",
  },
  {
    id: 18,
    name: "18 · Royal",
    vibe: "Vivid royal blue. The boldest, most saturated colour in the set.",
    background: "226 38% 81%",
    card: "227 42% 86%",
    sidebar: "225 34% 79%",
    sidebarBorder: "224 28% 72%",
    foreground: "230 36% 14%",
    mutedForeground: "226 17% 32%",
    border: "225 28% 73%",
    primary: "178 62% 27%",
    primaryForeground: "0 0% 100%",
    accent: "226 46% 78%",
    goalBanner: "227 42% 83%",
  },
  {
    id: 19,
    name: "19 · Stormy Slate",
    vibe: "Grey-leaning deep blue. Muted and understated; very easy on the eyes.",
    background: "212 18% 78%",
    card: "213 22% 83%",
    sidebar: "211 16% 76%",
    sidebarBorder: "210 14% 69%",
    foreground: "216 24% 14%",
    mutedForeground: "212 12% 31%",
    border: "211 15% 70%",
    primary: "178 60% 27%",
    primaryForeground: "0 0% 100%",
    accent: "212 24% 77%",
    goalBanner: "213 22% 81%",
  },
  {
    id: 20,
    name: "20 · Ink Blue",
    vibe: "Deep and saturated, close to ink. Strong identity, still light-mode.",
    background: "230 30% 78%",
    card: "231 34% 83%",
    sidebar: "229 26% 76%",
    sidebarBorder: "228 22% 69%",
    foreground: "234 34% 13%",
    mutedForeground: "230 16% 30%",
    border: "229 22% 70%",
    primary: "178 60% 27%",
    primaryForeground: "0 0% 100%",
    accent: "230 38% 76%",
    goalBanner: "231 34% 81%",
  },
  {
    id: 21,
    name: "21 · Arctic Steel",
    vibe: "Cool desaturated steel-blue, mid depth. Neutral and calm.",
    background: "208 20% 82%",
    card: "209 24% 87%",
    sidebar: "207 17% 80%",
    sidebarBorder: "206 15% 73%",
    foreground: "212 24% 15%",
    mutedForeground: "208 12% 33%",
    border: "207 16% 74%",
    primary: "178 62% 27%",
    primaryForeground: "0 0% 100%",
    accent: "208 26% 80%",
    goalBanner: "209 24% 84%",
  },
  {
    id: 22,
    name: "22 · Lapis",
    vibe: "Jewel-deep lapis. Saturated and premium, a richer Sapphire.",
    background: "216 36% 80%",
    card: "217 40% 85%",
    sidebar: "215 32% 78%",
    sidebarBorder: "214 26% 71%",
    foreground: "220 34% 14%",
    mutedForeground: "216 17% 32%",
    border: "215 26% 72%",
    primary: "178 62% 27%",
    primaryForeground: "0 0% 100%",
    accent: "216 44% 78%",
    goalBanner: "217 40% 82%",
  },
  {
    id: 23,
    name: "23 · Dusk Blue",
    vibe: "Soft, muted deep blue with a violet whisper. Quiet and mature.",
    background: "234 22% 81%",
    card: "235 26% 86%",
    sidebar: "233 19% 79%",
    sidebarBorder: "232 16% 72%",
    foreground: "238 26% 15%",
    mutedForeground: "234 13% 32%",
    border: "233 17% 73%",
    primary: "178 62% 27%",
    primaryForeground: "0 0% 100%",
    accent: "234 30% 79%",
    goalBanner: "235 26% 83%",
  },
  {
    id: 24,
    name: "24 · Deep Sea",
    vibe: "Dark teal-leaning blue. The deepest cyan — sits beautifully with the brand.",
    background: "198 32% 79%",
    card: "199 38% 84%",
    sidebar: "197 28% 77%",
    sidebarBorder: "196 23% 70%",
    foreground: "202 30% 14%",
    mutedForeground: "198 15% 31%",
    border: "197 23% 71%",
    primary: "178 64% 27%",
    primaryForeground: "0 0% 100%",
    accent: "198 42% 77%",
    goalBanner: "199 38% 81%",
  },

  // ── PURE DARK-BLUE LADDER (25–34) ──────────────────────────────────
  // One true-blue hue (216–220), nothing mixed in — no violet, no teal, no
  // grey. Just stepping progressively DARKER. Pick by depth.
  {
    id: 25,
    name: "25 · Deep Blue I",
    vibe: "Pure true blue, first step down. Clearly deeper than the set above.",
    background: "218 32% 77%",
    card: "219 36% 82%",
    sidebar: "217 29% 75%",
    sidebarBorder: "216 25% 68%",
    foreground: "220 32% 13%",
    mutedForeground: "218 15% 30%",
    border: "217 25% 69%",
    primary: "178 60% 27%",
    primaryForeground: "0 0% 100%",
    accent: "218 38% 75%",
    goalBanner: "219 36% 80%",
  },
  {
    id: 26,
    name: "26 · Deep Blue II",
    vibe: "Same pure blue, a touch darker and a touch richer.",
    background: "218 34% 74%",
    card: "219 38% 79%",
    sidebar: "217 31% 72%",
    sidebarBorder: "216 27% 65%",
    foreground: "220 33% 13%",
    mutedForeground: "218 16% 29%",
    border: "217 27% 66%",
    primary: "178 60% 27%",
    primaryForeground: "0 0% 100%",
    accent: "218 40% 72%",
    goalBanner: "219 38% 77%",
  },
  {
    id: 27,
    name: "27 · Deep Blue III",
    vibe: "Mid-deep pure blue. Confident without being heavy.",
    background: "218 36% 71%",
    card: "219 40% 76%",
    sidebar: "217 33% 69%",
    sidebarBorder: "216 29% 62%",
    foreground: "221 34% 12%",
    mutedForeground: "218 16% 28%",
    border: "217 29% 63%",
    primary: "178 60% 27%",
    primaryForeground: "0 0% 100%",
    accent: "218 42% 69%",
    goalBanner: "219 40% 74%",
  },
  {
    id: 28,
    name: "28 · Deep Blue IV",
    vibe: "Getting genuinely dark. Strong blue presence, still light-mode ink.",
    background: "218 38% 68%",
    card: "219 42% 73%",
    sidebar: "217 35% 66%",
    sidebarBorder: "216 31% 59%",
    foreground: "221 36% 12%",
    mutedForeground: "218 17% 27%",
    border: "217 31% 60%",
    primary: "178 60% 27%",
    primaryForeground: "0 0% 100%",
    accent: "218 44% 66%",
    goalBanner: "219 42% 71%",
  },
  {
    id: 29,
    name: "29 · Deep Blue V",
    vibe: "Deep, saturated pure blue. Bold surface, dark ink stays readable.",
    background: "218 40% 65%",
    card: "219 44% 70%",
    sidebar: "217 37% 63%",
    sidebarBorder: "216 33% 56%",
    foreground: "222 38% 11%",
    mutedForeground: "218 18% 26%",
    border: "217 33% 57%",
    primary: "178 60% 27%",
    primaryForeground: "0 0% 100%",
    accent: "218 46% 63%",
    goalBanner: "219 44% 68%",
  },
  {
    id: 30,
    name: "30 · Deep Blue VI",
    vibe: "Richest of the straight ladder. Deep and vivid, pure blue.",
    background: "218 44% 63%",
    card: "219 48% 68%",
    sidebar: "217 40% 61%",
    sidebarBorder: "216 35% 54%",
    foreground: "222 40% 11%",
    mutedForeground: "218 18% 25%",
    border: "217 35% 55%",
    primary: "178 58% 27%",
    primaryForeground: "0 0% 100%",
    accent: "218 50% 61%",
    goalBanner: "219 48% 66%",
  },
  {
    id: 31,
    name: "31 · Bold Blue",
    vibe: "Higher-saturation pure blue at mid-deep. Most 'colourful' of the ladder.",
    background: "220 46% 66%",
    card: "221 50% 71%",
    sidebar: "219 42% 64%",
    sidebarBorder: "218 37% 57%",
    foreground: "223 40% 11%",
    mutedForeground: "220 18% 26%",
    border: "219 37% 58%",
    primary: "178 58% 27%",
    primaryForeground: "0 0% 100%",
    accent: "220 52% 64%",
    goalBanner: "221 50% 69%",
  },
  {
    id: 32,
    name: "32 · Bold Blue Deep",
    vibe: "Bold Blue pushed darker. Saturated, deep, unmistakably blue.",
    background: "220 48% 62%",
    card: "221 52% 67%",
    sidebar: "219 44% 60%",
    sidebarBorder: "218 39% 53%",
    foreground: "223 42% 10%",
    mutedForeground: "220 19% 24%",
    border: "219 39% 54%",
    primary: "178 58% 27%",
    primaryForeground: "0 0% 100%",
    accent: "220 54% 60%",
    goalBanner: "221 52% 65%",
  },
  {
    id: 33,
    name: "33 · Strong Blue",
    vibe: "Deep pure blue, hue nudged slightly cooler. Solid and grounded.",
    background: "216 42% 64%",
    card: "217 46% 69%",
    sidebar: "215 38% 62%",
    sidebarBorder: "214 34% 55%",
    foreground: "219 40% 11%",
    mutedForeground: "216 18% 26%",
    border: "215 34% 56%",
    primary: "178 58% 27%",
    primaryForeground: "0 0% 100%",
    accent: "216 48% 62%",
    goalBanner: "217 46% 67%",
  },
  {
    id: 34,
    name: "34 · Darkest Blue",
    vibe: "The darkest, most saturated pure blue. As deep as light-mode allows.",
    background: "218 46% 60%",
    card: "219 50% 65%",
    sidebar: "217 42% 58%",
    sidebarBorder: "216 38% 51%",
    foreground: "222 44% 10%",
    mutedForeground: "218 20% 24%",
    border: "217 38% 52%",
    primary: "178 58% 27%",
    primaryForeground: "0 0% 100%",
    accent: "218 52% 58%",
    goalBanner: "219 50% 63%",
  },
];

export default function BlueThemesPage() {
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
          Deep-blue light-mode variants
        </h1>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: "6px 0 0", maxWidth: 760 }}>
          24 light-mode candidates, all in the blue family but leaning{" "}
          <strong style={{ color: "#d1d5db" }}>deep / dark-blue</strong> (richer and more
          grounded than airy light-blue), shown as full-width Career&nbsp;Radar mockups.
          <strong style={{ color: "#d1d5db" }}>25–34 are the pure dark-blue ladder</strong> —
          one true-blue hue, nothing mixed in (no violet, teal or grey), stepping
          progressively darker. (1–24 above add hue/tone variety if you want it.)
          Tap <strong style={{ color: "#d1d5db" }}>⛶ Fullscreen</strong> on any one for a
          true full-page view (Esc to exit). Tell me which number and I&apos;ll wire it
          into the real light theme.
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

        <div
          style={{
            background: `hsl(${p.card})`,
            border: `1px solid hsl(${p.border})`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
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
    "Social Care",
  ];
  const n = 13;
  const R = 175;
  const spokes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), label: labels[i], a };
  });
  const dots = [
    [0.55, -0.5], [0.4, -0.2], [0.62, -0.35], [0.3, 0.05], [0.45, 0.1],
    [0.25, 0.25], [0.5, 0.3], [0.7, 0.0], [0.35, 0.45], [0.6, 0.5],
    [0.2, 0.55], [0.42, 0.62], [0.15, 0.4],
  ];
  return (
    <svg width={460} height={460} viewBox="0 0 460 460">
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
      <path
        d={`M ${cx} ${cy} L ${cx + R * Math.cos(-0.2)} ${cy + R * Math.sin(-0.2)} A ${R} ${R} 0 0 1 ${cx + R * Math.cos(0.55)} ${cy + R * Math.sin(0.55)} Z`}
        fill={`hsl(${p.primary} / 0.18)`}
      />
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
            fill={teal ? `hsl(${p.primary})` : "hsl(220 55% 50%)"}
          />
        );
      })}
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

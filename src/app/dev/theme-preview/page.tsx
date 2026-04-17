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

import { useEffect, useRef, useState } from "react";
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
    background: "260 35% 93%",
    card: "260 40% 99%",
    sidebar: "230 28% 90%",
    sidebarBorder: "230 22% 82%",
    foreground: "228 40% 18%",
    mutedForeground: "225 22% 48%",
    border: "230 24% 86%",
    primary: "228 45% 43%",
    primaryForeground: "0 0% 100%",
    accent: "250 35% 95%",
    canvasWash:
      "radial-gradient(90% 55% at 15% 0%, hsl(240 70% 96% / 0.9) 0%, transparent 65%), radial-gradient(70% 60% at 100% 0%, hsl(260 55% 94% / 0.7) 0%, transparent 60%)",
  },
  {
    id: "coffee-sky",
    name: "E · Coffee & Sky (Mugs)",
    blurb:
      "Warm cream canvas with deep sky-blue brand and charcoal text. Cosy but refined.",
    vibe: "Grounded, warm, editorial — swaps teal for sky blue",
    background: "36 28% 97%",
    card: "0 0% 100%",
    sidebar: "36 20% 93%",
    sidebarBorder: "36 16% 85%",
    foreground: "222 13% 22%",
    mutedForeground: "42 12% 40%",
    border: "36 15% 88%",
    primary: "206 52% 42%",
    primaryForeground: "0 0% 100%",
    accent: "206 45% 95%",
    canvasWash: null,
  },
  {
    id: "muted-teal",
    name: "F · Muted Teal (Watson)",
    blurb:
      "Pale sage canvas, deep-teal text. The only palette that sits *natively* on top of your existing teal brand.",
    vibe: "Calm, intentional, holds teal beautifully",
    background: "179 22% 96%",
    card: "0 0% 100%",
    sidebar: "179 18% 92%",
    sidebarBorder: "179 14% 84%",
    foreground: "192 50% 13%",
    mutedForeground: "192 12% 38%",
    border: "179 14% 86%",
    primary: "192 42% 26%",
    primaryForeground: "0 0% 100%",
    accent: "179 25% 93%",
    canvasWash: null,
  },
  {
    id: "vibrant-playful",
    name: "G · Vibrant & Playful (Waaark)",
    blurb:
      "Powder-blue canvas, coral brand, navy text. Most energetic and youthful of the set.",
    vibe: "Fun, bold, youthful — big personality",
    background: "200 55% 97%",
    card: "0 0% 100%",
    sidebar: "200 45% 93%",
    sidebarBorder: "200 30% 83%",
    foreground: "226 42% 22%",
    mutedForeground: "230 25% 42%",
    border: "200 30% 88%",
    primary: "0 85% 68%",
    primaryForeground: "0 0% 100%",
    accent: "48 85% 93%",
    canvasWash:
      "radial-gradient(60% 40% at 80% 0%, hsl(48 88% 90% / 0.55) 0%, transparent 60%), radial-gradient(50% 40% at 0% 100%, hsl(0 80% 94% / 0.4) 0%, transparent 60%)",
  },
  {
    id: "editorial-rose",
    name: "H · Editorial Rose (Great Works)",
    blurb:
      "Cool blue-gray canvas with dusty-rose brand. Warm/cool balance, editorial feel.",
    vibe: "Sophisticated, mature, balanced — swaps teal for rose",
    background: "211 22% 97%",
    card: "0 0% 100%",
    sidebar: "211 20% 93%",
    sidebarBorder: "211 16% 85%",
    foreground: "205 27% 22%",
    mutedForeground: "332 8% 38%",
    border: "211 16% 88%",
    primary: "358 48% 58%",
    primaryForeground: "0 0% 100%",
    accent: "0 35% 95%",
    canvasWash: null,
  },
  {
    id: "steel-serious",
    name: "I · Steel & Serious (Crop Trust)",
    blurb:
      "Pale steel canvas, navy text, steel-blue brand. Quietly confident and trust-signalling.",
    vibe: "Premium, trustworthy — may read corporate for a youth app",
    background: "210 40% 98%",
    card: "0 0% 100%",
    sidebar: "210 25% 94%",
    sidebarBorder: "210 20% 85%",
    foreground: "211 93% 13%",
    mutedForeground: "234 18% 35%",
    border: "210 20% 88%",
    primary: "207 52% 31%",
    primaryForeground: "0 0% 100%",
    accent: "210 45% 95%",
    canvasWash: null,
  },
  {
    id: "mono-studio",
    name: "J · Monochrome Studio (Puddle Sound)",
    blurb:
      "Cool pale-gray canvas, near-white cards, graphite brand. All tone, no colour — gallery minimalism.",
    vibe: "Premium, quiet, architectural — swaps teal for graphite",
    background: "220 6% 93%",
    card: "0 0% 99%",
    sidebar: "220 6% 89%",
    sidebarBorder: "220 6% 80%",
    foreground: "220 10% 16%",
    mutedForeground: "220 5% 42%",
    border: "220 8% 82%",
    primary: "220 12% 26%",
    primaryForeground: "0 0% 100%",
    accent: "220 8% 94%",
    canvasWash:
      "radial-gradient(100% 60% at 50% 0%, hsl(0 0% 100% / 0.6) 0%, transparent 70%)",
  },
  {
    id: "sky-to-sand",
    name: "K · Sky to Sand (Lafour)",
    blurb:
      "Full-canvas gradient from cool slate top to warm sand bottom, with mustard-yellow brand. Editorial and atmospheric.",
    vibe: "Moody, editorial, fashion-forward — swaps teal for mustard",
    background: "215 14% 84%",
    card: "40 25% 98%",
    sidebar: "215 16% 78%",
    sidebarBorder: "215 14% 70%",
    foreground: "215 22% 18%",
    mutedForeground: "215 10% 38%",
    border: "215 12% 76%",
    primary: "42 62% 48%",
    primaryForeground: "215 25% 14%",
    accent: "30 28% 90%",
    canvasWash:
      "linear-gradient(180deg, hsl(215 18% 78%) 0%, hsl(205 14% 84%) 45%, hsl(30 22% 86%) 100%)",
  },
  {
    id: "dawn-horizon",
    name: "L · Dawn Horizon",
    blurb:
      "Twin-glow canvas: warm amber left, cool blue right, cream centre. Deep-navy brand with gold accents. Hopeful and poetic.",
    vibe: "Hopeful, atmospheric, aspirational — swaps teal for navy + gold",
    background: "35 25% 92%",
    card: "35 28% 98%",
    sidebar: "35 20% 88%",
    sidebarBorder: "215 14% 78%",
    foreground: "230 35% 16%",
    mutedForeground: "230 12% 40%",
    border: "215 14% 82%",
    primary: "230 38% 20%",
    primaryForeground: "35 28% 96%",
    accent: "45 55% 90%",
    canvasWash:
      "radial-gradient(65% 85% at 15% 45%, hsl(25 55% 75% / 0.65) 0%, transparent 60%), radial-gradient(60% 80% at 88% 55%, hsl(215 38% 80% / 0.6) 0%, transparent 60%), radial-gradient(50% 60% at 50% 50%, hsl(35 35% 94% / 0.5) 0%, transparent 70%)",
  },
  {
    id: "teal-mist",
    name: "M · Teal Mist",
    blurb:
      "Pale-teal glow meets warm cream over a soft sage canvas. Keeps your existing teal brand intact — the safest blended option.",
    vibe: "Calm, tranquil, on-brand — retains teal",
    background: "168 20% 93%",
    card: "40 25% 98%",
    sidebar: "168 16% 89%",
    sidebarBorder: "168 14% 80%",
    foreground: "192 45% 14%",
    mutedForeground: "192 14% 40%",
    border: "168 14% 82%",
    primary: "166 60% 34%",
    primaryForeground: "0 0% 100%",
    accent: "42 30% 93%",
    canvasWash:
      "radial-gradient(65% 85% at 18% 30%, hsl(168 45% 80% / 0.6) 0%, transparent 60%), radial-gradient(60% 80% at 85% 70%, hsl(42 55% 88% / 0.55) 0%, transparent 60%), radial-gradient(50% 60% at 50% 50%, hsl(166 25% 95% / 0.4) 0%, transparent 70%)",
  },
  {
    id: "rose-bloom",
    name: "N · Rose Bloom",
    blurb:
      "Dusty-rose glow paired with soft lavender, warm cream underneath. Feminine, editorial, emotionally warm.",
    vibe: "Warm, romantic, gentle — swaps teal for rose",
    background: "340 22% 93%",
    card: "350 20% 98%",
    sidebar: "340 15% 89%",
    sidebarBorder: "340 14% 80%",
    foreground: "340 30% 18%",
    mutedForeground: "340 12% 42%",
    border: "340 14% 85%",
    primary: "350 50% 55%",
    primaryForeground: "0 0% 100%",
    accent: "265 25% 93%",
    canvasWash:
      "radial-gradient(65% 85% at 85% 20%, hsl(350 55% 85% / 0.6) 0%, transparent 60%), radial-gradient(60% 80% at 12% 80%, hsl(265 45% 88% / 0.55) 0%, transparent 60%), radial-gradient(50% 60% at 50% 55%, hsl(35 40% 95% / 0.5) 0%, transparent 70%)",
  },
  {
    id: "citrus-bloom",
    name: "O · Citrus Bloom",
    blurb:
      "Coral glow at the top, butter-yellow right, mint hint below. The most energetic blended option — built for a youth platform.",
    vibe: "Fun, energising, warm — swaps teal for coral",
    background: "28 35% 94%",
    card: "28 30% 99%",
    sidebar: "20 25% 91%",
    sidebarBorder: "20 22% 82%",
    foreground: "12 42% 20%",
    mutedForeground: "18 18% 40%",
    border: "20 22% 86%",
    primary: "14 75% 56%",
    primaryForeground: "0 0% 100%",
    accent: "48 60% 92%",
    canvasWash:
      "radial-gradient(70% 80% at 25% 20%, hsl(14 80% 82% / 0.6) 0%, transparent 60%), radial-gradient(60% 75% at 85% 45%, hsl(48 80% 85% / 0.55) 0%, transparent 60%), radial-gradient(55% 65% at 40% 95%, hsl(150 40% 88% / 0.45) 0%, transparent 65%)",
  },
  {
    id: "arctic-light",
    name: "P · Arctic Light",
    blurb:
      "Lavender glow top-left, powder blue right, near-white centre. Quietest of the blended set — minimal but warm.",
    vibe: "Airy, calm, thoughtful — swaps teal for indigo",
    background: "220 25% 96%",
    card: "0 0% 100%",
    sidebar: "220 22% 92%",
    sidebarBorder: "220 18% 84%",
    foreground: "228 40% 16%",
    mutedForeground: "225 12% 42%",
    border: "220 18% 88%",
    primary: "228 48% 44%",
    primaryForeground: "0 0% 100%",
    accent: "255 28% 94%",
    canvasWash:
      "radial-gradient(60% 80% at 15% 25%, hsl(255 45% 90% / 0.55) 0%, transparent 60%), radial-gradient(65% 85% at 90% 75%, hsl(210 50% 88% / 0.5) 0%, transparent 60%), radial-gradient(45% 55% at 55% 50%, hsl(180 20% 97% / 0.4) 0%, transparent 70%)",
  },
  {
    id: "sage-meadow",
    name: "Q · Sage Meadow",
    blurb:
      "Sage-green glow left, butter-yellow top-right, dusty-blue hint below. Earthy, grounded, organic — teal brand retained.",
    vibe: "Natural, grounded, therapeutic — retains teal",
    background: "90 18% 93%",
    card: "60 25% 98%",
    sidebar: "90 16% 89%",
    sidebarBorder: "90 14% 80%",
    foreground: "140 28% 15%",
    mutedForeground: "100 10% 40%",
    border: "90 14% 82%",
    primary: "166 60% 32%",
    primaryForeground: "0 0% 100%",
    accent: "48 35% 92%",
    canvasWash:
      "radial-gradient(65% 85% at 12% 50%, hsl(100 30% 82% / 0.55) 0%, transparent 60%), radial-gradient(55% 75% at 85% 20%, hsl(48 55% 85% / 0.55) 0%, transparent 60%), radial-gradient(60% 70% at 65% 95%, hsl(210 30% 88% / 0.4) 0%, transparent 65%)",
  },
  {
    id: "mild-gradient",
    name: "R · Mild Gradient",
    blurb:
      "Clean two-stop diagonal from muted green (#67b26f) to muted blue (#4ca2cd). Saturated canvas, pure-white cards for legibility.",
    vibe: "Bold, confident, product-like — the full-bleed gradient is the hero",
    background: "155 30% 72%",
    card: "0 0% 100%",
    sidebar: "125 28% 70%",
    sidebarBorder: "160 20% 60%",
    foreground: "195 35% 18%",
    mutedForeground: "195 14% 38%",
    border: "170 18% 70%",
    primary: "200 55% 42%",
    primaryForeground: "0 0% 100%",
    accent: "200 40% 92%",
    canvasWash:
      "linear-gradient(120deg, hsl(125 35% 60%) 0%, hsl(200 55% 60%) 100%)",
  },
  {
    id: "dawn-gradient",
    name: "S · Dawn Gradient",
    blurb:
      "Two-stop diagonal from warm orange (#f3904f) to deep navy (#3b4371). Sunrise energy, saturated canvas, pure-white cards.",
    vibe: "Bold, hopeful, energising — swaps teal for orange + navy",
    background: "15 35% 62%",
    card: "0 0% 100%",
    sidebar: "25 35% 72%",
    sidebarBorder: "25 20% 58%",
    foreground: "229 42% 16%",
    mutedForeground: "229 14% 38%",
    border: "20 20% 68%",
    primary: "25 82% 52%",
    primaryForeground: "0 0% 100%",
    accent: "25 60% 92%",
    canvasWash:
      "linear-gradient(120deg, hsl(25 87% 63%) 0%, hsl(229 32% 34%) 100%)",
  },
  {
    id: "love-couple",
    name: "T · Love Couple",
    blurb:
      "Two-stop diagonal from steel blue (#3a6186) to deep wine (#89253e). Rich, romantic, high-drama.",
    vibe: "Dramatic, emotional, mature — swaps teal for wine",
    background: "340 16% 56%",
    card: "0 0% 100%",
    sidebar: "340 18% 78%",
    sidebarBorder: "340 15% 62%",
    foreground: "215 42% 16%",
    mutedForeground: "340 10% 40%",
    border: "340 14% 70%",
    primary: "345 55% 38%",
    primaryForeground: "0 0% 100%",
    accent: "345 40% 92%",
    canvasWash:
      "linear-gradient(120deg, hsl(208 39% 38%) 0%, hsl(345 58% 34%) 100%)",
  },
  {
    id: "disco",
    name: "U · Disco",
    blurb:
      "Two-stop diagonal from teal (#4ecdc4) to slate (#556270). Keeps the teal brand but pairs it with a confident cool slate.",
    vibe: "Cool, confident, teal-forward — retains brand",
    background: "188 30% 62%",
    card: "0 0% 100%",
    sidebar: "188 25% 82%",
    sidebarBorder: "188 18% 68%",
    foreground: "215 28% 16%",
    mutedForeground: "215 12% 38%",
    border: "188 14% 72%",
    primary: "176 59% 45%",
    primaryForeground: "0 0% 100%",
    accent: "176 40% 92%",
    canvasWash:
      "linear-gradient(120deg, hsl(176 59% 55%) 0%, hsl(215 14% 38%) 100%)",
  },
  {
    id: "deep-sea-space",
    name: "V · Deep Sea Space",
    blurb:
      "Two-stop diagonal from dark navy (#2c3e50) to teal (#4ca1af). Premium, corporate-leaning but still warm via the teal end.",
    vibe: "Premium, quietly confident — retains teal brand",
    background: "200 30% 38%",
    card: "0 0% 100%",
    sidebar: "200 24% 80%",
    sidebarBorder: "200 18% 65%",
    foreground: "210 29% 18%",
    mutedForeground: "210 14% 38%",
    border: "200 14% 72%",
    primary: "187 40% 42%",
    primaryForeground: "0 0% 100%",
    accent: "187 35% 92%",
    canvasWash:
      "linear-gradient(120deg, hsl(210 29% 24%) 0%, hsl(187 40% 49%) 100%)",
  },
  {
    id: "solid-vault",
    name: "W · Solid Vault",
    blurb:
      "Two-stop diagonal from royal blue (#3a7bd5) to slate (#3a6073). Dependable, institutional, calm.",
    vibe: "Trustworthy, mature, blue-forward",
    background: "210 40% 48%",
    card: "0 0% 100%",
    sidebar: "210 30% 80%",
    sidebarBorder: "210 22% 66%",
    foreground: "215 32% 16%",
    mutedForeground: "215 14% 38%",
    border: "210 16% 72%",
    primary: "215 65% 48%",
    primaryForeground: "0 0% 100%",
    accent: "215 50% 93%",
    canvasWash:
      "linear-gradient(120deg, hsl(215 65% 53%) 0%, hsl(202 32% 34%) 100%)",
  },
  {
    id: "decent",
    name: "X · Decent",
    blurb:
      "Soft two-stop from teal (#4ca1af) to pale sky (#c4e0e5). Much lighter than the other gradients — airy, spa-like, reads almost as a solid.",
    vibe: "Calm, airy, gentle — retains teal brand, lightest gradient",
    background: "189 40% 72%",
    card: "0 0% 100%",
    sidebar: "189 36% 88%",
    sidebarBorder: "189 24% 78%",
    foreground: "200 30% 18%",
    mutedForeground: "200 12% 40%",
    border: "189 20% 82%",
    primary: "187 42% 42%",
    primaryForeground: "0 0% 100%",
    accent: "189 45% 94%",
    canvasWash:
      "linear-gradient(120deg, hsl(187 40% 49%) 0%, hsl(189 36% 83%) 100%)",
  },
  {
    id: "nighthawk",
    name: "Y · Nighthawk",
    blurb:
      "Two-stop diagonal from bright blue (#2980b9) to deep navy (#2c3e50). Darker, moodier — the most dusk-like of the blues.",
    vibe: "Moody, focused, dusk energy",
    background: "207 40% 38%",
    card: "0 0% 100%",
    sidebar: "207 28% 78%",
    sidebarBorder: "207 20% 64%",
    foreground: "210 32% 16%",
    mutedForeground: "210 14% 38%",
    border: "207 14% 70%",
    primary: "204 64% 42%",
    primaryForeground: "0 0% 100%",
    accent: "204 50% 93%",
    canvasWash:
      "linear-gradient(120deg, hsl(204 64% 44%) 0%, hsl(210 29% 24%) 100%)",
  },
  {
    id: "fresh-turboscent",
    name: "Z · Fresh Turboscent",
    blurb:
      "Two-stop diagonal from pale butter-yellow (#f1f2b5) to deep teal (#135058). Most unusual of the batch — warm light end, cool deep end. Retains teal.",
    vibe: "Distinctive, optimistic, retains teal — most characterful",
    background: "110 18% 68%",
    card: "0 0% 100%",
    sidebar: "61 35% 88%",
    sidebarBorder: "90 18% 72%",
    foreground: "188 40% 14%",
    mutedForeground: "188 14% 36%",
    border: "90 14% 76%",
    primary: "188 65% 26%",
    primaryForeground: "0 0% 100%",
    accent: "61 55% 94%",
    canvasWash:
      "linear-gradient(120deg, hsl(61 69% 83%) 0%, hsl(188 65% 21%) 100%)",
  },
  {
    id: "turquoise-flow",
    name: "AA · Turquoise Flow",
    blurb:
      "Two-stop diagonal from deep blue-teal (#136a8a) to saturated teal (#267871). Cohesive teal family — retains brand.",
    vibe: "Deep, focused, teal-forward — retains teal brand",
    background: "185 30% 52%",
    card: "0 0% 100%",
    sidebar: "185 24% 78%",
    sidebarBorder: "185 18% 62%",
    foreground: "200 42% 14%",
    mutedForeground: "200 14% 38%",
    border: "185 14% 70%",
    primary: "175 52% 32%",
    primaryForeground: "0 0% 100%",
    accent: "175 45% 93%",
    canvasWash:
      "linear-gradient(120deg, hsl(199 76% 31%) 0%, hsl(175 52% 31%) 100%)",
  },
  {
    id: "vine",
    name: "BB · Vine",
    blurb:
      "Two-stop diagonal from vivid green-teal (#00bf8f) to near-black (#001510). Most dramatic contrast — forest at dusk.",
    vibe: "Dramatic, alive, forest-at-dusk energy",
    background: "165 40% 28%",
    card: "0 0% 100%",
    sidebar: "165 22% 78%",
    sidebarBorder: "165 18% 60%",
    foreground: "165 35% 10%",
    mutedForeground: "165 14% 36%",
    border: "165 14% 70%",
    primary: "165 80% 30%",
    primaryForeground: "0 0% 100%",
    accent: "165 45% 93%",
    canvasWash:
      "linear-gradient(120deg, hsl(165 100% 37%) 0%, hsl(168 100% 4%) 100%)",
  },
  {
    id: "endless-river",
    name: "CC · Endless River",
    blurb:
      "Two-stop diagonal from mint-teal (#43cea2) to deep blue (#185a9d). Cool, fresh, reliable.",
    vibe: "Fresh, watery, cool — retains teal on the light end",
    background: "180 35% 48%",
    card: "0 0% 100%",
    sidebar: "180 28% 82%",
    sidebarBorder: "180 20% 66%",
    foreground: "210 40% 14%",
    mutedForeground: "210 14% 38%",
    border: "180 16% 72%",
    primary: "166 60% 34%",
    primaryForeground: "0 0% 100%",
    accent: "166 45% 93%",
    canvasWash:
      "linear-gradient(120deg, hsl(159 57% 54%) 0%, hsl(210 74% 35%) 100%)",
  },
  {
    id: "purple-bliss",
    name: "DD · Purple Bliss",
    blurb:
      "Two-stop diagonal from deep aubergine (#360033) to teal (#0b8793). Moody, rich, keeps teal on one end.",
    vibe: "Moody, rich, unusual — retains teal brand",
    background: "250 28% 36%",
    card: "0 0% 100%",
    sidebar: "280 16% 78%",
    sidebarBorder: "280 14% 62%",
    foreground: "300 32% 12%",
    mutedForeground: "280 12% 38%",
    border: "280 12% 70%",
    primary: "186 70% 32%",
    primaryForeground: "0 0% 100%",
    accent: "186 45% 93%",
    canvasWash:
      "linear-gradient(120deg, hsl(303 100% 11%) 0%, hsl(186 86% 31%) 100%)",
  },
  {
    id: "hersheys",
    name: "EE · Hersheys",
    blurb:
      "Two-stop diagonal from near-black cocoa (#1e130c) to warm tan (#9a8478). Earthy, cozy, mature.",
    vibe: "Earthy, warm, grown-up — swaps teal for warm brown",
    background: "25 18% 44%",
    card: "0 0% 100%",
    sidebar: "25 18% 80%",
    sidebarBorder: "25 14% 64%",
    foreground: "25 32% 12%",
    mutedForeground: "25 12% 38%",
    border: "25 12% 72%",
    primary: "25 40% 32%",
    primaryForeground: "0 0% 100%",
    accent: "25 35% 93%",
    canvasWash:
      "linear-gradient(120deg, hsl(23 43% 9%) 0%, hsl(22 17% 54%) 100%)",
  },
  {
    id: "moss",
    name: "FF · Moss",
    blurb:
      "Two-stop diagonal from dark teal (#134e5e) to sage (#71b280). Natural, grounded, outdoorsy.",
    vibe: "Natural, grounded, forest — retains teal brand",
    background: "160 30% 46%",
    card: "0 0% 100%",
    sidebar: "160 24% 82%",
    sidebarBorder: "160 18% 66%",
    foreground: "192 45% 14%",
    mutedForeground: "192 14% 38%",
    border: "160 14% 72%",
    primary: "166 60% 34%",
    primaryForeground: "0 0% 100%",
    accent: "160 35% 93%",
    canvasWash:
      "linear-gradient(120deg, hsl(192 66% 22%) 0%, hsl(132 30% 57%) 100%)",
  },
  {
    id: "cool-brown",
    name: "GG · Cool Brown",
    blurb:
      "Two-stop diagonal from dark brown (#603813) to warm taupe (#b29f94). Minimal, editorial, suede-like.",
    vibe: "Editorial, minimal, warm-neutral",
    background: "28 22% 46%",
    card: "0 0% 100%",
    sidebar: "28 18% 82%",
    sidebarBorder: "28 14% 66%",
    foreground: "28 45% 14%",
    mutedForeground: "28 14% 38%",
    border: "28 12% 72%",
    primary: "28 52% 32%",
    primaryForeground: "0 0% 100%",
    accent: "28 35% 93%",
    canvasWash:
      "linear-gradient(120deg, hsl(28 67% 22%) 0%, hsl(24 15% 64%) 100%)",
  },
  {
    id: "nimvelo",
    name: "HH · Nimvelo",
    blurb:
      "Two-stop diagonal from dark slate (#314755) to bright sky blue (#26a0da). Approachable SaaS blue.",
    vibe: "Approachable, SaaS, sky-forward",
    background: "205 32% 44%",
    card: "0 0% 100%",
    sidebar: "205 24% 82%",
    sidebarBorder: "205 18% 66%",
    foreground: "210 42% 16%",
    mutedForeground: "210 14% 38%",
    border: "205 14% 72%",
    primary: "201 72% 42%",
    primaryForeground: "0 0% 100%",
    accent: "201 55% 94%",
    canvasWash:
      "linear-gradient(120deg, hsl(209 27% 26%) 0%, hsl(201 72% 50%) 100%)",
  },
];

export default function ThemePreviewPage() {
  const [focused, setFocused] = useState<string | null>(null);
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);
  const mockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const onChange = () => {
      const fsEl =
        document.fullscreenElement ||
        // Safari fallback
        (document as unknown as { webkitFullscreenElement?: Element })
          .webkitFullscreenElement;
      if (!fsEl) setFullscreenId(null);
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const enterFullscreen = async (id: string) => {
    const el = mockRefs.current[id];
    if (!el) {
      console.warn("[theme-preview] mock ref not found for", id);
      return;
    }
    type FSElement = HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    const anyEl = el as FSElement;
    try {
      if (anyEl.requestFullscreen) {
        await anyEl.requestFullscreen();
      } else if (anyEl.webkitRequestFullscreen) {
        await anyEl.webkitRequestFullscreen();
      } else {
        // No native support — fall back to in-page focus mode.
        setFocused(id);
        return;
      }
      setFullscreenId(id);
    } catch (err) {
      console.error("[theme-preview] fullscreen failed:", err);
      setFocused(id);
    }
  };

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
          {palettes.length} candidate palettes (A–Z + AA–HH) rendered as mock
          dashboards. Each column scopes its own tokens — nothing here touches
          dark mode or the real app.
        </p>
        <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>
          <strong style={{ color: "#d1d5db" }}>Focus →</strong> expands the
          column in-page ·{" "}
          <strong style={{ color: "#d1d5db" }}>⛶ Fullscreen</strong> requests
          the browser Fullscreen API (press Esc to exit).
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
              isFullscreen={fullscreenId === p.id}
              mockRef={(el) => {
                mockRefs.current[p.id] = el;
              }}
              onToggleFocus={() =>
                setFocused(focused === p.id ? null : p.id)
              }
              onFullscreen={() => enterFullscreen(p.id)}
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
  isFullscreen,
  mockRef,
  onToggleFocus,
  onFullscreen,
}: {
  palette: Palette;
  focused: boolean;
  isFullscreen: boolean;
  mockRef: (el: HTMLDivElement | null) => void;
  onToggleFocus: () => void;
  onFullscreen: () => void;
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
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFocus();
            }}
            style={focused ? buttonStyleActive : buttonStyle}
            title={focused ? "Return to side-by-side view" : "Focus this palette in-page"}
          >
            {focused ? "← Compare all" : "Focus →"}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFullscreen();
            }}
            style={isFullscreen ? buttonStyleActive : buttonStyle}
            title="Open this palette in true fullscreen (press Esc to exit)"
          >
            ⛶ Fullscreen
          </button>
        </div>
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
      <MockDashboard
        palette={p}
        scaled={focused || isFullscreen}
        mockRef={mockRef}
      />
    </section>
  );
}

const buttonStyle: React.CSSProperties = {
  background: "#1f2937",
  border: "1px solid #4b5563",
  color: "#e5e7eb",
  fontSize: 11,
  padding: "5px 10px",
  borderRadius: 6,
  cursor: "pointer",
  whiteSpace: "nowrap",
  fontWeight: 500,
  userSelect: "none",
};

const buttonStyleActive: React.CSSProperties = {
  ...buttonStyle,
  background: "#14b8a6",
  borderColor: "#0f9e8d",
  color: "white",
};

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
function MockDashboard({
  palette: p,
  scaled,
  mockRef,
}: {
  palette: Palette;
  scaled: boolean;
  mockRef?: (el: HTMLDivElement | null) => void;
}) {
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
      ref={mockRef}
      style={
        {
          background: p.canvasWash
            ? `${p.canvasWash}, hsl(${p.background})`
            : `hsl(${p.background})`,
          color: `hsl(${p.foreground})`,
          borderRadius: scaled ? 0 : 12,
          overflow: "auto",
          border: scaled ? "none" : "1px solid #1f2937",
          display: "grid",
          gridTemplateColumns: "180px 1fr",
          minHeight: scaled ? "100vh" : 560,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 13,
          // Uniform proportional scale-up in focus/fullscreen — zoom
          // is non-standard but supported in Chrome/Safari/Firefox,
          // and this is a dev-only preview page.
          zoom: scaled ? 1.5 : 1,
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

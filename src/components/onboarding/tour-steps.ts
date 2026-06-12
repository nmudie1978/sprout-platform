import {
  Sparkles,
  LayoutDashboard,
  Route,
  Bot,
  BarChart3,
  Compass,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Walkthrough step data ──────────────────────────────────────────────
//
// Pure data (no React) so it can be unit-tested in isolation and imported by
// both the walkthrough modal and any tooling. Each step optionally carries a
// `target` — the sidebar destination it describes — which the TourSpotlight
// uses to highlight the matching sidebar item (via its `data-tour-target`
// attribute) as the user steps through. Intro/CTA steps have no target.

export interface WalkthroughStep {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  /** Sidebar href this step points at, or undefined for intro/CTA steps. */
  target?: string;
}

export const STEPS: WalkthroughStep[] = [
  {
    icon: Sparkles,
    iconColor: "text-teal-500",
    iconBg: "bg-teal-500/10",
    title: "Let me show you around",
    body: "Endeavrly helps you explore careers properly — step by step. Here’s how the platform works.",
  },
  {
    icon: Compass,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
    title: "Career Radar",
    body: "This is where you explore careers and choose your career goal — the one career you want to focus on first. Tell it what you enjoy and it maps careers across every path, including ones you’ve never heard of.",
    target: "/careers/radar",
  },
  {
    icon: LayoutDashboard,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    title: "Dashboard",
    body: "Your home area. See your current chosen career, saved journeys, saved content, and pick up where you left off.",
    target: "/dashboard",
  },
  {
    icon: Route,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
    title: "My Journey",
    body: "Once you’ve set a career goal, this is where you explore it properly. Three phases — Discover, Understand, and Clarity — help you figure out if it’s right for you.",
    target: "/my-journey",
  },
  {
    icon: Bot,
    iconColor: "text-cyan-500",
    iconBg: "bg-cyan-500/10",
    title: "Career Twin",
    body: "Meet a digital version of your future self in a career. Ask Future You about study and skills, money and lifestyle, the hard truths, and the next small step you can take — it talks back, just for you.",
    target: "/career-advisor",
  },
  {
    icon: BarChart3,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    title: "Industry Insights",
    body: "Understand what’s happening across different industries — career demand, pay, and broader trends that affect your choices.",
    target: "/insights",
  },
  {
    icon: Compass,
    iconColor: "text-teal-500",
    iconBg: "bg-teal-500/10",
    title: "Choose your first career goal",
    body: "Head to Career Radar, explore what’s out there, and set one career as your career goal. That’s your starting point — you can always change it later.",
  },
];

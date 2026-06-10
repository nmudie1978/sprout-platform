// ─────────────────────────────────────────────────────────────────────────
// Shared landing-page content for the /lab style explorations.
//
// All 10 variants under /lab/[1-10] import THIS module so the copy, message,
// and product focus are byte-for-byte identical across every style. Only the
// visual treatment differs per variant. Edit copy here once; it changes
// everywhere.
//
// Copy is taken verbatim from the live landing page, with one correction:
// the age line now reads "15–30" (the platform's real eligibility range) —
// the live "15–23" brand copy is known-stale.
// ─────────────────────────────────────────────────────────────────────────

export interface Lens {
  /** lucide-react icon name */
  icon: string;
  name: string;
  tagline: string;
  body: string;
}

export interface Feature {
  /** lucide-react icon name */
  icon: string;
  title: string;
  body: string;
}

export interface Contrast {
  not: string;
  instead: string;
}

export interface LandingContent {
  brand: string;
  ageLabel: string;
  tagline: string;
  headline: string;
  subhead: string;
  problem: string;
  solution: string;
  primaryCta: { label: string; href: string };
  framework: { title: string; subtitle: string; lenses: Lens[] };
  features: Feature[];
  timeline: { badge: string; title: string; subtitle: string };
  contrastTitle: string;
  contrasts: Contrast[];
  trustBadges: string[];
  builtBy: { label: string; heading: string };
  closingCta: { title: string; subtitle: string; button: string; href: string };
  footer: { brand: string; links: string[]; copyright: string };
}

export const CONTENT: LandingContent = {
  brand: "Endeavrly",
  ageLabel: "For 15–30 year olds",
  tagline: "The Career Operating System for young people.",
  headline: "Your future is yours to explore.",
  subhead: "See what a career really feels like before you commit to it.",
  problem:
    "But right now, the world of work is almost invisible. Job titles you don't understand. Qualifications you can't picture. Career advice that all sounds the same. Nobody shows you what these paths actually feel like — or whether they'd suit the person you're becoming.",
  solution:
    "Endeavrly gives you what's been missing. Real careers. Honest information. A space to reflect on who you are and try things for yourself — so when you do choose a direction, it's yours. No quizzes. No pressure. Just clarity.",
  primaryCta: { label: "Explore Endeavrly", href: "/auth/signup" },
  framework: {
    title: "Three lenses. One journey.",
    subtitle:
      "Each step builds on the last. Curiosity becomes clarity, clarity becomes direction — at your own pace, on your own terms.",
    lenses: [
      {
        icon: "Compass",
        name: "Discover",
        tagline: "Explore the career",
        body: "Get a high-level view: what it is, who does it, salary range, and whether it's worth a closer look.",
      },
      {
        icon: "BookOpen",
        name: "Understand",
        tagline: "The reality, education & skills",
        body: "Go deeper into day-to-day work, qualifications, and the hard parts.",
      },
      {
        icon: "Sparkles",
        name: "Clarity",
        tagline: "See your full journey",
        body: "See the full timeline, milestones, and what it takes to get there.",
      },
    ],
  },
  features: [
    {
      icon: "Compass",
      title: "Explore careers",
      body: "Browse real paths and honest information about what different careers involve.",
    },
    {
      icon: "PenLine",
      title: "Reflect privately",
      body: "Guided prompts help you notice what fits. Everything stays on your device.",
    },
    {
      icon: "Eye",
      title: "Honest, not hyped",
      body: "Straight information about what careers actually involve — no recommendation feeds, no AI-generated hype, no motivational fluff.",
    },
    {
      icon: "MessageCircleHeart",
      title: "Meet your Career Twin",
      body: "Talk to one possible future version of yourself, already living a career you're curious about — and ask what it's really like.",
    },
    {
      icon: "ShieldCheck",
      title: "Safety by default",
      body: "No public profiles, no tracking, and no targeted advertising — ever. Your exploration stays private to you.",
    },
  ],
  timeline: {
    badge: "Your Timeline",
    title: "Your journey, your pace.",
    subtitle: "Everyone grows differently. See your progress as a gentle unfolding, not a race.",
  },
  contrastTitle: "Built differently.",
  contrasts: [
    {
      not: "A career quiz that tells you what to be.",
      instead:
        "A space to work things out for yourself — through real experiences and honest reflection.",
    },
    {
      not: "A motivational app that hypes you up.",
      instead: "Straightforward information about what different paths are actually like.",
    },
    {
      not: "A platform that tracks, scores, or ranks your future.",
      instead: "A private place to explore, try things, and grow at whatever pace feels right.",
    },
  ],
  trustBadges: ["No ads", "No tracking", "No public profiles", "Safety by design"],
  builtBy: { label: "Built by", heading: "A solo builder, not a startup" },
  closingCta: {
    title: "Get started.",
    subtitle: "Free. No credit card. No commitments.",
    button: "Sign up free",
    href: "/auth/signup",
  },
  footer: {
    brand: "Endeavrly",
    links: ["About", "Research", "Terms", "Privacy", "Safety", "Eligibility", "Disclaimer"],
    copyright:
      "© 2026 Endeavrly. Helping young people build life skills and grow in confidence.",
  },
};

// Variant registry — drives the /lab hub index.
export const VARIANTS: { n: number; name: string; idea: string; theme: "light" | "dark" | "conceptual" }[] = [
  { n: 1, name: "Editorial Serif", idea: "Light warm-paper magazine layout, big serif headlines, columns.", theme: "light" },
  { n: 2, name: "Swiss Minimal", idea: "Strict grid, numbered sections, near-total whitespace.", theme: "light" },
  { n: 3, name: "Soft Aurora", idea: "Dark, drifting gradient aurora behind glass cards, glowing teal.", theme: "dark" },
  { n: 4, name: "Brutalist Mono", idea: "High-contrast mono type, hard borders, one accent.", theme: "dark" },
  { n: 5, name: "Bento Grid", idea: "Every section a tile in a mixed-size bento grid.", theme: "dark" },
  { n: 6, name: "Cinematic Spotlight", idea: "Near-black, centred column, oversized type, vignette fades.", theme: "dark" },
  { n: 7, name: "Career OS", idea: "Desktop/window chrome, monospace touches. Conceptual.", theme: "conceptual" },
  { n: 8, name: "Gradient Display", idea: "Huge gradient display words as the hero. A statement.", theme: "dark" },
  { n: 9, name: "Journey Spine", idea: "Whole page hangs off a vertical Discover→Understand→Clarity path.", theme: "light" },
  { n: 10, name: "Warm Zine", idea: "Cream, friendly, soft shadows, rounded sticker-badges.", theme: "light" },
];

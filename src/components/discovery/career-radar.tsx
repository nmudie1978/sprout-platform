"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CAREER_PATHWAYS,
  findCareerCategory,
  getAllCareers,
  getCareersFromDiscovery,
  getMatchReasons,
  getSectorForCareer,
  measureSignalStrength,
  type Career,
  type CareerCategory,
  type DiscoveryPreferences,
} from "@/lib/career-pathways";
import { Sparkles, Settings2, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, ChevronDown, Star, HelpCircle, X, MousePointerClick, Layers, Target, Plus, Check, Route, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useCompareShortlist } from "@/hooks/use-compare-shortlist";
import { CompareModal } from "@/components/compare/compare-modal";
import { toast } from "sonner";
import { SavedComparisonsTray } from "@/components/career-radar/saved-comparisons-tray";

/* ── Radar Guide Tips ─────────────────────────────────────────────── */

const RADAR_GUIDE_KEY = "radar-guide-dismissed";

const RADAR_TIPS = [
  {
    icon: MousePointerClick,
    color: "text-teal-400",
    title: "Tap any dot to explore",
    description:
      "Each dot is a career that matches your interests. Tap one to see salary, skills, and growth outlook \u2014 and set it as your Primary Goal if it sparks something.",
  },
  {
    icon: Target,
    color: "text-pink-400",
    title: "Closer to centre = stronger match",
    description:
      "The radar places your best matches near the centre. Pink glowing dots are your top matches. Your Primary Goal always has a gold ring around it.",
  },
  {
    icon: Layers,
    color: "text-violet-400",
    title: "Filter by match strength",
    description:
      "Use the filter to focus on specific match tiers: Top, Strong, or Good. Each dot is colour-coded so you can see at a glance how well a career fits.",
  },
  {
    icon: Settings2,
    color: "text-amber-400",
    title: "Refine with What I like",
    description:
      "Tap 'What I like' to update your subjects, work style, and people preferences. Your radar recalculates instantly — every answer reshapes the map.",
  },
] as const;

function RadarGuideTips() {
  const [dismissed, setDismissed] = useState(true); // default true to avoid flash
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    try {
      const d = window.localStorage.getItem(RADAR_GUIDE_KEY) === "1";
      setDismissed(d);
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(RADAR_GUIDE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (dismissed) return null;

  const tip = RADAR_TIPS[currentTip];
  const TipIcon = tip.icon;

  return (
    <div className="px-4 pt-3 pb-2 border-b bg-gradient-to-r from-teal-500/5 via-transparent to-violet-500/5">
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "shrink-0 rounded-lg p-1.5 bg-muted/30 mt-0.5",
            tip.color,
          )}
        >
          <TipIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-[13px] font-semibold leading-tight">
            {tip.title}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {tip.description}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 p-1 rounded-md hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-colors"
          aria-label="Dismiss guide"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          {RADAR_TIPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentTip(i)}
              className={cn(
                "h-1 rounded-full transition-all duration-200",
                i === currentTip
                  ? "w-3 bg-teal-500"
                  : i < currentTip
                    ? "w-1.5 bg-teal-500/40"
                    : "w-1.5 bg-muted-foreground/25",
              )}
              aria-label={`Tip ${i + 1}`}
            />
          ))}
          <span className="text-[10px] text-muted-foreground/60 ml-1.5">
            {currentTip + 1}/{RADAR_TIPS.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[11px] px-2"
            onClick={() => setCurrentTip((c) => Math.max(0, c - 1))}
            disabled={currentTip === 0}
          >
            Back
          </Button>
          <Button
            size="sm"
            variant={currentTip === RADAR_TIPS.length - 1 ? "default" : "ghost"}
            className={cn(
              "h-6 text-[11px] px-2",
              currentTip === RADAR_TIPS.length - 1 && "bg-teal-600 hover:bg-teal-700"
            )}
            onClick={() => {
              if (currentTip === RADAR_TIPS.length - 1) {
                dismiss();
              } else {
                setCurrentTip((c) => c + 1);
              }
            }}
          >
            {currentTip === RADAR_TIPS.length - 1 ? "Got it" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Career Radar
 * ------------
 * Calm, planetarium-style visualisation of career matches based on the user's
 * DiscoveryPreferences. Concentric rings = relevance bands. Angle = category
 * (each "slice" is a field). All dots are visually equal — entry-level roles
 * get a small ring marker, NOT a smaller dot, so prestige bias doesn't sneak
 * back into the visual hierarchy.
 *
 * Tap a dot → opens the existing CareerDetailSheet via a window event.
 */

// ── Radar Preference Coach ─────────────────────────────────────────
// Contextual, inline tip that appears when the user has a thin
// preference profile. Helps them understand that adding more inputs
// makes the radar richer — without being pushy.

const COACH_DISMISS_KEY = "radar-coach-dismissed";

interface CoachTip {
  text: string;
  cta: string;
}

function generateCoachTip(prefs: DiscoveryPreferences | null | undefined): CoachTip | null {
  if (!prefs) return null;

  const subjectCount = prefs.subjects?.length ?? 0;
  const hasWorkStyle = (prefs.workStyles?.length ?? 0) > 0;
  const hasPeople = !!prefs.peoplePref;

  // Already well-filled — no tip needed
  if (subjectCount >= 3 && hasWorkStyle && hasPeople) return null;

  // No subjects at all
  if (subjectCount === 0) {
    return {
      text: "Add a few subjects you enjoy to see careers that match your interests",
      cta: "Add subjects",
    };
  }

  // Only 1 subject — encourage broadening
  if (subjectCount === 1) {
    const subj = prefs.subjects![0];
    const COMPLEMENT: Record<string, string> = {
      math: "Try adding Physics or Computing to unlock Engineering and Tech careers",
      physics: "Adding Math or Chemistry would open up more Science and Engineering paths",
      chemistry: "Try adding Biology or Physics to see more Healthcare and Science careers",
      biology: "Adding Chemistry or Psychology would broaden your Healthcare matches",
      computing: "Try adding Math or Design & Tech to see both technical and creative paths",
      art: "Adding Drama or Media Studies would show you more creative career options",
      music: "Try adding Drama or Media Studies to explore the full creative industry",
      drama: "Adding English or Media Studies could reveal more performance and media careers",
      english: "Try adding History or Languages to unlock more communication-based careers",
      history: "Adding Geography or Languages would broaden your public service matches",
      geography: "Try adding PE or Biology to see outdoor and environmental careers",
      pe: "Adding Biology or Psychology would show you Sports Science and Coaching paths",
      business: "Try adding Math or Languages to see Finance and International Business careers",
      psychology: "Adding Biology or Health & Social Care opens up more helping professions",
      languages: "Try adding Business or Geography for international career paths",
      "food-tech": "Adding Chemistry or Biology would reveal Food Science and Nutrition careers",
      "media-studies": "Try adding Art or Computing to see the full digital and creative landscape",
      "design-tech": "Adding Art or Computing would show you both design and technical paths",
      "workshop-making": "Try adding Design & Tech to explore the full maker and trades spectrum",
      "health-social": "Adding Psychology or Biology would broaden your care and health matches",
    };
    const tip = COMPLEMENT[subj];
    if (tip) return { text: tip, cta: "Update preferences" };
  }

  // 2 subjects but same flavour — suggest contrast
  if (subjectCount === 2 && !hasWorkStyle) {
    return {
      text: "You've picked subjects — now tell us how you like to work to sharpen your matches",
      cta: "Add work style",
    };
  }

  // Has subjects but no work style
  if (subjectCount >= 2 && !hasWorkStyle) {
    return {
      text: "Adding a work style preference helps us match you to the right kind of roles",
      cta: "Add work style",
    };
  }

  // Has subjects + work style but no people pref
  if (subjectCount >= 2 && hasWorkStyle && !hasPeople) {
    return {
      text: "One more thing — do you prefer working with people, solo, or a mix?",
      cta: "Set people preference",
    };
  }

  return null;
}

function RadarCoachTip({
  preferences,
  onEditPreferences,
}: {
  preferences: DiscoveryPreferences | null | undefined;
  onEditPreferences: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(COACH_DISMISS_KEY) === "1");
    } catch { /* noop */ }
  }, []);

  const tip = useMemo(() => generateCoachTip(preferences), [preferences]);

  if (!tip || dismissed) return null;

  return (
    <div className="px-4 py-2 border-t flex items-center gap-2 text-[10px]">
      <Sparkles className="h-3 w-3 text-teal-400/60 shrink-0" />
      <span className="text-muted-foreground/60 leading-relaxed flex-1">
        {tip.text}
      </span>
      <button
        onClick={onEditPreferences}
        className="shrink-0 text-teal-500 hover:text-teal-400 font-medium transition-colors whitespace-nowrap"
      >
        {tip.cta}
      </button>
      <button
        onClick={() => {
          setDismissed(true);
          try { localStorage.setItem(COACH_DISMISS_KEY, "1"); } catch { /* noop */ }
        }}
        className="shrink-0 p-0.5 text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors"
        aria-label="Dismiss tip"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

interface CareerRadarProps {
  preferences: DiscoveryPreferences | null | undefined;
  onEditPreferences: () => void;
}

// Map each category to a fixed angle slice (degrees) so positioning is stable.
// Order is the angular position around the radar, starting from the top.
// New categories are interleaved so visually-related slices sit next to
// each other (e.g. Sport next to Health, Creative next to Marketing).
const CATEGORY_ORDER: CareerCategory[] = [
  "HEALTHCARE_LIFE_SCIENCES",
  "SPORT_FITNESS",
  "EDUCATION_TRAINING",
  "PUBLIC_SERVICE_SAFETY",
  "MILITARY_DEFENCE",
  "TECHNOLOGY_IT",
  "BUSINESS_MANAGEMENT",
  "FINANCE_BANKING",
  "SALES_MARKETING",
  "CREATIVE_MEDIA",
  "MANUFACTURING_ENGINEERING",
  "LOGISTICS_TRANSPORT",
  "HOSPITALITY_TOURISM",
  "TELECOMMUNICATIONS",
  "REAL_ESTATE_PROPERTY",
  "SOCIAL_CARE_COMMUNITY",
  "CONSTRUCTION_TRADES",
];

const CATEGORY_LABEL: Record<CareerCategory, string> = {
  HEALTHCARE_LIFE_SCIENCES: "Health",
  EDUCATION_TRAINING: "Education",
  TECHNOLOGY_IT: "Tech",
  BUSINESS_MANAGEMENT: "Business",
  FINANCE_BANKING: "Finance",
  SALES_MARKETING: "Marketing",
  MANUFACTURING_ENGINEERING: "Trade",
  LOGISTICS_TRANSPORT: "Logistics",
  HOSPITALITY_TOURISM: "Hospitality",
  TELECOMMUNICATIONS: "Telecom",
  CREATIVE_MEDIA: "Creative",
  PUBLIC_SERVICE_SAFETY: "Public",
  MILITARY_DEFENCE: "Military",
  SPORT_FITNESS: "Sport",
  REAL_ESTATE_PROPERTY: "Property",
  SOCIAL_CARE_COMMUNITY: "Social Care",
  CONSTRUCTION_TRADES: "Construction",
};

interface PlacedDot {
  career: Career;
  ring: 0 | 1 | 2; // 0 = strong, 1 = good (ring 2 is legacy/unused)
  cx: number;
  cy: number;
  topMatch?: boolean; // First few overall matches — highlighted distinctly
  isActiveGoal?: boolean; // True when this dot is one of the user's active goals
  goalSlot?: "primary" | "secondary"; // Which slot, if isActiveGoal
}

const TOP_MATCH_COUNT = 3;

// Sized up from 320 to 440 when we expanded from 10 to 13 categories — slices
// went from 36° to ~27.7°, so each dot has less angular room. Bigger SVG
// keeps everything legible.
const SIZE = 440;
const CENTER = SIZE / 2;
// Two rings only — Strong (inner) and Good (outer). The legacy
// "Worth a look" outer band has been removed.
const RING_RADII = [95, 175];
// Padding around the SVG so category labels around the outer ring aren't clipped
const VIEWBOX_PAD = 40;
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.25;

// Band sizes scale with signal strength to avoid clutter.
// Weak signal → fewer dots so the radar isn't pretending to have
// matches it can't meaningfully rank. Strong signal → full picture.
function bandSizes(signalStrength: number): { strong: number; good: number; total: number } {
  // Always fetch a generous set (50). The actual display limit is
  // decided after fetching, based on how many categories the results
  // span (see dynamicLimit below).
  if (signalStrength <= 0.5) return { strong: 10, good: 25, total: 50 };
  if (signalStrength <= 1)   return { strong: 12, good: 28, total: 50 };
  if (signalStrength < 2.5)  return { strong: 14, good: 30, total: 50 };
  return                            { strong: 16, good: 32, total: 50 };
}

/**
 * Trim results based on category spread. If results are scattered
 * across many categories (5+), keep up to 50 so users see the full
 * breadth. If concentrated in fewer categories (<4), trim to 25 —
 * showing more would just be padding with weak matches.
 */
function dynamicLimit(careers: { id: string }[]): number {
  const cats = new Set<string>();
  for (const c of careers) {
    const cat = findCareerCategory(c.id);
    if (cat) cats.add(cat);
  }
  return cats.size >= 5 ? 50 : 25;
}

// Legacy constants kept for placeDots ring assignment
const STRONG_BAND_SIZE = 7;
const GOOD_BAND_SIZE = 13;

/**
 * Format a salary range like "450,000 - 700,000 kr/year" into a
 * short compact form: "450k - 700k" or "1.2M - 2M".
 */
function formatSalaryShort(raw?: string | null): string {
  if (!raw) return "—";
  return raw.replace(/\s*kr\/year.*/i, "").trim().replace(/[\d,]+/g, (m) => {
    const n = parseInt(m.replace(/,/g, ""), 10);
    if (isNaN(n)) return m;
    if (n >= 1_000_000) {
      const v = n / 1_000_000;
      return v % 1 === 0 ? `${v}M` : `${v.toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
    return String(n);
  });
}

/**
 * Build a 2-letter monogram from a career title for the Initials view.
 * Strips parens/slashes, takes the first letter of the first two words,
 * falls back to the first 2 letters if there's only one word.
 */
function careerInitials(title: string): string {
  const cleaned = title.replace(/[(){}\[\]\/]/g, " ").replace(/\s+/g, " ").trim();
  const words = cleaned.split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function placeDots(
  careers: Career[],
  primaryGoalId?: string | null,
  secondaryGoalId?: string | null,
  strongSize: number = STRONG_BAND_SIZE,
  totalSize: number = STRONG_BAND_SIZE + GOOD_BAND_SIZE,
): PlacedDot[] {
  if (careers.length === 0) return [];

  const visibleCareers = careers.slice(0, totalSize);

  // Bucket into 2 relevance rings by absolute rank position.
  const ringFor = (idx: number): 0 | 1 | 2 => {
    if (idx < strongSize) return 0;
    return 1;
  };

  // Pass 1: bucket by (ring, category) so we know how many dots will share
  // each slice cell before placing any of them.
  type Pre = { career: Career; ring: 0 | 1 | 2; idx: number };
  const buckets = new Map<string, Pre[]>();
  visibleCareers.forEach((career, idx) => {
    const cat = findCareerCategory(career.id);
    if (!cat) return;
    const ring = ringFor(idx);
    const key = `${ring}|${cat}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push({ career, ring, idx });
  });

  // Pass 2: distribute dots EVENLY across the usable width of their slice.
  // The previous fan-out math grew unbounded with bucket size and spilled
  // into adjacent slices (e.g. 5 Tech dots fanning to ±27° instead of ±14°).
  // Even distribution + a small slice-edge padding keeps every dot inside
  // its own category visually.
  const SLICE_WIDTH = 360 / CATEGORY_ORDER.length; // ~27.7° at 13 categories
  const SLICE_PADDING = 3; // degrees of margin from each edge (tighter at 13 slices)
  const placed: PlacedDot[] = [];

  for (const [key, group] of buckets.entries()) {
    const [ringStr, catStr] = key.split("|");
    const ring = parseInt(ringStr, 10) as 0 | 1 | 2;
    const sliceIdx = CATEGORY_ORDER.indexOf(catStr as CareerCategory);
    if (sliceIdx < 0) continue;
    const sliceStart = sliceIdx * SLICE_WIDTH + SLICE_PADDING;
    const sliceUsable = SLICE_WIDTH - SLICE_PADDING * 2;
    // Place each dot near the outer edge of its ring band, giving a bit of
    // breathing room from the next ring boundary.
    const baseR =
      ring === 0
        ? RING_RADII[0] - 22
        : RING_RADII[1] - 22;

    group.forEach((p, i) => {
      // Even distribution: single dot sits dead-centre; multiple dots span
      // the usable slice from start to end.
      const t = group.length === 1 ? 0.5 : i / (group.length - 1);
      const angleDeg = sliceStart + sliceUsable * t - 90;
      const angleRad = angleDeg * (Math.PI / 180);
      // For crowded slices, alternate a small radial offset so dots don't
      // collide visually even when angular spacing is tight. Threshold lowered
      // from 4 to 3 because thinner slices crowd faster.
      const r = group.length > 3 ? baseR + (i % 2 === 0 ? -5 : 5) : baseR;
      placed.push({
        career: p.career,
        ring,
        cx: CENTER + r * Math.cos(angleRad),
        cy: CENTER + r * Math.sin(angleRad),
        topMatch: p.idx < TOP_MATCH_COUNT,
        isActiveGoal:
          (!!primaryGoalId && p.career.id === primaryGoalId) ||
          (!!secondaryGoalId && p.career.id === secondaryGoalId),
        goalSlot:
          !!primaryGoalId && p.career.id === primaryGoalId
            ? "primary"
            : !!secondaryGoalId && p.career.id === secondaryGoalId
            ? "secondary"
            : undefined,
      });
    });
  }

  return placed;
}

export function CareerRadar({ preferences, onEditPreferences }: CareerRadarProps) {
  const compareShortlist = useCompareShortlist();
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Auto-save comparison when the modal opens with 2+ careers
  const openCompareAndSave = useCallback(() => {
    const list = compareShortlist.shortlist;
    if (list.length >= 2) {
      const { saveComparison } = require("@/components/career-radar/saved-comparisons-tray");
      saveComparison({
        id: crypto.randomUUID(),
        title: list.map((c: Career) => c.title).join(" vs "),
        careers: list.map((c: Career) => ({ id: c.id, title: c.title, emoji: c.emoji })),
        savedAt: Date.now(),
      });
    }
    setCompareModalOpen(true);
  }, [compareShortlist.shortlist]);

  // Load a saved comparison set into the shortlist
  const loadSavedComparison = useCallback((careers: { id: string; title: string; emoji: string }[]) => {
    const allCareers = getAllCareers();
    const resolved = careers
      .map((c) => allCareers.find((ac) => ac.id === c.id))
      .filter((c): c is Career => c !== undefined);
    if (resolved.length >= 2) {
      compareShortlist.loadSet(resolved);
      setCompareModalOpen(true);
    }
  }, [compareShortlist]);

  // Listen for "add to compare" events dispatched by the career detail sheet.
  // This intentionally only ADDS (doesn't toggle) — the detail sheet button
  // is labeled "Add to compare shortlist" and should never silently remove.
  useEffect(() => {
    const handler = (e: Event) => {
      const career = (e as CustomEvent<Career>).detail;
      if (!career) return;
      if (compareShortlist.isInShortlist(career.id)) {
        toast.info(`${career.title} is already in your shortlist`);
        return;
      }
      if (compareShortlist.shortlist.length >= compareShortlist.max) {
        toast.info(`You can compare up to ${compareShortlist.max} at a time`, {
          description: 'Remove one to add another.',
        });
        return;
      }
      compareShortlist.toggle(career);
      toast.success(`${career.title} added to shortlist`);
    };
    window.addEventListener("add-career-to-compare", handler);
    return () => window.removeEventListener("add-career-to-compare", handler);
  }, [compareShortlist]);
  const [hovered, setHovered] = useState<PlacedDot | null>(null);
  const [zoom, setZoom] = useState(1);
  // Multi-select tier filter — start with everything visible.
  // The active goal is always shown regardless of which tiers are toggled.
  type Tier = "top" | "strong" | "good";
  const ALL_TIERS: Tier[] = ["top", "strong", "good"];
  const [activeTiers, setActiveTiers] = useState<Set<Tier>>(new Set(ALL_TIERS));
  const [filterOpen, setFilterOpen] = useState(false);
  type SectorFilter = "all" | "public" | "private";
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>("all");
  const toggleTier = (t: Tier) => {
    setActiveTiers((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      // Don't allow zero tiers — re-add the one being removed
      if (next.size === 0) next.add(t);
      return next;
    });
    setCarouselIdx(0);
  };
  const allTiersOn = activeTiers.size === ALL_TIERS.length;
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [carouselIdx, setCarouselIdx] = useState(0);

  // Active goal — used to highlight the matching dot on the radar so the user
  // can see at a glance how their current journey relates to their wider
  // discovery preferences. Goals are stored by `title`, so we resolve to a
  // career id by case-insensitive title match against CAREER_PATHWAYS.
  const { data: goalsData } = useQuery<{
    primaryGoal: { title?: string | null } | null;
    secondaryGoal: { title?: string | null } | null;
  }>({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await fetch("/api/goals");
      if (!res.ok) return { primaryGoal: null, secondaryGoal: null };
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const resolveCareerIdByTitle = (title?: string | null) => {
    const t = title?.trim().toLowerCase();
    if (!t) return null;
    for (const list of Object.values(CAREER_PATHWAYS)) {
      const hit = list.find((c) => c.title.toLowerCase() === t);
      if (hit) return hit.id;
    }
    return null;
  };
  const primaryGoalCareerId = useMemo(
    () => resolveCareerIdByTitle(goalsData?.primaryGoal?.title),
    [goalsData?.primaryGoal?.title]
  );
  const secondaryGoalCareerId = useMemo(
    () => resolveCareerIdByTitle(goalsData?.secondaryGoal?.title),
    [goalsData?.secondaryGoal?.title]
  );

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
  const zoomReset = () => setZoom(1);

  const signalStrength = useMemo(() => measureSignalStrength(preferences), [preferences]);
  const bands = useMemo(() => bandSizes(signalStrength), [signalStrength]);

  const matched = useMemo(() => {
    if (!preferences) return [];
    const all = getCareersFromDiscovery(preferences, bands.total);
    // Trim based on category spread — keep more when results are diverse
    const limit = dynamicLimit(all);
    return all.slice(0, limit);
  }, [preferences, bands.total]);

  const dots = useMemo(
    () => placeDots(matched, primaryGoalCareerId, secondaryGoalCareerId, bands.strong, matched.length),
    [matched, primaryGoalCareerId, secondaryGoalCareerId, bands.strong]
  );

  // Filter applied to both the radar dots and the matches report list.
  // The active goal is always shown regardless of which tiers are toggled,
  // so the user never loses sight of their current journey target.
  const visibleDots = useMemo(() => {
    const tierOf = (d: PlacedDot): Tier => {
      if (d.topMatch) return "top";
      if (d.ring === 0) return "strong";
      return "good";
    };
    return dots.filter((d) => {
      if (d.isActiveGoal) return true;
      if (!allTiersOn && !activeTiers.has(tierOf(d))) return false;
      if (sectorFilter !== "all") {
        const s = getSectorForCareer(d.career.id);
        if (s !== sectorFilter && s !== "mixed") return false;
      }
      return true;
    });
  }, [dots, activeTiers, allTiersOn, sectorFilter]);

  const hasPrefs =
    !!preferences &&
    ((preferences.subjects && preferences.subjects.length > 0) ||
      (preferences.workStyles && preferences.workStyles.length > 0) ||
      !!preferences.peoplePref);

  // Empty state — no preferences yet
  if (!hasPrefs) {
    return (
      <div className="relative rounded-2xl border-2 border-dashed border-teal-500/30 bg-gradient-to-br from-teal-500/5 via-transparent to-pink-500/5 p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-500/10 mb-3">
          <Sparkles className="h-6 w-6 text-teal-500" />
        </div>
        <h3 className="text-sm font-semibold mb-1">Your Career Radar is empty</h3>
        <p className="text-xs text-muted-foreground mb-3 max-w-sm mx-auto">
          Tell us what subjects you enjoy and how you like to work &mdash; we&apos;ll
          map careers across every path so you can find your first Primary Goal.
        </p>
        <Button
          size="sm"
          onClick={onEditPreferences}
          className="bg-teal-600 hover:bg-teal-700"
          data-spotlight="radar-cta"
        >
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Start Discovery
        </Button>
      </div>
    );
  }

  // No matches state — preferences exist but produced nothing
  if (dots.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm font-medium mb-1">No matches yet</p>
        <p className="text-xs text-muted-foreground mb-3">
          Try selecting a few more subjects or work styles.
        </p>
        <Button size="sm" variant="outline" onClick={onEditPreferences}>
          <Settings2 className="h-3.5 w-3.5 mr-1.5" />
          Edit preferences
        </Button>
      </div>
    );
  }

  return (
    <>
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Primary Goal indicator — always visible when a goal is set */}
      {goalsData?.primaryGoal?.title && (
        <Link
          href="/my-journey"
          className="flex items-center gap-2 px-4 py-2 border-b border-border/30 bg-amber-500/[0.04] hover:bg-amber-500/[0.08] transition-colors group"
          title="Go to My Journey to explore this career in depth"
        >
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full border-[1.5px] border-amber-400/60 shrink-0">
            <Star className="h-2.5 w-2.5 text-amber-400" />
          </span>
          <span className="text-[11px] text-amber-400/80">Primary Goal:</span>
          <span className="text-[11px] font-medium text-teal-300">{goalsData.primaryGoal.title}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-amber-400 transition-colors ml-auto shrink-0" />
        </Link>
      )}

      <div className="flex items-center justify-between px-4 py-3 border-b flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground">
            {visibleDots.length} of {dots.length} match{dots.length !== 1 ? "es" : ""}
          </span>
          {/* Tier filter — multi-select dropdown.
              Drives both the radar and the matches report.
              The active goal is always shown regardless of selection. */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className={cn(
                "h-7 px-2.5 rounded-md border bg-background text-[10px] flex items-center gap-1.5 transition-colors",
                allTiersOn
                  ? "text-muted-foreground hover:bg-muted"
                  : "bg-teal-500/15 text-teal-600 dark:text-teal-400 font-semibold border-teal-500/30"
              )}
              aria-haspopup="true"
              aria-expanded={filterOpen}
            >
              <Settings2 className="h-3 w-3" />
              {allTiersOn
                ? "Show all"
                : activeTiers.size === 1
                ? `Only ${
                    activeTiers.has("top")
                      ? "Top"
                      : activeTiers.has("strong")
                      ? "Strong"
                      : "Good"
                  }`
                : `${activeTiers.size} tiers`}
              <ChevronDown className="h-3 w-3" />
            </button>
            {filterOpen && (
              <>
                {/* Click-away */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setFilterOpen(false)}
                />
                <div className="absolute right-0 mt-1 z-50 w-44 rounded-lg border bg-popover shadow-lg p-1.5 text-[11px]">
                  <p className="px-2 pt-1 pb-1.5 text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">
                    Show on radar
                  </p>
                  {([
                    { id: "top", label: "Top match", swatch: "bg-pink-400" },
                    { id: "strong", label: "Strong", swatch: "bg-teal-500" },
                    { id: "good", label: "Good", swatch: "bg-sky-400" },
                  ] as const).map((opt) => {
                    const checked = activeTiers.has(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleTier(opt.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors text-left"
                      >
                        <span
                          className={cn(
                            "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors",
                            checked
                              ? "bg-teal-500 border-teal-500"
                              : "border-border"
                          )}
                        >
                          {checked && (
                            <svg
                              viewBox="0 0 12 12"
                              className="w-2.5 h-2.5 text-white"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="2 6 5 9 10 3" />
                            </svg>
                          )}
                        </span>
                        <span className={cn("inline-block w-2 h-2 rounded-full shrink-0", opt.swatch)} />
                        <span className="flex-1">{opt.label}</span>
                      </button>
                    );
                  })}
                  <div className="border-t mt-1 pt-1 px-2 pb-0.5 text-[9px] text-muted-foreground">
                    Your Primary Goal is always shown.
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Sector filter */}
          <select
            value={sectorFilter}
            onChange={(e) => { setSectorFilter(e.target.value as SectorFilter); setCarouselIdx(0); }}
            className="h-7 px-2 rounded-md border bg-background text-[10px]"
            title="Filter by public or private sector"
          >
            <option value="all">All Sectors</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <div className="flex items-center rounded-md border bg-background">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN}
              className="h-7 w-7 flex items-center justify-center hover:bg-muted rounded-l-md disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={zoomReset}
              className="h-7 px-1.5 text-[10px] tabular-nums hover:bg-muted border-x"
              aria-label="Reset zoom"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX}
              className="h-7 w-7 flex items-center justify-center hover:bg-muted rounded-r-md disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-[11px]"
            onClick={onEditPreferences}
            data-spotlight="radar-cta"
          >
            <Settings2 className="h-3 w-3 mr-1" />
            What I like
          </Button>
        </div>
      </div>

      <div className="relative flex justify-center p-2 sm:p-4 overflow-hidden">
        <svg
          // Responsive: scale to container width on mobile, fall back to the
          // intrinsic 440px size on desktop. Zoom multiplies max-width so the
          // zoom buttons still work without overflowing on small screens.
          viewBox={`${-VIEWBOX_PAD} ${-VIEWBOX_PAD} ${SIZE + VIEWBOX_PAD * 2} ${SIZE + VIEWBOX_PAD * 2}`}
          style={{ maxWidth: `${(SIZE + VIEWBOX_PAD * 2) * zoom}px` }}
          className="w-full h-auto transition-[max-width] duration-200"
          role="img"
          aria-label="Career radar visualisation"
        >
          {/* Radial gradient for the rotating sweep cone — fades teal to
              transparent so the leading edge is bright and the trail dies. */}
          <defs>
            <linearGradient id="radar-sweep-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(45, 212, 191, 0)" />
              <stop offset="70%" stopColor="rgba(45, 212, 191, 0.18)" />
              <stop offset="100%" stopColor="rgba(45, 212, 191, 0.45)" />
            </linearGradient>
          </defs>

          {/* Concentric ring bands */}
          {RING_RADII.map((r, i) => (
            <circle
              key={r}
              cx={CENTER}
              cy={CENTER}
              r={r}
              fill="none"
              className="stroke-teal-500/20"
              strokeWidth={1}
              strokeDasharray={i === RING_RADII.length - 1 ? "0" : "2 4"}
            />
          ))}

          {/* Rotating radar sweep — one full revolution every 20s. The cone
              is a 35° sector at the top of the radar (angle 0 = up, swept
              clockwise). The whole <g> rotates around CENTER via CSS, so
              the leading bright edge passes each slice in turn. */}
          {(() => {
            const sweepDeg = 35;
            const r = RING_RADII[RING_RADII.length - 1];
            // Sector from -sweepDeg to 0, oriented "up" (-90° in SVG terms).
            const a1 = ((-90 - sweepDeg) * Math.PI) / 180;
            const a2 = (-90 * Math.PI) / 180;
            const x1 = CENTER + r * Math.cos(a1);
            const y1 = CENTER + r * Math.sin(a1);
            const x2 = CENTER + r * Math.cos(a2);
            const y2 = CENTER + r * Math.sin(a2);
            const d = `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
            return (
              <g
                className="motion-safe:animate-[radar-sweep_20s_linear_infinite] pointer-events-none"
                style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
              >
                <path d={d} fill="url(#radar-sweep-gradient)" />
                {/* Leading bright edge — a thin line right at the front of the cone */}
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={x2}
                  y2={y2}
                  className="stroke-teal-400/70"
                  strokeWidth={1.25}
                />
              </g>
            );
          })()}

          {/* Slice dividers — very faint */}
          {CATEGORY_ORDER.map((_, i) => {
            const angle = (i * (360 / CATEGORY_ORDER.length) - 90) * (Math.PI / 180);
            const x2 = CENTER + RING_RADII[RING_RADII.length - 1] * Math.cos(angle);
            const y2 = CENTER + RING_RADII[RING_RADII.length - 1] * Math.sin(angle);
            return (
              <line
                key={i}
                x1={CENTER}
                y1={CENTER}
                x2={x2}
                y2={y2}
                className="stroke-teal-500/10"
                strokeWidth={1}
              />
            );
          })}

          {/* Category labels around the outer ring — anchor per side so they don't clip */}
          {CATEGORY_ORDER.map((cat, i) => {
            const sliceWidth = 360 / CATEGORY_ORDER.length;
            const angleDeg = i * sliceWidth + sliceWidth / 2 - 90;
            const angle = angleDeg * (Math.PI / 180);
            const labelR = RING_RADII[RING_RADII.length - 1] + 14;
            const x = CENTER + labelR * Math.cos(angle);
            const y = CENTER + labelR * Math.sin(angle);
            // Pick text-anchor based on horizontal position so labels grow
            // outward from the radar instead of being centred (which clips at edges).
            const dx = x - CENTER;
            const anchor = Math.abs(dx) < 8 ? "middle" : dx > 0 ? "start" : "end";
            return (
              <text
                key={cat}
                x={x}
                y={y}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 9 }}
              >
                {CATEGORY_LABEL[cat]}
              </text>
            );
          })}

          {/* Dots — staggered fade/scale-in from centre */}
          {visibleDots.map((d, idx) => (
            <g
              key={d.career.id}
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered((cur) => (cur?.career.id === d.career.id ? null : cur))}
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("open-career-detail", { detail: d.career })
                );
              }}
              className="cursor-pointer radar-dot"
              style={{
                transformOrigin: `${d.cx}px ${d.cy}px`,
                animationDelay: `${d.ring * 120 + idx * 22}ms`,
              }}
            >
              {/* Invisible hit-area so the click target is always solid,
                  even in "rings" mode where the visible circle has fill="none"
                  and only the 2px stroke can intercept pointer events. */}
              <circle
                cx={d.cx}
                cy={d.cy}
                r={12}
                fill="transparent"
                pointerEvents="all"
              />
              {/* Top match halo: faint pulsing ring behind top markers */}
              {d.topMatch && (
                <circle
                  cx={d.cx}
                  cy={d.cy}
                  r={11}
                  fill="none"
                  className="stroke-pink-400/70 radar-top-halo pointer-events-none"
                  strokeWidth={1.25}
                />
              )}
              {/* Active goal halo + star — distinct gold ring so the user
                  can see at a glance which dot is their current journey
                  target. Sits above the top-match halo if both apply. */}
              {d.isActiveGoal && (
                <>
                  <circle
                    cx={d.cx}
                    cy={d.cy}
                    r={15}
                    fill="none"
                    className="stroke-amber-400 pointer-events-none drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]"
                    strokeWidth={1.75}
                  />
                  <text
                    x={d.cx + 11}
                    y={d.cy - 10}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ fontSize: 9 }}
                    className="fill-amber-400 pointer-events-none select-none font-bold"
                  >
                    ★
                  </text>
                </>
              )}
              <circle
                cx={d.cx}
                cy={d.cy}
                r={3}
                className={cn(
                  "transition-all duration-150 radar-dot-circle",
                  d.topMatch
                    ? "fill-pink-400 drop-shadow-[0_0_4px_rgba(244,114,182,0.7)]"
                    : d.ring === 0
                    ? "fill-teal-500 group-hover:fill-teal-400"
                    : d.ring === 1
                    ? "fill-sky-400/70 group-hover:fill-sky-300"
                    : "fill-amber-400/70 group-hover:fill-amber-300"
                )}
              />
            </g>
          ))}
        </svg>

        <style>{`
          @keyframes radar-dot-pop {
            0%   { opacity: 0; transform: scale(0); }
            70%  { opacity: 1; transform: scale(1.25); }
            100% { opacity: 1; transform: scale(1); }
          }
          .radar-dot {
            animation: radar-dot-pop 0.45s cubic-bezier(0.34, 1.4, 0.64, 1) backwards;
          }
          .radar-dot:hover .radar-dot-circle {
            r: 8;
            filter: drop-shadow(0 0 6px rgb(20 184 166 / 0.6));
          }
          @keyframes radar-top-halo-pulse {
            0%, 100% { opacity: 0.55; transform: scale(1); transform-box: fill-box; transform-origin: center; }
            50%      { opacity: 1;    transform: scale(1.15); transform-box: fill-box; transform-origin: center; }
          }
          .radar-top-halo {
            animation: radar-top-halo-pulse 2.4s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          @media (prefers-reduced-motion: reduce) {
            .radar-dot { animation: none; }
            .radar-top-halo { animation: none; }
          }
        `}</style>

        {/* Hover tooltip — career name + "matched on" reasons so the user
            understands why this dot landed where it did. Closes the loop
            between the discovery quiz answers and the visual. */}
        {hovered && (() => {
          const reasons = getMatchReasons(hovered.career, preferences ?? null).slice(0, 4);
          return (
            <div
              className="absolute pointer-events-none px-2.5 py-1.5 rounded-md bg-popover border shadow-md text-[11px] max-w-[220px]"
              style={{
                left: `calc(50% + ${hovered.cx - CENTER}px)`,
                top: `calc(50% + ${hovered.cy - CENTER + 16}px)`,
                transform: "translate(-50%, 0)",
              }}
            >
              <div className="font-medium flex items-center gap-1">
                <span>{hovered.career.emoji}</span>
                <span>{hovered.career.title}</span>
                {hovered.isActiveGoal && (
                  <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400 shrink-0" />
                )}
              </div>
              {reasons.length > 0 && (
                <div className="mt-1 pt-1 border-t border-border/60 text-[10px] text-muted-foreground">
                  <span className="text-foreground/70">Matched on:</span>{" "}
                  {reasons.join(" · ")}
                </div>
              )}
              {hovered.isActiveGoal && (
                <div className="mt-1 text-[10px] text-amber-500 font-medium">
                  {hovered.goalSlot === "secondary"
                    ? "Your Secondary Goal"
                    : "Your Primary Goal"}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Legend — mirrors the bands used by the Matches Report below.
          Top match → halo'd dots, Strong → inner ring, Good → outer ring. */}
      <div className="px-4 py-2 border-t flex items-center justify-between flex-wrap gap-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_4px_rgba(244,114,182,0.7)]" />
            Top match
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-500" />
            Strong
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-sky-400" />
            Good
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full border-[1.5px] border-amber-400" />
            Primary Goal
          </span>
        </div>
        <span>Inner ring = strongest match</span>
      </div>

      {/* ── Preference coaching tip ──────────────────────────────── */}
      <RadarCoachTip preferences={preferences} onEditPreferences={onEditPreferences} />

    </div>

    {/* ─── Matches Report — separate card, carousel of bands with filter ─── */}
    <div className="mt-4 rounded-2xl border bg-card overflow-hidden">
      {/* Header — title on the left, Compare Vault on the right */}
      <div className="px-4 py-3 border-b flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">Matches Report</h3>
          <p className="text-[11px] text-muted-foreground">
            {visibleDots.length} of {dots.length} careers shown
          </p>
        </div>
        <CompareVault
          shortlist={compareShortlist.shortlist}
          max={compareShortlist.max}
          onCompare={openCompareAndSave}
          onClear={compareShortlist.clear}
          onRemove={compareShortlist.remove}
        />
      </div>

      {/* Build bands from the *filtered* dots so the carousel reflects the filter */}
      {(() => {
        const bands = ([0, 1] as const)
          .map((ring) => {
            const ringDots = visibleDots.filter((d) => d.ring === ring);
            if (ringDots.length === 0) return null;
            return {
              ring,
              label: ring === 0 ? "Strong match" : "Good match",
              accent:
                ring === 0
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-sky-500 dark:text-sky-400",
              dots: ringDots,
            };
          })
          .filter((b): b is NonNullable<typeof b> => b !== null);

        if (bands.length === 0) {
          return (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              No careers match this filter.
            </div>
          );
        }

        const safeIdx = Math.min(carouselIdx, bands.length - 1);
        const goTo = (i: number) => {
          const el = carouselRef.current;
          if (!el) return;
          const clamped = Math.max(0, Math.min(i, bands.length - 1));
          // Scroll by slide width (each slide is 100% of container width)
          el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
          setCarouselIdx(clamped);
        };
        const handleScroll = () => {
          const el = carouselRef.current;
          if (!el) return;
          const slideWidth = el.clientWidth;
          const idx = Math.round(el.scrollLeft / slideWidth);
          if (idx !== carouselIdx) setCarouselIdx(idx);
        };

        return (
          <div>
            {/* Carousel sub-header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-baseline gap-2">
                <p className={cn("text-[11px] font-semibold uppercase tracking-wide", bands[safeIdx]?.accent)}>
                  {bands[safeIdx]?.label}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  {bands[safeIdx]?.dots.length}{" "}
                  {bands[safeIdx]?.dots.length === 1 ? "career" : "careers"}
                </span>
              </div>
              {bands.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => goTo(Math.max(0, safeIdx - 1))}
                    disabled={safeIdx === 0}
                    className="h-6 w-6 flex items-center justify-center rounded-md border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous band"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(Math.min(bands.length - 1, safeIdx + 1))}
                    disabled={safeIdx >= bands.length - 1}
                    className="h-6 w-6 flex items-center justify-center rounded-md border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next band"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Scroll-snap carousel of bands */}
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: "none" }}
            >
              {bands.map((band) => (
                <div key={band.ring} className="snap-start shrink-0 w-full px-4 pb-3">
                  <div className="rounded-lg border bg-background overflow-hidden">
                    {/* Cap the table to a compact height — roughly 5 rows
                        of body content. Anything beyond that scrolls
                        inside the card so the radar page stays compact. */}
                    <div className="max-h-[200px] overflow-y-auto">
                    <table className="w-full text-xs relative" style={{ borderCollapse: "collapse" }}>
                      <thead className="sticky top-0 z-[5] bg-muted">
                        <tr className="border-b border-border/40 bg-muted">
                          <th className="text-left px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">Career</th>
                          <th className="hidden sm:table-cell text-left px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">Salary</th>
                          <th className="text-left px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">Growth</th>
                          <th className="hidden md:table-cell text-left px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">Education path</th>
                          <th className="px-2 py-1.5 w-10 text-center bg-teal-500/[0.08] border-l border-teal-500/20">
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal-300" title="Tap + on any 2–3 careers to compare them side by side. See how they stack up across day-to-day, training time, fit, and more.">
                              <Plus className="h-2.5 w-2.5" strokeWidth={3} />
                              Add
                              <HelpCircle className="h-2.5 w-2.5 text-teal-400/60" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {band.dots.map((d) => {
                          const growth = d.career.growthOutlook;
                          const growthClass =
                            growth === "high"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                              : growth === "medium"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25"
                              : "bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/25";
                          return (
                            <tr
                              key={d.career.id}
                              onClick={() => {
                                window.dispatchEvent(
                                  new CustomEvent("open-career-detail", {
                                    detail: d.career,
                                  })
                                );
                              }}
                              className={cn(
                                "cursor-pointer hover:bg-muted/30 transition-colors",
                                d.topMatch && "bg-pink-500/[0.06]"
                              )}
                            >
                              <td className="px-3 py-1 align-middle">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-sm leading-none shrink-0">{d.career.emoji}</span>
                                  <span className="text-foreground font-medium truncate">{d.career.title}</span>
                                  {d.topMatch && (
                                    <span className="text-[8px] font-bold uppercase tracking-wide text-pink-500 shrink-0">
                                      Top
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="hidden sm:table-cell px-3 py-1 align-middle text-foreground/70 whitespace-nowrap">
                                {formatSalaryShort(d.career.avgSalary)}
                              </td>
                              <td className="px-3 py-1 align-middle">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
                                    growthClass
                                  )}
                                  title={`Growth outlook: ${growth}`}
                                >
                                  <span
                                    className={cn(
                                      "inline-block w-1.5 h-1.5 rounded-full",
                                      growth === "high"
                                        ? "bg-emerald-500"
                                        : growth === "medium"
                                        ? "bg-amber-500"
                                        : "bg-blue-400"
                                    )}
                                  />
                                  {growth}
                                </span>
                              </td>
                              <td
                                className="hidden md:table-cell px-3 py-1 align-middle text-foreground/65 max-w-[280px] truncate"
                                title={d.career.educationPath}
                              >
                                {d.career.educationPath}
                              </td>
                              <td className="px-2 py-1 align-middle text-center bg-teal-500/[0.04] border-l border-teal-500/15">
                                {(() => {
                                  const inList = compareShortlist.isInShortlist(d.career.id);
                                  return (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        compareShortlist.toggle(d.career);
                                      }}
                                      className={cn(
                                        "inline-flex items-center justify-center h-5 w-5 rounded border transition-all",
                                        inList
                                          ? "bg-teal-500/25 border-teal-500/60 text-teal-200 hover:bg-teal-500/35"
                                          : "border-teal-500/30 text-teal-400/70 hover:border-teal-500/60 hover:text-teal-300 hover:bg-teal-500/15"
                                      )}
                                      aria-label={inList ? `Remove ${d.career.title} from compare` : `Add ${d.career.title} to compare`}
                                      title={inList ? "Remove from compare" : "Add to compare — pick 2 or 3 careers, then tap Compare"}
                                    >
                                      {inList ? <Check className="h-3 w-3" strokeWidth={3} /> : <Plus className="h-3 w-3" strokeWidth={2.5} />}
                                    </button>
                                  );
                                })()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dot indicators */}
            {bands.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 pb-3">
                {bands.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === safeIdx
                        ? "w-6 bg-teal-500"
                        : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>

    {/* Compare modal */}
    <CompareModal
      open={compareModalOpen}
      careers={compareShortlist.shortlist}
      preferences={preferences}
      onClose={() => setCompareModalOpen(false)}
      onRemove={compareShortlist.remove}
    />

    {/* Saved comparisons edge tray */}
    <SavedComparisonsTray onLoadComparison={loadSavedComparison} />
  </>
  );
}

// ── Compare Vault ───────────────────────────────────────────────────
//
// Inline "compare bucket" that lives in the Matches Report header.
// Always visible — empty state shows the cap (0/3), filled state shows
// the picked careers + a Compare CTA. Clicking a chip removes it.

function CompareVault({
  shortlist,
  max,
  onCompare,
  onClear,
  onRemove,
}: {
  shortlist: import("@/lib/career-pathways").Career[];
  max: number;
  onCompare: () => void;
  onClear: () => void;
  onRemove: (id: string) => void;
}) {
  const isEmpty = shortlist.length === 0;
  const canCompare = shortlist.length >= 2;

  return (
    <div
      className={cn(
        "shrink-0 rounded-xl border px-3 py-2.5 transition-all",
        isEmpty
          ? "border-dashed border-border/50 bg-background/40"
          : "border-border/60 bg-background/60"
      )}
    >
      <div className="flex items-center gap-2.5">
        {/* Label */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-muted-foreground/70">
            Shortlist
          </span>
          <span className={cn(
            "text-[10px] font-medium leading-tight mt-0.5 tabular-nums",
            isEmpty ? "text-muted-foreground/50" : "text-foreground/85"
          )}>
            {shortlist.length} of {max}
          </span>
        </div>

        {/* Slot indicators / chips — each with always-visible X */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: max }).map((_, i) => {
            const career = shortlist[i];
            if (career) {
              return (
                <div
                  key={career.id}
                  className="relative h-8 w-8 rounded-full bg-muted/40 ring-1 ring-border/60 flex items-center justify-center transition-transform hover:scale-110"
                  title={career.title}
                >
                  <span className="text-base">{career.emoji}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(career.id)}
                    title={`Remove ${career.title}`}
                    aria-label={`Remove ${career.title}`}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 hover:bg-rose-400 text-white flex items-center justify-center shadow-md ring-2 ring-background transition-all hover:scale-125"
                  >
                    <X className="h-2.5 w-2.5" strokeWidth={3} />
                  </button>
                </div>
              );
            }
            return (
              <span
                key={`empty-${i}`}
                className="h-8 w-8 rounded-full border-2 border-dashed border-border/50 flex items-center justify-center"
                title="Empty slot"
              >
                <Plus className="h-3 w-3 text-muted-foreground/40" />
              </span>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 ml-1">
          <button
            type="button"
            onClick={onCompare}
            disabled={!canCompare}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-colors",
              canCompare
                ? "bg-teal-500 text-white hover:bg-teal-400"
                : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
            )}
            title={
              canCompare
                ? "Open compare view"
                : shortlist.length === 0
                  ? "Tap + on careers below to add them"
                  : "Add at least 2 careers to compare"
            }
          >
            Compare
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          {!isEmpty && (
            <button
              type="button"
              onClick={onClear}
              className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted/30 transition-colors"
              aria-label="Clear all"
              title="Clear all"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

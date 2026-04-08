"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  CAREER_PATHWAYS,
  findCareerCategory,
  getAllCareers,
  getCareersFromDiscovery,
  type Career,
  type CareerCategory,
  type DiscoveryPreferences,
} from "@/lib/career-pathways";
import { Sparkles, Settings2, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  "TECHNOLOGY_IT",
  "BUSINESS_MANAGEMENT",
  "FINANCE_BANKING",
  "SALES_MARKETING",
  "CREATIVE_MEDIA",
  "MANUFACTURING_ENGINEERING",
  "LOGISTICS_TRANSPORT",
  "HOSPITALITY_TOURISM",
  "TELECOMMUNICATIONS",
];

// Human-readable labels for the discovery preference IDs (which are stored
// as kebab-case keys). Keep in sync with discovery-quiz-dialog.tsx.
const SUBJECT_LABELS: Record<string, string> = {
  biology: "Biology",
  chemistry: "Chemistry",
  physics: "Physics",
  math: "Math",
  computing: "Computing",
  english: "English",
  history: "History",
  geography: "Geography",
  art: "Art",
  music: "Music",
  pe: "PE",
  business: "Business",
  languages: "Languages",
  psychology: "Psychology",
  "design-tech": "Design & Tech",
  "health-social": "Health & Social",
  drama: "Drama",
  "food-tech": "Food Tech",
  "media-studies": "Media Studies",
};

const WORK_STYLE_LABELS: Record<string, string> = {
  "hands-on": "Hands-on",
  desk: "At a desk",
  outdoors: "Outdoors",
  creative: "Creative",
  mixed: "A mix",
};

const PEOPLE_LABELS: Record<string, string> = {
  "with-people": "With people",
  mixed: "A bit of both",
  "mostly-alone": "Mostly alone",
};

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
  SPORT_FITNESS: "Sport",
};

interface PlacedDot {
  career: Career;
  ring: 0 | 1 | 2; // 0 = strongest, 2 = worth a look
  cx: number;
  cy: number;
  topMatch?: boolean; // First few overall matches — highlighted distinctly
}

const TOP_MATCH_COUNT = 3;

// Sized up from 320 to 440 when we expanded from 10 to 13 categories — slices
// went from 36° to ~27.7°, so each dot has less angular room. Bigger SVG
// keeps everything legible.
const SIZE = 440;
const CENTER = SIZE / 2;
const RING_RADII = [85, 155, 210]; // outer edge of each ring band
// Padding around the SVG so category labels around the outer ring aren't clipped
const VIEWBOX_PAD = 40;
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.25;

function placeDots(careers: Career[]): PlacedDot[] {
  if (careers.length === 0) return [];

  // Bucket into 3 relevance rings by rank position.
  const total = careers.length;
  const ringFor = (idx: number): 0 | 1 | 2 => {
    const ratio = idx / Math.max(1, total);
    if (ratio < 0.33) return 0;
    if (ratio < 0.66) return 1;
    return 2;
  };

  // Pass 1: bucket by (ring, category) so we know how many dots will share
  // each slice cell before placing any of them.
  type Pre = { career: Career; ring: 0 | 1 | 2; idx: number };
  const buckets = new Map<string, Pre[]>();
  careers.forEach((career, idx) => {
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
        : ring === 1
        ? RING_RADII[1] - 22
        : RING_RADII[2] - 18;

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
      });
    });
  }

  return placed;
}

export function CareerRadar({ preferences, onEditPreferences }: CareerRadarProps) {
  const [hovered, setHovered] = useState<PlacedDot | null>(null);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<"dots" | "rings" | "emoji">("dots");
  const [filterMode, setFilterMode] = useState<"all" | "strong" | "top">("all");
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [carouselIdx, setCarouselIdx] = useState(0);

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
  const zoomReset = () => setZoom(1);

  const matched = useMemo(() => {
    if (!preferences) return [];
    return getCareersFromDiscovery(preferences, 30);
  }, [preferences]);

  const dots = useMemo(() => placeDots(matched), [matched]);

  // Filter applied to both the radar dots and the matches report list.
  // "top only" mode also re-spaces the dots so they don't bunch on top of
  // each other, since with only ~3 dots there's plenty of empty radar.
  const visibleDots = useMemo(() => {
    if (filterMode === "strong") return dots.filter((d) => d.ring === 0);
    if (filterMode === "top") {
      const topDots = dots.filter((d) => d.topMatch);
      if (topDots.length === 0) return topDots;

      // Spread top dots within their OWN category slice — never push them
      // across slice boundaries. Each slice is 36° wide; we leave a small
      // padding from the edges so dots don't sit right on the divider line.
      // Two radii (inner / outer) are used so even when 2+ dots share the
      // same slice they get a tiny radial offset for extra clarity.
      const TOP_RADIUS_INNER = 80;
      const TOP_RADIUS_OUTER = 110;
      const SLICE_WIDTH = 360 / CATEGORY_ORDER.length;
      const SLICE_PADDING = 6; // degrees of margin from each slice edge

      // Bucket top dots by category
      const byCategory = new Map<CareerCategory, PlacedDot[]>();
      for (const d of topDots) {
        const cat = findCareerCategory(d.career.id);
        if (!cat) continue;
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        byCategory.get(cat)!.push(d);
      }

      const result: PlacedDot[] = [];
      for (const [cat, ringDots] of byCategory.entries()) {
        const sliceIdx = CATEGORY_ORDER.indexOf(cat);
        if (sliceIdx < 0) continue;
        const sliceStart = sliceIdx * SLICE_WIDTH + SLICE_PADDING;
        const sliceUsable = SLICE_WIDTH - SLICE_PADDING * 2;

        ringDots.forEach((d, i) => {
          // Distribute angles evenly across the usable slice width
          const t = ringDots.length === 1 ? 0.5 : i / (ringDots.length - 1);
          const angleDeg = sliceStart + sliceUsable * t - 90; // -90 so 0 is top
          const rad = angleDeg * (Math.PI / 180);
          // Alternate inner / outer radius so adjacent dots have visual gap
          const r = i % 2 === 0 ? TOP_RADIUS_INNER : TOP_RADIUS_OUTER;
          result.push({
            ...d,
            cx: CENTER + r * Math.cos(rad),
            cy: CENTER + r * Math.sin(rad),
          });
        });
      }
      return result;
    }
    return dots;
  }, [dots, filterMode]);

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
          Tell us what subjects you enjoy and how you like to work — we&apos;ll
          map careers across every path, including ones you&apos;ve never heard of.
        </p>
        <Button
          size="sm"
          onClick={onEditPreferences}
          className="bg-teal-600 hover:bg-teal-700"
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
      <div className="flex items-center justify-between px-4 py-3 border-b flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground">
            {visibleDots.length} of {dots.length} match{dots.length !== 1 ? "es" : ""}
          </span>
          {/* View mode toggle */}
          <div className="flex items-center rounded-md border bg-background text-[10px]">
            {(["dots", "rings", "emoji"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                className={cn(
                  "h-7 px-2 capitalize transition-colors first:rounded-l-md last:rounded-r-md",
                  viewMode === m
                    ? "bg-teal-500/15 text-teal-600 dark:text-teal-400 font-semibold"
                    : "hover:bg-muted text-muted-foreground"
                )}
                aria-pressed={viewMode === m}
              >
                {m}
              </button>
            ))}
          </div>
          {/* Filter toggle — drives both the radar and the matches report */}
          <div className="flex items-center rounded-md border bg-background text-[10px]">
            {([
              { id: "all", label: "All" },
              { id: "strong", label: "Strong" },
              { id: "top", label: "Top only" },
            ] as const).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setFilterMode(opt.id);
                  setCarouselIdx(0);
                }}
                className={cn(
                  "h-7 px-2 transition-colors first:rounded-l-md last:rounded-r-md",
                  filterMode === opt.id
                    ? "bg-teal-500/15 text-teal-600 dark:text-teal-400 font-semibold"
                    : "hover:bg-muted text-muted-foreground"
                )}
                aria-pressed={filterMode === opt.id}
              >
                {opt.label}
              </button>
            ))}
          </div>
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
          >
            <Settings2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      {/* "Based on" strip — shows the discovery inputs that produced this radar */}
      {preferences && (
        <div className="px-4 py-2 border-b bg-muted/20 flex items-start gap-2 flex-wrap">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5 shrink-0">
            Based on
          </span>
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {(preferences.subjects || []).map((s) => (
              <span
                key={`s-${s}`}
                className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border"
              >
                {SUBJECT_LABELS[s] || s}
              </span>
            ))}
            {(preferences.workStyles || []).map((w) => (
              <span
                key={`w-${w}`}
                className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border"
              >
                {WORK_STYLE_LABELS[w] || w}
              </span>
            ))}
            {preferences.peoplePref && (
              <span
                className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border"
              >
                {PEOPLE_LABELS[preferences.peoplePref] || preferences.peoplePref}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="relative flex justify-center p-4 overflow-auto">
        <svg
          width={(SIZE + VIEWBOX_PAD * 2) * zoom}
          height={(SIZE + VIEWBOX_PAD * 2) * zoom}
          viewBox={`${-VIEWBOX_PAD} ${-VIEWBOX_PAD} ${SIZE + VIEWBOX_PAD * 2} ${SIZE + VIEWBOX_PAD * 2}`}
          className="max-w-full h-auto transition-[width,height] duration-200"
          role="img"
          aria-label="Career radar visualisation"
        >
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
              {/* Top match halo: faint pulsing ring behind top markers */}
              {d.topMatch && (
                <circle
                  cx={d.cx}
                  cy={d.cy}
                  r={viewMode === "emoji" ? 13 : 11}
                  fill="none"
                  className="stroke-pink-400/70 radar-top-halo"
                  strokeWidth={1.25}
                />
              )}
              {viewMode === "dots" && (
                <circle
                  cx={d.cx}
                  cy={d.cy}
                  r={3}
                  className={cn(
                    "transition-all duration-150 radar-dot-circle",
                    d.topMatch
                      ? "fill-pink-400 drop-shadow-[0_0_4px_rgba(244,114,182,0.7)]"
                      : "fill-teal-500 group-hover:fill-teal-400"
                  )}
                />
              )}
              {viewMode === "rings" && (
                <circle
                  cx={d.cx}
                  cy={d.cy}
                  r={6}
                  fill="none"
                  strokeWidth={2}
                  className={cn(
                    "transition-all duration-150 radar-dot-circle",
                    d.topMatch
                      ? "stroke-pink-400 drop-shadow-[0_0_4px_rgba(244,114,182,0.7)]"
                      : "stroke-teal-500 group-hover:stroke-teal-400"
                  )}
                />
              )}
              {viewMode === "emoji" && (
                <text
                  x={d.cx}
                  y={d.cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontSize: 12 }}
                  className={cn(
                    "transition-all duration-150 radar-dot-circle select-none",
                    d.topMatch && "drop-shadow-[0_0_4px_rgba(244,114,182,0.8)]"
                  )}
                >
                  {d.career.emoji}
                </text>
              )}
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

        {/* Hover tooltip */}
        {hovered && (
          <div
            className="absolute pointer-events-none px-2 py-1 rounded-md bg-popover border shadow-md text-[11px] font-medium"
            style={{
              left: `calc(50% + ${hovered.cx - CENTER}px)`,
              top: `calc(50% + ${hovered.cy - CENTER + 14}px)`,
              transform: "translate(-50%, 0)",
            }}
          >
            <span className="mr-1">{hovered.career.emoji}</span>
            {hovered.career.title}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t flex items-center justify-between flex-wrap gap-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_4px_rgba(244,114,182,0.7)]" />
            Top match
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-500" />
            Career
          </span>
        </div>
        <span>Inner ring = strongest match</span>
      </div>

    </div>

    {/* ─── Matches Report — separate card, carousel of bands with filter ─── */}
    <div className="mt-4 rounded-2xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Matches Report</h3>
        <p className="text-[11px] text-muted-foreground">
          {visibleDots.length} of {dots.length} careers shown
        </p>
      </div>

      {/* Build bands from the *filtered* dots so the carousel reflects the filter */}
      {(() => {
        const bands = ([0, 1, 2] as const)
          .map((ring) => {
            const ringDots = visibleDots.filter((d) => d.ring === ring);
            if (ringDots.length === 0) return null;
            return {
              ring,
              label:
                ring === 0
                  ? "Strong match"
                  : ring === 1
                  ? "Good match"
                  : "Worth a look",
              accent:
                ring === 0
                  ? "text-teal-600 dark:text-teal-400"
                  : ring === 1
                  ? "text-teal-500/80"
                  : "text-muted-foreground",
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
          const slide = el.children[i] as HTMLElement | undefined;
          if (slide) {
            el.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
            setCarouselIdx(i);
          }
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
                  <div className="rounded-lg border bg-background overflow-hidden divide-y">
                    {band.dots.map((d) => (
                      <button
                        key={d.career.id}
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("open-career-detail", {
                              detail: d.career,
                            })
                          );
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-1 text-left hover:bg-muted/50 transition-colors",
                          d.topMatch && "bg-pink-500/5"
                        )}
                      >
                        <span className="text-[11px] leading-none shrink-0 opacity-60">{d.career.emoji}</span>
                        <span className="text-[12px] truncate flex-1">{d.career.title}</span>
                        {d.topMatch && (
                          <span className="text-[8px] font-bold uppercase tracking-wide text-pink-500 shrink-0">
                            Top
                          </span>
                        )}
                      </button>
                    ))}
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
  </>
  );
}

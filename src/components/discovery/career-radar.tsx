"use client";

import { useMemo, useState } from "react";
import {
  CAREER_PATHWAYS,
  findCareerCategory,
  getAllCareers,
  getCareersFromDiscovery,
  type Career,
  type CareerCategory,
  type DiscoveryPreferences,
} from "@/lib/career-pathways";
import { Sparkles, Settings2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
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
const CATEGORY_ORDER: CareerCategory[] = [
  "HEALTHCARE_LIFE_SCIENCES",
  "EDUCATION_TRAINING",
  "TECHNOLOGY_IT",
  "BUSINESS_MANAGEMENT",
  "FINANCE_BANKING",
  "SALES_MARKETING",
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
  MANUFACTURING_ENGINEERING: "Engineering",
  LOGISTICS_TRANSPORT: "Logistics",
  HOSPITALITY_TOURISM: "Hospitality",
  TELECOMMUNICATIONS: "Telecom",
};

interface PlacedDot {
  career: Career;
  ring: 0 | 1 | 2; // 0 = strongest, 2 = worth a look
  cx: number;
  cy: number;
  topMatch?: boolean; // First few overall matches — highlighted distinctly
}

const TOP_MATCH_COUNT = 3;

const SIZE = 320;
const CENTER = SIZE / 2;
const RING_RADII = [60, 110, 150]; // outer edge of each ring band
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

  // Track per-(ring, category) count so we can spread dots within a slice.
  const sliceCounts = new Map<string, number>();

  const placed: PlacedDot[] = [];
  careers.forEach((career, idx) => {
    const ring = ringFor(idx);
    const cat = findCareerCategory(career.id);
    if (!cat) return;
    const sliceIdx = CATEGORY_ORDER.indexOf(cat);
    if (sliceIdx < 0) return;

    const sliceKey = `${ring}-${cat}`;
    const within = sliceCounts.get(sliceKey) || 0;
    sliceCounts.set(sliceKey, within + 1);

    // Each slice is 360 / 10 = 36 degrees wide.
    const sliceWidth = 360 / CATEGORY_ORDER.length;
    const sliceStart = sliceIdx * sliceWidth;
    // Spread dots inside the slice deterministically: first dot near centre,
    // subsequent dots fan out alternately left/right.
    const offset = ((within + 1) / 2) * (within % 2 === 0 ? -1 : 1);
    const angleDeg = sliceStart + sliceWidth / 2 + offset * (sliceWidth / 4);
    const angleRad = (angleDeg - 90) * (Math.PI / 180); // -90 so 0deg is top

    // Place near outer edge of the ring band, with slight inward jitter.
    const baseR = ring === 0 ? RING_RADII[0] - 18 : ring === 1 ? RING_RADII[1] - 18 : RING_RADII[2] - 14;
    const r = baseR;

    placed.push({
      career,
      ring,
      cx: CENTER + r * Math.cos(angleRad),
      cy: CENTER + r * Math.sin(angleRad),
      topMatch: idx < TOP_MATCH_COUNT,
    });
  });

  return placed;
}

export function CareerRadar({ preferences, onEditPreferences }: CareerRadarProps) {
  const [hovered, setHovered] = useState<PlacedDot | null>(null);
  const [zoom, setZoom] = useState(2);

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
  const zoomReset = () => setZoom(1);

  const matched = useMemo(() => {
    if (!preferences) return [];
    return getCareersFromDiscovery(preferences, 30);
  }, [preferences]);

  const dots = useMemo(() => placeDots(matched), [matched]);

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
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-[11px] text-muted-foreground">
          {dots.length} match{dots.length !== 1 ? "es" : ""}
        </span>
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
                className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20"
              >
                {SUBJECT_LABELS[s] || s}
              </span>
            ))}
            {(preferences.workStyles || []).map((w) => (
              <span
                key={`w-${w}`}
                className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/20"
              >
                {WORK_STYLE_LABELS[w] || w}
              </span>
            ))}
            {preferences.peoplePref && (
              <span
                className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
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
          {dots.map((d, idx) => (
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
              {/* Top match halo: faint pulsing ring behind top dots */}
              {d.topMatch && (
                <circle
                  cx={d.cx}
                  cy={d.cy}
                  r={11}
                  fill="none"
                  className="stroke-pink-400/70 radar-top-halo"
                  strokeWidth={1.25}
                />
              )}
              {/* Entry-level marker: outer ring around the dot, NOT a size change */}
              {d.career.entryLevel && (
                <circle
                  cx={d.cx}
                  cy={d.cy}
                  r={9}
                  fill="none"
                  className="stroke-amber-400"
                  strokeWidth={1.5}
                />
              )}
              <circle
                cx={d.cx}
                cy={d.cy}
                r={6}
                className={cn(
                  "transition-all duration-150 radar-dot-circle",
                  d.topMatch
                    ? "fill-pink-400 drop-shadow-[0_0_4px_rgba(244,114,182,0.7)]"
                    : "fill-teal-500 group-hover:fill-teal-400"
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
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full border-2 border-amber-400" />
            Entry-level path
          </span>
        </div>
        <span>Inner ring = strongest match</span>
      </div>

      {/* List view of matched careers, grouped by relevance band */}
      <div className="border-t bg-muted/10">
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            All matches
          </p>
          <div className="space-y-3">
            {([0, 1, 2] as const).map((ring) => {
              const ringDots = dots.filter((d) => d.ring === ring);
              if (ringDots.length === 0) return null;
              const label =
                ring === 0
                  ? "Strong match"
                  : ring === 1
                  ? "Good match"
                  : "Worth a look";
              const accent =
                ring === 0
                  ? "text-teal-600 dark:text-teal-400"
                  : ring === 1
                  ? "text-teal-500/80"
                  : "text-muted-foreground";
              return (
                <div key={ring}>
                  <p className={`text-[10px] font-medium mb-1 ${accent}`}>
                    {label} · {ringDots.length}
                  </p>
                  <div className="rounded-lg border bg-card overflow-hidden">
                    {ringDots.map((d, idx) => {
                      const cat = findCareerCategory(d.career.id);
                      const catLabel = cat ? CATEGORY_LABEL[cat] : "";
                      return (
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
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors ${
                            idx > 0 ? "border-t" : ""
                          }`}
                        >
                          <span className="text-base shrink-0">{d.career.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium truncate">
                                {d.career.title}
                              </span>
                              {d.career.entryLevel && (
                                <span className="inline-block w-2 h-2 rounded-full border-2 border-amber-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {catLabel} · {d.career.avgSalary?.split(" ")[0]}
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            Open →
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

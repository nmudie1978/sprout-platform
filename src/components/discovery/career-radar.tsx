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
}

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
    });
  });

  return placed;
}

export function CareerRadar({ preferences, onEditPreferences }: CareerRadarProps) {
  const [hovered, setHovered] = useState<PlacedDot | null>(null);
  const [zoom, setZoom] = useState(1);

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
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-500" />
          <h3 className="text-sm font-semibold">My Career Radar</h3>
          <span className="text-[10px] text-muted-foreground">
            {dots.length} match{dots.length !== 1 ? "es" : ""}
          </span>
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

          {/* Dots */}
          {dots.map((d) => (
            <g
              key={d.career.id}
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered((cur) => (cur?.career.id === d.career.id ? null : cur))}
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("open-career-detail", { detail: d.career })
                );
              }}
              className="cursor-pointer"
            >
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
                className="fill-teal-500 hover:fill-teal-400 transition-colors"
              />
            </g>
          ))}
        </svg>

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
        <div className="flex items-center gap-3">
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
    </div>
  );
}

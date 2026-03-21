/**
 * JOB MARKET STATS CAROUSEL
 *
 * A rotating carousel displaying job market stat cards across 3 pages.
 * Features:
 * - Auto-rotation every 25 seconds
 * - Pause on hover/focus
 * - Keyboard accessible controls
 * - Reduced motion support
 * - Responsive layout (3 cols desktop, 2 cols tablet, 1 col mobile)
 * - Clickable source provenance → opens Source Drawer
 * - "Give me more" button for batch rotation
 * - Dataset versioning footer
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Briefcase,
  Lightbulb,
  Globe,
  MapPin,
  Heart,
  Compass,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  Info,
  Leaf,
  Users,
  GraduationCap,
  Cpu,
  Building2,
  Wallet,
  Shield,
  Zap,
  Monitor,
} from "lucide-react";
import {
  getStatsBatch,
  DATASET_VERSION,
  DATASET_RETRIEVED_AT,
  TOTAL_BATCHES,
  type JobMarketStatCard,
  type BarItem,
  type BulletItem,
  type DonutSegment,
  type RadarAxis,
  type RankingItem,
  type IconGridItem,
  type StackedSegment,
  type RegionFilter,
} from "@/lib/industry-insights/job-market-stats";
import type { StatDatum } from "@/lib/industry-insights/stat-types";
import { SourceDrawer } from "./source-drawer";

// ============================================
// CONSTANTS
// ============================================

const AUTO_ADVANCE_INTERVAL = 25000; // 25 seconds
const CARDS_PER_PAGE = 3;

// Icon mapping by card ID prefix
const CARD_ICONS: Record<string, typeof BarChart3> = {
  "global-employment": BarChart3,
  "growing-industries": TrendingUp,
  "reshaping-jobs": RefreshCw,
  "fastest-growing": Briefcase,
  "in-demand": Lightbulb,
  "remote-hybrid": Globe,
  "norway-steady": MapPin,
  "norway-employer": Heart,
  "norway-youth": Compass,
  "global-youth": Users,
  "green-economy": Leaf,
  "ai-impact": Cpu,
  "freelance-gig": Zap,
  "declining-roles": TrendingDown,
  "soft-skills": Heart,
  "education-vs": GraduationCap,
  "norway-green": Leaf,
  "norway-youth-activity": Users,
  "global-gender": Users,
  "global-apprenticeship": GraduationCap,
  "digital-skills": Monitor,
  "entry-level": Shield,
  "sector-salary": Wallet,
  "future-proof": Sparkles,
  "norway-digital": Cpu,
  "norway-sector": Building2,
  "norway-work": Globe,
  "global-youth-entrepreneurship": Zap,
  "global-mental": Heart,
  "global-diversity": Users,
  "global-automation": Cpu,
  "global-talent": Globe,
  "global-creative": Sparkles,
  "norway-apprenticeship": GraduationCap,
  "norway-gender": Users,
  "norway-tech": Monitor,
  "global-remote-prod": Globe,
  "global-lifelong": GraduationCap,
  "global-stem": Lightbulb,
  "global-gig-prot": Shield,
  "global-healthcare": Heart,
  "global-industry": Cpu,
  "norway-oil": Leaf,
  "norway-immigrant": Users,
  "norway-youth-entre": Zap,
  // Batch 6 completion
  "global-skills-changing": RefreshCw,
  "global-jobs-gap": Users,
  "nordic-neet": BarChart3,
  "global-youth-informal": Shield,
  "global-renewable": Leaf,
  // Batch 7 — AI & Technology
  "global-genai": Cpu,
  "global-ai-skills": Sparkles,
  "global-developer": Monitor,
  "wef-fastest-growing": TrendingUp,
  "wef-fastest-declining": TrendingDown,
  "global-human-machine": Cpu,
  "norway-ai": Cpu,
  "norway-tech-sector": Monitor,
  // Batch 8 — Gen Z & Youth
  "global-genz": Users,
  "eu-neet": BarChart3,
  "global-developing": Globe,
  "global-skills-based": GraduationCap,
  "norway-youth-employment": Compass,
  "norway-gender-work": Users,
  // Batch 9 — Skills & Reskilling
  "global-skills-gap": Shield,
  "global-reskilling": RefreshCw,
  "global-top-skills": Lightbulb,
  "global-skills-transformation": Zap,
  "global-lifelong-learning": GraduationCap,
  "eu-digital": Monitor,
  "global-degree": GraduationCap,
  "norway-nho": Building2,
  "norway-lifelong": GraduationCap,
  // Batch 10 — Green Economy
  "global-green-jobs": Leaf,
  "global-green-workforce": Leaf,
  "global-green-skills": Leaf,
  "global-green-transition": Leaf,
  "global-net-new": TrendingUp,
  "norway-offshore": Globe,
  "norway-ev": Zap,
  "norway-hydrogen": Leaf,
  "norway-ccs": Building2,
  // Batch 11 — Global Talent
  "global-talent-shortage": Users,
  "eu-youth-unemployment": BarChart3,
  "oecd-employment": BarChart3,
  "global-child-labour": Shield,
  "eu-ict": Monitor,
  "mckinsey": Cpu,
  "norway-immigration": Users,
  "norway-vocational": GraduationCap,
  // Batch 12 — Future of Work
  "global-ai-corporate": Cpu,
  "global-dei": Users,
  "global-ai-productivity": Sparkles,
  "global-labour-income": Wallet,
  "norway-startup": Zap,
  "norway-apprenticeship-by": GraduationCap,
  "norway-teacher": Heart,
  "norway-employment-vs": BarChart3,
};

function getIconForCard(cardId: string) {
  for (const [prefix, Icon] of Object.entries(CARD_ICONS)) {
    if (cardId.startsWith(prefix)) {
      return Icon;
    }
  }
  return BarChart3;
}

// ============================================
// BAR LIST RENDERER
// ============================================

function BarListRenderer({ items }: { items: BarItem[] }) {
  const maxValue = Math.max(...items.map((item) => item.value));

  return (
    <div className="space-y-1.5" role="img" aria-label="Statistics bar chart">
      {items.map((item) => {
        const widthPercent = (item.value / maxValue) * 100;
        return (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-24 sm:w-32 flex-shrink-0">
              <span className="text-[11px] sm:text-xs text-foreground truncate block">
                {item.label}
              </span>
            </div>
            <div className="flex-1 flex items-center gap-1.5">
              <div className="flex-1 h-3.5 bg-muted/50 rounded-sm overflow-hidden">
                <div
                  className={`h-full rounded-sm transition-all duration-300 ${item.color || "bg-primary"}`}
                  style={{ width: `${widthPercent}%` }}
                  role="progressbar"
                  aria-valuenow={item.value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${item.label}: ${item.value}%`}
                />
              </div>
              <span className="w-8 text-right text-[10px] sm:text-xs font-medium text-muted-foreground tabular-nums">
                {item.value}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// METRIC RENDERER
// ============================================

function MetricRenderer({
  value,
  valueContext,
  items,
}: {
  value: string;
  valueContext?: string;
  items?: BulletItem[];
}) {
  return (
    <div className="space-y-3">
      <div className="p-2.5 rounded-lg bg-muted/40 text-center">
        <div className="text-xl font-bold text-foreground">{value}</div>
        {valueContext && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
            {valueContext}
          </p>
        )}
      </div>
      {items && items.length > 0 && (
        <ul className="space-y-1">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="text-[10px] sm:text-xs text-muted-foreground flex items-start gap-1.5"
            >
              <span className="text-primary mt-0.5">•</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================
// BULLETS RENDERER
// ============================================

function BulletsRenderer({ items }: { items: BulletItem[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, idx) => (
        <li
          key={idx}
          className="text-[11px] sm:text-xs text-foreground flex items-start gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

// ============================================
// DONUT CHART RENDERER
// ============================================

function DonutRenderer({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: DonutSegment[];
  centerValue?: string;
  centerLabel?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full -rotate-90">
          {segments.map((segment, idx) => {
            const startPercent = cumulativePercent;
            const slicePercent = segment.value / total;
            cumulativePercent += slicePercent;

            const [startX, startY] = getCoordinatesForPercent(startPercent);
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

            const pathData = [
              `M ${startX * 0.6} ${startY * 0.6}`,
              `L ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `L ${endX * 0.6} ${endY * 0.6}`,
              `A 0.6 0.6 0 ${largeArcFlag} 0 ${startX * 0.6} ${startY * 0.6}`,
            ].join(" ");

            return (
              <path
                key={idx}
                d={pathData}
                fill={segment.color}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>
        {centerValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground">{centerValue}</span>
            {centerLabel && (
              <span className="text-[8px] text-muted-foreground text-center leading-tight px-1">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1">
        {segments.map((segment, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {segment.label}
            </span>
            <span className="text-[10px] sm:text-xs font-medium ml-auto">
              {segment.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// RADAR CHART RENDERER
// ============================================

function RadarRenderer({ axes }: { axes: RadarAxis[] }) {
  const n = axes.length;
  const angleSlice = (2 * Math.PI) / n;
  const maxValue = 100;
  const levels = 4;

  const getPoint = (value: number, index: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const radius = (value / maxValue) * 40;
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle),
    };
  };

  const polygonPoints = axes
    .map((axis, i) => {
      const p = getPoint(axis.value, i);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <div className="flex items-center gap-2">
      <div className="w-28 h-28 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {Array.from({ length: levels }).map((_, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={((i + 1) / levels) * 40}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={0.5}
            />
          ))}

          {axes.map((_, i) => {
            const p = getPoint(maxValue, i);
            return (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={p.x}
                y2={p.y}
                stroke="currentColor"
                strokeOpacity={0.15}
                strokeWidth={0.5}
              />
            );
          })}

          <polygon
            points={polygonPoints}
            fill={axes[0]?.color || "#8b5cf6"}
            fillOpacity={0.3}
            stroke={axes[0]?.color || "#8b5cf6"}
            strokeWidth={1.5}
          />

          {axes.map((axis, i) => {
            const p = getPoint(axis.value, i);
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={2.5}
                fill={axis.color || "#8b5cf6"}
              />
            );
          })}

          {axes.map((axis, i) => {
            const labelPoint = getPoint(maxValue + 20, i);
            return (
              <text
                key={i}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[6px]"
              >
                {axis.label}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="flex-1 space-y-0.5">
        {axes.map((axis, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: axis.color || "#8b5cf6" }}
            />
            <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
              {axis.label}
            </span>
            <span className="text-[9px] sm:text-[10px] font-medium ml-auto">
              {axis.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// RANKING BARS RENDERER
// ============================================

function RankingBarsRenderer({ items }: { items: RankingItem[] }) {
  const TrendIcon = ({ trend }: { trend?: "up" | "down" | "stable" }) => {
    if (trend === "up") return <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />;
    if (trend === "down") return <TrendingDown className="h-2.5 w-2.5 text-rose-500" />;
    return <Minus className="h-2.5 w-2.5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div key={item.rank} className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground">
              {item.rank}
            </span>
          </div>

          <div className="flex-1 flex items-center gap-1.5">
            <div
              className={`h-4 rounded-sm transition-all duration-300 ${item.color || "bg-primary"}`}
              style={{ width: `${100 - (item.rank - 1) * 15}%` }}
            />
          </div>

          <div className="w-24 sm:w-28 flex items-center gap-1 flex-shrink-0">
            <span className="text-[9px] sm:text-[10px] text-foreground truncate flex-1">
              {item.label}
            </span>
            <TrendIcon trend={item.trend} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// ICON GRID RENDERER
// ============================================

function IconGridRenderer({ items }: { items: IconGridItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <span className="text-xl mb-1">{item.icon}</span>
          <span className="text-[9px] sm:text-[10px] font-medium text-foreground text-center leading-tight">
            {item.label}
          </span>
          {item.sublabel && (
            <span className="text-[8px] text-muted-foreground text-center">
              {item.sublabel}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// STACKED BAR RENDERER
// ============================================

function StackedBarRenderer({
  segments,
  title,
}: {
  segments: StackedSegment[];
  title?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-3">
      {title && (
        <p className="text-xs text-muted-foreground text-center">{title}</p>
      )}

      <div className="h-8 rounded-lg overflow-hidden flex" role="img" aria-label="Stacked bar chart">
        {segments.map((segment, idx) => (
          <div
            key={idx}
            className="h-full flex items-center justify-center transition-all duration-300 hover:opacity-90"
            style={{
              width: `${(segment.value / total) * 100}%`,
              backgroundColor: segment.color,
            }}
          >
            <span className="text-[10px] font-medium text-white drop-shadow-sm">
              {segment.value}%
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {segments.map((segment, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {segment.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// SINGLE STAT CARD
// ============================================

interface StatCardProps {
  card: JobMarketStatCard;
  onSourceClick: (card: StatDatum) => void;
  showContextHints?: boolean;
}

function StatCard({ card, onSourceClick, showContextHints }: StatCardProps) {
  const Icon = getIconForCard(card.id);

  const renderContent = () => {
    switch (card.renderType) {
      case "barList":
        return <BarListRenderer items={card.items as BarItem[]} />;
      case "metric":
        return (
          <MetricRenderer
            value={card.value || ""}
            valueContext={card.valueContext}
            items={card.items as BulletItem[]}
          />
        );
      case "bullets":
        return <BulletsRenderer items={card.items as BulletItem[]} />;
      case "donut":
        return (
          <DonutRenderer
            segments={card.items as DonutSegment[]}
            centerValue={card.value}
            centerLabel={card.valueContext}
          />
        );
      case "radar":
        return <RadarRenderer axes={card.items as RadarAxis[]} />;
      case "rankingBars":
        return <RankingBarsRenderer items={card.items as RankingItem[]} />;
      case "iconGrid":
        return <IconGridRenderer items={card.items as IconGridItem[]} />;
      case "stackedBar":
        return (
          <StackedBarRenderer
            segments={card.items as StackedSegment[]}
            title={card.valueContext}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="border-2 overflow-hidden h-full flex flex-col">
      {/* Gradient header bar */}
      <div className={`h-1 bg-gradient-to-r ${card.gradientColors}`} />

      <CardHeader className="pb-1.5 pt-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
              <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${card.iconColor}`} />
              <span className="truncate">{card.title}</span>
            </CardTitle>
            <CardDescription className="mt-0.5 text-[10px] sm:text-xs truncate">
              {card.subtitle}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3 px-4 flex-1 flex flex-col">
        {/* Main content */}
        <div className="flex-1">{renderContent()}</div>

        {/* Note (if present) */}
        {card.note && (
          <p className="text-[9px] sm:text-[10px] text-muted-foreground/80 italic mt-2">
            {card.note}
          </p>
        )}

        {/* Reality signal — always rendered when present, fades in/out with no layout jump */}
        {card.realitySignal && (
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${showContextHints ? "max-h-20 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"}
            `}
          >
            <p className="text-[10px] sm:text-[11px] text-muted-foreground/70 leading-relaxed italic">
              {card.realitySignal}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t mt-2.5 pt-2" />

        {/* Clickable source line */}
        <button
          onClick={() => onSourceClick(card)}
          className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-primary/80 hover:text-primary transition-colors group w-fit"
          aria-label={`View source: ${card.provenance.sourceName}`}
        >
          <Info className="h-3 w-3 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
          <span className="underline decoration-dotted underline-offset-2">
            {card.provenance.sourceName}
          </span>
        </button>
      </CardContent>
    </Card>
  );
}

// ============================================
// CAROUSEL NAVIGATION
// ============================================

interface CarouselNavProps {
  currentPage: number;
  totalPages: number;
  pageLabels: string[];
  onPrev: () => void;
  onNext: () => void;
  onDotClick: (page: number) => void;
}

function CarouselNav({
  currentPage,
  totalPages,
  pageLabels,
  onPrev,
  onNext,
  onDotClick,
}: CarouselNavProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <button
        onClick={onPrev}
        className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2" role="tablist" aria-label="Carousel pages">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onDotClick(idx)}
            role="tab"
            aria-selected={currentPage === idx}
            aria-label={`Go to ${pageLabels[idx] || `Page ${idx + 1}`}`}
            className={`
              h-2 rounded-full transition-all duration-200
              ${
                currentPage === idx
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }
            `}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ============================================
// REGION TOGGLE
// ============================================

const REGION_OPTIONS: { value: RegionFilter; label: string; flag?: string }[] = [
  { value: "all", label: "All" },
  { value: "global", label: "Global", flag: "🌍" },
  { value: "norway", label: "Norway", flag: "🇳🇴" },
];

function RegionToggle({
  value,
  onChange,
}: {
  value: RegionFilter;
  onChange: (v: RegionFilter) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border border-white/10 bg-muted/30 p-0.5 gap-0.5">
      {REGION_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              px-2.5 py-1 rounded-md text-[11px] font-medium transition-all
              ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }
            `}
            aria-pressed={active}
          >
            {opt.flag && <span className="mr-1">{opt.flag}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// MAIN CAROUSEL COMPONENT
// ============================================

interface JobMarketStatsCarouselProps {
  className?: string;
  showContextHints?: boolean;
}

export function JobMarketStatsCarousel({
  className,
  showContextHints,
}: JobMarketStatsCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [batchSeed, setBatchSeed] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedStat, setSelectedStat] = useState<StatDatum | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current batch (filtered by region)
  const batch = getStatsBatch(batchSeed, regionFilter);
  const pages: JobMarketStatCard[][] = [];
  for (let i = 0; i < batch.cards.length; i += CARDS_PER_PAGE) {
    pages.push(batch.cards.slice(i, i + CARDS_PER_PAGE));
  }
  const totalPages = pages.length;

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Navigation handlers
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goToPrev = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  // Auto-advance logic
  useEffect(() => {
    if (isPaused || prefersReducedMotion) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(goToNext, AUTO_ADVANCE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, prefersReducedMotion, goToNext]);

  // Pause on hover
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Pause on focus within
  const handleFocusIn = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleFocusOut = useCallback((e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsPaused(false);
    }
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    },
    [goToPrev, goToNext]
  );

  // Source drawer handler
  const handleSourceClick = useCallback((stat: StatDatum) => {
    setSelectedStat(stat);
    setDrawerOpen(true);
  }, []);

  // Region change handler
  const handleRegionChange = useCallback((region: RegionFilter) => {
    setRegionFilter(region);
    setBatchSeed(0);
    setCurrentPage(0);
  }, []);

  // "Give me more" handler
  const handleGiveMore = useCallback(async () => {
    setIsLoadingMore(true);
    await new Promise((r) => setTimeout(r, 400));
    setBatchSeed((prev) => (prev + 1) % batch.totalBatches);
    setCurrentPage(0);
    setIsLoadingMore(false);
  }, [batch.totalBatches]);

  const currentCards = pages[currentPage] || [];
  const pageLabel = batch.pageLabels[currentPage] || `Page ${currentPage + 1}`;

  // Format the dataset date for footer
  const lastUpdated = new Date(DATASET_RETRIEVED_AT).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
  });

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocusIn}
        onBlur={handleFocusOut}
        onKeyDown={handleKeyDown}
        role="region"
        aria-label="Job market statistics carousel"
        aria-roledescription="carousel"
      >
        {/* Region toggle + page label */}
        <div className="flex items-center justify-between mb-3 gap-3">
          <div className="flex items-center gap-3">
            <RegionToggle value={regionFilter} onChange={handleRegionChange} />
            <p className="text-xs text-muted-foreground">
              {pageLabel} ({currentPage + 1}/{totalPages})
            </p>
          </div>
          {!prefersReducedMotion && (
            <p className="text-[10px] text-muted-foreground/60">
              {isPaused ? "Paused" : "Auto-advances"}
            </p>
          )}
        </div>

        {/* Cards grid */}
        <div
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          role="tabpanel"
          aria-label={pageLabel}
        >
          {currentCards.map((card) => (
            <div
              key={card.id}
              className={`
                transition-opacity duration-300
                ${prefersReducedMotion ? "" : "animate-in fade-in-0"}
              `}
            >
              <StatCard card={card} onSourceClick={handleSourceClick} showContextHints={showContextHints} />
            </div>
          ))}
        </div>

        {/* Navigation controls */}
        <CarouselNav
          currentPage={currentPage}
          totalPages={totalPages}
          pageLabels={batch.pageLabels}
          onPrev={goToPrev}
          onNext={goToNext}
          onDotClick={goToPage}
        />

        {/* "Give me more" button */}
        {batch.totalBatches > 1 && (
          <div className="flex flex-col items-center gap-1.5 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGiveMore}
              disabled={isLoadingMore}
              className="text-xs gap-1.5"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Give me more
                </>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground/50">
              Set {batchSeed + 1} of {batch.totalBatches} ({batch.totalAvailable} stats total)
            </p>
          </div>
        )}

        {/* Dataset versioning footer */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <p className="text-[9px] text-muted-foreground/50">
            Last updated {lastUpdated} · v{DATASET_VERSION}
          </p>
        </div>
      </div>

      {/* Source Drawer (rendered outside carousel container for correct z-index) */}
      <SourceDrawer
        stat={selectedStat}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}

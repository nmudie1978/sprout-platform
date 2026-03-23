/**
 * WHY THIS MATTERS SECTION
 *
 * Compact, professional display of research-backed statistics.
 * Supports three view modes: Compact (default), Grid, List.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ExternalLink,
  BookOpen,
  Target,
  Compass,
  CheckCircle,
  ArrowRight,
  LayoutGrid,
  List,
  Rows3,
  Languages,
} from "lucide-react";
import {
  getWhyThisMattersStats,
  type ResearchStatWithYear,
  type ResearchTag,
} from "@/lib/researchEvidence";
import { useTranslateContent } from "@/hooks/use-translate-content";

type ViewMode = "compact" | "grid" | "list";

const TAG_ICONS: Record<ResearchTag, typeof Compass> = {
  "career-uncertainty": Compass,
  "work-exposure": BookOpen,
  guidance: BookOpen,
  preparedness: Target,
  expectations: CheckCircle,
  outcomes: CheckCircle,
  neet: Target,
};

const TAG_COLORS: Record<
  ResearchTag,
  { iconBg: string; iconColor: string; border: string }
> = {
  "career-uncertainty": {
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    border: "border-blue-500/10",
  },
  "work-exposure": {
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    border: "border-purple-500/10",
  },
  guidance: {
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    border: "border-purple-500/10",
  },
  preparedness: {
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    border: "border-amber-500/10",
  },
  expectations: {
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
    border: "border-cyan-500/10",
  },
  outcomes: {
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500",
    border: "border-green-500/10",
  },
  neet: {
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    border: "border-orange-500/10",
  },
};

const VIEW_OPTIONS: { value: ViewMode; icon: typeof Rows3; label: string }[] = [
  { value: "compact", icon: Rows3, label: "Compact" },
  { value: "grid", icon: LayoutGrid, label: "Grid" },
  { value: "list", icon: List, label: "List" },
];

// ── Compact card ────────────────────────────────────────
function CompactCard({ stat }: { stat: ResearchStatWithYear }) {
  const primaryTag = stat.tags[0];
  const Icon = TAG_ICONS[primaryTag] || Compass;
  const colors = TAG_COLORS[primaryTag] || TAG_COLORS["career-uncertainty"];

  return (
    <div
      className={`rounded-lg border ${colors.border} bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`p-1.5 rounded-md ${colors.iconBg} flex-shrink-0 mt-0.5`}
        >
          <Icon className={`h-3.5 w-3.5 ${colors.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-foreground leading-snug mb-0.5">
            {stat.headline}
          </h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
            {stat.description}
          </p>
          <a
            href={stat.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1.5 text-[9px] text-muted-foreground/60 hover:text-primary transition-colors group/link"
          >
            <span>
              {stat.sourceName} &bull; {stat.sourceYear}
            </span>
            <ExternalLink className="h-2 w-2 opacity-0 group-hover/link:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── List row ────────────────────────────────────────────
function ListRow({ stat }: { stat: ResearchStatWithYear }) {
  const primaryTag = stat.tags[0];
  const Icon = TAG_ICONS[primaryTag] || Compass;
  const colors = TAG_COLORS[primaryTag] || TAG_COLORS["career-uncertainty"];

  return (
    <div className="flex items-center gap-2.5 py-2 px-2 rounded-md transition-colors group/row hover:bg-white/[0.03]">
      <div className={`p-1 rounded ${colors.iconBg} flex-shrink-0`}>
        <Icon className={`h-3 w-3 ${colors.iconColor}`} />
      </div>
      <p className="text-[11px] font-medium text-foreground flex-1 min-w-0 truncate">
        {stat.headline}
      </p>
      <span className="text-[9px] text-muted-foreground/50 flex-shrink-0">
        {stat.sourceName} &bull; {stat.sourceYear}
      </span>
      <a
        href={stat.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-0 group-hover/row:opacity-100 transition-opacity flex-shrink-0"
      >
        <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/40 hover:text-primary" />
      </a>
    </div>
  );
}

// ── View Toggle ─────────────────────────────────────────
function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
      {VIEW_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            title={opt.label}
            className={`p-1.5 rounded-md transition-colors ${
              active
                ? "bg-white/10 text-foreground"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
          >
            <Icon className="h-3 w-3" />
          </button>
        );
      })}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────
export function WhyThisMatters() {
  const stats = getWhyThisMattersStats();
  const [view, setView] = useState<ViewMode>("compact");
  const locale = useLocale();
  const t = useTranslations("common");
  const { translate, isTranslating, getTranslation } = useTranslateContent();
  const [showTranslated, setShowTranslated] = useState(false);

  const handleTranslate = async () => {
    const items = stats.flatMap((stat) => [
      { key: `wtm-headline-${stat.id}`, text: stat.headline },
      { key: `wtm-desc-${stat.id}`, text: stat.description },
    ]);
    await translate(items, { targetLocale: "nb-NO", contentType: "insight" });
    setShowTranslated(true);
  };

  const getText = (key: string, original: string) =>
    showTranslated ? getTranslation(key) ?? original : original;

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Why This Matters
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Backed by global research on youth career readiness
          </p>
        </div>
        <div className="flex items-center gap-2">
          {locale === "nb-NO" && (
            <button
              onClick={showTranslated ? () => setShowTranslated(false) : handleTranslate}
              disabled={isTranslating}
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            >
              <Languages className="h-3 w-3" />
              {isTranslating ? t("translating") : showTranslated ? t("showOriginal") : t("translateToNorwegian")}
            </button>
          )}
          <ViewToggle value={view} onChange={setView} />
          <Link
            href="/about/research"
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors group"
          >
            <span>Evidence</span>
            <ArrowRight className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Compact view */}
      {view === "compact" && (
        <div className="space-y-2 max-h-[260px] overflow-y-auto">
          {stats.map((stat) => (
            <CompactCard key={stat.id} stat={{
              ...stat,
              headline: getText(`wtm-headline-${stat.id}`, stat.headline),
              description: getText(`wtm-desc-${stat.id}`, stat.description),
            }} />
          ))}
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto">
          {stats.map((stat) => (
            <CompactCard key={stat.id} stat={{
              ...stat,
              headline: getText(`wtm-headline-${stat.id}`, stat.headline),
              description: getText(`wtm-desc-${stat.id}`, stat.description),
            }} />
          ))}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="divide-y divide-white/5">
          {stats.map((stat) => (
            <ListRow key={stat.id} stat={{
              ...stat,
              headline: getText(`wtm-headline-${stat.id}`, stat.headline),
            }} />
          ))}
        </div>
      )}

      {/* Empowering message */}
      <div className="mt-3 py-2 px-3 rounded-md bg-green-500/5 border border-green-500/10 flex items-center gap-2">
        <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
        <p className="text-[10px] text-green-400/70">
          <strong className="text-green-400">
            That&apos;s why My Journey exists
          </strong>{" "}
          — Discover, Understand, Grow bridges the gap between school and career
          clarity.
        </p>
      </div>
    </section>
  );
}

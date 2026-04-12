"use client";

/**
 * BEYOND BORDERS CAROUSEL — Redesigned
 *
 * Visual redesign:
 * - Side-by-side article cards (horizontal scroll on mobile, grid on desktop)
 * - Each card has a gradient header with travel-themed icon
 * - Warm teal/teal/sky color palette instead of teal
 * - "Read more" expands within the card
 * - Small Steps as visual cards with icons, not dashed chips
 * - Plane icon in the section header
 *
 * Preserved: save-to-journey mutation, translation support, all data, accessibility.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
/* NOTE: motion is only used for expand/collapse transitions now, not entrance animations */
import { useLocale, useTranslations } from "next-intl";
import {
  Compass,
  BookmarkPlus,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plane,
  Laptop,
  Globe,
  Heart,
  Users,
  AlertTriangle,
  Lightbulb,
  Languages,
  Clock,
  MapPin,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useTranslateContent } from "@/hooks/use-translate-content";
import { Button } from "@/components/ui/button";
import {
  type BeyondBordersArticle,
  type SmallStep,
  BEYOND_BORDERS_ARTICLES,
  SMALL_STEPS,
} from "@/lib/industry-insights/beyond-borders-data";

// ── Icon Map ─────────────────────────────────────────────────────────

const STEP_ICONS: Record<SmallStep["icon"], typeof Plane> = {
  plane: Plane,
  laptop: Laptop,
  globe: Globe,
  heart: Heart,
  users: Users,
};

// Card gradient & icon per article (cycling)
const CARD_THEMES = [
  { gradient: "from-teal-500 via-teal-500 to-teal-600", icon: Plane, iconBg: "bg-white/20" },
  { gradient: "from-sky-500 via-blue-500 to-teal-600", icon: Globe, iconBg: "bg-white/20" },
  { gradient: "from-teal-500 via-teal-500 to-fuchsia-600", icon: MapPin, iconBg: "bg-white/20" },
];

// ── Main Component ───────────────────────────────────────────────────

export function BeyondBordersCarousel() {
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  const locale = useLocale();
  const tc = useTranslations("common");
  const { translate, isTranslating, getTranslation } = useTranslateContent();
  const [showTranslated, setShowTranslated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleTranslate = useCallback(async () => {
    const items = [
      ...BEYOND_BORDERS_ARTICLES.flatMap((a) => [
        { key: `bb-title-${a.id}`, text: a.title },
        { key: `bb-subtitle-${a.id}`, text: a.subtitle },
        { key: `bb-takeaway-${a.id}`, text: a.takeaway },
      ]),
      ...SMALL_STEPS.flatMap((s) => [
        { key: `bb-step-title-${s.id}`, text: s.title },
        { key: `bb-step-desc-${s.id}`, text: s.description },
      ]),
    ];
    for (let i = 0; i < items.length; i += 20) {
      await translate(items.slice(i, i + 20), {
        targetLocale: "nb-NO",
        contentType: "insight",
      });
    }
    setShowTranslated(true);
  }, [translate]);

  const getText = useCallback(
    (key: string, original: string) =>
      showTranslated ? getTranslation(key) ?? original : original,
    [showTranslated, getTranslation]
  );

  const saveMutation = useMutation({
    mutationFn: async (article: BeyondBordersArticle) => {
      const res = await fetch("/api/journey/saved-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ARTICLE",
          title: article.title,
          url: `${window.location.origin}/insights/beyond-borders/${article.slug}`,
          source: "Endeavrly",
          description: article.subtitle,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return article.slug;
    },
    onSuccess: (slug) => {
      setSavedSlugs((prev) => new Set(prev).add(slug));
    },
  });

  const handleSave = useCallback(
    (article: BeyondBordersArticle) => {
      if (savedSlugs.has(article.slug) || saveMutation.isPending) return;
      saveMutation.mutate(article);
    },
    [savedSlugs, saveMutation]
  );

  // Scroll state tracking
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll]);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("[data-card]")?.clientWidth || 340;
    el.scrollBy({ left: dir === "right" ? cardWidth + 16 : -(cardWidth + 16), behavior: "smooth" });
  }, []);

  return (
    <div role="region" aria-label="Working Beyond Borders" className="space-y-6">
      {/* ── Section Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-teal-100 to-teal-100 dark:from-teal-900/40 dark:to-teal-900/40">
            <Plane className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold leading-tight tracking-tight">Working Beyond Borders</h3>
            <p className="text-xs text-muted-foreground">
              Careers can span borders — but they don&apos;t have to. For awareness, not advice.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {locale === "nb-NO" && (
            <button
              onClick={showTranslated ? () => setShowTranslated(false) : handleTranslate}
              disabled={isTranslating}
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            >
              <Languages className="h-3 w-3" />
              {isTranslating ? tc("translating") : showTranslated ? tc("showOriginal") : tc("translateToNorwegian")}
            </button>
          )}
          {/* Scroll arrows — visible when needed */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="p-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="p-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Article Cards — Horizontal Scroll ─────────────────────── */}
      <div
        ref={scrollRef}
        className="flex items-start gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {BEYOND_BORDERS_ARTICLES.map((article, idx) => (
          <ArticleCard
            key={article.id}
            article={article}
            theme={CARD_THEMES[idx % CARD_THEMES.length]}
            isSaved={savedSlugs.has(article.slug)}
            onSave={() => handleSave(article)}
            getText={getText}
          />
        ))}
      </div>

      {/* ── Small Steps — Visual Cards ────────────────────────────── */}
      <SmallStepsSection getText={getText} />
    </div>
  );
}

// ── Article Card ─────────────────────────────────────────────────────

interface ArticleCardProps {
  article: BeyondBordersArticle;
  theme: (typeof CARD_THEMES)[0];
  isSaved: boolean;
  onSave: () => void;
  getText: (key: string, original: string) => string;
}

function ArticleCard({ article, theme, isSaved, onSave, getText }: ArticleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = theme.icon;

  return (
    <div
      data-card
      className={`flex-shrink-0 w-[340px] sm:w-[360px] snap-start rounded-xl border bg-card overflow-hidden ${
        expanded
          ? "border-teal-400/30 dark:border-teal-500/20"
          : "border-border"
      }`}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60">
            <Clock className="h-2.5 w-2.5" />
            {article.readTime} min read
          </span>
        </div>
        <h4 className="text-sm font-semibold text-foreground leading-snug">
          {getText(`bb-title-${article.id}`, article.title)}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {getText(`bb-subtitle-${article.id}`, article.subtitle)}
        </p>
      </div>

      {/* Card body */}
      <div className="px-5 py-4 space-y-3">
        {/* Key takeaway */}
        <div className="flex items-start gap-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 px-3.5 py-2.5">
          <Lightbulb className="h-4 w-4 text-teal-500 dark:text-teal-400 mt-0.5 shrink-0" />
          <p className="text-sm text-teal-800 dark:text-teal-300 leading-relaxed">
            {getText(`bb-takeaway-${article.id}`, article.takeaway)}
          </p>
        </div>

        {/* Expandable content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-1">
                {article.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-foreground/75">
                    {p}
                  </p>
                ))}
                {article.callout && <CalloutBox callout={article.callout} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions row */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
          >
            {expanded ? "Show less" : "Read more"}
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs gap-1"
            onClick={onSave}
            disabled={isSaved}
            aria-label={isSaved ? "Saved to journey" : "Save to journey"}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="h-3.5 w-3.5 text-teal-600" />
                <span className="text-teal-600">Saved</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="h-3.5 w-3.5" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Small Steps Section ──────────────────────────────────────────────

interface SmallStepsSectionProps {
  getText: (key: string, original: string) => string;
}

function SmallStepsSection({ getText }: SmallStepsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Compass className="h-4 w-4 text-teal-500" />
        <p className="text-sm font-semibold text-foreground">
          Small steps if you&apos;re curious
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SMALL_STEPS.map((step) => {
          const Icon = STEP_ICONS[step.icon];
          const isActive = expandedId === step.id;

          return (
            <button
              key={step.id}
              onClick={() => setExpandedId(isActive ? null : step.id)}
              aria-expanded={isActive}
              className={`text-left rounded-xl border p-3.5 transition-all ${
                isActive
                  ? "border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-950/20 shadow-sm"
                  : "border-border hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${
                  isActive
                    ? "bg-teal-100 dark:bg-teal-900/40"
                    : "bg-muted/60"
                }`}>
                  <Icon className={`h-4 w-4 ${
                    isActive ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-tight ${
                    isActive ? "text-teal-700 dark:text-teal-300" : "text-foreground/90"
                  }`}>
                    {getText(`bb-step-title-${step.id}`, step.title)}
                  </p>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-foreground/70 mt-2 leading-relaxed">
                          {getText(`bb-step-desc-${step.id}`, step.description)}
                        </p>
                        <p className="text-[11px] italic text-muted-foreground mt-1.5">
                          {step.reassurance}
                        </p>
                        {step.link && (
                          <a
                            href={step.link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] text-teal-500 hover:text-teal-400 transition-colors mt-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {step.link.label}
                          </a>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Callout Box ──────────────────────────────────────────────────────

function CalloutBox({
  callout,
}: {
  callout: NonNullable<BeyondBordersArticle["callout"]>;
}) {
  const isRealityCheck = callout.type === "reality-check";

  return (
    <div
      className={`rounded-xl border p-3.5 ${
        isRealityCheck
          ? "border-amber-200 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20"
          : "border-teal-200 bg-teal-50/50 dark:border-teal-800/40 dark:bg-teal-950/20"
      }`}
    >
      <div className="mb-2 flex items-center gap-1.5">
        {isRealityCheck ? (
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        ) : (
          <Lightbulb className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
        )}
        <span
          className={`text-xs font-semibold ${
            isRealityCheck
              ? "text-amber-800 dark:text-amber-300"
              : "text-teal-800 dark:text-teal-300"
          }`}
        >
          {callout.title}
        </span>
      </div>
      <ul className="space-y-1.5">
        {callout.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-foreground/75">
            <span
              className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${
                isRealityCheck ? "bg-amber-400" : "bg-teal-400"
              }`}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BeyondBordersCarousel;

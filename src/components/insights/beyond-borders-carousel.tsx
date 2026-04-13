"use client";

/**
 * BEYOND BORDERS — Compact horizontal carousel
 *
 * Simplified: one-line scrollable cards with title + takeaway + save.
 * No expanded paragraphs, no small steps grid, no gradient headers.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  BookmarkPlus,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lightbulb,
} from "lucide-react";
import {
  type BeyondBordersArticle,
  BEYOND_BORDERS_ARTICLES,
} from "@/lib/industry-insights/beyond-borders-data";

export function BeyondBordersCarousel() {
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
    const cardWidth = el.querySelector("[data-card]")?.clientWidth || 260;
    el.scrollBy({ left: dir === "right" ? cardWidth + 12 : -(cardWidth + 12), behavior: "smooth" });
  }, []);

  return (
    <div role="region" aria-label="Working Beyond Borders" className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-teal-500" />
          <h3 className="text-sm font-semibold">Beyond Borders</h3>
          <span className="text-[10px] text-muted-foreground/50">Global perspectives</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="p-1 rounded-full text-muted-foreground/40 hover:text-foreground disabled:opacity-20 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="p-1 rounded-full text-muted-foreground/40 hover:text-foreground disabled:opacity-20 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {BEYOND_BORDERS_ARTICLES.map((article) => {
          const isSaved = savedSlugs.has(article.slug);
          return (
            <div
              key={article.id}
              data-card
              className="flex-shrink-0 w-[260px] snap-start rounded-xl border border-border/40 bg-card p-3 space-y-2"
            >
              <h4 className="text-xs font-semibold text-foreground/85 leading-snug line-clamp-2">
                {article.title}
              </h4>
              <div className="flex items-start gap-2 rounded-lg bg-teal-500/5 px-2.5 py-2">
                <Lightbulb className="h-3 w-3 text-teal-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-foreground/60 leading-relaxed line-clamp-3">
                  {article.takeaway}
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isSaved && !saveMutation.isPending) saveMutation.mutate(article);
                }}
                disabled={isSaved}
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-teal-500 transition-colors disabled:text-teal-500"
              >
                {isSaved ? (
                  <><BookmarkCheck className="h-3 w-3" /> Saved</>
                ) : (
                  <><BookmarkPlus className="h-3 w-3" /> Save</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

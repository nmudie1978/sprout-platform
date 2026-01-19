/**
 * ARTICLE INSIGHT CARD — World Lens Articles
 *
 * A calm, reusable card for curated articles.
 * Designed for the horizontal carousel.
 *
 * Features:
 * - 16:9 visual header (image or gradient fallback)
 * - Headline (max 2 lines)
 * - One-line summary
 * - Source + date (muted)
 * - Single CTA: "Read article →"
 */

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { type CuratedArticle } from "@/lib/industry-insights/world-lens-data";

// ============================================
// TYPES
// ============================================

interface ArticleInsightCardProps {
  article: CuratedArticle;
  className?: string;
}

// ============================================
// GRADIENT BACKGROUNDS BY TOPIC
// ============================================

const topicGradients: Record<string, string> = {
  "future of work": "from-blue-500/20 to-cyan-500/20",
  skills: "from-purple-500/20 to-pink-500/20",
  "youth employment": "from-emerald-500/20 to-teal-500/20",
  AI: "from-violet-500/20 to-indigo-500/20",
  automation: "from-slate-500/20 to-zinc-500/20",
  "green jobs": "from-green-500/20 to-emerald-500/20",
  sustainability: "from-teal-500/20 to-cyan-500/20",
  education: "from-amber-500/20 to-orange-500/20",
  "remote work": "from-sky-500/20 to-blue-500/20",
  default: "from-slate-400/20 to-slate-500/20",
};

function getGradientForArticle(topics: string[]): string {
  for (const topic of topics) {
    const key = topic.toLowerCase();
    if (topicGradients[key]) {
      return topicGradients[key];
    }
  }
  return topicGradients.default;
}

// ============================================
// DATE FORMATTER
// ============================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ArticleInsightCard({
  article,
  className,
}: ArticleInsightCardProps) {
  const gradient = getGradientForArticle(article.topics);

  return (
    <a
      href={article.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`block group ${className || ""}`}
    >
      <Card className="overflow-hidden border hover:shadow-md transition-shadow duration-200 h-full w-[320px] sm:w-[340px] flex-shrink-0">
        {/* 16:9 Visual Header */}
        <div className="aspect-video relative overflow-hidden">
          {article.imageUrl ? (
            <>
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="340px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  // Hide broken image and show fallback
                  e.currentTarget.style.display = "none";
                }}
              />
              {/* Subtle overlay for better text contrast if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              {/* Source badge on image */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 dark:bg-black/70 rounded text-[10px] font-medium text-muted-foreground">
                {article.sourceName}
              </div>
            </>
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
            >
              <div className="text-center p-4">
                <span className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                  {article.sourceName}
                </span>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Headline - max 2 lines */}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          {/* Summary - 1 line */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {article.summary}
          </p>

          {/* Source + Date */}
          <p className="text-[10px] text-muted-foreground/70">
            {article.sourceName} &bull; {formatDate(article.publishedAt)}
          </p>

          {/* CTA */}
          <div className="flex items-center gap-1 text-xs font-medium text-primary group-hover:underline pt-1">
            Read article
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

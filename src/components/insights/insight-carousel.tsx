/**
 * INSIGHT CAROUSEL
 *
 * Paginated carousel for Industry Insights sections.
 * Features:
 * - Videos/Podcasts/Articles tabs
 * - Paginated carousel with arrow navigation + page indicators
 * - Responsive: 1 card mobile, 2 md, 3 lg, 4 xl
 * - Lazy-load thumbnails via next/image
 * - "New drop" badge for content published in last 7 days
 * - "Watched" badge for videos the user has opened
 * - Save to Library integration
 * - Click-to-play video modal
 * - Keyboard accessible (left/right arrows)
 */

"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  FileText,
  Video,
  Headphones,
  Loader2,
  LayoutGrid,
  List,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { VideoPlayerModal } from "./video-player-modal";
import { useWatchedVideos, useMarkWatched } from "@/hooks/use-watched";
import type {
  InsightSectionKey,
  InsightArticle,
  InsightVideo,
  InsightPodcast,
} from "@/lib/industry-insights/insights-service";

// ============================================
// TYPES
// ============================================

interface InsightCarouselProps {
  sectionKey: InsightSectionKey;
  className?: string;
  compact?: boolean;
  defaultViewMode?: ViewMode;
}

type TabType = "videos" | "podcasts" | "articles";
type ViewMode = "grid" | "list";

// ============================================
// CONSTANTS
// ============================================

/** Rolling window for "New drop" badge (days). */
export const NEW_DROP_DAYS = 7;

// ============================================
// API FUNCTIONS
// ============================================

async function fetchSectionContent(sectionKey: InsightSectionKey) {
  const res = await fetch(`/api/insights/section/${sectionKey}`);
  if (!res.ok) throw new Error("Failed to fetch section content");
  return res.json() as Promise<{
    articles: InsightArticle[];
    videos: InsightVideo[];
    podcasts: InsightPodcast[];
  }>;
}

async function saveToLibrary(item: {
  type: "ARTICLE" | "VIDEO" | "PODCAST" | "SHORT";
  title: string;
  url: string;
  source: string;
  thumbnail?: string;
  description?: string;
}) {
  const res = await fetch("/api/journey/saved-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Failed to save item");
  return res.json();
}

// ============================================
// HELPERS
// ============================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

/** Returns true if dateString is within the last NEW_DROP_DAYS days. */
export function isNewDrop(dateString: string): boolean {
  const date = new Date(dateString);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NEW_DROP_DAYS);
  return date >= cutoff;
}

/** Build the canonical YouTube URL used as content identifier. */
function videoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

// ============================================
// RESPONSIVE HOOK
// ============================================

function useCardsPerPage(compact?: boolean): number {
  const [count, setCount] = useState(1);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (compact) {
        // Compact: fewer cards when side-by-side at lg+
        if (w >= 1280) setCount(2);
        else if (w >= 1024) setCount(1);
        else if (w >= 768) setCount(2);
        else setCount(1);
      } else {
        if (w >= 1280) setCount(4);
        else if (w >= 1024) setCount(3);
        else if (w >= 768) setCount(2);
        else setCount(1);
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [compact]);

  return count;
}

// ============================================
// BADGES
// ============================================

function NewDropBadge() {
  return (
    <span
      className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-500 text-white rounded"
      aria-label="New drop"
    >
      New drop
    </span>
  );
}

function WatchedBadge() {
  return (
    <span
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-purple-500/90 text-white rounded"
      aria-label="Watched"
    >
      <Check className="h-2.5 w-2.5" />
      Watched
    </span>
  );
}

// ============================================
// ARTICLE CARD
// ============================================

interface ArticleCardProps {
  article: InsightArticle;
  onSave: () => void;
  isSaved: boolean;
  isSaving: boolean;
}

function ArticleCard({ article, onSave, isSaved, isSaving }: ArticleCardProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full"
    >
      <Card className="h-full overflow-hidden border hover:border-muted-foreground/50 transition-all duration-200 hover:shadow-sm">
        {article.thumbnail && (
          <div className="relative h-32 overflow-hidden bg-muted">
            <Image
              src={article.thumbnail}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {isNewDrop(article.publishedAt) && (
              <div className="absolute top-2 left-2">
                <NewDropBadge />
              </div>
            )}
          </div>
        )}

        <CardContent className="p-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded truncate">
              {article.source}
            </span>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {formatDate(article.publishedAt)}
            </span>
          </div>

          <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          {article.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {article.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <ExternalLink className="h-3 w-3" />
              Read article
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSave();
              }}
              disabled={isSaving || isSaved}
              className={cn(
                "p-1 rounded hover:bg-muted transition-colors",
                isSaved && "text-primary"
              )}
              aria-label={isSaved ? "Saved to library" : "Save to library"}
            >
              {isSaved ? (
                <BookmarkCheck className="h-3.5 w-3.5" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

// ============================================
// VIDEO CARD
// ============================================

interface VideoCardProps {
  video: InsightVideo;
  onClick: () => void;
  onSave: () => void;
  isSaved: boolean;
  isSaving: boolean;
  isWatched: boolean;
}

function VideoCard({
  video,
  onClick,
  onSave,
  isSaved,
  isSaving,
  isWatched,
}: VideoCardProps) {
  const showNewDrop = isNewDrop(video.publishedAt);
  return (
    <div className="h-full">
      <Card className="h-full overflow-hidden border hover:border-muted-foreground/50 transition-all duration-200 hover:shadow-sm">
        <button
          onClick={onClick}
          className="relative aspect-video w-full overflow-hidden bg-muted group"
        >
          <Image
            src={video.thumbnail}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play
                className="h-4 w-4 text-slate-800 ml-0.5"
                fill="currentColor"
              />
            </div>
          </div>
          {video.duration && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-white text-[10px] font-medium">
              {video.duration}
            </div>
          )}
          {/* Badges: top-left (New drop first, then Watched) */}
          {(showNewDrop || isWatched) && (
            <div className="absolute top-2 left-2 flex items-center gap-1">
              {showNewDrop && <NewDropBadge />}
              {isWatched && <WatchedBadge />}
            </div>
          )}
          {/* Source badge */}
          {video.source && video.source !== "youtube" && (
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-white text-[9px] font-medium uppercase">
              {video.source}
            </div>
          )}
        </button>

        <CardContent className="p-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium text-muted-foreground truncate">
              {video.channelTitle}
            </span>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {formatDate(video.publishedAt)}
            </span>
          </div>

          <h3
            className="font-medium text-sm leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors"
            onClick={onClick}
          >
            {video.title}
          </h3>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onClick}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Play className="h-3 w-3" />
              {isWatched ? "Watch again" : "Watch now"}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSave();
              }}
              disabled={isSaving || isSaved}
              className={cn(
                "p-1 rounded hover:bg-muted transition-colors",
                isSaved && "text-primary"
              )}
              aria-label={isSaved ? "Saved to library" : "Save to library"}
            >
              {isSaved ? (
                <BookmarkCheck className="h-3.5 w-3.5" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// PAGE INDICATOR
// ============================================

function PageIndicator({
  total,
  current,
  onSelect,
}: {
  total: number;
  current: number;
  onSelect: (i: number) => void;
}) {
  if (total <= 1) return null;

  // Show dots for up to 8 pages, else numeric
  if (total <= 8) {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`rounded-full transition-all ${
              i === current
                ? "w-4 h-1.5 bg-primary"
                : "w-1.5 h-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
            }`}
            aria-label={`Page ${i + 1}`}
          />
        ))}
      </div>
    );
  }

  return (
    <span className="text-[10px] text-muted-foreground tabular-nums">
      {current + 1} / {total}
    </span>
  );
}

// ============================================
// LIST ROW COMPONENTS
// ============================================

function ArticleListRow({
  article,
  onSave,
  isSaved,
  isSaving,
}: ArticleCardProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
    >
      {article.thumbnail && (
        <div className="relative h-12 w-16 flex-shrink-0 rounded overflow-hidden bg-muted">
          <Image
            src={article.thumbnail}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {article.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground truncate">
            {article.source}
          </span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {formatDate(article.publishedAt)}
          </span>
          {isNewDrop(article.publishedAt) && <NewDropBadge />}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSave();
        }}
        disabled={isSaving || isSaved}
        className={cn(
          "p-1.5 rounded hover:bg-muted transition-colors flex-shrink-0",
          isSaved && "text-primary"
        )}
        aria-label={isSaved ? "Saved to library" : "Save to library"}
      >
        {isSaved ? (
          <BookmarkCheck className="h-3.5 w-3.5" />
        ) : (
          <Bookmark className="h-3.5 w-3.5" />
        )}
      </button>
    </a>
  );
}

function VideoListRow({
  video,
  onClick,
  onSave,
  isSaved,
  isSaving,
  isWatched,
}: VideoCardProps) {
  return (
    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <button
        onClick={onClick}
        className="relative h-12 w-16 flex-shrink-0 rounded overflow-hidden bg-muted"
      >
        <Image
          src={video.thumbnail}
          alt=""
          fill
          sizes="64px"
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <Play className="h-3 w-3 text-white" fill="currentColor" />
        </div>
        {video.duration && (
          <div className="absolute bottom-0.5 right-0.5 px-1 py-px bg-black/80 rounded text-white text-[8px] font-medium">
            {video.duration}
          </div>
        )}
      </button>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <h4 className="text-sm font-medium leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {video.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground truncate">
            {video.channelTitle}
          </span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {formatDate(video.publishedAt)}
          </span>
          {isNewDrop(video.publishedAt) && <NewDropBadge />}
          {isWatched && <WatchedBadge />}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSave();
        }}
        disabled={isSaving || isSaved}
        className={cn(
          "p-1.5 rounded hover:bg-muted transition-colors flex-shrink-0",
          isSaved && "text-primary"
        )}
        aria-label={isSaved ? "Saved to library" : "Save to library"}
      >
        {isSaved ? (
          <BookmarkCheck className="h-3.5 w-3.5" />
        ) : (
          <Bookmark className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

// ============================================
// PODCAST CARD
// ============================================

interface PodcastCardProps {
  podcast: InsightPodcast;
  onSave: () => void;
  isSaved: boolean;
  isSaving: boolean;
}

function PodcastCard({ podcast, onSave, isSaved, isSaving }: PodcastCardProps) {
  return (
    <a
      href={podcast.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full"
    >
      <Card className="h-full overflow-hidden border hover:border-muted-foreground/50 transition-all duration-200 hover:shadow-sm">
        {podcast.thumbnail && (
          <div className="relative h-32 overflow-hidden bg-muted">
            <Image
              src={podcast.thumbnail}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {isNewDrop(podcast.publishedAt) && (
              <div className="absolute top-2 left-2">
                <NewDropBadge />
              </div>
            )}
            {podcast.duration && (
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-white text-[10px] font-medium">
                {podcast.duration}
              </div>
            )}
          </div>
        )}

        <CardContent className="p-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded truncate">
              {podcast.podcastName}
            </span>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {formatDate(podcast.publishedAt)}
            </span>
          </div>

          <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {podcast.title}
          </h3>

          {podcast.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {podcast.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Headphones className="h-3 w-3" />
              Listen · {podcast.host}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSave();
              }}
              disabled={isSaving || isSaved}
              className={cn(
                "p-1 rounded hover:bg-muted transition-colors",
                isSaved && "text-primary"
              )}
              aria-label={isSaved ? "Saved to library" : "Save to library"}
            >
              {isSaved ? (
                <BookmarkCheck className="h-3.5 w-3.5" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

// ============================================
// PODCAST LIST ROW
// ============================================

function PodcastListRow({
  podcast,
  onSave,
  isSaved,
  isSaving,
}: PodcastCardProps) {
  return (
    <a
      href={podcast.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
    >
      {podcast.thumbnail && (
        <div className="relative h-12 w-16 flex-shrink-0 rounded overflow-hidden bg-muted">
          <Image
            src={podcast.thumbnail}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Headphones className="h-3 w-3 text-white" />
          </div>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {podcast.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground truncate">
            {podcast.podcastName}
          </span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {formatDate(podcast.publishedAt)}
          </span>
          {isNewDrop(podcast.publishedAt) && <NewDropBadge />}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSave();
        }}
        disabled={isSaving || isSaved}
        className={cn(
          "p-1.5 rounded hover:bg-muted transition-colors flex-shrink-0",
          isSaved && "text-primary"
        )}
        aria-label={isSaved ? "Saved to library" : "Save to library"}
      >
        {isSaved ? (
          <BookmarkCheck className="h-3.5 w-3.5" />
        ) : (
          <Bookmark className="h-3.5 w-3.5" />
        )}
      </button>
    </a>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function InsightCarousel({
  sectionKey,
  className,
  compact,
  defaultViewMode = "grid",
}: InsightCarouselProps) {
  const [activeTab, setActiveTab] = useState<TabType>("videos");
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [selectedVideo, setSelectedVideo] = useState<InsightVideo | null>(null);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const cardsPerPage = useCardsPerPage(compact);

  // Fetch section content
  const { data, isLoading, error } = useQuery({
    queryKey: ["insights-section", sectionKey],
    queryFn: () => fetchSectionContent(sectionKey),
    staleTime: 6 * 60 * 60 * 1000,
  });

  // Fetch watched state
  const { data: watchedData } = useWatchedVideos();
  const watchedUrls = useMemo(
    () => new Set(watchedData?.watchedUrls ?? []),
    [watchedData]
  );
  const markWatched = useMarkWatched();

  const articles = data?.articles ?? [];
  const videos = data?.videos ?? [];
  const podcasts = data?.podcasts ?? [];

  // Auto-switch to best available tab
  useEffect(() => {
    if (!isLoading) {
      const tabOrder: TabType[] = ["videos", "podcasts", "articles"];
      const counts: Record<TabType, number> = {
        videos: videos.length,
        podcasts: podcasts.length,
        articles: articles.length,
      };
      if (counts[activeTab] === 0) {
        const fallback = tabOrder.find((t) => counts[t] > 0);
        if (fallback) setActiveTab(fallback);
      }
    }
  }, [isLoading, videos.length, podcasts.length, articles.length, activeTab]);

  // Reset page when tab or view mode changes
  useEffect(() => {
    setPage(0);
  }, [activeTab, viewMode]);

  // Compute pages
  const currentItems =
    activeTab === "videos"
      ? videos
      : activeTab === "podcasts"
        ? podcasts
        : articles;
  const totalPages = Math.max(1, Math.ceil(currentItems.length / cardsPerPage));
  const safeCurrentPage = Math.min(page, totalPages - 1);
  const pageItems = useMemo(
    () =>
      currentItems.slice(
        safeCurrentPage * cardsPerPage,
        safeCurrentPage * cardsPerPage + cardsPerPage
      ),
    [currentItems, safeCurrentPage, cardsPerPage]
  );

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: saveToLibrary,
    onSuccess: (_, variables) => {
      setSavedItems((prev) => new Set(prev).add(variables.url));
      queryClient.invalidateQueries({ queryKey: ["journey-library"] });
    },
  });

  // Navigation
  const goPrev = useCallback(() => {
    setPage((p) => (p > 0 ? p - 1 : totalPages - 1));
  }, [totalPages]);

  const goNext = useCallback(() => {
    setPage((p) => (p < totalPages - 1 ? p + 1 : 0));
  }, [totalPages]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    },
    [goPrev, goNext]
  );

  // Save handlers
  const handleSaveArticle = useCallback(
    (article: InsightArticle) => {
      saveMutation.mutate({
        type: "ARTICLE",
        title: article.title,
        url: article.url,
        source: article.source,
        thumbnail: article.thumbnail,
        description: article.description,
      });
    },
    [saveMutation]
  );

  const handleSaveVideo = useCallback(
    (video: InsightVideo) => {
      const url = videoUrl(video.videoId);
      saveMutation.mutate({
        type: "VIDEO",
        title: video.title,
        url,
        source: video.channelTitle,
        thumbnail: video.thumbnail,
        description: video.description,
      });
    },
    [saveMutation]
  );

  const handleSavePodcast = useCallback(
    (podcast: InsightPodcast) => {
      saveMutation.mutate({
        type: "PODCAST",
        title: podcast.title,
        url: podcast.externalUrl,
        source: podcast.podcastName,
        thumbnail: podcast.thumbnail,
        description: podcast.description,
      });
    },
    [saveMutation]
  );

  // Open video → mark as watched
  const handleOpenVideo = useCallback(
    (video: InsightVideo) => {
      setSelectedVideo(video);
      const url = videoUrl(video.videoId);
      if (!watchedUrls.has(url)) {
        markWatched.mutate(url);
      }
    },
    [watchedUrls, markWatched]
  );

  const hasItems = currentItems.length > 0;
  const hasAnyContent =
    articles.length > 0 || videos.length > 0 || podcasts.length > 0;

  return (
    <div
      className={className}
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header: Tabs + View Toggle + Nav */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-muted/50 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab("videos")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                activeTab === "videos"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Video className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Videos</span>
              {videos.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {videos.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("podcasts")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                activeTab === "podcasts"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Headphones className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Podcasts</span>
              {podcasts.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {podcasts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("articles")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                activeTab === "articles"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Articles</span>
              {articles.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {articles.length}
                </span>
              )}
            </button>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-muted/50 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="List view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation (hidden in list mode) */}
        {viewMode === "grid" && hasItems && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <PageIndicator
              total={totalPages}
              current={safeCurrentPage}
              onSelect={setPage}
            />
            <div className="flex items-center gap-1">
              <button
                onClick={goPrev}
                className="p-1.5 rounded-md border border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={goNext}
                className="p-1.5 rounded-md border border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Unable to load content. Please try again later.
        </div>
      ) : !hasAnyContent ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Content coming soon.
        </div>
      ) : !hasItems ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No {activeTab} available for this section.
        </div>
      ) : viewMode === "list" ? (
        <div className="max-h-[400px] overflow-y-auto space-y-0.5 rounded-lg border bg-background/50 p-1">
          {activeTab === "articles" &&
            (currentItems as InsightArticle[]).map((article) => (
              <ArticleListRow
                key={article.id}
                article={article}
                onSave={() => handleSaveArticle(article)}
                isSaved={savedItems.has(article.url)}
                isSaving={saveMutation.isPending}
              />
            ))}
          {activeTab === "videos" &&
            (currentItems as InsightVideo[]).map((video) => (
              <VideoListRow
                key={video.id}
                video={video}
                onClick={() => handleOpenVideo(video)}
                onSave={() => handleSaveVideo(video)}
                isSaved={savedItems.has(videoUrl(video.videoId))}
                isSaving={saveMutation.isPending}
                isWatched={watchedUrls.has(videoUrl(video.videoId))}
              />
            ))}
          {activeTab === "podcasts" &&
            (currentItems as InsightPodcast[]).map((podcast) => (
              <PodcastListRow
                key={podcast.id}
                podcast={podcast}
                onSave={() => handleSavePodcast(podcast)}
                isSaved={savedItems.has(podcast.externalUrl)}
                isSaving={saveMutation.isPending}
              />
            ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-3 transition-opacity duration-200",
            cardsPerPage === 1 && "grid-cols-1",
            cardsPerPage === 2 && "grid-cols-2",
            cardsPerPage === 3 && "grid-cols-3",
            cardsPerPage === 4 && "grid-cols-4"
          )}
        >
          {activeTab === "articles" &&
            (pageItems as InsightArticle[]).map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onSave={() => handleSaveArticle(article)}
                isSaved={savedItems.has(article.url)}
                isSaving={saveMutation.isPending}
              />
            ))}
          {activeTab === "videos" &&
            (pageItems as InsightVideo[]).map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => handleOpenVideo(video)}
                onSave={() => handleSaveVideo(video)}
                isSaved={savedItems.has(videoUrl(video.videoId))}
                isSaving={saveMutation.isPending}
                isWatched={watchedUrls.has(videoUrl(video.videoId))}
              />
            ))}
          {activeTab === "podcasts" &&
            (pageItems as InsightPodcast[]).map((podcast) => (
              <PodcastCard
                key={podcast.id}
                podcast={podcast}
                onSave={() => handleSavePodcast(podcast)}
                isSaved={savedItems.has(podcast.externalUrl)}
                isSaving={saveMutation.isPending}
              />
            ))}
        </div>
      )}

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        video={
          selectedVideo
            ? {
                videoId: selectedVideo.videoId,
                title: selectedVideo.title,
                channelTitle: selectedVideo.channelTitle,
                description: selectedVideo.description,
                duration: selectedVideo.duration,
                viewCount: selectedVideo.viewCount,
                publishedAt: selectedVideo.publishedAt,
              }
            : null
        }
        onSave={
          selectedVideo ? () => handleSaveVideo(selectedVideo) : undefined
        }
        isSaved={
          selectedVideo
            ? savedItems.has(videoUrl(selectedVideo.videoId))
            : false
        }
        isSaving={saveMutation.isPending}
      />
    </div>
  );
}

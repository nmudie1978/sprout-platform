"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Film, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { CareerClipCard } from "./career-clip-card";
import { CareerClipModal } from "./career-clip-modal";
import type { CareerClipForDisplay } from "@/lib/career-clips/types";

interface CareerClipsModuleProps {
  careerSlug?: string;
  categorySlug?: string;
  className?: string;
}

interface ClipsApiResponse {
  clips?: CareerClipForDisplay[];
  categories?: {
    category: string;
    categoryLabel: string;
    clips: CareerClipForDisplay[];
  }[];
  count: number;
}

/**
 * Career Clips Module
 *
 * Displays curated, verified career clips in the My Journey Explore section.
 * Key features:
 * - No infinite scroll, no autoplay with sound, no likes/comments
 * - Max 3 clips per screen section on mobile, 6 on desktop grid
 * - Only shows validated clips (broken links never displayed)
 * - Clear CTA to continue journey after viewing
 */
export function CareerClipsModule({
  careerSlug,
  categorySlug,
  className,
}: CareerClipsModuleProps) {
  const [selectedClip, setSelectedClip] = useState<CareerClipForDisplay | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  // Determine if we should fetch grouped or filtered clips
  const isFiltered = Boolean(careerSlug || categorySlug);

  // Fetch clips
  const { data, isLoading, error } = useQuery<ClipsApiResponse>({
    queryKey: ["career-clips", careerSlug, categorySlug, isFiltered],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (careerSlug) params.set("career_slug", careerSlug);
      if (categorySlug) params.set("category_slug", categorySlug);
      if (!isFiltered) params.set("grouped", "true");
      params.set("limit", "6");

      const response = await fetch(`/api/career-clips?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch clips");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const handleClipClick = (clip: CareerClipForDisplay) => {
    setSelectedClip(clip);
    setModalOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[9/16] rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state - no valid clips available
  if (error || !data || data.count === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-muted">
              <Film className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Career Clips</h3>
              <p className="text-xs text-muted-foreground">
                Quick, real-world snippets
              </p>
            </div>
          </div>

          <div className="text-center py-8 px-4">
            <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium">No verified clips right now</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              We'll add more soon — continue your journey to build a real plan.
            </p>
            <Button asChild size="sm">
              <Link href="/my-journey/build">
                Continue my journey
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grouped view (multiple categories)
  if (data.categories && data.categories.length > 0) {
    return (
      <>
        <Card className={className}>
          <CardContent className="p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-pink-500/20"
                whileHover={{ scale: 1.05 }}
              >
                <Film className="h-5 w-5 text-purple-600" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-sm">Career Clips</h3>
                <p className="text-xs text-muted-foreground">
                  Quick, real-world snippets — then we map what it takes.
                </p>
              </div>
            </div>

            {/* Categories with clips */}
            <div className="space-y-6">
              {data.categories.map((category, catIndex) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.1 }}
                >
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    {category.categoryLabel}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {category.clips.slice(0, 3).map((clip) => (
                      <CareerClipCard
                        key={clip.id}
                        clip={clip}
                        onClick={() => handleClipClick(clip)}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <CareerClipModal
          clip={selectedClip}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </>
    );
  }

  // Filtered view (single career or category)
  const clips = data.clips || [];

  return (
    <>
      <Card className={className}>
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-pink-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <Film className="h-5 w-5 text-purple-600" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-sm">Career Clips</h3>
              <p className="text-xs text-muted-foreground">
                Quick, real-world snippets — then we map what it takes.
              </p>
            </div>
          </div>

          {/* Clips grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {clips.slice(0, 6).map((clip, index) => (
              <motion.div
                key={clip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CareerClipCard
                  clip={clip}
                  onClick={() => handleClipClick(clip)}
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CareerClipModal
        clip={selectedClip}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}

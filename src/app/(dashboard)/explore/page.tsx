"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CareerSwipeCard } from "@/components/career-swipe-card";
import { CareerDetailModal } from "@/components/career-detail-modal";
import { useToast } from "@/hooks/use-toast";
import { hasRelevantSkills } from "@/lib/skills-mapping";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  X,
  Bookmark,
  RotateCcw,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  // Fetch unseen career cards
  const { data: cards, isLoading } = useQuery({
    queryKey: ["career-cards-unseen"],
    queryFn: async () => {
      const response = await fetch("/api/careers?unseen=true");
      if (!response.ok) throw new Error("Failed to fetch cards");
      return response.json();
    },
  });

  // Fetch user's skill levels from optimized endpoint
  const { data: userSkills } = useQuery({
    queryKey: ["user-skills"],
    queryFn: async () => {
      const response = await fetch("/api/profile/skills");
      if (!response.ok) return {};
      return response.json();
    },
    enabled: !!session?.user.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const swipeMutation = useMutation({
    mutationFn: async ({
      careerCardId,
      direction,
    }: {
      careerCardId: string;
      direction: string;
    }) => {
      const response = await fetch("/api/careers/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerCardId, direction }),
      });

      if (!response.ok) throw new Error("Failed to record swipe");
      return response.json();
    },
    onSuccess: (data, variables) => {
      if (variables.direction === "RIGHT") {
        toast({
          title: "Interested!",
          description: "Career saved to your list.",
        });
      } else if (variables.direction === "UP") {
        toast({
          title: "Saved for later",
          description: "You can review this career anytime.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["career-cards-unseen"] });
      queryClient.invalidateQueries({ queryKey: ["saved-careers"] });
    },
  });

  const handleSwipe = (direction: "LEFT" | "RIGHT" | "UP") => {
    if (!cards || currentIndex >= cards.length) return;

    const card = cards[currentIndex];
    swipeMutation.mutate({
      careerCardId: card.id,
      direction,
    });

    // Move to next card
    setCurrentIndex((prev) => prev + 1);
  };

  // Skip to next without recording (just navigation)
  const handleSkip = () => {
    if (!cards || currentIndex >= cards.length - 1) return;
    handleSwipe("LEFT");
  };

  // Go back to previous card (if possible)
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") handleSkip();
    if (e.key === "ArrowRight") handleSwipe("RIGHT");
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, cards]);

  // Reset currentIndex when cards change
  useEffect(() => {
    if (cards && cards.length > 0 && currentIndex >= cards.length) {
      setCurrentIndex(0);
    }
  }, [cards]);

  if (session?.user.role !== "YOUTH") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Only youth users can explore careers.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const currentCard = cards?.[currentIndex];
  const remainingCards = cards ? cards.length - currentIndex : 0;

  // Calculate matched skills for current card
  const matchedSkills =
    currentCard && userSkills
      ? currentCard.traits.filter((trait: string) =>
          hasRelevantSkills(userSkills, [trait], 10)
        )
      : [];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">
          Explore Careers
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover roles that match your interests
        </p>
      </div>

      {/* Progress */}
      {cards && cards.length > 0 && (
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {currentIndex + 1} of {cards.length}
          </span>
          <span className="text-muted-foreground">
            {remainingCards} remaining
          </span>
        </div>
      )}

      {/* Main Content Area */}
      {currentCard ? (
        <div className="relative">
          {/* Navigation Arrows - Left */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 h-12 w-12 rounded-full border-2 shadow-md z-10 hidden md:flex"
            onClick={handleSkip}
            disabled={swipeMutation.isPending}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Card */}
          <CareerSwipeCard
            card={currentCard}
            matchedSkills={matchedSkills}
            onShowDetails={() => setSelectedCard(currentCard)}
          />

          {/* Navigation Arrows - Right */}
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 h-12 w-12 rounded-full border-2 shadow-md z-10 hidden md:flex"
            onClick={() => handleSwipe("RIGHT")}
            disabled={swipeMutation.isPending}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 max-w-[140px] border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
              onClick={handleSkip}
              disabled={swipeMutation.isPending}
            >
              <X className="h-5 w-5 mr-2" />
              Skip
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex-1 max-w-[140px] border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950"
              onClick={() => handleSwipe("UP")}
              disabled={swipeMutation.isPending}
            >
              <Bookmark className="h-5 w-5 mr-2" />
              Save
            </Button>

            <Button
              size="lg"
              className="flex-1 max-w-[140px] bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleSwipe("RIGHT")}
              disabled={swipeMutation.isPending}
            >
              <Heart className="h-5 w-5 mr-2" />
              Interested
            </Button>
          </div>

          {/* Mobile Navigation Hint */}
          <p className="mt-4 text-center text-xs text-muted-foreground md:hidden">
            Use the buttons above to navigate
          </p>

          {/* Desktop Keyboard Hint */}
          <p className="mt-4 text-center text-xs text-muted-foreground hidden md:block">
            Tip: Use ← → arrow keys to navigate
          </p>
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold">All Done!</h2>
            <p className="mb-6 text-muted-foreground">
              You've explored all available careers.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Button asChild>
                <Link href="/explore/saved">
                  View Saved Careers
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentIndex(0);
                  queryClient.invalidateQueries({
                    queryKey: ["career-cards-unseen"],
                  });
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link to Saved */}
      {currentCard && (
        <div className="mt-6 text-center">
          <Link
            href="/explore/saved"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            View your saved careers →
          </Link>
        </div>
      )}

      {/* Career Detail Modal */}
      {selectedCard && (
        <CareerDetailModal
          card={selectedCard}
          matchedSkills={matchedSkills}
          onClose={() => setSelectedCard(null)}
          onSwipe={(direction) => {
            handleSwipe(direction);
            setSelectedCard(null);
          }}
        />
      )}
    </div>
  );
}

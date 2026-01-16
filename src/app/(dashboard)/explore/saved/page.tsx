"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CareerDetailModal } from "@/components/career-detail-modal";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  Bookmark,
  ArrowLeft,
  Banknote,
  TrendingUp,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export default function SavedCareersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const { data: savedCareers, isLoading } = useQuery({
    queryKey: ["saved-careers"],
    queryFn: async () => {
      const response = await fetch("/api/careers/saved");
      if (!response.ok) throw new Error("Failed to fetch saved careers");
      return response.json();
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: async (careerCardId: string) => {
      const response = await fetch(
        `/api/careers/saved?careerCardId=${careerCardId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to unsave career");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Removed from saved",
        description: "Career removed from your saved list.",
      });
      queryClient.invalidateQueries({ queryKey: ["saved-careers"] });
      queryClient.invalidateQueries({ queryKey: ["career-cards-unseen"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove career",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading saved careers...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/explore">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Explore
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Saved Careers</h1>
        <p className="mt-2 text-muted-foreground">
          Careers you're interested in exploring further
        </p>
      </div>

      {/* Saved Careers Grid */}
      {savedCareers && savedCareers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {savedCareers.map((saved: any) => {
            const card = saved.careerCard;
            return (
              <Card
                key={saved.id}
                className="relative overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div className="absolute right-4 top-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => unsaveMutation.mutate(card.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{card.roleName}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {card.summary}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key traits */}
                  <div className="flex flex-wrap gap-2">
                    {card.traits.slice(0, 4).map((trait: string) => (
                      <Badge key={trait} variant="secondary">
                        {trait}
                      </Badge>
                    ))}
                    {card.traits.length > 4 && (
                      <Badge variant="outline">+{card.traits.length - 4}</Badge>
                    )}
                  </div>

                  {/* Salary */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Banknote className="h-4 w-4" />
                    {card.salaryBand}
                  </div>

                  {/* Saved date */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Bookmark className="h-3 w-3" />
                      Saved {new Date(saved.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* View Details Button */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedCard(card)}
                  >
                    View Full Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Bookmark className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-semibold">
              No Saved Careers Yet
            </h2>
            <p className="mb-6 text-muted-foreground">
              Start exploring and save careers you're interested in
            </p>
            <Button asChild>
              <Link href="/explore">
                <TrendingUp className="mr-2 h-4 w-4" />
                Explore Careers
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Career Detail Modal */}
      {selectedCard && (
        <CareerDetailModal
          card={selectedCard}
          matchedSkills={[]} // Could enhance with skill matching here too
          onClose={() => setSelectedCard(null)}
          onSwipe={() => {
            // No swipe action needed from saved page
            setSelectedCard(null);
          }}
        />
      )}
    </div>
  );
}

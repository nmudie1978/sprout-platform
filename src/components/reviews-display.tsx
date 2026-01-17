"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ReviewsDisplayProps {
  userId: string;
  userRole: "YOUTH" | "EMPLOYER";
}

const categoryLabels: Record<string, string> = {
  BABYSITTING: "Babysitting",
  DOG_WALKING: "Dog Walking",
  SNOW_CLEARING: "Snow Clearing",
  CLEANING: "Cleaning",
  DIY_HELP: "DIY Help",
  TECH_HELP: "Tech Help",
  ERRANDS: "Errands",
  OTHER: "Other",
};

export function ReviewsDisplay({ userId, userRole }: ReviewsDisplayProps) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", userId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading reviews...
        </CardContent>
      </Card>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No reviews yet
        </CardContent>
      </Card>
    );
  }

  // Calculate average ratings
  const avgOverall =
    reviews.reduce((sum: number, r: any) => sum + r.overall, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="border-2 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reviews ({reviews.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
              <span className="text-3xl font-bold">{avgOverall.toFixed(1)}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review: any) => {
          const reviewerName =
            review.reviewer.role === "EMPLOYER"
              ? review.reviewer.employerProfile?.companyName
              : review.reviewer.youthProfile?.displayName;

          return (
            <Card key={review.id} className="border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{reviewerName}</p>
                      {review.reviewer.role === "EMPLOYER" &&
                        review.reviewer.employerProfile?.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                    </div>
                    {review.job && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        {review.job.title}
                        {review.job.category && (
                          <span className="text-xs">
                            • {categoryLabels[review.job.category]}
                          </span>
                        )}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    <span className="text-xl font-bold">{review.overall}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Rating Breakdown */}
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Punctuality</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium">{review.punctuality}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Communication</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium">{review.communication}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Reliability</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium">{review.reliability}</span>
                    </div>
                  </div>
                </div>

                {/* Positive Tags */}
                {review.positiveTags && review.positiveTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {review.positiveTags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Written Comment */}
                {review.comment && (
                  <div className="mt-3 p-3 rounded-lg bg-muted/50 border">
                    <p className="text-sm italic">"{review.comment}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

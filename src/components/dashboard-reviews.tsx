"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Briefcase, Award, Trophy, Medal, Clock, MessageCircle, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardReviewsProps {
  className?: string;
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

const getTierConfig = (isJobPoster: boolean) => ({
  GOLD: {
    label: isJobPoster ? "Gold Poster" : "Gold Worker",
    icon: Trophy,
    bgGradient: "from-yellow-400 via-yellow-500 to-amber-500",
    borderColor: "border-yellow-400",
    textColor: "text-yellow-600",
    bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
    requirement: "10+ reviews with 4.5+ avg",
  },
  SILVER: {
    label: isJobPoster ? "Silver Poster" : "Silver Worker",
    icon: Medal,
    bgGradient: "from-slate-300 via-slate-400 to-slate-500",
    borderColor: "border-slate-400",
    textColor: "text-slate-600",
    bgColor: "bg-gradient-to-br from-slate-50 to-gray-100",
    requirement: "5+ reviews with 4.0+ avg",
  },
  BRONZE: {
    label: isJobPoster ? "Bronze Poster" : "Bronze Worker",
    icon: Award,
    bgGradient: "from-amber-600 via-amber-700 to-orange-700",
    borderColor: "border-amber-600",
    textColor: "text-amber-700",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
    requirement: "2+ reviews with 3.5+ avg",
  },
  NONE: {
    label: isJobPoster ? "New Poster" : "New Worker",
    icon: Star,
    bgGradient: "from-gray-400 to-gray-500",
    borderColor: "border-gray-300",
    textColor: "text-gray-600",
    bgColor: "bg-gradient-to-br from-gray-50 to-slate-50",
    requirement: isJobPoster ? "Get more reviews to earn a tier" : "Complete more jobs to earn a tier",
  },
});

// Star rating component
function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : star - 0.5 <= rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

// Rating bar for distribution
function RatingBar({ count, total, stars }: { count: number; total: number; stars: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3">{stars}</span>
      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="w-8 text-right text-muted-foreground">{count}</span>
    </div>
  );
}

export function DashboardReviews({ className }: DashboardReviewsProps) {
  const { data: session } = useSession();
  const isJobPoster = session?.user?.role === "EMPLOYER";
  const tierConfig = getTierConfig(isJobPoster);

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-reviews-stats"],
    queryFn: async () => {
      const response = await fetch("/api/reviews");
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className={cn("border-2", className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-muted rounded-full" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-2", className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          Failed to load reviews
        </CardContent>
      </Card>
    );
  }

  const { reviews = [], stats } = data || {};
  const tierKey = (stats?.tier || "NONE") as keyof typeof tierConfig;
  const tier = tierConfig[tierKey];
  const TierIcon = tier.icon;

  // No reviews state
  if (!reviews.length) {
    return (
      <Card className={cn("border-2", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Your Reviews
          </CardTitle>
          <CardDescription>
            {isJobPoster
              ? "Build your reputation by treating workers well"
              : "Build your reputation by completing jobs"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No reviews yet</p>
            <p className="text-sm text-muted-foreground">
              {isJobPoster
                ? "Workers will leave reviews after completing jobs for you"
                : "Complete jobs to start building your reputation"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Rating Overview Card with Tier */}
      <Card className={cn("border-2 overflow-hidden", tier.bgColor)}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Your Rating
              </CardTitle>
              <CardDescription>Based on {stats.totalReviews} reviews</CardDescription>
            </div>
            {/* Tier Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg",
                `bg-gradient-to-r ${tier.bgGradient}`,
                "text-white font-semibold text-sm"
              )}
            >
              <TierIcon className="h-4 w-4" />
              {tier.label}
            </motion.div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Overall Rating */}
            <div className="flex flex-col items-center justify-center py-4">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-6xl font-bold gradient-text mb-2"
              >
                {stats.avgOverall}
              </motion.div>
              <StarRating rating={stats.avgOverall} size="lg" />
              <p className="text-sm text-muted-foreground mt-2">Overall Rating</p>
            </div>

            {/* Right: Category Ratings (Airbnb style) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Punctuality</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={stats.avgPunctuality} size="sm" />
                  <span className="font-semibold text-sm w-6">{stats.avgPunctuality}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Communication</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={stats.avgCommunication} size="sm" />
                  <span className="font-semibold text-sm w-6">{stats.avgCommunication}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Reliability</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={stats.avgReliability} size="sm" />
                  <span className="font-semibold text-sm w-6">{stats.avgReliability}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tier Progress Hint */}
          {stats.tier !== "GOLD" && (
            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground">
                {stats.tier === "NONE" && (isJobPoster
                  ? "Get 2+ reviews with 3.5+ rating to earn Bronze tier"
                  : "Complete 2+ jobs with 3.5+ rating to earn Bronze tier")}
                {stats.tier === "BRONZE" && "Get 5+ reviews with 4.0+ avg to reach Silver tier"}
                {stats.tier === "SILVER" && "Get 10+ reviews with 4.5+ avg to reach Gold tier"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Distribution & Tags Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card className="border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <RatingBar
                key={stars}
                stars={stars}
                count={stats.distribution[stars] || 0}
                total={stats.totalReviews}
              />
            ))}
          </CardContent>
        </Card>

        {/* Top Tags */}
        <Card className="border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {isJobPoster ? "What Workers Say" : "What Job Posters Say"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topTags && stats.topTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stats.topTags.map(({ tag, count }: { tag: string; count: number }) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {tag} ({count})
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tags yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.slice(0, 3).map((review: any) => {
            const reviewerName =
              review.reviewer?.employerProfile?.companyName ||
              review.reviewer?.youthProfile?.displayName ||
              "Anonymous";

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-muted/30 border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{reviewerName}</p>
                      {review.reviewer?.employerProfile?.verified && (
                        <Badge variant="secondary" className="text-xs py-0">
                          Verified
                        </Badge>
                      )}
                    </div>
                    {review.job && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Briefcase className="h-3 w-3" />
                        {review.job.title}
                        {review.job.category && (
                          <span>• {categoryLabels[review.job.category]}</span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{review.overall}</span>
                  </div>
                </div>

                {review.positiveTags && review.positiveTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {review.positiveTags.slice(0, 3).map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs py-0 bg-primary/5"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {review.comment && (
                  <p className="text-sm text-muted-foreground italic">
                    "{review.comment}"
                  </p>
                )}

                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(review.createdAt)}
                </p>
              </motion.div>
            );
          })}

          {reviews.length > 3 && (
            <p className="text-center text-sm text-muted-foreground pt-2">
              + {reviews.length - 3} more reviews
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

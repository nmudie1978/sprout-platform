"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/avatar";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Star,
  Briefcase,
  MessageSquare,
  Check,
  X,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Recommendation {
  id: string;
  message: string | null;
  status: "PENDING" | "VIEWED" | "CONTACTED" | "HIRED" | "DISMISSED";
  createdAt: string;
  recommender: {
    id: string;
    youthProfile: {
      displayName: string;
      avatarId: string | null;
      completedJobsCount: number;
      averageRating: number | null;
    } | null;
  };
  recommended: {
    id: string;
    youthProfile: {
      displayName: string;
      avatarId: string | null;
      completedJobsCount: number;
      averageRating: number | null;
      bio: string | null;
      skillTags: string[];
    } | null;
  };
}

interface JobRecommendationsProps {
  jobId: string;
  isEmployer: boolean;
}

const statusConfig = {
  PENDING: { label: "New", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  VIEWED: { label: "Viewed", color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
  CONTACTED: { label: "Contacted", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  HIRED: { label: "Hired", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  DISMISSED: { label: "Dismissed", color: "bg-red-500/10 text-red-600 border-red-500/20" },
};

export function JobRecommendations({ jobId, isEmployer }: JobRecommendationsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recommendations = [], isLoading } = useQuery<Recommendation[]>({
    queryKey: ["recommendations", jobId],
    queryFn: async () => {
      const response = await fetch(`/api/recommendations?jobId=${jobId}`);
      if (!response.ok) throw new Error("Failed to fetch recommendations");
      return response.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/recommendations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations", jobId] });
      toast({
        title: "Status updated",
        description: "The recommendation status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update",
        description: "Could not update the recommendation status.",
        variant: "destructive",
      });
    },
  });

  // Filter to show only active recommendations for display count
  const activeRecommendations = recommendations.filter((r) => r.status !== "DISMISSED");

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't show section if no recommendations
  }

  return (
    <Card className="border-2 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-purple-500" />
            Recommendations
            {activeRecommendations.length > 0 && (
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 ml-1">
                {activeRecommendations.length}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-3">
        <AnimatePresence>
          {recommendations.map((rec, index) => {
            const isExpanded = expandedId === rec.id;
            const profile = rec.recommended.youthProfile;
            const recommenderProfile = rec.recommender.youthProfile;
            const status = statusConfig[rec.status];

            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl border transition-all ${
                  rec.status === "DISMISSED" ? "opacity-50" : ""
                }`}
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                >
                  <Avatar avatarId={profile?.avatarId} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {profile?.displayName || "Unknown"}
                      </span>
                      <Badge variant="outline" className={`text-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        by {recommenderProfile?.displayName || "Unknown"}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(rec.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile?.averageRating && (
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        {profile.averageRating.toFixed(1)}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 pt-1 border-t space-y-3">
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            {profile?.completedJobsCount || 0} jobs completed
                          </span>
                        </div>

                        {/* Skills */}
                        {profile?.skillTags && profile.skillTags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {profile.skillTags.slice(0, 5).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Recommendation message */}
                        {rec.message && (
                          <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground italic">
                              "{rec.message}"
                            </p>
                          </div>
                        )}

                        {/* Employer actions */}
                        {isEmployer && rec.status !== "DISMISSED" && rec.status !== "HIRED" && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link href={`/youth/${rec.recommended.id}`}>
                                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                                View Profile
                              </Link>
                            </Button>
                            {rec.status === "PENDING" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStatus.mutate({ id: rec.id, status: "VIEWED" });
                                }}
                                disabled={updateStatus.isPending}
                              >
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Mark Viewed
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus.mutate({ id: rec.id, status: "CONTACTED" });
                              }}
                              disabled={updateStatus.isPending}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <MessageSquare className="mr-1 h-3.5 w-3.5" />
                              Contacted
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus.mutate({ id: rec.id, status: "HIRED" });
                              }}
                              disabled={updateStatus.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="mr-1 h-3.5 w-3.5" />
                              Hired
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus.mutate({ id: rec.id, status: "DISMISSED" });
                              }}
                              disabled={updateStatus.isPending}
                              className="text-muted-foreground hover:text-red-600"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

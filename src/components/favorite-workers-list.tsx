"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Star,
  Briefcase,
  MessageCircle,
  User,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface FavoriteWorker {
  id: string;
  youthId: string;
  displayName: string;
  avatarId: string | null;
  bio: string | null;
  skills: string[];
  completedJobsCount: number;
  averageRating: number | null;
  jobsWithYou: number;
  addedAt: string;
}

const avatarOptions: Record<string, string> = {
  avatar1: "😊",
  avatar2: "😎",
  avatar3: "🤓",
  avatar4: "😄",
  avatar5: "🙂",
  avatar6: "🌟",
  avatar7: "💪",
  avatar8: "🎯",
};

export function FavoriteWorkersList() {
  const { data: favorites, isLoading } = useQuery<FavoriteWorker[]>({
    queryKey: ["favorite-workers"],
    queryFn: async () => {
      const response = await fetch("/api/favorites");
      if (!response.ok) throw new Error("Failed to fetch favorites");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            <CardTitle className="text-lg">Favorite Workers</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-4">💜</div>
          <h3 className="font-semibold text-lg mb-2">No favorites yet</h3>
          <p className="text-muted-foreground text-sm">
            Add workers to your favorites when viewing their profiles or after
            completing jobs with them
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            <CardTitle className="text-lg">Favorite Workers</CardTitle>
          </div>
          <Badge variant="secondary">{favorites.length} saved</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {favorites.map((worker, index) => (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {worker.avatarId ? (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl">
                      {avatarOptions[worker.avatarId] || "😊"}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{worker.displayName}</span>
                    {worker.averageRating && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">
                          {worker.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {worker.completedJobsCount} jobs completed
                    </span>
                    {worker.jobsWithYou > 0 && (
                      <span className="text-primary font-medium">
                        {worker.jobsWithYou} with you
                      </span>
                    )}
                  </div>

                  {worker.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {worker.skills.slice(0, 3).map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {worker.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{worker.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/profile/${worker.youthId}`}>
                      View <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/employer/hire/${worker.youthId}`}>
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Hire
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

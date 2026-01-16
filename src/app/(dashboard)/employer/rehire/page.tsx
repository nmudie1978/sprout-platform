"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Star,
  Briefcase,
  RefreshCcw,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface RehireWorker {
  youthId: string;
  displayName: string;
  avatarId: string | null;
  completedJobsCount: number;
  averageRating: number | null;
  skills: string[];
  jobsWithYou: number;
  lastJob: {
    id: string;
    title: string;
    category: string;
    payAmount: number;
    completedAt: string;
  } | null;
  recentJobs: {
    id: string;
    title: string;
    category: string;
  }[];
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

const categoryEmojis: Record<string, string> = {
  BABYSITTING: "👶",
  DOG_WALKING: "🐕",
  SNOW_CLEARING: "❄️",
  CLEANING: "🧹",
  DIY_HELP: "🔧",
  TECH_HELP: "💻",
  ERRANDS: "🏃",
  OTHER: "✨",
};

export default function RehirePage() {
  const { data: workers, isLoading } = useQuery<RehireWorker[]>({
    queryKey: ["rehire-workers"],
    queryFn: async () => {
      const response = await fetch("/api/employer/rehire");
      if (!response.ok) throw new Error("Failed to fetch workers");
      return response.json();
    },
  });

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employer">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Quick Re-hire</h1>
          <p className="text-muted-foreground">
            Hire workers you've worked with before
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          </CardContent>
        </Card>
      ) : !workers || workers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="font-semibold text-lg mb-2">No previous workers</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Complete jobs with workers to see them here for quick re-hiring
            </p>
            <Button asChild>
              <Link href="/employer/post-job">Post a Job</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workers.map((worker, index) => (
            <motion.div
              key={worker.youthId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {worker.avatarId ? (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-3xl">
                          {avatarOptions[worker.avatarId] || "😊"}
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-7 w-7 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          {worker.displayName}
                        </h3>
                        {worker.averageRating && (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">
                              {worker.averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {worker.completedJobsCount} total jobs
                        </span>
                        <span className="text-primary font-medium">
                          {worker.jobsWithYou} with you
                        </span>
                      </div>

                      {worker.lastJob && (
                        <div className="text-sm text-muted-foreground">
                          <span>Last job: </span>
                          <span className="font-medium">
                            {categoryEmojis[worker.lastJob.category] || "✨"}{" "}
                            {worker.lastJob.title}
                          </span>
                          {worker.lastJob.completedAt && (
                            <span className="ml-1">
                              (
                              {formatDistanceToNow(
                                new Date(worker.lastJob.completedAt),
                                { addSuffix: true }
                              )}
                              )
                            </span>
                          )}
                        </div>
                      )}

                      {worker.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {worker.skills.slice(0, 4).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0">
                      <Button asChild>
                        <Link href={`/employer/hire/${worker.youthId}`}>
                          <RefreshCcw className="h-4 w-4 mr-2" />
                          Hire Again
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

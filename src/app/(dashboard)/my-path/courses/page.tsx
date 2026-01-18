"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Clock,
  ExternalLink,
  Archive,
  CheckCircle2,
} from "lucide-react";
import { getCoursesForMe, createVaultItem, type CourseRecommendation } from "@/lib/my-path/actions";
import { toast } from "sonner";

export default function CoursesPage() {
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery<CourseRecommendation[]>({
    queryKey: ["courses-for-me"],
    queryFn: () => getCoursesForMe(),
    staleTime: 5 * 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: (course: CourseRecommendation) =>
      createVaultItem({
        type: "certificate",
        title: course.title,
        description: `Course from ${course.provider}. ${course.reason}`,
        metadata: {
          provider: course.provider,
          duration: course.duration,
          cost: course.cost,
          link: course.link ?? null,
        },
      }),
    onSuccess: () => {
      toast.success("Saved to Vault");
      queryClient.invalidateQueries({ queryKey: ["vault-items"] });
    },
    onError: () => {
      toast.error("Failed to save");
    },
  });

  if (isLoading) {
    return <CoursesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Courses for you</h2>
        <p className="text-sm text-muted-foreground">
          Curated learning resources based on your interests and skill gaps
        </p>
      </div>

      {/* Course List */}
      {courses && courses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id} className="border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {course.provider}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {course.duration}
                  </Badge>
                  <Badge
                    variant={course.cost === "Free" ? "default" : "outline"}
                    className={
                      course.cost === "Free"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-xs"
                        : "text-xs"
                    }
                  >
                    {course.cost}
                  </Badge>
                </div>

                {/* Reason */}
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                    {course.reason}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {course.link && (
                    <a
                      href={course.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="default" size="sm" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View course
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveMutation.mutate(course)}
                    disabled={saveMutation.isPending}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">No courses available</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for new learning opportunities
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Note */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            Completing courses and adding certificates to your Vault strengthens your profile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function CoursesSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

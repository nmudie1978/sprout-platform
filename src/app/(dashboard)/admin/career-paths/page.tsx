"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Loader2, MapPin, GraduationCap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "PENDING" | "APPROVED" | "REJECTED";

interface PathContribution {
  id: string;
  displayName: string;
  currentTitle: string;
  country: string;
  city: string | null;
  steps: { age: number; label: string }[];
  careerTags: string[];
  didAttendUniversity: boolean;
  yearsOfExperience: number | null;
  headline: string | null;
  advice: string | null;
  submittedByEmail: string | null;
  status: Status;
  createdAt: string;
}

export default function AdminCareerPathsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Status>("PENDING");

  const { data, isLoading } = useQuery<{ paths: PathContribution[] }>({
    queryKey: ["admin-career-paths", filter],
    queryFn: async () => {
      const res = await fetch(`/api/admin/career-paths?status=${filter}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const res = await fetch("/api/admin/career-paths", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-career-paths"] });
    },
  });

  const paths = data?.paths ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-1">Career Path Contributions</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Review paths submitted by parents and professionals. Approved paths
        appear in the Clarity tab for matching careers.
      </p>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6">
        {(["PENDING", "APPROVED", "REJECTED"] as Status[]).map((s) => (
          <Button
            key={s}
            variant={filter === s ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter(s)}
            className="text-xs"
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : paths.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No {filter.toLowerCase()} contributions.
        </p>
      ) : (
        <div className="space-y-4">
          {paths.map((path) => (
            <div
              key={path.id}
              className="rounded-xl border p-4 bg-card/50"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-semibold">{path.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {path.currentTitle} · {path.country}
                    {path.city ? `, ${path.city}` : ""}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground/60">
                    {!path.didAttendUniversity && (
                      <span className="flex items-center gap-0.5">
                        <GraduationCap className="h-3 w-3" /> No university
                      </span>
                    )}
                    {path.yearsOfExperience && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" /> {path.yearsOfExperience} years
                      </span>
                    )}
                    <span>Submitted {new Date(path.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {filter === "PENDING" && (
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                      onClick={() => reviewMutation.mutate({ id: path.id, status: "APPROVED" })}
                      disabled={reviewMutation.isPending}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => reviewMutation.mutate({ id: path.id, status: "REJECTED" })}
                      disabled={reviewMutation.isPending}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>

              {/* Headline */}
              {path.headline && (
                <p className="text-xs text-foreground/70 italic mb-2">
                  &ldquo;{path.headline}&rdquo;
                </p>
              )}

              {/* Timeline */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                {(path.steps as { age: number; label: string }[])
                  .sort((a, b) => a.age - b.age)
                  .map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-muted-foreground/50 tabular-nums w-5 text-right font-medium">
                        {s.age}
                      </span>
                      <div className="h-1 w-1 rounded-full bg-primary/30" />
                      <span className="text-foreground/70">{s.label}</span>
                    </div>
                  ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-1">
                {path.careerTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[9px] h-4 px-1.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Advice */}
              {path.advice && (
                <p className="text-[10px] text-primary/60 mt-2 pt-2 border-t">
                  Advice: &ldquo;{path.advice}&rdquo;
                </p>
              )}

              {/* Email (admin only) */}
              {path.submittedByEmail && (
                <p className="text-[9px] text-muted-foreground/30 mt-1">
                  Contact: {path.submittedByEmail}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

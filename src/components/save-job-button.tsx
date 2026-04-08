"use client";

import { Bookmark } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface SaveJobButtonProps {
  jobId: string;
  className?: string;
  /** "icon" = small heart only, "label" = heart + text */
  variant?: "icon" | "label";
}

export function SaveJobButton({ jobId, className, variant = "icon" }: SaveJobButtonProps) {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: async () => {
      const r = await fetch("/api/jobs/saved");
      if (!r.ok) return { saved: [] as { job: { id: string } }[] };
      return r.json();
    },
    staleTime: 30_000,
  });

  const isSaved = !!data?.saved?.some((s: { job: { id: string } }) => s.job.id === jobId);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        await fetch(`/api/jobs/saved?jobId=${encodeURIComponent(jobId)}`, { method: "DELETE" });
      } else {
        await fetch("/api/jobs/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-jobs"] }),
  });

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        mutation.mutate();
      }}
      aria-label={isSaved ? "Remove from saved" : "Save for later"}
      aria-pressed={isSaved}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors",
        isSaved
          ? "text-teal-500 hover:text-teal-400"
          : "text-muted-foreground/60 hover:text-foreground",
        className,
      )}
    >
      <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
      {variant === "label" && <span>{isSaved ? "Saved" : "Save"}</span>}
    </button>
  );
}

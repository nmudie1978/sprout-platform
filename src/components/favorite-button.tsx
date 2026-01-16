"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  youthId: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
  showLabel?: boolean;
  className?: string;
}

export function FavoriteButton({
  youthId,
  size = "sm",
  variant = "outline",
  showLabel = true,
  className,
}: FavoriteButtonProps) {
  const queryClient = useQueryClient();

  // Check if worker is favorited
  const { data: favorites } = useQuery<{ youthId: string }[]>({
    queryKey: ["favorite-workers"],
    queryFn: async () => {
      const response = await fetch("/api/favorites");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const isFavorited = favorites?.some((f) => f.youthId === youthId) ?? false;

  const addMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youthId }),
      });
      if (!response.ok) throw new Error("Failed to add to favorites");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-workers"] });
      toast.success("Added to favorites");
    },
    onError: () => {
      toast.error("Failed to add to favorites");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/favorites?youthId=${youthId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove from favorites");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-workers"] });
      toast.success("Removed from favorites");
    },
    onError: () => {
      toast.error("Failed to remove from favorites");
    },
  });

  const isLoading = addMutation.isPending || removeMutation.isPending;

  const handleClick = () => {
    if (isLoading) return;
    if (isFavorited) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  return (
    <Button
      variant={isFavorited ? "default" : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        isFavorited && "bg-rose-500 hover:bg-rose-600 text-white",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn("h-4 w-4", isFavorited && "fill-current", showLabel && "mr-1")}
        />
      )}
      {showLabel && (isFavorited ? "Favorited" : "Favorite")}
    </Button>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { avatars, avatarCategories, getAvatarById, isAvatarUnlocked, type AvatarDefinition } from "@/lib/avatars";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, ChevronDown, Lock, Sparkles } from "lucide-react";

interface AvatarSelectorInlineProps {
  currentAvatarId?: string | null;
  onSelect: (avatarId: string) => void;
  disabled?: boolean;
}

export function AvatarSelectorInline({
  currentAvatarId,
  onSelect,
  disabled = false,
}: AvatarSelectorInlineProps) {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("pixel");

  const currentAvatar = currentAvatarId ? getAvatarById(currentAvatarId) : null;
  const categoryAvatars = avatars.filter((a) => a.category === selectedCategory);

  // Fetch user stats for unlock checking
  const { data: profile } = useQuery({
    queryKey: ["my-profile", session?.user?.id],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  // Calculate user stats for avatar unlocking
  const userStats = {
    jobsCompleted: profile?.completedJobsCount || 0,
    fiveStarReviews: profile?.fiveStarReviewCount || 0,
    reliabilityScore: profile?.reliabilityScore || 0,
    totalEarnings: profile?.totalEarnings || 0,
    accountAgeDays: profile?.createdAt
      ? Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
  };

  const handleSelect = (avatar: AvatarDefinition) => {
    if (!isAvatarUnlocked(avatar, userStats)) return;
    onSelect(avatar.id);
    setIsExpanded(false);
  };

  // Count unlocked avatars in each category
  const getCategoryUnlockedCount = (categoryId: string) => {
    const categoryAvatarList = avatars.filter(a => a.category === categoryId);
    return categoryAvatarList.filter(a => isAvatarUnlocked(a, userStats)).length;
  };

  return (
    <div className="w-full">
      {/* Current Avatar Display */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar
            avatarId={currentAvatarId}
            size="xl"
            className="transition-transform"
          />
        </div>
        <p className="text-sm font-medium">
          {currentAvatar?.name || "No avatar selected"}
        </p>
        <Button
          type="button"
          variant={isExpanded ? "secondary" : "outline"}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={disabled}
          className="gap-2"
        >
          {isExpanded ? (
            <>
              <X className="w-4 h-4" />
              Close
            </>
          ) : (
            <>
              <Pencil className="w-4 h-4" />
              Change Avatar
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Expandable Avatar Grid */}
      {isExpanded && (
        <div className="mt-4 p-4 rounded-xl border-2 border-primary/20 bg-muted/30 animate-in slide-in-from-top-2 duration-200">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {avatarCategories.map((category) => {
              const totalInCategory = avatars.filter(a => a.category === category.id).length;
              const unlockedInCategory = getCategoryUnlockedCount(category.id);
              const hasLocked = unlockedInCategory < totalInCategory;

              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1",
                    selectedCategory === category.id
                      ? "bg-primary text-white shadow-md"
                      : "bg-background hover:bg-muted text-muted-foreground border"
                  )}
                >
                  {category.name}
                  {(category.id === 'seasonal' || category.id === 'achievement') && (
                    <Sparkles className="w-3 h-3" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Category Description */}
          <p className="text-xs text-muted-foreground text-center mb-3">
            {avatarCategories.find((c) => c.id === selectedCategory)?.description}
          </p>

          {/* Avatar Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {categoryAvatars.map((avatar) => {
              const isSelected = currentAvatarId === avatar.id;
              const unlocked = isAvatarUnlocked(avatar, userStats);

              return (
                <button
                  type="button"
                  key={avatar.id}
                  onClick={() => handleSelect(avatar)}
                  disabled={!unlocked}
                  className={cn(
                    "relative p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary",
                    unlocked
                      ? "hover:bg-muted cursor-pointer"
                      : "opacity-50 cursor-not-allowed",
                    isSelected && "bg-primary/10 ring-2 ring-primary"
                  )}
                  title={!unlocked ? avatar.unlockRequirement?.description : avatar.name}
                >
                  <Avatar
                    avatarId={avatar.id}
                    size="sm"
                    className={cn("mx-auto", !unlocked && "grayscale")}
                    animated={false}
                  />
                  <p className="text-[9px] text-center mt-1 font-medium truncate">
                    {avatar.name}
                  </p>
                  {isSelected && unlocked && (
                    <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                  {!unlocked && (
                    <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-muted-foreground text-white flex items-center justify-center">
                      <Lock className="w-2 h-2" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Unlock hint for locked categories */}
          {(selectedCategory === 'seasonal' || selectedCategory === 'achievement') && (
            <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
                {selectedCategory === 'seasonal'
                  ? "Seasonal avatars unlock during their respective seasons"
                  : "Complete jobs and earn achievements to unlock special avatars"}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {avatars.length} avatars ({avatars.filter(a => isAvatarUnlocked(a, userStats)).length} unlocked)
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

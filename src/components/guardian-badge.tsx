"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Shield, ShieldCheck } from "lucide-react";

interface GuardianBadgeProps {
  communityName?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function GuardianBadge({
  communityName,
  size = "md",
  showTooltip = true,
}: GuardianBadgeProps) {
  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  const badge = (
    <Badge
      variant="outline"
      className={`gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 ${textSize}`}
    >
      <ShieldCheck className={iconSize} />
      Guardian
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            {communityName
              ? `Community Guardian for ${communityName}`
              : "Community Guardian"}
          </p>
          <p className="text-xs text-muted-foreground">
            Helps keep the community safe
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CommunityGuardedBadgeProps {
  communityName: string;
  guardianName?: string;
  size?: "sm" | "md" | "lg";
}

export function CommunityGuardedBadge({
  communityName,
  guardianName,
  size = "md",
}: CommunityGuardedBadgeProps) {
  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 ${textSize}`}
          >
            <Shield className={iconSize} />
            {communityName}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            This job is in the {communityName} community
          </p>
          {guardianName ? (
            <p className="text-xs text-muted-foreground">
              Guarded by {guardianName}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Community-moderated for safety
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface PausedBadgeProps {
  reason?: string;
  size?: "sm" | "md" | "lg";
}

export function PausedBadge({ reason, size = "md" }: PausedBadgeProps) {
  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  const badge = (
    <Badge
      variant="destructive"
      className={`gap-1 ${textSize}`}
    >
      <Shield className={iconSize} />
      Paused
    </Badge>
  );

  if (!reason) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="text-sm font-medium">This content is paused</p>
          <p className="text-xs text-muted-foreground max-w-xs">{reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

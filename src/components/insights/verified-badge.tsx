"use client";

import { CheckCircle2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  verifiedAt: string;
}

export function VerifiedBadge({ verifiedAt }: VerifiedBadgeProps) {
  const dateStr = new Date(verifiedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            Verified source
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Link checked and confirmed active on {dateStr}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

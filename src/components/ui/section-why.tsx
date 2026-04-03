"use client";

import { HelpCircle } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface SectionWhyProps {
  /** Short explanation of why this section matters to the user */
  why: string;
  /** Optional alignment */
  align?: "start" | "center" | "end";
}

export function SectionWhy({ why, align = "center" }: SectionWhyProps) {
  return (
    <Popover>
      {/* Wrap in a span that stops click propagation to prevent parent Link navigation */}
      <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Why this matters"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side="top"
        className="w-64 p-3 text-xs leading-relaxed text-muted-foreground/80 border-border/60"
      >
        {why}
      </PopoverContent>
      </span>
    </Popover>
  );
}

"use client";

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small bookmark toggle overlaid on a video card/embed. Saves the video into
 * My Library → My Content. Positioned absolutely by the caller (pass a
 * `className` with the corner offset). Stops pointer/click propagation so it
 * never triggers the card's own open-player handler underneath.
 */
export function SaveVideoButton({
  saved,
  onSave,
  title,
  className,
}: {
  saved: boolean;
  onSave: () => void;
  title?: string | null;
  className?: string;
}) {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!saved) onSave();
      }}
      aria-label={saved ? `Saved: ${title ?? "video"}` : `Save ${title ?? "video"}`}
      aria-pressed={saved}
      title={saved ? "Saved to My Library" : "Save to My Library"}
      className={cn(
        "absolute z-20 rounded-full bg-black/55 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
        className,
      )}
    >
      <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current")} />
    </button>
  );
}

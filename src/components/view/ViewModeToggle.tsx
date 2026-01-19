"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Rows3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list" | "compact";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
  showCompact?: boolean;
}

const viewModeConfig: Record<ViewMode, { icon: typeof LayoutGrid; label: string; title: string }> = {
  grid: {
    icon: LayoutGrid,
    label: "Grid",
    title: "Grid view",
  },
  list: {
    icon: List,
    label: "List",
    title: "List view",
  },
  compact: {
    icon: Rows3,
    label: "Compact",
    title: "Compact view",
  },
};

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
  className,
  showCompact = true,
}: ViewModeToggleProps) {
  const modes: ViewMode[] = showCompact ? ["grid", "list", "compact"] : ["grid", "list"];

  return (
    <div className={cn("flex items-center border rounded-xl p-1 bg-muted/30", className)}>
      {modes.map((mode) => {
        const config = viewModeConfig[mode];
        const Icon = config.icon;
        const isActive = viewMode === mode;

        return (
          <Button
            key={mode}
            variant={isActive ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => onViewModeChange(mode)}
            title={config.title}
            aria-label={config.title}
            aria-pressed={isActive}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
}

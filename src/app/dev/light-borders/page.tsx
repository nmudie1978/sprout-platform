"use client";

/**
 * DEV PAGE: light-mode border + sidebar-splitter contrast check.
 * Forces light mode on mount so the light tokens render. /dev/light-borders
 */

import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function LightBordersDev() {
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mock sidebar + splitter (mirrors sidebar-nav.tsx: border-r-2 border-[hsl(var(--sidebar-border))]) */}
      <div className="w-56 shrink-0 bg-sidebar border-r-2 border-[hsl(var(--sidebar-border))] p-4">
        <p className="text-sm font-semibold text-foreground">Sidebar</p>
        <p className="mt-2 text-xs text-muted-foreground">splitter on the right edge →</p>
      </div>

      {/* Canvas with representative cards at the various border opacities used on the dashboard */}
      <div className="flex-1 p-8 space-y-4 max-w-2xl">
        <p className="text-sm font-semibold text-foreground">Light-mode card borders</p>
        {([
          ["border border-border bg-card", "border-border (full)"],
          ["border border-border/60 bg-card", "border-border/60"],
          ["border border-border/40 bg-card", "border-border/40"],
          ["border border-border/30 bg-card", "border-border/30"],
          ["border border-border/20 bg-card", "border-border/20"],
        ] as const).map(([cls, label]) => (
          <div key={label} className={`rounded-card p-4 ${cls}`}>
            <p className="text-sm text-card-foreground">{label}</p>
            <div className="mt-3 rounded-control border border-border/40 bg-muted p-3">
              <p className="text-xs text-muted-foreground">nested sub-panel (border-border/40 on muted)</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

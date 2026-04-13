"use client";

import { cn } from "@/lib/utils";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";

/**
 * Compact EN / NO language toggle. Works on any page (landing, dashboard, etc.).
 * Subtle styling — blends into navigation without drawing attention.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { currentLocale, toggleLocale, isPending } = useLocaleSwitch();

  if (isPending) return null;

  return (
    <div className={cn("flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1", className)}>
      <button
        onClick={() => { if (currentLocale !== "en-GB") toggleLocale(); }}
        className={cn(
          "px-2 py-0.5 rounded text-[10px] font-medium transition-colors",
          currentLocale === "en-GB"
            ? "bg-white/10 text-white"
            : "text-white/40 hover:text-white/70"
        )}
      >
        EN
      </button>
      <span className="text-white/15 text-[10px]">|</span>
      <button
        onClick={() => { if (currentLocale !== "nb-NO") toggleLocale(); }}
        className={cn(
          "px-2 py-0.5 rounded text-[10px] font-medium transition-colors",
          currentLocale === "nb-NO"
            ? "bg-white/10 text-white"
            : "text-white/40 hover:text-white/70"
        )}
      >
        NO
      </button>
    </div>
  );
}

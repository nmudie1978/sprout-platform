"use client";

import { cn } from "@/lib/utils";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";

/**
 * Compact language toggle with flag emojis and tooltips.
 * Works on any page (landing, dashboard, etc.).
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { currentLocale, toggleLocale, isPending } = useLocaleSwitch();

  if (isPending) return null;

  return (
    <div className={cn("flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-1.5 py-1", className)}>
      <button
        onClick={() => { if (currentLocale !== "en-GB") toggleLocale(); }}
        className={cn(
          "px-1.5 py-0.5 rounded text-sm transition-all",
          currentLocale === "en-GB"
            ? "bg-white/10 scale-110"
            : "opacity-50 hover:opacity-80 grayscale hover:grayscale-0"
        )}
        title="Switch to English"
        aria-label="Switch to English"
      >
        🇬🇧
      </button>
      <span className="text-white/10 text-[10px]">|</span>
      <button
        onClick={() => { if (currentLocale !== "nb-NO") toggleLocale(); }}
        className={cn(
          "px-1.5 py-0.5 rounded text-sm transition-all",
          currentLocale === "nb-NO"
            ? "bg-white/10 scale-110"
            : "opacity-50 hover:opacity-80 grayscale hover:grayscale-0"
        )}
        title="Bytt til norsk"
        aria-label="Switch to Norwegian"
      >
        🇳🇴
      </button>
    </div>
  );
}

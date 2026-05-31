"use client";

import { cn } from "@/lib/utils";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { locales, LOCALE_META } from "@/i18n/config";

/**
 * Compact language switcher with flag emojis and tooltips.
 * Renders one button per configured locale. Works on any page.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { currentLocale, setLocale, isPending } = useLocaleSwitch();

  if (isPending) return null;

  return (
    <div className={cn("flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-1.5 py-1", className)}>
      {locales.map((loc, i) => {
        const meta = LOCALE_META[loc];
        return (
          <span key={loc} className="flex items-center gap-1">
            {i > 0 && <span className="text-white/10 text-[10px]">|</span>}
            <button
              onClick={() => setLocale(loc)}
              className={cn(
                "px-1.5 py-0.5 rounded text-sm transition-all",
                currentLocale === loc
                  ? "bg-white/10 scale-110"
                  : "opacity-50 hover:opacity-80 grayscale hover:grayscale-0"
              )}
              title={meta.title}
              aria-label={meta.title}
            >
              {meta.flag}
            </button>
          </span>
        );
      })}
    </div>
  );
}

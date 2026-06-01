"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { locales, LOCALE_META } from "@/i18n/config";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

/**
 * Language switcher as a dropdown list (flag + language name), replacing the
 * inline flag buttons. Lists every configured locale (English / Norsk /
 * Español) and ticks the active one.
 */
export function LanguageDropdown({ className }: { className?: string }) {
  const { currentLocale, setLocale, isPending } = useLocaleSwitch();
  if (isPending) return null;

  const current = LOCALE_META[currentLocale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Change language"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-border/30 bg-card px-2 py-1.5 text-sm hover:bg-muted/40 transition-colors",
          className,
        )}
      >
        <Languages className="h-3.5 w-3.5 text-muted-foreground/70" />
        <span aria-hidden>{current?.flag}</span>
        <span className="hidden sm:inline text-xs text-muted-foreground">{current?.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[9rem]">
        {locales.map((loc) => {
          const meta = LOCALE_META[loc];
          const active = loc === currentLocale;
          return (
            <DropdownMenuItem
              key={loc}
              onClick={() => setLocale(loc)}
              className="cursor-pointer gap-2"
            >
              <span aria-hidden>{meta.flag}</span>
              <span className="flex-1">{meta.label}</span>
              {active && <Check className="h-4 w-4 text-teal-500" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

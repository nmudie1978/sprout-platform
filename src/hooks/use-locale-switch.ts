"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { locales, type Locale } from "@/i18n/config";

export function useLocaleSwitch() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  /** Switch to a specific locale (no-op if already active). */
  const setLocale = (next: Locale) => {
    if (next === currentLocale) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/locale", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: next }),
        });
        if (!res.ok) return;
      } catch {
        return;
      }
      // Small delay to let the cookie propagate before refresh
      await new Promise((r) => setTimeout(r, 100));
      router.refresh();
    });
  };

  /** Advance to the next locale in the configured order (for single-button menus). */
  const cycleLocale = () => {
    const idx = locales.indexOf(currentLocale);
    setLocale(locales[(idx + 1) % locales.length]);
  };

  return { currentLocale, setLocale, cycleLocale, isPending } as const;
}

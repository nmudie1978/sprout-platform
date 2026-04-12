"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Locale } from "@/i18n/config";

export function useLocaleSwitch() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const next: Locale = currentLocale === "en-GB" ? "nb-NO" : "en-GB";

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

  return { currentLocale, toggleLocale, isPending } as const;
}

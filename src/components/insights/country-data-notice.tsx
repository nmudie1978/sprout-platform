"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Globe2 } from "lucide-react";

/**
 * Whether to show the "based on Norway" notice for a given user country.
 * Industry Insights data is Norwegian (salaries in kr, Norwegian cities/SSB)
 * with no localised equivalent yet — so for any non-Norway user we say so
 * honestly rather than present it as universal. Pure + total for testing.
 * Norway / no-country / logged-out → no notice (it's already their data).
 */
export function showsForeignDataNotice(country?: string | null): boolean {
  return !!country && country !== "Norway";
}

/**
 * Calm, country-aware banner shown above Industry Insights for non-Norway
 * users. The underlying figures stay as Norwegian illustrative data — this
 * just labels them honestly. Renders nothing for Norway/logged-out.
 */
export function CountryDataNotice() {
  const { data: session } = useSession();
  const t = useTranslations("insights");
  const country = session?.user?.youthProfile?.country ?? null;

  if (!showsForeignDataNotice(country)) return null;

  return (
    <div
      role="note"
      className="mb-6 flex items-start gap-2.5 rounded-control border border-border bg-secondary/60 px-4 py-3 text-sm text-muted-foreground"
    >
      <Globe2 className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
      <p>{t("countryNotice", { country: country as string })}</p>
    </div>
  );
}

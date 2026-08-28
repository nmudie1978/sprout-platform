import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { pricingEnquiryHref, type PricingTier } from "@/lib/pricing/tiers";

/**
 * PricingCards — a calm, theme-aware grid of pricing tiers.
 *
 * Presentational only: tier content lives in `@/lib/pricing/tiers`. Every CTA
 * is an enquiry `mailto:` — Endeavrly does not process payments, so this must
 * never grow a checkout.
 */

type PricingCardsProps = {
  tiers: PricingTier[];
  /** Column count at `lg` and above. Defaults to 3. */
  columns?: 1 | 2 | 3;
  /** Label for the enquiry button. */
  ctaLabel?: string;
  className?: string;
};

const COLUMN_CLASS: Record<1 | 2 | 3, string> = {
  1: "max-w-sm mx-auto",
  2: "sm:grid-cols-2 max-w-3xl mx-auto",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

export function PricingCards({
  tiers,
  columns = 3,
  ctaLabel = "Talk to us",
  className,
}: PricingCardsProps) {
  return (
    <div className={cn("grid gap-5", COLUMN_CLASS[columns], className)}>
      {tiers.map((tier) => (
        <PricingCard key={tier.id} tier={tier} ctaLabel={ctaLabel} />
      ))}
    </div>
  );
}

function PricingCard({ tier, ctaLabel }: { tier: PricingTier; ctaLabel: string }) {
  const featured = Boolean(tier.featured);

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-6 transition-colors",
        featured
          ? "border-primary/40 bg-primary/[0.06] shadow-sm"
          : "border-border bg-card hover:border-border/80"
      )}
    >
      {tier.badge && (
        <span className="absolute -top-3 left-6 rounded-full border border-primary/40 bg-background px-3 py-1 text-[11px] font-medium text-primary">
          {tier.badge}
        </span>
      )}

      {/* Header — tier, who it's for, indicative price */}
      <div className={cn("text-center", tier.badge && "pt-2")}>
        <p className="text-base font-semibold text-foreground">{tier.name}</p>
        <p className="mt-1 text-xs leading-snug text-muted-foreground/80 min-h-[2.5rem]">
          {tier.audience}
        </p>
        <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          {tier.price}
          {tier.priceNote && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {tier.priceNote}
            </span>
          )}
        </p>
        <p className="mt-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70">
          {tier.basis}
        </p>
      </div>

      {/* Core value */}
      <ul className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={pricingEnquiryHref(tier.name)}
        className={cn(
          "mt-7 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
          featured
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : // NB: no `bg-*/alpha` class here — the light-mode translucency
              // guard in globals.css outranks `:hover` and would fill the
              // button at rest.
              "border border-border bg-transparent text-foreground hover:bg-secondary"
        )}
      >
        {ctaLabel}
        <span className="sr-only"> about the {tier.name} plan</span>
      </a>
    </div>
  );
}

export default PricingCards;

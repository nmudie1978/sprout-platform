import Link from "next/link";
import { Building2, Home } from "lucide-react";

import { PricingCards } from "@/components/ui/pricing-cards";
import {
  FAMILY_TIERS,
  ORGANISATION_TIERS,
  PRICING_CONTACT_EMAIL,
} from "@/lib/pricing/tiers";

export const metadata = {
  title: "Pricing | Endeavrly",
  description:
    "Indicative annual pricing for schools, municipalities, public bodies, employers and families using Endeavrly.",
};

export default function PricingPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-14 max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400/80 mb-3">
          Pricing
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
          What Endeavrly costs
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Endeavrly is funded by the organisations and families who bring it to young
          people &mdash; never by advertising, and never by selling data. The ranges below
          are indicative; the final figure depends on how many people use it, which
          modules you need, and how long the agreement runs.
        </p>
      </div>

      {/* ── For organisations ─────────────────────────────── */}
      <section aria-labelledby="pricing-organisations">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
          <h2
            id="pricing-organisations"
            className="text-xl font-semibold text-foreground"
          >
            For organisations
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-8 max-w-2xl">
          Schools, colleges, municipalities, career services, national public bodies and
          employers. Most start with a pilot and grow from there.
        </p>

        <PricingCards tiers={ORGANISATION_TIERS} columns={3} />
      </section>

      {/* ── For families ──────────────────────────────────── */}
      <section
        aria-labelledby="pricing-families"
        className="mt-16 pt-12 border-t border-border"
      >
        <div className="flex items-center gap-2 mb-2">
          <Home className="h-5 w-5 text-emerald-500" aria-hidden="true" />
          <h2 id="pricing-families" className="text-xl font-semibold text-foreground">
            For families
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-8 max-w-2xl">
          If your school or municipality doesn&rsquo;t offer Endeavrly yet, a parent can
          arrange access directly for their household.
        </p>

        <PricingCards
          tiers={FAMILY_TIERS}
          columns={1}
          ctaLabel="Register interest"
        />
      </section>

      {/* ── How this works ────────────────────────────────── */}
      <section className="mt-16 pt-12 border-t border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          How this works
        </h2>
        <ul className="space-y-3 text-muted-foreground leading-relaxed max-w-2xl">
          <li>
            <strong className="text-foreground">Every plan is arranged with us.</strong>{" "}
            There are no in-app payments and no checkout &mdash; you talk to a person,
            agree the scope, and we invoice.
          </li>
          <li>
            <strong className="text-foreground">Prices are indicative.</strong> The
            ranges show where comparable organisations usually land, not a fixed rate
            card.
          </li>
          <li>
            <strong className="text-foreground">Nothing changes for young people.</strong>{" "}
            Whoever pays, the platform stays the same: no ads, no tracking, no data
            sold, no comparison between students.
          </li>
        </ul>

        <p className="mt-8 text-muted-foreground">
          Questions, or want a quote for your organisation? Email{" "}
          <a
            href={`mailto:${PRICING_CONTACT_EMAIL}?subject=${encodeURIComponent(
              "Endeavrly pricing enquiry"
            )}`}
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            {PRICING_CONTACT_EMAIL}
          </a>
          . You can also read our{" "}
          <Link
            href="/legal/eligibility"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            age &amp; eligibility
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/disclaimer"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            disclaimer
          </Link>{" "}
          pages.
        </p>
      </section>
    </div>
  );
}

import Link from "next/link";
import { Check, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { pricingFor, annualSavingPercent, formatPrice } from "@/lib/pricing/plans";
import { UPGRADE_COPY, type UpgradeReason } from "@/lib/pricing/upgrade-reasons";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Pricing | Endeavrly",
  description: "Endeavrly is free to explore. Pro turns exploration into a plan.",
};

/**
 * The consumer pricing page: two plans, nothing else.
 *
 * The institutional and family ladder moved to /pricing/organisations. A
 * 16-year-old deciding whether to pay 99 kr should not be reading about
 * municipal licence tiers.
 *
 * Prices come from lib/pricing/plans.ts and follow the signed-in user's
 * country, so a Swedish user sees SEK. Both currencies are written "kr", so
 * the figure alone cannot tell you which — which is exactly why no component
 * is allowed to hardcode it.
 */

const FREE_FEATURES = [
  "Full Career DNA",
  "Explore up to 10 careers",
  "5 Career Twin questions",
  "Basic My Journey",
  "Basic education pathways",
  "Standard reflections",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited career exploration",
  "Unlimited Career Twin",
  "Full career comparisons",
  "Events and opportunities",
  "Your personal roadmap",
  "Detailed education pathways",
  "Unlimited saved careers",
  "Progress tracking",
  "Next-step guidance",
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; from?: string }>;
}) {
  const params = await searchParams;

  // Show the user their OWN currency. Logged out falls back to the home
  // market rather than guessing from IP — the brief is explicit that country
  // comes from the profile, not geolocation.
  const session = await getServerSession(authOptions);
  let country: string | null = null;
  if (session?.user?.id) {
    try {
      country =
        (
          await prisma.youthProfile.findUnique({
            where: { userId: session.user.id },
            select: { country: true },
          })
        )?.country ?? null;
    } catch {
      // Fall back to default pricing.
    }
  }

  const pricing = pricingFor(country);
  const saving = annualSavingPercent(pricing);

  // When someone arrives from a limit, name what stopped them. Landing on a
  // generic price list after being interrupted makes the reader do the work
  // of connecting the two.
  const reason = params.reason as UpgradeReason | undefined;
  const context = reason && reason in UPGRADE_COPY ? UPGRADE_COPY[reason] : null;
  const backHref = params.from && params.from.startsWith("/") ? params.from : null;

  return (
    <div>
      <div className="mb-12">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400/80 mb-3">
          Pricing
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
          Free to explore. Pro to plan.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Endeavrly is funded by the people who use it &mdash; never by advertising, and
          never by selling data. Free is a real product, not a trial.
        </p>
      </div>

      {context && (
        <div className="mb-10 rounded-card border border-primary/20 bg-primary/[0.04] p-4">
          <p className="text-sm font-medium text-foreground">{context.headline}</p>
          <p className="text-sm text-muted-foreground mt-1">{context.body}</p>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 items-start">
        {/* ── Free ─────────────────────────────────────────────────────── */}
        <div className="rounded-card border border-border/60 bg-card/40 p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Free
          </p>
          <h2 className="text-2xl font-bold text-foreground mt-2">Discover</h2>
          <p className="text-muted-foreground mt-1 mb-5">Explore what&rsquo;s possible.</p>

          <p className="text-3xl font-bold text-foreground mb-6">
            {formatPrice(0, pricing)}
          </p>

          <ul className="space-y-2.5">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="text-foreground/80">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Pro ──────────────────────────────────────────────────────── */}
        <div className="rounded-card border-2 border-primary/30 bg-primary/[0.04] p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Pro</p>
          <h2 className="text-2xl font-bold text-foreground mt-2">Plan</h2>
          <p className="text-muted-foreground mt-1 mb-5">
            Turn exploration into a personal career plan.
          </p>

          <div className="mb-6">
            <p className="text-3xl font-bold text-foreground">
              {formatPrice(pricing.pro.month, pricing)}
              <span className="text-base font-normal text-muted-foreground"> / month</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or {formatPrice(pricing.pro.year, pricing)} a year
              {saving > 0 && <> &mdash; {saving}% less</>}
            </p>
          </div>

          <ul className="space-y-2.5 mb-6">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-foreground/90">{f}</span>
              </li>
            ))}
          </ul>

          {/* Checkout is not built yet. Saying so is better than a button that
              does nothing, or a promise the product cannot keep today. */}
          <Button disabled className="w-full" aria-describedby="pro-availability">
            Coming soon
          </Button>
          <p id="pro-availability" className="text-xs text-muted-foreground mt-2 text-center">
            Pro isn&rsquo;t on sale yet. Everything above is free while we finish it.
          </p>
        </div>
      </div>

      {backHref && (
        <p className="mt-8 text-sm">
          <Link href={backHref} className="text-primary hover:underline">
            &larr; Back to what you were doing
          </Link>
        </p>
      )}

      <div className="mt-14 rounded-card border border-border/50 bg-card/30 p-5">
        <div className="flex items-start gap-3">
          <Building2 className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">
              Bringing Endeavrly to a school, council or employer?
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Organisations and families are priced separately.{" "}
              <Link href="/pricing/organisations" className="text-primary hover:underline">
                See organisation pricing
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

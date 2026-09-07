"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface Allowance {
  used: number;
  limit: number | null;
  remaining: number | null;
  allowed: boolean;
}

interface EntitlementsResponse {
  plan: "FREE" | "PRO";
  country: string | null;
  currency: string;
  expiresAt: string | null;
  grantedBy: string | null;
  allowances: {
    careerExplorations: Allowance;
    careerTwinQuestions: Allowance;
    savedCareers: Allowance;
  };
}

/** One allowance row. Shows "Unlimited" rather than a number for Pro. */
function AllowanceRow({ label, a }: { label: string; a: Allowance }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums text-foreground">
        {a.limit === null ? "Unlimited" : `${a.used} / ${a.limit}`}
      </span>
    </div>
  );
}

/**
 * The subscription section of the account page.
 *
 * Renders nothing while loading or on error rather than showing a skeleton or
 * an error card. This sits among a page of working settings; a broken-looking
 * billing box would worry someone far more than its absence, and nothing here
 * is essential to the page's purpose.
 */
export function SubscriptionCard() {
  const { data } = useQuery<EntitlementsResponse>({
    queryKey: ["entitlements"],
    queryFn: async () => {
      const res = await fetch("/api/entitlements");
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    staleTime: 60 * 1000,
    retry: false,
  });

  if (!data) return null;

  const isPro = data.plan === "PRO";
  // Someone grandfathered has Pro without buying it. Saying so is kinder than
  // showing a subscription they have no memory of starting — and it sets an
  // honest expectation about the date it ends.
  const grandfathered = isPro && data.grantedBy?.startsWith("grandfather:");

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Your plan
          <Badge
            variant={isPro ? "default" : "outline"}
            className={isPro ? "" : "text-muted-foreground border-border"}
          >
            {isPro ? "Pro" : "Free"}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {grandfathered && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            You have Pro at no cost because you were using Endeavrly before these
            plans existed
            {data.expiresAt && (
              <>
                , until{" "}
                {new Date(data.expiresAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </>
            )}
            .
          </p>
        )}

        <div className="divide-y divide-border/50">
          <AllowanceRow label="Careers explored" a={data.allowances.careerExplorations} />
          <AllowanceRow label="Career Twin questions" a={data.allowances.careerTwinQuestions} />
          <AllowanceRow label="Saved careers" a={data.allowances.savedCareers} />
        </div>

        {!isPro && (
          <div className="pt-1">
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href="/pricing">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                See what Pro adds
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

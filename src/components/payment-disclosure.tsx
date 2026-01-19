"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAYMENT_COPY } from "@/lib/copy/payments";

interface PaymentDisclosureProps {
  variant?: "compact" | "messaging";
  className?: string;
}

/**
 * PaymentDisclosure component
 * Displays a calm, non-alarming disclosure that payments are handled
 * directly between users and not processed by Sprout.
 */
export function PaymentDisclosure({
  variant = "compact",
  className,
}: PaymentDisclosureProps) {
  const copy = variant === "messaging" ? PAYMENT_COPY.messaging : PAYMENT_COPY.compact;

  return (
    <div
      className={cn(
        "flex items-start gap-2 text-xs text-muted-foreground",
        "rounded-md bg-muted/50 px-3 py-2",
        className
      )}
    >
      <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      <p className="leading-relaxed">{copy.text}</p>
    </div>
  );
}

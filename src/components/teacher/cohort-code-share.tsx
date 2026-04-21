"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

/**
 * Renders the cohort join code with a copy-to-clipboard button.
 * Split out because the page is a server component but copy needs
 * navigator.clipboard.
 */
export function CohortCodeShare({
  code,
  cohortName,
}: {
  code: string;
  cohortName: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — long-press to copy manually.");
    }
  };

  return (
    <section className="rounded-xl border border-border/50 bg-card p-5">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
        Join code
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <code className="text-2xl sm:text-3xl font-mono font-semibold tracking-[0.25em] bg-muted/40 border border-border/40 rounded-lg px-4 py-2">
          {code}
        </code>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border/50 hover:bg-muted transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy code
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-md">
        Share this with your class. Students enter it on their profile
        under &ldquo;Join a class&rdquo; to become members of{" "}
        <span className="text-foreground/80">{cohortName}</span>.
      </p>
    </section>
  );
}

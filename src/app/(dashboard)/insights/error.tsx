'use client';

/**
 * Dashboard error boundary — catches render/data errors in the
 * dashboard route so they don't bubble to the global handler.
 * T3 cleanup item.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <h2 className="text-base font-semibold text-foreground/80 mb-2">
        Something went wrong
      </h2>
      <p className="text-[12px] text-muted-foreground/75 max-w-[320px] mb-4">
        The dashboard hit an unexpected error. This has been logged. You can try
        reloading the page.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full border border-border/40 bg-card/60 px-4 py-2 text-[12px] font-medium text-foreground/80 hover:text-foreground hover:border-border/60 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

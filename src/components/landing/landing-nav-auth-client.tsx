"use client";

/**
 * Client wrapper for the ssr:false dynamic import of LandingNavAuth.
 *
 * Next 15+ forbids `ssr: false` in a Server Component's `next/dynamic`
 * call — the directive must live inside a Client Component. This
 * component is the explicit boundary: it's client-only, renders the
 * auth-aware landing nav after hydration, and shows a skeleton while
 * the lazy module loads. Consumed from src/app/page.tsx and
 * src/app/landing-v3/page.tsx.
 */

import dynamic from "next/dynamic";

const LandingNavAuth = dynamic(
  () =>
    import("./landing-nav").then((mod) => mod.LandingNavAuth),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="h-9 w-20 bg-slate-800/50 rounded-lg animate-pulse hidden sm:block" />
        <div className="h-10 w-24 bg-emerald-600/30 rounded-lg animate-pulse" />
      </div>
    ),
  },
);

export function LandingNavAuthClient() {
  return <LandingNavAuth />;
}

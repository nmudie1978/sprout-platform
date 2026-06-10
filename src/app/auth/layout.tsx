import Link from "next/link";
import { Star } from "lucide-react";
import { LanguageDropdown } from "@/components/language-dropdown";

/**
 * Shared chrome for the auth pages (signin, signup, verify, complete-profile,
 * error). The auth pages center their own card in a full-height viewport, so
 * this header is overlaid at the top rather than placed in flow — that keeps
 * the language switcher reachable during signup/login without shifting the
 * card. The switcher works while logged out: /api/locale sets the cookie for
 * anonymous visitors and only touches the DB once a session exists.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600">
            <Star className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Endeavrly</span>
        </Link>
        <LanguageDropdown iconOnly />
      </div>
      <div id="main-content">{children}</div>
    </div>
  );
}

import Link from "next/link";
import { Star } from "lucide-react";
import { LanguageDropdown } from "@/components/language-dropdown";

/**
 * Slim persistent top bar for every signed-in page. Carries the brand mark and
 * the language switcher so language can be changed from anywhere in the app, on
 * desktop and mobile. The theme toggle + sign-out intentionally stay in the
 * sidebar / mobile nav — this bar adds the language control only.
 */
export function AppTopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-lg sm:px-6">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600">
          <Star className="h-3.5 w-3.5 text-white" />
        </span>
        <span className="text-sm font-semibold tracking-tight">Endeavrly</span>
      </Link>
      <LanguageDropdown />
    </header>
  );
}

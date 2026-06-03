import { LanguageDropdown } from "@/components/language-dropdown";

/**
 * Slim persistent top bar for every signed-in page. Carries the language
 * switcher so language can be changed from anywhere in the app, on desktop and
 * mobile. The brand mark lives in the sidebar; the theme toggle + sign-out
 * intentionally stay in the sidebar / mobile nav — this bar adds the language
 * control only.
 */
export function AppTopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-end border-b border-border/60 bg-background/80 px-4 backdrop-blur-lg sm:px-6">
      <LanguageDropdown />
    </header>
  );
}

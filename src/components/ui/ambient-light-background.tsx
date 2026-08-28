"use client"

import { GradientBackground } from "@/components/ui/silk-blend-gradient"

/**
 * AmbientLightBackground
 *
 * The light-theme canvas: the 21st.dev "Silk Blend" gradient — blue → lilac →
 * pink at 170deg, plus grain — owner-picked to replace the warm-dark
 * "rowds shop v1". Unlike that one, this canvas really is light, so the theme
 * tokens in globals.css run dark-ink-on-light-surfaces again.
 *
 * The recipe lives in <GradientBackground>, imported rather than copied, so
 * the canvas and the component can't drift apart. Its palette is fixed inside
 * that component, NOT token-derived — so if the theme is swapped again,
 * `--background` in globals.css and the gradient must move together. They are
 * in sync today: `--background: 221 40% 64%` is the gradient's #7B93CC first
 * stop, which is what shows anywhere this layer doesn't reach.
 *
 * `.bg-background` is transparent in light mode (globals.css) so this shows
 * through across the app. Dark mode is untouched (`dark:hidden`).
 *
 * Mounted ONCE in the root layout (src/app/layout.tsx), not per-section, so
 * every route gets it — dashboard, marketing, auth and legal alike. It used to
 * be mounted only in the dashboard shell, which left every other route with a
 * transparent `.bg-background` and nothing behind it: that is what made prose
 * on /about and /pricing fade into bare white further down the page.
 *
 * Sits at z-0; the root layout puts all page content in a `relative z-10`
 * wrapper above it.
 */
export function AmbientLightBackground() {
  return (
    <div aria-hidden className="fixed inset-0 z-0 pointer-events-none dark:hidden">
      <GradientBackground className="h-full w-full" />
    </div>
  )
}

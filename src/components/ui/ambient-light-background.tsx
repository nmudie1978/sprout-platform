"use client"

import { GradientBackground } from "@/components/ui/background-rowds-shop-v1"

/**
 * AmbientLightBackground
 *
 * The "light"-theme canvas. Despite the name it is now a WARM DARK canvas:
 * the 21st.dev "background rowds shop v1" gradient (#16130E → #372F20 →
 * #9C8D63 at 170deg, plus grain), owner-picked to replace 15 · Wheat.
 *
 * The recipe lives in <GradientBackground>, imported rather than copied, so
 * the canvas and the component can't drift apart. Its palette is fixed inside
 * that component, NOT token-derived — so if the theme is ever swapped again,
 * `--background` in globals.css and this gradient must move together. They are
 * kept in sync today: `--background: 38 22% 7%` is the gradient's #16130E base,
 * which is what shows through anywhere the ambient layer doesn't reach.
 *
 * `.bg-background` is transparent in light mode (globals.css) so this shows
 * through across the app. Dark mode is untouched (`dark:hidden`).
 * Mounted once in the dashboard layout.
 */
export function AmbientLightBackground() {
  return (
    <div aria-hidden className="fixed inset-0 z-0 pointer-events-none dark:hidden">
      <GradientBackground className="h-full w-full" />
    </div>
  )
}

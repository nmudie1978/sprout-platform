/**
 * AmbientLightBackground
 *
 * App-shell background for light mode. Renders a fixed, full-viewport
 * layer containing a near-white canvas with several very soft blurred
 * radial glows in the corners. Designed to feel quiet and premium —
 * the palette is muted lavender/rose/sky rather than saturated aurora.
 *
 * Usage: mount once inside the dashboard layout (or any shell that
 * wraps light-mode pages). The component is hidden in dark mode via
 * `dark:hidden`.
 *
 * Design goals:
 * - Barely-there ambient richness; never competes with foreground
 * - Works at all viewport sizes (radial gradients scale naturally)
 * - Zero JS, pure CSS for performance
 * - pointer-events-none so it never blocks clicks
 */
export function AmbientLightBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none dark:hidden overflow-hidden"
    >
      {/* Base canvas — near-white warm neutral */}
      <div className="absolute inset-0 bg-[hsl(var(--background))]" />

      {/* Soft corner glows — lavender top-left, rose bottom-right, sky bottom-left */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 5% 10%, rgba(180, 160, 220, 0.18), transparent 55%),
            radial-gradient(ellipse 50% 40% at 95% 8%, rgba(255, 220, 200, 0.15), transparent 55%),
            radial-gradient(ellipse 60% 50% at 10% 95%, rgba(160, 200, 230, 0.15), transparent 55%),
            radial-gradient(ellipse 55% 45% at 95% 95%, rgba(230, 180, 210, 0.16), transparent 55%)
          `,
        }}
      />

      {/* Optional atmospheric wash — very low contrast vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 50%, transparent 60%, rgba(200, 200, 220, 0.08) 100%)",
        }}
      />
    </div>
  );
}

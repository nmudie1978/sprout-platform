/**
 * AmbientLightBackground
 *
 * App-shell background for light mode. A warm cream canvas with a
 * very subtle centered glow for depth. Calm, uniform, premium.
 *
 * Mounted once in the dashboard layout. Hidden in dark mode via
 * `dark:hidden`, so dark mode is never affected.
 */
export function AmbientLightBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none dark:hidden"
    >
      {/* Warm cream base — uniform, no gradient */}
      <div className="absolute inset-0" style={{ backgroundColor: "#FDF6E8" }} />

      {/* Very subtle amber glow in the centre — barely there, just
          adds depth so the canvas doesn't feel flat. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255, 220, 160, 0.35) 0%, transparent 75%)",
        }}
      />
    </div>
  );
}

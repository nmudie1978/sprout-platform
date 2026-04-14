/**
 * AmbientLightBackground
 *
 * App-shell background for light mode. One flat warm cream tone —
 * no gradient, no glow — so cards and modals blend seamlessly into
 * the canvas the way they do in dark mode.
 *
 * Mounted once in the dashboard layout. Hidden in dark mode via
 * `dark:hidden`, so dark mode is never affected.
 */
export function AmbientLightBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none dark:hidden"
      style={{ backgroundColor: "#FDF6E8" }}
    />
  );
}

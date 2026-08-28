// SUPERSEDED — no longer mounted anywhere. The light-mode canvas is now
// components/ui/silk-blend-gradient.tsx ("Silk Blend"). Kept because the
// light theme has been swapped several times (Deep Sea → 15 · Wheat → this →
// Silk Blend) and this is a working revert target; note that reverting to it
// also means re-inverting the :root tokens in globals.css back to dark ink,
// since this recipe is dark and Silk Blend is not.
//
// GradientBackground — "background rowds shop v1", made with the 21st.dev Gradient
// Builder and exported as live CSS (the builder's own Copy-CSS background,
// plus its soften-blur and grain passes). Zero dependencies: one <div> that
// fills its parent. Drop it behind your content:
// <div className="relative h-96"><GradientBackground className="absolute inset-0" /></div>
// Remix the source recipe (colors, mode, finish) in the editor:
// https://21st.dev/community/gradients/editor?from=10bf6028-254c-4b76-9d3c-1a62c0aa09cb
//
// NOTE ON PALETTE: this recipe is DARK — #16130E (L≈7%) → #372F20 (L≈17%) →
// #9C8D63 (L≈50%). Its hue is 44, the same golden family as the "15 · Wheat"
// light canvas, but at a fraction of the lightness. It needs light text over
// it; it is not a drop-in replacement for a light-mode canvas.
export function GradientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        containerType: "size",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#16130E",
          backgroundImage:
            "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.130'/></svg>\"), linear-gradient(170deg, #16130E 0%, #372F20 32%, #9C8D63 100%)",
          backgroundSize: "120px 120px, auto",
          backgroundBlendMode: "overlay, normal",
        }}
      />
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.13,
          mixBlendMode: "overlay",
        }}
      >
        <filter id="grain-10bf6028">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-10bf6028)" />
      </svg>
    </div>
  )
}

import { ImageResponse } from "next/og";

/**
 * The image every shared Endeavrly link renders.
 *
 * Until this existed the site served no Open Graph tags at all, so a link
 * pasted into WhatsApp, Slack, Discord or LinkedIn appeared as a bare URL with
 * no title, description or picture. For a product young people find by being
 * sent it, an unfurled link is the first impression — and a blank one reads as
 * broken or unsafe, which is the opposite of what a safeguarding-first platform
 * wants to signal.
 *
 * Generated rather than a static asset so it stays in step with the brand mark
 * in ./icon.tsx: same arrowhead, same emerald, same dark ground. No external
 * fonts are loaded — a network fetch here would make link previews fail
 * intermittently, and the system stack renders predictably at this size.
 */
export const alt = "Endeavrly — See your possible future";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d1117 0%, #10202b 55%, #0d1117 100%)",
          padding: "0 90px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 40 }}>
          <svg width="54" height="54" viewBox="0 0 24 24" fill="#10b981" stroke="#10b981" strokeWidth={1.5} strokeLinejoin="round">
            <path d="M12 2 19 21 12 17 5 21 12 2z" />
          </svg>
          <span style={{ fontSize: 44, fontWeight: 700, color: "#f8fafc", letterSpacing: -0.5 }}>
            Endeavrly
          </span>
        </div>

        <div style={{ fontSize: 68, fontWeight: 700, color: "#f8fafc", lineHeight: 1.1, letterSpacing: -1.5, maxWidth: 940 }}>
          See your possible future
        </div>

        <div style={{ fontSize: 30, color: "#94a3b8", marginTop: 28, lineHeight: 1.4, maxWidth: 900 }}>
          Explore careers, understand the real pathways, and build clarity about
          where you are heading.
        </div>

        <div style={{ display: "flex", marginTop: 46 }}>
          <div style={{ height: 6, width: 130, background: "#10b981", borderRadius: 3 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}

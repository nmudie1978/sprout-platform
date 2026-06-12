import { ImageResponse } from "next/og";

// Browser-tab favicon: the Endeavrly arrowhead (emerald Navigation2) on a
// dark navy tile, matching the brand mark used across the app.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1117",
          borderRadius: 7,
        }}
      >
        {/* lucide Navigation2 path, filled emerald */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="#10b981"
          stroke="#10b981"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2 19 21 12 17 5 21 12 2z" />
        </svg>
      </div>
    ),
    { ...size },
  );
}

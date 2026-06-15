import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap Lab (Horizontal) — Endeavrly",
  description: "Internal preview of left-to-right roadmap infographic explorations.",
  robots: { index: false, follow: false },
};

export default function RoadmapHorizontalLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

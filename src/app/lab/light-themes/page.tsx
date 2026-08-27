import type { Metadata } from "next";
import { LightThemesLab } from "./light-themes-lab";

// Review-only gallery. Keep it out of search.
export const metadata: Metadata = {
  title: "Light theme tones — review",
  robots: { index: false, follow: false },
};

export default function LightThemesPage() {
  return <LightThemesLab />;
}

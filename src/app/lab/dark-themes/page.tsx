import type { Metadata } from "next";
import { DarkThemesLab } from "./dark-themes-lab";

// Review-only gallery. Keep it out of search.
export const metadata: Metadata = {
  title: "Dark theme variants — review",
  robots: { index: false, follow: false },
};

export default function DarkThemesPage() {
  return <DarkThemesLab />;
}

"use client";

/**
 * DEV PAGE: Reflections vertical carousel preview.
 *
 * Renders <ReflectionsCarousel> with mock groups — no auth, no localStorage —
 * so the slider (▲/▼, dots, collapse, per-reflection expand) can be eyeballed
 * and headless-screenshotted. Visit /dev/reflections-carousel.
 */

import {
  ReflectionsCarousel,
  type ReflectionGroup,
} from "@/components/library/reflections-carousel";
import type { LocalReflectionEntry } from "@/lib/library/tabs";

function entry(
  slug: string,
  lens: LocalReflectionEntry["lens"],
  lensLabel: string,
  text: string,
): LocalReflectionEntry {
  return { id: `${slug}:${lens}`, careerSlug: slug, lens, lensLabel, text, updatedAt: "2026-06-18" };
}

const GROUPS: ReflectionGroup[] = [
  {
    slug: "management-consultant",
    career: { label: "Management Consultant", emoji: "💼" },
    entries: [entry("management-consultant", "understand", "Understand", "dsfsdfsdf")],
  },
  {
    slug: "psychologist",
    career: { label: "Psychologist", emoji: "🧠" },
    entries: [
      entry("psychologist", "discover", "Discover", "asdasdas"),
      entry("psychologist", "understand", "Understand", "asdasdasdasd i like bug butts"),
      entry("psychologist", "clarity", "Clarity", "asdasd"),
    ],
  },
  {
    slug: "speech-and-language-therapist",
    career: { label: "Speech and Language Therapist", emoji: "🗣️" },
    entries: [
      entry("speech-and-language-therapist", "discover", "Discover", "sdfsfs"),
      entry("speech-and-language-therapist", "understand", "Understand", "sdfsdf"),
      entry(
        "speech-and-language-therapist",
        "clarity",
        "Clarity",
        "sdfsdfsdfsdfsdfsdfsdfsdfsdf sdfs sdfdsf sdf sdfsdfsdf i like toast",
      ),
    ],
  },
];

export default function ReflectionsCarouselDevPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-lg font-semibold">Reflections carousel preview</h1>
      <ReflectionsCarousel groups={GROUPS} />
    </div>
  );
}

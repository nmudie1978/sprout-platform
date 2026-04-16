/**
 * Quick diagnostic: show top-10 careers + categories for personas
 * that triggered the diversity assertion failure.
 */
import { rankCareers, buildCareerProfile, getMatchResultForCareer } from "../src/lib/matching/engine";
import type { DiscoveryPreferences } from "../src/lib/career-pathways";

const personas: Record<string, DiscoveryPreferences> = {
  practicalHandsOn: {
    subjects: ["physics", "design-tech", "food-tech"],
    workStyles: ["hands-on", "outdoors"],
    peoplePref: "small-team",
    interests: ["building", "fixing", "engines"],
  },
  creative: {
    subjects: ["art", "drama", "music", "english"],
    starredSubjects: ["art"],
    workStyles: ["creative"],
    peoplePref: "solo",
    interests: ["design", "performance", "storytelling"],
  },
  academicSTEM: {
    subjects: ["maths", "physics", "chemistry", "biology"],
    starredSubjects: ["maths", "physics"],
    workStyles: ["desk"],
    peoplePref: "solo",
    interests: ["research", "analysis"],
  },
};

for (const [name, p] of Object.entries(personas)) {
  console.log(`\n── ${name} ──`);
  const r = rankCareers(p, 10);
  for (const c of r) {
    const profile = buildCareerProfile(c);
    const result = getMatchResultForCareer(c.id);
    console.log(
      `  ${(result?.matchPercent ?? 0).toFixed(0).padStart(3)}%  ${c.id.padEnd(35)}  cat=${profile.category}`,
    );
  }
}

/**
 * One-off extraction for the Career DNA AI-verification pass.
 * Dumps every career's key fields + its CURRENTLY-DERIVED DNA scores to JSON,
 * so the verification agents can check the derived scores against the career's
 * real-world nature. Not wired into the app. Run: npx tsx scripts/extract-career-dna.ts
 */
import { writeFileSync } from 'node:fs';
import { getAllCareers } from '../src/lib/career-pathways';
import { getCareerDNA } from '../src/lib/career-dna';

const careers = getAllCareers();
const out = careers.map((c) => {
  const dna = getCareerDNA(c);
  return {
    id: c.id,
    title: c.title,
    description: (c.description ?? '').slice(0, 400),
    keySkills: c.keySkills ?? [],
    dailyTasks: (c.dailyTasks ?? []).slice(0, 6),
    avgSalary: c.avgSalary ?? null,
    workSetting: c.workSetting ?? null,
    peopleIntensity: c.peopleIntensity ?? null,
    educationRoute: c.educationRoute ?? null,
    educationPath: c.educationPath ?? null,
    growthOutlook: c.growthOutlook ?? null,
    pathType: c.pathType ?? null,
    sector: c.sector ?? null,
    curated: dna.curated,
    // current DNA scores by trait id
    derived: Object.fromEntries(dna.traits.map((t) => [t.id, t.score])),
    primaryGenes: dna.primaryGenes,
  };
});

writeFileSync('/tmp/career-dna-extract.json', JSON.stringify(out, null, 0));
console.log(`Extracted ${out.length} careers (curated: ${out.filter((c) => c.curated).length}).`);

/**
 * Course Search Link Generators
 *
 * Uses search URLs on trusted platforms (always valid).
 * Never fabricates direct course URLs — see verified-learning.ts policy.
 */

import { JOB_CATEGORY_SKILLS, formatSkillName } from '@/lib/skills-mapping';

export interface CourseSearchLink {
  platform: string;
  label: string;
  url: string;
  free: boolean;
}

const SEARCH_TEMPLATES = {
  coursera: {
    base: 'https://www.coursera.org/search?query=',
    label: 'Coursera',
    free: false,
  },
  classcentral: {
    base: 'https://www.classcentral.com/search?q=',
    label: 'Class Central',
    free: true,
  },
} as const;

function buildSearchUrl(template: { base: string }, query: string): string {
  return `${template.base}${encodeURIComponent(query)}`;
}

/** Get course search links for a single skill. */
export function getCourseSearchLinks(skill: string): CourseSearchLink[] {
  return [
    {
      platform: 'coursera',
      label: SEARCH_TEMPLATES.coursera.label,
      url: buildSearchUrl(SEARCH_TEMPLATES.coursera, skill),
      free: SEARCH_TEMPLATES.coursera.free,
    },
    {
      platform: 'classcentral',
      label: SEARCH_TEMPLATES.classcentral.label,
      url: buildSearchUrl(SEARCH_TEMPLATES.classcentral, skill),
      free: SEARCH_TEMPLATES.classcentral.free,
    },
  ];
}

/** Get course search links for a career pathway (combines title + top skill). */
export function getCourseLinksForCareer(
  title: string,
  keySkills: string[]
): CourseSearchLink[] {
  const topSkill = keySkills[0] ?? '';
  const query = topSkill ? `${title} ${topSkill}` : title;
  return getCourseSearchLinks(query);
}

/** Get course search links for a job category using soft skills mapping. */
export function getCourseLinksForJobCategory(
  category: string
): CourseSearchLink[] {
  const skills = JOB_CATEGORY_SKILLS[category as keyof typeof JOB_CATEGORY_SKILLS];
  if (!skills || skills.length === 0) {
    return getCourseSearchLinks(category.toLowerCase().replace(/_/g, ' '));
  }
  // Use the top two skills for a more targeted search
  const query = skills
    .slice(0, 2)
    .map((s) => formatSkillName(s))
    .join(' ');
  return getCourseSearchLinks(query);
}

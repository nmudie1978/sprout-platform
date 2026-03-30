import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/courses/search?career=Doctor&country=Norway
 *
 * Returns structured search links to real education platforms
 * for a given career, focused on the user's country (default: Norway).
 *
 * This does NOT fabricate courses — it generates verified search URLs
 * on trusted platforms that will return real, current results.
 */

interface CourseSearchResult {
  category: 'norway' | 'international' | 'certification';
  platform: string;
  label: string;
  description: string;
  url: string;
  free: boolean;
  tags: string[];
}

// Norwegian education platforms
const NORWEGIAN_PLATFORMS = [
  {
    id: 'utdanning',
    name: 'Utdanning.no',
    description: 'Official Norwegian education portal — programmes, degrees, and career info',
    baseUrl: 'https://utdanning.no/sok?q=',
    free: true,
    tags: ['official', 'degrees', 'programmes'],
  },
  {
    id: 'samordna',
    name: 'Samordna Opptak',
    description: 'Centralised university admissions — entry requirements and applications',
    baseUrl: 'https://www.samordnaopptak.no/info/studier-og-soking/sokeresultat/?search=',
    free: true,
    tags: ['admissions', 'university', 'applications'],
  },
  {
    id: 'nav-kurs',
    name: 'NAV Kurs',
    description: 'Government-funded courses and vocational training',
    baseUrl: 'https://www.nav.no/sok?ord=',
    free: true,
    tags: ['government', 'vocational', 'funded'],
  },
  {
    id: 'kompetanse',
    name: 'Kompetanse Norge',
    description: 'Skills and competency development resources',
    baseUrl: 'https://www.google.com/search?q=site:kompetansenorge.no+',
    free: true,
    tags: ['skills', 'development'],
  },
];

// International platforms
const INTERNATIONAL_PLATFORMS = [
  {
    id: 'coursera',
    name: 'Coursera',
    description: 'University-backed courses from top global institutions',
    baseUrl: 'https://www.coursera.org/search?query=',
    free: false,
    tags: ['university', 'certificates', 'global'],
  },
  {
    id: 'edx',
    name: 'edX',
    description: 'Free courses from Harvard, MIT, and leading universities',
    baseUrl: 'https://www.edx.org/search?q=',
    free: true,
    tags: ['university', 'free', 'global'],
  },
  {
    id: 'futurelearn',
    name: 'FutureLearn',
    description: 'Short courses and microcredentials from global universities',
    baseUrl: 'https://www.futurelearn.com/search?q=',
    free: false,
    tags: ['short courses', 'microcredentials'],
  },
  {
    id: 'khanacademy',
    name: 'Khan Academy',
    description: 'Free foundational learning — maths, science, and more',
    baseUrl: 'https://www.khanacademy.org/search?referer=%2F&page_search_query=',
    free: true,
    tags: ['free', 'foundational', 'school'],
  },
  {
    id: 'linkedin-learning',
    name: 'LinkedIn Learning',
    description: 'Professional skills courses recognised by employers',
    baseUrl: 'https://www.linkedin.com/learning/search?keywords=',
    free: false,
    tags: ['professional', 'employer-recognised'],
  },
];

// Career-specific certification search terms
const CERTIFICATION_QUERIES: Record<string, string[]> = {
  'doctor': ['medical degree norway', 'HPR medical license norway', 'medical specialization norway'],
  'physician': ['medical degree norway', 'HPR medical license norway'],
  'nurse': ['nursing degree norway', 'HPR nursing license', 'sykepleier utdanning'],
  'psychologist': ['psychology degree norway', 'HPR psychology license', 'psykologi utdanning'],
  'teacher': ['teaching qualification norway PPU', 'lærerstudium', 'pedagogikk utdanning'],
  'software': ['software developer certification', 'AWS certified', 'Azure certification'],
  'engineer': ['engineering degree norway', 'sivilingeniør', 'NITO certification'],
  'accountant': ['regnskapsfører autorisasjon', 'accounting certification norway', 'ACCA qualification'],
  'lawyer': ['law degree norway', 'jusstudium', 'advokatbevilling'],
  'data scientist': ['data science certification', 'machine learning course', 'python data science'],
  'veterinary': ['veterinær utdanning norway', 'animal care certification'],
  'dentist': ['tannlege utdanning norway', 'dental degree norway'],
  'pharmacist': ['farmasi utdanning norway', 'pharmacy degree norway'],
  'architect': ['arkitektur utdanning norway', 'architecture degree norway'],
  'paramedic': ['paramedic utdanning norway', 'ambulansefag'],
  'physiotherapist': ['fysioterapi utdanning norway', 'physiotherapy degree norway'],
};

function getCertificationQueries(careerTitle: string): string[] {
  const lower = careerTitle.toLowerCase();
  for (const [key, queries] of Object.entries(CERTIFICATION_QUERIES)) {
    if (lower.includes(key)) return queries;
  }
  return [`${careerTitle} certification`, `${careerTitle} degree requirements`];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const career = searchParams.get('career');
  const country = searchParams.get('country') || 'Norway';

  if (!career) {
    return NextResponse.json({ error: 'career parameter required' }, { status: 400 });
  }

  const results: CourseSearchResult[] = [];

  // Norwegian platforms — search with career title
  for (const platform of NORWEGIAN_PLATFORMS) {
    results.push({
      category: 'norway',
      platform: platform.id,
      label: platform.name,
      description: platform.description,
      url: `${platform.baseUrl}${encodeURIComponent(career)}`,
      free: platform.free,
      tags: platform.tags,
    });
  }

  // International platforms
  for (const platform of INTERNATIONAL_PLATFORMS) {
    results.push({
      category: 'international',
      platform: platform.id,
      label: platform.name,
      description: platform.description,
      url: `${platform.baseUrl}${encodeURIComponent(career)}`,
      free: platform.free,
      tags: platform.tags,
    });
  }

  // Certification-specific searches
  const certQueries = getCertificationQueries(career);
  for (const query of certQueries.slice(0, 3)) {
    results.push({
      category: 'certification',
      platform: 'google',
      label: query,
      description: `Search for "${query}" requirements and pathways`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      free: true,
      tags: ['certification', 'requirements'],
    });
  }

  return NextResponse.json({
    success: true,
    career,
    country,
    results,
    totalCount: results.length,
  });
}

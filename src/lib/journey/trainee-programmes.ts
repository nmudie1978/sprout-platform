import type { CareerCategory } from '@/lib/career-pathways';

export interface TraineeProgramme {
  company: string;
  /** CareerCategory values this programme is relevant to. */
  categories: CareerCategory[];
  /** Real, stable careers/graduate page. */
  url: string;
  kind: 'graduate' | 'trainee';
  windowNote: string;
}

/**
 * Curated, verifiable Norwegian trainee/graduate programmes (owner-supplied).
 *
 * We deliberately link each company's stable careers page rather than a deep
 * programme URL that rots, and convey timing via `windowNote`. No claim is made
 * beyond "this employer runs an annual graduate/trainee programme" — which is
 * verifiable for every entry here. Keep this list small and trustworthy.
 */
export const TRAINEE_PROGRAMMES: TraineeProgramme[] = [
  { company: 'Equinor', categories: ['MANUFACTURING_ENGINEERING', 'TECHNOLOGY_IT'], url: 'https://www.equinor.com/careers', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'Statkraft', categories: ['MANUFACTURING_ENGINEERING'], url: 'https://www.statkraft.com/career/', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'Kongsberg Gruppen', categories: ['MANUFACTURING_ENGINEERING', 'TECHNOLOGY_IT'], url: 'https://www.kongsberg.com/careers/', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'Aker Solutions', categories: ['MANUFACTURING_ENGINEERING'], url: 'https://www.akersolutions.com/career/', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'DNB', categories: ['FINANCE_BANKING', 'BUSINESS_MANAGEMENT'], url: 'https://www.dnb.no/en/about-us/career', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'PwC Norway', categories: ['FINANCE_BANKING', 'BUSINESS_MANAGEMENT'], url: 'https://www.pwc.no/no/karriere.html', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'Deloitte Norway', categories: ['FINANCE_BANKING', 'BUSINESS_MANAGEMENT'], url: 'https://www2.deloitte.com/no/no/careers.html', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'Accenture Norway', categories: ['TECHNOLOGY_IT', 'BUSINESS_MANAGEMENT'], url: 'https://www.accenture.com/no-en/careers', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
  { company: 'Telenor', categories: ['TELECOMMUNICATIONS', 'TECHNOLOGY_IT'], url: 'https://www.telenor.com/career/', kind: 'graduate', windowNote: 'Applications typically Aug–Nov' },
];

/**
 * Named trainee/graduate programmes relevant to a career's category. Pure and
 * bundle-light: imports only the `CareerCategory` *type*, never the catalogue.
 * The caller resolves the category (via getCategoryForCareerByName) and passes
 * it in, so the heavy career-pathways module stays out of the mindmap bundle.
 */
export function getTraineeProgrammesForCategory(
  category: CareerCategory | undefined,
): TraineeProgramme[] {
  if (!category) return [];
  return TRAINEE_PROGRAMMES.filter((p) => p.categories.includes(category));
}

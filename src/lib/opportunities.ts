/**
 * Local Opportunity Matching — curated internships, traineeships,
 * and graduate programmes matched to careers.
 *
 * Phase 1: static curated data for top careers.
 * Phase 2: integrate Finn.no / NAV APIs for live listings.
 */

export type OpportunityType = 'internship' | 'traineeship' | 'graduate' | 'apprenticeship' | 'volunteer';

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: OpportunityType;
  location: string;
  /** When applications typically open. */
  applicationWindow: string;
  description: string;
  url?: string;
  /** Career IDs this opportunity is relevant to. */
  careerIds: string[];
  /** Tags for filtering. */
  tags: string[];
}

const TYPE_LABELS: Record<OpportunityType, string> = {
  internship: 'Internship',
  traineeship: 'Traineeship',
  graduate: 'Graduate Programme',
  apprenticeship: 'Apprenticeship',
  volunteer: 'Volunteer / Taster',
};

const OPPORTUNITIES: Opportunity[] = [
  // Tech / Software
  { id: 'bekk-summer', title: 'Summer Internship', company: 'Bekk', type: 'internship', location: 'Oslo', applicationWindow: 'Sep – Nov', description: 'Paid 8-week summer internship for CS/IT students. Work on real client projects with mentorship.', url: 'https://www.bekk.no/jobb', careerIds: ['software-developer', 'data-analyst', 'designer', 'it-engineer', 'project-manager'], tags: ['tech', 'paid', 'summer'] },
  { id: 'dnb-summer', title: 'Summer Internship (Tech & Data)', company: 'DNB', type: 'internship', location: 'Oslo', applicationWindow: 'Oct – Dec', description: 'Work with DNB\'s tech teams on banking innovation, data science, or cybersecurity projects.', url: 'https://www.dnb.no/karriere', careerIds: ['software-developer', 'data-analyst', 'cybersecurity-analyst', 'project-manager'], tags: ['fintech', 'paid', 'summer'] },
  { id: 'equinor-summer', title: 'Summer Internship', company: 'Equinor', type: 'internship', location: 'Stavanger / Oslo', applicationWindow: 'Oct – Jan', description: 'Engineering and tech internships across Equinor\'s energy operations. Includes offshore and onshore roles.', url: 'https://www.equinor.com/careers', careerIds: ['engineer', 'software-developer', 'data-analyst', 'mechanical-engineer', 'civil-engineer'], tags: ['energy', 'paid', 'summer'] },
  { id: 'bouvet-trainee', title: 'Graduate Trainee Programme', company: 'Bouvet', type: 'traineeship', location: 'Oslo / Bergen / Trondheim', applicationWindow: 'Mar – May', description: '12-month graduate programme for newly qualified developers, designers, and project managers.', url: 'https://www.bouvet.no/bli-en-av-oss', careerIds: ['software-developer', 'designer', 'project-manager'], tags: ['consulting', 'paid', 'graduate'] },
  { id: 'visma-graduate', title: 'Graduate Programme', company: 'Visma', type: 'graduate', location: 'Oslo', applicationWindow: 'Feb – Apr', description: 'Fast-track programme rotating across Visma\'s SaaS products. Focus on engineering and product.', url: 'https://www.visma.no/karriere/', careerIds: ['software-developer', 'data-analyst', 'project-manager'], tags: ['saas', 'paid', 'graduate'] },

  // Consulting / Business
  { id: 'mckinsey-intern', title: 'Business Analyst Intern', company: 'McKinsey & Company', type: 'internship', location: 'Oslo', applicationWindow: 'Oct – Jan', description: 'Summer internship for students interested in management consulting. Structured programme with mentorship.', url: 'https://www.mckinsey.com/careers', careerIds: ['economist', 'project-manager', 'accountant'], tags: ['consulting', 'paid', 'summer'] },
  { id: 'pwc-trainee', title: 'Graduate Programme (Audit & Advisory)', company: 'PwC', type: 'graduate', location: 'Oslo / Bergen / Stavanger', applicationWindow: 'Jan – Mar', description: '2-year graduate programme combining audit, advisory, and professional qualifications.', url: 'https://www.pwc.no/no/karriere.html', careerIds: ['accountant', 'economist', 'lawyer'], tags: ['big4', 'paid', 'graduate'] },

  // Healthcare
  { id: 'ous-summer', title: 'Summer Assistant (Nursing)', company: 'Oslo universitetssykehus', type: 'internship', location: 'Oslo', applicationWindow: 'Feb – Apr', description: 'Paid summer positions for nursing students. Real clinical experience under supervision.', url: 'https://oslo-universitetssykehus.no/jobb', careerIds: ['nurse', 'doctor', 'physiotherapist'], tags: ['healthcare', 'paid', 'summer'] },

  // Engineering / Energy
  { id: 'aker-trainee', title: 'Graduate Programme', company: 'Aker Solutions', type: 'graduate', location: 'Oslo / Stavanger', applicationWindow: 'Sep – Nov', description: '2-year rotation programme across engineering disciplines in energy and maritime.', url: 'https://www.akersolutions.com/careers/', careerIds: ['engineer', 'mechanical-engineer', 'civil-engineer', 'project-manager'], tags: ['energy', 'paid', 'graduate'] },
  { id: 'kongsberg-intern', title: 'Summer Internship', company: 'Kongsberg Gruppen', type: 'internship', location: 'Kongsberg / Horten', applicationWindow: 'Nov – Jan', description: 'Internships in defence, maritime, and digital systems engineering.', url: 'https://www.kongsberg.com/careers/', careerIds: ['engineer', 'software-developer', 'robotics-engineer'], tags: ['defence', 'paid', 'summer'] },

  // Law
  { id: 'wr-trainee', title: 'Trainee Programme (Fullmektig)', company: 'Wikborg Rein', type: 'traineeship', location: 'Oslo / Bergen', applicationWindow: 'Jan – Mar', description: '2-year fullmektig programme. Work across practice areas with partner mentorship.', url: 'https://www.wr.no/karriere/', careerIds: ['lawyer'], tags: ['law', 'paid', 'graduate'] },

  // Architecture / Design
  { id: 'snohetta-intern', title: 'Internship', company: 'Snøhetta', type: 'internship', location: 'Oslo', applicationWindow: 'Rolling', description: '3-6 month internships for architecture and design students. Competitive but career-defining.', url: 'https://snohetta.com/careers', careerIds: ['architect', 'designer'], tags: ['architecture', 'competitive'] },

  // Public sector
  { id: 'nav-summer', title: 'Summer Internship (IT & Data)', company: 'NAV', type: 'internship', location: 'Oslo', applicationWindow: 'Jan – Mar', description: 'Tech internships at Norway\'s largest public-sector IT department. Work on services used by millions.', url: 'https://www.nav.no/jobb-i-nav', careerIds: ['software-developer', 'data-analyst', 'project-manager', 'designer'], tags: ['public-sector', 'paid', 'summer'] },
];

// Aliases for career ID matching
const CAREER_ALIASES: Record<string, string> = {
  'it-project-manager': 'project-manager',
  'telco-project-manager': 'project-manager',
  'mobile-developer': 'software-developer',
  'web-developer': 'software-developer',
  'frontend-developer': 'software-developer',
  'backend-developer': 'software-developer',
  'fullstack-developer': 'software-developer',
  'qa-engineer': 'software-developer',
  'ai-engineer': 'software-developer',
  'devops-engineer': 'software-developer',
  'it-engineer': 'engineer',
  'dentist': 'doctor',
};

/**
 * Get opportunities matched to a career, optionally filtered by location.
 */
export function getOpportunitiesForCareer(
  careerId: string,
  location?: string,
): Opportunity[] {
  const resolved = CAREER_ALIASES[careerId] ?? careerId;
  let matches = OPPORTUNITIES.filter((o) =>
    o.careerIds.includes(resolved) || o.careerIds.includes(careerId),
  );
  if (location) {
    const loc = location.toLowerCase();
    matches = matches.filter((o) => o.location.toLowerCase().includes(loc));
  }
  return matches;
}

export function getTypeLabel(type: OpportunityType): string {
  return TYPE_LABELS[type];
}

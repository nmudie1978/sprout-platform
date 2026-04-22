/**
 * Top Employers per career — Norwegian companies where this role
 * is most common. Rendered in the Understand tab.
 *
 * Each entry has: company name, industry, size hint, and optional
 * careers page URL. Add careers by editing CAREER_EMPLOYERS.
 */

export interface Employer {
  name: string;
  industry: string;
  /** e.g. "1,000+" or "10,000+" */
  size: string;
  /** URL to their careers/jobs page. */
  careersUrl?: string;
}

const CAREER_EMPLOYERS: Record<string, Employer[]> = {
  'project-manager': [
    { name: 'Capgemini', industry: 'IT Consulting', size: '2,000+', careersUrl: 'https://www.capgemini.com/no-no/careers/' },
    { name: 'Sopra Steria', industry: 'IT Consulting', size: '2,500+', careersUrl: 'https://www.soprasteria.no/karriere' },
    { name: 'Atea', industry: 'IT Infrastructure', size: '1,500+', careersUrl: 'https://www.atea.no/karriere/' },
    { name: 'Accenture', industry: 'Consulting', size: '1,000+', careersUrl: 'https://www.accenture.com/no-en/careers' },
    { name: 'Bouvet', industry: 'IT Consulting', size: '2,000+', careersUrl: 'https://www.bouvet.no/bli-en-av-oss' },
    { name: 'Telenor', industry: 'Telecom', size: '15,000+', careersUrl: 'https://www.telenor.com/career/open-positions/' },
    { name: 'Telia', industry: 'Telecom', size: '3,000+', careersUrl: 'https://www.telia.no/om-telia/karriere/' },
    { name: 'ICE', industry: 'Telecom', size: '500+', careersUrl: 'https://www.ice.no/om-ice/jobb/' },
    { name: 'TietoEVRY', industry: 'IT Services', size: '3,000+', careersUrl: 'https://www.tietoevry.com/en/careers/' },
    { name: 'Itera', industry: 'IT Consulting', size: '700+', careersUrl: 'https://www.itera.com/karriere/' },
    { name: 'Equinor', industry: 'Energy / IT', size: '22,000+', careersUrl: 'https://www.equinor.com/careers' },
    { name: 'Aker Solutions', industry: 'Energy / Engineering', size: '5,000+', careersUrl: 'https://www.akersolutions.com/careers/' },
    { name: 'Knowit', industry: 'IT Consulting', size: '1,000+', careersUrl: 'https://www.knowit.no/karriere/' },
  ],
  'software-developer': [
    { name: 'Bekk', industry: 'IT Consulting', size: '500+', careersUrl: 'https://www.bekk.no/jobb' },
    { name: 'Visma', industry: 'Software / SaaS', size: '3,000+', careersUrl: 'https://www.visma.no/karriere/' },
    { name: 'Schibsted', industry: 'Media / Tech', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
    { name: 'DNB', industry: 'Banking / Fintech', size: '9,000+', careersUrl: 'https://www.dnb.no/karriere' },
    { name: 'Finn.no', industry: 'Marketplace / Tech', size: '500+', careersUrl: 'https://hjemmehos.finn.no/jobb-i-finn/' },
    { name: 'Capgemini', industry: 'IT Consulting', size: '2,000+', careersUrl: 'https://www.capgemini.com/no-no/careers/' },
  ],
  doctor: [
    { name: 'Oslo universitetssykehus (OUS)', industry: 'Healthcare', size: '20,000+', careersUrl: 'https://oslo-universitetssykehus.no/jobb' },
    { name: 'Helse Bergen / Haukeland', industry: 'Healthcare', size: '13,000+', careersUrl: 'https://helse-bergen.no/jobb' },
    { name: 'St. Olavs hospital', industry: 'Healthcare', size: '11,000+', careersUrl: 'https://stolav.no/jobb' },
    { name: 'Volvat Medisinske Senter', industry: 'Private Healthcare', size: '1,000+', careersUrl: 'https://www.volvat.no/om-oss/jobb/' },
    { name: 'Aleris', industry: 'Private Healthcare', size: '1,000+', careersUrl: 'https://www.aleris.no/karriere/' },
  ],
  nurse: [
    { name: 'Oslo universitetssykehus (OUS)', industry: 'Healthcare', size: '20,000+', careersUrl: 'https://oslo-universitetssykehus.no/jobb' },
    { name: 'Helse Bergen / Haukeland', industry: 'Healthcare', size: '13,000+', careersUrl: 'https://helse-bergen.no/jobb' },
    { name: 'Sunnaas sykehus', industry: 'Rehabilitation', size: '1,000+', careersUrl: 'https://www.sunnaas.no/jobb-og-karriere' },
    { name: 'Oslo kommune', industry: 'Municipal Health', size: '50,000+', careersUrl: 'https://www.oslo.kommune.no/jobb/' },
    { name: 'Lovisenberg Diakonale Sykehus', industry: 'Healthcare', size: '2,000+' },
  ],
  lawyer: [
    { name: 'Wikborg Rein', industry: 'Law Firm', size: '500+', careersUrl: 'https://www.wr.no/karriere/' },
    { name: 'Thommessen', industry: 'Law Firm', size: '500+', careersUrl: 'https://www.thommessen.no/karriere' },
    { name: 'Schjødt', industry: 'Law Firm', size: '400+', careersUrl: 'https://www.schjodt.no/karriere/' },
    { name: 'Regjeringsadvokaten', industry: 'Government', size: '50+' },
    { name: 'DNB', industry: 'Banking (Legal dept)', size: '9,000+', careersUrl: 'https://www.dnb.no/karriere' },
  ],
  engineer: [
    { name: 'Equinor', industry: 'Energy', size: '22,000+', careersUrl: 'https://www.equinor.com/careers' },
    { name: 'Aker Solutions', industry: 'Energy / Engineering', size: '5,000+', careersUrl: 'https://www.akersolutions.com/careers/' },
    { name: 'Multiconsult', industry: 'Engineering Consulting', size: '3,000+', careersUrl: 'https://www.multiconsult.no/karriere/' },
    { name: 'Norconsult', industry: 'Engineering Consulting', size: '5,000+', careersUrl: 'https://www.norconsult.no/karriere/' },
    { name: 'Kongsberg Gruppen', industry: 'Defence / Maritime', size: '12,000+', careersUrl: 'https://www.kongsberg.com/careers/' },
  ],
  accountant: [
    { name: 'PwC', industry: 'Audit / Advisory', size: '2,500+', careersUrl: 'https://www.pwc.no/no/karriere.html' },
    { name: 'EY', industry: 'Audit / Advisory', size: '1,500+', careersUrl: 'https://www.ey.com/no_no/careers' },
    { name: 'Deloitte', industry: 'Audit / Advisory', size: '2,000+', careersUrl: 'https://www2.deloitte.com/no/no/careers.html' },
    { name: 'KPMG', industry: 'Audit / Advisory', size: '1,000+', careersUrl: 'https://home.kpmg/no/nb/home/karriere.html' },
    { name: 'BDO', industry: 'Audit / Advisory', size: '1,500+', careersUrl: 'https://www.bdo.no/nb-no/karriere' },
  ],
  teacher: [
    { name: 'Oslo kommune (schools)', industry: 'Public Education', size: '50,000+', careersUrl: 'https://www.oslo.kommune.no/jobb/' },
    { name: 'Bergen kommune', industry: 'Public Education', size: '15,000+', careersUrl: 'https://www.bergen.kommune.no/jobb' },
    { name: 'Trondheim kommune', industry: 'Public Education', size: '15,000+' },
    { name: 'International School of Stavanger', industry: 'International Education', size: '200+', careersUrl: 'https://www.isstavanger.no' },
    { name: 'Kristiania University College', industry: 'Higher Education', size: '1,000+', careersUrl: 'https://www.kristiania.no/om-kristiania/jobb-hos-oss/' },
  ],
  'data-analyst': [
    { name: 'DNB', industry: 'Banking / Fintech', size: '9,000+', careersUrl: 'https://www.dnb.no/karriere' },
    { name: 'Telenor', industry: 'Telecom', size: '15,000+', careersUrl: 'https://www.telenor.com/career/open-positions/' },
    { name: 'NAV', industry: 'Government', size: '20,000+', careersUrl: 'https://www.nav.no/jobb-i-nav' },
    { name: 'SSB (Statistics Norway)', industry: 'Government / Statistics', size: '1,000+', careersUrl: 'https://www.ssb.no/jobb-i-ssb' },
    { name: 'Schibsted', industry: 'Media / Tech', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
  ],
  architect: [
    { name: 'Snøhetta', industry: 'Architecture', size: '300+', careersUrl: 'https://snohetta.com/careers' },
    { name: 'A-lab', industry: 'Architecture', size: '100+', careersUrl: 'https://a-lab.no' },
    { name: 'LPO arkitekter', industry: 'Architecture', size: '100+', careersUrl: 'https://lpo.no' },
    { name: 'Nordic — Office of Architecture', industry: 'Architecture', size: '100+', careersUrl: 'https://www.nordicarch.com' },
    { name: 'Statsbygg', industry: 'Government (Public buildings)', size: '900+', careersUrl: 'https://www.statsbygg.no/karriere' },
  ],
  designer: [
    { name: 'Bekk', industry: 'IT Consulting (Design)', size: '500+', careersUrl: 'https://www.bekk.no/jobb' },
    { name: 'Idean (part of Capgemini)', industry: 'Design Consultancy', size: '200+', careersUrl: 'https://www.capgemini.com/no-no/careers/' },
    { name: 'Eggs Design', industry: 'Design Studio', size: '100+', careersUrl: 'https://eggsdesign.com/careers' },
    { name: 'Schibsted', industry: 'Media / UX', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
    { name: 'Finn.no', industry: 'Marketplace / UX', size: '500+', careersUrl: 'https://hjemmehos.finn.no/jobb-i-finn/' },
  ],
  psychologist: [
    { name: 'Oslo universitetssykehus (OUS)', industry: 'Healthcare', size: '20,000+', careersUrl: 'https://oslo-universitetssykehus.no/jobb' },
    { name: 'Pedagogisk-psykologisk tjeneste (PPT)', industry: 'Municipal Education Support', size: 'varies' },
    { name: 'BUP (Barne- og ungdomspsykiatri)', industry: 'Child & Adolescent Psychiatry', size: 'varies' },
    { name: 'NAV', industry: 'Government (Occupational psychology)', size: '20,000+', careersUrl: 'https://www.nav.no/jobb-i-nav' },
    { name: 'Private practices', industry: 'Private Healthcare', size: 'varies' },
  ],
};

// Aliases for careers that share the same employer pool.
// Multiple PM variants (it-project-manager, telco-project-manager)
// all pull from the same top-employer list.
const CAREER_ID_ALIASES: Record<string, string> = {
  'it-project-manager': 'project-manager',
  'telco-project-manager': 'project-manager',
  'localization-project-manager': 'project-manager',
  'mobile-developer': 'software-developer',
  'web-developer': 'software-developer',
  'frontend-developer': 'software-developer',
  'backend-developer': 'software-developer',
  'fullstack-developer': 'software-developer',
  'qa-engineer': 'software-developer',
  'devops-engineer': 'software-developer',
  'cybersecurity-analyst': 'software-developer',
  'ai-engineer': 'software-developer',
  'civil-engineer': 'engineer',
  'mechanical-engineer': 'engineer',
  'robotics-engineer': 'engineer',
  'it-engineer': 'engineer',
  'dentist': 'doctor',
  'physiotherapist': 'nurse',
  'social-worker': 'psychologist',
};

/**
 * Get top employers for a career. Falls back to aliased career if
 * the exact ID has no data. Returns empty array if nothing matches.
 */
export function getTopEmployers(careerId: string): Employer[] {
  return CAREER_EMPLOYERS[careerId]
    ?? CAREER_EMPLOYERS[CAREER_ID_ALIASES[careerId] ?? '']
    ?? [];
}

/**
 * Whether a career has top-employer data.
 */
export function hasTopEmployers(careerId: string): boolean {
  return (CAREER_EMPLOYERS[careerId]?.length ?? 0) > 0;
}

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

/**
 * Representative Norwegian employers per career *category* — a
 * sector-level fallback so careers without a hand-curated
 * CAREER_EMPLOYERS list still get a realistic, linked set of places
 * to work (used by both the "Where People Work" list and the
 * "Companies" side tab, and the "A Typical Day" example line).
 *
 * These are well-known, sector-emblematic Norwegian employers (a mix
 * of private companies and public institutions). Each links to its
 * careers page where we're confident of the exact path, otherwise to
 * the company's main site (always a working link — never a guess that
 * 404s). Keyed by the CareerCategory string values from career-pathways.ts.
 */
const CATEGORY_EMPLOYERS: Record<string, Employer[]> = {
  HEALTHCARE_LIFE_SCIENCES: [
    { name: 'Oslo universitetssykehus', industry: 'Healthcare', size: '20,000+', careersUrl: 'https://oslo-universitetssykehus.no/jobb' },
    { name: 'Helse Bergen / Haukeland', industry: 'Healthcare', size: '13,000+', careersUrl: 'https://helse-bergen.no/jobb' },
    { name: 'St. Olavs hospital', industry: 'Healthcare', size: '11,000+', careersUrl: 'https://stolav.no/jobb' },
    { name: 'Aleris', industry: 'Private Healthcare', size: '1,000+', careersUrl: 'https://www.aleris.no/karriere/' },
    { name: 'Volvat Medisinske Senter', industry: 'Private Healthcare', size: '1,000+', careersUrl: 'https://www.volvat.no/om-oss/jobb/' },
  ],
  EDUCATION_TRAINING: [
    { name: 'Oslo kommune (schools)', industry: 'Public Education', size: '50,000+', careersUrl: 'https://www.oslo.kommune.no/jobb/' },
    { name: 'Universitetet i Oslo', industry: 'Higher Education', size: '7,000+', careersUrl: 'https://www.uio.no/om/jobb/' },
    { name: 'NTNU', industry: 'Higher Education', size: '9,000+', careersUrl: 'https://www.ntnu.no/jobb' },
    { name: 'Kristiania University College', industry: 'Higher Education', size: '1,000+', careersUrl: 'https://www.kristiania.no/om-kristiania/jobb-hos-oss/' },
  ],
  TECHNOLOGY_IT: [
    { name: 'Bekk', industry: 'IT Consulting', size: '500+', careersUrl: 'https://www.bekk.no/jobb' },
    { name: 'Visma', industry: 'Software / SaaS', size: '3,000+', careersUrl: 'https://www.visma.no/karriere/' },
    { name: 'Schibsted', industry: 'Media / Tech', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
    { name: 'TietoEVRY', industry: 'IT Services', size: '3,000+', careersUrl: 'https://www.tietoevry.com/en/careers/' },
    { name: 'Sopra Steria', industry: 'IT Consulting', size: '2,500+', careersUrl: 'https://www.soprasteria.no/karriere' },
  ],
  ARTIFICIAL_INTELLIGENCE: [
    { name: 'Cognite', industry: 'Industrial AI / Software', size: '900+', careersUrl: 'https://www.cognite.com/careers' },
    { name: 'Telenor', industry: 'Telecom / AI Research', size: '15,000+', careersUrl: 'https://www.telenor.com/career/open-positions/' },
    { name: 'Visma', industry: 'Software / SaaS', size: '3,000+', careersUrl: 'https://www.visma.no/karriere/' },
    { name: 'Schibsted', industry: 'Media / Tech', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
  ],
  BUSINESS_MANAGEMENT: [
    { name: 'DNB', industry: 'Banking / Finance', size: '9,000+', careersUrl: 'https://www.dnb.no/karriere' },
    { name: 'Equinor', industry: 'Energy', size: '22,000+', careersUrl: 'https://www.equinor.com/careers' },
    { name: 'Telenor', industry: 'Telecom', size: '15,000+', careersUrl: 'https://www.telenor.com/career/open-positions/' },
    { name: 'Orkla', industry: 'Consumer Goods', size: '18,000+', careersUrl: 'https://www.orkla.com/careers/' },
  ],
  FINANCE_BANKING: [
    { name: 'DNB', industry: 'Banking / Finance', size: '9,000+', careersUrl: 'https://www.dnb.no/karriere' },
    { name: 'Storebrand', industry: 'Insurance / Pensions', size: '2,000+', careersUrl: 'https://www.storebrand.no' },
    { name: 'Nordea', industry: 'Banking', size: '4,000+', careersUrl: 'https://www.nordea.com/en/careers' },
    { name: 'Gjensidige', industry: 'Insurance', size: '4,000+', careersUrl: 'https://www.gjensidige.no' },
  ],
  SALES_MARKETING: [
    { name: 'Schibsted', industry: 'Media / Marketplaces', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
    { name: 'Orkla', industry: 'Consumer Goods', size: '18,000+', careersUrl: 'https://www.orkla.com/careers/' },
    { name: 'Telenor', industry: 'Telecom', size: '15,000+', careersUrl: 'https://www.telenor.com/career/open-positions/' },
    { name: 'Finn.no', industry: 'Marketplace', size: '500+', careersUrl: 'https://hjemmehos.finn.no/jobb-i-finn/' },
  ],
  MANUFACTURING_ENGINEERING: [
    { name: 'Equinor', industry: 'Energy', size: '22,000+', careersUrl: 'https://www.equinor.com/careers' },
    { name: 'Aker Solutions', industry: 'Energy / Engineering', size: '5,000+', careersUrl: 'https://www.akersolutions.com/careers/' },
    { name: 'Kongsberg Gruppen', industry: 'Defence / Maritime', size: '12,000+', careersUrl: 'https://www.kongsberg.com/careers/' },
    { name: 'Norsk Hydro', industry: 'Aluminium / Energy', size: '30,000+', careersUrl: 'https://www.hydro.com/en/careers/' },
    { name: 'Multiconsult', industry: 'Engineering Consulting', size: '3,000+', careersUrl: 'https://www.multiconsult.no/karriere/' },
  ],
  LOGISTICS_TRANSPORT: [
    { name: 'Posten Bring', industry: 'Postal / Logistics', size: '17,000+', careersUrl: 'https://www.postennorge.no' },
    { name: 'DB Schenker', industry: 'Freight / Logistics', size: '2,000+', careersUrl: 'https://www.dbschenker.com/no-no' },
    { name: 'Wilh. Wilhelmsen', industry: 'Maritime / Logistics', size: '5,000+', careersUrl: 'https://www.wilhelmsen.com/careers/' },
    { name: 'Vy', industry: 'Rail / Transport', size: '11,000+', careersUrl: 'https://www.vy.no/vygruppen/jobb-i-vy' },
  ],
  HOSPITALITY_TOURISM: [
    { name: 'Scandic Hotels', industry: 'Hotels', size: '2,000+', careersUrl: 'https://www.scandichotels.com/career' },
    { name: 'Strawberry (Nordic Choice)', industry: 'Hotels', size: '16,000+', careersUrl: 'https://strawberry.no' },
    { name: 'SAS', industry: 'Aviation', size: '7,000+', careersUrl: 'https://www.sasgroup.net/career/' },
    { name: 'Thon Hotels', industry: 'Hotels', size: '3,000+', careersUrl: 'https://www.thonhotels.no' },
  ],
  TELECOMMUNICATIONS: [
    { name: 'Telenor', industry: 'Telecom', size: '15,000+', careersUrl: 'https://www.telenor.com/career/open-positions/' },
    { name: 'Telia', industry: 'Telecom', size: '3,000+', careersUrl: 'https://www.telia.no/om-telia/karriere/' },
    { name: 'ICE', industry: 'Telecom', size: '500+', careersUrl: 'https://www.ice.no/om-ice/jobb/' },
    { name: 'Altibox', industry: 'Broadband / Telecom', size: '1,000+', careersUrl: 'https://www.altibox.no' },
  ],
  CREATIVE_MEDIA: [
    { name: 'NRK', industry: 'Public Broadcasting', size: '3,000+', careersUrl: 'https://www.nrk.no' },
    { name: 'Schibsted', industry: 'Media / Tech', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
    { name: 'TV 2', industry: 'Broadcasting', size: '1,000+', careersUrl: 'https://www.tv2.no' },
    { name: 'Aller Media', industry: 'Publishing', size: '500+', careersUrl: 'https://aller.no' },
  ],
  PUBLIC_SERVICE_SAFETY: [
    { name: 'NAV', industry: 'Government / Welfare', size: '20,000+', careersUrl: 'https://www.nav.no/jobb-i-nav' },
    { name: 'Politiet', industry: 'Police', size: '17,000+', careersUrl: 'https://www.politiet.no/jobb' },
    { name: 'Oslo kommune', industry: 'Municipal', size: '50,000+', careersUrl: 'https://www.oslo.kommune.no/jobb/' },
    { name: 'Skatteetaten', industry: 'Tax Administration', size: '7,000+', careersUrl: 'https://www.skatteetaten.no/om-skatteetaten/jobb-hos-oss/' },
  ],
  MILITARY_DEFENCE: [
    { name: 'Forsvaret', industry: 'Armed Forces', size: '23,000+', careersUrl: 'https://www.forsvaret.no/jobb' },
    { name: 'Kongsberg Defence & Aerospace', industry: 'Defence', size: '4,000+', careersUrl: 'https://www.kongsberg.com/careers/' },
    { name: 'Nammo', industry: 'Defence / Aerospace', size: '2,800+', careersUrl: 'https://www.nammo.com/careers/' },
    { name: 'Forsvarets forskningsinstitutt (FFI)', industry: 'Defence Research', size: '800+', careersUrl: 'https://www.ffi.no/jobb' },
  ],
  SPORT_FITNESS: [
    { name: 'SATS', industry: 'Fitness', size: '5,000+', careersUrl: 'https://www.sats.no' },
    { name: 'Olympiatoppen', industry: 'Elite Sport', size: '200+', careersUrl: 'https://www.olympiatoppen.no' },
    { name: 'Norges idrettsforbund', industry: 'Sport Federation', size: '1,000+', careersUrl: 'https://www.idrettsforbundet.no' },
    { name: 'Norges Fotballforbund', industry: 'Football', size: '300+', careersUrl: 'https://www.fotball.no' },
  ],
  REAL_ESTATE_PROPERTY: [
    { name: 'OBOS', industry: 'Housing / Property', size: '2,500+', careersUrl: 'https://www.obos.no' },
    { name: 'Olav Thon Gruppen', industry: 'Property', size: '3,400+', careersUrl: 'https://www.olavthon.no' },
    { name: 'DNB Eiendom', industry: 'Estate Agency', size: '1,000+', careersUrl: 'https://www.dnbeiendom.no' },
    { name: 'Entra', industry: 'Commercial Property', size: '300+', careersUrl: 'https://entra.no' },
  ],
  SOCIAL_CARE_COMMUNITY: [
    { name: 'NAV', industry: 'Government / Welfare', size: '20,000+', careersUrl: 'https://www.nav.no/jobb-i-nav' },
    { name: 'Oslo kommune', industry: 'Municipal Care', size: '50,000+', careersUrl: 'https://www.oslo.kommune.no/jobb/' },
    { name: 'Røde Kors', industry: 'Humanitarian', size: '2,000+', careersUrl: 'https://www.rodekors.no' },
    { name: 'Frelsesarmeen', industry: 'Social Care', size: '2,000+', careersUrl: 'https://www.frelsesarmeen.no' },
  ],
  CONSTRUCTION_TRADES: [
    { name: 'Veidekke', industry: 'Construction', size: '8,000+', careersUrl: 'https://www.veidekke.no' },
    { name: 'Skanska Norge', industry: 'Construction', size: '4,000+', careersUrl: 'https://www.skanska.no' },
    { name: 'AF Gruppen', industry: 'Construction', size: '5,000+', careersUrl: 'https://afgruppen.no' },
    { name: 'Backe', industry: 'Construction', size: '1,500+', careersUrl: 'https://www.backe.no' },
  ],
};

/**
 * Full list of realistic employers for a career, for the "Where People
 * Work" list and the "Companies" side tab. Prefers the hand-curated
 * CAREER_EMPLOYERS list (most specific, ranked), and falls back to the
 * career's *sector* employers so every career with a known category
 * gets a real, linked set of places to work. Returns [] when neither
 * the career nor its category is known.
 */
export function getCareerEmployers(careerId: string, category?: string | null): Employer[] {
  const curated = getTopEmployers(careerId);
  if (curated.length > 0) return curated;
  if (category && CATEGORY_EMPLOYERS[category]) return CATEGORY_EMPLOYERS[category];
  return [];
}

/**
 * Whether we have any employers (curated or sector-level) to show for
 * a career — gates the "Where People Work" section and "Companies" tab.
 */
export function hasCareerEmployers(careerId: string, category?: string | null): boolean {
  return getCareerEmployers(careerId, category).length > 0;
}

/**
 * One or two realistic example employer *names* for a career, for the
 * inline "Typically somewhere like X or Y" hint on the Typical Day card.
 * Shares its source with the full employer list (curated → sector).
 */
export function getRepresentativeEmployers(
  careerId: string,
  category?: string | null,
): string[] {
  return getCareerEmployers(careerId, category).slice(0, 2).map((e) => e.name);
}

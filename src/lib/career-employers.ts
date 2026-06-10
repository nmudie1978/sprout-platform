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
 * Sector-level Spanish employers — major, well-known Spanish companies
 * and institutions per CareerCategory. Mirrors CATEGORY_EMPLOYERS so a
 * Spain user sees Santander / Telefónica / Inditex rather than Telenor.
 * Links use each company's stable main site (no 404-prone career-page
 * slugs). Keyed by the CareerCategory string values.
 */
const CATEGORY_EMPLOYERS_ES: Record<string, Employer[]> = {
  HEALTHCARE_LIFE_SCIENCES: [
    { name: 'Quirónsalud', industry: 'Private Healthcare', size: '40,000+', careersUrl: 'https://www.quironsalud.es' },
    { name: 'Sanitas', industry: 'Healthcare / Insurance', size: '11,000+', careersUrl: 'https://www.sanitas.es' },
    { name: 'HM Hospitales', industry: 'Private Healthcare', size: '6,000+', careersUrl: 'https://www.hmhospitales.com' },
    { name: 'Servicio Madrileño de Salud (SERMAS)', industry: 'Public Health', size: '80,000+', careersUrl: 'https://www.comunidad.madrid/servicios/salud' },
  ],
  EDUCATION_TRAINING: [
    { name: 'Comunidad de Madrid (Educación)', industry: 'Public Education', size: '100,000+', careersUrl: 'https://www.comunidad.madrid/servicios/educacion' },
    { name: 'Universidad Complutense de Madrid', industry: 'Higher Education', size: '7,000+', careersUrl: 'https://www.ucm.es' },
    { name: 'Grupo SM', industry: 'Education Publishing', size: '2,000+', careersUrl: 'https://www.grupo-sm.com' },
    { name: 'Santillana', industry: 'Education Publishing', size: '2,000+', careersUrl: 'https://www.santillana.com' },
  ],
  TECHNOLOGY_IT: [
    { name: 'Indra / Minsait', industry: 'IT Consulting', size: '57,000+', careersUrl: 'https://www.indracompany.com' },
    { name: 'Telefónica Tech', industry: 'Technology', size: '6,000+', careersUrl: 'https://telefonicatech.com' },
    { name: 'Amadeus', industry: 'Travel Technology', size: '19,000+', careersUrl: 'https://amadeus.com' },
    { name: 'NTT Data Europe', industry: 'IT Services', size: '15,000+', careersUrl: 'https://es.nttdata.com' },
  ],
  ARTIFICIAL_INTELLIGENCE: [
    { name: 'Telefónica Tech', industry: 'AI / Technology', size: '6,000+', careersUrl: 'https://telefonicatech.com' },
    { name: 'Indra / Minsait', industry: 'AI / Consulting', size: '57,000+', careersUrl: 'https://www.indracompany.com' },
    { name: 'BBVA', industry: 'Banking (AI Factory)', size: '120,000+', careersUrl: 'https://www.bbva.com' },
    { name: 'Amadeus', industry: 'Travel Technology', size: '19,000+', careersUrl: 'https://amadeus.com' },
  ],
  BUSINESS_MANAGEMENT: [
    { name: 'Inditex', industry: 'Retail', size: '160,000+', careersUrl: 'https://www.inditex.com' },
    { name: 'BBVA', industry: 'Banking', size: '120,000+', careersUrl: 'https://www.bbva.com' },
    { name: 'Iberdrola', industry: 'Energy', size: '40,000+', careersUrl: 'https://www.iberdrola.com' },
    { name: 'Telefónica', industry: 'Telecom', size: '100,000+', careersUrl: 'https://www.telefonica.com' },
  ],
  FINANCE_BANKING: [
    { name: 'Banco Santander', industry: 'Banking', size: '210,000+', careersUrl: 'https://www.santander.com' },
    { name: 'BBVA', industry: 'Banking', size: '120,000+', careersUrl: 'https://www.bbva.com' },
    { name: 'CaixaBank', industry: 'Banking', size: '45,000+', careersUrl: 'https://www.caixabank.com' },
    { name: 'Mapfre', industry: 'Insurance', size: '30,000+', careersUrl: 'https://www.mapfre.com' },
  ],
  SALES_MARKETING: [
    { name: 'Inditex', industry: 'Retail', size: '160,000+', careersUrl: 'https://www.inditex.com' },
    { name: 'El Corte Inglés', industry: 'Retail', size: '80,000+', careersUrl: 'https://www.elcorteingles.es' },
    { name: 'Telefónica', industry: 'Telecom', size: '100,000+', careersUrl: 'https://www.telefonica.com' },
    { name: 'Mahou San Miguel', industry: 'Consumer Goods', size: '4,000+', careersUrl: 'https://www.mahou-sanmiguel.com' },
  ],
  MANUFACTURING_ENGINEERING: [
    { name: 'Iberdrola', industry: 'Energy', size: '40,000+', careersUrl: 'https://www.iberdrola.com' },
    { name: 'Repsol', industry: 'Energy', size: '24,000+', careersUrl: 'https://www.repsol.com' },
    { name: 'Acciona', industry: 'Infrastructure / Energy', size: '40,000+', careersUrl: 'https://www.acciona.com' },
    { name: 'Airbus España', industry: 'Aerospace', size: '12,000+', careersUrl: 'https://www.airbus.com' },
  ],
  LOGISTICS_TRANSPORT: [
    { name: 'Renfe', industry: 'Rail', size: '15,000+', careersUrl: 'https://www.renfe.com' },
    { name: 'Correos', industry: 'Postal / Logistics', size: '50,000+', careersUrl: 'https://www.correos.es' },
    { name: 'SEUR', industry: 'Courier', size: '7,000+', careersUrl: 'https://www.seur.com' },
    { name: 'DHL España', industry: 'Logistics', size: '5,000+', careersUrl: 'https://www.dhl.com/es-es' },
  ],
  HOSPITALITY_TOURISM: [
    { name: 'Meliá Hotels International', industry: 'Hotels', size: '12,000+', careersUrl: 'https://www.melia.com' },
    { name: 'NH Hotel Group', industry: 'Hotels', size: '14,000+', careersUrl: 'https://www.nh-hotels.com' },
    { name: 'Iberia', industry: 'Aviation', size: '16,000+', careersUrl: 'https://www.iberia.com' },
    { name: 'RIU Hotels & Resorts', industry: 'Hotels', size: '30,000+', careersUrl: 'https://www.riu.com' },
  ],
  TELECOMMUNICATIONS: [
    { name: 'Telefónica / Movistar', industry: 'Telecom', size: '100,000+', careersUrl: 'https://www.telefonica.com' },
    { name: 'Vodafone España', industry: 'Telecom', size: '4,000+', careersUrl: 'https://www.vodafone.es' },
    { name: 'Orange España', industry: 'Telecom', size: '6,000+', careersUrl: 'https://www.orange.es' },
    { name: 'MásMóvil', industry: 'Telecom', size: '2,000+', careersUrl: 'https://www.masmovil.es' },
  ],
  CREATIVE_MEDIA: [
    { name: 'RTVE', industry: 'Public Broadcasting', size: '6,000+', careersUrl: 'https://www.rtve.es' },
    { name: 'Atresmedia', industry: 'Media', size: '2,000+', careersUrl: 'https://www.atresmediacorporacion.com' },
    { name: 'Mediaset España', industry: 'Media', size: '1,000+', careersUrl: 'https://www.mediaset.es' },
    { name: 'Grupo PRISA', industry: 'Media / Publishing', size: '8,000+', careersUrl: 'https://www.prisa.com' },
  ],
  PUBLIC_SERVICE_SAFETY: [
    { name: 'Administración General del Estado', industry: 'Public Sector', size: '500,000+', careersUrl: 'https://www.administracion.gob.es' },
    { name: 'Policía Nacional', industry: 'Police', size: '65,000+', careersUrl: 'https://www.policia.es' },
    { name: 'Guardia Civil', industry: 'Police', size: '75,000+', careersUrl: 'https://www.guardiacivil.es' },
    { name: 'Ayuntamiento de Madrid', industry: 'Municipal', size: '30,000+', careersUrl: 'https://www.madrid.es' },
  ],
  MILITARY_DEFENCE: [
    { name: 'Fuerzas Armadas (Min. de Defensa)', industry: 'Armed Forces', size: '120,000+', careersUrl: 'https://www.defensa.gob.es' },
    { name: 'Navantia', industry: 'Naval Defence', size: '4,000+', careersUrl: 'https://www.navantia.es' },
    { name: 'Indra (Defence)', industry: 'Defence Technology', size: '57,000+', careersUrl: 'https://www.indracompany.com' },
    { name: 'Airbus Defence and Space', industry: 'Defence / Aerospace', size: '12,000+', careersUrl: 'https://www.airbus.com' },
  ],
  SPORT_FITNESS: [
    { name: 'Consejo Superior de Deportes', industry: 'Public Sport', size: '500+', careersUrl: 'https://www.csd.gob.es' },
    { name: 'Real Federación Española de Fútbol', industry: 'Football', size: '500+', careersUrl: 'https://www.rfef.es' },
    { name: 'GO fit', industry: 'Fitness', size: '3,000+', careersUrl: 'https://www.go-fit.es' },
    { name: 'VivaGym', industry: 'Fitness', size: '2,000+', careersUrl: 'https://www.vivagym.com/es-es/' },
  ],
  REAL_ESTATE_PROPERTY: [
    { name: 'Neinor Homes', industry: 'Property Developer', size: '600+', careersUrl: 'https://www.neinorhomes.com' },
    { name: 'Metrovacesa', industry: 'Property Developer', size: '300+', careersUrl: 'https://www.metrovacesa.com' },
    { name: 'Aedas Homes', industry: 'Property Developer', size: '400+', careersUrl: 'https://www.aedashomes.com' },
    { name: 'Solvia', industry: 'Real Estate Services', size: '1,000+', careersUrl: 'https://www.solvia.es' },
  ],
  SOCIAL_CARE_COMMUNITY: [
    { name: 'Cruz Roja Española', industry: 'Humanitarian', size: '12,000+', careersUrl: 'https://www.cruzroja.es' },
    { name: 'Cáritas', industry: 'Social Care', size: '4,000+', careersUrl: 'https://www.caritas.es' },
    { name: 'Fundación ONCE', industry: 'Disability / Social', size: '1,400+', careersUrl: 'https://www.fundaciononce.es' },
    { name: 'Ayuntamiento de Madrid (Servicios Sociales)', industry: 'Municipal Care', size: '30,000+', careersUrl: 'https://www.madrid.es' },
  ],
  CONSTRUCTION_TRADES: [
    { name: 'ACS Group', industry: 'Construction', size: '120,000+', careersUrl: 'https://www.grupoacs.com' },
    { name: 'Ferrovial', industry: 'Construction / Infrastructure', size: '24,000+', careersUrl: 'https://www.ferrovial.com' },
    { name: 'Acciona', industry: 'Construction', size: '40,000+', careersUrl: 'https://www.acciona.com' },
    { name: 'FCC', industry: 'Construction / Services', size: '60,000+', careersUrl: 'https://www.fcc.es' },
  ],
};

/** Which curated employer dataset a country maps to: Norway (incl.
 *  unknown → app default) or Spain. Others return null = no data. */
/**
 * Consultancy firms — these are GLOBAL employers (Oslo *and* Madrid
 * offices), so the same set serves both Norway and Spain. They get their
 * own list because the sector fallback would otherwise show a consultant
 * the companies that *hire* consultants (DNB, Telefónica…) rather than
 * the firms they'd actually work for. Stable main-site links.
 */
const CONSULTING_EMPLOYERS: Employer[] = [
  { name: 'McKinsey & Company', industry: 'Strategy Consulting', size: '45,000+', careersUrl: 'https://www.mckinsey.com/careers' },
  { name: 'Boston Consulting Group (BCG)', industry: 'Strategy Consulting', size: '32,000+', careersUrl: 'https://careers.bcg.com' },
  { name: 'Bain & Company', industry: 'Strategy Consulting', size: '19,000+', careersUrl: 'https://www.bain.com/careers/' },
  { name: 'Accenture', industry: 'Technology & Consulting', size: '740,000+', careersUrl: 'https://www.accenture.com' },
  { name: 'Capgemini', industry: 'Technology Consulting', size: '340,000+', careersUrl: 'https://www.capgemini.com' },
  { name: 'Deloitte', industry: 'Audit / Consulting', size: '450,000+', careersUrl: 'https://www.deloitte.com' },
  { name: 'EY', industry: 'Audit / Advisory', size: '390,000+', careersUrl: 'https://www.ey.com' },
  { name: 'KPMG', industry: 'Audit / Advisory', size: '270,000+', careersUrl: 'https://kpmg.com' },
  { name: 'PwC', industry: 'Audit / Advisory', size: '360,000+', careersUrl: 'https://www.pwc.com' },
  { name: 'BearingPoint', industry: 'Management & Tech Consulting', size: '5,000+', careersUrl: 'https://www.bearingpoint.com/en/careers/' },
];

/**
 * Telecoms / TMT strategy consultancies — for the telco strategy & analyst
 * careers, led by the sector specialists (Analysys Mason, Arthur D. Little)
 * plus the big firms' TMT practices.
 */
const TELCO_CONSULTING_EMPLOYERS: Employer[] = [
  { name: 'Analysys Mason', industry: 'Telecoms / TMT Strategy Consulting', size: '1,000+', careersUrl: 'https://www.analysysmason.com' },
  { name: 'Arthur D. Little', industry: 'Technology & Strategy Consulting', size: '2,500+', careersUrl: 'https://www.adlittle.com' },
  { name: 'Accenture (Communications & Media)', industry: 'Technology Consulting', size: '740,000+', careersUrl: 'https://www.accenture.com' },
  { name: 'Capgemini Invent', industry: 'Technology Consulting', size: '340,000+', careersUrl: 'https://www.capgemini.com' },
  { name: 'McKinsey & Company (TMT)', industry: 'Strategy Consulting', size: '45,000+', careersUrl: 'https://www.mckinsey.com/careers' },
  { name: 'Boston Consulting Group (TMT)', industry: 'Strategy Consulting', size: '32,000+', careersUrl: 'https://careers.bcg.com' },
];

/** Careers that are primarily about *working at a consultancy* — they get
 *  the consulting-firm list instead of the sector fallback. */
const CONSULTING_CAREERS = new Set([
  'management-consultant', 'senior-management-consultant', 'strategy-consultant',
  'principal-consultant', 'consulting-partner', 'independent-consultant',
  'transformation-consultant', 'technology-strategy-consultant',
  'enterprise-systems-consultant', 'ai-consultant',
]);

/** Telecoms-strategy careers — the Analysys-Mason-led specialist list. */
const TELCO_CONSULTING_CAREERS = new Set([
  'telco-strategy-manager', 'telco-business-analyst', 'telco-pricing-analyst',
  'telco-pmo-analyst',
]);

function employerCountry(country?: string | null): 'NO' | 'ES' | null {
  if (!country) return 'NO'; // unknown → app default is Norway
  const c = country.trim().toLowerCase();
  if (c === 'no' || c === 'norway' || c === 'norge') return 'NO';
  if (c === 'es' || c === 'spain' || c === 'españa' || c === 'espana') return 'ES';
  return null;
}

/**
 * Whether we have employer data for this viewer's country (Norway or
 * Spain; unknown defaults to Norway). False for e.g. Sweden/Italy until
 * we curate them.
 */
export function employersApplyTo(country?: string | null): boolean {
  return employerCountry(country) !== null;
}

/**
 * Full list of realistic employers for a career, for the "Where People
 * Work" list and the "Companies" side tab — localised to the viewer's
 * country. Norway: curated CAREER_EMPLOYERS → sector fallback. Spain:
 * sector-level Spanish employers. Returns [] for countries without
 * data, or when neither the career nor its category is known.
 */
/**
 * Emergency / law-enforcement careers have *specific* employers (a police
 * officer works at Politiet, not NAV or Skatteetaten), but they all sit in
 * the broad PUBLIC_SERVICE_SAFETY category — so without an override they
 * inherit the generic public-sector list. These are country-specific
 * institutions, so each career has a NO and an ES list. Checked before the
 * sector fallback. Stable main-site links.
 */
const SAFETY_EMPLOYERS: Record<string, { NO: Employer[]; ES: Employer[] }> = {
  'police-officer': {
    NO: [
      { name: 'Politiet', industry: 'Police', size: '17,000+', careersUrl: 'https://www.politiet.no/jobb' },
      { name: 'Politiets sikkerhetstjeneste (PST)', industry: 'Security Police', size: '900+', careersUrl: 'https://www.pst.no' },
      { name: 'Politihøgskolen', industry: 'Police Education', size: '400+', careersUrl: 'https://www.politihogskolen.no' },
    ],
    ES: [
      { name: 'Policía Nacional', industry: 'National Police', size: '65,000+', careersUrl: 'https://www.policia.es' },
      { name: 'Guardia Civil', industry: 'Gendarmerie', size: '75,000+', careersUrl: 'https://www.guardiacivil.es' },
      { name: "Mossos d'Esquadra", industry: 'Regional Police (Catalonia)', size: '17,000+', careersUrl: 'https://mossos.gencat.cat' },
      { name: 'Ertzaintza', industry: 'Regional Police (Basque Country)', size: '8,000+', careersUrl: 'https://www.ertzaintza.euskadi.eus' },
    ],
  },
  firefighter: {
    NO: [
      { name: 'Oslo brann- og redningsetat', industry: 'Fire & Rescue', size: '600+', careersUrl: 'https://www.oslo.kommune.no' },
      { name: 'Bergen brannvesen', industry: 'Fire & Rescue', size: '400+', careersUrl: 'https://www.bergen.kommune.no' },
      { name: 'DSB (samfunnssikkerhet og beredskap)', industry: 'Civil Protection', size: '700+', careersUrl: 'https://www.dsb.no' },
    ],
    ES: [
      { name: 'Bomberos de Madrid', industry: 'Fire & Rescue', size: '1,500+', careersUrl: 'https://www.madrid.es' },
      { name: 'Bombers de Barcelona', industry: 'Fire & Rescue', size: '700+', careersUrl: 'https://www.barcelona.cat' },
      { name: 'Protección Civil', industry: 'Civil Protection', size: '2,000+', careersUrl: 'https://www.proteccioncivil.es' },
    ],
  },
  'customs-officer': {
    NO: [{ name: 'Tolletaten', industry: 'Customs', size: '1,900+', careersUrl: 'https://www.toll.no' }],
    ES: [{ name: 'Agencia Tributaria (Aduanas)', industry: 'Customs / Tax', size: '25,000+', careersUrl: 'https://www.agenciatributaria.es' }],
  },
  'corrections-officer': {
    NO: [{ name: 'Kriminalomsorgen', industry: 'Correctional Service', size: '4,500+', careersUrl: 'https://www.kriminalomsorgen.no' }],
    ES: [{ name: 'Instituciones Penitenciarias', industry: 'Prison Service', size: '24,000+', careersUrl: 'https://www.institucionpenitenciaria.es' }],
  },
  'probation-officer': {
    NO: [{ name: 'Kriminalomsorgen', industry: 'Correctional Service', size: '4,500+', careersUrl: 'https://www.kriminalomsorgen.no' }],
    ES: [{ name: 'Instituciones Penitenciarias', industry: 'Prison Service', size: '24,000+', careersUrl: 'https://www.institucionpenitenciaria.es' }],
  },
  'coast-guard-officer': {
    NO: [{ name: 'Kystvakten (Forsvaret)', industry: 'Coast Guard / Armed Forces', size: '23,000+', careersUrl: 'https://www.forsvaret.no/jobb' }],
    ES: [
      { name: 'Salvamento Marítimo', industry: 'Maritime Rescue', size: '1,500+', careersUrl: 'https://www.salvamentomaritimo.es' },
      { name: 'Guardia Civil (Servicio Marítimo)', industry: 'Maritime Police', size: '75,000+', careersUrl: 'https://www.guardiacivil.es' },
    ],
  },
  'immigration-officer': {
    NO: [
      { name: 'UDI (Utlendingsdirektoratet)', industry: 'Immigration', size: '1,200+', careersUrl: 'https://www.udi.no' },
      { name: 'Politiet', industry: 'Police (border control)', size: '17,000+', careersUrl: 'https://www.politiet.no/jobb' },
    ],
    ES: [{ name: 'Policía Nacional (Extranjería)', industry: 'Immigration Police', size: '65,000+', careersUrl: 'https://www.policia.es' }],
  },
  'civil-defence-officer': {
    NO: [{ name: 'DSB / Sivilforsvaret', industry: 'Civil Protection', size: '700+', careersUrl: 'https://www.dsb.no' }],
    ES: [{ name: 'Protección Civil', industry: 'Civil Protection', size: '2,000+', careersUrl: 'https://www.proteccioncivil.es' }],
  },
};

/**
 * AI / ML / data roles are a global talent market — the people who do this
 * work are hired by the firms that actually *build and run* AI: the frontier
 * labs (OpenAI, Anthropic, Google DeepMind), the hyperscalers and chip/cloud
 * infrastructure players (NVIDIA, Microsoft, Google, Meta, AWS, nscale,
 * TikTok), plus a layer of Nordic companies with real AI/ML teams (Cognite,
 * Schibsted, Telenor, Equinor) and, for research/governance roles, the
 * universities and the data-protection authority.
 *
 * Without this override an AI role falls through to the generic TECHNOLOGY_IT
 * sector list (Bekk, TietoEVRY, Sopra Steria) — Norwegian IT *consultancies*,
 * which is who you'd join to consult, NOT who designs GPU-cluster fabrics or
 * trains frontier models. These are global firms (Oslo, Madrid, and remote),
 * so — like CONSULTING_EMPLOYERS — the same list serves every country we show.
 *
 * Keyed by career id, with AI_ROLE_ALIASES folding seniority/variant ids onto
 * the canonical role. Links are stable careers/main-site URLs (never a guessed
 * slug that 404s).
 */
const AI_ROLE_EMPLOYERS: Record<string, Employer[]> = {
  // AI Infrastructure Network Engineer — GPU clusters, InfiniBand, datacentre
  // fabrics. Hired by GPU clouds, hyperscalers, chip & networking vendors and
  // DC operators — emphatically not IT consultancies. Broad list so a young
  // person sees the full landscape of where this work actually happens.
  'ai-network-engineer': [
    { name: 'nscale', industry: 'GPU Cloud / AI Infrastructure', size: '200+', careersUrl: 'https://www.nscale.com' },
    { name: 'CoreWeave', industry: 'GPU Cloud', size: '1,000+', careersUrl: 'https://www.coreweave.com' },
    { name: 'Nebius', industry: 'AI Cloud / GPU', size: '1,000+', careersUrl: 'https://nebius.com' },
    { name: 'Crusoe', industry: 'AI Cloud / Energy', size: '500+', careersUrl: 'https://www.crusoe.ai' },
    { name: 'Lambda', industry: 'GPU Cloud', size: '500+', careersUrl: 'https://lambdalabs.com' },
    { name: 'Together AI', industry: 'GPU Cloud / Inference', size: '250+', careersUrl: 'https://www.together.ai' },
    { name: 'Core42 (G42)', industry: 'AI Cloud Infrastructure', size: '1,500+', careersUrl: 'https://core42.ai' },
    { name: 'Oracle Cloud (OCI)', industry: 'Cloud AI Infrastructure', size: '160,000+', careersUrl: 'https://www.oracle.com/careers/' },
    { name: 'NVIDIA', industry: 'GPU & Datacentre Networking', size: '29,000+', careersUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
    { name: 'Arista Networks', industry: 'AI Datacentre Networking', size: '4,000+', careersUrl: 'https://www.arista.com' },
    { name: 'Cisco', industry: 'Datacentre Networking', size: '90,000+', careersUrl: 'https://jobs.cisco.com' },
    { name: 'Juniper Networks', industry: 'AI Datacentre Networking', size: '11,000+', careersUrl: 'https://www.juniper.net' },
    { name: 'Microsoft', industry: 'Azure AI Infrastructure', size: '220,000+', careersUrl: 'https://careers.microsoft.com' },
    { name: 'Google', industry: 'Cloud AI Infrastructure', size: '180,000+', careersUrl: 'https://careers.google.com' },
    { name: 'Meta', industry: 'AI Infrastructure', size: '70,000+', careersUrl: 'https://www.metacareers.com' },
    { name: 'TikTok / ByteDance', industry: 'AI Datacentres (Hamar, NO)', size: '150,000+', careersUrl: 'https://careers.tiktok.com' },
    { name: 'Bulk Infrastructure', industry: 'Nordic AI Datacentres', size: '300+', careersUrl: 'https://www.bulkinfrastructure.com' },
    { name: 'Telenor', industry: 'Network Infrastructure', size: '15,000+', careersUrl: 'https://www.telenor.com/career/open-positions/' },
  ],
  // MLOps Engineer — ML platform, training/inference infra, model deployment.
  'mlops-engineer': [
    { name: 'NVIDIA', industry: 'AI Computing Platform', size: '29,000+', careersUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
    { name: 'nscale', industry: 'GPU Cloud / AI Infrastructure', size: '200+', careersUrl: 'https://www.nscale.com' },
    { name: 'CoreWeave', industry: 'GPU Cloud', size: '1,000+', careersUrl: 'https://www.coreweave.com' },
    { name: 'Hugging Face', industry: 'ML Platform / Open Source', size: '250+', careersUrl: 'https://huggingface.co/jobs' },
    { name: 'Databricks', industry: 'Data & ML Platform', size: '7,000+', careersUrl: 'https://www.databricks.com/company/careers' },
    { name: 'Snowflake', industry: 'Data Cloud / ML', size: '7,000+', careersUrl: 'https://careers.snowflake.com' },
    { name: 'Microsoft', industry: 'Azure Machine Learning', size: '220,000+', careersUrl: 'https://careers.microsoft.com' },
    { name: 'Google', industry: 'Cloud / Vertex AI', size: '180,000+', careersUrl: 'https://careers.google.com' },
    { name: 'Amazon Web Services', industry: 'AWS / SageMaker', size: '1,500,000+', careersUrl: 'https://www.amazon.jobs' },
    { name: 'Cognite', industry: 'Industrial AI / Software', size: '900+', careersUrl: 'https://www.cognite.com/careers' },
    { name: 'Schibsted', industry: 'Media / Tech (ML platform)', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
    { name: 'Telenor', industry: 'Telecom / AI', size: '15,000+', careersUrl: 'https://www.telenor.com/career/open-positions/' },
  ],
  // Machine Learning Engineer — product ML at scale.
  'machine-learning-engineer': [
    { name: 'Google DeepMind', industry: 'AI Research & Products', size: '180,000+', careersUrl: 'https://deepmind.google' },
    { name: 'Meta', industry: 'AI / Social Technology', size: '70,000+', careersUrl: 'https://www.metacareers.com' },
    { name: 'NVIDIA', industry: 'AI Computing', size: '29,000+', careersUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
    { name: 'Microsoft', industry: 'AI / Cloud', size: '220,000+', careersUrl: 'https://careers.microsoft.com' },
    { name: 'OpenAI', industry: 'Frontier AI Research', size: '2,000+', careersUrl: 'https://openai.com/careers/' },
    { name: 'Anthropic', industry: 'Frontier AI Research', size: '1,000+', careersUrl: 'https://www.anthropic.com/careers' },
    { name: 'Apple', industry: 'AI / Consumer Technology', size: '160,000+', careersUrl: 'https://www.apple.com/careers/' },
    { name: 'Amazon', industry: 'AI / Cloud', size: '1,500,000+', careersUrl: 'https://www.amazon.jobs' },
    { name: 'Cognite', industry: 'Industrial AI / Software', size: '900+', careersUrl: 'https://www.cognite.com/careers' },
    { name: 'Schibsted', industry: 'Media / Tech', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
    { name: 'Telenor', industry: 'Telecom / AI Research', size: '15,000+', careersUrl: 'https://www.telenor.com/career/open-positions/' },
    { name: 'DNB', industry: 'Banking / ML', size: '9,000+', careersUrl: 'https://www.dnb.no/karriere' },
  ],
  // AI Engineer / Applied AI / Generative AI — building LLM-powered products.
  'ai-engineer': [
    { name: 'OpenAI', industry: 'Frontier AI Research', size: '2,000+', careersUrl: 'https://openai.com/careers/' },
    { name: 'Anthropic', industry: 'Frontier AI Research', size: '1,000+', careersUrl: 'https://www.anthropic.com/careers' },
    { name: 'Google', industry: 'AI / Cloud', size: '180,000+', careersUrl: 'https://careers.google.com' },
    { name: 'Microsoft', industry: 'AI / Cloud', size: '220,000+', careersUrl: 'https://careers.microsoft.com' },
    { name: 'Meta', industry: 'AI / Social Technology', size: '70,000+', careersUrl: 'https://www.metacareers.com' },
    { name: 'Mistral AI', industry: 'European AI Lab', size: '250+', careersUrl: 'https://mistral.ai/careers/' },
    { name: 'Cohere', industry: 'Enterprise AI Lab', size: '500+', careersUrl: 'https://cohere.com' },
    { name: 'Scale AI', industry: 'AI Data / Tooling', size: '900+', careersUrl: 'https://scale.com' },
    { name: 'Databricks', industry: 'Data & ML Platform', size: '7,000+', careersUrl: 'https://www.databricks.com/company/careers' },
    { name: 'Cognite', industry: 'Industrial AI / Software', size: '900+', careersUrl: 'https://www.cognite.com/careers' },
    { name: 'Schibsted', industry: 'Media / Tech', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
    { name: 'Telenor', industry: 'Telecom / AI', size: '15,000+', careersUrl: 'https://www.telenor.com/career/open-positions/' },
  ],
  // AI Research Scientist — frontier labs + research institutions.
  'ai-research-scientist': [
    { name: 'OpenAI', industry: 'Frontier AI Research', size: '2,000+', careersUrl: 'https://openai.com/careers/' },
    { name: 'Anthropic', industry: 'Frontier AI Research', size: '1,000+', careersUrl: 'https://www.anthropic.com/careers' },
    { name: 'Google DeepMind', industry: 'AI Research', size: '180,000+', careersUrl: 'https://deepmind.google' },
    { name: 'Meta AI (FAIR)', industry: 'AI Research', size: '70,000+', careersUrl: 'https://www.metacareers.com' },
    { name: 'Microsoft Research', industry: 'AI Research', size: '220,000+', careersUrl: 'https://careers.microsoft.com' },
    { name: 'NVIDIA Research', industry: 'AI Computing Research', size: '29,000+', careersUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
    { name: 'Mistral AI', industry: 'European AI Lab', size: '250+', careersUrl: 'https://mistral.ai/careers/' },
    { name: 'Cohere', industry: 'Enterprise AI Lab', size: '500+', careersUrl: 'https://cohere.com' },
    { name: 'NTNU', industry: 'University AI Research', size: '9,000+', careersUrl: 'https://www.ntnu.no/jobb' },
    { name: 'University of Oslo', industry: 'University AI Research', size: '7,000+', careersUrl: 'https://www.uio.no/om/jobb/' },
    { name: 'Simula Research Laboratory', industry: 'Research Institute', size: '200+', careersUrl: 'https://www.simula.no' },
    { name: 'SINTEF', industry: 'Applied Research Institute', size: '2,000+', careersUrl: 'https://www.sintef.no' },
  ],
  // AI Safety & Ethics Researcher — alignment, evaluation, responsible AI.
  'ai-safety-researcher': [
    { name: 'Anthropic', industry: 'AI Safety Research', size: '1,000+', careersUrl: 'https://www.anthropic.com/careers' },
    { name: 'OpenAI', industry: 'Frontier AI Research', size: '2,000+', careersUrl: 'https://openai.com/careers/' },
    { name: 'Google DeepMind', industry: 'AI Research & Safety', size: '180,000+', careersUrl: 'https://deepmind.google' },
    { name: 'Microsoft', industry: 'Responsible AI', size: '220,000+', careersUrl: 'https://careers.microsoft.com' },
    { name: 'Meta', industry: 'AI Research & Safety', size: '70,000+', careersUrl: 'https://www.metacareers.com' },
    { name: 'NVIDIA', industry: 'Trustworthy AI', size: '29,000+', careersUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
    { name: 'University of Oslo', industry: 'Academic Research', size: '7,000+', careersUrl: 'https://www.uio.no/om/jobb/' },
    { name: 'NTNU', industry: 'University AI Research', size: '9,000+', careersUrl: 'https://www.ntnu.no/jobb' },
    { name: 'Simula Research Laboratory', industry: 'Research Institute', size: '200+', careersUrl: 'https://www.simula.no' },
  ],
  // AI Ethics Specialist — governance, policy, compliance leaning.
  'ai-ethics-specialist': [
    { name: 'Anthropic', industry: 'AI Safety / Policy', size: '1,000+', careersUrl: 'https://www.anthropic.com/careers' },
    { name: 'Google DeepMind', industry: 'AI Research & Governance', size: '180,000+', careersUrl: 'https://deepmind.google' },
    { name: 'Microsoft', industry: 'Responsible AI', size: '220,000+', careersUrl: 'https://careers.microsoft.com' },
    { name: 'OpenAI', industry: 'AI Policy', size: '2,000+', careersUrl: 'https://openai.com/careers/' },
    { name: 'Datatilsynet', industry: 'Data Protection Authority', size: '60+', careersUrl: 'https://www.datatilsynet.no' },
    { name: 'University of Oslo', industry: 'Academic Research', size: '7,000+', careersUrl: 'https://www.uio.no/om/jobb/' },
    { name: 'NTNU', industry: 'University AI Research', size: '9,000+', careersUrl: 'https://www.ntnu.no/jobb' },
    { name: 'Accenture', industry: 'Responsible AI Advisory', size: '740,000+', careersUrl: 'https://www.accenture.com' },
    { name: 'Deloitte', industry: 'AI Governance Advisory', size: '450,000+', careersUrl: 'https://www.deloitte.com' },
    { name: 'PwC', industry: 'AI Governance Advisory', size: '360,000+', careersUrl: 'https://www.pwc.com' },
  ],
  // NLP Engineer — language models, including Norwegian-language work.
  'nlp-engineer': [
    { name: 'OpenAI', industry: 'Frontier AI Research', size: '2,000+', careersUrl: 'https://openai.com/careers/' },
    { name: 'Anthropic', industry: 'Frontier AI Research', size: '1,000+', careersUrl: 'https://www.anthropic.com/careers' },
    { name: 'Google', industry: 'AI / Language', size: '180,000+', careersUrl: 'https://careers.google.com' },
    { name: 'Meta', industry: 'AI / Language', size: '70,000+', careersUrl: 'https://www.metacareers.com' },
    { name: 'Microsoft', industry: 'AI / Language', size: '220,000+', careersUrl: 'https://careers.microsoft.com' },
    { name: 'Mistral AI', industry: 'European AI Lab', size: '250+', careersUrl: 'https://mistral.ai/careers/' },
    { name: 'Cohere', industry: 'Enterprise NLP Lab', size: '500+', careersUrl: 'https://cohere.com' },
    { name: 'Hugging Face', industry: 'NLP / Open Source', size: '250+', careersUrl: 'https://huggingface.co/jobs' },
    { name: 'Nasjonalbiblioteket (NB AI Lab)', industry: 'Norwegian Language Models', size: '450+', careersUrl: 'https://www.nb.no' },
    { name: 'Schibsted', industry: 'Media / Tech', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
    { name: 'Telenor', industry: 'Telecom / AI', size: '15,000+', careersUrl: 'https://www.telenor.com/career/open-positions/' },
  ],
  // Computer Vision Engineer — incl. Norway's strong machine-vision cluster.
  'computer-vision-engineer': [
    { name: 'NVIDIA', industry: 'AI Computing / Vision', size: '29,000+', careersUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
    { name: 'Google', industry: 'AI / Vision', size: '180,000+', careersUrl: 'https://careers.google.com' },
    { name: 'Meta', industry: 'AI / Reality Labs', size: '70,000+', careersUrl: 'https://www.metacareers.com' },
    { name: 'Apple', industry: 'AI / Vision', size: '160,000+', careersUrl: 'https://www.apple.com/careers/' },
    { name: 'Microsoft', industry: 'AI / Vision', size: '220,000+', careersUrl: 'https://careers.microsoft.com' },
    { name: 'Tesla', industry: 'Autonomy / Vision', size: '140,000+', careersUrl: 'https://www.tesla.com/careers' },
    { name: 'Zivid', industry: '3D Machine Vision (Oslo)', size: '100+', careersUrl: 'https://www.zivid.com' },
    { name: 'Huddly', industry: 'AI Video / Cameras (Oslo)', size: '150+', careersUrl: 'https://www.huddly.com' },
    { name: 'Cognite', industry: 'Industrial AI / Vision', size: '900+', careersUrl: 'https://www.cognite.com/careers' },
    { name: 'Kongsberg Gruppen', industry: 'Defence / Maritime Vision', size: '12,000+', careersUrl: 'https://www.kongsberg.com/careers/' },
  ],
  // Robotics Engineer — robotics-first firms, incl. Norway's robotics scene.
  'robotics-engineer': [
    { name: 'NVIDIA', industry: 'Robotics / Isaac Platform', size: '29,000+', careersUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
    { name: 'Boston Dynamics', industry: 'Robotics', size: '1,000+', careersUrl: 'https://bostondynamics.com' },
    { name: 'Tesla', industry: 'Humanoid Robotics (Optimus)', size: '140,000+', careersUrl: 'https://www.tesla.com/careers' },
    { name: 'Figure', industry: 'Humanoid Robotics', size: '200+', careersUrl: 'https://www.figure.ai' },
    { name: '1X Technologies', industry: 'Humanoid Robotics (Norway)', size: '200+', careersUrl: 'https://www.1x.tech' },
    { name: 'AutoStore', industry: 'Warehouse Robotics (Norway)', size: '1,000+', careersUrl: 'https://www.autostoresystem.com' },
    { name: 'Universal Robots', industry: 'Collaborative Robots (Denmark)', size: '1,000+', careersUrl: 'https://www.universal-robots.com' },
    { name: 'ABB', industry: 'Industrial Robotics', size: '110,000+', careersUrl: 'https://global.abb' },
    { name: 'Kongsberg Gruppen', industry: 'Defence / Maritime Robotics', size: '12,000+', careersUrl: 'https://www.kongsberg.com/careers/' },
  ],
  // AI Solutions Architect — cloud AI architecture across the big platforms.
  'ai-solutions-architect': [
    { name: 'Microsoft', industry: 'Azure AI', size: '220,000+', careersUrl: 'https://careers.microsoft.com' },
    { name: 'Google', industry: 'Google Cloud AI', size: '180,000+', careersUrl: 'https://careers.google.com' },
    { name: 'Amazon Web Services', industry: 'AWS AI / Cloud', size: '1,500,000+', careersUrl: 'https://www.amazon.jobs' },
    { name: 'NVIDIA', industry: 'AI Computing', size: '29,000+', careersUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
    { name: 'Oracle Cloud (OCI)', industry: 'Cloud AI', size: '160,000+', careersUrl: 'https://www.oracle.com/careers/' },
    { name: 'IBM', industry: 'Enterprise AI / Cloud', size: '290,000+', careersUrl: 'https://www.ibm.com/careers' },
    { name: 'Databricks', industry: 'Data & ML Platform', size: '7,000+', careersUrl: 'https://www.databricks.com/company/careers' },
    { name: 'Cognite', industry: 'Industrial AI / Software', size: '900+', careersUrl: 'https://www.cognite.com/careers' },
    { name: 'Accenture', industry: 'AI Solutions / Consulting', size: '740,000+', careersUrl: 'https://www.accenture.com' },
    { name: 'Capgemini', industry: 'AI Solutions / Consulting', size: '340,000+', careersUrl: 'https://www.capgemini.com' },
  ],
  // Prompt Engineer — LLM product companies.
  'prompt-engineer': [
    { name: 'OpenAI', industry: 'Frontier AI Research', size: '2,000+', careersUrl: 'https://openai.com/careers/' },
    { name: 'Anthropic', industry: 'Frontier AI Research', size: '1,000+', careersUrl: 'https://www.anthropic.com/careers' },
    { name: 'Google', industry: 'AI / Cloud', size: '180,000+', careersUrl: 'https://careers.google.com' },
    { name: 'Microsoft', industry: 'AI / Cloud', size: '220,000+', careersUrl: 'https://careers.microsoft.com' },
    { name: 'Meta', industry: 'AI / Social Technology', size: '70,000+', careersUrl: 'https://www.metacareers.com' },
    { name: 'Scale AI', industry: 'AI Data / Tooling', size: '900+', careersUrl: 'https://scale.com' },
    { name: 'Cognite', industry: 'Industrial AI / Software', size: '900+', careersUrl: 'https://www.cognite.com/careers' },
    { name: 'Schibsted', industry: 'Media / Tech', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
  ],
  // AI Product Manager — product orgs at the AI/big-tech firms + Nordic AI.
  'ai-product-manager': [
    { name: 'Google', industry: 'AI / Cloud', size: '180,000+', careersUrl: 'https://careers.google.com' },
    { name: 'Microsoft', industry: 'AI / Cloud', size: '220,000+', careersUrl: 'https://careers.microsoft.com' },
    { name: 'Meta', industry: 'AI / Social Technology', size: '70,000+', careersUrl: 'https://www.metacareers.com' },
    { name: 'OpenAI', industry: 'Frontier AI Research', size: '2,000+', careersUrl: 'https://openai.com/careers/' },
    { name: 'Anthropic', industry: 'Frontier AI Research', size: '1,000+', careersUrl: 'https://www.anthropic.com/careers' },
    { name: 'Amazon', industry: 'AI / Cloud', size: '1,500,000+', careersUrl: 'https://www.amazon.jobs' },
    { name: 'NVIDIA', industry: 'AI Computing', size: '29,000+', careersUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
    { name: 'Cognite', industry: 'Industrial AI / Software', size: '900+', careersUrl: 'https://www.cognite.com/careers' },
    { name: 'Schibsted', industry: 'Media / Tech', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
    { name: 'Telenor', industry: 'Telecom / AI', size: '15,000+', careersUrl: 'https://www.telenor.com/career/open-positions/' },
  ],
  // Data Scientist — Nordic-leaning (these companies genuinely run DS teams),
  // with the global platforms alongside.
  'data-scientist': [
    { name: 'Cognite', industry: 'Industrial AI / Software', size: '900+', careersUrl: 'https://www.cognite.com/careers' },
    { name: 'DNB', industry: 'Banking / Fintech', size: '9,000+', careersUrl: 'https://www.dnb.no/karriere' },
    { name: 'Telenor', industry: 'Telecom / AI Research', size: '15,000+', careersUrl: 'https://www.telenor.com/career/open-positions/' },
    { name: 'Schibsted', industry: 'Media / Tech', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
    { name: 'Equinor', industry: 'Energy / Data', size: '22,000+', careersUrl: 'https://www.equinor.com/careers' },
    { name: 'NAV', industry: 'Government / Analytics', size: '20,000+', careersUrl: 'https://www.nav.no/jobb-i-nav' },
    { name: 'SSB (Statistics Norway)', industry: 'Government / Statistics', size: '1,000+', careersUrl: 'https://www.ssb.no/jobb-i-ssb' },
    { name: 'Google', industry: 'AI / Cloud', size: '180,000+', careersUrl: 'https://careers.google.com' },
    { name: 'Microsoft', industry: 'AI / Cloud', size: '220,000+', careersUrl: 'https://careers.microsoft.com' },
    { name: 'Meta', industry: 'AI / Social Technology', size: '70,000+', careersUrl: 'https://www.metacareers.com' },
  ],
  // Data Engineer — data platforms / pipelines at scale.
  'data-engineer': [
    { name: 'Cognite', industry: 'Industrial AI / Software', size: '900+', careersUrl: 'https://www.cognite.com/careers' },
    { name: 'Schibsted', industry: 'Media / Tech', size: '5,000+', careersUrl: 'https://schibsted.com/careers/' },
    { name: 'DNB', industry: 'Banking / Fintech', size: '9,000+', careersUrl: 'https://www.dnb.no/karriere' },
    { name: 'Telenor', industry: 'Telecom', size: '15,000+', careersUrl: 'https://www.telenor.com/career/open-positions/' },
    { name: 'Equinor', industry: 'Energy / Data', size: '22,000+', careersUrl: 'https://www.equinor.com/careers' },
    { name: 'Databricks', industry: 'Data & ML Platform', size: '7,000+', careersUrl: 'https://www.databricks.com/company/careers' },
    { name: 'Snowflake', industry: 'Data Cloud', size: '7,000+', careersUrl: 'https://careers.snowflake.com' },
    { name: 'Microsoft', industry: 'Azure Data', size: '220,000+', careersUrl: 'https://careers.microsoft.com' },
    { name: 'Google', industry: 'Cloud Data', size: '180,000+', careersUrl: 'https://careers.google.com' },
    { name: 'Amazon Web Services', industry: 'AWS Data', size: '1,500,000+', careersUrl: 'https://www.amazon.jobs' },
  ],
};

/** Seniority/variant ids that share another AI role's employer pool. */
const AI_ROLE_ALIASES: Record<string, string> = {
  'applied-ai-engineer': 'ai-engineer',
  'generative-ai-engineer': 'ai-engineer',
  'ai-researcher': 'ai-research-scientist',
  'senior-data-scientist': 'data-scientist',
  'principal-data-scientist': 'data-scientist',
  'senior-data-engineer': 'data-engineer',
};

/** AI/ML/data role → global employer list (null if not an AI role). */
function getAiRoleEmployers(careerId: string): Employer[] | null {
  return (
    AI_ROLE_EMPLOYERS[careerId] ??
    AI_ROLE_EMPLOYERS[AI_ROLE_ALIASES[careerId] ?? ''] ??
    null
  );
}

export function getCareerEmployers(
  careerId: string,
  category?: string | null,
  country?: string | null,
): Employer[] {
  const ec = employerCountry(country);
  if (!ec) return [];

  // Consultancies are global firms (offices in both markets), so the same
  // list serves NO and ES. Checked before the sector fallback so a
  // consultant sees the firms they'd work *for*, not their clients.
  if (TELCO_CONSULTING_CAREERS.has(careerId)) return TELCO_CONSULTING_EMPLOYERS;
  if (CONSULTING_CAREERS.has(careerId)) return CONSULTING_EMPLOYERS;

  // AI / ML / data roles are a global talent market — show the labs,
  // hyperscalers and AI-infra firms that actually do this work (plus Nordic
  // AI employers), NOT the generic IT-consultancy sector list. Same global
  // list for every country. Checked before the country branch below.
  const aiRole = getAiRoleEmployers(careerId);
  if (aiRole) return aiRole;

  // Emergency / law-enforcement careers → their real institutions (per
  // country), not the generic public-sector list (NAV/Skatteetaten…).
  if (SAFETY_EMPLOYERS[careerId]) return SAFETY_EMPLOYERS[careerId][ec];

  if (ec === 'ES') {
    return (category && CATEGORY_EMPLOYERS_ES[category]) ? CATEGORY_EMPLOYERS_ES[category] : [];
  }
  // ec === 'NO'
  const curated = getTopEmployers(careerId);
  if (curated.length > 0) return curated;
  if (category && CATEGORY_EMPLOYERS[category]) return CATEGORY_EMPLOYERS[category];
  return [];
}

/**
 * Whether we have any employers (curated or sector-level) to show for
 * a career — gates the "Where People Work" section and "Companies" tab.
 */
export function hasCareerEmployers(
  careerId: string,
  category?: string | null,
  country?: string | null,
): boolean {
  return getCareerEmployers(careerId, category, country).length > 0;
}

/**
 * One or two realistic example employer *names* for a career, for the
 * inline "Typically somewhere like X or Y" hint on the Typical Day card.
 * Shares its source with the full employer list (curated → sector).
 */
export function getRepresentativeEmployers(
  careerId: string,
  category?: string | null,
  country?: string | null,
): string[] {
  return getCareerEmployers(careerId, category, country).slice(0, 2).map((e) => e.name);
}

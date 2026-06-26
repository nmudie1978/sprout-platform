/**
 * Top Employers per career — Norwegian companies where this role
 * is most common. Rendered in the Understand tab.
 *
 * Each entry has: company name, industry, size hint, and optional
 * careers page URL. Add careers by editing CAREER_EMPLOYERS.
 */

// Realistic, Norway-first employer overrides. Phase 1 covers ~190 hands-on /
// trade / service roles; phase 2 covers ~330 professional roles whose coarse
// category fallback named implausible big brands (vet→hospital, fashion
// designer→NRK, auditor→DNB). Both re-import `Employer` type-only (no runtime
// cycle); consulted in getTopEmployers below.
import { REALISM_EMPLOYERS } from './career-employers-realism';
import { REALISM_EMPLOYERS_EXTRA } from './career-employers-realism-extra';
import { REALISM_EMPLOYERS_PHYSICAL } from './career-employers-realism-physical';
import { REALISM_EMPLOYERS_FUTUREPROOF } from './career-employers-realism-futureproof';
import { REALISM_EMPLOYERS_HIGHEARN } from './career-employers-realism-highearn';
import { REALISM_EMPLOYERS_AI } from './career-employers-realism-ai';
import { REALISM_EMPLOYERS_LAWENF } from './career-employers-realism-lawenforcement';
import { REALISM_EMPLOYERS_GEO } from './career-employers-realism-geography';
import { REALISM_EMPLOYERS_FASTGROW } from './career-employers-realism-fastgrow';
import { REALISM_EMPLOYERS_BUILTSPORT } from './career-employers-realism-built-sport';
import { REALISM_EMPLOYERS_SCIENCE } from './career-employers-realism-science';
import { REALISM_EMPLOYERS_MARITIME } from './career-employers-realism-maritime';

export interface Employer {
  name: string;
  industry: string;
  /** e.g. "1,000+" or "10,000+" */
  size: string;
  /** URL to their careers/jobs page. */
  careersUrl?: string;
}

const CAREER_EMPLOYERS: Record<string, Employer[]> = {
  // Pilots sit in LOGISTICS_TRANSPORT, whose sector fallback is freight/postal
  // (Posten, DB Schenker, Wilhelmsen) — an airline pilot would never work
  // there. Curate the actual airlines (Norway-first) and, for helicopter
  // pilots, the offshore/SAR operators.
  'airline-pilot': [
    { name: 'SAS', industry: 'Airline', size: '7,000+', careersUrl: 'https://www.sasgroup.net/career/' },
    { name: 'Norwegian', industry: 'Airline', size: '4,000+', careersUrl: 'https://www.norwegian.com/about/career/' },
    { name: 'Widerøe', industry: 'Regional Airline', size: '3,000+', careersUrl: 'https://www.wideroe.no/om-wideroe/jobb-i-wideroe' },
    { name: 'Wizz Air', industry: 'Airline', size: '7,000+', careersUrl: 'https://careers.wizzair.com/' },
    { name: 'Lufthansa Group', industry: 'Airline (Global)', size: '90,000+', careersUrl: 'https://www.be-lufthansa.com/en/' },
  ],
  'helicopter-pilot': [
    { name: 'Bristow Norway', industry: 'Offshore Helicopter', size: '500+', careersUrl: 'https://www.bristowgroup.com/careers/' },
    { name: 'CHC Helicopter', industry: 'Offshore Helicopter', size: '2,000+', careersUrl: 'https://www.chcheli.com/careers' },
    { name: 'Babcock', industry: 'SAR / Helicopter Services', size: '2,000+', careersUrl: 'https://www.babcockinternational.com/careers/' },
    { name: 'Norsk Luftambulanse', industry: 'Air Ambulance', size: '600+', careersUrl: 'https://norskluftambulanse.no/jobb/' },
  ],
  // Blockchain is a global, largely remote field led by crypto/web3
  // specialists — NOT the generic Norwegian IT consultancies the sector
  // fallback would otherwise show. Lead with Norway's crypto employer (Firi),
  // then established web3 companies that genuinely hire blockchain engineers
  // (most are remote-friendly across Europe).
  'blockchain-developer': [
    { name: 'Firi', industry: 'Crypto Exchange (Oslo)', size: '100+', careersUrl: 'https://www.firi.com/en/career' },
    { name: 'Coinbase', industry: 'Crypto Exchange', size: '3,000+', careersUrl: 'https://www.coinbase.com/careers' },
    { name: 'Chainlink Labs', industry: 'Web3 Infrastructure', size: '600+', careersUrl: 'https://chainlinklabs.com/careers' },
    { name: 'Consensys', industry: 'Ethereum / Web3', size: '700+', careersUrl: 'https://consensys.io/careers' },
    { name: 'Ledger', industry: 'Crypto Security', size: '700+', careersUrl: 'https://www.ledger.com/career' },
    { name: 'Kraken', industry: 'Crypto Exchange', size: '2,000+', careersUrl: 'https://www.kraken.com/careers' },
  ],
  // ── Specialist tech clusters (added 2026-06-13) — these roles fell to the
  //    generic IT-consultancy sector fallback, which is implausible for them.
  //    Each is curated Norway-first (real local employers) + the global
  //    companies that genuinely hire the role. Variants alias to these via
  //    CAREER_ID_ALIASES below. ──
  'game-developer': [
    { name: 'Funcom', industry: 'Game Studio (Oslo)', size: '500+', careersUrl: 'https://www.funcom.com/jobs' },
    { name: 'Rain Games', industry: 'Game Studio (Bergen)', size: '20+', careersUrl: 'https://rainga.me/' },
    { name: 'Krillbite Studio', industry: 'Game Studio (Hamar)', size: '20+', careersUrl: 'https://krillbite.com/' },
    { name: 'Megapop', industry: 'Game Studio (Oslo)', size: '50+', careersUrl: 'https://www.megapopgames.com/' },
    { name: 'Dirtybit', industry: 'Game Studio (Bergen)', size: '50+', careersUrl: 'https://dirtybit.com/' },
    { name: 'Ubisoft', industry: 'Game Studio (Global)', size: '18,000+', careersUrl: 'https://www.ubisoft.com/en-us/company/careers' },
  ],
  'data-scientist': [
    { name: 'Cognite', industry: 'Industrial Data & AI (Oslo)', size: '900+', careersUrl: 'https://www.cognite.com/en/careers' },
    { name: 'Iterate', industry: 'AI / Product Studio (Oslo)', size: '100+', careersUrl: 'https://iterate.no/' },
    { name: 'Kindly', industry: 'Conversational AI (Oslo)', size: '100+', careersUrl: 'https://www.kindly.ai/careers' },
    { name: 'Equinor', industry: 'Energy / Data Science', size: '22,000+', careersUrl: 'https://www.equinor.com/careers' },
    { name: 'NVIDIA', industry: 'AI / Compute (Global)', size: '29,000+', careersUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
    { name: 'OpenAI', industry: 'AI Research & Products (Global)', size: '3,000+', careersUrl: 'https://openai.com/careers' },
  ],
  'ai-research-scientist': [
    { name: 'OpenAI', industry: 'AI Research (Global)', size: '3,000+', careersUrl: 'https://openai.com/careers' },
    { name: 'Google DeepMind', industry: 'AI Research (Global)', size: '2,500+', careersUrl: 'https://deepmind.google/about/careers/' },
    { name: 'Anthropic', industry: 'AI Research (Global)', size: '1,000+', careersUrl: 'https://www.anthropic.com/careers' },
    { name: 'NVIDIA', industry: 'AI Research (Global)', size: '29,000+', careersUrl: 'https://www.nvidia.com/en-us/research/' },
    { name: 'SINTEF', industry: 'Applied Research (Norway)', size: '2,000+', careersUrl: 'https://www.sintef.no/en/career/' },
    { name: 'NTNU', industry: 'University Research (Trondheim)', size: '9,000+', careersUrl: 'https://www.ntnu.edu/vacancies' },
  ],
  'quant-developer': [
    { name: 'Norges Bank Investment Management (NBIM)', industry: 'Sovereign Wealth Fund (Oslo)', size: '600+', careersUrl: 'https://www.nbim.no/en/the-fund/careers/' },
    { name: 'DNB Markets', industry: 'Investment Banking (Oslo)', size: '9,000+', careersUrl: 'https://www.dnb.no/en/about-us/career' },
    { name: 'Storebrand Asset Management', industry: 'Asset Management (Oslo)', size: '2,000+', careersUrl: 'https://www.storebrand.no/en/career' },
    { name: 'Jane Street', industry: 'Quant Trading (Global)', size: '2,500+', careersUrl: 'https://www.janestreet.com/join-jane-street/' },
    { name: 'Optiver', industry: 'Market Making (Global)', size: '2,000+', careersUrl: 'https://www.optiver.com/working-at-optiver/career-opportunities/' },
  ],
  'security-engineer': [
    { name: 'mnemonic', industry: 'Cyber Security (Oslo)', size: '300+', careersUrl: 'https://www.mnemonic.io/careers/' },
    { name: 'Netsecurity', industry: 'Cyber Security (Norway)', size: '100+', careersUrl: 'https://www.netsecurity.no/' },
    { name: 'Nasjonal sikkerhetsmyndighet (NSM)', industry: 'National Cyber Security', size: '400+', careersUrl: 'https://nsm.no/' },
    { name: 'Telenor', industry: 'Telecom / Security Ops', size: '15,000+', careersUrl: 'https://www.telenor.com/career/' },
    { name: 'CrowdStrike', industry: 'Cyber Security (Global)', size: '7,000+', careersUrl: 'https://www.crowdstrike.com/careers/' },
  ],
  'embedded-developer': [
    { name: 'Nordic Semiconductor', industry: 'Wireless Chips (Trondheim)', size: '1,500+', careersUrl: 'https://www.nordicsemi.com/About-us/Career' },
    { name: 'Kongsberg Gruppen', industry: 'Defence & Maritime Tech', size: '13,000+', careersUrl: 'https://www.kongsberg.com/careers/' },
    { name: 'Q-Free', industry: 'Intelligent Transport (Trondheim)', size: '400+', careersUrl: 'https://www.q-free.com/career/' },
    { name: 'Disruptive Technologies', industry: 'IoT Sensors (Oslo)', size: '100+', careersUrl: 'https://www.disruptive-technologies.com/careers' },
    { name: 'Novelda', industry: 'Radar Sensor Chips (Oslo)', size: '100+', careersUrl: 'https://novelda.com/' },
    { name: 'Arm', industry: 'Chip Design (Global)', size: '7,000+', careersUrl: 'https://www.arm.com/careers' },
  ],
  'ar-vr-developer': [
    { name: 'Attensi', industry: 'VR / Simulation Training (Oslo)', size: '300+', careersUrl: 'https://www.attensi.com/careers/' },
    { name: 'Meta (Reality Labs)', industry: 'AR / VR (Global)', size: '60,000+', careersUrl: 'https://www.metacareers.com/' },
    { name: 'Unity', industry: 'Real-time 3D / XR (Global)', size: '5,000+', careersUrl: 'https://careers.unity.com/' },
    { name: 'Varjo', industry: 'XR Hardware (Helsinki)', size: '300+', careersUrl: 'https://varjo.com/careers/' },
  ],
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
  // ── Genetics / genomics clusters (added 2026-06-15) — the DNA-focused
  //    careers would otherwise fall to the generic hospital (clinical) or
  //    AI-consultancy (data) sector lists, neither of which is where a
  //    geneticist or bioinformatician actually works. Each list is
  //    Norway/Nordic-first (real local genomics & biotech employers) plus
  //    the global companies that genuinely hire the role. Variants alias to
  //    these via CAREER_ID_ALIASES below. ──
  geneticist: [
    { name: 'Oslo universitetssykehus — Medisinsk genetikk', industry: 'Clinical Genetics / Research', size: '20,000+', careersUrl: 'https://oslo-universitetssykehus.no/jobb' },
    { name: 'Helse Bergen / Haukeland', industry: 'Clinical Genetics / Research', size: '13,000+', careersUrl: 'https://helse-bergen.no/jobb' },
    { name: 'Universitetet i Oslo', industry: 'Genomics Research', size: '7,000+', careersUrl: 'https://www.uio.no/om/jobb/' },
    { name: 'deCODE genetics', industry: 'Genomics (Reykjavik / Amgen)', size: '500+', careersUrl: 'https://www.decode.com/careers/' },
    { name: 'Illumina', industry: 'DNA Sequencing (Global)', size: '9,000+', careersUrl: 'https://www.illumina.com/company/careers.html' },
    { name: 'Thermo Fisher Scientific', industry: 'Life Sciences (Global)', size: '100,000+', careersUrl: 'https://jobs.thermofisher.com/' },
  ],
  'biotechnology-scientist': [
    { name: 'Novo Nordisk', industry: 'Biotech / Pharma (Nordic)', size: '60,000+', careersUrl: 'https://www.novonordisk.com/careers.html' },
    { name: 'Genmab', industry: 'Biotech (Copenhagen)', size: '2,000+', careersUrl: 'https://www.genmab.com/careers/' },
    { name: 'Nykode Therapeutics', industry: 'Biotech (Oslo)', size: '100+', careersUrl: 'https://www.nykode.com/careers/' },
    { name: 'Ultimovacs', industry: 'Biotech (Oslo)', size: '50+', careersUrl: 'https://ultimovacs.com/' },
    { name: 'BerGenBio', industry: 'Biotech (Bergen)', size: '50+', careersUrl: 'https://www.bergenbio.com/' },
    { name: 'Roche', industry: 'Pharma / Diagnostics (Global)', size: '100,000+', careersUrl: 'https://careers.roche.com/' },
  ],
  'agricultural-geneticist': [
    { name: 'NMBU (Norges miljø- og biovitenskapelige universitet)', industry: 'Life Sciences Research', size: '1,800+', careersUrl: 'https://www.nmbu.no/om/jobb' },
    { name: 'NIBIO', industry: 'Bioeconomy Research', size: '700+', careersUrl: 'https://www.nibio.no/' },
    { name: 'Geno SA', industry: 'Cattle Breeding', size: '300+', careersUrl: 'https://www.geno.no/' },
    { name: 'Graminor', industry: 'Plant Breeding', size: '100+', careersUrl: 'https://graminor.no/' },
    { name: 'AquaGen', industry: 'Aquaculture Genetics', size: '300+', careersUrl: 'https://aquagen.no/' },
  ],
  'forensic-dna-analyst': [
    { name: 'Oslo universitetssykehus — Rettsmedisinske fag', industry: 'Forensic Medicine', size: '20,000+', careersUrl: 'https://oslo-universitetssykehus.no/jobb' },
    { name: 'Kripos', industry: 'National Criminal Investigation', size: '600+', careersUrl: 'https://www.politiet.no/om-politiet/jobb-i-politiet/' },
    { name: 'Politiet', industry: 'Norwegian Police', size: '17,000+', careersUrl: 'https://www.politiet.no/om-politiet/jobb-i-politiet/' },
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
  // Cybersecurity, AI/ML, research, quant and game roles → their specialist
  // employer clusters (see CAREER_EMPLOYERS above), not the generic
  // software-developer / IT-consultancy list.
  'cybersecurity-analyst': 'security-engineer',
  'soc-analyst': 'security-engineer',
  'offensive-security-engineer': 'security-engineer',
  'devsecops-engineer': 'security-engineer',
  'application-security-lead': 'security-engineer',
  'security-architect': 'security-engineer',
  'digital-forensics-analyst': 'security-engineer',
  'ai-engineer': 'data-scientist',
  'applied-ai-engineer': 'data-scientist',
  'machine-learning-engineer': 'data-scientist',
  'mlops-engineer': 'data-scientist',
  'computer-vision-engineer': 'data-scientist',
  'nlp-engineer': 'data-scientist',
  'generative-ai-engineer': 'data-scientist',
  'prompt-engineer': 'data-scientist',
  'decision-science-lead': 'data-scientist',
  'senior-data-scientist': 'data-scientist',
  'principal-data-scientist': 'data-scientist',
  'ai-researcher': 'ai-research-scientist',
  'ai-safety-researcher': 'ai-research-scientist',
  'ai-ethics-specialist': 'ai-research-scientist',
  'quantitative-analyst': 'quant-developer',
  'game-designer': 'game-developer',
  'game-director': 'game-developer',
  'civil-engineer': 'engineer',
  'mechanical-engineer': 'engineer',
  'robotics-engineer': 'engineer',
  'it-engineer': 'engineer',
  'dentist': 'doctor',
  'physiotherapist': 'nurse',
  'social-worker': 'psychologist',
  // ── DNA / genetics careers → genomics & biotech clusters (see above) ──
  // Clinical, research + data/AI genetics → the genomics research/clinical list.
  'clinical-geneticist': 'geneticist',
  'medical-geneticist': 'geneticist',
  'genomic-medicine-specialist': 'geneticist',
  'molecular-pathologist': 'geneticist',
  'reproductive-genetic-specialist': 'geneticist',
  'prenatal-genetic-counsellor': 'geneticist',
  'cancer-genomics-specialist': 'geneticist',
  'pharmacogenomics-specialist': 'geneticist',
  'clinical-laboratory-geneticist': 'geneticist',
  'molecular-biologist': 'geneticist',
  'genomics-research-scientist': 'geneticist',
  'human-genetics-researcher': 'geneticist',
  'population-geneticist': 'geneticist',
  'evolutionary-biologist': 'geneticist',
  'epigenetics-researcher': 'geneticist',
  'computational-biologist': 'geneticist',
  'systems-biologist': 'geneticist',
  'synthetic-biologist': 'geneticist',
  'stem-cell-researcher': 'geneticist',
  'precision-medicine-specialist': 'geneticist',
  'translational-scientist': 'geneticist',
  'longevity-research-scientist': 'geneticist',
  'human-enhancement-researcher': 'geneticist',
  'digital-biology-scientist': 'geneticist',
  'genomics-director': 'geneticist',
  'computational-genomics-scientist': 'geneticist',
  'bioinformatician': 'geneticist',
  'genomic-data-scientist': 'geneticist',
  'computational-genomics-engineer': 'geneticist',
  'ai-genomics-researcher': 'geneticist',
  'genetic-data-analyst': 'geneticist',
  'precision-medicine-data-scientist': 'geneticist',
  'clinical-genomics-analyst': 'geneticist',
  'genomic-ai-engineer': 'geneticist',
  'bioinformatics-director': 'geneticist',
  // Biotech / pharma R&D → the biotech & pharma list.
  'biotechnology-research-scientist': 'biotechnology-scientist',
  'gene-therapy-scientist': 'biotechnology-scientist',
  'crispr-research-scientist': 'biotechnology-scientist',
  'drug-discovery-scientist': 'biotechnology-scientist',
  'molecular-diagnostics-scientist': 'biotechnology-scientist',
  'biomarker-scientist': 'biotechnology-scientist',
  'bioprocess-scientist': 'biotechnology-scientist',
  'gene-editing-scientist': 'biotechnology-scientist',
  'crispr-engineer': 'biotechnology-scientist',
  'synthetic-genomics-engineer': 'biotechnology-scientist',
  'genomics-product-manager': 'biotechnology-scientist',
  'pharmaceutical-research-director': 'biotechnology-scientist',
  'biotechnology-executive': 'biotechnology-scientist',
  // Agricultural / environmental genetics → the agri-genetics list.
  'plant-geneticist': 'agricultural-geneticist',
  'animal-geneticist': 'agricultural-geneticist',
  'crop-improvement-scientist': 'agricultural-geneticist',
  'livestock-breeding-specialist': 'agricultural-geneticist',
  'conservation-geneticist': 'agricultural-geneticist',
  'environmental-genomics-scientist': 'agricultural-geneticist',
  // Forensic genetics → the forensic list.
  'crime-laboratory-geneticist': 'forensic-dna-analyst',
  'dna-evidence-specialist': 'forensic-dna-analyst',
};

/**
 * Get top employers for a career. Falls back to aliased career if
 * the exact ID has no data. Returns empty array if nothing matches.
 */
export function getTopEmployers(careerId: string): Employer[] {
  return CAREER_EMPLOYERS[careerId]
    ?? CAREER_EMPLOYERS[CAREER_ID_ALIASES[careerId] ?? '']
    // REALISM_EMPLOYERS covers hands-on / trade / service roles whose coarse
    // category fallback named implausible big brands (welder→Aker, etc.).
    // Hand-authored CAREER_EMPLOYERS still wins; realism wins over the
    // category fallback in getCareerEmployers.
    ?? REALISM_EMPLOYERS[careerId]
    ?? REALISM_EMPLOYERS_EXTRA[careerId]
    ?? REALISM_EMPLOYERS_PHYSICAL[careerId]
    ?? REALISM_EMPLOYERS_FUTUREPROOF[careerId]
    ?? REALISM_EMPLOYERS_HIGHEARN[careerId]
    ?? REALISM_EMPLOYERS_AI[careerId]
    ?? REALISM_EMPLOYERS_LAWENF[careerId]
    ?? REALISM_EMPLOYERS_GEO[careerId]
    ?? REALISM_EMPLOYERS_FASTGROW[careerId]
    ?? REALISM_EMPLOYERS_BUILTSPORT[careerId]
    ?? REALISM_EMPLOYERS_SCIENCE[careerId]
    ?? REALISM_EMPLOYERS_MARITIME[careerId]
    ?? [];
}

/**
 * Whether a career has top-employer data.
 */
export function hasTopEmployers(careerId: string): boolean {
  return (
    (CAREER_EMPLOYERS[careerId]?.length ?? 0) > 0 ||
    (REALISM_EMPLOYERS[careerId]?.length ?? 0) > 0 ||
    (REALISM_EMPLOYERS_EXTRA[careerId]?.length ?? 0) > 0 ||
    (REALISM_EMPLOYERS_PHYSICAL[careerId]?.length ?? 0) > 0 ||
    (REALISM_EMPLOYERS_FUTUREPROOF[careerId]?.length ?? 0) > 0 ||
    (REALISM_EMPLOYERS_HIGHEARN[careerId]?.length ?? 0) > 0 ||
    (REALISM_EMPLOYERS_AI[careerId]?.length ?? 0) > 0 ||
    (REALISM_EMPLOYERS_LAWENF[careerId]?.length ?? 0) > 0 ||
    (REALISM_EMPLOYERS_GEO[careerId]?.length ?? 0) > 0 ||
    (REALISM_EMPLOYERS_FASTGROW[careerId]?.length ?? 0) > 0 ||
    (REALISM_EMPLOYERS_BUILTSPORT[careerId]?.length ?? 0) > 0 ||
    (REALISM_EMPLOYERS_SCIENCE[careerId]?.length ?? 0) > 0 ||
    (REALISM_EMPLOYERS_MARITIME[careerId]?.length ?? 0) > 0
  );
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
  { name: 'Analysys Mason', industry: 'TMT Management Consulting', size: '1,000+', careersUrl: 'https://www.analysysmason.com/careers/' },
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

function employerCountry(country?: string | null): 'NO' | 'ES' | 'SE' | 'DK' | null {
  if (!country) return 'NO'; // unknown → app default is Norway
  const c = country.trim().toLowerCase();
  if (c === 'no' || c === 'norway' || c === 'norge') return 'NO';
  if (c === 'es' || c === 'spain' || c === 'españa' || c === 'espana') return 'ES';
  if (c === 'se' || c === 'sweden' || c === 'sverige') return 'SE';
  if (c === 'dk' || c === 'denmark' || c === 'danmark') return 'DK';
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

/**
 * Sweden / Denmark institutions for the emergency / law-enforcement careers —
 * a parallel to SAFETY_EMPLOYERS (which holds NO + ES). Same careers, same
 * "real institution, not the generic public-sector list" rule. Stable
 * main-site links.
 */
const SAFETY_EMPLOYERS_SE_DK: Record<string, { SE: Employer[]; DK: Employer[] }> = {
  'police-officer': {
    SE: [{ name: 'Polismyndigheten', industry: 'Police', size: '36,000+', careersUrl: 'https://polisen.se/jobb-och-utbildning/' }],
    DK: [{ name: 'Politiet (Rigspolitiet)', industry: 'Police', size: '16,000+', careersUrl: 'https://politi.dk/job-i-politiet' }],
  },
  firefighter: {
    SE: [
      { name: 'Storstockholms brandförsvar', industry: 'Fire & Rescue', size: '900+', careersUrl: 'https://www.storstockholm.brand.se' },
      { name: 'MSB (Myndigheten för samhällsskydd och beredskap)', industry: 'Civil Protection', size: '1,000+', careersUrl: 'https://www.msb.se' },
    ],
    DK: [
      { name: 'Hovedstadens Beredskab', industry: 'Fire & Rescue', size: '800+', careersUrl: 'https://www.hbr.dk' },
      { name: 'Beredskabsstyrelsen', industry: 'Civil Protection', size: '600+', careersUrl: 'https://www.brs.dk' },
    ],
  },
  'customs-officer': {
    SE: [{ name: 'Tullverket', industry: 'Customs', size: '2,400+', careersUrl: 'https://www.tullverket.se' }],
    DK: [{ name: 'Toldstyrelsen', industry: 'Customs', size: '2,500+', careersUrl: 'https://www.toldst.dk' }],
  },
  'corrections-officer': {
    SE: [{ name: 'Kriminalvården', industry: 'Correctional Service', size: '15,000+', careersUrl: 'https://www.kriminalvarden.se' }],
    DK: [{ name: 'Kriminalforsorgen', industry: 'Prison & Probation', size: '4,500+', careersUrl: 'https://www.kriminalforsorgen.dk' }],
  },
  'probation-officer': {
    SE: [{ name: 'Kriminalvården (frivård)', industry: 'Probation Service', size: '15,000+', careersUrl: 'https://www.kriminalvarden.se' }],
    DK: [{ name: 'Kriminalforsorgen', industry: 'Prison & Probation', size: '4,500+', careersUrl: 'https://www.kriminalforsorgen.dk' }],
  },
  'coast-guard-officer': {
    SE: [{ name: 'Kustbevakningen', industry: 'Coast Guard', size: '800+', careersUrl: 'https://www.kustbevakningen.se' }],
    DK: [{ name: 'Søværnet (Forsvaret)', industry: 'Navy / Coast Guard', size: '20,000+', careersUrl: 'https://www.forsvaret.dk/da/job/' }],
  },
  'immigration-officer': {
    SE: [{ name: 'Migrationsverket', industry: 'Immigration', size: '6,000+', careersUrl: 'https://www.migrationsverket.se' }],
    DK: [
      { name: 'Udlændingestyrelsen', industry: 'Immigration', size: '1,200+', careersUrl: 'https://www.nyidanmark.dk' },
      { name: 'SIRI (Styrelsen for International Rekruttering og Integration)', industry: 'Immigration', size: '600+', careersUrl: 'https://www.nyidanmark.dk' },
    ],
  },
  'civil-defence-officer': {
    SE: [{ name: 'MSB (Myndigheten för samhällsskydd och beredskap)', industry: 'Civil Protection', size: '1,000+', careersUrl: 'https://www.msb.se' }],
    DK: [{ name: 'Beredskabsstyrelsen', industry: 'Civil Protection', size: '600+', careersUrl: 'https://www.brs.dk' }],
  },
};

/**
 * Sweden — sector-level employers per CareerCategory (mirrors
 * CATEGORY_EMPLOYERS_ES). A Sweden user sees Volvo / Ericsson / SEB rather
 * than Telenor / DNB. Stable main-site links.
 */
const CATEGORY_EMPLOYERS_SE: Record<string, Employer[]> = {
  HEALTHCARE_LIFE_SCIENCES: [
    { name: 'Karolinska Universitetssjukhuset', industry: 'Public Healthcare', size: '15,000+', careersUrl: 'https://www.karolinska.se' },
    { name: 'Region Stockholm', industry: 'Regional Health', size: '45,000+', careersUrl: 'https://www.regionstockholm.se' },
    { name: 'Capio', industry: 'Private Healthcare', size: '12,000+', careersUrl: 'https://www.capio.se' },
    { name: 'AstraZeneca', industry: 'Pharmaceuticals', size: '10,000+ (SE)', careersUrl: 'https://www.astrazeneca.com/careers.html' },
  ],
  EDUCATION_TRAINING: [
    { name: 'Stockholms stad (utbildning)', industry: 'Public Education', size: '40,000+', careersUrl: 'https://www.stockholm.se' },
    { name: 'AcadeMedia', industry: 'Private Education', size: '18,000+', careersUrl: 'https://www.academedia.se' },
    { name: 'Lunds universitet', industry: 'Higher Education', size: '8,000+', careersUrl: 'https://www.lu.se' },
    { name: 'Karolinska Institutet', industry: 'Higher Education', size: '5,000+', careersUrl: 'https://ki.se' },
  ],
  TECHNOLOGY_IT: [
    { name: 'Ericsson', industry: 'Technology / Telecom', size: '100,000+', careersUrl: 'https://www.ericsson.com/careers' },
    { name: 'Spotify', industry: 'Technology / Music', size: '9,000+', careersUrl: 'https://www.lifeatspotify.com' },
    { name: 'Tietoevry', industry: 'IT Services', size: '24,000+', careersUrl: 'https://www.tietoevry.com' },
    { name: 'Knowit', industry: 'IT Consulting', size: '4,000+', careersUrl: 'https://www.knowit.se' },
  ],
  ARTIFICIAL_INTELLIGENCE: [
    { name: 'Ericsson Research', industry: 'AI / Telecom', size: '100,000+', careersUrl: 'https://www.ericsson.com/careers' },
    { name: 'Spotify', industry: 'AI / Music Tech', size: '9,000+', careersUrl: 'https://www.lifeatspotify.com' },
    { name: 'King', industry: 'AI / Games', size: '2,000+', careersUrl: 'https://www.king.com' },
    { name: 'Sana Labs', industry: 'AI', size: '300+', careersUrl: 'https://www.sanalabs.com' },
  ],
  BUSINESS_MANAGEMENT: [
    { name: 'IKEA', industry: 'Retail', size: '160,000+', careersUrl: 'https://www.ikea.com/global/en/careers/' },
    { name: 'H&M Group', industry: 'Retail', size: '100,000+', careersUrl: 'https://career.hm.com' },
    { name: 'Volvo Group', industry: 'Manufacturing', size: '100,000+', careersUrl: 'https://www.volvogroup.com/en/careers.html' },
    { name: 'Ericsson', industry: 'Technology', size: '100,000+', careersUrl: 'https://www.ericsson.com/careers' },
  ],
  FINANCE_BANKING: [
    { name: 'SEB', industry: 'Banking', size: '17,000+', careersUrl: 'https://seb.se' },
    { name: 'Swedbank', industry: 'Banking', size: '17,000+', careersUrl: 'https://www.swedbank.se' },
    { name: 'Handelsbanken', industry: 'Banking', size: '12,000+', careersUrl: 'https://www.handelsbanken.se' },
    { name: 'Nordea', industry: 'Banking', size: '29,000+', careersUrl: 'https://www.nordea.com' },
  ],
  SALES_MARKETING: [
    { name: 'H&M Group', industry: 'Retail', size: '100,000+', careersUrl: 'https://career.hm.com' },
    { name: 'IKEA', industry: 'Retail', size: '160,000+', careersUrl: 'https://www.ikea.com/global/en/careers/' },
    { name: 'ICA Gruppen', industry: 'Retail / FMCG', size: '23,000+', careersUrl: 'https://www.ica.se' },
    { name: 'Telia Company', industry: 'Telecom', size: '20,000+', careersUrl: 'https://www.telia.se' },
  ],
  MANUFACTURING_ENGINEERING: [
    { name: 'Volvo Group', industry: 'Automotive', size: '100,000+', careersUrl: 'https://www.volvogroup.com/en/careers.html' },
    { name: 'Scania', industry: 'Automotive', size: '57,000+', careersUrl: 'https://www.scania.com/group/en/home/careers.html' },
    { name: 'ABB', industry: 'Industrial Automation', size: '105,000+', careersUrl: 'https://careers.abb' },
    { name: 'Sandvik', industry: 'Engineering', size: '40,000+', careersUrl: 'https://www.sandvik.com' },
  ],
  LOGISTICS_TRANSPORT: [
    { name: 'PostNord', industry: 'Postal / Logistics', size: '28,000+', careersUrl: 'https://www.postnord.se' },
    { name: 'SJ', industry: 'Rail', size: '5,000+', careersUrl: 'https://www.sj.se' },
    { name: 'DB Schenker', industry: 'Logistics', size: '4,000+ (SE)', careersUrl: 'https://www.dbschenker.com/se-sv' },
    { name: 'DHL', industry: 'Logistics', size: '4,000+ (SE)', careersUrl: 'https://www.dhl.com/se-sv' },
  ],
  HOSPITALITY_TOURISM: [
    { name: 'Scandic Hotels', industry: 'Hotels', size: '18,000+', careersUrl: 'https://www.scandichotels.se' },
    { name: 'Strawberry', industry: 'Hotels', size: '20,000+', careersUrl: 'https://career.strawberry.no' },
    { name: 'SAS', industry: 'Aviation', size: '10,000+', careersUrl: 'https://www.sasgroup.net' },
    { name: 'Elite Hotels of Sweden', industry: 'Hotels', size: '2,000+', careersUrl: 'https://www.elite.se' },
  ],
  TELECOMMUNICATIONS: [
    { name: 'Telia Company', industry: 'Telecom', size: '20,000+', careersUrl: 'https://www.telia.se' },
    { name: 'Tele2', industry: 'Telecom', size: '4,000+', careersUrl: 'https://www.tele2.se' },
    { name: 'Telenor Sverige', industry: 'Telecom', size: '2,000+', careersUrl: 'https://www.telenor.se' },
    { name: 'Tre (Hi3G)', industry: 'Telecom', size: '2,000+', careersUrl: 'https://www.tre.se' },
  ],
  CREATIVE_MEDIA: [
    { name: 'SVT (Sveriges Television)', industry: 'Public Broadcasting', size: '2,500+', careersUrl: 'https://www.svt.se' },
    { name: 'Sveriges Radio', industry: 'Public Radio', size: '1,800+', careersUrl: 'https://sverigesradio.se' },
    { name: 'Bonnier', industry: 'Media / Publishing', size: '7,000+', careersUrl: 'https://www.bonnier.com' },
    { name: 'Viaplay Group', industry: 'Media / Streaming', size: '2,000+', careersUrl: 'https://www.viaplaygroup.com' },
  ],
  PUBLIC_SERVICE_SAFETY: [
    { name: 'Polismyndigheten', industry: 'Police', size: '36,000+', careersUrl: 'https://polisen.se/jobb-och-utbildning/' },
    { name: 'Stockholms stad', industry: 'Municipal', size: '40,000+', careersUrl: 'https://www.stockholm.se' },
    { name: 'Försäkringskassan', industry: 'Public Sector', size: '14,000+', careersUrl: 'https://www.forsakringskassan.se' },
    { name: 'Skatteverket', industry: 'Tax Authority', size: '10,000+', careersUrl: 'https://www.skatteverket.se' },
  ],
  MILITARY_DEFENCE: [
    { name: 'Försvarsmakten', industry: 'Armed Forces', size: '60,000+', careersUrl: 'https://jobb.forsvarsmakten.se' },
    { name: 'Saab', industry: 'Defence / Aerospace', size: '24,000+', careersUrl: 'https://www.saab.com' },
    { name: 'FMV', industry: 'Defence Materiel', size: '4,000+', careersUrl: 'https://www.fmv.se' },
    { name: 'FOI', industry: 'Defence Research', size: '1,000+', careersUrl: 'https://www.foi.se' },
  ],
  SPORT_FITNESS: [
    { name: 'SATS', industry: 'Fitness', size: '11,000+', careersUrl: 'https://www.sats.se' },
    { name: 'Nordic Wellness', industry: 'Fitness', size: '5,000+', careersUrl: 'https://www.nordicwellness.se' },
    { name: 'Friskis&Svettis', industry: 'Fitness', size: '6,000+', careersUrl: 'https://www.friskissvettis.se' },
    { name: 'Riksidrottsförbundet', industry: 'Sport Federation', size: '300+', careersUrl: 'https://www.rf.se' },
  ],
  REAL_ESTATE_PROPERTY: [
    { name: 'Vasakronan', industry: 'Property', size: '300+', careersUrl: 'https://vasakronan.se' },
    { name: 'Castellum', industry: 'Property', size: '700+', careersUrl: 'https://www.castellum.se' },
    { name: 'JM', industry: 'Property Developer', size: '2,500+', careersUrl: 'https://www.jm.se' },
    { name: 'Fastighets AB Balder', industry: 'Property', size: '1,500+', careersUrl: 'https://www.balder.se' },
  ],
  SOCIAL_CARE_COMMUNITY: [
    { name: 'Svenska Röda Korset', industry: 'Humanitarian', size: '2,000+', careersUrl: 'https://www.rodakorset.se' },
    { name: 'Stockholms Stadsmission', industry: 'Social Care', size: '1,000+', careersUrl: 'https://www.stadsmissionen.se' },
    { name: 'Attendo', industry: 'Care Services', size: '30,000+', careersUrl: 'https://www.attendo.se' },
    { name: 'Stockholms stad (socialtjänst)', industry: 'Municipal Care', size: '40,000+', careersUrl: 'https://www.stockholm.se' },
  ],
  CONSTRUCTION_TRADES: [
    { name: 'Skanska', industry: 'Construction', size: '28,000+', careersUrl: 'https://www.skanska.se' },
    { name: 'NCC', industry: 'Construction', size: '13,000+', careersUrl: 'https://www.ncc.se' },
    { name: 'Peab', industry: 'Construction', size: '15,000+', careersUrl: 'https://www.peab.se' },
    { name: 'JM', industry: 'Construction / Property', size: '2,500+', careersUrl: 'https://www.jm.se' },
  ],
};

/**
 * Denmark — sector-level employers per CareerCategory (mirrors
 * CATEGORY_EMPLOYERS_ES). A Denmark user sees Maersk / Novo Nordisk / Danske
 * Bank rather than Telenor / DNB. Stable main-site links.
 */
const CATEGORY_EMPLOYERS_DK: Record<string, Employer[]> = {
  HEALTHCARE_LIFE_SCIENCES: [
    { name: 'Rigshospitalet', industry: 'Public Healthcare', size: '11,000+', careersUrl: 'https://www.rigshospitalet.dk' },
    { name: 'Region Hovedstaden', industry: 'Regional Health', size: '40,000+', careersUrl: 'https://www.regionh.dk' },
    { name: 'Novo Nordisk', industry: 'Pharmaceuticals', size: '70,000+', careersUrl: 'https://www.novonordisk.com/careers.html' },
    { name: 'Lundbeck', industry: 'Pharmaceuticals', size: '5,000+', careersUrl: 'https://www.lundbeck.com' },
  ],
  EDUCATION_TRAINING: [
    { name: 'Københavns Kommune (skole)', industry: 'Public Education', size: '45,000+', careersUrl: 'https://www.kk.dk' },
    { name: 'Københavns Universitet', industry: 'Higher Education', size: '10,000+', careersUrl: 'https://www.ku.dk' },
    { name: 'Aarhus Universitet', industry: 'Higher Education', size: '8,000+', careersUrl: 'https://www.au.dk' },
    { name: 'VIA University College', industry: 'Higher Education', size: '2,100+', careersUrl: 'https://www.via.dk' },
  ],
  TECHNOLOGY_IT: [
    { name: 'Netcompany', industry: 'IT Consulting', size: '8,000+', careersUrl: 'https://www.netcompany.com' },
    { name: 'KMD', industry: 'IT Services', size: '3,000+', careersUrl: 'https://www.kmd.dk' },
    { name: 'Systematic', industry: 'Software', size: '1,500+', careersUrl: 'https://systematic.com' },
    { name: 'Microsoft Development Center Copenhagen', industry: 'Software', size: '800+', careersUrl: 'https://www.microsoft.com/da-dk' },
  ],
  ARTIFICIAL_INTELLIGENCE: [
    { name: 'Netcompany', industry: 'AI / IT', size: '8,000+', careersUrl: 'https://www.netcompany.com' },
    { name: 'Corti', industry: 'AI / Healthcare', size: '150+', careersUrl: 'https://www.corti.ai' },
    { name: 'Novo Nordisk', industry: 'AI / Pharma', size: '70,000+', careersUrl: 'https://www.novonordisk.com/careers.html' },
    { name: 'Microsoft Development Center Copenhagen', industry: 'AI / Software', size: '800+', careersUrl: 'https://www.microsoft.com/da-dk' },
  ],
  BUSINESS_MANAGEMENT: [
    { name: 'A.P. Moller - Maersk', industry: 'Logistics / Shipping', size: '100,000+', careersUrl: 'https://www.maersk.com/careers' },
    { name: 'Novo Nordisk', industry: 'Pharmaceuticals', size: '70,000+', careersUrl: 'https://www.novonordisk.com/careers.html' },
    { name: 'Danfoss', industry: 'Engineering', size: '40,000+', careersUrl: 'https://www.danfoss.com' },
    { name: 'LEGO Group', industry: 'Consumer Goods', size: '28,000+', careersUrl: 'https://www.lego.com/en-us/careers' },
  ],
  FINANCE_BANKING: [
    { name: 'Danske Bank', industry: 'Banking', size: '21,000+', careersUrl: 'https://danskebank.com/careers' },
    { name: 'Nordea', industry: 'Banking', size: '29,000+', careersUrl: 'https://www.nordea.com' },
    { name: 'Nykredit', industry: 'Banking / Mortgage', size: '4,000+', careersUrl: 'https://www.nykredit.dk' },
    { name: 'Tryg', industry: 'Insurance', size: '7,000+', careersUrl: 'https://www.tryg.com' },
  ],
  SALES_MARKETING: [
    { name: 'Salling Group', industry: 'Retail', size: '60,000+', careersUrl: 'https://sallinggroup.com' },
    { name: 'Carlsberg Group', industry: 'Consumer Goods', size: '40,000+', careersUrl: 'https://www.carlsberggroup.com' },
    { name: 'LEGO Group', industry: 'Consumer Goods', size: '28,000+', careersUrl: 'https://www.lego.com/en-us/careers' },
    { name: 'Coloplast', industry: 'Medtech', size: '16,000+', careersUrl: 'https://www.coloplast.com' },
  ],
  MANUFACTURING_ENGINEERING: [
    { name: 'Danfoss', industry: 'Engineering', size: '40,000+', careersUrl: 'https://www.danfoss.com' },
    { name: 'Grundfos', industry: 'Pumps / Engineering', size: '20,000+', careersUrl: 'https://www.grundfos.com' },
    { name: 'Vestas', industry: 'Wind Energy', size: '30,000+', careersUrl: 'https://www.vestas.com' },
    { name: 'Rockwool', industry: 'Building Materials', size: '12,000+', careersUrl: 'https://www.rockwool.com' },
  ],
  LOGISTICS_TRANSPORT: [
    { name: 'A.P. Moller - Maersk', industry: 'Shipping / Logistics', size: '100,000+', careersUrl: 'https://www.maersk.com/careers' },
    { name: 'DSV', industry: 'Transport / Logistics', size: '75,000+', careersUrl: 'https://www.dsv.com' },
    { name: 'DSB', industry: 'Rail', size: '7,000+', careersUrl: 'https://www.dsb.dk' },
    { name: 'PostNord Danmark', industry: 'Postal / Logistics', size: '8,000+', careersUrl: 'https://www.postnord.dk' },
  ],
  HOSPITALITY_TOURISM: [
    { name: 'Scandic Hotels', industry: 'Hotels', size: '4,000+ (DK)', careersUrl: 'https://www.scandichotels.dk' },
    { name: 'Arp-Hansen Hotel Group', industry: 'Hotels', size: '1,500+', careersUrl: 'https://www.arp-hansen.dk' },
    { name: 'Tivoli', industry: 'Leisure / Tourism', size: '3,000+', careersUrl: 'https://www.tivoli.dk' },
    { name: 'SAS', industry: 'Aviation', size: '10,000+', careersUrl: 'https://www.sasgroup.net' },
  ],
  TELECOMMUNICATIONS: [
    { name: 'Nuuday (TDC)', industry: 'Telecom', size: '4,000+', careersUrl: 'https://nuuday.com' },
    { name: 'Telenor Danmark', industry: 'Telecom', size: '1,500+', careersUrl: 'https://www.telenor.dk' },
    { name: 'Telia Danmark', industry: 'Telecom', size: '1,000+', careersUrl: 'https://www.telia.dk' },
    { name: '3 (Hi3G)', industry: 'Telecom', size: '1,000+', careersUrl: 'https://www.3.dk' },
  ],
  CREATIVE_MEDIA: [
    { name: 'DR (Danmarks Radio)', industry: 'Public Broadcasting', size: '3,000+', careersUrl: 'https://www.dr.dk' },
    { name: 'TV 2 Danmark', industry: 'Broadcasting', size: '1,200+', careersUrl: 'https://tv2.dk' },
    { name: 'Egmont', industry: 'Media / Publishing', size: '6,600+', careersUrl: 'https://www.egmont.com' },
    { name: 'JP/Politikens Hus', industry: 'Media / Publishing', size: '2,000+', careersUrl: 'https://www.jppol.dk' },
  ],
  PUBLIC_SERVICE_SAFETY: [
    { name: 'Politiet (Rigspolitiet)', industry: 'Police', size: '16,000+', careersUrl: 'https://politi.dk/job-i-politiet' },
    { name: 'Københavns Kommune', industry: 'Municipal', size: '45,000+', careersUrl: 'https://www.kk.dk' },
    { name: 'Skattestyrelsen', industry: 'Tax Authority', size: '7,000+', careersUrl: 'https://www.sktst.dk' },
    { name: 'Region Hovedstaden', industry: 'Public Sector', size: '40,000+', careersUrl: 'https://www.regionh.dk' },
  ],
  MILITARY_DEFENCE: [
    { name: 'Forsvaret', industry: 'Armed Forces', size: '20,000+', careersUrl: 'https://www.forsvaret.dk/da/job/' },
    { name: 'Terma', industry: 'Defence / Aerospace', size: '1,800+', careersUrl: 'https://www.terma.com' },
    { name: 'Forsvarsministeriets Materiel- og Indkøbsstyrelse', industry: 'Defence Materiel', size: '2,000+', careersUrl: 'https://www.fmi.dk' },
    { name: 'Systematic (Defence)', industry: 'Defence Software', size: '1,500+', careersUrl: 'https://systematic.com' },
  ],
  SPORT_FITNESS: [
    { name: 'Fitness World', industry: 'Fitness', size: '3,000+', careersUrl: 'https://www.fitnessworld.com' },
    { name: 'SATS', industry: 'Fitness', size: '2,000+ (DK)', careersUrl: 'https://www.sats.dk' },
    { name: 'Danmarks Idrætsforbund (DIF)', industry: 'Sport Federation', size: '300+', careersUrl: 'https://www.dif.dk' },
    { name: 'Loop Fitness', industry: 'Fitness', size: '500+', careersUrl: 'https://www.loopfitness.dk' },
  ],
  REAL_ESTATE_PROPERTY: [
    { name: 'Jeudan', industry: 'Property', size: '600+', careersUrl: 'https://www.jeudan.dk' },
    { name: 'DEAS', industry: 'Property Services', size: '900+', careersUrl: 'https://www.deas.dk' },
    { name: 'Newsec', industry: 'Property Services', size: '500+', careersUrl: 'https://www.newsec.dk' },
    { name: 'EDC', industry: 'Estate Agency', size: '1,500+', careersUrl: 'https://www.edc.dk' },
  ],
  SOCIAL_CARE_COMMUNITY: [
    { name: 'Røde Kors', industry: 'Humanitarian', size: '1,500+', careersUrl: 'https://www.rodekors.dk' },
    { name: 'Kirkens Korshær', industry: 'Social Care', size: '1,000+', careersUrl: 'https://www.kirkenskorshaer.dk' },
    { name: 'Mødrehjælpen', industry: 'Social Care', size: '300+', careersUrl: 'https://moedrehjaelpen.dk' },
    { name: 'Københavns Kommune (socialforvaltning)', industry: 'Municipal Care', size: '45,000+', careersUrl: 'https://www.kk.dk' },
  ],
  CONSTRUCTION_TRADES: [
    { name: 'MT Højgaard', industry: 'Construction', size: '4,000+', careersUrl: 'https://www.mthojgaard.dk' },
    { name: 'Per Aarsleff', industry: 'Construction / Civil', size: '7,000+', careersUrl: 'https://www.aarsleff.com' },
    { name: 'NCC Danmark', industry: 'Construction', size: '2,000+', careersUrl: 'https://www.ncc.dk' },
    { name: 'Enemærke & Petersen', industry: 'Construction', size: '1,000+', careersUrl: 'https://eogp.dk' },
  ],
};

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
  const safety = SAFETY_EMPLOYERS[careerId];
  if (safety) {
    if (ec === 'NO' || ec === 'ES') return safety[ec];
    // ec is 'SE' | 'DK' — Nordic institutions live in a parallel map.
    const nordic = SAFETY_EMPLOYERS_SE_DK[careerId];
    if (nordic) return nordic[ec];
  }

  if (ec === 'ES') {
    return (category && CATEGORY_EMPLOYERS_ES[category]) ? CATEGORY_EMPLOYERS_ES[category] : [];
  }
  if (ec === 'SE') {
    return (category && CATEGORY_EMPLOYERS_SE[category]) ? CATEGORY_EMPLOYERS_SE[category] : [];
  }
  if (ec === 'DK') {
    return (category && CATEGORY_EMPLOYERS_DK[category]) ? CATEGORY_EMPLOYERS_DK[category] : [];
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

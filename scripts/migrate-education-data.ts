/**
 * One-shot migration: reads nordic-programmes.json + norway-programmes.ts
 * and outputs the new 3-layer structure:
 *   src/lib/education/data/institutions.json
 *   src/lib/education/data/programmes.json
 *   src/lib/education/data/modules.json
 *
 * Run: npx tsx scripts/migrate-education-data.ts
 */

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// ── Read the existing flat JSON dataset ─────────────────────────────
import nordicRaw from '../src/lib/education/nordic-programmes.json';

// ── Read the legacy hand-curated Norway file ────────────────────────
// We can't import it directly since it has runtime exports, but we
// can read the key data structures by importing it as TS.
import {
  getNorwayProgrammes as legacyGetNorway,
  getCertificationPath as legacyGetCert,
} from '../src/lib/education/norway-programmes';

// Legacy career IDs that exist in norway-programmes.ts
const LEGACY_CAREER_IDS = [
  'doctor', 'nurse', 'psychologist', 'teacher', 'software-developer',
  'engineer', 'accountant', 'lawyer', 'healthcare-worker', 'data-analyst',
  'physiotherapist', 'police-officer', 'firefighter', 'airline-pilot',
  'helicopter-pilot',
];

const CERT_MATCH_KEYS = ['project', 'programme', 'cyber', 'cloud', 'data', 'product', 'ux'];

// ── Types ───────────────────────────────────────────────────────────

interface RawProgramme {
  careerId: string;
  country: string;
  institution: string;
  programme: string;
  englishName: string;
  city: string;
  url: string;
  type: string;
  duration: string;
  applicationVia: string;
  languageOfInstruction?: string;
  tuitionFee?: string;
  entryRequirements?: string;
  careerOutcome?: string;
}

interface InstitutionEntry {
  id: string;
  name: string;
  shortName: string;
  country: string;
  city: string;
  url: string;
  applicationVia: string;
  careerIds: string[];
}

interface ProgrammeEntry {
  id: string;
  careerId: string;
  institutionId: string;
  programme: string;
  englishName: string;
  url: string;
  type: string;
  duration: string;
  languageOfInstruction?: string;
  tuitionFee?: string;
  entryRequirements?: string;
  careerOutcome?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 30);
}

function institutionId(name: string): string {
  const KNOWN: Record<string, string> = {
    'universitetet i oslo (uio)': 'uio',
    'universitetet i oslo': 'uio',
    'ntnu': 'ntnu',
    'oslomet': 'oslomet',
    'universitetet i bergen (uib)': 'uib',
    'universitetet i bergen': 'uib',
    'uit norges arktiske universitet': 'uit',
    'karolinska institutet': 'ki',
    'uppsala universitet': 'uu',
    'kth royal institute of technology': 'kth',
    'stockholms universitet': 'su',
    'lunds universitet': 'lu',
    'linköpings universitet': 'liu',
    'chalmers tekniska högskola': 'chalmers',
    'göteborgs universitet': 'gu',
    'konstfack': 'konstfack',
    'københavns universitet': 'ku',
    'it-universitetet i københavn (itu)': 'itu',
    'københavns professionshøjskole': 'kp',
    'copenhagen business school (cbs)': 'cbs',
    'danmarks tekniske universitet (dtu)': 'dtu',
    'det kongelige akademi (kadk)': 'kadk',
    'aarhus universitet': 'au',
    'helsingin yliopisto': 'helsinki',
    'aalto-yliopisto': 'aalto',
    'metropolia amk': 'metropolia',
    'háskóli íslands': 'hi',
    'nmbu (norges miljø- og biovitenskapelige universitet)': 'nmbu',
    'norges handelshøyskole (nhh)': 'nhh',
    'handelshögskolan i stockholm (sse)': 'sse',
    'arkitektur- og designhøgskolen i oslo (aho)': 'aho',
    'sveriges lantbruksuniversitet (slu)': 'slu',
    'bi norwegian business school': 'bi',
    'politihøgskolen': 'phs',
    'norges brannskole': 'nbsk',
    'osm aviation academy': 'osm',
    'scandinavian aviation academy': 'saa',
    'university of tromsø (uit)': 'uit-luftfart',
    'helicopter flight training as': 'hft',
    'videregående skoler across norway': 'vgs-no',
  };
  const lower = name.toLowerCase().trim();
  return KNOWN[lower] || slugify(name);
}

function institutionUrl(name: string, city: string): string {
  // Try to derive a reasonable base URL
  const id = institutionId(name);
  const URLS: Record<string, string> = {
    uio: 'https://www.uio.no',
    ntnu: 'https://www.ntnu.no',
    oslomet: 'https://www.oslomet.no',
    uib: 'https://www.uib.no',
    uit: 'https://uit.no',
    ki: 'https://ki.se',
    uu: 'https://www.uu.se',
    kth: 'https://www.kth.se',
    su: 'https://www.su.se',
    lu: 'https://www.lu.se',
    liu: 'https://liu.se',
    chalmers: 'https://www.chalmers.se',
    gu: 'https://www.gu.se',
    ku: 'https://www.ku.dk',
    dtu: 'https://www.dtu.dk',
    kadk: 'https://kadk.dk',
    au: 'https://www.au.dk',
    helsinki: 'https://www.helsinki.fi',
    aalto: 'https://www.aalto.fi',
    metropolia: 'https://www.metropolia.fi',
    hi: 'https://www.hi.is',
    nmbu: 'https://www.nmbu.no',
    nhh: 'https://www.nhh.no',
    sse: 'https://www.hhs.se',
    aho: 'https://aho.no',
    slu: 'https://www.slu.se',
    bi: 'https://www.bi.no',
    kp: 'https://www.kp.dk',
    itu: 'https://www.itu.dk',
    cbs: 'https://www.cbs.dk',
    konstfack: 'https://www.konstfack.se',
    phs: 'https://www.politihogskolen.no',
    nbsk: 'https://www.nbsk.no',
    osm: 'https://www.osmaviationacademy.com',
  };
  return URLS[id] || `https://${slugify(name)}.${city === 'Helsinki' || city === 'Espoo' ? 'fi' : city === 'Reykjavik' ? 'is' : 'no'}`;
}

// ── Collect all programmes from both sources ────────────────────────

const allProgrammes: RawProgramme[] = [];

// 1. From nordic-programmes.json
for (const p of (nordicRaw.programmes as RawProgramme[])) {
  allProgrammes.push(p);
}

// 2. From legacy norway-programmes.ts (only careers NOT already in the JSON)
const jsonCareerIds = new Set(allProgrammes.map(p => p.careerId));
for (const cid of LEGACY_CAREER_IDS) {
  if (jsonCareerIds.has(cid)) continue; // already covered
  const legacy = legacyGetNorway(cid, cid);
  if (!legacy) continue;
  for (const p of legacy.programmes) {
    allProgrammes.push({
      careerId: cid,
      country: 'NO',
      institution: p.institution,
      programme: p.programme,
      englishName: p.englishName || p.programme,
      city: p.city,
      url: p.url,
      type: p.type || 'bachelor',
      duration: p.duration,
      applicationVia: p.applicationVia || 'Samordna opptak',
    });
  }
}

// ── Build institutions ──────────────────────────────────────────────

const instMap = new Map<string, InstitutionEntry>();

for (const p of allProgrammes) {
  const id = institutionId(p.institution);
  if (!instMap.has(id)) {
    instMap.set(id, {
      id,
      name: p.institution,
      shortName: id.toUpperCase(),
      country: p.country,
      city: p.city,
      url: institutionUrl(p.institution, p.city),
      applicationVia: p.applicationVia || 'Direct application',
      careerIds: [],
    });
  }
  const inst = instMap.get(id)!;
  if (!inst.careerIds.includes(p.careerId)) {
    inst.careerIds.push(p.careerId);
  }
}

// ── Build programmes ────────────────────────────────────────────────

const progEntries: ProgrammeEntry[] = [];
const seen = new Set<string>();

for (const p of allProgrammes) {
  const instId = institutionId(p.institution);
  const progId = `${p.country.toLowerCase()}-${instId}-${slugify(p.programme)}`;
  if (seen.has(progId)) continue;
  seen.add(progId);

  progEntries.push({
    id: progId,
    careerId: p.careerId,
    institutionId: instId,
    programme: p.programme,
    englishName: p.englishName,
    url: p.url,
    type: p.type,
    duration: p.duration,
    ...(p.languageOfInstruction ? { languageOfInstruction: p.languageOfInstruction } : {}),
    ...(p.tuitionFee ? { tuitionFee: p.tuitionFee } : {}),
    ...(p.entryRequirements ? { entryRequirements: p.entryRequirements } : {}),
    ...(p.careerOutcome ? { careerOutcome: p.careerOutcome } : {}),
  });
}

// ── Build certification paths from legacy ───────────────────────────

const certPaths: Record<string, unknown> = {};
for (const key of CERT_MATCH_KEYS) {
  const path = legacyGetCert(key, key);
  if (path) {
    certPaths[key] = { ...path, matchTerms: [key] };
  }
}

// ── Career summaries + alternative paths from legacy ────────────────

const careerSummaries: Record<string, string> = {};
const alternativePaths: Record<string, string[]> = {};

for (const cid of LEGACY_CAREER_IDS) {
  const legacy = legacyGetNorway(cid, cid);
  if (legacy) {
    careerSummaries[cid] = legacy.summary;
    if (legacy.alternativePaths && legacy.alternativePaths.length > 0) {
      alternativePaths[cid] = legacy.alternativePaths;
    }
  }
}

// ── Advanced career map ─────────────────────────────────────────────

const advancedCareerMap: Record<string, { baseCareerId: string; specialisationNote: string }> = {
  surgeon: { baseCareerId: 'doctor', specialisationNote: 'Surgery is a specialisation after the 6-year medical degree. After LIS1 (18 months internship), you enter LIS2/3 surgical specialisation which takes 6+ additional years. Apply through your health trust.' },
  anesthesiologist: { baseCareerId: 'doctor', specialisationNote: 'After the 6-year medical degree, complete LIS1 (18 months) then LIS2/3 anaesthesiology specialisation (5 years).' },
  'general-practitioner': { baseCareerId: 'doctor', specialisationNote: 'After the 6-year medical degree, complete LIS1 (18 months) then the ALIS general-practice specialisation (5 years).' },
  psychiatrist: { baseCareerId: 'doctor', specialisationNote: 'After the 6-year medical degree, complete LIS1 (18 months) then LIS2/3 psychiatry specialisation (5 years).' },
  radiologist: { baseCareerId: 'doctor', specialisationNote: 'After the 6-year medical degree, complete LIS1 (18 months) then LIS2/3 radiology specialisation (5 years).' },
  pediatrician: { baseCareerId: 'doctor', specialisationNote: 'After the 6-year medical degree, complete LIS1 (18 months) then LIS2/3 paediatrics specialisation (5 years).' },
};

// ── Write output ────────────────────────────────────────────────────

const dataDir = resolve(__dirname, '..', 'src', 'lib', 'education', 'data');

async function main() {
  const institutions = [...instMap.values()].sort((a, b) => a.id.localeCompare(b.id));

  await writeFile(
    resolve(dataDir, 'institutions.json'),
    JSON.stringify({
      meta: { source: 'Official Nordic admissions portals', lastUpdated: '2026-04-10' },
      institutions,
    }, null, 2),
    'utf8',
  );
  console.log(`✓ institutions.json: ${institutions.length} institutions`);

  await writeFile(
    resolve(dataDir, 'programmes.json'),
    JSON.stringify({
      meta: { source: 'Official Nordic admissions portals + hand-curated Norwegian data', lastUpdated: '2026-04-10' },
      careerKeyMap: nordicRaw.careerKeyMap,
      advancedCareerMap,
      programmes: progEntries,
      certificationPaths: certPaths,
      alternativePaths,
      careerSummaries,
    }, null, 2),
    'utf8',
  );
  console.log(`✓ programmes.json: ${progEntries.length} programmes, ${Object.keys(certPaths).length} cert paths`);

  await writeFile(
    resolve(dataDir, 'modules.json'),
    JSON.stringify({
      meta: { lastUpdated: '2026-04-10', note: 'Layer 3 — populate on demand. See docs for schema.' },
      modules: [],
    }, null, 2),
    'utf8',
  );
  console.log('✓ modules.json: empty skeleton');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

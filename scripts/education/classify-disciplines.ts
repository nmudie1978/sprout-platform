/**
 * Deterministic career → discipline-bucket classifier.
 *
 * Maps ALL ~1,359 careers in src/lib/career-pathways.ts to one of the ~50
 * discipline buckets in src/lib/education/disciplines.ts, producing
 * src/lib/education/data/career-discipline-map.json.
 *
 * Strategy (no per-career AI — cheap, reproducible, testable):
 *   1. KEYWORD_RULES on `${id} ${title}` (lowercased), first match wins.
 *   2. else CATEGORY_DEFAULT[category].
 *   3. else 'other-applied'. Never leaves a career unmapped.
 *
 * The catalogue is read by parsing the source text of career-pathways.ts
 * (each career is `{ id: "...", title: "...", ... }` inside a
 * `CATEGORY_NAME: [ ... ]` block) — this sidesteps TS module-loading issues
 * and is exactly what the coverage test re-derives.
 *
 * Run: node_modules/.bin/tsx scripts/education/classify-disciplines.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { DisciplineId } from "../../src/lib/education/disciplines";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const PATHWAYS = resolve(ROOT, "src/lib/career-pathways.ts");
const OUT = resolve(ROOT, "src/lib/education/data/career-discipline-map.json");

// The 18 CareerCategory keys (the record keys of CAREER_PATHWAYS).
const CAREER_CATEGORIES = [
  "HEALTHCARE_LIFE_SCIENCES",
  "EDUCATION_TRAINING",
  "TECHNOLOGY_IT",
  "ARTIFICIAL_INTELLIGENCE",
  "BUSINESS_MANAGEMENT",
  "FINANCE_BANKING",
  "SALES_MARKETING",
  "MANUFACTURING_ENGINEERING",
  "LOGISTICS_TRANSPORT",
  "HOSPITALITY_TOURISM",
  "TELECOMMUNICATIONS",
  "CREATIVE_MEDIA",
  "PUBLIC_SERVICE_SAFETY",
  "MILITARY_DEFENCE",
  "SPORT_FITNESS",
  "REAL_ESTATE_PROPERTY",
  "SOCIAL_CARE_COMMUNITY",
  "CONSTRUCTION_TRADES",
] as const;
type CareerCategory = (typeof CAREER_CATEGORIES)[number];

/** Best single fallback bucket per category (used when no keyword matches). */
const CATEGORY_DEFAULT: Record<CareerCategory, DisciplineId> = {
  HEALTHCARE_LIFE_SCIENCES: "nursing-allied-health",
  EDUCATION_TRAINING: "education-teaching",
  TECHNOLOGY_IT: "computer-science-software",
  ARTIFICIAL_INTELLIGENCE: "data-science-ai",
  BUSINESS_MANAGEMENT: "business-management",
  FINANCE_BANKING: "economics-finance",
  SALES_MARKETING: "marketing-communications",
  MANUFACTURING_ENGINEERING: "mechanical-engineering",
  LOGISTICS_TRANSPORT: "logistics-supplychain",
  HOSPITALITY_TOURISM: "tourism-hospitality",
  TELECOMMUNICATIONS: "telecom-network",
  CREATIVE_MEDIA: "creative-arts-design",
  PUBLIC_SERVICE_SAFETY: "public-administration",
  MILITARY_DEFENCE: "military-defence",
  SPORT_FITNESS: "sport-science",
  REAL_ESTATE_PROPERTY: "real-estate",
  SOCIAL_CARE_COMMUNITY: "social-work",
  CONSTRUCTION_TRADES: "vocational-trades",
};

/**
 * Keyword rules on `${id} ${title}` (lowercase), first match wins.
 * Ordered SPECIFIC → GENERIC. Designed to catch the obvious within-category
 * splits and cross-category roles the category default would miss.
 */
const KEYWORD_RULES: Array<[RegExp, DisciplineId]> = [
  // ---- Health: specific clinical professions before the generic bucket ----
  [/dentist|dental|orthodont|periodont|endodont|prosthodont/, "dentistry"],
  [/pharmac|apothec|dispensing chemist/, "pharmacy"],
  [/veterinar|\bvet\b|animal health|zoolog/, "veterinary"],
  [/psycholog|psychotherap|neuropsych/, "psychology"],
  [/epidemiolog|public health|health policy|health promotion|environmental health|community health/, "public-health"],
  [
    /\bnurse|nursing|midwif|midwive|paramedic|radiograph|sonograph|physiother|physio\b|occupational therap|speech (and language )?therap|speech-language|dietit|nutritionist|optometr|optician|orthopt|audiolog|podiatr|chiropract|osteopath|paramedicine|ambulance|phlebotom|dental hygien|dental nurse|dental therap|dental technician|orthotist|prosthetist|perfusion|respiratory therap|anaesthetic (technician|nurse)|operating department|biomedical scientist|medical laborator|laboratory technician|clinical scientist|cardiac physiolog|sleep physiolog|art therap|music therap|drama therap|play therap/,
    "nursing-allied-health",
  ],
  [
    /\bdoctor\b|physician|surgeon|surgery|\bgp\b|general practitioner|anaesthetist|anesthesiolog|radiolog|cardiolog|oncolog|neurolog|paediatric|pediatric|psychiatr|dermatolog|pathologist|haematolog|hematolog|gynaecolog|gynecolog|obstetric|urolog|ophthalmolog|gastroenterolog|endocrinolog|rheumatolog|nephrolog|geneticist|immunolog|microbiolog|virolog|medical|clinician|consultant physician|hospitalist|intensivist/,
    "medicine",
  ],
  // ---- Life sciences / chemistry / earth before generic health default ----
  [/biochemist|molecular biolog|cell biolog|geneticist|genomic|biomedical scien|bioengineer|biotechnolog|biolog|botan|ecolog|marine biolog|biophysic/, "biology-life-sciences"],
  [/\bchemist\b|chemistry|chemical scien|analytical chemist|materials scien/, "chemistry"],
  [/geolog|geophysic|geoscien|seismolog|oceanograph|meteorolog|climatolog|hydrolog|volcanolog|glaciolog|geospatial|gis specialist/, "geosciences-energy"],
  [/environmental scien|conservation|sustainab|ecology|climate scien|renewable|wildlife/, "environmental-earth-science"],

  // ---- Engineering splits (before generic mechanical default) ----
  [/civil eng|structural eng|geotechnic|construction eng|bridge eng|highway eng|water eng|coastal eng/, "civil-engineering"],
  [/electrical eng|electronic eng|electronics eng|power eng|control (systems )?eng|instrumentation eng|mechatronic|electrical engineer|automation eng|robotics eng/, "electrical-engineering"],
  [/chemical eng|process eng|petroleum eng|petrochemical|refinery eng|polymer eng|materials eng|metallurg/, "chemical-process-engineering"],
  [/aerospace eng|aeronautic|aircraft eng|avionics/, "aviation"],
  [/mechanical eng|mechanical engineer|automotive eng|marine eng|industrial eng|manufacturing eng|production eng|hvac eng/, "mechanical-engineering"],
  [/marine eng|naval architect|ocean eng|offshore eng|subsea eng/, "maritime"],

  // ---- Computing / data / security / telecom ----
  [/cyber|information security|infosec|security engineer|security analyst|penetration test|ethical hack|soc analyst|security architect/, "cybersecurity"],
  [/data scien|machine learn|\bml\b|\bai\b|artificial intelligen|deep learn|neural|nlp\b|computer vision|data engineer|big data|analytics engineer|ml engineer|ai engineer|prompt engineer|llm\b/, "data-science-ai"],
  [/network eng|telecom|telecommunication|5g\b|fibre|fiber optic|radio frequency|\brf eng|broadband|satellite comms|wireless/, "telecom-network"],
  [/software|developer|programmer|web dev|full[- ]?stack|front[- ]?end|back[- ]?end|devops|cloud eng|cloud architect|site reliability|\bsre\b|qa engineer|test engineer|mobile dev|game dev|database admin|\bdba\b|systems admin|it support|it technician|computer scien|embedded (systems )?eng|firmware|platform eng|solutions architect|technical architect|blockchain/, "computer-science-software"],

  // ---- Built environment ----
  [/architect(?!ure of|.*software|.*solution|.*cloud|.*enterprise|.*data|.*security|.*systems|.*technical|.*network)|architectural|landscape architect|interior architect/, "architecture"],
  [/urban plan|town plan|city plan|regional plan|spatial plan|transport plan/, "urban-planning"],

  // ---- Law / policing / public admin ----
  [/lawyer|solicitor|barrister|\blegal\b|judge|magistrate|attorney|advocate|paralegal|legal counsel|notary|conveyanc|jurist/, "law"],
  [/police|detective|\bforensic|criminolog|crime scene|probation|prison officer|custody|investigator|fraud examiner|border (force|control)|immigration officer/, "criminology-policing"],

  // ---- Business / finance / accounting / HR / marketing ----
  [/account|\baudit|\btax\b|bookkeep|payroll|financial controller|management accountant/, "accounting"],
  [/economist|economics|\bfinanc|banking|investment|actuar|trader|portfolio manager|hedge fund|private equity|venture capital|quantitative analyst|\bquant\b|risk analyst|underwrit|insurance broker|wealth manager|fund manager|treasury/, "economics-finance"],
  [/market|\bbrand|advertis|\bpr\b|public relations|communications|copywrit|content strateg|social media manager|seo specialist|growth (marketer|hacker)|media buyer|campaign manager/, "marketing-communications"],
  [/human resourc|\bhr\b|recruit|talent acquisition|people (operations|partner)|learning and development|compensation and benefits|employee relations/, "human-resources"],

  // ---- Education / social ----
  [/teacher|teaching|lecturer|\btutor|professor|educator|early years|kindergarten|montessori|special educational needs|\bsen\b|teaching assistant|instructional design|curriculum|head ?teacher|principal\b|education adviso/, "education-teaching"],
  [/social work|social care|counsel(l)?or|youth work|family support|care worker|support worker|community develop|outreach worker|substance (misuse|abuse)|safeguard|welfare officer/, "social-work"],

  // ---- Humanities / politics / journalism ----
  [/journalis|reporter|news (anchor|editor)|correspondent|editor\b|broadcast journalis|investigative journalis|sub-?editor|press officer/, "journalism-media"],
  [/historian|philosoph|archaeolog|anthropolog|archivist|curator|librarian|theolog|classicist/, "history-philosophy"],
  [/political scien|diplomat|foreign (service|affairs)|international relations|policy analyst|policy adviso|lobbyist|legislative|parliament|civil servant.*polic/, "political-science-ir"],
  [/translat|interpreter|linguist|language teacher|lexicograph|\bwriter\b|author|novelist|poet/, "humanities-languages"],

  // ---- Creative / music / film ----
  [/animat|film|filmmaker|cinematograph|director of photography|video edit|vfx|visual effects|motion graphic|videograph|screenwrit|documentary/, "film-animation"],
  [/musician|composer|conductor|singer|vocalist|instrumentalist|sound engineer|music produc|dj\b|actor|actress|dancer|choreograph|theatre|performer|opera|orchestra/, "music-performing-arts"],
  [/graphic design|illustrat|\bartist|painter|sculptor|photographer|fashion design|product design|ux design|ui design|interior design|game artist|3d artist|set design|costume design|jewellery design|industrial design|creative director|art director|designer/, "creative-arts-design"],

  // ---- Sport ----
  [/\bsport|athlet|coach\b|fitness|personal trainer|physical educat|strength and condition|sports scien|sports therap|football|exercise physiolog|gym instructor|yoga|pilates instructor/, "sport-science"],

  // ---- Hospitality / culinary / tourism ----
  [/\bchef|culinary|\bcook\b|baker|patissier|pastry|sommelier|butcher|barista|cookery/, "culinary"],
  [/tourism|hospitality|hotel|travel (agent|consultant)|tour (guide|operator)|event (manager|planner|coordinat)|restaurant manager|concierge|cabin crew|flight attendant|cruise/, "tourism-hospitality"],

  // ---- Agriculture / food production ----
  [/farmer|agricultur|agronom|horticultur|fishery|fish farm|aquacultur|forester|forestry|food scien|food technolog|food product|viticultur|winemaker|brewer|crop|livestock|dairy/, "agriculture-food"],

  // ---- Transport: aviation / maritime / logistics ----
  [/\bpilot|aviation|aircraft|aerospace|air traffic|cabin crew|flight (engineer|dispatcher)|drone (pilot|operator)/, "aviation"],
  [/\bmariner|seafarer|\bcaptain\b|deck officer|ship\b|maritime|merchant navy|harbour|port (operations|manager)|ferry|tugboat|dredg|coastguard|fisher/, "maritime"],
  [/logistic|supply chain|warehouse|freight|haulage|shipping coordinat|distribution (manager|centre)|procurement|fleet manager|customs|inventory|courier|delivery driver|\bdriver\b|transport (manager|planner)/, "logistics-supplychain"],

  // ---- Energy / geoscience ----
  [/petroleum|oil and gas|drilling|reservoir eng|wind (turbine|farm)|solar (installer|engineer)|energy (analyst|consultant|engineer|manager)|nuclear|power plant|grid (operator|engineer)/, "geosciences-energy"],

  // ---- Military ----
  [/military|soldier|infantry|naval officer|army\b|\bnavy\b|air force|marine corps|combat|artillery|defence (analyst|engineer)|special forces|commando|sniper|\barmoured|\brecon\b/, "military-defence"],

  // ---- Real estate ----
  [/estate agent|real estate|property (manager|developer|surveyor)|letting agent|valuer|surveyor|quantity surveyor|land surveyor|facilities manager|property developer/, "real-estate"],

  // ---- Beauty / wellness ----
  [/hairdress|barber|beauty therap|beautician|nail technician|aesthetician|makeup artist|\bspa\b|massage therap|cosmetolog|tattoo|esthetic|wellness (coach|practitioner)|holistic/, "beauty-wellness"],

  // ---- Public administration ----
  [/firefighter|fire officer|fire and rescue|paramedic dispatch|emergency (planning|management|response)|coastguard|civil protection|local government|town clerk|registrar|tax officer|benefits adviso|public administrat|government officer|customs officer|environmental health officer|building control|licensing officer/, "public-administration"],

  // ---- Maths / physics (academic / research) ----
  [/mathematic|statistic|physicist|physics|astronom|astrophysic|cosmolog|actuarial scien/, "mathematics-physics"],

  // ---- Generic management (fall through last among business) ----
  [/\bmanager\b|management consultant|business analyst|operations (manager|director)|project manager|product (manager|owner)|entrepreneur|director\b|chief (executive|operating)|consultant\b|administrator\b/, "business-management"],

  // ---- Generic trades (very last, broad) ----
  [/electrician|plumber|carpenter|joiner|bricklayer|welder|\bmechanic\b|machinist|fitter\b|fabricator|roofer|plasterer|tiler|glazier|painter and decorat|scaffold|locksmith|\bhvac|gas engineer|heating engineer|installer|technician\b|tradesperson|apprentice|metalwork|woodwork|stonemason|blacksmith|upholster|cabinet maker/, "vocational-trades"],
];

function classify(id: string, title: string, category: CareerCategory): DisciplineId {
  const hay = `${id} ${title}`.toLowerCase();
  for (const [re, bucket] of KEYWORD_RULES) {
    if (re.test(hay)) return bucket;
  }
  return CATEGORY_DEFAULT[category] ?? "other-applied";
}

// --- Parse the catalogue from source text, tracking the current category. ---
//
// Careers appear in two formats inside `CATEGORY_NAME: [ ... ]` blocks:
//   single-line:  { id: "x", title: "X", emoji: ... }
//   multi-line:   {\n  id: "x",\n  title: "X",\n  ... }
// We scan over the full text for every `id: "..."`, find the current category
// (the most recent `CATEGORY_NAME: [` header before that offset, but only while
// we're still inside the CAREER_PATHWAYS object), and grab the nearest following
// `title: "..."`. Anything after the last category block (trailing maps/helpers)
// has no enclosing CareerCategory header *and* lies past the object, so we stop
// at the object's closing.
const src = readFileSync(PATHWAYS, "utf8");

// Bound the scan to the CAREER_PATHWAYS object literal so trailing
// declarations (JOB_TO_CAREER_MAPPING, helper functions) are excluded.
const objStart = src.indexOf("export const CAREER_PATHWAYS");
const tail = src.indexOf("\nexport function getCareersByGrowth", objStart);
const body = tail === -1 ? src.slice(objStart) : src.slice(objStart, tail);

const categorySet = new Set<string>(CAREER_CATEGORIES);
const headerRe = /^ {2}([A-Z_]+): \[/gm;
const idRe = /\bid: "([a-z0-9][a-z0-9-]*)"/g;
const titleRe = /\btitle: "((?:[^"\\]|\\.)*)"/g;

// Pre-collect category header offsets in order.
const headers: Array<{ offset: number; cat: CareerCategory }> = [];
for (let h: RegExpExecArray | null; (h = headerRe.exec(body)); ) {
  if (categorySet.has(h[1])) headers.push({ offset: h.index, cat: h[1] as CareerCategory });
}
function categoryAt(offset: number): CareerCategory {
  let cat: CareerCategory = "BUSINESS_MANAGEMENT";
  for (const h of headers) {
    if (h.offset <= offset) cat = h.cat;
    else break;
  }
  return cat;
}

const map: Record<string, DisciplineId> = {};
const dist: Record<string, number> = {};
let count = 0;

for (let m: RegExpExecArray | null; (m = idRe.exec(body)); ) {
  const id = m[1];
  if (id in map) continue; // ids are unique; first wins defensively
  // Nearest following title (within a reasonable window for multi-line objects).
  titleRe.lastIndex = m.index;
  const t = titleRe.exec(body);
  const title = t ? t[1] : id;
  const cat = categoryAt(m.index);
  const bucket = classify(id, title, cat);
  map[id] = bucket;
  dist[bucket] = (dist[bucket] ?? 0) + 1;
  count++;
}

const out = {
  meta: {
    source: "deterministic classifier (category + keyword)",
    lastUpdated: "2026-06-18",
  },
  map,
};

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");

// --- Report distribution to stdout ---
const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]);
console.log(`Mapped ${count} careers into ${sorted.length} buckets.`);
console.log("Distribution (count per bucket):");
for (const [bucket, n] of sorted) {
  console.log(`  ${String(n).padStart(4)}  ${bucket}`);
}
const other = dist["other-applied"] ?? 0;
const pct = ((other / count) * 100).toFixed(1);
console.log(`\nother-applied: ${other} (${pct}%)`);

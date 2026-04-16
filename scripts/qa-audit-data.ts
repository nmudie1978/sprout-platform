/**
 * QA: structural audit of education + career datasets.
 * Run: `npx tsx scripts/qa-audit-data.ts`
 *
 * Reports defects only — silent on healthy invariants.
 * Severity: CRITICAL (broken cross-ref / runtime crash risk),
 *           HIGH (will surface bad UX),
 *           MEDIUM (cosmetic / consistency),
 *           LOW (informational).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type Defect = { sev: Severity; area: string; id: string; msg: string };

const root = resolve(__dirname, "..");
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), "utf8"));

const programmesFile = read("src/lib/education/data/programmes.json");
const institutions = read("src/lib/education/data/institutions.json").institutions as Array<{
  id: string; name: string; country: string; city: string; url: string; careerIds?: string[];
}>;
const programmes = programmesFile.programmes as Array<{
  id: string; careerId: string; institutionId: string; programme: string; englishName?: string;
  url: string; type?: string; duration?: string; country?: string;
}>;
const careerReqs = read("src/lib/education/data/career-requirements.json");
const validation = read("src/lib/education/data/programme-validation.json");

// Phase 2a outputs — only audit if present (hand-edits in the future
// may delete these temporarily; the audit shouldn't fail-hard on
// their absence, but should warn).
let routesFile: { routes?: Array<{ id: string; careerId: string; isDefault: boolean }> } = {};
let stagesFile: { stages?: Array<{ id: string; routeId: string; programmeIds: string[] }> } = {};
try { routesFile = read("src/lib/education/data/routes.json"); } catch { /* missing — handled below */ }
try { stagesFile = read("src/lib/education/data/stages.json"); } catch { /* missing — handled below */ }

const defects: Defect[] = [];
const push = (sev: Severity, area: string, id: string, msg: string) =>
  defects.push({ sev, area, id, msg });

// ── 1. Programme ID uniqueness ──
const idCounts = new Map<string, number>();
for (const p of programmes) idCounts.set(p.id, (idCounts.get(p.id) ?? 0) + 1);
for (const [id, n] of idCounts) if (n > 1) push("CRITICAL", "programmes.id-duplicate", id, `${n} programmes share this ID`);

// ── 2. Programme → institution cross-ref ──
const institutionIds = new Set(institutions.map((i) => i.id));
for (const p of programmes) {
  if (!institutionIds.has(p.institutionId))
    push("CRITICAL", "programmes.broken-institution-ref", p.id, `institutionId "${p.institutionId}" not in institutions.json`);
}

// ── 3. Institution ID uniqueness ──
const instCounts = new Map<string, number>();
for (const i of institutions) instCounts.set(i.id, (instCounts.get(i.id) ?? 0) + 1);
for (const [id, n] of instCounts) if (n > 1) push("CRITICAL", "institutions.id-duplicate", id, `${n} institutions share this ID`);

// ── 4. Required field shape ──
for (const p of programmes) {
  if (!p.url || !/^https?:\/\//.test(p.url)) push("HIGH", "programmes.invalid-url", p.id, `url is missing or malformed: ${p.url}`);
  if (!p.programme || p.programme.trim().length < 3) push("HIGH", "programmes.missing-name", p.id, `programme name missing or too short: "${p.programme}"`);
  if (!p.careerId) push("CRITICAL", "programmes.missing-careerId", p.id, "no careerId");
  if (!p.duration) push("MEDIUM", "programmes.missing-duration", p.id, "no duration field");
  if (!p.type) push("MEDIUM", "programmes.missing-type", p.id, "no type field");
}

// ── 5. Duplicate (institution, programme) tuples ──
const tuples = new Map<string, string[]>();
for (const p of programmes) {
  const k = `${p.institutionId}|${p.programme}`;
  if (!tuples.has(k)) tuples.set(k, []);
  tuples.get(k)!.push(p.id);
}
for (const [k, ids] of tuples) if (ids.length > 1) push("HIGH", "programmes.dup-tuple", ids.join(","), `same (institution, programme) repeated: ${k}`);

// ── 6. URL-level duplicates ──
const urls = new Map<string, string[]>();
for (const p of programmes) {
  if (!p.url) continue;
  if (!urls.has(p.url)) urls.set(p.url, []);
  urls.get(p.url)!.push(p.id);
}
for (const [u, ids] of urls) if (ids.length > 1) push("MEDIUM", "programmes.dup-url", ids.join(","), `same URL on multiple programmes: ${u}`);

// ── 7. Institution country mismatch (programme.country vs institution.country) ──
const instCountry = new Map(institutions.map((i) => [i.id, i.country]));
for (const p of programmes) {
  if (p.country && instCountry.get(p.institutionId) && p.country !== instCountry.get(p.institutionId)) {
    push("HIGH", "programmes.country-mismatch", p.id, `programme.country=${p.country} but institution=${instCountry.get(p.institutionId)}`);
  }
}

// ── 8. Institutions with no programmes (orphans) ──
const referenced = new Set(programmes.map((p) => p.institutionId));
for (const i of institutions) {
  if (!referenced.has(i.id)) push("LOW", "institutions.orphan", i.id, `${i.name} has no programmes pointing to it`);
}

// ── 9. Institution.careerIds vs programme.careerId reverse-link ──
for (const i of institutions) {
  if (!i.careerIds) continue;
  const declaredCareers = new Set(i.careerIds);
  const realCareers = new Set(programmes.filter((p) => p.institutionId === i.id).map((p) => p.careerId));
  for (const c of declaredCareers) {
    if (!realCareers.has(c))
      push("MEDIUM", "institutions.declared-career-no-programme", i.id, `${i.name} declares careerId "${c}" but no programme links it`);
  }
  for (const c of realCareers) {
    if (!declaredCareers.has(c))
      push("MEDIUM", "institutions.programme-career-not-declared", i.id, `${i.name} has programme for "${c}" but careerIds doesn't include it`);
  }
}

// ── 10. Validation status: CRITICAL if a HIGH-traffic career has 0 LIVE programmes ──
const valResults = (validation.results ?? {}) as Record<string, { status: string; httpCode?: number }>;
const careerToStatuses = new Map<string, string[]>();
for (const p of programmes) {
  const status = valResults[p.id]?.status ?? "UNVALIDATED";
  if (!careerToStatuses.has(p.careerId)) careerToStatuses.set(p.careerId, []);
  careerToStatuses.get(p.careerId)!.push(`${p.id}:${status}`);
}
for (const [career, statuses] of careerToStatuses) {
  const live = statuses.filter((s) => s.endsWith(":LIVE")).length;
  const total = statuses.length;
  if (total > 0 && live === 0)
    push("CRITICAL", "career.no-live-programmes", career, `${career}: ${total} programmes, 0 LIVE — Study Path will be empty`);
  else if (total > 2 && live / total < 0.34)
    push("HIGH", "career.mostly-broken-programmes", career, `${career}: ${live}/${total} LIVE`);
}

// ── 11. Career-key map: collisions, untracked targets ──
const careerKeyMap = (programmesFile.careerKeyMap ?? {}) as Record<string, string>;
const validCareerIds = new Set([
  ...programmes.map((p) => p.careerId),
  ...Object.keys((careerReqs.careers ?? careerReqs) as Record<string, unknown>),
]);
for (const [alias, target] of Object.entries(careerKeyMap)) {
  if (!validCareerIds.has(target))
    push("HIGH", "careerKeyMap.unknown-target", alias, `alias "${alias}" → "${target}" but target not in known careers`);
}

// ── 12. Career-requirements: bare structural sanity ──
const careersInReq = (careerReqs.careers ?? careerReqs) as Record<string, { education?: unknown; certifications?: unknown }>;
for (const [cid, req] of Object.entries(careersInReq)) {
  if (typeof req !== "object" || req === null) {
    push("HIGH", "careerReqs.malformed", cid, "career-requirements entry is not an object");
    continue;
  }
}

// ── 13. Programme.url scheme inconsistencies ──
for (const p of programmes) {
  if (p.url && p.url.startsWith("http://"))
    push("MEDIUM", "programmes.http-not-https", p.id, `URL uses http://, should be https://: ${p.url}`);
}

// ── 14. Routes/stages — schema integrity (Phase 2a outputs) ──
const allRoutes = routesFile.routes ?? [];
const allStages = stagesFile.stages ?? [];

if (allRoutes.length === 0 || allStages.length === 0) {
  push("LOW", "routes.missing-files", "—", "routes.json or stages.json missing — run scripts/migrate-programmes-to-routes.ts");
} else {
  // 14a. Route id uniqueness
  const routeCounts = new Map<string, number>();
  for (const r of allRoutes) routeCounts.set(r.id, (routeCounts.get(r.id) ?? 0) + 1);
  for (const [id, n] of routeCounts) if (n > 1) push("CRITICAL", "routes.id-duplicate", id, `${n} routes share this ID`);

  // 14b. Stage id uniqueness
  const stageCounts = new Map<string, number>();
  for (const s of allStages) stageCounts.set(s.id, (stageCounts.get(s.id) ?? 0) + 1);
  for (const [id, n] of stageCounts) if (n > 1) push("CRITICAL", "stages.id-duplicate", id, `${n} stages share this ID`);

  // 14c. Stage → route cross-ref
  const knownRouteIds = new Set(allRoutes.map((r) => r.id));
  for (const s of allStages) {
    if (!knownRouteIds.has(s.routeId))
      push("CRITICAL", "stages.broken-route-ref", s.id, `stage references unknown routeId "${s.routeId}"`);
  }

  // 14d. Stage → programme cross-ref
  const knownProgrammeIds = new Set(programmes.map((p) => p.id));
  for (const s of allStages) {
    for (const pid of s.programmeIds) {
      if (!knownProgrammeIds.has(pid))
        push("HIGH", "stages.broken-programme-ref", s.id, `stage references unknown programmeId "${pid}"`);
    }
  }

  // 14e. Exactly one default route per career
  const defaultsByCareer = new Map<string, number>();
  for (const r of allRoutes) {
    if (r.isDefault) defaultsByCareer.set(r.careerId, (defaultsByCareer.get(r.careerId) ?? 0) + 1);
  }
  const careersWithRoutes = new Set(allRoutes.map((r) => r.careerId));
  for (const careerId of careersWithRoutes) {
    const n = defaultsByCareer.get(careerId) ?? 0;
    if (n === 0) push("HIGH", "routes.no-default", careerId, `career "${careerId}" has routes but none isDefault: true`);
    if (n > 1) push("CRITICAL", "routes.multiple-defaults", careerId, `career "${careerId}" has ${n} default routes — exactly one allowed`);
  }
}

// ── REPORT ──
const bySev: Record<Severity, Defect[]> = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
for (const d of defects) bySev[d.sev].push(d);

console.log(`\n=== QA Data Audit — ${defects.length} defect(s) ===`);
for (const sev of ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as Severity[]) {
  const items = bySev[sev];
  if (!items.length) continue;
  console.log(`\n── ${sev} (${items.length}) ──`);
  for (const d of items) console.log(`  [${d.area}] ${d.id} — ${d.msg}`);
}
console.log("");
process.exit(bySev.CRITICAL.length > 0 ? 1 : 0);

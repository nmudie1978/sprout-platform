/**
 * Bridge Routes Mindmap — domain-adjacency map
 *
 * Turns the user's previous occupation into a curated set of *adjacent*
 * bridge roles — a half-step into the new field that reuses what they
 * already have, rather than competing as a generic junior. Falls back to
 * generic strengths-based roles when the occupation isn't recognised.
 *
 * Deterministic, hand-curated. Keyword contains-match (lowercased).
 */

export interface AnchorRole {
  label: string;
  detail?: string;
}

export interface AnchorResult {
  title: string;
  leaves: AnchorRole[];
}

/** Each entry: keyword aliases → ≥2 adjacent bridge roles. */
export const ADJACENCY: { match: string[]; roles: AnchorRole[] }[] = [
  {
    match: ['interior design', 'interior designer', 'interior'],
    roles: [
      { label: 'Fit-out / refurbishment project coordinator', detail: 'Office and retail fit-outs need someone who can run suppliers, budgets and timelines — exactly what design projects already taught you.' },
      { label: 'FF&E / workplace-design coordinator', detail: 'Furniture, fixtures & equipment rollouts for corporate offices — a half-step from interiors into delivery.' },
    ],
  },
  {
    match: ['graphic design', 'graphic designer', 'designer', 'design'],
    roles: [
      { label: 'Design-ops / studio coordinator', detail: 'Studios need someone to run schedules, hand-offs and client reviews — you already know the work.' },
      { label: 'Brand / production project coordinator', detail: 'Coordinate campaigns and production end-to-end, using your eye for the output.' },
    ],
  },
  {
    match: ['teacher', 'teaching', 'tutor', 'lecturer'],
    roles: [
      { label: 'Learning & development coordinator', detail: 'Companies run internal training — your classroom skills transfer directly.' },
      { label: 'Instructional design / ed-tech coordinator', detail: 'Build and run learning content for an ed-tech or L&D team.' },
    ],
  },
  {
    match: ['nurse', 'nursing', 'healthcare', 'care worker', 'health'],
    roles: [
      { label: 'Care / clinical project coordinator', detail: 'Health services need coordinators who understand the front line.' },
      { label: 'Health-administration coordinator', detail: 'Run rotas, pathways and improvement projects in a clinical setting.' },
    ],
  },
  {
    match: ['retail', 'shop', 'sales assistant', 'sales'],
    roles: [
      { label: 'Category / merchandising coordinator', detail: 'Your shop-floor knowledge maps onto buying and merchandising support roles.' },
      { label: 'Account / customer coordinator', detail: 'Coordinate accounts and orders — a step up from selling.' },
    ],
  },
  {
    match: ['hospitality', 'chef', 'restaurant', 'barista', 'waiter', 'cook'],
    roles: [
      { label: 'Operations / events coordinator', detail: 'Hospitality is operations under pressure — that runs events and facilities too.' },
      { label: 'Facilities / venue coordinator', detail: 'Coordinate spaces, suppliers and staff for a venue or office.' },
    ],
  },
  {
    match: ['admin', 'administrator', 'office', 'receptionist', 'secretary', 'pa'],
    roles: [
      { label: 'Operations / office coordinator', detail: 'Admin is the natural on-ramp to project coordination — same skills, bigger scope.' },
      { label: 'Project assistant / coordinator', detail: 'Support a delivery team directly — the realistic first PM rung.' },
    ],
  },
  {
    match: ['marketing', 'social media', 'comms', 'communications'],
    roles: [
      { label: 'Campaign / digital project coordinator', detail: 'Coordinate campaigns across teams and channels.' },
      { label: 'Marketing operations coordinator', detail: 'Run the calendar, tools and reporting for a marketing function.' },
    ],
  },
  {
    match: ['account', 'finance', 'bookkeep', 'audit', 'tax'],
    roles: [
      { label: 'Finance operations / billing coordinator', detail: 'Your numbers background fits finance-ops and project-finance support.' },
      { label: 'Project finance coordinator', detail: 'Track budgets and spend for a delivery team.' },
    ],
  },
  {
    match: ['engineer', 'engineering', 'mechanic', 'technician'],
    roles: [
      { label: 'Technical project coordinator', detail: 'Technical teams need coordinators who speak the language.' },
      { label: 'Site / delivery coordinator', detail: 'Coordinate works, contractors and schedules on technical projects.' },
    ],
  },
  {
    match: ['construction', 'builder', 'carpenter', 'electrician', 'plumber', 'trades'],
    roles: [
      { label: 'Site / construction project coordinator', detail: 'On-site experience is gold for coordinating builds and contractors.' },
      { label: 'Works planning coordinator', detail: 'Plan sequencing, materials and labour for projects.' },
    ],
  },
  {
    match: ['it', 'software', 'developer', 'programmer', 'qa', 'tester'],
    roles: [
      { label: 'Delivery / scrum coordinator', detail: 'Coordinate sprints and delivery for a tech team — your domain knowledge is the edge.' },
      { label: 'Technical project coordinator', detail: 'Bridge engineers and stakeholders on delivery.' },
    ],
  },
  {
    match: ['customer service', 'support', 'call centre', 'help desk'],
    roles: [
      { label: 'Customer operations / success coordinator', detail: 'Front-line insight makes you valuable in operations and onboarding.' },
      { label: 'Onboarding / implementation coordinator', detail: 'Coordinate new-customer rollouts end-to-end.' },
    ],
  },
  {
    match: ['logistics', 'warehouse', 'driver', 'supply'],
    roles: [
      { label: 'Supply-chain / operations coordinator', detail: 'Logistics is coordination at scale — it maps onto ops roles.' },
      { label: 'Planning coordinator', detail: 'Coordinate stock, routes and schedules.' },
    ],
  },
  {
    match: ['military', 'forsvaret', 'army', 'navy', 'soldier', 'veteran'],
    roles: [
      { label: 'Operations / logistics coordinator', detail: 'Service teaches command, logistics and calm-under-pressure — all transfer to operations.' },
      { label: 'Project / programme coordinator', detail: 'Coordinate people and resources toward a clear objective.' },
    ],
  },
];

const GENERIC: AnchorRole[] = [
  { label: 'Coordinator / assistant roles in the field', detail: 'A coordinator or assistant role is the realistic first rung — it values reliability and organisation over years of experience.' },
  { label: 'Roles that reuse your strongest past skill', detail: 'Pick the one thing you were clearly good at before, and find the role where the new field needs exactly that.' },
];

/** Whole-word / phrase match, case-insensitive — avoids "it" matching "audit". */
function containsWord(haystack: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(haystack);
}

/** Resolve the anchor branch's title + adjacent roles for an occupation. */
export function resolveAnchorRoles(previousOccupation: string | null): AnchorResult {
  const occ = (previousOccupation ?? '').trim();
  if (occ) {
    const hit = ADJACENCY.find((e) => e.match.some((m) => containsWord(occ, m)));
    if (hit) return { title: `Build on your ${occ} background`, leaves: hit.roles };
  }
  return { title: 'Use the strengths you already have', leaves: GENERIC };
}

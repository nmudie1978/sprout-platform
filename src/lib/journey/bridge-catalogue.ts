/**
 * Bridge Routes Mindmap — branch/leaf catalogue
 *
 * The curated source branches (before NAV gating, ordering and tried-dedup,
 * which `buildBridgeMindmap` applies). NAV leaves are hard-coded facts — they
 * are never AI-generated, because they go to a vulnerable jobseeker.
 */

import type { BridgeBranch, BridgeInput, BridgeLeaf, TriedRoute } from './bridge-mindmap-types';
import { resolveAnchorRoles } from './bridge-domain-adjacency';

const NAV_URL = 'Ask your NAV advisor — more on nav.no';

function leaf(
  kind: string,
  i: number,
  label: string,
  detail?: string,
  extra?: Partial<BridgeLeaf>,
): BridgeLeaf {
  return { id: `${kind}-${i}`, label, detail, state: 'untried', ...extra };
}

/** Build the five source branches for the given input. */
export function buildCatalogueBranches(input: BridgeInput): BridgeBranch[] {
  const anchor = resolveAnchorRoles(input.previousOccupation);

  const branches: BridgeBranch[] = [
    {
      id: 'anchor',
      kind: 'anchor',
      title: anchor.title,
      emphasis: false,
      leaves: anchor.leaves.map((r, i) => leaf('anchor', i, r.label, r.detail)),
    },
    {
      id: 'workplace-nav',
      kind: 'workplace-nav',
      title: 'Get into a workplace',
      emphasis: false,
      leaves: [
        leaf('nav', 0, 'Praksisplass (work placement)', `A real placement where NAV can cover your wage during the trial, so an employer takes you on with no salary risk. ${NAV_URL}`, { navFact: true, mapsToTriedRoute: 'placement' }),
        leaf('nav', 1, 'Lønnstilskudd (wage subsidy)', `NAV pays part of your salary for an agreed period, lowering the risk of hiring a career-changer. ${NAV_URL}`, { navFact: true }),
        leaf('nav', 2, 'AMO labour-market course', `Short, job-focused training NAV funds when it leads toward real vacancies — targeted, not a full degree. ${NAV_URL}`, { navFact: true }),
      ],
    },
    {
      id: 'proof',
      kind: 'proof',
      title: 'Build proof you can do the job',
      emphasis: false,
      leaves: [
        leaf('proof', 0, 'Run one real project, pro bono', 'A charity move, a community space, a small business — one delivered project gives you a concrete case study with stakeholders and a result.'),
        leaf('proof', 1, 'Build a portfolio of evidence', 'Collect the proof employers actually want to see for entry roles.'),
        leaf('proof', 2, 'Reframe freelance work as the role', 'Position any freelance or side work in the language of the role you want.', { mapsToTriedRoute: 'freelancing' }),
      ],
    },
    {
      id: 'training',
      kind: 'training',
      title: 'Targeted upskilling — not another full course',
      emphasis: false,
      leaves: [
        leaf('training', 0, 'Close one specific named gap', 'Identify the single skill employers keep asking for, and close just that — not a whole new qualification.'),
        leaf('training', 1, 'Short, targeted course', 'A focused credential tied to real vacancies, if there is a genuine gap.', { mapsToTriedRoute: 'course' }),
        leaf('training', 2, 'Industry certification ladder', 'Where the field uses certifications, take them in the order employers expect.'),
      ],
    },
    {
      id: 'network',
      kind: 'network',
      title: 'Go through people',
      emphasis: false,
      leaves: [
        leaf('network', 0, 'Reconnect with ex-colleagues & suppliers', 'People who already know you deliver can vouch for you — that skips the cold-application filter.'),
        leaf('network', 1, 'Register with temp / recruitment agencies', 'Temp contracts convert to permanent and hand you the experience line you are missing.'),
        leaf('network', 2, 'Ask for informational chats', 'Short, low-pressure conversations open doors that job ads never will.', { mapsToTriedRoute: 'networking' }),
      ],
    },
  ];

  return branches;
}

/** Friendly labels for the "Already tried" branch. */
export const TRIED_ROUTE_LABELS: Record<TriedRoute, string> = {
  course: 'Took a course / qualification',
  applications: 'Applied to jobs',
  cv: 'Updated CV / LinkedIn',
  networking: 'Networking / reaching out',
  placement: 'Internship / work placement',
  freelancing: 'Freelancing / own projects',
};

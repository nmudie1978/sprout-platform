/**
 * Bridge Routes Mindmap — branch/leaf catalogue
 *
 * The curated source branches (before NAV gating, ordering and tried-dedup,
 * which `buildBridgeMindmap` applies). NAV leaves are hard-coded facts — they
 * are never AI-generated, because they go to a vulnerable jobseeker.
 */

import type { BridgeBranch, BridgeInput, BridgeLeaf, TriedRoute } from './bridge-mindmap-types';
import { resolveAnchorRoles } from './bridge-domain-adjacency';
import { getTraineeProgrammesForCategory } from './trainee-programmes';

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
      // NAV-aware leaves: factual NAV schemes when the user is working with NAV,
      // otherwise general placement routes that don't depend on NAV. The branch
      // itself is always shown — getting inside a workplace matters either way.
      leaves: input.withNav
        ? [
            leaf('nav', 0, 'Praksisplass (work placement)', `A real placement where NAV can cover your wage during the trial, so an employer takes you on with no salary risk. ${NAV_URL}`, { navFact: true, mapsToTriedRoute: 'placement' }),
            leaf('nav', 1, 'Lønnstilskudd (wage subsidy)', `NAV pays part of your salary for an agreed period, lowering the risk of hiring a career-changer. ${NAV_URL}`, { navFact: true }),
            leaf('nav', 2, 'AMO labour-market course', `Short, job-focused training NAV funds when it leads toward real vacancies — targeted, not a full degree. ${NAV_URL}`, { navFact: true }),
          ]
        : [
            leaf('workplace', 0, 'Propose a work trial directly', 'Offer an employer a short, no-pressure trial period so they can see you in the role before committing. With little risk on their side, many will say yes.', { mapsToTriedRoute: 'placement' }),
            leaf('workplace', 1, 'Open internships & placements', 'Apply to internship and placement schemes that welcome adults and career-changers — not just students fresh out of school.'),
            leaf('workplace', 2, 'Start part-time or fixed-term', 'A part-time or fixed-term role is a lower-risk hire for an employer and a foot in the door you can grow into a permanent one.'),
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
    {
      id: 'programmes',
      kind: 'programmes',
      title: 'Structured ways in',
      emphasis: false,
      // Named, sector-matched trainee/graduate programmes first (only when the
      // target career's category has any), then the always-relevant
      // apprenticeship + entry-level routes. Never empty — the generic leaves
      // below hold for every career.
      leaves: [
        ...getTraineeProgrammesForCategory(input.targetCategory).map((p, i) =>
          leaf(
            'programmes',
            100 + i,
            `${p.company} — ${p.kind} programme`,
            `${p.windowNote}. Opens annually; apply through their careers page.`,
            { url: p.url },
          ),
        ),
        leaf('programmes', 0, 'Apprenticeships (lærling)', 'Explore apprenticeships and the trades that offer a læreplass — earn while you train.', { url: 'https://utdanning.no' }),
        leaf('programmes', 1, 'Entry-level & trainee jobs', "Norway's biggest job board — filter for entry-level, graduate and trainee roles.", { url: 'https://www.finn.no/job' }),
        leaf('programmes', 2, 'Early-career programmes (global)', "LinkedIn's guide to internships, apprenticeships and graduate programmes.", { url: 'https://careers.linkedin.com/pathways-programs' }),
        leaf('programmes', 3, 'Know what "entry-level" really asks', 'Most entry-level ads list nice-to-haves, not requirements. Apply if you meet the core — not every line.'),
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

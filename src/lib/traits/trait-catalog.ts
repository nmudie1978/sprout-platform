// ============================================
// TRAIT CATALOG — "Traits I'm Noticing"
// Static data for the self-reflection trait tracker.
// No scores, no labels, no personality testing.
// ============================================

// ---- Types ----

export type TraitId =
  | 'calm_focus'
  | 'analytical_thinking'
  | 'patience'
  | 'creative_spark'
  | 'independent_drive'
  | 'big_picture'
  | 'detail_eye'
  | 'physical_energy'
  | 'steady_hands'
  | 'quick_adapting'
  | 'people_connector'
  | 'team_harmony';

export type TraitCategory = 'thinking' | 'doing' | 'connecting';

export type ObservationValue = 'noticed' | 'unsure' | 'not_me';

export interface Trait {
  id: TraitId;
  label: string;
  description: string;
  emoji: string;
  category: TraitCategory;
  prompts: string[]; // "You might notice this when…"
}

export interface TraitObservationData {
  traitId: TraitId;
  observation: ObservationValue;
  contextType?: string | null;
  contextId?: string | null;
}

export interface RoleTraitLink {
  role: string;
  traits: TraitId[];
}

// ---- Observation display config ----

export interface ObservationOption {
  value: ObservationValue;
  label: string;
  emoji: string;
  activeClass: string;
  inactiveClass: string;
}

export const OBSERVATION_OPTIONS: ObservationOption[] = [
  {
    value: 'noticed',
    label: 'I notice this',
    emoji: '✓',
    activeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700',
    inactiveClass: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
  },
  {
    value: 'unsure',
    label: 'Not sure yet',
    emoji: '~',
    activeClass: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700',
    inactiveClass: 'hover:bg-amber-50 dark:hover:bg-amber-900/20',
  },
  {
    value: 'not_me',
    label: 'Not me',
    emoji: '✗',
    activeClass: 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-600',
    inactiveClass: 'hover:bg-slate-50 dark:hover:bg-slate-800/20',
  },
];

// ---- Category display config ----

export const CATEGORY_LABELS: Record<TraitCategory, string> = {
  thinking: 'How you think',
  doing: 'How you get things done',
  connecting: 'How you connect with people',
};

// ---- 12-trait catalog ----

export const TRAIT_CATALOG: Trait[] = [
  // Thinking
  {
    id: 'calm_focus',
    label: 'Calm Focus',
    description: 'You can concentrate on something for a while without getting distracted.',
    emoji: '🧘',
    category: 'thinking',
    prompts: [
      'You might notice this when you lose track of time working on something you care about.',
      'You might notice this when noise around you fades while you focus on a task.',
    ],
  },
  {
    id: 'analytical_thinking',
    label: 'Analytical Thinking',
    description: 'You enjoy breaking problems into smaller parts to understand how things work.',
    emoji: '🔍',
    category: 'thinking',
    prompts: [
      'You might notice this when you ask "why" more than once about the same thing.',
      'You might notice this when you enjoy figuring out how something went wrong.',
    ],
  },
  {
    id: 'patience',
    label: 'Patience',
    description: 'You can stay with a task even when progress feels slow.',
    emoji: '⏳',
    category: 'thinking',
    prompts: [
      'You might notice this when you stick with a tricky problem instead of giving up.',
      'You might notice this when waiting doesn\'t bother you as much as it bothers others.',
    ],
  },
  {
    id: 'creative_spark',
    label: 'Creative Spark',
    description: 'Ideas come to you naturally — you like imagining different possibilities.',
    emoji: '💡',
    category: 'thinking',
    prompts: [
      'You might notice this when you come up with an unusual solution to a problem.',
      'You might notice this when you daydream about how things could be different.',
    ],
  },
  {
    id: 'independent_drive',
    label: 'Independent Drive',
    description: 'You\'re comfortable working things out on your own.',
    emoji: '🧭',
    category: 'thinking',
    prompts: [
      'You might notice this when you prefer to try before asking for help.',
      'You might notice this when you set your own goals without being told to.',
    ],
  },
  {
    id: 'big_picture',
    label: 'Big-Picture View',
    description: 'You tend to step back and think about how everything fits together.',
    emoji: '🌍',
    category: 'thinking',
    prompts: [
      'You might notice this when you see connections between things others miss.',
      'You might notice this when you think about the long-term before acting.',
    ],
  },
  // Doing
  {
    id: 'detail_eye',
    label: 'Eye for Detail',
    description: 'You notice small things that others might overlook.',
    emoji: '🔎',
    category: 'doing',
    prompts: [
      'You might notice this when you spot a typo or mistake before anyone else.',
      'You might notice this when you care about getting things exactly right.',
    ],
  },
  {
    id: 'physical_energy',
    label: 'Physical Energy',
    description: 'You prefer being active and doing things with your hands or body.',
    emoji: '⚡',
    category: 'doing',
    prompts: [
      'You might notice this when sitting still for too long feels uncomfortable.',
      'You might notice this when you learn best by doing rather than reading.',
    ],
  },
  {
    id: 'steady_hands',
    label: 'Steady Hands',
    description: 'You\'re good with careful, precise work — building, fixing, or crafting.',
    emoji: '🛠️',
    category: 'doing',
    prompts: [
      'You might notice this when you enjoy assembling or repairing things.',
      'You might notice this when people ask you to help with hands-on tasks.',
    ],
  },
  {
    id: 'quick_adapting',
    label: 'Quick Adapting',
    description: 'When plans change, you adjust without much stress.',
    emoji: '🔄',
    category: 'doing',
    prompts: [
      'You might notice this when surprises don\'t throw you off track.',
      'You might notice this when you\'re the first to come up with a plan B.',
    ],
  },
  // Connecting
  {
    id: 'people_connector',
    label: 'People Connector',
    description: 'You find it easy to talk to new people and make them feel welcome.',
    emoji: '🤝',
    category: 'connecting',
    prompts: [
      'You might notice this when strangers open up to you easily.',
      'You might notice this when you introduce people who should know each other.',
    ],
  },
  {
    id: 'team_harmony',
    label: 'Team Harmony',
    description: 'You help groups work together smoothly — you notice when someone feels left out.',
    emoji: '🎵',
    category: 'connecting',
    prompts: [
      'You might notice this when you check in on quieter members of a group.',
      'You might notice this when you help resolve disagreements before they escalate.',
    ],
  },
];

// ---- Lookup map ----

export const TRAIT_MAP: Record<TraitId, Trait> = Object.fromEntries(
  TRAIT_CATALOG.map((t) => [t.id, t])
) as Record<TraitId, Trait>;

// ---- Role → trait mappings (10 roles) ----

export const ROLE_TRAIT_LINKS: RoleTraitLink[] = [
  { role: 'Software Developer', traits: ['calm_focus', 'analytical_thinking', 'detail_eye', 'independent_drive'] },
  { role: 'Nurse', traits: ['patience', 'people_connector', 'quick_adapting', 'team_harmony'] },
  { role: 'UX Designer', traits: ['creative_spark', 'people_connector', 'detail_eye', 'big_picture'] },
  { role: 'Electrician', traits: ['steady_hands', 'analytical_thinking', 'detail_eye', 'independent_drive'] },
  { role: 'Teacher', traits: ['patience', 'people_connector', 'creative_spark', 'team_harmony'] },
  { role: 'Paramedic', traits: ['quick_adapting', 'physical_energy', 'calm_focus', 'people_connector'] },
  { role: 'Data Scientist', traits: ['analytical_thinking', 'calm_focus', 'big_picture', 'detail_eye'] },
  { role: 'Project Manager', traits: ['big_picture', 'team_harmony', 'quick_adapting', 'people_connector'] },
  { role: 'Chef', traits: ['creative_spark', 'physical_energy', 'steady_hands', 'quick_adapting'] },
  { role: 'Psychologist', traits: ['patience', 'people_connector', 'analytical_thinking', 'calm_focus'] },
];

// ---- Pattern generation ----

export function generatePatterns(
  observations: Array<{ traitId: TraitId; observation: ObservationValue }>
): string[] {
  if (observations.length === 0) {
    return ['Tap on any trait below to start noticing what feels like you.'];
  }

  const noticed = observations.filter((o) => o.observation === 'noticed');
  const unsure = observations.filter((o) => o.observation === 'unsure');
  const patterns: string[] = [];

  // Single noticed trait
  if (noticed.length === 1) {
    const trait = TRAIT_MAP[noticed[0].traitId];
    if (trait) {
      patterns.push(`You've noticed "${trait.label}" feels like you. That's a great starting point.`);
    }
  }

  // Category clustering
  if (noticed.length >= 2) {
    const categoryCounts: Record<TraitCategory, number> = { thinking: 0, doing: 0, connecting: 0 };
    for (const o of noticed) {
      const trait = TRAIT_MAP[o.traitId];
      if (trait) categoryCounts[trait.category]++;
    }

    if (categoryCounts.thinking >= 2) {
      patterns.push('A pattern is forming around how you think — you seem drawn to reflection and analysis.');
    }
    if (categoryCounts.doing >= 2) {
      patterns.push('A pattern is forming around how you get things done — action and hands-on work seem to suit you.');
    }
    if (categoryCounts.connecting >= 2) {
      patterns.push('A pattern is forming around how you connect with people — relationships and teamwork seem important to you.');
    }
  }

  // Unsure validation
  if (unsure.length >= 2) {
    patterns.push("That's completely normal. These can shift as you gain experience.");
  }

  // Role overlap (3+ noticed)
  if (noticed.length >= 3) {
    const noticedIds = new Set(noticed.map((o) => o.traitId));
    for (const link of ROLE_TRAIT_LINKS) {
      const overlap = link.traits.filter((t) => noticedIds.has(t));
      if (overlap.length >= 2) {
        patterns.push(
          `Some of your noticed traits overlap with what people in ${link.role} roles often draw on. Worth exploring?`
        );
        break; // Only suggest one role at a time
      }
    }
  }

  // Fallback if nothing generated yet
  if (patterns.length === 0 && noticed.length >= 2) {
    patterns.push("You're building a picture of how you work. Keep going — there's no rush.");
  }

  return patterns;
}

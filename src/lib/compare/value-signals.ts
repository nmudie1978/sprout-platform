/**
 * Value Signals — short, neutral "things to consider" for a career.
 *
 * Purpose: help users intuit whether a path actually feels right
 * for them, without asking any questions or filtering anything.
 * Pure exposure — read-only, max 3 bullets, plain language.
 *
 * Resolution order:
 *   1. Per-career manual entries (CAREER_VALUE_SIGNALS)
 *   2. Per-id keyword matches (TITLE_KEYWORD_SIGNALS)
 *   3. Category fallbacks (CATEGORY_VALUE_SIGNALS)
 *
 * Tone rules: neutral, reflective, no moral framing.
 * Length rule: each bullet 8–10 words max.
 */

import { type Career, type CareerCategory, findCareerCategory } from '@/lib/career-pathways';

// ── Per-career manual entries ───────────────────────────────────────

const CAREER_VALUE_SIGNALS: Record<string, string[]> = {
  // ── Healthcare ──
  'doctor': [
    'Emotionally demanding work with patients',
    'Long and intensive training required',
    'High responsibility for life-altering decisions',
  ],
  'surgeon': [
    'Extremely long training and apprenticeship',
    'High-stakes work with little margin for error',
    'Long, irregular hours and on-call duties',
  ],
  'nurse': [
    'Physically and emotionally demanding shifts',
    'Direct daily impact on patients',
    'Shift work including nights and weekends',
  ],
  'paramedic': [
    'Frequent exposure to traumatic incidents',
    'Fast decisions under pressure',
    'Shift work and unpredictable hours',
  ],
  'psychologist': [
    'Sustained focus on others\' emotional weight',
    'Years of training before practising',
    'Strong boundaries needed to avoid burnout',
  ],
  'veterinarian': [
    'Emotional weight of putting animals down',
    'Higher-than-average burnout risk',
    'Mix of medicine, business, and grief support',
  ],

  // ── Public service & military ──
  'police-officer': [
    'Exposure to conflict and danger',
    'Shift work, including nights and weekends',
    'Strict procedures and accountability',
  ],
  'firefighter': [
    'Physically demanding and dangerous work',
    'Long shifts with intense unpredictability',
    'Strong team and trust dependency',
  ],
  'detective': [
    'Long hours on complex investigations',
    'Exposure to difficult or distressing cases',
    'High accountability for case outcomes',
  ],
  'soldier': [
    'May involve combat or conflict situations',
    'Strong discipline and hierarchy required',
    'Long deployments away from home',
  ],
  'infantry-officer': [
    'May involve combat or conflict situations',
    'Responsibility for soldiers\' lives in your unit',
    'Frequent training, deployment, and relocation',
  ],
  'special-forces-operator': [
    'Extremely demanding selection and training',
    'High-risk operations in hostile environments',
    'Long absences from family and civilian life',
  ],
  'sniper': [
    'Direct involvement in lethal operations',
    'Extreme patience and mental discipline required',
    'Significant ethical and psychological weight',
  ],
  'military-pilot': [
    'May involve combat or conflict situations',
    'Strong discipline and hierarchy required',
    'High-pressure decision-making under stress',
  ],
  'drone-operator-uav': [
    'Remote operations with real-world consequences',
    'Long shifts staring at screens',
    'Ethical weight of remote engagements',
  ],
  'naval-officer': [
    'Long deployments away from home',
    'Strict hierarchy and discipline',
    'Strong responsibility for crew safety',
  ],
  'submarine-officer': [
    'Long stretches submerged with no contact',
    'Confined living and working conditions',
    'High discipline and trust in crewmates',
  ],
  'eod-technician': [
    'Direct exposure to explosive hazards',
    'Calm and precision under extreme pressure',
    'Significant personal risk in the role',
  ],
  'cyber-warfare-specialist': [
    'Operations carry geopolitical consequences',
    'High secrecy and clearance requirements',
    'Constantly evolving threats and tools',
  ],
  'search-and-rescue-operator': [
    'Physically and emotionally demanding rescues',
    'Working in dangerous weather and terrain',
    'Direct impact on saving lives',
  ],

  // ── Space ──
  'astronaut': [
    'Extremely competitive selection process',
    'Long academic and physical preparation',
    'High responsibility and isolation risks',
  ],
  'mission-specialist': [
    'Years of training for short missions',
    'Extreme competitiveness for selection',
    'Time away from family during preparation',
  ],
  'spacecraft-pilot': [
    'High-stakes decisions with thin margins',
    'Years of test or military pilot experience',
    'Selection extremely competitive globally',
  ],
  'astrophysicist': [
    'Long PhD and postdoc years',
    'Limited permanent academic positions',
    'Funding cycles drive research direction',
  ],
  'rocket-scientist': [
    'Long training in deep technical fields',
    'Few employers in a niche industry',
    'Pressure of mission-critical engineering',
  ],

  // ── Online creators & influencers ──
  'youtuber': [
    'Income can be unpredictable',
    'Public exposure and online scrutiny',
    'Constant pressure to keep posting',
  ],
  'social-media-influencer': [
    'Income can be unpredictable',
    'Public exposure and online scrutiny',
    'Personal life often becomes content',
  ],
  'vlogger': [
    'Personal life often becomes content',
    'Income depends on platform algorithms',
    'High creative freedom with self-direction',
  ],
  'gaming-streamer': [
    'Long hours streaming for inconsistent income',
    'Audience expectations can be intense',
    'Performance pressure even on bad days',
  ],
  'tiktok-creator': [
    'Trends move fast, attention spans short',
    'Income depends on algorithm shifts',
    'Constant pressure to stay relevant',
  ],
  'instagram-influencer': [
    'Public scrutiny of personal life',
    'Income depends on brand deals',
    'Pressure to maintain a curated image',
  ],
  'live-streamer': [
    'Long unsocial streaming hours',
    'Income depends on viewer support',
    'Public reaction can be intense',
  ],
  'content-creator': [
    'Income can be unpredictable',
    'High creative freedom with self-direction',
    'Constant content cycle pressure',
  ],
  'podcast-host': [
    'Slow audience growth in early years',
    'Most podcasts earn little income',
    'High creative control over your work',
  ],
  'tech-reviewer': [
    'Pressure to stay impartial under sponsorship',
    'Long unboxing and testing hours',
    'Constant flow of new products to cover',
  ],
  'travel-vlogger': [
    'Long stretches living out of a bag',
    'Income unpredictable, especially early',
    'Personal life often becomes content',
  ],
  'fitness-influencer': [
    'Pressure to maintain a public physique',
    'Income depends on brand partnerships',
    'Personal life often becomes content',
  ],
  'food-blogger': [
    'Slow growth and uncertain income',
    'Most income from sponsorships and ads',
    'Long hours testing and shooting',
  ],
  'affiliate-marketer': [
    'Income depends on traffic and conversions',
    'Long lead time before earnings appear',
    'Solo and self-directed work',
  ],
  'dropshipper': [
    'Most ventures fail in the first year',
    'Risk of unhappy customers and refunds',
    'Highly dependent on paid advertising',
  ],

  // ── Trading & finance ──
  'trader': [
    'High pressure and emotional swings',
    'Income tied to performance, not effort',
    'Long hours watching markets',
  ],
  'day-trader': [
    'Most day traders lose money long-term',
    'Highly stressful and isolating work',
    'Income highly unpredictable',
  ],
  'crypto-trader': [
    'Highly volatile and risky markets',
    'Most traders lose money long-term',
    'No regulatory safety net',
  ],
  'forex-trader': [
    'Most retail traders lose money',
    'Markets run nearly 24 hours',
    'Strong discipline required to survive',
  ],
  'options-trader': [
    'Complex risk and time-decay dynamics',
    'High-pressure desk environment',
    'Performance reviewed in real time',
  ],
  'investment-banker': [
    'Notoriously long hours, especially early career',
    'High pressure and tight deadlines',
    'Strong financial reward at senior levels',
  ],
  'hedge-fund-manager': [
    'Performance pressure under public scrutiny',
    'Income highly tied to fund returns',
    'Long hours and constant market awareness',
  ],
  'stockbroker': [
    'Income tied to commission and performance',
    'Constant client and market pressure',
    'Highly regulated industry with strict rules',
  ],
  'wealth-manager': [
    'Building trust with clients takes years',
    'High responsibility for clients\' money',
    'Long-term client relationships matter most',
  ],

  // ── Sport ──
  'professional-athlete': [
    'Career often ends by mid-thirties',
    'High injury risk and physical toll',
    'Performance scrutinised constantly',
  ],
  'footballer': [
    'Only a tiny fraction make it pro',
    'Career often ends by mid-thirties',
    'Public scrutiny of performance and life',
  ],
  'tennis-player': [
    'Travelling solo for most of the year',
    'Most players never break even financially',
    'Career often ends by mid-thirties',
  ],
  'esports-player': [
    'Short careers, often peaking in twenties',
    'High pressure and screen time',
    'Income highly variable across the scene',
  ],

  // ── Hospitality & creative ──
  'chef': [
    'Long, unsocial hours including weekends',
    'High-pressure kitchen environment',
    'Physically demanding and fast-paced',
  ],
  'restaurant-owner': [
    'Most restaurants close within 5 years',
    'Long hours, especially in the first years',
    'Personal finances often tied to business',
  ],
  'film-director': [
    'Long gaps between paid projects',
    'Heavy creative responsibility for outcomes',
    'Industry highly competitive and contact-driven',
  ],
  'cinematographer': [
    'Long hours on irregular project schedules',
    'Reputation built slowly over years',
    'Long stretches between jobs early on',
  ],
  'documentary-filmmaker': [
    'Long projects with uncertain funding',
    'Emotional weight of difficult subjects',
    'Modest income for years of work',
  ],
  'photojournalist': [
    'Exposure to conflict and difficult scenes',
    'Travel to unstable regions sometimes required',
    'Industry shrinking with media changes',
  ],
  'wildlife-photographer': [
    'Long days waiting for the right shot',
    'Often working far from home',
    'Income highly variable',
  ],
  'freelance-photographer': [
    'Income unstable, especially early',
    'Self-directed marketing and admin',
    'Creative freedom over chosen projects',
  ],

  // ── Other notable ──
  'lawyer': [
    'Long hours and high pressure',
    'Adversarial environment in many roles',
    'Emotional weight of clients\' situations',
  ],
  'corporate-lawyer': [
    'Long hours expected at major firms',
    'Tight deadlines under high stakes',
    'Years of training and exam pressure',
  ],
  'startup-founder': [
    'Most startups fail within five years',
    'Long hours and personal financial risk',
    'High personal responsibility for outcomes',
  ],
  'entrepreneur': [
    'Income unpredictable, especially in early years',
    'Personal finances often tied to business',
    'High personal responsibility for outcomes',
  ],
  'consultant': [
    'Frequent travel and long hours',
    'High client expectations and tight deadlines',
    'Constant pressure to win new work',
  ],
  'teacher': [
    'Emotionally demanding with high workload',
    'Direct impact on young people\'s lives',
    'Workload often extends beyond school hours',
  ],
  'primary-school-teacher': [
    'Energy-intensive work with young children',
    'Strong emotional connection with pupils',
    'Workload often extends into evenings',
  ],
  'social-worker': [
    'Emotionally demanding casework',
    'High caseloads and burnout risk',
    'Direct impact on vulnerable people',
  ],

  // ── Drivers ──
  'truck-driver': [
    'Long hours alone on the road',
    'Time away from family',
    'Strict regulations on driving hours',
  ],
  'uber-driver': [
    'Income depends on demand and timing',
    'You cover your own car costs',
    'Highly flexible schedule',
  ],
  'taxi-driver': [
    'Late nights and unpredictable shifts',
    'Income varies with city demand',
    'Independent work with little supervision',
  ],
};

// ── Per-title keyword fallback ──────────────────────────────────────
//
// For careers without an explicit entry, match common title keywords to
// a curated signal set. Keeps the manual list small but still gives
// most niche roles a sensible read.

const TITLE_KEYWORD_SIGNALS: Array<{ matches: RegExp; signals: string[] }> = [
  {
    matches: /trader|broker/i,
    signals: [
      'Income tied to performance, not effort',
      'High pressure and constant market focus',
      'Long hours and intense scrutiny',
    ],
  },
  {
    matches: /military|sergeant|officer.*army|marine|naval|submarine/i,
    signals: [
      'Strong hierarchy and discipline required',
      'Long deployments away from home',
      'May involve combat or conflict situations',
    ],
  },
  {
    matches: /pilot/i,
    signals: [
      'Long, demanding training pathway',
      'High responsibility under pressure',
      'Time away from home for work',
    ],
  },
  {
    matches: /surgeon/i,
    signals: [
      'Extremely long training pathway',
      'High-stakes work with thin margins',
      'Long irregular hours and on-call duties',
    ],
  },
  {
    matches: /influencer|streamer|creator|vlogger|youtuber/i,
    signals: [
      'Income can be unpredictable',
      'Public exposure and online scrutiny',
      'Constant pressure to keep posting',
    ],
  },
  {
    matches: /astronaut|space|orbital/i,
    signals: [
      'Extremely competitive selection',
      'Years of academic and physical preparation',
      'High responsibility under unique pressure',
    ],
  },
  {
    matches: /nurse|paramedic|caregiver/i,
    signals: [
      'Emotionally and physically demanding work',
      'Shift work including nights and weekends',
      'Direct impact on patients\' lives',
    ],
  },
  {
    matches: /teacher|educator|tutor|lecturer/i,
    signals: [
      'Workload often extends beyond classroom hours',
      'Direct impact on young people',
      'Emotional resilience needed daily',
    ],
  },
  {
    matches: /developer|engineer|programmer/i,
    signals: [
      'Long stretches of focused, solo work',
      'Constant pace of new tools and tech',
      'Outputs often invisible to non-technical people',
    ],
  },
];

// ── Category fallbacks ──────────────────────────────────────────────

const CATEGORY_VALUE_SIGNALS: Record<CareerCategory, string[]> = {
  HEALTHCARE_LIFE_SCIENCES: [
    'Emotionally demanding work',
    'Long training required',
    'Direct impact on people\'s lives',
  ],
  EDUCATION_TRAINING: [
    'Workload often extends beyond hours',
    'Emotionally rewarding but tiring',
    'Direct impact on students\' futures',
  ],
  TECHNOLOGY_IT: [
    'Long focused work in front of screens',
    'Constant change in tools and frameworks',
    'Often individual or small-team work',
  ],
  BUSINESS_MANAGEMENT: [
    'Structured corporate environment',
    'Performance and target expectations',
    'Lots of meetings and team coordination',
  ],
  FINANCE_BANKING: [
    'High pressure and long hours',
    'Income tied to results and bonuses',
    'Strict regulations and compliance',
  ],
  SALES_MARKETING: [
    'Income often tied to performance',
    'High customer and target pressure',
    'Constant cycle of campaigns and pitches',
  ],
  MANUFACTURING_ENGINEERING: [
    'Often technical and detail-driven',
    'Strong safety and process culture',
    'Mix of office and on-site work',
  ],
  LOGISTICS_TRANSPORT: [
    'Tight schedules and time pressure',
    'Long hours on the move',
    'Operations run around the clock',
  ],
  HOSPITALITY_TOURISM: [
    'Long, unsocial hours including weekends',
    'High customer-facing energy required',
    'Physically demanding and fast-paced',
  ],
  TELECOMMUNICATIONS: [
    'Highly technical and specialised',
    'Constant change in network technology',
    'Mix of project work and on-call',
  ],
  CREATIVE_MEDIA: [
    'Income can be unstable',
    'High creative freedom and self-direction',
    'Periods of intensive deadline pressure',
  ],
  PUBLIC_SERVICE_SAFETY: [
    'Exposure to difficult or distressing situations',
    'Strict procedures and accountability',
    'Direct service to the community',
  ],
  MILITARY_DEFENCE: [
    'Strict hierarchy and rules of engagement',
    'Long deployments away from home',
    'Physical and mental demands throughout your career',
  ],
  SPORT_FITNESS: [
    'Physically demanding and energy-intensive',
    'Career length often shorter than average',
    'Strong client and performance focus',
  ],
  REAL_ESTATE_PROPERTY: [
    'Income often commission-based',
    'Building reputation takes years',
    'Long working hours including weekends',
  ],
  SOCIAL_CARE_COMMUNITY: [
    'Emotionally demanding casework',
    'High caseloads and burnout risk',
    'Direct impact on vulnerable people',
  ],
  CONSTRUCTION_TRADES: [
    'Physically demanding and outdoor work',
    'Strong safety culture on site',
    'Variable hours depending on project',
  ],
};

// ── Public API ──────────────────────────────────────────────────────

const MAX_SIGNALS = 3;

/**
 * Get up to 3 short, neutral "things to consider" bullets for a career.
 * Resolution: per-career → keyword → category fallback → empty.
 */
export function getValueSignals(career: Career): string[] {
  // 1. Per-career manual entry
  const manual = CAREER_VALUE_SIGNALS[career.id];
  if (manual && manual.length > 0) {
    return manual.slice(0, MAX_SIGNALS);
  }

  // 2. Title keyword fallback
  for (const { matches, signals } of TITLE_KEYWORD_SIGNALS) {
    if (matches.test(career.title) || matches.test(career.id)) {
      return signals.slice(0, MAX_SIGNALS);
    }
  }

  // 3. Category fallback
  const cat = findCareerCategory(career.id);
  if (cat) {
    return CATEGORY_VALUE_SIGNALS[cat].slice(0, MAX_SIGNALS);
  }

  // 4. Generic — should rarely trigger
  return [
    'Every career has trade-offs to consider',
    'Talk to someone in the role if you can',
    'Try shadowing or work experience first',
  ];
}

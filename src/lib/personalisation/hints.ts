/**
 * PERSONALISATION HINTS ENGINE — Netflix-style
 *
 * Produces short "because you..." labels that explain WHY content
 * is relevant to the user. Attached inline to events, dashboard
 * cards, and journey steps.
 *
 * Examples:
 *   "Because you live in Trondheim"
 *   "Because you're exploring AI/ML careers"
 *   "Recommended for your engineering goal"
 *   "Near you — Bergen"
 */

// ============================================
// USER CONTEXT
// ============================================

export interface PersonalisationContext {
  city: string | null;
  age: number | null;
  goalTitle: string | null;
  strengths: string[];
  interests: string[];
  motivations: string[];
  workStyle: string[];
  exploredRoles: string[];
  journeyStage: 'discover' | 'understand' | 'act' | null;
  completedJobsCount: number;
}

// ============================================
// SIGNAL LABEL OUTPUT
// ============================================

export interface SignalLabel {
  text: string;
  reason: string; // internal key for dedup/tracking
  score: number;  // 0-100 relevance
}

// ============================================
// EVENT LABELS
// ============================================

interface EventData {
  title: string;
  city: string | null;
  category: string;
  format: string;
  description?: string;
}

export function getEventLabels(ctx: PersonalisationContext, event: EventData): SignalLabel[] {
  const labels: SignalLabel[] = [];
  const eventCityLower = event.city?.toLowerCase() ?? '';
  const userCityLower = ctx.city?.toLowerCase() ?? '';
  const goalLower = ctx.goalTitle?.toLowerCase() ?? '';
  const eventText = `${event.title} ${event.description ?? ''}`.toLowerCase();

  // Exact city match
  if (userCityLower && eventCityLower === userCityLower) {
    labels.push({ text: `Near you — ${event.city}`, reason: 'city-match', score: 95 });
  }

  // Same region (both Norwegian cities)
  if (userCityLower && eventCityLower && userCityLower !== eventCityLower && isBothNorwegian(ctx.city, event.city)) {
    labels.push({ text: `In Norway, not far from ${ctx.city}`, reason: 'region-match', score: 60 });
  }

  // Goal keyword match
  if (goalLower) {
    const goalWords = goalLower.split(/\s+/).filter((w) => w.length > 3);
    const matched = goalWords.find((w) => eventText.includes(w));
    if (matched) {
      labels.push({ text: `Recommended for your ${ctx.goalTitle} goal`, reason: 'goal-match', score: 90 });
    }
  }

  // Interest match
  for (const interest of ctx.interests) {
    if (interest.length > 2 && eventText.includes(interest.toLowerCase())) {
      labels.push({ text: `Because you're interested in ${interest}`, reason: 'interest-match', score: 80 });
      break;
    }
  }

  // Explored role match
  for (const role of ctx.exploredRoles) {
    const roleWords = role.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    if (roleWords.some((w) => eventText.includes(w))) {
      labels.push({ text: `Because you've explored ${role}`, reason: 'role-match', score: 85 });
      break;
    }
  }

  // Stage-based
  if (ctx.journeyStage === 'discover' && (event.category === 'Job Fair' || event.category === 'Conference')) {
    labels.push({ text: "Great for exploring career options", reason: 'stage-discover', score: 50 });
  }
  if (ctx.journeyStage === 'act' && event.category === 'Job Fair') {
    labels.push({ text: "You're ready to take action — go meet employers", reason: 'stage-act', score: 55 });
  }

  // Online accessibility
  if (event.format === 'Online') {
    labels.push({ text: "Join from anywhere — it's online", reason: 'online', score: 30 });
  }

  return labels.sort((a, b) => b.score - a.score);
}

// ============================================
// DASHBOARD LABELS
// ============================================

export function getDashboardLabels(ctx: PersonalisationContext): SignalLabel[] {
  const labels: SignalLabel[] = [];

  if (ctx.strengths.length > 0 && ctx.goalTitle) {
    labels.push({ text: `Because ${ctx.strengths[0]} is key for ${ctx.goalTitle}`, reason: 'strength-goal', score: 90 });
  }

  if (ctx.motivations.length > 0) {
    labels.push({ text: `Because "${ctx.motivations[0]}" drives you`, reason: 'motivation', score: 80 });
  }

  if (ctx.completedJobsCount > 0) {
    labels.push({ text: `Based on your ${ctx.completedJobsCount} completed job${ctx.completedJobsCount > 1 ? 's' : ''}`, reason: 'jobs', score: 75 });
  }

  if (ctx.city) {
    labels.push({ text: `Opportunities near ${ctx.city}`, reason: 'city', score: 60 });
  }

  if (ctx.journeyStage === 'discover') {
    labels.push({ text: "Because you're still exploring", reason: 'stage', score: 50 });
  } else if (ctx.journeyStage === 'understand') {
    labels.push({ text: "Because you're researching your path", reason: 'stage', score: 50 });
  } else if (ctx.journeyStage === 'act') {
    labels.push({ text: "Because you're ready to take action", reason: 'stage', score: 50 });
  }

  if (!ctx.goalTitle) {
    labels.push({ text: "Popular with explorers like you", reason: 'no-goal', score: 40 });
  }

  return labels.sort((a, b) => b.score - a.score);
}

// ============================================
// JOURNEY LABELS
// ============================================

export function getJourneyLabels(ctx: PersonalisationContext): SignalLabel[] {
  const labels: SignalLabel[] = [];

  if (ctx.journeyStage === 'discover') {
    if (ctx.strengths.length === 0) {
      labels.push({ text: "Start here — understanding your strengths changes everything", reason: 'no-strengths', score: 90 });
    } else if (!ctx.goalTitle) {
      labels.push({ text: `Because you've identified ${ctx.strengths.length} strengths — now set a direction`, reason: 'strengths-no-goal', score: 85 });
    }
  }

  if (ctx.journeyStage === 'understand' && ctx.goalTitle) {
    labels.push({ text: `Because you're researching what ${ctx.goalTitle} really involves`, reason: 'understand-goal', score: 85 });
  }

  if (ctx.journeyStage === 'act' && ctx.goalTitle) {
    labels.push({ text: `Because you know what you want — time to go for it`, reason: 'act-ready', score: 85 });
  }

  if (ctx.exploredRoles.length > 0) {
    labels.push({ text: `Because you've explored ${ctx.exploredRoles[0]}`, reason: 'explored', score: 70 });
  }

  if (ctx.age !== null && ctx.age <= 16) {
    labels.push({ text: "You're ahead of most people your age", reason: 'young', score: 55 });
  }

  return labels.sort((a, b) => b.score - a.score);
}

// ============================================
// HELPERS
// ============================================

const NORWAY_CITIES = new Set(['oslo', 'bergen', 'trondheim', 'stavanger', 'tromsø', 'kristiansand', 'drammen', 'fredrikstad', 'bodø', 'ålesund', 'sandnes', 'lillestrøm', 'arendal']);

function isBothNorwegian(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  return NORWAY_CITIES.has(a.toLowerCase()) && NORWAY_CITIES.has(b.toLowerCase());
}

/** Pick the single most relevant label. */
export function pickLabel(labels: SignalLabel[]): SignalLabel | null {
  return labels[0] ?? null;
}

/** Pick top N labels, deduplicated by reason. */
export function pickLabels(labels: SignalLabel[], max: number = 2): SignalLabel[] {
  const seen = new Set<string>();
  const result: SignalLabel[] = [];
  for (const label of labels) {
    if (seen.has(label.reason)) continue;
    seen.add(label.reason);
    result.push(label);
    if (result.length >= max) break;
  }
  return result;
}

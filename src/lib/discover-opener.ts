/**
 * Builds the role-overview opener shown at the top of the My Journey → Discover
 * tab. The opener is job-first: it leads with what the role actually does (the
 * essence), then who it suits (character), then a short demand/growth note.
 *
 * Previously the opener was assembled purely from the `whoThisIsGoodFor`
 * personality traits, so every career read as a personality description with no
 * mention of the work itself. This helper promotes the per-career `description`
 * (the "what") to lead the sentence, falling back gracefully when data is
 * missing so nothing ever renders worse than before.
 */

export interface DiscoverOpenerInput {
  /** The career's one-line "what the job does" description. */
  description?: string | null;
  /** Personality/character traits — "who thrives in this role". */
  whoThisIsGoodFor?: string[] | null;
  /** Growth outlook: 'high' | 'medium' | anything else (treated as stable). */
  growthOutlook?: string | null;
}

/**
 * Map of common 3rd-person / base verbs that traits start with, to their base
 * form, so a verb-initial trait ("Enjoys solving problems") can be turned into a
 * grammatical relative clause ("people who enjoy solving problems").
 */
const VERB_BASE: Record<string, string> = {
  enjoys: 'enjoy', enjoy: 'enjoy',
  loves: 'love', love: 'love',
  likes: 'like', like: 'like',
  has: 'have', have: 'have',
  wants: 'want', want: 'want',
  needs: 'need', need: 'need',
  values: 'value', value: 'value',
  thrives: 'thrive', thrive: 'thrive',
  cares: 'care', care: 'care',
  prefers: 'prefer', prefer: 'prefer',
  stays: 'stay', stay: 'stay',
  works: 'work', work: 'work',
  notices: 'notice', notice: 'notice',
  seeks: 'seek', seek: 'seek',
  craves: 'crave', crave: 'crave',
  embraces: 'embrace', embrace: 'embrace',
  appreciates: 'appreciate', appreciate: 'appreciate',
  handles: 'handle', handle: 'handle',
  solves: 'solve', solve: 'solve',
  helps: 'help', help: 'help',
  leads: 'lead', lead: 'lead',
  learns: 'learn', learn: 'learn',
  adapts: 'adapt', adapt: 'adapt',
  spots: 'spot', spot: 'spot',
};

/** Lowercase only the first character (leave the rest, e.g. acronyms, intact). */
function lcFirst(s: string): string {
  return s.length ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

/**
 * Normalise a trait into a grammatical fragment that reads naturally after
 * "It suits …" / "This role suits …". Traits are authored in heterogeneous
 * forms (noun phrases, adjective phrases, "People who …" clauses, and
 * 3rd-person verb phrases), so we adapt by form:
 *
 *  - "People who …" / "Those who …" (subject-relative) → kept verbatim.
 *  - Verb-initial ("Enjoys solving …")               → "people who enjoy solving …".
 *  - Contains an embedded "who" ("hands-on people who …") → kept verbatim (it is
 *    already a complete noun phrase; prefixing would double up).
 *  - Otherwise (noun/adjective phrase)               → "people who are …".
 */
function normalizeTrait(raw: string): string {
  const t = raw.replace(/[.,;:!]+$/g, '').trim();
  if (!t) return '';

  // Verb-initial — rebuild as a relative clause with the base verb form.
  const firstWord = t.split(/\s+/)[0];
  const base = VERB_BASE[firstWord.toLowerCase()];
  if (base) {
    const rest = t.slice(firstWord.length).trim();
    return rest ? `people who ${base} ${rest}` : `people who ${base}`;
  }

  // Trait already carries its own subject — a leading person pronoun
  // ("Those comfortable …"), an embedded relative clause ("hands-on people
  // who …"), or a person head-noun ("organised, methodical people"). Prefixing
  // "people who are" would double the subject, so keep it verbatim.
  const leadsWithSubject = /^(people|those|someone|anyone|individuals|persons?|folks)\b/i.test(t);
  const hasRelativeClause = /\bwho\b/i.test(t);
  const hasPersonNoun = /\b(people|individuals|persons?|folks)\b/i.test(t);
  if (leadsWithSubject || hasRelativeClause || hasPersonNoun) {
    return lcFirst(t);
  }

  // Plain noun or adjective phrase.
  return `people who are ${lcFirst(t)}`;
}

/**
 * Extract the first sentence of a description.
 *
 * Splits on the first sentence-ending period followed by whitespace (`. `).
 * This deliberately ignores em-dashes (` — `) and inline decimals, since those
 * are not "period + space" and should not be treated as sentence boundaries.
 * If there is no such break, the whole (trimmed) description is used. A trailing
 * period is guaranteed.
 */
function firstSentence(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) return '';
  const idx = trimmed.search(/\.\s/);
  let sentence = idx === -1 ? trimmed : trimmed.slice(0, idx + 1);
  sentence = sentence.trim();
  if (!/[.!?]$/.test(sentence)) sentence += '.';
  return sentence;
}

function growthSuffix(growthOutlook?: string | null): string {
  if (growthOutlook === 'high') return 'Demand is high and growing.';
  if (growthOutlook === 'medium') return 'The field is growing steadily.';
  return 'This is a stable career.';
}

export function buildDiscoverOpener(input: DiscoverOpenerInput): string {
  const traits = (input.whoThisIsGoodFor ?? [])
    .map(normalizeTrait)
    .filter(Boolean)
    .slice(0, 2);

  const character =
    traits.length === 2 ? `${traits[0]} and ${traits[1]}` :
    traits.length === 1 ? traits[0] :
    '';

  const essence = input.description ? firstSentence(input.description) : '';

  const parts: string[] = [];

  if (essence) {
    parts.push(essence);
    // Essence has already named the role, so the character clause reads "It suits …".
    if (character) parts.push(`It suits ${character}.`);
  } else if (character) {
    // No description available — name the role generically up front.
    parts.push(`This role suits ${character}.`);
  }

  parts.push(growthSuffix(input.growthOutlook));

  return parts.join(' ');
}

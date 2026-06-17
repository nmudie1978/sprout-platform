/**
 * Career Twin — PROACTIVE opener.
 *
 * Builds the warm, personalised first line the Twin says when it opens, so it
 * feels like a companion who's been paying attention rather than a blank
 * chatbot. The opener is DETERMINISTIC and template-based — built purely from
 * already-loaded context (recently explored/saved careers, the active goal,
 * journey stage, returning-after-a-gap). This means:
 *   - zero extra OpenAI cost (no AI call on Twin open),
 *   - instant, and
 *   - it can never hallucinate a career the user hasn't actually touched.
 *
 * It always references REAL data. When the user has no activity yet (a brand
 * new user), it returns null so the caller falls back to the existing generic
 * persona intro and nothing breaks.
 *
 * Localised: the deterministic strings are provided per language (English,
 * Norwegian, Spanish) so a NO/ES user is greeted in their own language — the
 * caller passes the lang derived from the NEXT_LOCALE cookie.
 *
 * Kept free of Prisma/React so it stays pure and unit-testable.
 */
import type { TwinRecentActivity, CareerTwinCareerContext } from "./types";
import { isReturningAfterGap } from "./memory";

export type TwinLang = "en" | "no" | "es" | "sv" | "da";

/** Map a NEXT_LOCALE value to the Twin's deterministic-string language. */
export function localeToTwinLang(locale?: string | null): TwinLang {
  if (locale === "nb-NO") return "no";
  if (locale === "es") return "es";
  if (locale === "sv") return "sv";
  if (locale === "da") return "da";
  return "en";
}

export interface ProactiveOpener {
  /** The warm opening line in the Twin's "future self" voice. */
  text: string;
  /** Optional single gentle reflective question to offer alongside the opener. */
  question: string | null;
}

interface OpenerStrings {
  /** List conjunction ("and" / "og" / "y"). */
  and: string;
  /** Journey-stage phrase, woven into the opener as "${stage}". */
  stage: { clarity: string; understand: string; discover: string };
  returning: (career: string) => ProactiveOpener;
  multiOther: (names: string, career: string, first: string) => ProactiveOpener;
  oneOther: (names: string, career: string, first: string) => ProactiveOpener;
  activeGoal: (career: string, stage: string | null) => ProactiveOpener;
  stageOnly: (stage: string, career: string) => ProactiveOpener;
}

const STRINGS: Record<TwinLang, OpenerStrings> = {
  en: {
    and: "and",
    stage: {
      clarity: "you're getting closer to a decision",
      understand: "you've been digging into how it really works",
      discover: "you've been exploring what this path is like",
    },
    returning: (career) => ({
      text:
        `It's been a little while since we last talked — I've still been here, living the ${career} version of your future. ` +
        `Want to pick up where we left off?`,
      question: "What's been on your mind about this path lately?",
    }),
    multiOther: (names, career, first) => ({
      text:
        `I noticed you've been weighing up ${names} as well as ${career} lately. ` +
        `I'm the ${career} version of you — happy to talk through how this one really compares.`,
      question: `Want to start with how ${career} stacks up against ${first}?`,
    }),
    oneOther: (names, career, first) => ({
      text:
        `I noticed you've also been exploring ${names} recently. ` +
        `I'm here as the ${career} version of your future — ask me how the two compare, or anything about this path.`,
      question: `Curious how ${career} and ${first} differ day to day?`,
    }),
    activeGoal: (career, stage) => ({
      text:
        `${career} is your focus right now — and I'm the version of you who's already living it. ` +
        (stage ? `Looks like ${stage}. ` : "") +
        `Ask me what it really takes, or what I'd do next if I were you again.`,
      question: "What's the one thing you most want to know before committing?",
    }),
    stageOnly: (stage, career) => ({
      text:
        `I can tell ${stage} with ${career}. ` +
        `I'm the version of you a few years into it — ask me what the study and the work are really like.`,
      question: "Where would you like to start?",
    }),
  },
  no: {
    and: "og",
    stage: {
      clarity: "du nærmer deg en avgjørelse",
      understand: "du har gravd i hvordan det egentlig fungerer",
      discover: "du har utforsket hvordan denne veien er",
    },
    returning: (career) => ({
      text:
        `Det er en stund siden vi snakket sist — jeg har fortsatt vært her og levd den ${career}-versjonen av fremtiden din. ` +
        `Vil du ta opp tråden der vi slapp?`,
      question: "Hva har du tenkt mest på rundt denne veien i det siste?",
    }),
    multiOther: (names, career, first) => ({
      text:
        `Jeg la merke til at du har vurdert ${names} i tillegg til ${career} i det siste. ` +
        `Jeg er ${career}-versjonen av deg — snakker gjerne om hvordan denne faktisk står seg.`,
      question: `Vil du begynne med hvordan ${career} står seg mot ${first}?`,
    }),
    oneOther: (names, career, first) => ({
      text:
        `Jeg la merke til at du også har utforsket ${names} nylig. ` +
        `Jeg er her som ${career}-versjonen av fremtiden din — spør meg hvordan de to sammenlignes, eller hva som helst om denne veien.`,
      question: `Nysgjerrig på hvordan ${career} og ${first} skiller seg i hverdagen?`,
    }),
    activeGoal: (career, stage) => ({
      text:
        `${career} er fokuset ditt akkurat nå — og jeg er versjonen av deg som allerede lever det. ` +
        (stage ? `Det ser ut som ${stage}. ` : "") +
        `Spør meg hva det faktisk krever, eller hva jeg ville gjort videre om jeg var deg igjen.`,
      question: "Hva er den ene tingen du mest vil vite før du bestemmer deg?",
    }),
    stageOnly: (stage, career) => ({
      text:
        `Jeg merker at ${stage} med ${career}. ` +
        `Jeg er versjonen av deg noen år inn i det — spør meg hvordan studiene og jobben egentlig er.`,
      question: "Hvor vil du begynne?",
    }),
  },
  es: {
    and: "y",
    stage: {
      clarity: "te estás acercando a una decisión",
      understand: "has estado investigando cómo funciona de verdad",
      discover: "has estado explorando cómo es este camino",
    },
    returning: (career) => ({
      text:
        `Ha pasado un tiempo desde que hablamos — he seguido aquí, viviendo la versión ${career} de tu futuro. ` +
        `¿Retomamos donde lo dejamos?`,
      question: "¿Qué has estado pensando sobre este camino últimamente?",
    }),
    multiOther: (names, career, first) => ({
      text:
        `Noté que has estado sopesando ${names} además de ${career} últimamente. ` +
        `Soy la versión ${career} de ti — encantado de hablar de cómo se compara de verdad.`,
      question: `¿Empezamos por cómo se compara ${career} con ${first}?`,
    }),
    oneOther: (names, career, first) => ({
      text:
        `Noté que también has estado explorando ${names} hace poco. ` +
        `Estoy aquí como la versión ${career} de tu futuro — pregúntame cómo se comparan o lo que quieras sobre este camino.`,
      question: `¿Te interesa cómo se diferencian ${career} y ${first} en el día a día?`,
    }),
    activeGoal: (career, stage) => ({
      text:
        `${career} es tu foco ahora mismo — y soy la versión de ti que ya lo está viviendo. ` +
        (stage ? `Parece que ${stage}. ` : "") +
        `Pregúntame qué hace falta de verdad, o qué haría yo a continuación si fuera tú otra vez.`,
      question: "¿Cuál es la única cosa que más quieres saber antes de decidir?",
    }),
    stageOnly: (stage, career) => ({
      text:
        `Noto que ${stage} con ${career}. ` +
        `Soy la versión de ti unos años más adelante — pregúntame cómo son de verdad los estudios y el trabajo.`,
      question: "¿Por dónde te gustaría empezar?",
    }),
  },
  sv: {
    and: "och",
    stage: {
      clarity: "du närmar dig ett beslut",
      understand: "du har grävt i hur det egentligen fungerar",
      discover: "du har utforskat hur den här vägen är",
    },
    returning: (career) => ({
      text:
        `Det var ett tag sedan vi pratade sist — jag har fortfarande varit här och levt ${career}-versionen av din framtid. ` +
        `Vill du ta vid där vi slutade?`,
      question: "Vad har du funderat mest på kring den här vägen på sistone?",
    }),
    multiOther: (names, career, first) => ({
      text:
        `Jag märkte att du har vägt ${names} mot ${career} på sistone. ` +
        `Jag är ${career}-versionen av dig — pratar gärna om hur den här faktiskt står sig.`,
      question: `Vill du börja med hur ${career} står sig mot ${first}?`,
    }),
    oneOther: (names, career, first) => ({
      text:
        `Jag märkte att du också har utforskat ${names} nyligen. ` +
        `Jag är här som ${career}-versionen av din framtid — fråga mig hur de två jämförs, eller vad som helst om den här vägen.`,
      question: `Nyfiken på hur ${career} och ${first} skiljer sig i vardagen?`,
    }),
    activeGoal: (career, stage) => ({
      text:
        `${career} är ditt fokus just nu — och jag är versionen av dig som redan lever det. ` +
        (stage ? `Det ser ut som att ${stage}. ` : "") +
        `Fråga mig vad det faktiskt kräver, eller vad jag skulle göra härnäst om jag var du igen.`,
      question: "Vad är den enda sak du mest vill veta innan du bestämmer dig?",
    }),
    stageOnly: (stage, career) => ({
      text:
        `Jag märker att ${stage} med ${career}. ` +
        `Jag är versionen av dig några år in i det — fråga mig hur studierna och jobbet egentligen är.`,
      question: "Var vill du börja?",
    }),
  },
  da: {
    and: "og",
    stage: {
      clarity: "du nærmer dig en beslutning",
      understand: "du har gravet i, hvordan det egentlig fungerer",
      discover: "du har udforsket, hvordan denne vej er",
    },
    returning: (career) => ({
      text:
        `Det er et stykke tid siden, vi sidst talte — jeg har stadig været her og levet ${career}-versionen af din fremtid. ` +
        `Vil du tage fat, hvor vi slap?`,
      question: "Hvad har du tænkt mest på om denne vej på det seneste?",
    }),
    multiOther: (names, career, first) => ({
      text:
        `Jeg lagde mærke til, at du har vejet ${names} op mod ${career} på det seneste. ` +
        `Jeg er ${career}-versionen af dig — taler gerne om, hvordan denne faktisk står sig.`,
      question: `Vil du starte med, hvordan ${career} står sig mod ${first}?`,
    }),
    oneOther: (names, career, first) => ({
      text:
        `Jeg lagde mærke til, at du også har udforsket ${names} for nylig. ` +
        `Jeg er her som ${career}-versionen af din fremtid — spørg mig, hvordan de to sammenlignes, eller hvad som helst om denne vej.`,
      question: `Nysgerrig på, hvordan ${career} og ${first} adskiller sig i hverdagen?`,
    }),
    activeGoal: (career, stage) => ({
      text:
        `${career} er dit fokus lige nu — og jeg er versionen af dig, der allerede lever det. ` +
        (stage ? `Det ser ud som ${stage}. ` : "") +
        `Spørg mig, hvad det faktisk kræver, eller hvad jeg ville gøre som det næste, hvis jeg var dig igen.`,
      question: "Hvad er den ene ting, du mest vil vide, før du beslutter dig?",
    }),
    stageOnly: (stage, career) => ({
      text:
        `Jeg kan mærke, at ${stage} med ${career}. ` +
        `Jeg er versionen af dig nogle år inde i det — spørg mig, hvordan studiet og arbejdet egentlig er.`,
      question: "Hvor vil du gerne starte?",
    }),
  },
};

/** Format a list of titles as "A", "A {and} B", or "A, B {and} C". */
function joinTitles(titles: string[], and: string): string {
  const t = titles.filter(Boolean);
  if (t.length === 0) return "";
  if (t.length === 1) return t[0];
  if (t.length === 2) return `${t[0]} ${and} ${t[1]}`;
  return `${t.slice(0, -1).join(", ")} ${and} ${t[t.length - 1]}`;
}

/** Localised phrase for where the user is in their journey, or null. */
function stagePhrase(stage: string | null, s: OpenerStrings): string | null {
  if (!stage) return null;
  const lc = stage.toLowerCase();
  if (lc.includes("clarity")) return s.stage.clarity;
  if (lc.includes("understand")) return s.stage.understand;
  if (lc.includes("discover")) return s.stage.discover;
  return null;
}

/**
 * Build the proactive opener from real recent activity, in `lang`.
 *
 * Priority (matches the route's intent):
 *   1. Returning after a long gap → lead with a warm "it's been a while".
 *   2. Recently explored/saved OTHER careers → reference them by name and
 *      offer to compare with this one.
 *   3. Active goal / journey stage with no other recent careers → acknowledge
 *      where they are.
 *   4. Nothing real to reference → return null (caller uses the generic intro).
 */
export function buildProactiveOpener(
  career: CareerTwinCareerContext,
  activity: TwinRecentActivity | null,
  lang: TwinLang = "en",
): ProactiveOpener | null {
  if (!activity) return null;

  const s = STRINGS[lang] ?? STRINGS.en;
  const careerTitle = career.title;
  // Other careers the user touched recently (the active one is already excluded
  // upstream, but guard again so we never echo it back as "recent").
  const others = activity.recentCareers
    .filter((c) => c.careerId !== activity.activeCareerId && c.title && c.title !== careerTitle)
    .slice(0, 2);
  const returning = isReturningAfterGap(activity.daysSinceLastVisit);

  // 1) Returning after a gap — warmest re-entry, anchored to this career.
  if (returning) return s.returning(careerTitle);

  // 2) Recently explored/saved OTHER careers — the "I've noticed you've been
  //    looking at X and Y" companion moment.
  if (others.length > 0) {
    const names = joinTitles(others.map((c) => c.title), s.and);
    return others.length >= 2
      ? s.multiOther(names, careerTitle, others[0].title)
      : s.oneOther(names, careerTitle, others[0].title);
  }

  // 3) An active goal or a known journey stage to acknowledge.
  const stage = stagePhrase(activity.journeyStage, s);
  if (activity.activeGoalTitle && activity.activeGoalTitle === careerTitle) {
    return s.activeGoal(careerTitle, stage);
  }
  if (stage) return s.stageOnly(stage, careerTitle);

  // 4) Nothing real to reference — let the caller use the generic intro.
  return null;
}

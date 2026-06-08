// src/lib/career-specialisms.ts
//
// Career specialism BRANCHES.
//
// Some careers are a shared trunk that branches into specialisms only reached
// *after* the core training. A child/educational psychologist and a prison
// (forensic) psychologist walk the same early pathway — psychology degree →
// doctorate/specialisation → registration — then diverge. Those branches are
// NOT separate discovery units a 15–23-year-old picks between at the start, so
// they don't belong in the careers list. They belong here, surfaced inline in
// the Understand tab as "Where This Can Lead".
//
// DESIGN RULES (see docs/superpowers/specs/2026-06-08-career-specialisms-design.md):
//   • A branch carries ONLY what genuinely differs from its base career: the
//     setting, a one-line blurb, the day-to-day, and the extra specialisation
//     step. Salary / skills / education are INHERITED from the base career.
//   • Do NOT add salary/skills/education fields to a branch. Divergent
//     duplicates are exactly what the career-data integrity guard exists to
//     catch — keep the single source of truth on the base career.
//   • No dated statistics in this content (keeps the research-recency CI guard
//     happy — this is slow-drift, not live data).
//   • The map is generic: any base career id may declare branches. Only
//     psychology + forensic are populated in this first cut.

export interface Specialism {
  /** Unique within a base career, e.g. "forensic-psychology". */
  id: string;
  /** Display title, e.g. "Forensic Psychologist". */
  title: string;
  /** Where this branch typically works, e.g. "Prisons, secure units, courts". */
  setting: string;
  /** One calm sentence — what this branch actually is. */
  blurb: string;
  /** 3–5 items — the branch's real daily reality (what differs from the base). */
  dayToDay: string[];
  /** The extra training needed to reach this branch AFTER the base degree. */
  specialisationStep: string;
  /**
   * Set when this branch is ALSO a standalone career in the careers list. The
   * UI links out to that career (/careers?open=<id>) instead of expanding.
   */
  linksToCareerId?: string;
}

// base career id → its specialism branches
const SPECIALISMS: Record<string, Specialism[]> = {
  psychologist: [
    {
      id: "clinical-psychology",
      title: "Clinical Psychologist",
      setting: "Hospitals, mental-health services, clinics",
      blurb:
        "Assesses and treats people of all ages living with diagnosed mental-health conditions — from anxiety and depression to trauma.",
      dayToDay: [
        "Run one-to-one therapy and assessment sessions",
        "Write up formulations and treatment plans",
        "Work alongside doctors, nurses and social workers",
        "Review progress and adjust the approach",
      ],
      specialisationStep:
        "After the psychology degree, train through a clinical psychology doctorate with supervised clinical placements, then register as a psychologist.",
    },
    {
      id: "child-educational-psychology",
      title: "Child & Educational Psychologist",
      setting: "Schools, family services, children's clinics",
      blurb:
        "Supports children's learning, development and wellbeing — working with families, teachers and young people themselves.",
      dayToDay: [
        "Observe and assess children in classrooms",
        "Advise teachers and parents on support strategies",
        "Run sessions on learning, behaviour and emotions",
        "Contribute to support plans for additional needs",
      ],
      specialisationStep:
        "After the psychology degree, train through an educational/child psychology doctorate with supervised practice in schools and child services.",
    },
    {
      id: "forensic-psychology",
      title: "Forensic Psychologist",
      setting: "Prisons, secure units, courts, probation services",
      blurb:
        "Works with people in the justice system — assessing risk, supporting rehabilitation, and advising courts.",
      dayToDay: [
        "Assess and support people in custody",
        "Run offending-behaviour and rehabilitation programmes",
        "Write risk and court reports",
        "Advise prison and probation staff",
      ],
      specialisationStep:
        "After the psychology degree, complete a forensic psychology master's plus supervised practice in a justice setting, then register.",
    },
    {
      id: "counselling-psychology",
      title: "Counselling Psychologist",
      setting: "Clinics, private practice, community services",
      blurb:
        "Helps people work through life challenges, relationships and distress using talking therapies.",
      dayToDay: [
        "Hold regular therapy sessions",
        "Build trusting, longer-term client relationships",
        "Tailor the therapeutic approach to each person",
        "Keep careful, confidential notes",
      ],
      specialisationStep:
        "After the psychology degree, train via a counselling psychology doctorate or an accredited therapy route, with supervised client hours.",
    },
    {
      id: "sports-psychology",
      title: "Sports Psychologist",
      setting: "Clubs, academies, performance centres",
      blurb:
        "Helps athletes and performers build focus, resilience and motivation under pressure.",
      dayToDay: [
        "Coach athletes on focus and mindset",
        "Build routines for handling pressure",
        "Work with coaches on team culture",
        "Track wellbeing across a season",
      ],
      specialisationStep:
        "After the psychology degree, specialise in sport and performance psychology with accreditation.",
      linksToCareerId: "sports-psychologist",
    },
  ],

  "forensic-scientist": [
    {
      id: "forensic-toxicology",
      title: "Forensic Toxicologist",
      setting: "Forensic labs, coroner and medical-examiner services",
      blurb:
        "Analyses blood and tissue samples for drugs, alcohol and poisons to help explain deaths and crimes.",
      dayToDay: [
        "Prepare and run lab analyses on samples",
        "Interpret results against case details",
        "Write findings into formal reports",
        "Occasionally give evidence as an expert witness",
      ],
      specialisationStep:
        "After a chemistry, biology or forensic science degree, specialise in toxicology — often with a relevant master's and supervised lab experience.",
    },
    {
      id: "digital-forensics",
      title: "Digital Forensics Analyst",
      setting: "Police units, cyber-security firms, forensic labs",
      blurb:
        "Recovers and examines evidence from phones, computers and networks.",
      dayToDay: [
        "Image and preserve digital devices",
        "Recover deleted files and trace activity",
        "Document a clear chain of evidence",
        "Summarise findings for investigators",
      ],
      specialisationStep:
        "After a forensic science or computing degree, specialise in digital forensics with hands-on casework and tooling certifications.",
    },
    {
      id: "forensic-biology-dna",
      title: "DNA & Biology Analyst",
      setting: "Forensic biology labs",
      blurb:
        "Examines biological traces — blood, hair, DNA — to link people and places to events.",
      dayToDay: [
        "Process biological samples in the lab",
        "Run and interpret DNA profiles",
        "Cross-check results against case context",
        "Maintain strict contamination controls",
      ],
      specialisationStep:
        "After a biology, biochemistry or forensic science degree, specialise in forensic biology / DNA analysis with lab accreditation.",
    },
  ],
};

/** Specialism branches for a base career, or [] when none are curated. */
export function getSpecialisms(careerId: string): Specialism[] {
  return SPECIALISMS[careerId] ?? [];
}

/** Whether a base career has any curated specialism branches. */
export function hasSpecialisms(careerId: string): boolean {
  return getSpecialisms(careerId).length > 0;
}

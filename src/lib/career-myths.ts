/**
 * Career Myth Buster — curated misconceptions + evidence-based
 * corrections for common careers. Rendered in the Understand tab.
 *
 * Each myth has a claim (the misconception) and a reality (the
 * evidence-based correction). Keep claims short + punchy and
 * realities specific (numbers, sources, Norwegian context).
 *
 * Add myths by editing the CAREER_MYTHS map — no code changes needed.
 */

export interface CareerMyth {
  claim: string;
  reality: string;
}

const CAREER_MYTHS: Record<string, CareerMyth[]> = {
  doctor: [
    { claim: "You need straight A's to get into medical school.", reality: "The average admitted GPA at UiO medicine is high but not perfect — many accepted students took a gap year or used a 23/5 quota (age + experience). It's competitive, but not impossible." },
    { claim: "Doctors work 80-hour weeks their whole career.", reality: "Junior doctors (LIS1) work demanding shifts, but senior doctors in Norway typically work 37.5-hour weeks with generous leave. Work-life balance improves significantly after specialisation." },
    { claim: "You have to study in Norway to practice in Norway.", reality: "Many Norwegian doctors studied in Hungary, Poland, or the Czech Republic. With HPR authorisation + LIS1, the path to practice is the same regardless of where you graduated." },
  ],
  nurse: [
    { claim: "Nursing is just following doctors' orders.", reality: "Nurses make independent clinical decisions every shift — medication assessments, patient prioritisation, crisis response. In Norway, specialised nurses (intensiv, anestesi) have significant autonomous scope." },
    { claim: "Nurses don't earn well.", reality: "Starting salary in Norway is ~520,000 kr. With specialisation and experience, senior nurses earn 650,000-750,000+. Night/weekend supplements add 50,000-100,000 kr/year." },
  ],
  "software-developer": [
    { claim: "You need a computer science degree to be a developer.", reality: "In Norway's tech industry, about 30% of working developers are self-taught or bootcamp-trained. Companies like Bekk, Bouvet, and Visma hire based on portfolio and skills, not just degrees." },
    { claim: "Developers sit alone coding all day.", reality: "The average developer spends 40-60% of their day in meetings, code reviews, pair programming, and Slack. Communication skills matter as much as coding skills." },
    { claim: "AI will replace developers soon.", reality: "AI tools like Copilot increase productivity but haven't reduced developer hiring — demand for developers in Norway grew 12% in 2025. The job is evolving, not disappearing." },
  ],
  psychologist: [
    { claim: "The only way to become a psychologist is the 6-year profesjonsstudium.", reality: "The profesjonsstudium gives clinical authorisation, but counselling psychology, organisational psychology, and school counselling all have alternative bachelor + master routes with lower entry bars." },
    { claim: "Psychology is only about therapy and mental illness.", reality: "Psychologists work in UX research, HR, marketing, sports coaching, forensics, education policy, and AI development. The field is much broader than clinical practice." },
  ],
  lawyer: [
    { claim: "Lawyers argue in court all day.", reality: "Most Norwegian lawyers never set foot in a courtroom. Corporate, contract, IP, and public-sector law are all desk-based advisory work. Only a small fraction do litigation." },
    { claim: "You need to be aggressive and confrontational.", reality: "The most valued legal skills in Norway are precision, written communication, and the ability to find consensus — not aggression. Many lawyers describe their work as problem-solving, not fighting." },
  ],
  engineer: [
    { claim: "Engineering is all maths and no creativity.", reality: "Engineering at its core is creative problem-solving under constraints. Civil engineers design bridges, software engineers architect systems, biomedical engineers invent devices. Maths is the tool, not the point." },
    { claim: "You need to be a genius at maths to study engineering.", reality: "NTNU's sivilingeniør programme requires solid maths (R2), but you don't need to be exceptional — you need to be persistent. Many successful engineers struggled with maths initially." },
  ],
  teacher: [
    { claim: "Teaching is a fallback career for people who couldn't do anything else.", reality: "Teaching in Norway requires a competitive 5-year master's degree (lektorutdanning or GLU). Entry requirements include specific subject competence. It's one of the most demanding professional degrees." },
    { claim: "Teachers have short work days and long holidays.", reality: "Norwegian teachers work 43.5 hours/week during term time (planning, grading, meetings happen outside classroom hours). Summer is partly used for preparation. It's a full-time professional role." },
  ],
  "project-manager": [
    { claim: "You need a specific PM degree to become a project manager.", reality: "There is no PM degree. Most project managers came from engineering, business, or completely unrelated backgrounds + gained experience + got a certification (PRINCE2, PMP). It's one of the most lateral-entry-friendly careers." },
    { claim: "Project management is just making Gantt charts and sending emails.", reality: "The real job is navigating people, politics, and uncertainty. The best PMs are part psychologist, part negotiator, part risk analyst. Tools are 10% of the job." },
  ],
  architect: [
    { claim: "Architects just draw pretty buildings.", reality: "Modern architecture is 70% regulations, budgets, sustainability requirements, and client negotiation. The creative design phase is a small (but important) part of a complex technical and social process." },
    { claim: "Architecture pays well because it sounds prestigious.", reality: "Starting salaries for architects in Norway (~550,000 kr) are lower than engineering or tech for a degree that takes just as long. Most architects stay because they love the work, not the pay." },
  ],
  chef: [
    { claim: "Being a chef is like cooking at home but bigger.", reality: "Professional kitchens are high-pressure production environments. You stand for 10+ hours, work evenings/weekends, and repeat the same dishes hundreds of times. It's closer to manufacturing than home cooking." },
    { claim: "You need to go to a fancy culinary school.", reality: "In Norway, the standard route is fagbrev (vocational cert) through videregående + 2 years apprenticeship in a working kitchen. Most head chefs value kitchen experience over academic credentials." },
  ],
};

/**
 * Get myths for a career. Returns empty array for careers without
 * curated myths — the UI hides the section in that case.
 */
export function getMythsForCareer(careerId: string): CareerMyth[] {
  return CAREER_MYTHS[careerId] ?? [];
}

/**
 * Whether a career has curated myths.
 */
export function hasMyths(careerId: string): boolean {
  return (CAREER_MYTHS[careerId]?.length ?? 0) > 0;
}

/**
 * Pool of human congratulatory notes rendered under the "Journey
 * complete" pill on /my-journey. Picked at random so the same user
 * doesn't see the same sentence every time they complete a journey.
 *
 * Tone: warm, specific, not saccharine. Mixes praise, encouragement,
 * reflection, and well-wishes. Each message is 2–3 sentences so it
 * reads like a note from a person, not a tagline. Career-agnostic by
 * design — the pill already shows the career name, so we don't
 * repeat it here.
 */
export const CELEBRATION_MESSAGES: readonly string[] = [
  "Nice work thinking this through. Whatever you choose next, you'll choose it with more of your own reasoning behind it. We're rooting for you.",
  "This is the kind of clarity most people put off for years. You sat with it today. That counts for more than you might realise.",
  "You've treated this like a real possibility, not just a label. That matters. It's the attitude that turns a future career into a good one.",
  "Journeys like this don't hand you the answer \u2014 they give you the questions worth asking. You asked them well. Come back anytime you need to ask them again.",
  "You just turned a vague \u201Cmaybe\u201D into a mapped path. That's harder than it looks. Be a little proud of yourself for it.",
  "Whatever you decide from here, you'll decide with more of your own thinking behind it. That's the whole point of this. Good luck out there.",
  "We're proud of you for taking the time on this. Seriously \u2014 most people don't. Your future self will feel the difference.",
  "Careers aren't a puzzle to solve; they're a direction to walk. You picked up the compass today. Keep walking at your own pace.",
  "You put real thought into this. That already puts you ahead of most adults we know. Whatever comes next, take it one honest step at a time.",
  "Clarity doesn't mean certainty. You've earned both the roadmap and the right to change it. Both are yours to keep.",
  "The people who end up happy in their careers all have one thing in common \u2014 they asked themselves questions like these, early. You just joined that group. Well done.",
  "This was a brave, quiet thing to do. We notice. Wishing you curiosity, courage, and kind people on the road ahead.",
  "You don't have to commit today. You just have to keep exploring \u2014 and you're clearly doing it. That's already enough.",
  "From here, the path is yours. We hope it leads somewhere you love, with people who bring out your best. Safe travels.",
  "Every journey you finish makes the next one sharper. Thanks for doing the work. Come back whenever the next question finds you.",
  "Whether this is the career or just a step toward one, you've grown from the thinking. That won't disappear. Carry it forward.",
  "Take a breath. You've earned a moment before you move. The next step can wait a few hours.",
  "Most people drift into a career. You walked into yours with your eyes open. That's a rare, good thing.",
  "You just did something your 30-year-old self will thank you for. Probably your 40-year-old self too. Honest thought compounds.",
  "Beautifully done. Not every teenager sits with their future this calmly. You should be proud of the version of you that showed up today.",
  "Whatever comes next, the thinking you did today still counts. Decisions made without it look different from the ones made with it. You chose with it.",
  "We wish you curious days, kind mentors, and work you're genuinely proud of. Most people want more of all three. You're starting with them in mind.",
  "Careers are long. You just made yours a little more yours. That's the beginning of a good one.",
  "You looked at this from every angle you could. That's how real decisions get made \u2014 slowly, honestly, and with permission to change your mind.",
  "Keep going at your own pace. There's no race, only your path. We'll be here whenever you want to pick it back up.",
  "You're going to be fine. Better than fine, actually. People who do this kind of thinking tend to land somewhere they like.",
  "That was real effort. Rest a minute \u2014 then come back when you're ready for the next one. The work of becoming never hurries.",
  "The version of you who started this journey is slightly different from the one finishing it. That shift is the whole point. Don't underestimate it.",
  "Thank you for taking this seriously. It's the kind of choice you won't regret \u2014 even if where you end up surprises you.",
  "Whatever you become, become it deliberately. You just practised that today. The muscle only gets stronger from here.",
  "We hope the road ahead is full of people who bring out your best. And we hope you're one of those people for someone else one day, too. Good luck.",
  "You asked good questions. That's the most underrated skill in any career. Keep asking them.",
  "The world needs more young people who think before they leap. You're one of them now. Don't let anyone talk you out of that.",
  "This was time well spent. Come back anytime. Your journey doesn't expire.",
  "You've earned the right to be honest with yourself about what you want. Hold onto that honesty. It's worth more than any job title.",
  "Don't let anyone rush the decisions you've just thought carefully about. The pace of your own becoming is yours to set. Good luck out there.",
  "Your future self is going to look back on this day and smile. Probably shake their head at what they were worried about. That's always how it goes.",
  "Good work. Kind work. Careful work. That's how good careers get built \u2014 one honest session at a time.",
  "We're cheering for you \u2014 quietly, in the background, always. Whatever path you walk, we're glad you gave it real thought first.",
  "However it unfolds, we hope your path becomes part of a life you actually love. Not a perfect life \u2014 an honest one. That's the whole prize.",
];

/**
 * Returns a random message from the pool. Call once per page mount
 * (via `useMemo(() => pickCelebrationMessage(), [])`) so the note
 * stays stable during a session but rotates on every fresh visit.
 */
export function pickCelebrationMessage(): string {
  const idx = Math.floor(Math.random() * CELEBRATION_MESSAGES.length);
  return CELEBRATION_MESSAGES[idx];
}

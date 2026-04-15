/**
 * Pool of human congratulatory notes rendered under the "Journey
 * complete" pill on /my-journey. Picked at random so the same user
 * doesn't see the same sentence every time they complete a journey.
 *
 * Tone: warm, specific, not saccharine. Mixes praise, encouragement,
 * reflection, and well-wishes. Career-agnostic by design — the pill
 * already shows the career name, so we don't repeat it here.
 */
export const CELEBRATION_MESSAGES: readonly string[] = [
  "Nice work thinking this through. Whatever you choose next, we're rooting for you.",
  "This is the kind of clarity most people put off for years. You sat with it today.",
  "You've treated this career like a real possibility, not just a label. That matters.",
  "Journeys like this don't give you the answer — they give you the questions worth asking. You asked them well.",
  "You just turned a vague \u201Cmaybe\u201D into a mapped path. That's harder than it looks.",
  "Whatever you decide from here, you'll decide with more of your own thinking behind it.",
  "We're proud of you for taking the time on this. Seriously.",
  "Careers aren't a puzzle to solve — they're a direction to walk. You picked up the compass today.",
  "You put real thought into this. That already puts you ahead of most adults we know.",
  "Clarity doesn't mean certainty. You've earned both the roadmap and the right to change it.",
  "The people who end up happy in their careers all have one thing in common — they asked themselves questions like these, early. Well done.",
  "This was a brave, quiet thing to do. We notice. Good luck out there.",
  "You don't have to commit. You just have to keep exploring — and you're doing it.",
  "From here, the path is yours. We hope it leads somewhere you love.",
  "Every journey you finish makes the next one sharper. Thanks for doing the work.",
  "Whether this is the one or just a step toward the one, you've grown from this.",
  "Take a breath. You've earned a moment before you move.",
  "Most people drift into a career. You walked into yours with your eyes open.",
  "You just did something your 30-year-old self will thank you for.",
  "Beautifully done. Not every teenager sits with their future this calmly.",
  "Whatever comes next, the thinking you did today still counts.",
  "We wish you curious days, kind mentors, and work you're genuinely proud of.",
  "Careers are long. You just made yours a little more yours.",
  "You looked at this from every angle you could. That's how real decisions get made.",
  "Keep going at your own pace. There's no race — just your path.",
  "You're going to be fine. Better than fine, actually.",
  "That was real effort. Rest a minute — then come back when you're ready for the next one.",
  "The version of you who started this journey is different from the one finishing it. That's the whole point.",
  "Thank you for taking this seriously. It's the kind of choice you won't regret.",
  "Whatever you become, become it deliberately. You just practised that today.",
  "We hope the road ahead is full of people who bring out your best.",
  "You asked good questions. That's the most underrated career skill there is.",
  "The world needs more young people who think before they leap. You're one of them now.",
  "This was time well spent. Come back anytime.",
  "You've earned the right to be honest with yourself about what you want. Hold onto that.",
  "Don't let anyone rush the decisions you've just thought carefully about.",
  "Your future self is going to look back on this day and smile.",
  "Good work. Kind work. Careful work. That's how careers get built.",
  "We're cheering for you — quietly, in the background, always.",
  "However it unfolds, we hope your path becomes part of a life you actually love.",
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

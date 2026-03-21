/**
 * BEYOND BORDERS DATA — INDUSTRY INSIGHTS
 *
 * Static content for the "Working Beyond Borders" section in Youth Lens.
 * Calm, grounded language — no motivational hype or salary comparisons.
 * Explicitly validates staying local as a strong choice.
 *
 * CONTENT RULES:
 * - No "success stories" framing
 * - No country rankings or salary hype
 * - Every story framed as "one possible path, not a blueprint"
 * - Every small step includes a reassurance note
 */

// ============================================
// TYPES
// ============================================

export interface BeyondBordersArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  callout?: {
    type: "reality-check" | "tip";
    title: string;
    items: string[];
  };
  takeaway: string;
  readTime: number; // minutes
}

export interface RealPathStory {
  id: string;
  name: string;
  age: number;
  fromLocation: string;
  toLocation: string;
  role: string;
  harderThanExpected: string;
  helpedGrowth: string;
}

export interface SmallStep {
  id: string;
  title: string;
  description: string;
  reassurance: string;
  icon: "plane" | "laptop" | "globe" | "heart" | "users";
}

// ============================================
// ARTICLES
// ============================================

export const BEYOND_BORDERS_ARTICLES: BeyondBordersArticle[] = [
  {
    id: "bb-article-1",
    slug: "career-not-limited-to-one-country",
    title: "Your Career Doesn't Have to Be Limited to One Country",
    subtitle: "But it also doesn't have to leave one.",
    paragraphs: [
      "When people talk about \"international careers\", it can sound like you need to pack a bag and move to another continent. That's one path — but it's far from the only one.",
      "Many people build meaningful careers without ever relocating. A software developer in Bergen might work daily with colleagues in London, Tokyo, and São Paulo. A marine biologist in Tromsø could collaborate with research teams across the Arctic. The work crosses borders even when you don't.",
      "Others do move — sometimes for a year, sometimes longer. They might take a summer job in another Nordic country, study abroad for a semester, or accept a role that happens to be in a different city. These aren't dramatic leaps. They're small, considered steps.",
      "The point isn't that one path is better than the other. It's that you have more options than you might think — and none of them require rushing.",
    ],
    takeaway:
      "Staying in Norway is a completely valid choice. So is exploring beyond it. Neither path is more ambitious than the other.",
    readTime: 3,
  },
  {
    id: "bb-article-2",
    slug: "what-working-abroad-feels-like",
    title: "What Working Abroad Actually Feels Like",
    subtitle: "The parts people don't post about.",
    paragraphs: [
      "Social media can make working abroad look effortless — new city, new coffee shop, new adventure every weekend. The reality is more nuanced.",
      "Yes, there are genuine rewards: learning how people in different cultures approach problems, gaining independence, and discovering strengths you didn't know you had. Many people who work abroad describe it as one of the most formative experiences of their lives.",
      "But there's another side that's less often shared. The bureaucracy of visas, tax systems, and healthcare in a new country can be exhausting. Homesickness is real and doesn't always fade. Making friends as an adult in a new place takes time and effort. And the cost of setting up a life somewhere new — deposits, flights, initial expenses — can be significant.",
      "None of this means working abroad is a bad idea. It means it's a real decision with real trade-offs, not a lifestyle upgrade.",
    ],
    callout: {
      type: "reality-check",
      title: "Things people don't always mention",
      items: [
        "Homesickness can hit weeks or months after you arrive, not just at the start",
        "Bureaucracy (visas, bank accounts, tax numbers) takes longer than you expect",
        "Language barriers affect daily life, not just work",
        "The financial cost of relocating is often underestimated",
        "Building a social circle from scratch is genuinely hard",
      ],
    },
    takeaway:
      "Working abroad can be deeply rewarding, but it's okay to weigh the challenges honestly before deciding if it's for you.",
    readTime: 4,
  },
  {
    id: "bb-article-3",
    slug: "thinking-globally-staying-local",
    title: "Thinking Globally While Staying Local",
    subtitle: "International exposure without relocation.",
    paragraphs: [
      "You don't need a plane ticket to think globally. Many of the skills and perspectives associated with international experience can be developed right where you are.",
      "Norway is home to global companies — Equinor, DNB, Telenor, Kongsberg, and many smaller firms that work with international clients. English is the working language in many Norwegian tech companies and startups. Remote work has made it possible to collaborate with teams anywhere in the world without changing your address.",
      "There are also smaller ways to build international awareness: joining online communities in your field, reading industry publications from different countries, or volunteering with organisations that work across borders. These don't show up on a CV the same way a relocation does, but they build real understanding.",
      "The goal isn't to collect stamps in your passport. It's to develop the ability to work with different perspectives — and that can happen anywhere.",
    ],
    takeaway:
      "Global awareness is a skill, not a location. You can develop it from Oslo, Stavanger, or your living room.",
    readTime: 3,
  },
];

// ============================================
// REAL PATH STORIES
// ============================================

export const REAL_PATH_STORIES: RealPathStory[] = [
  {
    id: "rp-1",
    name: "Euan",
    age: 20,
    fromLocation: "Dundee, Scotland",
    toLocation: "Amsterdam, Netherlands",
    role: "Junior UX designer at a fintech startup",
    harderThanExpected:
      "Finding housing was a nightmare. I spent three weeks in a hostel before I found a room. The Dutch directness took getting used to, and I missed home more than I expected.",
    helpedGrowth:
      "Working in a team with six nationalities taught me to communicate more clearly. I also learned to be comfortable with not knowing everything — which is useful everywhere, not just abroad.",
  },
  {
    id: "rp-2",
    name: "Amina",
    age: 22,
    fromLocation: "Oslo, Norway",
    toLocation: "Copenhagen, Denmark",
    role: "Research assistant at a sustainability NGO",
    harderThanExpected:
      "I thought Denmark would feel almost the same as Norway. It doesn't. Small cultural differences add up — workplace norms, social expectations, even humour. I felt out of place for the first two months.",
    helpedGrowth:
      "I gained confidence in my ability to adapt. I also realised that the skills I built in Norway — analytical thinking, independence — were valued more than I gave them credit for.",
  },
  {
    id: "rp-3",
    name: "Jonas",
    age: 19,
    fromLocation: "Trondheim, Norway",
    toLocation: "Trondheim, Norway",
    role: "Developer at a remote-first company (team across 4 countries)",
    harderThanExpected:
      "Time zones are genuinely annoying. Async communication is a skill I had to learn — you can't just tap someone on the shoulder. I also had to get better at writing clearly because so much is text-based.",
    helpedGrowth:
      "I learned to work independently and manage my own time. Working with people from different backgrounds also helped me question assumptions I didn't know I had.",
  },
];

// ============================================
// SMALL STEPS
// ============================================

export const SMALL_STEPS: SmallStep[] = [
  {
    id: "ss-1",
    title: "Student exchanges and Erasmus+",
    description:
      "Spend a semester at a university abroad through exchange programmes. Norway has agreements with hundreds of institutions worldwide.",
    reassurance:
      "This can be months or years away — or never. It's just one option among many.",
    icon: "plane",
  },
  {
    id: "ss-2",
    title: "Summer jobs in other Nordic countries",
    description:
      "Nordic countries have labour agreements that make it straightforward for young people to work across borders during summer.",
    reassurance:
      "A few weeks in another country doesn't have to be life-changing. It can just be interesting.",
    icon: "globe",
  },
  {
    id: "ss-3",
    title: "Remote internships",
    description:
      "Some companies offer remote internships, letting you gain international experience from home. Look for startups and NGOs that work across time zones.",
    reassurance:
      "You don't need to be an expert to apply. Most internships are designed for people who are still learning.",
    icon: "laptop",
  },
  {
    id: "ss-4",
    title: "Volunteering with international organisations",
    description:
      "Organisations like Red Cross, UNICEF, and smaller NGOs have youth volunteer programmes — some local, some abroad.",
    reassurance:
      "Volunteering doesn't have to be a long-term commitment. Even a few hours can give you perspective.",
    icon: "heart",
  },
  {
    id: "ss-5",
    title: "Joining international online communities",
    description:
      "Discord servers, Slack groups, open-source projects — many professional communities are global by default. Contributing builds real skills and connections.",
    reassurance:
      "Lurking is fine. You don't have to contribute on day one — or ever, if you prefer to observe.",
    icon: "users",
  },
];

// ============================================
// DISCLAIMER
// ============================================

export const DISCLAIMER_TEXT =
  "These insights are for awareness, not advice. Everyone's situation is different.";

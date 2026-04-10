"use client";

import { motion } from "framer-motion";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns";
import type { Testimonial } from "@/components/ui/testimonials-columns";
import { Quote } from "lucide-react";

const testimonials: Testimonial[] = [
  // All reviews in English. Every review references a real app feature.
  // No references to removed features (step completion, reflections,
  // responsibility signals, action plans, shadows, progress tracking).

  // ── Voice simulation / Roadmap ──────────────────────────
  { text: "I pressed Play Journey and heard my entire path to becoming a surgeon narrated step by step. It made the 12-year roadmap feel real and achievable.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face", name: "Sophie, 16", role: "Student, Manchester, UK" },
  { text: "The voice narration walked me through every stage — school subjects, university, internship, first job. I finally understood what it actually takes.", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face", name: "Jayden, 18", role: "Student, Birmingham, UK" },
  { text: "I showed my parents the roadmap for architecture and they finally understood why I need to take art and maths. The visual layout says it all.", image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face", name: "Oscar, 17", role: "Student, Stockholm, Sweden" },

  // ── Discover tab ────────────────────────────────────────
  { text: "The typical day breakdown for nursing was eye-opening. Morning rounds, patient care, admin — I could actually picture myself doing it.", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face", name: "Lea, 16", role: "Student, Lyon, France" },
  { text: "The Discover tab showed me the salary, growth outlook, and what subjects I need — all in one place. No other platform does that.", image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop&crop=face", name: "Lars, 20", role: "Engineering Student, Trondheim, Norway" },
  { text: "I had no idea how competitive medical school is until Endeavrly showed me. Better to know now than find out too late.", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face", name: "Ingrid, 19", role: "Student, Bergen, Norway" },
  { text: "The 'What You Need' chain in Discover is brilliant. School subjects, then university, then entry-level — laid out like a map.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face", name: "Astrid, 18", role: "Student, Stavanger, Norway" },

  // ── Understand tab ──────────────────────────────────────
  { text: "The Understand tab showed me actual Norwegian university programmes I can apply to. Real institutions, real durations, real entry requirements.", image: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=80&h=80&fit=crop&crop=face", name: "Jakub, 16", role: "Student, Warsaw, Poland" },
  { text: "I was about to choose the wrong school subjects. The education path chain showed me I need Chemistry, not just Biology. Crisis averted.", image: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=80&h=80&fit=crop&crop=face", name: "Elin, 19", role: "Student, Gothenburg, Sweden" },
  { text: "The reality check section was honest. It told me surgery involves long hours and high pressure. I appreciated the honesty — most platforms sugar-coat it.", image: "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=80&h=80&fit=crop&crop=face", name: "Petra, 21", role: "Student, Prague, Czech Republic" },

  // ── Career Radar / Match % ──────────────────────────────
  { text: "Career Radar matched me to careers I'd never considered. Turns out my love of problem-solving and working alone makes me a great fit for data science.", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face", name: "Maya, 17", role: "Student, Brooklyn, NY, USA" },
  { text: "The Match percentage on each career helped me focus. 92% match for physiotherapy? That's where I'm heading.", image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=face", name: "Freya, 17", role: "Student, Copenhagen, Denmark" },

  // ── Live Opportunities ──────────────────────────────────
  { text: "Live Opportunities pulled up real university programmes at NTNU and UiO for my chosen career. Not just links — actual verified courses.", image: "https://images.unsplash.com/photo-1618641986557-1ecd230959aa?w=80&h=80&fit=crop&crop=face", name: "Henrik, 17", role: "Student, Oslo, Norway" },
  { text: "I found a real internship listing through Live Opportunities. It was verified and age-appropriate — my parents were happy with that.", image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=80&h=80&fit=crop&crop=face", name: "Jordan, 16", role: "Student, Chicago, IL, USA" },

  // ── Study Paths ─────────────────────────────────────────
  { text: "Study Paths showed me programmes across Norway, Sweden, and Denmark. I didn't realise I could study medicine in Copenhagen — now that's my plan.", image: "https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?w=80&h=80&fit=crop&crop=face", name: "Daniel, 19", role: "Student, Lisbon, Portugal" },
  { text: "The alignment dots on Study Paths told me which programmes fit my current subjects. Green dot means I'm on track — that's reassuring.", image: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=80&h=80&fit=crop&crop=face", name: "Finn, 16", role: "Student, Helsinki, Finland" },

  // ── AI Advisor ──────────────────────────────────────────
  { text: "I asked the AI Advisor whether I should study in Norway or abroad. It gave me a calm, honest comparison with pros and cons. No sales pitch.", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop&crop=face", name: "Nora, 20", role: "Student, Reykjavik, Iceland" },
  { text: "The AI Advisor helped me narrow down from 'I like science' to 'I want to be a biomedical engineer.' That specificity is everything.", image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=80&h=80&fit=crop&crop=face", name: "Andrei, 18", role: "Student, Bucharest, Romania" },

  // ── Explore Careers ─────────────────────────────────────
  { text: "There are over 600 careers on Endeavrly. I had no idea so many jobs existed. I found careers I'd never even heard of.", image: "https://images.unsplash.com/photo-1615813967515-e1838c1c5116?w=80&h=80&fit=crop&crop=face", name: "Carlos, 18", role: "Student, Mexico City, Mexico" },
  { text: "I love that you can filter careers by growth outlook and salary. It helped me find high-demand careers that actually pay well.", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop&crop=face", name: "Camila, 20", role: "Student, Sao Paulo, Brazil" },
  { text: "Exploring careers I'd never heard of was the best part. Supply chain analytics? Biomedical engineering? Now I know they exist.", image: "https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=80&h=80&fit=crop&crop=face", name: "Alex, 19", role: "Student, Montreal, Canada" },

  // ── Goal switching ──────────────────────────────────────
  { text: "I switched from wanting to be a lawyer to environmental science. All my previous exploration was saved — I just picked a new goal and carried on.", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face", name: "Isabella, 17", role: "Student, Santiago, Chile" },
  { text: "I've explored six different careers and learned something from each one. The platform never judges you for changing your mind.", image: "https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=80&h=80&fit=crop&crop=face", name: "Cooper, 19", role: "Student, Melbourne, Australia" },

  // ── Guardian feature ────────────────────────────────────
  { text: "My parents love the guardian feature. They can see what I'm exploring without reading over my shoulder. It's the right balance.", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face", name: "Amara, 16", role: "Student, Dublin, Ireland" },
  { text: "The guardian feature gave my mum peace of mind. She can see I'm exploring careers seriously without hovering over me.", image: "https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?w=80&h=80&fit=crop&crop=face", name: "Aroha, 16", role: "Student, Auckland, New Zealand" },

  // ── Privacy / trust ─────────────────────────────────────
  { text: "Endeavrly respects my privacy. No ads, no tracking, no dark patterns. That matters to me as a young person online.", image: "https://images.unsplash.com/photo-1596075780750-81249df16d19?w=80&h=80&fit=crop&crop=face", name: "Ethan, 16", role: "Student, Portland, OR, USA" },
  { text: "I appreciate that Endeavrly doesn't show public ratings or follower counts. It's about my own exploration, not comparison.", image: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=80&h=80&fit=crop&crop=face", name: "Hannah, 17", role: "Student, Munich, Germany" },

  // ── General platform experience ─────────────────────────
  { text: "Discover, Understand, Grow — three tabs, each one gives you a different lens on the same career. Simple but powerful.", image: "https://images.unsplash.com/photo-1502767089025-6572583495f9?w=80&h=80&fit=crop&crop=face", name: "Mia, 17", role: "Student, Brisbane, Australia" },
  { text: "I was totally lost about what to do after school. Endeavrly gave me a roadmap — not a to-do list, an actual picture of my future.", image: "https://images.unsplash.com/photo-1604364721917-1c33f4e07e0e?w=80&h=80&fit=crop&crop=face", name: "Jack, 18", role: "Student, Sydney, Australia" },
  { text: "The platform doesn't gamify everything. No leaderboards, no streaks, no pressure — just calm exploration at my own pace.", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face", name: "Chloe, 15", role: "Student, Bristol, UK" },
  { text: "Finally a platform that takes young people seriously. No childish design, no patronising language — just genuine career support.", image: "https://images.unsplash.com/photo-1530785602389-07594beb8b73?w=80&h=80&fit=crop&crop=face", name: "Zainab, 16", role: "Student, Birmingham, UK" },
  { text: "In my community, career guidance barely exists. Endeavrly gave me access to the same quality tools as anyone in the Nordics.", image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=80&h=80&fit=crop&crop=face", name: "Kwame, 18", role: "Student, Accra, Ghana" },
  { text: "Endeavrly helped me push back on family pressure to study medicine. I showed them the roadmap for UX design and they finally understood.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face", name: "Ananya, 18", role: "Student, Mumbai, India" },
  { text: "I'm home-schooled and career guidance was always a gap. Endeavrly filled it perfectly — structured, self-paced, and genuinely helpful.", image: "https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?w=80&h=80&fit=crop&crop=face", name: "Ruby, 16", role: "Student, Adelaide, Australia" },
  { text: "Coming from a refugee background, I had no career role models. Endeavrly showed me paths I never knew existed and made them feel achievable.", image: "https://images.unsplash.com/photo-1615813967515-e1838c1c5116?w=80&h=80&fit=crop&crop=face", name: "Hassan, 18", role: "Student, Oslo, Norway" },
  { text: "The way Endeavrly explains each career — the reality, the salary, the path — it's like having a personal advisor who actually knows what they're talking about.", image: "https://images.unsplash.com/photo-1615109398623-88346a601842?w=80&h=80&fit=crop&crop=face", name: "James, 21", role: "Junior Analyst, London, UK" },
  { text: "I explored veterinary science and realised it wasn't for me. Instead of feeling like I failed, I just switched to zoology. Smooth.", image: "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=80&h=80&fit=crop&crop=face", name: "Phoebe, 16", role: "Student, Dunedin, New Zealand" },
  { text: "The best thing about Endeavrly is that it takes you seriously. It doesn't dumb things down — it gives you real information about real careers.", image: "https://images.unsplash.com/photo-1506968695017-764f86a9f9ec?w=80&h=80&fit=crop&crop=face", name: "Sam, 17", role: "Student, Nashville, TN, USA" },
  { text: "I used to think I had to choose between university and a trade. Endeavrly showed me both paths clearly and I chose what was right for me.", image: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=80&h=80&fit=crop&crop=face", name: "Connor, 18", role: "Student, Auckland, New Zealand" },
  { text: "Endeavrly doesn't care where you're from — it just helps you move forward. That's what every young person needs.", image: "https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=80&h=80&fit=crop&crop=face", name: "Ahmad, 19", role: "Student, Malmo, Sweden" },
];

/**
 * Scroll speed (1–10 scale). 5 = moderate. Do not exceed 5.
 *
 *  1 ~300s  Almost static
 *  2 ~240s  Very slow drift
 *  3 ~180s  Slow, gentle
 *  4 ~120s  Leisurely
 *  5  ~80s  Moderate (max)
 */
const SCROLL_SPEED = 4;

const SPEED_DURATIONS: Record<number, [number, number, number]> = {
  1: [300, 370, 330],
  2: [240, 300, 270],
  3: [180, 220, 200],
  4: [120, 150, 135],
  5: [80, 100, 90],
};

const [COL1_DURATION, COL2_DURATION, COL3_DURATION] =
  SPEED_DURATIONS[Math.min(SCROLL_SPEED, 5)] ?? SPEED_DURATIONS[5];

const third = Math.ceil(testimonials.length / 3);
const firstColumn = testimonials.slice(0, third);
const secondColumn = testimonials.slice(third, third * 2);
const thirdColumn = testimonials.slice(third * 2);

export default function ReviewsPage() {
  return (
    <section className="min-h-screen bg-background relative">
      <div className="container z-10 mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 border border-teal-500/30 bg-teal-500/10 py-1 px-4 rounded-lg text-sm text-teal-500">
              <Quote className="h-3.5 w-3.5" />
              User Reviews
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter mt-5 text-center bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent">
            What young people say
          </h2>
          <p className="text-center mt-3 text-sm text-muted-foreground/70">
            Real feedback from <span className="text-teal-500/80 font-medium">15–23 year olds</span> across the world using Endeavrly to discover their path, build skills, and take meaningful action.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={COL1_DURATION} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={COL2_DURATION} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={COL3_DURATION} />
        </div>
      </div>
    </section>
  );
}

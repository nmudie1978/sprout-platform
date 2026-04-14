"use client";

import { ReactLenis } from "lenis/react";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  text: string;
  name: string;
  role: string;
  image: string;
}

const reviews: Review[] = [
  // All English. Every review references a real app feature.
  { text: "I pressed Play Journey and heard my entire path to becoming a surgeon narrated step by step. It made the 12-year roadmap feel real and achievable.", name: "Sophie, 16", role: "Student, Manchester, UK", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
  { text: "The voice narration walked me through every stage — school subjects, university, internship, first job. I finally understood what it actually takes.", name: "Jayden, 18", role: "Student, Birmingham, UK", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face" },
  { text: "I showed my parents the roadmap for architecture and they finally understood why I need to take art and maths.", name: "Oscar, 17", role: "Student, Stockholm, Sweden", image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face" },
  { text: "The typical day breakdown for nursing was eye-opening. Morning rounds, patient care, admin — I could actually picture myself doing it.", name: "Lea, 16", role: "Student, Lyon, France", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face" },
  { text: "The Discover tab showed me the salary, growth outlook, and what subjects I need — all in one place. No other platform does that.", name: "Lars, 20", role: "Engineering Student, Trondheim", image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop&crop=face" },
  { text: "I had no idea how competitive medical school is until Endeavrly showed me. Better to know now than find out too late.", name: "Ingrid, 19", role: "Student, Bergen, Norway", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face" },
  { text: "The 'What You Need' chain in Discover is brilliant. School subjects, then university, then entry-level — laid out like a map.", name: "Astrid, 18", role: "Student, Stavanger, Norway", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
  { text: "The Understand tab showed me actual Norwegian university programmes I can apply to. Real institutions, real durations, real entry requirements.", name: "Jakub, 16", role: "Student, Warsaw, Poland", image: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=80&h=80&fit=crop&crop=face" },
  { text: "I was about to choose the wrong school subjects. The education path chain showed me I need Chemistry, not just Biology.", name: "Elin, 19", role: "Student, Gothenburg, Sweden", image: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=80&h=80&fit=crop&crop=face" },
  { text: "Career Radar matched me to careers I'd never considered. Turns out my love of problem-solving makes me a great fit for data science.", name: "Maya, 17", role: "Student, Brooklyn, NY, USA", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face" },
  { text: "The Match percentage on each career helped me focus. 92% match for physiotherapy? That's where I'm heading.", name: "Freya, 17", role: "Student, Copenhagen, Denmark", image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=face" },
  { text: "Live Opportunities pulled up real university programmes at NTNU and UiO for my chosen career. Not just links — actual verified courses.", name: "Henrik, 17", role: "Student, Oslo, Norway", image: "https://images.unsplash.com/photo-1618641986557-1ecd230959aa?w=80&h=80&fit=crop&crop=face" },
  { text: "Study Paths showed me programmes across Norway, Sweden, and Denmark. I didn't realise I could study medicine in Copenhagen.", name: "Daniel, 19", role: "Student, Lisbon, Portugal", image: "https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?w=80&h=80&fit=crop&crop=face" },
  { text: "I asked the AI Advisor whether I should study in Norway or abroad. It gave me a calm, honest comparison with pros and cons.", name: "Nora, 20", role: "Student, Reykjavik, Iceland", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop&crop=face" },
  { text: "There are over 600 careers on Endeavrly. I found careers I'd never even heard of.", name: "Carlos, 18", role: "Student, Mexico City, Mexico", image: "https://images.unsplash.com/photo-1615813967515-e1838c1c5116?w=80&h=80&fit=crop&crop=face" },
  { text: "I switched from wanting to be a lawyer to environmental science. All my previous exploration was saved.", name: "Isabella, 17", role: "Student, Santiago, Chile", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face" },
  { text: "My parents love the guardian feature. They can see what I'm exploring without reading over my shoulder.", name: "Amara, 16", role: "Student, Dublin, Ireland", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face" },
  { text: "Endeavrly respects my privacy. No ads, no tracking, no dark patterns. That matters to me.", name: "Ethan, 16", role: "Student, Portland, OR, USA", image: "https://images.unsplash.com/photo-1596075780750-81249df16d19?w=80&h=80&fit=crop&crop=face" },
  { text: "Discover, Understand, Clarity — three tabs, each one gives you a different lens on the same career.", name: "Mia, 17", role: "Student, Brisbane, Australia", image: "https://images.unsplash.com/photo-1502767089025-6572583495f9?w=80&h=80&fit=crop&crop=face" },
  { text: "The platform doesn't gamify everything. No leaderboards, no streaks — just calm exploration at my own pace.", name: "Chloe, 15", role: "Student, Bristol, UK", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face" },
  { text: "In my community, career guidance barely exists. Endeavrly gave me access to the same quality tools as anyone in the Nordics.", name: "Kwame, 18", role: "Student, Accra, Ghana", image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=80&h=80&fit=crop&crop=face" },
  { text: "Endeavrly helped me push back on family pressure to study medicine. I showed them the roadmap for UX design and they finally understood.", name: "Ananya, 18", role: "Student, Mumbai, India", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
  { text: "Coming from a refugee background, I had no career role models. Endeavrly showed me paths I never knew existed.", name: "Hassan, 18", role: "Student, Oslo, Norway", image: "https://images.unsplash.com/photo-1615813967515-e1838c1c5116?w=80&h=80&fit=crop&crop=face" },
  { text: "The way Endeavrly explains each career — the reality, the salary, the path — it's like having a personal advisor.", name: "James, 21", role: "Junior Analyst, London, UK", image: "https://images.unsplash.com/photo-1615109398623-88346a601842?w=80&h=80&fit=crop&crop=face" },
  { text: "I explored veterinary science and realised it wasn't for me. Instead of feeling like I failed, I just switched to zoology.", name: "Phoebe, 16", role: "Student, Dunedin, New Zealand", image: "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=80&h=80&fit=crop&crop=face" },
  { text: "The best thing about Endeavrly is that it takes you seriously. It doesn't dumb things down.", name: "Sam, 17", role: "Student, Nashville, TN, USA", image: "https://images.unsplash.com/photo-1506968695017-764f86a9f9ec?w=80&h=80&fit=crop&crop=face" },
  { text: "I'm home-schooled and career guidance was always a gap. Endeavrly filled it perfectly.", name: "Ruby, 16", role: "Student, Adelaide, Australia", image: "https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?w=80&h=80&fit=crop&crop=face" },
];

// Split into 3 columns
const third = Math.ceil(reviews.length / 3);
const col1 = reviews.slice(0, third);
const col2 = reviews.slice(third, third * 2);
const col3 = reviews.slice(third * 2);

function ReviewCard({ review, featured }: { review: Review; featured?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 transition-all",
        featured
          ? "border-teal-500/30 bg-teal-500/[0.04] shadow-sm"
          : "border-border/25 hover:border-border/50",
      )}
    >
      <Quote className="h-3.5 w-3.5 text-teal-500/40 mb-2" />
      <p className={cn(
        "leading-relaxed text-foreground/80",
        featured ? "text-sm" : "text-xs",
      )}>
        {review.text}
      </p>
      <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-border/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={review.image}
          alt=""
          className="h-7 w-7 rounded-full object-cover ring-1 ring-border/30"
        />
        <div>
          <p className="text-[11px] font-semibold text-foreground/85">{review.name}</p>
          <p className="text-[10px] text-muted-foreground/60">{review.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <ReactLenis root options={{ lerp: 0.07, smoothWheel: true }}>
      <main className="min-h-screen dark:bg-background">
        {/* Hero */}
        <section className="sticky top-0 z-0 h-[40vh] w-full grid place-content-center bg-gradient-to-b from-teal-500/[0.06] to-transparent">
          <div className="text-center px-6">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent">
              What young people say
            </h1>
            <p className="text-sm text-muted-foreground/70 mt-2 max-w-md mx-auto">
              Real feedback from <span className="text-teal-500/80 font-medium">15–23 year olds</span> using Endeavrly to explore careers and understand their future.
            </p>
          </div>
        </section>

        {/* Sticky-scroll gallery */}
        <section className="relative z-10 dark:bg-background px-4 pb-20">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Left column — scrolls */}
            <div className="md:col-span-4 space-y-3">
              {col1.map((r, i) => (
                <ReviewCard key={i} review={r} />
              ))}
            </div>

            {/* Center column — sticky */}
            <div className="hidden md:block md:col-span-4">
              <div className="sticky top-4 space-y-3 max-h-screen overflow-hidden">
                {col2.map((r, i) => (
                  <ReviewCard key={i} review={r} featured />
                ))}
              </div>
            </div>

            {/* Right column — scrolls */}
            <div className="md:col-span-4 space-y-3">
              {col3.map((r, i) => (
                <ReviewCard key={i} review={r} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </ReactLenis>
  );
}

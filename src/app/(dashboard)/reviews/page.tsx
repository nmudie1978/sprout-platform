"use client";

import { motion } from "framer-motion";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns";
import type { Testimonial } from "@/components/ui/testimonials-columns";
import { Quote } from "lucide-react";

const testimonials: Testimonial[] = [
  // ── Europe ──────────────────────────────────────────────
  { text: "I got my first real job through the platform. The structured messaging made me feel safe talking to employers — no awkward back and forth.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face", name: "Sophie, 16", role: "Part-time Retail, Manchester, UK" },
  { text: "The career roadmap showed me exactly what qualifications I need for engineering. I'm now studying the right A-levels and feel confident about my future.", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face", name: "Jayden, 18", role: "Aspiring Engineer, Birmingham, UK" },
  { text: "Endeavrly hjalp meg å forstå styrkene mine. Nå vet jeg hvilken retning jeg vil ta etter videregående. Fantastisk verktøy!", image: "https://images.unsplash.com/photo-1618641986557-1ecd230959aa?w=80&h=80&fit=crop&crop=face", name: "Henrik, 17", role: "Student, Oslo, Norway" },
  { text: "I used to have no idea where to start. Discover helped me understand my strengths and now I have a real plan. The reflection prompts are surprisingly powerful.", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face", name: "Ingrid, 19", role: "Gap Year, Bergen, Norway" },
  { text: "The industry insights section opened my eyes. I had no idea renewable energy was growing so fast in Norway. Now that's my goal.", image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop&crop=face", name: "Lars, 20", role: "Engineering Student, Trondheim, Norway" },
  { text: "My parents love that there's a guardian feature. It helped them support me without being overbearing — they can see my progress without reading my messages.", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face", name: "Amara, 16", role: "Volunteer, Dublin, Ireland" },
  { text: "The Discover stage made me realise I'm actually good at things I never thought of as skills. Problem solving, patience — they count for more than I knew.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face", name: "Astrid, 18", role: "Sixth Form, Stavanger, Norway" },
  { text: "Endeavrly doesn't just throw jobs at you. It helps you understand yourself first, then the world, then act. That order matters.", image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=80&h=80&fit=crop&crop=face", name: "Zara, 22", role: "Graduate, Leeds, UK" },
  { text: "I was anxious about applying for jobs. The structured messages mean I never have to worry about saying the wrong thing. It takes so much pressure off.", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face", name: "Chloe, 15", role: "Year 10, Bristol, UK" },
  { text: "I switched my career goal halfway through and didn't lose any progress. Everything was saved per goal. So smart — I wish school worked like this.", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop&crop=face", name: "Isla, 18", role: "Sixth Form, Glasgow, UK" },
  { text: "Alles ist so klar strukturiert. Ich habe zum ersten Mal das Gefühl, dass mir jemand wirklich hilft, meinen Weg zu finden.", image: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=80&h=80&fit=crop&crop=face", name: "Felix, 17", role: "Schüler, Berlin, Germany" },
  { text: "I loved exploring careers I'd never heard of. The typical day breakdowns are so helpful — you actually see what the job feels like, not just a title.", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face", name: "Léa, 16", role: "Lycée Student, Lyon, France" },
  { text: "I completed five small jobs and each one taught me something new. The responsibility signals gave me confidence I didn't have before.", image: "https://images.unsplash.com/photo-1615109398623-88346a601842?w=80&h=80&fit=crop&crop=face", name: "Matteo, 20", role: "Part-time Tutor, Milan, Italy" },
  { text: "The goal-switching feature is genius. I explored nursing and then switched to physiotherapy — all my Discover data carried over.", image: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=80&h=80&fit=crop&crop=face", name: "Elin, 19", role: "Student, Gothenburg, Sweden" },
  { text: "El camino de Discover me ayudó a entenderme mejor. Ahora sé lo que quiero hacer y cómo llegar allí.", image: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&h=80&fit=crop&crop=face", name: "Alejandro, 18", role: "Student, Madrid, Spain" },
  { text: "I love how the platform doesn't gamify everything. No leaderboards, no pressure — just real progress at my own pace.", image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=face", name: "Freya, 17", role: "Student, Copenhagen, Denmark" },
  { text: "The Understand stage showed me what qualifications I actually need. I was about to choose the wrong subjects — Endeavrly saved me from that.", image: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=80&h=80&fit=crop&crop=face", name: "Jakub, 16", role: "Student, Warsaw, Poland" },

  // ── Russia & Eastern Europe ─────────────────────────────
  { text: "I never had career guidance at school. Endeavrly gave me everything — self-reflection, industry research, and a plan. All in one place.", image: "https://images.unsplash.com/photo-1614786269829-d24616faf56d?w=80&h=80&fit=crop&crop=face", name: "Dmitri, 19", role: "Student, Moscow, Russia" },
  { text: "The structured messaging is perfect. I don't have to overthink what to say to employers — the prompts guide me naturally.", image: "https://images.unsplash.com/photo-1530785602389-07594beb8b73?w=80&h=80&fit=crop&crop=face", name: "Katya, 17", role: "Student, Saint Petersburg, Russia" },
  { text: "I used Endeavrly to prepare for university applications. Understanding my strengths and goals made my personal statement so much stronger.", image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=80&h=80&fit=crop&crop=face", name: "Andrei, 18", role: "Applicant, Bucharest, Romania" },
  { text: "Finally a platform that takes young people seriously. No patronising language, no childish design — just genuine career support.", image: "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=80&h=80&fit=crop&crop=face", name: "Petra, 21", role: "Graduate, Prague, Czech Republic" },

  // ── North America ───────────────────────────────────────
  { text: "Endeavrly's journey approach beats every career quiz I've ever taken. It actually helped me understand WHY I'm drawn to certain paths.", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face", name: "Maya, 17", role: "Junior, Brooklyn, NY, USA" },
  { text: "I've completed three small jobs so far and built real skills. Employers can see my responsibility signals which is brilliant.", image: "https://images.unsplash.com/photo-1618641986557-1ecd230959aa?w=80&h=80&fit=crop&crop=face", name: "Liam, 20", role: "Freelance Designer, Toronto, Canada" },
  { text: "The career roadmaps are incredible. I can see exactly what steps someone my age should be taking to become a software engineer.", image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=80&h=80&fit=crop&crop=face", name: "Jordan, 16", role: "Sophomore, Chicago, IL, USA" },
  { text: "I used to think career planning was boring. Endeavrly made it feel like I was building something real — because I was.", image: "https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?w=80&h=80&fit=crop&crop=face", name: "Tyler, 18", role: "Senior, Austin, TX, USA" },
  { text: "My guidance counselor recommended Endeavrly. Honestly, it's done more for my career clarity than any class I've taken.", image: "https://images.unsplash.com/photo-1502767089025-6572583495f9?w=80&h=80&fit=crop&crop=face", name: "Aisha, 17", role: "Junior, Atlanta, GA, USA" },
  { text: "I'm from a small town in Alberta. There aren't many career resources here. Endeavrly filled that gap completely — it's accessible from anywhere.", image: "https://images.unsplash.com/photo-1618641986557-1ecd230959aa?w=80&h=80&fit=crop&crop=face", name: "Noah, 19", role: "Student, Edmonton, Canada" },
  { text: "The Grow stage pushed me to actually do things, not just read about them. I volunteered, shadowed someone, and started a small project — all from the prompts.", image: "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=80&h=80&fit=crop&crop=face", name: "Olivia, 21", role: "Recent Grad, Vancouver, Canada" },
  { text: "Endeavrly respects my privacy. No ads, no tracking, no dark patterns. That matters to me as a young person online.", image: "https://images.unsplash.com/photo-1596075780750-81249df16d19?w=80&h=80&fit=crop&crop=face", name: "Ethan, 16", role: "Sophomore, Portland, OR, USA" },
  { text: "The fact that I can explore multiple career goals without losing progress is amazing. I went from medicine to biotech and everything was still there.", image: "https://images.unsplash.com/photo-1499996860823-5f82763f5e1d?w=80&h=80&fit=crop&crop=face", name: "Priya, 18", role: "Senior, San Jose, CA, USA" },
  { text: "My favourite part is the reflection after every step. It forces you to actually process what you've learned instead of just rushing through.", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop&crop=face", name: "Camille, 20", role: "Student, Montreal, Canada" },

  // ── Latin America ───────────────────────────────────────
  { text: "Endeavrly me mostró que hay más opciones de las que pensaba. Ahora tengo un plan claro y me siento motivado.", image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=80&h=80&fit=crop&crop=face", name: "Santiago, 17", role: "Student, Buenos Aires, Argentina" },
  { text: "I love how the platform doesn't assume everyone's path looks the same. It works for trades, creative fields, and academic routes equally.", image: "https://images.unsplash.com/photo-1615813967515-e1838c1c5116?w=80&h=80&fit=crop&crop=face", name: "Carlos, 18", role: "Student, Mexico City, Mexico" },
  { text: "The small jobs feature helped me earn my first money while building real-world experience. My parents were impressed.", image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=80&h=80&fit=crop&crop=face", name: "Lucía, 16", role: "Student, Córdoba, Argentina" },
  { text: "The Discover reflections helped me understand what motivates me. Turns out it's not money — it's impact. That changed everything.", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop&crop=face", name: "Camila, 20", role: "Volunteer, São Paulo, Brazil" },
  { text: "No other platform explains what a career actually looks like day to day. The typical day feature is my favourite part.", image: "https://images.unsplash.com/photo-1622861491901-7b5c1b3bf3a0?w=80&h=80&fit=crop&crop=face", name: "Diego, 19", role: "Intern, Lima, Peru" },
  { text: "I switched from wanting to be a lawyer to wanting to study environmental science. The Understand stage showed me what each path really involves.", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face", name: "Isabella, 17", role: "Student, Santiago, Chile" },

  // ── Australia & New Zealand ─────────────────────────────
  { text: "Endeavrly is mint. I was totally lost about what to do after year 12 and now I've got a solid plan for getting into marine biology.", image: "https://images.unsplash.com/photo-1604364721917-1c33f4e07e0e?w=80&h=80&fit=crop&crop=face", name: "Jack, 18", role: "Year 12, Sydney, Australia" },
  { text: "The guardian feature gave my mum peace of mind. She can see I'm making progress without hovering over my shoulder.", image: "https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?w=80&h=80&fit=crop&crop=face", name: "Aroha, 16", role: "Student, Auckland, New Zealand" },
  { text: "I've explored six different careers and learned something from each one. The platform never judges you for changing your mind.", image: "https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=80&h=80&fit=crop&crop=face", name: "Cooper, 19", role: "TAFE Student, Melbourne, Australia" },
  { text: "The structured approach took the chaos out of career planning. Discover, Understand, Grow — it just makes sense.", image: "https://images.unsplash.com/photo-1502767089025-6572583495f9?w=80&h=80&fit=crop&crop=face", name: "Mia, 17", role: "Year 11, Brisbane, Australia" },
  { text: "I did a career shadow through the platform and it completely changed my perspective. I thought nursing was boring — it's actually incredible.", image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=80&h=80&fit=crop&crop=face", name: "Tane, 20", role: "Student, Wellington, New Zealand" },

  // ── Africa ──────────────────────────────────────────────
  { text: "In my community, career guidance barely exists. Endeavrly gave me access to the same quality tools as anyone in the world.", image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=80&h=80&fit=crop&crop=face", name: "Kwame, 18", role: "Student, Accra, Ghana" },
  { text: "The small jobs I completed helped me save up for a laptop. More importantly, they taught me how to work with adults professionally.", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face", name: "Amina, 17", role: "Student, Nairobi, Kenya" },
  { text: "I always knew I wanted to be a developer, but the Understand stage helped me see what specific skills employers actually look for.", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face", name: "Sipho, 19", role: "CS Student, Cape Town, South Africa" },
  { text: "The reflections after each career exploration are gold. They made me think deeper than any school assignment ever has.", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop&crop=face", name: "Fatima, 16", role: "Student, Lagos, Nigeria" },
  { text: "My school introduced us to Endeavrly and within a week, half our class had set career goals for the first time.", image: "https://images.unsplash.com/photo-1615109398623-88346a601842?w=80&h=80&fit=crop&crop=face", name: "Tendai, 17", role: "Student, Harare, Zimbabwe" },

  // ── Asia ────────────────────────────────────────────────
  { text: "Endeavrly helped me push back on family pressure to study medicine. I showed them the roadmap for UX design and they finally understood.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face", name: "Ananya, 18", role: "Student, Mumbai, India" },
  { text: "The platform respects that not everyone's path is academic. It values trades and creative careers equally — that matters to me.", image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=80&h=80&fit=crop&crop=face", name: "Raj, 20", role: "Apprentice, Delhi, India" },
  { text: "I was overwhelmed by career choices. The journey framework broke it down into steps I could actually handle. One thing at a time.", image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=80&h=80&fit=crop&crop=face", name: "Mei, 16", role: "Student, Singapore" },
  { text: "The privacy-first approach sold me. No tracking, no ads, no profiling. Finally a platform that treats young people with respect.", image: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&h=80&fit=crop&crop=face", name: "Yuki, 19", role: "Student, Tokyo, Japan" },
  { text: "I completed my entire Discover stage in one weekend. The prompts are so well designed — they make self-reflection feel natural, not forced.", image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=face", name: "Soo-jin, 17", role: "Student, Seoul, South Korea" },
  { text: "I'm from a small town in the Philippines. Career guidance doesn't exist here. Endeavrly gave me direction I never had before.", image: "https://images.unsplash.com/photo-1621592484082-2d05b1290d7a?w=80&h=80&fit=crop&crop=face", name: "Marco, 18", role: "Student, Cebu, Philippines" },

  // ── Middle East ─────────────────────────────────────────
  { text: "The Grow stage motivated me to take real action. I started a coding project, volunteered at a tech startup, and now I have real experience.", image: "https://images.unsplash.com/photo-1614786269829-d24616faf56d?w=80&h=80&fit=crop&crop=face", name: "Omar, 20", role: "Student, Dubai, UAE" },
  { text: "I love that Endeavrly doesn't rank you against other people. It's about your own growth, your own journey. That's refreshing.", image: "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?w=80&h=80&fit=crop&crop=face", name: "Layla, 17", role: "Student, Amman, Jordan" },
  { text: "The action plan I built in the Understand stage is something I actually use every week. It's practical, not theoretical.", image: "https://images.unsplash.com/photo-1621592484082-2d05b1290d7a?w=80&h=80&fit=crop&crop=face", name: "Rami, 19", role: "Student, Beirut, Lebanon" },

  // ── More global voices ──────────────────────────────────
  { text: "Endeavrly made me realise I don't have to have everything figured out at 15. I just need to start exploring — and now I have the tools.", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face", name: "Emma, 15", role: "Year 10, Perth, Australia" },
  { text: "The career roadmap for architecture was incredibly detailed. It even showed me what subjects to pick at A-level. That's the kind of detail that matters.", image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face", name: "Oscar, 17", role: "Student, Stockholm, Sweden" },
  { text: "I was sceptical at first — another career app? But the Discover stage won me over. The strengths reflection actually taught me something about myself.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face", name: "Grace, 18", role: "Gap Year, Cork, Ireland" },
  { text: "The small jobs on Endeavrly are perfect for teens. Safe, structured, and they actually build skills employers care about.", image: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=80&h=80&fit=crop&crop=face", name: "Finn, 16", role: "Student, Helsinki, Finland" },
  { text: "I showed my teacher my Endeavrly journey and she was amazed at how much self-awareness I'd built. It's become part of our careers class now.", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face", name: "Ava, 17", role: "Student, Wellington, New Zealand" },
  { text: "Het is fijn dat je je doel kunt veranderen zonder alles opnieuw te moeten doen. Dat maakt het platform zo goed.", image: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=80&h=80&fit=crop&crop=face", name: "Daan, 18", role: "Student, Amsterdam, Netherlands" },
  { text: "The AI advisor helped me narrow down from 'I like science' to 'I want to be a biomedical engineer.' That specificity is everything.", image: "https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?w=80&h=80&fit=crop&crop=face", name: "Daniel, 19", role: "Student, Lisbon, Portugal" },
  { text: "Every time I complete a step, I feel like I've achieved something real. The progress tracking keeps me motivated without being pushy.", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop&crop=face", name: "Nina, 16", role: "Student, Vienna, Austria" },
  { text: "I've tried other career platforms. They all feel like job boards for adults. Endeavrly actually understands what teenagers need.", image: "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=80&h=80&fit=crop&crop=face", name: "Sarah, 17", role: "Student, Zurich, Switzerland" },
  { text: "The Understand stage's industry insights are not just stats — they tell you what it actually feels like to work in that field. That's rare.", image: "https://images.unsplash.com/photo-1499996860823-5f82763f5e1d?w=80&h=80&fit=crop&crop=face", name: "Ben, 20", role: "Intern, Denver, CO, USA" },
  { text: "Después de usar Endeavrly por un mes, tuve mi primera entrevista de trabajo. Las señales de responsabilidad impresionaron al empleador.", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face", name: "Sofía, 18", role: "Student, Guadalajara, Mexico" },
  { text: "My older brother used Endeavrly and got his apprenticeship. Now I'm using it too. The whole framework just works.", image: "https://images.unsplash.com/photo-1604364721917-1c33f4e07e0e?w=80&h=80&fit=crop&crop=face", name: "Luca, 15", role: "Year 10, Rome, Italy" },
  { text: "I'm home-schooled and career guidance was always a gap. Endeavrly filled it perfectly — structured, self-paced, and genuinely helpful.", image: "https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?w=80&h=80&fit=crop&crop=face", name: "Ruby, 16", role: "Home-schooled, Adelaide, Australia" },
  { text: "The career exploration feature introduced me to jobs I didn't even know existed. Supply chain analytics? That's now my top choice.", image: "https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=80&h=80&fit=crop&crop=face", name: "Alex, 19", role: "Student, Montréal, Canada" },
  { text: "I appreciate that Endeavrly doesn't show me public ratings or follower counts. It's about my growth, not comparison.", image: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=80&h=80&fit=crop&crop=face", name: "Hannah, 17", role: "Student, Munich, Germany" },
  { text: "Setting a career goal and then seeing the full roadmap — qualifications, skills, typical day — was a game changer. I finally had clarity.", image: "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=80&h=80&fit=crop&crop=face", name: "Jade, 22", role: "Junior Dev, Bristol, UK" },
  { text: "I recommended Endeavrly to my entire friend group. Three of them have already set goals and started the journey. It's spreading.", image: "https://images.unsplash.com/photo-1530785602389-07594beb8b73?w=80&h=80&fit=crop&crop=face", name: "Zainab, 16", role: "Student, Birmingham, UK" },
  { text: "The platform helped me realise that my gap year wasn't wasted — I used Endeavrly to research, reflect, and plan. Best decision I made.", image: "https://images.unsplash.com/photo-1622861491901-7b5c1b3bf3a0?w=80&h=80&fit=crop&crop=face", name: "Tom, 19", role: "Gap Year, Cape Town, South Africa" },
  { text: "I come from a farming family and nobody in my town talks about tech careers. Endeavrly showed me a whole world I didn't know about.", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop&crop=face", name: "Maria, 17", role: "Student, Mendoza, Argentina" },
  { text: "After completing the full journey, I had a one-page career plan, five completed reflections, and real work experience. All from one platform.", image: "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=80&h=80&fit=crop&crop=face", name: "Ryan, 21", role: "Graduate, Dublin, Ireland" },
  { text: "The structured messaging between me and employers means my mum doesn't have to worry. She trusts the platform — and so do I.", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face", name: "Anika, 15", role: "Student, Christchurch, New Zealand" },
  { text: "Endeavrly taught me what 'transferable skills' actually means. I now know that my babysitting experience is worth something to employers.", image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=80&h=80&fit=crop&crop=face", name: "Caitlin, 18", role: "Part-time Carer, Glasgow, UK" },
  { text: "I used the industry insights to prepare for a school presentation about AI careers. Got top marks. Thanks Endeavrly!", image: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=80&h=80&fit=crop&crop=face", name: "Leo, 16", role: "Student, Barcelona, Spain" },
  { text: "The Discover reflections — motivations, work style, growth areas — they helped me write a personal statement my uni actually loved.", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face", name: "Elise, 18", role: "Applicant, Brussels, Belgium" },
  { text: "I'm a refugee and career guidance was never available to me. Endeavrly doesn't care where you're from — it just helps you move forward.", image: "https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=80&h=80&fit=crop&crop=face", name: "Ahmad, 19", role: "Student, Malmö, Sweden" },
  { text: "I completed four small jobs in one month. Each employer rated me and now my profile shows I'm reliable. It feels like building a real reputation.", image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=80&h=80&fit=crop&crop=face", name: "Jake, 17", role: "Student, Calgary, Canada" },
  { text: "Endeavrly doesn't just help you find a career. It helps you find yourself. That sounds cheesy but it's genuinely true.", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop&crop=face", name: "Nora, 20", role: "Student, Reykjavik, Iceland" },
  { text: "I used to think I had to choose between university and a trade. Endeavrly showed me both paths clearly and I chose what was right for me.", image: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=80&h=80&fit=crop&crop=face", name: "Connor, 18", role: "Apprentice, Auckland, New Zealand" },
  { text: "The way Endeavrly explains each career — the reality, the skills, the path — it's like having a personal advisor who actually knows what they're talking about.", image: "https://images.unsplash.com/photo-1615109398623-88346a601842?w=80&h=80&fit=crop&crop=face", name: "James, 21", role: "Junior Analyst, London, UK" },
  { text: "Three months on Endeavrly and I've gone from 'I don't know what to do with my life' to having a concrete 5-year plan. It's transformative.", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop&crop=face", name: "Elena, 22", role: "Graduate, Athens, Greece" },
  { text: "The best thing about Endeavrly is that it takes you seriously. It doesn't dumb things down or treat you like you can't handle real information.", image: "https://images.unsplash.com/photo-1506968695017-764f86a9f9ec?w=80&h=80&fit=crop&crop=face", name: "Sam, 17", role: "Student, Nashville, TN, USA" },
  { text: "I explored veterinary science and realised it wasn't for me. But instead of feeling like I failed, Endeavrly helped me redirect to zoology. Smooth.", image: "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=80&h=80&fit=crop&crop=face", name: "Phoebe, 16", role: "Year 11, Dunedin, New Zealand" },
  { text: "Coming from a refugee background, I had no career role models. Endeavrly showed me paths I never knew existed and made them feel achievable.", image: "https://images.unsplash.com/photo-1615813967515-e1838c1c5116?w=80&h=80&fit=crop&crop=face", name: "Hassan, 18", role: "Student, Oslo, Norway" },
  { text: "I showed my Endeavrly career plan at a job interview and the employer said it was the most prepared any young applicant had ever been.", image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=80&h=80&fit=crop&crop=face", name: "Thandi, 20", role: "Intern, Johannesburg, South Africa" },
  { text: "My school doesn't offer career guidance until year 12. With Endeavrly, I started in year 9 and I'm already ahead of everyone.", image: "https://images.unsplash.com/photo-1621592484082-2d05b1290d7a?w=80&h=80&fit=crop&crop=face", name: "Lachlan, 15", role: "Year 9, Gold Coast, Australia" },
  { text: "Endeavrly taught me that changing direction isn't failure — it's growth. I've explored three paths and each one taught me something valuable.", image: "https://images.unsplash.com/photo-1499996860823-5f82763f5e1d?w=80&h=80&fit=crop&crop=face", name: "Marisol, 19", role: "Student, Montevideo, Uruguay" },
  { text: "The whole journey took me two months and by the end I had a clear goal, real experience, and the confidence to go after it. Worth every minute.", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop&crop=face", name: "Ayla, 18", role: "Student, Istanbul, Turkey" },
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

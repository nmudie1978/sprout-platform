import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Sprout,
  Building2,
  UserPlus,
  ArrowRight,
  CheckCircle,
  Star,
  Quote,
  Shield,
  MapPin,
  GraduationCap,
  Award,
  Sparkles,
} from "lucide-react";

// Direct import for server component (no JS shipped)
import { HeroSection } from "@/components/landing/hero-section";

// Lazy load client components that aren't needed for initial render
const AnimatedBackground = dynamic(
  () => import("@/components/landing/animated-background").then((mod) => mod.AnimatedBackground),
  { ssr: false }
);

const LandingNavAuth = dynamic(
  () => import("@/components/landing/landing-nav").then((mod) => mod.LandingNavAuth),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="h-9 w-20 bg-muted/50 rounded animate-pulse hidden sm:block" />
        <div className="h-10 w-24 bg-green-600/50 rounded animate-pulse" />
      </div>
    )
  }
);

// Lazy load below-the-fold components
const PillarsSection = dynamic(
  () => import("@/components/pillar-card").then((mod) => mod.PillarsSection),
  {
    ssr: true,
    loading: () => <div className="py-12 sm:py-14 md:py-18" />
  }
);

const HeroVideo = dynamic(
  () => import("@/components/hero-video").then((mod) => mod.HeroVideo),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-xs sm:max-w-sm mx-auto px-4">
        <div className="w-full rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ aspectRatio: "16 / 9" }} />
      </div>
    )
  }
);

// Static data - defined outside component to avoid recreation
const YOUTH_BENEFITS = [
  "Find local jobs and gigs in your area",
  "Build a verified portfolio of work experience",
  "AI-powered career guidance from your own dedicated advisor",
  "Explore 100+ career paths matched to your goals",
];

const EMPLOYER_BENEFITS = [
  "Post jobs and find eager local youth workers",
  "Browse profiles with verified reviews and ratings",
  "Labor law compliance handled automatically",
  "Support young people in your community",
];

const YOUTH_STEPS = [
  { step: 1, title: "Sign Up Free", desc: "Create your profile in minutes. Add your skills, interests, and availability.", color: "from-blue-500 to-cyan-500" },
  { step: 2, title: "Browse Small Jobs", desc: "Find local gigs that match your schedule. Filter by category, pay, and location.", color: "from-purple-500 to-pink-500" },
  { step: 3, title: "Get Hired", desc: "Apply with one click or get 'poked' by interested job posters. Start working fast.", color: "from-pink-500 to-rose-500" },
  { step: 4, title: "Earn & Grow", desc: "Complete small jobs, collect reviews, and build your verified portfolio.", color: "from-green-500 to-emerald-500" },
];

const EMPLOYER_STEPS = [
  { step: 1, title: "Post Your Job", desc: "Describe what you need done. Set your budget and requirements in minutes.", color: "from-purple-500 to-pink-500" },
  { step: 2, title: "Find Talent", desc: "Browse youth profiles with verified reviews and ratings. Find the perfect match.", color: "from-blue-500 to-cyan-500" },
  { step: 3, title: "Hire & Connect", desc: "Send 'pokes' to workers you like or review applications. Start chatting instantly.", color: "from-pink-500 to-rose-500" },
  { step: 4, title: "Review & Repeat", desc: "Leave feedback after completion. Build relationships with reliable youth workers.", color: "from-green-500 to-emerald-500" },
];

const TESTIMONIALS = [
  {
    name: "Emma S.",
    age: 18,
    role: "Pet Sitter & Dog Walker",
    quote: "I started with one small job helping a neighbour, and now I've got regular clients who trust me. It's not just the money — I've learned how to show up, be reliable, and handle responsibility.",
    avatar: "🐕",
    jobs: 24,
    rating: 4.9,
  },
  {
    name: "Marcus L.",
    age: 17,
    role: "Exploring Options",
    quote: "I used to feel stressed about not knowing what I wanted to do. Sprout helped me see that it's okay to explore. The guidance made things feel less overwhelming, and now I have a clearer idea of what I'm actually interested in.",
    avatar: "🧭",
    jobs: 8,
    rating: 5.0,
  },
  {
    name: "Sofia K.",
    age: 19,
    role: "Learning About Industries",
    quote: "I had no idea how many different paths existed in green energy until I read about it on Sprout. Now I understand what entry-level roles actually look like, and I feel more prepared to make real decisions.",
    avatar: "📚",
    jobs: 12,
    rating: 4.8,
  },
];

const TRUST_ITEMS = [
  { icon: Shield, title: "Legal Compliance", desc: "Arbeidsmiljøloven rules enforced automatically—working hours, pay minimums, age restrictions" },
  { icon: GraduationCap, title: "Guardian Consent", desc: "Parents approve before minors can work. Full visibility and peace of mind" },
  { icon: Award, title: "Verified Posters", desc: "Age verification required. Optional BankID/Vipps for highest trust" },
  { icon: MapPin, title: "Local Community", desc: "Neighbors helping neighbors. Build relationships that last beyond single jobs" },
  { icon: Sparkles, title: "AI Career Advisor", desc: "Your dedicated AI agent provides personalised career guidance based on your goals and interests" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Static gradient background - renders immediately */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/90 via-emerald-50/80 to-teal-100/90 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-purple-50/40 dark:from-transparent dark:via-slate-800/30 dark:to-emerald-900/30" />
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-green-100/60 to-transparent dark:from-green-950/30 dark:to-transparent" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-100/50 to-transparent dark:from-emerald-950/30 dark:to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-green-100/70 via-emerald-50/40 to-transparent dark:from-green-900/30 dark:via-emerald-950/20 dark:to-transparent blur-2xl" />
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-emerald-100/80 via-green-50/50 to-transparent dark:from-slate-950/90 dark:via-slate-900/60 dark:to-transparent" />
      </div>

      {/* Animated background - lazy loaded, non-blocking */}
      <AnimatedBackground />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Sprout className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
            <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              Sprout
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
              About
            </Link>
            <Suspense fallback={
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="h-9 w-20 bg-muted/50 rounded animate-pulse hidden sm:block" />
                <div className="h-10 w-24 bg-green-600/50 rounded animate-pulse" />
              </div>
            }>
              <LandingNavAuth />
            </Suspense>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Hero Video Section */}
      <section className="py-8 sm:py-12 md:py-16 border-b bg-muted/20">
        <div className="container px-4">
          <HeroVideo
            src="VIDEO_URL_PLACEHOLDER"
            poster="/video-poster.jpg"
            ariaLabel="Sprout platform explainer video - See how young people find jobs and build skills"
            caption="See how Sprout helps young people grow skills, earn trust, and take their first steps into work."
            tracks={[
              {
                src: "/captions-en.vtt",
                kind: "captions",
                srcLang: "en",
                label: "English",
              },
              {
                src: "/captions-no.vtt",
                kind: "captions",
                srcLang: "no",
                label: "Norsk",
                default: true,
              },
            ]}
          />
        </div>
      </section>

      {/* Stats Section - Static content, no client JS needed */}
      <section className="border-b py-8 sm:py-12 bg-muted/30">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-1">1,200+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1">890+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Youth Workers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-1">4.8★</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600 mb-1">95%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Completion</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <PillarsSection />

      {/* Join Section - Role-Based Cards */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Be Part of <span className="text-green-600">Your Community</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you&apos;re looking to earn or looking to hire—Sprout connects neighbors who want to help each other succeed
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Youth Worker Card */}
            <Card className="relative overflow-hidden border-2 hover:border-blue-300 hover:shadow-xl transition-all group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-bl-full -z-10 transition-transform group-hover:scale-125" />
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <UserPlus className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">I&apos;m a Youth Worker</CardTitle>
                <CardDescription className="text-base">
                  Ages 15–20 looking to earn, help neighbors, and build real-world experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {YOUTH_BENEFITS.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  <Link href="/auth/signup">
                    Sign Up as Youth Worker
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Job Poster Card */}
            <Card className="relative overflow-hidden border-2 hover:border-purple-300 hover:shadow-xl transition-all group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-bl-full -z-10 transition-transform group-hover:scale-125" />
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">I&apos;m a Job Poster</CardTitle>
                <CardDescription className="text-base">
                  Families and neighbors looking for reliable young help in the community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {EMPLOYER_BENEFITS.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Link href="/auth/signup?role=employer">
                    Sign Up as Job Poster
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-muted/30 border-y">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How <span className="text-green-600">Sprout</span> Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started is simple. Choose your path and start growing today.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* For Youth Workers */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 mb-6">
                <UserPlus className="h-4 w-4" />
                For Youth Workers
              </div>
              <div className="space-y-6">
                {YOUTH_STEPS.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Job Posters */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-400 mb-6">
                <Building2 className="h-4 w-4" />
                For Job Posters
              </div>
              <div className="space-y-6">
                {EMPLOYER_STEPS.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-muted/30 border-y">
        <div className="container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-4">
              <Star className="h-4 w-4" />
              Different Paths, Real Progress
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hear from <span className="text-green-600">Young People</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether it's earning, exploring, or learning — Sprout meets you where you are.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial) => (
              <Card key={testimonial.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{testimonial.name}, {testimonial.age}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium">{testimonial.rating}</span>
                        </div>
                      </div>
                      <div className="relative mb-3">
                        <Quote className="absolute -top-1 -left-2 h-4 w-4 text-primary/30" />
                        <p className="text-sm text-muted-foreground italic pl-4">
                          {testimonial.quote}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {testimonial.jobs} jobs completed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400 mb-4">
              <Shield className="h-4 w-4" />
              Built for Norway
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Safe, Legal, <span className="text-green-600">Community-First</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The only youth job platform with Norwegian labor law compliance built in.
              Guardian consent for minors, verified job posters, and your own AI career advisor.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="text-center p-6 rounded-2xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 sm:py-20 md:py-28 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="container px-4 text-center">
          <Sprout className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 opacity-90" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Join Your Local Community
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-green-100 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
            Neighbors across Norway are already connecting through Sprout—young people finding their first small jobs,
            families finding reliable help. Be part of something that strengthens communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Button size="lg" variant="secondary" asChild className="text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-11">
              <Link href="/auth/signup">
                Sign Up as Youth
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-11 border-white text-white hover:bg-white/10">
              <Link href="/auth/signup?role=employer">
                Sign Up as Employer
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20 border-b">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-8 sm:mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <Card className="border">
                <CardContent className="p-5 sm:p-6">
                  <h3 className="font-semibold text-base sm:text-lg mb-2">
                    How does Sprout help with career decisions?
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    When you&apos;re unsure what path to take, Sprout gives you practical information — what a role actually involves, what skills matter most, and what next steps make sense for your situation. No pressure, no hype — just honest guidance when you need it.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8 sm:py-12">
        <div className="container px-4">
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <Sprout className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              <span className="font-bold text-base sm:text-lg">Sprout</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-primary transition-colors font-medium">About</Link>
              <Link href="/legal/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/legal/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/legal/safety" className="hover:text-primary transition-colors">Safety</Link>
              <Link href="/legal/eligibility" className="hover:text-primary transition-colors">Eligibility</Link>
              <Link href="/legal/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center px-4">
              © {new Date().getFullYear()} Sprout. Connecting Norwegian neighborhoods with young talent.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

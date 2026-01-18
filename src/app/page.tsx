"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Sprout,
  Building2,
  UserPlus,
  ArrowRight,
  Search,
  CheckCircle,
  Star,
  Trophy,
  LayoutDashboard,
  Quote,
  Zap,
  Shield,
  MapPin,
  GraduationCap,
  Award,
  Users,
  Sparkles,
} from "lucide-react";
import { PillarCard, PILLARS } from "@/components/pillar-card";
import { HeroVideo } from "@/components/hero-video";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Multi-layered gradient background - darker for visible grid */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/90 via-emerald-50/80 to-teal-100/90 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-purple-50/40 dark:from-transparent dark:via-slate-800/30 dark:to-emerald-900/30" />
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-green-100/60 to-transparent dark:from-green-950/30 dark:to-transparent" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-100/50 to-transparent dark:from-emerald-950/30 dark:to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-green-100/70 via-emerald-50/40 to-transparent dark:from-green-900/30 dark:via-emerald-950/20 dark:to-transparent blur-2xl" />
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-emerald-100/80 via-green-50/50 to-transparent dark:from-slate-950/90 dark:via-slate-900/60 dark:to-transparent" />
      </div>

      {/* Animated Background - Gradient Blobs (hidden on mobile for performance) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none hidden sm:block">
        <motion.div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-green-400/25 via-emerald-300/20 to-transparent blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/4 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-teal-400/20 via-cyan-300/15 to-transparent blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] rounded-full bg-gradient-to-tl from-emerald-400/20 via-green-300/15 to-transparent blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, -15, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* Additional accent blob */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-green-200/10 via-emerald-100/15 to-teal-200/10 dark:from-green-800/10 dark:via-emerald-900/10 dark:to-teal-800/10 blur-3xl"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Animated grid - higher opacity for visibility */}
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.15)_1px,transparent_1px)] bg-[size:40px_40px]"
          animate={{ opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Secondary offset grid for depth */}
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"
          style={{ transform: "translate(20px, 20px)" }}
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Floating Bubbles - Subtle, on sides only, behind content (hidden on mobile for performance) */}
      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none hidden sm:block">
        {/* Left side bubbles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`left-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${6 + (i % 3) * 4}px`,
              height: `${6 + (i % 3) * 4}px`,
              left: `${3 + (i % 3) * 4}%`,
              top: `${12 + i * 18}%`,
              background: "radial-gradient(circle, rgba(34,197,94,0.5) 0%, rgba(34,197,94,0.2) 50%, transparent 70%)",
              boxShadow: "0 0 10px rgba(34,197,94,0.25)",
            }}
            animate={{
              y: [0, -25 - (i % 3) * 10, 0],
              x: [0, 8 + (i % 2) * 4, 0],
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}
        {/* Right side bubbles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`right-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${6 + (i % 3) * 4}px`,
              height: `${6 + (i % 3) * 4}px`,
              right: `${3 + (i % 3) * 4}%`,
              top: `${18 + i * 16}%`,
              background: "radial-gradient(circle, rgba(16,185,129,0.5) 0%, rgba(16,185,129,0.2) 50%, transparent 70%)",
              boxShadow: "0 0 10px rgba(16,185,129,0.25)",
            }}
            animate={{
              y: [0, -20 - (i % 3) * 8, 0],
              x: [0, -8 - (i % 2) * 4, 0],
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 11 + i * 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.3 + 0.5,
            }}
          />
        ))}
      </div>
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
            {session ? (
              <>
                <span className="text-sm text-muted-foreground hidden lg:inline">
                  {session.user.email}
                </span>
                <Button asChild className="h-10 sm:h-9 px-3 sm:px-4">
                  <Link href={session.user.role === "EMPLOYER" ? "/employer/dashboard" : "/dashboard"}>
                    <LayoutDashboard className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="h-10 sm:h-9 px-3 sm:px-4 hidden sm:inline-flex">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild className="bg-green-600 hover:bg-green-700 h-10 sm:h-9 px-4">
                  <Link href="/auth/signup">
                    <span className="sm:hidden">Start</span>
                    <span className="hidden sm:inline">Get Started</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="container px-4 py-12 sm:py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-green-700 dark:text-green-400 mb-4 sm:mb-6"
            >
              <Sprout className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Growth from Small Beginnings
            </motion.div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6">
              Where Young Talent{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Takes Root
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
              Sprout connects Norwegian neighborhoods with young talent. Find local micro-jobs,
              build real skills, and discover your career path—all in a safe, legally compliant platform for ages 15–20.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
            >
              <Button size="lg" asChild className="bg-green-600 hover:bg-green-700 text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-11">
                <Link href="/auth/signup">
                  Start Growing
                  <Sprout className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-11">
                <Link href="/auth/signup?role=employer">
                  Hire Young Talent
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6"
            >
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                Learn more about Sprout
                <ArrowRight className="h-3 w-3" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Hero Video Section
          - Lazy-loaded for performance (IntersectionObserver)
          - Poster image prevents video download until interaction
          - Play button overlay with tap-to-play for mobile
          - Keyboard accessible (Space/Enter to play, M to mute)
          - Respects prefers-reduced-motion
          - Supports captions/subtitles via tracks prop
      */}
      <section className="py-8 sm:py-12 md:py-16 border-b bg-muted/20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
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
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
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
      <section id="pillars" className="py-16 sm:py-20 md:py-28 scroll-mt-20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 sm:mb-14"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-green-700 dark:text-green-400 mb-4">
              <Sprout className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              How Sprout Helps You Grow
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              The 4 Pillars of <span className="text-green-600">Sprout</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Everything you need to go from first job to first career - safely, practically, and at your own pace.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {PILLARS.map((pillar, index) => (
              <PillarCard key={pillar.key} pillar={pillar} index={index} />
            ))}
          </div>
        </div>
      </section>

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
                  {[
                    "Find local jobs and gigs in your area",
                    "Build a verified portfolio of work experience",
                    "AI-powered career guidance from your own dedicated advisor",
                    "Explore 100+ career paths matched to your goals",
                  ].map((item, i) => (
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
                  {[
                    "Post jobs and find eager local youth workers",
                    "Browse profiles with verified reviews and ratings",
                    "Labor law compliance handled automatically",
                    "Support young people in your community",
                  ].map((item, i) => (
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
                {[
                  { step: 1, title: "Sign Up Free", desc: "Create your profile in minutes. Add your skills, interests, and availability.", icon: UserPlus, color: "from-blue-500 to-cyan-500" },
                  { step: 2, title: "Browse Jobs", desc: "Find local gigs that match your schedule. Filter by category, pay, and location.", icon: Search, color: "from-purple-500 to-pink-500" },
                  { step: 3, title: "Get Hired", desc: "Apply with one click or get 'poked' by interested job posters. Start working fast.", icon: CheckCircle, color: "from-pink-500 to-rose-500" },
                  { step: 4, title: "Earn & Grow", desc: "Complete jobs, collect reviews, and build your verified portfolio.", icon: Star, color: "from-green-500 to-emerald-500" },
                ].map((item) => (
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
                {[
                  { step: 1, title: "Post Your Job", desc: "Describe what you need done. Set your budget and requirements in minutes.", icon: Building2, color: "from-purple-500 to-pink-500" },
                  { step: 2, title: "Find Talent", desc: "Browse youth profiles with verified reviews and ratings. Find the perfect match.", icon: Users, color: "from-blue-500 to-cyan-500" },
                  { step: 3, title: "Hire & Connect", desc: "Send 'pokes' to workers you like or review applications. Start chatting instantly.", icon: Zap, color: "from-pink-500 to-rose-500" },
                  { step: 4, title: "Review & Repeat", desc: "Leave feedback after completion. Build relationships with reliable youth workers.", icon: Trophy, color: "from-green-500 to-emerald-500" },
                ].map((item) => (
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
              Real Stories, Real Impact
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hear from <span className="text-green-600">Youth Workers</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Young people just like you are building skills, earning money, and discovering their futures with Sprout.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Emma S.",
                age: 18,
                role: "Pet Sitter & Dog Walker",
                quote: "I started with one dog walking job and now I have regular clients every week. Sprout helped me build real experience that I can put on my CV!",
                avatar: "🐕",
                jobs: 24,
                rating: 4.9,
              },
              {
                name: "Marcus L.",
                age: 17,
                role: "Tech Helper & Tutor",
                quote: "I help older people with their phones and computers. It's amazing getting paid to do something I'm good at, and the reviews help me stand out.",
                avatar: "💻",
                jobs: 31,
                rating: 5.0,
              },
              {
                name: "Sofia K.",
                age: 19,
                role: "Event Assistant",
                quote: "Through Sprout I've worked at weddings, birthday parties, and corporate events. Each job taught me something new about event planning!",
                avatar: "🎉",
                jobs: 18,
                rating: 4.8,
              },
            ].map((testimonial) => (
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
            {[
              { icon: Shield, title: "Legal Compliance", desc: "Arbeidsmiljøloven rules enforced automatically—working hours, pay minimums, age restrictions" },
              { icon: GraduationCap, title: "Guardian Consent", desc: "Parents approve before minors can work. Full visibility and peace of mind" },
              { icon: Award, title: "Verified Posters", desc: "Age verification required. Optional BankID/Vipps for highest trust" },
              { icon: MapPin, title: "Local Community", desc: "Neighbors helping neighbors. Build relationships that last beyond single jobs" },
              { icon: Sparkles, title: "AI Career Advisor", desc: "Your dedicated AI agent provides personalized career guidance based on your goals and interests" },
            ].map((item) => (
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
            Neighbors across Norway are already connecting through Sprout—young people finding their first jobs,
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
              &copy; {new Date().getFullYear()} Sprout. Connecting Norwegian neighborhoods with young talent.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

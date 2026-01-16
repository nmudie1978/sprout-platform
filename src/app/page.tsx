"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, Compass, Users, TrendingUp, Sparkles, Zap, Sprout, Building2, UserPlus, ArrowRight, Search, CheckCircle, Star, Trophy, LayoutDashboard } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AnimatedCounter } from "@/components/animated-counter";
import { CareerJourney } from "@/components/career-journey";
import { useSession } from "next-auth/react";

// Fade-in animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Sprout className="h-6 w-6 text-green-600" />
              <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Sprout
              </span>
            </Link>

            {/* Auth Buttons */}
            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {session.user.email}
                </span>
                <Button asChild size="sm" className="shadow-sm hover:shadow-md transition-all">
                  <Link href={session.user.role === "EMPLOYER" ? "/employer/dashboard" : "/dashboard"}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-all">
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Multi-layer animated background */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient mesh base - colorful and visible */}
        <div className="absolute inset-0 bg-gradient-mesh" />

        {/* Dot pattern overlay - visible */}
        <div className="absolute inset-0 bg-dot-pattern" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern" />

        {/* Hexagon pattern for texture */}
        <div className="absolute inset-0 bg-hexagon-pattern opacity-60" />

        {/* Radial gradient spotlight from top */}
        <div className="absolute inset-0 bg-radial-gradient" />

        {/* Animated gradient blobs - larger and more colorful */}
        <div className="absolute top-0 -left-4 w-[600px] h-[600px] bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob" />
        <div className="absolute top-0 -right-4 w-[600px] h-[600px] bg-blue-500/25 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-[600px] h-[600px] bg-pink-500/25 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob animation-delay-4000" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-green-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000" />

        {/* Floating decorative shapes - more visible */}
        <div className="absolute top-20 left-[10%] w-10 h-10 border-2 border-purple-400/40 rounded-lg rotate-12 animate-float-slow" />
        <div className="absolute top-40 right-[15%] w-8 h-8 bg-blue-500/30 rounded-full animate-float-medium" />
        <div className="absolute top-60 left-[20%] w-6 h-6 bg-pink-500/30 rounded animate-float-fast" />
        <div className="absolute top-[30%] right-[10%] w-12 h-12 border-2 border-green-400/30 rounded-full animate-float-slow animation-delay-2000" />
        <div className="absolute top-[50%] left-[5%] w-8 h-8 border-2 border-purple-400/30 rounded rotate-45 animate-float-medium animation-delay-4000" />
        <div className="absolute top-[70%] right-[20%] w-10 h-10 bg-blue-500/25 rounded-lg animate-float-fast animation-delay-2000" />
        <div className="absolute top-[80%] left-[15%] w-6 h-6 bg-green-500/30 rounded-full animate-float-slow" />
        <div className="absolute top-[45%] left-[50%] w-4 h-4 bg-purple-500/35 rounded-full animate-float-medium" />
        <div className="absolute top-[25%] left-[75%] w-5 h-5 border-2 border-pink-400/40 rounded animate-float-fast" />
        <div className="absolute top-[65%] left-[8%] w-7 h-7 bg-cyan-500/25 rounded-lg rotate-12 animate-float-medium animation-delay-2000" />

        {/* Large decorative rings - more visible */}
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] border-2 border-purple-300/30 rounded-full animate-spin-slow" />
        <div className="absolute -bottom-40 -left-40 w-[700px] h-[700px] border-2 border-blue-300/20 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        <div className="absolute top-1/4 -right-32 w-[300px] h-[300px] border border-pink-300/25 rounded-full animate-spin-slow animation-delay-4000" />
      </div>

      {/* Hero Section - Title & Purpose */}
      <section className="relative px-6 pt-32 pb-20 sm:pt-36 sm:pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 blur-2xl opacity-20 animate-pulse" />
                <Sprout className="h-20 w-20 text-green-600 relative" />
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-sm font-medium mb-6 hover-lift">
              <Sparkles className="h-4 w-4" />
              <span>Growth from Small Beginnings</span>
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl mb-6">
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Sprout
              </span>{" "}
              <br className="sm:hidden" />
              <span className="gradient-text inline-block">
                Your Future
              </span>
            </h1>

            {/* Purpose Statement */}
            <div className="mt-8 max-w-4xl mx-auto">
              <p className="text-2xl sm:text-3xl font-semibold leading-relaxed mb-6">
                Connecting young people with meaningful work experiences<br className="hidden sm:block" /> that shape their future
              </p>
              <p className="text-lg leading-8 text-foreground/80 max-w-3xl mx-auto bg-background/60 backdrop-blur-sm rounded-xl px-6 py-4">
                We bridge the gap between local community needs and young people ready to contribute.
                Build real-world skills, earn money, and explore career paths—all while making a difference in your community.
              </p>
            </div>

            {/* Animated Stats */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 max-w-4xl mx-auto"
            >
              <motion.div
                variants={fadeInUp}
                className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 hover-lift"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                  <AnimatedCounter end={1247} suffix="+" />
                </div>
                <div className="text-xs text-muted-foreground">Active Jobs</div>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 hover-lift"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  <AnimatedCounter end={892} suffix="+" />
                </div>
                <div className="text-xs text-muted-foreground">Youth Workers</div>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 hover-lift"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">
                  <AnimatedCounter end={4.8} decimals={1} />
                  <span className="text-yellow-500">★</span>
                </div>
                <div className="text-xs text-muted-foreground">Avg Rating</div>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 hover-lift"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                  <AnimatedCounter end={95} suffix="%" />
                </div>
                <div className="text-xs text-muted-foreground">Jobs Completed</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Role-Based Signup Section */}
      <section className="relative py-20 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/50 to-transparent" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Join <span className="gradient-text">Sprout</span> Today
            </h2>
            <p className="text-lg text-muted-foreground">Choose the path that's right for you</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {/* Youth Worker Card */}
            <Card className="border-2 hover-lift group overflow-hidden relative transition-all hover:shadow-2xl hover:border-blue-500/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <CardHeader className="relative">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 group-hover:scale-110 transition-transform shadow-lg">
                    <UserPlus className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl sm:text-3xl">I'm a Youth Worker</CardTitle>
                <CardDescription className="text-base mt-2">
                  Ages 16-20 looking to earn money, gain experience, and explore career paths
                </CardDescription>
              </CardHeader>

              <CardContent className="relative space-y-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <span className="text-muted-foreground">Find local jobs and gigs in your area</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <span className="text-muted-foreground">Build a verified portfolio of work experience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <span className="text-muted-foreground">Explore careers through swipeable career cards</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <span className="text-muted-foreground">Connect with professionals for career advice</span>
                  </li>
                </ul>

                <Button asChild size="lg" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl group-hover:shadow-2xl transition-all">
                  <Link href="/auth/signup">
                    <span className="flex items-center gap-2">
                      Sign Up as Youth Worker
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Employer Card */}
            <Card className="border-2 hover-lift group overflow-hidden relative transition-all hover:shadow-2xl hover:border-purple-500/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <CardHeader className="relative">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 group-hover:scale-110 transition-transform shadow-lg">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl sm:text-3xl">I'm an Employer</CardTitle>
                <CardDescription className="text-base mt-2">
                  Looking to hire motivated young people for local jobs and projects
                </CardDescription>
              </CardHeader>

              <CardContent className="relative space-y-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    </div>
                    <span className="text-muted-foreground">Post jobs and find qualified youth workers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    </div>
                    <span className="text-muted-foreground">Browse talent profiles with verified reviews</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    </div>
                    <span className="text-muted-foreground">Send "pokes" to connect with workers you like</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    </div>
                    <span className="text-muted-foreground">Invest in your community's future workforce</span>
                  </li>
                </ul>

                <Button asChild size="lg" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl group-hover:shadow-2xl transition-all">
                  <Link href="/auth/signup?role=employer">
                    <span className="flex items-center gap-2">
                      Sign Up as Employer
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Already have an account */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Career Journey Section - Visual Diagram */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <CareerJourney />
        </div>
      </section>

      {/* Features Section - Deep Dive */}
      <FeaturesSection />

      {/* Footer */}
      <footer className="border-t bg-muted/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-sm text-muted-foreground">
              &copy; 2024 Sprout. Growth from small beginnings.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/help" className="hover:text-primary transition-colors">Help</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// How It Works Section Component
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const youthSteps = [
    {
      number: 1,
      icon: UserPlus,
      title: "Sign Up Free",
      description: "Create your profile in minutes. Add your skills, interests, and availability.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      number: 2,
      icon: Search,
      title: "Browse Jobs",
      description: "Find local gigs that match your schedule. Filter by category, pay, and location.",
      color: "from-purple-500 to-pink-500",
    },
    {
      number: 3,
      icon: CheckCircle,
      title: "Get Hired",
      description: "Apply with one click or get 'poked' by interested employers. Start working fast.",
      color: "from-pink-500 to-rose-500",
    },
    {
      number: 4,
      icon: Star,
      title: "Earn & Grow",
      description: "Complete jobs, collect reviews, and build your verified portfolio for future opportunities.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const employerSteps = [
    {
      number: 1,
      icon: Building2,
      title: "Post Your Job",
      description: "Describe what you need done. Set your budget and requirements in minutes.",
      color: "from-purple-500 to-pink-500",
    },
    {
      number: 2,
      icon: Users,
      title: "Find Talent",
      description: "Browse youth profiles with verified reviews and ratings. Find the perfect match.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      number: 3,
      icon: Zap,
      title: "Hire & Connect",
      description: "Send 'pokes' to workers you like or review applications. Start chatting instantly.",
      color: "from-pink-500 to-rose-500",
    },
    {
      number: 4,
      icon: Trophy,
      title: "Review & Repeat",
      description: "Leave feedback after completion. Build relationships with reliable youth workers.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section ref={ref} className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            How <span className="gradient-text">Sprout</span> Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting started is simple. Choose your path and start growing today.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* For Youth Workers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                <UserPlus className="h-4 w-4" />
                <span>For Youth Workers</span>
              </div>
              <h3 className="text-2xl font-bold">Start Earning in 4 Easy Steps</h3>
            </div>

            <div className="space-y-6">
              {youthSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex gap-4 group"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1 pb-6 border-l-2 border-dashed border-muted-foreground/20 pl-6 relative">
                      <div className={`absolute -left-[9px] top-8 w-4 h-4 rounded-full bg-gradient-to-br ${step.color}`} />
                      <div className="flex items-start gap-3 mb-2">
                        <Icon className={`h-5 w-5 mt-0.5 bg-gradient-to-br ${step.color} bg-clip-text text-transparent`} />
                        <h4 className="font-bold text-lg">{step.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* For Employers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
                <Building2 className="h-4 w-4" />
                <span>For Employers</span>
              </div>
              <h3 className="text-2xl font-bold">Find Great Workers in 4 Steps</h3>
            </div>

            <div className="space-y-6">
              {employerSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex gap-4 group"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1 pb-6 border-l-2 border-dashed border-muted-foreground/20 pl-6 relative">
                      <div className={`absolute -left-[9px] top-8 w-4 h-4 rounded-full bg-gradient-to-br ${step.color}`} />
                      <div className="flex items-start gap-3 mb-2">
                        <Icon className={`h-5 w-5 mt-0.5 bg-gradient-to-br ${step.color} bg-clip-text text-transparent`} />
                        <h4 className="font-bold text-lg">{step.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground mb-6">
            Ready to get started? Join thousands already using Sprout.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl hover:shadow-2xl transition-all">
              <Link href="/auth/signup">
                <span className="flex items-center gap-2">
                  Start as Youth Worker
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all">
              <Link href="/auth/signup?role=employer">
                <span className="flex items-center gap-2">
                  Start as Employer
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Features Section Component with Scroll Animations
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Briefcase,
      title: "Earn",
      subtitle: "Short-term wins",
      description: "Start earning today with local micro-jobs. From babysitting to tech help—build confidence and pocket money while discovering what you enjoy.",
      color: "from-green-500 to-emerald-600",
      benefits: [
        "Immediate income opportunities",
        "Flexible hours that work for you",
        "Discover your strengths"
      ],
      nextStep: "Use your experience to...",
    },
    {
      icon: Compass,
      title: "Explore",
      subtitle: "Future possibilities",
      description: "Turn your job experiences into career clarity. Swipe through career cards to discover paths that match your interests and the skills you're building.",
      color: "from-blue-500 to-cyan-600",
      benefits: [
        "30+ career pathways to explore",
        "Match jobs to future careers",
        "See real salary & requirements"
      ],
      nextStep: "Get insider knowledge from...",
    },
    {
      icon: Users,
      title: "Connect",
      subtitle: "Learn from pros",
      description: "Bridge the gap between today and tomorrow. Ask real professionals about their careers, get mentorship, and build relationships that open doors.",
      color: "from-purple-500 to-pink-600",
      benefits: [
        "Ask-a-Pro Q&A feature",
        "Get 'poked' by employers",
        "Build your network early"
      ],
      nextStep: "All of this fuels your...",
    },
    {
      icon: TrendingUp,
      title: "Grow",
      subtitle: "Long-term success",
      description: "Everything comes together in your growth story. Your verified portfolio of jobs, skills, and connections becomes the foundation of your professional future.",
      color: "from-orange-500 to-red-600",
      benefits: [
        "Verified work history",
        "Bronze → Silver → Gold tiers",
        "Stand out to future employers"
      ],
      nextStep: null,
    }
  ];

  return (
    <section ref={ref} className="py-24 sm:py-32 gradient-bg">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Your Connected Journey
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            From <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">today's jobs</span> to{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">tomorrow's career</span>
          </h2>
          <p className="text-lg leading-8 text-foreground/70 bg-background/50 backdrop-blur-sm rounded-xl px-4 py-3">
            Each step builds on the last. Start with small wins, discover your passions, connect with mentors, and watch your future take shape.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-7xl">
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  {/* Step number badge */}
                  <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center text-white font-bold text-sm shadow-lg z-10`}>
                    {index + 1}
                  </div>

                  <Card className="hover-lift border-2 group overflow-hidden relative h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    <CardContent className="pt-6 relative">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`rounded-xl bg-gradient-to-br ${feature.color} p-3 group-hover:scale-110 transition-transform shadow-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl">{feature.title}</h3>
                          <p className={`text-xs font-semibold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                            {feature.subtitle}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {feature.description}
                      </p>
                      <ul className="space-y-2 text-xs text-muted-foreground mb-4">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 bg-gradient-to-br ${feature.color} text-green-500`} />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Flow connector */}
                      {feature.nextStep && (
                        <div className={`pt-3 border-t border-dashed border-muted-foreground/30`}>
                          <p className={`text-xs font-medium bg-gradient-to-r ${feature.color} bg-clip-text text-transparent flex items-center gap-1`}>
                            {feature.nextStep}
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Arrow connector between cards (hidden on mobile and last item) */}
                  {index < features.length - 1 && (
                    <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}>
                        <ArrowRight className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Additional Benefits with Animated Counters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold mb-8">Everything you need to succeed</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl font-bold gradient-text">100%</div>
              <div className="text-sm text-muted-foreground">Free for Youth</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold gradient-text">Safe</div>
              <div className="text-sm text-muted-foreground">Verified Jobs</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold gradient-text">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold gradient-text">Local</div>
              <div className="text-sm text-muted-foreground">In Your Area</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

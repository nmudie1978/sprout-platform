"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Sprout,
  Briefcase,
  Shield,
  Users,
  TrendingUp,
  Heart,
  CheckCircle,
  MessageSquare,
  UserCheck,
  AlertCircle,
  Banknote,
  GraduationCap,
  Compass,
  Target
} from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Multi-layered gradient background */}
      <div className="fixed inset-0 -z-20">
        {/* Base gradient - slightly darker for visible lines */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/70 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30" />

        {/* Secondary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/40 via-white/20 to-purple-50/30 dark:from-transparent dark:via-slate-800/20 dark:to-emerald-900/20" />

        {/* Left side color accent */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-green-100/50 to-transparent dark:from-green-950/20 dark:to-transparent" />

        {/* Right side color accent */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-100/40 to-transparent dark:from-emerald-950/20 dark:to-transparent" />

        {/* Radial highlight in center-top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-green-100/60 via-emerald-50/30 to-transparent dark:from-green-900/20 dark:via-emerald-950/10 dark:to-transparent blur-2xl" />

        {/* Bottom fade with subtle color */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-emerald-50/70 via-green-50/40 to-transparent dark:from-slate-950/90 dark:via-slate-900/50 dark:to-transparent" />
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
        {/* Animated grid - more visible with higher opacity */}
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.12)_1px,transparent_1px)] bg-[size:40px_40px]"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Secondary offset grid for depth */}
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[size:40px_40px]"
          style={{ transform: "translate(20px, 20px)" }}
          animate={{
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Floating Bubbles - Subtle, on sides only (hidden on mobile for performance) */}
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

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 space-y-16">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400 mb-6">
            <Sprout className="h-4 w-4" />
            About Sprout
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Helping Young People Take Their{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              First Steps
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Sprout connects young people aged 16-20 with small, local jobs in their community.
            We help them earn money safely, build real-world skills, and start thinking about
            what comes next. This is a place to begin—and to grow.
          </p>
        </motion.div>

        {/* What Sprout Provides */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold">What Sprout Provides</h2>
          </div>

          <Card className="border-2 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8 space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Earn money through local, practical jobs</h3>
                <p className="text-muted-foreground mb-4">
                  Sprout gives young people access to small jobs posted by people in their local area.
                  These might include running errands, babysitting, pet sitting, helping with garden work,
                  basic DIY assistance, or tech support for someone less confident with devices.
                </p>
                <p className="text-muted-foreground">
                  These are real tasks that real people need help with—and they are a natural way for
                  young people to earn money while learning responsibility.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Build confidence and real-world skills</h3>
                <p className="text-muted-foreground">
                  Every job, no matter how small, teaches something. Showing up on time. Communicating
                  clearly. Solving problems. Being trusted. These are the foundations of any future
                  career—and they start here.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Explore careers and plan ahead</h3>
                <p className="text-muted-foreground mb-4">
                  Sprout is more than a jobs board. We help young people understand what is out there:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    What do different jobs actually involve?
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    What skills and education do they require?
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    What do they pay—and how is that changing?
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    How is technology, including AI, reshaping work?
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  This is not career counselling. It is practical awareness—helping young people see
                  beyond the first job to the bigger picture of how work and life connect.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium text-foreground">
                  Sprout brings together earning and learning. It is designed to meet young people
                  where they are—and help them move forward with clarity and confidence.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Why Sprout Exists */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
              <Heart className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold">Why Sprout Exists</h2>
          </div>

          <Card className="border-2 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8 space-y-6">
              <p className="text-muted-foreground">
                A generation ago, first jobs were everywhere. Paper rounds. Helping at the local shop.
                Odd jobs for neighbours. These small opportunities gave young people their first taste
                of responsibility, money, and trust.
              </p>

              <p className="text-muted-foreground">
                Most of those jobs have quietly disappeared.
              </p>

              <p className="text-muted-foreground">
                Today, many young people have no clear, safe way to earn money locally before entering
                the formal job market. They miss out on the confidence that comes from being useful,
                trusted, and paid for their effort.
              </p>

              <p className="text-muted-foreground font-medium">
                Sprout exists to bring that back—in a way that fits how communities work today.
              </p>

              <p className="text-muted-foreground">
                We reconnect young people with the people around them. We make it simple for someone
                who needs a hand to find a reliable young person nearby. And we give young people a
                dignified, supportive way to take their first steps.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Safety and Trust */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Safety and Trust—Built In From Day One</h2>
          </div>

          <Card className="border-2 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8 space-y-8">
              <p className="text-muted-foreground">
                Sprout is designed around safety. It is not something we added later—it shapes every
                decision we make.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 h-fit">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Adults are verified before contact</h3>
                    <p className="text-sm text-muted-foreground">
                      Before an adult can message a young person on Sprout, they must complete identity
                      verification. This creates accountability and discourages misuse before it starts.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 h-fit">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Communication is structured</h3>
                    <p className="text-sm text-muted-foreground">
                      Messaging on Sprout is designed to keep conversations focused on jobs. We use
                      moderation tools and content guidelines to reduce inappropriate contact.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 h-fit">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Clear tools for reporting and blocking</h3>
                    <p className="text-sm text-muted-foreground">
                      If something does not feel right, young people can report or block any user
                      immediately. We take reports seriously and act quickly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 h-fit">
                    <Banknote className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Payments are agreed, not processed</h3>
                    <p className="text-sm text-muted-foreground">
                      Sprout helps young people and employers agree on fair pay for each job. Payment
                      itself happens directly between the two parties—Sprout does not hold or transfer money.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Sprout is not an employer</h3>
                <p className="text-sm text-muted-foreground">
                  We do not supervise jobs, and we do not act as an employer or agency. Young people
                  and adults make their own agreements. This keeps responsibility clear and appropriate.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-muted-foreground">
                  These choices are not restrictions—they are protections. By designing Sprout carefully,
                  we reduce pressure, limit opportunities for misuse, and create an environment where
                  young people can participate with confidence.
                </p>
                <p className="text-muted-foreground mt-3">
                  Parents should feel comfortable knowing that their child is using a platform built
                  with safety as a priority—not as an afterthought.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Who Sprout Is For */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold">Who Sprout Is For</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Young people aged 16-20</h3>
                <p className="text-sm text-muted-foreground">
                  Who want to earn money, gain experience, and start thinking seriously about their future.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Parents</h3>
                <p className="text-sm text-muted-foreground">
                  Who want their children to develop independence—but in a safe, supervised environment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Adults and families</h3>
                <p className="text-sm text-muted-foreground">
                  Who need practical help with everyday tasks and want to support young people in their community.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Local communities</h3>
                <p className="text-sm text-muted-foreground">
                  That benefit when generations connect, trust each other, and contribute together.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Growing Beyond the First Job */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
              <TrendingUp className="h-6 w-6 text-cyan-600" />
            </div>
            <h2 className="text-2xl font-bold">Growing Beyond the First Job</h2>
          </div>

          <Card className="border-2 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8 space-y-6">
              <p className="text-muted-foreground">
                Sprout is not just about one task or one payment. We are designed to grow with the young person.
              </p>

              <p className="text-muted-foreground">
                Over time, they build a track record. They gain confidence. They start to see patterns
                in what they enjoy and what they are good at.
              </p>

              <div>
                <p className="text-muted-foreground mb-4">
                  Alongside the jobs, Sprout offers tools for thinking about the future:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <Compass className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                    Understanding different industries and roles
                  </li>
                  <li className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                    Seeing what education or training leads where
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                    Recognising how skills transfer across careers
                  </li>
                  <li className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                    Staying aware of how work is evolving
                  </li>
                </ul>
              </div>

              <p className="text-muted-foreground">
                This is not about locking in a career path at 17. It is about building awareness,
                curiosity, and readiness—so that when bigger decisions come, young people are prepared.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Our Goal */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
              <Sprout className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Our Goal</h2>
          </div>

          <Card className="border-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8 space-y-6">
              <p className="text-lg text-foreground">
                Sprout exists to help young people move from school into working life with confidence,
                clarity, and real experience behind them.
              </p>

              <p className="text-muted-foreground">
                We believe that earning money and contributing to your community should be possible
                for every young person—not just those with the right connections or circumstances.
              </p>

              <p className="text-muted-foreground">
                We believe that safety, trust, and respect must be built into every platform that
                involves young people.
              </p>

              <p className="text-muted-foreground">
                And we believe that when young people are given real responsibility early, they rise to meet it.
              </p>

              <div className="pt-4 border-t border-green-200 dark:border-green-800">
                <p className="font-semibold text-green-700 dark:text-green-400">
                  Sprout is how we put those beliefs into practice.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Page Information */}
        <section className="border-t pt-8">
          <p className="text-sm text-muted-foreground text-center">
            This page is the single source of truth for understanding what Sprout is.
            It is publicly accessible at <code className="bg-muted px-2 py-0.5 rounded text-xs">/about</code> and
            linked from the main navigation, footer, and in-app settings.
          </p>
        </section>
      </div>
    </div>
  );
}

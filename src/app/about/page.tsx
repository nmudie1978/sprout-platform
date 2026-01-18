"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sprout,
  Shield,
  MessageSquare,
  UserCheck,
  AlertCircle,
  Banknote,
  Sparkles,
  MapPin,
  Brain,
  Rocket,
  ArrowRight,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

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
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-3xl space-y-12">
        {/* Hero Section */}
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Not just a jobs app.{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              A head start on life.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sprout helps you make money fast — but it&apos;s really about building your future.
          </p>
        </motion.div>

        {/* Intro Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <p className="text-muted-foreground leading-relaxed">
            Yes, you can pick up local, real-world jobs near you. Babysitting. Pet sitting. Errands. Tech help.
            Small practical tasks that people genuinely need done. You get paid quickly, on your terms, and you stay in control.
          </p>
          <div className="text-foreground font-medium space-y-1">
            <p>That money isn&apos;t just pocket change.</p>
            <p>It&apos;s independence.</p>
            <p>It&apos;s paying for certifications, courses, travel, university, or whatever you decide matters.</p>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            But Sprout doesn&apos;t stop at &quot;get a job, get paid.&quot;
          </p>
        </motion.section>

        {/* Why Sprout is Different */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Why Sprout is different</h2>
          </div>
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Most apps help you earn today.<br />
              Sprout helps you understand what&apos;s next.
            </p>
            <p className="text-foreground font-medium">
              Young people aren&apos;t short on ambition — they&apos;re short on insight.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                What jobs actually exist beyond the obvious ones?
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                What do those jobs really involve day-to-day?
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                What skills do they need?
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                What&apos;s changing because of AI and technology?
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                Which paths are growing — and which aren&apos;t?
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Sprout gives you clear, up-to-date insight into the real world of work — without lectures, pressure, or fake hype.
            </p>
          </div>
        </motion.section>

        {/* Your Path, Mapped Out */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Your path, mapped out</h2>
          </div>
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Inside Sprout, everything you do builds your <span className="font-semibold text-foreground">My Path</span>:
            </p>
            <ul className="space-y-1 text-muted-foreground pl-4">
              <li>• The jobs you&apos;ve done</li>
              <li>• The skills you&apos;re picking up</li>
              <li>• What you&apos;re naturally good at</li>
              <li>• Where those strengths could take you next</li>
            </ul>
            <div className="text-foreground font-medium space-y-1">
              <p>Small jobs turn into real experience.</p>
              <p>Experience turns into clarity.</p>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Over time, you don&apos;t just earn — you start to see a direction.
            </p>
          </div>
        </motion.section>

        {/* AI Guide */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
              <Brain className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">An AI guide that actually helps</h2>
          </div>
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Sprout includes an AI agent designed to guide, not judge.
            </p>
            <p className="text-muted-foreground">You can ask things like:</p>
            <Card className="border bg-muted/30 backdrop-blur-sm">
              <CardContent className="p-4 space-y-2 text-sm">
                <p className="italic text-foreground">&quot;What jobs suit me?&quot;</p>
                <p className="italic text-foreground">&quot;What could I work towards next?&quot;</p>
                <p className="italic text-foreground">&quot;What skills should I build?&quot;</p>
                <p className="italic text-foreground">&quot;What&apos;s the reality of this career?&quot;</p>
              </CardContent>
            </Card>
            <p className="text-muted-foreground leading-relaxed">
              It uses the latest information about jobs, skills, pay, and industry changes — including how AI is reshaping work — to help you make smarter choices, earlier.
            </p>
          </div>
        </motion.section>

        {/* Built for This Generation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
              <Rocket className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Built for this generation</h2>
          </div>
          <div className="space-y-4">
            <p className="text-muted-foreground">Sprout is for people who want:</p>
            <ul className="space-y-1 text-muted-foreground pl-4">
              <li>• Easy access to paid work</li>
              <li>• Real independence</li>
              <li>• Honest insight into careers</li>
              <li>• A clearer path forward — without being boxed in</li>
            </ul>
            <div className="text-foreground font-medium space-y-1">
              <p>You start by earning.</p>
              <p>You grow by learning.</p>
              <p>You move forward with confidence.</p>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Sprout isn&apos;t just about your first job.<br />
              It&apos;s about helping you build what comes after.
            </p>
          </div>
        </motion.section>

        {/* Safety and Trust Section - Preserved */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Safety and Trust — Built In</h2>
          </div>

          <Card className="border-2 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-5 sm:p-6 space-y-6">
              <p className="text-muted-foreground">
                Sprout is designed around safety. It shapes every decision we make.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 h-fit">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Verified adults</h3>
                    <p className="text-xs text-muted-foreground">
                      Adults complete identity verification before they can message you.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 h-fit">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Structured messaging</h3>
                    <p className="text-xs text-muted-foreground">
                      Conversations stay focused on jobs with moderation tools.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 h-fit">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Report & block</h3>
                    <p className="text-xs text-muted-foreground">
                      If something feels off, report or block anyone immediately.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 h-fit">
                    <Banknote className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Direct payment</h3>
                    <p className="text-xs text-muted-foreground">
                      You agree on pay, then handle payment directly — Sprout doesn&apos;t touch your money.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-4 text-sm text-muted-foreground">
                <p>
                  These aren&apos;t restrictions — they&apos;re protections. Parents can feel comfortable knowing safety is built in, not bolted on.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center pt-4"
        >
          <Card className="border-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              <Sprout className="h-10 w-10 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-bold mb-2">Ready to get started?</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of young people already earning and growing with Sprout.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                  <Link href="/auth/signup">
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/jobs">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Browse jobs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Footer Note */}
        <section className="border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            This page is accessible at <code className="bg-muted px-1.5 py-0.5 rounded">/about</code> and linked from the main navigation.
          </p>
        </section>
      </div>
    </div>
  );
}

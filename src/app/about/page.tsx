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
  Brain,
  Rocket,
  ArrowRight,
  Briefcase,
  TrendingUp,
  Target,
  Compass,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
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

      {/* Animated gradient blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none hidden sm:block">
        <motion.div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-green-400/30 via-emerald-300/25 to-transparent blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/4 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-teal-400/25 via-cyan-300/20 to-transparent blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] rounded-full bg-gradient-to-tl from-emerald-400/25 via-green-300/20 to-transparent blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, -15, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-green-200/15 via-emerald-100/20 to-teal-200/15 dark:from-green-800/15 dark:via-emerald-900/15 dark:to-teal-800/15 blur-3xl"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Animated grid - higher opacity for visibility */}
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.15)_1px,transparent_1px)] bg-[size:40px_40px]"
          animate={{ opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"
          style={{ transform: "translate(20px, 20px)" }}
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Floating bubbles */}
      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none hidden sm:block">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`left-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${6 + (i % 3) * 4}px`,
              height: `${6 + (i % 3) * 4}px`,
              left: `${3 + (i % 3) * 4}%`,
              top: `${12 + i * 18}%`,
              background: "radial-gradient(circle, rgba(34,197,94,0.6) 0%, rgba(34,197,94,0.2) 50%, transparent 70%)",
              boxShadow: "0 0 10px rgba(34,197,94,0.3)",
            }}
            animate={{ y: [0, -25 - (i % 3) * 10, 0], x: [0, 8 + (i % 2) * 4, 0], opacity: [0.4, 0.6, 0.4], scale: [1, 1.1, 1] }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
          />
        ))}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`right-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${6 + (i % 3) * 4}px`,
              height: `${6 + (i % 3) * 4}px`,
              right: `${3 + (i % 3) * 4}%`,
              top: `${18 + i * 16}%`,
              background: "radial-gradient(circle, rgba(16,185,129,0.6) 0%, rgba(16,185,129,0.2) 50%, transparent 70%)",
              boxShadow: "0 0 10px rgba(16,185,129,0.3)",
            }}
            animate={{ y: [0, -20 - (i % 3) * 8, 0], x: [0, -8 - (i % 2) * 4, 0], opacity: [0.4, 0.6, 0.4], scale: [1, 1.1, 1] }}
            transition={{ duration: 11 + i * 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 1.3 + 0.5 }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-16 pb-12 sm:pt-24 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full bg-green-500/10 backdrop-blur-sm border border-green-500/20 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400 mb-8"
            >
              <Sprout className="h-4 w-4" />
              About Sprout
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
              Not just a jobs app.
              <br />
              <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                A head start on life.
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Sprout helps you make money fast — but it&apos;s really about building your future.
            </p>
          </motion.div>
        </section>

        {/* Value Props - Bento Grid */}
        <section className="container mx-auto px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-4">
              {/* Main Feature Card */}
              <Card className="md:col-span-2 border-0 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-900/80 dark:to-slate-800/60 backdrop-blur-xl shadow-xl overflow-hidden">
                <CardContent className="p-8 sm:p-10">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                      <Briefcase className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3">Real jobs. Real money. Your terms.</h2>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        Pick up local jobs near you — babysitting, pet sitting, errands, tech help.
                        Small practical tasks that people genuinely need done. You get paid quickly,
                        stay in control, and build independence on your own schedule.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Independence Card */}
              <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-900/30 dark:to-pink-900/30 backdrop-blur-xl shadow-lg">
                <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 w-fit mb-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">More than pocket change</h3>
                  <p className="text-muted-foreground flex-1">
                    That money is independence. It&apos;s certifications, courses, travel, university —
                    whatever you decide matters.
                  </p>
                </CardContent>
              </Card>

              {/* Insight Card */}
              <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-900/30 dark:to-cyan-900/30 backdrop-blur-xl shadow-lg">
                <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 w-fit mb-4">
                    <Compass className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Beyond "get a job"</h3>
                  <p className="text-muted-foreground flex-1">
                    Most apps help you earn today. Sprout helps you understand what&apos;s next —
                    with real insight into careers, skills, and where work is heading.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </section>

        {/* Pull Quote */}
        <section className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="relative">
              <Sparkles className="absolute -top-4 -left-4 h-8 w-8 text-purple-400/50" />
              <blockquote className="text-2xl sm:text-3xl font-medium text-foreground leading-relaxed">
                Young people aren&apos;t short on ambition —
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> they&apos;re short on insight.</span>
              </blockquote>
              <Sparkles className="absolute -bottom-4 -right-4 h-8 w-8 text-pink-400/50" />
            </div>
          </motion.div>
        </section>

        {/* My Path Section */}
        <section className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <Card className="border-0 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 dark:from-emerald-900/30 dark:via-green-900/30 dark:to-teal-900/30 backdrop-blur-xl shadow-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 sm:p-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Your path, mapped out</h2>
                    </div>
                    <p className="text-muted-foreground text-lg mb-6">
                      Everything you do builds your <span className="font-semibold text-foreground">My Path</span> —
                      a living record of where you&apos;ve been and where you could go.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-muted-foreground">Jobs completed → Experience gained</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Skills identified → Strengths revealed</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-teal-500" />
                        <span className="text-muted-foreground">Direction emerging → Future forming</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-8 sm:p-10 flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-16 w-16 mx-auto mb-4 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-lg font-medium text-foreground">Small jobs → Real experience</p>
                      <p className="text-lg font-medium text-foreground">Experience → Clarity</p>
                      <p className="text-lg font-medium text-emerald-600 dark:text-emerald-400 mt-2">Clarity → Direction</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* AI Guide Section */}
        <section className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-900/30 dark:to-orange-900/30 backdrop-blur-xl shadow-xl">
              <CardContent className="p-8 sm:p-10">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">An AI guide that actually helps</h2>
                    </div>
                    <p className="text-muted-foreground text-lg mb-6">
                      Sprout includes an AI agent designed to guide, not judge. Ask anything about careers,
                      skills, or your next move — and get honest, up-to-date answers.
                    </p>
                    <p className="text-muted-foreground">
                      It knows about jobs, pay, industry changes, and how AI is reshaping work —
                      helping you make smarter choices, earlier.
                    </p>
                  </div>
                  <div className="lg:w-80 w-full">
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-3 backdrop-blur-sm border border-amber-500/20">
                      <div className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">Ask things like:</div>
                      {[
                        "What jobs suit me?",
                        "What could I work towards?",
                        "What skills should I build?",
                        "What's the reality of this career?",
                      ].map((q, i) => (
                        <div key={i} className="bg-white/80 dark:bg-slate-700/80 rounded-lg px-4 py-2.5 text-sm">
                          "{q}"
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Built For This Generation */}
        <section className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Built for this generation</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[
                { icon: Briefcase, text: "Easy access to paid work" },
                { icon: Zap, text: "Real independence" },
                { icon: Compass, text: "Honest career insight" },
                { icon: Target, text: "A path forward" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-5 border border-green-500/10"
                >
                  <item.icon className="h-6 w-6 mx-auto mb-3 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium">{item.text}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 space-y-2 text-lg">
              <p className="text-muted-foreground">You start by <span className="font-semibold text-foreground">earning</span>.</p>
              <p className="text-muted-foreground">You grow by <span className="font-semibold text-foreground">learning</span>.</p>
              <p className="text-muted-foreground">You move forward with <span className="font-semibold text-green-600 dark:text-green-400">confidence</span>.</p>
            </div>
          </motion.div>
        </section>

        {/* Safety Section */}
        <section className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Safety built in, not bolted on</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: UserCheck, color: "blue", title: "Verified adults", desc: "Identity verification before any messaging" },
                { icon: MessageSquare, color: "purple", title: "Structured chat", desc: "Conversations stay focused on jobs" },
                { icon: AlertCircle, color: "red", title: "Report & block", desc: "Instant tools if something feels off" },
                { icon: Banknote, color: "green", title: "Direct payment", desc: "You handle money directly — we don't touch it" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm h-full">
                    <CardContent className="p-5 flex gap-4">
                      <div className={`p-2.5 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-900/30 h-fit`}>
                        <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-muted-foreground mt-6 text-sm">
              Parents can feel comfortable knowing safety is a foundation, not an afterthought.
            </p>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xl overflow-hidden">
              <CardContent className="p-8 sm:p-12 text-center relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />
                <div className="relative">
                  <Sprout className="h-12 w-12 mx-auto mb-6 opacity-90" />
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3">Ready to start growing?</h3>
                  <p className="text-green-100 mb-8 text-lg">
                    Join thousands of young people already building their future with Sprout.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg" variant="secondary" className="text-green-700 font-semibold">
                      <Link href="/auth/signup">
                        Get started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      <Link href="/jobs">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Browse jobs
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-green-500/10">
          <p className="text-center text-xs text-muted-foreground">
            This page is accessible at <code className="bg-muted px-1.5 py-0.5 rounded">/about</code>
          </p>
        </footer>
      </div>
    </div>
  );
}

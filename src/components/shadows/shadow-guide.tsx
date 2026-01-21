"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Search,
  Send,
  CheckCircle2,
  Building,
  Lightbulb,
  AlertCircle,
} from "lucide-react";

interface ShadowGuideProps {
  onDismiss?: () => void;
  compact?: boolean;
}

const STEPS = [
  {
    icon: Search,
    title: "Choose a role you're curious about",
    description: "Pick one specific role to focus your observation on.",
  },
  {
    icon: Send,
    title: "Send a respectful request",
    description: "Reach out to a professional or organisation to observe.",
  },
  {
    icon: CheckCircle2,
    title: "Get approved",
    description: "Wait for confirmation from your host.",
  },
  {
    icon: Building,
    title: "Observe how the job really works",
    description: "See the day-to-day reality of the role.",
  },
  {
    icon: Lightbulb,
    title: "Reflect on what you learned",
    description: "Capture your insights and next steps.",
  },
];

export function ShadowGuide({ onDismiss, compact = false }: ShadowGuideProps) {
  if (compact) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 shrink-0">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-1">How Career Shadowing Works</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Observe a real workplace to understand what a job is actually like.
              </p>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Career shadowing is <strong>observation only</strong>. You are not expected to work or perform tasks.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-emerald-500/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-900/80 shadow-sm">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">How Career Shadowing Works</h2>
              <p className="text-sm text-muted-foreground">
                Your guide to observing real workplaces
              </p>
            </div>
          </div>

          {/* Observation Only Callout */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                Career shadowing is observation only.
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                You are not expected to work or perform tasks. This is about learning, not doing.
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <CardContent className="p-6">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-4">
            The Process
          </h3>
          <div className="space-y-4">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-600 text-sm font-semibold shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2 mb-1">
                    <step.icon className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium text-sm">{step.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* What This Is NOT */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium text-sm mb-3">What This Is NOT</h3>
            <div className="grid gap-2">
              {[
                "Not unpaid work — you're observing, not working",
                "Not a job trial — no performance expectations",
                "Not an interview — no pressure to impress",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dismiss Button */}
          {onDismiss && (
            <div className="mt-6 pt-6 border-t">
              <Button onClick={onDismiss} variant="outline" className="w-full">
                Got it, let's start
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

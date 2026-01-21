"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  ShoppingBag,
  PiggyBank,
  TrendingUp,
  Clock,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Info,
  Sparkles,
  Shield,
  Users,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

// Types
interface MicroGuideStep {
  title: string;
  points: string[];
  tip?: string;
}

interface MoneyTopic {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  steps: MicroGuideStep[];
  interactive?: {
    type: "time-slider";
    label: string;
  };
}

// Topic Data
const MONEY_TOPICS: MoneyTopic[] = [
  {
    id: "spending",
    title: "Spending",
    subtitle: "Using money now",
    icon: ShoppingBag,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    steps: [
      {
        title: "What is spending?",
        points: [
          "Spending means using money to buy things you need or want right now",
          "This includes food, transport, clothes, entertainment, and gifts",
          "Once spent, the money is gone — you've exchanged it for something else",
          "Spending isn't bad — it's a normal part of life",
        ],
        tip: "The key is finding a balance that works for you.",
      },
      {
        title: "Mindful spending",
        points: [
          "Ask yourself: Do I need this, or just want it?",
          "Waiting a day before buying can help you decide",
          "Small purchases add up over time",
          "It's okay to spend on things that make you happy",
          "Tracking where your money goes can be eye-opening",
        ],
      },
    ],
  },
  {
    id: "saving",
    title: "Saving",
    subtitle: "Setting money aside",
    icon: PiggyBank,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    steps: [
      {
        title: "What is saving?",
        points: [
          "Saving means keeping money for later instead of spending it now",
          "Savings can be for short-term goals (new phone, trip) or emergencies",
          "Most people save in a bank account where it's safe",
          "Your money stays accessible — you can use it when you need to",
        ],
        tip: "Even small amounts saved regularly add up over time.",
      },
      {
        title: "Why save?",
        points: [
          "Gives you a safety net for unexpected costs",
          "Helps you afford bigger things without borrowing",
          "Reduces money stress",
          "Some savings accounts pay a small amount of interest",
          "Building the habit early makes it easier later",
        ],
      },
      {
        title: "How to start",
        points: [
          "Set a simple goal (e.g., save for something specific)",
          "Put aside a small amount each time you earn money",
          "Keep savings separate from everyday spending money",
          "Automate it if possible — then you don't have to think about it",
        ],
      },
    ],
  },
  {
    id: "investing",
    title: "Investing",
    subtitle: "Growing money long-term",
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    steps: [
      {
        title: "What is investing?",
        points: [
          "Investing means putting money into things that might grow in value over time",
          "This often means owning small pieces of many companies (shares/stocks)",
          "Investments can go up or down — there's no guarantee",
          "It's generally a long-term approach (years, not months)",
        ],
        tip: "Investing is about time in the market, not timing the market.",
      },
      {
        title: "Risk and reward",
        points: [
          "Higher potential reward usually means higher risk",
          "Spreading money across many investments reduces risk",
          "Short-term, markets can be unpredictable",
          "Long-term, historically markets have tended to grow",
          "You should only invest money you won't need soon",
        ],
      },
      {
        title: "Getting started (when you're ready)",
        points: [
          "Most investment accounts require you to be 18+",
          "Under 18? A parent or guardian would need to help set things up",
          "Rules vary by country — always check local regulations",
          "Start by learning — there's no rush to invest",
          "Many people start with diversified funds rather than individual stocks",
        ],
      },
    ],
    interactive: {
      type: "time-slider",
      label: "See how time affects growth",
    },
  },
  {
    id: "pension",
    title: "Long-Term Saving",
    subtitle: "Planning far ahead",
    icon: Clock,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    steps: [
      {
        title: "What is long-term saving?",
        points: [
          "Money set aside for the very distant future (like retirement)",
          "Often called pensions, superannuation, or retirement accounts",
          "Usually locked away until you're much older",
          "Often has tax benefits (rules vary by country)",
        ],
        tip: "Starting early — even with tiny amounts — can make a huge difference.",
      },
      {
        title: "Why it matters for young people",
        points: [
          "Time is your biggest advantage — more years = more growth",
          "Small amounts now can become significant later",
          "Many employers contribute to pensions when you start working",
          "Getting into the habit early sets you up well",
        ],
      },
      {
        title: "How to explore this",
        points: [
          "Talk to a parent or guardian about how it works in your country",
          "When you get a job, ask about pension/retirement contributions",
          "You don't need to do anything immediately — awareness is the first step",
          "Some countries allow parents to set up accounts for children",
        ],
      },
    ],
  },
  {
    id: "skills",
    title: "Invest in Yourself",
    subtitle: "Skills & tools",
    icon: GraduationCap,
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
    steps: [
      {
        title: "The best investment?",
        points: [
          "Often, the highest return comes from investing in yourself",
          "This means building skills, knowledge, and capabilities",
          "Unlike markets, your skills can't crash overnight",
          "Better skills usually lead to better opportunities and income",
        ],
        tip: "A course, certification, or tool that helps you earn more pays for itself many times over.",
      },
      {
        title: "What counts as self-investment?",
        points: [
          "Courses and certifications (online or in-person)",
          "Books, tutorials, and learning materials",
          "Tools and equipment for your work or craft",
          "Transport to get to better opportunities",
          "Networking and building relationships",
        ],
      },
      {
        title: "Making smart choices",
        points: [
          "Focus on skills that are in demand",
          "Look for free or low-cost options first",
          "Ask people in careers you're interested in what skills matter",
          "Balance learning with doing — experience matters too",
          "Your health and wellbeing are investments too",
        ],
      },
    ],
  },
];

// Disclaimer Component
function Disclaimer() {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-muted">
      <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <p className="text-[11px] text-muted-foreground">
        Educational content only. Not financial advice. Investing involves risk.
        Consult a qualified professional for personal financial decisions.
      </p>
    </div>
  );
}

// Time Growth Visualizer (Illustrative only)
function TimeGrowthVisualizer() {
  const [years, setYears] = useState([10]);

  // Illustrative compound growth visualization (not real rates)
  const getGrowthVisualization = (y: number) => {
    // Simple illustrative visualization - not actual financial projections
    const base = 100;
    const growthFactors = {
      5: 1.3,
      10: 1.7,
      15: 2.2,
      20: 2.9,
      25: 3.8,
      30: 5.0,
    };
    const factor = growthFactors[y as keyof typeof growthFactors] || 1 + (y * 0.06);
    return Math.round(base * factor);
  };

  const visualValue = getGrowthVisualization(years[0]);

  return (
    <div className="space-y-4 p-4 rounded-lg bg-muted/30">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Time horizon</span>
        <span className="font-medium">{years[0]} years</span>
      </div>
      <Slider
        value={years}
        onValueChange={setYears}
        min={5}
        max={30}
        step={5}
        className="w-full"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">5 years</span>
        <span className="text-xs text-muted-foreground">30 years</span>
      </div>

      {/* Visual representation */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">If you started with</div>
            <div className="h-4 w-20 rounded bg-emerald-500/30" />
            <div className="text-xs font-medium mt-1">100 units</div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Could become ~</div>
            <div
              className="h-4 rounded bg-emerald-500/60 transition-all duration-500"
              style={{ width: `${Math.min((visualValue / 500) * 100, 100)}%` }}
            />
            <div className="text-xs font-medium mt-1">{visualValue} units*</div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground italic">
          *Illustrative only. Actual returns vary and are not guaranteed. Past performance does not predict future results.
        </p>
      </div>
    </div>
  );
}

// Topic Card Component
function TopicCard({
  topic,
  onClick,
}: {
  topic: MoneyTopic;
  onClick: () => void;
}) {
  const Icon = topic.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${topic.bgColor}`}>
              <Icon className={`h-5 w-5 ${topic.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{topic.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {topic.subtitle}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Micro Guide Dialog Component
function MicroGuideDialog({
  topic,
  isOpen,
  onClose,
}: {
  topic: MoneyTopic | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!topic) return null;

  const Icon = topic.icon;
  const step = topic.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === topic.steps.length - 1;
  const showInteractive = topic.interactive && isLastStep;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="text-left p-4 pb-3 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${topic.bgColor}`}>
              <Icon className={`h-5 w-5 ${topic.color}`} />
            </div>
            <div>
              <DialogTitle className="text-lg">{topic.title}</DialogTitle>
              <p className="text-xs text-muted-foreground">{topic.subtitle}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 py-3 shrink-0">
            {topic.steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? "w-6 bg-primary"
                    : idx < currentStep
                    ? "w-1.5 bg-primary/40"
                    : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 pb-4"
              >
                <h3 className="font-semibold text-base">{step.title}</h3>

                <ul className="space-y-3">
                  {step.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>

                {step.tip && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900 dark:text-amber-100">
                      {step.tip}
                    </p>
                  </div>
                )}

                {showInteractive && (
                  <div className="mt-6">
                    <TimeGrowthVisualizer />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="p-4 pt-3 border-t space-y-3 shrink-0">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePrev}
                disabled={isFirstStep}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              {isLastStep ? (
                <Button className="flex-1" onClick={handleClose}>
                  Done
                </Button>
              ) : (
                <Button className="flex-1" onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
            <Disclaimer />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export default function MoneySmartsContent() {
  const [selectedTopic, setSelectedTopic] = useState<MoneyTopic | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleTopicClick = (topic: MoneyTopic) => {
    setSelectedTopic(topic);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedTopic(null), 300);
  };

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-dashed border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">You've earned money — now what?</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Some people spend it.</p>
                  <p>Some people save it.</p>
                  <p>Some people invest for the long term.</p>
                </div>
                <p className="text-sm text-muted-foreground pt-2 border-t border-dashed">
                  This section gives a simple overview of what those choices mean.
                  <br />
                  <span className="text-xs italic">
                    It's about understanding money — not telling you what to do.
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Topic Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground px-1">
          Explore topics
        </h3>
        <div className="grid gap-3">
          {MONEY_TOPICS.map((topic, idx) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
            >
              <TopicCard topic={topic} onClick={() => handleTopicClick(topic)} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Key Principles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Key principles
            </h4>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>There's no single "right" way — it depends on your goals and situation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Starting early with good habits matters more than starting with lots of money</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Always keep some money accessible for emergencies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>If something sounds too good to be true, it probably is</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Parent/Guardian Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <Users className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Talk to a trusted adult.</span>{" "}
            Many financial products and accounts have age requirements. A parent, guardian,
            or trusted adult can help you understand options available in your country.
          </p>
        </div>
      </motion.div>

      {/* Footer Disclaimer */}
      <Disclaimer />

      {/* Micro Guide Dialog */}
      <MicroGuideDialog
        topic={selectedTopic}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
      />
    </div>
  );
}

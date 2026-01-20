"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, AlertCircle, Info } from "lucide-react";

/**
 * MicroGuideCard - Placeholder AI Quick Guide Component
 *
 * This is a UI placeholder for an AI-powered micro-guide feature.
 * Currently uses static content that will be replaced with AI-generated
 * guidance in a future implementation.
 *
 * TODO: Future AI Implementation
 * - Inject AI generation here to create personalised guidance
 * - Fetch dynamic content based on career/job type
 * - Add user personalisation based on experience level
 * - Consider caching generated guides for performance
 */

export interface MicroGuideContent {
  title: string;
  realityCheck: string;
  tips: string[];
  commonMistake: string;
}

interface MicroGuideCardProps {
  /** The guide content to display */
  content: MicroGuideContent;
}

export function MicroGuideCard({ content }: MicroGuideCardProps) {
  return (
    <Card className="border border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                Quick Guide
              </h4>
              <p className="text-[10px] text-amber-700/70 dark:text-amber-300/70">
                3–5 minutes
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[9px] px-1.5 py-0.5 bg-amber-100/50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
          >
            Preview – guidance only
          </Badge>
        </div>

        {/* Intro */}
        <p className="text-xs text-muted-foreground mb-3">
          Helpful tips for doing well in this kind of role.
        </p>

        {/* Reality Check */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Info className="h-3 w-3 text-blue-500" />
            <span className="text-[10px] font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">
              Reality Check
            </span>
          </div>
          <p className="text-xs text-muted-foreground pl-4">
            {content.realityCheck}
          </p>
        </div>

        {/* Practical Tips */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
              Practical Tips
            </span>
          </div>
          <ul className="space-y-1 pl-4">
            {content.tips.map((tip, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Common Mistake */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle className="h-3 w-3 text-orange-500" />
            <span className="text-[10px] font-medium text-orange-700 dark:text-orange-400 uppercase tracking-wide">
              Common Mistake to Avoid
            </span>
          </div>
          <p className="text-xs text-muted-foreground pl-4">
            {content.commonMistake}
          </p>
        </div>

        {/* Disclaimer */}
        <div className="pt-2 border-t border-amber-200/50 dark:border-amber-800/30">
          <p className="text-[10px] text-muted-foreground/70 italic">
            This is general guidance based on common workplaces. Always follow your job poster's instructions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Placeholder guide content for different career/job categories.
 *
 * TODO: Future Implementation
 * - Replace with AI-generated content based on specific career
 * - Add personalisation based on user's experience level
 * - Fetch from API or generate on-demand
 * - Consider A/B testing different guide formats
 */

const PLACEHOLDER_GUIDES: Record<string, MicroGuideContent> = {
  // Retail / Shop assistant
  "retail": {
    title: "Retail & Shop Work",
    realityCheck: "Retail work involves being on your feet most of the day and staying friendly even when tired – it's rewarding but can be physically demanding.",
    tips: [
      "Greet customers with a smile and make eye contact – first impressions matter",
      "Learn where products are located so you can help customers quickly",
      "If you don't know an answer, it's okay to say 'Let me find out for you'",
      "Keep your work area tidy during quiet moments",
      "Ask colleagues for help when things get busy – teamwork makes it easier"
    ],
    commonMistake: "Using your phone during work hours, even when it seems quiet. Managers notice, and customers may need help at any moment."
  },

  // Kitchen / Cafe helper
  "hospitality": {
    title: "Kitchen & Cafe Work",
    realityCheck: "Kitchen work can be fast-paced and hot – you'll need to stay calm under pressure and be comfortable with physical tasks like carrying trays.",
    tips: [
      "Always wash your hands before handling food and after breaks",
      "Listen carefully to orders and repeat them back to confirm",
      "Clean as you go – it prevents mess building up and keeps things safe",
      "Ask questions if you're unsure about food allergies or special requests",
      "Stay hydrated and take your breaks – you'll work better when rested"
    ],
    commonMistake: "Rushing and forgetting food safety basics. Taking a few extra seconds to do things properly is better than making someone ill."
  },

  // Delivery / Courier
  "delivery": {
    title: "Delivery & Courier Work",
    realityCheck: "Delivery work offers flexibility but requires self-motivation – you're often working alone and need to manage your own time well.",
    tips: [
      "Plan your route before you start to save time and energy",
      "Keep your phone charged and have a backup charging option",
      "Be polite and patient at every delivery – people remember good service",
      "Check items carefully before leaving the pickup point",
      "Keep delivery receipts or photos as proof of delivery"
    ],
    commonMistake: "Not checking the delivery address carefully. Double-check flat numbers, building names, and any special instructions before you set off."
  },

  // Junior IT / Tech helper
  "technology": {
    title: "IT & Tech Support",
    realityCheck: "Tech support requires patience and good communication – you'll often help people who are frustrated or don't understand technical terms.",
    tips: [
      "Listen fully to the problem before jumping to solutions",
      "Explain things in simple terms without being condescending",
      "Document what you do – it helps you and others learn from issues",
      "Don't be afraid to search for solutions – even experts do this",
      "Test your fix properly before saying the problem is solved"
    ],
    commonMistake: "Making assumptions about what the user did wrong. Ask questions first – the problem might not be what you initially think."
  },

  // Childcare assistant
  "childcare": {
    title: "Childcare & Youth Work",
    realityCheck: "Working with children is rewarding but requires constant attention and energy – you need to be fully present and alert at all times.",
    tips: [
      "Get down to the child's level when talking to them",
      "Be consistent with rules – children feel safer with clear boundaries",
      "Always know where the children in your care are",
      "Report any concerns to your supervisor, even if you're unsure",
      "Take genuine interest in what children tell you – it builds trust"
    ],
    commonMistake: "Using your phone while supervising children. Even a moment of distraction can lead to accidents or make children feel ignored."
  },

  // General first job guide (fallback)
  "general": {
    title: "Your First Job",
    realityCheck: "Starting any new job feels overwhelming at first – everyone goes through this, and it's normal to take a few weeks to feel confident.",
    tips: [
      "Arrive a few minutes early – it shows you're reliable and gives you time to settle",
      "Write things down so you don't forget instructions or tasks",
      "Ask questions when you're unsure – it's better than making avoidable mistakes",
      "Be friendly to everyone, from managers to cleaners – respect matters",
      "If you make a mistake, own up to it quickly and learn from it"
    ],
    commonMistake: "Being afraid to ask for help because you think you should already know everything. Nobody expects you to be perfect on day one."
  }
};

/**
 * Get the appropriate guide content for a career title.
 *
 * TODO: Future Implementation
 * - Use AI to match career titles to guide categories more intelligently
 * - Generate custom guides for specific career paths
 * - Consider user's stated experience level for personalisation
 *
 * @param careerTitle - The title of the career to get a guide for
 * @returns MicroGuideContent for the matched category
 */
export function getGuideForCareer(careerTitle: string): MicroGuideContent {
  const title = careerTitle.toLowerCase();

  // TODO: Replace with AI-powered categorisation
  // This is a simple keyword matching approach as a placeholder

  if (title.includes("retail") || title.includes("shop") || title.includes("sales") || title.includes("cashier") || title.includes("store")) {
    return PLACEHOLDER_GUIDES.retail;
  }

  if (title.includes("kitchen") || title.includes("cafe") || title.includes("restaurant") || title.includes("barista") || title.includes("waiter") || title.includes("chef") || title.includes("food") || title.includes("hospitality")) {
    return PLACEHOLDER_GUIDES.hospitality;
  }

  if (title.includes("delivery") || title.includes("courier") || title.includes("driver") || title.includes("logistics") || title.includes("warehouse")) {
    return PLACEHOLDER_GUIDES.delivery;
  }

  if (title.includes("it") || title.includes("tech") || title.includes("software") || title.includes("developer") || title.includes("support") || title.includes("computer") || title.includes("cyber") || title.includes("data")) {
    return PLACEHOLDER_GUIDES.technology;
  }

  if (title.includes("child") || title.includes("nursery") || title.includes("babysit") || title.includes("youth") || title.includes("teacher") || title.includes("education") || title.includes("care")) {
    return PLACEHOLDER_GUIDES.childcare;
  }

  // Default to general first job guide
  return PLACEHOLDER_GUIDES.general;
}

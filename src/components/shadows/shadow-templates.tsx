"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Eye, MessageSquare, Users, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

export type ShadowFormat = "WALKTHROUGH" | "HALF_DAY" | "FULL_DAY";

interface ShadowTemplate {
  format: ShadowFormat;
  title: string;
  duration: string;
  description: string;
  activities: string[];
  bestFor: string;
  icon: React.ElementType;
}

const TEMPLATES: ShadowTemplate[] = [
  {
    format: "WALKTHROUGH",
    title: "2-Hour Walkthrough",
    duration: "~2 hours",
    description: "A quick introduction to the workplace and role.",
    activities: [
      "Workplace tour",
      "Role overview with the host",
      "Q&A session",
    ],
    bestFor: "First-time shadowing or exploring multiple roles",
    icon: Eye,
  },
  {
    format: "HALF_DAY",
    title: "Half-Day Observation",
    duration: "3-4 hours",
    description: "A deeper look at daily work and interactions.",
    activities: [
      "Sit-in on real work sessions",
      "Observe meetings or tasks",
      "Short reflection with host",
    ],
    bestFor: "Getting a real sense of the work rhythm",
    icon: Clock,
  },
  {
    format: "FULL_DAY",
    title: "Day-in-the-Life",
    duration: "6-8 hours",
    description: "Experience a complete workday from start to finish.",
    activities: [
      "Structured itinerary",
      "Multiple observation blocks",
      "Lunch/break conversations",
      "End-of-day debrief",
    ],
    bestFor: "Serious career exploration",
    icon: Users,
  },
];

interface ShadowTemplatesProps {
  selectedFormat: ShadowFormat;
  onSelect: (format: ShadowFormat) => void;
  disabled?: boolean;
}

export function ShadowTemplates({
  selectedFormat,
  onSelect,
  disabled = false,
}: ShadowTemplatesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-1">Choose Your Format</h3>
        <p className="text-sm text-muted-foreground">
          Select the type of shadowing experience you'd prefer.
        </p>
      </div>

      <div className="grid gap-4">
        {TEMPLATES.map((template, index) => {
          const isSelected = selectedFormat === template.format;
          const Icon = template.icon;

          return (
            <motion.div
              key={template.format}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => !disabled && onSelect(template.format)}
                disabled={disabled}
                className={cn(
                  "w-full text-left transition-all duration-200",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Card
                  className={cn(
                    "transition-all duration-200",
                    isSelected
                      ? "border-2 border-primary bg-primary/5 shadow-md"
                      : "hover:border-muted-foreground/30 hover:shadow-sm"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={cn(
                          "p-2.5 rounded-xl shrink-0 transition-colors",
                          isSelected
                            ? "bg-primary/10"
                            : "bg-muted"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{template.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {template.duration}
                            </Badge>
                            {isSelected && (
                              <div className="p-1 rounded-full bg-primary text-white">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {template.description}
                        </p>

                        {/* Activities */}
                        <div className="space-y-1.5 mb-3">
                          {template.activities.map((activity, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <div className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                              <span>{activity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Best For */}
                        <div className="flex items-center gap-2 text-xs">
                          <Coffee className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700 dark:text-emerald-400">
                            Best for: {template.bestFor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Export template data for use elsewhere
export function getTemplateInfo(format: ShadowFormat): ShadowTemplate | undefined {
  return TEMPLATES.find(t => t.format === format);
}

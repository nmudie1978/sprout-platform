"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Shirt,
  MessageSquare,
  Eye,
  AlertCircle,
  CheckCircle2,
  Bell,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getTemplateInfo, type ShadowFormat } from "./shadow-templates";

interface ShadowDetails {
  id: string;
  roleTitle: string;
  format: ShadowFormat;
  scheduledDate: Date;
  scheduledStartTime: string;
  scheduledEndTime: string;
  locationName?: string;
  locationAddress?: string;
  hostName?: string;
  hostCompany?: string;
  requiresGuardianConsent?: boolean;
  guardianNotified?: boolean;
}

interface ShadowPrepProps {
  shadow: ShadowDetails;
  onAddToCalendar?: () => void;
  onComplete?: () => void;
}

// Pre-shadow checklist items
const CHECKLIST_ITEMS = [
  {
    id: "arrival",
    label: "I know my arrival time",
    description: "Plan to arrive 5-10 minutes early",
    icon: Clock,
  },
  {
    id: "questions",
    label: "I've prepared some questions",
    description: "Have 2-3 questions ready to ask",
    icon: MessageSquare,
  },
  {
    id: "transport",
    label: "I've planned my transport",
    description: "Know how you're getting there and back",
    icon: MapPin,
  },
  {
    id: "guardian",
    label: "Guardian has been notified",
    description: "Someone knows where you'll be",
    icon: User,
  },
];

// Dress code suggestions by industry
const DRESS_CODE_TIPS = [
  "Dress smart-casual unless told otherwise",
  "Avoid strong fragrances",
  "Wear comfortable but presentable shoes",
  "Keep jewellery minimal",
];

// Behaviour expectations
const BEHAVIOUR_EXPECTATIONS = [
  "Observe quietly, ask before interrupting",
  "Put your phone on silent",
  "Take notes if allowed",
  "Listen more than you speak",
  "Say thank you to everyone who helps you",
];

export function ShadowPrep({
  shadow,
  onAddToCalendar,
  onComplete,
}: ShadowPrepProps) {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const templateInfo = getTemplateInfo(shadow.format);

  const toggleChecked = (itemId: string) => {
    setCheckedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const allChecked = CHECKLIST_ITEMS.every(item =>
    item.id === "guardian"
      ? !shadow.requiresGuardianConsent || checkedItems.includes(item.id)
      : checkedItems.includes(item.id)
  );

  return (
    <div className="space-y-6">
      {/* What to Expect Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            What to Expect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Shadow Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">
                  {format(new Date(shadow.scheduledDate), "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {shadow.scheduledStartTime} - {shadow.scheduledEndTime}
                </p>
              </div>
            </div>

            {(shadow.locationName || shadow.locationAddress) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  {shadow.locationName && (
                    <p className="font-medium text-sm">{shadow.locationName}</p>
                  )}
                  {shadow.locationAddress && (
                    <p className="text-xs text-muted-foreground">{shadow.locationAddress}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Format Badge */}
          {templateInfo && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Badge variant="secondary">{templateInfo.title}</Badge>
              <span className="text-sm text-muted-foreground">
                {templateInfo.description}
              </span>
            </div>
          )}

          {/* Add to Calendar Button */}
          {onAddToCalendar && (
            <Button variant="outline" onClick={onAddToCalendar} className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Observation Only Reminder */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
        <AlertCircle className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-purple-800 dark:text-purple-200 text-sm">
            Remember: Observation Only
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
            You are there to watch and learn, not to work. There are no performance expectations.
          </p>
        </div>
      </div>

      {/* Dress Code */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shirt className="h-4 w-4 text-muted-foreground" />
            Dress Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DRESS_CODE_TIPS.map((tip, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                <span className="text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Behaviour Expectations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Behaviour Expectations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {BEHAVIOUR_EXPECTATIONS.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pre-Shadow Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pre-Shadow Checklist</CardTitle>
          <p className="text-xs text-muted-foreground">
            Complete this before your shadow day
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CHECKLIST_ITEMS.map((item, index) => {
              const isGuardianItem = item.id === "guardian";
              const shouldShow = !isGuardianItem || shadow.requiresGuardianConsent;

              if (!shouldShow) return null;

              const isChecked = checkedItems.includes(item.id);
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <label
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      isChecked
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "hover:border-muted-foreground/30"
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleChecked(item.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className={cn(
                          "h-4 w-4",
                          isChecked ? "text-emerald-500" : "text-muted-foreground"
                        )} />
                        <span className={cn(
                          "font-medium text-sm",
                          isChecked && "text-emerald-700 dark:text-emerald-400"
                        )}>
                          {item.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </label>
                </motion.div>
              );
            })}
          </div>

          {/* Ready Button */}
          {onComplete && (
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={onComplete}
                disabled={!allChecked}
                className="w-full"
              >
                {allChecked ? (
                  <>
                    I'm Ready!
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  "Complete the checklist above"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Host Info */}
      {(shadow.hostName || shadow.hostCompany) && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {shadow.hostName || shadow.hostCompany}
                </p>
                {shadow.hostName && shadow.hostCompany && (
                  <p className="text-xs text-muted-foreground">{shadow.hostCompany}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your host for the {shadow.roleTitle} shadow
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

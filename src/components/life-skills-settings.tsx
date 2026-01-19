"use client";

import { Lightbulb } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLifeSkills } from "@/components/life-skills-provider";

export function LifeSkillsSettings() {
  const { isEnabled, setEnabled } = useLifeSkills();

  return (
    <div className="flex items-center justify-between py-4 px-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Lightbulb className="h-5 w-5 text-amber-600" />
        </div>
        <div className="space-y-0.5">
          <Label htmlFor="life-skills-toggle" className="text-sm font-medium cursor-pointer">
            Work tips
          </Label>
          <p className="text-xs text-muted-foreground">
            Helpful guidance when you accept jobs or chat with job posters
          </p>
        </div>
      </div>
      <Switch
        id="life-skills-toggle"
        checked={isEnabled}
        onCheckedChange={setEnabled}
      />
    </div>
  );
}

"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  type TopJobRole,
  DOMAIN_LABELS,
  GROUP_LABELS,
  SENIORITY_LABELS,
  getTopJobById,
} from "@/lib/career-explorer/top-jobs";

interface RoleDetailsSheetProps {
  role: TopJobRole | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export function RoleDetailsSheet({ role, onClose, onNavigate }: RoleDetailsSheetProps) {
  if (!role) return null;

  return (
    <Sheet open={!!role} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left pr-8">
          <SheetTitle className="text-lg leading-tight">{role.title}</SheetTitle>
          <SheetDescription className="sr-only">
            Details for {role.title}
          </SheetDescription>
        </SheetHeader>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="secondary" className="text-[10px]">
            {DOMAIN_LABELS[role.domain]}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {GROUP_LABELS[role.group]}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {SENIORITY_LABELS[role.seniority]}
          </Badge>
        </div>

        {/* Summary */}
        <div className="mt-5">
          <p className="text-sm text-foreground leading-relaxed">{role.summary}</p>
        </div>

        {/* Skills */}
        <div className="mt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Key Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {role.skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs bg-primary/10 text-primary border-0"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Typical Work */}
        <div className="mt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Typical Work
          </h4>
          <ul className="space-y-2">
            {role.typicalWork.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tags */}
        <div className="mt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Tags
          </h4>
          <div className="flex flex-wrap gap-1">
            {role.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Related Roles */}
        {role.relatedRoles.length > 0 && (
          <div className="mt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Related Roles
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {role.relatedRoles.map((relatedId) => {
                const related = getTopJobById(relatedId);
                if (!related) return null;
                return (
                  <button
                    key={relatedId}
                    onClick={() => onNavigate(relatedId)}
                    className="text-xs text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-full transition-colors"
                  >
                    {related.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TODO: Add to My Journey integration */}
        <div className="mt-6 pt-4 border-t">
          <Button variant="outline" size="sm" className="w-full text-xs" disabled>
            Add to My Journey (coming soon)
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

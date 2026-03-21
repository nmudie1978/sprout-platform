/**
 * SOURCE DRAWER
 *
 * Slide-out panel showing full provenance details for a stat card.
 * Uses Sheet (slide from right) with source link, citation copy, and metadata.
 */

"use client";

import { useState } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  FileText,
  Calendar,
  Clock,
  BookOpen,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StatDatum } from "@/lib/industry-insights/stat-types";

interface SourceDrawerProps {
  stat: StatDatum | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SourceDrawer({ stat, open, onOpenChange }: SourceDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!stat) return null;

  const { provenance } = stat;

  const handleCopyCitation = async () => {
    try {
      await navigator.clipboard.writeText(provenance.citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = provenance.citation;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[340px] sm:w-[400px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-base pr-6">{stat.title}</SheetTitle>
          <SheetDescription>{stat.subtitle}</SheetDescription>
        </SheetHeader>

        <div className="space-y-5">
          {/* Source organisation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5" />
              Source
            </div>
            <p className="text-sm font-medium">{provenance.sourceName}</p>
            <a
              href={provenance.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              View source
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Report title */}
          {provenance.reportTitle && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5" />
                Report
              </div>
              <p className="text-sm">{provenance.reportTitle}</p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            {provenance.publishedDate && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Calendar className="h-3 w-3" />
                  Published
                </div>
                <Badge variant="secondary" className="text-xs">
                  {provenance.publishedDate}
                </Badge>
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Clock className="h-3 w-3" />
                Retrieved
              </div>
              <Badge variant="secondary" className="text-xs">
                {new Date(provenance.retrievedAt).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Badge>
            </div>
          </div>

          {/* Methodology */}
          {provenance.methodology && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Methodology
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {provenance.methodology}
              </p>
            </div>
          )}

          {/* Region badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                stat.region === "norway"
                  ? "border-red-200 text-red-700 dark:border-red-800 dark:text-red-300"
                  : "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
              }
            >
              {stat.region === "norway" ? "🇳🇴 Norway" : "🌍 Global"}
            </Badge>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Citation */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Citation
            </p>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-foreground leading-relaxed font-mono">
                {provenance.citation}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCitation}
              className="w-full text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy citation
                </>
              )}
            </Button>
          </div>

          {/* Note about data */}
          {stat.note && (
            <>
              <div className="border-t" />
              <p className="text-xs text-muted-foreground/80 italic">
                {stat.note}
              </p>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default SourceDrawer;

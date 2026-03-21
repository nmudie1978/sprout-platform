/**
 * YOUTH EVENTS GRID
 *
 * Displays verified youth-accessible events:
 * - Workshops, webinars, job fairs for ages 15-23
 * - Only shows events with verified HTTPS URLs
 * - Verified badge for confirmed events
 */

"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  ExternalLink,
  Video,
  Users,
  CheckCircle2,
  ChevronDown,
  Gift,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getClassifiedEvents,
  type InsightEvent,
  isValidEventUrl,
} from "@/lib/industry-insights/event-types";

interface YouthEventsGridProps {
  className?: string;
  maxVisible?: number;
}

export function YouthEventsGrid({
  className,
  maxVisible = 3,
}: YouthEventsGridProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get classified events
  const { youthEvents } = getClassifiedEvents();

  // Filter to only verified events with valid URLs
  const verifiedEvents = youthEvents.filter(
    (e) => e.verified && isValidEventUrl(e.url)
  );

  const visibleEvents = isExpanded
    ? verifiedEvents
    : verifiedEvents.slice(0, maxVisible);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getFormatIcon = (format: InsightEvent["format"]) => {
    switch (format) {
      case "online":
        return Video;
      case "in-person":
        return MapPin;
      case "hybrid":
        return Users;
      default:
        return Calendar;
    }
  };

  const getFormatLabel = (format: InsightEvent["format"]) => {
    switch (format) {
      case "online":
        return "Online";
      case "in-person":
        return "In-person";
      case "hybrid":
        return "Hybrid";
      default:
        return format;
    }
  };

  if (verifiedEvents.length === 0) {
    return (
      <Card className={`border-2 overflow-hidden ${className}`}>
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            Youth-Accessible Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mb-1">
              No verified events available
            </p>
            <p className="text-xs text-muted-foreground/70">
              We only show events with confirmed, working registration links.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 overflow-hidden ${className}`}>
      <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
            <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          Youth-Accessible Events
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Workshops, webinars, and career fairs designed for ages 15-23
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {visibleEvents.map((event) => {
          const FormatIcon = getFormatIcon(event.format);

          return (
            <div
              key={event.id}
              className="p-3 rounded-lg border bg-gradient-to-br from-background to-yellow-50/20 dark:to-yellow-950/10 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Title and badges */}
                  <div className="flex items-start gap-2 mb-1.5">
                    <h4 className="font-medium text-sm leading-tight">
                      {event.title}
                    </h4>
                    {event.verified && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(event.startDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FormatIcon className="h-3 w-3" />
                      {event.locationLabel}
                    </span>
                    {event.isFree && (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Gift className="h-3 w-3" />
                        Free
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {event.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[9px] px-1.5 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Register button */}
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Button size="sm" variant="outline" className="text-xs h-8">
                    Register
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </a>
              </div>
            </div>
          );
        })}

        {/* Expand/collapse */}
        {verifiedEvents.length > maxVisible && (
          <div className="flex justify-center pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs h-7 px-3"
            >
              {isExpanded ? (
                <>
                  Show less
                  <ChevronDown className="h-3 w-3 ml-1 rotate-180" />
                </>
              ) : (
                <>
                  Show {verifiedEvents.length - maxVisible} more events
                  <ChevronDown className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Note about verification */}
        <p className="text-[10px] text-muted-foreground/60 text-center pt-2 border-t">
          All events are verified with working registration links
        </p>
      </CardContent>
    </Card>
  );
}

export default YouthEventsGrid;

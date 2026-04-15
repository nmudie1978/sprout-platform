"use client";

/**
 * MessagesTray — Right-edge slide-in tray for small-job conversations.
 *
 * Lists the user's message threads (from /api/conversations) scoped to
 * jobs and applications. Each row links to /messages/[id] for the full
 * thread — we intentionally DO NOT embed a composer here because the
 * full /messages surface enforces the structured-messaging safeguarding
 * (templates, intents, minor protections); duplicating it inline would
 * mean duplicating those guards.
 *
 * Mirrors SavedCareersTray's interaction model (hover-to-open, click
 * trigger tab, ESC + outside-click to close) so the two trays feel like
 * the same pattern across the app.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, MessageCircle, Building2, Briefcase, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/avatar";

interface Conversation {
  id: string;
  otherParty: {
    id: string;
    name: string;
    avatar?: string;
    logo?: string;
    role: "YOUTH" | "EMPLOYER";
  };
  job: {
    id: string;
    title: string;
    status: string;
  } | null;
  lastMessage: {
    content: string;
    createdAt: string;
    isFromMe: boolean;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
}

interface MessagesTrayProps {
  /** Vertical offset in pixels for the trigger tab so this tray
   *  doesn't stack over a sibling tray. Default: centred. */
  topOffsetPx?: number;
  className?: string;
}

export function MessagesTray({ topOffsetPx = 0, className }: MessagesTrayProps) {
  const [open, setOpen] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await fetch("/api/conversations");
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json();
    },
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const count = conversations?.length ?? 0;
  const totalUnread = (conversations ?? []).reduce((sum, c) => sum + c.unreadCount, 0);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setOpen(true), 150);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    leaveTimeoutRef.current = setTimeout(() => setOpen(false), 300);
  }, []);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <div
      ref={trayRef}
      className={cn(
        "fixed right-0 top-1/2 z-40 pointer-events-none",
        className,
      )}
      style={{ transform: `translateY(calc(-50% + ${topOffsetPx}px))` }}
    >
      {/* Trigger tab — vertical text */}
      <button
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-expanded={open}
        aria-controls="messages-tray-panel"
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-auto",
          "flex items-center gap-1.5 py-3 pl-2 pr-1.5",
          "rounded-l-lg border border-r-0 border-sky-500/30",
          "bg-gradient-to-b from-sky-500/[0.08] via-blue-500/[0.06] to-indigo-500/[0.08]",
          "backdrop-blur-sm shadow-[0_0_12px_rgba(56,189,248,0.12)]",
          "text-[10px] font-medium text-sky-300/85",
          "hover:text-sky-200 hover:border-sky-500/45 hover:shadow-[0_0_16px_rgba(56,189,248,0.2)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50",
          "transition-all duration-200",
          open && "opacity-0 pointer-events-none",
        )}
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        <MessageCircle className="h-3 w-3 rotate-90" />
        <span>
          Messages
          {totalUnread > 0 ? ` (${totalUnread})` : count > 0 ? ` · ${count}` : ""}
        </span>
        {totalUnread > 0 && (
          <span
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.6)]"
            aria-hidden
          />
        )}
      </button>

      {/* Panel */}
      <div
        id="messages-tray-panel"
        role="region"
        aria-label="Messages"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-hidden={!open}
        className={cn(
          "w-[300px] sm:w-[340px] h-[460px] max-h-[75vh]",
          "rounded-l-xl border border-r-0 border-border/40",
          "bg-card/95 backdrop-blur-md shadow-xl",
          "flex flex-col overflow-hidden",
          "transition-transform duration-250 ease-out",
          open ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 shrink-0">
          <div>
            <h3 className="text-xs font-semibold text-foreground">Messages</h3>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {isLoading
                ? "Loading…"
                : count === 0
                  ? "Conversations about your small jobs appear here"
                  : totalUnread > 0
                    ? `${count} thread${count !== 1 ? "s" : ""} · ${totalUnread} unread`
                    : `${count} thread${count !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-muted/40 text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Close messages"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {isLoading ? (
            <div className="px-3 py-2 space-y-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5 border border-border/40 bg-background/40 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-muted/40 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-muted/40 rounded w-1/2" />
                    <div className="h-2 bg-muted/40 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : count === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <MessageCircle className="h-8 w-8 text-muted-foreground/20 mb-3" />
              <p className="text-xs text-muted-foreground/50 leading-relaxed">
                Once you or an employer sends a message about a small job it&rsquo;ll appear here.
              </p>
            </div>
          ) : (
            <div className="px-3 py-2 space-y-1.5">
              {conversations!.map((c) => (
                <Link
                  key={c.id}
                  href={`/messages/${c.id}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg px-3 py-2.5",
                    "border border-border/70 bg-background/50 shadow-sm",
                    "hover:bg-muted/40 hover:border-sky-500/45 hover:shadow-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40",
                    "transition-all duration-150 group",
                    c.unreadCount > 0 && "border-sky-500/40 bg-sky-500/[0.04]",
                  )}
                >
                  {/* Avatar */}
                  <div className="shrink-0 relative mt-0.5">
                    {c.otherParty.role === "EMPLOYER" ? (
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ) : (
                      <Avatar name={c.otherParty.name} size="sm" />
                    )}
                    {c.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-sky-500 rounded-full border-2 border-card" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn(
                        "text-[11px] truncate leading-tight",
                        c.unreadCount > 0 ? "font-semibold text-foreground" : "font-medium text-foreground/85",
                      )}>
                        {c.otherParty.name}
                      </span>
                      <span className="text-[9px] text-muted-foreground/60 shrink-0">
                        {formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: false })}
                      </span>
                    </div>

                    {c.job && (
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60 mt-0.5">
                        <Briefcase className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{c.job.title}</span>
                      </div>
                    )}

                    {c.lastMessage && (
                      <p className={cn(
                        "text-[10px] truncate mt-0.5",
                        c.unreadCount > 0 ? "text-foreground" : "text-muted-foreground/70",
                      )}>
                        {c.lastMessage.isFromMe && (
                          <span className="text-muted-foreground/50">You: </span>
                        )}
                        {c.lastMessage.content}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="h-3 w-3 text-muted-foreground/30 shrink-0 mt-1 group-hover:text-sky-400 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {count > 0 && (
          <div className="px-4 py-2 border-t border-border/20 shrink-0">
            <Link
              href="/messages"
              onClick={() => setOpen(false)}
              className="text-[9px] text-muted-foreground/60 hover:text-sky-400 text-center block transition-colors"
            >
              Open full Inbox →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

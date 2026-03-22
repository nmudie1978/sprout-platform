"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Building2, Briefcase, ChevronRight } from "lucide-react";
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

export function ConversationList() {
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

  if (isLoading) {
    return (
      <div className="border rounded-xl overflow-hidden bg-card">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 border-b last:border-b-0 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="border rounded-xl bg-card py-16 text-center">
        <MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="font-medium text-sm mb-1">No conversations yet</h3>
        <p className="text-xs text-muted-foreground">
          Start a conversation by messaging a job poster
        </p>
      </div>
    );
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div>
      {/* Inbox count bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs text-muted-foreground">
          {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
        </span>
        {totalUnread > 0 && (
          <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
            {totalUnread} unread
          </Badge>
        )}
      </div>

      {/* Conversation rows */}
      <div className="border rounded-xl overflow-hidden bg-card divide-y">
        {conversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className={cn(
              "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 active:bg-muted/60 transition-colors group",
              conversation.unreadCount > 0 && "bg-primary/5"
            )}
          >
            {/* Avatar */}
            <div className="shrink-0 relative">
              {conversation.otherParty.role === "EMPLOYER" ? (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
              ) : (
                <Avatar name={conversation.otherParty.name} size="sm" />
              )}
              {conversation.unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Name + time */}
              <div className="flex items-center justify-between gap-2">
                <span className={cn(
                  "text-sm truncate",
                  conversation.unreadCount > 0 ? "font-semibold" : "font-medium"
                )}>
                  {conversation.otherParty.name}
                </span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false })}
                </span>
              </div>

              {/* Job context */}
              {conversation.job && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70 mt-0.5">
                  <Briefcase className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{conversation.job.title}</span>
                </div>
              )}

              {/* Last message preview */}
              {conversation.lastMessage && (
                <p className={cn(
                  "text-xs truncate mt-0.5",
                  conversation.unreadCount > 0
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}>
                  {conversation.lastMessage.isFromMe && (
                    <span className="text-muted-foreground">You: </span>
                  )}
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>

            {/* Chevron */}
            <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}

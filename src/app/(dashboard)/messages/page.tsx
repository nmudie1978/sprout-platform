"use client";

import { useState } from "react";
import { ConversationList } from "@/components/conversation-list";
import { NewConversationModal } from "@/components/new-conversation-modal";
import { Button } from "@/components/ui/button";
import { PenSquare, Inbox } from "lucide-react";

export default function MessagesPage() {
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);

  return (
    <div className="container max-w-3xl py-4 sm:py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
            Inbox
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Your conversations about small jobs
          </p>
        </div>
        <Button
          onClick={() => setIsNewMessageOpen(true)}
          size="sm"
          className="shrink-0"
        >
          <PenSquare className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Compose</span>
        </Button>
      </div>

      <ConversationList />

      <NewConversationModal
        open={isNewMessageOpen}
        onOpenChange={setIsNewMessageOpen}
      />
    </div>
  );
}

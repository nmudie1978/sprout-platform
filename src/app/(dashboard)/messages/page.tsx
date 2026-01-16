"use client";

import { ConversationList } from "@/components/conversation-list";

export default function MessagesPage() {
  return (
    <div className="container max-w-2xl py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Your conversations with employers and workers
        </p>
      </div>

      <ConversationList />
    </div>
  );
}

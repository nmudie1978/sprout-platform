"use client";

import { use } from "react";
import { ChatView } from "@/components/chat-view";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="sm:container sm:max-w-2xl sm:py-6 sm:px-4">
      <ChatView conversationId={id} />
    </div>
  );
}

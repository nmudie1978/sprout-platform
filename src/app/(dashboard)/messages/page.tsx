"use client";

import { useState } from "react";
import { ConversationList } from "@/components/conversation-list";
import { NewConversationModal } from "@/components/new-conversation-modal";
import { Button } from "@/components/ui/button";
import { PenSquare, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function MessagesPage() {
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Multi-layered gradient background */}
      <div className="fixed inset-0 -z-20">
        {/* Base gradient - teal to green transition */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/30" />

        {/* Secondary gradient overlay - adds depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-cyan-50/30 dark:from-transparent dark:via-slate-800/20 dark:to-teal-900/20" />

        {/* Radial highlight in center-top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-teal-100/50 via-emerald-50/20 to-transparent dark:from-teal-900/20 dark:via-emerald-950/10 dark:to-transparent blur-2xl" />

        {/* Bottom fade to darker */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-slate-100/80 via-slate-50/40 to-transparent dark:from-slate-950/90 dark:via-slate-900/50 dark:to-transparent" />
      </div>

      {/* Animated Background - Gradient Blobs (hidden on mobile for performance) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none hidden sm:block">
        <motion.div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-teal-400/25 via-emerald-300/20 to-transparent blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/4 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-cyan-400/20 via-teal-300/15 to-transparent blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] rounded-full bg-gradient-to-tl from-green-400/20 via-emerald-300/15 to-transparent blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, -15, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* Additional accent blob */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-teal-200/10 via-emerald-100/15 to-cyan-200/10 dark:from-teal-800/10 dark:via-emerald-900/10 dark:to-cyan-800/10 blur-3xl"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Floating Bubbles - Discreet and light (hidden on mobile for performance) */}
      <div className="fixed inset-0 z-30 overflow-hidden pointer-events-none hidden sm:block">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${6 + (i % 3) * 4}px`,
              height: `${6 + (i % 3) * 4}px`,
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
              background: i % 2 === 0
                ? "radial-gradient(circle, rgba(20,184,166,0.5) 0%, rgba(20,184,166,0.2) 50%, transparent 70%)"
                : "radial-gradient(circle, rgba(16,185,129,0.5) 0%, rgba(16,185,129,0.2) 50%, transparent 70%)",
              boxShadow: i % 2 === 0
                ? "0 0 12px rgba(20,184,166,0.3)"
                : "0 0 12px rgba(16,185,129,0.3)",
            }}
            animate={{
              y: [0, -25 - (i % 3) * 10, 0],
              x: [0, i % 2 === 0 ? 10 : -10, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 8 + i * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}
      </div>

      <div className="container max-w-2xl py-4 sm:py-6 px-4 space-y-4 sm:space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-teal-500/10 flex-shrink-0">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold">Messages</h1>
              <p className="text-muted-foreground text-xs sm:text-sm truncate">
                Your conversations with others
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsNewMessageOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 h-10 sm:h-9 px-3 sm:px-4 flex-shrink-0"
          >
            <PenSquare className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">New Message</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ConversationList />
        </motion.div>

        <NewConversationModal
          open={isNewMessageOpen}
          onOpenChange={setIsNewMessageOpen}
        />
      </div>
    </div>
  );
}

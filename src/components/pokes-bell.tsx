"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface PokesBellProps {
  userRole: "YOUTH" | "EMPLOYER" | "ADMIN" | "COMMUNITY_GUARDIAN";
}

export function PokesBell({ userRole }: PokesBellProps) {
  // Only show for YOUTH and EMPLOYER roles
  if (userRole !== "YOUTH" && userRole !== "EMPLOYER") {
    return null;
  }

  const { data, isLoading } = useQuery({
    queryKey: ["pokes-count"],
    queryFn: async () => {
      const response = await fetch("/api/pokes");
      if (!response.ok) throw new Error("Failed to fetch pokes");
      return response.json();
    },
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 15000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  });

  const pokes = data || [];

  // For youth: count pending pokes (new, unread)
  // For employers: count recent responses (READ, ACCEPTED, DECLINED that are new)
  const pendingCount = userRole === "YOUTH"
    ? pokes.filter((p: { status: string }) => p.status === "PENDING").length
    : pokes.filter((p: { status: string }) => p.status === "ACCEPTED" || p.status === "READ").length;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href="/pokes">
          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-muted rounded-lg"
          >
            <HandHeart className="h-5 w-5" />
            <AnimatePresence>
              {pendingCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-lg"
                >
                  {pendingCount > 9 ? "9+" : pendingCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>{userRole === "YOUTH" ? "Employer Pokes" : "Poke Responses"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
